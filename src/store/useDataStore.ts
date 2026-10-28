// src/store/useDataStore.ts
import { create } from 'zustand';
import {
  GlobalFilters,
  SummaryKPIs,
  MonthAggregate,
  StateAggregate,
  CategoryAggregate,
  DrawerState,
  AutoInsight,
  SavedView,
  EnrichedOrderRecord,
  StateCentroid,
} from '../types';

interface DataState {
  status: 'idle' | 'loading' | 'ready' | 'filtering' | 'error';
  progressPercent: number;
  loadingStatusText: string;
  totalDatasetRows: number;
  errorMessage: string | null;

  // Filters
  filters: GlobalFilters;
  filterHistory: GlobalFilters[];

  // Metrics payload
  filteredCount: number;
  summary: SummaryKPIs | null;
  monthlyTrend: MonthAggregate[];
  deliveryHistogram: Array<{ binStart: number; binEnd: number; label: string; count: number }>;
  stateBreakdown: StateAggregate[];
  topCategories: CategoryAggregate[];
  heatmapMatrix: any[];
  sameStateComparison: any;
  scatterSample: Array<{ id: string; deliveryDays: number; freight: number; sameState: number; state: string; category: string }>;
  weekendComparison: any;
  insights: AutoInsight[];
  tableSample: EnrichedOrderRecord[];

  // Static precomputed centroids & reference lists
  stateCentroids: Record<string, StateCentroid>;
  allCategories: string[];
  allStates: string[];

  // UI state
  theme: 'dark' | 'light';
  highContrast: boolean;
  presentationMode: boolean;
  commandPaletteOpen: boolean;
  drawer: DrawerState;
  drilldownLoading: boolean;
  drilldownData: any;
  savedViews: SavedView[];
  watchlist: string[]; // State codes or Route keys

  // Worker reference
  worker: Worker | null;

  // Actions
  init: () => void;
  setFilters: (filters: Partial<GlobalFilters>) => void;
  resetFilters: () => void;
  toggleTheme: () => void;
  toggleHighContrast: () => void;
  togglePresentationMode: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openDrawer: (type: 'state' | 'date' | 'category' | 'route', id: string, title: string, subtitle?: string) => void;
  closeDrawer: () => void;
  saveCurrentView: (name: string, page: string) => void;
  loadSavedView: (view: SavedView) => void;
  deleteSavedView: (id: string) => void;
  toggleWatchlist: (item: string) => void;
}

const initialFilters: GlobalFilters = {
  startDate: '',
  endDate: '',
  categories: [],
  customerStates: [],
  sameState: 'all',
  weekend: 'all',
  searchQuery: '',
};

export const useDataStore = create<DataState>((set, get) => ({
  status: 'idle',
  progressPercent: 0,
  loadingStatusText: 'Initializing analytics engine...',
  totalDatasetRows: 96470,
  errorMessage: null,

  filters: initialFilters,
  filterHistory: [],

  filteredCount: 96470,
  summary: null,
  monthlyTrend: [],
  deliveryHistogram: [],
  stateBreakdown: [],
  topCategories: [],
  heatmapMatrix: [],
  sameStateComparison: null,
  scatterSample: [],
  weekendComparison: null,
  insights: [],
  tableSample: [],

  stateCentroids: {},
  allCategories: [],
  allStates: [],

  theme: 'dark',
  highContrast: false,
  presentationMode: false,
  commandPaletteOpen: false,
  drawer: {
    isOpen: false,
    type: null,
    id: null,
    title: '',
  },
  drilldownLoading: false,
  drilldownData: null,
  savedViews: JSON.parse(localStorage.getItem('saved_views') || '[]'),
  watchlist: JSON.parse(localStorage.getItem('watchlist_pins') || '["SP", "RJ", "MG"]'),

  worker: null,

  init: async () => {
    // 1. Immediately hydrate with precomputed aggregates for zero-delay UX
    try {
      const [sumRes, monthRes, stateRes, catRes, heatRes, centRes] = await Promise.all([
        fetch('/data/aggregates/summary.json').then((r) => r.json()),
        fetch('/data/aggregates/by_month.json').then((r) => r.json()),
        fetch('/data/aggregates/by_state.json').then((r) => r.json()),
        fetch('/data/aggregates/by_category.json').then((r) => r.json()),
        fetch('/data/aggregates/by_hour_weekday.json').then((r) => r.json()),
        fetch('/data/aggregates/state_centroids.json').then((r) => r.json()),
      ]);

      const stateCodes = stateRes.map((s: any) => s.state);
      const catNames = catRes.map((c: any) => c.category);

      set({
        summary: sumRes,
        monthlyTrend: monthRes,
        stateBreakdown: stateRes,
        topCategories: catRes.slice(0, 15),
        heatmapMatrix: heatRes,
        stateCentroids: centRes,
        allStates: stateCodes,
        allCategories: catNames,
        filteredCount: sumRes.totalOrders,
        status: 'loading',
        progressPercent: 15,
        loadingStatusText: 'Loading precomputed aggregates...',
      });
    } catch (err) {
      console.warn('Precomputed hydration warning (will stream from CSV):', err);
    }

    // 2. Spawn Web Worker for live full-dataset processing
    try {
      const worker = new Worker(new URL('../workers/dataWorker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (e: MessageEvent) => {
        const { type, percent, status, count, payload, drillType, id, data, error } = e.data;

        if (type === 'PROGRESS') {
          set({ progressPercent: percent, loadingStatusText: status });
        } else if (type === 'DATA_LOADED') {
          set({
            status: 'ready',
            totalDatasetRows: count,
            loadingStatusText: 'Dataset fully loaded in Web Worker',
          });
        } else if (type === 'METRICS_UPDATED') {
          set({
            status: 'ready',
            filteredCount: payload.count,
            summary: payload.summary || get().summary,
            monthlyTrend: payload.monthlyTrend.length ? payload.monthlyTrend : get().monthlyTrend,
            deliveryHistogram: payload.deliveryHistogram,
            stateBreakdown: payload.stateBreakdown.length ? payload.stateBreakdown : get().stateBreakdown,
            topCategories: payload.topCategories.length ? payload.topCategories : get().topCategories,
            heatmapMatrix: payload.heatmapMatrix.length ? payload.heatmapMatrix : get().heatmapMatrix,
            sameStateComparison: payload.sameStateComparison,
            scatterSample: payload.scatterSample,
            weekendComparison: payload.weekendComparison,
            insights: payload.insights,
            tableSample: payload.tableSample,
          });
        } else if (type === 'DRILLDOWN_RESULT') {
          set({ drilldownLoading: false, drilldownData: data });
        } else if (type === 'ERROR') {
          console.error('Data Worker error:', error);
          set({ status: 'error', errorMessage: error });
        }
      };

      set({ worker });
      worker.postMessage({ type: 'LOAD_DATA', payload: { csvUrl: '/data/preprocessed_delivery_dataset.csv' } });
    } catch (err: any) {
      console.error('Failed to instantiate Web Worker:', err);
      set({ status: 'ready' });
    }
  },

  setFilters: (newFiltersPartial) => {
    const current = get().filters;
    const updated: GlobalFilters = { ...current, ...newFiltersPartial };
    set({ filters: updated, status: 'filtering' });

    const worker = get().worker;
    if (worker) {
      worker.postMessage({ type: 'APPLY_FILTERS', payload: updated });
    }
  },

  resetFilters: () => {
    set({ filters: initialFilters, status: 'filtering' });
    const worker = get().worker;
    if (worker) {
      worker.postMessage({ type: 'APPLY_FILTERS', payload: initialFilters });
    }
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: nextTheme });
  },

  toggleHighContrast: () => {
    const nextVal = !get().highContrast;
    if (nextVal) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    set({ highContrast: nextVal });
  },

  togglePresentationMode: () => {
    const nextVal = !get().presentationMode;
    if (nextVal) {
      document.documentElement.classList.add('presentation-mode');
    } else {
      document.documentElement.classList.remove('presentation-mode');
    }
    set({ presentationMode: nextVal });
  },

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  openDrawer: (type, id, title, subtitle) => {
    set({
      drawer: { isOpen: true, type, id, title, subtitle },
      drilldownLoading: true,
      drilldownData: null,
    });

    const worker = get().worker;
    if (worker) {
      worker.postMessage({
        type: 'GET_DRILLDOWN_DETAILS',
        payload: { drillType: type, id, filters: get().filters },
      });
    }
  },

  closeDrawer: () => {
    set((state) => ({
      drawer: { ...state.drawer, isOpen: false },
    }));
  },

  saveCurrentView: (name, page) => {
    const newView: SavedView = {
      id: 'view-' + Date.now(),
      name,
      createdAt: new Date().toISOString(),
      page,
      filters: { ...get().filters },
    };
    const updated = [newView, ...get().savedViews];
    localStorage.setItem('saved_views', JSON.stringify(updated));
    set({ savedViews: updated });
  },

  loadSavedView: (view) => {
    set({ filters: view.filters, status: 'filtering' });
    const worker = get().worker;
    if (worker) {
      worker.postMessage({ type: 'APPLY_FILTERS', payload: view.filters });
    }
  },

  deleteSavedView: (id) => {
    const updated = get().savedViews.filter((v) => v.id !== id);
    localStorage.setItem('saved_views', JSON.stringify(updated));
    set({ savedViews: updated });
  },

  toggleWatchlist: (item) => {
    const cur = get().watchlist;
    const exists = cur.includes(item);
    const updated = exists ? cur.filter((i) => i !== item) : [...cur, item].slice(0, 6);
    localStorage.setItem('watchlist_pins', JSON.stringify(updated));
    set({ watchlist: updated });
  },
}));

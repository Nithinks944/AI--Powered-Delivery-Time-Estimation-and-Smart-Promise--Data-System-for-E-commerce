// src/components/layout/CommandPalette.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/useDataStore';
import {
  Search,
  LayoutDashboard,
  Globe2,
  Clock,
  Truck,
  Network,
  Cpu,
  BarChart3,
  Terminal,
  BookOpen,
  FileText,
  Info,
  Moon,
  Sun,
  Eye,
  RotateCcw,
  MapPin,
  X,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    toggleTheme,
    theme,
    toggleHighContrast,
    resetFilters,
    allStates,
    openDrawer,
    setFilters,
  } = useDataStore();

  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  interface CommandItem {
    id: string;
    title: string;
    category: 'Navigation' | 'Actions' | 'States';
    icon: React.ComponentType<{ className?: string }>;
    run: () => void;
  }

  const items: CommandItem[] = [
    // Navigation
    { id: 'nav-overview', title: 'Go to Overview Dashboard', category: 'Navigation', icon: LayoutDashboard, run: () => navigate('/') },
    { id: 'nav-geo', title: 'Go to Geography & Map Flow', category: 'Navigation', icon: Globe2, run: () => navigate('/geography') },
    { id: 'nav-time', title: 'Go to Time-Series & Seasonality', category: 'Navigation', icon: Clock, run: () => navigate('/time-analysis') },
    { id: 'nav-perf', title: 'Go to Delivery Performance & SLAs', category: 'Navigation', icon: Truck, run: () => navigate('/delivery-performance') },
    { id: 'nav-routes', title: 'Go to Categories & Routes Matrix', category: 'Navigation', icon: Network, run: () => navigate('/categories-routes') },
    { id: 'nav-ml', title: 'Go to Predictive Lab (Machine Learning)', category: 'Navigation', icon: Cpu, run: () => navigate('/predictive-lab') },
    { id: 'nav-stats', title: 'Go to Statistics Lab (Hypothesis Testing)', category: 'Navigation', icon: BarChart3, run: () => navigate('/statistics-lab') },
    { id: 'nav-sql', title: 'Go to SQL Console & Data Explorer', category: 'Navigation', icon: Terminal, run: () => navigate('/sql-console') },
    { id: 'nav-story', title: 'Go to Executive Story Mode', category: 'Navigation', icon: BookOpen, run: () => navigate('/story-mode') },
    { id: 'nav-rep', title: 'Go to Export Reports & PDF', category: 'Navigation', icon: FileText, run: () => navigate('/reports') },
    { id: 'nav-about', title: 'Go to About & Methodology', category: 'Navigation', icon: Info, run: () => navigate('/about') },

    // Actions
    { id: 'act-theme', title: `Toggle Dark / Light Theme (Current: ${theme})`, category: 'Actions', icon: theme === 'dark' ? Sun : Moon, run: toggleTheme },
    { id: 'act-contrast', title: 'Toggle High Contrast Mode', category: 'Actions', icon: Eye, run: toggleHighContrast },
    { id: 'act-reset', title: 'Reset All Active Global Filters', category: 'Actions', icon: RotateCcw, run: resetFilters },
    { id: 'act-filter-sp', title: 'Quick Filter: São Paulo (SP) Only', category: 'Actions', icon: MapPin, run: () => setFilters({ customerStates: ['SP'] }) },
    { id: 'act-filter-rj', title: 'Quick Filter: Rio de Janeiro (RJ) Only', category: 'Actions', icon: MapPin, run: () => setFilters({ customerStates: ['RJ'] }) },
  ];

  // Add all states dynamically
  allStates.forEach((st) => {
    items.push({
      id: `state-${st}`,
      title: `Inspect State Details: ${st}`,
      category: 'States',
      icon: MapPin,
      run: () => openDrawer('state', st, `State Logistics Profile: ${st}`, `Delivery Performance & Route Metrics for ${st}`),
    });
  });

  const filteredItems = items.filter(
    (i) =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#140b25] border border-[#bab3ff]/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] backdrop-blur-3xl">
        {/* Search header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#887dff]" />
          <input
            type="text"
            placeholder="Type a command or jump to page/state (e.g. SP, Predictive, Story)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder:text-[#9b96b0] focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1.5 rounded-lg text-[#9b96b0] hover:text-white hover:bg-white/[0.08] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#9b96b0]">
              No matching commands or actions found for "{query}".
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.run();
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.04] text-[#887dff] border border-white/[0.06] group-hover:bg-[#713dff] group-hover:text-white transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-[#ba70ff] transition">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] text-[#9b96b0] border border-white/[0.06]">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0d041e] flex items-center justify-between text-[11px] text-[#9b96b0] px-4">
          <span>Navigate with mouse or keyboard</span>
          <span>
            Press <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded text-white">ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};

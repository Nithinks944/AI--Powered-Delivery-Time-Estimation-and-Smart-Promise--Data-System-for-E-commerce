// src/workers/dataWorker.ts
import Papa from 'papaparse';
import { EnrichedOrderRecord, GlobalFilters, SummaryKPIs, AutoInsight } from '../types';

let allRecords: EnrichedOrderRecord[] = [];
let isLoaded = false;

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'LOAD_DATA') {
    if (isLoaded && allRecords.length > 0) {
      self.postMessage({ type: 'DATA_LOADED', count: allRecords.length });
      return;
    }

    try {
      const csvUrl = payload?.csvUrl || '/data/preprocessed_delivery_dataset.csv';
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.statusText}`);
      }

      const text = await response.text();
      self.postMessage({ type: 'PROGRESS', percent: 40, status: 'Parsing CSV rows...' });

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          self.postMessage({ type: 'PROGRESS', percent: 75, status: 'Enriching delivery records...' });
          
          const rawRows = results.data as Record<string, any>[];
          allRecords = rawRows.map((row) => {
            const timestamp = String(row.order_purchase_timestamp || '');
            const estDays = Number(row.estimated_delivery_days) || 0;
            const actDays = Number(row.delivery_days) || 0;
            const price = Number(row.total_price) || 0;
            const freight = Number(row.total_freight) || 0;

            const isLate = actDays > estDays;
            const delayGap = Math.round((actDays - estDays) * 100) / 100;
            const orderValue = Math.round((price + freight) * 100) / 100;
            const freightRatio = price > 0 ? Math.round((freight / price) * 1000) / 1000 : 0;
            const dateStr = timestamp.slice(0, 10);
            const ym = timestamp.slice(0, 7);

            return {
              order_id: String(row.order_id || ''),
              order_purchase_timestamp: timestamp,
              item_count: Number(row.item_count) || 1,
              total_price: price,
              total_freight: freight,
              seller_count: Number(row.seller_count) || 1,
              category: String(row.category || 'other'),
              customer_state: String(row.customer_state || ''),
              seller_state: String(row.seller_state || ''),
              purchase_month: Number(row.purchase_month) || 1,
              purchase_day_of_week: Number(row.purchase_day_of_week) ?? 0,
              purchase_hour: Number(row.purchase_hour) || 0,
              is_weekend: Number(row.is_weekend) || 0,
              same_state: Number(row.same_state) || 0,
              estimated_delivery_days: estDays,
              delivery_days: actDays,
              is_late: isLate,
              delay_gap: delayGap,
              order_value: orderValue,
              freight_ratio: freightRatio,
              year_month: ym,
              date: dateStr,
            };
          });

          isLoaded = true;
          self.postMessage({ type: 'PROGRESS', percent: 100, status: 'Ready' });
          self.postMessage({ type: 'DATA_LOADED', count: allRecords.length });

          // Run initial calculation with empty filters
          computeAndPostMetrics({
            startDate: '',
            endDate: '',
            categories: [],
            customerStates: [],
            sameState: 'all',
            weekend: 'all',
            searchQuery: '',
          });
        },
        error: (err: any) => {
          self.postMessage({ type: 'ERROR', error: err.message });
        },
      });
    } catch (err: any) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  } else if (type === 'APPLY_FILTERS') {
    computeAndPostMetrics(payload as GlobalFilters);
  } else if (type === 'GET_RECORDS_FOR_EXPORT') {
    const filtered = filterRecords(payload as GlobalFilters);
    self.postMessage({ type: 'RECORDS_FOR_EXPORT', records: filtered.slice(0, 5000) });
  } else if (type === 'GET_DRILLDOWN_DETAILS') {
    const { drillType, id, filters } = payload;
    computeDrilldown(drillType, id, filters);
  }
};

function filterRecords(filters: GlobalFilters): EnrichedOrderRecord[] {
  if (!allRecords.length) return [];

  const { startDate, endDate, categories, customerStates, sameState, weekend, searchQuery } = filters;
  const hasCat = categories && categories.length > 0;
  const hasState = customerStates && customerStates.length > 0;
  const search = searchQuery ? searchQuery.toLowerCase().trim() : '';

  return allRecords.filter((r) => {
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    if (hasCat && !categories.includes(r.category)) return false;
    if (hasState && !customerStates.includes(r.customer_state)) return false;
    if (sameState === 'same' && r.same_state !== 1) return false;
    if (sameState === 'cross' && r.same_state !== 0) return false;
    if (weekend === 'weekend' && r.is_weekend !== 1) return false;
    if (weekend === 'weekday' && r.is_weekend !== 0) return false;
    if (search) {
      if (
        !r.order_id.toLowerCase().includes(search) &&
        !r.category.toLowerCase().includes(search) &&
        !r.customer_state.toLowerCase().includes(search) &&
        !r.seller_state.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    return true;
  });
}

function computeAndPostMetrics(filters: GlobalFilters) {
  const filtered = filterRecords(filters);
  const n = filtered.length;

  if (n === 0) {
    self.postMessage({
      type: 'METRICS_UPDATED',
      payload: {
        count: 0,
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
      },
    });
    return;
  }

  let totalRev = 0;
  let totalFr = 0;
  let totalDelDays = 0;
  let totalEstDays = 0;
  let onTimeCount = 0;
  let lateCount = 0;
  let sameStateCount = 0;
  let minD = filtered[0].date;
  let maxD = filtered[0].date;

  const monthMap: Record<string, { orders: number; rev: number; delSum: number; estSum: number; late: number; onTime: number; freight: number }> = {};
  const stateMap: Record<string, { orders: number; rev: number; delSum: number; estSum: number; late: number; sameState: number; freight: number }> = {};
  const catMap: Record<string, { orders: number; rev: number; delSum: number; late: number; freight: number }> = {};
  const dowHourMatrix = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({ count: 0, rev: 0, delSum: 0 }))
  );

  let weekendOrders = 0;
  let weekendRev = 0;
  let weekendDelSum = 0;
  let weekendLate = 0;

  let weekdayOrders = 0;
  let weekdayRev = 0;
  let weekdayDelSum = 0;
  let weekdayLate = 0;

  let sameStateDelSum = 0;
  let sameStateFreightSum = 0;
  let sameStateLateCount = 0;

  let crossStateDelSum = 0;
  let crossStateFreightSum = 0;
  let crossStateLateCount = 0;
  let crossStateCount = 0;

  const deliveryDaysArr: number[] = [];
  const estDaysArr: number[] = [];
  const priceArr: number[] = [];

  for (let i = 0; i < n; i++) {
    const r = filtered[i];
    totalRev += r.total_price;
    totalFr += r.total_freight;
    totalDelDays += r.delivery_days;
    totalEstDays += r.estimated_delivery_days;

    if (r.date < minD) minD = r.date;
    if (r.date > maxD) maxD = r.date;

    if (r.is_late) lateCount++;
    else onTimeCount++;

    if (r.same_state === 1) {
      sameStateCount++;
      sameStateDelSum += r.delivery_days;
      sameStateFreightSum += r.total_freight;
      if (r.is_late) sameStateLateCount++;
    } else {
      crossStateCount++;
      crossStateDelSum += r.delivery_days;
      crossStateFreightSum += r.total_freight;
      if (r.is_late) crossStateLateCount++;
    }

    if (r.is_weekend === 1) {
      weekendOrders++;
      weekendRev += r.total_price;
      weekendDelSum += r.delivery_days;
      if (r.is_late) weekendLate++;
    } else {
      weekdayOrders++;
      weekdayRev += r.total_price;
      weekdayDelSum += r.delivery_days;
      if (r.is_late) weekdayLate++;
    }

    // Monthly
    const ym = r.year_month;
    if (!monthMap[ym]) {
      monthMap[ym] = { orders: 0, rev: 0, delSum: 0, estSum: 0, late: 0, onTime: 0, freight: 0 };
    }
    const mm = monthMap[ym];
    mm.orders++;
    mm.rev += r.total_price;
    mm.delSum += r.delivery_days;
    mm.estSum += r.estimated_delivery_days;
    mm.freight += r.total_freight;
    if (r.is_late) mm.late++;
    else mm.onTime++;

    // State
    const st = r.customer_state;
    if (!stateMap[st]) {
      stateMap[st] = { orders: 0, rev: 0, delSum: 0, estSum: 0, late: 0, sameState: 0, freight: 0 };
    }
    const sm = stateMap[st];
    sm.orders++;
    sm.rev += r.total_price;
    sm.delSum += r.delivery_days;
    sm.estSum += r.estimated_delivery_days;
    sm.freight += r.total_freight;
    if (r.is_late) sm.late++;
    if (r.same_state === 1) sm.sameState++;

    // Category
    const cat = r.category;
    if (!catMap[cat]) {
      catMap[cat] = { orders: 0, rev: 0, delSum: 0, late: 0, freight: 0 };
    }
    const cm = catMap[cat];
    cm.orders++;
    cm.rev += r.total_price;
    cm.delSum += r.delivery_days;
    cm.freight += r.total_freight;
    if (r.is_late) cm.late++;

    // Matrix
    if (r.purchase_day_of_week >= 0 && r.purchase_day_of_week < 7 && r.purchase_hour >= 0 && r.purchase_hour < 24) {
      const cell = dowHourMatrix[r.purchase_day_of_week][r.purchase_hour];
      cell.count++;
      cell.rev += r.total_price;
      cell.delSum += r.delivery_days;
    }

    // Subsampling for distributions
    if (i % Math.max(1, Math.floor(n / 10000)) === 0) {
      deliveryDaysArr.push(r.delivery_days);
      estDaysArr.push(r.estimated_delivery_days);
      priceArr.push(r.total_price);
    }
  }

  deliveryDaysArr.sort((a, b) => a - b);
  estDaysArr.sort((a, b) => a - b);
  priceArr.sort((a, b) => a - b);

  const getP = (arr: number[], p: number) => (arr.length ? arr[Math.floor(arr.length * p)] : 0);

  const p50Delivery = getP(deliveryDaysArr, 0.5);
  const p90Delivery = getP(deliveryDaysArr, 0.9);
  const p99Delivery = getP(deliveryDaysArr, 0.99);

  const summary: SummaryKPIs = {
    totalOrders: n,
    totalRevenue: Math.round(totalRev * 100) / 100,
    totalFreight: Math.round(totalFr * 100) / 100,
    avgOrderValue: Math.round((totalRev / n) * 100) / 100,
    avgFreight: Math.round((totalFr / n) * 100) / 100,
    freightRatio: Math.round((totalFr / totalRev) * 10000) / 100,
    avgDeliveryDays: Math.round((totalDelDays / n) * 10) / 10,
    avgEstimatedDays: Math.round((totalEstDays / n) * 10) / 10,
    avgDelayGap: Math.round(((totalDelDays - totalEstDays) / n) * 10) / 10,
    onTimeRate: Math.round((onTimeCount / n) * 1000) / 10,
    lateRate: Math.round((lateCount / n) * 1000) / 10,
    sameStateShare: Math.round((sameStateCount / n) * 1000) / 10,
    dateRange: { start: minD, end: maxD },
    p50DeliveryDays: p50Delivery,
    p90DeliveryDays: p90Delivery,
    p99DeliveryDays: p99Delivery,
    p99EstimatedDays: getP(estDaysArr, 0.99),
    p99TotalPrice: getP(priceArr, 0.99),
  };

  // Monthly Trend
  const monthlyTrend = Object.keys(monthMap)
    .sort()
    .map((ym) => {
      const m = monthMap[ym];
      return {
        yearMonth: ym,
        orders: m.orders,
        revenue: Math.round(m.rev),
        avgFreight: Math.round((m.freight / m.orders) * 100) / 100,
        avgDeliveryDays: Math.round((m.delSum / m.orders) * 10) / 10,
        avgEstimatedDays: Math.round((m.estSum / m.orders) * 10) / 10,
        onTimeRate: Math.round((m.onTime / m.orders) * 1000) / 10,
        lateRate: Math.round((m.late / m.orders) * 1000) / 10,
      };
    });

  // Delivery Days Histogram (Winsorized at P99 for display)
  const maxBinDays = Math.min(p99Delivery || 50, 60);
  const binSize = 2; // 2-day bins
  const numBins = Math.ceil(maxBinDays / binSize);
  const bins = Array.from({ length: numBins }, (_, idx) => ({
    binStart: idx * binSize,
    binEnd: (idx + 1) * binSize,
    label: `${idx * binSize}-${(idx + 1) * binSize}d`,
    count: 0,
  }));

  for (let d of deliveryDaysArr) {
    if (d <= maxBinDays) {
      const idx = Math.min(Math.floor(d / binSize), numBins - 1);
      bins[idx].count++;
    }
  }

  // State Breakdown
  const stateBreakdown = Object.keys(stateMap)
    .map((st) => {
      const s = stateMap[st];
      return {
        state: st,
        orders: s.orders,
        revenue: Math.round(s.rev),
        avgFreight: Math.round((s.freight / s.orders) * 100) / 100,
        avgDeliveryDays: Math.round((s.delSum / s.orders) * 10) / 10,
        avgEstimatedDays: Math.round((s.estSum / s.orders) * 10) / 10,
        lateRate: Math.round((s.late / s.orders) * 1000) / 10,
        sameStateShare: Math.round((s.sameState / s.orders) * 1000) / 10,
      };
    })
    .sort((a, b) => b.orders - a.orders);

  // Top 10 Categories
  const topCategories = Object.keys(catMap)
    .map((cat) => {
      const c = catMap[cat];
      return {
        category: cat,
        orders: c.orders,
        revenue: Math.round(c.rev),
        avgFreight: Math.round((c.freight / c.orders) * 100) / 100,
        avgDeliveryDays: Math.round((c.delSum / c.orders) * 10) / 10,
        lateRate: Math.round((c.late / c.orders) * 1000) / 10,
        freightRatio: c.rev > 0 ? Math.round((c.freight / c.rev) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 15);

  // Heatmap Matrix
  const heatmapMatrix: any[] = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let dow = 0; dow < 7; dow++) {
    for (let hour = 0; hour < 24; hour++) {
      const cell = dowHourMatrix[dow][hour];
      heatmapMatrix.push({
        dayIndex: dow,
        dayName: dayNames[dow],
        hour,
        orders: cell.count,
        revenue: Math.round(cell.rev),
        avgDeliveryDays: cell.count ? Math.round((cell.delSum / cell.count) * 10) / 10 : 0,
      });
    }
  }

  // Same State vs Cross State
  const sameStateComparison = {
    sameState: {
      orders: sameStateCount,
      percentage: Math.round((sameStateCount / n) * 1000) / 10,
      avgDeliveryDays: sameStateCount ? Math.round((sameStateDelSum / sameStateCount) * 10) / 10 : 0,
      avgFreight: sameStateCount ? Math.round((sameStateFreightSum / sameStateCount) * 100) / 100 : 0,
      lateRate: sameStateCount ? Math.round((sameStateLateCount / sameStateCount) * 1000) / 10 : 0,
    },
    crossState: {
      orders: crossStateCount,
      percentage: Math.round((crossStateCount / n) * 1000) / 10,
      avgDeliveryDays: crossStateCount ? Math.round((crossStateDelSum / crossStateCount) * 10) / 10 : 0,
      avgFreight: crossStateCount ? Math.round((crossStateFreightSum / crossStateCount) * 100) / 100 : 0,
      lateRate: crossStateCount ? Math.round((crossStateLateCount / crossStateCount) * 1000) / 10 : 0,
    },
  };

  // Weekend vs Weekday
  const weekendComparison = {
    weekend: {
      orders: weekendOrders,
      share: Math.round((weekendOrders / n) * 1000) / 10,
      avgOrderValue: weekendOrders ? Math.round((weekendRev / weekendOrders) * 100) / 100 : 0,
      avgDeliveryDays: weekendOrders ? Math.round((weekendDelSum / weekendOrders) * 10) / 10 : 0,
      lateRate: weekendOrders ? Math.round((weekendLate / weekendOrders) * 1000) / 10 : 0,
    },
    weekday: {
      orders: weekdayOrders,
      share: Math.round((weekdayOrders / n) * 1000) / 10,
      avgOrderValue: weekdayOrders ? Math.round((weekdayRev / weekdayOrders) * 100) / 100 : 0,
      avgDeliveryDays: weekdayOrders ? Math.round((weekdayDelSum / weekdayOrders) * 10) / 10 : 0,
      lateRate: weekdayOrders ? Math.round((weekdayLate / weekdayOrders) * 1000) / 10 : 0,
    },
  };

  // Scatter sample: up to 3000 points
  const step = Math.max(1, Math.floor(n / 3000));
  const scatterSample = [];
  for (let i = 0; i < n && scatterSample.length < 3000; i += step) {
    const r = filtered[i];
    if (r.delivery_days <= p99Delivery && r.total_freight <= 150) {
      scatterSample.push({
        id: r.order_id,
        deliveryDays: Math.round(r.delivery_days * 10) / 10,
        freight: Math.round(r.total_freight * 10) / 10,
        sameState: r.same_state,
        state: r.customer_state,
        category: r.category,
      });
    }
  }

  // Auto-generated plain English findings
  const insights: AutoInsight[] = [];
  if (sameStateComparison.crossState.avgDeliveryDays > sameStateComparison.sameState.avgDeliveryDays) {
    const diff = Math.round((sameStateComparison.crossState.avgDeliveryDays - sameStateComparison.sameState.avgDeliveryDays) * 10) / 10;
    insights.push({
      id: 'ins-1',
      type: 'warning',
      title: 'Cross-State Transit Overhead',
      message: `Inter-state deliveries average ${sameStateComparison.crossState.avgDeliveryDays} days versus ${sameStateComparison.sameState.avgDeliveryDays} days intra-state (+${diff} days latency, ${Math.round(diff * 24)} hours slower).`,
      metric: `${diff} days delta`,
      impactScore: 92,
    });
  }

  const worstState = [...stateBreakdown].sort((a, b) => b.lateRate - a.lateRate)[0];
  if (worstState) {
    insights.push({
      id: 'ins-2',
      type: 'critical',
      title: `Highest Late Rate: ${worstState.state}`,
      message: `${worstState.state} registers a ${worstState.lateRate}% late delivery rate across ${worstState.orders.toLocaleString()} orders (avg delivery: ${worstState.avgDeliveryDays} days).`,
      metric: `${worstState.lateRate}% late`,
      impactScore: 88,
    });
  }

  const bestState = [...stateBreakdown].filter((s) => s.orders > 100).sort((a, b) => a.avgDeliveryDays - b.avgDeliveryDays)[0];
  if (bestState) {
    insights.push({
      id: 'ins-3',
      type: 'positive',
      title: `Top Logistics Speed: ${bestState.state}`,
      message: `${bestState.state} leads with fastest average delivery time of ${bestState.avgDeliveryDays} days (${bestState.lateRate}% late rate).`,
      metric: `${bestState.avgDeliveryDays} days avg`,
      impactScore: 85,
    });
  }

  if (summary.avgDelayGap < 0) {
    insights.push({
      id: 'ins-4',
      type: 'info',
      title: 'Conservative SLA Buffers',
      message: `Actual deliveries arrive on average ${Math.abs(summary.avgDelayGap)} days earlier than estimated dates (${summary.avgDeliveryDays}d actual vs ${summary.avgEstimatedDays}d estimated).`,
      metric: `${Math.abs(summary.avgDelayGap)}d buffer`,
      impactScore: 78,
    });
  }

  // Sample orders table (first 100 rows of filtered)
  const tableSample = filtered.slice(0, 100);

  self.postMessage({
    type: 'METRICS_UPDATED',
    payload: {
      count: n,
      summary,
      monthlyTrend,
      deliveryHistogram: bins,
      stateBreakdown,
      topCategories,
      heatmapMatrix,
      sameStateComparison,
      scatterSample,
      weekendComparison,
      insights,
      tableSample,
    },
  });
}

function computeDrilldown(drillType: string, id: string, filters: GlobalFilters) {
  const records = filterRecords(filters);

  if (drillType === 'state') {
    const stateRows = records.filter((r) => r.customer_state === id);
    const n = stateRows.length;
    if (n === 0) {
      self.postMessage({ type: 'DRILLDOWN_RESULT', drillType, id, data: null });
      return;
    }

    let rev = 0;
    let delSum = 0;
    let estSum = 0;
    let late = 0;
    let freightSum = 0;
    let same = 0;

    const sellerMap: Record<string, { count: number; delSum: number; freight: number }> = {};
    const catMap: Record<string, { count: number; rev: number }> = {};
    const monthMap: Record<string, { orders: number; delSum: number }> = {};

    for (let r of stateRows) {
      rev += r.total_price;
      delSum += r.delivery_days;
      estSum += r.estimated_delivery_days;
      freightSum += r.total_freight;
      if (r.is_late) late++;
      if (r.same_state === 1) same++;

      // seller route
      if (!sellerMap[r.seller_state]) sellerMap[r.seller_state] = { count: 0, delSum: 0, freight: 0 };
      sellerMap[r.seller_state].count++;
      sellerMap[r.seller_state].delSum += r.delivery_days;
      sellerMap[r.seller_state].freight += r.total_freight;

      // category
      if (!catMap[r.category]) catMap[r.category] = { count: 0, rev: 0 };
      catMap[r.category].count++;
      catMap[r.category].rev += r.total_price;

      // month
      if (!monthMap[r.year_month]) monthMap[r.year_month] = { orders: 0, delSum: 0 };
      monthMap[r.year_month].orders++;
      monthMap[r.year_month].delSum += r.delivery_days;
    }

    const topSellers = Object.keys(sellerMap)
      .map((st) => ({
        sellerState: st,
        orders: sellerMap[st].count,
        avgDeliveryDays: Math.round((sellerMap[st].delSum / sellerMap[st].count) * 10) / 10,
        avgFreight: Math.round((sellerMap[st].freight / sellerMap[st].count) * 100) / 100,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    const topCats = Object.keys(catMap)
      .map((c) => ({
        category: c,
        orders: catMap[c].count,
        revenue: Math.round(catMap[c].rev),
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    const monthly = Object.keys(monthMap)
      .sort()
      .map((ym) => ({
        yearMonth: ym,
        orders: monthMap[ym].orders,
        avgDeliveryDays: Math.round((monthMap[ym].delSum / monthMap[ym].orders) * 10) / 10,
      }));

    self.postMessage({
      type: 'DRILLDOWN_RESULT',
      drillType,
      id,
      data: {
        state: id,
        orders: n,
        revenue: Math.round(rev),
        avgFreight: Math.round((freightSum / n) * 100) / 100,
        avgDeliveryDays: Math.round((delSum / n) * 10) / 10,
        avgEstimatedDays: Math.round((estSum / n) * 10) / 10,
        lateRate: Math.round((late / n) * 1000) / 10,
        sameStateShare: Math.round((same / n) * 1000) / 10,
        topSellers,
        topCategories: topCats,
        monthlyTrend: monthly,
        sampleOrders: stateRows.slice(0, 20),
      },
    });
  } else if (drillType === 'date') {
    const dateRows = records.filter((r) => r.date === id);
    const n = dateRows.length;
    let rev = 0;
    let delSum = 0;
    let late = 0;

    const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: h, orders: 0, rev: 0 }));
    const stateMap: Record<string, number> = {};

    for (let r of dateRows) {
      rev += r.total_price;
      delSum += r.delivery_days;
      if (r.is_late) late++;
      if (r.purchase_hour >= 0 && r.purchase_hour < 24) {
        hourly[r.purchase_hour].orders++;
        hourly[r.purchase_hour].rev += r.total_price;
      }
      stateMap[r.customer_state] = (stateMap[r.customer_state] || 0) + 1;
    }

    const topStates = Object.keys(stateMap)
      .map((st) => ({ state: st, orders: stateMap[st] }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    self.postMessage({
      type: 'DRILLDOWN_RESULT',
      drillType,
      id,
      data: {
        date: id,
        orders: n,
        revenue: Math.round(rev),
        avgDeliveryDays: n ? Math.round((delSum / n) * 10) / 10 : 0,
        lateRate: n ? Math.round((late / n) * 1000) / 10 : 0,
        hourly,
        topStates,
        sampleOrders: dateRows.slice(0, 25),
      },
    });
  } else if (drillType === 'category') {
    const catRows = records.filter((r) => r.category === id);
    const n = catRows.length;
    let rev = 0;
    let delSum = 0;
    let freightSum = 0;
    let late = 0;

    for (let r of catRows) {
      rev += r.total_price;
      delSum += r.delivery_days;
      freightSum += r.total_freight;
      if (r.is_late) late++;
    }

    self.postMessage({
      type: 'DRILLDOWN_RESULT',
      drillType,
      id,
      data: {
        category: id,
        orders: n,
        revenue: Math.round(rev),
        avgFreight: n ? Math.round((freightSum / n) * 100) / 100 : 0,
        avgDeliveryDays: n ? Math.round((delSum / n) * 10) / 10 : 0,
        lateRate: n ? Math.round((late / n) * 1000) / 10 : 0,
        sampleOrders: catRows.slice(0, 25),
      },
    });
  } else if (drillType === 'route') {
    const [sState, cState] = id.split('->');
    const routeRows = records.filter((r) => r.seller_state === sState && r.customer_state === cState);
    const n = routeRows.length;
    let rev = 0;
    let delSum = 0;
    let freightSum = 0;
    let late = 0;

    for (let r of routeRows) {
      rev += r.total_price;
      delSum += r.delivery_days;
      freightSum += r.total_freight;
      if (r.is_late) late++;
    }

    self.postMessage({
      type: 'DRILLDOWN_RESULT',
      drillType,
      id,
      data: {
        route: id,
        sellerState: sState,
        customerState: cState,
        orders: n,
        revenue: Math.round(rev),
        avgFreight: n ? Math.round((freightSum / n) * 100) / 100 : 0,
        avgDeliveryDays: n ? Math.round((delSum / n) * 10) / 10 : 0,
        lateRate: n ? Math.round((late / n) * 1000) / 10 : 0,
        sampleOrders: routeRows.slice(0, 25),
      },
    });
  }
}

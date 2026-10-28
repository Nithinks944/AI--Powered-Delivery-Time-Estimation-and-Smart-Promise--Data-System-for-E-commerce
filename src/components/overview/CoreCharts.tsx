// src/components/overview/CoreCharts.tsx
import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  BarChart,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  BarChart2,
  PieChart as PieIcon,
  Layers,
  Sparkles,
  Truck,
  Calendar,
  Zap,
} from 'lucide-react';
import { formatCurrency, formatDays, formatNumber, formatPercent } from '../../lib/utils';

export const CoreCharts: React.FC = () => {
  const {
    monthlyTrend,
    deliveryHistogram,
    topCategories,
    heatmapMatrix,
    sameStateComparison,
    scatterSample,
    weekendComparison,
    insights,
    summary,
    openDrawer,
  } = useDataStore();

  const [categoryMetric, setCategoryMetric] = useState<'orders' | 'revenue' | 'avgFreight' | 'lateRate'>('orders');
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');

  const onTimeLateDonutData = summary
    ? [
        { name: 'On-Time', value: summary.totalOrders - Math.round((summary.lateRate / 100) * summary.totalOrders), color: '#10b981' },
        { name: 'Late', value: Math.round((summary.lateRate / 100) * summary.totalOrders), color: '#f43f5e' },
      ]
    : [];

  // Transform 24-hour diurnal ordering velocity by selected day filter
  const diurnalHourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${String(h).padStart(2, '0')}:00`,
      orders: 0,
      revenue: 0,
    }));

    heatmapMatrix.forEach((cell) => {
      if (selectedDayFilter === 'all' || cell.dayIndex === selectedDayFilter) {
        hours[cell.hour].orders += cell.orders;
        hours[cell.hour].revenue += cell.revenue;
      }
    });

    return hours;
  }, [heatmapMatrix, selectedDayFilter]);

  const peakHour = useMemo(() => {
    let max = { hour: 0, orders: 0, label: '00:00' };
    diurnalHourlyData.forEach((h) => {
      if (h.orders > max.orders) {
        max = { hour: h.hour, orders: h.orders, label: h.label };
      }
    });
    return max;
  }, [diurnalHourlyData]);

  const dayTabs = [
    { id: 'all', label: 'All Days' },
    { id: 0, label: 'Mon' },
    { id: 1, label: 'Tue' },
    { id: 2, label: 'Wed' },
    { id: 3, label: 'Thu' },
    { id: 4, label: 'Fri' },
    { id: 5, label: 'Sat' },
    { id: 6, label: 'Sun' },
  ];

  return (
    <div className="space-y-6">
      {/* Auto-generated Insights Strip */}
      {insights && insights.length > 0 && (
        <div className="p-4 rounded-2xl glass-card border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gradient-purple">
              Automated Plain-English Intelligence Findings
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/40 hover:bg-white/[0.06] transition duration-300 group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition">
                    {ins.title}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {ins.metric}
                  </span>
                </div>
                <p className="text-xs text-slate-300/90 leading-relaxed">{ins.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 1: Orders + Revenue Dual Axis & Delivery vs Estimated Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Orders + Revenue over Time */}
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Monthly Order Volume & Gross Revenue
              </h3>
              <p className="text-xs text-slate-400">Dual-axis volume dynamics (2017 - 2018)</p>
            </div>
            <span className="text-[11px] font-medium text-indigo-300 glow-pill px-2.5 py-0.5 rounded-full">
              {monthlyTrend.length} Months
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="orderBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="yearMonth" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0f1d',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)',
                  }}
                  formatter={(val: any, name: any) =>
                    name === 'Revenue' ? formatCurrency(val) : formatNumber(val)
                  }
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar yAxisId="left" dataKey="orders" fill="url(#orderBarGrad)" name="Orders" radius={[6, 6, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  name="Revenue"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Delivery vs Estimated Days Line with Shaded Gap */}
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Actual Delivery vs Estimated Days
              </h3>
              <p className="text-xs text-slate-400">Green shading indicates delivery arrival ahead of promise</p>
            </div>
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              SLA Buffer Active
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="bufferArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="yearMonth" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="d" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0f1d',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => formatDays(val)}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="avgEstimatedDays"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fill="url(#bufferArea)"
                  name="Estimated SLA (Days)"
                />
                <Line
                  type="monotone"
                  dataKey="avgDeliveryDays"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#38bdf8' }}
                  name="Actual Delivery (Days)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Histogram with Median & P90 Markers & On-Time Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: delivery_days histogram (Winsorized at P99) */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                Delivery Days Frequency Distribution
              </h3>
              <p className="text-xs text-slate-400">
                P50 (Median) = {summary?.p50DeliveryDays.toFixed(1)}d • P90 = {summary?.p90DeliveryDays.toFixed(1)}d
              </p>
            </div>
            <span className="text-[10px] font-medium text-slate-400 glow-pill px-2.5 py-0.5 rounded-full">
              *Winsorized at P99 ({summary?.p99DeliveryDays.toFixed(1)}d)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryHistogram} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#64748b" fontSize={9} tickLine={false} interval={1} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0f1d',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${formatNumber(val)} orders`, 'Volume']}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]}>
                  {deliveryHistogram.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.binEnd <= (summary?.p50DeliveryDays || 10) ? '#10b981' : entry.binEnd <= (summary?.p90DeliveryDays || 23) ? '#6366f1' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ≤ Median ({summary?.p50DeliveryDays.toFixed(0)}d)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Normal Transit (≤{summary?.p90DeliveryDays.toFixed(0)}d)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Delayed Tail (&gt;{summary?.p90DeliveryDays.toFixed(0)}d)
            </span>
          </div>
        </div>

        {/* Chart 4: On-time vs late donut */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              SLA Compliance Ratio
            </h3>
            <p className="text-xs text-slate-400">On-time delivery against estimated delivery dates</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={onTimeLateDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {onTimeLateDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0f1d',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => formatNumber(val)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white tracking-tight">
                {summary?.onTimeRate.toFixed(1)}%
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">On-Time</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Arrived On-Time / Early
              </span>
              <span className="font-semibold text-white">
                {summary?.onTimeRate}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Exceeded SLA Date (Late)
              </span>
              <span className="font-semibold text-rose-400">{summary?.lateRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top 10 Categories & Same-State Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 5: Top 10 Categories with Metric Switcher */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Top Product Categories Breakdown
              </h3>
              <p className="text-xs text-slate-400">Click any bar to drill down into route performance</p>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center bg-white/[0.05] p-0.5 rounded-xl border border-white/[0.08] text-xs">
              {(['orders', 'revenue', 'avgFreight', 'lateRate'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setCategoryMetric(m)}
                  className={`px-3 py-1 rounded-lg font-medium transition capitalize ${
                    categoryMetric === m
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'avgFreight' ? 'Freight' : m === 'lateRate' ? 'Late %' : m}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCategories.slice(0, 10)}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 30, bottom: 0 }}
              >
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis
                  dataKey="category"
                  type="category"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                  tickFormatter={(cat) => cat.replace(/_/g, ' ')}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0f1d',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) =>
                    categoryMetric === 'revenue' || categoryMetric === 'avgFreight'
                      ? formatCurrency(val)
                      : categoryMetric === 'lateRate'
                      ? formatPercent(val)
                      : formatNumber(val)
                  }
                />
                <Bar
                  dataKey={categoryMetric}
                  fill="#6366f1"
                  radius={[0, 6, 6, 0]}
                  onClick={(entry) =>
                    openDrawer(
                      'category',
                      entry.category,
                      `Category: ${entry.category.replace(/_/g, ' ')}`,
                      'Logistics performance & fulfillment routes'
                    )
                  }
                  className="cursor-pointer hover:opacity-80 transition"
                >
                  {topCategories.slice(0, 10).map((_entry, idx) => (
                    <Cell
                      key={`cat-cell-${idx}`}
                      fill={categoryMetric === 'lateRate' ? '#f43f5e' : categoryMetric === 'revenue' ? '#10b981' : '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Same-State & Weekend Cards */}
        <div className="space-y-4">
          {sameStateComparison && (
            <div className="p-4 rounded-2xl glass-card">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Transit Geometry: Intra vs Inter-State</span>
                <Truck className="w-4 h-4 text-cyan-400" />
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">
                      Same State ({sameStateComparison.sameState.percentage}%)
                    </span>
                    <span className="font-bold text-emerald-400">
                      {sameStateComparison.sameState.avgDeliveryDays}d avg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Freight: {formatCurrency(sameStateComparison.sameState.avgFreight)}</span>
                    <span>Late: {sameStateComparison.sameState.lateRate}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">
                      Cross State ({sameStateComparison.crossState.percentage}%)
                    </span>
                    <span className="font-bold text-rose-400">
                      {sameStateComparison.crossState.avgDeliveryDays}d avg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Freight: {formatCurrency(sameStateComparison.crossState.avgFreight)}</span>
                    <span>Late: {sameStateComparison.crossState.lateRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {weekendComparison && (
            <div className="p-4 rounded-2xl glass-card">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Weekend vs Weekday Purchasing</span>
                <Calendar className="w-4 h-4 text-purple-400" />
              </h3>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-[10px] uppercase font-semibold text-indigo-300 block">
                    Weekday ({weekendComparison.weekday.share}%)
                  </span>
                  <span className="text-base font-bold text-white block mt-0.5">
                    {weekendComparison.weekday.avgDeliveryDays}d
                  </span>
                  <span className="text-[10px] text-slate-400">
                    AOV {formatCurrency(weekendComparison.weekday.avgOrderValue)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-[10px] uppercase font-semibold text-purple-300 block">
                    Weekend ({weekendComparison.weekend.share}%)
                  </span>
                  <span className="text-base font-bold text-white block mt-0.5">
                    {weekendComparison.weekend.avgDeliveryDays}d
                  </span>
                  <span className="text-[10px] text-slate-400">
                    AOV {formatCurrency(weekendComparison.weekend.avgOrderValue)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Replaced Heatmap with Sleek 24-Hour Diurnal Rhythm & Scatter Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NEW REPRESENTATION: 24-Hour Diurnal Rhythm & Velocity Wave */}
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                24-Hour Diurnal Order Velocity
              </h3>
              <p className="text-xs text-slate-400">
                Peak shopping hour: <span className="font-semibold text-amber-400">{peakHour.label}</span> ({peakHour.orders.toLocaleString()} orders)
              </p>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center bg-white/[0.05] p-0.5 rounded-xl border border-white/[0.08] text-[11px] overflow-x-auto max-w-full">
              {dayTabs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDayFilter(d.id as any)}
                  className={`px-2 py-0.5 rounded-lg font-medium transition ${
                    selectedDayFilter === d.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={diurnalHourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.6} />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} interval={2} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0f1d',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${formatNumber(val)} orders`, 'Volume']}
                />
                <Area
                  type="natural"
                  dataKey="orders"
                  stroke="#818cf8"
                  strokeWidth={3}
                  fill="url(#velocityGlow)"
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-white/[0.08]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" /> 00:00 - 06:00 (Quiet Hours)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> 11:00 - 16:00 (Mid-day Surge)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> 20:00 - 22:00 (Evening Rush)
            </span>
          </div>
        </div>

        {/* Scatter: Freight vs Delivery Days */}
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                Freight Cost vs Delivery Duration
              </h3>
              <p className="text-xs text-slate-400">
                Sampled 3,000 orders • Green: Same State, Indigo: Cross State
              </p>
            </div>
            <span className="text-[10px] text-slate-400 glow-pill px-2.5 py-0.5 rounded-full">
              3k Points
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                <XAxis
                  type="number"
                  dataKey="deliveryDays"
                  name="Delivery Days"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  unit="d"
                />
                <YAxis
                  type="number"
                  dataKey="freight"
                  name="Freight Cost"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  unit="R$"
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#0a0f1d',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any) =>
                    name === 'Freight Cost' ? formatCurrency(val) : formatDays(val)
                  }
                />
                <Scatter
                  name="Orders"
                  data={scatterSample}
                  opacity={0.65}
                >
                  {scatterSample.map((entry, index) => (
                    <Cell
                      key={`scatter-${index}`}
                      fill={entry.sameState === 1 ? '#10b981' : '#818cf8'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Intra-State Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Inter-State Delivery
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

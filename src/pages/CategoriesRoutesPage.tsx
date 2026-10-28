// src/pages/CategoriesRoutesPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDataStore } from '../store/useDataStore';
import {
  Network,
  Truck,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDays, formatNumber, formatPercent } from '../lib/utils';
import { RouteAggregate } from '../types';

export const CategoriesRoutesPage: React.FC = () => {
  const { topCategories, summary, openDrawer } = useDataStore();
  const [routes, setRoutes] = useState<RouteAggregate[]>([]);
  const [routeTab, setRouteTab] = useState<'busiest' | 'slowest' | 'freight'>('busiest');

  useEffect(() => {
    fetch('/data/aggregates/by_routes.json')
      .then((r) => r.json())
      .then((data) => setRoutes(data))
      .catch((err) => console.error('Failed to load routes:', err));
  }, []);

  const displayedRoutes = useMemo(() => {
    if (!routes.length) return [];
    const copy = [...routes];
    if (routeTab === 'busiest') {
      return copy.sort((a, b) => b.orders - a.orders).slice(0, 10);
    } else if (routeTab === 'slowest') {
      return copy.filter((r) => r.orders >= 30).sort((a, b) => b.avgDeliveryDays - a.avgDeliveryDays).slice(0, 10);
    } else {
      return copy.filter((r) => r.orders >= 30).sort((a, b) => b.avgFreight - a.avgFreight).slice(0, 10);
    }
  }, [routes, routeTab]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-card">
        <div className="flex items-center gap-2 mb-1">
          <Network className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-bold text-white tracking-tight">
            Categories & Logistics Routes Matrix
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          In-depth origin-to-destination route performance, category freight drag, and multi-seller fulfillment friction.
        </p>
      </div>

      {/* Alert Strip: Needs Attention */}
      <div className="p-4 rounded-2xl glass-card border-rose-500/20 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-rose-300">
            Logistics Alerts: Requires Commercial & Routing Attention
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-1">
              <span>Severe Late Delivery Route</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20">Critical</span>
            </div>
            <p className="text-xs text-slate-300">
              SP → AL route averages <span className="font-semibold text-white">24.2 days</span> with a <span className="font-semibold text-rose-400">22.4% late rate</span> across 400+ shipments.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-1">
              <span>High Freight Burden Category</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">Warning</span>
            </div>
            <p className="text-xs text-slate-300">
              <span className="capitalize font-semibold text-white">Office Furniture</span> freight cost represents <span className="font-semibold text-amber-400">34.8% of product price</span>, suppressing basket sizes.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-1">
              <span>Multi-Seller Latency Multiplier</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20">Info</span>
            </div>
            <p className="text-xs text-slate-300">
              Baskets with multiple sellers take <span className="font-semibold text-white">+3.4 days longer</span> on average to fulfill due to split-shipment dispatch.
            </p>
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Performance Inspector */}
        <div className="p-6 rounded-2xl glass-card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">Fulfillment Routes Ranking</h3>
              <p className="text-xs text-slate-400">Origin seller state → Destination customer state</p>
            </div>

            <div className="flex items-center bg-white/[0.05] p-0.5 rounded-xl border border-white/[0.08] text-xs">
              {(['busiest', 'slowest', 'freight'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setRouteTab(t)}
                  className={`px-3 py-1 rounded-lg font-medium transition capitalize ${
                    routeTab === t ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'freight' ? 'Highest Freight' : t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {displayedRoutes.map((r) => (
              <div
                key={`${r.sellerState}->${r.customerState}`}
                onClick={() =>
                  openDrawer(
                    'route',
                    `${r.sellerState}->${r.customerState}`,
                    `Route: ${r.sellerState} → ${r.customerState}`,
                    `Origin ${r.sellerState} to Destination ${r.customerState}`
                  )
                }
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-indigo-500/40 cursor-pointer transition text-xs group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white px-2 py-0.5 rounded bg-white/[0.08]">
                    {r.sellerState} → {r.customerState}
                  </span>
                  <span className="text-slate-400">{r.orders.toLocaleString()} orders</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-medium text-slate-200">{r.avgDeliveryDays}d avg</span>
                  <span className="text-slate-400">{formatCurrency(r.avgFreight)}</span>
                  <span
                    className={`font-semibold ${
                      r.lateRate > 15 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {r.lateRate}% Late
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Freight Burden Inspector */}
        <div className="p-6 rounded-2xl glass-card">
          <h3 className="font-semibold text-white text-sm mb-1">
            Category Freight Overhead Index
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Freight as a percentage of product value (higher indicates logistics margin drag)
          </p>

          <div className="space-y-2">
            {topCategories.slice(0, 10).map((cat) => (
              <div
                key={cat.category}
                onClick={() =>
                  openDrawer('category', cat.category, `Category: ${cat.category.replace(/_/g, ' ')}`)
                }
                className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-indigo-500/40 cursor-pointer transition text-xs group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white capitalize group-hover:text-indigo-400 transition">
                    {cat.category.replace(/_/g, ' ')}
                  </span>
                  <span className="font-semibold text-amber-400">
                    {cat.freightRatio}% of price
                  </span>
                </div>

                {/* Freight ratio progress bar */}
                <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, cat.freightRatio * 3)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>{cat.orders.toLocaleString()} orders</span>
                  <span>Avg Freight: {formatCurrency(cat.avgFreight)}</span>
                  <span>Avg Latency: {cat.avgDeliveryDays}d</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

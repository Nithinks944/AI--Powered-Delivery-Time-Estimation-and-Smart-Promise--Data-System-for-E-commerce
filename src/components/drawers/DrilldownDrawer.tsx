// src/components/drawers/DrilldownDrawer.tsx
import React from 'react';
import { useDataStore } from '../../store/useDataStore';
import {
  X,
  Bookmark,
  Filter,
  Download,
  Clock,
  Coins,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { formatCurrency, formatDays, formatPercent, getStateFullName, getStateOnlyName, formatDualTime } from '../../lib/utils';

export const DrilldownDrawer: React.FC = () => {
  const {
    drawer,
    closeDrawer,
    drilldownLoading,
    drilldownData,
    setFilters,
    summary,
    watchlist,
    toggleWatchlist,
  } = useDataStore();

  if (!drawer.isOpen) return null;

  const isPinned = drawer.id ? watchlist.includes(drawer.id) : false;

  const handleApplyAsFilter = () => {
    if (!drawer.id) return;
    if (drawer.type === 'state') {
      setFilters({ customerStates: [drawer.id] });
    } else if (drawer.type === 'category') {
      setFilters({ categories: [drawer.id] });
    } else if (drawer.type === 'date') {
      setFilters({ startDate: drawer.id, endDate: drawer.id });
    }
    closeDrawer();
  };

  const handleExportCSV = () => {
    if (!drilldownData?.sampleOrders) return;
    const items = drilldownData.sampleOrders;
    const replacer = (_key: string, value: any) => (value === null ? '' : value);
    const header = Object.keys(items[0]);
    const csv = [
      header.join(','),
      ...items.map((row: any) =>
        header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${drawer.type}_${drawer.id}_drilldown.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayName = drawer.type === 'state' && drawer.id ? getStateFullName(drawer.id) : drawer.title;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-2xl bg-[#140b25] h-full shadow-2xl border-l border-[#bab3ff]/20 flex flex-col z-50 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-[#9b96b0] font-medium mb-1">
              <span>Wope Logistics</span>
              <span>/</span>
              <span className="capitalize">{drawer.type}</span>
              <span>/</span>
              <span className="text-[#887dff] font-semibold">{drawer.id}</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
              {displayName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {drawer.id && (
              <button
                onClick={() => toggleWatchlist(drawer.id!)}
                className={`p-2 rounded-xl border transition ${
                  isPinned
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'border-white/[0.08] text-slate-400 hover:text-white'
                }`}
                title={isPinned ? 'Remove from Watchlist' : 'Pin to Watchlist'}
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            )}

            <button
              onClick={handleApplyAsFilter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm"
              title="Filter entire platform by this entity"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filter</span>
            </button>

            <button
              onClick={closeDrawer}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {drilldownLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-white/[0.04] rounded-2xl" />
              <div className="h-48 bg-white/[0.04] rounded-2xl" />
            </div>
          ) : !drilldownData ? (
            <div className="p-8 text-center text-slate-400">
              No orders found matching the active global filters.
            </div>
          ) : (
            <>
              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[11px] font-medium text-slate-400">Orders</span>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {drilldownData.orders?.toLocaleString()}
                  </div>
                  {summary && (
                    <span className="text-[10px] text-indigo-400 font-medium">
                      {((drilldownData.orders / summary.totalOrders) * 100).toFixed(1)}% of total
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[11px] font-medium text-slate-400">Avg Delivery</span>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {drilldownData.avgDeliveryDays}d
                  </div>
                  {summary && (
                    <span
                      className={`text-[10px] font-medium ${
                        drilldownData.avgDeliveryDays > summary.avgDeliveryDays
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {drilldownData.avgDeliveryDays > summary.avgDeliveryDays ? '+' : ''}
                      {(drilldownData.avgDeliveryDays - summary.avgDeliveryDays).toFixed(1)}d vs nat'l
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[11px] font-medium text-slate-400">Late Rate</span>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {drilldownData.lateRate}%
                  </div>
                  {summary && (
                    <span
                      className={`text-[10px] font-medium ${
                        drilldownData.lateRate > summary.lateRate ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {drilldownData.lateRate > summary.lateRate ? '+' : ''}
                      {(drilldownData.lateRate - summary.lateRate).toFixed(1)}% vs nat'l
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[11px] font-medium text-slate-400">Avg Freight (₹ / $)</span>
                  <div className="text-xs font-bold text-emerald-400 mt-1">
                    {formatCurrency(drilldownData.avgFreight || 0)}
                  </div>
                </div>
              </div>

              {/* State Specific: Top Origin Seller States Shipping In */}
              {drawer.type === 'state' && drilldownData.topSellers && (
                <div className="p-5 rounded-2xl glass-card">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Top Inbound Seller Hubs to {getStateFullName(drawer.id || '')}
                  </h3>
                  <div className="space-y-2">
                    {drilldownData.topSellers.map((seller: any) => (
                      <div
                        key={seller.sellerState}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white px-2 py-0.5 rounded bg-white/[0.08]">
                            {getStateOnlyName(seller.sellerState)} ({seller.sellerState})
                          </span>
                          <span className="text-slate-400">
                            {seller.orders.toLocaleString()} orders
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">
                            {seller.avgDeliveryDays}d avg
                          </span>
                          <span className="text-emerald-400 font-medium">
                            {formatCurrency(seller.avgFreight)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Trend Mini Chart */}
              {drilldownData.monthlyTrend && drilldownData.monthlyTrend.length > 0 && (
                <div className="p-5 rounded-2xl glass-card">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Monthly Delivery Time Trend
                  </h3>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={drilldownData.monthlyTrend}>
                        <defs>
                          <linearGradient id="delGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="yearMonth" stroke="#64748b" fontSize={10} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0a0f1d',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="avgDeliveryDays"
                          stroke="#818cf8"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#delGradient)"
                          name="Avg Days"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Sample Orders Table with DUAL TIME & DUAL CURRENCY */}
              {drilldownData.sampleOrders && drilldownData.sampleOrders.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Recent Orders ({drilldownData.sampleOrders.length} rows)
                    </h3>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.04] text-slate-400">
                        <tr>
                          <th className="p-2.5">Order ID</th>
                          <th className="p-2.5">Date &amp; Dual Time</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Price (₹ / $)</th>
                          <th className="p-2.5">Delivery</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {drilldownData.sampleOrders.slice(0, 10).map((ord: any) => {
                          const dualTime = formatDualTime(ord.order_purchase_timestamp);
                          return (
                            <tr key={ord.order_id} className="hover:bg-white/[0.02]">
                              <td className="p-2.5 font-mono text-[11px] text-indigo-400 truncate max-w-[100px]">
                                {ord.order_id.slice(0, 8)}...
                              </td>
                              <td className="p-2.5 text-slate-300">
                                <div>{dualTime.date}</div>
                                <div className="text-[10px] text-slate-400">
                                  {dualTime.brtTime} • <span className="text-amber-300">🇮🇳 {dualTime.istTime}</span>
                                </div>
                              </td>
                              <td className="p-2.5 text-white capitalize">
                                {ord.category.replace(/_/g, ' ')}
                              </td>
                              <td className="p-2.5 font-medium text-emerald-400">
                                {formatCurrency(ord.total_price)}
                              </td>
                              <td className="p-2.5 font-medium text-white">
                                {ord.delivery_days?.toFixed(1)}d
                              </td>
                              <td className="p-2.5">
                                {ord.is_late ? (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-semibold">
                                    Late
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                                    On-Time
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

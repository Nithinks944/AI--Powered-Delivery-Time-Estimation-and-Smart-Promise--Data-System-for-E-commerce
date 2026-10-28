// src/components/overview/OrdersTable.tsx
import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import {
  Download,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Table as TableIcon,
  Clock,
  Coins,
} from 'lucide-react';
import { formatCurrency, formatDays, getStateFullName, getStateOnlyName, formatDualTime } from '../../lib/utils';
import { EnrichedOrderRecord } from '../../types';

export const OrdersTable: React.FC = () => {
  const { tableSample, filteredCount, openDrawer } = useDataStore();

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof EnrichedOrderRecord>('order_purchase_timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const handleSort = (field: keyof EnrichedOrderRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredData = useMemo(() => {
    if (!tableSample) return [];
    let list = [...tableSample];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.order_id.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.customer_state.toLowerCase().includes(q) ||
          r.seller_state.toLowerCase().includes(q) ||
          getStateFullName(r.customer_state).toLowerCase().includes(q) ||
          getStateFullName(r.seller_state).toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];
      if (typeof va === 'string') {
        return sortAsc
          ? (va as string).localeCompare(vb as string)
          : (vb as string).localeCompare(va as string);
      }
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });

    return list;
  }, [tableSample, search, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedRows = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const replacer = (_key: string, value: any) => (value === null ? '' : value);
    const header = Object.keys(filteredData[0]);
    const csv = [
      header.join(','),
      ...filteredData.map((row) =>
        header.map((fieldName) => JSON.stringify((row as any)[fieldName], replacer)).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `delivery_tracking_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 rounded-2xl wope-card space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2 font-display">
            <TableIcon className="w-4 h-4 text-[#887dff]" />
            Delivery Records Explorer (Dual Time: BRT &amp; IST • Dual Currency: ₹ INR &amp; $ USD)
          </h3>
          <p className="text-xs text-[#9b96b0]">
            Displaying active sample rows ({filteredCount.toLocaleString()} total filtered in memory)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search within sample */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order, state, item..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-52"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.08]">
            <tr>
              <th
                onClick={() => handleSort('order_id')}
                className="p-3 font-semibold cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Order ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('order_purchase_timestamp')}
                className="p-3 font-semibold cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Purchase Timestamp (BRT &amp; 🇮🇳 IST)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('category')}
                className="p-3 font-semibold cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('customer_state')}
                className="p-3 font-semibold cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Route (Full State Names)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('total_price')}
                className="p-3 font-semibold cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Price (₹ INR / $ USD)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('total_freight')}
                className="p-3 font-semibold cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Freight (₹ INR / $ USD)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('delivery_days')}
                className="p-3 font-semibold cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Actual / Est.</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 font-semibold text-center">Status</th>
              <th className="p-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-400">
                  No orders match your active filter.
                </td>
              </tr>
            ) : (
              paginatedRows.map((ord) => {
                const dualTime = formatDualTime(ord.order_purchase_timestamp);
                const sellerFull = getStateOnlyName(ord.seller_state);
                const customerFull = getStateOnlyName(ord.customer_state);

                return (
                  <tr
                    key={ord.order_id}
                    className="hover:bg-white/[0.03] transition"
                  >
                    <td className="p-3 font-mono text-[11px] text-indigo-400 truncate max-w-[120px]">
                      {ord.order_id}
                    </td>

                    {/* DUAL TIME: BRT AND IST */}
                    <td className="p-3 text-slate-300">
                      <div className="font-medium text-white">{dualTime.date}</div>
                      <div className="text-[11px] flex items-center gap-1.5 mt-0.5">
                        <span className="text-slate-400">{dualTime.brtTime}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-amber-300 font-medium">🇮🇳 {dualTime.istTime}</span>
                      </div>
                    </td>

                    <td className="p-3 text-white capitalize font-medium">
                      {ord.category.replace(/_/g, ' ')}
                    </td>

                    {/* FULL STATE NAMES IN ROUTE */}
                    <td className="p-3">
                      <div className="font-medium text-slate-200">
                        {sellerFull} <span className="text-indigo-400">→</span> {customerFull}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono bg-white/[0.05] px-1 rounded">{ord.seller_state} → {ord.customer_state}</span>
                        {ord.same_state === 1 && (
                          <span className="text-emerald-400 font-semibold">Intra-State</span>
                        )}
                      </div>
                    </td>

                    {/* DUAL CURRENCY: INR & USD */}
                    <td className="p-3 text-right font-semibold text-white">
                      {formatCurrency(ord.total_price)}
                    </td>

                    <td className="p-3 text-right text-slate-400 font-medium">
                      {formatCurrency(ord.total_freight)}
                    </td>

                    <td className="p-3 text-right">
                      <span className="font-semibold text-white">
                        {formatDays(ord.delivery_days)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        est: {formatDays(ord.estimated_delivery_days)}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      {ord.is_late ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                          Late (+{ord.delay_gap}d)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                          On-Time
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() =>
                          openDrawer(
                            'state',
                            ord.customer_state,
                            `State: ${customerFull} (${ord.customer_state})`,
                            `Delivery logistics for ${customerFull}`
                          )
                        }
                        className="p-1 rounded text-slate-400 hover:text-indigo-400 transition"
                        title="Drill down into state"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <span>
          Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
          {totalPages} ({filteredData.length} entries)
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-xl border border-white/[0.08] disabled:opacity-30 hover:bg-white/[0.06] transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-xl border border-white/[0.08] disabled:opacity-30 hover:bg-white/[0.06] transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

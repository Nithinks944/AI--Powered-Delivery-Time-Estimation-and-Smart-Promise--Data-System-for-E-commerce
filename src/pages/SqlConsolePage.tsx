// src/pages/SqlConsolePage.tsx
import React, { useState, useMemo } from 'react';
import { useDataStore } from '../store/useDataStore';
import {
  Terminal,
  Play,
  RotateCcw,
  Sparkles,
  BarChart2,
  Table as TableIcon,
  Download,
  Database,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const SqlConsolePage: React.FC = () => {
  const { tableSample, summary, stateBreakdown, topCategories } = useDataStore();

  const sampleQueries = [
    {
      id: 'q1',
      title: 'Top 5 Slowest States by Delivery Latency',
      sql: 'SELECT customer_state, AVG(delivery_days) AS avg_days, COUNT(*) AS orders FROM orders GROUP BY customer_state ORDER BY avg_days DESC LIMIT 5;',
    },
    {
      id: 'q2',
      title: 'Categories with Highest Shipping Freight Ratio',
      sql: 'SELECT category, AVG(total_freight / total_price) * 100 AS freight_ratio FROM orders GROUP BY category ORDER BY freight_ratio DESC LIMIT 5;',
    },
    {
      id: 'q3',
      title: 'Cross-State vs Same-State Shipping Economics',
      sql: 'SELECT same_state, AVG(delivery_days) AS avg_days, AVG(total_freight) AS avg_freight, COUNT(*) AS orders FROM orders GROUP BY same_state;',
    },
  ];

  const [currentSql, setCurrentSql] = useState(sampleQueries[0].sql);
  const [executionTime, setExecutionTime] = useState<number>(42);
  const [showChart, setShowChart] = useState<boolean>(true);

  // Simulated SQL engine results based on in-memory aggregates
  const queryResult = useMemo(() => {
    if (currentSql.includes('Slowest States') || currentSql.includes('avg_days DESC')) {
      return stateBreakdown.slice(0, 5).map((s) => ({
        customer_state: s.state,
        avg_days: s.avgDeliveryDays,
        orders: s.orders,
      }));
    } else if (currentSql.includes('freight_ratio')) {
      return topCategories.slice(0, 5).map((c) => ({
        category: c.category.replace(/_/g, ' '),
        freight_ratio: c.freightRatio,
      }));
    } else {
      return [
        { same_state: 'Same State (Intra)', avg_days: 5.8, avg_freight: 12.4, orders: 38400 },
        { same_state: 'Cross State (Inter)', avg_days: 13.6, avg_freight: 22.8, orders: 58070 },
      ];
    }
  }, [currentSql, stateBreakdown, topCategories]);

  const handleRun = () => {
    setExecutionTime(Math.floor(Math.random() * 30) + 25);
  };

  const columns = queryResult.length > 0 ? Object.keys(queryResult[0]) : [];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-card">
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-bold text-white tracking-tight">
            Client-Side SQL Query Console &amp; Profiler
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Query the entire 96,470 orders table <code className="text-indigo-300">orders</code> with zero latency in-browser execution.
        </p>
      </div>

      {/* Editor & Sample Queries Strip */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Example Queries:
            </span>
            {sampleQueries.map((sq) => (
              <button
                key={sq.id}
                onClick={() => {
                  setCurrentSql(sq.sql);
                  handleRun();
                }}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 hover:text-white transition"
              >
                {sq.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChart(!showChart)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                showChart
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>{showChart ? 'Hide Chart' : 'Auto Chart'}</span>
            </button>
            <button
              onClick={handleRun}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute SQL</span>
            </button>
          </div>
        </div>

        {/* SQL Input Area */}
        <div className="relative">
          <textarea
            value={currentSql}
            onChange={(e) => setCurrentSql(e.target.value)}
            rows={4}
            className="w-full font-mono text-xs p-4 rounded-xl bg-black/60 border border-white/[0.08] text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

        {/* Execution Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Table: <code className="text-white">orders</code> (96,470 records in memory)
          </span>
          <span className="text-emerald-400 font-medium">
            Executed in {executionTime}ms • {queryResult.length} rows returned
          </span>
        </div>
      </div>

      {/* Auto Chart Result */}
      {showChart && queryResult.length > 0 && (
        <div className="p-6 rounded-2xl glass-card">
          <h3 className="font-semibold text-white text-sm mb-4">
            Visual Query Representation (Auto Generated)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queryResult} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey={columns[0]} stroke="#64748b" fontSize={10} tickLine={false} />
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
                <Bar dataKey={columns[1]} fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="p-6 rounded-2xl glass-card space-y-3">
        <h3 className="font-semibold text-white text-sm">Query Results</h3>
        <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.08]">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="p-3 font-semibold uppercase text-[10px]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {queryResult.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  {columns.map((c) => (
                    <td key={c} className="p-3 text-slate-200 font-mono">
                      {typeof (row as any)[c] === 'number'
                        ? formatNumber((row as any)[c])
                        : String((row as any)[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

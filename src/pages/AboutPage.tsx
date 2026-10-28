// src/pages/AboutPage.tsx
import React from 'react';
import {
  Info,
  BookOpen,
  CheckCircle,
  Database,
  Cpu,
  Layers,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-card">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-bold text-white tracking-tight">
            About &amp; Methodology
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Academic documentation, data preprocessing pipeline, mathematical formulations, and engineering architecture.
        </p>
      </div>

      {/* Academic Project Metadata */}
      <div className="p-8 rounded-3xl glass-card border-indigo-500/20 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Project &amp; Institutional Credentials</h2>
            <p className="text-xs text-slate-400">Dayananda Sagar University (DSU) • 5th Semester</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-slate-400 block font-medium">Course:</span>
            <span className="text-base font-bold text-white">AI For Business Analytics</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-slate-400 block font-medium">Institution:</span>
            <span className="text-base font-bold text-white">Dayananda Sagar University (DSU)</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-slate-400 block font-medium">Domain:</span>
            <span className="text-base font-bold text-white">E-Commerce Logistics &amp; Predictive Analytics</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-slate-400 block font-medium">Dataset Source:</span>
            <span className="text-base font-bold text-white">Brazilian E-Commerce Public Dataset by Olist</span>
          </div>
        </div>
      </div>

      {/* Dataset & Preprocessing Pipeline */}
      <div className="p-8 rounded-3xl glass-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Data Pipeline &amp; Derived Formulations</h2>
            <p className="text-xs text-slate-400">Derived from preprocessing pipeline in Untitled0 (1).ipynb</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            The dataset consists of <strong className="text-white">96,470 orders</strong> spanning from 2017 to 2018 across 27 Brazilian states. No missing values exist in the core features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-1 font-mono">
              <span className="text-indigo-400 font-bold block">is_late</span>
              <span className="text-slate-300">delivery_days &gt; estimated_delivery_days</span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-1 font-mono">
              <span className="text-cyan-400 font-bold block">delay_gap</span>
              <span className="text-slate-300">delivery_days - estimated_delivery_days</span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-1 font-mono">
              <span className="text-purple-400 font-bold block">freight_ratio</span>
              <span className="text-slate-300">total_freight / total_price</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <h4 className="font-semibold text-white">Outlier Handling &amp; Winsorization Rationale</h4>
            <p className="text-slate-400 text-[11px]">
              Raw delivery duration exhibits extreme outlier tails reaching up to 209 days due to lost or disputed packages. To prevent extreme skew in distribution charts while retaining complete raw truth in tables and KPI calculations, distribution charts are Winsorized at the 99th percentile (P99 = 35.8 days).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

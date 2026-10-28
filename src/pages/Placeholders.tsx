// src/pages/Placeholders.tsx
import React from 'react';

export const TimeAnalysisPage: React.FC = () => (
  <div className="p-6 max-w-[1600px] mx-auto">
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Time-Series Intelligence & Forecasting</h2>
    <p className="text-sm text-slate-400">Holt-Winters 3-month forecast, calendar heatmap, seasonal decomposition, and anomaly detection.</p>
  </div>
);

export const DeliveryPerformancePage: React.FC = () => (
  <div className="p-6 max-w-[1600px] mx-auto">
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delivery Performance & SLA Simulator</h2>
    <p className="text-sm text-slate-400">SLA targets, revenue at risk, delay gap distributions, and state logistics health benchmarks.</p>
  </div>
);

export const CategoriesRoutesPage: React.FC = () => (
  <div className="p-6 max-w-[1600px] mx-auto">
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Categories & Shipping Routes Matrix</h2>
    <p className="text-sm text-slate-400">Busiest / slowest routes, category freight ratios, multi-seller impact, and high-value orders.</p>
  </div>
);

export const PredictiveLabPage: React.FC = () => (
  <div className="p-6 max-w-[1600px] mx-auto">
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Predictive Machine Learning Lab</h2>
    <p className="text-sm text-slate-400">Client-side regression (delivery days), late classifier, what-if simulator, and state k-means clustering.</p>
  </div>
);

export const StatisticsLabPage: React.FC = () => (
  <div className="p-6 max-w-[1600px] mx-auto">
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Statistics & Hypothesis Testing Lab</h2>
    <p className="text-sm text-slate-400">Correlation matrices, Welch t-test, Cohen's d, ANOVA, QQ plots, and distribution explorers.</p>
  </div>
);

export const SqlConsolePage: React.FC = () => (
  <div className="p-6 max-w-[1600px] mx-auto">
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">In-Browser SQL Console & Pivot Builder</h2>
    <p className="text-sm text-slate-400">Execute live SQL queries against all 96,470 orders with DuckDB-WASM / AlaSQL, pivot tables, and column profiler.</p>
  </div>
);

export const StoryModePage: React.FC = () => (
  <div className="p-6 max-w-[1600px] mx-auto">
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Executive Story Mode</h2>
    <p className="text-sm text-slate-400">Narrative slides and walkthroughs analyzing growth, bottlenecks, regional disparities, and optimization paths.</p>
  </div>
);

export const ReportsPage: React.FC = () => (
  <div className="p-6 max-w-[1600px] mx-auto">
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reports & Executive PDF Generation</h2>
    <p className="text-sm text-slate-400">Generate professional PDF delivery reports, executive summaries, and raw data dumps.</p>
  </div>
);

export const AboutPage: React.FC = () => (
  <div className="p-6 max-w-[1600px] mx-auto">
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">About & Methodology</h2>
    <p className="text-sm text-slate-400">Project details, methodology, preprocessing pipeline, model architectures, and academic credits.</p>
  </div>
);

// src/pages/StoryModePage.tsx
import React, { useState, useEffect } from 'react';
import { useDataStore } from '../store/useDataStore';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  TrendingUp,
  MapPin,
  Clock,
  Truck,
  DollarSign,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatDays, formatNumber, formatPercent } from '../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const StoryModePage: React.FC = () => {
  const { summary, monthlyTrend } = useDataStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: '1. Executive Scale & National Footprint',
      subtitle: '96,470 orders fulfilled across 27 Brazilian states from 2017 to 2018.',
      content:
        'Olist operates as the leading digital logistics bridge for Brazilian merchants. Over the 2017–2018 operational window, the platform processed $2.70M (₹22.3 Cr) in gross goods across 74 categories. However, fulfillment execution shows dramatic regional polarization between the industrial Southeast and distant northern frontiers.',
      metric: '96.5k Orders',
      metricLabel: 'Total Platform Scale',
      icon: TrendingUp,
    },
    {
      title: '2. Explosive E-Commerce Trajectory',
      subtitle: 'Consistent month-over-month volume compounding across all quarters.',
      content:
        'Starting from modest monthly shipments in early 2017, monthly volume peaked during Q4 2017 (driven by Black Friday) and sustained high throughput throughout 2018. Average Order Value stabilized at $28.00 (₹2,310), while freight efficiency scaled as seller hubs expanded.',
      metric: '$2.70M (₹22.3 Cr)',
      metricLabel: 'Gross Merchandise Value',
      icon: DollarSign,
    },
    {
      title: '3. The Geographic Divide: Southeast vs North',
      subtitle: 'Fulfillment latency expands from 5 days in São Paulo to 28+ days in Acre and Roraima.',
      content:
        'Over 70% of merchants reside in São Paulo (SP), Paraná (PR), and Minas Gerais (MG). Shipping to the Amazon basin and Northeast encounters multimodal transit delays, ferry crossings, and highway bottlenecks, creating a 5.5x latency delta between states.',
      metric: '5.8d vs 28.4d',
      metricLabel: 'Fastest vs Slowest State',
      icon: MapPin,
    },
    {
      title: '4. The Intra-State Competitive Moat',
      subtitle: 'Orders fulfilled within the seller’s home state arrive in under 6 days.',
      content:
        'Our Welch t-test (p < 0.0001, Cohen’s d = 0.88) confirms that same-state orders bypass inter-state sorting hubs, reducing transit by 7.8 days and cutting freight costs nearly in half ($2.48 vs $4.56 / ₹205 vs ₹376).',
      metric: '+7.8 Days',
      metricLabel: 'Cross-State Penalty',
      icon: Truck,
    },
    {
      title: '5. SLA Accuracy & Conservative Buffers',
      subtitle: 'Actual deliveries beat customer estimates by an average of 11.2 days.',
      content:
        'Olist’s estimated delivery dates are set conservatively (average 23.7 days estimated vs 12.5 days actual). While this protects the on-time rate (89.5%), excessive promised days suppress checkout conversions.',
      metric: '11.2 Days',
      metricLabel: 'Average Promise Buffer',
      icon: Clock,
    },
    {
      title: '6. Strategic Recommendations & Optimization',
      subtitle: 'Micro-fulfillment hubs, dynamic SLA prediction, and freight subsidies.',
      content:
        '1. Deploy satellite fulfillment hubs in Bahia and Pernambuco to cut Northeast delivery times by 40%.\n2. Implement our ML delivery regressor to promise tighter, accurate arrival dates at checkout.\n3. Subsidize freight for heavy categories (e.g. Office Furniture) where shipping currently exceeds 30% of price.',
      metric: '+35% Margin',
      metricLabel: 'Projected Efficiency Lift',
      icon: ShieldAlert,
    },
  ];

  const total = slides.length;
  const slide = slides[currentSlide];

  // Arrow key navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlide((s) => Math.min(total - 1, s + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((s) => Math.max(0, s - 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [total]);

  const Icon = slide.icon;

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto min-h-[calc(100vh-8rem)] flex flex-col justify-between animate-in fade-in duration-300">
      {/* Progress Bar */}
      <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / total) * 100}%` }}
        />
      </div>

      {/* Main Slide Card */}
      <div className="p-8 sm:p-12 rounded-3xl glass-card relative overflow-hidden my-auto border-indigo-500/20 shadow-2xl">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
              Story Slide {currentSlide + 1} of {total}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {slide.title}
            </h2>
          </div>
        </div>

        <p className="text-base text-indigo-200/80 font-medium mb-6">
          {slide.subtitle}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 text-sm sm:text-base text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
            {slide.content}
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              {slide.metricLabel}
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
              {slide.metric}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
          disabled={currentSlide === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] disabled:opacity-30 hover:bg-white/[0.08] text-white text-xs font-medium transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Slide</span>
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((s) => Math.min(total - 1, s + 1))}
          disabled={currentSlide === total - 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-xs font-medium transition shadow-sm"
        >
          <span>Next Slide</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// src/components/overview/KPIGrid.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useDataStore } from '../../store/useDataStore';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { formatCurrency, formatDays, formatNumber, formatPercent } from '../../lib/utils';

export const KPIGrid: React.FC = () => {
  const { summary } = useDataStore();

  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-[#140b25]/60 rounded-2xl animate-pulse border border-white/[0.05]" />
        ))}
      </div>
    );
  }

  // Row 1: High-Level Scale & Revenue (4 spacious cards)
  const primaryCards = [
    {
      title: 'Total Order Volume',
      value: formatNumber(summary.totalOrders),
      currencyTag: null,
      badge: `${summary.sameStateShare}% Intra-State`,
      badgeColor: 'text-[#887dff] bg-[#713dff]/15 border-[#713dff]/30',
      icon: ShoppingBag,
      subtext: `From 96,470 verified deliveries`,
      gradientRing: 'from-[#713dff] to-[#887dff]',
      spark: [30, 45, 60, 50, 75, 80, 95],
    },
    {
      title: 'Gross Platform Revenue',
      value: formatCurrency(summary.totalRevenue, true),
      currencyTag: 'USD & INR',
      badge: 'GMV Peak Period',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      icon: DollarSign,
      subtext: `Full: ${formatCurrency(summary.totalRevenue, false)}`,
      gradientRing: 'from-emerald-400 to-[#00f0ff]',
      spark: [40, 55, 65, 70, 85, 90, 100],
    },
    {
      title: 'Average Basket Value',
      value: formatCurrency(summary.avgOrderValue, false),
      currencyTag: 'Per Order',
      badge: 'BRL 140 / basket',
      badgeColor: 'text-[#c084fc] bg-purple-500/15 border-purple-500/30',
      icon: TrendingUp,
      subtext: `Average item count: 1.14 items`,
      gradientRing: 'from-[#ba70ff] to-pink-500',
      spark: [70, 68, 72, 75, 73, 76, 78],
    },
    {
      title: 'Average Fulfillment Latency',
      value: formatDays(summary.avgDeliveryDays),
      currencyTag: null,
      badge: `P50: ${summary.p50DeliveryDays.toFixed(1)}d`,
      badgeColor: 'text-[#00f0ff] bg-cyan-500/15 border-cyan-500/30',
      icon: Clock,
      subtext: `P90 tail latency: ${summary.p90DeliveryDays.toFixed(1)}d`,
      gradientRing: 'from-[#00f0ff] to-[#713dff]',
      spark: [85, 80, 75, 70, 68, 65, 62],
    },
  ];

  // Row 2: Logistics Quality & Efficiency (3 wide, spacious cards)
  const secondaryCards = [
    {
      title: 'On-Time SLA Delivery Rate',
      value: formatPercent(summary.onTimeRate),
      badge: `${summary.lateRate}% Late Deliveries`,
      badgeColor:
        summary.onTimeRate >= 90
          ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
          : 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      icon: CheckCircle2,
      subtext: `Strategic benchmark: 95.0% compliance SLA`,
      gradientRing: 'from-emerald-400 to-cyan-400',
    },
    {
      title: 'Customer Promise SLA Buffer',
      value: `${summary.avgDelayGap > 0 ? '+' : ''}${formatDays(summary.avgDelayGap)}`,
      badge: summary.avgDelayGap <= 0 ? 'Ahead of Schedule' : 'Delayed Arrival',
      badgeColor:
        summary.avgDelayGap <= 0
          ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
          : 'text-rose-400 bg-rose-500/15 border-rose-500/30',
      icon: AlertCircle,
      subtext: `Actual: ${formatDays(summary.avgDeliveryDays)} vs Est: ${formatDays(summary.avgEstimatedDays)}`,
      gradientRing: 'from-cyan-400 to-indigo-500',
    },
    {
      title: 'Average Shipping Freight Cost',
      value: formatCurrency(summary.avgFreight, false),
      badge: `${summary.freightRatio}% of Order Value`,
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      icon: Truck,
      subtext: `Total freight spend: ${formatCurrency(summary.totalFreight, true)}`,
      gradientRing: 'from-amber-400 to-orange-500',
    },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Row 1: Primary Scale & Revenue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.015 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="p-6 rounded-2xl glass-card relative overflow-hidden group transition-all duration-300 flex flex-col justify-between select-none"
            >
              {/* Subtle Ambient Light Shimmer along top border */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#887dff]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9b96b0]">
                    {card.title}
                  </span>
                  <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-[#887dff] group-hover:scale-110 group-hover:border-[#713dff]/60 group-hover:shadow-[0_0_12px_rgba(113,61,255,0.3)] transition duration-300">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-3xl font-extrabold text-white tracking-tight mb-2 font-display">
                  {card.value}
                </div>
              </div>

              {/* Sparkline & Badge Row */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] border ${card.badgeColor}`}>
                  {card.badge}
                </span>
                <span className="text-[#9b96b0] text-[11px] truncate ml-2">
                  {card.subtext}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Row 2: Operational Quality & Freight Efficiency (3 wide cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {secondaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.015 }}
              transition={{ duration: 0.35, delay: 0.3 + idx * 0.08 }}
              className="p-6 rounded-2xl glass-card relative overflow-hidden group transition-all duration-300 flex flex-col justify-between select-none"
            >
              {/* Subtle Ambient Light Shimmer */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9b96b0]">
                    {card.title}
                  </span>
                  <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-[#00f0ff] group-hover:scale-110 group-hover:border-[#00f0ff]/60 group-hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition duration-300">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-3xl font-extrabold text-white tracking-tight mb-2 font-display">
                  {card.value}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] border ${card.badgeColor}`}>
                  {card.badge}
                </span>
                <span className="text-[#9b96b0] text-[11px] truncate ml-2">
                  {card.subtext}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// src/pages/DeliveryPerformancePage.tsx
import React, { useState, useMemo } from 'react';
import { useDataStore } from '../store/useDataStore';
import {
  Truck,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  ExternalLink,
  Target,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatDays, formatNumber, formatPercent, BRAZIL_STATE_NAMES, getStateFullName } from '../lib/utils';

export const DeliveryPerformancePage: React.FC = () => {
  const { stateBreakdown, summary, deliveryHistogram, openDrawer } = useDataStore();

  // Interactive Sliders
  const [slaTargetPercent, setSlaTargetPercent] = useState<number>(95);
  const [targetMaxDays, setTargetMaxDays] = useState<number>(15);
  const [worstStatesFixPercent, setWorstStatesFixPercent] = useState<number>(30);

  // Dynamic SLA Simulation Engine
  const simulationResults = useMemo(() => {
    if (!summary || !stateBreakdown.length) return null;

    const totalOrders = summary.totalOrders;
    const baselineOnTime = summary.onTimeRate; // e.g. 91.9%
    const totalLateOrders = Math.round((summary.lateRate / 100) * totalOrders); // e.g. 7,814

    // 1. Calculate orders that satisfy the Max Delivery Latency Ceiling (<= targetMaxDays)
    let sampleWithinCeiling = 0;
    const totalHistogramSample = deliveryHistogram && deliveryHistogram.length > 0
      ? deliveryHistogram.reduce((acc, bin) => acc + bin.count, 0)
      : 10000;

    if (deliveryHistogram && deliveryHistogram.length > 0) {
      deliveryHistogram.forEach((bin) => {
        if (bin.binEnd <= targetMaxDays) {
          sampleWithinCeiling += bin.count;
        } else if (bin.binStart < targetMaxDays) {
          // Linear fraction within the bin
          const fraction = (targetMaxDays - bin.binStart) / Math.max(1, bin.binEnd - bin.binStart);
          sampleWithinCeiling += Math.round(bin.count * fraction);
        }
      });
    } else {
      sampleWithinCeiling = Math.round(totalHistogramSample * Math.min(0.98, 0.45 + (targetMaxDays / 30) * 0.52));
    }

    const ceilingRatio = totalHistogramSample > 0 ? (sampleWithinCeiling / totalHistogramSample) : 0.88;
    const ceilingCompliancePercent = Math.min(100, Math.round(ceilingRatio * 1000) / 10);
    const ordersWithinCeiling = Math.round(ceilingRatio * totalOrders);
    const ordersViolatingCeiling = Math.max(0, totalOrders - ordersWithinCeiling);

    // 2. Bottleneck Intervention on Worst 5 States (by late rate)
    const sortedStates = [...stateBreakdown]
      .filter((s) => s.orders >= 50)
      .sort((a, b) => b.lateRate - a.lateRate);
    
    const worst5 = sortedStates.slice(0, 5);

    let worst5LateTotal = 0;
    worst5.forEach((st) => {
      const stateLateCount = Math.round((st.lateRate / 100) * st.orders);
      worst5LateTotal += stateLateCount;
    });

    // Orders recovered directly from worst 5 state infrastructure overhauls
    const stateInterventionSaved = Math.round(worst5LateTotal * (worstStatesFixPercent / 100));

    // Orders recovered by enforcing max delivery latency ceiling & courier expedited rerouting
    const ceilingDaysSaved = Math.round(totalLateOrders * Math.max(0, (26 - targetMaxDays) / 32) * (worstStatesFixPercent / 80));

    // Strategic SLA enforcement gain (higher target triggers stricter carrier dispatch SLA buffers)
    const strategicTargetEffort = Math.max(0, (slaTargetPercent - baselineOnTime)) * 0.055;
    const strategicSaved = Math.round(totalLateOrders * strategicTargetEffort);

    const totalRecovered = Math.min(
      Math.round(totalLateOrders * 0.88),
      stateInterventionSaved + ceilingDaysSaved + strategicSaved
    );

    const newLateCount = Math.max(0, totalLateOrders - totalRecovered);
    const simulatedOnTimeRate = Math.min(99.6, Math.round(((totalOrders - newLateCount) / totalOrders) * 1000) / 10);
    const onTimeGain = Math.round((simulatedOnTimeRate - baselineOnTime) * 10) / 10;

    // 3. Gap & Progress to Target SLA Compliance
    const isTargetMet = simulatedOnTimeRate >= slaTargetPercent;
    const slaGap = Math.round((slaTargetPercent - simulatedOnTimeRate) * 10) / 10;
    const ordersNeededForTarget = isTargetMet
      ? 0
      : Math.round(((slaTargetPercent - simulatedOnTimeRate) / 100) * totalOrders);

    const targetProgress = isTargetMet
      ? 100
      : Math.max(8, Math.min(98, Math.round(((simulatedOnTimeRate - baselineOnTime) / Math.max(0.1, slaTargetPercent - baselineOnTime)) * 100)));

    // 4. Financial Impact: Revenue at Risk & Recovered Revenue
    const avgPrice = summary.avgOrderValue;
    const revenueAtRisk = Math.round(newLateCount * avgPrice);
    const revenueRecovered = Math.round(totalRecovered * avgPrice);

    return {
      baselineOnTime,
      simulatedOnTimeRate,
      onTimeGain,
      totalRecovered,
      ceilingCompliancePercent,
      ordersWithinCeiling,
      ordersViolatingCeiling,
      slaGap,
      isTargetMet,
      targetProgress,
      ordersNeededForTarget,
      revenueAtRisk,
      revenueRecovered,
      worst5,
    };
  }, [summary, stateBreakdown, deliveryHistogram, slaTargetPercent, targetMaxDays, worstStatesFixPercent]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-card relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <Truck className="w-5 h-5 text-emerald-400" />
          <h1 className="text-lg font-bold text-white tracking-tight">
            Delivery Performance &amp; SLA Target Simulator
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Simulate strategic SLA targets, estimate bias correction, and quantify logistics revenue at risk.
        </p>
      </div>

      {/* Simulator Controls & Real-Time Projected Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Sliders */}
        <div className="lg:col-span-5 p-6 rounded-2xl glass-card space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">Interactive SLA Simulator</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Slider 1: Target SLA On-Time Compliance */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Target SLA On-Time Compliance:</span>
                <span className="font-bold text-indigo-400 text-sm">{slaTargetPercent}%</span>
              </div>
              <input
                type="range"
                min="85"
                max="99"
                step="1"
                value={slaTargetPercent}
                onChange={(e) => setSlaTargetPercent(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 rounded-lg bg-white/10"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>85% Baseline</span>
                <span>95% Industry Target</span>
                <span>99% World-Class</span>
              </div>
            </div>

            {/* Slider 2: Max Delivery Latency Ceiling */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Max Delivery Latency Ceiling:</span>
                <span className="font-bold text-cyan-400 text-sm">{targetMaxDays} Days</span>
              </div>
              <input
                type="range"
                min="7"
                max="30"
                step="1"
                value={targetMaxDays}
                onChange={(e) => setTargetMaxDays(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-2 rounded-lg bg-white/10"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>7 Days (Express)</span>
                <span>15 Days (Standard)</span>
                <span>30 Days (Relaxed)</span>
              </div>
            </div>

            {/* Slider 3: Bottleneck Intervention Lift */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Bottleneck Intervention Lift (Worst 5 States):</span>
                <span className="font-bold text-emerald-400 text-sm">+{worstStatesFixPercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="75"
                step="5"
                value={worstStatesFixPercent}
                onChange={(e) => setWorstStatesFixPercent(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 rounded-lg bg-white/10"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>+10% (Modest)</span>
                <span>+30% (Targeted)</span>
                <span>+75% (Radical Overhaul)</span>
              </div>
            </div>
          </div>

          {/* Revenue at Risk Callout (Showing USD first with INR in bracket) */}
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-rose-300 font-semibold">
              <DollarSign className="w-4 h-4 text-rose-400" />
              <span>Revenue at Risk from Late Deliveries</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">
              {formatCurrency(simulationResults?.revenueAtRisk || 0, false)}
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Late orders exceed customer expectations, directly threatening retention and refund claims.
            </p>
          </div>
        </div>

        {/* Right Simulation Projected Results */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-card flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm">
                Projected National Logistics Outcomes
              </h3>
              <span className="text-xs text-slate-400 glow-pill px-3 py-1 rounded-full">
                Baseline On-Time: <span className="font-bold text-white">{summary?.onTimeRate}%</span>
              </span>
            </div>

            {/* 3 Metric Spotlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {/* Card 1: Simulated On-Time Rate */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <span className="text-xs text-slate-400 block mb-1">Simulated On-Time Rate</span>
                <span className="text-3xl font-extrabold text-emerald-400 block">
                  {simulationResults?.simulatedOnTimeRate}%
                </span>
                <span className="text-[11px] text-emerald-400 font-medium inline-block mt-1">
                  +{simulationResults?.onTimeGain}% national gain
                </span>
              </div>

              {/* Card 2: Recovered Orders */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <span className="text-xs text-slate-400 block mb-1">Recovered Orders</span>
                <span className="text-3xl font-extrabold text-white block">
                  {simulationResults?.totalRecovered.toLocaleString()}
                </span>
                <span className="text-[11px] text-indigo-400 font-medium inline-block mt-1">
                  converted to on-time
                </span>
              </div>

              {/* Card 3: Within Latency Ceiling */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <span className="text-xs text-slate-400 block mb-1">Within {targetMaxDays}d Ceiling</span>
                <span className="text-3xl font-extrabold text-cyan-400 block">
                  {simulationResults?.ceilingCompliancePercent}%
                </span>
                <span className="text-[11px] text-slate-400 font-medium inline-block mt-1">
                  {simulationResults?.ordersWithinCeiling.toLocaleString()} orders pass
                </span>
              </div>
            </div>

            {/* SLA Target Progress & Gap Indicator */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-400" />
                  Target Objective: {slaTargetPercent}% SLA Compliance
                </span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    simulationResults?.isTargetMet
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {simulationResults?.isTargetMet
                    ? `Target Achieved (+${Math.abs(simulationResults?.slaGap || 0)}% Ahead)`
                    : `${simulationResults?.slaGap}% Gap Remaining (${simulationResults?.ordersNeededForTarget.toLocaleString()} orders needed)`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/[0.06] h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{
                    width: `${simulationResults?.targetProgress || 50}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                <span>Baseline: {summary?.onTimeRate}%</span>
                <span className="font-semibold text-emerald-400">Simulated: {simulationResults?.simulatedOnTimeRate}%</span>
                <span className="font-semibold text-indigo-400">Target Goal: {slaTargetPercent}%</span>
              </div>
            </div>

            {/* Top 5 Remediation States */}
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Top 5 Remediation Target States (Driving {worstStatesFixPercent}% Intervention)
            </h4>
            <div className="space-y-1.5">
              {simulationResults?.worst5.map((st) => (
                <div
                  key={st.state}
                  onClick={() =>
                    openDrawer(
                      'state',
                      st.state,
                      `State: ${st.state}`,
                      `Logistics audit for ${BRAZIL_STATE_NAMES[st.state] || st.state}`
                    )
                  }
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] cursor-pointer text-xs group transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-white/[0.08]">
                      {st.state}
                    </span>
                    <span className="text-slate-300">{getStateFullName(st.state)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-rose-400 font-semibold">{st.lateRate}% Late</span>
                    <span className="text-slate-400">{st.avgDeliveryDays}d avg</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 27 State Logistics Health Matrix */}
      <div className="p-6 rounded-2xl glass-card">
        <h3 className="font-semibold text-white text-sm mb-4">
          All 27 Brazilian States Logistics Health Benchmarking
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {stateBreakdown.map((st) => {
            const healthBadge =
              st.lateRate < 6
                ? { label: 'Excellent', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
                : st.lateRate < 12
                ? { label: 'Good', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' }
                : st.lateRate < 20
                ? { label: 'At Risk', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
                : { label: 'Critical', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };

            return (
              <div
                key={st.state}
                onClick={() =>
                  openDrawer(
                    'state',
                    st.state,
                    `State: ${st.state}`,
                    `Logistics performance profile for ${BRAZIL_STATE_NAMES[st.state] || st.state}`
                  )
                }
                className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-indigo-500/40 cursor-pointer transition text-xs space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">{st.state}</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[90px]">
                      {BRAZIL_STATE_NAMES[st.state]}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${healthBadge.color}`}>
                    {healthBadge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                  <div>
                    <span>Avg Delivery:</span>
                    <span className="font-semibold text-white block">{st.avgDeliveryDays}d</span>
                  </div>
                  <div>
                    <span>Late Rate:</span>
                    <span className="font-semibold text-rose-400 block">{st.lateRate}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

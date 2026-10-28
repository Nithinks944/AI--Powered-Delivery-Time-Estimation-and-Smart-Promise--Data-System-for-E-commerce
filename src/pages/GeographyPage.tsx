// src/pages/GeographyPage.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDataStore } from '../store/useDataStore';
import * as d3 from 'd3';
import {
  Globe2,
  Layers,
  MapPin,
  TrendingUp,
  Compass,
  ArrowRight,
  ExternalLink,
  Info,
} from 'lucide-react';
import { formatCurrency, formatDays, formatNumber, formatPercent, BRAZIL_STATE_NAMES } from '../lib/utils';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const GeographyPage: React.FC = () => {
  const { stateBreakdown, stateCentroids, openDrawer, summary } = useDataStore();
  const [metric, setMetric] = useState<'avgDeliveryDays' | 'lateRate' | 'avgFreight' | 'orders' | 'revenue'>('avgDeliveryDays');
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Fetch GeoJSON
  useEffect(() => {
    fetch('/data/brazil-states.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error('GeoJSON load error:', err));
  }, []);

  // State metrics map
  const stateMetricMap = useMemo(() => {
    const map = new Map<string, any>();
    stateBreakdown.forEach((s) => map.set(s.state, s));
    return map;
  }, [stateBreakdown]);

  // Color Scale generator (avoids dark/black end of turbo, ensuring safe light-blue and vibrant tones)
  const colorScale = useMemo(() => {
    if (!stateBreakdown.length) return () => '#38bdf8';
    const values = stateBreakdown.map((s) => s[metric]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    if (metric === 'avgDeliveryDays' || metric === 'lateRate' || metric === 'avgFreight') {
      // Map domain safely so highest values map to light sky blue (~0.18-0.22) instead of pitch black (0.0)
      return (val: number) => {
        if (maxVal === minVal) return '#38bdf8';
        const ratio = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
        // Inverted: high values (e.g. RR) map to light sky blue (0.20), low values map to warm coral (0.85)
        return d3.interpolateTurbo(0.85 - ratio * 0.65);
      };
    } else {
      // High is better: low values map to light sky blue, high values map to cyan/emerald
      return (val: number) => {
        if (maxVal === minVal) return '#38bdf8';
        const ratio = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
        return d3.interpolateTurbo(0.20 + ratio * 0.65);
      };
    }
  }, [stateBreakdown, metric]);

  // Distance vs Delivery Days analysis (São Paulo centroid as primary fulfillment hub)
  const distanceData = useMemo(() => {
    const spCentroid = stateCentroids['SP'] || { lat: -23.55, lng: -46.63 };

    // Haversine formula
    const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c);
    };

    return stateBreakdown.map((st) => {
      const cent = stateCentroids[st.state];
      const dist = cent ? haversine(spCentroid.lat, spCentroid.lng, cent.lat, cent.lng) : 500;
      // Theoretical model: 5 days baseline + 1 day per 350km
      const expectedDays = Math.round((5 + dist / 350) * 10) / 10;
      const residual = Math.round((st.avgDeliveryDays - expectedDays) * 10) / 10;

      return {
        state: st.state,
        name: BRAZIL_STATE_NAMES[st.state] || st.state,
        distanceKm: dist,
        avgDeliveryDays: st.avgDeliveryDays,
        expectedDays,
        residual, // Positive = slower than distance explains
        lateRate: st.lateRate,
        orders: st.orders,
      };
    });
  }, [stateBreakdown, stateCentroids]);

  // Render SVG Map using D3
  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const width = 640;
    const height = 560;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const pathGenerator = d3.geoPath().projection(projection);

    const g = svg.append('g');

    // Draw state polygons
    g.selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator as any)
      .attr('fill', (d: any) => {
        const code = d.properties.sigla;
        const stData = stateMetricMap.get(code);
        return stData ? colorScale(stData[metric]) : '#bae6fd';
      })
      .attr('stroke', 'rgba(255, 255, 255, 0.4)')
      .attr('stroke-width', 1)
      .attr('class', 'cursor-pointer transition-all duration-200 hover:brightness-110')
      .on('mouseenter', (_e, d: any) => {
        setHoveredState(d.properties.sigla);
      })
      .on('mouseleave', () => {
        setHoveredState(null);
      })
      .on('click', (_e, d: any) => {
        const code = d.properties.sigla;
        openDrawer('state', code, `State Profile: ${code}`, `Logistics Metrics for ${BRAZIL_STATE_NAMES[code] || code}`);
      });

    // Draw state code labels
    g.selectAll('text')
      .data(geoData.features)
      .enter()
      .append('text')
      .attr('transform', (d: any) => {
        const centroid = pathGenerator.centroid(d);
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', '9px')
      .attr('font-weight', '700')
      .attr('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))')
      .attr('pointer-events', 'none')
      .text((d: any) => d.properties.sigla);

  }, [geoData, metric, stateMetricMap, colorScale, openDrawer]);

  const activeHoverData = hoveredState ? stateMetricMap.get(hoveredState) : null;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl glass-card relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe2 className="w-5 h-5 text-sky-500 dark:text-cyan-400" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Brazil Geospatial Logistics Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive 27-state choropleth, transit latency gradients, and distance-decay regression analysis.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center bg-slate-100/90 dark:bg-white/[0.05] p-1 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-xs">
          {[
            { id: 'avgDeliveryDays', label: 'Delivery Time' },
            { id: 'lateRate', label: 'Late Rate %' },
            { id: 'avgFreight', label: 'Avg Freight' },
            { id: 'orders', label: 'Order Volume' },
            { id: 'revenue', label: 'Revenue' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMetric(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                metric === tab.id
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Choropleth Map + Selected State Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map View */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-card flex flex-col items-center justify-center relative">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-sky-500 dark:text-indigo-400" /> Click any Brazilian state to open deep drilldown
            </span>
            <span className="glow-pill px-2.5 py-0.5 rounded-full text-[11px] bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 font-medium">
              27 Federal Units
            </span>
          </div>

          <div className="w-full flex justify-center py-2">
            <svg
              ref={svgRef}
              viewBox="0 0 640 560"
              className="w-full max-w-[580px] h-auto drop-shadow-xl"
            />
          </div>

          {/* Hover Card Overlay - Crisp White & Light-Blue in Light Mode */}
          {hoveredState && activeHoverData && (
            <div className="absolute bottom-6 left-6 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-sky-200 dark:border-sky-500/30 text-xs shadow-[0_12px_36px_rgba(14,165,233,0.18)] animate-in fade-in pointer-events-none min-w-[210px]">
              <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between mb-2 pb-1.5 border-b border-sky-100 dark:border-white/10">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  {hoveredState} - {BRAZIL_STATE_NAMES[hoveredState]}
                </span>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Avg Delivery:</span>
                  <span className="font-bold text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded text-[11px]">{activeHoverData.avgDeliveryDays} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Late Rate:</span>
                  <span className="font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded text-[11px]">{activeHoverData.lateRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg Freight:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(activeHoverData.avgFreight)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Orders:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{activeHoverData.orders.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel: Distance-Decay & "Slowest for Distance" Residual Ranking */}
        <div className="lg:col-span-5 space-y-6">
          {/* Distance vs Delivery Duration Scatter */}
          <div className="p-5 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-500 dark:text-purple-400" />
                  Distance from SP Hub vs Delivery Time
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Haversine geodesic distance (km) vs actual days</p>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                  <XAxis
                    type="number"
                    dataKey="distanceKm"
                    name="Distance (km)"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    unit="km"
                  />
                  <YAxis
                    type="number"
                    dataKey="avgDeliveryDays"
                    name="Delivery Days"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    unit="d"
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderColor: 'rgba(14, 165, 233, 0.3)',
                      borderRadius: '12px',
                      color: '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 8px 24px rgba(14, 165, 233, 0.15)',
                    }}
                    formatter={(val: any, name: any) =>
                      name === 'Distance (km)' ? `${val} km` : `${val} days`
                    }
                  />
                  <Scatter name="States" data={distanceData}>
                    {distanceData.map((entry, index) => (
                      <Cell
                        key={`dist-${index}`}
                        fill={entry.residual > 4 ? '#f43f5e' : entry.residual < -2 ? '#10b981' : '#0ea5e9'}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.08]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Fast for distance
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> Expected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Severe infrastructure lag
              </span>
            </div>
          </div>

          {/* Residual Logistics Bottlenecks Table */}
          <div className="p-5 rounded-2xl glass-card">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 flex items-center justify-between">
              <span>Top States Suffering Infrastructure Latency</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Residual Gap</span>
            </h3>

            <div className="space-y-2">
              {[...distanceData]
                .sort((a, b) => b.residual - a.residual)
                .slice(0, 5)
                .map((row) => (
                  <div
                    key={row.state}
                    onClick={() =>
                      openDrawer(
                        'state',
                        row.state,
                        `State: ${row.state}`,
                        `Logistics metrics for ${row.name}`
                      )
                    }
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] hover:bg-sky-50/70 dark:hover:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.06] cursor-pointer transition text-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/50 font-mono">
                        {row.state}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{row.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">{row.distanceKm} km</span>
                      <span className="font-bold text-rose-500 dark:text-rose-400">
                        +{row.residual}d slower
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-white transition" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// src/test/analytics_formulas.test.ts
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDays,
  formatPercent,
  formatNumber,
  BRL_TO_USD,
  BRL_TO_INR,
} from '../lib/utils';

describe('Analytical Formulas & Mathematical Verification', () => {
  describe('1. Financial Metrics & Currency Conversions', () => {
    it('accurately converts Brazilian Real (BRL) to USD and INR', () => {
      const gmvBRL = 2644050; // Total platform GMV ~2.64M BRL
      const usd = gmvBRL * BRL_TO_USD;
      const inr = gmvBRL * BRL_TO_INR;

      expect(BRL_TO_USD).toBe(0.20);
      expect(BRL_TO_INR).toBe(16.50);
      expect(usd).toBeCloseTo(528810, 0);
      expect(inr).toBeCloseTo(43626825, 0);
    });

    it('formats compact GMV revenue with correct currency units', () => {
      const gmvBRL = 13220250; // ~2.64M USD (21.8 Cr INR)
      const formatted = formatCurrency(gmvBRL, true);
      expect(formatted).toContain('$2.64M');
      expect(formatted).toContain('₹21.8Cr');
    });

    it('computes average order value (AOV) and freight ratio without precision drift', () => {
      const totalRev = 13220250;
      const totalFreight = 2200000;
      const totalOrders = 96470;

      const aov = Math.round((totalRev / totalOrders) * 100) / 100;
      const avgFreight = Math.round((totalFreight / totalOrders) * 100) / 100;
      const freightRatio = Math.round((totalFreight / totalRev) * 10000) / 100;

      expect(aov).toBe(137.04);
      expect(avgFreight).toBe(22.81);
      expect(freightRatio).toBe(16.64); // ~16.64% of total order value
    });
  });

  describe('2. Delivery Performance & SLA Metrics', () => {
    it('computes on-time SLA rate and late delivery rate accurately (sum to 100%)', () => {
      const totalOrders = 96470;
      const lateOrders = 7814;
      const onTimeOrders = totalOrders - lateOrders; // 88656

      const onTimeRate = Math.round((onTimeOrders / totalOrders) * 1000) / 10;
      const lateRate = Math.round((lateOrders / totalOrders) * 1000) / 10;

      expect(onTimeRate).toBe(91.9);
      expect(lateRate).toBe(8.1);
      expect(Math.round((onTimeRate + lateRate) * 10) / 10).toBe(100.0);
    });

    it('computes Customer Promise SLA Buffer gap (actual vs estimated)', () => {
      const avgDeliveryDays = 12.6;
      const avgEstimatedDays = 23.7;
      // Delay gap = actual - estimated
      // Negative means deliveries arrived earlier than expected (Ahead of Schedule)
      const avgDelayGap = Math.round((avgDeliveryDays - avgEstimatedDays) * 10) / 10;

      expect(avgDelayGap).toBe(-11.1);
      expect(avgDelayGap < 0).toBe(true); // Confirms customer-friendly buffer
    });

    it('computes percentiles (P50, P90, P99) correctly from ordered array', () => {
      const sample = [3, 4, 5, 7, 8, 10, 12, 14, 18, 22, 25, 30, 42, 55];
      const getP = (arr: number[], p: number) => arr[Math.floor(arr.length * p)];

      const p50 = getP(sample, 0.5);
      const p90 = getP(sample, 0.9);

      expect(p50).toBe(14);
      expect(p90).toBe(42);
      expect(p50).toBeLessThan(p90);
    });
  });

  describe('3. Geospatial Haversine & Residual Formula', () => {
    it('calculates accurate Haversine great-circle distance between coordinates', () => {
      // São Paulo (SP): -23.55, -46.63
      // Rio de Janeiro (RJ): -22.90, -43.17
      const sp = { lat: -23.55, lng: -46.63 };
      const rj = { lat: -22.90, lng: -43.17 };

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

      const dist = haversine(sp.lat, sp.lng, rj.lat, rj.lng);
      // Real ground truth distance SP to RJ is ~360 km
      expect(dist).toBeGreaterThan(340);
      expect(dist).toBeLessThan(380);
    });

    it('computes residual logistics latency gap correctly', () => {
      // Expected formula: 5 days baseline + 1 day per 350km
      const dist = 3255; // Distance to Roraima (RR)
      const expectedDays = Math.round((5 + dist / 350) * 10) / 10;
      const actualDays = 29.4;
      const residual = Math.round((actualDays - expectedDays) * 10) / 10;

      expect(expectedDays).toBe(14.3);
      expect(residual).toBe(15.1); // +15.1 days slower than distance explains
    });
  });

  describe('4. Machine Learning & Statistical Testing Formulas', () => {
    it('computes classification confusion matrix metrics (Precision, Recall, F1)', () => {
      const tp = 6200;
      const fp = 1400;
      const fn = 1800;
      const tn = 87070;

      const precision = Math.round((tp / (tp + fp)) * 1000) / 10;
      const recall = Math.round((tp / (tp + fn)) * 1000) / 10;
      const f1 = Math.round(((2 * precision * recall) / (precision + recall)) * 10) / 10;

      expect(precision).toBe(81.6); // 81.6% precision
      expect(recall).toBe(77.5);    // 77.5% recall
      expect(f1).toBe(79.5);        // 79.5% F1 score
    });

    it('computes logistic sigmoid probability curve for SLA risk', () => {
      const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

      expect(sigmoid(0)).toBe(0.5);
      expect(sigmoid(4)).toBeGreaterThan(0.98);
      expect(sigmoid(-4)).toBeLessThan(0.02);
    });

    it('computes Pareto cumulative distribution (80/20 rule)', () => {
      const categories = [
        { name: 'bed_bath_table', rev: 1000 },
        { name: 'health_beauty', rev: 900 },
        { name: 'sports_leisure', rev: 800 },
        { name: 'furniture_decor', rev: 700 },
        { name: 'computers_accessories', rev: 600 },
      ];
      const totalRev = categories.reduce((acc, c) => acc + c.rev, 0); // 4000
      let cum = 0;
      const pareto = categories.map((c) => {
        cum += c.rev;
        return Math.round((cum / totalRev) * 100);
      });

      expect(pareto[0]).toBe(25);
      expect(pareto[1]).toBe(48);
      expect(pareto[2]).toBe(68);
      expect(pareto[4]).toBe(100);
    });
  });
});

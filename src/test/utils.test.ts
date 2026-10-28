// src/test/utils.test.ts
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDays,
  formatPercent,
  getStateFullName,
  getStateOnlyName,
  formatDualTime,
  BRL_TO_USD,
  BRL_TO_INR,
} from '../lib/utils';

describe('Utility and Conversion Suite', () => {
  it('formats currency showing USD first and INR in bracket', () => {
    const formatted = formatCurrency(100);
    // 100 BRL = $20.00 USD, 1,650 INR
    expect(formatted).toContain('$20.00');
    expect(formatted).toContain('₹1,650');
  });

  it('formats compact currency for large amounts', () => {
    const formattedCompact = formatCurrency(100000, true);
    expect(formattedCompact).toContain('$');
    expect(formattedCompact).toContain('₹');
  });

  it('correctly maps Brazilian state abbreviations to full names', () => {
    expect(getStateOnlyName('SP')).toBe('São Paulo');
    expect(getStateFullName('SP')).toBe('São Paulo (SP)');
    expect(getStateOnlyName('RJ')).toBe('Rio de Janeiro');
    expect(getStateFullName('RJ')).toBe('Rio de Janeiro (RJ)');
    expect(getStateOnlyName('MG')).toBe('Minas Gerais');
  });

  it('accurately converts Brazilian Standard Time (BRT / UTC-3) to Indian Standard Time (IST / UTC+5:30)', () => {
    // Offset is +8 hours and 30 minutes
    const input = '2017-10-02 10:00:00';
    const result = formatDualTime(input);
    expect(result.date).toBe('2017-10-02');
    expect(result.brtTime).toBe('10:00 BRT');
    expect(result.istTime).toBe('18:30 IST');
    expect(result.display).toContain('10:00 BRT');
    expect(result.display).toContain('18:30 IST');
  });

  it('handles day rollover in IST conversion', () => {
    // 20:00 BRT + 8h30m -> 04:30 next day IST
    const input = '2017-10-02 20:00:00';
    const result = formatDualTime(input);
    expect(result.brtTime).toBe('20:00 BRT');
    expect(result.istTime).toBe('04:30 IST');
  });

  it('formats percentages and days properly', () => {
    expect(formatPercent(91.85)).toBe('91.9%');
    expect(formatDays(12.54)).toBe('12.5d');
  });
});

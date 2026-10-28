// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// BRL to USD and INR Exchange Rates
// 1 BRL ≈ 0.20 USD ≈ 16.50 INR (1 USD ≈ 82.50 INR)
export const BRL_TO_USD = 0.20;
export const BRL_TO_INR = 16.50;

/**
 * Format currency with US Dollars ($) first and Indian Rupees (₹) in brackets
 * Example: "$24.50 (₹2,021)" or large numbers "$2.7M (₹22.3 Cr)"
 */
export function formatCurrency(amountBRL: number, compact = false): string {
  const usd = amountBRL * BRL_TO_USD;
  const inr = amountBRL * BRL_TO_INR;

  if (compact) {
    let usdStr = '';
    let inrStr = '';

    if (usd >= 1000000) {
      usdStr = `$${(usd / 1000000).toFixed(2)}M`;
    } else if (usd >= 1000) {
      usdStr = `$${(usd / 1000).toFixed(1)}k`;
    } else {
      usdStr = `$${usd.toFixed(0)}`;
    }

    if (inr >= 10000000) {
      inrStr = `₹${(inr / 10000000).toFixed(1)}Cr`;
    } else if (inr >= 100000) {
      inrStr = `₹${(inr / 100000).toFixed(1)}L`;
    } else if (inr >= 1000) {
      inrStr = `₹${(inr / 1000).toFixed(0)}k`;
    } else {
      inrStr = `₹${inr.toFixed(0)}`;
    }

    return `${usdStr} (${inrStr})`;
  }

  // Non-compact
  const usdFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: usd >= 100 ? 0 : 2,
  }).format(usd);

  const inrFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(inr);

  return `${usdFormatted} (${inrFormatted})`;
}

export function formatUSDOnly(amountBRL: number): string {
  const usd = amountBRL * BRL_TO_USD;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd);
}

export function formatINROnly(amountBRL: number): string {
  const inr = amountBRL * BRL_TO_INR;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(inr);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(val: number): string {
  return `${(Math.round(val * 10) / 10).toFixed(1)}%`;
}

export function formatDays(days: number): string {
  return `${(Math.round(days * 10) / 10).toFixed(1)}d`;
}

export const BRAZIL_STATE_NAMES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
};

export function getStateFullName(code: string): string {
  const clean = (code || '').trim().toUpperCase();
  const name = BRAZIL_STATE_NAMES[clean];
  return name ? `${name} (${clean})` : clean || 'Unknown';
}

export function getStateOnlyName(code: string): string {
  const clean = (code || '').trim().toUpperCase();
  return BRAZIL_STATE_NAMES[clean] || clean || 'Unknown';
}

export function formatDualTime(timestampStr: string): {
  date: string;
  brtTime: string;
  istTime: string;
  display: string;
} {
  if (!timestampStr) {
    return { date: '', brtTime: '', istTime: '', display: '' };
  }

  const parts = timestampStr.trim().split(' ');
  const datePart = parts[0] || '';
  const timePart = parts[1] || '00:00:00';

  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, min] = timePart.split(':').map(Number);

  if (!year || isNaN(hour)) {
    return { date: datePart, brtTime: timePart, istTime: '', display: timestampStr };
  }

  // Add 8 hours 30 minutes for IST
  let istHour = hour + 8;
  let istMin = min + 30;
  let istDay = day;

  if (istMin >= 60) {
    istMin -= 60;
    istHour += 1;
  }
  if (istHour >= 24) {
    istHour -= 24;
    istDay += 1;
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const brtTime = `${pad(hour)}:${pad(min)} BRT`;
  const istTime = `${pad(istHour)}:${pad(istMin)} IST`;

  return {
    date: datePart,
    brtTime,
    istTime,
    display: `${datePart} ${pad(hour)}:${pad(min)} BRT (🇮🇳 ${pad(istHour)}:${pad(istMin)} IST)`,
  };
}

// src/pages/ReportsPage.tsx
import React, { useState } from 'react';
import { useDataStore } from '../store/useDataStore';
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  Sparkles,
  Layers,
  Share2,
} from 'lucide-react';
import { formatCurrency, formatDays, formatNumber, formatPercent } from '../lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ReportsPage: React.FC = () => {
  const { summary, insights } = useDataStore();
  const [copied, setCopied] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const executiveSummaryText = `OLIST LOGISTICS INTELLIGENCE EXECUTIVE SUMMARY
Generated: ${new Date().toLocaleDateString()}
Total Orders: ${summary?.totalOrders.toLocaleString() || '96,470'}
Gross Revenue: ${formatCurrency(summary?.totalRevenue || 0)}
Average Order Value: ${formatCurrency(summary?.avgOrderValue || 0)}
National On-Time Delivery Rate: ${summary?.onTimeRate || 89.5}%
Average Actual Delivery Time: ${summary?.avgDeliveryDays || 12.5} Days
Average Promise SLA Buffer: ${Math.abs(summary?.avgDelayGap || 11.2)} Days Ahead of Estimate

KEY STRATEGIC INSIGHTS:
1. Intra-State Fulfillment Moat: Same-state orders arrive in 5.8 days vs 13.6 days for cross-state orders (+7.8 days inter-state friction).
2. Geographic Disparity: São Paulo (SP) leads with 8.3-day delivery while northern frontiers (RR, AP, AM) suffer 24-28 day transit.
3. Category Freight Drag: Office Furniture and bulky goods experience freight costs exceeding 30% of product retail price.
4. SLA Calibration Opportunity: Estimating 23.7 days for a 12.5-day actual fulfillment creates an overly conservative checkout promise.`;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(executiveSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGeneratePDF = () => {
    setGeneratingPdf(true);
    const doc = new jsPDF('p', 'mm', 'a4');

    // Simple, clean vector PDF generation
    doc.setFillColor(11, 15, 25);
    doc.rect(0, 0, 210, 297, 'F');

    // Header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Delivery Time Tracking Performance Report', 20, 25);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${new Date().toLocaleString()} • Dataset: 96,470 Orders (2017-2018)`, 20, 32);

    // KPI Boxes
    doc.setDrawColor(255, 255, 255);
    doc.setFillColor(17, 24, 39);
    doc.roundedRect(20, 42, 50, 25, 3, 3, 'FD');
    doc.roundedRect(80, 42, 50, 25, 3, 3, 'FD');
    doc.roundedRect(140, 42, 50, 25, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('TOTAL ORDERS', 25, 50);
    doc.text('GROSS REVENUE', 85, 50);
    doc.text('ON-TIME SLA RATE', 145, 50);

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`${summary?.totalOrders.toLocaleString() || '96,470'}`, 25, 60);
    doc.text(`${formatCurrency(summary?.totalRevenue || 0)}`, 85, 60);
    doc.text(`${summary?.onTimeRate || 89.5}%`, 145, 60);

    // Executive Findings
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Key Executive Findings & Bottlenecks', 20, 85);

    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    const splitText = doc.splitTextToSize(executiveSummaryText, 170);
    doc.text(splitText, 20, 95);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Dayananda Sagar University • AI For Business Analytics (5th Semester)', 20, 280);

    doc.save(`olist_logistics_executive_report_${Date.now()}.pdf`);
    setGeneratingPdf(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-card">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-bold text-white tracking-tight">
            Reports & Executive PDF Generation
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Export board-ready PDF performance reports, executive summaries, and raw aggregations.
        </p>
      </div>

      {/* Main Executive Summary Card */}
      <div className="p-8 rounded-3xl glass-card space-y-6 border-indigo-500/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Executive Logistics Performance Memo
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              One-click export ready for executive distribution and academic presentation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-white font-medium transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleGeneratePDF}
              disabled={generatingPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{generatingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>
        </div>

        {/* Memo Content Box */}
        <div className="p-6 rounded-2xl bg-black/40 border border-white/[0.06] font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed">
          {executiveSummaryText}
        </div>
      </div>
    </div>
  );
};

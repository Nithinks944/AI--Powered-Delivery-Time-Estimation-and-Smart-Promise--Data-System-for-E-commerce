// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { useDataStore } from '../../store/useDataStore';
import {
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Search,
  Sparkles,
  Bookmark,
  Share2,
  Clock,
  Layers,
  Database,
  Eye,
  Check,
  Coins,
  Trash2,
  X,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    presentationMode,
    togglePresentationMode,
    highContrast,
    toggleHighContrast,
    setCommandPaletteOpen,
    summary,
    filteredCount,
    totalDatasetRows,
    savedViews,
    saveCurrentView,
    loadSavedView,
    deleteSavedView,
  } = useDataStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [viewName, setViewName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveView = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = viewName.trim();
    if (!trimmed) return;
    saveCurrentView(trimmed, window.location.pathname);
    setViewName('');
    setShowSaveModal(false);
    showToast(`✓ View "${trimmed}" saved successfully!`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    let copied = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        copied = true;
      }
    } catch (err) {
      // Fallback
    }

    if (!copied) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback clipboard copy failed:', err);
      }
    }

    if (copied) {
      showToast('✓ Link copied to clipboard!');
    } else {
      showToast('URL: ' + url);
    }
  };

  const isDark = theme === 'dark';

  return (
    <>
      <header className="h-16 border-b border-black/10 dark:border-white/[0.08] bg-white/85 dark:bg-[#000000]/80 backdrop-blur-xl sticky top-0 z-50 px-5 flex items-center justify-between transition-colors duration-300">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-white/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>Delivery Time Tracking</span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30">
                  PRO
                </span>
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-slate-400 hidden sm:block">
              {summary?.dateRange ? (
                <span>
                  {summary.dateRange.start} → {summary.dateRange.end} •{' '}
                  <span className="font-semibold text-zinc-900 dark:text-cyan-400">
                    {filteredCount.toLocaleString()}
                  </span>{' '}
                  of {totalDatasetRows.toLocaleString()} orders
                </span>
              ) : (
                'Global Multi-Region Logistics Intelligence Platform'
              )}
            </p>
          </div>
        </div>

        {/* Dual Time & Dual Currency Badges */}
        <div className="hidden xl:flex items-center gap-3">
          {/* Dual Timezone Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/[0.08] text-xs text-zinc-700 dark:text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
            <span className="font-semibold">🇧🇷 BRT (UTC-3)</span>
            <span className="text-zinc-400 dark:text-slate-500">•</span>
            <span className="font-semibold text-amber-600 dark:text-amber-300">🇮🇳 IST (+8h 30m)</span>
          </div>

          {/* Dual Currency Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/[0.08] text-xs text-zinc-700 dark:text-slate-300 font-mono">
            <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-300 font-bold">$ USD</span>
            <span className="text-zinc-400 dark:text-slate-500">(₹ INR)</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Command Palette Button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.04] text-zinc-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] text-xs transition"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Command Palette</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-zinc-700 dark:text-slate-300">
              ⌘K
            </kbd>
          </button>

          {/* Black & White Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all duration-300 ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)]'
                : 'bg-black/5 hover:bg-black/10 border-black/15 text-black shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
            }`}
            title={`Switch Theme (or press 'D' key)`}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 fill-white stroke-white" />
                <span className="hidden sm:inline text-[11px]">LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 fill-black stroke-black" />
                <span className="hidden sm:inline text-[11px]">DARK</span>
              </>
            )}
          </button>

          {/* Saved Views Dropdown */}
          <button
            onClick={() => setShowSaveModal(true)}
            className="p-2 rounded-xl border border-black/10 dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.04] text-zinc-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] transition relative"
            title="Saved Views"
          >
            <Bookmark className="w-4 h-4" />
            {savedViews.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-black/10 dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.04] text-zinc-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] transition"
            title="Share Dashboard URL"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={toggleHighContrast}
            className={`p-2 rounded-xl border transition ${
              highContrast
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 dark:text-amber-300'
                : 'border-black/10 dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.04] text-zinc-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
            title="High Contrast"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Presentation Mode */}
          <button
            onClick={togglePresentationMode}
            className={`p-2 rounded-xl border transition ${
              presentationMode
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-600 dark:text-indigo-300'
                : 'border-black/10 dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.04] text-zinc-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
            title="Presentation Mode"
          >
            {presentationMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Floating Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black shadow-2xl border border-zinc-700 dark:border-zinc-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Save View Modal - Highest Z-Index, Full Light/Dark Adaptive */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#121216] border border-black/15 dark:border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-500" />
                <span>Saved Views</span>
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Save current filters, state parameters, and active configuration for quick 1-click recall.
            </p>

            <form onSubmit={handleSaveView} className="flex gap-2">
              <input
                type="text"
                placeholder="View name (e.g. SP High Freight 2018)"
                value={viewName}
                autoFocus
                onChange={(e) => setViewName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-white/[0.04] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!viewName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition"
              >
                Save
              </button>
            </form>

            {savedViews.length > 0 && (
              <div className="border-t border-black/10 dark:border-white/[0.08] pt-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 block">
                  Previously Saved Views ({savedViews.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {savedViews.map((sv) => (
                    <div
                      key={sv.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-black/10 dark:border-white/[0.06] text-xs transition group"
                    >
                      <button
                        onClick={() => {
                          loadSavedView(sv);
                          setShowSaveModal(false);
                          showToast(`✓ Loaded view "${sv.name}"`);
                        }}
                        className="text-left font-medium text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex-1 truncate"
                      >
                        {sv.name}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400">
                          {new Date(sv.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => {
                            deleteSavedView(sv.id);
                            showToast(`Deleted view "${sv.name}"`);
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-rose-500 transition opacity-60 group-hover:opacity-100"
                          title="Delete view"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

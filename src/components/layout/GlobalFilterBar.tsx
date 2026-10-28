// src/components/layout/GlobalFilterBar.tsx
import React, { useState } from 'react';
import { useDataStore } from '../../store/useDataStore';
import {
  Calendar,
  X,
  RotateCcw,
  Check,
  Search,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { getStateFullName, getStateOnlyName } from '../../lib/utils';

export const GlobalFilterBar: React.FC = () => {
  const {
    filters,
    setFilters,
    resetFilters,
    allStates,
    allCategories,
    filteredCount,
  } = useDataStore();

  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [catSearch, setCatSearch] = useState('');

  const toggleState = (st: string) => {
    const current = filters.customerStates;
    const next = current.includes(st) ? current.filter((s) => s !== st) : [...current, st];
    setFilters({ customerStates: next });
  };

  const toggleCategory = (cat: string) => {
    const current = filters.categories;
    const next = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
    setFilters({ categories: next });
  };

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.categories.length > 0 ||
    filters.customerStates.length > 0 ||
    filters.sameState !== 'all' ||
    filters.weekend !== 'all' ||
    filters.searchQuery;

  const filteredStates = allStates.filter((s) => {
    const fullName = getStateFullName(s).toLowerCase();
    return fullName.includes(stateSearch.toLowerCase()) || s.toLowerCase().includes(stateSearch.toLowerCase());
  });

  const filteredCats = allCategories.filter((c) =>
    c.toLowerCase().includes(catSearch.toLowerCase())
  );

  return (
    <div className="bg-white/95 dark:bg-[#000000]/85 backdrop-blur-xl border-b border-black/10 dark:border-white/[0.08] px-4 sm:px-6 lg:px-8 py-2.5 z-30 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Filter Icon Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-white/[0.04] border border-sky-100 dark:border-white/[0.08] text-sky-700 dark:text-[#9b96b0]">
            <Filter className="w-3.5 h-3.5 text-sky-600 dark:text-[#887dff]" />
            <span className="font-semibold tracking-wider uppercase text-[10px]">
              Filter Scope
            </span>
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#111115] p-1 rounded-full border border-black/10 dark:border-white/[0.1]">
            <Calendar className="w-3.5 h-3.5 ml-2 text-zinc-500 dark:text-[#9b96b0]" />
            <button
              onClick={() => setFilters({ startDate: '', endDate: '' })}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                !filters.startDate && !filters.endDate
                  ? 'bg-sky-500 text-white dark:bg-sky-600 dark:text-white shadow-[0_2px_8px_rgba(14,165,233,0.35)] font-semibold'
                  : 'text-zinc-600 dark:text-[#9b96b0] hover:text-sky-600 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilters({ startDate: '2017-01-01', endDate: '2017-12-31' })}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                filters.startDate === '2017-01-01' && filters.endDate === '2017-12-31'
                  ? 'bg-sky-500 text-white dark:bg-sky-600 dark:text-white shadow-[0_2px_8px_rgba(14,165,233,0.35)] font-semibold'
                  : 'text-zinc-600 dark:text-[#9b96b0] hover:text-sky-600 dark:hover:text-white'
              }`}
            >
              2017
            </button>
            <button
              onClick={() => setFilters({ startDate: '2018-01-01', endDate: '2018-12-31' })}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                filters.startDate === '2018-01-01' && filters.endDate === '2018-12-31'
                  ? 'bg-sky-500 text-white dark:bg-sky-600 dark:text-white shadow-[0_2px_8px_rgba(14,165,233,0.35)] font-semibold'
                  : 'text-zinc-600 dark:text-[#9b96b0] hover:text-sky-600 dark:hover:text-white'
              }`}
            >
              2018
            </button>
            <button
              onClick={() => setFilters({ startDate: '2017-11-20', endDate: '2017-11-27' })}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                filters.startDate === '2017-11-20' && filters.endDate === '2017-11-27'
                  ? 'bg-sky-500 text-white dark:bg-sky-600 dark:text-white shadow-[0_2px_8px_rgba(14,165,233,0.35)] font-semibold'
                  : 'text-zinc-600 dark:text-[#9b96b0] hover:text-sky-600 dark:hover:text-white'
              }`}
            >
              Black Friday
            </button>
          </div>

          {/* State Multi-Select Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setStateDropdownOpen(!stateDropdownOpen);
                setCategoryDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                filters.customerStates.length > 0
                  ? 'bg-sky-100 dark:bg-sky-500/20 border-sky-300 dark:border-sky-500/40 text-sky-700 dark:text-sky-300 font-semibold'
                  : 'bg-zinc-100 dark:bg-[#111115] border-black/10 dark:border-white/[0.1] text-zinc-700 dark:text-[#d2d0dd] hover:text-sky-600 dark:hover:text-white'
              }`}
            >
              <span>State {filters.customerStates.length > 0 && `(${filters.customerStates.length})`}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-[#9b96b0]" />
            </button>

            {stateDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#140b25] border border-black/10 dark:border-[#bab3ff]/20 rounded-2xl shadow-2xl z-50 p-2.5 backdrop-blur-3xl animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/5 dark:bg-white/[0.05] rounded-xl mb-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-[#9b96b0]" />
                  <input
                    type="text"
                    placeholder="Search state name or code..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="bg-transparent text-xs text-zinc-900 dark:text-white focus:outline-none w-full"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {filteredStates.map((st) => (
                    <button
                      key={st}
                      onClick={() => toggleState(st)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-sky-50 dark:hover:bg-white/[0.06] text-left text-xs text-zinc-700 dark:text-[#d2d0dd] transition"
                    >
                      <div>
                        <span className="font-semibold text-zinc-900 dark:text-white">{getStateOnlyName(st)}</span>
                        <span className="ml-1.5 text-[10px] text-sky-600 dark:text-[#887dff] font-mono">({st})</span>
                      </div>
                      {filters.customerStates.includes(st) && (
                        <Check className="w-4 h-4 text-sky-600 dark:text-[#00f0ff]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category Multi-Select Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setCategoryDropdownOpen(!categoryDropdownOpen);
                setStateDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                filters.categories.length > 0
                  ? 'bg-sky-100 dark:bg-sky-500/20 border-sky-300 dark:border-sky-500/40 text-sky-700 dark:text-sky-300 font-semibold'
                  : 'bg-zinc-100 dark:bg-[#111115] border-black/10 dark:border-white/[0.1] text-zinc-700 dark:text-[#d2d0dd] hover:text-sky-600 dark:hover:text-white'
              }`}
            >
              <span>Category {filters.categories.length > 0 && `(${filters.categories.length})`}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-[#9b96b0]" />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-[#140b25] border border-black/10 dark:border-[#bab3ff]/20 rounded-2xl shadow-2xl z-50 p-2.5 backdrop-blur-3xl animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/5 dark:bg-white/[0.05] rounded-xl mb-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-[#9b96b0]" />
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    className="bg-transparent text-xs text-zinc-900 dark:text-white focus:outline-none w-full"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto space-y-0.5">
                  {filteredCats.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-white/[0.06] text-left text-xs text-zinc-700 dark:text-[#d2d0dd]"
                    >
                      <span className="truncate">{cat.replace(/_/g, ' ')}</span>
                      {filters.categories.includes(cat) && (
                        <Check className="w-3.5 h-3.5 text-sky-600 dark:text-[#00f0ff] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Same-State Segmented Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-[#111115] p-0.5 rounded-full border border-black/10 dark:border-white/[0.1]">
            {(['all', 'same', 'cross'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilters({ sameState: mode })}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                  filters.sameState === mode
                    ? 'bg-sky-500 text-white dark:bg-sky-600 dark:text-white shadow-[0_2px_8px_rgba(14,165,233,0.35)] font-semibold'
                    : 'text-zinc-600 dark:text-[#9b96b0] hover:text-sky-600 dark:hover:text-white'
                }`}
              >
                {mode === 'all' ? 'All Transit' : mode === 'same' ? 'Same State' : 'Cross State'}
              </button>
            ))}
          </div>

          {/* Weekend Segmented Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-[#111115] p-0.5 rounded-full border border-black/10 dark:border-white/[0.1]">
            {(['all', 'weekend', 'weekday'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilters({ weekend: mode })}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                  filters.weekend === mode
                    ? 'bg-sky-500 text-white dark:bg-sky-600 dark:text-white shadow-[0_2px_8px_rgba(14,165,233,0.35)] font-semibold'
                    : 'text-zinc-600 dark:text-[#9b96b0] hover:text-sky-600 dark:hover:text-white'
                }`}
              >
                {mode === 'all' ? 'All Days' : mode === 'weekend' ? 'Weekend' : 'Weekday'}
              </button>
            ))}
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-rose-500 hover:bg-rose-50 border border-rose-200 dark:border-rose-500/30 transition"
              title="Reset all active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Active Filter Count Summary */}
        <div className="text-xs text-zinc-600 dark:text-[#9b96b0] font-medium flex items-center gap-2">
          <span>
            Active: <span className="font-bold text-sky-600 dark:text-white">{filteredCount.toLocaleString()}</span> orders
          </span>
        </div>
      </div>
    </div>
  );
};

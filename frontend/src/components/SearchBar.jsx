import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  filters = [],
  onFilterChange,
  extraActions,
  onClearFilters
}) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filters.some(f => f.value !== "");

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-card mb-5">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); if (onSearchSubmit) onSearchSubmit(); }}
          className="relative flex-1 w-full"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          />
        </form>

        {/* Filter Toggle Button */}
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary w-full sm:w-auto px-4 py-2 flex items-center justify-center gap-2 font-semibold ${
              showFilters || hasActiveFilters 
                ? 'bg-brand-blue-light/30 border-brand-blue/30 text-brand-blue-dark' 
                : ''
            }`}
          >
            <Filter className="w-4 h-4 shrink-0" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-blue shrink-0 animate-pulse" />
            )}
          </button>
        )}

        {/* Extra Actions (e.g., Export Buttons) */}
        {extraActions && (
          <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
            {extraActions}
          </div>
        )}
      </div>

      {/* Expanded filters panel */}
      {showFilters && filters.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100 animate-fadeIn">
          {filters.map((f, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.label}</label>
              <select
                value={f.value}
                onChange={(e) => onFilterChange(f.name, e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 shadow-input focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              >
                <option value="">{f.placeholder || `All ${f.label}`}</option>
                {f.options.map((opt, oIdx) => (
                  <option key={oIdx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {hasActiveFilters && onClearFilters && (
            <div className="flex items-end">
              <button
                onClick={onClearFilters}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1.5 py-1.5 px-2 hover:bg-slate-50 rounded-lg transition-colors font-medium"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

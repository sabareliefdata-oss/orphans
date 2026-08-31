import React from 'react';
import { Search, LayoutGrid, List, Filter, X } from 'lucide-react';

export default function FilterBar({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  stats
}) {
  const tabs = [
    { id: 'all', label: 'All Scripts', count: stats?.total || 0, color: 'slate' },
    { id: 'waiting', label: 'Waiting for Review', count: stats?.waiting || 0, color: 'amber' },
    { id: 'approved', label: 'Reviewed & Approved', count: stats?.approved || 0, color: 'emerald' }
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Tabs */}
      <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-[#0e4359] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.id === 'waiting'
                    ? 'bg-amber-100 text-amber-800'
                    : tab.id === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Layout Toggle */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Search Bar */}
        <div className="relative flex-1 md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search code (YE-...), name, text..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e4359] focus:bg-white transition placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onViewModeChange('grid')}
            title="Grid Cards View"
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'grid'
                ? 'bg-white text-[#0e4359] shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            title="Compact Table View"
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'table'
                ? 'bg-white text-[#0e4359] shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

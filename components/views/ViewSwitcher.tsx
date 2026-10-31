'use client';

import {
  LayoutList,
  Kanban,
  Calendar,
  Table,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export type ViewMode = 'list' | 'board' | 'calendar' | 'table';
export type FilterType = 'all' | 'habits' | 'tasks' | 'pending' | 'completed';
export type BoardGroupBy = 'status' | 'priority';

interface ViewSwitcherProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: FilterType;
  onFilterTypeChange: (filter: FilterType) => void;
  boardGroupBy?: BoardGroupBy;
  onBoardGroupByChange?: (groupBy: BoardGroupBy) => void;
  totalCount: number;
}

export function ViewSwitcher({
  activeView,
  onViewChange,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  boardGroupBy = 'status',
  onBoardGroupByChange,
  totalCount,
}: ViewSwitcherProps) {
  const views: { id: ViewMode; label: string; icon: typeof LayoutList }[] = [
    { id: 'list', label: 'List', icon: LayoutList },
    { id: 'board', label: 'Board', icon: Kanban },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'table', label: 'Table', icon: Table },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-sm">
      {/* Notion-style View Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {views.map((v) => {
          const Icon = v.icon;
          const isActive = activeView === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewChange(v.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs border border-zinc-200/90 dark:border-zinc-700/80'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>{v.label}</span>
            </button>
          );
        })}

        <div className="hidden sm:block h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <span className="hidden sm:inline-block text-[11px] font-medium text-zinc-400 px-1">
          {totalCount} item{totalCount === 1 ? '' : 's'}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-44">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search database..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value as FilterType)}
          className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="all">All Items</option>
          <option value="habits">Habits Only</option>
          <option value="tasks">Tasks Only</option>
          <option value="pending">Incomplete Only</option>
          <option value="completed">Completed Only</option>
        </select>

        {/* Board Group By (Only visible in Board view) */}
        {activeView === 'board' && onBoardGroupByChange && (
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <SlidersHorizontal className="w-3 h-3 ml-1" />
            <select
              value={boardGroupBy}
              onChange={(e) => onBoardGroupByChange(e.target.value as BoardGroupBy)}
              className="px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="status">Group: Status</option>
              <option value="priority">Group: Priority</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

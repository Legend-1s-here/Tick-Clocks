'use client';

import { useState } from 'react';
import {
  LayoutList,
  Kanban,
  Calendar,
  Table,
  Search,
  X,
  SlidersHorizontal,
  Plus,
  ChevronDown,
  Flame,
  CheckSquare,
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
  onOpenNewTask?: () => void;
  onOpenNewHabit?: () => void;
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
  onOpenNewTask,
  onOpenNewHabit,
}: ViewSwitcherProps) {
  const [showNewDropdown, setShowNewDropdown] = useState(false);

  const views: { id: ViewMode; label: string; icon: typeof LayoutList }[] = [
    { id: 'table', label: 'Table', icon: Table },
    { id: 'board', label: 'Board', icon: Kanban },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'list', label: 'List', icon: LayoutList },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
      {/* Notion Database Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {views.map((v) => {
          const Icon = v.icon;
          const isActive = activeView === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewChange(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
              <span>{v.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <span className="text-[11px] font-medium text-zinc-400 px-1 select-none">
          {totalCount} item{totalCount === 1 ? '' : 's'}
        </span>
      </div>

      {/* Right Controls: Search, Filter, GroupBy & Notion "+ New" button */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-44">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
          className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
        >
          <option value="all">Filter: All</option>
          <option value="habits">Habits Only</option>
          <option value="tasks">Tasks Only</option>
          <option value="pending">Incomplete</option>
          <option value="completed">Completed</option>
        </select>

        {/* Board Group By (Only visible in Board view) */}
        {activeView === 'board' && onBoardGroupByChange && (
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <SlidersHorizontal className="w-3 h-3 ml-1" />
            <select
              value={boardGroupBy}
              onChange={(e) => onBoardGroupByChange(e.target.value as BoardGroupBy)}
              className="px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="status">Status</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        )}

        {/* Notion Split "+ New" Button */}
        {(onOpenNewTask || onOpenNewHabit) && (
          <div className="relative inline-flex items-center">
            <button
              type="button"
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-l-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNewDropdown((prev) => !prev)}
              className="px-1.5 py-1.5 rounded-r-lg bg-indigo-700 hover:bg-indigo-800 text-white border-l border-indigo-500 text-xs transition-colors cursor-pointer shadow-xs"
              title="Add options"
            >
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Dropdown Menu */}
            {showNewDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 p-1 animate-in fade-in zoom-in-95 duration-100">
                {onOpenNewTask && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewDropdown(false);
                      onOpenNewTask();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-zinc-500" />
                    <span>New Task</span>
                  </button>
                )}
                {onOpenNewHabit && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewDropdown(false);
                      onOpenNewHabit();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-indigo-500" />
                    <span>New Habit</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

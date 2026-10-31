'use client';

import { useState } from 'react';
import {
  Columns3,
  Table,
  Calendar,
  LayoutList,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Flame,
  CheckSquare,
  Filter,
  ArrowUpDown,
  Zap,
  Sparkles,
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
  totalCount,
  onOpenNewTask,
  onOpenNewHabit,
}: ViewSwitcherProps) {
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(Boolean(searchQuery));
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const views: { id: ViewMode; label: string; icon: typeof Columns3 }[] = [
    { id: 'board', label: 'Board', icon: Columns3 },
    { id: 'table', label: 'Table', icon: Table },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'list', label: 'List', icon: LayoutList },
  ];

  return (
    <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800 select-none">
      {/* Notion Database Views Tab (Left) */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        {views.map((v) => {
          const Icon = v.icon;
          const isActive = activeView === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewChange(v.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-200/80 dark:bg-[#202020] text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 font-medium'
              }`}
            >
              <Icon className="w-3.5 h-3.5 stroke-[2]" />
              <span>{v.label}</span>
              {isActive && totalCount > 0 && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                  {totalCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notion Toolbar Actions (Right) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Filter Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilterDropdown((prev) => !prev)}
            className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer ${
              filterType !== 'all' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : ''
            }`}
            title="Filter database"
          >
            <Filter className="w-4 h-4 stroke-[1.8]" />
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-40 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 p-1 text-xs">
              <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Filter by
              </div>
              {(['all', 'habits', 'tasks', 'pending', 'completed'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    onFilterTypeChange(f);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left capitalize transition-colors cursor-pointer ${
                    filterType === f
                      ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <span>{f}</span>
                  {filterType === f && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Icon */}
        <button
          type="button"
          onClick={() => {
            // cycle quick view or inform user
          }}
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title="Sort database"
        >
          <ArrowUpDown className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* Zap / Automation Icon */}
        <button
          type="button"
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title="Automations & Reminders active"
        >
          <Zap className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* AI / Sparkles Icon */}
        <button
          type="button"
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title="AI Assistant"
        >
          <Sparkles className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* Search Icon & Input */}
        <div className="relative flex items-center">
          {showSearchInput ? (
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#202020] rounded-lg px-2 py-1 border border-zinc-200 dark:border-zinc-700">
              <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-28 sm:w-36 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 outline-none placeholder-zinc-400"
              />
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setShowSearchInput(false);
                }}
                className="text-zinc-400 hover:text-zinc-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSearchInput(true)}
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[1.8]" />
            </button>
          )}
        </div>

        {/* Settings / Sliders Icon */}
        <button
          type="button"
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title="View options"
        >
          <SlidersHorizontal className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* Notion Signature Blue "New ⌵" Button */}
        {(onOpenNewTask || onOpenNewHabit) && (
          <div className="relative inline-flex items-center ml-1">
            <button
              type="button"
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-l-md bg-[#2383e2] hover:bg-[#1b70c4] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNewDropdown((prev) => !prev)}
              className="px-1.5 py-1.5 rounded-r-md bg-[#2383e2] hover:bg-[#1b70c4] text-white border-l border-blue-400/40 text-xs transition-colors cursor-pointer shadow-xs"
              title="Add options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
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

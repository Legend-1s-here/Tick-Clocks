'use client';

import { useState } from 'react';
import { Habit } from '@/types/database';
import { Check, Flame, MoreVertical, Edit2, History, Archive, Loader2 } from 'lucide-react';

interface HabitItemProps {
  habit: Habit;
  isCompleted: boolean;
  currentStreak: number;
  onToggle: (habitId: string) => Promise<void>;
  onEdit: (habit: Habit) => void;
  onBackfill: (habit: Habit) => void;
  onArchive: (habitId: string, currentArchived: boolean) => void;
  isFocused?: boolean;
}

export function HabitItem({
  habit,
  isCompleted,
  currentStreak,
  onToggle,
  onEdit,
  onBackfill,
  onArchive,
  isFocused,
}: HabitItemProps) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCheck = async () => {
    if (loading) return;
    setLoading(true);
    await onToggle(habit.id);
    setLoading(false);
  };

  return (
    <div
      className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 ${
        isCompleted
          ? 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80 opacity-90'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs'
      } ${isFocused ? 'ring-2 ring-indigo-500' : ''}`}
    >
      {/* Left side: check button + info */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* 1-tap Check Button */}
        <button
          type="button"
          onClick={handleCheck}
          disabled={loading}
          aria-label={`Mark ${habit.title} as ${isCompleted ? 'incomplete' : 'completed'}`}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer ${
            isCompleted
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 scale-105'
              : 'border-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
          }`}
          style={{
            borderColor: isCompleted ? 'transparent' : habit.color || '#6366f1',
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          ) : isCompleted ? (
            <Check className="w-5 h-5 stroke-[2.5] animate-in zoom-in-50 duration-150" />
          ) : (
            <div
              className="w-2.5 h-2.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: habit.color || '#6366f1' }}
            />
          )}
        </button>

        {/* Text info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-semibold truncate transition-colors ${
                isCompleted
                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {habit.title}
            </span>

            {/* Category tag */}
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium">
              {habit.category}
            </span>
          </div>

          {habit.description && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
              {habit.description}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Streak badge + Action menu */}
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {/* Streak badge */}
        <div
          title={`Current streak: ${currentStreak} days`}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            currentStreak > 0
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              : 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60'
          }`}
        >
          <Flame
            className={`w-3.5 h-3.5 ${
              currentStreak > 0 ? 'fill-amber-500 text-amber-500' : 'text-zinc-400'
            }`}
          />
          <span>{currentStreak}d</span>
        </div>

        {/* Menu toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg py-1 z-30 animate-in fade-in-50 zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(habit);
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onBackfill(habit);
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Backfill Days</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onArchive(habit.id, habit.archived);
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2 cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-500" />
                  <span>{habit.archived ? 'Unarchive' : 'Archive'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

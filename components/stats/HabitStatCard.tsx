'use client';

import { useMemo } from 'react';
import { Habit, HabitLog } from '@/types/database';
import { calculateStreakStats } from '@/lib/logic/streaks';
import { Heatmap } from './Heatmap';
import { Flame, Trophy, Percent, CheckCircle } from 'lucide-react';

interface HabitStatCardProps {
  habit: Habit;
  logs: HabitLog[];
}

export function HabitStatCard({ habit, logs }: HabitStatCardProps) {
  const stats = useMemo(() => {
    return calculateStreakStats(habit, logs, new Date());
  }, [habit, logs]);

  const completedDateSet = useMemo(() => {
    return new Set(logs.map((l) => l.log_date));
  }, [logs]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: habit.color }}
          />
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>{habit.title}</span>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                {habit.category}
              </span>
            </h3>
            {habit.description && (
              <p className="text-xs text-zinc-400 mt-0.5">{habit.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>{stats.totalCompletions} logs all-time</span>
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Current streak */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Current</span>
          </div>
          <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {stats.currentStreak}{' '}
            <span className="text-xs font-normal text-zinc-400">days</span>
          </div>
        </div>

        {/* Longest streak */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span>Longest</span>
          </div>
          <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {stats.longestStreak}{' '}
            <span className="text-xs font-normal text-zinc-400">days</span>
          </div>
        </div>

        {/* 7-day rate */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
            <Percent className="w-3.5 h-3.5 text-indigo-500" />
            <span>7 Days</span>
          </div>
          <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {stats.completionRate7d}%
          </div>
        </div>

        {/* 30-day rate */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
            <Percent className="w-3.5 h-3.5 text-indigo-500" />
            <span>30 Days</span>
          </div>
          <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {stats.completionRate30d}%
          </div>
        </div>

        {/* 90-day rate */}
        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
            <Percent className="w-3.5 h-3.5 text-indigo-500" />
            <span>90 Days</span>
          </div>
          <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {stats.completionRate90d}%
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
          Activity Heatmap (Past 365 Days)
        </span>
        <Heatmap completedDates={completedDateSet} color={habit.color || '#6366f1'} />
      </div>
    </div>
  );
}

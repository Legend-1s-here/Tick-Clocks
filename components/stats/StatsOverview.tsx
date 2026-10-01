'use client';

import { useMemo } from 'react';
import { Habit, HabitLog } from '@/types/database';
import { calculateStreakStats } from '@/lib/logic/streaks';
import { Flame, CheckCircle2, TrendingUp, Award } from 'lucide-react';

interface StatsOverviewProps {
  habits: Habit[];
  logs: HabitLog[];
}

export function StatsOverview({ habits, logs }: StatsOverviewProps) {
  const summary = useMemo(() => {
    let bestCurrentStreak = 0;
    let bestCurrentHabitTitle = '';
    const totalLogs = logs.length;
    let sum30dRate = 0;
    let best30dRate = -1;
    let mostConsistentTitle = '';

    const activeHabits = habits.filter((h) => !h.archived);

    activeHabits.forEach((h) => {
      const hLogs = logs.filter((l) => l.habit_id === h.id);
      const s = calculateStreakStats(h, hLogs, new Date());

      if (s.currentStreak > bestCurrentStreak) {
        bestCurrentStreak = s.currentStreak;
        bestCurrentHabitTitle = h.title;
      }

      sum30dRate += s.completionRate30d;

      if (s.completionRate30d > best30dRate && hLogs.length > 0) {
        best30dRate = s.completionRate30d;
        mostConsistentTitle = h.title;
      }
    });

    const average30dRate =
      activeHabits.length > 0 ? Math.round(sum30dRate / activeHabits.length) : 0;

    return {
      bestCurrentStreak,
      bestCurrentHabitTitle,
      totalLogs,
      average30dRate,
      mostConsistentTitle: mostConsistentTitle || 'None yet',
      best30dRate: best30dRate >= 0 ? best30dRate : 0,
      activeCount: activeHabits.length,
    };
  }, [habits, logs]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* 30-day consistency */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <span>30-Day Average</span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {summary.average30dRate}%
        </div>
        <p className="text-[11px] text-zinc-400 mt-1">
          Across {summary.activeCount} active habits
        </p>
      </div>

      {/* Best current streak */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Top Active Streak</span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {summary.bestCurrentStreak}{' '}
          <span className="text-xs font-normal text-zinc-400">days</span>
        </div>
        <p className="text-[11px] text-zinc-400 mt-1 truncate">
          {summary.bestCurrentHabitTitle || 'No active streak'}
        </p>
      </div>

      {/* Total completions */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Total Check-ins</span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {summary.totalLogs}
        </div>
        <p className="text-[11px] text-zinc-400 mt-1">Logged in past 365 days</p>
      </div>

      {/* Most consistent */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
          <Award className="w-4 h-4 text-purple-500" />
          <span>Most Consistent</span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {summary.best30dRate}%
        </div>
        <p className="text-[11px] text-zinc-400 mt-1 truncate">
          {summary.mostConsistentTitle}
        </p>
      </div>
    </div>
  );
}

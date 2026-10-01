'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Habit, HabitLog } from '@/types/database';
import { StatsOverview } from './StatsOverview';
import { HabitStatCard } from './HabitStatCard';
import { BarChart3, Flame, Filter, Plus } from 'lucide-react';

interface StatsClientProps {
  habits: Habit[];
  logs: HabitLog[];
}

export function StatsClient({ habits, logs }: StatsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');

  const categories = ['All', ...Array.from(new Set(habits.map((h) => h.category)))];

  const activeHabits = habits.filter((h) => !h.archived);

  const filteredHabits = activeHabits.filter((h) => {
    const matchesCategory = selectedCategory === 'All' || h.category === selectedCategory;
    const matchesHabit = selectedHabitId === 'all' || h.id === selectedHabitId;
    return matchesCategory && matchesHabit;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            <span>Streaks & Analytics</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Yearly heatmaps, current and longest streaks, and completion rates.
          </p>
        </div>

        <Link
          href="/habits"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors self-start sm:self-auto"
        >
          <Flame className="w-3.5 h-3.5 text-indigo-500" />
          <span>Manage Habits</span>
        </Link>
      </div>

      {activeHabits.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
          <BarChart3 className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            No active habits to analyze
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Create a habit and start logging your check-ins to unlock streaks and yearly heatmaps.
          </p>
          <Link
            href="/today"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Go to Today View</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Top Aggregate Overview */}
          <StatsOverview habits={activeHabits} logs={logs} />

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Habit Breakdown ({filteredHabits.length})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category pills */}
              {categories.length > 2 && (
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                  <Filter className="w-3 h-3 text-zinc-400 shrink-0" />
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Single habit selector */}
              {activeHabits.length > 1 && (
                <select
                  value={selectedHabitId}
                  onChange={(e) => setSelectedHabitId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Habits</option>
                  {activeHabits.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Per-habit Stat Cards with Heatmaps */}
          <div className="space-y-5">
            {filteredHabits.map((habit) => (
              <HabitStatCard
                key={habit.id}
                habit={habit}
                logs={logs.filter((l) => l.habit_id === habit.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfWeek, addDays, addWeeks, isToday, isFuture } from 'date-fns';
import { Habit, HabitLog } from '@/types/database';
import { toggleHabitLog } from '@/app/actions/habits';
import { isHabitScheduledOnDate } from '@/lib/logic/streaks';
import { ChevronLeft, ChevronRight, Check, Loader2, Flame, Plus } from 'lucide-react';
import { HabitModal } from '@/components/habits/HabitModal';

interface WeeklyGridClientProps {
  initialHabits: Habit[];
  initialLogs: HabitLog[];
}

export function WeeklyGridClient({ initialHabits, initialLogs }: WeeklyGridClientProps) {
  const router = useRouter();

  // Week offset from current week (0 = current)
  const [weekOffset, setWeekOffset] = useState(0);
  const [habits] = useState<Habit[]>(initialHabits);
  const [logs, setLogs] = useState<HabitLog[]>(initialLogs);
  const [loadingCell, setLoadingCell] = useState<string | null>(null); // "habitId:dateStr"
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

  // Compute the 7 days of the current viewed week (Mon–Sun)
  const weekDays = useMemo(() => {
    const referenceDate = addWeeks(new Date(), weekOffset);
    // Week starts on Monday (weekStartsOn: 1)
    const monday = startOfWeek(referenceDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [weekOffset]);

  const weekLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    if (format(start, 'MMM yyyy') === format(end, 'MMM yyyy')) {
      return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
    }
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }, [weekDays]);

  // Build a fast lookup set: "habitId:dateStr" => true
  const completedSet = useMemo(() => {
    const s = new Set<string>();
    logs.forEach((l) => s.add(`${l.habit_id}:${l.log_date}`));
    return s;
  }, [logs]);

  // Only show active habits
  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);

  // Toggle a habit for a specific date
  const handleToggle = useCallback(
    async (habit: Habit, dateStr: string, date: Date) => {
      if (isFuture(date) && !isToday(date)) return; // can't log future days
      const key = `${habit.id}:${dateStr}`;
      if (loadingCell) return;
      setLoadingCell(key);

      // Optimistic update
      const isCompleted = completedSet.has(key);
      if (isCompleted) {
        setLogs((prev) => prev.filter((l) => !(l.habit_id === habit.id && l.log_date === dateStr)));
      } else {
        setLogs((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            habit_id: habit.id,
            user_id: '',
            log_date: dateStr,
            completed_at: new Date().toISOString(),
          },
        ]);
      }

      await toggleHabitLog(habit.id, dateStr);
      router.refresh();
      setLoadingCell(null);
    },
    [completedSet, loadingCell, router]
  );

  // Count completions per habit this week
  const weeklyCompletionCount = useCallback(
    (habitId: string) => {
      return weekDays.filter((d) => completedSet.has(`${habitId}:${format(d, 'yyyy-MM-dd')}`)).length;
    },
    [completedSet, weekDays]
  );

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Weekly Tracker
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Check off habits for each day of the week</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Week navigator */}
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center min-w-[180px]">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{weekLabel}</span>
            {weekOffset === 0 && (
              <span className="block text-[10px] text-indigo-500 font-semibold uppercase tracking-wider">
                This Week
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            disabled={weekOffset >= 0}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              This Week
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsHabitModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Habit
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-56">
                Habit
              </th>
              {weekDays.map((day, i) => {
                const isTodayDay = isToday(day);
                const isFutureDay = isFuture(day) && !isTodayDay;
                return (
                  <th
                    key={i}
                    className={`text-center px-2 py-3 text-xs font-bold uppercase tracking-wider w-14 ${
                      isTodayDay
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : isFutureDay
                        ? 'text-zinc-300 dark:text-zinc-600'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    <div>{DAY_LABELS[i]}</div>
                    <div
                      className={`text-[11px] font-semibold mt-0.5 ${
                        isTodayDay ? 'text-indigo-500' : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                    {isTodayDay && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mx-auto mt-0.5" />
                    )}
                  </th>
                );
              })}
              <th className="text-center px-2 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-16">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {activeHabits.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <Flame className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">No habits yet</p>
                  <p className="text-xs text-zinc-400 mt-1">Click &ldquo;New Habit&rdquo; to get started</p>
                </td>
              </tr>
            ) : (
              activeHabits.map((habit) => {
                const count = weeklyCompletionCount(habit.id);
                return (
                  <tr
                    key={habit.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors group"
                  >
                    {/* Habit Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: habit.color || '#6366f1' }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                            {habit.title}
                          </p>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-wide">
                            {habit.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Day Checkboxes */}
                    {weekDays.map((day, i) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const key = `${habit.id}:${dateStr}`;
                      const isScheduled = isHabitScheduledOnDate(habit, day);
                      const isCompleted = completedSet.has(key);
                      const isFutureDay = isFuture(day) && !isToday(day);
                      const isLoading = loadingCell === key;
                      const isTodayDay = isToday(day);

                      return (
                        <td key={i} className="px-2 py-3 text-center">
                          {!isScheduled ? (
                            // Not scheduled — show a subtle dash
                            <div className="w-8 h-8 mx-auto flex items-center justify-center">
                              <div className="w-4 h-[2px] rounded-full bg-zinc-200 dark:bg-zinc-700" />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggle(habit, dateStr, day)}
                              disabled={isFutureDay || isLoading}
                              title={
                                isFutureDay
                                  ? 'Cannot log future days'
                                  : isCompleted
                                  ? 'Mark incomplete'
                                  : 'Mark complete'
                              }
                              className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center transition-all duration-150 border-2 cursor-pointer
                                ${
                                  isFutureDay
                                    ? 'border-zinc-100 dark:border-zinc-800 cursor-not-allowed opacity-40'
                                    : isCompleted
                                    ? 'border-transparent bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 scale-105'
                                    : isTodayDay
                                    ? 'border-indigo-400 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                                    : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20'
                                }
                              `}
                            >
                              {isLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                              ) : isCompleted ? (
                                <Check className="w-4 h-4 stroke-[3] animate-in zoom-in-75 duration-100" />
                              ) : null}
                            </button>
                          )}
                        </td>
                      );
                    })}

                    {/* Weekly total */}
                    <td className="px-2 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 mx-auto rounded-lg text-xs font-bold ${
                          count === 7
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                            : count > 0
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                            : 'text-zinc-400 dark:text-zinc-600'
                        }`}
                      >
                        {count}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Footer totals row */}
          {activeHabits.length > 0 && (
            <tfoot>
              <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2.5 text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  Day Total
                </td>
                {weekDays.map((day, i) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const scheduledCount = activeHabits.filter((h) =>
                    isHabitScheduledOnDate(h, day)
                  ).length;
                  const doneCount = activeHabits.filter((h) =>
                    completedSet.has(`${h.id}:${dateStr}`)
                  ).length;
                  const allDone = scheduledCount > 0 && doneCount === scheduledCount;
                  return (
                    <td key={i} className="px-2 py-2.5 text-center">
                      <span
                        className={`text-xs font-bold ${
                          allDone
                            ? 'text-emerald-500'
                            : doneCount > 0
                            ? 'text-indigo-500'
                            : 'text-zinc-400 dark:text-zinc-600'
                        }`}
                      >
                        {doneCount}/{scheduledCount}
                      </span>
                    </td>
                  );
                })}
                <td className="px-2 py-2.5 text-center">
                  <span className="text-xs font-bold text-zinc-400">—</span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2 border-zinc-200 dark:border-zinc-700" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded bg-zinc-300 dark:bg-zinc-700" />
          <span>Not scheduled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>Today</span>
        </div>
      </div>

      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

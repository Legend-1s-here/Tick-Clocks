'use client';

import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { Habit, HabitLog, Task } from '@/types/database';
import { isHabitScheduledOnDate } from '@/lib/logic/streaks';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
} from 'lucide-react';

interface CalendarViewProps {
  habits: Habit[];
  tasks: Task[];
  logs: HabitLog[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onToggleHabit: (habitId: string, dateStr: string) => void;
  onToggleTask: (taskId: string, currentDone: boolean) => void;
  onAddTaskForDate: (dateStr: string) => void;
}

export function CalendarView({
  habits,
  tasks,
  logs,
  selectedDate,
  onSelectDate,
  onToggleHabit,
  onToggleTask,
  onAddTaskForDate,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Map of completed habits by date: "YYYY-MM-DD" -> Set<habitId>
  const completedLogsByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    logs.forEach((l) => {
      if (!map.has(l.log_date)) {
        map.set(l.log_date, new Set());
      }
      map.get(l.log_date)!.add(l.habit_id);
    });
    return map;
  }, [logs]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xs overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>

          <button
            type="button"
            onClick={() => {
              setCurrentMonth(new Date());
              onSelectDate(new Date());
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider py-2">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
        {calendarDays.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          const isDaySelected = isSameDay(day, selectedDate);

          // Get habits scheduled on this day
          const dayHabits = habits.filter(
            (h) => !h.archived && isHabitScheduledOnDate(h, day)
          );

          // Get tasks due on this day
          const dayTasks = tasks.filter((t) => t.due_date === dayStr);

          const completedHabitSet = completedLogsByDate.get(dayStr) || new Set<string>();

          return (
            <div
              key={dayStr}
              onClick={() => onSelectDate(day)}
              className={`group relative p-2 min-h-[105px] transition-colors cursor-pointer flex flex-col justify-between ${
                !isCurrentMonth
                  ? 'bg-zinc-50/40 dark:bg-zinc-950/40 text-zinc-400 opacity-60'
                  : 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40'
              } ${isDaySelected ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/10' : ''}`}
            >
              {/* Day Number Row */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                    isCurrentDay
                      ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Quick Add Button on Hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTaskForDate(dayStr);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  title="Add task on this date"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Items List for this Day */}
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[80px] scrollbar-none">
                {/* Habits on this day */}
                {dayHabits.map((h) => {
                  const isDone = completedHabitSet.has(h.id);
                  return (
                    <div
                      key={`h-${h.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleHabit(h.id, dayStr);
                      }}
                      className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 line-through opacity-75'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 hover:bg-indigo-100'
                      }`}
                      title={`${h.title} (Click to toggle)`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex items-center justify-center border shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-indigo-400'
                        }`}
                      >
                        {isDone && <Check className="w-2 h-2 stroke-[3]" />}
                      </div>
                      <span className="truncate">{h.title}</span>
                    </div>
                  );
                })}

                {/* Tasks on this day */}
                {dayTasks.map((t) => (
                  <div
                    key={`t-${t.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(t.id, t.done);
                    }}
                    className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                      t.done
                        ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500 line-through'
                        : t.priority === 'high'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                    title={`${t.title} (Click to toggle)`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded flex items-center justify-center border shrink-0 ${
                        t.done
                          ? 'bg-zinc-600 border-zinc-600 text-white'
                          : 'border-zinc-400'
                      }`}
                    >
                      {t.done && <Check className="w-2 h-2 stroke-[3]" />}
                    </div>
                    <span className="truncate">{t.title}</span>
                    {t.due_time && (
                      <span className="text-[9px] opacity-75 shrink-0 ml-auto">
                        {t.due_time}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Habit, HabitLog, Task } from '@/types/database';
import { toggleHabitLog, toggleArchiveHabit } from '@/app/actions/habits';
import { toggleTaskDone, deleteTask, checkAndRolloverTasks } from '@/app/actions/tasks';
import { calculateStreakStats, isHabitScheduledOnDate } from '@/lib/logic/streaks';
import { ProgressRing } from './ProgressRing';
import { HabitItem } from './HabitItem';
import { TaskItem } from './TaskItem';
import { HabitModal } from '@/components/habits/HabitModal';
import { TaskModal } from '@/components/tasks/TaskModal';
import { BackfillModal } from '@/components/habits/BackfillModal';
import {
  format,
  addDays,
  subDays,
  isToday as checkIsToday,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  CheckSquare,
} from 'lucide-react';

interface TodayClientProps {
  initialHabits: Habit[];
  initialLogs: HabitLog[];
  initialTasks: Task[];
  userTimezone: string;
  rolloverEnabled: boolean;
}

export function TodayClient({
  initialHabits,
  initialLogs,
  initialTasks,
  userTimezone,
  rolloverEnabled,
}: TodayClientProps) {
  const router = useRouter();

  // Current selected date (defaults to today's local date)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isSelectedToday = checkIsToday(selectedDate);

  // Local state for optimistic responses
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [logs, setLogs] = useState<HabitLog[]>(initialLogs);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Sync state if server props change
  useEffect(() => {
    setHabits(initialHabits);
  }, [initialHabits]);
  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Check and perform auto-rollover for unfinished tasks on mount
  useEffect(() => {
    if (rolloverEnabled) {
      checkAndRolloverTasks(format(new Date(), 'yyyy-MM-dd')).then((count) => {
        if (count > 0) {
          router.refresh();
        }
      });
    }
  }, [rolloverEnabled, router]);

  // Modals state
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isBackfillOpen, setIsBackfillOpen] = useState(false);
  const [backfillHabit, setBackfillHabit] = useState<Habit | null>(null);

  // Filter habits scheduled for selectedDate
  const scheduledHabits = useMemo(() => {
    return habits.filter(
      (h) => !h.archived && isHabitScheduledOnDate(h, selectedDate)
    );
  }, [habits, selectedDate]);

  // Filter tasks for selectedDate
  const scheduledTasks = useMemo(() => {
    return tasks.filter((t) => t.due_date === selectedDateStr);
  }, [tasks, selectedDateStr]);

  // Completed logs for selectedDate
  const completedHabitIdSet = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.log_date === selectedDateStr) {
        set.add(log.habit_id);
      }
    });
    return set;
  }, [logs, selectedDateStr]);

  // Calculate streaks map for active habits
  const streaksMap = useMemo(() => {
    const map = new Map<string, number>();
    habits.forEach((habit) => {
      const habitLogs = logs.filter((l) => l.habit_id === habit.id);
      const stats = calculateStreakStats(habit, habitLogs, new Date());
      map.set(habit.id, stats.currentStreak);
    });
    return map;
  }, [habits, logs]);

  // Progress metrics
  const totalItems = scheduledHabits.length + scheduledTasks.length;
  const completedHabitsCount = scheduledHabits.filter((h) =>
    completedHabitIdSet.has(h.id)
  ).length;
  const completedTasksCount = scheduledTasks.filter((t) => t.done).length;
  const completedItems = completedHabitsCount + completedTasksCount;

  // Optimistic Toggle Habit Log
  const handleToggleHabit = useCallback(
    async (habitId: string) => {
      const isAlreadyCompleted = completedHabitIdSet.has(habitId);

      // Optimistic update
      if (isAlreadyCompleted) {
        setLogs((prev) =>
          prev.filter(
            (l) => !(l.habit_id === habitId && l.log_date === selectedDateStr)
          )
        );
      } else {
        const dummyLog: HabitLog = {
          id: `temp-${Date.now()}`,
          habit_id: habitId,
          user_id: '',
          log_date: selectedDateStr,
          completed_at: new Date().toISOString(),
        };
        setLogs((prev) => [...prev, dummyLog]);
      }

      await toggleHabitLog(habitId, selectedDateStr);
      router.refresh();
    },
    [completedHabitIdSet, selectedDateStr, router]
  );

  // Optimistic Toggle Task Done
  const handleToggleTask = useCallback(
    async (taskId: string, currentDone: boolean) => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, done: !currentDone } : t))
      );

      await toggleTaskDone(taskId, currentDone);
      router.refresh();
    },
    [router]
  );

  // Delete Task
  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await deleteTask(taskId);
      router.refresh();
    },
    [router]
  );

  // Archive Habit
  const handleArchiveHabit = useCallback(
    async (habitId: string, currentArchived: boolean) => {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      await toggleArchiveHabit(habitId, currentArchived);
      router.refresh();
    },
    [router]
  );

  // Keyboard shortcuts (N = new item, Space = toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input, textarea or modal
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        return;
      }
      if (isHabitModalOpen || isTaskModalOpen || isBackfillOpen) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsTaskModalOpen(true);
      } else if (e.code === 'Space') {
        e.preventDefault();
        // Toggle the first pending habit or task
        const firstPendingHabit = scheduledHabits.find(
          (h) => !completedHabitIdSet.has(h.id)
        );
        if (firstPendingHabit) {
          handleToggleHabit(firstPendingHabit.id);
        } else {
          const firstPendingTask = scheduledTasks.find((t) => !t.done);
          if (firstPendingTask) {
            handleToggleTask(firstPendingTask.id, false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isHabitModalOpen,
    isTaskModalOpen,
    isBackfillOpen,
    scheduledHabits,
    scheduledTasks,
    completedHabitIdSet,
    handleToggleHabit,
    handleToggleTask,
  ]);

  return (
    <div className="space-y-6">
      {/* Date Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center sm:text-left min-w-[200px]">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {format(selectedDate, 'EEEE, MMM d')}
            </h1>
            <p className="text-xs text-zinc-400">
              {isSelectedToday ? "Today's Schedule" : `Viewing ${selectedDateStr}`} • {userTimezone}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isSelectedToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(new Date())}
              className="ml-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              Back to Today
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              setHabitToEdit(null);
              setIsHabitModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-2xs"
          >
            <Flame className="w-3.5 h-3.5 text-indigo-500" />
            <span>New Habit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Progress Ring / Daily Momentum */}
      <ProgressRing completed={completedItems} total={totalItems} />

      {/* Habits Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
              Habits ({completedHabitsCount}/{scheduledHabits.length})
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400">1-tap check-in</span>
        </div>

        {scheduledHabits.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
            <Flame className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              No habits scheduled for this day
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Start building a routine with daily or weekday habits.
            </p>
            <button
              type="button"
              onClick={() => {
                setHabitToEdit(null);
                setIsHabitModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Habit</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {scheduledHabits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                isCompleted={completedHabitIdSet.has(habit.id)}
                currentStreak={streaksMap.get(habit.id) || 0}
                onToggle={handleToggleHabit}
                onEdit={(h) => {
                  setHabitToEdit(h);
                  setIsHabitModalOpen(true);
                }}
                onBackfill={(h) => {
                  setBackfillHabit(h);
                  setIsBackfillOpen(true);
                }}
                onArchive={handleArchiveHabit}
              />
            ))}
          </div>
        )}
      </section>

      {/* Daily Tasks Section */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
              Daily Checklist ({completedTasksCount}/{scheduledTasks.length})
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400">One-off tasks</span>
        </div>

        {scheduledTasks.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
            <CheckSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              No tasks due on this date
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Add reminders and items you need to conquer today.
            </p>
            <button
              type="button"
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add a Task</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {scheduledTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onEdit={(t) => {
                  setTaskToEdit(t);
                  setIsTaskModalOpen(true);
                }}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </section>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="hidden sm:flex items-center justify-between py-3 px-4 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 text-[11px] text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px] text-zinc-600 dark:text-zinc-300">
              N
            </kbd>
            <span>New item</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px] text-zinc-600 dark:text-zinc-300">
              Space
            </kbd>
            <span>Toggle item</span>
          </span>
        </div>
        <span>Micro-interactions enabled</span>
      </div>

      {/* Modals */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setHabitToEdit(null);
        }}
        habitToEdit={habitToEdit}
        onSuccess={() => router.refresh()}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        defaultDate={selectedDateStr}
        taskToEdit={taskToEdit}
        onSuccess={() => router.refresh()}
      />

      <BackfillModal
        isOpen={isBackfillOpen}
        onClose={() => {
          setIsBackfillOpen(false);
          setBackfillHabit(null);
        }}
        habit={backfillHabit}
        logs={backfillHabit ? logs.filter((l) => l.habit_id === backfillHabit.id) : []}
        onToggleComplete={() => router.refresh()}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Habit, HabitLog } from '@/types/database';
import { toggleHabitLog } from '@/app/actions/habits';
import { format, subDays } from 'date-fns';
import { X, Check, Loader2 } from 'lucide-react';

interface BackfillModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  logs: HabitLog[];
  onToggleComplete?: () => void;
}

export function BackfillModal({
  isOpen,
  onClose,
  habit,
  logs,
  onToggleComplete,
}: BackfillModalProps) {
  const [loadingDate, setLoadingDate] = useState<string | null>(null);

  if (!isOpen || !habit) return null;

  const completedDates = new Set(logs.map((l) => l.log_date));

  // Generate last 14 days
  const today = new Date();
  const pastDays = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    return {
      date: d,
      dateStr,
      dayName: format(d, 'EEE'),
      displayDate: format(d, 'MMM d'),
      isCompleted: completedDates.has(dateStr),
    };
  });

  const handleToggle = async (dateStr: string) => {
    setLoadingDate(dateStr);
    await toggleHabitLog(habit.id, dateStr);
    setLoadingDate(null);
    onToggleComplete?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Backfill: {habit.title}
              </h2>
              <p className="text-[11px] text-zinc-400">Tap any day to toggle completion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Days grid */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2">
          {pastDays.map(({ dateStr, dayName, displayDate, isCompleted }) => {
            const isLoading = loadingDate === dateStr;
            return (
              <div
                key={dateStr}
                onClick={() => !isLoading && handleToggle(dateStr)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center text-[10px] font-bold">
                    <span className="text-zinc-400">{dayName}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">{displayDate}</span>
                    <span className="text-[10px] text-zinc-400">
                      {isCompleted ? 'Completed' : 'Missed / Not logged'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'border-2 border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

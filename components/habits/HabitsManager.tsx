'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Habit, HabitLog } from '@/types/database';
import { toggleArchiveHabit, deleteHabit } from '@/app/actions/habits';
import { HabitModal } from '@/components/habits/HabitModal';
import { BackfillModal } from '@/components/habits/BackfillModal';
import {
  Flame,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  Trash2,
  Calendar,
  History,
  Filter,
} from 'lucide-react';

interface HabitsManagerProps {
  initialHabits: Habit[];
  initialLogs: HabitLog[];
}

export function HabitsManager({ initialHabits, initialLogs }: HabitsManagerProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const [isBackfillOpen, setIsBackfillOpen] = useState(false);
  const [backfillHabit, setBackfillHabit] = useState<Habit | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(initialHabits.map((h) => h.category)))];

  const filteredHabits = initialHabits.filter((h) => {
    const matchesTab = activeTab === 'active' ? !h.archived : h.archived;
    const matchesCategory = selectedCategory === 'All' || h.category === selectedCategory;
    return matchesTab && matchesCategory;
  });

  const handleToggleArchive = async (habitId: string, currentArchived: boolean) => {
    await toggleArchiveHabit(habitId, currentArchived);
    router.refresh();
  };

  const handleDelete = async (habitId: string) => {
    if (!confirm('Are you sure you want to permanently delete this habit and all its history?')) {
      return;
    }
    setDeletingId(habitId);
    await deleteHabit(habitId);
    setDeletingId(null);
    router.refresh();
  };

  const formatFrequency = (h: Habit) => {
    if (h.frequency_type === 'daily') return 'Every day';
    if (h.frequency_type === 'weekly_target') return `${h.target_per_week}x per week`;
    if (h.frequency_type === 'weekdays') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return h.days_of_week.map((d) => days[d]).join(', ');
    }
    return 'Custom';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Flame className="w-6 h-6 text-indigo-500" />
            <span>Manage Habits</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure frequencies, target goals, categories, and archive states.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setHabitToEdit(null);
            setIsHabitModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Habit</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Active vs Archived Tab */}
        <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Active ({initialHabits.filter((h) => !h.archived).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archived')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'archived'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Archived ({initialHabits.filter((h) => h.archived).length})
          </button>
        </div>

        {/* Category Filter */}
        {categories.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
          <Flame className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {activeTab === 'active' ? 'No active habits found' : 'No archived habits'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            {activeTab === 'active'
              ? 'Click below to create a habit and start building consistency.'
              : 'Habits you archive will appear here instead of cluttering your daily view.'}
          </p>
          {activeTab === 'active' && (
            <button
              type="button"
              onClick={() => {
                setHabitToEdit(null);
                setIsHabitModalOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Add First Habit
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredHabits.map((habit) => (
            <div
              key={habit.id}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {habit.title}
                    </h3>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0">
                    {habit.category}
                  </span>
                </div>

                {habit.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2">
                    {habit.description}
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{formatFrequency(habit)}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setBackfillHabit(habit);
                    setIsBackfillOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Backfill Logs</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setHabitToEdit(habit);
                      setIsHabitModalOpen(true);
                    }}
                    title="Edit habit"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleArchive(habit.id, habit.archived)}
                    title={habit.archived ? 'Restore habit' : 'Archive habit'}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                  >
                    {habit.archived ? (
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(habit.id)}
                    disabled={deletingId === habit.id}
                    title="Delete permanently"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

      <BackfillModal
        isOpen={isBackfillOpen}
        onClose={() => {
          setIsBackfillOpen(false);
          setBackfillHabit(null);
        }}
        habit={backfillHabit}
        logs={backfillHabit ? initialLogs.filter((l) => l.habit_id === backfillHabit.id) : []}
        onToggleComplete={() => router.refresh()}
      />
    </div>
  );
}

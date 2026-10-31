'use client';

import { useState, useMemo } from 'react';
import { Habit, Task } from '@/types/database';
import {
  Check,
  Flame,
  CalendarDays,
  Clock,
  ArrowUpDown,
  Pencil,
  Trash2,
  Archive,
  Bell,
  BellOff,
} from 'lucide-react';
import { UnifiedItem } from './KanbanBoardView';

interface DatabaseTableViewProps {
  items: UnifiedItem[];
  onToggleHabit: (habitId: string) => void;
  onToggleTask: (taskId: string, currentDone: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onArchiveHabit: (habitId: string, currentArchived: boolean) => void;
}

type SortField = 'title' | 'type' | 'priority' | 'status';
type SortOrder = 'asc' | 'desc';

export function DatabaseTableView({
  items,
  onToggleHabit,
  onToggleTask,
  onEditHabit,
  onEditTask,
  onDeleteTask,
  onArchiveHabit,
}: DatabaseTableViewProps) {
  const [sortField, setSortField] = useState<SortField>('status');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'type') {
        comparison = a.type.localeCompare(b.type);
      } else if (sortField === 'priority') {
        const pOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const pA = a.priority ? pOrder[a.priority] || 0 : 0;
        const pB = b.priority ? pOrder[b.priority] || 0 : 0;
        comparison = pA - pB;
      } else if (sortField === 'status') {
        comparison = (a.done ? 1 : 0) - (b.done ? 1 : 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [items, sortField, sortOrder]);

  const completedCount = items.filter((i) => i.done).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-3.5 w-12 text-center">Status</th>
              <th
                onClick={() => handleSort('title')}
                className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Name</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('type')}
                className="py-3 px-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none w-28"
              >
                <div className="flex items-center gap-1.5">
                  <span>Type</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('priority')}
                className="py-3 px-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none w-28"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th className="py-3 px-3.5 w-36">Category / Tag</th>
              <th className="py-3 px-3.5 w-32">Schedule</th>
              <th className="py-3 px-3 w-16 text-center">Alert</th>
              <th className="py-3 px-3.5 w-20 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-zinc-400">
                  No items match your filter criteria
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => (
                <tr
                  key={`${item.type}-${item.id}`}
                  className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  {/* Status Checkbox */}
                  <td className="py-2.5 px-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.type === 'habit') {
                          onToggleHabit(item.id);
                        } else {
                          onToggleTask(item.id, item.done);
                        }
                      }}
                      className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all cursor-pointer mx-auto ${
                        item.done
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                          : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-white dark:bg-zinc-950'
                      }`}
                    >
                      {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </td>

                  {/* Title & Description */}
                  <td className="py-2.5 px-4 font-medium">
                    <div className="flex flex-col">
                      <span
                        className={`text-xs ${
                          item.done
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-900 dark:text-zinc-100 font-semibold'
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.description && (
                        <span className="text-[11px] text-zinc-400 truncate max-w-sm mt-0.5">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td className="py-2.5 px-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                        item.type === 'habit'
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {item.type === 'habit' ? (
                        <>
                          <Flame className="w-2.5 h-2.5 text-indigo-500" />
                          <span>Habit</span>
                        </>
                      ) : (
                        <>
                          <CalendarDays className="w-2.5 h-2.5 text-zinc-500" />
                          <span>Task</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-2.5 px-3.5">
                    {item.priority ? (
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider ${
                          item.priority === 'high'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                            : item.priority === 'medium'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                        }`}
                      >
                        {item.priority}
                      </span>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700">—</span>
                    )}
                  </td>

                  {/* Category / Tags */}
                  <td className="py-2.5 px-3.5">
                    {item.category ? (
                      <span
                        className="inline-block text-[10px] px-2 py-0.5 rounded-md font-medium"
                        style={{
                          backgroundColor: `${item.color || '#6366f1'}15`,
                          color: item.color || '#6366f1',
                        }}
                      >
                        {item.category}
                      </span>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700">—</span>
                    )}
                  </td>

                  {/* Schedule / Due Time */}
                  <td className="py-2.5 px-3.5 text-zinc-500 text-[11px]">
                    {item.type === 'habit' ? (
                      item.streak && item.streak > 0 ? (
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          🔥 {item.streak}d streak
                        </span>
                      ) : (
                        <span>Scheduled</span>
                      )
                    ) : item.due_time ? (
                      <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>{item.due_time}</span>
                      </span>
                    ) : (
                      <span>Today</span>
                    )}
                  </td>

                  {/* Notification Status */}
                  <td className="py-2.5 px-3 text-center">
                    {item.email_reminder ? (
                      <span title="Email reminder enabled" className="inline-flex justify-center">
                        <Bell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mx-auto" />
                      </span>
                    ) : (
                      <span title="Email reminder disabled" className="inline-flex justify-center">
                        <BellOff className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 mx-auto" />
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.type === 'habit' && item.originalHabit) {
                            onEditHabit(item.originalHabit);
                          } else if (item.type === 'task' && item.originalTask) {
                            onEditTask(item.originalTask);
                          }
                        }}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Edit"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (item.type === 'habit' && item.originalHabit) {
                            onArchiveHabit(item.id, item.originalHabit.archived);
                          } else if (item.type === 'task') {
                            onDeleteTask(item.id);
                          }
                        }}
                        className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title={item.type === 'habit' ? 'Archive' : 'Delete'}
                      >
                        {item.type === 'habit' ? (
                          <Archive className="w-3 h-3" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Database Footer Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-zinc-800 dark:text-zinc-200">{sortedItems.length}</strong> items
          </span>
          <span>•</span>
          <span>
            <strong className="text-emerald-600 dark:text-emerald-400">{completedCount}</strong> completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2.5 w-full sm:w-48">
          <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 w-8 text-right">
            {progressPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}

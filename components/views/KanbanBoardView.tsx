'use client';

import { useMemo } from 'react';
import { Habit, Task } from '@/types/database';
import {
  Flame,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Archive,
  Bell,
  Check,
  CalendarDays,
  Maximize2,
} from 'lucide-react';
import { BoardGroupBy } from './ViewSwitcher';

export interface UnifiedItem {
  id: string;
  type: 'habit' | 'task';
  title: string;
  description?: string | null;
  category?: string;
  color?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  due_time?: string | null;
  done: boolean;
  streak?: number;
  email_reminder?: boolean;
  originalHabit?: Habit;
  originalTask?: Task;
}

interface KanbanBoardViewProps {
  items: UnifiedItem[];
  groupBy: BoardGroupBy;
  onToggleHabit: (habitId: string) => void;
  onToggleTask: (taskId: string, currentDone: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onArchiveHabit: (habitId: string, currentArchived: boolean) => void;
  onAddTask: () => void;
  onAddHabit: () => void;
  onOpenItem?: (item: UnifiedItem) => void;
}

export function KanbanBoardView({
  items,
  groupBy,
  onToggleHabit,
  onToggleTask,
  onEditHabit,
  onEditTask,
  onDeleteTask,
  onArchiveHabit,
  onAddTask,
  onAddHabit,
  onOpenItem,
}: KanbanBoardViewProps) {
  // Columns definition based on groupBy
  const columns = useMemo(() => {
    if (groupBy === 'status') {
      return [
        {
          id: 'todo',
          title: 'To Do',
          dotColor: 'bg-amber-400',
          badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
          filter: (item: UnifiedItem) => !item.done,
        },
        {
          id: 'done',
          title: 'Completed',
          dotColor: 'bg-emerald-500',
          badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
          filter: (item: UnifiedItem) => item.done,
        },
      ];
    }

    return [
      {
        id: 'high',
        title: 'High Priority',
        dotColor: 'bg-rose-500',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        filter: (item: UnifiedItem) => item.priority === 'high',
      },
      {
        id: 'medium',
        title: 'Medium Priority',
        dotColor: 'bg-amber-500',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        filter: (item: UnifiedItem) => item.priority === 'medium',
      },
      {
        id: 'low',
        title: 'Routine / Low',
        dotColor: 'bg-blue-500',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        filter: (item: UnifiedItem) => !item.priority || item.priority === 'low',
      },
    ];
  }, [groupBy]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
      {columns.map((col) => {
        const colItems = items.filter(col.filter);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 p-3 space-y-2.5 min-h-[440px]"
          >
            {/* Notion Column Header */}
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  {col.title}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${col.badgeColor}`}
                >
                  {colItems.length}
                </span>
              </div>
            </div>

            {/* Cards List */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[660px] pr-0.5">
              {colItems.length === 0 ? (
                <div className="py-14 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  Empty column
                </div>
              ) : (
                colItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => onOpenItem && onOpenItem(item)}
                    className={`group relative p-3 rounded-xl border bg-white dark:bg-zinc-950 transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 ${
                      item.done
                        ? 'border-emerald-200/60 dark:border-emerald-900/30 opacity-75'
                        : 'border-zinc-200/80 dark:border-zinc-800'
                    }`}
                  >
                    {/* Header Row: Checkbox + Title + Notion OPEN hover button */}
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.type === 'habit') {
                            onToggleHabit(item.id);
                          } else {
                            onToggleTask(item.id, item.done);
                          }
                        }}
                        className={`mt-0.5 shrink-0 w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                          item.done
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50 dark:bg-zinc-950'
                        }`}
                        title={item.done ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-semibold block leading-snug break-words ${
                              item.done
                                ? 'line-through text-zinc-400 dark:text-zinc-500'
                                : 'text-zinc-900 dark:text-zinc-100'
                            }`}
                          >
                            {item.title}
                          </span>

                          {/* Notion OPEN button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenItem) onOpenItem(item);
                            }}
                            className="opacity-0 group-hover:opacity-100 px-1 py-0.5 rounded text-[9px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-2xs transition-opacity flex items-center gap-0.5 shrink-0"
                          >
                            <Maximize2 className="w-2.5 h-2.5" />
                            <span>OPEN</span>
                          </button>
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata Badges Footer */}
                    <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/70">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Type Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
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

                        {/* Category Tag */}
                        {item.category && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: `${item.color || '#6366f1'}15`,
                              color: item.color || '#6366f1',
                            }}
                          >
                            {item.category}
                          </span>
                        )}

                        {item.priority && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${
                              item.priority === 'high'
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                                : item.priority === 'medium'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                            }`}
                          >
                            {item.priority}
                          </span>
                        )}

                        {/* Streak Badge */}
                        {item.type === 'habit' && typeof item.streak === 'number' && item.streak > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                            🔥 {item.streak}d
                          </span>
                        )}

                        {/* Due Time */}
                        {item.due_time && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{item.due_time}</span>
                          </span>
                        )}

                        {/* Email Reminder Icon */}
                        {item.email_reminder && (
                          <span title="Email reminder active" className="inline-flex items-center">
                            <Bell className="w-2.5 h-2.5 text-indigo-500" />
                          </span>
                        )}
                      </div>

                      {/* Quick Edit Actions */}
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (item.type === 'habit' && item.originalHabit) {
                              onEditHabit(item.originalHabit);
                            } else if (item.type === 'task' && item.originalTask) {
                              onEditTask(item.originalTask);
                            }
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                          className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title={item.type === 'habit' ? 'Archive' : 'Delete'}
                        >
                          {item.type === 'habit' ? (
                            <Archive className="w-3 h-3" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Notion "+ New" button at bottom of column */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={onAddTask}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New task</span>
              </button>
              <button
                type="button"
                onClick={onAddHabit}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <Flame className="w-3 h-3 text-indigo-500" />
                <span>New habit</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

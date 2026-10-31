'use client';

import { useState, useEffect } from 'react';
import { UnifiedItem, BoardColumnId } from './KanbanBoardView';
import {
  X,
  Check,
  CalendarDays,
  Tag,
  Bell,
  Sparkles,
  FileText,
  Pencil,
  Trash2,
} from 'lucide-react';

interface NotionPeekModalProps {
  item: UnifiedItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleHabit: (habitId: string) => void;
  onToggleTask: (taskId: string, currentDone: boolean) => void;
  onEditHabit: (item: UnifiedItem) => void;
  onEditTask: (item: UnifiedItem) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveItem?: (itemId: string, newStatus: BoardColumnId) => void;
}

export function NotionPeekModal({
  item,
  isOpen,
  onClose,
  onToggleHabit,
  onToggleTask,
  onEditHabit,
  onEditTask,
  onDeleteTask,
  onMoveItem,
}: NotionPeekModalProps) {
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (item) {
      setNoteContent(item.description || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const isHabit = item.type === 'habit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Minimalist Action Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <span>{isHabit ? 'Habit Page' : 'Task Page'}</span>
            <span>/</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-xs">
              {item.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (isHabit) {
                  onEditHabit(item);
                } else {
                  onEditTask(item);
                }
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit Details</span>
            </button>

            {/* Delete button (tasks only) */}
            {!isHabit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteTask(item.id);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Header Icon + Title */}
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl select-none">
              {isHabit ? '🎯' : '📋'}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isHabit) {
                    onToggleHabit(item.id);
                  } else {
                    onToggleTask(item.id, item.done);
                  }
                }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                  item.done
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 bg-white dark:bg-zinc-900'
                }`}
                title={item.done ? 'Mark incomplete' : 'Mark completed'}
              >
                {item.done && <Check className="w-4 h-4 stroke-[3]" />}
              </button>

              <h1
                className={`text-xl sm:text-2xl font-bold tracking-tight ${
                  item.done
                    ? 'line-through text-zinc-400 dark:text-zinc-500'
                    : 'text-zinc-900 dark:text-zinc-50'
                }`}
              >
                {item.title}
              </h1>
            </div>
          </div>

          {/* Notion Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 text-xs">
            {/* Status with Notion 4-column dropdown */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-zinc-400 flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Status</span>
              </span>
              {onMoveItem ? (
                <select
                  value={item.status || (item.done ? 'done' : 'not_started')}
                  onChange={(e) => onMoveItem(item.id, e.target.value as BoardColumnId)}
                  className="px-2 py-1 rounded-md font-semibold text-[11px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer focus:outline-none"
                >
                  <option value="not_started">● Not started</option>
                  <option value="on_hold">● Dropped / On hold</option>
                  <option value="in_progress">● In progress</option>
                  <option value="done">● Done</option>
                </select>
              ) : (
                <span
                  className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                    item.done
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {item.done ? 'Done' : 'Not started'}
                </span>
              )}
            </div>

            {/* Type */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-zinc-400 flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5" />
                <span>Type</span>
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                {item.type}
              </span>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-zinc-400 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Priority</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-semibold text-[11px] uppercase ${
                  item.priority === 'high'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : item.priority === 'medium'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                {item.priority || 'Routine'}
              </span>
            </div>

            {/* Category */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-zinc-400 flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5" />
                <span>Category</span>
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {item.category || 'General'}
              </span>
            </div>

            {/* Schedule / Due */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-zinc-400 flex items-center gap-1.5 font-medium">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Schedule</span>
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {isHabit ? 'Daily Routine' : item.due_date || 'Today'}
              </span>
            </div>

            {/* Time / Alert */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-zinc-400 flex items-center gap-1.5 font-medium">
                <Bell className="w-3.5 h-3.5" />
                <span>Email Alert</span>
              </span>
              <span
                className={`font-semibold ${
                  item.email_reminder !== false
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-400'
                }`}
              >
                {item.email_reminder !== false ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Notes / Description Section */}
          <div className="space-y-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Notes & Reflections</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed min-h-[100px]">
              {noteContent ? (
                <p className="whitespace-pre-wrap">{noteContent}</p>
              ) : (
                <p className="text-zinc-400 italic">
                  No notes entered yet. Click &apos;Edit Details&apos; above to add steps, bullet points, or goals.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
          <div className="text-[11px] text-zinc-400">
            Notion Quick Peek • Press Esc to close
          </div>

          <button
            type="button"
            onClick={() => {
              if (isHabit) {
                onToggleHabit(item.id);
              } else {
                onToggleTask(item.id, item.done);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
              item.done
                ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {item.done ? 'Mark as Incomplete' : '✓ Complete Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

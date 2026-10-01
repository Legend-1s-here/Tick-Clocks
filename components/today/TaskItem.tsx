'use client';

import { useState } from 'react';
import { Task } from '@/types/database';
import { Check, Clock, Trash2, Edit2, Loader2, Flag } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string, currentDone: boolean) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => Promise<void>;
  isFocused?: boolean;
}

export function TaskItem({ task, onToggle, onEdit, onDelete, isFocused }: TaskItemProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    await onToggle(task.id, task.done);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    await onDelete(task.id);
  };

  const priorityStyles = {
    low: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60',
    medium: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
    high: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
  };

  return (
    <div
      className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-150 ${
        task.done
          ? 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80 opacity-80'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs'
      } ${isFocused ? 'ring-2 ring-indigo-500' : ''}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Toggle checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          aria-label={`Mark task ${task.title} as ${task.done ? 'incomplete' : 'done'}`}
          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            task.done
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'border-2 border-zinc-300 dark:border-zinc-700 hover:border-indigo-500'
          }`}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
          ) : task.done ? (
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          ) : null}
        </button>

        {/* Task Title */}
        <div className="min-w-0 flex-1">
          <span
            className={`text-sm font-medium transition-colors ${
              task.done
                ? 'line-through text-zinc-400 dark:text-zinc-500'
                : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {task.title}
          </span>
        </div>
      </div>

      {/* Badges & Actions */}
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {/* Due Time */}
        {task.due_time && (
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>{task.due_time}</span>
          </div>
        )}

        {/* Priority tag */}
        <div
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${
            priorityStyles[task.priority]
          }`}
        >
          <Flag className="w-2.5 h-2.5" />
          <span>{task.priority}</span>
        </div>

        {/* Edit and Delete Buttons — always visible on mobile, hover-reveal on desktop */}
        <div className="flex items-center sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 sm:transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit task"
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete task"
            className="p-1 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Habit, Task } from '@/types/database';
import {
  Plus,
  Maximize2,
  FileText,
  MoreHorizontal,
  Trash2,
  Pencil,
  Check,
} from 'lucide-react';

export type BoardColumnId = 'not_started' | 'on_hold' | 'in_progress' | 'done';

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
  status?: BoardColumnId;
  originalHabit?: Habit;
  originalTask?: Task;
}

interface BoardColumnDef {
  id: BoardColumnId;
  title: string;
  dotColor: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  buttonBorder: string;
  buttonText: string;
  buttonHoverBg: string;
}

const BOARD_COLUMNS: BoardColumnDef[] = [
  {
    id: 'not_started',
    title: 'Not started',
    dotColor: 'bg-zinc-400',
    pillBg: 'bg-zinc-200/90 dark:bg-[#2b2b2b]',
    pillBorder: 'border-transparent',
    pillText: 'text-zinc-700 dark:text-zinc-300',
    buttonBorder: 'border-zinc-200/70 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600',
    buttonText: 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200',
    buttonHoverBg: 'hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60',
  },
  {
    id: 'on_hold',
    title: 'Dropped / On hold',
    dotColor: 'bg-[#e06c75]',
    pillBg: 'bg-[#3d2424] dark:bg-[#341d1d]',
    pillBorder: 'border-rose-900/30',
    pillText: 'text-[#e06c75]',
    buttonBorder: 'border-[#442323] hover:border-rose-800/80',
    buttonText: 'text-rose-400/80 hover:text-rose-300',
    buttonHoverBg: 'hover:bg-rose-950/20',
  },
  {
    id: 'in_progress',
    title: 'In progress',
    dotColor: 'bg-[#529cca]',
    pillBg: 'bg-[#1a2d42] dark:bg-[#142333]',
    pillBorder: 'border-blue-900/30',
    pillText: 'text-[#529cca]',
    buttonBorder: 'border-[#1f3752] hover:border-blue-800/80',
    buttonText: 'text-blue-400/80 hover:text-blue-300',
    buttonHoverBg: 'hover:bg-blue-950/20',
  },
  {
    id: 'done',
    title: 'Done',
    dotColor: 'bg-[#4dab8a]',
    pillBg: 'bg-[#183324] dark:bg-[#14291e]',
    pillBorder: 'border-emerald-900/30',
    pillText: 'text-[#4dab8a]',
    buttonBorder: 'border-[#1d402e] hover:border-emerald-800/80',
    buttonText: 'text-emerald-400/80 hover:text-emerald-300',
    buttonHoverBg: 'hover:bg-emerald-950/20',
  },
];

interface KanbanBoardViewProps {
  items: UnifiedItem[];
  onEditHabit: (habit: Habit) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onArchiveHabit: (habitId: string, currentArchived: boolean) => void;
  onAddTask: (status?: BoardColumnId) => void;
  onOpenItem?: (item: UnifiedItem) => void;
  onMoveItem?: (itemId: string, newStatus: BoardColumnId) => void;
  onQuickAddTask?: (title: string, status: BoardColumnId) => void;
}

export function KanbanBoardView({
  items,
  onEditHabit,
  onEditTask,
  onDeleteTask,
  onArchiveHabit,
  onAddTask,
  onOpenItem,
  onMoveItem,
  onQuickAddTask,
}: KanbanBoardViewProps) {
  const [addingToCol, setAddingToCol] = useState<BoardColumnId | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [dragOverCol, setDragOverCol] = useState<BoardColumnId | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Distribute items into the 4 columns
  const columnData = useMemo(() => {
    return BOARD_COLUMNS.map((col) => {
      const colItems = items.filter((item) => {
        // If explicitly assigned status matches
        if (item.status) {
          return item.status === col.id;
        }
        // Fallback default mapping based on done state
        if (col.id === 'done') {
          return item.done;
        }
        if (col.id === 'not_started') {
          return !item.done;
        }
        return false;
      });

      return {
        ...col,
        items: colItems,
      };
    });
  }, [items]);

  const handleQuickSubmit = (colId: BoardColumnId) => {
    const trimmed = quickTitle.trim();
    if (!trimmed) {
      setAddingToCol(null);
      return;
    }

    if (onQuickAddTask) {
      onQuickAddTask(trimmed, colId);
    } else {
      onAddTask(colId);
    }

    setQuickTitle('');
    setAddingToCol(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8 items-start">
      {columnData.map((col) => (
        <div
          key={col.id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverCol(col.id);
          }}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOverCol(null);
            const itemId = e.dataTransfer.getData('text/plain');
            if (itemId && onMoveItem) {
              onMoveItem(itemId, col.id);
            }
          }}
          className={`flex flex-col space-y-3 min-h-[500px] p-2 rounded-2xl transition-colors ${
            dragOverCol === col.id
              ? 'bg-zinc-100/70 dark:bg-zinc-900/60 ring-2 ring-indigo-500/30'
              : 'bg-transparent'
          }`}
        >
          {/* Notion Column Header */}
          <div className="flex items-center gap-2 px-1 py-1 select-none">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${col.pillBg} ${col.pillBorder} ${col.pillText}`}
            >
              <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
              <span>{col.title}</span>
            </span>
            <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">
              {col.items.length}
            </span>
          </div>

          {/* Cards List */}
          <div className="space-y-2 flex-1">
            {col.items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', item.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => onOpenItem && onOpenItem(item)}
                className={`group relative flex items-center justify-between gap-2.5 p-3 rounded-xl bg-white dark:bg-[#191919] border border-zinc-200/90 dark:border-[#2a2a2a] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
                  item.done ? 'opacity-80' : ''
                }`}
              >
                {/* Left Document Icon + Title */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileText className="w-4 h-4 text-zinc-400 dark:text-zinc-400 stroke-[1.6] shrink-0" />
                  <span
                    className={`text-[13px] font-medium truncate ${
                      item.done
                        ? 'line-through text-zinc-400 dark:text-zinc-500'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                {/* Right Actions: Hover Notion OPEN Button & Menu */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenItem) onOpenItem(item);
                    }}
                    className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-2xs transition-opacity flex items-center gap-0.5 cursor-pointer"
                  >
                    <Maximize2 className="w-2.5 h-2.5" />
                    <span>OPEN</span>
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === item.id ? null : item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-opacity"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>

                    {/* Context Menu */}
                    {activeMenuId === item.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 p-1 text-xs animate-in fade-in zoom-in-95"
                      >
                        {/* Move To Submenu */}
                        <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Move to
                        </div>
                        {BOARD_COLUMNS.map((targetCol) => (
                          <button
                            key={targetCol.id}
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onMoveItem) onMoveItem(item.id, targetCol.id);
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                              item.status === targetCol.id
                                ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100'
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${targetCol.dotColor}`} />
                            <span>{targetCol.title}</span>
                          </button>
                        ))}

                        <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            if (item.type === 'habit' && item.originalHabit) {
                              onEditHabit(item.originalHabit);
                            } else if (item.originalTask) {
                              onEditTask(item.originalTask);
                            }
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3 text-zinc-400" />
                          <span>Edit</span>
                        </button>

                        {item.type === 'task' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDeleteTask(item.id);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 text-rose-500" />
                            <span>Delete</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onArchiveHabit(item.id, false);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 text-zinc-400" />
                            <span>Archive</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Inline Quick Add Input or Notion "+ New task" Button */}
          {addingToCol === col.id ? (
            <div className="p-2 rounded-xl bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 shadow-xs flex items-center gap-2 animate-in fade-in duration-100">
              <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Task title..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuickSubmit(col.id);
                  if (e.key === 'Escape') {
                    setAddingToCol(null);
                    setQuickTitle('');
                  }
                }}
                className="w-full text-xs sm:text-[13px] bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
              />
              <button
                type="button"
                onClick={() => handleQuickSubmit(col.id)}
                className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-xs shrink-0 cursor-pointer"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAddingToCol(col.id);
                setQuickTitle('');
              }}
              className={`w-full py-2 px-3 rounded-xl border border-dashed ${col.buttonBorder} ${col.buttonText} ${col.buttonHoverBg} text-xs font-medium flex items-center justify-start gap-1.5 transition-all cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New task</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

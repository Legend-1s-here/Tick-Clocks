'use client';

import { useState } from 'react';
import {
  Sparkles,
  CalendarDays,
  Globe,
  Bell,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';

interface NotionPageHeaderProps {
  selectedDate: Date;
  userTimezone: string;
  totalItems: number;
  completedItems: number;
  onOpenNewTask: () => void;
  onOpenNewHabit: () => void;
}

const EMOJI_OPTIONS = ['🎯', '⚡', '🔥', '🌱', '🚀', '🧠', '🧘', '📋', '✨', '🏆'];

const COVER_GRADIENTS = [
  'from-indigo-600 via-purple-600 to-pink-500',
  'from-amber-500 via-orange-600 to-rose-600',
  'from-emerald-500 via-teal-600 to-cyan-600',
  'from-blue-600 via-indigo-700 to-violet-800',
  'from-zinc-800 via-zinc-900 to-black',
];

export function NotionPageHeader({
  selectedDate,
  userTimezone,
  totalItems,
  completedItems,
}: NotionPageHeaderProps) {
  const [pageEmoji, setPageEmoji] = useState('🎯');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [coverIndex, setCoverIndex] = useState(0);
  const [showCover, setShowCover] = useState(true);
  const [showProperties, setShowProperties] = useState(true);

  const completionPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="relative group/cover mb-6">
      {/* 1. Notion Cover Banner */}
      {showCover && (
        <div
          className={`h-36 sm:h-44 w-full rounded-2xl bg-gradient-to-r ${COVER_GRADIENTS[coverIndex]} relative overflow-hidden transition-all duration-300 shadow-xs`}
        >
          <div className="absolute inset-0 bg-black/10 dark:bg-black/25 backdrop-blur-[1px]" />

          {/* Change cover button on hover */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCoverIndex((prev) => (prev + 1) % COVER_GRADIENTS.length)}
              className="px-2.5 py-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white text-[11px] font-medium backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-3 h-3" />
              <span>Change Cover</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCover(false)}
              className="px-2 py-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white text-[11px] font-medium backdrop-blur-md transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* 2. Notion Page Icon & Breadcrumbs */}
      <div className={`px-2 sm:px-4 ${showCover ? '-mt-9' : 'pt-2'}`}>
        {/* Page Icon (Emoji) */}
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white dark:bg-zinc-900 shadow-md border-2 border-white dark:border-zinc-800 flex items-center justify-center text-3xl sm:text-4xl hover:scale-105 transition-transform cursor-pointer"
            title="Change icon"
          >
            {pageEmoji}
          </button>

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-2 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 grid grid-cols-5 gap-1.5 animate-in fade-in zoom-in-95 duration-150">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setPageEmoji(emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="w-9 h-9 flex items-center justify-center text-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Page Title & Subtitle */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-zinc-600 dark:text-zinc-300">Habit & Task Tracker</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
            Daily Routine & Momentum
          </h1>
        </div>

        {/* 3. Notion Callout Block */}
        <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-zinc-50/90 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start gap-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          <div className="text-base select-none shrink-0 mt-0.5">💡</div>
          <div className="flex-1">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Daily Principle:</span>{' '}
            “We are what we repeatedly do. Excellence, then, is not an act, but a habit.”{' '}
            <span className="text-zinc-400">— Aristotle</span>
          </div>
        </div>

        {/* 4. Notion Page Properties Table (Collapsible) */}
        <div className="mt-4 border-t border-b border-zinc-200/70 dark:border-zinc-800/80 py-2.5">
          <button
            type="button"
            onClick={() => setShowProperties((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          >
            {showProperties ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span>Page Properties ({totalItems} items scheduled)</span>
          </button>

          {showProperties && (
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
              {/* Date Property */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <CalendarDays className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="text-zinc-400">Date:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {format(selectedDate, 'MMM d, yyyy')}
                </span>
              </div>

              {/* Timezone Property */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="text-zinc-400">Timezone:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {userTimezone}
                </span>
              </div>

              {/* Email Notifications Property */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-zinc-400">Alerts:</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>

              {/* Progress Property */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="text-zinc-400">Completion:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {completedItems}/{totalItems} ({completionPct}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

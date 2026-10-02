'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Flame, CheckCircle, Sparkles } from 'lucide-react';

interface ProgressRingProps {
  completed: number;
  total: number;
}

export function ProgressRing({ completed, total }: ProgressRingProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const prevPercentageRef = useRef(percentage);

  // Trigger subtle confetti celebration when reaching 100%
  useEffect(() => {
    if (percentage === 100 && total > 0 && prevPercentageRef.current < 100) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
          disableForReducedMotion: true,
        });
      } catch {
        // Safe fallback in non-browser or test environments
      }
    }
    prevPercentageRef.current = percentage;
  }, [percentage, total]);

  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Info */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-2">
            {percentage === 100 ? (
              <>
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>All caught up for today!</span>
              </>
            ) : (
              <>
                <Flame className="w-3 h-3 text-indigo-500" />
                <span>Daily Momentum</span>
              </>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
            {completed} of {total} completed
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {total === 0
              ? 'No items scheduled for this day yet.'
              : percentage === 100
              ? 'Incredible job! You achieved 100% consistency today.'
              : `${total - completed} items remaining today. Keep your momentum going!`}
          </p>
        </div>

        {/* Circular SVG Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="rotate-[-90deg]">
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-zinc-200 dark:text-zinc-800"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#progress-gradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {percentage === 100 ? (
              <CheckCircle className="w-7 h-7 text-emerald-500 animate-in zoom-in-75 duration-300" />
            ) : (
              <>
                <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {percentage}%
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">Done</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

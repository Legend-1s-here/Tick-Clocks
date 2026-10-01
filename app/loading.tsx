'use client';

// Global loading skeleton — shown by Next.js during any server component suspense
export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-32 rounded-md bg-zinc-100 dark:bg-zinc-900" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-24 rounded-xl bg-zinc-300 dark:bg-zinc-700" />
        </div>
      </div>

      {/* Progress ring skeleton */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-64 rounded-md bg-zinc-100 dark:bg-zinc-900" />
        </div>
        <div className="w-[120px] h-[120px] rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
      </div>

      {/* Habits section skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-32 rounded-md bg-zinc-200 dark:bg-zinc-800" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded-md bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-24 rounded-md bg-zinc-100 dark:bg-zinc-900" />
            </div>
            <div className="h-6 w-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0" />
          </div>
        ))}
      </div>

      {/* Tasks section skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-5 w-36 rounded-md bg-zinc-200 dark:bg-zinc-800" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="w-5 h-5 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0" />
            <div className="h-4 flex-1 rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-5 w-12 rounded-md bg-zinc-100 dark:bg-zinc-900 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

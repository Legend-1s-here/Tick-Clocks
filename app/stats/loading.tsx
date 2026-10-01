// Stats page loading skeleton
export default function StatsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-64 rounded-md bg-zinc-100 dark:bg-zinc-900" />
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3"
          >
            <div className="h-4 w-20 rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-8 w-16 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>

      {/* Heatmap skeleton */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
        <div className="h-5 w-32 rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      </div>

      {/* Habit stat cards */}
      {[1, 2].map((i) => (
        <div
          key={i}
          className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded-md bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-20 rounded-md bg-zinc-100 dark:bg-zinc-900" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
            ))}
          </div>
          <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        </div>
      ))}
    </div>
  );
}

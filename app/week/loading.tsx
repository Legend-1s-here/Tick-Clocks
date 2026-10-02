// Week page loading skeleton
export default function WeekLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-52 rounded-md bg-zinc-100 dark:bg-zinc-900" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-44 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-9 w-9 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-24 rounded-xl bg-zinc-300 dark:bg-zinc-700" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header row */}
        <div className="flex bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 gap-4">
          <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-8 w-10 rounded bg-zinc-200 dark:bg-zinc-700 mx-auto" />
          ))}
          <div className="h-4 w-10 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        {/* Data rows */}
        {[1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            className="flex items-center px-4 py-3 gap-4 border-b border-zinc-100 dark:border-zinc-800/60"
          >
            <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
            {[1, 2, 3, 4, 5, 6, 7].map((col) => (
              <div key={col} className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 mx-auto" />
            ))}
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

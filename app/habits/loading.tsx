// Habits page loading skeleton
export default function HabitsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="h-7 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-52 rounded-md bg-zinc-100 dark:bg-zinc-900" />
        </div>
        <div className="h-9 w-28 rounded-xl bg-zinc-300 dark:bg-zinc-700" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>

      {/* Habit cards */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
        >
          <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-32 rounded-md bg-zinc-100 dark:bg-zinc-900" />
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="h-7 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
          </div>
        </div>
      ))}
    </div>
  );
}

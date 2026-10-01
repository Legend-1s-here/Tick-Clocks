'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Global error boundary for unexpected runtime errors
export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to console in development; hook up to Sentry/Datadog in production
    console.error('[HabitFlow Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-rose-500" />
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-3">
        Something went wrong
      </p>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight">
        An unexpected error occurred
      </h1>

      <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mb-8 leading-relaxed">
        Don&apos;t worry — your habits and tasks are safe. Try refreshing this page or go back to
        the dashboard.
      </p>

      {error.digest && (
        <p className="text-[11px] font-mono text-zinc-400 mb-6 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg">
          Error ID: {error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-md shadow-indigo-500/20 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <a
          href="/today"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-semibold transition-colors cursor-pointer"
        >
          Back to Today
        </a>
      </div>
    </div>
  );
}

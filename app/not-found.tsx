import Link from 'next/link';
import { CheckCircle2, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      {/* Decorative icon */}
      <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10">
        <CheckCircle2 className="w-10 h-10 text-indigo-500" />
      </div>

      {/* Error code */}
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">
        404 — Page Not Found
      </p>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight">
        Oops, nothing here
      </h1>

      <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mb-8 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let&apos;s get
        you back on track.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-md shadow-indigo-500/20 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
        <Link
          href="/today"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Today
        </Link>
      </div>
    </div>
  );
}

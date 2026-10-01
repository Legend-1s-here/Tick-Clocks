import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Flame,
  Mail,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';

export default async function HomePage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect('/today');
    }
  } catch {
    // Continue to landing page if unauthenticated or env vars are placeholders
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 md:py-20 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Habit Tracker + Smart Email Reminders</span>
      </div>

      {/* Hero Title */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
        Build consistency.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          Never drop a streak.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
        HabitFlow tracks your daily habits, one-off checklist tasks, streaks, and sends timely
        email reminders so unfinished tasks never slip through the cracks.
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Link
          href="/auth/register"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Start Tracking Free</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/auth/login"
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium text-sm transition-colors text-zinc-800 dark:text-zinc-200"
        >
          Sign In
        </Link>
      </div>

      {/* Feature Grid */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base mb-1.5">Streaks & Heatmap</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Monitor current and best streaks, 7/30/90-day completion rates, and an interactive
            GitHub-style yearly heatmap per habit.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base mb-1.5">Intelligent Email Reminders</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Configure up to 3 slots daily. Only receive an email if you have pending items, with
            one-tap &ldquo;Mark done&rdquo; deep links.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base mb-1.5">Unified Today View</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            One clean dashboard for habits and daily tasks, smooth check-off animations, confetti on
            100% days, and keyboard shortcuts.
          </p>
        </div>
      </div>

      {/* Security & RLS notice */}
      <div className="mt-12 flex items-center gap-2 text-xs text-zinc-400">
        <Shield className="w-4 h-4 text-emerald-500" />
        <span>End-to-end data isolation with Supabase Row Level Security (RLS)</span>
      </div>
    </div>
  );
}

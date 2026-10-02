import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Flame,
  Mail,
  Calendar,
  ArrowRight,
  Shield,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  LayoutGrid,
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
    <div className="flex flex-col items-center justify-center py-8 md:py-16">
      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 mb-6">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        <span>Simple, deliberate habit tracking</span>
      </div>

      {/* Hero Headline */}
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 max-w-3xl text-center leading-[1.15]">
        Build habits that stick.
        <br />
        <span className="text-slate-500 dark:text-zinc-400">Never break the chain.</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl text-center leading-relaxed">
        HabitFlow combines a daily checklist, a 7-day printable-style weekly grid, streak
        heatmaps, and timely email reminders so your intentions turn into routine.
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Link
          href="/auth/register"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/auth/login"
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium text-sm transition-colors text-slate-800 dark:text-zinc-200"
        >
          Sign In
        </Link>
      </div>

      {/* Realistic Product Preview Card */}
      <div className="mt-14 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden text-left">
        {/* Card header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/60 dark:bg-zinc-900/60">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Today&apos;s Schedule
            </span>
            <p className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Saturday, October 3
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3 of 4 completed (75%)</span>
          </div>
        </div>

        {/* Habits list preview */}
        <div className="p-4 space-y-2.5 divide-y divide-slate-100 dark:divide-zinc-800/80">
          {/* Habit 1 - done */}
          <div className="pt-2.5 first:pt-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                  Morning 20m run
                </p>
                <span className="text-[11px] text-slate-400">Fitness • Daily</span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>14 days</span>
            </div>
          </div>

          {/* Habit 2 - done */}
          <div className="pt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                  Drink 2.5L water
                </p>
                <span className="text-[11px] text-slate-400">Health • Daily</span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>31 days</span>
            </div>
          </div>

          {/* Habit 3 - done */}
          <div className="pt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                  Read 20 pages
                </p>
                <span className="text-[11px] text-slate-400">Mindset • Daily</span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>8 days</span>
            </div>
          </div>

          {/* Habit 4 - pending */}
          <div className="pt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg border-2 border-indigo-400 dark:border-indigo-600 flex items-center justify-center" />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                  Evening review & plan tomorrow
                </p>
                <span className="text-[11px] text-slate-400">Productivity • Weekdays</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Reminder at 9:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Feature Grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <LayoutGrid className="w-4.5 h-4.5" />
          </div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 mb-1">
            Weekly Habit Grid
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            See your entire week at a glance with Mon–Sun checkboxes, day totals, and quick
            one-tap logging.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <Mail className="w-4.5 h-4.5" />
          </div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 mb-1">
            Smart Email Reminders
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Up to 3 slots daily in your timezone. If everything is done, no email is sent. Unfinished
            items include 1-click &ldquo;Mark Done&rdquo; links.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Calendar className="w-4.5 h-4.5" />
          </div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 mb-1">
            Streaks & 365-Day Heatmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Track current and best streaks, 7/30/90-day consistency percentages, and an interactive
            yearly activity heatmap.
          </p>
        </div>
      </div>

      {/* Security & RLS notice */}
      <div className="mt-10 flex items-center gap-2 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-emerald-500" />
        <span>End-to-end data isolation with PostgreSQL Row Level Security (RLS)</span>
      </div>
    </div>
  );
}

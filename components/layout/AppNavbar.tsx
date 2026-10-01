'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/actions/auth';
import {
  CheckCircle2,
  CalendarDays,
  Flame,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface AppNavbarProps {
  userEmail?: string | null;
}

export function AppNavbar({ userEmail }: AppNavbarProps) {
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith('/auth');
  if (isAuthPage) {
    return null;
  }

  const navLinks = [
    { href: '/today', label: 'Today', icon: CalendarDays },
    { href: '/habits', label: 'Habits', icon: Flame },
    { href: '/stats', label: 'Stats', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href={userEmail ? '/today' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              HabitFlow
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                PRO
              </span>
            </span>
          </div>
        </Link>

        {/* Navigation items if logged in */}
        {userEmail ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}

            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 sm:mx-2" />

            {/* Logout button */}
            <form action={signOut}>
              <button
                type="submit"
                title="Sign out"
                className="p-2 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </nav>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

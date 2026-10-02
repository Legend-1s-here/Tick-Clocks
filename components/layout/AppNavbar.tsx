'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/actions/auth';
import {
  CheckCircle2,
  CalendarDays,
  LayoutGrid,
  Flame,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

import { ThemeToggle } from './ThemeToggle';

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
    { href: '/week', label: 'Week', icon: LayoutGrid },
    { href: '/habits', label: 'Habits', icon: Flame },
    { href: '/stats', label: 'Stats', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-zinc-950/90 border-b border-slate-200/90 dark:border-zinc-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href={userEmail ? '/today' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20 group-hover:bg-indigo-700 transition-colors">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-zinc-50">
              HabitFlow
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

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-1" />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout button */}
            <form action={signOut}>
              <button
                type="submit"
                title="Sign out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </nav>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="text-xs font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { AppNavbar } from '@/components/layout/AppNavbar';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'HabitFlow — Production Habit Tracker & Daily Checklist',
  description:
    'Build unstoppable streaks, conquer daily tasks, and receive smart email reminders for unfinished items.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HabitFlow',
  },
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-192.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userEmail: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email || null;
  } catch {
    userEmail = null;
  }

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${inter.className} bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500/20 selection:text-indigo-400`}
      >
        <AppNavbar userEmail={userEmail} />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

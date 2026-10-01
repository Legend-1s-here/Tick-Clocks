import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isWithinReminderWindow } from '@/lib/logic/reminders';
import { calculateStreakStats } from '@/lib/logic/streaks';
import { renderWeeklySummaryEmailHtml } from '@/lib/email/summaryTemplates';
import { sendEmail } from '@/lib/email/send';
import { parseISO, subDays, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

function verifyCronSecret(request: Request): boolean {
  const expectedSecret = process.env.CRON_SECRET || 'deadstock-local-cron-secret-2026';
  const authHeader = request.headers.get('authorization');
  const customHeader = request.headers.get('x-cron-secret');
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');

  if (authHeader && authHeader.replace(/^Bearer\s+/i, '') === expectedSecret) {
    return true;
  }
  if (customHeader === expectedSecret) {
    return true;
  }
  if (querySecret === expectedSecret) {
    return true;
  }
  return false;
}

export async function POST(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // 1. Fetch eligible users (email enabled + weekly summary enabled)
  const { data: eligibleUsers, error } = await supabase
    .from('user_settings')
    .select('user_id, weekly_summary, email_enabled')
    .eq('email_enabled', true)
    .eq('weekly_summary', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const stats = {
    totalEligible: eligibleUsers?.length || 0,
    matchingSundayWindow: 0,
    sentEmails: 0,
    alreadyLogged: 0,
    errors: [] as string[],
  };

  for (const item of eligibleUsers || []) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, timezone')
        .eq('id', item.user_id)
        .single();

      if (!profile || !profile.email) continue;

      const userTimezone = profile.timezone || 'UTC';
      const zonedNow = toZonedTime(now, userTimezone);

      // Must be Sunday (day === 0)
      if (zonedNow.getDay() !== 0) {
        continue;
      }

      // Weekly evening slot: 20:00 local time
      const windowCheck = isWithinReminderWindow('20:00', userTimezone, now, 15);
      if (!windowCheck.isWithinWindow) continue;

      stats.matchingSundayWindow++;
      const localDate = windowCheck.localDate;

      // Check if already sent weekly summary this Sunday
      const { data: existingLog } = await supabase
        .from('reminder_log')
        .select('id')
        .eq('user_id', profile.id)
        .eq('local_date', localDate)
        .eq('slot', 'weekly')
        .maybeSingle();

      if (existingLog) {
        stats.alreadyLogged++;
        continue;
      }

      // Fetch active habits
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', profile.id)
        .eq('archived', false);

      const activeHabits = habits || [];
      if (activeHabits.length === 0) continue;

      // Fetch logs for the past 7 days
      const startDateStr = format(subDays(parseISO(localDate), 7), 'yyyy-MM-dd');
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', profile.id)
        .gte('log_date', startDateStr);

      const weekLogs = logs || [];

      // Calculate aggregated metrics
      let sum7dRate = 0;
      let topStreak = 0;
      const missedHabitNames: string[] = [];

      activeHabits.forEach((habit) => {
        const hLogs = weekLogs.filter((l) => l.habit_id === habit.id);
        const s = calculateStreakStats(habit, hLogs, parseISO(localDate));

        sum7dRate += s.completionRate7d;
        if (s.currentStreak > topStreak) {
          topStreak = s.currentStreak;
        }

        if (s.completionRate7d < 60) {
          missedHabitNames.push(`${habit.title} (${s.completionRate7d}% completed)`);
        }
      });

      const avgCompletionRate = Math.round(sum7dRate / activeHabits.length);

      const { subject, html } = renderWeeklySummaryEmailHtml({
        userEmail: profile.email,
        completionRate7d: avgCompletionRate,
        totalCompletions: weekLogs.length,
        bestStreak: topStreak,
        missedHabits: missedHabitNames,
        appUrl,
      });

      const sendRes = await sendEmail({
        to: profile.email,
        subject,
        html,
      });

      if (sendRes.success) {
        await supabase.from('reminder_log').insert({
          user_id: profile.id,
          local_date: localDate,
          slot: 'weekly',
        });
        stats.sentEmails++;
      } else {
        stats.errors.push(`Failed weekly email to ${profile.email}: ${sendRes.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown weekly summary error';
      stats.errors.push(msg);
    }
  }

  return NextResponse.json({ success: true, stats, timestamp: now.toISOString() });
}

export async function GET(request: Request) {
  return POST(request);
}

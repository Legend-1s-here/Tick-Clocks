import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isWithinReminderWindow } from '@/lib/logic/reminders';
import { isHabitScheduledOnDate } from '@/lib/logic/streaks';
import { renderMorningEmailHtml } from '@/lib/email/summaryTemplates';
import { sendEmail } from '@/lib/email/send';
import { parseISO } from 'date-fns';

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

  // 1. Fetch eligible users (email enabled + morning email enabled)
  const { data: eligibleUsers, error } = await supabase
    .from('user_settings')
    .select('user_id, morning_email, email_enabled')
    .eq('email_enabled', true)
    .eq('morning_email', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const stats = {
    totalEligible: eligibleUsers?.length || 0,
    matchingMorningWindow: 0,
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
      // Morning window: 08:00 local time
      const windowCheck = isWithinReminderWindow('08:00', userTimezone, now, 15);
      if (!windowCheck.isWithinWindow) continue;

      stats.matchingMorningWindow++;
      const localDate = windowCheck.localDate;

      // Check if already sent morning email today
      const { data: existingLog } = await supabase
        .from('reminder_log')
        .select('id')
        .eq('user_id', profile.id)
        .eq('local_date', localDate)
        .eq('slot', 'morning')
        .maybeSingle();

      if (existingLog) {
        stats.alreadyLogged++;
        continue;
      }

      // Fetch active habits scheduled for today
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', profile.id)
        .eq('archived', false);

      const localDateObj = parseISO(localDate);
      const scheduledHabits = (habits || []).filter((h) =>
        isHabitScheduledOnDate(h, localDateObj)
      );

      // Fetch tasks due today
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', profile.id)
        .eq('due_date', localDate);

      // If user has anything scheduled, send the morning plan
      if (scheduledHabits.length > 0 || (tasks && tasks.length > 0)) {
        const { subject, html } = renderMorningEmailHtml({
          userEmail: profile.email,
          dateStr: localDate,
          scheduledHabits,
          tasksDueToday: tasks || [],
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
            slot: 'morning',
          });
          stats.sentEmails++;
        } else {
          stats.errors.push(`Failed to send morning email to ${profile.email}: ${sendRes.error}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown morning reminder error';
      stats.errors.push(msg);
    }
  }

  return NextResponse.json({ success: true, stats, timestamp: now.toISOString() });
}

export async function GET(request: Request) {
  return POST(request);
}

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMatchingReminderSlots } from '@/lib/logic/reminders';
import { isHabitScheduledOnDate } from '@/lib/logic/streaks';
import { renderReminderEmailHtml } from '@/lib/email/templates';
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

async function handleRemindersCron(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // 1. Fetch all users who have email reminders enabled
  const { data: eligibleSettings, error: settingsError } = await supabase
    .from('user_settings')
    .select('user_id, reminder_times, email_enabled')
    .eq('email_enabled', true);

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  const stats = {
    totalEligibleUsers: eligibleSettings?.length || 0,
    matchingSlotsFound: 0,
    emailsSent: 0,
    skippedAllComplete: 0,
    alreadyLogged: 0,
    errors: [] as string[],
  };

  for (const setting of eligibleSettings || []) {
    try {
      // Fetch user profile for email & timezone
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, timezone')
        .eq('id', setting.user_id)
        .single();

      if (!profile || !profile.email) continue;

      const userTimezone = profile.timezone || 'UTC';
      const reminderTimes = setting.reminder_times || [];

      // Check which slots fall into the 15-minute window for this user
      const { matchingSlots, localDate } = getMatchingReminderSlots(reminderTimes, userTimezone, now);

      if (matchingSlots.length === 0) continue;

      stats.matchingSlotsFound += matchingSlots.length;
      const localDateObj = parseISO(localDate);

      for (const slot of matchingSlots) {
        // Check if already sent for this slot today
        const { data: existingLog } = await supabase
          .from('reminder_log')
          .select('id')
          .eq('user_id', profile.id)
          .eq('local_date', localDate)
          .eq('slot', slot)
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

        // Filter habits scheduled for today
        const scheduledToday = (habits || []).filter((h) =>
          isHabitScheduledOnDate(h, localDateObj)
        );

        // Fetch habit logs for today
        const { data: todayLogs } = await supabase
          .from('habit_logs')
          .select('habit_id')
          .eq('user_id', profile.id)
          .eq('log_date', localDate);

        const completedHabitIds = new Set((todayLogs || []).map((l) => l.habit_id));
        const pendingHabits = scheduledToday.filter((h) => !completedHabitIds.has(h.id));

        // Fetch pending tasks for today
        const { data: pendingTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', profile.id)
          .eq('due_date', localDate)
          .eq('done', false);

        const tasksLeft = pendingTasks || [];

        // If everything is complete, send nothing
        if (pendingHabits.length === 0 && tasksLeft.length === 0) {
          stats.skippedAllComplete++;
          continue;
        }

        // Render email template
        const { subject, html } = renderReminderEmailHtml({
          userEmail: profile.email,
          userId: profile.id,
          dateStr: localDate,
          pendingHabits,
          pendingTasks: tasksLeft,
          appUrl,
        });

        // Send email
        const sendResult = await sendEmail({
          to: profile.email,
          subject,
          html,
        });

        if (sendResult.success) {
          // Log into reminder_log only after successful delivery
          await supabase.from('reminder_log').insert({
            user_id: profile.id,
            local_date: localDate,
            slot,
          });
          stats.emailsSent++;
        } else {
          stats.errors.push(`Failed sending to ${profile.email}: ${sendResult.error}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'User reminder failed';
      stats.errors.push(msg);
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    stats,
  });
}

export async function POST(request: Request) {
  return handleRemindersCron(request);
}

export async function GET(request: Request) {
  return handleRemindersCron(request);
}

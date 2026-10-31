import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isWithinReminderWindow } from '@/lib/logic/reminders';
import { isHabitScheduledOnDate } from '@/lib/logic/streaks';
import { renderReminderEmailHtml } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

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
      let validTz = userTimezone;
      try {
        Intl.DateTimeFormat(undefined, { timeZone: userTimezone });
      } catch {
        validTz = 'UTC';
      }

      const localDate = formatInTimeZone(now, validTz, 'yyyy-MM-dd');
      const localDateObj = parseISO(localDate);

      // Fetch pending tasks due on or before today where email reminder is enabled
      const { data: pendingTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', profile.id)
        .lte('due_date', localDate)
        .eq('done', false)
        .neq('email_reminder', false);

      const tasksLeft = pendingTasks || [];

      // Determine which reminder slots match right now
      // 1. User general reminder slots (e.g. ['18:00', '21:00'])
      const reminderTimes = setting.reminder_times || [];
      const matchingGeneralSlots: string[] = [];
      for (const slot of reminderTimes) {
        const check = isWithinReminderWindow(slot, validTz, now);
        if (check.isWithinWindow) {
          matchingGeneralSlots.push(slot);
        }
      }

      // 2. Specific due times from pending tasks due today
      const matchingTaskSlots: { slotKey: string; task: typeof tasksLeft[0] }[] = [];
      for (const task of tasksLeft) {
        if (task.due_time) {
          const check = isWithinReminderWindow(task.due_time, validTz, now);
          if (check.isWithinWindow) {
            matchingTaskSlots.push({
              slotKey: `task-${task.id}`,
              task,
            });
          }
        }
      }

      if (matchingGeneralSlots.length === 0 && matchingTaskSlots.length === 0) {
        continue;
      }

      // Check which of these slots haven't been logged yet today
      const allCandidateSlotKeys = [
        ...matchingGeneralSlots,
        ...matchingTaskSlots.map((m) => m.slotKey),
      ];

      const { data: existingLogs } = await supabase
        .from('reminder_log')
        .select('slot')
        .eq('user_id', profile.id)
        .eq('local_date', localDate)
        .in('slot', allCandidateSlotKeys);

      const existingSlotSet = new Set((existingLogs || []).map((l) => l.slot));
      const unloggedSlots = allCandidateSlotKeys.filter((s) => !existingSlotSet.has(s));

      if (unloggedSlots.length === 0) {
        stats.alreadyLogged += allCandidateSlotKeys.length;
        continue;
      }

      stats.matchingSlotsFound += unloggedSlots.length;

      // Fetch active habits where email reminder is enabled
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', profile.id)
        .eq('archived', false)
        .neq('email_reminder', false);

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

      // If everything is complete, mark slots as logged so we don't re-trigger today
      if (pendingHabits.length === 0 && tasksLeft.length === 0) {
        stats.skippedAllComplete++;
        for (const slot of unloggedSlots) {
          await supabase.from('reminder_log').insert({
            user_id: profile.id,
            local_date: localDate,
            slot,
          });
        }
        continue;
      }

      // Determine appropriate subject line
      let customSubject: string | undefined;
      const unloggedTaskMatch = matchingTaskSlots.find((m) => unloggedSlots.includes(m.slotKey));
      if (unloggedTaskMatch) {
        customSubject = `⏰ Task Due: "${unloggedTaskMatch.task.title}" is scheduled now`;
      }

      // Render email template
      const { subject, html } = renderReminderEmailHtml({
        userEmail: profile.email,
        userId: profile.id,
        dateStr: localDate,
        pendingHabits,
        pendingTasks: tasksLeft,
        appUrl,
        customSubject,
      });

      // Send email via Resend
      const sendResult = await sendEmail({
        to: profile.email,
        subject,
        html,
      });

      if (sendResult.success) {
        // Log all fulfilled slots into reminder_log only after successful delivery
        for (const slot of unloggedSlots) {
          await supabase.from('reminder_log').insert({
            user_id: profile.id,
            local_date: localDate,
            slot,
          });
        }
        stats.emailsSent++;
      } else {
        stats.errors.push(`Failed sending to ${profile.email}: ${sendResult.error}`);
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

import { Habit, Task } from '@/types/database';

interface MorningEmailProps {
  userEmail: string;
  dateStr: string;
  scheduledHabits: Habit[];
  tasksDueToday: Task[];
  appUrl: string;
}

export function renderMorningEmailHtml({
  userEmail,
  dateStr,
  scheduledHabits,
  tasksDueToday,
  appUrl,
}: MorningEmailProps): { subject: string; html: string } {
  const totalItems = scheduledHabits.length + tasksDueToday.length;
  const subject = `🌅 Good morning! Your plan for today (${totalItems} item${totalItems === 1 ? '' : 's'})`;

  const habitItemsHtml = scheduledHabits
    .map(
      (habit) => `
      <tr style="border-bottom: 1px solid #f4f4f5;">
        <td style="padding: 10px 0;">
          <div style="font-weight: 600; font-size: 14px; color: #18181b;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${habit.color || '#6366f1'}; margin-right: 8px;"></span>
            ${habit.title}
          </div>
          <div style="font-size: 11px; color: #a1a1aa; margin-top: 2px; text-transform: uppercase;">
            ${habit.category}
          </div>
        </td>
      </tr>
    `
    )
    .join('');

  const taskItemsHtml = tasksDueToday
    .map(
      (task) => `
      <tr style="border-bottom: 1px solid #f4f4f5;">
        <td style="padding: 10px 0;">
          <div style="font-weight: 600; font-size: 14px; color: #18181b;">
            ◻ ${task.title}
          </div>
          <div style="font-size: 11px; color: #71717a; margin-top: 2px;">
            ${task.priority.toUpperCase()} priority ${task.due_time ? `• ${task.due_time}` : ''}
          </div>
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; padding: 32px;">
                <!-- Header -->
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #f59e0b; color: #ffffff; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-bottom: 12px;">
                      MORNING AGENDA
                    </div>
                    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #18181b;">
                      Make today count.
                    </h1>
                    <p style="margin: 0 0 24px 0; font-size: 14px; color: #52525b; line-height: 1.5;">
                      Here is what is scheduled for you today. Win the morning, win the day!
                    </p>
                  </td>
                </tr>

                <!-- Habits List -->
                ${
                  scheduledHabits.length > 0
                    ? `
                  <tr>
                    <td>
                      <div style="font-size: 12px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                        Habits to Complete (${scheduledHabits.length})
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                        ${habitItemsHtml}
                      </table>
                    </td>
                  </tr>
                `
                    : ''
                }

                <!-- Tasks List -->
                ${
                  tasksDueToday.length > 0
                    ? `
                  <tr>
                    <td>
                      <div style="font-size: 12px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                        Checklist Tasks (${tasksDueToday.length})
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                        ${taskItemsHtml}
                      </table>
                    </td>
                  </tr>
                `
                    : ''
                }

                <!-- Button -->
                <tr>
                  <td align="center" style="padding-top: 12px; padding-bottom: 24px;">
                    <a href="${appUrl}/today" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
                      Open Today's View →
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="border-top: 1px solid #e4e4e7; padding-top: 20px; font-size: 11px; color: #a1a1aa; text-align: center; line-height: 1.5;">
                    Sent to ${userEmail} on ${dateStr} by HabitFlow because Morning Plan Email is enabled.<br>
                    <a href="${appUrl}/settings" style="color: #6366f1; text-decoration: underline;">Change notification settings</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return { subject, html };
}

interface WeeklySummaryEmailProps {
  userEmail: string;
  completionRate7d: number;
  totalCompletions: number;
  bestStreak: number;
  missedHabits: string[];
  appUrl: string;
}

export function renderWeeklySummaryEmailHtml({
  userEmail,
  completionRate7d,
  totalCompletions,
  bestStreak,
  missedHabits,
  appUrl,
}: WeeklySummaryEmailProps): { subject: string; html: string } {
  const subject = `📊 Your Weekly Habit Summary: ${completionRate7d}% consistency`;

  const missedHabitsHtml =
    missedHabits.length > 0
      ? missedHabits
          .map(
            (name) => `
            <li style="margin-bottom: 4px; color: #71717a; font-size: 13px;">
              ${name}
            </li>
          `
          )
          .join('')
      : '<li style="color: #10b981; font-size: 13px;">None! You completed all scheduled habits. 🎉</li>';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; padding: 32px;">
                <!-- Header -->
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #8b5cf6; color: #ffffff; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-bottom: 12px;">
                      WEEKLY RETROSPECTIVE
                    </div>
                    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #18181b;">
                      Here is how you did this week
                    </h1>
                    <p style="margin: 0 0 24px 0; font-size: 14px; color: #52525b; line-height: 1.5;">
                      Reflect on your progress over the past 7 days and set your intentions for the week ahead.
                    </p>
                  </td>
                </tr>

                <!-- Metrics Cards -->
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td width="33%" style="padding: 16px; background-color: #f4f4f5; border-radius: 12px; text-align: center;">
                          <div style="font-size: 11px; color: #71717a; font-weight: 600; text-transform: uppercase;">Completion</div>
                          <div style="font-size: 22px; font-weight: 800; color: #4f46e5; margin-top: 4px;">${completionRate7d}%</div>
                        </td>
                        <td width="4%"></td>
                        <td width="33%" style="padding: 16px; background-color: #f4f4f5; border-radius: 12px; text-align: center;">
                          <div style="font-size: 11px; color: #71717a; font-weight: 600; text-transform: uppercase;">Check-ins</div>
                          <div style="font-size: 22px; font-weight: 800; color: #10b981; margin-top: 4px;">${totalCompletions}</div>
                        </td>
                        <td width="4%"></td>
                        <td width="33%" style="padding: 16px; background-color: #f4f4f5; border-radius: 12px; text-align: center;">
                          <div style="font-size: 11px; color: #71717a; font-weight: 600; text-transform: uppercase;">Top Streak</div>
                          <div style="font-size: 22px; font-weight: 800; color: #f59e0b; margin-top: 4px;">${bestStreak}d</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Habits to improve -->
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                      Habits to Focus on Next Week
                    </div>
                    <ul style="padding-left: 20px; margin: 0 0 24px 0;">
                      ${missedHabitsHtml}
                    </ul>
                  </td>
                </tr>

                <!-- Main CTA -->
                <tr>
                  <td align="center" style="padding-top: 12px; padding-bottom: 24px;">
                    <a href="${appUrl}/stats" style="background-color: #18181b; color: #ffffff; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
                      View Full Analytics & Heatmaps →
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="border-top: 1px solid #e4e4e7; padding-top: 20px; font-size: 11px; color: #a1a1aa; text-align: center; line-height: 1.5;">
                    Sent to ${userEmail} by HabitFlow because Weekly Summary Email is enabled.<br>
                    <a href="${appUrl}/settings" style="color: #6366f1; text-decoration: underline;">Change notification settings</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return { subject, html };
}

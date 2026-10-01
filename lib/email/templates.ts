import { Habit, Task } from '@/types/database';
import { generateMarkDoneToken } from './tokens';

interface ReminderEmailProps {
  userEmail: string;
  userId: string;
  dateStr: string;
  pendingHabits: Habit[];
  pendingTasks: Task[];
  appUrl: string;
}

export function renderReminderEmailHtml({
  userEmail,
  userId,
  dateStr,
  pendingHabits,
  pendingTasks,
  appUrl,
}: ReminderEmailProps): { subject: string; html: string } {
  const totalPending = pendingHabits.length + pendingTasks.length;
  const subject = `⏰ You have ${totalPending} incomplete item${totalPending > 1 ? 's' : ''} left for today`;

  const habitItemsHtml = pendingHabits
    .map((habit) => {
      const token = generateMarkDoneToken(userId, habit.id, dateStr);
      const markDoneUrl = `${appUrl}/api/mark-done?type=habit&id=${habit.id}&userId=${userId}&date=${dateStr}&token=${token}`;

      return `
        <tr style="border-bottom: 1px solid #e4e4e7;">
          <td style="padding: 12px 0;">
            <div style="font-weight: 600; font-size: 14px; color: #18181b;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${habit.color || '#6366f1'}; margin-right: 8px;"></span>
              ${habit.title}
            </div>
            ${habit.description ? `<div style="font-size: 12px; color: #71717a; margin-top: 2px;">${habit.description}</div>` : ''}
            <div style="font-size: 11px; color: #a1a1aa; margin-top: 2px; text-transform: uppercase;">${habit.category}</div>
          </td>
          <td style="padding: 12px 0; text-align: right; vertical-align: middle;">
            <a href="${markDoneUrl}" style="background-color: #10b981; color: #ffffff; padding: 6px 12px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 600; display: inline-block;">
              ✓ Mark done
            </a>
          </td>
        </tr>
      `;
    })
    .join('');

  const taskItemsHtml = pendingTasks
    .map((task) => {
      const token = generateMarkDoneToken(userId, task.id, dateStr);
      const markDoneUrl = `${appUrl}/api/mark-done?type=task&id=${task.id}&userId=${userId}&date=${dateStr}&token=${token}`;
      const priorityColor = task.priority === 'high' ? '#e11d48' : task.priority === 'medium' ? '#d97706' : '#2563eb';

      return `
        <tr style="border-bottom: 1px solid #e4e4e7;">
          <td style="padding: 12px 0;">
            <div style="font-weight: 600; font-size: 14px; color: #18181b;">
              ${task.title}
            </div>
            <div style="font-size: 11px; color: ${priorityColor}; margin-top: 2px; text-transform: uppercase; font-weight: 600;">
              ${task.priority} priority ${task.due_time ? `• Due at ${task.due_time}` : ''}
            </div>
          </td>
          <td style="padding: 12px 0; text-align: right; vertical-align: middle;">
            <a href="${markDoneUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 6px 12px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 600; display: inline-block;">
              ✓ Mark done
            </a>
          </td>
        </tr>
      `;
    })
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
                    <div style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-bottom: 12px;">
                      HABITFLOW REMINDER
                    </div>
                    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #18181b;">
                      Keep your streak alive today!
                    </h1>
                    <p style="margin: 0 0 24px 0; font-size: 14px; color: #52525b; line-height: 1.5;">
                      Here are the scheduled items that are still waiting for you today. Tap <strong>Mark done</strong> to check them off instantly.
                    </p>
                  </td>
                </tr>

                <!-- Habits List -->
                ${
                  pendingHabits.length > 0
                    ? `
                  <tr>
                    <td>
                      <div style="font-size: 12px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                        Pending Habits (${pendingHabits.length})
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
                  pendingTasks.length > 0
                    ? `
                  <tr>
                    <td>
                      <div style="font-size: 12px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                        Pending Daily Tasks (${pendingTasks.length})
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                        ${taskItemsHtml}
                      </table>
                    </td>
                  </tr>
                `
                    : ''
                }

                <!-- Main CTA -->
                <tr>
                  <td align="center" style="padding-top: 12px; padding-bottom: 24px;">
                    <a href="${appUrl}/today" style="background-color: #18181b; color: #ffffff; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
                      Open HabitFlow Dashboard →
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="border-top: 1px solid #e4e4e7; padding-top: 20px; font-size: 11px; color: #a1a1aa; text-align: center; line-height: 1.5;">
                    You are receiving this at ${userEmail} because email reminders are enabled on your account.<br>
                    <a href="${appUrl}/settings" style="color: #6366f1; text-decoration: underline;">Configure notification times or unsubscribe</a>
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

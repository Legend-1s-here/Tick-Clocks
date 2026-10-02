import { NextResponse } from 'next/server';
import { renderReminderEmailHtml } from '@/lib/email/templates';
import { renderMorningEmailHtml, renderWeeklySummaryEmailHtml } from '@/lib/email/summaryTemplates';
import { Habit, Task } from '@/types/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'reminder';

  const mockHabits: Habit[] = [
    {
      id: 'habit-1',
      user_id: 'sample',
      title: 'Morning 20m run',
      description: 'Cardio workout',
      category: 'Health',
      color: '#10b981',
      frequency_type: 'daily',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      target_per_week: 7,
      archived: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'habit-2',
      user_id: 'sample',
      title: 'Read 20 pages',
      description: 'Atomic Habits',
      category: 'Learning',
      color: '#6366f1',
      frequency_type: 'daily',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      target_per_week: 7,
      archived: false,
      created_at: new Date().toISOString(),
    },
  ];

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      user_id: 'sample',
      title: 'Review team weekly update',
      due_date: new Date().toISOString().split('T')[0],
      due_time: '18:00',
      priority: 'high',
      done: false,
      done_at: null,
      created_at: new Date().toISOString(),
    },
  ];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  let emailSubject = '';
  let emailHtml = '';

  if (type === 'morning') {
    const rendered = renderMorningEmailHtml({
      userEmail: 'you@example.com',
      dateStr: new Date().toISOString().split('T')[0],
      scheduledHabits: mockHabits,
      tasksDueToday: mockTasks,
      appUrl,
    });
    emailSubject = rendered.subject;
    emailHtml = rendered.html;
  } else if (type === 'weekly') {
    const rendered = renderWeeklySummaryEmailHtml({
      userEmail: 'you@example.com',
      completionRate7d: 86,
      totalCompletions: 18,
      bestStreak: 14,
      missedHabits: ['Evening meditation'],
      appUrl,
    });
    emailSubject = rendered.subject;
    emailHtml = rendered.html;
  } else {
    const rendered = renderReminderEmailHtml({
      userEmail: 'you@example.com',
      userId: 'sample-user-id',
      dateStr: new Date().toISOString().split('T')[0],
      pendingHabits: mockHabits,
      pendingTasks: mockTasks,
      appUrl,
    });
    emailSubject = rendered.subject;
    emailHtml = rendered.html;
  }

  return new NextResponse(emailHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Email-Subject': encodeURIComponent(emailSubject),
    },
  });
}

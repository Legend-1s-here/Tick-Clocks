import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TodayClient } from '@/components/today/TodayClient';
import { format, subDays } from 'date-fns';

export const metadata = {
  title: 'Today — HabitFlow',
};

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 1. Fetch user profile & settings
  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
  ]);

  const userTimezone = profile?.timezone || 'UTC';
  const rolloverEnabled = settings?.rollover_tasks || false;

  // 2. Fetch all habits for user
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  // 3. Fetch habit logs for past 90 days (for streaks and today's status)
  const startDateStr = format(subDays(new Date(), 90), 'yyyy-MM-dd');
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('log_date', startDateStr);

  // 4. Fetch all tasks for user
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true });

  return (
    <TodayClient
      initialHabits={habits || []}
      initialLogs={logs || []}
      initialTasks={tasks || []}
      userTimezone={userTimezone}
      rolloverEnabled={rolloverEnabled}
    />
  );
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WeeklyGridClient } from '@/components/week/WeeklyGridClient';
import { format, subDays } from 'date-fns';

export const metadata = {
  title: 'Weekly Tracker — HabitFlow',
};

export default async function WeekPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all active habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  // Fetch habit logs for past 30 days (enough to cover 4 weeks back)
  const startDateStr = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('log_date', startDateStr);

  return (
    <WeeklyGridClient
      initialHabits={habits || []}
      initialLogs={logs || []}
    />
  );
}

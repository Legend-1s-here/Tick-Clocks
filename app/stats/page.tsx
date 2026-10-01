import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StatsClient } from '@/components/stats/StatsClient';
import { format, subDays } from 'date-fns';

export const metadata = {
  title: 'Streaks & Stats — HabitFlow',
};

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch logs for the past 365 days
  const startDateStr = format(subDays(new Date(), 365), 'yyyy-MM-dd');
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('log_date', startDateStr);

  return <StatsClient habits={habits || []} logs={logs || []} />;
}

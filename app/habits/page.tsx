import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HabitsManager } from '@/components/habits/HabitsManager';

export const metadata = {
  title: 'Manage Habits — HabitFlow',
};

export default async function HabitsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all habits (including archived)
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch habit logs for past 30 days
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id);

  return <HabitsManager initialHabits={habits || []} initialLogs={logs || []} />;
}

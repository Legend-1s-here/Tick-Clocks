import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from '@/components/settings/SettingsClient';
import { Profile, UserSettings } from '@/types/database';

export const metadata = {
  title: 'Settings — HabitFlow',
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch profile and user settings
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    const defaultProfile = {
      id: user.id,
      email: user.email || '',
      timezone: 'UTC',
    };
    await supabase.from('profiles').insert(defaultProfile);
    profile = { ...defaultProfile, created_at: new Date().toISOString() };
  }

  let { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!settings) {
    const defaultSettings = {
      user_id: user.id,
      reminder_times: ['18:00', '21:00'],
      email_enabled: true,
      morning_email: true,
      weekly_summary: true,
      rollover_tasks: false,
    };
    await supabase.from('user_settings').insert(defaultSettings);
    settings = {
      ...defaultSettings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return (
    <SettingsClient
      initialProfile={profile as Profile}
      initialSettings={settings as UserSettings}
    />
  );
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { settingsSchema, SettingsInput } from '@/lib/validations/settings';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ActionResponse } from './habits';

export async function updateUserSettings(input: SettingsInput): Promise<ActionResponse> {
  const validated = settingsSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || 'Invalid settings',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // 1. Update profile timezone
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ timezone: validated.data.timezone })
    .eq('id', user.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  // 2. Update user_settings
  const { error: settingsError } = await supabase
    .from('user_settings')
    .upsert({
      user_id: user.id,
      reminder_times: validated.data.reminder_times,
      email_enabled: validated.data.email_enabled,
      morning_email: validated.data.morning_email,
      weekly_summary: validated.data.weekly_summary,
      rollover_tasks: validated.data.rollover_tasks,
      updated_at: new Date().toISOString(),
    });

  if (settingsError) {
    return { success: false, error: settingsError.message };
  }

  revalidatePath('/settings');
  revalidatePath('/today');
  return { success: true };
}

export async function exportUserData(): Promise<ActionResponse<{ jsonString: string; csvHabits: string; csvTasks: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Fetch all user data
  const [
    { data: profile },
    { data: settings },
    { data: habits },
    { data: logs },
    { data: tasks },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
    supabase.from('habits').select('*').eq('user_id', user.id),
    supabase.from('habit_logs').select('*').eq('user_id', user.id),
    supabase.from('tasks').select('*').eq('user_id', user.id),
  ]);

  const fullData = {
    exportedAt: new Date().toISOString(),
    profile,
    settings,
    habits: habits || [],
    logs: logs || [],
    tasks: tasks || [],
  };

  const jsonString = JSON.stringify(fullData, null, 2);

  // Generate CSV for Habits + Logs
  const habitMap = new Map((habits || []).map((h) => [h.id, h.title]));
  let csvHabits = 'Habit ID,Habit Title,Log Date,Completed At\n';
  (logs || []).forEach((l) => {
    const title = (habitMap.get(l.habit_id) || 'Unknown').replace(/"/g, '""');
    csvHabits += `"${l.habit_id}","${title}","${l.log_date}","${l.completed_at}"\n`;
  });

  // Generate CSV for Tasks
  let csvTasks = 'Task ID,Title,Due Date,Due Time,Priority,Done,Done At\n';
  (tasks || []).forEach((t) => {
    const title = t.title.replace(/"/g, '""');
    csvTasks += `"${t.id}","${title}","${t.due_date}","${t.due_time || ''}","${t.priority}","${t.done}","${t.done_at || ''}"\n`;
  });

  return {
    success: true,
    data: {
      jsonString,
      csvHabits,
      csvTasks,
    },
  };
}

export async function deleteAccount(): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Delete all user related data
  await supabase.from('habit_logs').delete().eq('user_id', user.id);
  await supabase.from('habits').delete().eq('user_id', user.id);
  await supabase.from('tasks').delete().eq('user_id', user.id);
  await supabase.from('reminder_log').delete().eq('user_id', user.id);
  await supabase.from('user_settings').delete().eq('user_id', user.id);
  await supabase.from('profiles').delete().eq('id', user.id);

  // Attempt admin user deletion if service role key is available
  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(user.id);
  } catch {
    // If running with standard key, signOut
  }

  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/auth/login?message=Account deleted successfully');
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { habitSchema, HabitInput } from '@/lib/validations/habits';
import { revalidatePath } from 'next/cache';

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createHabit(input: HabitInput): Promise<ActionResponse> {
  const validated = habitSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || 'Invalid habit data',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase.from('habits').insert({
    user_id: user.id,
    title: validated.data.title,
    description: validated.data.description || null,
    category: validated.data.category,
    color: validated.data.color,
    frequency_type: validated.data.frequency_type,
    days_of_week: validated.data.days_of_week,
    target_per_week: validated.data.target_per_week,
    archived: false,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/today');
  revalidatePath('/habits');
  revalidatePath('/stats');
  return { success: true };
}

export async function updateHabit(habitId: string, input: HabitInput): Promise<ActionResponse> {
  const validated = habitSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || 'Invalid habit data',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('habits')
    .update({
      title: validated.data.title,
      description: validated.data.description || null,
      category: validated.data.category,
      color: validated.data.color,
      frequency_type: validated.data.frequency_type,
      days_of_week: validated.data.days_of_week,
      target_per_week: validated.data.target_per_week,
    })
    .eq('id', habitId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/today');
  revalidatePath('/habits');
  revalidatePath('/stats');
  return { success: true };
}

export async function toggleArchiveHabit(habitId: string, currentArchived: boolean): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('habits')
    .update({ archived: !currentArchived })
    .eq('id', habitId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/today');
  revalidatePath('/habits');
  revalidatePath('/stats');
  return { success: true };
}

export async function deleteHabit(habitId: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/today');
  revalidatePath('/habits');
  revalidatePath('/stats');
  return { success: true };
}

export async function toggleHabitLog(habitId: string, logDate: string): Promise<ActionResponse<{ completed: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Check if log already exists
  const { data: existingLog, error: queryError } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('habit_id', habitId)
    .eq('log_date', logDate)
    .maybeSingle();

  if (queryError) {
    return { success: false, error: queryError.message };
  }

  if (existingLog) {
    // Untick / remove log
    const { error: deleteError } = await supabase
      .from('habit_logs')
      .delete()
      .eq('id', existingLog.id)
      .eq('user_id', user.id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/today');
    revalidatePath('/habits');
    revalidatePath('/stats');
    return { success: true, data: { completed: false } };
  } else {
    // Check-in / create log
    const { error: insertError } = await supabase.from('habit_logs').insert({
      habit_id: habitId,
      user_id: user.id,
      log_date: logDate,
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath('/today');
    revalidatePath('/habits');
    revalidatePath('/stats');
    return { success: true, data: { completed: true } };
  }
}

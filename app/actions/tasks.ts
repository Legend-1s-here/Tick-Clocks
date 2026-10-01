'use server';

import { createClient } from '@/lib/supabase/server';
import { taskSchema, TaskInput } from '@/lib/validations/tasks';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from './habits';

export async function createTask(input: TaskInput): Promise<ActionResponse> {
  const validated = taskSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || 'Invalid task data',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase.from('tasks').insert({
    user_id: user.id,
    title: validated.data.title,
    due_date: validated.data.due_date,
    due_time: validated.data.due_time || null,
    priority: validated.data.priority,
    done: false,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/today');
  return { success: true };
}

export async function updateTask(taskId: string, input: TaskInput): Promise<ActionResponse> {
  const validated = taskSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || 'Invalid task data',
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
    .from('tasks')
    .update({
      title: validated.data.title,
      due_date: validated.data.due_date,
      due_time: validated.data.due_time || null,
      priority: validated.data.priority,
    })
    .eq('id', taskId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/today');
  return { success: true };
}

export async function toggleTaskDone(taskId: string, currentDone: boolean): Promise<ActionResponse<{ done: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const newDone = !currentDone;
  const { error } = await supabase
    .from('tasks')
    .update({
      done: newDone,
      done_at: newDone ? new Date().toISOString() : null,
    })
    .eq('id', taskId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/today');
  return { success: true, data: { done: newDone } };
}

export async function deleteTask(taskId: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/today');
  return { success: true };
}

export async function checkAndRolloverTasks(todayDateStr: string): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  // Check if rollover setting is active
  const { data: settings } = await supabase
    .from('user_settings')
    .select('rollover_tasks')
    .eq('user_id', user.id)
    .single();

  if (!settings?.rollover_tasks) {
    return 0;
  }

  // Find overdue incomplete tasks
  const { data: overdueTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', user.id)
    .eq('done', false)
    .lt('due_date', todayDateStr);

  if (!overdueTasks || overdueTasks.length === 0) {
    return 0;
  }

  const overdueIds = overdueTasks.map((t) => t.id);

  // Update their due date to today
  await supabase
    .from('tasks')
    .update({ due_date: todayDateStr })
    .in('id', overdueIds)
    .eq('user_id', user.id);

  revalidatePath('/today');
  return overdueIds.length;
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema } from '@/lib/validations/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

export async function signInWithEmail(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || 'Invalid input',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signUpWithEmail(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    timezone: (formData.get('timezone') as string) || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };

  const validated = registerSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues?.[0]?.message || 'Invalid input',
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        timezone: validated.data.timezone,
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // If session is immediately available (email confirmation disabled in Supabase)
  if (data.user) {
    // Explicitly ensure profile & settings exist if database trigger did not run
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email || validated.data.email,
      timezone: validated.data.timezone,
    });
    await supabase.from('user_settings').upsert({
      user_id: data.user.id,
    });
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}

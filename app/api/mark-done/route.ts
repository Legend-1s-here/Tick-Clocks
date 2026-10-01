import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyMarkDoneToken } from '@/lib/email/tokens';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const type = searchParams.get('type'); // 'habit' | 'task'
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');
  const dateStr = searchParams.get('date');
  const token = searchParams.get('token');

  if (!type || !id || !userId || !dateStr || !token) {
    return NextResponse.redirect(`${origin}/today?error=Missing parameters`);
  }

  // Cryptographically verify token
  const isValid = verifyMarkDoneToken(userId, id, dateStr, token);
  if (!isValid) {
    return NextResponse.redirect(`${origin}/today?error=Invalid or expired token`);
  }

  const supabase = createAdminClient();

  if (type === 'habit') {
    // Upsert habit log for this date
    await supabase.from('habit_logs').upsert(
      {
        habit_id: id,
        user_id: userId,
        log_date: dateStr,
      },
      { onConflict: 'habit_id,log_date' }
    );
  } else if (type === 'task') {
    // Mark task done
    await supabase
      .from('tasks')
      .update({
        done: true,
        done_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId);
  }

  return NextResponse.redirect(`${origin}/today?marked=success&date=${dateStr}`);
}

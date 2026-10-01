import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/today';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure user profile & settings exist
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email || '',
          timezone: 'UTC',
        });
        await supabase.from('user_settings').insert({
          user_id: data.user.id,
        });
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocal =
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        (forwardedHost?.includes('localhost') ?? false) ||
        (forwardedHost?.includes('127.0.0.1') ?? false);

      if (isLocal) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate user`);
}

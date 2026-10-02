import { Resend } from 'resend';

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailPayload): Promise<{ success: boolean; id?: string; error?: string; isMock?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'HabitFlow <onboarding@resend.dev>';

  // Fallback for development/testing when no live API key is configured
  if (!apiKey || apiKey.includes('placeholder') || apiKey.startsWith('re_123')) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return { success: true, id: `mock-${Date.now()}`, isMock: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[Resend Error]', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown email send error';
    console.error('[Resend Exception]', msg);
    return { success: false, error: msg };
  }
}

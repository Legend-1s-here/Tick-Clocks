import crypto from 'crypto';

/**
 * Generates an HMAC-SHA256 signature token for one-tap email actions.
 */
export function generateMarkDoneToken(userId: string, itemId: string, dateStr: string): string {
  const secret = process.env.CRON_SECRET || 'habitflow-default-secret-token';
  const data = `${userId}:${itemId}:${dateStr}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verifies the token for the given user, item, and date.
 */
export function verifyMarkDoneToken(
  userId: string,
  itemId: string,
  dateStr: string,
  token: string
): boolean {
  const expected = generateMarkDoneToken(userId, itemId, dateStr);
  try {
    return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

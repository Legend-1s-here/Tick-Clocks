import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export interface ReminderWindowCheck {
  isWithinWindow: boolean;
  localDate: string; // YYYY-MM-DD in user's timezone
  localTime: string; // HH:mm in user's timezone
  minutesDiff: number;
}

/**
 * Checks whether the current moment falls within the 15-minute execution window of a target slot.
 *
 * @param slot e.g. "18:00" (HH:mm)
 * @param userTimezone IANA timezone string e.g. "America/New_York", "UTC", "Asia/Kolkata"
 * @param now Reference UTC date
 * @param windowMinutes Window duration in minutes (default 15 minutes)
 */
export function isWithinReminderWindow(
  slot: string,
  userTimezone: string,
  now: Date = new Date(),
  windowMinutes: number = 15
): ReminderWindowCheck {
  // Safe fallback if timezone is invalid
  let validTz = userTimezone;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: userTimezone });
  } catch {
    validTz = 'UTC';
  }

  // Convert reference date to user's timezone
  const zonedDate = toZonedTime(now, validTz);
  const localDate = formatInTimeZone(now, validTz, 'yyyy-MM-dd');
  const localTime = formatInTimeZone(now, validTz, 'HH:mm');

  const [slotH, slotM] = slot.split(':').map((v) => parseInt(v, 10));
  if (isNaN(slotH) || isNaN(slotM)) {
    return { isWithinWindow: false, localDate, localTime, minutesDiff: Infinity };
  }

  const currentLocalMinutes = zonedDate.getHours() * 60 + zonedDate.getMinutes();
  const slotMinutes = slotH * 60 + slotM;

  // Calculate difference. When cron runs every 15 min, current time is between slot and slot + windowMinutes
  // Example: slot is 18:00. Cron runs at 18:02. diff = 2. 0 <= diff < 15 -> true
  const minutesDiff = currentLocalMinutes - slotMinutes;

  const isWithinWindow = minutesDiff >= 0 && minutesDiff < windowMinutes;

  return {
    isWithinWindow,
    localDate,
    localTime,
    minutesDiff,
  };
}

/**
 * Returns all active slots that match the current 15-minute window for a user.
 */
export function getMatchingReminderSlots(
  reminderTimes: string[],
  userTimezone: string,
  now: Date = new Date()
): { matchingSlots: string[]; localDate: string } {
  const matchingSlots: string[] = [];
  let localDateStr = '';

  for (const slot of reminderTimes) {
    const check = isWithinReminderWindow(slot, userTimezone, now);
    localDateStr = check.localDate;
    if (check.isWithinWindow) {
      matchingSlots.push(slot);
    }
  }

  return {
    matchingSlots,
    localDate: localDateStr,
  };
}

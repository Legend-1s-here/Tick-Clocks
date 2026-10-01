import { describe, it, expect } from 'vitest';
import { isWithinReminderWindow, getMatchingReminderSlots } from './reminders';

describe('Reminder Window Logic', () => {
  it('returns true when current time is at the exact slot minute', () => {
    // 18:00 in UTC is 2026-10-02T18:00:00Z
    const now = new Date('2026-10-02T18:00:00Z');
    const result = isWithinReminderWindow('18:00', 'UTC', now, 15);

    expect(result.isWithinWindow).toBe(true);
    expect(result.minutesDiff).toBe(0);
    expect(result.localDate).toBe('2026-10-02');
  });

  it('returns true when current time is 10 minutes into the 15-minute slot window', () => {
    const now = new Date('2026-10-02T18:10:00Z');
    const result = isWithinReminderWindow('18:00', 'UTC', now, 15);

    expect(result.isWithinWindow).toBe(true);
    expect(result.minutesDiff).toBe(10);
  });

  it('returns false when current time is past the 15-minute window', () => {
    const now = new Date('2026-10-02T18:16:00Z');
    const result = isWithinReminderWindow('18:00', 'UTC', now, 15);

    expect(result.isWithinWindow).toBe(false);
    expect(result.minutesDiff).toBe(16);
  });

  it('returns false when current time is before the slot', () => {
    const now = new Date('2026-10-02T17:55:00Z');
    const result = isWithinReminderWindow('18:00', 'UTC', now, 15);

    expect(result.isWithinWindow).toBe(false);
    expect(result.minutesDiff).toBe(-5);
  });

  it('correctly shifts timezones (e.g. UTC to America/New_York EDT = UTC-4)', () => {
    // 22:05 UTC is 18:05 EDT (New York)
    const now = new Date('2026-10-02T22:05:00Z');
    const result = isWithinReminderWindow('18:00', 'America/New_York', now, 15);

    expect(result.isWithinWindow).toBe(true);
    expect(result.localTime).toBe('18:05');
    expect(result.localDate).toBe('2026-10-02');
    expect(result.minutesDiff).toBe(5);
  });

  it('correctly matches active slot from array of user reminder slots', () => {
    const userSlots = ['09:00', '18:00', '21:00'];
    const now = new Date('2026-10-02T18:08:00Z');
    const { matchingSlots, localDate } = getMatchingReminderSlots(userSlots, 'UTC', now);

    expect(matchingSlots).toEqual(['18:00']);
    expect(localDate).toBe('2026-10-02');
  });
});

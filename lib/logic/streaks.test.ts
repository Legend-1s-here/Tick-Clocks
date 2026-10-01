import { describe, it, expect } from 'vitest';
import { calculateStreakStats, isHabitScheduledOnDate } from './streaks';
import { Habit, HabitLog } from '@/types/database';

describe('Streak Calculation Logic', () => {
  const mockDailyHabit: Habit = {
    id: 'habit-1',
    user_id: 'user-1',
    title: 'Daily Meditation',
    description: null,
    category: 'Mindfulness',
    color: '#6366f1',
    frequency_type: 'daily',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    target_per_week: 7,
    archived: false,
    created_at: '2026-09-01T00:00:00Z',
  };

  const mockWeekdayHabit: Habit = {
    id: 'habit-2',
    user_id: 'user-1',
    title: 'Work Sprint',
    description: null,
    category: 'Productivity',
    color: '#10b981',
    frequency_type: 'weekdays',
    days_of_week: [1, 2, 3, 4, 5], // Mon - Fri
    target_per_week: 5,
    archived: false,
    created_at: '2026-09-01T00:00:00Z',
  };

  it('returns 0 streak when there are no logs', () => {
    const stats = calculateStreakStats(mockDailyHabit, [], new Date('2026-10-02T12:00:00Z'));
    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(0);
    expect(stats.completionRate7d).toBe(0);
  });

  it('calculates current streak when completed today and past consecutive days', () => {
    const logs: HabitLog[] = [
      { id: '1', habit_id: 'habit-1', user_id: 'user-1', log_date: '2026-10-02', completed_at: '' },
      { id: '2', habit_id: 'habit-1', user_id: 'user-1', log_date: '2026-10-01', completed_at: '' },
      { id: '3', habit_id: 'habit-1', user_id: 'user-1', log_date: '2026-09-30', completed_at: '' },
    ];
    const stats = calculateStreakStats(mockDailyHabit, logs, new Date('2026-10-02T12:00:00Z'));
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
  });

  it('preserves current streak if today is not completed yet but yesterday was completed', () => {
    const logs: HabitLog[] = [
      { id: '1', habit_id: 'habit-1', user_id: 'user-1', log_date: '2026-10-01', completed_at: '' },
      { id: '2', habit_id: 'habit-1', user_id: 'user-1', log_date: '2026-09-30', completed_at: '' },
    ];
    // Today is 2026-10-02
    const stats = calculateStreakStats(mockDailyHabit, logs, new Date('2026-10-02T12:00:00Z'));
    expect(stats.currentStreak).toBe(2);
  });

  it('breaks streak when a scheduled day in the past was missed', () => {
    const logs: HabitLog[] = [
      { id: '1', habit_id: 'habit-1', user_id: 'user-1', log_date: '2026-10-02', completed_at: '' },
      // 2026-10-01 was missed
      { id: '2', habit_id: 'habit-1', user_id: 'user-1', log_date: '2026-09-30', completed_at: '' },
      { id: '3', habit_id: 'habit-1', user_id: 'user-1', log_date: '2026-09-29', completed_at: '' },
    ];
    const stats = calculateStreakStats(mockDailyHabit, logs, new Date('2026-10-02T12:00:00Z'));
    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(2);
  });

  it('skips non-scheduled weekend days for weekday-only habits without breaking streak', () => {
    // 2026-10-05 is Monday
    // 2026-10-04 is Sunday (not scheduled)
    // 2026-10-03 is Saturday (not scheduled)
    // 2026-10-02 is Friday (scheduled)
    const logs: HabitLog[] = [
      { id: '1', habit_id: 'habit-2', user_id: 'user-1', log_date: '2026-10-05', completed_at: '' },
      { id: '2', habit_id: 'habit-2', user_id: 'user-1', log_date: '2026-10-02', completed_at: '' },
    ];

    const stats = calculateStreakStats(mockWeekdayHabit, logs, new Date('2026-10-05T12:00:00Z'));
    // Friday + Monday completed, weekend ignored -> streak = 2
    expect(stats.currentStreak).toBe(2);
  });

  it('correctly determines whether a habit is scheduled on a given date', () => {
    // 2026-10-04 is Sunday (day index 0)
    // 2026-10-05 is Monday (day index 1)
    const sunday = new Date('2026-10-04T12:00:00Z');
    const monday = new Date('2026-10-05T12:00:00Z');

    expect(isHabitScheduledOnDate(mockDailyHabit, sunday)).toBe(true);
    expect(isHabitScheduledOnDate(mockDailyHabit, monday)).toBe(true);

    expect(isHabitScheduledOnDate(mockWeekdayHabit, sunday)).toBe(false);
    expect(isHabitScheduledOnDate(mockWeekdayHabit, monday)).toBe(true);
  });
});

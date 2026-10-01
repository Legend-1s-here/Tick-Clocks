import { format, parseISO, subDays, differenceInCalendarDays } from 'date-fns';
import { Habit, HabitLog } from '@/types/database';

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  completionRate7d: number;
  completionRate30d: number;
  completionRate90d: number;
  totalCompletions: number;
}

/**
 * Checks whether a habit is scheduled on a given date.
 */
export function isHabitScheduledOnDate(habit: Habit, date: Date): boolean {
  if (habit.frequency_type === 'daily') {
    return true;
  }
  if (habit.frequency_type === 'weekdays') {
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    return habit.days_of_week.includes(dayOfWeek);
  }
  // For 'weekly_target', it can be done on any day
  return true;
}

/**
 * Calculates current streak, longest streak, and completion rates.
 * @param habit The habit definition
 * @param logs The completion logs for this habit
 * @param referenceDate The "today" reference date (defaults to current date)
 */
export function calculateStreakStats(
  habit: Habit,
  logs: HabitLog[],
  referenceDate: Date = new Date()
): StreakStats {
  const completedDateSet = new Set(logs.map((log) => log.log_date));
  const refDateStr = format(referenceDate, 'yyyy-MM-dd');
  const totalCompletions = completedDateSet.size;

  if (logs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      completionRate7d: 0,
      completionRate30d: 0,
      completionRate90d: 0,
      totalCompletions: 0,
    };
  }

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let checkDate = referenceDate;
  const isScheduledToday = isHabitScheduledOnDate(habit, checkDate);
  const doneToday = completedDateSet.has(refDateStr);

  // If scheduled today and done, start from today.
  // If scheduled today and NOT done, or not scheduled today, check if yesterday was done (streak alive).
  if (isScheduledToday && doneToday) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  } else if (!isScheduledToday) {
    // If today is not a scheduled day, streak can still be intact from the most recent scheduled day
    checkDate = subDays(checkDate, 1);
  } else {
    // Scheduled today, but not completed yet. We look back to yesterday to see if active streak exists.
    checkDate = subDays(checkDate, 1);
  }

  // Walk backwards
  while (true) {
    const isScheduled = isHabitScheduledOnDate(habit, checkDate);
    const dateStr = format(checkDate, 'yyyy-MM-dd');

    if (isScheduled) {
      if (completedDateSet.has(dateStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        // Streak broken
        break;
      }
    } else {
      // Non-scheduled day (e.g. weekend for weekday-only habit) doesn't break streak
      checkDate = subDays(checkDate, 1);
    }

    // Safety guard to avoid infinite loop (e.g. max 5 years back)
    if (differenceInCalendarDays(referenceDate, checkDate) > 365 * 5) {
      break;
    }
  }

  // 2. Calculate Longest Streak
  // Sort unique log dates in ascending order
  const sortedDates = Array.from(completedDateSet).sort();
  let longestStreak = currentStreak;
  let runningStreak = 0;

  if (sortedDates.length > 0) {
    const firstDate = parseISO(sortedDates[0]);
    let iter = firstDate;
    const end = referenceDate;

    while (iter <= end) {
      const isSched = isHabitScheduledOnDate(habit, iter);
      const str = format(iter, 'yyyy-MM-dd');

      if (isSched) {
        if (completedDateSet.has(str)) {
          runningStreak++;
          if (runningStreak > longestStreak) {
            longestStreak = runningStreak;
          }
        } else {
          runningStreak = 0;
        }
      }
      iter = new Date(iter.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  // 3. Calculate completion rates for 7, 30, 90 days
  const calcRate = (days: number): number => {
    let scheduledCount = 0;
    let completedCount = 0;

    for (let i = 0; i < days; i++) {
      const d = subDays(referenceDate, i);
      const isSched = isHabitScheduledOnDate(habit, d);
      if (isSched) {
        scheduledCount++;
        if (completedDateSet.has(format(d, 'yyyy-MM-dd'))) {
          completedCount++;
        }
      }
    }

    return scheduledCount === 0 ? 0 : Math.round((completedCount / scheduledCount) * 100);
  };

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    completionRate7d: calcRate(7),
    completionRate30d: calcRate(30),
    completionRate90d: calcRate(90),
    totalCompletions,
  };
}

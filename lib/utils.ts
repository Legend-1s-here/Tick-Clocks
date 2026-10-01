import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatPattern: string = 'MMM d, yyyy'): string {
  if (typeof date === 'string') {
    return format(parseISO(date), formatPattern);
  }
  return format(date, formatPattern);
}

export const HABIT_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#eab308', // Yellow
  '#f97316', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Purple
];

export const HABIT_CATEGORIES = [
  'General',
  'Health & Fitness',
  'Work & Productivity',
  'Learning & Mindset',
  'Mindfulness',
  'Finance',
  'Relationships',
  'Personal Care',
];

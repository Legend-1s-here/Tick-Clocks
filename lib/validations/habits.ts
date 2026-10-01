import { z } from 'zod';

export const habitSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional().nullable(),
  category: z.string().min(1, 'Category is required').default('General'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color').default('#6366f1'),
  frequency_type: z.enum(['daily', 'weekdays', 'weekly_target']),
  days_of_week: z.array(z.number().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
  target_per_week: z.number().int().min(1).max(7).default(1),
});

export type HabitInput = z.infer<typeof habitSchema>;

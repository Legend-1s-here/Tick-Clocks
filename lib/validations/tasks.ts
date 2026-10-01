import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title is too long'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'),
  due_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Due time must be in HH:mm format')
    .optional()
    .nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export type TaskInput = z.infer<typeof taskSchema>;

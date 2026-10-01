import { z } from 'zod';

export const settingsSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  reminder_times: z
    .array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'))
    .max(3, 'Maximum 3 reminder times per day allowed'),
  email_enabled: z.boolean(),
  morning_email: z.boolean(),
  weekly_summary: z.boolean(),
  rollover_tasks: z.boolean(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

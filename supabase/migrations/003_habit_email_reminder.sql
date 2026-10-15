-- 003_habit_email_reminder.sql
-- Add email_reminder toggle to habits table (defaults to true)

ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS email_reminder BOOLEAN NOT NULL DEFAULT true;

-- Index to optimize querying active habits with email reminders
CREATE INDEX IF NOT EXISTS idx_habits_email_reminder ON public.habits(user_id, archived, email_reminder);

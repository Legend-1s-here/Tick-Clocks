-- 002_task_email_reminder.sql
-- Add email_reminder toggle to tasks table (defaults to true)

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS email_reminder BOOLEAN NOT NULL DEFAULT true;

-- Index to optimize querying pending tasks with email reminders
CREATE INDEX IF NOT EXISTS idx_tasks_email_reminder ON public.tasks(user_id, due_date, email_reminder, done);

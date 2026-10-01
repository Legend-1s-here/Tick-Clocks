# HabitFlow — Production Habit Tracker + Daily Checklist with Email Reminders

HabitFlow is a production-quality, mobile-first web app designed to help you build consistency, conquer daily checklist items, visualize long-term streaks with GitHub-style heatmaps, and never let unfinished tasks slip through the cracks thanks to smart transactional email reminders.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/) with React 19 & TypeScript (Strict Mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with dark mode and modern micro-interactions
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security + SSR Cookie Authentication)
- **Transactional Email**: [Resend](https://resend.com/) with responsive cross-client HTML email templates
- **Timezone Management**: `date-fns` & `date-fns-tz` for timezone calculations and calendar accuracy
- **Celebration Effects**: `canvas-confetti` on 100% completion days
- **Testing**: [Vitest](https://vitest.dev/) for unit testing streak logic and reminder window algorithms
- **PWA**: Installable on iOS & Android devices (Web App Manifest + standalone display)
- **Deployment**: Vercel + GitHub Actions scheduled cron runner

---

## ✨ Core Features

1. **Authentication & Data Isolation**:
   - Email/password and Google OAuth sign-in.
   - Strict Row Level Security (RLS) on all PostgreSQL tables — users only access their own data.
   - Automatic database trigger creates `profiles` and `user_settings` upon signup.

2. **Habits CRUD & Backfilling**:
   - Create, edit, and archive habits with custom titles, descriptions, categories, badge colors, and frequencies.
   - Frequency options: *Every Day*, *Specific Weekdays*, or *X Times per Week*.
   - 1-tap check-in on the dashboard.
   - 14-day history view to backfill or toggle past completions.

3. **Daily Checklist Tasks**:
   - One-off tasks tied to specific dates, with optional due times and priority levels (`high`, `medium`, `low`).
   - Task rollover: automatically push yesterday's unfinished tasks to today.

4. **Today Dashboard**:
   - Unified view of today's habits and daily tasks.
   - Circular SVG progress ring with confetti celebration when 100% completed.
   - Date stepper to review yesterday's checklist or plan ahead.
   - Desktop keyboard shortcuts (`N` for new task, `Space` to toggle items).

5. **Streaks, Stats, & Yearly Heatmaps**:
   - Current streak and longest streak calculation.
   - Intelligent weekday skipping (weekends do not break weekday-only habits).
   - 7-day, 30-day, and 90-day completion rate percentages.
   - 52-week (365 days) GitHub-style interactive heatmap with day inspection tooltips.
   - High-level aggregate metrics across all active habits.

6. **Smart Email Reminders (The Key Feature)**:
   - Configure up to 3 daily reminder slots (e.g. `18:00`, `21:00`).
   - At each slot, checks if there are pending items scheduled for today in the user's timezone.
   - **Zero noise**: If everything is complete, no email is sent.
   - **One-tap Mark Done deep links**: Cryptographically signed HMAC-SHA256 links allow check-offs directly from any email client.
   - **No duplicates**: Enforced via `reminder_log` unique constraint `(user_id, local_date, slot)`.
   - **Morning Plan Email**: Daily digest at 08:00 AM local time.
   - **Weekly Retrospective**: Sunday evening digest (20:00 local time) with 7-day consistency stats and focus areas.

7. **Settings & Data Privacy**:
   - Timezone configuration with one-click browser auto-detection.
   - Master email toggle, morning email toggle, weekly summary toggle, rollover toggle.
   - **Export data**: Download full account snapshot in JSON or CSV (habits and tasks).
   - **Danger zone**: Permanent account deletion with confirmation safeguard.

---

## 📁 Project Structure

```
├── .github/workflows/
│   └── reminders-cron.yml         # GitHub Actions 15-minute cron runner
├── app/
│   ├── actions/                   # Zod-validated Server Actions
│   │   ├── auth.ts                # Sign-in, sign-up, sign-out
│   │   ├── habits.ts              # Habits CRUD & toggleHabitLog
│   │   ├── tasks.ts               # Tasks CRUD & rollover
│   │   └── settings.ts            # Settings, exports & account deletion
│   ├── api/
│   │   ├── cron/
│   │   │   ├── reminders/route.ts # 15-min reminder endpoint
│   │   │   ├── morning/route.ts   # 08:00 AM daily plan endpoint
│   │   │   └── weekly/route.ts    # Sunday 20:00 summary endpoint
│   │   └── mark-done/route.ts     # Email 1-tap deep link handler
│   ├── auth/
│   │   ├── login/page.tsx         # Login form + Google OAuth
│   │   ├── register/page.tsx      # Register form with timezone detection
│   │   └── callback/route.ts      # OAuth code exchange
│   ├── today/page.tsx             # Today dashboard
│   ├── habits/page.tsx            # Habits manager
│   ├── stats/page.tsx             # Streaks & heatmaps
│   ├── settings/page.tsx          # Preferences & exports
│   ├── layout.tsx                 # Root layout + PWA meta tags
│   └── page.tsx                   # Landing page with auth redirect
├── components/
│   ├── auth/GoogleSignInButton.tsx
│   ├── habits/HabitModal.tsx
│   ├── habits/BackfillModal.tsx
│   ├── habits/HabitsManager.tsx
│   ├── layout/AppNavbar.tsx
│   ├── settings/SettingsClient.tsx
│   ├── stats/Heatmap.tsx
│   ├── stats/HabitStatCard.tsx
│   ├── stats/StatsOverview.tsx
│   ├── stats/StatsClient.tsx
│   ├── today/ProgressRing.tsx
│   ├── today/HabitItem.tsx
│   ├── today/TaskItem.tsx
│   └── today/TodayClient.tsx
├── lib/
│   ├── email/
│   │   ├── tokens.ts              # HMAC deep link tokens
│   │   ├── templates.ts           # Reminder email template
│   │   ├── summaryTemplates.ts    # Morning & weekly email templates
│   │   └── send.ts                # Resend delivery helper
│   ├── logic/
│   │   ├── streaks.ts             # Streak algorithm
│   │   ├── streaks.test.ts        # Vitest streak tests
│   │   ├── reminders.ts           # 15-min window matcher
│   │   └── reminders.test.ts      # Vitest reminder tests
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server SSR client
│   │   ├── admin.ts               # Service role admin client
│   │   └── middleware.ts          # Middleware auth session refresher
│   ├── validations/               # Zod validation schemas
│   └── utils.ts
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── icon-192.svg
│   └── icon-512.svg
├── supabase/migrations/
│   └── 001_initial_schema.sql     # Full database migration with RLS
└── types/database.ts              # Supabase TypeScript schema definitions
```

---

## 🗄️ Database Setup (Supabase)

1. Create a new Supabase project at [database.new](https://database.new).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/001_initial_schema.sql` and run the script:
   - Creates `profiles`, `user_settings`, `habits`, `habit_logs`, `tasks`, and `reminder_log`.
   - Creates indexes on foreign keys and date lookups.
   - Enables Row Level Security (RLS) on all tables.
   - Adds the `on_auth_user_created` trigger for automated provisioning.
4. Go to **Authentication -> Providers**:
   - Enable **Email** provider.
   - (Optional) Enable **Google** provider by adding your Google Client ID and Secret, and configure the redirect URL: `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback`.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Description | Where to get |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Supabase Dashboard -> Project Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key | Supabase Dashboard -> Project Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key | Supabase Dashboard -> Project Settings -> API |
| `RESEND_API_KEY` | Resend API Key for sending emails | [resend.com/api-keys](https://resend.com/api-keys) |
| `EMAIL_FROM` | Sender email address (e.g. `HabitFlow <notifications@yourdomain.com>`) | Configured in Resend Domains |
| `CRON_SECRET` | Random high-entropy secret string to secure cron webhooks | Generate with `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_URL` | Production app URL (e.g. `https://habitflow.vercel.app`) | Vercel deployment URL |

---

## 🧪 Testing

Run the test suite with Vitest:

```bash
npm test
```

This validates:
- Streak computations across daily, weekday-only (weekend skipping), and missed periods.
- 7/30/90-day completion rates.
- Timezone shift and 15-minute window matching algorithms.

---

## 🚀 Deployment to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. In **Environment Variables**, add all keys listed in the table above.
4. Deploy! Next.js will build with strict TypeScript validation.

---

## ⏰ Scheduling the Reminders (GitHub Actions)

To trigger the 15-minute reminder job reliably from outside Vercel:

1. In your GitHub repository, navigate to **Settings -> Secrets and variables -> Actions**.
2. Add the following repository secrets:
   - `APP_URL`: Your production Vercel URL (e.g., `https://habitflow.vercel.app`) without trailing slash.
   - `CRON_SECRET`: The exact secret token set in your Vercel `CRON_SECRET` environment variable.
3. The workflow file [`.github/workflows/reminders-cron.yml`](.github/workflows/reminders-cron.yml) will trigger every 15 minutes and dispatch authorized calls to `/api/cron/reminders`.
4. You can also trigger it manually anytime under the **Actions** tab in GitHub by selecting **Send Scheduled Habit & Task Reminders -> Run workflow**.

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Start development server
npm run dev

# 4. Open browser
http://localhost:3000
```

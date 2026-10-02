'use client';

import { useState, useEffect } from 'react';
import { Profile, UserSettings } from '@/types/database';
import { updateUserSettings, exportUserData, deleteAccount, sendTestEmailAction } from '@/app/actions/settings';
import { THEME_OPTIONS, ThemeId, applyTheme } from '@/components/layout/ThemeToggle';
import {
  Globe,
  Clock,
  Mail,
  RotateCw,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Plus,
  X,
  FileSpreadsheet,
  FileJson,
  Palette,
  Send,
  ExternalLink,
  Check,
} from 'lucide-react';

interface SettingsClientProps {
  initialProfile: Profile;
  initialSettings: UserSettings;
}

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Africa/Cairo',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export function SettingsClient({ initialProfile, initialSettings }: SettingsClientProps) {
  // Form State
  const [timezone, setTimezone] = useState(initialProfile.timezone || 'UTC');
  const [reminderTimes, setReminderTimes] = useState<string[]>(
    initialSettings.reminder_times || ['18:00', '21:00']
  );
  const [emailEnabled, setEmailEnabled] = useState(initialSettings.email_enabled);
  const [morningEmail, setMorningEmail] = useState(initialSettings.morning_email);
  const [weeklySummary, setWeeklySummary] = useState(initialSettings.weekly_summary);
  const [rolloverTasks, setRolloverTasks] = useState(initialSettings.rollover_tasks);

  // New slot picker state
  const [newSlotTime, setNewSlotTime] = useState('19:00');

  // Status & Feedback
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Export State
  const [exporting, setExporting] = useState(false);

  // Theme State
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('slate');

  useEffect(() => {
    const saved = (localStorage.getItem('habitflow-theme') as ThemeId) || 'slate';
    setSelectedTheme(saved);
  }, []);

  const handleSelectTheme = (themeId: ThemeId) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
  };

  // Test Email State
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendTestEmail = async () => {
    setSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await sendTestEmailAction();
      if (res.success && res.data) {
        setTestEmailResult({ success: true, message: res.data.message });
      } else {
        setTestEmailResult({ success: false, message: res.error || 'Failed to send test email.' });
      }
    } catch {
      setTestEmailResult({ success: false, message: 'Unexpected network error while testing email.' });
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDetectTimezone = () => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setTimezone(detected);
      }
    } catch {
      // ignore
    }
  };

  const handleAddSlot = () => {
    if (reminderTimes.length >= 3) return;
    if (reminderTimes.includes(newSlotTime)) return;
    setReminderTimes([...reminderTimes, newSlotTime].sort());
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    setReminderTimes(reminderTimes.filter((s) => s !== slotToRemove));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const res = await updateUserSettings({
      timezone,
      reminder_times: reminderTimes,
      email_enabled: emailEnabled,
      morning_email: morningEmail,
      weekly_summary: weeklySummary,
      rollover_tasks: rolloverTasks,
    });

    if (res.success) {
      setSuccessMsg('Settings updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setErrorMsg(res.error || 'Failed to update settings');
    }
    setSaving(false);
  };

  const handleExportJSON = async () => {
    setExporting(true);
    const res = await exportUserData();
    if (res.success && res.data) {
      const blob = new Blob([res.data.jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habitflow-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    const res = await exportUserData();
    if (res.success && res.data) {
      // Download Habits CSV
      const blobHabits = new Blob([res.data.csvHabits], { type: 'text/csv' });
      const urlHabits = URL.createObjectURL(blobHabits);
      const a1 = document.createElement('a');
      a1.href = urlHabits;
      a1.download = `habitflow-habits-${new Date().toISOString().slice(0, 10)}.csv`;
      a1.click();
      URL.revokeObjectURL(urlHabits);

      // Download Tasks CSV
      const blobTasks = new Blob([res.data.csvTasks], { type: 'text/csv' });
      const urlTasks = URL.createObjectURL(blobTasks);
      const a2 = document.createElement('a');
      a2.href = urlTasks;
      a2.download = `habitflow-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
      a2.click();
      URL.revokeObjectURL(urlTasks);
    }
    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    setDeleting(true);
    await deleteAccount();
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Preferences & Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Configure timezones, reminder slots, notification triggers, and data privacy.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Timezone Section */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
            <Globe className="w-4 h-4 text-indigo-500" />
            <span>Timezone</span>
          </div>
          <p className="text-xs text-zinc-400">
            All reminder schedules and daily reset times are computed using your local timezone.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
              {!COMMON_TIMEZONES.includes(timezone) && (
                <option value={timezone}>{timezone}</option>
              )}
            </select>

            <button
              type="button"
              onClick={handleDetectTimezone}
              className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              Detect My Timezone
            </button>
          </div>
        </section>

        {/* 2. Reminder Slots Section */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Daily Reminder Slots ({reminderTimes.length}/3)</span>
            </div>
            <span className="text-[11px] text-zinc-400">Max 3 per day</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            At each slot, if there are pending habits or tasks scheduled for today, an email is sent
            listing what remains with &ldquo;Mark done&rdquo; deep links. If everything is complete,
            no email is sent.
          </p>

          {/* Active slots badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            {reminderTimes.length === 0 ? (
              <span className="text-xs text-zinc-400 italic">No reminder slots configured.</span>
            ) : (
              reminderTimes.map((slot) => (
                <div
                  key={slot}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold"
                >
                  <span>{slot}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot)}
                    title="Remove slot"
                    className="hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Slot Control */}
          {reminderTimes.length < 3 && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="time"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSlot}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slot</span>
              </button>
            </div>
          )}
        </section>

        {/* 3. Notification Preferences */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
            <Mail className="w-4 h-4 text-emerald-500" />
            <span>Email Notifications</span>
          </div>

          <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {/* Master toggle */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                  Enable Reminder Emails
                </span>
                <span className="text-[11px] text-zinc-400">
                  Master switch for incomplete habit and task alerts.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Morning plan email */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                  Morning Plan Email
                </span>
                <span className="text-[11px] text-zinc-400">
                  Receive today&apos;s scheduled habits and tasks at 08:00 AM.
                </span>
              </div>
              <input
                type="checkbox"
                checked={morningEmail}
                onChange={(e) => setMorningEmail(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Weekly summary email */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                  Weekly Summary Email
                </span>
                <span className="text-[11px] text-zinc-400">
                  Sunday evening digest with completion rate, best streak, and missed items.
                </span>
              </div>
              <input
                type="checkbox"
                checked={weeklySummary}
                onChange={(e) => setWeeklySummary(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Email Testing & Diagnostics Section */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
              <Send className="w-4 h-4 text-indigo-500" />
              <span>Email Delivery Diagnostics</span>
            </div>
            <a
              href="/api/test-email-preview"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              <span>Preview Template</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Test your transactional email delivery system right now. Dispatches a real sample reminder email to{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{initialProfile.email}</strong>.
          </p>

          <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={sendingTestEmail}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-60 cursor-pointer transition-colors"
            >
              {sendingTestEmail ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Test Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email Now</span>
                </>
              )}
            </button>
          </div>

          {testEmailResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                testEmailResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{testEmailResult.message}</span>
              </div>
            </div>
          )}
        </section>

        {/* Appearance & Themes Section */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
            <Palette className="w-4 h-4 text-purple-500" />
            <span>Appearance & Themes</span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Select a theme that fits your workflow. Switches instantly and syncs across all pages.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-50 dark:bg-zinc-800/80 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: theme.bgPreview,
                        borderColor: theme.borderPreview,
                      }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: theme.accentPreview }}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {theme.name}
                      </p>
                      <span className="text-[10px] text-zinc-400 capitalize">
                        {theme.category} theme
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Productivity Preferences */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
            <RotateCw className="w-4 h-4 text-purple-500" />
            <span>Task Rollover</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                Auto-rollover Unfinished Tasks
              </span>
              <span className="text-[11px] text-zinc-400">
                Automatically push incomplete daily tasks from yesterday into today&apos;s checklist.
              </span>
            </div>
            <input
              type="checkbox"
              checked={rolloverTasks}
              onChange={(e) => setRolloverTasks(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-60 flex items-center gap-2 cursor-pointer transition-colors"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* 5. Data Export Section */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
          <Download className="w-4 h-4 text-blue-500" />
          <span>Export Your Data</span>
        </div>
        <p className="text-xs text-zinc-400">
          Download a complete export of your habits, completion history, daily tasks, and settings.
        </p>

        <div className="flex flex-wrap gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <FileJson className="w-4 h-4 text-amber-500" />
            <span>Export as JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export as CSV</span>
          </button>
        </div>
      </section>

      {/* 6. Danger Zone */}
      <section className="p-5 sm:p-6 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
          <Trash2 className="w-4 h-4" />
          <span>Danger Zone</span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Permanently delete your account and all associated habit tracking history, checklist tasks,
          and preferences. This action cannot be undone.
        </p>

        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          Delete Account
        </button>
      </section>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Delete Account?
                </h3>
                <p className="text-xs text-zinc-400">This action is irreversible.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              All your habits, streaks, tasks, and settings will be permanently destroyed. To
              confirm, please type <strong className="text-zinc-900 dark:text-zinc-100">DELETE</strong> below:
            </p>

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmation('');
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmation !== 'DELETE' || deleting}
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

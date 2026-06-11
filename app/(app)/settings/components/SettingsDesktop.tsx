'use client'

import { useClerk } from '@clerk/nextjs'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { FollowupRules } from '@/lib/actions/settings'
import type { useSettingsForm } from '../hooks/useSettingsForm'
import { cn } from '@/lib/utils'

interface Props {
  profile: {
    id: string
    email: string
    display_name: string | null
    confirmation_enabled: boolean
    pipeline_view: string
    followup_rules: FollowupRules
    undo_window_seconds: number
  }
  settingsForm: ReturnType<typeof useSettingsForm>
}

export default function SettingsDesktop({
  profile,
  settingsForm,
}: Props) {
  return (
    <div className="min-h-screen bg-terra-surface p-8 font-body">
      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="font-headline text-3xl font-bold text-terra-on-surface">Settings</h1>

        <ProfileSection
          email={profile.email}
          name={settingsForm.profileName}
          setName={settingsForm.setProfileName}
          isPending={settingsForm.isProfilePending}
          feedback={settingsForm.profileFeedback}
          onSave={settingsForm.handleProfileSave}
        />
        <PreferencesSection
          confirmation={settingsForm.confirmation}
          setConfirmation={settingsForm.setConfirmation}
          view={settingsForm.view}
          setView={settingsForm.setView}
          undoWindowSeconds={settingsForm.undoWindowSeconds}
          setUndoWindowSeconds={settingsForm.setUndoWindowSeconds}
          isPending={settingsForm.isPreferencesPending}
          feedback={settingsForm.preferencesFeedback}
          onSave={settingsForm.handlePreferencesSave}
        />
        <FollowupRulesSection
          values={settingsForm.rawRuleInputs}
          onChange={settingsForm.handleRuleChange}
          isPending={settingsForm.isRulesPending}
          feedback={settingsForm.rulesFeedback}
          validationErrors={settingsForm.validationErrors}
          hasValidationErrors={settingsForm.hasValidationErrors}
          onSave={settingsForm.handleRulesSave}
        />
        <DangerZoneSection />
      </div>
    </div>
  )
}

// ── Profile ────────────────────────────────────────────────────────────────────────

function ProfileSection({
  email,
  name,
  setName,
  isPending,
  feedback,
  onSave,
}: {
  email: string
  name: string
  setName: (v: string) => void
  isPending: boolean
  feedback: { ok: boolean; msg: string } | null
  onSave: () => void
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-headline text-lg font-bold text-terra-on-surface">Profile</h2>
      <div className="bg-terra-surface border border-terra-surface-container-highest rounded-[20px] p-6 space-y-4 shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-terra-outline uppercase tracking-wide">Display name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-xl border border-terra-surface-container-highest bg-terra-surface-container-low px-3 py-2 text-sm text-terra-on-surface focus:outline-none focus:ring-2 focus:ring-terra-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-terra-outline uppercase tracking-wide">Email</label>
          <p className="text-sm text-terra-on-surface-variant">{email}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            disabled={isPending}
            className="bg-terra-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
          {feedback && (
            <span className={`text-xs font-medium ${feedback.ok ? 'text-terra-primary' : 'text-destructive'}`}>
              {feedback.msg}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Preferences ─────────────────────────────────────────────────────────────────────

const UNDO_WINDOW_OPTIONS: { label: string; value: 5 | 10 | 30 }[] = [
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
  { label: '30s', value: 30 },
]

function PreferencesSection({
  confirmation,
  setConfirmation,
  view,
  setView,
  undoWindowSeconds,
  setUndoWindowSeconds,
  isPending,
  feedback,
  onSave,
}: {
  confirmation: boolean
  setConfirmation: (v: boolean) => void
  view: string
  setView: (v: string) => void
  undoWindowSeconds: 5 | 10 | 30
  setUndoWindowSeconds: (v: 5 | 10 | 30) => void
  isPending: boolean
  feedback: { ok: boolean; msg: string } | null
  onSave: () => void
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-headline text-lg font-bold text-terra-on-surface">Preferences</h2>
      <div className="bg-terra-surface border border-terra-surface-container-highest rounded-[20px] p-6 space-y-5 shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-terra-on-surface">Action confirmations</p>
            <p className="text-xs text-terra-outline mt-0.5">Show confirm dialogs before destructive actions</p>
          </div>
          <Switch checked={confirmation} onCheckedChange={setConfirmation} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-terra-on-surface">Pipeline view</p>
            <p className="text-xs text-terra-outline mt-0.5">Default layout for the pipeline page</p>
          </div>
          <ToggleGroup type="single" value={view} onValueChange={v => v && setView(v)} size="sm">
            <ToggleGroupItem value="board">Board</ToggleGroupItem>
            <ToggleGroupItem value="list">List</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-terra-on-surface">Undo window</p>
            <p className="text-xs text-terra-outline mt-0.5">How long you have to undo an action</p>
          </div>
          <div className="flex rounded-xl overflow-hidden border border-terra-surface-container-highest">
            {UNDO_WINDOW_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setUndoWindowSeconds(value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold transition-colors',
                  undoWindowSeconds === value
                    ? 'bg-terra-primary text-white'
                    : 'bg-terra-surface-container-low text-terra-on-surface hover:bg-terra-surface-container-high'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onSave}
            disabled={isPending}
            className="bg-terra-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save preferences'}
          </button>
          {feedback && (
            <span className={`text-xs font-medium ${feedback.ok ? 'text-terra-primary' : 'text-destructive'}`}>
              {feedback.msg}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Follow-up Rules ───────────────────────────────────────────────────────────────────

const RULE_LABELS: Record<keyof FollowupRules, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  bought: 'Bought',
  leave_alone: 'Leave alone',
}

function FollowupRulesSection({
  values,
  onChange,
  isPending,
  feedback,
  validationErrors,
  hasValidationErrors,
  onSave,
}: {
  values: Record<keyof FollowupRules, string>
  onChange: (field: keyof FollowupRules, raw: string) => void
  isPending: boolean
  feedback: { ok: boolean; msg: string } | null
  validationErrors: Record<keyof FollowupRules, string | null>
  hasValidationErrors: boolean
  onSave: () => void
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-headline text-lg font-bold text-terra-on-surface">Follow-up rules</h2>
      <p className="text-sm text-terra-outline">Days before a contact is considered overdue per pipeline stage.</p>
      <div className="bg-terra-surface border border-terra-surface-container-highest rounded-[20px] p-6 space-y-4 shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(RULE_LABELS) as (keyof FollowupRules)[]).map(field => (
            <div key={field} className="space-y-1.5">
              <label className="text-xs font-semibold text-terra-outline uppercase tracking-wide">
                {RULE_LABELS[field]}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={values[field]}
                  onChange={e => onChange(field, e.target.value)}
                  className={`w-20 rounded-xl border bg-terra-surface-container-low px-3 py-2 text-sm text-terra-on-surface focus:outline-none focus:ring-2 focus:ring-terra-primary ${
                    validationErrors[field] ? 'border-destructive focus:ring-destructive' : 'border-terra-surface-container-highest'
                  }`}
                />
                <span className="text-xs text-terra-outline">days</span>
              </div>
              {validationErrors[field] && (
                <p className="text-[10px] font-medium text-destructive mt-1">
                  {validationErrors[field]}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onSave}
            disabled={isPending || hasValidationErrors}
            className="bg-terra-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save rules'}
          </button>
          {feedback && (
            <span className={`text-xs font-medium ${feedback.ok ? 'text-terra-primary' : 'text-destructive'}`}>
              {feedback.msg}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Danger Zone ───────────────────────────────────────────────────────────────────────

function DangerZoneSection() {
  const { signOut } = useClerk()

  return (
    <section className="space-y-4">
      <h2 className="font-headline text-lg font-bold text-terra-on-surface">Danger zone</h2>
      <div className="bg-terra-surface border border-destructive/30 rounded-[20px] p-6 space-y-3 shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
        <p className="text-sm text-terra-outline">
          Sign out of your account on this device.
        </p>
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: '/' })}
          className="inline-flex items-center text-sm font-bold text-destructive hover:opacity-80 transition-opacity"
        >
          Sign out
        </button>
      </div>
    </section>
  )
}

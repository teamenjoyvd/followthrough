'use client'

import { useClerk } from '@clerk/nextjs'
import { Switch } from '@/components/ui/switch'
import type { useSettingsForm } from '../hooks/useSettingsForm'
import { cn } from '@/lib/utils'

interface Props {
  profile: {
    id: string
    email: string
    display_name: string | null
    confirmation_enabled: boolean
    undo_window_seconds: number
  }
  settingsForm: ReturnType<typeof useSettingsForm>
}

export default function SettingsMobile({
  profile,
  settingsForm,
}: Props) {
  return (
    <div className="min-h-screen bg-terra-surface px-4 pt-6 pb-28 space-y-8 font-body">
      <h1 className="font-headline text-2xl font-bold text-terra-on-surface">Settings</h1>

      <ProfileSectionMobile
        email={profile.email}
        name={settingsForm.profileName}
        setName={settingsForm.setProfileName}
        isPending={settingsForm.isProfilePending}
        feedback={settingsForm.profileFeedback}
        onSave={settingsForm.handleProfileSave}
      />
      <PreferencesSectionMobile
        confirmation={settingsForm.confirmation}
        setConfirmation={settingsForm.setConfirmation}
        undoWindowSeconds={settingsForm.undoWindowSeconds}
        setUndoWindowSeconds={settingsForm.setUndoWindowSeconds}
        isPending={settingsForm.isPreferencesPending}
        feedback={settingsForm.preferencesFeedback}
        onSave={settingsForm.handlePreferencesSave}
      />
      <DangerZoneSectionMobile />
    </div>
  )
}

// ── Profile ─────────────────────────────────────────────────────────────────────────

function ProfileSectionMobile({
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
    <section className="space-y-3">
      <h2 className="font-headline text-base font-bold text-terra-on-surface">Profile</h2>
      <div className="bg-terra-surface border border-terra-surface-container-highest rounded-[20px] p-4 space-y-4 shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-terra-outline uppercase tracking-wide">Display name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-xl border border-terra-surface-container-highest bg-terra-surface-container-low px-3 py-2 text-sm text-terra-on-surface focus:outline-none focus:ring-2 focus:ring-terra-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-terra-outline uppercase tracking-wide">Email</label>
          <p className="text-sm text-terra-on-surface-variant">{email}</p>
        </div>
        <button
          onClick={onSave}
          disabled={isPending}
          className="w-full bg-terra-primary text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
        {feedback && (
          <p className={`text-xs font-medium text-center ${feedback.ok ? 'text-terra-primary' : 'text-destructive'}`}>
            {feedback.msg}
          </p>
        )}
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

function PreferencesSectionMobile({
  confirmation,
  setConfirmation,
  undoWindowSeconds,
  setUndoWindowSeconds,
  isPending,
  feedback,
  onSave,
}: {
  confirmation: boolean
  setConfirmation: (v: boolean) => void
  undoWindowSeconds: 5 | 10 | 30
  setUndoWindowSeconds: (v: 5 | 10 | 30) => void
  isPending: boolean
  feedback: { ok: boolean; msg: string } | null
  onSave: () => void
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-headline text-base font-bold text-terra-on-surface">Preferences</h2>
      <div className="bg-terra-surface border border-terra-surface-container-highest rounded-[20px] p-4 space-y-5 shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-terra-on-surface">Action confirmations</p>
            <p className="text-xs text-terra-outline mt-0.5 leading-snug">Show confirm dialogs before destructive actions</p>
          </div>
          <Switch checked={confirmation} onCheckedChange={setConfirmation} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-terra-on-surface">Undo window</p>
          <p className="text-xs text-terra-outline">How long you have to undo an action</p>
          <div className="flex rounded-xl overflow-hidden border border-terra-surface-container-highest">
            {UNDO_WINDOW_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setUndoWindowSeconds(value)}
                className={cn(
                  'flex-1 py-2 text-xs font-bold transition-colors',
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
        <button
          onClick={onSave}
          disabled={isPending}
          className="w-full bg-terra-primary text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save preferences'}
        </button>
        {feedback && (
          <p className={`text-xs font-medium text-center ${feedback.ok ? 'text-terra-primary' : 'text-destructive'}`}>
            {feedback.msg}
          </p>
        )}
      </div>
    </section>
  )
}


// ── Danger Zone ───────────────────────────────────────────────────────────────────────

function DangerZoneSectionMobile() {
  const { signOut } = useClerk()

  return (
    <section className="space-y-3">
      <h2 className="font-headline text-base font-bold text-terra-on-surface">Danger zone</h2>
      <div className="bg-terra-surface border border-destructive/30 rounded-[20px] p-4 shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
        <p className="text-sm text-terra-outline mb-3">Sign out of your account on this device.</p>
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

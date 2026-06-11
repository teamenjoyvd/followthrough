'use client'

import { useClerk } from '@clerk/nextjs'
import { Switch } from '@/components/ui/switch'
import type { useSettingsForm } from '../hooks/useSettingsForm'
import { cn } from '@/lib/utils'
import { getLabelColorClass } from '@/components/LabelManager'

interface Props {
  profile: {
    id: string
    email: string
    display_name: string | null
    confirmation_enabled: boolean
    undo_window_seconds: number
  }
  labels: { id: string; name: string; color: string }[]
  settingsForm: ReturnType<typeof useSettingsForm>
}

export default function SettingsMobile({
  profile,
  labels,
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
      
      <FollowupRulesSectionMobile
        labels={labels}
        followupRules={settingsForm.followupRules}
        onChange={settingsForm.handleLabelRuleChange}
        isPending={settingsForm.isRulesPending}
        feedback={settingsForm.rulesFeedback}
        onSave={settingsForm.handleRulesSave}
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

// ── Follow-up Rules ─────────────────────────────────────────────────────────────────

function FollowupRulesSectionMobile({
  labels,
  followupRules,
  onChange,
  isPending,
  feedback,
  onSave,
}: {
  labels: { id: string; name: string; color: string }[]
  followupRules: Record<string, number>
  onChange: (labelId: string, value: number) => void
  isPending: boolean
  feedback: { ok: boolean; msg: string } | null
  onSave: () => void
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-headline text-base font-bold text-terra-on-surface">Follow-up Rules</h2>
      <div className="bg-terra-surface border border-terra-surface-container-highest rounded-[20px] p-4 space-y-4 shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
        {/* Agenda Explainer */}
        <div className="p-3 bg-terra-surface-container-low border border-terra-surface-container-highest rounded-xl text-xs text-terra-outline font-body flex items-start gap-2">
          <svg className="h-4 w-4 shrink-0 mt-0.5 text-terra-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-relaxed">
            Contacts are flagged as overdue based on the labels assigned to them. If a contact has multiple labels, the shortest duration is used. Unlabeled contacts default to 14 days.
          </span>
        </div>

        {labels.length === 0 ? (
          <p className="text-sm text-terra-outline italic">No labels created yet. Add labels to contacts to customize rules.</p>
        ) : (
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {labels.map((lbl) => {
              const currentVal = followupRules[lbl.id] !== undefined ? followupRules[lbl.id] : 14
              return (
                <div key={lbl.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-terra-surface-container-low border border-terra-surface-container-highest/80">
                  <label htmlFor={`followup-input-mobile-${lbl.id}`} className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${getLabelColorClass(lbl.color)} cursor-pointer`}>
                    {lbl.name}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      id={`followup-input-mobile-${lbl.id}`}
                      type="number"
                      min={1}
                      max={365}
                      value={currentVal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 14
                        onChange(lbl.id, val)
                      }}
                      className="w-12 text-center text-xs border border-terra-surface-container-highest rounded-lg px-1.5 py-1 bg-white text-terra-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-terra-primary"
                    />
                    <span className="text-[11px] text-terra-outline font-medium">days</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={onSave}
          disabled={isPending || labels.length === 0}
          className="w-full bg-terra-primary text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save rules'}
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

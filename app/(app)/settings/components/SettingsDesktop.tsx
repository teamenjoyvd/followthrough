'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { updateProfile, updatePreferences, updateFollowupRules } from '@/lib/actions/settings'
import { SyncConflictList } from './SyncConflictList'
import type { SyncConflictWithContact } from './SyncConflictList'
import type { FollowupRules } from '@/lib/actions/settings'

interface Props {
  profile: {
    id: string
    email: string
    display_name: string | null
    confirmation_enabled: boolean
    pipeline_view: string
    followup_rules: FollowupRules
  }
  isConnected: boolean
  syncState: { last_synced_at: string | null } | null
  conflicts: SyncConflictWithContact[]
  conflictCount: number
  flashConnected: boolean
  flashError: string | undefined
}

export default function SettingsDesktop({
  profile,
  isConnected,
  syncState,
  conflicts,
  conflictCount,
  flashConnected,
  flashError,
}: Props) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="font-headline text-3xl font-bold text-foreground">Settings</h1>

        <ProfileSection displayName={profile.display_name} email={profile.email} />
        <PreferencesSection
          confirmationEnabled={profile.confirmation_enabled}
          pipelineView={profile.pipeline_view}
        />
        <FollowupRulesSection rules={profile.followup_rules} />
        <GoogleSyncSection
          isConnected={isConnected}
          syncState={syncState}
          conflicts={conflicts}
          conflictCount={conflictCount}
          profileId={profile.id}
          flashConnected={flashConnected}
          flashError={flashError}
        />
        <DangerZoneSection />
      </div>
    </div>
  )
}

// ── Profile ──────────────────────────────────────────────────────────────────

function ProfileSection({ displayName, email }: { displayName: string | null; email: string }) {
  const [name, setName] = useState(displayName ?? '')
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function handleSave() {
    setFeedback(null)
    startTransition(async () => {
      const result = await updateProfile(name)
      if ('error' in result) {
        setFeedback({ ok: false, msg: result.error })
      } else {
        setFeedback({ ok: true, msg: 'Saved.' })
      }
    })
  }

  return (
    <section className="space-y-4">
      <h2 className="font-headline text-lg font-bold text-foreground">Profile</h2>
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Display name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
          {feedback && (
            <span className={`text-xs font-medium ${feedback.ok ? 'text-primary' : 'text-destructive'}`}>
              {feedback.msg}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Preferences ──────────────────────────────────────────────────────────────

function PreferencesSection({
  confirmationEnabled,
  pipelineView,
}: {
  confirmationEnabled: boolean
  pipelineView: string
}) {
  const [confirmation, setConfirmation] = useState(confirmationEnabled)
  const [view, setView] = useState(pipelineView)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function handleSave() {
    setFeedback(null)
    startTransition(async () => {
      const result = await updatePreferences({ confirmationEnabled: confirmation, pipelineView: view })
      if ('error' in result) {
        setFeedback({ ok: false, msg: result.error })
      } else {
        setFeedback({ ok: true, msg: 'Saved.' })
      }
    })
  }

  return (
    <section className="space-y-4">
      <h2 className="font-headline text-lg font-bold text-foreground">Preferences</h2>
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Action confirmations</p>
            <p className="text-xs text-muted-foreground mt-0.5">Show confirm dialogs before destructive actions</p>
          </div>
          <Switch checked={confirmation} onCheckedChange={setConfirmation} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Pipeline view</p>
            <p className="text-xs text-muted-foreground mt-0.5">Default layout for the pipeline page</p>
          </div>
          <ToggleGroup type="single" value={view} onValueChange={v => v && setView(v)} size="sm">
            <ToggleGroupItem value="board">Board</ToggleGroupItem>
            <ToggleGroupItem value="list">List</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save preferences'}
          </button>
          {feedback && (
            <span className={`text-xs font-medium ${feedback.ok ? 'text-primary' : 'text-destructive'}`}>
              {feedback.msg}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Follow-up Rules ───────────────────────────────────────────────────────────

const RULE_LABELS: Record<keyof FollowupRules, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  bought: 'Bought',
  leave_alone: 'Leave alone',
}

function FollowupRulesSection({ rules }: { rules: FollowupRules }) {
  const [values, setValues] = useState<FollowupRules>({ ...rules })
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function handleChange(field: keyof FollowupRules, raw: string) {
    const n = parseInt(raw, 10)
    setValues(prev => ({ ...prev, [field]: isNaN(n) ? prev[field] : n }))
  }

  function handleSave() {
    setFeedback(null)
    startTransition(async () => {
      const result = await updateFollowupRules(values)
      if ('error' in result) {
        setFeedback({ ok: false, msg: result.error })
      } else {
        setFeedback({ ok: true, msg: 'Saved.' })
      }
    })
  }

  return (
    <section className="space-y-4">
      <h2 className="font-headline text-lg font-bold text-foreground">Follow-up rules</h2>
      <p className="text-sm text-muted-foreground">Days before a contact is considered overdue per pipeline stage.</p>
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(RULE_LABELS) as (keyof FollowupRules)[]).map(field => (
            <div key={field} className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {RULE_LABELS[field]}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={values[field]}
                  onChange={e => handleChange(field, e.target.value)}
                  className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save rules'}
          </button>
          {feedback && (
            <span className={`text-xs font-medium ${feedback.ok ? 'text-primary' : 'text-destructive'}`}>
              {feedback.msg}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Google Sync ───────────────────────────────────────────────────────────────

function GoogleSyncSection({
  isConnected,
  syncState,
  conflicts,
  conflictCount,
  profileId,
  flashConnected,
  flashError,
}: {
  isConnected: boolean
  syncState: { last_synced_at: string | null } | null
  conflicts: SyncConflictWithContact[]
  conflictCount: number
  profileId: string
  flashConnected: boolean
  flashError: string | undefined
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-headline text-lg font-bold text-foreground">Google Contacts</h2>
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        {flashConnected && (
          <div className="rounded-lg bg-terra-primary-fixed border border-primary/20 px-4 py-2 text-sm text-primary font-medium">
            Google Contacts connected successfully.
          </div>
        )}
        {flashError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
            {flashError === 'access_denied' && 'Google access was denied. Please try again.'}
            {flashError === 'token_exchange' && 'Failed to exchange OAuth token. Please try again.'}
            {flashError === 'save_failed' && 'Failed to save connection. Please try again.'}
            {flashError === 'profile_not_found' && 'Profile not found. Please sign out and back in.'}
            {!['access_denied', 'token_exchange', 'save_failed', 'profile_not_found'].includes(flashError) && 'An error occurred. Please try again.'}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{isConnected ? 'Connected' : 'Not connected'}</p>
            {syncState?.last_synced_at && (
              <p className="text-xs text-muted-foreground mt-0.5" suppressHydrationWarning>
                Last synced {new Date(syncState.last_synced_at).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <form action="/api/google/sync" method="POST">
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors"
                >
                  Sync now
                </button>
              </form>
            )}
            <Link
              href="/api/google/oauth"
              className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
            >
              {isConnected ? 'Reconnect' : 'Connect Google'}
            </Link>
          </div>
        </div>
        {isConnected && (
          <div className="space-y-3 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Sync conflicts{conflictCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
                  {conflictCount}
                </span>
              )}
            </p>
            <SyncConflictList conflicts={conflicts} profileId={profileId} />
          </div>
        )}
      </div>
    </section>
  )
}

// ── Danger Zone ───────────────────────────────────────────────────────────────

function DangerZoneSection() {
  return (
    <section className="space-y-4">
      <h2 className="font-headline text-lg font-bold text-foreground">Danger zone</h2>
      <div className="bg-card border border-destructive/30 rounded-xl p-6 space-y-3">
        <p className="text-sm text-muted-foreground">
          Sign out of your account on this device.
        </p>
        <Link
          href="/sign-out"
          className="inline-flex items-center text-sm font-bold text-destructive hover:opacity-80 transition-opacity"
        >
          Sign out
        </Link>
      </div>
    </section>
  )
}

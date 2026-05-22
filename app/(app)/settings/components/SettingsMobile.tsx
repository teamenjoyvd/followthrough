'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { updateProfile, updatePreferences, updateFollowupRules } from '@/lib/actions/settings'
import { SyncConflictList } from './SyncConflictList'
import type { SyncConflictWithContact } from './SyncConflictList'
import type { FollowupRules } from '@/lib/actions/settings'
import { useGoogleSync } from '../hooks/useGoogleSync'

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

export default function SettingsMobile({
  profile,
  isConnected,
  syncState,
  conflicts,
  conflictCount,
  flashConnected,
  flashError,
}: Props) {
  return (
    <div className="min-h-screen bg-terra-surface px-4 pt-6 pb-28 space-y-8 font-body">
      <h1 className="font-headline text-2xl font-bold text-terra-on-surface">Settings</h1>

      <ProfileSectionMobile displayName={profile.display_name} email={profile.email} />
      <PreferencesSectionMobile
        confirmationEnabled={profile.confirmation_enabled}
        pipelineView={profile.pipeline_view}
      />
      <FollowupRulesSectionMobile rules={profile.followup_rules} />
      <GoogleSyncSectionMobile
        isConnected={isConnected}
        syncState={syncState}
        conflicts={conflicts}
        conflictCount={conflictCount}
        profileId={profile.id}
        flashConnected={flashConnected}
        flashError={flashError}
      />
      <DangerZoneSectionMobile />
    </div>
  )
}

// ── Profile ───────────────────────────────────────────────────────────────────

function ProfileSectionMobile({ displayName, email }: { displayName: string | null; email: string }) {
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
          onClick={handleSave}
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

// ── Preferences ───────────────────────────────────────────────────────────────

function PreferencesSectionMobile({
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
          <p className="text-sm font-medium text-terra-on-surface">Pipeline view</p>
          <ToggleGroup type="single" value={view} onValueChange={v => v && setView(v)} size="sm" className="w-full">
            <ToggleGroupItem value="board" className="flex-1">Board</ToggleGroupItem>
            <ToggleGroupItem value="list" className="flex-1">List</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <button
          onClick={handleSave}
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

// ── Follow-up Rules ───────────────────────────────────────────────────────────

const RULE_LABELS: Record<keyof FollowupRules, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  bought: 'Bought',
  leave_alone: 'Leave alone',
}

function FollowupRulesSectionMobile({ rules }: { rules: FollowupRules }) {
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
    <section className="space-y-3">
      <h2 className="font-headline text-base font-bold text-terra-on-surface">Follow-up rules</h2>
      <p className="text-xs text-terra-outline">Days before a contact is considered overdue per pipeline stage.</p>
      <div className="bg-terra-surface border border-terra-surface-container-highest rounded-[20px] p-4 space-y-4 shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(RULE_LABELS) as (keyof FollowupRules)[]).map(field => (
            <div key={field} className="space-y-1.5">
              <label className="text-[10px] font-bold text-terra-outline uppercase tracking-wide">
                {RULE_LABELS[field]}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={values[field]}
                  onChange={e => handleChange(field, e.target.value)}
                  className="w-16 rounded-xl border border-terra-surface-container-highest bg-terra-surface-container-low px-2 py-1.5 text-sm text-terra-on-surface focus:outline-none focus:ring-2 focus:ring-terra-primary"
                />
                <span className="text-xs text-terra-outline">d</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
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

// ── Google Sync ───────────────────────────────────────────────────────────────

function GoogleSyncSectionMobile({
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
  const {
    isSyncing,
    syncResult,
    isDisconnecting,
    disconnectError,
    handleSync,
    handleDisconnect,
  } = useGoogleSync({ syncSuccessPrefix: 'Synced' })

  return (
    <section className="space-y-3">
      <h2 className="font-headline text-base font-bold text-terra-on-surface">Google Contacts</h2>
      <div className="bg-terra-surface border border-terra-surface-container-highest rounded-[20px] p-4 space-y-4 shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
        {flashConnected && (
          <div className="rounded-xl bg-terra-on-primary-container border border-terra-primary/20 px-3 py-2 text-sm text-terra-on-surface font-medium">
            Connected successfully.
          </div>
        )}
        {flashError && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {flashError === 'access_denied' && 'Access denied. Try again.'}
            {flashError === 'token_exchange' && 'Token exchange failed. Try again.'}
            {flashError === 'save_failed' && 'Failed to save. Try again.'}
            {flashError === 'profile_not_found' && 'Profile not found. Sign out and back in.'}
            {!['access_denied', 'token_exchange', 'save_failed', 'profile_not_found'].includes(flashError) && 'An error occurred.'}
          </div>
        )}
        {syncResult && (
          <div className={`rounded-xl px-3 py-2 text-sm font-medium border ${
            syncResult.startsWith('Sync failed')
              ? 'bg-destructive/10 border-destructive/20 text-destructive'
              : 'bg-terra-on-primary-container border border-terra-primary/20 text-terra-on-surface'
          }`}>
            {syncResult}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-terra-on-surface">{isConnected ? 'Connected' : 'Not connected'}</p>
            {syncState?.last_synced_at && (
              <p className="text-xs text-terra-outline mt-0.5" suppressHydrationWarning>
                Synced {new Date(syncState.last_synced_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <Link
            href="/api/google/oauth"
            className="text-sm px-3 py-1.5 rounded-xl bg-terra-primary text-white hover:opacity-90 transition-opacity font-medium"
          >
            {isConnected ? 'Reconnect' : 'Connect'}
          </Link>
        </div>
        {isConnected && (
          <>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full text-sm py-2 rounded-xl border border-terra-surface-container-highest bg-terra-surface-container-low text-terra-on-surface hover:bg-terra-surface-container-high transition-colors disabled:opacity-50"
            >
              {isSyncing ? 'Syncing…' : 'Sync now'}
            </button>
            {conflictCount > 0 && (
              <div className="space-y-2 pt-2 border-t border-terra-surface-container-highest">
                <p className="text-xs font-semibold text-terra-outline uppercase tracking-wide">
                  Conflicts
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
                    {conflictCount}
                  </span>
                </p>
                <SyncConflictList conflicts={conflicts} profileId={profileId} />
              </div>
            )}
            <div className="pt-2 border-t border-terra-surface-container-highest">
              {disconnectError && (
                <p className="text-xs text-destructive mb-2">{disconnectError}</p>
              )}
              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="w-full text-sm font-medium text-destructive border border-destructive/30 rounded-xl py-2 hover:bg-destructive/5 transition-colors disabled:opacity-50"
              >
                {isDisconnecting ? 'Disconnecting…' : 'Disconnect Google'}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

// ── Danger Zone ───────────────────────────────────────────────────────────────

function DangerZoneSectionMobile() {
  return (
    <section className="space-y-3">
      <h2 className="font-headline text-base font-bold text-terra-on-surface">Danger zone</h2>
      <div className="bg-terra-surface border border-destructive/30 rounded-[20px] p-4 shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
        <p className="text-sm text-terra-outline mb-3">Sign out of your account on this device.</p>
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

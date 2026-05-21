import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SyncConflictList } from './components/SyncConflictList'
import type { SyncConflictWithContact } from './components/SyncConflictList'
import SettingsDesktop from './components/SettingsDesktop'
import SettingsMobile from './components/SettingsMobile'
import type { FollowupRules } from '@/lib/actions/settings'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Settings — Followthrough',
  description: 'Manage your Followthrough settings and integrations.',
}

const DEFAULT_FOLLOWUP_RULES: FollowupRules = {
  lead: 14,
  qualified: 7,
  bought: 30,
  leave_alone: 90,
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ google_connected?: string; google_error?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const params = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: rawProfile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_id', userId)
    .maybeSingle()) as unknown as {
      data: {
        id: string
        email: string
        display_name: string | null
        confirmation_enabled: boolean
        pipeline_view: string
        followup_rules: any
      } | null
    }

  if (!rawProfile) redirect('/sign-in')

  const followupRules = (rawProfile.followup_rules as unknown as FollowupRules) ?? DEFAULT_FOLLOWUP_RULES

  const profile = {
    id: rawProfile.id,
    email: rawProfile.email,
    display_name: rawProfile.display_name,
    confirmation_enabled: rawProfile.confirmation_enabled,
    pipeline_view: rawProfile.pipeline_view,
    followup_rules: followupRules,
  }

  const { data: rawSyncState } = (await supabase
    .from('google_sync_state')
    .select('*')
    .eq('profile_id', profile.id)
    .maybeSingle()) as unknown as {
      data: {
        last_synced_at: string | null
        access_token: string | null
      } | null
    }

  const syncState = rawSyncState
    ? {
        last_synced_at: rawSyncState.last_synced_at,
        access_token: rawSyncState.access_token,
      }
    : null

  const isConnected = !!syncState?.access_token

  const { data: rawConflicts } = (await supabase
    .from('sync_conflicts')
    .select('*, contacts(first_name, last_name)')
    .eq('profile_id', profile.id)
    .eq('resolved', false)
    .order('created_at', { ascending: false })) as unknown as {
      data: SyncConflictWithContact[] | null
    }

  const conflicts = rawConflicts ?? []

  const conflictCount = conflicts.length

  const sharedProps = {
    profile,
    isConnected,
    syncState,
    conflicts,
    conflictCount,
    flashConnected: params.google_connected === '1',
    flashError: params.google_error,
  }

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:block">
        <SettingsDesktop {...sharedProps} />
      </div>

      {/* Mobile layout */}
      <div className="block md:hidden">
        <SettingsMobile {...sharedProps} />
      </div>
    </>
  )
}

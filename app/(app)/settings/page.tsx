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

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id, email, display_name, confirmation_enabled, pipeline_view, followup_rules')
    .eq('clerk_id', userId)
    .maybeSingle() as {
      data: {
        id: string
        email: string
        display_name: string | null
        confirmation_enabled: boolean
        pipeline_view: string
        followup_rules: FollowupRules | null
      } | null
    }

  if (!profile) redirect('/sign-in')

  const followupRules: FollowupRules = profile.followup_rules ?? DEFAULT_FOLLOWUP_RULES

  const { data: syncState } = await (supabase as any)
    .from('google_sync_state')
    .select('last_synced_at, access_token')
    .eq('profile_id', profile.id)
    .maybeSingle() as { data: { last_synced_at: string | null; access_token: string | null } | null }

  const isConnected = !!syncState?.access_token

  const { data: conflicts = [] } = await (supabase as any)
    .from('sync_conflicts')
    .select('*, contacts(first_name, last_name)')
    .eq('profile_id', profile.id)
    .eq('resolved', false)
    .order('created_at', { ascending: false }) as { data: SyncConflictWithContact[] | null }

  const conflictCount = conflicts?.length ?? 0

  const sharedProps = {
    profile: { ...profile, followup_rules: followupRules },
    isConnected,
    syncState,
    conflicts: conflicts ?? [],
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

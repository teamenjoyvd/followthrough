import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import SettingsClient from './components/SettingsClient'
import type { FollowupRules } from '@/lib/actions/settings'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Settings — Followthrough',
  description: 'Manage your Followthrough settings.',
}

const DEFAULT_FOLLOWUP_RULES: FollowupRules = {
  lead: 14,
  qualified: 7,
  bought: 30,
  leave_alone: 90,
}

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

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
        undo_window_seconds: number | null
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
    undo_window_seconds: rawProfile.undo_window_seconds ?? 10,
  }

  const sharedProps = {
    profile,
  }

  return <SettingsClient {...sharedProps} />
}

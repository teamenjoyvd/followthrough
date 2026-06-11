import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import SettingsClient from './components/SettingsClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Settings — Followthrough',
  description: 'Manage your Followthrough settings.',
}

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createSupabaseServerClient()

  const { data: rawProfile } = (await supabase
    .from('profiles')
    .select('id, email, display_name, confirmation_enabled, undo_window_seconds, followup_rules')
    .eq('clerk_id', userId)
    .maybeSingle()) as unknown as {
      data: {
        id: string
        email: string
        display_name: string | null
        confirmation_enabled: boolean
        undo_window_seconds: number | null
        followup_rules: any
      } | null
    }

  if (!rawProfile) redirect('/sign-in')

  const { data: rawLabels } = await supabase
    .from('labels')
    .select('*')
    .eq('profile_id', rawProfile.id)
    .order('name', { ascending: true })

  const labels = (rawLabels as any[]) || []

  const profile = {
    id: rawProfile.id,
    email: rawProfile.email,
    display_name: rawProfile.display_name,
    confirmation_enabled: rawProfile.confirmation_enabled,
    undo_window_seconds: rawProfile.undo_window_seconds ?? 10,
    followup_rules: rawProfile.followup_rules || {},
  }

  const sharedProps = {
    profile,
    labels,
  }

  return <SettingsClient {...sharedProps} />
}

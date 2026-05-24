'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'

export type FollowupRules = {
  lead: number
  qualified: number
  bought: number
  leave_alone: number
}

const DEFAULT_FOLLOWUP_RULES: FollowupRules = {
  lead: 14,
  qualified: 7,
  bought: 30,
  leave_alone: 90,
}

export async function updateProfile(
  displayName: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const trimmed = displayName.trim()
  if (!trimmed) return { error: 'Display name cannot be empty' }
  if (trimmed.length > 100) return { error: 'Display name too long (max 100 chars)' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: trimmed })
    .eq('id', profileId)

  if (error) {
    console.error('updateProfile error:', error)
    return { error: 'Failed to update profile. Please try again.' }
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function updatePreferences({
  confirmationEnabled,
  pipelineView,
}: {
  confirmationEnabled: boolean
  pipelineView: string
}): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  if (!['board', 'list'].includes(pipelineView)) return { error: 'Invalid pipeline view' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('profiles')
    .update({
      confirmation_enabled: confirmationEnabled,
      pipeline_view: pipelineView,
    })
    .eq('id', profileId)

  if (error) {
    console.error('updatePreferences error:', error)
    return { error: 'Failed to update preferences. Please try again.' }
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function updateFollowupRules(
  rules: FollowupRules,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const fields = Object.keys(DEFAULT_FOLLOWUP_RULES) as (keyof FollowupRules)[]
  for (const field of fields) {
    const val = rules[field]
    if (!Number.isInteger(val) || val < 1 || val > 365) {
      return { error: field + ': must be between 1 and 365 days' }
    }
  }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('profiles')
    .update({ followup_rules: rules })
    .eq('id', profileId)

  if (error) {
    console.error('updateFollowupRules error:', error)
    return { error: 'Failed to update follow-up rules. Please try again.' }
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function disconnectGoogle(): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('google_sync_state')
    .delete()
    .eq('profile_id', profileId)

  if (error) {
    console.error('disconnectGoogle error:', error)
    return { error: 'Failed to disconnect Google. Please try again.' }
  }

  revalidatePath('/settings')
  return { success: true }
}

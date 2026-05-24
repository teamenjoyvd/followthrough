'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfile } from '@/lib/supabase/server'
import { appendActionLog } from './action-log'

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
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  // Read before-snapshot
  const { data: before } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', profile.id)
    .maybeSingle()

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: trimmed })
    .eq('id', profile.id)

  if (error) {
    console.error('updateProfile error:', error)
    return { error: 'Failed to update profile. Please try again.' }
  }

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'updateProfile',
      entityType: 'profile',
      entityId: profile.id,
      payload: { display_name: before?.display_name ?? null },
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[updateProfile] appendActionLog failed:', e)
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function updatePreferences({
  confirmationEnabled,
  pipelineView,
  undoWindowSeconds,
}: {
  confirmationEnabled: boolean
  pipelineView: string
  undoWindowSeconds?: number
}): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  if (!['board', 'list'].includes(pipelineView)) return { error: 'Invalid pipeline view' }
  if (undoWindowSeconds !== undefined && ![5, 10, 30].includes(undoWindowSeconds)) {
    return { error: 'Invalid undo window — must be 5, 10, or 30 seconds' }
  }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const updatePayload: any = {
    confirmation_enabled: confirmationEnabled,
    pipeline_view: pipelineView,
  }
  if (undoWindowSeconds !== undefined) {
    updatePayload.undo_window_seconds = undoWindowSeconds
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', profile.id)

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
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  // Read before-snapshot
  const { data: before } = await supabase
    .from('profiles')
    .select('followup_rules')
    .eq('id', profile.id)
    .maybeSingle()

  const { error } = await supabase
    .from('profiles')
    .update({ followup_rules: rules as any })
    .eq('id', profile.id)

  if (error) {
    console.error('updateFollowupRules error:', error)
    return { error: 'Failed to update follow-up rules. Please try again.' }
  }

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'updateFollowupRules',
      entityType: 'profile',
      entityId: profile.id,
      payload: { followup_rules: before?.followup_rules ?? null },
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[updateFollowupRules] appendActionLog failed:', e)
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function disconnectGoogle(): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('google_sync_state')
    .delete()
    .eq('profile_id', profile.id)

  if (error) {
    console.error('disconnectGoogle error:', error)
    return { error: 'Failed to disconnect Google. Please try again.' }
  }

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'disconnectGoogle',
      entityType: 'google_sync',
      payload: {},
      undoWindowSeconds: null, // audit only — not undoable
    })
  } catch (e) {
    console.error('[disconnectGoogle] appendActionLog failed:', e)
  }

  revalidatePath('/settings')
  return { success: true }
}

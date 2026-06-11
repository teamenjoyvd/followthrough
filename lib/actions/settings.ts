'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfile } from '@/lib/supabase/server'
import { appendActionLog } from './action-log'

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
  undoWindowSeconds,
}: {
  confirmationEnabled: boolean
  undoWindowSeconds?: number
}): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  if (undoWindowSeconds !== undefined && ![5, 10, 30].includes(undoWindowSeconds)) {
    return { error: 'Invalid undo window — must be 5, 10, or 30 seconds' }
  }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const updatePayload: any = {
    confirmation_enabled: confirmationEnabled,
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

export async function updateLabelFollowupRules(
  rules: Record<string, number>
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  for (const [labelId, val] of Object.entries(rules)) {
    if (!Number.isInteger(val) || val < 1 || val > 365) {
      return { error: 'Follow-up threshold must be between 1 and 365 days' }
    }
  }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('profiles')
    .update({ followup_rules: rules as any })
    .eq('id', profile.id)

  if (error) {
    console.error('updateLabelFollowupRules error:', error)
    return { error: 'Failed to update follow-up rules. Please try again.' }
  }

  revalidatePath('/settings')
  return { success: true }
}


'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfile } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import { appendActionLog } from './action-log'

type SocialPlatform = Database['public']['Enums']['social_platform']

export async function addSocialLink(
  contactId: string,
  platform: SocialPlatform,
  url: string,
): Promise<{ success: true; id: string } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const { data, error } = await supabase
    .from('social_links')
    .insert({
      contact_id: contactId,
      profile_id: profile.id,
      platform,
      url: url.trim(),
    })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'Failed to add social link' }

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'addSocialLink',
      entityType: 'social_link',
      entityId: data.id,
      payload: {},
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[addSocialLink] appendActionLog failed:', e)
  }

  revalidatePath('/contacts/' + contactId)
  return { success: true, id: data.id }
}

export async function updateSocialLink(
  linkId: string,
  contactId: string,
  platform: SocialPlatform,
  url: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  // Read before-snapshot
  const { data: before } = await supabase
    .from('social_links')
    .select('platform, url')
    .eq('id', linkId)
    .eq('profile_id', profile.id)
    .maybeSingle()

  const { error } = await supabase
    .from('social_links')
    .update({ platform, url: url.trim() })
    .eq('id', linkId)
    .eq('profile_id', profile.id)

  if (error) return { error: error.message }

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'updateSocialLink',
      entityType: 'social_link',
      entityId: linkId,
      payload: { platform: before?.platform ?? null, url: before?.url ?? null },
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[updateSocialLink] appendActionLog failed:', e)
  }

  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

export async function deleteSocialLink(
  linkId: string,
  contactId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('social_links')
    .delete()
    .eq('id', linkId)
    .eq('profile_id', profile.id)

  if (error) return { error: error.message }

  // deleteSocialLink has no undo (excluded from issue enum)
  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type SocialPlatform = Database['public']['Enums']['social_platform']

export async function addSocialLink(
  contactId: string,
  platform: SocialPlatform,
  url: string,
): Promise<{ success: true; id: string } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { data, error } = await supabase
    .from('social_links')
    .insert({
      contact_id: contactId,
      profile_id: profileId,
      platform,
      url: url.trim(),
    })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'Failed to add social link' }

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
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('social_links')
    .update({ platform, url: url.trim() })
    .eq('id', linkId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

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
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('social_links')
    .delete()
    .eq('id', linkId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

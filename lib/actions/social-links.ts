'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type SocialPlatform = Database['public']['Enums']['social_platform']

/** Resolve Clerk userId → profile id. Returns null when not found. */
async function getProfileId(clerkUserId: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .maybeSingle() as { data: { id: string } | null }
  return data?.id ?? null
}

// ---------------------------------------------------------------------------
// addSocialLink
// ---------------------------------------------------------------------------

export async function addSocialLink(
  contactId: string,
  platform: SocialPlatform,
  url: string,
): Promise<{ success: true; id: string } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const profileId = await getProfileId(userId)
  if (!profileId) return { error: 'Profile not found' }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await (supabase as any).from('social_links').insert({
    contact_id: contactId,
    profile_id: profileId,
    platform,
    url: url.trim(),
  }).select('id').single() as { data: { id: string } | null; error: { message: string } | null }

  if (error || !data) return { error: error?.message ?? 'Failed to add social link' }

  revalidatePath(`/contacts/${contactId}`)
  return { success: true, id: data.id }
}

// ---------------------------------------------------------------------------
// updateSocialLink
// ---------------------------------------------------------------------------

export async function updateSocialLink(
  linkId: string,
  contactId: string,
  platform: SocialPlatform,
  url: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const profileId = await getProfileId(userId)
  if (!profileId) return { error: 'Profile not found' }

  const supabase = await createSupabaseServerClient()

  const { error } = await (supabase as any)
    .from('social_links')
    .update({ platform, url: url.trim() })
    .eq('id', linkId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

  revalidatePath(`/contacts/${contactId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// deleteSocialLink
// ---------------------------------------------------------------------------

export async function deleteSocialLink(
  linkId: string,
  contactId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const profileId = await getProfileId(userId)
  if (!profileId) return { error: 'Profile not found' }

  const supabase = await createSupabaseServerClient()

  const { error } = await (supabase as any)
    .from('social_links')
    .delete()
    .eq('id', linkId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

  revalidatePath(`/contacts/${contactId}`)
  return { success: true }
}

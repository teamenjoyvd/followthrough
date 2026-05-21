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
  profileId: string,
  platform: SocialPlatform,
  url: string,
): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const resolvedProfileId = await getProfileId(userId)
  if (!resolvedProfileId) return { error: 'Profile not found' }
  if (resolvedProfileId !== profileId) return { error: 'Forbidden' }

  const supabase = await createSupabaseServerClient()

  const { error } = await (supabase as any).from('social_links').insert({
    contact_id: contactId,
    profile_id: profileId,
    platform,
    url: url.trim(),
  })

  if (error) return { error: error.message }

  revalidatePath(`/contacts/${contactId}`)
  return {}
}

// ---------------------------------------------------------------------------
// updateSocialLink
// ---------------------------------------------------------------------------

export async function updateSocialLink(
  linkId: string,
  contactId: string,
  platform: SocialPlatform,
  url: string,
): Promise<{ error?: string }> {
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
  return {}
}

// ---------------------------------------------------------------------------
// deleteSocialLink
// ---------------------------------------------------------------------------

export async function deleteSocialLink(
  linkId: string,
  contactId: string,
): Promise<{ error?: string }> {
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
  return {}
}

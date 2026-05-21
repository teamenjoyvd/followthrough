'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type SocialPlatform = Database['public']['Enums']['social_platform']

// ---------------------------------------------------------------------------
// addSocialLink
// ---------------------------------------------------------------------------

export async function addSocialLink(
  contactId: string,
  profileId: string,
  platform: SocialPlatform,
  url: string,
): Promise<{ error?: string }> {
  // TODO: auth check
  // TODO: insert social_links row guarded by profile_id
  // TODO: revalidatePath
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
  // TODO: auth check
  // TODO: update social_links row (platform, url) guarded by profile_id
  // TODO: revalidatePath
  return {}
}

// ---------------------------------------------------------------------------
// deleteSocialLink
// ---------------------------------------------------------------------------

export async function deleteSocialLink(
  linkId: string,
  contactId: string,
): Promise<{ error?: string }> {
  // TODO: auth check
  // TODO: delete social_links row guarded by profile_id
  // TODO: revalidatePath
  return {}
}

'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type PhoneType = Database['public']['Enums']['phone_type']

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
// addPhoneNumber
// ---------------------------------------------------------------------------

export async function addPhoneNumber(
  contactId: string,
  profileId: string,
  number: string,
  type: PhoneType,
  makePrimary: boolean,
): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const resolvedProfileId = await getProfileId(userId)
  if (!resolvedProfileId) return { error: 'Profile not found' }
  if (resolvedProfileId !== profileId) return { error: 'Forbidden' }

  const supabase = await createSupabaseServerClient()

  // Enforce single primary: clear existing is_primary for this contact first.
  if (makePrimary) {
    await (supabase as any)
      .from('phone_numbers')
      .update({ is_primary: false })
      .eq('contact_id', contactId)
      .eq('profile_id', profileId)
  }

  const { error } = await (supabase as any).from('phone_numbers').insert({
    contact_id: contactId,
    profile_id: profileId,
    number: number.trim(),
    type,
    is_primary: makePrimary,
  })

  if (error) return { error: error.message }

  revalidatePath(`/contacts/${contactId}`)
  return {}
}

// ---------------------------------------------------------------------------
// updatePhoneNumber
// ---------------------------------------------------------------------------

export async function updatePhoneNumber(
  phoneId: string,
  contactId: string,
  number: string,
  type: PhoneType,
): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const profileId = await getProfileId(userId)
  if (!profileId) return { error: 'Profile not found' }

  const supabase = await createSupabaseServerClient()

  const { error } = await (supabase as any)
    .from('phone_numbers')
    .update({ number: number.trim(), type })
    .eq('id', phoneId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

  revalidatePath(`/contacts/${contactId}`)
  return {}
}

// ---------------------------------------------------------------------------
// deletePhoneNumber
// ---------------------------------------------------------------------------

export async function deletePhoneNumber(
  phoneId: string,
  contactId: string,
): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const profileId = await getProfileId(userId)
  if (!profileId) return { error: 'Profile not found' }

  const supabase = await createSupabaseServerClient()

  const { error } = await (supabase as any)
    .from('phone_numbers')
    .delete()
    .eq('id', phoneId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

  revalidatePath(`/contacts/${contactId}`)
  return {}
}

// ---------------------------------------------------------------------------
// setPrimary
// ---------------------------------------------------------------------------

/**
 * Clears is_primary on all phone numbers for the contact, then sets the target
 * row to is_primary = true. Enforced here in the server action — not a DB constraint.
 */
export async function setPrimary(
  phoneId: string,
  contactId: string,
  profileId: string,
): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const resolvedProfileId = await getProfileId(userId)
  if (!resolvedProfileId) return { error: 'Profile not found' }
  if (resolvedProfileId !== profileId) return { error: 'Forbidden' }

  const supabase = await createSupabaseServerClient()

  // Clear all primaries for this contact.
  const { error: clearError } = await (supabase as any)
    .from('phone_numbers')
    .update({ is_primary: false })
    .eq('contact_id', contactId)
    .eq('profile_id', profileId)

  if (clearError) return { error: clearError.message }

  // Set the target as primary.
  const { error: setError } = await (supabase as any)
    .from('phone_numbers')
    .update({ is_primary: true })
    .eq('id', phoneId)
    .eq('profile_id', profileId)

  if (setError) return { error: setError.message }

  revalidatePath(`/contacts/${contactId}`)
  return {}
}

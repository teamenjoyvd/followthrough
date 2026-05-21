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
  number: string,
  type: PhoneType,
  makePrimary: boolean,
): Promise<{ success: true; id: string } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const profileId = await getProfileId(userId)
  if (!profileId) return { error: 'Profile not found' }

  const supabase = await createSupabaseServerClient()

  // Enforce single primary: clear existing is_primary for this contact first.
  if (makePrimary) {
    await (supabase as any)
      .from('phone_numbers')
      .update({ is_primary: false })
      .eq('contact_id', contactId)
      .eq('profile_id', profileId)
  }

  const { data, error } = await (supabase as any).from('phone_numbers').insert({
    contact_id: contactId,
    profile_id: profileId,
    number: number.trim(),
    type,
    is_primary: makePrimary,
  }).select('id').single() as { data: { id: string } | null; error: { message: string } | null }

  if (error || !data) return { error: error?.message ?? 'Failed to add phone number' }

  revalidatePath(`/contacts/${contactId}`)
  return { success: true, id: data.id }
}

// ---------------------------------------------------------------------------
// updatePhoneNumber
// ---------------------------------------------------------------------------

export async function updatePhoneNumber(
  phoneId: string,
  contactId: string,
  number: string,
  type: PhoneType,
): Promise<{ success: true } | { error: string }> {
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
  return { success: true }
}

// ---------------------------------------------------------------------------
// deletePhoneNumber
// ---------------------------------------------------------------------------

export async function deletePhoneNumber(
  phoneId: string,
  contactId: string,
): Promise<{ success: true } | { error: string }> {
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
  return { success: true }
}

// ---------------------------------------------------------------------------
// setPrimary
// ---------------------------------------------------------------------------

/**
 * Clears is_primary on all phone numbers for the contact, then sets the target
 * row to is_primary = true. Enforced here in the server action — not a DB constraint.
 * profileId is resolved from the session — never trusted from the client.
 */
export async function setPrimary(
  phoneId: string,
  contactId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const profileId = await getProfileId(userId)
  if (!profileId) return { error: 'Profile not found' }

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
  return { success: true }
}

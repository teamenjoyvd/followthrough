'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type PhoneType = Database['public']['Enums']['phone_type']

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
  // TODO: auth check
  // TODO: if makePrimary, clear existing is_primary for this contact
  // TODO: insert phone_numbers row
  // TODO: revalidatePath
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
  // TODO: auth check
  // TODO: update phone_numbers row (number, type) guarded by profile_id
  // TODO: revalidatePath
  return {}
}

// ---------------------------------------------------------------------------
// deletePhoneNumber
// ---------------------------------------------------------------------------

export async function deletePhoneNumber(
  phoneId: string,
  contactId: string,
): Promise<{ error?: string }> {
  // TODO: auth check
  // TODO: delete phone_numbers row guarded by profile_id
  // TODO: revalidatePath
  return {}
}

// ---------------------------------------------------------------------------
// setPrimary
// ---------------------------------------------------------------------------

export async function setPrimary(
  phoneId: string,
  contactId: string,
  profileId: string,
): Promise<{ error?: string }> {
  // TODO: auth check
  // TODO: clear is_primary on all phone_numbers for this contact
  // TODO: set is_primary = true on the target row
  // TODO: revalidatePath
  return {}
}

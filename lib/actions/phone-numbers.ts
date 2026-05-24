'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfile } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import { appendActionLog } from './action-log'

type PhoneType = Database['public']['Enums']['phone_type']

export async function addPhoneNumber(
  contactId: string,
  number: string,
  type: PhoneType,
  makePrimary: boolean,
): Promise<{ success: true; id: string } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  if (makePrimary) {
    await supabase
      .from('phone_numbers')
      .update({ is_primary: false })
      .eq('contact_id', contactId)
      .eq('profile_id', profile.id)
  }

  const { data, error } = await supabase
    .from('phone_numbers')
    .insert({
      contact_id: contactId,
      profile_id: profile.id,
      number: number.trim(),
      type,
      is_primary: makePrimary,
    })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'Failed to add phone number' }

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'addPhoneNumber',
      entityType: 'phone_number',
      entityId: data.id,
      payload: {},
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[addPhoneNumber] appendActionLog failed:', e)
  }

  revalidatePath('/contacts/' + contactId)
  return { success: true, id: data.id }
}

export async function updatePhoneNumber(
  phoneId: string,
  contactId: string,
  number: string,
  type: PhoneType,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  // Read before-snapshot
  const { data: before } = await supabase
    .from('phone_numbers')
    .select('number, type')
    .eq('id', phoneId)
    .eq('profile_id', profile.id)
    .maybeSingle()

  const { error } = await supabase
    .from('phone_numbers')
    .update({ number: number.trim(), type })
    .eq('id', phoneId)
    .eq('profile_id', profile.id)

  if (error) return { error: error.message }

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'updatePhoneNumber',
      entityType: 'phone_number',
      entityId: phoneId,
      payload: { number: before?.number ?? null, type: before?.type ?? null },
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[updatePhoneNumber] appendActionLog failed:', e)
  }

  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

export async function deletePhoneNumber(
  phoneId: string,
  contactId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('phone_numbers')
    .delete()
    .eq('id', phoneId)
    .eq('profile_id', profile.id)

  if (error) return { error: error.message }

  // deletePhoneNumber has no undo (no before-snapshot captured; excluded from issue enum)
  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

export async function setPrimary(
  phoneId: string,
  contactId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const { error: clearError } = await supabase
    .from('phone_numbers')
    .update({ is_primary: false })
    .eq('contact_id', contactId)
    .eq('profile_id', profile.id)

  if (clearError) return { error: clearError.message }

  const { error: setError } = await supabase
    .from('phone_numbers')
    .update({ is_primary: true })
    .eq('id', phoneId)
    .eq('profile_id', profile.id)

  if (setError) return { error: setError.message }

  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

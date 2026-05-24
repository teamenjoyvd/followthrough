'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

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
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  if (makePrimary) {
    await supabase
      .from('phone_numbers')
      .update({ is_primary: false })
      .eq('contact_id', contactId)
      .eq('profile_id', profileId)
  }

  const { data, error } = await supabase
    .from('phone_numbers')
    .insert({
      contact_id: contactId,
      profile_id: profileId,
      number: number.trim(),
      type,
      is_primary: makePrimary,
    })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'Failed to add phone number' }

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
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('phone_numbers')
    .update({ number: number.trim(), type })
    .eq('id', phoneId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

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
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('phone_numbers')
    .delete()
    .eq('id', phoneId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

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
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error: clearError } = await supabase
    .from('phone_numbers')
    .update({ is_primary: false })
    .eq('contact_id', contactId)
    .eq('profile_id', profileId)

  if (clearError) return { error: clearError.message }

  const { error: setError } = await supabase
    .from('phone_numbers')
    .update({ is_primary: true })
    .eq('id', phoneId)
    .eq('profile_id', profileId)

  if (setError) return { error: setError.message }

  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

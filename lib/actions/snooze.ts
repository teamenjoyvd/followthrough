'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// snoozeContact
// Stores current pipeline_status in pre_snooze_status, sets status to
// 'snoozed', and records the wake-up date.
// ---------------------------------------------------------------------------

export async function snoozeContact(
  contactId: string,
  until: Date,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  // Read current status to store before overwriting
  const { data: contact, error: readError } = await supabase
    .from('contacts')
    .select('pipeline_status')
    .eq('id', contactId)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (readError || !contact) return { error: 'Contact not found' }

  const { error } = await supabase
    .from('contacts')
    .update({
      pre_snooze_status: contact.pipeline_status,
      pipeline_status: 'snoozed',
      snoozed_until: until.toISOString().split('T')[0], // date only
      on_working_list: false,
      working_list_added_at: null,
    })
    .eq('id', contactId)
    .eq('profile_id', profileId)
    .select()

  if (error) return { error: error.message || 'Failed to snooze contact' }

  revalidatePath('/workspace')
  revalidatePath(`/contacts/${contactId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// checkResurfaced
// Checks for any contacts where status is 'snoozed' and the snooze has expired
// (snoozed_until <= today). Restores their pre_snooze_status and generates
// a 'resurfaced' inbox notification.
// ---------------------------------------------------------------------------

export async function checkResurfaced(): Promise<{ success: true; count: number } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const todayStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const { data: count, error: rpcError } = await supabase
    .rpc('resurface_expired_contacts', {
      p_profile_id: profileId,
      p_today: todayStr
    })

  if (rpcError) {
    return { error: rpcError.message || 'Failed to resurface expired contacts' }
  }

  const resurfacedCount = Number(count) || 0

  if (resurfacedCount > 0) {
    revalidatePath('/workspace')
    revalidatePath('/inbox')
  }

  return { success: true, count: resurfacedCount }
}

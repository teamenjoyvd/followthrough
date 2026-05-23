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

  revalidatePath('/dashboard')
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

  const { data: contacts, error: fetchError } = await supabase
    .from('contacts')
    .select('id, pre_snooze_status')
    .eq('profile_id', profileId)
    .eq('pipeline_status', 'snoozed')
    .lte('snoozed_until', todayStr)

  if (fetchError) {
    return { error: fetchError.message || 'Failed to fetch expired snoozed contacts' }
  }

  if (!contacts || contacts.length === 0) {
    return { success: true, count: 0 }
  }

  // Group contacts by their next status to allow bulk updates
  const statusGroups: Record<string, string[]> = {}
  for (const contact of contacts) {
    const nextStatus = contact.pre_snooze_status || 'lead'
    if (!statusGroups[nextStatus]) {
      statusGroups[nextStatus] = []
    }
    statusGroups[nextStatus].push(contact.id)
  }

  // Perform bulk update for each unique status group
  for (const [status, ids] of Object.entries(statusGroups)) {
    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        pipeline_status: status,
        snoozed_until: null,
        pre_snooze_status: null,
      })
      .in('id', ids)
      .eq('profile_id', profileId)

    if (updateError) {
      console.error(`Failed to bulk resurface contacts for status ${status}:`, updateError.message)
    }
  }

  // Bulk-insert all 'resurfaced' notification items in the inbox in a single query
  const inboxInserts = contacts.map((contact) => ({
    profile_id: profileId,
    type: 'resurfaced',
    contact_id: contact.id,
    payload: { previous_status: contact.pre_snooze_status || null },
    read: false,
  }))

  if (inboxInserts.length > 0) {
    const { error: inboxError } = await supabase
      .from('inbox_items')
      .insert(inboxInserts)

    if (inboxError) {
      console.error('Failed to bulk insert inbox items for resurfaced contacts:', inboxError.message)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/inbox')
  return { success: true, count: contacts.length }
}

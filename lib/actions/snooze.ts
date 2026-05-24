'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfile } from '@/lib/supabase/server'
import { appendActionLog } from './action-log'

export async function snoozeContact(
  contactId: string,
  until: Date,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const { data: contact, error: readError } = await supabase
    .from('contacts')
    .select('pipeline_status, pre_snooze_status, snoozed_until, on_working_list')
    .eq('id', contactId)
    .eq('profile_id', profile.id)
    .maybeSingle()

  if (readError || !contact) return { error: 'Contact not found' }

  const { error } = await supabase
    .from('contacts')
    .update({
      pre_snooze_status: contact.pipeline_status,
      pipeline_status: 'snoozed',
      snoozed_until: until.toISOString().split('T')[0],
      on_working_list: false,
      working_list_added_at: null,
    })
    .eq('id', contactId)
    .eq('profile_id', profile.id)
    .select()

  if (error) return { error: error.message || 'Failed to snooze contact' }

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'snoozeContact',
      entityType: 'contact',
      entityId: contactId,
      payload: {
        pipeline_status: contact.pipeline_status,
        pre_snooze_status: contact.pre_snooze_status,
        snoozed_until: contact.snoozed_until,
        on_working_list: contact.on_working_list,
      },
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[snoozeContact] appendActionLog failed:', e)
  }

  revalidatePath('/workspace')
  revalidatePath(`/contacts/${contactId}`)
  return { success: true }
}

export async function checkResurfaced(): Promise<{ success: true; count: number } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const todayStr = new Date().toISOString().split('T')[0]

  const { data: count, error: rpcError } = await supabase
    .rpc('resurface_expired_contacts', {
      p_profile_id: profile.id,
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

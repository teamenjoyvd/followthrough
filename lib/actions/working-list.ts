'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfile } from '@/lib/supabase/server'
import { appendActionLog } from './action-log'

export async function addToWorkingList(
  contactId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('contacts')
    .update({ on_working_list: true, working_list_added_at: new Date().toISOString() })
    .eq('id', contactId)
    .eq('profile_id', profile.id)

  if (error) return { error: error.message || 'Failed to add to working list' }

  await supabase.from('inbox_items').insert({
    profile_id: profile.id,
    type: 'working_list_changed',
    contact_id: contactId,
    payload: { action: 'added' },
    read: false,
  })

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'addToWorkingList',
      entityType: 'contact',
      entityId: contactId,
      payload: { on_working_list: false },
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[addToWorkingList] appendActionLog failed:', e)
  }

  revalidatePath('/workspace')
  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

export async function removeFromWorkingList(
  contactId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  // Read before-snapshot for undo
  const { data: contact } = await supabase
    .from('contacts')
    .select('on_working_list, working_list_added_at')
    .eq('id', contactId)
    .eq('profile_id', profile.id)
    .maybeSingle()

  const { error } = await supabase
    .from('contacts')
    .update({ on_working_list: false, working_list_added_at: null })
    .eq('id', contactId)
    .eq('profile_id', profile.id)

  if (error) return { error: error.message || 'Failed to remove from working list' }

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'removeFromWorkingList',
      entityType: 'contact',
      entityId: contactId,
      payload: {
        on_working_list: true,
        working_list_added_at: contact?.working_list_added_at ?? null,
      },
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[removeFromWorkingList] appendActionLog failed:', e)
  }

  revalidatePath('/workspace')
  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

export async function markDone(
  contactId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  // Read before-snapshot for undo
  const { data: contact } = await supabase
    .from('contacts')
    .select('on_working_list, pipeline_status, last_contacted_at')
    .eq('id', contactId)
    .eq('profile_id', profile.id)
    .maybeSingle()

  const { error: rpcError } = await supabase
    .rpc('mark_done_with_note', {
      p_contact_id: contactId,
      p_profile_id: profile.id,
      p_note_body: 'Marked done from working list'
    })

  if (rpcError) {
    return { error: rpcError.message || 'Failed to complete task' }
  }

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'markDone',
      entityType: 'contact',
      entityId: contactId,
      payload: {
        on_working_list: contact?.on_working_list ?? false,
        pipeline_status: contact?.pipeline_status ?? null,
        last_contacted_at: contact?.last_contacted_at ?? null,
      },
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[markDone] appendActionLog failed:', e)
  }

  revalidatePath('/workspace')
  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

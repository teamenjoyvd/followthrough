'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'

export async function addToWorkingList(
  contactId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('contacts')
    .update({ on_working_list: true, working_list_added_at: new Date().toISOString() })
    .eq('id', contactId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message || 'Failed to add to working list' }

  await supabase.from('inbox_items').insert({
    profile_id: profileId,
    type: 'working_list_changed',
    contact_id: contactId,
    payload: { action: 'added' },
    read: false,
  })

  revalidatePath('/dashboard')
  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

export async function removeFromWorkingList(
  contactId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('contacts')
    .update({ on_working_list: false, working_list_added_at: null })
    .eq('id', contactId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message || 'Failed to remove from working list' }

  revalidatePath('/dashboard')
  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

export async function markDone(
  contactId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error: rpcError } = await supabase
    .rpc('mark_done_with_note', {
      p_contact_id: contactId,
      p_profile_id: profileId,
      p_note_body: 'Marked done from working list'
    })

  if (rpcError) {
    return { error: rpcError.message || 'Failed to complete task' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/contacts/' + contactId)
  return { success: true }
}

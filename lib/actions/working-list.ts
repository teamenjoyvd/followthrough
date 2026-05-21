'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// addToWorkingList
// ---------------------------------------------------------------------------

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
    .select()

  if (error) return { error: error.message || 'Failed to add to working list' }

  // Emit inbox item
  await supabase.from('inbox_items').insert({
    profile_id: profileId,
    type: 'working_list_changed',
    contact_id: contactId,
    payload: { action: 'added' },
    read: false,
  })

  revalidatePath('/dashboard')
  revalidatePath(`/contacts/${contactId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// removeFromWorkingList
// ---------------------------------------------------------------------------

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
    .select()

  if (error) return { error: error.message || 'Failed to remove from working list' }

  revalidatePath('/dashboard')
  revalidatePath(`/contacts/${contactId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// markDone — logs a no-interaction note completion, removes from working list
// ---------------------------------------------------------------------------

export async function markDone(
  contactId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  // Insert a note interaction to record the completion
  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert({ contact_id: contactId, profile_id: profileId, type: 'note' })
    .select('id')
    .single()

  if (interactionError) return { error: interactionError.message || 'Failed to log completion' }

  await supabase.from('note_details').insert({
    interaction_id: interaction.id,
    body: 'Marked done from working list',
  })

  // Remove from working list
  await supabase
    .from('contacts')
    .update({ on_working_list: false, working_list_added_at: null })
    .eq('id', contactId)
    .eq('profile_id', profileId)
    .select()

  revalidatePath('/dashboard')
  revalidatePath(`/contacts/${contactId}`)
  return { success: true }
}

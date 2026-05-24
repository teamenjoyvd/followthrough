'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfile } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import { appendActionLog } from './action-log'

type PipelineStatus = Database['public']['Enums']['pipeline_status']

export async function moveContact(
  contactId: string,
  newStatus: PipelineStatus,
  profileId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile || profile.id !== profileId) {
    return { error: 'Unauthorized' }
  }

  try {
    // Read before-snapshot
    const { data: before } = await supabase
      .from('contacts')
      .select('pipeline_status')
      .eq('id', contactId)
      .eq('profile_id', profile.id)
      .maybeSingle()

    const { error } = await supabase
      .from('contacts')
      .update({ pipeline_status: newStatus })
      .eq('id', contactId)
      .eq('profile_id', profile.id)

    if (error) return { error: error.message || 'Failed to move contact' }

    try {
      await appendActionLog({
        profileId: profile.id,
        actionType: 'moveContact',
        entityType: 'contact',
        entityId: contactId,
        payload: { pipeline_status: before?.pipeline_status ?? null },
        undoWindowSeconds: profile.undo_window_seconds,
      })
    } catch (e) {
      console.error('[moveContact] appendActionLog failed:', e)
    }

    revalidatePath('/pipeline')
    revalidatePath('/contacts')
    revalidatePath('/contacts/' + contactId)
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' }
  }
}

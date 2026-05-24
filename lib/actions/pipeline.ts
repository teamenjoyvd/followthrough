'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type PipelineStatus = Database['public']['Enums']['pipeline_status']

export async function moveContact(
  contactId: string,
  newStatus: PipelineStatus,
  profileId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const resolvedProfileId = await getProfileId(supabase, userId)
  if (!resolvedProfileId || resolvedProfileId !== profileId) {
    return { error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase
      .from('contacts')
      .update({ pipeline_status: newStatus })
      .eq('id', contactId)
      .eq('profile_id', resolvedProfileId)

    if (error) return { error: error.message || 'Failed to move contact' }

    revalidatePath('/pipeline')
    revalidatePath('/contacts')
    revalidatePath('/contacts/' + contactId)
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' }
  }
}

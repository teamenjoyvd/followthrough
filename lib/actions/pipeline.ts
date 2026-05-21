'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type PipelineStatus = Database['public']['Enums']['pipeline_status']

async function getProfileId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
): Promise<string | null> {
  const { data } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle()
  return (data as { id: string } | null)?.id ?? null
}

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
    const { error } = await (supabase as any)
      .from('contacts')
      .update({ pipeline_status: newStatus })
      .eq('id', contactId)
      .eq('profile_id', resolvedProfileId)

    if (error) return { error: error.message || 'Failed to move contact' }

    revalidatePath('/pipeline')
    revalidatePath('/contacts')
    revalidatePath(`/contacts/${contactId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' }
  }
}

'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export async function resolveConflict(
  conflictId: string,
  winner: 'ours' | 'google',
  profileId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()

  const verifiedProfileId = await getProfileId(supabase, userId)
  if (!verifiedProfileId || verifiedProfileId !== profileId) return { error: 'Unauthorized' }

  const { data: conflict } = await supabase
    .from('sync_conflicts')
    .select('*')
    .eq('id', conflictId)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (!conflict) return { error: 'Conflict not found' }
  if (conflict.resolved) return { error: 'Already resolved' }

  try {
    if (winner === 'google' && conflict.google_value !== null) {
      const update: any = {
        [conflict.field_name]: conflict.google_value,
      }
      const { error: updateErr } = await supabase
        .from('contacts')
        .update(update)
        .eq('id', conflict.contact_id)
        .eq('profile_id', profileId)

      if (updateErr) return { error: updateErr.message }
    }

    const { error: resolveErr } = await supabase
      .from('sync_conflicts')
      .update({ resolved: true })
      .eq('id', conflictId)
      .eq('profile_id', profileId)

    if (resolveErr) return { error: resolveErr.message }

    revalidatePath('/settings')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return { error: message }
  }
}

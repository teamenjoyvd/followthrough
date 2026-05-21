'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
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

  // Verify the profile belongs to this user
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .eq('id', profileId)
    .maybeSingle()

  if (!profile) return { error: 'Unauthorized' }

  // Fetch the conflict
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
      // Apply the Google value to the contact
      const update: ContactUpdate = {
        [conflict.field_name]: conflict.google_value,
      }
      const { error: updateErr } = await supabase
        .from('contacts')
        .update(update)
        .eq('id', conflict.contact_id)
        .eq('profile_id', profileId)

      if (updateErr) return { error: updateErr.message }
    }
    // If winner === 'ours', no contact update needed — just mark resolved

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

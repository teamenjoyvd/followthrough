'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

// ---------------------------------------------------------------------------
// markInboxItemRead
// ---------------------------------------------------------------------------

export async function markInboxItemRead(
  itemId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { error } = await (supabase as any)
    .from('inbox_items')
    .update({ read: true })
    .eq('id', itemId)
    .eq('profile_id', profileId) // RLS enforcement in-query

  if (error) return { error: error.message || 'Failed to mark read' }

  revalidatePath('/inbox')
  revalidatePath('/dashboard')
  return { success: true }
}

// ---------------------------------------------------------------------------
// getUnreadInboxCount — called server-side for nav badge
// ---------------------------------------------------------------------------

export async function getUnreadInboxCount(profileId: string): Promise<number> {
  const supabase = await createSupabaseServerClient()

  const { count, error } = await (supabase as any)
    .from('inbox_items')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('read', false)

  if (error) return 0
  return count ?? 0
}

'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'
import type { InboxItem as PopulatedInboxItem } from '@/types/inbox'

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

  const { error } = await supabase
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

export async function getUnreadInboxCount(): Promise<number> {
  const { userId } = await auth()
  if (!userId) return 0

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return 0

  const { count, error } = await supabase
    .from('inbox_items')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('read', false)

  if (error) return 0
  return count ?? 0
}

// ---------------------------------------------------------------------------
// getInboxItems
// ---------------------------------------------------------------------------

export async function getInboxItems(): Promise<PopulatedInboxItem[]> {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return []

  const { data, error } = await supabase
    .from('inbox_items')
    .select('*, contacts(first_name, last_name, company, pipeline_status)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch inbox items:', error)
    return []
  }

  return (data || []) as PopulatedInboxItem[]
}

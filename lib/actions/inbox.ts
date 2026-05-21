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

// ---------------------------------------------------------------------------
// getInboxItems
// ---------------------------------------------------------------------------

export interface PopulatedInboxItem {
  id: string
  type: 'resurfaced' | 'working_list_changed' | 'sync_conflict'
  contact_id: string | null
  payload: Record<string, any>
  read: boolean
  created_at: string
  contacts: {
    first_name: string
    last_name: string | null
    company: string | null
    pipeline_status: string
  } | null
}

export async function getInboxItems(profileId: string): Promise<PopulatedInboxItem[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await (supabase as any)
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


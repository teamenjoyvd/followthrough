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

// TODO: markInboxItemRead — set read=true on a single inbox_items row
export async function markInboxItemRead(itemId: string): Promise<{ success: true } | { error: string }> {
  // TODO: implement
  return { error: 'not implemented' }
}

// TODO: getUnreadCount — count inbox_items where read=false for current profile
export async function getUnreadInboxCount(profileId: string): Promise<number> {
  // TODO: implement
  return 0
}

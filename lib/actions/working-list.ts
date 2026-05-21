'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

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

// TODO: addToWorkingList — set on_working_list=true, working_list_added_at=now()
export async function addToWorkingList(contactId: string): Promise<{ success: true } | { error: string }> {
  // TODO: implement
  return { error: 'not implemented' }
}

// TODO: removeFromWorkingList — set on_working_list=false, working_list_added_at=null
export async function removeFromWorkingList(contactId: string): Promise<{ success: true } | { error: string }> {
  // TODO: implement
  return { error: 'not implemented' }
}

// TODO: markDone — log no-interaction note, remove from working list
export async function markDone(contactId: string): Promise<{ success: true } | { error: string }> {
  // TODO: implement
  return { error: 'not implemented' }
}

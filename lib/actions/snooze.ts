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

// TODO: snoozeContact — store pre_snooze_status, set pipeline_status='snoozed', set snoozed_until
export async function snoozeContact(
  contactId: string,
  until: Date,
): Promise<{ success: true } | { error: string }> {
  // TODO: implement
  return { error: 'not implemented' }
}

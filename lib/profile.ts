import { createSupabaseServiceClient } from './supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

/**
 * Ensures a profile row exists for the given Clerk user.
 * Uses the service client so it bypasses RLS (required for the upsert — the
 * anon client cannot insert into `profiles` before the profile exists).
 *
 * No-op if the profile already exists (upsert on `clerk_id`).
 */
export async function ensureProfile(
  clerkId: string,
  email: string,
  displayName: string,
): Promise<void> {
  const supabase = await createSupabaseServiceClient()

  // Optimize performance and avoid write-locking the database on every layout render:
  // check if a profile already exists before inserting a new one.
  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', clerkId)
    .maybeSingle()

  if (selectError) {
    console.error('[ensureProfile] select error:', selectError.message)
    return
  }

  // If no profile exists, provision a new one.
  if (!existing) {
    const { error: insertError } = await (supabase.from('profiles') as any).insert({
      clerk_id: clerkId,
      email,
      display_name: displayName,
    })

    if (insertError) {
      console.error('[ensureProfile] insert error:', insertError.message)
    }
  }
}

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
): Promise<{ id: string; display_name: string | null; followup_rules: any }> {
  const supabase = await createSupabaseServiceClient()

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      clerk_id: clerkId,
      email,
      display_name: displayName,
    }, { onConflict: 'clerk_id' })
    .select('id, display_name, followup_rules')
    .single()

  if (error) {
    console.error('[ensureProfile] upsert error:', error.message)
    throw new Error(`[ensureProfile] Failed to ensure profile: ${error.message}`)
  }

  return data
}

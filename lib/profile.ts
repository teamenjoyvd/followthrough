import { createSupabaseServiceClient } from '@/lib/supabase/server'

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

  const { error } = await supabase.from('profiles').upsert(
    {
      clerk_id: clerkId,
      email,
      display_name: displayName,
    },
    {
      onConflict: 'clerk_id',
      ignoreDuplicates: true, // no-op if the row already exists
    },
  )

  if (error) {
    // Non-fatal: log and continue — a missing profile means RLS will block
    // data reads, which surfaces naturally rather than crashing layout.
    console.error('[ensureProfile] upsert error:', error.message)
  }
}

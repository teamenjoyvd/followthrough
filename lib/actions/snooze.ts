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
// snoozeContact
// Stores current pipeline_status in pre_snooze_status, sets status to
// 'snoozed', and records the wake-up date.
// ---------------------------------------------------------------------------

export async function snoozeContact(
  contactId: string,
  until: Date,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  // Read current status to store before overwriting
  const { data: contact, error: readError } = await (supabase as any)
    .from('contacts')
    .select('pipeline_status')
    .eq('id', contactId)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (readError || !contact) return { error: 'Contact not found' }

  const { error } = await (supabase as any)
    .from('contacts')
    .update({
      pre_snooze_status: (contact as { pipeline_status: string }).pipeline_status,
      pipeline_status: 'snoozed',
      snoozed_until: until.toISOString().split('T')[0], // date only
      on_working_list: false,
      working_list_added_at: null,
    })
    .eq('id', contactId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message || 'Failed to snooze contact' }

  revalidatePath('/dashboard')
  revalidatePath(`/contacts/${contactId}`)
  return { success: true }
}

'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type CallOutcome = Database['public']['Enums']['call_outcome']
type InteractionInsert = Database['public']['Tables']['interactions']['Insert']

type LogCallInput = {
  contactId: string
  outcome: CallOutcome
  durationSeconds?: number
  summary?: string
}

type LogEmailInput = {
  contactId: string
  subject?: string
  body?: string
}

type LogNoteInput = {
  contactId: string
  body: string
}

export async function logCall(input: LogCallInput): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert({
      contact_id: input.contactId,
      profile_id: profileId,
      type: 'call',
    } satisfies InteractionInsert)
    .select('id')
    .single()

  if (interactionError || !interaction) {
    return { error: interactionError?.message ?? 'Failed to log interaction' }
  }

  const { error: detailError } = await supabase.from('call_details').insert({
    interaction_id: interaction.id,
    outcome: input.outcome,
    duration_seconds: input.durationSeconds ?? null,
    summary: input.summary ?? null,
  })
  if (detailError) return { error: detailError.message }

  await supabase
    .from('contacts')
    .update({ last_contacted_at: new Date().toISOString() } satisfies Database['public']['Tables']['contacts']['Update'])
    .eq('id', input.contactId)
    .eq('profile_id', profileId)

  revalidatePath('/contacts/' + input.contactId)
  return {}
}

export async function logEmail(input: LogEmailInput): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert({
      contact_id: input.contactId,
      profile_id: profileId,
      type: 'email',
    } satisfies InteractionInsert)
    .select('id')
    .single()

  if (interactionError || !interaction) {
    return { error: interactionError?.message ?? 'Failed to log interaction' }
  }

  const { error: detailError } = await supabase.from('email_details').insert({
    interaction_id: interaction.id,
    subject: input.subject ?? null,
    body: input.body ?? null,
  })
  if (detailError) return { error: detailError.message }

  await supabase
    .from('contacts')
    .update({ last_contacted_at: new Date().toISOString() } satisfies Database['public']['Tables']['contacts']['Update'])
    .eq('id', input.contactId)
    .eq('profile_id', profileId)

  revalidatePath('/contacts/' + input.contactId)
  return {}
}

export async function logNote(input: LogNoteInput): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert({
      contact_id: input.contactId,
      profile_id: profileId,
      type: 'note',
    } satisfies InteractionInsert)
    .select('id')
    .single()

  if (interactionError || !interaction) {
    return { error: interactionError?.message ?? 'Failed to log interaction' }
  }

  const { error: detailError } = await supabase.from('note_details').insert({
    interaction_id: interaction.id,
    body: input.body,
  })
  if (detailError) return { error: detailError.message }

  revalidatePath('/contacts/' + input.contactId)
  return {}
}

export async function deleteInteraction(
  interactionId: string,
  contactId: string
): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()

  // RLS enforces ownership — delete will silently no-op if not owner
  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('id', interactionId)

  if (error) return { error: error.message }

  revalidatePath('/contacts/' + contactId)
  return {}
}

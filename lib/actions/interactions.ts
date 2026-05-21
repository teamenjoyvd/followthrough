'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type CallOutcome = Database['public']['Enums']['call_outcome']
type InteractionInsert = Database['public']['Tables']['interactions']['Insert']
type CallDetailInsert = Database['public']['Tables']['call_details']['Insert']
type EmailDetailInsert = Database['public']['Tables']['email_details']['Insert']
type NoteDetailInsert = Database['public']['Tables']['note_details']['Insert']

type LogCallInput = {
  contactId: string
  profileId: string
  outcome: CallOutcome
  durationSeconds?: number
  summary?: string
}

type LogEmailInput = {
  contactId: string
  profileId: string
  subject?: string
  body?: string
}

type LogNoteInput = {
  contactId: string
  profileId: string
  body: string
}

/** Resolves the profile row for the authenticated Clerk user. */
async function resolveProfile(clerkUserId: string): Promise<{ id: string } | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .single()
  if (error || !data) return null
  return data as { id: string }
}

export async function logCall(input: LogCallInput): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const profile = await resolveProfile(userId)
  if (!profile) return { error: 'Profile not found' }
  if (profile.id !== input.profileId) return { error: 'Forbidden' }

  const supabase = await createSupabaseServerClient()

  const interactionRow: InteractionInsert = {
    contact_id: input.contactId,
    profile_id: input.profileId,
    type: 'call',
  }

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert(interactionRow)
    .select('id')
    .single()

  if (interactionError || !interaction) {
    return { error: interactionError?.message ?? 'Failed to log interaction' }
  }

  const callRow: CallDetailInsert = {
    interaction_id: (interaction as { id: string }).id,
    outcome: input.outcome,
    duration_seconds: input.durationSeconds ?? null,
    summary: input.summary ?? null,
  }

  const { error: detailError } = await supabase.from('call_details').insert(callRow)
  if (detailError) return { error: detailError.message }

  await supabase
    .from('contacts')
    .update({ last_contacted_at: new Date().toISOString() } satisfies Database['public']['Tables']['contacts']['Update'])
    .eq('id', input.contactId)
    .eq('profile_id', input.profileId)

  revalidatePath(`/contacts/${input.contactId}`)
  return {}
}

export async function logEmail(input: LogEmailInput): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const profile = await resolveProfile(userId)
  if (!profile) return { error: 'Profile not found' }
  if (profile.id !== input.profileId) return { error: 'Forbidden' }

  const supabase = await createSupabaseServerClient()

  const interactionRow: InteractionInsert = {
    contact_id: input.contactId,
    profile_id: input.profileId,
    type: 'email',
  }

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert(interactionRow)
    .select('id')
    .single()

  if (interactionError || !interaction) {
    return { error: interactionError?.message ?? 'Failed to log interaction' }
  }

  const emailRow: EmailDetailInsert = {
    interaction_id: (interaction as { id: string }).id,
    subject: input.subject ?? null,
    body: input.body ?? null,
  }

  const { error: detailError } = await supabase.from('email_details').insert(emailRow)
  if (detailError) return { error: detailError.message }

  await supabase
    .from('contacts')
    .update({ last_contacted_at: new Date().toISOString() } satisfies Database['public']['Tables']['contacts']['Update'])
    .eq('id', input.contactId)
    .eq('profile_id', input.profileId)

  revalidatePath(`/contacts/${input.contactId}`)
  return {}
}

export async function logNote(input: LogNoteInput): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const profile = await resolveProfile(userId)
  if (!profile) return { error: 'Profile not found' }
  if (profile.id !== input.profileId) return { error: 'Forbidden' }

  const supabase = await createSupabaseServerClient()

  const interactionRow: InteractionInsert = {
    contact_id: input.contactId,
    profile_id: input.profileId,
    type: 'note',
  }

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert(interactionRow)
    .select('id')
    .single()

  if (interactionError || !interaction) {
    return { error: interactionError?.message ?? 'Failed to log interaction' }
  }

  const noteRow: NoteDetailInsert = {
    interaction_id: (interaction as { id: string }).id,
    body: input.body,
  }

  const { error: detailError } = await supabase.from('note_details').insert(noteRow)
  if (detailError) return { error: detailError.message }

  revalidatePath(`/contacts/${input.contactId}`)
  return {}
}

export async function deleteInteraction(
  interactionId: string,
  contactId: string
): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('id', interactionId)

  if (error) return { error: error.message }

  revalidatePath(`/contacts/${contactId}`)
  return {}
}

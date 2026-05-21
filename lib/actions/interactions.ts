'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
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

function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/** Resolves the profile row for the authenticated Clerk user. */
async function resolveProfile(clerkUserId: string): Promise<{ id: string } | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .single()
  if (error || !data) return null
  return data
}

export async function logCall(input: LogCallInput): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const profile = await resolveProfile(userId)
  if (!profile) return { error: 'Profile not found' }
  if (profile.id !== input.profileId) return { error: 'Forbidden' }

  const supabase = getServiceClient()

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
    interaction_id: interaction.id,
    outcome: input.outcome,
    duration_seconds: input.durationSeconds ?? null,
    summary: input.summary ?? null,
  }

  const { error: detailError } = await supabase.from('call_details').insert(callRow)
  if (detailError) return { error: detailError.message }

  await supabase
    .from('contacts')
    .update({ last_contacted_at: new Date().toISOString() })
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

  const supabase = getServiceClient()

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
    interaction_id: interaction.id,
    subject: input.subject ?? null,
    body: input.body ?? null,
  }

  const { error: detailError } = await supabase.from('email_details').insert(emailRow)
  if (detailError) return { error: detailError.message }

  await supabase
    .from('contacts')
    .update({ last_contacted_at: new Date().toISOString() })
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

  const supabase = getServiceClient()

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
    interaction_id: interaction.id,
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

  const supabase = getServiceClient()

  // RLS enforces ownership — delete will silently no-op if not owner
  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('id', interactionId)

  if (error) return { error: error.message }

  revalidatePath(`/contacts/${contactId}`)
  return {}
}

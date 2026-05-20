'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type CallOutcome = Database['public']['Enums']['call_outcome']

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
async function resolveProfile(clerkUserId: string) {
  const supabase = await createSupabaseServerClient()
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

  const supabase = await createSupabaseServerClient()

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert({
      contact_id: input.contactId,
      profile_id: input.profileId,
      type: 'call',
    })
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

  if (detailError) {
    return { error: detailError.message }
  }

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

  const supabase = await createSupabaseServerClient()

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert({
      contact_id: input.contactId,
      profile_id: input.profileId,
      type: 'email',
    })
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

  if (detailError) {
    return { error: detailError.message }
  }

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

  const supabase = await createSupabaseServerClient()

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert({
      contact_id: input.contactId,
      profile_id: input.profileId,
      type: 'note',
    })
    .select('id')
    .single()

  if (interactionError || !interaction) {
    return { error: interactionError?.message ?? 'Failed to log interaction' }
  }

  const { error: detailError } = await supabase.from('note_details').insert({
    interaction_id: interaction.id,
    body: input.body,
  })

  if (detailError) {
    return { error: detailError.message }
  }

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

  // RLS enforces ownership — delete will silently no-op if not owner
  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('id', interactionId)

  if (error) return { error: error.message }

  revalidatePath(`/contacts/${contactId}`)
  return {}
}

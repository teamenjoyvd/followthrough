'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfile } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import { appendActionLog } from './action-log'

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
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert({
      contact_id: input.contactId,
      profile_id: profile.id,
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
    .eq('profile_id', profile.id)

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'logCall',
      entityType: 'interaction',
      entityId: interaction.id,
      payload: {},
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[logCall] appendActionLog failed:', e)
  }

  revalidatePath('/contacts/' + input.contactId)
  return {}
}

export async function logEmail(input: LogEmailInput): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert({
      contact_id: input.contactId,
      profile_id: profile.id,
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
    .eq('profile_id', profile.id)

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'logEmail',
      entityType: 'interaction',
      entityId: interaction.id,
      payload: {},
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[logEmail] appendActionLog failed:', e)
  }

  revalidatePath('/contacts/' + input.contactId)
  return {}
}

export async function logNote(input: LogNoteInput): Promise<{ error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .insert({
      contact_id: input.contactId,
      profile_id: profile.id,
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

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'logNote',
      entityType: 'interaction',
      entityId: interaction.id,
      payload: {},
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[logNote] appendActionLog failed:', e)
  }

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
  const profile = await getProfile(supabase, userId)
  if (!profile) return { error: 'Profile not found' }

  // Pre-read required for audit log — deleteInteraction previously had no before-read
  const { data: interactionRow } = await supabase
    .from('interactions')
    .select('type')
    .eq('id', interactionId)
    .maybeSingle()

  let detailSnapshot: Record<string, unknown> = {}
  if (interactionRow?.type === 'call') {
    const { data } = await supabase
      .from('call_details')
      .select('*')
      .eq('interaction_id', interactionId)
      .maybeSingle()
    if (data) detailSnapshot = data as Record<string, unknown>
  } else if (interactionRow?.type === 'note') {
    const { data } = await supabase
      .from('note_details')
      .select('*')
      .eq('interaction_id', interactionId)
      .maybeSingle()
    if (data) detailSnapshot = data as Record<string, unknown>
  } else if (interactionRow?.type === 'email') {
    const { data } = await supabase
      .from('email_details')
      .select('*')
      .eq('interaction_id', interactionId)
      .maybeSingle()
    if (data) detailSnapshot = data as Record<string, unknown>
  }

  // RLS enforces ownership
  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('id', interactionId)

  if (error) return { error: error.message }

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'deleteInteraction',
      entityType: 'interaction',
      entityId: interactionId,
      payload: { type: interactionRow?.type ?? null, detail: detailSnapshot },
      undoWindowSeconds: null, // confirm-popup action — not undoable
    })
  } catch (e) {
    console.error('[deleteInteraction] appendActionLog failed:', e)
  }

  revalidatePath('/contacts/' + contactId)
  return {}
}

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

type LogMeetingInput = {
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

  const { error: updateError } = await supabase
    .from('contacts')
    .update({ last_contacted_at: new Date().toISOString() } satisfies Database['public']['Tables']['contacts']['Update'])
    .eq('id', input.contactId)
    .eq('profile_id', profile.id)
  if (updateError) return { error: updateError.message }

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

export async function logMeeting(input: LogMeetingInput): Promise<{ error?: string }> {
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
      type: 'meeting',
    } satisfies InteractionInsert)
    .select('id')
    .single()

  if (interactionError || !interaction) {
    return { error: interactionError?.message ?? 'Failed to log interaction' }
  }

  const { error: detailError } = await supabase.from('meeting_details').insert({
    interaction_id: interaction.id,
    body: input.body,
  })
  if (detailError) {
    await supabase.from('interactions').delete().eq('id', interaction.id)
    return { error: detailError.message }
  }

  await supabase
    .from('contacts')
    .update({ last_contacted_at: new Date().toISOString() } satisfies Database['public']['Tables']['contacts']['Update'])
    .eq('id', input.contactId)
    .eq('profile_id', profile.id)

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'logMeeting',
      entityType: 'interaction',
      entityId: interaction.id,
      payload: {},
      undoWindowSeconds: profile.undo_window_seconds,
    })
  } catch (e) {
    console.error('[logMeeting] appendActionLog failed:', e)
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

  // Pre-read required for audit log — single query via resource embedding
  const { data: interaction } = await supabase
    .from('interactions')
    .select('type, call_details(*), note_details(*), email_details(*), meeting_details(*)')
    .eq('id', interactionId)
    .eq('profile_id', profile.id)
    .maybeSingle()

  if (!interaction) return { error: 'Interaction not found' }

  let detailSnapshot: Record<string, unknown> = {}
  const cd = (interaction as any).call_details
  const nd = (interaction as any).note_details
  const ed = (interaction as any).email_details
  const md = (interaction as any).meeting_details
  if (interaction.type === 'call' && cd?.[0]) {
    detailSnapshot = cd[0] as Record<string, unknown>
  } else if (interaction.type === 'note' && nd?.[0]) {
    detailSnapshot = nd[0] as Record<string, unknown>
  } else if (interaction.type === 'email' && ed?.[0]) {
    detailSnapshot = ed[0] as Record<string, unknown>
  } else if (interaction.type === 'meeting' && md?.[0]) {
    detailSnapshot = md[0] as Record<string, unknown>
  }

  // RLS enforces ownership; profile_id filter adds defence-in-depth
  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('id', interactionId)
    .eq('profile_id', profile.id)

  if (error) return { error: error.message }

  try {
    await appendActionLog({
      profileId: profile.id,
      actionType: 'deleteInteraction',
      entityType: 'interaction',
      entityId: interactionId,
      payload: { type: interaction.type, detail: detailSnapshot },
      undoWindowSeconds: null, // confirm-popup action — not undoable
    })
  } catch (e) {
    console.error('[deleteInteraction] appendActionLog failed:', e)
  }

  revalidatePath('/contacts/' + contactId)
  return {}
}

export async function getContactTimelineAndLabels(contactId: string): Promise<{
  success: boolean
  interactions?: any[]
  activeLabelIds?: string[]
  error?: string
}> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profile = await getProfile(supabase, userId)
  if (!profile) return { success: false, error: 'Profile not found' }

  // 1. Fetch active label assignments
  const { data: labelData, error: labelError } = await supabase
    .from('contact_labels')
    .select('label_id')
    .eq('contact_id', contactId)
    .eq('profile_id', profile.id)

  if (labelError) {
    return { success: false, error: labelError.message }
  }

  // 2. Fetch timeline
  const { data: interData, error: interError } = await supabase
    .from('interactions')
    .select('id, type, created_at, note_details(body), call_details(outcome, summary), email_details(subject, body), meeting_details(body)')
    .eq('contact_id', contactId)
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })

  if (interError) {
    return { success: false, error: interError.message }
  }

  return {
    success: true,
    interactions: interData || [],
    activeLabelIds: labelData?.map(l => l.label_id) || [],
  }
}

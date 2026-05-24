'use server'

import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient, getProfile } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// appendActionLog
// Fire-and-forget: failure MUST NOT fail the parent action.
// undoWindowSeconds = null => confirm-popup action, undo_expires_at = NULL
// ---------------------------------------------------------------------------
export async function appendActionLog(input: {
  profileId: string
  actionType: string
  entityType: string
  entityId?: string
  payload: Record<string, unknown>
  undoWindowSeconds: number | null
}): Promise<{ logId: string } | { error: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const db = supabase as any // action_log not yet in generated types

    const undoExpiresAt =
      input.undoWindowSeconds !== null
        ? new Date(Date.now() + input.undoWindowSeconds * 1000).toISOString()
        : null

    const { data, error } = await db
      .from('action_log')
      .insert({
        profile_id: input.profileId,
        action_type: input.actionType,
        entity_type: input.entityType,
        entity_id: input.entityId ?? null,
        payload: input.payload,
        undo_expires_at: undoExpiresAt,
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('[appendActionLog] insert error:', error)
      return { error: error?.message ?? 'Failed to append action log' }
    }

    return { logId: data.id }
  } catch (err: any) {
    console.error('[appendActionLog] unexpected error:', err)
    return { error: err.message ?? 'Failed to append action log' }
  }
}

// ---------------------------------------------------------------------------
// undoAction
// Called from client (Issue E ActionToast). Reverses the action and marks
// the original log row as undone.
// ---------------------------------------------------------------------------
export async function undoAction(
  logId: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  try {
    const supabase = await createSupabaseServerClient()
    const db = supabase as any // action_log not yet in generated types

    const profile = await getProfile(supabase, userId)
    if (!profile) return { error: 'Profile not found' }

    // 1. Fetch and validate the log row
    const { data: logRow, error: fetchError } = await db
      .from('action_log')
      .select('*')
      .eq('id', logId)
      .eq('profile_id', profile.id)
      .maybeSingle()

    if (fetchError || !logRow) return { error: 'Action log entry not found' }
    if (logRow.undone_at) return { error: 'Action has already been undone' }
    if (!logRow.undo_expires_at) return { error: 'This action cannot be undone' }
    if (new Date(logRow.undo_expires_at) < new Date()) return { error: 'Undo window has expired' }

    const payload = logRow.payload as Record<string, unknown>
    const entityId = logRow.entity_id

    // 2. Execute the inverse mutation based on action_type
    switch (logRow.action_type) {
      // --- working list ---
      case 'addToWorkingList': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('contacts')
          .update({ on_working_list: false, working_list_added_at: null })
          .eq('id', entityId)
          .eq('profile_id', logRow.profile_id)
        break
      }
      case 'removeFromWorkingList': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('contacts')
          .update({
            on_working_list: true,
            working_list_added_at: (payload.working_list_added_at as string) ?? new Date().toISOString(),
          })
          .eq('id', entityId)
          .eq('profile_id', logRow.profile_id)
        break
      }
      case 'markDone': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('contacts')
          .update({
            on_working_list: payload.on_working_list as boolean,
            pipeline_status: payload.pipeline_status as any,
            last_contacted_at: payload.last_contacted_at as string ?? null,
          })
          .eq('id', entityId)
          .eq('profile_id', logRow.profile_id)
        break
      }
      // --- contacts ---
      case 'createContact': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('contacts')
          .delete()
          .eq('id', entityId)
          .eq('profile_id', logRow.profile_id)
        break
      }
      case 'updateContact':
      case 'updateContactDescription':
      case 'updatePipelineStatus':
      case 'moveContact':
      case 'pinContact':
      case 'unpinContact': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('contacts')
          .update(payload as any)
          .eq('id', entityId)
          .eq('profile_id', logRow.profile_id)
        break
      }
      case 'bulkUpdateContacts': {
        const snapshots = payload.snapshots as Array<{ id: string; [key: string]: unknown }>
        if (!snapshots?.length) return { error: 'Missing snapshots payload' }
        await Promise.all(
          snapshots.map((snap) => {
            const { id, ...fields } = snap
            return supabase
              .from('contacts')
              .update(fields as any)
              .eq('id', id)
              .eq('profile_id', logRow.profile_id)
          })
        )
        break
      }
      case 'updateProfile': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('profiles')
          .update(payload as any)
          .eq('id', entityId)
          .eq('clerk_id', userId)
        break
      }
      case 'updateFollowupRules': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('profiles')
          .update({ followup_rules: payload.followup_rules as any })
          .eq('id', entityId)
          .eq('clerk_id', userId)
        break
      }
      // --- interactions ---
      case 'logCall':
      case 'logEmail':
      case 'logNote': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('interactions')
          .delete()
          .eq('id', entityId)
          .eq('profile_id', logRow.profile_id)
        break
      }
      // --- snooze ---
      case 'snoozeContact': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('contacts')
          .update({
            pipeline_status: payload.pipeline_status as any,
            pre_snooze_status: payload.pre_snooze_status as any ?? null,
            snoozed_until: payload.snoozed_until as string ?? null,
            on_working_list: payload.on_working_list as boolean,
          })
          .eq('id', entityId)
          .eq('profile_id', logRow.profile_id)
        break
      }
      // --- inbox ---
      case 'markInboxItemRead': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('inbox_items')
          .update({ read: false })
          .eq('id', entityId)
          .eq('profile_id', logRow.profile_id)
        break
      }
      // --- phone numbers ---
      case 'addPhoneNumber': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('phone_numbers')
          .delete()
          .eq('id', entityId)
          .eq('profile_id', logRow.profile_id)
        break
      }
      case 'updatePhoneNumber': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('phone_numbers')
          .update({ number: payload.number as string, type: payload.type as any })
          .eq('id', entityId)
          .eq('profile_id', logRow.profile_id)
        break
      }
      // --- social links ---
      case 'addSocialLink': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('social_links')
          .delete()
          .eq('id', entityId)
          .eq('profile_id', logRow.profile_id)
        break
      }
      case 'updateSocialLink': {
        if (!entityId) return { error: 'Missing entity_id' }
        await supabase
          .from('social_links')
          .update({ platform: payload.platform as any, url: payload.url as string })
          .eq('id', entityId)
          .eq('profile_id', logRow.profile_id)
        break
      }
      default:
        return { error: 'Unsupported action type: ' + logRow.action_type }
    }

    // 3. Mark original row as undone
    await db
      .from('action_log')
      .update({ undone_at: new Date().toISOString() })
      .eq('id', logId)
      .eq('profile_id', profile.id)

    // 4. Insert undo log row
    await db.from('action_log').insert({
      profile_id: logRow.profile_id,
      action_type: 'undo_' + logRow.action_type,
      entity_type: logRow.entity_type,
      entity_id: logRow.entity_id,
      payload: { original_log_id: logId },
      undo_expires_at: null,
    })

    return { success: true }
  } catch (err: any) {
    console.error('[undoAction] unexpected error:', err)
    return { error: err.message ?? 'Failed to undo action' }
  }
}

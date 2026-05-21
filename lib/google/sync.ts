import { createSupabaseServerClient } from '@/lib/supabase/server'
import { detectConflicts } from './conflict'
import type { Database } from '@/types/supabase'

type ContactRow = Database['public']['Tables']['contacts']['Row']
type ContactInsert = Database['public']['Tables']['contacts']['Insert']
type ContactUpdate = Database['public']['Tables']['contacts']['Update']
type SyncConflictInsert = Database['public']['Tables']['sync_conflicts']['Insert']
type InboxItemInsert = Database['public']['Tables']['inbox_items']['Insert']

export interface GooglePerson {
  resourceName: string // e.g. "people/c12345"
  names?: Array<{ givenName?: string; familyName?: string; displayName?: string }>
  emailAddresses?: Array<{ value?: string }>
  organizations?: Array<{ name?: string; title?: string }>
}

/** Map a Google People API person to our contact shape */
export function mapPersonToContact(
  person: GooglePerson,
  profileId: string,
): any {
  const name = person.names?.[0]
  const email = person.emailAddresses?.[0]?.value ?? null
  const org = person.organizations?.[0]

  return {
    profile_id: profileId,
    first_name: name?.givenName ?? name?.displayName ?? 'Unknown',
    last_name: name?.familyName ?? null,
    email,
    company: org?.name ?? null,
    job_title: org?.title ?? null,
    google_contact_id: person.resourceName,
  }
}

export interface SyncResult {
  upserted: number
  conflictsCreated: number
  newSyncToken: string | null
}

/**
 * Core sync logic — no HTTP handling. Accepts already-fetched people list
 * and the current sync token. Returns counts and the new sync token.
 *
 * Design notes:
 * - Upserts on google_contact_id (not email) to handle email changes.
 * - Conflicts are written to sync_conflicts AND inbox_items so they surface
 *   in the inbox UI.
 * - Existing contacts with null google_contact_id are never overwritten by
 *   this path — only contacts with a matching google_contact_id are updated.
 */
export async function syncPeople(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  profileId: string,
  people: GooglePerson[],
  newSyncToken: string | null,
): Promise<SyncResult> {
  let upserted = 0
  let conflictsCreated = 0

  for (const person of people) {
    const mapped = mapPersonToContact(person, profileId)

    // Check if contact already exists for this google_contact_id
    const { data: existing } = await (supabase as any)
      .from('contacts')
      .select('*')
      .eq('profile_id', profileId)
      .eq('google_contact_id', person.resourceName)
      .maybeSingle()

    if (existing) {
      const conflicts = detectConflicts(existing as Partial<ContactRow>, mapped as Partial<ContactRow>)

      if (conflicts.length > 0) {
        // Write conflicts — do NOT overwrite our values
        const conflictRows = conflicts.map((c) => ({
          profile_id: profileId,
          contact_id: existing.id,
          field_name: c.field_name,
          our_value: c.our_value,
          google_value: c.google_value,
          resolved: false,
        }))

        await (supabase as any).from('sync_conflicts').insert(conflictRows)

        // Write one inbox item per conflicted contact (not per field)
        const inboxRow: any = {
          profile_id: profileId,
          contact_id: existing.id,
          type: 'sync_conflict',
          payload: { conflict_count: conflicts.length, fields: conflicts.map((c) => c.field_name) },
          read: false,
        }
        await (supabase as any).from('inbox_items').insert(inboxRow)

        conflictsCreated += conflicts.length
      } else {
        // No conflicts — safe to update non-null incoming fields
        const update: any = {}
        if (mapped.first_name) update.first_name = mapped.first_name
        if (mapped.last_name !== undefined) update.last_name = mapped.last_name
        if (mapped.email !== undefined) update.email = mapped.email
        if (mapped.company !== undefined) update.company = mapped.company
        if (mapped.job_title !== undefined) update.job_title = mapped.job_title

        await (supabase as any)
          .from('contacts')
          .update(update)
          .eq('id', existing.id)
          .eq('profile_id', profileId)
      }
    } else {
      // New contact from Google — insert
      await (supabase as any).from('contacts').insert(mapped)
    }

    upserted++
  }

  // Update sync state
  await (supabase as any)
    .from('google_sync_state')
    .update({ last_synced_at: new Date().toISOString(), sync_token: newSyncToken })
    .eq('profile_id', profileId)

  return { upserted, conflictsCreated, newSyncToken }
}

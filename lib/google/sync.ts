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
  phoneNumbers?: Array<{ value?: string; type?: string }>
}

/** Map a Google People API person to our contact shape */
export function mapPersonToContact(
  person: GooglePerson,
  profileId: string,
): any {
  const name = person.names?.[0]
  const email = person.emailAddresses?.[0]?.value ?? null
  const org = person.organizations?.[0]

  const rawPhones = person.phoneNumbers ?? []
  const formattedPhones = rawPhones
    .map(p => ({
      number: p.value ?? '',
      type: (p.type === 'home' || p.type === 'work' || p.type === 'mobile') ? p.type : 'mobile'
    }))
    .filter(p => !!p.number)

  return {
    profile_id: profileId,
    first_name: name?.givenName ?? name?.displayName ?? 'Unknown',
    last_name: name?.familyName ?? null,
    email,
    company: org?.name ?? null,
    job_title: org?.title ?? null,
    google_contact_id: person.resourceName,
    phone_numbers: formattedPhones,
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

  if (people.length === 0) {
    const syncStateUpdate: any = {
      last_synced_at: new Date().toISOString(),
    }
    if (newSyncToken !== null) {
      syncStateUpdate.sync_token = newSyncToken
    }
    await (supabase as any)
      .from('google_sync_state')
      .update(syncStateUpdate)
      .eq('profile_id', profileId)

    return { upserted: 0, conflictsCreated: 0, newSyncToken }
  }

  // 1. Map all Google contacts and collect google_contact_ids (deduplicated)
  const seenGoogleIds = new Set<string>()
  const mappedPeople: any[] = []
  
  for (const person of people) {
    const mapped = mapPersonToContact(person, profileId)
    if (mapped.google_contact_id && !seenGoogleIds.has(mapped.google_contact_id)) {
      seenGoogleIds.add(mapped.google_contact_id)
      mappedPeople.push({ person, mapped })
    }
  }
  const googleContactIds = Array.from(seenGoogleIds)

  // 2. Fetch existing contacts in bulk (batch-fetched in chunks of 100 to bypass both PostgREST URL size limits and Supabase 1000-row limits)
  const existingContacts: any[] = []
  const batchSize = 100
  for (let i = 0; i < googleContactIds.length; i += batchSize) {
    const batchIds = googleContactIds.slice(i, i + batchSize)
    const { data: batchData, error } = await (supabase as any)
      .from('contacts')
      .select('*')
      .eq('profile_id', profileId)
      .in('google_contact_id', batchIds)
      .limit(batchSize)
    
    if (error) throw error
    if (batchData) {
      existingContacts.push(...batchData)
    }
  }

  // Create an O(1) lookup map matching google_contact_id -> existing ContactRow
  const existingMap = new Map<string, any>()
  for (const c of existingContacts) {
    if (c.google_contact_id) {
      existingMap.set(c.google_contact_id, c)
    }
  }

  const newContactsToInsert: any[] = []
  const conflictsToInsert: any[] = []
  const inboxItemsToInsert: any[] = []
  const updatesToRun: Promise<any>[] = []
  const existingPhonesMap = new Map<string, any[]>()

  // 3. Process each incoming contact
  for (const { person, mapped } of mappedPeople) {
    const existing = existingMap.get(mapped.google_contact_id)

    if (existing) {
      const conflicts = detectConflicts(existing, mapped)

      if (conflicts.length > 0) {
        // Collect conflicts for batch insert
        for (const c of conflicts) {
          conflictsToInsert.push({
            profile_id: profileId,
            contact_id: existing.id,
            field_name: c.field_name,
            our_value: c.our_value,
            google_value: c.google_value,
            resolved: false,
          })
        }

        // Collect inbox item to insert in batch (one per conflicted contact)
        inboxItemsToInsert.push({
          profile_id: profileId,
          contact_id: existing.id,
          type: 'sync_conflict',
          payload: { conflict_count: conflicts.length, fields: conflicts.map((c) => c.field_name) },
          read: false,
        })

        conflictsCreated += conflicts.length
      } else {
        // No conflicts — safe to update non-null incoming fields (additive)
        const update: any = {}
        if (mapped.first_name !== null) update.first_name = mapped.first_name
        if (mapped.last_name !== null) update.last_name = mapped.last_name
        if (mapped.email !== null) update.email = mapped.email
        if (mapped.company !== null) update.company = mapped.company
        if (mapped.job_title !== null) update.job_title = mapped.job_title

        // Only run update if there is actually a field to update
        if (Object.keys(update).length > 0) {
          updatesToRun.push(
            (supabase as any)
              .from('contacts')
              .update(update)
              .eq('id', existing.id)
              .eq('profile_id', profileId)
          )
        }

        // Collect phone numbers for existing contact if they have incoming phone numbers
        if (mapped.phone_numbers && mapped.phone_numbers.length > 0) {
          existingPhonesMap.set(existing.id, mapped.phone_numbers)
        }
      }
    } else {
      // New contact from Google — collect for batch insert
      newContactsToInsert.push(mapped)
    }

    upserted++
  }

  // 4. Perform database writes in batch

  // Bulk update existing contacts' phone numbers (Address GCR N+1 query issue)
  if (existingPhonesMap.size > 0) {
    const existingContactIds = Array.from(existingPhonesMap.keys())
    
    // 1 bulk select instead of N selects!
    const { data: phoneRecords, error: phoneFetchError } = await (supabase as any)
      .from('phone_numbers')
      .select('contact_id')
      .in('contact_id', existingContactIds)
      
    if (phoneFetchError) throw phoneFetchError

    const contactsWithPhones = new Set<string>()
    if (phoneRecords) {
      phoneRecords.forEach((r: any) => contactsWithPhones.add(r.contact_id))
    }

    const phoneBulkInserts: any[] = []
    existingPhonesMap.forEach((phones, contactId) => {
      if (!contactsWithPhones.has(contactId)) {
        phones.forEach((p, idx) => {
          phoneBulkInserts.push({
            contact_id: contactId,
            profile_id: profileId,
            number: p.number,
            type: p.type,
            is_primary: idx === 0
          })
        })
      }
    })

    if (phoneBulkInserts.length > 0) {
      // 1 bulk insert instead of N inserts!
      const { error: phoneInsertError } = await (supabase as any)
        .from('phone_numbers')
        .insert(phoneBulkInserts)
      if (phoneInsertError) throw phoneInsertError
    }
  }

  if (newContactsToInsert.length > 0) {
    // Strip temporary phone_numbers fields from the contacts insert payload
    const contactsPayload = newContactsToInsert.map(({ phone_numbers, ...rest }) => rest)
    const { data: insertedContacts, error } = await (supabase as any)
      .from('contacts')
      .insert(contactsPayload)
      .select('id, google_contact_id')
    
    if (error) throw error

    // Insert phone records for the newly created contacts
    if (insertedContacts && insertedContacts.length > 0) {
      const phoneInserts: any[] = []
      const idMap = new Map<string, string>()
      insertedContacts.forEach((c: any) => {
        if (c.google_contact_id) idMap.set(c.google_contact_id, c.id)
      })

      newContactsToInsert.forEach((c: any) => {
        const contactId = idMap.get(c.google_contact_id)
        if (contactId && c.phone_numbers && c.phone_numbers.length > 0) {
          c.phone_numbers.forEach((p: any, idx: number) => {
            phoneInserts.push({
              contact_id: contactId,
              profile_id: profileId,
              number: p.number,
              type: p.type,
              is_primary: idx === 0
            })
          })
        }
      })

      if (phoneInserts.length > 0) {
        const { error: phoneError } = await (supabase as any)
          .from('phone_numbers')
          .insert(phoneInserts)
        if (phoneError) throw phoneError
      }
    }
  }

  if (conflictsToInsert.length > 0) {
    const { error } = await (supabase as any)
      .from('sync_conflicts')
      .insert(conflictsToInsert)
    if (error) throw error
  }

  if (inboxItemsToInsert.length > 0) {
    const { error } = await (supabase as any)
      .from('inbox_items')
      .insert(inboxItemsToInsert)
    if (error) throw error
  }

  if (updatesToRun.length > 0) {
    await Promise.all(updatesToRun)
  }

  // 5. Update sync state — conditionally set sync_token only if non-null
  const syncStateUpdate: any = {
    last_synced_at: new Date().toISOString(),
  }
  if (newSyncToken !== null) {
    syncStateUpdate.sync_token = newSyncToken
  }

  await (supabase as any)
    .from('google_sync_state')
    .update(syncStateUpdate)
    .eq('profile_id', profileId)

  return { upserted, conflictsCreated, newSyncToken }
}

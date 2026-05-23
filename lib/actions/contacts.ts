'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type PipelineStatus = Database['public']['Enums']['pipeline_status']

// ---------------------------------------------------------------------------
// createContact
// ---------------------------------------------------------------------------

export async function createContact(formData: FormData): Promise<{ success: true; id: string } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const firstName = formData.get('first_name') as string
  const lastName = (formData.get('last_name') as string) || null
  const email = (formData.get('email') as string) || null
  const phone = (formData.get('phone') as string) || null
  const company = (formData.get('company') as string) || null
  const jobTitle = (formData.get('job_title') as string) || null

  if (!firstName?.trim()) {
    return { error: 'First name is required' }
  }

  try {
    // Single atomic database-level RPC query preventing dirty orphan rows
    const { data: contactId, error: rpcError } = await supabase
      .rpc('create_contact_with_phone', {
        p_profile_id: profileId,
        p_first_name: firstName.trim(),
        p_last_name: lastName?.trim() || null,
        p_email: email?.trim() || null,
        p_company: company?.trim() || null,
        p_job_title: jobTitle?.trim() || null,
        p_phone: phone?.trim() || null
      })

    if (rpcError) {
      return { error: rpcError.message || 'Failed to create contact' }
    }

    if (!contactId) {
      return { error: 'Failed to create contact: No ID returned' }
    }

    revalidatePath('/contacts')
    return { success: true, id: contactId }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' }
  }
}

// ---------------------------------------------------------------------------
// updateContact
// ---------------------------------------------------------------------------

export async function updateContact(contactId: string, formData: FormData): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  const firstName = formData.get('first_name') as string
  const phone = (formData.get('phone') as string) || null

  if (!firstName?.trim()) {
    return { error: 'First name is required' }
  }

  try {
    const { error } = await supabase
      .from('contacts')
      .update({
        first_name: firstName.trim(),
        last_name: ((formData.get('last_name') as string) || '').trim() || null,
        email: ((formData.get('email') as string) || '').trim() || null,
        company: ((formData.get('company') as string) || '').trim() || null,
        job_title: ((formData.get('job_title') as string) || '').trim() || null,
        last_updated_by_source: 'manual'
      })
      .eq('id', contactId)
      .eq('profile_id', profileId)

    if (error) {
      return { error: error.message || 'Failed to update contact' }
    }

    // Dynamic phone numbers updating logic
    const { data: existingPrimary, error: fetchError } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('contact_id', contactId)
      .eq('profile_id', profileId)
      .eq('is_primary', true)
      .maybeSingle()

    if (fetchError) return { error: fetchError.message || 'Failed to fetch phone details' }

    if (phone?.trim()) {
      if (existingPrimary) {
        const { error: updateError } = await supabase
          .from('phone_numbers')
          .update({ number: phone.trim() })
          .eq('id', existingPrimary.id)
        if (updateError) return { error: updateError.message || 'Failed to update phone number' }
      } else {
        const { error: insertError } = await supabase
          .from('phone_numbers')
          .insert({
            contact_id: contactId,
            profile_id: profileId,
            number: phone.trim(),
            type: 'mobile',
            is_primary: true
          })
        if (insertError) return { error: insertError.message || 'Failed to add phone number' }
      }
    } else if (existingPrimary) {
      const { error: deleteError } = await supabase
          .from('phone_numbers')
          .delete()
          .eq('id', existingPrimary.id)
      if (deleteError) return { error: deleteError.message || 'Failed to remove phone number' }
    }

    revalidatePath('/contacts')
    revalidatePath(`/contacts/${contactId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' }
  }
}

// ---------------------------------------------------------------------------
// deleteContact
// ---------------------------------------------------------------------------

export async function deleteContact(contactId: string): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId)
      .eq('profile_id', profileId)

    if (error) {
      return { error: error.message || 'Failed to delete contact' }
    }

    revalidatePath('/contacts')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' }
  }
}

// ---------------------------------------------------------------------------
// updatePipelineStatus
// ---------------------------------------------------------------------------

export async function updatePipelineStatus(contactId: string, status: PipelineStatus): Promise<void> {
  const { userId } = await auth()
  if (!userId) return

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return

  await supabase
    .from('contacts')
    .update({ pipeline_status: status })
    .eq('id', contactId)
    .eq('profile_id', profileId)

  revalidatePath('/contacts')
  revalidatePath(`/contacts/${contactId}`)
}

// ---------------------------------------------------------------------------
// CSV Import & Rollback actions
// ---------------------------------------------------------------------------

interface CSVContactRow {
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  company?: string
  job_title?: string
}

export async function importContactsFromCSV(
  filename: string,
  rows: CSVContactRow[]
): Promise<{ success: true; imported: number; logId: string } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  if (rows.length === 0) return { error: 'No contact records found in file' }

  try {
    // 1. Create the import log record
    const { data: logRecord, error: logError } = await supabase
      .from('csv_imports_log')
      .insert({
        profile_id: profileId,
        filename,
        record_count: rows.length
      })
      .select('id')
      .single()

    if (logError) throw logError
    const logId = logRecord.id

    // 2. Prepare contacts bulk insert payload
    const contactsPayload = rows.map(r => ({
      profile_id: profileId,
      first_name: r.first_name?.trim() || 'Unknown',
      last_name: r.last_name?.trim() || null,
      email: r.email?.trim() || null,
      company: r.company?.trim() || null,
      job_title: r.job_title?.trim() || null,
      created_by_source: 'csv_import',
      last_updated_by_source: 'csv_import',
      source_detail: filename,
      import_log_id: logId
    }))

    // 3. Insert contacts & phone numbers in batches to prevent hitting query parameter limits
    const batchSize = 100
    const phoneInserts: any[] = []
    let totalImported = 0

    for (let i = 0; i < rows.length; i += batchSize) {
      const batchRows = rows.slice(i, i + batchSize)
      const batchPayload = batchRows.map(r => ({
        profile_id: profileId,
        first_name: r.first_name?.trim() || 'Unknown',
        last_name: r.last_name?.trim() || null,
        email: r.email?.trim() || null,
        company: r.company?.trim() || null,
        job_title: r.job_title?.trim() || null,
        created_by_source: 'csv_import',
        last_updated_by_source: 'csv_import',
        source_detail: filename,
        import_log_id: logId
      }))

      // Build a map of compositeKey -> array of original row indices in batchRows
      const compositeMap = new Map<string, number[]>()
      batchRows.forEach((row, index) => {
        const key = `${(row.first_name || 'Unknown').trim().toLowerCase()}||${(row.last_name || '').trim().toLowerCase()}||${(row.email || '').trim().toLowerCase()}||${(row.company || '').trim().toLowerCase()}||${(row.job_title || '').trim().toLowerCase()}`
        if (!compositeMap.has(key)) {
          compositeMap.set(key, [])
        }
        compositeMap.get(key)!.push(index)
      })

      const { data: inserted, error: insertError } = await supabase
        .from('contacts')
        .insert(batchPayload)
        .select('id, first_name, last_name, email, company, job_title')

      if (insertError) throw insertError
      
      if (inserted) {
        totalImported += inserted.length
        inserted.forEach((contact: {
          id: string
          first_name: string
          last_name: string | null
          email: string | null
          company: string | null
          job_title: string | null
        }) => {
          const key = `${(contact.first_name || 'Unknown').trim().toLowerCase()}||${(contact.last_name || '').trim().toLowerCase()}||${(contact.email || '').trim().toLowerCase()}||${(contact.company || '').trim().toLowerCase()}||${(contact.job_title || '').trim().toLowerCase()}`
          const indices = compositeMap.get(key)
          if (indices && indices.length > 0) {
            const originalIndex = indices.shift()!
            const originalRow = batchRows[originalIndex]
            if (originalRow.phone?.trim()) {
              phoneInserts.push({
                contact_id: contact.id,
                profile_id: profileId,
                number: originalRow.phone.trim(),
                type: 'mobile',
                is_primary: true
              })
            }
          }
        })
      }
    }

    // 4. Insert phone records in bulk for the imported contacts
    if (phoneInserts.length > 0) {
      const { error: phoneError } = await supabase
        .from('phone_numbers')
        .insert(phoneInserts)
      if (phoneError) throw phoneError
    }

    revalidatePath('/contacts')
    return { success: true, imported: totalImported, logId }
  } catch (err: any) {
    return { error: err.message || 'CSV Import failed' }
  }
}

export async function rollbackCSVImport(logId: string): Promise<{ success: true; deletedCount: number } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  try {
    const { data: logRecord, error: logFetchError } = await supabase
      .from('csv_imports_log')
      .select('filename')
      .eq('id', logId)
      .eq('profile_id', profileId)
      .maybeSingle()

    if (logFetchError) throw logFetchError
    if (!logRecord) return { error: 'Import log batch not found' }

    const { data: deleted, error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .eq('import_log_id', logId)
      .eq('profile_id', profileId)
      .select('id')

    if (deleteError) throw deleteError

    await supabase
      .from('csv_imports_log')
      .delete()
      .eq('id', logId)
      .eq('profile_id', profileId)

    revalidatePath('/contacts')
    return { success: true, deletedCount: deleted?.length || 0 }
  } catch (err: any) {
    return { error: err.message || 'Rollback failed' }
  }
}

// ---------------------------------------------------------------------------
// Bulk operations actions
// ---------------------------------------------------------------------------

export async function bulkUpdateContacts(
  contactIds: string[],
  updates: { pipeline_status?: PipelineStatus; snooze_until?: string | null; company?: string | null }
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  if (contactIds.length === 0) return { error: 'No contacts selected' }

  try {
    const payload: any = { last_updated_by_source: 'manual' }
    if (updates.pipeline_status !== undefined) payload.pipeline_status = updates.pipeline_status
    if (updates.snooze_until !== undefined) payload.snooze_until = updates.snooze_until
    if (updates.company !== undefined) payload.company = updates.company?.trim() || null

    const { error } = await supabase
      .from('contacts')
      .update(payload)
      .in('id', contactIds)
      .eq('profile_id', profileId)

    if (error) throw error

    revalidatePath('/contacts')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Bulk update failed' }
  }
}

export async function bulkDeleteContacts(contactIds: string[]): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  if (contactIds.length === 0) return { error: 'No contacts selected' }

  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .in('id', contactIds)
      .eq('profile_id', profileId)

    if (error) throw error

    revalidatePath('/contacts')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Bulk delete failed' }
  }
}

export async function bulkManageContactLabels(
  contactIds: string[],
  labelIds: string[],
  action: 'assign' | 'clear'
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  if (contactIds.length === 0) return { error: 'No contacts selected' }

  try {
    if (action === 'clear') {
      const { error } = await supabase
        .from('contact_labels')
        .delete()
        .in('contact_id', contactIds)
        .in('label_id', labelIds)
        .eq('profile_id', profileId)
      
      if (error) throw error
    } else {
      const inserts: any[] = []
      contactIds.forEach(cid => {
        labelIds.forEach(lid => {
          inserts.push({
            contact_id: cid,
            label_id: lid,
            profile_id: profileId
          })
        })
      })

      if (inserts.length > 0) {
        const { error } = await supabase
          .from('contact_labels')
          .upsert(inserts, { onConflict: 'contact_id,label_id' })
        if (error) throw error
      }
    }

    revalidatePath('/contacts')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Bulk label management failed' }
  }
}

// ---------------------------------------------------------------------------
// Labels CRUD actions
// ---------------------------------------------------------------------------

export async function createLabel(name: string, color: string): Promise<{ success: true; id: string } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  if (!name?.trim()) return { error: 'Label name is required' }

  try {
    const { data, error } = await supabase
      .from('labels')
      .insert({
        profile_id: profileId,
        name: name.trim(),
        color
      })
      .select('id')
      .single()

    if (error) throw error

    revalidatePath('/contacts')
    return { success: true, id: data.id }
  } catch (err: any) {
    return { error: err.message || 'Failed to create label' }
  }
}

export async function updateLabel(labelId: string, name: string, color: string): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  if (!name?.trim()) return { error: 'Label name is required' }

  try {
    const { error } = await supabase
      .from('labels')
      .update({ name: name.trim(), color })
      .eq('id', labelId)
      .eq('profile_id', profileId)

    if (error) throw error

    revalidatePath('/contacts')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to update label' }
  }
}

export async function deleteLabel(labelId: string): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return { error: 'Profile not found' }

  try {
    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', labelId)
      .eq('profile_id', profileId)

    if (error) throw error

    revalidatePath('/contacts')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to delete label' }
  }
}

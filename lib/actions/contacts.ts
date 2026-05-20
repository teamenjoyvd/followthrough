'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type PipelineStatus = Database['public']['Enums']['pipeline_status']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve clerk userId → profile id.
 * Cast to `any` as a known workaround: Supabase generic resolution drops to
 * `never[]` for `from('profiles')` when types are re-exported across modules.
 */
async function getProfileId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
): Promise<string | null> {
  const { data } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle()
  return (data as { id: string } | null)?.id ?? null
}

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
  const company = (formData.get('company') as string) || null
  const jobTitle = (formData.get('job_title') as string) || null

  if (!firstName?.trim()) {
    return { error: 'First name is required' }
  }

  try {
    const { data, error } = await (supabase as any)
      .from('contacts')
      .insert({
        profile_id: profileId,
        first_name: firstName.trim(),
        last_name: lastName?.trim() || null,
        email: email?.trim() || null,
        company: company?.trim() || null,
        job_title: jobTitle?.trim() || null,
      })
      .select('id')
      .single()

    if (error) {
      return { error: error.message || 'Failed to create contact' }
    }

    revalidatePath('/contacts')
    return { success: true, id: (data as { id: string }).id }
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
  if (!firstName?.trim()) {
    return { error: 'First name is required' }
  }

  try {
    const { error } = await (supabase as any)
      .from('contacts')
      .update({
        first_name: firstName.trim(),
        last_name: ((formData.get('last_name') as string) || '').trim() || null,
        email: ((formData.get('email') as string) || '').trim() || null,
        company: ((formData.get('company') as string) || '').trim() || null,
        job_title: ((formData.get('job_title') as string) || '').trim() || null,
      })
      .eq('id', contactId)
      .eq('profile_id', profileId)

    if (error) {
      return { error: error.message || 'Failed to update contact' }
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
    const { error } = await (supabase as any)
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

  await (supabase as any)
    .from('contacts')
    .update({ pipeline_status: status })
    .eq('id', contactId)
    .eq('profile_id', profileId)

  revalidatePath('/contacts')
  revalidatePath(`/contacts/${contactId}`)
}

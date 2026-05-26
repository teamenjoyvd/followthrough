'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export async function toggleFocus(
  contactId: string,
  currentValue: boolean,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Unauthorised' }

  const supabase = await createSupabaseServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle()

  if (!profile) return { error: 'Profile not found' }

  const profileId = profile.id
  const nextValue = !currentValue

  const update: ContactUpdate = {
    on_working_list: nextValue,
    working_list_added_at: nextValue ? new Date().toISOString() : null,
  }

  const { error } = await supabase
    .from('contacts')
    .update(update)
    .eq('id', contactId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

  revalidatePath('/contacts')
  return { success: true }
}

import { cache } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type ContactRow = Database['public']['Tables']['contacts']['Row']

export const getContactForUser = cache(async (id: string, clerkId: string): Promise<ContactRow | null> => {
  const supabase = await createSupabaseServerClient()
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', clerkId)
    .maybeSingle() as { data: { id: string } | null }

  if (!profile) return null

  const { data: contact } = await (supabase as any)
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('profile_id', profile.id)
    .maybeSingle() as { data: ContactRow | null }
  
  return contact
})

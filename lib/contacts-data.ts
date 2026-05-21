import { cache } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type ContactRow = Database['public']['Tables']['contacts']['Row']
type PhoneNumberRow = Database['public']['Tables']['phone_numbers']['Row']
type SocialLinkRow = Database['public']['Tables']['social_links']['Row']

export type ContactDetail = ContactRow & {
  phoneNumbers: PhoneNumberRow[]
  socialLinks: SocialLinkRow[]
}

export const getContactForUser = cache(async (id: string, clerkId: string): Promise<ContactDetail | null> => {
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

  if (!contact) return null

  const { data: phoneNumbers } = await (supabase as any)
    .from('phone_numbers')
    .select('*')
    .eq('contact_id', id)
    .eq('profile_id', profile.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true }) as { data: PhoneNumberRow[] | null }

  const { data: socialLinks } = await (supabase as any)
    .from('social_links')
    .select('*')
    .eq('contact_id', id)
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: true }) as { data: SocialLinkRow[] | null }

  return {
    ...contact,
    phoneNumbers: phoneNumbers ?? [],
    socialLinks: socialLinks ?? [],
  }
})

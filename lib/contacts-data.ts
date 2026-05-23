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
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', clerkId)
    .maybeSingle() as { data: { id: string } | null }

  if (!profile) return null

  const { data: contact } = await supabase
    .from('contacts')
    .select('*, phone_numbers(*), social_links(*)')
    .eq('id', id)
    .eq('profile_id', profile.id)
    .maybeSingle() as {
      data: (ContactRow & {
        phone_numbers: PhoneNumberRow[]
        social_links: SocialLinkRow[]
      }) | null
    }

  if (!contact) return null

  // Sort phone numbers: primary first, then by creation date ascending
  const phoneNumbers = [...(contact.phone_numbers || [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return a.is_primary ? -1 : 1
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  // Sort social links: by creation date ascending
  const socialLinks = [...(contact.social_links || [])].sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  return {
    ...contact,
    phoneNumbers,
    socialLinks,
  }
})

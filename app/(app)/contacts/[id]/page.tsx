import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import ContactDetailDesktop from './components/ContactDetailDesktop'
import ContactDetailMobile from './components/ContactDetailMobile'
import DeleteContactButton from './components/DeleteContactButton'
import type { ContactSummary, InteractionWithDetails } from './components/types'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return { title: 'Contact — Followthrough' }

  const supabase = await createSupabaseServerClient()
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single()
  if (!profile) return { title: 'Contact — Followthrough' }

  const { data: contact } = await (supabase as any)
    .from('contacts')
    .select('first_name, last_name')
    .eq('id', id)
    .eq('profile_id', (profile as { id: string }).id)
    .single()
  if (!contact) return { title: 'Contact — Followthrough' }

  const c = contact as { first_name: string; last_name: string | null }
  return {
    title: `${c.first_name} ${c.last_name ?? ''} — Followthrough`.trim(),
  }
}

export default async function ContactDetailPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params

  const supabase = await createSupabaseServerClient()

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!profile) redirect('/sign-in')

  const profileId = (profile as { id: string }).id

  const { data: contact } = await (supabase as any)
    .from('contacts')
    .select('id, first_name, last_name, company, job_title, email, last_contacted_at, pipeline_status')
    .eq('id', id)
    .eq('profile_id', profileId)
    .single()

  if (!contact) redirect('/contacts')

  const { data: interactions } = await (supabase as any)
    .from('interactions')
    .select(`
      id, type, occurred_at,
      call_details ( outcome, duration_seconds, summary ),
      email_details ( subject, body ),
      note_details ( body )
    `)
    .eq('contact_id', id)
    .eq('profile_id', profileId)
    .order('occurred_at', { ascending: false })

  const props = {
    contact: contact as ContactSummary,
    interactions: (interactions ?? []) as InteractionWithDetails[],
    profileId,
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-base font-semibold text-gray-900 truncate">
          {props.contact.first_name} {props.contact.last_name}
        </h1>
        <DeleteContactButton
          contactId={props.contact.id}
          contactName={`${props.contact.first_name} ${props.contact.last_name ?? ''}`.trim()}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="hidden md:block h-full">
          <ContactDetailDesktop {...props} />
        </div>
        <div className="block md:hidden h-full">
          <ContactDetailMobile {...props} />
        </div>
      </div>
    </div>
  )
}

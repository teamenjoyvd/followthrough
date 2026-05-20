import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import ContactDetailDesktop from './components/ContactDetailDesktop'
import ContactDetailMobile from './components/ContactDetailMobile'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ContactDetailPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params

  const supabase = await createSupabaseServerClient()

  // Resolve profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!profile) redirect('/sign-in')

  // Fetch contact — RLS enforces ownership
  const { data: contact } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, company, job_title, email, last_contacted_at, pipeline_status')
    .eq('id', id)
    .eq('profile_id', profile.id)
    .single()

  if (!contact) redirect('/dashboard')

  // Fetch interactions with detail join
  const { data: interactions } = await supabase
    .from('interactions')
    .select(`
      id, type, occurred_at,
      call_details ( outcome, duration_seconds, summary ),
      email_details ( subject, body ),
      note_details ( body )
    `)
    .eq('contact_id', id)
    .eq('profile_id', profile.id)
    .order('occurred_at', { ascending: false })

  const props = {
    contact,
    interactions: interactions ?? [],
    profileId: profile.id,
  }

  return (
    <>
      <div className="hidden md:block">
        <ContactDetailDesktop {...props} />
      </div>
      <div className="block md:hidden">
        <ContactDetailMobile {...props} />
      </div>
    </>
  )
}

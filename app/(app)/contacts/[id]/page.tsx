import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ContactDetailDesktop from './components/ContactDetailDesktop'
import ContactDetailMobile from './components/ContactDetailMobile'
import DeleteContactButton from './components/DeleteContactButton'
import { getContactForUser } from '@/lib/contacts-data'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return { title: 'Contact — Followthrough' }

  const contact = await getContactForUser(id, userId)
  if (!contact) return { title: 'Contact — Followthrough' }

  return {
    title: `${contact.first_name} ${contact.last_name ?? ''} — Followthrough`.trim(),
  }
}

export default async function ContactDetailPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const contact = await getContactForUser(id, userId)

  if (!contact) notFound()

  // Resolve profileId for server actions in child components
  const supabase = await createSupabaseServerClient()
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle() as { data: { id: string } | null }

  const profileId = profile?.id ?? ''

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Link
            href="/contacts"
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Back to contacts"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-base font-semibold text-gray-900 truncate">
            {contact.first_name} {contact.last_name}
          </h1>
        </div>
        <DeleteContactButton contactId={contact.id} contactName={`${contact.first_name} ${contact.last_name ?? ''}`.trim()} />
      </div>

      {/* Dual layout */}
      <div className="flex-1 overflow-hidden">
        <ContactDetailDesktop contact={contact} profileId={profileId} />
        <ContactDetailMobile contact={contact} profileId={profileId} />
      </div>
    </div>
  )
}

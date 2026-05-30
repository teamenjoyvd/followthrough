import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import ContactDetailDesktop from './components/ContactDetailDesktop'
import ContactDetailMobile from './components/ContactDetailMobile'
import DeleteContactButton from './components/DeleteContactButton'
import InteractionTimeline from './components/InteractionTimeline'
import { getContactForUser } from '@/lib/contacts-data'

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

function TimelineSkeleton() {
  return (
    <div className="space-y-3 pl-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-[#e4e0d8] rounded-xl h-12" />
      ))}
    </div>
  )
}

export default async function ContactDetailPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const contact = await getContactForUser(id, userId)

  if (!contact) notFound()

  const supabase = await createSupabaseServerClient()
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle() as { data: { id: string } | null }

  const profileId = profile?.id ?? ''

  const timelineSlot = (
    <Suspense fallback={<TimelineSkeleton />}>
      <InteractionTimeline contactId={id} profileId={profileId} />
    </Suspense>
  )

  const props = {
    contact,
    profileId,
    timelineSlot,
  }

  return (
    <div className="flex flex-col h-full bg-[#faf6f0]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#e4e0d8] bg-[#faf6f0] shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/contacts"
            className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-[#74796e] hover:bg-[#eae6de] hover:text-[#2e3230] transition-colors"
            aria-label="Back to contacts"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-base font-semibold text-[#2e3230] truncate">
            {contact.first_name} {contact.last_name}
          </h1>
        </div>
        <DeleteContactButton
          contactId={contact.id}
          contactName={`${contact.first_name} ${contact.last_name ?? ''}`.trim()}
        />
      </div>

      {/* Dual layout */}
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

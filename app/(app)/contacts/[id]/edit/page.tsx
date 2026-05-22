import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EditContactDesktop from './components/EditContactDesktop'
import EditContactMobile from './components/EditContactMobile'
import { getContactForUser } from '@/lib/contacts-data'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return { title: 'Edit Contact — Followthrough' }

  const contact = await getContactForUser(id, userId)
  if (!contact) return { title: 'Edit Contact — Followthrough' }

  return {
    title: `Edit ${contact.first_name} ${contact.last_name ?? ''} — Followthrough`.trim(),
  }
}

export default async function EditContactPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const contact = await getContactForUser(id, userId)

  if (!contact) notFound()

  return (
    <div className="flex flex-col h-full bg-[#faf6f0]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-[#e4e0d8] bg-[#faf6f0]">
        <Link
          href={`/contacts/${contact.id}`}
          className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-[#74796e] hover:bg-[#eae6de] hover:text-[#2e3230] transition-colors"
          aria-label="Back to contact"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold text-[#2e3230]">
          Edit {contact.first_name} {contact.last_name}
        </h1>
      </div>

      {/* Dual layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <EditContactDesktop contact={contact} />
        <EditContactMobile contact={contact} />
      </div>
    </div>
  )
}

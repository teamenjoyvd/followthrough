import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NewContactDesktop from './components/NewContactDesktop'
import NewContactMobile from './components/NewContactMobile'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New Contact — Followthrough',
  description: 'Add a new contact to your pipeline.',
}

export default async function NewContactPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-gray-200 bg-white">
        <Link
          href="/contacts"
          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Back to contacts"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">New contact</h1>
      </div>

      {/* Dual layout */}
      <div className="flex-1 overflow-hidden">
        <NewContactDesktop />
        <NewContactMobile />
      </div>
    </div>
  )
}

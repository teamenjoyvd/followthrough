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
    <div className="flex flex-col h-full bg-[#faf6f0]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-[#e4e0d8] bg-[#faf6f0]">
        <Link
          href="/contacts"
          className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-[#74796e] hover:bg-[#eae6de] hover:text-[#2e3230] transition-colors"
          aria-label="Back to contacts"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold text-[#2e3230]">New contact</h1>
      </div>

      {/* Dual layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <NewContactDesktop />
        <NewContactMobile />
      </div>
    </div>
  )
}

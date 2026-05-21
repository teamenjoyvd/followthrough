import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getInboxItems } from '@/lib/actions/inbox'
import InboxDesktop from './components/InboxDesktop'
import InboxMobile from './components/InboxMobile'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Inbox — Followthrough',
  description: 'Review critical contact updates, resurfaced items, and Google sync conflicts.',
}

export default async function InboxPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Fetch actual inbox items with joined contact info securely
  const items = await getInboxItems()

  return (
    <>
      {/* Desktop layout — hidden on mobile */}
      <div className="hidden md:block">
        <InboxDesktop items={items} />
      </div>

      {/* Mobile layout — hidden on desktop */}
      <div className="block md:hidden">
        <InboxMobile items={items} />
      </div>
    </>
  )
}

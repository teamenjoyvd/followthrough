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

  const supabase = await createSupabaseServerClient()

  // Get current profile
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle() as { data: { id: string } | null }

  if (!profile) redirect('/sign-in')

  // Fetch actual inbox items with joined contact info
  const items = await getInboxItems(profile.id)

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

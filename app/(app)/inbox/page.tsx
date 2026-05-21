import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import InboxDesktop from './components/InboxDesktop'
import InboxMobile from './components/InboxMobile'

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <>
      {/* Desktop layout — hidden on mobile */}
      <div className="hidden md:block">
        {/* TODO: fetch inbox items + pass to InboxDesktop */}
        <InboxDesktop items={[]} />
      </div>

      {/* Mobile layout — hidden on desktop */}
      <div className="block md:hidden">
        {/* TODO: fetch inbox items + pass to InboxMobile */}
        <InboxMobile items={[]} />
      </div>
    </>
  )
}

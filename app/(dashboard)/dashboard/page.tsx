import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardDesktop from './components/DashboardDesktop'
import DashboardMobile from './components/DashboardMobile'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <>
      {/* Desktop layout — hidden on mobile */}
      <div className="hidden md:block">
        <DashboardDesktop userId={userId} />
      </div>

      {/* Mobile layout — hidden on desktop */}
      <div className="block md:hidden">
        <DashboardMobile userId={userId} />
      </div>
    </>
  )
}

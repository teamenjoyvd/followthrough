import { currentUser } from '@clerk/nextjs/server'
import { DashboardNavDesktop } from './components/DashboardNavDesktop'
import { DashboardNavMobile } from './components/DashboardNavMobile'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.emailAddresses?.[0]?.emailAddress ||
    'Account'
  const avatarUrl = user?.imageUrl ?? null

  return (
    <div className="min-h-screen flex flex-col bg-[#faf6f0] font-body text-[#2e3230]">
      {/* Desktop nav */}
      <div className="hidden md:block">
        <DashboardNavDesktop displayName={displayName} avatarUrl={avatarUrl} />
      </div>
      {/* Mobile nav */}
      <div className="block md:hidden">
        <DashboardNavMobile displayName={displayName} />
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

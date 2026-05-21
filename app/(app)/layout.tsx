import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/profile'
import { getUnreadInboxCount } from '@/lib/actions/inbox'
import Link from 'next/link'
import BottomNav from './components/BottomNav'
import SidebarNavLinks from './components/SidebarNavLinks'

// ---------------------------------------------------------------------------
// SidebarNav — RSC shell; nav links delegate to SidebarNavLinks (client)
// ---------------------------------------------------------------------------
function SidebarNav({ inboxUnreadCount }: { inboxUnreadCount: number }) {
  return (
    <nav
      aria-label="Desktop navigation"
      className="hidden md:flex flex-col w-56 shrink-0 border-r border-terra-outline-variant bg-terra-surface-container-low px-3 py-6 gap-1"
    >
      <span className="px-3 mb-6 text-xl font-headline font-bold tracking-tight text-primary">
        FollowThrough
      </span>

      <SidebarNavLinks inboxUnreadCount={inboxUnreadCount} />
    </nav>
  )
}

// ---------------------------------------------------------------------------
// AppLayout
// ---------------------------------------------------------------------------
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')

  let email = (sessionClaims?.email as string) || (sessionClaims?.primary_email as string) || ''
  let displayName = (sessionClaims?.name as string) || (sessionClaims?.full_name as string) || ''

  if (!email || !displayName) {
    const user = await currentUser()
    email = email || (user?.emailAddresses?.[0]?.emailAddress ?? '')
    displayName =
      displayName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      email ||
      userId
  }

  await ensureProfile(userId, email, displayName)

  const unreadInboxCount = await getUnreadInboxCount()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar — RSC shell, client nav links */}
      <SidebarNav inboxUnreadCount={unreadInboxCount} />

      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>

        {/* Mobile Bottom Nav — client component (needs usePathname) */}
        <BottomNav inboxUnreadCount={unreadInboxCount} />
      </div>
    </div>
  )
}

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/profile'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUnreadInboxCount } from '@/lib/actions/inbox'
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Inbox,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import BottomNav from './components/BottomNav'

// ---------------------------------------------------------------------------
// Nav items shared by both layouts
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

// ---------------------------------------------------------------------------
// SidebarNav — RSC, no active state needed (server-rendered per request)
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

      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const showBadge = label === 'Inbox' && inboxUnreadCount > 0
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </div>
            {showBadge && (
              <span className="inline-flex items-center justify-center bg-destructive/10 border border-destructive/20 font-extrabold text-[10px] text-destructive rounded-full h-5 px-1.5 leading-none shrink-0">
                {inboxUnreadCount}
              </span>
            )}
          </Link>
        )
      })}
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
      {/* Desktop Sidebar — RSC */}
      <SidebarNav inboxUnreadCount={unreadInboxCount} />

      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>

        {/* Mobile Bottom Nav — client component (needs usePathname) */}
        <BottomNav inboxUnreadCount={unreadInboxCount} />
      </div>
    </div>
  )
}

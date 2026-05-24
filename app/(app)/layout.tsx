import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/profile'
import { getUnreadInboxCount } from '@/lib/actions/inbox'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SidebarNavLinks from './components/SidebarNavLinks'
import { Logo } from '@/components/Logo'

// ---------------------------------------------------------------------------
// SidebarNav — RSC shell; nav links delegate to SidebarNavLinks (client)
// Renders on all viewports: w-12 icon-only ribbon on mobile, w-56 with labels on desktop
// ---------------------------------------------------------------------------
function SidebarNav({ inboxUnreadCount }: { inboxUnreadCount: number }) {
  return (
    <nav
      aria-label="Main navigation"
      className="flex flex-col w-12 md:w-56 shrink-0 border-r border-terra-outline-variant bg-terra-surface-container-low py-6 gap-1 items-center md:items-stretch px-0 md:px-3"
    >
      <Link
        href="/workspace"
        className="mb-6 flex items-center justify-center md:justify-start md:px-3 transition-transform duration-200 hover:scale-[1.02]"
      >
        {/* Icon-only on mobile, full logo on desktop */}
        <span className="md:hidden">
          <Logo iconOnly />
        </span>
        <span className="hidden md:block">
          <Logo />
        </span>
      </Link>

      <SidebarNavLinks inboxUnreadCount={inboxUnreadCount} collapsed={false} />
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

  const supabase = await createSupabaseServerClient()

  // 1. Try to fetch the profile first to see if it already exists
  let { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle() as { data: { id: string } | null }

  // 2. If the profile does not exist, provision a new one
  if (!profile) {
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

    profile = await ensureProfile(userId, email, displayName)
  }

  // 3. Throw a robust error if profile still doesn't exist to prevent infinite redirect loops
  if (!profile) {
    throw new Error('Failed to guarantee user profile. Please check database connectivity.')
  }

  const unreadInboxCount = await getUnreadInboxCount()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav inboxUnreadCount={unreadInboxCount} />
      <main className="flex-1 overflow-y-auto bg-background min-w-0">{children}</main>
    </div>
  )
}

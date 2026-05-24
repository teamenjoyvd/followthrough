import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/profile'
import { getUnreadInboxCount } from '@/lib/actions/inbox'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AppNavDesktop } from './components/AppNavDesktop'
import { AppNavMobile } from './components/AppNavMobile'

// ---------------------------------------------------------------------------
// AppLayout — dual layout shell (dual layout law: two complete separate layouts)
// Desktop: left sidebar w-56 | Mobile: sticky top header + Sheet
// ---------------------------------------------------------------------------
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createSupabaseServerClient()

  let { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id, display_name')
    .eq('clerk_id', userId)
    .maybeSingle() as { data: { id: string; display_name: string | null } | null }

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

  if (!profile) {
    throw new Error('Failed to guarantee user profile. Please check database connectivity.')
  }

  const displayName =
    (profile as any).display_name ||
    (sessionClaims?.name as string) ||
    ''

  const avatarUrl =
    (sessionClaims?.picture as string) ||
    (sessionClaims?.avatar_url as string) ||
    (sessionClaims?.image_url as string) ||
    null

  const unreadInboxCount = await getUnreadInboxCount()

  return (
    <>
      {/* ── Desktop layout ── */}
      <div className="hidden md:flex h-screen overflow-hidden bg-background">
        <AppNavDesktop
          inboxUnreadCount={unreadInboxCount}
          displayName={displayName}
          avatarUrl={avatarUrl}
        />
        <main className="flex-1 overflow-y-auto bg-background min-w-0">{children}</main>
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex md:hidden flex-col min-h-screen bg-background">
        <AppNavMobile
          inboxUnreadCount={unreadInboxCount}
          displayName={displayName}
        />
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </>
  )
}

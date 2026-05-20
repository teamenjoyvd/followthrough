import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ensureProfile } from '@/lib/profile'
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Inbox,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

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
// Layout
// ---------------------------------------------------------------------------
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')

  // Optimize TTFB and avoid Clerk API network requests on every layout load:
  // Try extracting email and name from session claims (JWT) first.
  let email = (sessionClaims?.email as string) || (sessionClaims?.primary_email as string) || ''
  let displayName = (sessionClaims?.name as string) || (sessionClaims?.full_name as string) || ''

  // Fallback to currentUser() API fetch only if claims are not populated/customized
  if (!email || !displayName) {
    const user = await currentUser()
    email = email || user?.emailAddresses?.[0]?.emailAddress ?? ''
    displayName =
      displayName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      email ||
      userId
  }

  await ensureProfile(userId, email, displayName)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar — hidden on mobile */}
      <nav
        aria-label="Desktop navigation"
        className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-200 bg-white px-3 py-6 gap-1"
      >
        <span className="px-3 mb-4 text-lg font-semibold tracking-tight text-gray-900">
          Followthrough
        </span>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Main Content Area (shared between desktop and mobile) */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>

        {/* Mobile Bottom Nav — hidden on desktop */}
        <nav
          aria-label="Mobile navigation"
          className="md:hidden flex items-center justify-around border-t border-gray-200 bg-white pb-safe"
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

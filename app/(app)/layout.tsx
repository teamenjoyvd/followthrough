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
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Ensure profile row exists — uses service client, bypasses RLS.
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    email ||
    userId

  await ensureProfile(userId, email, displayName)

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Desktop layout — sidebar + content                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* Sidebar */}
        <nav
          aria-label="Desktop navigation"
          className="flex flex-col w-56 shrink-0 border-r border-gray-200 bg-white px-3 py-6 gap-1"
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

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile layout — full-screen content + bottom nav                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col h-screen md:hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>

        {/* Bottom nav */}
        <nav
          aria-label="Mobile navigation"
          className="flex items-center justify-around border-t border-gray-200 bg-white pb-safe"
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
    </>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Inbox,
  Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

interface Props {
  inboxUnreadCount: number
}

export default function BottomNav({ inboxUnreadCount }: Props) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden flex items-center justify-around border-t border-terra-outline-variant bg-terra-surface-container pb-safe rounded-t-xl"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        const showBadge = label === 'Inbox' && inboxUnreadCount > 0
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-2 transition-colors relative"
          >
            <div
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-colors ${
                active
                  ? 'bg-terra-primary-fixed text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center bg-destructive text-white font-extrabold text-[8px] rounded-full h-4 w-4 shrink-0 border-2 border-background">
                    {inboxUnreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none ${
                active ? 'font-bold' : ''
              }`}>
                {label}
              </span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}

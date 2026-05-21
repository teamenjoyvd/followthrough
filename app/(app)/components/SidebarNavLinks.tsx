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

export default function SidebarNavLinks({ inboxUnreadCount }: Props) {
  const pathname = usePathname()

  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        const showBadge = label === 'Inbox' && inboxUnreadCount > 0
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-terra-primary-fixed text-primary font-bold'
                : 'text-muted-foreground hover:bg-muted hover:text-primary'
            }`}
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
    </>
  )
}

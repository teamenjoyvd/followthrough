'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Inbox,
  History,
  Settings,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'
import ClientUserButton from '@/components/ClientUserButton'

const NAV_ITEMS = [
  { href: '/workspace', label: 'Workspace', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

interface Props {
  inboxUnreadCount: number
  displayName: string
  avatarUrl: string | null
}

export function AppNavDesktop({ inboxUnreadCount, displayName, avatarUrl }: Props) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main navigation"
      className="flex flex-col w-56 shrink-0 border-r border-terra-outline-variant bg-terra-surface-container-low h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="px-4 py-6 mb-2">
        <Link
          href="/workspace"
          className="flex items-center transition-transform duration-200 hover:scale-[1.02]"
        >
          <Logo />
        </Link>
      </div>

      {/* Nav links */}
      <div className="flex-1 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const showBadge = label === 'Inbox' && inboxUnreadCount > 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-terra-primary-fixed text-primary font-bold'
                  : 'text-muted-foreground hover:bg-muted hover:text-primary'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
              {showBadge && (
                <span className="ml-auto inline-flex items-center justify-center bg-destructive/10 border border-destructive/20 font-extrabold text-[10px] text-destructive rounded-full h-5 px-1.5 leading-none shrink-0">
                  {inboxUnreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* User block */}
      <div className="px-3 py-4 border-t border-terra-outline-variant">
        <ClientUserButton
          showName
          appearance={{
            elements: {
              rootBox: "w-full",
              userButtonTrigger: "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary !shadow-none",
              avatarBox: "w-7 h-7 rounded-xl ring-2 ring-terra-primary/20 border border-terra-outline-variant shrink-0",
              userButtonShowNameText: "text-sm font-medium text-foreground truncate flex-1 text-left"
            }
          }}
        />
      </div>
    </nav>
  )
}

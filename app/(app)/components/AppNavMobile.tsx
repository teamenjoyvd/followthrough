'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Inbox, History, Settings } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'

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
}

export function AppNavMobile({ inboxUnreadCount, displayName }: Props) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Top Header (thin, branding + quick link to settings/profile info) */}
      <header className="sticky top-0 z-40 w-full border-b border-terra-outline-variant bg-terra-surface-container-low/95 backdrop-blur-sm shrink-0">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/workspace" className="flex items-center" aria-label="Go to workspace">
            <Logo iconOnly />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold max-w-[120px] truncate">{displayName.split(' ')[0]}</span>
            <Link href="/settings" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Fixed Bottom Tab Bar Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-terra-surface-container-low/95 backdrop-blur-md border-t border-terra-outline-variant flex items-center justify-around px-2 pb-safe shadow-[0_-4px_16px_rgba(46,50,48,0.06)] shrink-0">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const showBadge = label === 'Inbox' && inboxUnreadCount > 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-all relative font-body',
                active ? 'text-[#4a7c59]' : 'text-[#74796e] hover:text-[#2e3230]'
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform duration-200", active && "scale-110")} />
              <span className={cn("text-[9px] tracking-tight transition-all", active ? "font-bold text-[#4a7c59]" : "font-semibold text-[#74796e]")}>
                {label}
              </span>
              {showBadge && (
                <span className="absolute top-1 right-2 inline-flex items-center justify-center bg-[#b83230] text-white font-extrabold text-[8px] rounded-full h-4 w-4 leading-none">
                  {inboxUnreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

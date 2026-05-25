'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { Menu, LogOut, LayoutDashboard, Users, GitBranch, Inbox, History, Settings } from 'lucide-react'
import { Logo } from '@/components/Logo'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/workspace', label: 'Workspace', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

interface Props {
  inboxUnreadCount: number
  displayName: string
}

export function AppNavMobile({ inboxUnreadCount, displayName }: Props) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const { signOut } = useClerk()

  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-terra-outline-variant bg-terra-surface-container-low/95 backdrop-blur-sm">
        <div className="px-4 h-14 flex items-center justify-between">
          {/* icon-only logo in the sticky header — saves ~56px vertical height on mobile.
              The full wordmark is retained inside the Sheet drawer where it serves as
              a navigation landmark. */}
          <Link href="/workspace" aria-label="Go to workspace">
            <Logo iconOnly />
          </Link>
          <button
            aria-label="Open navigation menu"
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-terra-surface-container-low border-r border-terra-outline-variant [&>button]:top-[18px]">
          <SheetHeader className="px-6 pt-5 pb-4 border-b border-terra-outline-variant text-left">
            <SheetTitle asChild>
              <Link href="/workspace" className="flex items-center" aria-label="Go to workspace">
                <Logo />
              </Link>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col px-3 py-4 gap-1">
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
          </nav>

          <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-terra-outline-variant">
            <div className="px-3 py-2 mb-1">
              <p className="text-xs text-muted-foreground font-medium truncate">{displayName}</p>
            </div>
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

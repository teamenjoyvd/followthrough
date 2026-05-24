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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const NAV_ITEMS = [
  { href: '/workspace', label: 'Workspace', icon: LayoutDashboard },
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
          <Tooltip key={href}>
            <TooltipTrigger asChild>
              <Link
                href={href}
                aria-label={label}
                className={`group flex items-center gap-3 rounded-lg transition-colors
                  /* mobile: icon-only centered button */
                  justify-center px-0 py-2.5 w-10 mx-auto
                  /* desktop: full-width with label */
                  md:justify-start md:px-3 md:w-auto md:mx-0
                  ${
                    active
                      ? 'bg-terra-primary-fixed text-primary font-bold'
                      : 'text-muted-foreground hover:bg-muted hover:text-primary'
                  }`}
              >
                {/* Icon — always visible */}
                <div className="relative shrink-0">
                  <Icon className="h-5 w-5 md:h-4 md:w-4" aria-hidden="true" />
                  {/* Mobile badge dot */}
                  {showBadge && (
                    <span className="md:hidden absolute -top-1 -right-1 inline-flex h-2 w-2 rounded-full bg-destructive border border-background" />
                  )}
                </div>

                {/* Label — desktop only */}
                <span className="hidden md:inline text-sm font-medium">{label}</span>

                {/* Desktop badge count */}
                {showBadge && (
                  <span className="hidden md:inline-flex ml-auto items-center justify-center bg-destructive/10 border border-destructive/20 font-extrabold text-[10px] text-destructive rounded-full h-5 px-1.5 leading-none shrink-0">
                    {inboxUnreadCount}
                  </span>
                )}
              </Link>
            </TooltipTrigger>
            {/* Tooltip shown on mobile (collapsed state) only */}
            <TooltipContent side="right" className="md:hidden">
              {label}{showBadge ? ` (${inboxUnreadCount})` : ''}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </>
  )
}

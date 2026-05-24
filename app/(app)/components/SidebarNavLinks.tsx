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
  collapsed: boolean
}

export default function SidebarNavLinks({ inboxUnreadCount, collapsed }: Props) {
  const pathname = usePathname()

  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        const showBadge = label === 'Inbox' && inboxUnreadCount > 0

        const linkContent = collapsed ? (
          // Icon-only with Tooltip
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={href}
                className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  active
                    ? 'bg-terra-primary-fixed text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-primary'
                }`}
                aria-label={label}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {showBadge && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center bg-destructive text-white font-extrabold text-[8px] rounded-full h-3.5 w-3.5 border border-background" />
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              {label}
              {showBadge && ` (${inboxUnreadCount})`}
            </TooltipContent>
          </Tooltip>
        ) : (
          // Icon + label
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

        return (
          <div key={href}>
            {linkContent}
          </div>
        )
      })}
    </>
  )
}

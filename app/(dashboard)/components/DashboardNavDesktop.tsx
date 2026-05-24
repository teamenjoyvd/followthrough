'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { LogOut, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/Logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Props {
  displayName: string
  avatarUrl: string | null
}

const NAV_LINKS = [
  { href: '/workspace', label: 'Workspace' },
]

export function DashboardNavDesktop({ displayName, avatarUrl }: Props) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e4e0d8] bg-[#faf6f0]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between gap-6">
        {/* Left: logo + nav links */}
        <div className="flex items-center gap-8">
          <Link href="/workspace" aria-label="Go to workspace">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-150',
                  pathname === link.href
                    ? 'bg-[#eae6de] text-[#2e3230]'
                    : 'text-[#74796e] hover:text-[#2e3230] hover:bg-[#eae6de]/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: user dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#eae6de]/60 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#4a7c59]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {initials}
                </span>
              )}
              <span className="text-sm font-semibold text-[#2e3230] max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#74796e]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-[#74796e] font-normal truncate">
              {displayName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut({ redirectUrl: '/' })}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

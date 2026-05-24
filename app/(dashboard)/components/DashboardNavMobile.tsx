'use client'

import * as React from 'react'
import Link from 'next/link'
import { useClerk } from '@clerk/nextjs'
import { Menu, LogOut, X } from 'lucide-react'
import { Logo } from '@/components/Logo'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'

interface Props {
  displayName: string
}

export function DashboardNavMobile({ displayName }: Props) {
  const [open, setOpen] = React.useState(false)
  const { signOut } = useClerk()

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#e4e0d8] bg-[#faf6f0]/95 backdrop-blur-sm">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/workspace" aria-label="Go to workspace" onClick={() => setOpen(false)}>
            <Logo />
          </Link>
          <button
            aria-label="Open navigation menu"
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-[#eae6de] transition-colors duration-150 text-[#2e3230] active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-[#faf6f0] border-r border-[#e4e0d8] p-0">
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-[#e4e0d8]">
            <div className="flex items-center justify-between">
              <SheetTitle asChild>
                <Logo />
              </SheetTitle>
              <SheetClose asChild>
                <button
                  aria-label="Close navigation menu"
                  className="p-1.5 rounded-lg hover:bg-[#eae6de] transition-colors duration-150 text-[#74796e]"
                >
                  <X className="h-4 w-4" />
                </button>
              </SheetClose>
            </div>
          </SheetHeader>

          <nav className="flex flex-col px-3 py-4 gap-1">
            <Link
              href="/workspace"
              onClick={() => setOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-[#2e3230] hover:bg-[#eae6de] transition-colors duration-150"
            >
              Workspace
            </Link>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-[#e4e0d8]">
            <div className="px-3 py-2 mb-2">
              <p className="text-xs text-[#74796e] font-medium truncate">{displayName}</p>
            </div>
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors duration-150"
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

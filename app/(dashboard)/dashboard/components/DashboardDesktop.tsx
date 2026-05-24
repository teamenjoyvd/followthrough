'use client'

import * as React from 'react'
import Link from 'next/link'
import { useWorkspaceStore } from '../store/useWorkspaceStore'
import WorkspaceStats from './WorkspaceStats'
import FocusList from './FocusList'
import ContextPanel from './ContextPanel'
import type { Database } from '@/types/supabase'
import { Menu, LayoutDashboard, Users, GitBranch, Inbox, Settings } from 'lucide-react'
import { UserAvatar } from '@/components/UserAvatar'

type Contact = Database['public']['Tables']['contacts']['Row']
type Label = Database['public']['Tables']['labels']['Row']

import type { InboxItem } from '@/types/inbox'

interface Stats {
  workingListCount: number
  inboxCount: number
  snoozedCount: number
  totalContactsCount: number
}

interface Props {
  profileId: string
  displayName: string
  workingList: Contact[]
  allContacts: Contact[]
  stats: Stats
  avatarUrl: string | null
  healthPercentage: number
  upcomingContacts: Contact[]
  allLabels: Label[]
  inboxItems: InboxItem[]
  completedTodayCount: number
  streakDays: number
}

export default function DashboardDesktop({
  profileId,
  displayName,
  workingList,
  allContacts,
  stats,
  avatarUrl,
  healthPercentage,
  upcomingContacts,
  allLabels,
  inboxItems,
  completedTodayCount,
  streakDays,
}: Props) {
  const { setInitialData } = useWorkspaceStore()

  // Initialize Zustand Workspace Store Cache
  React.useEffect(() => {
    setInitialData(workingList, allContacts, stats, completedTodayCount, streakDays)
  }, [workingList, allContacts, stats, completedTodayCount, streakDays, setInitialData])

  const name = displayName || 'there'

  return (
    <div className="min-h-screen bg-[#faf6f0] pb-12 font-body text-[#2e3230]">
      
      {/* ── Top App Bar ──────────────────────────────────────── */}
      <header className="w-full sticky top-0 z-40 bg-[#faf6f0] shadow-[0_4px_20px_rgba(46,50,48,0.04)] flex items-center justify-between px-8 py-4 border-b border-[#e4e0d8]/40">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <button className="active:scale-95 duration-200 hover:bg-[#f0ece4] p-2 rounded-full transition-colors">
              <Menu className="h-6 w-6 text-[#4a7c59]" />
            </button>
            <h1 className="font-headline text-xl font-bold text-[#4a7c59] tracking-tight">FollowThrough</h1>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link className="text-[#4a7c59] font-bold transition-colors text-sm flex items-center gap-1.5" href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Workspace
            </Link>
            <Link className="text-[#4a4e4a] hover:bg-[#f0ece4] hover:text-[#2e3230] transition-colors px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5" href="/contacts">
              <Users className="h-4 w-4" />
              Contacts
            </Link>
            <Link className="text-[#4a4e4a] hover:bg-[#f0ece4] hover:text-[#2e3230] transition-colors px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5" href="/pipeline">
              <GitBranch className="h-4 w-4" />
              Queue
            </Link>
            <Link className="text-[#4a4e4a] hover:bg-[#f0ece4] hover:text-[#2e3230] transition-colors px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5" href="/inbox">
              <Inbox className="h-4 w-4" />
              Inbox
            </Link>
            <Link className="text-[#4a4e4a] hover:bg-[#f0ece4] hover:text-[#2e3230] transition-colors px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5" href="/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
        
        <div className="active:scale-95 duration-200">
          <UserAvatar avatarUrl={avatarUrl} name={name} />
        </div>
      </header>

      {/* ── Focus Workspace: Three-Column Split Layout ───────── */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Stats, Streaks, CRM Health & Focus Inbox (col-span-3) */}
          <div className="col-span-3 sticky top-24">
            <WorkspaceStats 
              initialInboxItems={inboxItems} 
              healthPercentage={healthPercentage} 
            />
          </div>

          {/* CENTER COLUMN: Interactive Focus List & Command Pins (col-span-5) */}
          <div className="col-span-5 bg-[#eae6de]/30 rounded-[28px] p-6 border border-[#e4e0d8]/30 min-h-[500px]">
            <FocusList />
          </div>

          {/* RIGHT COLUMN: Contact Context, Auto-Notes, Tagging & Feeds (col-span-4) */}
          <div className="col-span-4 bg-[#eae6de]/30 rounded-[28px] p-6 border border-[#e4e0d8]/30 sticky top-24 min-h-[500px]">
            <ContextPanel 
              profileId={profileId} 
              allLabels={allLabels} 
            />
          </div>

        </div>
      </main>

    </div>
  )
}

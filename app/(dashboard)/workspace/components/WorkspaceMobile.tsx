'use client'

import * as React from 'react'
import { useWorkspaceStore } from '../store/useWorkspaceStore'
import WorkspaceStats from './WorkspaceStats'
import FocusList from './FocusList'
import ContextPanel from './ContextPanel'
import type { Database } from '@/types/supabase'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export default function WorkspaceMobile({
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
  const { setInitialData, selectedContact, setSelectedContact, activeTab, setActiveTab } = useWorkspaceStore()

  React.useEffect(() => {
    setInitialData(workingList, allContacts, stats, completedTodayCount, streakDays)
  }, [workingList, allContacts, stats, completedTodayCount, streakDays, setInitialData])

  return (
    <div className="min-h-screen bg-[#faf6f0] font-body text-[#2e3230] flex flex-col">

      {/* ── Main Viewport Content ────────────────────────────── */}
      <main className="flex-1 px-6 py-6 overflow-y-auto">

        {/* Toggle Nav Bar at the top of the content */}
        <div className="flex bg-[#eae6de] p-1 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('focus')}
            className={cn(
              "flex-1 py-2 text-xs font-bold font-sans rounded-xl transition-all duration-200",
              activeTab === 'focus'
                ? "bg-[#faf6f0] text-[#4a7c59] shadow-sm"
                : "text-[#74796e] hover:text-[#2e3230]"
            )}
          >
            Focus List ({workingList.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              "flex-1 py-2 text-xs font-bold font-sans rounded-xl transition-all duration-200",
              activeTab === 'stats'
                ? "bg-[#faf6f0] text-[#4a7c59] shadow-sm"
                : "text-[#74796e] hover:text-[#2e3230]"
            )}
          >
            Stats & Inbox
          </button>
        </div>

        {/* Tab Selection */}
        {activeTab === 'focus' ? (
          <div className="bg-[#eae6de]/20 rounded-[28px] p-5 border border-[#e4e0d8]/30">
            <FocusList />
          </div>
        ) : (
          <WorkspaceStats
            initialInboxItems={inboxItems}
            healthPercentage={healthPercentage}
          />
        )}
      </main>

      {/* ── Mobile Detail Drawer Slide-up (Context Panel Bottom Sheet) ── */}
      {selectedContact && (
        <div className="fixed inset-0 bg-[#2e3230]/50 z-50 animate-in fade-in duration-200 flex flex-col justify-end" onClick={() => setSelectedContact(null)}>
          <div
            className="w-full max-h-[85vh] bg-[#faf6f0] rounded-t-[32px] p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] border-t border-[#e4e0d8] overflow-y-auto animate-in slide-in-from-bottom duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Drag Bar */}
            <div className="flex items-center justify-between mb-4 border-b border-[#dbd7cf]/40 pb-3">
              <div className="w-12 h-1.5 bg-[#dbd7cf] rounded-full mx-auto" onClick={() => setSelectedContact(null)} />
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1.5 bg-[#eae6de] text-[#74796e] hover:text-[#2e3230] rounded-full active:scale-95 duration-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Context Panel */}
            <div className="flex-1">
              <ContextPanel profileId={profileId} allLabels={allLabels} />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

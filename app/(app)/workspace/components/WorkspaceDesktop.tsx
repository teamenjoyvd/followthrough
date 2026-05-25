'use client'

import * as React from 'react'
import { useWorkspaceStore } from '../store/useWorkspaceStore'
import WorkspaceStats from './WorkspaceStats'
import FocusList from './FocusList'
import ContextPanel from './ContextPanel'
import type { Database } from '@/types/supabase'

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
  undoWindowSeconds: number
}

export default function WorkspaceDesktop({
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
  undoWindowSeconds,
}: Props) {
  const { setInitialData, workingList: storeWorkingList } = useWorkspaceStore()

  React.useEffect(() => {
    setInitialData(workingList, allContacts, stats, completedTodayCount, streakDays, undoWindowSeconds)
  }, [workingList, allContacts, stats, completedTodayCount, streakDays, undoWindowSeconds, setInitialData])

  return (
    <div className="min-h-screen bg-[#faf6f0] pb-12 font-body text-[#2e3230]">
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-8 items-start">

          <div className="col-span-3 sticky top-6">
            <WorkspaceStats
              initialInboxItems={inboxItems}
              healthPercentage={healthPercentage}
            />
          </div>

          <div className="col-span-5 bg-[#eae6de]/30 rounded-[28px] p-6 border border-[#e4e0d8]/30 min-h-[500px]">
            {/* Panel header — owns the Focus List label on desktop now that FocusList.tsx
                no longer renders its own <h2>. Reads from store so count stays reactive. */}
            <div className="mb-6">
              <h2 className="font-headline text-2xl font-bold text-[#2e3230]">Focus List</h2>
              <p className="text-xs text-[#74796e] font-sans mt-0.5">
                You have{' '}
                <span className="font-bold text-[#4a7c59]">{storeWorkingList.length}</span>{' '}
                high-priority focus task{storeWorkingList.length !== 1 ? 's' : ''} active
              </p>
            </div>
            <FocusList />
          </div>

          <div className="col-span-4 bg-[#eae6de]/30 rounded-[28px] p-6 border border-[#e4e0d8]/30 sticky top-6 min-h-[500px]">
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

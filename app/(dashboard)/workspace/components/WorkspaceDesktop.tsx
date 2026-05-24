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
  const { setInitialData } = useWorkspaceStore()

  React.useEffect(() => {
    setInitialData(workingList, allContacts, stats, completedTodayCount, streakDays, undoWindowSeconds)
  }, [workingList, allContacts, stats, completedTodayCount, streakDays, undoWindowSeconds, setInitialData])

  return (
    <div className="min-h-screen bg-[#faf6f0] pb-12 font-body text-[#2e3230]">
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-8 items-start">

          <div className="col-span-3 sticky top-24">
            <WorkspaceStats
              initialInboxItems={inboxItems}
              healthPercentage={healthPercentage}
            />
          </div>

          <div className="col-span-5 bg-[#eae6de]/30 rounded-[28px] p-6 border border-[#e4e0d8]/30 min-h-[500px]">
            <FocusList />
          </div>

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

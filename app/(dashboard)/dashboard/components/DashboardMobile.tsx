'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Users, 
  Inbox, 
  Clock3, 
  TrendingUp, 
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { PIPELINE_STATUSES } from '@/app/(app)/contacts/components/PipelineStatusControl'
import { markDone, removeFromWorkingList } from '@/lib/actions/working-list'
import { snoozeContact } from '@/lib/actions/snooze'
import type { Database } from '@/types/supabase'

type Contact = Database['public']['Tables']['contacts']['Row']

interface Stats {
  workingListCount: number
  inboxCount: number
  snoozedCount: number
  totalContactsCount: number
}

interface Props {
  profileId: string
  workingList: Contact[]
  stats: Stats
}

function getInitials(first: string, last: string | null) {
  return `${first[0] || ''}${last ? last[0] || '' : ''}`.toUpperCase()
}

export default function DashboardMobile({ profileId, workingList, stats }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeSnoozeId, setActiveSnoozeId] = useState<string | null>(null)

  // Status Badge helper
  function statusBadge(status: Database['public']['Enums']['pipeline_status']) {
    const found = PIPELINE_STATUSES.find((s) => s.value === status)
    return found ? (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${found.color}`}>
        {found.label}
      </span>
    ) : null
  }

  // Done handler
  function handleMarkDone(contactId: string) {
    startTransition(async () => {
      const res = await markDone(contactId)
      if ('error' in res) {
        alert(res.error)
      } else {
        router.refresh()
      }
    })
  }

  // Remove handler
  function handleRemove(contactId: string) {
    startTransition(async () => {
      const res = await removeFromWorkingList(contactId)
      if ('error' in res) {
        alert(res.error)
      } else {
        router.refresh()
      }
    })
  }

  // Quick Snooze handler (in days)
  function handleQuickSnooze(contactId: string, days: number) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setActiveSnoozeId(null)
    
    startTransition(async () => {
      const res = await snoozeContact(contactId, date)
      if ('error' in res) {
        alert(res.error)
      } else {
        router.refresh()
      }
    })
  }

  // Custom Snooze handler
  function handleCustomSnooze(contactId: string, date: Date) {
    setActiveSnoozeId(null)
    startTransition(async () => {
      const res = await snoozeContact(contactId, date)
      if ('error' in res) {
        alert(res.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 pt-6 pb-24">
      {/* Mobile Welcome Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Your daily focus tracker</p>
        </div>
        <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1 text-[10px] font-semibold text-indigo-600">
          <Sparkles className="h-3 w-3 shrink-0" />
          Active
        </div>
      </div>

      {/* Horizontally Scrollable Stats Row */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 snap-x">
        {/* Metric 1 */}
        <div className="flex-none w-[140px] bg-white border border-gray-200 rounded-xl p-4 shadow-sm snap-start">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Focus</span>
            <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{stats.workingListCount}</div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium">Focus List</div>
        </div>

        {/* Metric 2 */}
        <Link 
          href="/inbox" 
          className="flex-none w-[140px] bg-white border border-gray-200 rounded-xl p-4 shadow-sm snap-start"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Inbox</span>
            <Inbox className={`h-3.5 w-3.5 ${stats.inboxCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
          <div className={`text-2xl font-extrabold ${stats.inboxCount > 0 ? 'text-red-500' : 'text-gray-900'}`}>
            {stats.inboxCount}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium">Unread Logs</div>
        </Link>

        {/* Metric 3 */}
        <div className="flex-none w-[140px] bg-white border border-gray-200 rounded-xl p-4 shadow-sm snap-start">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Snoozed</span>
            <Clock3 className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{stats.snoozedCount}</div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium">Snoozes</div>
        </div>

        {/* Metric 4 */}
        <Link 
          href="/contacts"
          className="flex-none w-[140px] bg-white border border-gray-200 rounded-xl p-4 shadow-sm snap-start"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</span>
            <Users className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{stats.totalContactsCount}</div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium">Contacts</div>
        </Link>
      </div>

      {/* Focus List Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-2">
        <div className="px-4 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            Focus List
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {workingList.length}
            </span>
          </h2>
          <p className="text-[10px] text-gray-400 font-medium">Tap card to view details</p>
        </div>

        <div className={`divide-y divide-gray-100 ${isPending ? 'opacity-65 pointer-events-none' : ''} transition-opacity`}>
          {workingList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="p-3 bg-indigo-50 text-indigo-500 rounded-full mb-3 animate-bounce">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">All caught up!</h3>
              <p className="text-xs text-gray-500 max-w-[240px] mt-1">
                Pin contacts to your focus list from their details or pipeline.
              </p>
            </div>
          ) : (
            workingList.map((c) => (
              <div key={c.id} className="p-4 flex flex-col hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <Link href={`/contacts/${c.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Initials Circle */}
                    <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {getInitials(c.first_name, c.last_name)}
                    </div>
                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-gray-950 truncate">
                          {c.first_name} {c.last_name}
                        </span>
                        {statusBadge(c.pipeline_status)}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                        {c.company ? c.company : 'No company specified'}
                      </div>
                    </div>
                  </Link>

                  {/* Actions Row */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    {/* Done */}
                    <button
                      onClick={() => handleMarkDone(c.id)}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-transform"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </button>

                    {/* Snooze Toggle */}
                    <button
                      onClick={() => setActiveSnoozeId(activeSnoozeId === c.id ? null : c.id)}
                      className={`p-1.5 rounded-lg active:scale-95 transition-all ${activeSnoozeId === c.id ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'text-amber-600 hover:bg-amber-50'}`}
                    >
                      <Clock className="h-4.5 w-4.5" />
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(c.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-transform"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Mobile Snooze Drawer */}
                {activeSnoozeId === c.id && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 animate-in slide-in-from-top-2 duration-150">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Quick snooze options
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleQuickSnooze(c.id, 1)}
                        className="py-1 text-center text-xs font-semibold bg-white border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 rounded-lg transition-colors"
                      >
                        1 Day
                      </button>
                      <button
                        onClick={() => handleQuickSnooze(c.id, 3)}
                        className="py-1 text-center text-xs font-semibold bg-white border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 rounded-lg transition-colors"
                      >
                        3 Days
                      </button>
                      <button
                        onClick={() => handleQuickSnooze(c.id, 7)}
                        className="py-1 text-center text-xs font-semibold bg-white border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 rounded-lg transition-colors"
                      >
                        1 Week
                      </button>
                    </div>
                    <div className="pt-2 border-t border-gray-200/80">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Select custom date
                      </label>
                      <input
                        type="date"
                        min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleCustomSnooze(c.id, new Date(e.target.value))
                          }
                        }}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inbox Callout for Mobile */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mt-6 shadow-sm flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            Inbox Alerts
            {stats.inboxCount > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
            )}
          </h3>
          <p className="text-[10px] text-gray-500 mt-1 truncate">
            {stats.inboxCount > 0 
              ? `You have ${stats.inboxCount} unread notification${stats.inboxCount === 1 ? '' : 's'}` 
              : 'All notifications cleared!'}
          </p>
        </div>
        <Link 
          href="/inbox"
          className="shrink-0 inline-flex items-center justify-center gap-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
        >
          View
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}

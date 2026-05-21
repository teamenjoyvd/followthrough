'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Calendar, 
  Users, 
  Inbox, 
  Clock3, 
  TrendingUp, 
  Sparkles,
  ChevronRight,
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

export default function DashboardDesktop({ profileId, workingList, stats }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeSnoozeId, setActiveSnoozeId] = useState<string | null>(null)

  // Status Badge helper
  function statusBadge(status: Database['public']['Enums']['pipeline_status']) {
    const found = PIPELINE_STATUSES.find((s) => s.value === status)
    return found ? (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${found.color}`}>
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
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Focus on your active follow-ups and monitor critical notifications.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3.5 py-1.5 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          Workspace Sync Stable
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Metric 1 */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Working List</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{stats.workingListCount}</div>
          <p className="text-xs text-gray-500 mt-2 font-medium">Active follow-up targets</p>
        </div>

        {/* Metric 2 */}
        <Link href="/inbox" className="block bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-red-100 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/5 to-transparent rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Inbox Notifications</span>
            <span className={`p-2 rounded-lg transition-colors ${stats.inboxCount > 0 ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white' : 'bg-gray-50 text-gray-400'}`}>
              <Inbox className="h-4 w-4" />
            </span>
          </div>
          <div className={`text-3xl font-extrabold tracking-tight ${stats.inboxCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {stats.inboxCount}
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
            Unread items needing review
            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </p>
        </Link>

        {/* Metric 3 */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-amber-100 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Snoozed Contacts</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock3 className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{stats.snoozedCount}</div>
          <p className="text-xs text-gray-500 mt-2 font-medium">Waiting to be resurfaced</p>
        </div>

        {/* Metric 4 */}
        <Link href="/contacts" className="block bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-violet-100 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/5 to-transparent rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Contacts</span>
            <span className="p-2 rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{stats.totalContactsCount}</div>
          <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
            Database population
            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </p>
        </Link>
      </div>

      {/* Main Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Working List (Left Column, span 2) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-gray-900">Your Focus List</h2>
              <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                {workingList.length}
              </span>
            </div>
            {workingList.length > 0 && (
              <p className="text-xs text-gray-400 font-medium">Click name to view history timeline</p>
            )}
          </div>

          <div className={`divide-y divide-gray-100 ${isPending ? 'opacity-65 pointer-events-none' : ''} transition-opacity`}>
            {workingList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="p-4 bg-indigo-50 text-indigo-500 rounded-full mb-4 animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900">All caught up!</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1.5">
                  Your Working List is empty. Go to your <Link href="/contacts" className="text-indigo-600 font-semibold hover:underline">Contacts</Link> or <Link href="/pipeline" className="text-indigo-600 font-semibold hover:underline">Pipeline</Link> to pin contacts here.
                </p>
              </div>
            ) : (
              workingList.map((c) => (
                <div key={c.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group relative">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Initials Avatar */}
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {getInitials(c.first_name, c.last_name)}
                    </div>
                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/contacts/${c.id}`} 
                          className="font-bold text-sm text-gray-950 hover:text-indigo-600 hover:underline transition-colors truncate"
                        >
                          {c.first_name} {c.last_name}
                        </Link>
                        {statusBadge(c.pipeline_status)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {c.job_title && <span>{c.job_title}</span>}
                        {c.job_title && c.company && <span> at </span>}
                        {c.company && <span className="font-medium text-gray-700">{c.company}</span>}
                        {!c.job_title && !c.company && <span className="text-gray-300">—</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {/* Done */}
                    <button
                      onClick={() => handleMarkDone(c.id)}
                      title="Mark as Done"
                      className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all hover:scale-105"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>

                    {/* Snooze */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveSnoozeId(activeSnoozeId === c.id ? null : c.id)}
                        title="Snooze Contact"
                        className={`p-2 rounded-lg border transition-all hover:scale-105 ${activeSnoozeId === c.id ? 'bg-amber-50 text-amber-600 border-amber-100' : 'text-amber-600 hover:bg-amber-50 border-transparent hover:border-amber-100'}`}
                      >
                        <Clock className="h-4 w-4" />
                      </button>

                      {/* Premium Inline Snooze Picker */}
                      {activeSnoozeId === c.id && (
                        <>
                          {/* Invisible Clickway to close */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveSnoozeId(null)}
                          ></div>
                          
                          <div className="absolute right-0 mt-2 z-20 w-52 bg-white border border-gray-200 rounded-xl shadow-xl p-3.5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                              Snooze contact until
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              <button
                                onClick={() => handleQuickSnooze(c.id, 1)}
                                className="w-full text-left px-2.5 py-1.5 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors flex items-center justify-between"
                              >
                                <span>Tomorrow</span>
                                <span className="text-[10px] text-gray-400 font-normal">1d</span>
                              </button>
                              <button
                                onClick={() => handleQuickSnooze(c.id, 3)}
                                className="w-full text-left px-2.5 py-1.5 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors flex items-center justify-between"
                              >
                                <span>In 3 days</span>
                                <span className="text-[10px] text-gray-400 font-normal">3d</span>
                              </button>
                              <button
                                onClick={() => handleQuickSnooze(c.id, 7)}
                                className="w-full text-left px-2.5 py-1.5 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors flex items-center justify-between"
                              >
                                <span>In 1 week</span>
                                <span className="text-[10px] text-gray-400 font-normal">7d</span>
                              </button>
                            </div>
                            <div className="border-t border-gray-100 pt-2 my-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                                Custom date picker
                              </label>
                              <div className="relative">
                                <input
                                  type="date"
                                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleCustomSnooze(c.id, new Date(e.target.value))
                                    }
                                  }}
                                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(c.id)}
                      title="Remove from Working List"
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all hover:scale-105"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Cards (Right Column) */}
        <div className="space-y-6">
          {/* Inbox Callout Widget */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Your Inbox</h3>
                {stats.inboxCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                )}
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Check active notification logs, resurfaced contact reminders, and sync conflict resolutions.
              </p>
              {stats.inboxCount > 0 ? (
                <div className="mt-4 p-3 bg-red-50/50 border border-red-100 rounded-xl flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="text-xs text-red-800 font-semibold">
                    You have {stats.inboxCount} unread notification{stats.inboxCount === 1 ? '' : 's'}
                  </span>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs text-emerald-800 font-semibold">
                    All notifications read!
                  </span>
                </div>
              )}
            </div>
            <Link 
              href="/inbox" 
              className="mt-6 inline-flex items-center justify-center gap-1.5 w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-2.5 text-sm font-semibold hover:shadow-sm transition-all"
            >
              Go to Inbox
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Quick Actions Guide */}
          <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 border border-indigo-950 rounded-xl p-6 text-white shadow-sm">
            <h3 className="text-sm font-bold tracking-wide uppercase text-indigo-200 mb-2">Getting Started</h3>
            <p className="text-xs text-indigo-100/80 leading-relaxed mb-4">
              To leverage the Working List, browse your full contact index and tap "Add to Focus" inside their profile views. 
            </p>
            <Link 
              href="/contacts" 
              className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-indigo-200 group"
            >
              Browse Contact Directory
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

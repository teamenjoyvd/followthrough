'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Inbox, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Check, 
  ChevronRight, 
  Sparkles,
  ShieldCheck
} from 'lucide-react'
import { markInboxItemRead } from '@/lib/actions/inbox'
import type { InboxItem } from '@/types/inbox'

interface Props {
  items: InboxItem[]
}

function formatDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export default function InboxDesktop({ items }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<'unread' | 'all'>('unread')

  const unreadItems = items.filter(i => !i.read)
  const displayedItems = filter === 'unread' ? unreadItems : items

  function handleMarkRead(itemId: string) {
    startTransition(async () => {
      const res = await markInboxItemRead(itemId)
      if ('error' in res) {
        alert(res.error)
      } else {
        router.refresh()
      }
    })
  }

  // Template generators for notifications
  function renderNotificationContent(item: InboxItem) {
    const contactName = item.contacts 
      ? `${item.contacts.first_name} ${item.contacts.last_name || ''}`.trim()
      : 'Unknown Contact'

    switch (item.type) {
      case 'resurfaced':
        return {
          title: 'Contact Resurfaced',
          description: `Snooze expired. ${contactName} has resurfaced from their temporary status. Ready to follow up!`,
          icon: Clock,
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
        }
      case 'working_list_changed':
        const action = item.payload.action === 'added' ? 'added to' : 'removed from'
        return {
          title: 'Focus List Update',
          description: `${contactName} was ${action} your active Working List.`,
          icon: TrendingUp,
          iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        }
      case 'sync_conflict':
        return {
          title: 'Google Sync Conflict',
          description: `A data sync conflict was identified on ${contactName}. Fields: ${Object.keys(item.payload.conflicts || {}).join(', ') || 'multiple fields'}.`,
          icon: AlertTriangle,
          iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
        }
      default:
        return {
          title: 'System Alert',
          description: 'A general workspace notification occurred.',
          icon: Inbox,
          iconBg: 'bg-gray-50 text-gray-600 border-gray-100',
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Inbox</h1>
          <p className="text-sm text-gray-500 mt-1">
            Stay updated on resurfaced tasks and automated system changes.
          </p>
        </div>
        {unreadItems.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-xs font-bold text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            {unreadItems.length} Action Needed
          </div>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-px mb-6">
        <div className="flex gap-6" role="tablist" aria-label="Notification filters">
          <button
            onClick={() => setFilter('unread')}
            aria-selected={filter === 'unread'}
            role="tab"
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all relative ${
              filter === 'unread'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Unread
            {unreadItems.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center h-5 px-1.5 rounded-full bg-red-100 border border-red-200 text-[10px] font-extrabold text-red-600">
                {unreadItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('all')}
            aria-selected={filter === 'all'}
            role="tab"
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all ${
              filter === 'all'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            All Notifications
          </button>
        </div>
        <p className="text-xs text-gray-400 font-medium">Auto-clears as you mark done</p>
      </div>

      {/* Main Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Feed Column (col-span-2) */}
        <div className={`lg:col-span-2 space-y-4 ${isPending ? 'opacity-65 pointer-events-none' : ''} transition-opacity`}>
          {displayedItems.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm">
              <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full w-fit mx-auto mb-4 border border-emerald-100">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Your inbox is clear!</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                {filter === 'unread' 
                  ? 'All notifications have been read. Tap "All Notifications" to browse archives.' 
                  : 'You have no notifications yet.'}
              </p>
            </div>
          ) : (
            displayedItems.map((item) => {
              const { title, description, icon: Icon, iconBg } = renderNotificationContent(item)
              return (
                <div 
                  key={item.id} 
                  className={`bg-white border rounded-xl p-5 shadow-sm transition-all flex items-start gap-4 hover:shadow-md relative ${
                    item.read ? 'border-gray-200/60 opacity-75' : 'border-gray-200 hover:border-indigo-100'
                  }`}
                >
                  {/* Left Side: Icon */}
                  <div className={`p-2.5 rounded-xl border ${iconBg} shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Middle Section: Text details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-gray-950">{title}</h3>
                      {!item.read && (
                        <span className="inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">
                      {formatDate(item.created_at)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed font-medium">
                      {description}
                    </p>

                    {/* Bottom Nav Links */}
                    {item.contact_id && (
                      <div className="mt-4 flex items-center gap-4">
                        <Link 
                          href={`/contacts/${item.contact_id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline group"
                        >
                          View Contact Profile
                          <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Right Side Action: Mark Read */}
                  {!item.read && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      title="Mark as read"
                      className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 border border-transparent transition-all"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">Hygiene Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold pb-3 border-b border-gray-100">
                <span className="text-gray-500">Total Inbox Size</span>
                <span className="text-gray-900 font-bold">{items.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold pb-3 border-b border-gray-100">
                <span className="text-gray-500">Unread Items</span>
                <span className="text-red-600 font-bold">{unreadItems.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-500">Read & Archived</span>
                <span className="text-emerald-600 font-bold">{items.length - unreadItems.length}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 leading-relaxed font-medium">
              Notifications are kept to archive reference history. If you'd like to inspect detailed interaction notes, click to view the respective contact's full chronological timeline.
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 border border-indigo-950 rounded-xl p-6 text-white shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Snooze Intelligence
            </h3>
            <p className="text-xs text-indigo-100/80 leading-relaxed">
              When snoozing, the system temporarily moves the contact to standard sleeping archives. Once the wake-up date is reached, they automatically reappear on the dashboard and trigger an inbox resurfacing alert.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

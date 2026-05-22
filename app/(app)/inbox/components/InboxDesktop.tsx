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
          iconBg: 'bg-amber-50/70 text-amber-700 border-amber-200/50',
        }
      case 'working_list_changed':
        const action = item.payload.action === 'added' ? 'added to' : 'removed from'
        return {
          title: 'Focus List Update',
          description: `${contactName} was ${action} your active Working List.`,
          icon: TrendingUp,
          iconBg: 'bg-terra-primary-fixed/30 text-terra-primary border-terra-primary-container/30',
        }
      case 'sync_conflict':
        return {
          title: 'Google Sync Conflict',
          description: `A data sync conflict was identified on ${contactName}. Fields: ${Object.keys(item.payload.conflicts || {}).join(', ') || 'multiple fields'}.`,
          icon: AlertTriangle,
          iconBg: 'bg-rose-50/70 text-rose-700 border-rose-200/50',
        }
      default:
        return {
          title: 'System Alert',
          description: 'A general workspace notification occurred.',
          icon: Inbox,
          iconBg: 'bg-terra-surface-container-high text-terra-on-surface-variant border-terra-surface-container-highest/40',
        }
    }
  }

  return (
    <div className="min-h-screen bg-terra-surface p-6 md:p-8 text-terra-on-surface">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-terra-primary font-headline">Inbox</h1>
          <p className="text-sm text-terra-on-surface-variant font-body mt-1">
            Stay updated on resurfaced tasks and automated system changes.
          </p>
        </div>
        {unreadItems.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50/70 border border-red-100 text-xs font-bold text-red-700 font-body">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            {unreadItems.length} Action Needed
          </div>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex items-center justify-between border-b border-terra-surface-container-highest pb-px mb-6">
        <div className="flex gap-6" role="tablist" aria-label="Notification filters">
          <button
            onClick={() => setFilter('unread')}
            aria-selected={filter === 'unread'}
            role="tab"
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all relative font-body ${
              filter === 'unread'
                ? 'border-terra-primary text-terra-primary'
                : 'border-transparent text-terra-on-surface-variant hover:text-terra-on-surface'
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
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all font-body ${
              filter === 'all'
                ? 'border-terra-primary text-terra-primary'
                : 'border-transparent text-terra-on-surface-variant hover:text-terra-on-surface'
            }`}
          >
            All Notifications
          </button>
        </div>
        <p className="text-xs text-terra-outline font-medium font-body">Auto-clears as you mark done</p>
      </div>

      {/* Main Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Feed Column (col-span-2) */}
        <div className={`lg:col-span-2 space-y-4 ${isPending ? 'opacity-65 pointer-events-none' : ''} transition-opacity`}>
          {displayedItems.length === 0 ? (
            <div className="bg-terra-surface-container-low border border-terra-surface-container-highest rounded-xl p-16 text-center shadow-sm">
              <div className="p-4 bg-terra-primary-fixed/30 text-terra-primary rounded-full w-fit mx-auto mb-4 border border-terra-primary-container/20">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-terra-on-surface font-headline">Your inbox is clear!</h3>
              <p className="text-sm text-terra-on-surface-variant font-body mt-1 max-w-xs mx-auto">
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
                  className={`border rounded-xl p-5 shadow-sm transition-all flex items-start gap-4 hover:shadow-md relative ${
                    item.read ? 'bg-terra-surface-container-low/50 border-terra-surface-container-highest/60 opacity-75' : 'bg-white border-terra-surface-container-highest hover:border-terra-primary/30'
                  }`}
                >
                  {/* Left Side: Icon */}
                  <div className={`p-2.5 rounded-xl border ${iconBg} shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Middle Section: Text details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-terra-on-surface font-body">{title}</h3>
                      {!item.read && (
                        <span className="inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                      )}
                    </div>
                    <p className="text-xs text-terra-on-surface-variant mt-1 font-body font-semibold">
                      {formatDate(item.created_at)}
                    </p>
                    <p className="text-sm text-terra-on-surface-variant mt-2 leading-relaxed font-body font-medium">
                      {description}
                    </p>

                    {/* Bottom Nav Links */}
                    {item.contact_id && (
                      <div className="mt-4 flex items-center gap-4">
                        <Link 
                          href={`/contacts/${item.contact_id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-terra-primary hover:text-terra-primary/80 hover:underline group font-body"
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
                      className="shrink-0 p-2 rounded-lg text-terra-outline hover:text-terra-primary hover:bg-terra-surface-container-high hover:border-terra-surface-container-highest border border-transparent transition-all"
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
          <div className="bg-white border border-terra-surface-container-highest rounded-xl p-6 shadow-sm font-body">
            <h3 className="text-base font-bold text-terra-on-surface font-headline mb-4">Hygiene Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold pb-3 border-b border-terra-surface-container-highest/50">
                <span className="text-terra-on-surface-variant">Total Inbox Size</span>
                <span className="text-terra-on-surface font-bold">{items.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold pb-3 border-b border-terra-surface-container-highest/50">
                <span className="text-terra-on-surface-variant">Unread Items</span>
                <span className="text-red-700 font-bold">{unreadItems.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-terra-on-surface-variant">Read & Archived</span>
                <span className="text-terra-primary font-bold">{items.length - unreadItems.length}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-terra-surface-container rounded-xl border border-terra-surface-container-highest/40 text-xs text-terra-on-surface-variant leading-relaxed font-body font-medium">
              Notifications are kept to archive reference history. If you'd like to inspect detailed interaction notes, click to view the respective contact's full chronological timeline.
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-terra-snooze-from to-terra-snooze-to border border-terra-snooze-from/20 rounded-xl p-6 text-white shadow-sm font-body">
            <h3 className="text-xs font-bold uppercase tracking-wider text-terra-on-primary-container mb-2 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Snooze Intelligence
            </h3>
            <p className="text-xs text-terra-surface/80 leading-relaxed">
              When snoozing, the system temporarily moves the contact to standard sleeping archives. Once the wake-up date is reached, they automatically reappear on the dashboard and trigger an inbox resurfacing alert.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

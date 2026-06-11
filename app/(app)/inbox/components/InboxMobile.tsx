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

export default function InboxMobile({ items }: Props) {
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

  function renderNotificationContent(item: InboxItem) {
    const contactName = item.contacts 
      ? `${item.contacts.first_name} ${item.contacts.last_name || ''}`.trim()
      : 'Unknown Contact'

    switch (item.type) {
      case 'resurfaced':
        return {
          title: 'Resurfaced',
          description: `${contactName} has resurfaced from snooze. Time to re-engage!`,
          icon: Clock,
          iconBg: 'bg-amber-50/70 text-amber-700 border-amber-200/50',
        }
      case 'working_list_changed':
        const action = item.payload.action === 'added' ? 'added to' : 'removed from'
        return {
          title: 'Focus Update',
          description: `${contactName} was ${action} your focus list.`,
          icon: TrendingUp,
          iconBg: 'bg-terra-primary-fixed/30 text-terra-primary border-terra-primary-container/30',
        }
      default:
        return {
          title: 'Alert',
          description: 'A general workspace action occurred.',
          icon: Inbox,
          iconBg: 'bg-terra-surface-container-high text-terra-on-surface-variant border-terra-surface-container-highest/40',
        }
    }
  }

  return (
    <div className="min-h-screen bg-terra-surface px-4 pt-6 pb-24 text-terra-on-surface">
      {/* Mobile Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-terra-primary font-headline">Inbox</h1>
          <p className="text-xs text-terra-on-surface-variant font-body mt-0.5">Workspace alerts feed</p>
        </div>
        {unreadItems.length > 0 && (
          <span className="inline-flex items-center justify-center bg-red-100 text-red-700 text-[10px] font-extrabold h-5 px-2 rounded-full border border-red-200 font-body">
            {unreadItems.length} New
          </span>
        )}
      </div>

      {/* Touch-optimized Pill Filter Row */}
      <div className="flex gap-2 mb-5" role="group" aria-label="Notification filters">
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 font-body ${
            filter === 'unread'
              ? 'bg-terra-primary text-white border-terra-primary'
              : 'bg-white text-terra-on-surface-variant border-terra-surface-container-highest active:bg-terra-surface-container'
          }`}
        >
          Unread
          {unreadItems.length > 0 && (
            <span className={`inline-flex items-center justify-center text-[10px] h-4.5 px-1.5 rounded-full font-extrabold ${
              filter === 'unread' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'
            }`}>
              {unreadItems.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors font-body ${
            filter === 'all'
              ? 'bg-terra-primary text-white border-terra-primary'
              : 'bg-white text-terra-on-surface-variant border-terra-surface-container-highest active:bg-terra-surface-container'
          }`}
        >
          All Archives ({items.length})
        </button>
      </div>

      {/* Feed Stack */}
      <div className={`space-y-3.5 ${isPending ? 'opacity-65 pointer-events-none' : ''} transition-opacity`}>
        {displayedItems.length === 0 ? (
          <div className="bg-terra-surface-container-low border border-terra-surface-container-highest rounded-xl py-12 px-4 text-center shadow-sm">
            <div className="p-3 bg-terra-primary-fixed/30 text-terra-primary rounded-full w-fit mx-auto mb-3 border border-terra-primary-container/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-terra-on-surface font-headline">Inbox is clear!</h3>
            <p className="text-xs text-terra-on-surface-variant font-body mt-1 max-w-[200px] mx-auto leading-relaxed">
              {filter === 'unread' 
                ? 'All notifications marked as read.' 
                : 'No notification records present.'}
            </p>
          </div>
        ) : (
          displayedItems.map((item) => {
            const { title, description, icon: Icon, iconBg } = renderNotificationContent(item)
            return (
              <div 
                key={item.id} 
                className={`border rounded-xl p-4 shadow-sm flex flex-col gap-3 relative font-body ${
                  item.read ? 'bg-terra-surface-container-low/50 border-terra-surface-container-highest/60 opacity-75' : 'bg-white border-terra-surface-container-highest'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg border ${iconBg} shrink-0`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    {/* Details */}
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-terra-on-surface flex items-center gap-1.5 truncate font-body">
                        {title}
                        {!item.read && <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>}
                      </h3>
                      <span className="text-[9px] text-terra-outline font-semibold mt-0.5 block font-body">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Quick Mark Read Button (Only unread) */}
                  {!item.read && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      className="p-1.5 rounded-lg text-terra-outline active:text-terra-primary active:bg-terra-surface-container-high border border-transparent transition-colors"
                      title="Mark read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-terra-on-surface-variant leading-relaxed font-semibold font-body">
                  {description}
                </p>

                {/* Action CTA */}
                {item.contact_id && (
                  <div className="pt-2.5 border-t border-terra-surface-container-highest flex items-center">
                    <Link 
                      href={`/contacts/${item.contact_id}`}
                      className="inline-flex items-center gap-1 text-[10px] font-extrabold text-terra-primary active:text-terra-primary/80 group font-body"
                    >
                      View Profile
                      <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

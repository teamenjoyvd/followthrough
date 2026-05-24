'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { History, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getActionLabel } from '@/lib/action-log-labels'
import { undoAction } from '@/lib/actions/action-log'
import type { HistoryItem } from '../page'

const PAGE_SIZE = 25

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'interactions', label: 'Interactions' },
  { key: 'settings', label: 'Settings' },
] as const

interface Props {
  items: HistoryItem[]
  totalCount: number
  page: number
  filter: string
  pageSize: number
}

export default function HistoryDesktop({ items, totalCount, page, filter }: Props) {
  const router = useRouter()
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const navigate = (p: number, f?: string) => {
    const params = new URLSearchParams()
    params.set('page', String(p))
    params.set('filter', f ?? filter)
    router.push(`/history?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#faf6f0] pb-12 font-body text-[#2e3230]">
      <main className="max-w-3xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-[#eae6de] rounded-2xl">
            <History className="h-5 w-5 text-[#705c30]" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-[#2e3230]">History</h1>
            <p className="text-xs text-[#74796e] font-sans mt-0.5">
              {totalCount} action{totalCount !== 1 ? 's' : ''} logged
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-[#eae6de] p-1 rounded-2xl mb-6 w-fit">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(0, tab.key)}
              className={cn(
                'px-4 py-1.5 text-xs font-bold font-sans rounded-xl transition-all duration-200',
                filter === tab.key
                  ? 'bg-[#faf6f0] text-[#4a7c59] shadow-sm'
                  : 'text-[#74796e] hover:text-[#2e3230]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {items.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-center">
            <div className="p-4 bg-[#eae6de] text-[#74796e] rounded-full mb-4">
              <History className="h-7 w-7" />
            </div>
            <p className="font-headline text-base font-bold text-[#2e3230]">No history yet</p>
            <p className="text-xs text-[#74796e] font-sans mt-1">Actions will appear here as you use Followthrough.</p>
          </div>
        ) : (
          <div className="relative pl-5 border-l border-[#dbd7cf] space-y-0">
            {items.map((item) => (
              <HistoryRow key={item.id} item={item} onUndone={() => router.refresh()} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => navigate(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 text-xs font-bold font-sans bg-[#eae6de] text-[#2e3230] rounded-xl hover:bg-[#dedad2] disabled:opacity-40 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-[#74796e] font-sans">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => navigate(page + 1)}
              disabled={page + 1 >= totalPages}
              className="px-4 py-2 text-xs font-bold font-sans bg-[#eae6de] text-[#2e3230] rounded-xl hover:bg-[#dedad2] disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// HistoryRow — client sub-component that owns undo state + expiry countdown
// ---------------------------------------------------------------------------
function HistoryRow({ item, onUndone }: { item: HistoryItem; onUndone: () => void }) {
  const [undoStatus, setUndoStatus] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [canUndo, setCanUndo] = React.useState(() => isUndoable(item))

  // Tick every second to hide Undo button when undo_expires_at passes
  React.useEffect(() => {
    if (!item.undo_expires_at || item.undone_at) return
    const interval = setInterval(() => {
      setCanUndo(isUndoable(item))
    }, 1000)
    return () => clearInterval(interval)
  }, [item])

  const handleUndo = async () => {
    if (undoStatus !== 'idle') return
    setUndoStatus('loading')
    setErrorMsg(null)
    const res = await undoAction(item.id)
    if ('error' in res) {
      setUndoStatus('error')
      setErrorMsg(res.error)
      setTimeout(() => setUndoStatus('idle'), 3000)
    } else {
      setUndoStatus('done')
      onUndone()
    }
  }

  const isUndone = item.undone_at !== null || undoStatus === 'done'
  const label = getActionLabel(item.action_type)
  const entityName = item.contact_first_name
    ? [item.contact_first_name, item.contact_last_name].filter(Boolean).join(' ')
    : item.entity_type
  const relTime = formatRelativeTime(item.created_at)

  return (
    <div className={cn('relative py-4 pl-5 group', isUndone && 'opacity-50')}>
      {/* Timeline node */}
      <div className="absolute -left-[22px] top-5 h-2.5 w-2.5 rounded-full bg-[#eae6de] border-2 border-[#705c30]" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#2e3230] font-sans">{label}</p>
          <p className="text-xs text-[#74796e] font-sans mt-0.5">
            {entityName} &middot; {relTime}
          </p>
          {errorMsg && (
            <p className="text-xs text-[#b83230] mt-1">{errorMsg}</p>
          )}
        </div>

        <div className="shrink-0">
          {isUndone ? (
            <span className="text-xs font-sans text-[#74796e] italic">Undone</span>
          ) : canUndo ? (
            <button
              onClick={handleUndo}
              disabled={undoStatus === 'loading'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-sans bg-[#eae6de] text-[#705c30] hover:bg-[#dedad2] rounded-xl transition-colors disabled:opacity-50 active:scale-95"
            >
              <Undo2 className="h-3 w-3" />
              {undoStatus === 'loading' ? 'Undoing…' : 'Undo'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function isUndoable(item: HistoryItem): boolean {
  if (item.undone_at) return false
  if (!item.undo_expires_at) return false
  return Date.now() < new Date(item.undo_expires_at).getTime()
}

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

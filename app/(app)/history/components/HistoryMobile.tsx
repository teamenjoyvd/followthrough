'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { History, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getActionLabel } from '@/lib/action-log-labels'
import { undoAction } from '@/lib/actions/action-log'
import type { HistoryItem } from '../history-types'
import { PAGE_SIZE, FILTER_TABS, isUndoable, formatRelativeTime } from '../history-utils'

interface Props {
  items: HistoryItem[]
  totalCount: number
  page: number
  filter: string
  pageSize: number
}

export default function HistoryMobile({ items, totalCount, page, filter }: Props) {
  const router = useRouter()
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const navigate = (p: number, f?: string) => {
    const params = new URLSearchParams()
    params.set('page', String(p))
    params.set('filter', f ?? filter)
    router.push(`/history?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#faf6f0] font-body text-[#2e3230] flex flex-col">
      <main className="flex-1 px-4 py-5 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-[#eae6de] rounded-xl">
            <History className="h-4 w-4 text-[#705c30]" />
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold text-[#2e3230]">History</h1>
            <p className="text-[10px] text-[#74796e] font-sans">
              {totalCount} action{totalCount !== 1 ? 's' : ''} logged
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-[#eae6de] p-1 rounded-2xl mb-5 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(0, tab.key)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 text-[10px] font-bold font-sans rounded-xl transition-all duration-200',
                filter === tab.key
                  ? 'bg-[#faf6f0] text-[#4a7c59] shadow-sm'
                  : 'text-[#74796e]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {items.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="p-4 bg-[#eae6de] text-[#74796e] rounded-full mb-3">
              <History className="h-6 w-6" />
            </div>
            <p className="font-headline text-base font-bold text-[#2e3230]">No history yet</p>
            <p className="text-xs text-[#74796e] font-sans mt-1">Actions will appear here as you use Followthrough.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <MobileHistoryRow key={item.id} item={item} onUndone={() => router.refresh()} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => navigate(page - 1)}
              disabled={page === 0}
              className="px-3 py-2 text-xs font-bold font-sans bg-[#eae6de] text-[#2e3230] rounded-xl disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-[10px] text-[#74796e] font-sans">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => navigate(page + 1)}
              disabled={page + 1 >= totalPages}
              className="px-3 py-2 text-xs font-bold font-sans bg-[#eae6de] text-[#2e3230] rounded-xl disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function MobileHistoryRow({ item, onUndone }: { item: HistoryItem; onUndone: () => void }) {
  const [undoStatus, setUndoStatus] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [canUndo, setCanUndo] = React.useState(() => isUndoable(item))

  React.useEffect(() => {
    if (!item.undo_expires_at || item.undone_at) return
    const interval = setInterval(() => setCanUndo(isUndoable(item)), 1000)
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
    <div
      className={cn(
        'bg-[#f5f1ea] border border-[#e4e0d8]/40 rounded-[20px] p-4',
        isUndone && 'opacity-50'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#2e3230] font-sans">{label}</p>
          <p className="text-[10px] text-[#74796e] font-sans mt-0.5">
            {entityName} &middot; {relTime}
          </p>
          {errorMsg && <p className="text-[10px] text-[#b83230] mt-1">{errorMsg}</p>}
        </div>
        <div className="shrink-0">
          {isUndone ? (
            <span className="text-[10px] font-sans text-[#74796e] italic">Undone</span>
          ) : canUndo ? (
            <button
              onClick={handleUndo}
              disabled={undoStatus === 'loading'}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold font-sans bg-[#eae6de] text-[#705c30] rounded-xl active:scale-95 disabled:opacity-50 transition-transform"
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

'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, Trash2 } from 'lucide-react'
import { PIPELINE_STATUSES } from '@/app/(app)/contacts/components/PipelineStatusControl'
import { markDone, removeFromWorkingList } from '@/lib/actions/working-list'
import { snoozeContact } from '@/lib/actions/snooze'
import type { Database } from '@/types/supabase'

type Contact = Database['public']['Tables']['contacts']['Row']

function getInitials(first: string, last: string | null) {
  return `${first[0] || ''}${last ? last[0] || '' : ''}`.toUpperCase()
}

export default function WorkingListMobileClient({ workingList }: { workingList: Contact[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeSnoozeId, setActiveSnoozeId] = useState<string | null>(null)

  function statusBadge(status: Database['public']['Enums']['pipeline_status']) {
    const found = PIPELINE_STATUSES.find((s) => s.value === status)
    return found ? (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${found.color}`}>
        {found.label}
      </span>
    ) : null
  }

  function handleMarkDone(contactId: string) {
    startTransition(async () => {
      const res = await markDone(contactId)
      if ('error' in res) alert(res.error)
      else router.refresh()
    })
  }

  function handleRemove(contactId: string) {
    startTransition(async () => {
      const res = await removeFromWorkingList(contactId)
      if ('error' in res) alert(res.error)
      else router.refresh()
    })
  }

  function handleQuickSnooze(contactId: string, days: number) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setActiveSnoozeId(null)
    startTransition(async () => {
      const res = await snoozeContact(contactId, date)
      if ('error' in res) alert(res.error)
      else router.refresh()
    })
  }

  function handleCustomSnooze(contactId: string, date: Date) {
    setActiveSnoozeId(null)
    startTransition(async () => {
      const res = await snoozeContact(contactId, date)
      if ('error' in res) alert(res.error)
      else router.refresh()
    })
  }

  if (workingList.length === 0) {
    return (
      <div className="bg-terra-surface-container-low rounded-xl p-8 flex flex-col items-center text-center border border-terra-outline-variant/40">
        <div className="p-3 bg-terra-primary-fixed text-primary rounded-full mb-3">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">All caught up!</h3>
        <p className="text-xs text-muted-foreground max-w-[240px] mt-1">
          Pin contacts to your focus list from their details or pipeline.
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-2 ${
      isPending ? 'opacity-60 pointer-events-none' : ''
    } transition-opacity`}>
      {workingList.map((c) => (
        <div key={c.id} className="bg-terra-surface-container-low rounded-xl border border-terra-outline-variant/40 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href={`/contacts/${c.id}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-full bg-terra-primary-fixed text-primary font-bold text-xs flex items-center justify-center">
                {getInitials(c.first_name, c.last_name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-foreground truncate">
                    {c.first_name} {c.last_name}
                  </span>
                  {statusBadge(c.pipeline_status)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {c.company || 'No company'}
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleMarkDone(c.id)}
                className="p-2 rounded-lg text-primary hover:bg-terra-primary-fixed transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveSnoozeId(activeSnoozeId === c.id ? null : c.id)}
                className={`p-2 rounded-lg transition-colors ${
                  activeSnoozeId === c.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-terra-tertiary hover:bg-accent/40'
                }`}
              >
                <Clock className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleRemove(c.id)}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {activeSnoozeId === c.id && (
            <div className="mt-3 p-3 bg-muted rounded-xl border border-border space-y-2 animate-in slide-in-from-top-2 duration-150">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Snooze until</div>
              <div className="grid grid-cols-3 gap-2">
                {[{ label: '1 Day', days: 1 }, { label: '3 Days', days: 3 }, { label: '1 Week', days: 7 }].map(
                  ({ label, days }) => (
                    <button
                      key={days}
                      onClick={() => handleQuickSnooze(c.id, days)}
                      className="py-1.5 text-center text-xs font-semibold bg-background border border-border hover:bg-terra-primary-fixed hover:text-primary hover:border-primary/30 rounded-lg transition-colors"
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
              <div className="pt-2 border-t border-border">
                <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Custom date</label>
                <input
                  type="date"
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  onChange={(e) => { if (e.target.value) handleCustomSnooze(c.id, new Date(e.target.value)) }}
                  className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

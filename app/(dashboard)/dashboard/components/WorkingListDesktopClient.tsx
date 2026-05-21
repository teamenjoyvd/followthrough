'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, Trash2, ChevronRight } from 'lucide-react'
import { PIPELINE_STATUSES } from '@/app/(app)/contacts/components/PipelineStatusControl'
import { markDone, removeFromWorkingList } from '@/lib/actions/working-list'
import { snoozeContact } from '@/lib/actions/snooze'
import type { Database } from '@/types/supabase'

type Contact = Database['public']['Tables']['contacts']['Row']

function getInitials(first: string, last: string | null) {
  return `${first[0] || ''}${last ? last[0] || '' : ''}`.toUpperCase()
}

export default function WorkingListDesktopClient({ workingList }: { workingList: Contact[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeSnoozeId, setActiveSnoozeId] = useState<string | null>(null)

  function statusBadge(status: Database['public']['Enums']['pipeline_status']) {
    const found = PIPELINE_STATUSES.find((s) => s.value === status)
    return found ? (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${found.color}`}>
        {found.label}
      </span>
    ) : null
  }

  function handleMarkDone(id: string) {
    startTransition(async () => {
      const res = await markDone(id)
      if ('error' in res) alert(res.error)
      else router.refresh()
    })
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      const res = await removeFromWorkingList(id)
      if ('error' in res) alert(res.error)
      else router.refresh()
    })
  }

  function handleQuickSnooze(id: string, days: number) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setActiveSnoozeId(null)
    startTransition(async () => {
      const res = await snoozeContact(id, date)
      if ('error' in res) alert(res.error)
      else router.refresh()
    })
  }

  function handleCustomSnooze(id: string, date: Date) {
    setActiveSnoozeId(null)
    startTransition(async () => {
      const res = await snoozeContact(id, date)
      if ('error' in res) alert(res.error)
      else router.refresh()
    })
  }

  if (workingList.length === 0) {
    return (
      <div className="bg-terra-surface-container-low border border-terra-outline-variant/40 rounded-xl py-16 flex flex-col items-center text-center">
        <div className="p-4 bg-terra-primary-fixed text-primary rounded-full mb-4">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-foreground">All caught up!</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1.5">
          Go to{' '}
          <Link href="/contacts" className="text-primary font-semibold hover:underline">Contacts</Link>
          {' '}or{' '}
          <Link href="/pipeline" className="text-primary font-semibold hover:underline">Pipeline</Link>
          {' '}to pin contacts here.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`bg-terra-surface-container-low border border-terra-outline-variant/40 rounded-xl overflow-hidden shadow-sm divide-y divide-terra-outline-variant/30 ${
        isPending ? 'opacity-60 pointer-events-none' : ''
      } transition-opacity`}
    >
      {workingList.map((c) => (
        <div key={c.id} className="p-5 flex items-center justify-between hover:bg-terra-surface-container-high transition-colors group">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="h-10 w-10 shrink-0 rounded-full bg-terra-primary-fixed text-primary font-bold text-sm flex items-center justify-center">
              {getInitials(c.first_name, c.last_name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/contacts/${c.id}`}
                  className="font-bold text-sm text-foreground hover:text-primary hover:underline transition-colors truncate"
                >
                  {c.first_name} {c.last_name}
                </Link>
                {statusBadge(c.pipeline_status)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                {c.job_title && <span>{c.job_title}</span>}
                {c.job_title && c.company && <span> at </span>}
                {c.company && <span className="font-medium">{c.company}</span>}
                {!c.job_title && !c.company && <span className="opacity-40">—</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-4">
            <button
              onClick={() => handleMarkDone(c.id)}
              title="Mark done"
              className="p-2 rounded-lg text-primary hover:bg-terra-primary-fixed transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setActiveSnoozeId(activeSnoozeId === c.id ? null : c.id)}
                title="Snooze"
                className={`p-2 rounded-lg transition-colors ${
                  activeSnoozeId === c.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-terra-tertiary hover:bg-accent/40'
                }`}
              >
                <Clock className="h-4 w-4" />
              </button>

              {activeSnoozeId === c.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setActiveSnoozeId(null)} />
                  <div className="absolute right-0 mt-2 z-20 w-52 bg-background border border-border rounded-xl shadow-xl p-3.5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Snooze until</div>
                    <div className="flex flex-col gap-1">
                      {[{ label: 'Tomorrow', days: 1 }, { label: 'In 3 days', days: 3 }, { label: 'In 1 week', days: 7 }].map(
                        ({ label, days }) => (
                          <button
                            key={days}
                            onClick={() => handleQuickSnooze(c.id, days)}
                            className="w-full text-left px-2.5 py-1.5 text-xs font-semibold hover:bg-terra-primary-fixed hover:text-primary rounded-lg transition-colors flex items-center justify-between"
                          >
                            <span>{label}</span>
                            <ChevronRight className="h-3 w-3 opacity-40" />
                          </button>
                        )
                      )}
                    </div>
                    <div className="border-t border-border pt-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Custom date</label>
                      <input
                        type="date"
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        onChange={(e) => { if (e.target.value) handleCustomSnooze(c.id, new Date(e.target.value)) }}
                        className="w-full text-xs border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring bg-muted"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => handleRemove(c.id)}
              title="Remove"
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

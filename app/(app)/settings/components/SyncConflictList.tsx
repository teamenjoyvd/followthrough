'use client'

import { useState, useTransition } from 'react'
import { resolveConflict } from '@/lib/actions/sync-conflicts'

// Explicit interface — avoids Database['...']['Row'] & { contacts } intersection
// which collapses the joined relation to `never` under strict TS.
export interface SyncConflictWithContact {
  id: string
  profile_id: string
  contact_id: string
  field_name: string
  our_value: string | null
  google_value: string | null
  resolved: boolean
  created_at: string
  contacts: { first_name: string; last_name: string | null } | null
}

interface Props {
  conflicts: SyncConflictWithContact[]
  profileId: string
}

function ConflictRow({
  conflict,
  profileId,
  onResolved,
}: {
  conflict: SyncConflictWithContact
  profileId: string
  onResolved: (id: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const contactName = conflict.contacts
    ? [conflict.contacts.first_name, conflict.contacts.last_name].filter(Boolean).join(' ')
    : 'Unknown contact'

  function handleResolve(winner: 'ours' | 'google') {
    setError(null)
    startTransition(async () => {
      const result = await resolveConflict(conflict.id, winner, profileId)
      if ('error' in result) {
        setError(result.error)
      } else {
        onResolved(conflict.id)
      }
    })
  }

  return (
    <div className="border border-[#e4e0d8] rounded-[16px] p-4 space-y-3 bg-[#f5f1ea]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-[#2e3230]">{contactName}</p>
          <p className="text-xs text-[#74796e] capitalize">{conflict.field_name.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#74796e] uppercase tracking-wide">Our value</p>
          <p className="text-sm text-[#2e3230] bg-[#eae6de] rounded-xl px-2 py-1.5 min-h-8">
            {conflict.our_value ?? <span className="text-[#74796e] italic">empty</span>}
          </p>
          <button
            onClick={() => handleResolve('ours')}
            disabled={isPending}
            className="w-full text-xs font-medium px-3 py-1.5 rounded-xl border border-[#e4e0d8] bg-[#faf6f0] text-[#2e3230] hover:bg-[#eae6de] disabled:opacity-50 transition-colors"
          >
            Keep ours
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-[#4a7c59] uppercase tracking-wide">Google value</p>
          <p className="text-sm text-[#2e3230] bg-[#d8f0de] rounded-xl px-2 py-1.5 min-h-8">
            {conflict.google_value ?? <span className="text-[#74796e] italic">empty</span>}
          </p>
          <button
            onClick={() => handleResolve('google')}
            disabled={isPending}
            className="w-full text-xs font-medium px-3 py-1.5 rounded-xl border border-[#4a7c59]/30 bg-[#d8f0de] text-[#2e3230] hover:bg-[#c8e8ce] disabled:opacity-50 transition-colors"
          >
            Use Google
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function SyncConflictList({ conflicts, profileId }: Props) {
  const [items, setItems] = useState(conflicts)

  function handleResolved(id: string) {
    setItems((prev) => prev.filter((c) => c.id !== id))
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[#74796e] py-4 text-center">No unresolved conflicts.</p>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((conflict) => (
        <ConflictRow
          key={conflict.id}
          conflict={conflict}
          profileId={profileId}
          onResolved={handleResolved}
        />
      ))}
    </div>
  )
}

'use client'

import { useTransition } from 'react'
import { updatePipelineStatus } from '@/lib/actions/contacts'
import type { Database } from '@/types/supabase'

type PipelineStatus = Database['public']['Enums']['pipeline_status']
type Contact = Database['public']['Tables']['contacts']['Row']

const PIPELINE_STATUSES: { value: PipelineStatus; label: string; color: string }[] = [
  { value: 'lead', label: 'Lead', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'qualified', label: 'Qualified', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  { value: 'bought', label: 'Bought', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'leave_alone', label: 'Leave alone', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { value: 'snoozed', label: 'Snoozed', color: 'bg-amber-100 text-amber-800 border-amber-200' },
]

interface Props {
  contact: Pick<Contact, 'id' | 'pipeline_status'>
}

export function PipelineStatusControl({ contact }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleChange(status: PipelineStatus) {
    startTransition(async () => {
      await updatePipelineStatus(contact.id, status)
    })
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Pipeline status">
      {PIPELINE_STATUSES.map(({ value, label, color }) => {
        const isActive = contact.pipeline_status === value
        return (
          <button
            key={value}
            onClick={() => handleChange(value)}
            disabled={isPending || isActive}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isActive
                ? `${color} shadow-sm ring-2 ring-offset-1 ring-current`
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
            aria-pressed={isActive}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export { PIPELINE_STATUSES }

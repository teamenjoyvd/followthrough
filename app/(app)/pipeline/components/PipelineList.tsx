'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { moveContact } from '@/lib/actions/pipeline'
import { PIPELINE_STATUSES } from '@/app/(app)/contacts/components/PipelineStatusControl'
import type { Database } from '@/types/supabase'

type PipelineStatus = Database['public']['Enums']['pipeline_status']
type Contact = Pick<
  Database['public']['Tables']['contacts']['Row'],
  'id' | 'first_name' | 'last_name' | 'company' | 'pipeline_status' | 'last_contacted_at'
>

interface Props {
  contacts: Contact[]
  profileId: string
}

function ContactRow({
  contact,
  profileId,
}: {
  contact: Contact
  profileId: string
}) {
  const [isPending, startTransition] = useTransition()
  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
  const statusMeta = PIPELINE_STATUSES.find((s) => s.value === contact.pipeline_status)

  function handleStatusChange(newStatus: PipelineStatus) {
    startTransition(async () => {
      await moveContact(contact.id, newStatus, profileId)
    })
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 ${isPending ? 'opacity-50' : ''}`}>
      <Link
        href={`/contacts/${contact.id}`}
        className="flex flex-col min-w-0 flex-1"
      >
        <span className="text-sm font-medium text-gray-900 truncate">{fullName}</span>
        {contact.company && (
          <span className="text-xs text-gray-500 truncate">{contact.company}</span>
        )}
      </Link>

      {/* Quick status tap */}
      <select
        value={contact.pipeline_status}
        onChange={(e) => handleStatusChange(e.target.value as PipelineStatus)}
        disabled={isPending}
        className={`ml-3 text-xs border rounded-full px-2 py-1 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${statusMeta?.color ?? 'border-gray-200 bg-white text-gray-600'}`}
        aria-label={`Pipeline status for ${fullName}`}
      >
        {PIPELINE_STATUSES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  )
}

export function PipelineList({ contacts, profileId }: Props) {
  const grouped = PIPELINE_STATUSES.reduce<Record<PipelineStatus, Contact[]>>(
    (acc, { value }) => {
      acc[value] = contacts.filter((c) => c.pipeline_status === value)
      return acc
    },
    {} as Record<PipelineStatus, Contact[]>,
  )

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {PIPELINE_STATUSES.map(({ value, label, color }) => {
        const group = grouped[value] ?? []
        if (group.length === 0) return null
        return (
          <section key={value}>
            <div className="sticky top-0 bg-white px-4 py-2 border-b border-gray-100 z-10">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
                {label} <span className="opacity-60">({group.length})</span>
              </span>
            </div>
            {group.map((contact) => (
              <ContactRow key={contact.id} contact={contact} profileId={profileId} />
            ))}
          </section>
        )
      })}

      {contacts.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
          <p className="text-sm text-gray-500">No contacts in your pipeline yet.</p>
          <Link href="/contacts/new" className="mt-2 text-sm text-indigo-600 hover:underline">
            Add a contact
          </Link>
        </div>
      )}
    </div>
  )
}

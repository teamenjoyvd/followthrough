import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PIPELINE_STATUSES } from './PipelineStatusControl'
import type { Database } from '@/types/supabase'

type Contact = Database['public']['Tables']['contacts']['Row']

interface Props {
  contacts: Contact[]
}

function statusStyle(status: Database['public']['Enums']['pipeline_status']) {
  const found = PIPELINE_STATUSES.find(s => s.value === status)
  return found ? found.color : 'bg-gray-100 text-gray-500 border-gray-200'
}

function statusLabel(status: Database['public']['Enums']['pipeline_status']) {
  return PIPELINE_STATUSES.find(s => s.value === status)?.label ?? status
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function initials(c: Contact) {
  return [c.first_name[0], c.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()
}

export default function ContactsMobile({ contacts }: Props) {
  return (
    <div className="md:hidden divide-y divide-gray-100">
      {contacts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-400">No contacts yet.</p>
          <Link href="/contacts/new" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
            Add your first contact →
          </Link>
        </div>
      ) : (
        contacts.map((c) => (
          <Link
            key={c.id}
            href={`/contacts/${c.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            {/* Avatar */}
            <div className="shrink-0 h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
              {initials(c)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {c.first_name} {c.last_name}
                </span>
                <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${statusStyle(c.pipeline_status)}`}>
                  {statusLabel(c.pipeline_status)}
                </span>
              </div>
              <div className="text-xs text-gray-400 truncate mt-0.5">
                {[c.company, c.job_title].filter(Boolean).join(' · ') || c.email || ''}
              </div>
              {c.last_contacted_at && (
                <div className="text-[10px] text-gray-300 mt-0.5">
                  Last contacted {formatDate(c.last_contacted_at)}
                </div>
              )}
            </div>

            {/* Chevron */}
            <ChevronRight className="shrink-0 h-4 w-4 text-gray-300" />
          </Link>
        ))
      )}
    </div>
  )
}

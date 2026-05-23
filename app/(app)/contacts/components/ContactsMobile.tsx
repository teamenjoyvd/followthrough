import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PIPELINE_STATUSES } from './constants'
import type { Database } from '@/types/supabase'

interface Props {
  contacts: (Database['public']['Tables']['contacts']['Row'] & { phone_numbers?: { number: string }[] })[]
}

function statusStyle(status: Database['public']['Enums']['pipeline_status']) {
  const found = PIPELINE_STATUSES.find(s => s.value === status)
  return found ? found.color : 'bg-[#eae6de] text-[#4a4e4a] border-[#e4e0d8]'
}

function statusLabel(status: Database['public']['Enums']['pipeline_status']) {
  return PIPELINE_STATUSES.find(s => s.value === status)?.label ?? status
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function initials(c: Database['public']['Tables']['contacts']['Row']) {
  return [c.first_name[0], c.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()
}

export default function ContactsMobile({ contacts }: Props) {
  return (
    <div className="md:hidden divide-y divide-[#e4e0d8]">
      {contacts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-[#74796e]">No contacts yet.</p>
          <Link href="/contacts/new" className="mt-2 inline-block text-sm font-semibold text-[#4a7c59] hover:underline">
            Add your first contact →
          </Link>
        </div>
      ) : (
        contacts.map((c) => (
          <Link
            key={c.id}
            href={`/contacts/${c.id}`}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#f5f1ea] active:bg-[#eae6de] transition-colors"
          >
            {/* Avatar */}
            <div className="shrink-0 h-10 w-10 rounded-full bg-[#4a7c59]/10 text-[#4a7c59] flex items-center justify-center text-sm font-bold">
              {initials(c)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#2e3230] truncate">
                  {c.first_name} {c.last_name}
                </span>
                <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${statusStyle(c.pipeline_status)}`}>
                  {statusLabel(c.pipeline_status)}
                </span>
              </div>
              <div className="text-xs text-[#74796e] truncate mt-0.5">
                {[c.company, c.job_title].filter(Boolean).join(' · ') || c.email || ''}
              </div>
              {c.last_contacted_at && (
                <div className="text-[10px] text-[#74796e] mt-0.5">
                  Last contacted {formatDate(c.last_contacted_at)}
                </div>
              )}
            </div>

            {/* Chevron */}
            <ChevronRight className="shrink-0 h-4 w-4 text-[#74796e]" />
          </Link>
        ))
      )}
    </div>
  )
}

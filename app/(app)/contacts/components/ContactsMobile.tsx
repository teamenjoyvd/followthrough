import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PIPELINE_STATUSES } from './constants'
import type { Database } from '@/types/supabase'
import { getLabelColorClass, type Label } from '@/components/LabelManager'

type ContactRow = Database['public']['Tables']['contacts']['Row'] & {
  phone_numbers?: { number: string }[]
  contact_labels?: { label_id: string }[]
  created_by_source?: string
  last_updated_by_source?: string
  source_detail?: string | null
}

interface Props {
  contacts: ContactRow[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  labels: Label[]
}

function statusStyle(status: Database['public']['Enums']['pipeline_status']) {
  const found = PIPELINE_STATUSES.find(s => s.value === status)
  return found ? found.color : 'bg-[#eae6de] text-[#4a4e4a] border-[#e4e0d8]'
}

function statusLabel(status: Database['public']['Enums']['pipeline_status']) {
  return PIPELINE_STATUSES.find(s => s.value === status)?.label ?? status
}

function sourceBadge(source: string) {
  if (source === 'google_sync') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold border bg-[#eaf4ec] text-[#335c3d] border-[#cce3d2]">
        Google
      </span>
    )
  }
  if (source === 'csv_import') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold border bg-[#f0f4fb] text-[#3e649e] border-[#d8e3f2]">
        CSV
      </span>
    )
  }
  return null
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function ContactsMobile({ contacts, selectedIds, onToggleSelect, onSelectAll, labels }: Props) {
  const labelsMap = new Map(labels.map(l => [l.id, l]))
  const isAllSelected = contacts.length > 0 && contacts.every(c => selectedIds.has(c.id))

  return (
    <div className="md:hidden font-body">
      {contacts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-[#74796e]">No contacts yet.</p>
          <Link href="/contacts/new" className="mt-2 inline-block text-sm font-semibold text-[#4a7c59] hover:underline">
            Add your first contact →
          </Link>
        </div>
      ) : (
        <>
          {/* Sub-header: select all + count */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#f5f1ea] border-b border-[#e4e0d8]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onSelectAll}
                className="h-4 w-4 rounded border-[#e4e0d8] text-[#4a7c59] focus:ring-[#4a7c59] bg-[#f5f1ea] cursor-pointer accent-[#4a7c59]"
              />
              <span className="text-xs font-semibold text-[#4a7c59]">Select all</span>
            </label>
            <span className="text-xs text-[#74796e]">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Contact rows */}
          <div className="divide-y divide-[#e4e0d8]">
            {contacts.map((c) => {
              const isRowChecked = selectedIds.has(c.id)
              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                    isRowChecked ? 'bg-[#eae6de]/70' : 'hover:bg-[#f5f1ea] active:bg-[#eae6de]'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="shrink-0 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isRowChecked}
                      onChange={() => onToggleSelect(c.id)}
                      className="h-4 w-4 rounded-md border-[#e4e0d8] text-[#4a7c59] focus:ring-[#4a7c59] bg-[#f5f1ea] cursor-pointer accent-[#4a7c59]"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={`/contacts/${c.id}`}
                        className="text-sm font-semibold text-[#2e3230] hover:text-[#4a7c59] transition-colors truncate"
                      >
                        {c.first_name} {c.last_name}
                      </Link>
                      <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${statusStyle(c.pipeline_status)}`}>
                        {statusLabel(c.pipeline_status)}
                      </span>
                      {sourceBadge(c.created_by_source || 'manual')}
                    </div>

                    {c.contact_labels && c.contact_labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {c.contact_labels.map((cl: any) => {
                          const matched = labelsMap.get(cl.label_id)
                          if (!matched) return null
                          return (
                            <span
                              key={matched.id}
                              className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold border leading-none ${getLabelColorClass(matched.color)}`}
                            >
                              {matched.name}
                            </span>
                          )
                        })}
                      </div>
                    )}

                    <div className="text-xs text-[#74796e] truncate mt-1">
                      {[c.company, c.job_title].filter(Boolean).join(' · ') || ''}
                    </div>

                    <div className="flex flex-col text-[11px] text-[#74796e] mt-0.5 space-y-0.5">
                      {c.email && <span className="truncate">{c.email}</span>}
                      {c.phone_numbers?.[0]?.number && (
                        <span className="text-[#4a7c59] font-medium truncate">{c.phone_numbers[0].number}</span>
                      )}
                    </div>

                    {c.last_contacted_at && (
                      <div className="text-[10px] text-[#74796e] mt-1">
                        Last contacted {formatDate(c.last_contacted_at)}
                      </div>
                    )}
                  </div>

                  {/* Chevron */}
                  <Link href={`/contacts/${c.id}`} className="shrink-0 p-1.5 hover:bg-[#eae6de] rounded-lg transition-colors">
                    <ChevronRight className="h-4 w-4 text-[#74796e]" />
                  </Link>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

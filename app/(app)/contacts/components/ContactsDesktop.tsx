import Link from 'next/link'
import { ChevronUp, ChevronDown, ChevronsUpDown, Bookmark } from 'lucide-react'
import { PIPELINE_STATUSES } from './constants'
import type { Database } from '@/types/supabase'
import { getLabelColorClass, type Label } from '@/components/LabelManager'

type SortKey = 'first_name' | 'company' | 'pipeline_status' | 'last_contacted_at'
type SortDir = 'asc' | 'desc'

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
  onTogglePin: (id: string, currentValue: boolean) => void
  labels: Label[]
  sortKey: SortKey
  sortDir: SortDir
  currentQuery: string
  currentStatus: string
  currentLastContacted: string
  currentCompany: string
}

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronsUpDown className="h-3.5 w-3.5 text-[#74796e]" />
  return sortDir === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 text-[#2e3230]" />
    : <ChevronDown className="h-3.5 w-3.5 text-[#2e3230]" />
}

function statusBadge(status: Database['public']['Enums']['pipeline_status']) {
  const found = PIPELINE_STATUSES.find((s: { value: string }) => s.value === status)
  return found
    ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${found.color}`}>{found.label}</span>
    : null
}

function sourceBadge(source: string, detail: string | null) {
  if (source === 'google_sync') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-[#eaf4ec] text-[#335c3d] border-[#cce3d2]" title="Synced from Google Contacts">
        Google Sync
      </span>
    )
  }
  if (source === 'csv_import') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-[#f0f4fb] text-[#3e649e] border-[#d8e3f2]" title={detail ? `Imported from CSV file: ${detail}` : 'Imported via CSV file'}>
        CSV Import
      </span>
    )
  }
  if (source === 'api') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-[#fbf0f0] text-[#a14b49] border-[#f2d8d7]" title="Added via External Developer API">
        API Link
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-[#fbf4ea] text-[#8c6239] border-[#f0dfcc]">
      Manual
    </span>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return <span className="text-[#74796e]">—</span>
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'first_name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'pipeline_status', label: 'Status' },
  { key: 'last_contacted_at', label: 'Last contacted' },
]

export default function ContactsDesktop({
  contacts,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onTogglePin,
  labels,
  sortKey,
  sortDir,
  currentQuery,
  currentStatus,
  currentLastContacted,
  currentCompany,
}: Props) {
  const labelsMap = new Map(labels.map(l => [l.id, l]))

  // NOTE: currentFocused is intentionally not passed to this component — sortHref uses URL
  // but we can't read searchParams in a server component here. We rely on the parent page
  // to always pass focused through ContactFilterBar, not through the sort link.
  // To preserve focused during sort, ContactFilterBar's buildHref already includes it.
  // sortHref below only needs to preserve the fields ContactsDesktop receives as props.
  function sortHref(col: SortKey) {
    const nextDir = col === sortKey && sortDir === 'asc' ? 'desc' : 'asc'
    const params = new URLSearchParams()
    if (currentQuery) params.set('q', currentQuery)
    if (currentStatus) params.set('status', currentStatus)
    if (currentLastContacted) params.set('last_contacted', currentLastContacted)
    if (currentCompany) params.set('company', currentCompany)
    params.set('sort', col)
    params.set('dir', nextDir)
    return `/contacts?${params.toString()}`
  }

  const allSelected = contacts.length > 0 && selectedIds.size === contacts.length

  return (
    <div role="table" aria-label="Contacts list" className="hidden md:block px-6 py-4 space-y-2">
      {/* Column headers — grid updated: [40px_36px_2fr_2fr_1.5fr_1.5fr_80px] */}
      <div role="row" className="grid grid-cols-[40px_36px_2fr_2fr_1.5fr_1.5fr_80px] gap-4 px-4 mb-1 items-center">
        {/* Bulk select checkbox */}
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="h-4 w-4 rounded-md border-[#e4e0d8] text-[#4a7c59] focus:ring-[#4a7c59] bg-[#f5f1ea] transition-all cursor-pointer"
            aria-label="Select all contacts on current page"
          />
        </div>

        {/* Pin column header — sr-only label */}
        <span role="columnheader" className="sr-only">Focused</span>

        {COLUMNS.map(({ key, label }) => (
          <Link
            key={key}
            href={sortHref(key)}
            role="columnheader"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#74796e] uppercase tracking-wider hover:text-[#2e3230] transition-colors"
          >
            {label}
            <SortIcon column={key} sortKey={sortKey} sortDir={sortDir} />
          </Link>
        ))}
        <span role="columnheader" className="sr-only">Actions</span>
      </div>

      {/* Rows */}
      {contacts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-[#74796e]">No contacts yet.</p>
          <Link href="/contacts/new" className="mt-2 inline-block text-sm font-semibold text-[#4a7c59] hover:underline">
            Add your first contact →
          </Link>
        </div>
      ) : (
        contacts.map((c) => {
          const primaryPhone = c.phone_numbers?.[0]?.number
          const isRowChecked = selectedIds.has(c.id)
          const isPinned = !!c.on_working_list

          return (
            <div
              key={c.id}
              role="row"
              className={`grid grid-cols-[40px_36px_2fr_2fr_1.5fr_1.5fr_80px] gap-4 items-center px-4 py-3.5 rounded-[20px] transition-all duration-200 shadow-[0_4px_20px_rgba(46,50,48,0.04)] group ${
                isRowChecked
                  ? 'bg-[#eae6de] border-2 border-[#4a7c59]/40 scale-[1.002]'
                  : 'bg-[#f5f1ea] hover:bg-[#eae6de] hover:scale-[1.005]'
              }`}
            >
              {/* Row Select Checkbox */}
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isRowChecked}
                  onChange={() => onToggleSelect(c.id)}
                  className="h-4 w-4 rounded-md border-[#e4e0d8] text-[#4a7c59] focus:ring-[#4a7c59] bg-[#f5f1ea] transition-all cursor-pointer"
                  aria-label={`Select contact ${c.first_name} ${c.last_name || ''}`}
                />
              </div>

              {/* Pin / Bookmark button — always visible, min 36×36px touch target */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onTogglePin(c.id, isPinned)}
                  aria-label={isPinned ? 'Remove from focus' : 'Pin to focus'}
                  aria-pressed={isPinned}
                  className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-[#eae6de] active:scale-90"
                >
                  <Bookmark
                    className="h-4 w-4 transition-colors"
                    style={{
                      fill: isPinned ? '#4a7c59' : 'none',
                      color: isPinned ? '#4a7c59' : '#74796e',
                      strokeWidth: 1.75,
                    }}
                  />
                </button>
              </div>

              <div role="cell" className="space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/contacts/${c.id}`}
                    className="text-sm font-semibold text-[#2e3230] hover:text-[#4a7c59] transition-colors font-body"
                  >
                    {c.first_name} {c.last_name}
                  </Link>
                  {sourceBadge(c.created_by_source || 'manual', c.source_detail ?? null)}
                </div>

                {/* Display assigned many-to-many labels */}
                {c.contact_labels && c.contact_labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.contact_labels.map((cl: any) => {
                      const matched = labelsMap.get(cl.label_id)
                      if (!matched) return null
                      return (
                        <span
                          key={matched.id}
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border leading-none ${getLabelColorClass(matched.color)}`}
                        >
                          {matched.name}
                        </span>
                      )
                    })}
                  </div>
                )}

                <div className="flex flex-col text-xs text-[#74796e] font-body space-y-0.5 pt-0.5">
                  {c.email && <span className="truncate">{c.email}</span>}
                  {primaryPhone && <span className="text-[#595e55] font-medium">{primaryPhone}</span>}
                </div>
              </div>

              <div role="cell" className="text-sm text-[#4a4e4a] font-body">
                {c.company || <span className="text-[#74796e]">—</span>}
                {c.job_title && <div className="text-xs text-[#74796e] mt-0.5 font-body">{c.job_title}</div>}
              </div>

              <div role="cell">
                {statusBadge(c.pipeline_status)}
              </div>

              <div role="cell" className="text-sm text-[#4a4e4a] font-body">
                {formatDate(c.last_contacted_at)}
              </div>

              <div role="cell" className="text-right">
                <Link
                  href={`/contacts/${c.id}/edit`}
                  className="text-xs font-semibold text-[#74796e] opacity-0 group-hover:opacity-100 hover:text-[#4a7c59] transition-all"
                >
                  Edit
                </Link>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

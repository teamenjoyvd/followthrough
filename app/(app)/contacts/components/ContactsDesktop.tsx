import Link from 'next/link'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { PIPELINE_STATUSES } from './PipelineStatusControl'
import type { Database } from '@/types/supabase'

type Contact = Database['public']['Tables']['contacts']['Row']
type SortKey = 'first_name' | 'company' | 'pipeline_status' | 'last_contacted_at'
type SortDir = 'asc' | 'desc'

interface Props {
  contacts: Contact[]
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
    ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${found.color}`}>{found.label}</span>
    : null
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
  sortKey,
  sortDir,
  currentQuery,
  currentStatus,
  currentLastContacted,
  currentCompany,
}: Props) {
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

  return (
    <div role="table" aria-label="Contacts list" className="hidden md:block px-6 py-4 space-y-2">
      {/* Column headers */}
      <div role="row" className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_80px] gap-4 px-4 mb-1">
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
        contacts.map((c) => (
          <div
            key={c.id}
            role="row"
            className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_80px] gap-4 items-center px-4 py-3.5 rounded-[20px] bg-[#f5f1ea] hover:bg-[#eae6de] transition-all hover:scale-[1.005] duration-200 shadow-[0_4px_20px_rgba(46,50,48,0.04)] group"
          >
            <div role="cell">
              <Link
                href={`/contacts/${c.id}`}
                className="text-sm font-semibold text-[#2e3230] hover:text-[#4a7c59] transition-colors font-body"
              >
                {c.first_name} {c.last_name}
              </Link>
              {c.email && <div className="text-xs text-[#74796e] mt-0.5 font-body">{c.email}</div>}
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
        ))
      )}
    </div>
  )
}

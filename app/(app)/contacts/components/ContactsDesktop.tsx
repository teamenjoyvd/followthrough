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
}

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
  return sortDir === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 text-gray-700" />
    : <ChevronDown className="h-3.5 w-3.5 text-gray-700" />
}

function statusBadge(status: Database['public']['Enums']['pipeline_status']) {
  const found = PIPELINE_STATUSES.find((s: { value: string }) => s.value === status)
  return found
    ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${found.color}`}>{found.label}</span>
    : null
}

function formatDate(iso: string | null) {
  if (!iso) return <span className="text-gray-400">—</span>
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'first_name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'pipeline_status', label: 'Status' },
  { key: 'last_contacted_at', label: 'Last contacted' },
]

export default function ContactsDesktop({ contacts, sortKey, sortDir }: Props) {
  function sortHref(col: SortKey) {
    const nextDir = col === sortKey && sortDir === 'asc' ? 'desc' : 'asc'
    return `/contacts?sort=${col}&dir=${nextDir}`
  }

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                <Link
                  href={sortHref(key)}
                  className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  {label}
                  <SortIcon column={key} sortKey={sortKey} sortDir={sortDir} />
                </Link>
              </th>
            ))}
            <th scope="col" className="relative px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {contacts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                No contacts yet. <Link href="/contacts/new" className="text-indigo-600 hover:underline">Add your first contact →</Link>
              </td>
            </tr>
          ) : (
            contacts.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link href={`/contacts/${c.id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                    {c.first_name} {c.last_name}
                  </Link>
                  {c.email && <div className="text-xs text-gray-400 mt-0.5">{c.email}</div>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {c.company || <span className="text-gray-300">—</span>}
                  {c.job_title && <div className="text-xs text-gray-400 mt-0.5">{c.job_title}</div>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {statusBadge(c.pipeline_status)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(c.last_contacted_at)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <Link
                    href={`/contacts/${c.id}/edit`}
                    className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-all"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

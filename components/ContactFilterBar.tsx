'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { PIPELINE_STATUSES } from '@/app/(app)/contacts/components/PipelineStatusControl'
import type { Database } from '@/types/supabase'

type PipelineStatus = Database['public']['Enums']['pipeline_status']

const LAST_CONTACTED_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

interface Props {
  currentStatus: string
  currentLastContacted: string
  currentCompany: string
  currentQuery: string
  basePath: string
}

export function ContactFilterBar({
  currentStatus,
  currentLastContacted,
  currentCompany,
  currentQuery,
  basePath,
}: Props) {
  const router = useRouter()

  const buildHref = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams()
      const merged = {
        q: currentQuery,
        status: currentStatus,
        last_contacted: currentLastContacted,
        company: currentCompany,
        ...overrides,
      }
      Object.entries(merged).forEach(([k, v]) => {
        if (v) params.set(k, v)
      })
      const qs = params.toString()
      return qs ? `${basePath}?${qs}` : basePath
    },
    [currentQuery, currentStatus, currentLastContacted, currentCompany, basePath],
  )

  const hasActiveFilters = !!(currentStatus || currentLastContacted || currentCompany)

  return (
    <div className="flex flex-col gap-2">
      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by pipeline status">
        <Link
          href={buildHref({ status: '' })}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            !currentStatus
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          All
        </Link>
        {PIPELINE_STATUSES.map(({ value, label, color }) => (
          <Link
            key={value}
            href={buildHref({ status: value })}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              currentStatus === value
                ? color
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Second row: last contacted + company search + clear */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Last contacted dropdown */}
        <select
          value={currentLastContacted}
          onChange={(e) => router.push(buildHref({ last_contacted: e.target.value }))}
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Filter by last contacted"
        >
          {LAST_CONTACTED_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Company search — Enter key to apply */}
        <input
          type="search"
          placeholder="Filter by company…"
          defaultValue={currentCompany}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              router.push(buildHref({ company: (e.target as HTMLInputElement).value }))
            }
          }}
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
          aria-label="Filter by company"
        />

        {/* Clear all */}
        {hasActiveFilters && (
          <Link
            href={currentQuery ? `${basePath}?q=${encodeURIComponent(currentQuery)}` : basePath}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear filters
          </Link>
        )}
      </div>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { PIPELINE_STATUSES } from '@/app/(app)/contacts/components/constants'

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
  currentSort: string
  currentDir: string
  basePath: string
}

export function ContactFilterBar({
  currentStatus,
  currentLastContacted,
  currentCompany,
  currentQuery,
  currentSort,
  currentDir,
  basePath,
}: Props) {
  const router = useRouter()
  const [company, setCompany] = useState(currentCompany)
  const [isPending, startTransition] = useTransition()

  // Sync internal company search state if updated externally
  useEffect(() => {
    setCompany(currentCompany)
  }, [currentCompany])

  const buildHref = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams()
      const merged = {
        q: currentQuery,
        status: currentStatus,
        last_contacted: currentLastContacted,
        company: currentCompany,
        sort: currentSort,
        dir: currentDir,
        ...overrides,
      }
      Object.entries(merged).forEach(([k, v]) => {
        if (v) params.set(k, v)
      })
      const qs = params.toString()
      return qs ? `${basePath}?${qs}` : basePath
    },
    [currentQuery, currentStatus, currentLastContacted, currentCompany, currentSort, currentDir, basePath],
  )

  useEffect(() => {
    if (company === currentCompany) return

    const timer = setTimeout(() => {
      startTransition(() => {
        router.replace(buildHref({ company: company.trim() }))
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [company, currentCompany, buildHref, router])

  const hasActiveFilters = !!(currentStatus || currentLastContacted || currentCompany)

  return (
    <div className="flex flex-col gap-2 bg-transparent">
      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by pipeline status">
        <Link
          href={buildHref({ status: '' })}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            !currentStatus
              ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
              : 'bg-[#f5f1ea] text-[#74796e] border-[#e4e0d8] hover:bg-[#eae6de] hover:text-[#2e3230]'
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
                : 'bg-[#f5f1ea] text-[#74796e] border-[#e4e0d8] hover:bg-[#eae6de] hover:text-[#2e3230]'
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
          onChange={(e) => {
            startTransition(() => {
              router.replace(buildHref({ last_contacted: e.target.value }))
            })
          }}
          className="text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all cursor-pointer shadow-sm"
          aria-label="Filter by last contacted"
        >
          {LAST_CONTACTED_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Company search — Dynamic debounced */}
        <div className="relative inline-block">
          <input
            type="search"
            placeholder="Filter by company…"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all w-40 shadow-sm"
            aria-label="Filter by company"
          />
          {isPending && (
            <span className="absolute right-2.5 top-2 flex h-3 w-3 animate-spin rounded-full border border-[#4a7c59] border-t-transparent" />
          )}
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <Link
            href={buildHref({ status: '', last_contacted: '', company: '' })}
            className="inline-flex items-center gap-1 text-xs text-[#74796e] hover:text-[#2e3230] font-semibold transition-colors ml-1"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Link>
        )}
      </div>
    </div>
  )
}

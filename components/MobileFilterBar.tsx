'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { PIPELINE_STATUSES } from '@/app/(app)/contacts/components/constants'
import { FilterShortcuts } from '@/components/FilterShortcuts'

const LAST_CONTACTED_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

interface Props {
  currentQuery: string
  currentStatus: string
  currentLastContacted: string
  currentCompany: string
  currentSort: string
  currentDir: string
  currentFirstName: string
  currentLastName: string
  currentPhone: string
  currentEmail: string
  currentHasEmail: string
  currentHasPhone: string
  currentSource: string
  activeFilterCount: number
}

export function MobileFilterBar({
  currentQuery,
  currentStatus,
  currentLastContacted,
  currentCompany,
  currentSort,
  currentDir,
  currentFirstName,
  currentLastName,
  currentPhone,
  currentEmail,
  currentHasEmail,
  currentHasPhone,
  currentSource,
  activeFilterCount,
}: Props) {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [company, setCompany] = useState(currentCompany)

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
        first_name: currentFirstName,
        last_name: currentLastName,
        phone: currentPhone,
        email: currentEmail,
        has_email: currentHasEmail,
        has_phone: currentHasPhone,
        source: currentSource,
        ...overrides,
      }
      Object.entries(merged).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, v)
      })
      const qs = params.toString()
      return qs ? `/contacts?${qs}` : '/contacts'
    },
    [
      currentQuery, currentStatus, currentLastContacted, currentCompany,
      currentSort, currentDir, currentFirstName, currentLastName,
      currentPhone, currentEmail, currentHasEmail, currentHasPhone, currentSource,
    ]
  )

  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="bg-[#f5f1ea] border-b border-[#e4e0d8]">
      {/* Row 1: search input + Filters button */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#74796e] pointer-events-none"
            fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            defaultValue={currentQuery}
            placeholder="Search contacts..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim()
                startTransition(() => router.replace(buildHref({ q: val })))
              }
            }}
            onChange={(e) => {
              const val = e.target.value.trim()
              if (val === '' && currentQuery !== '') {
                startTransition(() => router.replace(buildHref({ q: '' })))
              }
            }}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#e4e0d8] bg-[#faf6f0] text-xs text-[#2e3230] placeholder-[#74796e] outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent font-body"
          />
        </div>
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all shrink-0 font-body ${
            hasActiveFilters
              ? 'bg-[#eaf4ec] border-[#4a7c59] text-[#335c3d]'
              : 'bg-[#faf6f0] border-[#e4e0d8] text-[#4a4e4a]'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#4a7c59] text-white text-[9px] font-bold leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Row 2: stage pills — horizontal scroll */}
      <div
        className="flex gap-1.5 px-3 pb-2.5 overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        <Link
          href={buildHref({ status: '' })}
          className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
            !currentStatus
              ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
              : 'bg-[#faf6f0] text-[#74796e] border-[#e4e0d8]'
          }`}
        >
          All Stages
        </Link>
        {PIPELINE_STATUSES.map(({ value, label, color }) => (
          <Link
            key={value}
            href={buildHref({ status: value })}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
              currentStatus === value
                ? color
                : 'bg-[#faf6f0] text-[#74796e] border-[#e4e0d8]'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Collapsible drawer */}
      {drawerOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-[#e4e0d8] space-y-3 bg-[#faf6f0] animate-in slide-in-from-top-1 duration-150">

          {/* Last contacted + company */}
          <div className="flex gap-2">
            <select
              value={currentLastContacted}
              onChange={(e) => {
                startTransition(() => router.replace(buildHref({ last_contacted: e.target.value })))
              }}
              className="flex-1 text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-2 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] font-body"
            >
              {LAST_CONTACTED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="search"
              placeholder="Company..."
              defaultValue={currentCompany}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim()
                  startTransition(() => router.replace(buildHref({ company: val })))
                }
              }}
              onChange={(e) => {
                if (e.target.value === '' && currentCompany !== '') {
                  startTransition(() => router.replace(buildHref({ company: '' })))
                }
              }}
              className="flex-1 text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-2 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] font-body"
            />
          </div>

          {/* Shortcuts */}
          <FilterShortcuts />

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-xs font-semibold text-[#4a7c59] font-body"
          >
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Advanced filters
          </button>

          {showAdvanced && (
            <div className="space-y-2 animate-in slide-in-from-top-1 duration-150">
              {[
                { label: 'First name', key: 'first_name', value: currentFirstName },
                { label: 'Last name', key: 'last_name', value: currentLastName },
                { label: 'Email', key: 'email', value: currentEmail },
                { label: 'Phone', key: 'phone', value: currentPhone },
              ].map(({ label, key, value }) => (
                <div key={key}>
                  <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1 font-body">{label}</p>
                  <input
                    type="text"
                    placeholder={`Filter by ${label.toLowerCase()}...`}
                    defaultValue={value}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim()
                        startTransition(() => router.replace(buildHref({ [key]: val })))
                      }
                    }}
                    onChange={(e) => {
                      if (e.target.value === '' && value !== '') {
                        startTransition(() => router.replace(buildHref({ [key]: '' })))
                      }
                    }}
                    className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] font-body"
                  />
                </div>
              ))}
              <div>
                <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1 font-body">Source</p>
                <select
                  value={currentSource}
                  onChange={(e) => {
                    startTransition(() => router.replace(buildHref({ source: e.target.value })))
                  }}
                  className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-2 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] font-body"
                >
                  <option value="">Any source</option>
                  <option value="google">Synced from Google</option>
                  <option value="csv">Imported from CSV</option>
                  <option value="manual">Created Manually</option>
                </select>
              </div>
            </div>
          )}

          {/* Clear all */}
          {hasActiveFilters && (
            <Link
              replace
              href="/contacts"
              className="flex items-center gap-1 text-xs font-semibold text-[#b83230] font-body"
            >
              <X className="h-3.5 w-3.5" />
              Clear all filters
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { X, ChevronDown, ChevronUp, Tag } from 'lucide-react'
import { PIPELINE_STATUSES } from '@/app/(app)/contacts/components/constants'
import type { Label } from '@/components/LabelManager'

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
  currentFirstName: string
  currentLastName: string
  currentPhone: string
  currentEmail: string
  currentHasEmail: string
  currentHasPhone: string
  currentSource: string
  availableLabels?: Label[]
  currentLabels?: string // comma-separated active label IDs
}

export function ContactFilterBar({
  currentStatus,
  currentLastContacted,
  currentCompany,
  currentQuery,
  currentSort,
  currentDir,
  basePath,
  currentFirstName,
  currentLastName,
  currentPhone,
  currentEmail,
  currentHasEmail,
  currentHasPhone,
  currentSource,
  availableLabels = [],
  currentLabels = '',
}: Props) {
  const router = useRouter()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Local state for debounced inputs
  const [company, setCompany] = useState(currentCompany)
  const [firstName, setFirstName] = useState(currentFirstName)
  const [lastName, setLastName] = useState(currentLastName)
  const [phone, setPhone] = useState(currentPhone)
  const [email, setEmail] = useState(currentEmail)

  // Sync internal state if updated externally
  useEffect(() => { setCompany(currentCompany) }, [currentCompany])
  useEffect(() => { setFirstName(currentFirstName) }, [currentFirstName])
  useEffect(() => { setLastName(currentLastName) }, [currentLastName])
  useEffect(() => { setPhone(currentPhone) }, [currentPhone])
  useEffect(() => { setEmail(currentEmail) }, [currentEmail])

  // Parse active label IDs
  const activeLabelIds = currentLabels ? currentLabels.split(',').filter(Boolean) : []

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
        labels: currentLabels,
        ...overrides,
      }
      Object.entries(merged).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, v)
      })
      const qs = params.toString()
      return qs ? `${basePath}?${qs}` : basePath
    },
    [
      currentQuery, currentStatus, currentLastContacted, currentCompany, currentSort, currentDir, basePath,
      currentFirstName, currentLastName, currentPhone, currentEmail, currentHasEmail, currentHasPhone, currentSource, currentLabels
    ],
  )

  // Toggle active label in filters list
  const handleToggleLabelFilter = (labelId: string) => {
    let nextLabels: string[]
    if (activeLabelIds.includes(labelId)) {
      nextLabels = activeLabelIds.filter(id => id !== labelId)
    } else {
      nextLabels = [...activeLabelIds, labelId]
    }
    const val = nextLabels.join(',')
    startTransition(() => {
      router.replace(buildHref({ labels: val }))
    })
  }

  // Debounced Effect: Unified single handler for all text input filters
  useEffect(() => {
    const hasChanges = (
      company.trim() !== currentCompany ||
      firstName.trim() !== currentFirstName ||
      lastName.trim() !== currentLastName ||
      phone.trim() !== currentPhone ||
      email.trim() !== currentEmail
    )
    if (!hasChanges) return

    const timer = setTimeout(() => {
      startTransition(() => {
        router.replace(
          buildHref({
            company: company.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim(),
            email: email.trim(),
          })
        )
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [
    company, firstName, lastName, phone, email,
    currentCompany, currentFirstName, currentLastName, currentPhone, currentEmail,
    buildHref, router
  ])

  const hasActiveFilters = !!(
    currentStatus ||
    currentLastContacted ||
    currentCompany ||
    currentFirstName ||
    currentLastName ||
    currentPhone ||
    currentEmail ||
    currentHasEmail ||
    currentHasPhone ||
    currentSource ||
    currentLabels
  )

  // If any of the advanced filters are currently active, auto-expand the panel on mount
  useEffect(() => {
    if (currentFirstName || currentLastName || currentPhone || currentEmail || currentHasEmail || currentHasPhone || currentSource || currentLabels) {
      setShowAdvanced(true)
    }
  }, [currentFirstName, currentLastName, currentPhone, currentEmail, currentHasEmail, currentHasPhone, currentSource, currentLabels])

  return (
    <div className="flex flex-col gap-3.5 bg-transparent font-body">
      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by pipeline status">
        <Link
          href={buildHref({ status: '' })}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
            !currentStatus
              ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
              : 'bg-[#f5f1ea] text-[#74796e] border-[#e4e0d8] hover:bg-[#eae6de] hover:text-[#2e3230]'
          }`}
        >
          All Stages
        </Link>
        {PIPELINE_STATUSES.map(({ value, label, color }) => (
          <Link
            key={value}
            href={buildHref({ status: value })}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              currentStatus === value
                ? color
                : 'bg-[#f5f1ea] text-[#74796e] border-[#e4e0d8] hover:bg-[#eae6de] hover:text-[#2e3230]'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Relational custom labels filters */}
      {availableLabels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-[#e4e0d8]/60 pt-2 animate-in fade-in duration-200">
          <span className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider flex items-center gap-1 mr-1">
            <Tag className="h-3 w-3" />
            <span>Filter Labels:</span>
          </span>
          {availableLabels.map((lbl) => {
            const isActive = activeLabelIds.includes(lbl.id)
            return (
              <button
                key={lbl.id}
                type="button"
                onClick={() => handleToggleLabelFilter(lbl.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                  isActive
                    ? `${lbl.color} scale-105 shadow-sm ring-1 ring-[#4a7c59]/20`
                    : 'bg-[#f5f1ea] text-[#74796e] border-[#e4e0d8] opacity-65 hover:opacity-100'
                }`}
              >
                {lbl.name}
              </button>
            )
          })}
        </div>
      )}

      {/* Second row: last contacted + company search + advanced toggle + clear */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Last contacted dropdown */}
        <select
          value={currentLastContacted}
          onChange={(e) => {
            startTransition(() => {
              router.replace(buildHref({ last_contacted: e.target.value }))
            })
          }}
          className="text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all cursor-pointer shadow-sm font-semibold"
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
            className="text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all w-40 shadow-sm font-semibold"
            aria-label="Filter by company"
          />
          {isPending && (
            <span className="absolute right-2.5 top-2 flex h-3 w-3 animate-spin rounded-full border border-[#4a7c59] border-t-transparent" />
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#e4e0d8] bg-[#f5f1ea] hover:bg-[#eae6de] text-xs font-semibold text-[#4a7c59] transition-all shadow-sm"
        >
          <span>Advanced Filters</span>
          {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {/* Clear all */}
        {hasActiveFilters && (
          <Link
            replace
            href={buildHref({
              status: '',
              last_contacted: '',
              company: '',
              first_name: '',
              last_name: '',
              phone: '',
              email: '',
              has_email: '',
              has_phone: '',
              source: '',
              labels: ''
            })}
            className="inline-flex items-center gap-1 text-xs text-[#74796e] hover:text-[#2e3230] font-semibold transition-colors ml-1"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Link>
        )}
      </div>

      {/* Collapsible Advanced Filters Grid */}
      {showAdvanced && (
        <div className="mt-2 p-4 border border-[#e4e0d8] rounded-2xl bg-[#f5f1ea]/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Column 1: Name specificity */}
          <div className="space-y-2.5">
            <div>
              <label htmlFor="filter-fn" className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">First Name</label>
              <input
                id="filter-fn"
                type="text"
                placeholder="Search first name..."
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="filter-ln" className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">Last Name</label>
              <input
                id="filter-ln"
                type="text"
                placeholder="Search last name..."
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Column 2: Specific contact values */}
          <div className="space-y-2.5">
            <div>
              <label htmlFor="filter-email" className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">Email Address</label>
              <input
                id="filter-email"
                type="text"
                placeholder="Search email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="filter-phone" className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">Phone Number</label>
              <input
                id="filter-phone"
                type="text"
                placeholder="Search phone number..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Column 3: Composition filters */}
          <div className="space-y-2.5">
            <div>
              <label htmlFor="filter-has-email" className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">Email Status</label>
              <select
                id="filter-has-email"
                value={currentHasEmail}
                onChange={(e) => {
                  startTransition(() => { router.replace(buildHref({ has_email: e.target.value })) })
                }}
                className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all shadow-sm cursor-pointer"
              >
                <option value="">Any email status</option>
                <option value="yes">Has email address</option>
                <option value="no">No email address</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-has-phone" className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">Phone Status</label>
              <select
                id="filter-has-phone"
                value={currentHasPhone}
                onChange={(e) => {
                  startTransition(() => { router.replace(buildHref({ has_phone: e.target.value })) })
                }}
                className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all shadow-sm cursor-pointer"
              >
                <option value="">Any phone status</option>
                <option value="yes">Has phone number</option>
                <option value="no">No phone number</option>
              </select>
            </div>
          </div>

          {/* Column 4: CRM labels and sync source */}
          <div className="space-y-2.5">
            <div>
              <label htmlFor="filter-source" className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">Sync Source</label>
              <select
                id="filter-source"
                value={currentSource}
                onChange={(e) => {
                  startTransition(() => { router.replace(buildHref({ source: e.target.value })) })
                }}
                className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all shadow-sm cursor-pointer"
              >
                <option value="">Any source</option>
                <option value="google">Synced from Google</option>
                <option value="csv">Imported from CSV</option>
                <option value="manual">Created Manually</option>
              </select>
            </div>
            <div className="pt-5 text-center">
              <span className="text-[11px] text-[#74796e] font-body italic block">
                {hasActiveFilters ? "Filters are active" : "Adjust grid to filter"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

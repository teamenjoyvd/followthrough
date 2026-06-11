'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'


const LAST_CONTACTED_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]

const SORT_OPTIONS = [
  { value: 'first_name', label: 'Name' },
  { value: 'company', label: 'Company' },

  { value: 'last_contacted_at', label: 'Last contacted' },
]

interface Label {
  id: string
  name: string
}

interface Props {
  currentQuery: string

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
  currentLabels: string
  currentFocused?: string
  activeFilterCount: number
  labels?: Label[]
}

export function MobileFilterBar({
  currentQuery,

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
  currentLabels,
  currentFocused = '',
  activeFilterCount,
  labels = [],
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Controlled search input with debounce — matches SearchInput.tsx behaviour
  const [searchValue, setSearchValue] = useState(currentQuery)
  useEffect(() => {
    setSearchValue(currentQuery)
  }, [currentQuery])

  useEffect(() => {
    if (searchValue === currentQuery) return
    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        const trimmed = searchValue.trim()
        if (trimmed) params.set('q', trimmed)
        else params.delete('q')
        params.delete('page')
        const qs = params.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname)
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, currentQuery, searchParams, pathname, router])

  // Controlled drawer text inputs with debounce
  const [company, setCompany] = useState(currentCompany)
  const [firstName, setFirstName] = useState(currentFirstName)
  const [lastName, setLastName] = useState(currentLastName)
  const [email, setEmail] = useState(currentEmail)
  const [phone, setPhone] = useState(currentPhone)

  useEffect(() => { setCompany(currentCompany) }, [currentCompany])
  useEffect(() => { setFirstName(currentFirstName) }, [currentFirstName])
  useEffect(() => { setLastName(currentLastName) }, [currentLastName])
  useEffect(() => { setEmail(currentEmail) }, [currentEmail])
  useEffect(() => { setPhone(currentPhone) }, [currentPhone])

  useEffect(() => {
    if (company === currentCompany) return
    const t = setTimeout(() => startTransition(() => router.replace(buildHref({ company }))), 300)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company])

  useEffect(() => {
    if (firstName === currentFirstName) return
    const t = setTimeout(() => startTransition(() => router.replace(buildHref({ first_name: firstName }))), 300)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName])

  useEffect(() => {
    if (lastName === currentLastName) return
    const t = setTimeout(() => startTransition(() => router.replace(buildHref({ last_name: lastName }))), 300)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastName])

  useEffect(() => {
    if (email === currentEmail) return
    const t = setTimeout(() => startTransition(() => router.replace(buildHref({ email }))), 300)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  useEffect(() => {
    if (phone === currentPhone) return
    const t = setTimeout(() => startTransition(() => router.replace(buildHref({ phone }))), 300)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone])

  const buildHref = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams()
      const merged = {
        q: currentQuery,
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
        focused: currentFocused,
        ...overrides,
      }
      Object.entries(merged).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, v)
      })
      const qs = params.toString()
      return qs ? `/contacts?${qs}` : '/contacts'
    },
    [
      currentQuery, currentLastContacted, currentCompany,
      currentSort, currentDir, currentFirstName, currentLastName,
      currentPhone, currentEmail, currentHasEmail, currentHasPhone,
      currentSource, currentLabels, currentFocused,
    ]
  )

  const handleLabelToggle = (labelId: string) => {
    const active = currentLabels ? currentLabels.split(',').filter(Boolean) : []
    const next = active.includes(labelId)
      ? active.filter((id) => id !== labelId)
      : [...active, labelId]
    startTransition(() => router.replace(buildHref({ labels: next.join(',') })))
  }

  // Drawer filter count — only fields that live in the drawer
  const drawerFilterCount = [
    currentCompany,
    currentFirstName,
    currentLastName,
    currentEmail,
    currentPhone,
    currentHasEmail,
    currentHasPhone,
    currentSource,
  ].filter(Boolean).length

  const hasActiveFilters = drawerFilterCount > 0

  const activeLabelIds = currentLabels ? currentLabels.split(',').filter(Boolean) : []
  const isFocused = currentFocused === '1'

  return (
    <div className="bg-[#f5f1ea] border-b border-[#e4e0d8]">

      {/* Row 1: search + last contacted + sort + filters button */}
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
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#e4e0d8] bg-[#faf6f0] text-xs text-[#2e3230] placeholder-[#74796e] outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent font-body"
          />
        </div>

        {/* Last contacted chip */}
        <div className="relative shrink-0">
          <select
            value={currentLastContacted}
            onChange={(e) => {
              startTransition(() => router.replace(buildHref({ last_contacted: e.target.value })))
            }}
            className={`appearance-none pl-2.5 pr-6 py-2 rounded-xl border text-xs font-semibold font-body outline-none focus:ring-2 focus:ring-[#4a7c59] cursor-pointer ${
              currentLastContacted
                ? 'bg-[#eaf4ec] border-[#4a7c59] text-[#335c3d]'
                : 'bg-[#faf6f0] border-[#e4e0d8] text-[#4a4e4a]'
            }`}
          >
            {LAST_CONTACTED_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#74796e] pointer-events-none" />
        </div>

        {/* Sort chip */}
        <div className="relative shrink-0">
          <select
            value={currentSort}
            onChange={(e) => {
              startTransition(() => router.replace(buildHref({ sort: e.target.value })))
            }}
            className={`appearance-none pl-2.5 pr-6 py-2 rounded-xl border text-xs font-semibold font-body outline-none focus:ring-2 focus:ring-[#4a7c59] cursor-pointer ${
              currentSort && currentSort !== 'first_name'
                ? 'bg-[#eaf4ec] border-[#4a7c59] text-[#335c3d]'
                : 'bg-[#faf6f0] border-[#e4e0d8] text-[#4a4e4a]'
            }`}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#74796e] pointer-events-none" />
        </div>

        {/* Filters button */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all shrink-0 font-body ${
            hasActiveFilters
              ? 'bg-[#eaf4ec] border-[#4a7c59] text-[#335c3d]'
              : 'bg-[#faf6f0] border-[#e4e0d8] text-[#4a4e4a]'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {drawerFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#4a7c59] text-white text-[9px] font-bold leading-none">
              {drawerFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Row 2: stages + Focused chip + labels carousel */}
      <div
        className="flex gap-1.5 px-3 pb-2.5 overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        <Link
          href={buildHref({ focused: '' })}
          className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
            !isFocused
              ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
              : 'bg-[#faf6f0] text-[#74796e] border-[#e4e0d8]'
          }`}
        >
          All
        </Link>

        {/* Focused chip */}
        <Link
          href={buildHref({ focused: isFocused ? '' : '1' })}
          className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
            isFocused
              ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
              : 'bg-[#faf6f0] text-[#74796e] border-[#e4e0d8]'
          }`}
        >
          Focused
        </Link>

        {labels.length > 0 && (
          <div className="shrink-0 w-px bg-[#e4e0d8] mx-0.5 my-1 rounded-full" />
        )}

        {labels.map((label) => {
          const isActive = activeLabelIds.includes(label.id)
          return (
            <button
              key={label.id}
              onClick={() => handleLabelToggle(label.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                isActive
                  ? 'bg-[#7c5c4a] text-white border-[#7c5c4a]'
                  : 'bg-[#faf6f0] text-[#74796e] border-[#e4e0d8]'
              }`}
            >
              {label.name}
            </button>
          )
        })}
      </div>

      {/* Collapsible drawer — flat labelled grid */}
      {drawerOpen && (
        <div className="px-3 pb-3 pt-2 border-t border-[#e4e0d8] bg-[#faf6f0] animate-in slide-in-from-top-1 duration-150">
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">

            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider font-body">Company</p>
              <input
                type="text"
                placeholder="contains..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#9fa49a] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] font-body"
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider font-body">Email</p>
              <input
                type="text"
                placeholder="contains..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#9fa49a] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] font-body"
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider font-body">First name</p>
              <input
                type="text"
                placeholder="contains..."
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#9fa49a] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] font-body"
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider font-body">Last name</p>
              <input
                type="text"
                placeholder="contains..."
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#9fa49a] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] font-body"
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider font-body">Phone</p>
              <input
                type="text"
                placeholder="digits..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#9fa49a] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] font-body"
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider font-body">Source</p>
              <select
                value={currentSource}
                onChange={(e) => {
                  startTransition(() => router.replace(buildHref({ source: e.target.value })))
                }}
                className="text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] font-body"
              >
                <option value="">Any source</option>
                <option value="csv">CSV import</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider font-body">Has email</p>
              <select
                value={currentHasEmail}
                onChange={(e) => {
                  startTransition(() => router.replace(buildHref({ has_email: e.target.value })))
                }}
                className="text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] font-body"
              >
                <option value="">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider font-body">Has phone</p>
              <select
                value={currentHasPhone}
                onChange={(e) => {
                  startTransition(() => router.replace(buildHref({ has_phone: e.target.value })))
                }}
                className="text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] font-body"
              >
                <option value="">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <Link
                replace
                href={buildHref({
                  company: '', first_name: '', last_name: '', email: '',
                  phone: '', has_email: '', has_phone: '', source: '',
                })}
                className="flex items-center gap-1 text-xs font-semibold text-[#b83230] font-body"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

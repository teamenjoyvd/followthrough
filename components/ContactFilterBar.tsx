'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { X, SlidersHorizontal, Zap, ChevronDown, ChevronUp, Tag } from 'lucide-react'
import { PIPELINE_STATUSES } from '@/app/(app)/contacts/components/constants'
import { getLabelColorClass, type Label } from '@/components/LabelManager'
import { SearchInput } from '@/app/(app)/contacts/components/SearchInput'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Constants ────────────────────────────────────────────────────────────────

const LAST_CONTACTED_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

const SORT_OPTIONS = [
  { value: 'first_name', label: 'Name' },
  { value: 'company', label: 'Company' },
  { value: 'pipeline_status', label: 'Stage' },
  { value: 'last_contacted_at', label: 'Last contacted' },
]

const SHORTCUTS = [
  { label: "This week's overdue", href: '/contacts?last_contacted=7d&status=lead' },
  { label: 'Leads not contacted in 14d', href: '/contacts?last_contacted=14d&status=lead' },
]

// ─── Props ────────────────────────────────────────────────────────────────────

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
  currentLabels?: string
  currentFocused?: string
}

// ─── Active filter pill helpers ───────────────────────────────────────────────

type ActivePill = { key: string; label: string; clearOverride: Record<string, string> }

function buildActivePills({
  currentStatus,
  currentLastContacted,
  currentCompany,
  currentFirstName,
  currentLastName,
  currentEmail,
  currentPhone,
  currentHasEmail,
  currentHasPhone,
  currentSource,
  currentFocused,
  currentLabels,
  availableLabels,
}: Omit<Props, 'currentQuery' | 'currentSort' | 'currentDir' | 'basePath'>): ActivePill[] {
  const pills: ActivePill[] = []

  if (currentFocused === '1') {
    pills.push({ key: 'focused', label: 'Focused', clearOverride: { focused: '' } })
  }
  if (currentStatus) {
    const found = PIPELINE_STATUSES.find(s => s.value === currentStatus)
    pills.push({ key: 'status', label: `Stage: ${found?.label ?? currentStatus}`, clearOverride: { status: '' } })
  }
  if (currentLastContacted) {
    const found = LAST_CONTACTED_OPTIONS.find(o => o.value === currentLastContacted)
    pills.push({ key: 'last_contacted', label: `Time: ${found?.label ?? currentLastContacted}`, clearOverride: { last_contacted: '' } })
  }
  if (currentCompany) {
    pills.push({ key: 'company', label: `Company: ${currentCompany}`, clearOverride: { company: '' } })
  }
  if (currentFirstName) {
    pills.push({ key: 'first_name', label: `First: ${currentFirstName}`, clearOverride: { first_name: '' } })
  }
  if (currentLastName) {
    pills.push({ key: 'last_name', label: `Last: ${currentLastName}`, clearOverride: { last_name: '' } })
  }
  if (currentEmail) {
    pills.push({ key: 'email', label: `Email: ${currentEmail}`, clearOverride: { email: '' } })
  }
  if (currentPhone) {
    pills.push({ key: 'phone', label: `Phone: ${currentPhone}`, clearOverride: { phone: '' } })
  }
  if (currentHasEmail) {
    pills.push({ key: 'has_email', label: currentHasEmail === 'yes' ? 'Has email' : 'No email', clearOverride: { has_email: '' } })
  }
  if (currentHasPhone) {
    pills.push({ key: 'has_phone', label: currentHasPhone === 'yes' ? 'Has phone' : 'No phone', clearOverride: { has_phone: '' } })
  }
  if (currentSource) {
    const sourceLabel = currentSource === 'google' ? 'Google sync' : currentSource === 'csv' ? 'CSV import' : 'Manual'
    pills.push({ key: 'source', label: `Source: ${sourceLabel}`, clearOverride: { source: '' } })
  }

  if (currentLabels) {
    const activeIds = currentLabels.split(',').filter(Boolean)
    for (const id of activeIds) {
      const lbl = availableLabels?.find(l => l.id === id)
      if (lbl) {
        const remaining = activeIds.filter(i => i !== id).join(',')
        pills.push({ key: `label-${id}`, label: lbl.name, clearOverride: { labels: remaining } })
      }
    }
  }

  return pills
}

// ─── Component ────────────────────────────────────────────────────────────────

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
  currentFocused = '',
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [company, setCompany] = useState(currentCompany)
  const [firstName, setFirstName] = useState(currentFirstName)
  const [lastName, setLastName] = useState(currentLastName)
  const [phone, setPhone] = useState(currentPhone)
  const [email, setEmail] = useState(currentEmail)

  useEffect(() => { setCompany(currentCompany) }, [currentCompany])
  useEffect(() => { setFirstName(currentFirstName) }, [currentFirstName])
  useEffect(() => { setLastName(currentLastName) }, [currentLastName])
  useEffect(() => { setPhone(currentPhone) }, [currentPhone])
  useEffect(() => { setEmail(currentEmail) }, [currentEmail])

  useEffect(() => {
    if (currentFirstName || currentLastName || currentPhone || currentEmail ||
        currentHasEmail || currentHasPhone || currentSource) {
      setShowAdvanced(true)
    }
  }, [currentFirstName, currentLastName, currentPhone, currentEmail, currentHasEmail, currentHasPhone, currentSource])

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
        focused: currentFocused,
        ...overrides,
      }
      Object.entries(merged).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, v)
      })
      const qs = params.toString()
      return qs ? `${basePath}?${qs}` : basePath
    },
    [
      currentQuery, currentStatus, currentLastContacted, currentCompany,
      currentSort, currentDir, basePath, currentFirstName, currentLastName,
      currentPhone, currentEmail, currentHasEmail, currentHasPhone,
      currentSource, currentLabels, currentFocused,
    ],
  )

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
        router.replace(buildHref({
          company: company.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        }))
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [company, firstName, lastName, phone, email,
      currentCompany, currentFirstName, currentLastName, currentPhone, currentEmail,
      buildHref, router])

  const handleToggleLabelFilter = (labelId: string) => {
    const next = activeLabelIds.includes(labelId)
      ? activeLabelIds.filter(id => id !== labelId)
      : [...activeLabelIds, labelId]
    startTransition(() => { router.replace(buildHref({ labels: next.join(',') })) })
  }

  const clearAllHref = buildHref({
    status: '', last_contacted: '', company: '', first_name: '',
    last_name: '', phone: '', email: '', has_email: '', has_phone: '',
    source: '', labels: '', focused: '',
  })

  const activePills = buildActivePills({
    currentStatus, currentLastContacted, currentCompany, currentFirstName,
    currentLastName, currentEmail, currentPhone, currentHasEmail, currentHasPhone,
    currentSource, currentFocused, currentLabels, availableLabels,
  })

  const hasActiveFilters = activePills.length > 0

  const activeFilterCount = [
    currentStatus, currentLastContacted, currentCompany, currentFirstName,
    currentLastName, currentPhone, currentEmail, currentHasEmail, currentHasPhone,
    currentSource, currentFocused === '1' ? '1' : '',
    activeLabelIds.length > 0 ? 'labels' : '',
  ].filter(Boolean).length

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-2 font-body">

      {/* ── Toolbar row ── */}
      <div className="flex items-center gap-2">

        {/* Search — fills available space */}
        <div className="flex-1 min-w-0">
          <SearchInput defaultValue={currentQuery} />
        </div>

        {/* Filters popover trigger */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all shadow-sm shrink-0 ${
                activeFilterCount > 0
                  ? 'bg-[#eaf4ec] border-[#4a7c59] text-[#335c3d]'
                  : 'bg-[#f5f1ea] border-[#e4e0d8] text-[#2e3230] hover:bg-[#eae6de]'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#4a7c59] text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            sideOffset={6}
            className="w-[480px] max-h-[80vh] overflow-y-auto p-0 rounded-2xl border border-[#e4e0d8] bg-[#faf6f0] shadow-lg"
          >
            <div className="p-4 space-y-5">

              {/* Stage */}
              <div>
                <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-2">Stage</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => startTransition(() => router.replace(buildHref({ status: '', focused: '' })))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      !currentStatus && currentFocused !== '1'
                        ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
                        : 'bg-[#f5f1ea] text-[#74796e] border-[#e4e0d8] hover:bg-[#eae6de]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => startTransition(() => router.replace(buildHref({ focused: currentFocused === '1' ? '' : '1', status: '' })))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      currentFocused === '1'
                        ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
                        : 'bg-[#f5f1ea] text-[#74796e] border-[#e4e0d8] hover:bg-[#eae6de]'
                    }`}
                  >
                    Focused
                  </button>
                  {PIPELINE_STATUSES.map(({ value, label, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => startTransition(() => router.replace(buildHref({ status: currentStatus === value ? '' : value, focused: '' })))}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        currentStatus === value ? color : 'bg-[#f5f1ea] text-[#74796e] border-[#e4e0d8] hover:bg-[#eae6de]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-2">Not contacted in</p>
                <div className="flex flex-wrap gap-1.5">
                  {LAST_CONTACTED_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => startTransition(() => router.replace(buildHref({ last_contacted: opt.value })))}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        currentLastContacted === opt.value
                          ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
                          : 'bg-[#f5f1ea] text-[#74796e] border-[#e4e0d8] hover:bg-[#eae6de]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company */}
              <div>
                <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-2">Company</p>
                <input
                  type="search"
                  placeholder="Filter by company…"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full text-xs border border-[#e4e0d8] rounded-xl px-3 py-2 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all"
                />
              </div>

              {/* Labels */}
              {availableLabels.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Labels
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableLabels.map(lbl => {
                      const isActive = activeLabelIds.includes(lbl.id)
                      return (
                        <button
                          key={lbl.id}
                          type="button"
                          onClick={() => handleToggleLabelFilter(lbl.id)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            isActive
                              ? `${getLabelColorClass(lbl.color)} scale-105 shadow-sm ring-1 ring-[#4a7c59]/20`
                              : 'bg-[#f5f1ea] text-[#74796e] border-[#e4e0d8] opacity-65 hover:opacity-100'
                          }`}
                        >
                          {lbl.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quick presets */}
              <div>
                <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-2">Quick presets</p>
                <div className="flex flex-wrap gap-2">
                  {SHORTCUTS.map(s => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setPopoverOpen(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#c4a66a]/30 bg-[#f8e0a8]/20 text-[#554020] text-xs font-semibold hover:bg-[#f8e0a8]/40 transition-colors"
                    >
                      <Zap className="h-3.5 w-3.5 text-[#c4a66a]" />
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Advanced toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(v => !v)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#4a7c59] hover:text-[#335c3d] transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  Advanced filters
                </button>

                {showAdvanced && (
                  <div className="mt-3 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div>
                      <label className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">First name</label>
                      <input type="text" placeholder="Search…" value={firstName} onChange={e => setFirstName(e.target.value)}
                        className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">Last name</label>
                      <input type="text" placeholder="Search…" value={lastName} onChange={e => setLastName(e.target.value)}
                        className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">Email</label>
                      <input type="text" placeholder="Search…" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">Phone</label>
                      <input type="text" placeholder="Search…" value={phone} onChange={e => setPhone(e.target.value)}
                        className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">Email status</label>
                      <select value={currentHasEmail} onChange={e => startTransition(() => router.replace(buildHref({ has_email: e.target.value })))}
                        className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all cursor-pointer">
                        <option value="">Any</option>
                        <option value="yes">Has email</option>
                        <option value="no">No email</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">Phone status</label>
                      <select value={currentHasPhone} onChange={e => startTransition(() => router.replace(buildHref({ has_phone: e.target.value })))}
                        className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all cursor-pointer">
                        <option value="">Any</option>
                        <option value="yes">Has phone</option>
                        <option value="no">No phone</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-1">Sync source</label>
                      <select value={currentSource} onChange={e => startTransition(() => router.replace(buildHref({ source: e.target.value })))}
                        className="w-full text-xs border border-[#e4e0d8] rounded-xl px-2.5 py-1.5 bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all cursor-pointer">
                        <option value="">Any source</option>
                        <option value="google">Synced from Google</option>
                        <option value="csv">Imported from CSV</option>
                        <option value="manual">Created manually</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort */}
        <Select
          value={currentSort || 'first_name'}
          onValueChange={val => startTransition(() => router.replace(buildHref({ sort: val })))}
        >
          <SelectTrigger
            className={`h-auto px-3 py-2 text-xs font-semibold rounded-xl border shadow-sm shrink-0 w-auto gap-1.5 ${
              currentSort && currentSort !== 'first_name'
                ? 'bg-[#eaf4ec] border-[#4a7c59] text-[#335c3d]'
                : 'bg-[#f5f1ea] border-[#e4e0d8] text-[#2e3230] hover:bg-[#eae6de]'
            }`}
          >
            <span className="text-[#74796e] font-normal">Sort:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Active filter pill row — only when filters are active ── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 animate-in fade-in duration-150">
          {activePills.map(pill => (
            <Link
              key={pill.key}
              replace
              href={buildHref(pill.clearOverride)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eaf4ec] text-[#335c3d] border border-[#4a7c59]/20 hover:bg-[#d4ecda] transition-colors"
            >
              {pill.label}
              <X className="h-3 w-3 opacity-60" />
            </Link>
          ))}
          <Link
            replace
            href={clearAllHref}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#74796e] hover:text-[#2e3230] transition-colors ml-1"
          >
            <X className="h-3 w-3" />
            Clear all
          </Link>
        </div>
      )}
    </div>
  )
}

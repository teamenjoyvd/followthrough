import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import ContactsClient from './components/ContactsClient'
import { PIPELINE_STATUSES } from './components/constants'
import { ContactFilterBar } from '@/components/ContactFilterBar'
import { FilterShortcuts } from '@/components/FilterShortcuts'
import { SearchInput } from './components/SearchInput'
import type { Database } from '@/types/supabase'

type PipelineStatus = Database['public']['Enums']['pipeline_status']
type SortKey = 'first_name' | 'company' | 'pipeline_status' | 'last_contacted_at'
type SortDir = 'asc' | 'desc'

const VALID_SORT_KEYS: SortKey[] = ['first_name', 'company', 'pipeline_status', 'last_contacted_at']

const LAST_CONTACTED_DAYS: Record<string, number> = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
  '90d': 90,
}

const PIPELINE_STATUS_WEIGHTS: Record<string, number> = {
  lead: 1,
  qualified: 2,
  bought: 3,
  snoozed: 4,
  leave_alone: 5,
}

interface SearchParams {
  q?: string
  status?: string
  sort?: string
  dir?: string
  last_contacted?: string
  company?: string
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
  has_email?: string
  has_phone?: string
  source?: string
  labels?: string // comma-separated active label IDs
  page?: string
}

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Contacts — Followthrough',
  description: 'Manage your corporate contacts, bulk edit, and assign relationship labels.',
}

const PAGE_SIZE = 50

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const params = await searchParams
  const query = (params.q ?? '').trim()
  const statusFilter = (PIPELINE_STATUSES.some(s => s.value === params.status) ? params.status : '') as PipelineStatus | ''
  const lastContactedFilter = params.last_contacted ?? ''
  const companyFilter = (params.company ?? '').trim()
  
  // Specific field filters
  const firstNameFilter = (params.first_name ?? '').trim()
  const lastNameFilter = (params.last_name ?? '').trim()
  const phoneFilter = (params.phone ?? '').trim()
  const emailFilter = (params.email ?? '').trim()
  
  // Composition filters
  const hasEmailFilter = params.has_email ?? ''
  const hasPhoneFilter = params.has_phone ?? ''
  const sourceFilter = params.source ?? ''
  
  // Relational Labels Filters
  const labelsFilter = params.labels ? params.labels.split(',').filter(Boolean) : []
  
  const sortKey: SortKey = VALID_SORT_KEYS.includes(params.sort as SortKey)
    ? (params.sort as SortKey)
    : 'first_name'
  const sortDir: SortDir = params.dir === 'desc' ? 'desc' : 'asc'

  const supabase = await createSupabaseServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle() as { data: { id: string } | null }

  if (!profile) redirect('/sign-in')

  // 1. Fetch available custom labels for the user profile
  const { data: rawLabels } = await supabase
    .from('labels')
    .select('*')
    .eq('profile_id', profile.id)
    .order('name', { ascending: true })

  const userLabels = (rawLabels as any[]) || []

  // 2. Fetch all contacts along with their phone numbers AND relational many-to-many labels
  const { data: rawData, error } = await supabase
    .from('contacts')
    .select('*, phone_numbers(number), contact_labels(label_id)')
    .eq('profile_id', profile.id)
    .limit(5000)

  if (error) throw error

  const rawContacts = (rawData as any[]) || []

  // Apply Advanced filters in-memory
  let filteredContacts = [...(rawContacts || [])]

  // Pipeline Status Filter
  if (statusFilter) {
    filteredContacts = filteredContacts.filter(c => c.pipeline_status === statusFilter)
  }

  // Company Filter
  if (companyFilter) {
    const comp = companyFilter.toLowerCase()
    filteredContacts = filteredContacts.filter(c => c.company?.toLowerCase().includes(comp))
  }

  // Last Contacted Filter
  if (lastContactedFilter && LAST_CONTACTED_DAYS[lastContactedFilter]) {
    const days = LAST_CONTACTED_DAYS[lastContactedFilter]
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    filteredContacts = filteredContacts.filter(c => {
      if (!c.last_contacted_at) return true
      return new Date(c.last_contacted_at) <= cutoff
    })
  }

  // Synced Source Filter
  if (sourceFilter) {
    if (sourceFilter === 'google') {
      filteredContacts = filteredContacts.filter(c => c.created_by_source === 'google_sync')
    } else if (sourceFilter === 'csv') {
      filteredContacts = filteredContacts.filter(c => c.created_by_source === 'csv_import')
    } else if (sourceFilter === 'manual') {
      filteredContacts = filteredContacts.filter(c => c.created_by_source === 'manual')
    }
  }

  // Has Email Filter
  if (hasEmailFilter) {
    if (hasEmailFilter === 'yes') {
      filteredContacts = filteredContacts.filter(c => !!c.email)
    } else if (hasEmailFilter === 'no') {
      filteredContacts = filteredContacts.filter(c => !c.email)
    }
  }

  // Has Phone Filter
  if (hasPhoneFilter) {
    if (hasPhoneFilter === 'yes') {
      filteredContacts = filteredContacts.filter(c => c.phone_numbers && c.phone_numbers.length > 0)
    } else if (hasPhoneFilter === 'no') {
      filteredContacts = filteredContacts.filter(c => !c.phone_numbers || c.phone_numbers.length === 0)
    }
  }

  // Relational Many-to-Many Labels Filter
  if (labelsFilter.length > 0) {
    // Show contacts that match ANY of the selected labels
    filteredContacts = filteredContacts.filter(c =>
      c.contact_labels?.some((cl: any) => labelsFilter.includes(cl.label_id))
    )
  }

  // Field Specific Filters
  if (firstNameFilter) {
    const fn = firstNameFilter.toLowerCase()
    filteredContacts = filteredContacts.filter(c => c.first_name.toLowerCase().includes(fn))
  }

  if (lastNameFilter) {
    const ln = lastNameFilter.toLowerCase()
    filteredContacts = filteredContacts.filter(c => c.last_name?.toLowerCase().includes(ln))
  }

  if (emailFilter) {
    const em = emailFilter.toLowerCase()
    filteredContacts = filteredContacts.filter(c => c.email?.toLowerCase().includes(em))
  }

  if (phoneFilter) {
    const ph = phoneFilter.replace(/\D/g, '')
    filteredContacts = filteredContacts.filter(c => {
      if (!c.phone_numbers) return false
      return c.phone_numbers.some((p: any) => p.number.replace(/\D/g, '').includes(ph))
    })
  }

  // Broad Search (q) - now queries phone numbers too!
  if (query) {
    const q = query.toLowerCase()
    const qDigits = query.replace(/\D/g, '')
    filteredContacts = filteredContacts.filter(c => {
      const firstNameMatch = c.first_name.toLowerCase().includes(q)
      const lastNameMatch = c.last_name?.toLowerCase().includes(q)
      const emailMatch = c.email?.toLowerCase().includes(q)
      const companyMatch = c.company?.toLowerCase().includes(q)
      const jobTitleMatch = c.job_title?.toLowerCase().includes(q)
      
      let phoneMatch = false
      if (qDigits && c.phone_numbers) {
        phoneMatch = c.phone_numbers.some((p: any) => p.number.replace(/\D/g, '').includes(qDigits))
      }

      return firstNameMatch || lastNameMatch || emailMatch || companyMatch || jobTitleMatch || phoneMatch
    })
  }

  // Sort in memory
  filteredContacts.sort((a, b) => {
    let valA: any = a[sortKey]
    let valB: any = b[sortKey]

    if (valA === null || valA === undefined) return sortDir === 'asc' ? 1 : -1
    if (valB === null || valB === undefined) return sortDir === 'asc' ? -1 : 1

    if (sortKey === 'pipeline_status') {
      const weightA = PIPELINE_STATUS_WEIGHTS[valA] ?? 99
      const weightB = PIPELINE_STATUS_WEIGHTS[valB] ?? 99
      return sortDir === 'asc' ? weightA - weightB : weightB - weightA
    }

    if (typeof valA === 'string') {
      return sortDir === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
    } else {
      const numA = new Date(valA).getTime()
      const numB = new Date(valB).getTime()
      return sortDir === 'asc' ? numA - numB : numB - numA
    }
  })

  // Slicing and pagination logic
  const totalContacts = filteredContacts.length
  const totalPages = Math.ceil(totalContacts / PAGE_SIZE) || 1
  const pageParam = Number(params.page || 1)
  const activePage = isNaN(pageParam) || pageParam < 1 ? 1 : Math.min(totalPages, pageParam)
  const paginatedContacts = filteredContacts.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE)

  function buildPaginationHref(newPage: number) {
    const searchParamsObj = new URLSearchParams()
    // Spread existing params and update the page index dynamically
    const merged = { ...params, page: newPage > 1 ? newPage.toString() : '' }

    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') searchParamsObj.set(k, v as string)
    })
    const qs = searchParamsObj.toString()
    return qs ? `/contacts?${qs}` : '/contacts'
  }

  return (
    <div className="flex flex-col h-full bg-[#faf6f0]">
      {/* Search + Filters */}
      <div className="px-4 md:px-6 py-4 bg-[#faf6f0] border-b border-[#e4e0d8] space-y-4 shrink-0">
        <SearchInput
          defaultValue={query}
        />

        <ContactFilterBar
          currentStatus={statusFilter}
          currentLastContacted={lastContactedFilter}
          currentCompany={companyFilter}
          currentQuery={query}
          currentSort={sortKey}
          currentDir={sortDir}
          basePath="/contacts"
          currentFirstName={firstNameFilter}
          currentLastName={lastNameFilter}
          currentPhone={phoneFilter}
          currentEmail={emailFilter}
          currentHasEmail={hasEmailFilter}
          currentHasPhone={hasPhoneFilter}
          currentSource={sourceFilter}
        />

        <FilterShortcuts />
      </div>

      {/* Contacts List Client Component Orchestrator */}
      <ContactsClient
        contacts={paginatedContacts}
        allFilteredIds={filteredContacts.map(c => c.id)}
        labels={userLabels}
        sortKey={sortKey}
        sortDir={sortDir}
        currentQuery={query}
        currentStatus={statusFilter}
        currentLastContacted={lastContactedFilter}
        currentCompany={companyFilter}
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 md:px-6 py-3.5 border-t border-[#e4e0d8] bg-[#faf6f0] shrink-0">
          <div className="flex items-center gap-2">
            {activePage > 1 ? (
              <Link
                href={buildPaginationHref(activePage - 1)}
                className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border border-[#e4e0d8] bg-[#f5f1ea] hover:bg-[#eae6de] text-xs font-semibold text-[#4a7c59] transition-all shadow-sm active:scale-95 duration-200"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border border-[#e4e0d8]/50 bg-[#f5f1ea]/50 text-xs font-semibold text-[#74796e]/50 cursor-not-allowed">
                Previous
              </span>
            )}

            {activePage < totalPages ? (
              <Link
                href={buildPaginationHref(activePage + 1)}
                className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border border-[#e4e0d8] bg-[#f5f1ea] hover:bg-[#eae6de] text-xs font-semibold text-[#4a7c59] transition-all shadow-sm active:scale-95 duration-200"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border border-[#e4e0d8]/50 bg-[#f5f1ea]/50 text-xs font-semibold text-[#74796e]/50 cursor-not-allowed">
                Next
              </span>
            )}
          </div>
          
          <span className="text-xs text-[#74796e] font-medium font-body">
            Page <span className="font-semibold text-[#2e3230]">{activePage}</span> of <span className="font-semibold text-[#2e3230]">{totalPages}</span>
          </span>
        </div>
      )}

      {/* Footer count */}
      <div className="px-4 md:px-6 py-3 border-t border-[#e4e0d8] bg-[#faf6f0] shrink-0">
        <p className="text-xs text-[#74796e] font-body">
          {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
          {statusFilter ? ` · ${PIPELINE_STATUSES.find(s => s.value === statusFilter)?.label}` : ''}
          {lastContactedFilter ? ` · not contacted in ${lastContactedFilter}` : ''}
          {companyFilter ? ` · company "${companyFilter}"` : ''}
          {firstNameFilter ? ` · first name "${firstNameFilter}"` : ''}
          {lastNameFilter ? ` · last name "${lastNameFilter}"` : ''}
          {emailFilter ? ` · email "${emailFilter}"` : ''}
          {phoneFilter ? ` · phone "${phoneFilter}"` : ''}
          {hasEmailFilter ? ` · email: ${hasEmailFilter === 'yes' ? 'has email' : 'no email'}` : ''}
          {hasPhoneFilter ? ` · phone: ${hasPhoneFilter === 'yes' ? 'has phone' : 'no phone'}` : ''}
          {sourceFilter ? ` · source: ${sourceFilter === 'google' ? 'Google sync' : sourceFilter === 'csv' ? 'CSV Import' : 'manual'}` : ''}
          {labelsFilter.length > 0 ? ` · matching labels: ${labelsFilter.length} active` : ''}
          {query ? ` · matching "${query}"` : ''}
        </p>
      </div>
    </div>
  )
}

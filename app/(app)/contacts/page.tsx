import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import ContactsClient from './components/ContactsClient'
import { PIPELINE_STATUSES } from './components/constants'
import { ContactFilterBar } from '@/components/ContactFilterBar'
import { FilterShortcuts } from '@/components/FilterShortcuts'
import { SearchInput } from './components/SearchInput'
import { MobileFilterBar } from '@/components/MobileFilterBar'
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
  labels?: string
  focused?: string
  page?: string
}

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Contacts — Followthrough',
  description: 'Manage your corporate contacts, bulk edit, and assign relationship labels.',
}

const PAGE_SIZE = 50

function buildPaginationHref(params: SearchParams, newPage: number) {
  const searchParamsObj = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && k !== 'page') {
      searchParamsObj.set(k, v)
    }
  })
  if (newPage > 1) {
    searchParamsObj.set('page', newPage.toString())
  }
  const qs = searchParamsObj.toString()
  return qs ? `/contacts?${qs}` : '/contacts'
}

function applyActiveFilters(query: any, filters: {
  statusFilter: string
  companyFilter: string
  lastContactedFilter: string
  sourceFilter: string
  hasEmailFilter: string
  hasPhoneFilter: string
  labelsFilter: string[]
  firstNameFilter: string
  lastNameFilter: string
  emailFilter: string
  phoneFilter: string
  query: string
}) {
  const {
    statusFilter,
    companyFilter,
    lastContactedFilter,
    sourceFilter,
    hasEmailFilter,
    hasPhoneFilter,
    labelsFilter,
    firstNameFilter,
    lastNameFilter,
    emailFilter,
    phoneFilter,
    query: broadQuery
  } = filters

  if (statusFilter) query = query.eq('pipeline_status', statusFilter)
  if (companyFilter) query = query.ilike('company', `%${companyFilter}%`)

  if (lastContactedFilter && LAST_CONTACTED_DAYS[lastContactedFilter]) {
    const days = LAST_CONTACTED_DAYS[lastContactedFilter]
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    query = query.or(`last_contacted_at.lte.${cutoff.toISOString()},last_contacted_at.is.null`)
  }

  if (sourceFilter) {
    if (sourceFilter === 'google') query = query.eq('created_by_source', 'google_sync')
    else if (sourceFilter === 'csv') query = query.eq('created_by_source', 'csv_import')
    else if (sourceFilter === 'manual') query = query.eq('created_by_source', 'manual')
  }

  if (hasEmailFilter) {
    if (hasEmailFilter === 'yes') query = query.not('email', 'is', null)
    else if (hasEmailFilter === 'no') query = query.is('email', null)
  }

  if (hasPhoneFilter) {
    if (hasPhoneFilter === 'yes') query = query.not('phone_numbers_concat', 'is', null)
    else if (hasPhoneFilter === 'no') query = query.is('phone_numbers_concat', null)
  }

  if (labelsFilter.length > 0) {
    query = query.overlaps('label_ids', labelsFilter)
  }

  if (firstNameFilter) query = query.ilike('first_name', `%${firstNameFilter}%`)
  if (lastNameFilter) query = query.ilike('last_name', `%${lastNameFilter}%`)
  if (emailFilter) query = query.ilike('email', `%${emailFilter}%`)

  if (phoneFilter) {
    const phDigits = phoneFilter.replace(/\D/g, '')
    if (phDigits) {
      query = query.ilike('phone_numbers_concat', `%${phDigits}%`)
    }
  }

  if (broadQuery) {
    const q = `%${broadQuery}%`
    const qDigits = broadQuery.replace(/\D/g, '')
    if (qDigits) {
      query = query.or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q},company.ilike.${q},job_title.ilike.${q},phone_numbers_concat.ilike.%${qDigits}%`)
    } else {
      query = query.or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q},company.ilike.${q},job_title.ilike.${q}`)
    }
  }

  return query
}

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
  
  const firstNameFilter = (params.first_name ?? '').trim()
  const lastNameFilter = (params.last_name ?? '').trim()
  const phoneFilter = (params.phone ?? '').trim()
  const emailFilter = (params.email ?? '').trim()
  
  const hasEmailFilter = params.has_email ?? ''
  const hasPhoneFilter = params.has_phone ?? ''
  const sourceFilter = params.source ?? ''
  
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

  const { data: rawLabels } = await supabase
    .from('labels')
    .select('*')
    .eq('profile_id', profile.id)
    .order('name', { ascending: true })

  const userLabels = (rawLabels as any[]) || []

  const pageParam = Number(params.page || 1)
  let activePage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam

  let dbQuery = supabase
    .from('contacts_search_view')
    .select('*', { count: 'exact' })
    .eq('profile_id', profile.id)

  dbQuery = applyActiveFilters(dbQuery, {
    statusFilter,
    companyFilter,
    lastContactedFilter,
    sourceFilter,
    hasEmailFilter,
    hasPhoneFilter,
    labelsFilter,
    firstNameFilter,
    lastNameFilter,
    emailFilter,
    phoneFilter,
    query
  })

  if (sortKey === 'pipeline_status') {
    dbQuery = dbQuery.order('pipeline_status', { ascending: sortDir === 'asc' })
  } else {
    dbQuery = dbQuery.order(sortKey, { ascending: sortDir === 'asc', nullsFirst: false })
  }

  const { data: contactsData, count, error: fetchError } = await dbQuery
    .range((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE - 1)

  if (fetchError) throw fetchError

  const paginatedContacts = (contactsData as any[]) || []
  const totalContacts = count || 0
  const totalPages = Math.ceil(totalContacts / PAGE_SIZE) || 1
  activePage = Math.min(totalPages, activePage)

  let idsQuery = supabase
    .from('contacts_search_view')
    .select('id')
    .eq('profile_id', profile.id)

  idsQuery = applyActiveFilters(idsQuery, {
    statusFilter,
    companyFilter,
    lastContactedFilter,
    sourceFilter,
    hasEmailFilter,
    hasPhoneFilter,
    labelsFilter,
    firstNameFilter,
    lastNameFilter,
    emailFilter,
    phoneFilter,
    query
  })

  const { data: matchedIdsData, error: idsError } = await idsQuery
  if (idsError) throw idsError

  const allFilteredIds = (matchedIdsData as { id: string }[] || []).map(item => item.id)

  // Compute active filter count for mobile badge
  const activeFilterCount = [
    statusFilter,
    lastContactedFilter,
    companyFilter,
    firstNameFilter,
    lastNameFilter,
    phoneFilter,
    emailFilter,
    hasEmailFilter,
    hasPhoneFilter,
    sourceFilter,
    labelsFilter.length > 0 ? 'labels' : '',
  ].filter(Boolean).length

  return (
    <div className="flex flex-col h-full bg-[#faf6f0]">
      {/* ── Mobile heading: Contacts title + new contact button ── */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-[#e4e0d8] bg-[#faf6f0] shrink-0">
        <h1 className="font-headline text-2xl font-bold text-[#2e3230]">Contacts</h1>
        <Link
          href="/contacts/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4a7c59] text-white text-xs font-semibold hover:bg-[#3d6b4a] transition-all duration-200 shadow-sm active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          New contact
        </Link>
      </div>

      {/* ── Mobile filter bar (collapsed by default) ── */}
      <div className="md:hidden">
        <MobileFilterBar
          currentQuery={query}
          currentStatus={statusFilter}
          currentLastContacted={lastContactedFilter}
          currentCompany={companyFilter}
          currentSort={sortKey}
          currentDir={sortDir}
          currentFirstName={firstNameFilter}
          currentLastName={lastNameFilter}
          currentPhone={phoneFilter}
          currentEmail={emailFilter}
          currentHasEmail={hasEmailFilter}
          currentHasPhone={hasPhoneFilter}
          currentSource={sourceFilter}
          currentLabels={params.labels ?? ''}
          currentFocused={params.focused ?? ''}
          activeFilterCount={activeFilterCount}
          labels={userLabels}
        />
      </div>

      {/* ── Desktop filter bar ── */}
      <div className="hidden md:block px-4 md:px-6 py-4 bg-[#faf6f0] border-b border-[#e4e0d8] space-y-4 shrink-0">
        <SearchInput defaultValue={query} />
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
          availableLabels={userLabels}
          currentLabels={params.labels ?? ''}
          currentFocused={params.focused ?? ''}
        />
        <FilterShortcuts />
      </div>

      <ContactsClient
        contacts={paginatedContacts}
        allFilteredIds={allFilteredIds}
        labels={userLabels}
        sortKey={sortKey}
        sortDir={sortDir}
        currentQuery={query}
        currentStatus={statusFilter}
        currentLastContacted={lastContactedFilter}
        currentCompany={companyFilter}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 md:px-6 py-3.5 border-t border-[#e4e0d8] bg-[#faf6f0] shrink-0">
          <div className="flex items-center gap-2">
            {activePage > 1 ? (
              <Link
                href={buildPaginationHref(params, activePage - 1)}
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
                href={buildPaginationHref(params, activePage + 1)}
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

      <div className="px-4 md:px-6 py-3 border-t border-[#e4e0d8] bg-[#faf6f0] shrink-0">
        <p className="text-xs text-[#74796e] font-body">
          {totalContacts} contact{totalContacts !== 1 ? 's' : ''}
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

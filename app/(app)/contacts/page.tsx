import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import ContactsDesktop from './components/ContactsDesktop'
import ContactsMobile from './components/ContactsMobile'
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
}

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Contacts — Followthrough',
  description: 'Manage your contacts and track pipeline status.',
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
  
  // Specific field filters
  const firstNameFilter = (params.first_name ?? '').trim()
  const lastNameFilter = (params.last_name ?? '').trim()
  const phoneFilter = (params.phone ?? '').trim()
  const emailFilter = (params.email ?? '').trim()
  
  // Composition filters
  const hasEmailFilter = params.has_email ?? ''
  const hasPhoneFilter = params.has_phone ?? ''
  const sourceFilter = params.source ?? ''
  
  const sortKey: SortKey = VALID_SORT_KEYS.includes(params.sort as SortKey)
    ? (params.sort as SortKey)
    : 'first_name'
  const sortDir: SortDir = params.dir === 'desc' ? 'desc' : 'asc'

  const supabase = await createSupabaseServerClient()

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle() as { data: { id: string } | null }

  if (!profile) redirect('/sign-in')

  // Fetch all contacts under the profile along with their phone numbers to perform fully-featured, ultra-fast CRM searches & filters
  const { data: rawContacts = [], error } = await (supabase as any)
    .from('contacts')
    .select('*, phone_numbers(number)')
    .eq('profile_id', profile.id)
    .limit(5000)

  if (error) throw error

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
      filteredContacts = filteredContacts.filter(c => !!c.google_contact_id)
    } else if (sourceFilter === 'manual') {
      filteredContacts = filteredContacts.filter(c => !c.google_contact_id)
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

  return (
    <div className="flex flex-col h-full bg-[#faf6f0]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#e4e0d8] bg-[#faf6f0] shrink-0">
        <h1 className="font-headline text-2xl font-bold text-[#2e3230]">Contacts</h1>
        <Link
          href="/contacts/new"
          id="new-contact-btn"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3d6b4a] transition-all duration-200 hover:scale-[1.02] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New contact</span>
        </Link>
      </div>

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

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto bg-[#faf6f0]">
        <ContactsDesktop
          contacts={filteredContacts}
          sortKey={sortKey}
          sortDir={sortDir}
          currentQuery={query}
          currentStatus={statusFilter}
          currentLastContacted={lastContactedFilter}
          currentCompany={companyFilter}
        />
        <ContactsMobile contacts={filteredContacts} />
      </div>

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
          {sourceFilter ? ` · source: ${sourceFilter === 'google' ? 'Google sync' : 'manual'}` : ''}
          {query ? ` · matching "${query}"` : ''}
        </p>
      </div>
    </div>
  )
}

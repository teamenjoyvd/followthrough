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

  let dbQuery = supabase
    .from('contacts')
    .select('*')
    .eq('profile_id', profile.id)
    .order(sortKey, { ascending: sortDir === 'asc' })

  if (statusFilter) {
    dbQuery = dbQuery.eq('pipeline_status', statusFilter as PipelineStatus)
  }

  if (query) {
    const safeQuery = query.replace(/"/g, '""')
    dbQuery = dbQuery.or(
      `first_name.ilike."%${safeQuery}%",last_name.ilike."%${safeQuery}%",email.ilike."%${safeQuery}%",company.ilike."%${safeQuery}%"`
    )
  }

  if (companyFilter) {
    const safeCompany = companyFilter.replace(/"/g, '""')
    dbQuery = dbQuery.ilike('company', `%${safeCompany}%`)
  }

  if (lastContactedFilter && LAST_CONTACTED_DAYS[lastContactedFilter]) {
    const days = LAST_CONTACTED_DAYS[lastContactedFilter]
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    dbQuery = dbQuery.or(
      `last_contacted_at.lte.${cutoff.toISOString()},last_contacted_at.is.null`
    )
  }

  const { data: contacts = [] } = await dbQuery

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
          currentStatus={statusFilter}
          currentLastContacted={lastContactedFilter}
          currentCompany={companyFilter}
          currentSort={sortKey}
          currentDir={sortDir}
        />

        <ContactFilterBar
          currentStatus={statusFilter}
          currentLastContacted={lastContactedFilter}
          currentCompany={companyFilter}
          currentQuery={query}
          currentSort={sortKey}
          currentDir={sortDir}
          basePath="/contacts"
        />

        <FilterShortcuts />
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto bg-[#faf6f0]">
        <ContactsDesktop
          contacts={contacts ?? []}
          sortKey={sortKey}
          sortDir={sortDir}
          currentQuery={query}
          currentStatus={statusFilter}
          currentLastContacted={lastContactedFilter}
          currentCompany={companyFilter}
        />
        <ContactsMobile contacts={contacts ?? []} />
      </div>

      {/* Footer count */}
      <div className="px-4 md:px-6 py-3 border-t border-[#e4e0d8] bg-[#faf6f0] shrink-0">
        <p className="text-xs text-[#74796e] font-body">
          {contacts?.length ?? 0} contact{contacts?.length !== 1 ? 's' : ''}
          {statusFilter ? ` · ${PIPELINE_STATUSES.find(s => s.value === statusFilter)?.label}` : ''}
          {lastContactedFilter ? ` · not contacted in ${lastContactedFilter}` : ''}
          {companyFilter ? ` · company "${companyFilter}"` : ''}
          {query ? ` · matching "${query}"` : ''}
        </p>
      </div>
    </div>
  )
}

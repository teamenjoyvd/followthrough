import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import ContactsDesktop from './components/ContactsDesktop'
import ContactsMobile from './components/ContactsMobile'
import { PIPELINE_STATUSES } from './components/PipelineStatusControl'
import { ContactFilterBar } from '@/components/ContactFilterBar'
import { FilterShortcuts } from '@/components/FilterShortcuts'
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
  const statusFilter = (params.status ?? '') as PipelineStatus | ''
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
    dbQuery = dbQuery.gte('last_contacted_at', cutoff.toISOString())
  }

  const { data: contacts = [] } = await dbQuery

  const activeFilterCount = [statusFilter, lastContactedFilter, companyFilter].filter(Boolean).length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-gray-900">Contacts</h1>
        <Link
          href="/contacts/new"
          id="new-contact-btn"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New contact</span>
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="px-4 md:px-6 py-3 bg-white border-b border-gray-100 space-y-3">
        {/* Search input */}
        <form method="GET">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          {lastContactedFilter && <input type="hidden" name="last_contacted" value={lastContactedFilter} />}
          {companyFilter && <input type="hidden" name="company" value={companyFilter} />}
          <input
            id="contact-search"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search contacts…"
            className="w-full md:max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </form>

        {/* Filter bar (client component for dropdowns/inputs) */}
        <ContactFilterBar
          currentStatus={statusFilter}
          currentLastContacted={lastContactedFilter}
          currentCompany={companyFilter}
          currentQuery={query}
          basePath="/contacts"
        />

        {/* Shortcuts */}
        <FilterShortcuts />
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto bg-white">
        <ContactsDesktop contacts={contacts ?? []} sortKey={sortKey} sortDir={sortDir} />
        <ContactsMobile contacts={contacts ?? []} />
      </div>

      {/* Footer count */}
      <div className="px-4 md:px-6 py-2 border-t border-gray-100 bg-white">
        <p className="text-xs text-gray-400">
          {contacts?.length ?? 0} contact{contacts?.length !== 1 ? 's' : ''}
          {statusFilter ? ` · ${PIPELINE_STATUSES.find(s => s.value === statusFilter)?.label}` : ''}
          {lastContactedFilter ? ` · last contacted ${lastContactedFilter}` : ''}
          {companyFilter ? ` · company "${companyFilter}"` : ''}
          {query ? ` · matching "${query}"` : ''}
        </p>
      </div>
    </div>
  )
}

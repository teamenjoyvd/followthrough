import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import ContactsDesktop from './components/ContactsDesktop'
import ContactsMobile from './components/ContactsMobile'
import { PIPELINE_STATUSES } from './components/PipelineStatusControl'
import type { Database } from '@/types/supabase'

type PipelineStatus = Database['public']['Enums']['pipeline_status']
type SortKey = 'first_name' | 'company' | 'pipeline_status' | 'last_contacted_at'
type SortDir = 'asc' | 'desc'

const VALID_SORT_KEYS: SortKey[] = ['first_name', 'company', 'pipeline_status', 'last_contacted_at']

interface SearchParams {
  q?: string
  status?: string
  sort?: string
  dir?: string
}

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
  const sortKey: SortKey = VALID_SORT_KEYS.includes(params.sort as SortKey)
    ? (params.sort as SortKey)
    : 'first_name'
  const sortDir: SortDir = params.dir === 'desc' ? 'desc' : 'asc'

  const supabase = await createSupabaseServerClient()

  // Resolve profile id
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle() as { data: { id: string } | null }

  if (!profile) redirect('/sign-in')

  // Build query
  let dbQuery = supabase
    .from('contacts')
    .select('*')
    .eq('profile_id', profile.id)
    .order(sortKey, { ascending: sortDir === 'asc' })

  if (statusFilter) {
    dbQuery = dbQuery.eq('pipeline_status', statusFilter as PipelineStatus)
  }

  if (query) {
    dbQuery = dbQuery.or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`
    )
  }

  const { data: contacts = [] } = await dbQuery

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

      {/* Search + Filter */}
      <div className="px-4 md:px-6 py-3 bg-white border-b border-gray-100 space-y-3">
        {/* Search input */}
        <form method="GET">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <input
            id="contact-search"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search contacts…"
            className="w-full md:max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </form>

        {/* Pipeline status filter chips */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by pipeline status">
          <Link
            href={query ? `/contacts?q=${encodeURIComponent(query)}` : '/contacts'}
            id="filter-all"
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              !statusFilter
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            All
          </Link>
          {PIPELINE_STATUSES.map(({ value, label, color }) => {
            const isActive = statusFilter === value
            const href = query
              ? `/contacts?q=${encodeURIComponent(query)}&status=${value}`
              : `/contacts?status=${value}`
            return (
              <Link
                key={value}
                href={href}
                id={`filter-${value}`}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  isActive ? color : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
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
          {statusFilter ? ` · filtered by ${PIPELINE_STATUSES.find(s => s.value === statusFilter)?.label}` : ''}
          {query ? ` · matching "${query}"` : ''}
        </p>
      </div>
    </div>
  )
}

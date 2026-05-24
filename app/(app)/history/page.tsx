import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import HistoryDesktop from './components/HistoryDesktop'
import HistoryMobile from './components/HistoryMobile'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'History — Followthrough',
  description: 'A chronological log of all actions taken in Followthrough.',
}

export const PAGE_SIZE = 25

export interface HistoryItem {
  id: string
  action_type: string
  entity_type: string
  entity_id: string | null
  created_at: string
  undo_expires_at: string | null
  undone_at: string | null
  contact_first_name: string | null
  contact_last_name: string | null
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const params = await searchParams
  const page = Math.max(0, parseInt(params.page ?? '0', 10) || 0)
  const filter = params.filter ?? 'all'

  const supabase = await createSupabaseServerClient()
  const db = supabase as any

  // Build filter predicate
  const ENTITY_TYPE_MAP: Record<string, string[]> = {
    contacts: ['contact'],
    interactions: ['interaction', 'inbox_item'],
    settings: ['profile', 'phone_number', 'social_link'],
  }
  const entityTypes = ENTITY_TYPE_MAP[filter] ?? null

  // Count query
  let countQuery = db
    .from('action_log')
    .select('id', { count: 'exact', head: true })

  if (entityTypes) {
    countQuery = countQuery.in('entity_type', entityTypes)
  }

  const { count, error: countError } = await countQuery
  if (countError) {
    console.error('[HistoryPage] count error:', countError)
  }
  const totalCount = count ?? 0

  // Data query — left join contacts via entity_id when entity_type = 'contact'
  // Supabase JS doesn't support conditional joins, so we do two-step:
  // 1. fetch action_log rows
  // 2. batch-fetch contact names for contact-type rows
  let dataQuery = db
    .from('action_log')
    .select('id, action_type, entity_type, entity_id, created_at, undo_expires_at, undone_at')
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

  if (entityTypes) {
    dataQuery = dataQuery.in('entity_type', entityTypes)
  }

  const { data: rows, error } = await dataQuery

  if (error) {
    console.error('[HistoryPage] fetch error:', error)
  }

  const rawRows: Array<{
    id: string
    action_type: string
    entity_type: string
    entity_id: string | null
    created_at: string
    undo_expires_at: string | null
    undone_at: string | null
  }> = rows ?? []

  // Batch-fetch contact names for contact-type rows
  const contactIds = [
    ...new Set(
      rawRows
        .filter((r) => r.entity_type === 'contact' && r.entity_id)
        .map((r) => r.entity_id as string)
    ),
  ]

  const contactNameMap = new Map<string, { first: string; last: string | null }>()

  if (contactIds.length > 0) {
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name')
      .in('id', contactIds)

    if (contactsError) {
      console.error('[HistoryPage] contacts fetch error:', contactsError)
    }

    for (const c of contacts ?? []) {
      contactNameMap.set(c.id, { first: c.first_name, last: c.last_name ?? null })
    }
  }

  const items: HistoryItem[] = rawRows.map((r) => {
    const contact = r.entity_type === 'contact' && r.entity_id
      ? contactNameMap.get(r.entity_id)
      : undefined
    return {
      ...r,
      contact_first_name: contact?.first ?? null,
      contact_last_name: contact?.last ?? null,
    }
  })

  const props = { items, totalCount, page, filter, pageSize: PAGE_SIZE }

  return (
    <>
      <div className="hidden md:block">
        <HistoryDesktop {...props} />
      </div>
      <div className="block md:hidden">
        <HistoryMobile {...props} />
      </div>
    </>
  )
}

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { checkResurfaced } from '@/lib/actions/snooze'
import { getUnreadInboxCount } from '@/lib/actions/inbox'
import DashboardDesktop from './components/DashboardDesktop'
import DashboardMobile from './components/DashboardMobile'
import type { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard — Followthrough',
  description: 'Manage your focus list and follow-up activities.',
}

type Contact = Database['public']['Tables']['contacts']['Row']

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createSupabaseServerClient()

  // Get current profile
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle() as { data: { id: string } | null }

  if (!profile) redirect('/sign-in')

  // Run the automatic check to resurface any expired snoozed contacts
  await checkResurfaced()

  // Fetch Working List contacts
  const { data } = await (supabase as any)
    .from('contacts')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('on_working_list', true)
    .order('working_list_added_at', { ascending: true }) as { data: Contact[] | null }

  const workingListContacts = data || []

  // Fetch Snoozed contacts count
  const { count: snoozedCount } = await (supabase as any)
    .from('contacts')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profile.id)
    .eq('pipeline_status', 'snoozed') as { count: number | null }

  // Fetch Total contacts count
  const { count: totalContactsCount } = await (supabase as any)
    .from('contacts')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profile.id) as { count: number | null }

  // Fetch Unread Inbox Count
  const inboxUnreadCount = await getUnreadInboxCount()

  const stats = {
    workingListCount: workingListContacts.length,
    inboxCount: inboxUnreadCount,
    snoozedCount: snoozedCount ?? 0,
    totalContactsCount: totalContactsCount ?? 0,
  }

  return (
    <>
      {/* Desktop layout — hidden on mobile */}
      <div className="hidden md:block">
        <DashboardDesktop 
          profileId={profile.id} 
          workingList={workingListContacts} 
          stats={stats} 
        />
      </div>

      {/* Mobile layout — hidden on desktop */}
      <div className="block md:hidden">
        <DashboardMobile 
          profileId={profile.id} 
          workingList={workingListContacts} 
          stats={stats} 
        />
      </div>
    </>
  )
}

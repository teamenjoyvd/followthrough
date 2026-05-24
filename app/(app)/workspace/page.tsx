import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUnreadInboxCount, getInboxItems } from '@/lib/actions/inbox'
import { ensureProfile } from '@/lib/profile'
import { DEFAULT_FOLLOWUP_RULES } from '@/lib/constants/followup'
import WorkspaceDesktop from './components/WorkspaceDesktop'
import WorkspaceMobile from './components/WorkspaceMobile'
import ResurfaceTrigger from './components/ResurfaceTrigger'
import type { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Workspace — Followthrough',
  description: 'Manage your focus list and follow-up activities.',
}

type Contact = Database['public']['Tables']['contacts']['Row']

export default async function WorkspacePage() {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createSupabaseServerClient()

  interface ProfileResult {
    id: string
    display_name: string | null
    followup_rules: any
    undo_window_seconds: number | null
  }

  const { data: profileResult, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, followup_rules, undo_window_seconds')
    .eq('clerk_id', userId)
    .maybeSingle() as { data: ProfileResult | null; error: any }

  if (profileError) {
    console.error('[WorkspacePage] Error fetching profile:', profileError)
  }

  let profile = profileResult

  if (!profile) {
    let email = (sessionClaims?.email as string) || (sessionClaims?.primary_email as string) || ''
    let fullName = (sessionClaims?.name as string) || (sessionClaims?.full_name as string) || ''

    if (!email || !fullName) {
      const user = await currentUser()
      email = email || (user?.emailAddresses?.[0]?.emailAddress ?? '')
      fullName =
        fullName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
        email ||
        userId
    }

    profile = await ensureProfile(userId, email, fullName)
  }

  if (!profile) {
    throw new Error('Failed to guarantee user profile. Please check database connectivity.')
  }

  const displayName = (profile.display_name ?? '').split(' ')[0] || 'there'
  const undoWindowSeconds = (profile as any).undo_window_seconds ?? 10

  const avatarUrl = (sessionClaims?.picture as string) || (sessionClaims?.avatar_url as string) || (sessionClaims?.image_url as string) || null

  const { data: allContacts, error: allContactsError } = await supabase
    .from('contacts')
    .select('*')
    .eq('profile_id', profile.id) as { data: Contact[] | null; error: any }

  if (allContactsError) {
    console.error('[WorkspacePage] Error fetching all contacts:', allContactsError)
  }

  const contactsList = allContacts || []

  const todayStr = new Date().toISOString().split('T')[0]
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0]

  const { data: upcomingContacts, error: upcomingContactsError } = await supabase
    .from('contacts')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('pipeline_status', 'snoozed')
    .gte('snoozed_until', todayStr)
    .lte('snoozed_until', sevenDaysLaterStr)
    .order('snoozed_until', { ascending: true })
    .limit(5) as { data: Contact[] | null; error: any }

  if (upcomingContactsError) {
    console.error('[WorkspacePage] Error fetching upcoming contacts:', upcomingContactsError)
  }

  const workingListContacts = contactsList
    .filter((c) => c.on_working_list)
    .sort((a, b) => {
      const aTime = a.working_list_added_at ? new Date(a.working_list_added_at).getTime() : 0
      const bTime = b.working_list_added_at ? new Date(b.working_list_added_at).getTime() : 0
      return aTime - bTime
    })

  const snoozedCount = contactsList.filter((c) => c.pipeline_status === 'snoozed').length
  const totalContactsCount = contactsList.length
  const inboxUnreadCount = await getUnreadInboxCount()

  const stats = {
    workingListCount: workingListContacts.length,
    inboxCount: inboxUnreadCount,
    snoozedCount,
    totalContactsCount,
  }

  const followupRules = (profile.followup_rules as Record<string, number> | null) || DEFAULT_FOLLOWUP_RULES
  let overdueCount = 0

  for (const contact of contactsList) {
    if (contact.pipeline_status === 'snoozed') continue
    const thresholdDays = followupRules[contact.pipeline_status] ?? 14
    const referenceDateStr = contact.last_contacted_at || contact.created_at
    if (referenceDateStr) {
      const referenceDate = new Date(referenceDateStr)
      const diffMs = Date.now() - referenceDate.getTime()
      if (diffMs > thresholdDays * 24 * 60 * 60 * 1000) {
        overdueCount++
      }
    } else {
      overdueCount++
    }
  }

  const healthPercentage = totalContactsCount > 0 ? Math.round(((totalContactsCount - overdueCount) / totalContactsCount) * 100) : 100

  const { data: rawLabels } = await supabase
    .from('labels')
    .select('*')
    .eq('profile_id', profile.id)
    .order('name', { ascending: true })

  const allLabels = (rawLabels as any[]) || []

  const inboxItems = await getInboxItems()

  // Count today's interactions via targeted date-range query — avoids fetching
  // the entire interaction history into memory.
  const todayStart = `${todayStr}T00:00:00.000Z`
  const tomorrowStart = `${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T00:00:00.000Z`

  const { count: completedTodayCount } = await supabase
    .from('interactions')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profile.id)
    .gte('created_at', todayStart)
    .lt('created_at', tomorrowStart)

  // Fetch recent interaction dates for streak calculation — only created_at needed.
  const { data: recentInteractions } = await supabase
    .from('interactions')
    .select('created_at')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(365)

  const interactionsList = (recentInteractions as { created_at: string }[]) || []

  const streakDays = calculateStreak(interactionsList)

  return (
    <>
      <ResurfaceTrigger />
      <div className="hidden md:block">
        <WorkspaceDesktop
          profileId={profile.id}
          displayName={displayName}
          workingList={workingListContacts}
          stats={stats}
          avatarUrl={avatarUrl}
          healthPercentage={healthPercentage}
          upcomingContacts={upcomingContacts || []}
          allContacts={contactsList}
          allLabels={allLabels}
          inboxItems={inboxItems}
          completedTodayCount={completedTodayCount ?? 0}
          streakDays={streakDays}
          undoWindowSeconds={undoWindowSeconds}
        />
      </div>

      <div className="block md:hidden">
        <WorkspaceMobile
          profileId={profile.id}
          displayName={displayName}
          workingList={workingListContacts}
          stats={stats}
          avatarUrl={avatarUrl}
          healthPercentage={healthPercentage}
          upcomingContacts={upcomingContacts || []}
          allContacts={contactsList}
          allLabels={allLabels}
          inboxItems={inboxItems}
          completedTodayCount={completedTodayCount ?? 0}
          streakDays={streakDays}
          undoWindowSeconds={undoWindowSeconds}
        />
      </div>
    </>
  )
}

function calculateStreak(interactions: { created_at: string }[]): number {
  if (!interactions || interactions.length === 0) return 0

  const dates = Array.from(
    new Set(
      interactions.map(i => new Date(i.created_at).toISOString().split('T')[0])
    )
  ).sort((a, b) => b.localeCompare(a))

  if (dates.length === 0) return 0

  const todayStr = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0
  }

  let streak = 0
  const currentDate = new Date(dates[0])

  for (let i = 0; i < dates.length; i++) {
    const expectedStr = currentDate.toISOString().split('T')[0]
    if (dates[i] === expectedStr) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

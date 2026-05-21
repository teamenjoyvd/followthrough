import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SyncConflictList } from './components/SyncConflictList'
import type { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Settings — Followthrough',
  description: 'Manage your Followthrough settings and integrations.',
}

type SyncConflictRow = Database['public']['Tables']['sync_conflicts']['Row'] & {
  contacts: { first_name: string; last_name: string | null } | null
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ google_connected?: string; google_error?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const params = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .eq('clerk_id', userId)
    .maybeSingle()

  if (!profile) redirect('/sign-in')

  // Google sync state — cast because access_token/refresh_token predate generated types
  const { data: syncState } = await (supabase as any)
    .from('google_sync_state')
    .select('last_synced_at, access_token')
    .eq('profile_id', profile.id)
    .maybeSingle() as { data: { last_synced_at: string | null; access_token: string | null } | null }

  const isConnected = !!syncState?.access_token

  // Unresolved conflicts
  const { data: conflicts = [] } = await supabase
    .from('sync_conflicts')
    .select('*, contacts(first_name, last_name)')
    .eq('profile_id', profile.id)
    .eq('resolved', false)
    .order('created_at', { ascending: false }) as { data: SyncConflictRow[] | null }

  const conflictCount = conflicts?.length ?? 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto px-6 py-8 space-y-10">
          <SettingsContent
            profile={profile}
            isConnected={isConnected}
            syncState={syncState}
            conflicts={conflicts ?? []}
            conflictCount={conflictCount}
            flashConnected={params.google_connected === '1'}
            flashError={params.google_error}
          />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-8">
          <SettingsContent
            profile={profile}
            isConnected={isConnected}
            syncState={syncState}
            conflicts={conflicts ?? []}
            conflictCount={conflictCount}
            flashConnected={params.google_connected === '1'}
            flashError={params.google_error}
          />
        </div>
      </div>
    </div>
  )
}

function SettingsContent({
  profile,
  isConnected,
  syncState,
  conflicts,
  conflictCount,
  flashConnected,
  flashError,
}: {
  profile: { id: string; email: string; display_name: string | null }
  isConnected: boolean
  syncState: { last_synced_at: string | null; access_token: string | null } | null
  conflicts: SyncConflictRow[]
  conflictCount: number
  flashConnected: boolean
  flashError: string | undefined
}) {
  return (
    <>
      {/* Account section */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Account</h2>
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700">
          <p>{profile.display_name ?? profile.email}</p>
          <p className="text-gray-500 text-xs mt-0.5">{profile.email}</p>
        </div>
      </section>

      {/* Google sync section */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Google Contacts</h2>

        {/* Flash messages */}
        {flashConnected && (
          <div className="rounded-md bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-800">
            Google Contacts connected successfully.
          </div>
        )}
        {flashError && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-800">
            {flashError === 'access_denied' && 'Google access was denied. Please try again.'}
            {flashError === 'token_exchange' && 'Failed to exchange OAuth token. Please try again.'}
            {flashError === 'save_failed' && 'Failed to save connection. Please try again.'}
            {flashError === 'profile_not_found' && 'Profile not found. Please sign out and back in.'}
            {!['access_denied', 'token_exchange', 'save_failed', 'profile_not_found'].includes(flashError) && 'An error occurred. Please try again.'}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              {isConnected ? 'Connected' : 'Not connected'}
            </p>
            {syncState?.last_synced_at && (
              <p className="text-xs text-gray-500 mt-0.5">
                Last synced {new Date(syncState.last_synced_at).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isConnected && (
              <form action="/api/google/sync" method="POST">
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sync now
                </button>
              </form>
            )}
            <Link
              href="/api/google/oauth"
              className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              {isConnected ? 'Reconnect' : 'Connect Google'}
            </Link>
          </div>
        </div>

        {/* Conflict resolution */}
        {isConnected && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Sync conflicts
                {conflictCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    {conflictCount}
                  </span>
                )}
              </h3>
            </div>
            <SyncConflictList conflicts={conflicts} profileId={profile.id} />
          </div>
        )}
      </section>
    </>
  )
}

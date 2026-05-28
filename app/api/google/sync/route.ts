import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'
import { syncPeople } from '@/lib/google/sync'
import { decryptToken, encryptToken } from '@/app/api/google/callback/route'
import type { GooglePerson } from '@/lib/google/sync'
import type { SyncStep } from '@/types/google-sync'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_TOKEN_SECRET = process.env.GOOGLE_TOKEN_SECRET!

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) return null
  const data = await res.json() as { access_token?: string }
  return data.access_token ?? null
}

export async function POST() {
  const steps: SyncStep[] = []

  // ── Step 1: Auth check ────────────────────────────────────────────────────────
  const { userId } = await auth()
  if (!userId) {
    steps.push({ label: 'Auth check', status: 'error', detail: 'Unauthorized — no Clerk userId' })
    return NextResponse.json({ error: 'Unauthorized', steps }, { status: 401 })
  }
  steps.push({ label: 'Auth check', status: 'ok', detail: `userId: ${userId}` })

  const supabase = await createSupabaseServerClient()

  // ── Step 2: Profile lookup ────────────────────────────────────────────────────
  const profileId = await getProfileId(supabase, userId)
  if (!profileId) {
    steps.push({ label: 'Profile lookup', status: 'error', detail: 'No profile found for this user' })
    return NextResponse.json({ error: 'Profile not found', steps }, { status: 404 })
  }
  steps.push({ label: 'Profile lookup', status: 'ok', detail: `profileId: ${profileId}` })

  // ── Step 3: Token load ────────────────────────────────────────────────────────
  const { data: syncState } = await (supabase as any)
    .from('google_sync_state')
    .select('access_token, refresh_token, sync_token')
    .eq('profile_id', profileId)
    .maybeSingle() as {
      data: {
        access_token: string | null
        refresh_token: string | null
        sync_token: string | null
      } | null
    }

  if (!syncState?.access_token) {
    steps.push({ label: 'Token load', status: 'error', detail: 'Google not connected — no access token in sync state' })
    return NextResponse.json({ error: 'Google not connected', steps }, { status: 400 })
  }
  steps.push({ label: 'Token load', status: 'ok', detail: syncState.sync_token ? 'Incremental sync (sync_token present)' : 'Full sync (no sync_token)' })

  // ── Step 4: Token decrypt ─────────────────────────────────────────────────────
  let accessToken: string
  try {
    accessToken = await decryptToken(syncState.access_token, GOOGLE_TOKEN_SECRET)
    steps.push({ label: 'Token decrypt', status: 'ok' })
  } catch (err: any) {
    steps.push({ label: 'Token decrypt', status: 'error', detail: err?.message ?? 'Decrypt failed' })
    console.error('Google sync failed:', JSON.stringify(err, (_, v) => v instanceof Error ? { ...v, message: v.message, stack: v.stack } : v))
    return NextResponse.json({ error: 'Failed to decrypt token', steps }, { status: 500 })
  }

  // ── Step 5: Google API fetch ──────────────────────────────────────────────────
  const buildUrl = (syncToken: string | null, pageToken?: string) => {
    const params = new URLSearchParams({
      personFields: 'names,emailAddresses,organizations,phoneNumbers',
      pageSize: '1000',
    })
    if (syncToken) params.set('syncToken', syncToken)
    if (pageToken) params.set('pageToken', pageToken)
    return `https://people.googleapis.com/v1/people/me/connections?${params}`
  }

  let allPeople: GooglePerson[] = []
  let syncTokenCleared = false

  const fetchConnections = async (
    syncToken: string | null,
    pageToken?: string,
    retriedFullSync = false,
  ): Promise<{ connections?: GooglePerson[]; nextSyncToken?: string; nextPageToken?: string }> => {
    const url = buildUrl(syncToken, pageToken)
    let res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (res.status === 401 && syncState.refresh_token) {
      const decryptedRefresh = await decryptToken(syncState.refresh_token, GOOGLE_TOKEN_SECRET)
      const newAccess = await refreshAccessToken(decryptedRefresh)
      if (newAccess) {
        const newEncrypted = await encryptToken(newAccess, GOOGLE_TOKEN_SECRET)
        await (supabase as any)
          .from('google_sync_state')
          .update({ access_token: newEncrypted })
          .eq('profile_id', profileId)

        accessToken = newAccess
        res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      }
    }

    if (!res.ok) {
      let errorMessage = `Google API error: HTTP ${res.status}`
      try {
        const errorBody = await res.json() as { error?: { message?: string } }
        errorMessage = errorBody.error?.message ?? errorMessage
      } catch {
        // JSON parse failed — fall through with the default HTTP status message
      }

      if (res.status === 400 && syncToken !== null && !retriedFullSync) {
        await (supabase as any)
          .from('google_sync_state')
          .update({ sync_token: null })
          .eq('profile_id', profileId)

        steps.push({ label: 'sync_token clear', status: 'warn', detail: 'Stale sync_token detected — cleared and retried as full sync' })
        syncState.sync_token = null
        allPeople = []
        syncTokenCleared = true
        return fetchConnections(null, undefined, true)
      }

      throw new Error(errorMessage)
    }

    return await res.json() as {
      connections?: GooglePerson[]
      nextPageToken?: string
      nextSyncToken?: string
    }
  }

  let pageToken: string | undefined = undefined
  let newSyncToken: string | null = null
  let hasMore = true
  let googleFetchDetail = ''

  try {
    while (hasMore) {
      const data = await fetchConnections(syncState.sync_token, pageToken)
      if (data.connections) {
        allPeople.push(...data.connections)
      }
      if (data.nextSyncToken) {
        newSyncToken = data.nextSyncToken
      }
      if (data.nextPageToken) {
        pageToken = data.nextPageToken
      } else {
        hasMore = false
      }
    }
    googleFetchDetail = `${allPeople.length} contact(s) fetched`
    if (syncTokenCleared) googleFetchDetail += ' (sync_token expired — fell back to full sync)'
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown fetch error')
    steps.push({ label: 'Google API fetch', status: 'error', detail: errorMessage })
    return NextResponse.json({ error: errorMessage, steps }, { status: 502 })
  }

  steps.push({ label: 'Google API fetch', status: 'ok', detail: googleFetchDetail })

  // ── Step 7: syncPeople ────────────────────────────────────────────────────────
  try {
    const result = await syncPeople(supabase, profileId, allPeople, newSyncToken)
    steps.push({
      label: 'syncPeople',
      status: 'ok',
      detail: `upserted: ${result.upserted}, conflicts: ${result.conflictsCreated}`,
    })

    // ── Step 8: State update ──────────────────────────────────────────────────
    steps.push({ label: 'State update', status: 'ok', detail: `sync_token ${result.newSyncToken ? 'updated' : 'unchanged (null)'}` })

    return NextResponse.json({
      imported: result.upserted,
      conflicts: result.conflictsCreated,
      newSyncToken: result.newSyncToken,
      steps,
    })
  } catch (error: any) {
    steps.push({ label: 'syncPeople', status: 'error', detail: error.message || 'Failed to persist synced contacts' })
    console.error('Google sync failed:', JSON.stringify(error, (_, v) => v instanceof Error ? { ...v, message: v.message, stack: v.stack } : v))
    return NextResponse.json(
      { error: error.message || 'Failed to persist synced contacts', steps },
      { status: 500 }
    )
  }
}

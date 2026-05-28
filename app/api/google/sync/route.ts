import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'
import { syncPeople } from '@/lib/google/sync'
import { decryptToken, encryptToken } from '@/app/api/google/callback/route'
import type { GooglePerson } from '@/lib/google/sync'

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
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createSupabaseServerClient()

  const profileId = await getProfileId(supabase, userId)
  if (!profileId) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Load sync state — use (supabase as any) because generated types predate the new columns
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
    return NextResponse.json({ error: 'Google not connected' }, { status: 400 })
  }

  let accessToken = await decryptToken(syncState.access_token, GOOGLE_TOKEN_SECRET)

  // Fetch contacts from Google People API
  const buildUrl = (syncToken: string | null, pageToken?: string) => {
    const params = new URLSearchParams({
      personFields: 'names,emailAddresses,organizations,phoneNumbers',
      pageSize: '1000',
    })
    if (syncToken) params.set('syncToken', syncToken)
    if (pageToken) params.set('pageToken', pageToken)
    return `https://people.googleapis.com/v1/people/me/connections?${params}`
  }

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
        // Persist new encrypted access token
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
      // Parse the error body as JSON to extract a meaningful message.
      // Google returns structured errors: { error: { code, message, details, status } }
      let errorMessage = `Google API error: HTTP ${res.status}`
      let isExpiredSyncToken = false

      try {
        const errorBody = await res.json() as {
          error?: {
            message?: string
            status?: string
            details?: Array<{ reason?: string }>
          }
        }
        errorMessage = errorBody.error?.message ?? errorMessage

        // Detect expired sync token — Google returns reason "EXPIRED_SYNC_TOKEN" in error details
        // or surfaces it in the message. Sync tokens expire 7 days after a full sync.
        isExpiredSyncToken =
          errorBody.error?.details?.some(d => d.reason === 'EXPIRED_SYNC_TOKEN') ??
          errorBody.error?.message?.includes('EXPIRED_SYNC_TOKEN') ??
          false
      } catch {
        // JSON parse failed — fall through with the default HTTP status message
      }

      if (isExpiredSyncToken && !retriedFullSync) {
        // Clear the stale sync token in DB and in the closed-over syncState so subsequent
        // pagination loop iterations don't re-pass the expired token and re-trigger this path.
        await (supabase as any)
          .from('google_sync_state')
          .update({ sync_token: null })
          .eq('profile_id', profileId)

        syncState.sync_token = null
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

  let allPeople: GooglePerson[] = []
  let pageToken: string | undefined = undefined
  let newSyncToken: string | null = null
  let hasMore = true

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 502 })
  }

  try {
    const result = await syncPeople(supabase, profileId, allPeople, newSyncToken)
    return NextResponse.json({
      imported: result.upserted,
      conflicts: result.conflictsCreated,
      newSyncToken: result.newSyncToken,
    })
  } catch (error: any) {
    console.error('Google sync failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to persist synced contacts' },
      { status: 500 }
    )
  }
}

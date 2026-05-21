import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { syncPeople } from '@/lib/google/sync'
import { decryptToken } from '@/app/api/google/callback/route'
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

  // Resolve profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Load sync state — use (supabase as any) because generated types predate the new columns
  const { data: syncState } = await (supabase as any)
    .from('google_sync_state')
    .select('access_token, refresh_token, sync_token')
    .eq('profile_id', profile.id)
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
  const buildUrl = (token: string | null) => {
    const params = new URLSearchParams({
      personFields: 'names,emailAddresses,organizations',
      pageSize: '1000',
    })
    if (token) params.set('syncToken', token)
    return `https://people.googleapis.com/v1/people/me/connections?${params}`
  }

  let peopleRes = await fetch(buildUrl(syncState.sync_token), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  // 401 → try to refresh
  if (peopleRes.status === 401 && syncState.refresh_token) {
    const decryptedRefresh = await decryptToken(syncState.refresh_token, GOOGLE_TOKEN_SECRET)
    const newAccess = await refreshAccessToken(decryptedRefresh)
    if (!newAccess) {
      return NextResponse.json({ error: 'Token refresh failed — reconnect Google' }, { status: 400 })
    }
    // Persist new encrypted access token
    const { encryptToken } = await import('@/app/api/google/callback/route')
    const newEncrypted = await encryptToken(newAccess, GOOGLE_TOKEN_SECRET)
    await (supabase as any)
      .from('google_sync_state')
      .update({ access_token: newEncrypted })
      .eq('profile_id', profile.id)

    accessToken = newAccess
    peopleRes = await fetch(buildUrl(syncState.sync_token), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }

  if (!peopleRes.ok) {
    const body = await peopleRes.text()
    return NextResponse.json({ error: `Google API error: ${body}` }, { status: 502 })
  }

  const peopleData = await peopleRes.json() as {
    connections?: GooglePerson[]
    nextSyncToken?: string
  }

  const people = peopleData.connections ?? []
  const newSyncToken = peopleData.nextSyncToken ?? null

  const result = await syncPeople(supabase, profile.id, people, newSyncToken)

  return NextResponse.json(result)
}

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getProfileId } from '@/lib/supabase/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_TOKEN_SECRET = process.env.GOOGLE_TOKEN_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/google/callback`

// AES-GCM encryption using Web Crypto API (available in Next.js edge + Node runtimes)
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const secretBuffer = encoder.encode(secret)
  const hashBuffer = await crypto.subtle.digest('SHA-256', secretBuffer)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  )
  return keyMaterial
}

export async function encryptToken(plaintext: string, secret: string): Promise<string> {
  const key = await getCryptoKey(secret)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  // Encode as base64: iv (12 bytes) + ciphertext
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.byteLength)
  return Buffer.from(combined).toString('base64')
}

export async function decryptToken(encrypted: string, secret: string): Promise<string> {
  const key = await getCryptoKey(secret)
  const combined = Buffer.from(encrypted, 'base64')
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  )
  return new TextDecoder().decode(plaintext)
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/settings?google_error=access_denied', req.url))
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/settings?google_error=token_exchange', req.url))
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }

  const encryptedAccess = await encryptToken(tokens.access_token, GOOGLE_TOKEN_SECRET)
  const encryptedRefresh = tokens.refresh_token
    ? await encryptToken(tokens.refresh_token, GOOGLE_TOKEN_SECRET)
    : null

  const supabase = await createSupabaseServerClient()

  const profileId = await getProfileId(supabase, userId)
  if (!profileId) {
    return NextResponse.redirect(new URL('/settings?google_error=profile_not_found', req.url))
  }

  // Upsert google_sync_state with encrypted tokens
  const { error: upsertErr } = await (supabase as any)
    .from('google_sync_state')
    .upsert(
      {
        profile_id: profileId,
        access_token: encryptedAccess,
        ...(encryptedRefresh ? { refresh_token: encryptedRefresh } : {}),
      },
      { onConflict: 'profile_id' },
    )

  if (upsertErr) {
    return NextResponse.redirect(new URL('/settings?google_error=save_failed', req.url))
  }

  return NextResponse.redirect(new URL('/settings?google_connected=1', req.url))
}

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/google/callback`

const SCOPES = [
  'https://www.googleapis.com/auth/contacts.readonly',
].join(' ')

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent', // force refresh_token on every connect
  })

  redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/supabase'

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  let supabaseToken: string | null = null
  try {
    const { userId, getToken } = await auth()
    if (userId) {
      supabaseToken = await getToken({ template: 'supabase' })
    }
  } catch (error) {
    console.error('[createSupabaseServerClient] Failed to retrieve Clerk JWT token:', error)
  }

  const options: any = {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component — cookie writes are best-effort
        }
      },
    },
  }

  if (supabaseToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${supabaseToken}`,
      },
    }
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  )
}

export async function createSupabaseServiceClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function getProfileId(
  supabase: any,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle()
  return data?.id ?? null
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../../types/supabase'

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>
type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<DatabaseWithoutInternals>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
          } catch {
            // Server Component — cookie writes are best-effort
          }
        },
      },
    }
  )
}

export async function createSupabaseServiceClient() {
  const cookieStore = await cookies()

  return createServerClient<DatabaseWithoutInternals>(
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

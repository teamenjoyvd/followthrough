'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

export type TypedSupabaseClient = SupabaseClient<
  Database,
  'public',
  'public',
  Database['public'],
  { PostgrestVersion: '14.5' }
>

export async function createSupabaseServerClient(): Promise<TypedSupabaseClient> {
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
        Authorization: 'Bearer ' + supabaseToken,
      },
    }
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  ) as unknown as TypedSupabaseClient
}

export async function createSupabaseServiceClient(): Promise<TypedSupabaseClient> {
  const cookieStore = await cookies()

  return createServerClient<Database>(
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
  ) as unknown as TypedSupabaseClient
}

export async function getProfileId(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle()
  return data?.id ?? null
}

export async function getProfile(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<{ id: string; undo_window_seconds: number } | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, undo_window_seconds')
    .eq('clerk_id', userId)
    .maybeSingle()
  if (!data) return null
  return { id: data.id, undo_window_seconds: data.undo_window_seconds ?? 30 }
}

'use server'

import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export async function toggleFocus(
  contactId: string,
  currentValue: boolean,
): Promise<{ success: true } | { error: string }> {
  // TODO: implement
  return { success: true }
}

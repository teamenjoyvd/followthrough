import type { Database } from '@/types/supabase'

type ContactRow = Database['public']['Tables']['contacts']['Row']

/** Fields we check for conflicts during Google sync */
const SYNCED_FIELDS: (keyof ContactRow)[] = [
  'first_name',
  'last_name',
  'email',
  'company',
  'job_title',
]

export interface ConflictField {
  field_name: string
  our_value: string | null
  google_value: string | null
}

/**
 * Compares an existing local contact against an incoming Google contact.
 * Returns one ConflictField per field where both sides are non-null and differ.
 * If our side is null (field was never set), we treat the Google value as an
 * additive update — not a conflict.
 */
export function detectConflicts(
  existing: Partial<ContactRow>,
  incoming: Partial<ContactRow>,
): ConflictField[] {
  const conflicts: ConflictField[] = []

  for (const field of SYNCED_FIELDS) {
    const ourValue = (existing[field] as string | null | undefined) ?? null
    const googleValue = (incoming[field] as string | null | undefined) ?? null

    // Only a conflict when both sides have a value and they differ
    if (ourValue !== null && googleValue !== null && ourValue !== googleValue) {
      conflicts.push({ field_name: field, our_value: ourValue, google_value: googleValue })
    }
  }

  return conflicts
}

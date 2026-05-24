import type { Database } from '@/types/supabase'

type Contact = Database['public']['Tables']['contacts']['Row']

/**
 * Generate initials from first name and last name.
 */
export function getInitials(first: string, last: string | null) {
  return `${first[0] || ''}${last ? last[0] || '' : ''}`.toUpperCase()
}

/**
 * Resolves avatar URL dynamically, falling back to database column value.
 */
export function getAvatarUrl(contact: Contact): string | null {
  return contact.avatar_url
}

/**
 * Resolves contact description dynamically, using custom_description column if available,
 * and falling back to company/job title metadata or a friendly default message.
 */
export function getContactDescription(contact: Contact): string {
  if (contact.custom_description?.trim()) {
    return contact.custom_description.trim()
  }
  if (contact.job_title && contact.company) {
    return `${contact.job_title} at ${contact.company}`
  }
  if (contact.job_title) {
    return contact.job_title
  }
  if (contact.company) {
    return contact.company
  }
  return 'Stay in touch and keep the momentum'
}

/**
 * Represents the preferred actions for a contact.
 * Parses the `preferred_contact_method` column which can contain a single method or a comma-separated list.
 */
export function getPreferredContactMethods(contact: Contact): string[] {
  if (!contact.preferred_contact_method) {
    return []
  }
  return contact.preferred_contact_method
    .split(',')
    .map((m) => m.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Formats a timestamp as a dynamic, human-readable relative time (e.g. '2h ago', '3d ago').
 */
export function formatRelativeTime(dateStr: string | null): string | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  
  // Guard against future timestamps due to client clock drift
  if (diffMs < 0) return 'Just now'
  
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Calculates the active follow-up streak in days based on interaction timestamps.
 */
export function calculateStreak(interactions: { created_at: string }[]): number {
  if (!interactions || interactions.length === 0) return 0

  const dates = Array.from(
    new Set(
      interactions.map(i => new Date(i.created_at).toISOString().split('T')[0])
    )
  ).sort((a, b) => b.localeCompare(a))

  if (dates.length === 0) return 0

  const todayStr = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0
  }

  let streak = 0
  const currentDate = new Date(dates[0])

  for (let i = 0; i < dates.length; i++) {
    const expectedStr = currentDate.toISOString().split('T')[0]
    if (dates[i] === expectedStr) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

import type { HistoryItem } from './history-types'

export const PAGE_SIZE = 25

export const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'interactions', label: 'Interactions' },
  { key: 'settings', label: 'Settings' },
] as const

export function isUndoable(item: HistoryItem): boolean {
  if (item.undone_at) return false
  if (!item.undo_expires_at) return false
  return Date.now() < new Date(item.undo_expires_at).getTime()
}

export function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

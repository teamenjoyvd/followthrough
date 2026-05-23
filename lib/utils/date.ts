/**
 * Timezone-safe date formatter that calculates number of days between two dates.
 * Uses Math.round to avoid off-by-one errors during DST shifts.
 */
export function formatSnoozedDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const targetDate = new Date(year, month - 1, day)
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  
  return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

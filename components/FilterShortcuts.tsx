import Link from 'next/link'
import { Zap } from 'lucide-react'

const SHORTCUTS = [
  {
    label: "This week's overdue",
    href: '/contacts?last_contacted=7d&status=lead',
    description: 'Leads not contacted in 7 days',
  },
  {
    label: 'Leads not contacted in 14d',
    href: '/contacts?last_contacted=14d&status=lead',
    description: 'Leads overdue for follow-up',
  },
] as const

export function FilterShortcuts() {
  return (
    <div className="flex flex-wrap gap-2">
      {SHORTCUTS.map((shortcut) => (
        <Link
          key={shortcut.href}
          href={shortcut.href}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
          title={shortcut.description}
        >
          <Zap className="h-3 w-3" />
          {shortcut.label}
        </Link>
      ))}
    </div>
  )
}

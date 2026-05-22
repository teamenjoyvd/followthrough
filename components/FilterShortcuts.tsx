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
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#c4a66a]/30 bg-[#f8e0a8]/20 text-[#554020] text-xs font-semibold hover:bg-[#f8e0a8]/40 transition-colors shadow-sm"
          title={shortcut.description}
        >
          <Zap className="h-3.5 w-3.5 text-[#c4a66a]" />
          {shortcut.label}
        </Link>
      ))}
    </div>
  )
}

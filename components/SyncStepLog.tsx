'use client'

import type { SyncStep } from '@/types/google-sync'

interface Props {
  steps: SyncStep[]
}

const STATUS_DOT: Record<SyncStep['status'], string> = {
  ok:    '●',
  warn:  '●',
  error: '●',
}

const STATUS_COLOR: Record<SyncStep['status'], string> = {
  ok:    'text-terra-primary',
  warn:  'text-yellow-500',
  error: 'text-destructive',
}

export function SyncStepLog({ steps }: Props) {
  if (steps.length === 0) return null

  const hasError = steps.some(s => s.status === 'error')

  return (
    <details
      open={hasError}
      className="rounded-xl border border-terra-surface-container-highest bg-terra-surface-container-low"
    >
      <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold text-terra-outline uppercase tracking-wide">
        Sync log
      </summary>
      <div className="overflow-x-auto">
        <ul className="font-mono text-[11px] leading-relaxed px-3 pb-3 space-y-1 min-w-0">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 min-w-0">
              <span className={`shrink-0 mt-px ${STATUS_COLOR[step.status]}`}>
                {STATUS_DOT[step.status]}
              </span>
              <span className="shrink-0 text-terra-on-surface font-medium">{step.label}</span>
              {step.detail && (
                <span className="text-terra-outline break-all">{step.detail}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}

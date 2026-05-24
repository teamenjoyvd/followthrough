'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { undoAction } from '@/lib/actions/action-log'

export interface ActionToastOptions {
  actionLabel: string
  logId: string
  undoWindowSeconds: number
}

/**
 * Call this after every undoable action completes successfully.
 * Renders an inline toast with a countdown progress bar and an Undo button.
 * Duration = undoWindowSeconds * 1000 + 300ms buffer.
 */
export function useActionToast() {
  const router = useRouter()

  const show = React.useCallback(
    ({ actionLabel, logId, undoWindowSeconds }: ActionToastOptions) => {
      const duration = undoWindowSeconds * 1000 + 300

      toast(
        (t) => (
          <ActionToastContent
            toastId={t}
            actionLabel={actionLabel}
            logId={logId}
            undoWindowSeconds={undoWindowSeconds}
            onUndo={() => {
              toast.dismiss(t)
              router.refresh()
            }}
          />
        ),
        {
          duration,
          unstyled: false,
          // prevent accidental swipe-dismiss during undo window
        }
      )
    },
    [router]
  )

  return show
}

interface ContentProps {
  toastId: string | number
  actionLabel: string
  logId: string
  undoWindowSeconds: number
  onUndo: () => void
}

function ActionToastContent({
  toastId,
  actionLabel,
  logId,
  undoWindowSeconds,
  onUndo,
}: ContentProps) {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'undone' | 'error'>('idle')
  const [elapsed, setElapsed] = React.useState(0)
  const startRef = React.useRef(Date.now())

  // Countdown bar
  React.useEffect(() => {
    const total = undoWindowSeconds * 1000
    const interval = setInterval(() => {
      const diff = Date.now() - startRef.current
      setElapsed(Math.min(diff / total, 1))
      if (diff >= total) clearInterval(interval)
    }, 50)
    return () => clearInterval(interval)
  }, [undoWindowSeconds])

  const handleUndo = async () => {
    if (status !== 'idle') return
    setStatus('loading')
    try {
      const res = await undoAction(logId)
      if ('error' in res) {
        setStatus('error')
        setTimeout(() => toast.dismiss(toastId), 2500)
      } else {
        setStatus('undone')
        onUndo()
      }
    } catch {
      setStatus('error')
      setTimeout(() => toast.dismiss(toastId), 2500)
    }
  }

  if (status === 'undone') {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-[#4a7c59]">
        <span>✓ Undone</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-[#b83230]">
        <span>Undo failed</span>
      </div>
    )
  }

  const progressPct = Math.round((1 - elapsed) * 100)

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-[#2e3230]">{actionLabel}</span>
        <button
          onClick={handleUndo}
          disabled={status === 'loading'}
          className="shrink-0 text-xs font-bold text-[#4a7c59] hover:text-[#3d6649] disabled:opacity-50 transition-colors"
        >
          {status === 'loading' ? 'Undoing…' : 'Undo'}
        </button>
      </div>
      {/* countdown bar */}
      <div className="h-0.5 w-full bg-[#e4e0d8] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4a7c59] rounded-full transition-all ease-linear"
          style={{ width: `${progressPct}%`, transitionDuration: '50ms' }}
        />
      </div>
    </div>
  )
}

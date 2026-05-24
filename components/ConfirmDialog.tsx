'use client'

import * as React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  onConfirm: () => void | Promise<void>
  children: React.ReactNode
}

/**
 * Generic confirm gate backed by shadcn AlertDialog.
 * Wrap any trigger element as `children`. The trigger renders as-is;
 * do NOT replace the button — just wrap it.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  destructive = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (err: any) {
      setError(err?.message ?? 'An error occurred')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        setOpen(next)
        if (!next) setError(null)
      }}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#2e3230]">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-[#4a4e4a]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="text-xs text-[#b83230] bg-[#ffdad8]/50 border border-[#b83230]/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60',
              destructive
                ? 'bg-[#b83230] hover:bg-[#a62a28] text-white'
                : 'bg-terra-primary hover:opacity-90 text-white'
            )}
          >
            {isPending ? 'Please wait…' : confirmLabel}
          </AlertDialogAction>
          <AlertDialogCancel
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-[#eae6de] text-[#4a4e4a] hover:bg-[#dedad2] text-sm font-semibold border-none transition-colors disabled:opacity-60"
          >
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteContact } from '@/lib/actions/contacts'
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

interface Props {
  contactId: string
  contactName: string
}

export default function DeleteContactButton({ contactId, contactName }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const res = await deleteContact(contactId)
      if (res && 'error' in res) {
        setError(typeof res.error === 'string' ? res.error : 'An unexpected error occurred')
        // Keep dialog open on error — do not call setOpen(false)
      }
      // On success, revalidatePath in the action triggers navigation away;
      // no need to explicitly close.
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => {
      // Prevent closing while deletion is in flight
      if (isPending) return
      setOpen(next)
      if (!next) setError(null)
    }}>
      <AlertDialogTrigger asChild>
        <button
          id={`delete-contact-btn-${contactId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-[#b83230] border border-[#b83230]/20 bg-[#ffdad8]/20 hover:bg-[#ffdad8]/50 transition-colors shadow-sm"
          aria-label={`Delete ${contactName}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-[#ffdad8]/50 flex items-center justify-center shrink-0">
              <Trash2 className="h-5 w-5 text-[#b83230]" />
            </div>
            <AlertDialogTitle className="text-[#2e3230]">Delete contact?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-[#4a4e4a]">
            <strong className="text-[#2e3230]">{contactName}</strong> and all associated data
            will be permanently deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="px-0 py-0">
            <p className="text-xs text-[#b83230] bg-[#ffdad8]/50 border border-[#b83230]/20 rounded-xl px-3 py-2">
              {error}
            </p>
          </div>
        )}

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogAction
            id={`delete-confirm-btn-${contactId}`}
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-[#b83230] hover:bg-[#a62a28] text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
          <AlertDialogCancel
            id={`delete-cancel-btn-${contactId}`}
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

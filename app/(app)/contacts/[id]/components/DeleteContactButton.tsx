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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
          aria-label={`Delete ${contactName}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Delete contact?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            <strong className="text-gray-700">{contactName}</strong> and all associated data
            will be permanently deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="px-0 py-0">
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
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
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
          <AlertDialogCancel
            id={`delete-cancel-btn-${contactId}`}
            disabled={isPending}
          >
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

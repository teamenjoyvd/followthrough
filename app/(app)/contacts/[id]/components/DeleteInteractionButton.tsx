'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteInteraction } from '@/lib/actions/interactions'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function DeleteInteractionButton({
  interactionId,
  contactId,
}: {
  interactionId: string
  contactId: string
}) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      await deleteInteraction(interactionId, contactId)
    })
  }

  return (
    <ConfirmDialog
      title="Delete this entry?"
      description="This interaction log will be permanently removed."
      confirmLabel="Delete this entry"
      destructive
      onConfirm={handleDelete}
    >
      <button
        disabled={isPending}
        className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-xl hover:bg-[#ffdad8]/50 text-[#74796e] hover:text-[#b83230] disabled:opacity-50 cursor-pointer"
        aria-label="Delete interaction"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </ConfirmDialog>
  )
}

'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteContact } from '@/lib/actions/contacts'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { toast } from '@/components/ui/toast'

interface Props {
  contactId: string
  contactName: string
}

export default function DeleteContactButton({ contactId, contactName }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteContact(contactId)
      if (res && 'error' in res) {
        toast(res.error, 'error')
      } else {
        toast(`Contact "${contactName}" deleted successfully`)
        router.replace('/contacts')
      }
    })
  }

  return (
    <ConfirmDialog
      title="Delete contact?"
      description={`${contactName} and all associated data will be permanently deleted. This cannot be undone.`}
      confirmLabel="Delete contact"
      destructive
      onConfirm={handleDelete}
    >
      <button
        id={`delete-contact-btn-${contactId}`}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-[#b83230] border border-[#b83230]/20 bg-[#ffdad8]/20 hover:bg-[#ffdad8]/50 transition-colors shadow-sm disabled:opacity-50"
        aria-label={`Delete ${contactName}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{isPending ? 'Deleting…' : 'Delete'}</span>
      </button>
    </ConfirmDialog>
  )
}

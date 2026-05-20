'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteContact } from '@/lib/actions/contacts'

interface Props {
  contactId: string
  contactName: string
}

export default function DeleteContactButton({ contactId, contactName }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteContact(contactId)
    })
  }

  return (
    <>
      <button
        id="delete-contact-btn"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
        aria-label={`Delete ${contactName}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Delete</span>
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 id="delete-dialog-title" className="text-base font-semibold text-gray-900">
                  Delete contact?
                </h2>
              </div>
            </div>
            <p id="delete-dialog-desc" className="text-sm text-gray-500 mb-6">
              <strong className="text-gray-700">{contactName}</strong> and all associated data will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                id="delete-confirm-btn"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {isPending ? 'Deleting…' : 'Delete'}
              </button>
              <button
                id="delete-cancel-btn"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

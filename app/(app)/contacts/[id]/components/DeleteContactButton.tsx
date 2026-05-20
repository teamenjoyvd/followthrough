'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteContact } from '@/lib/actions/contacts'

interface Props {
  contactId: string
  contactName: string
}

export default function DeleteContactButton({ contactId, contactName }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)
  const cancelBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!showConfirm) return

    setError(null)
    const activeElementBeforeOpen = document.activeElement as HTMLElement

    // Auto-focus the cancel button initially to prevent accidental deletion
    cancelBtnRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowConfirm(false)
        activeElementBeforeOpen?.focus()
      } else if (e.key === 'Tab') {
        // Simple focus trap: cycle focus between Cancel and Delete
        if (e.shiftKey) {
          // Shift + Tab: if on Delete (first), wrap to Cancel (last)
          if (document.activeElement === confirmBtnRef.current) {
            e.preventDefault()
            cancelBtnRef.current?.focus()
          }
        } else {
          // Tab: if on Cancel (last), wrap to Delete (first)
          if (document.activeElement === cancelBtnRef.current) {
            e.preventDefault()
            confirmBtnRef.current?.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      // Restore focus to trigger when closing
      activeElementBeforeOpen?.focus()
    }
  }, [showConfirm])

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      try {
        const res = await deleteContact(contactId)
        if (res && 'error' in res) {
          setError(res.error as string)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to delete contact')
      }
    })
  }

  return (
    <>
      <button
        ref={triggerRef}
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
            onClick={() => {
              if (!isPending) setShowConfirm(false)
            }}
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
            
            <p id="delete-dialog-desc" className="text-sm text-gray-500 mb-4">
              <strong className="text-gray-700">{contactName}</strong> and all associated data will be permanently deleted. This cannot be undone.
            </p>

            {error && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                ref={confirmBtnRef}
                id="delete-confirm-btn"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {isPending ? 'Deleting…' : 'Delete'}
              </button>
              <button
                ref={cancelBtnRef}
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

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateContact } from '@/lib/actions/contacts'
import type { Database } from '@/types/supabase'

type ContactRow = Database['public']['Tables']['contacts']['Row']

interface Props {
  contact: ContactRow
}

export default function EditContactForm({ contact }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const res = await updateContact(contact.id, formData)
        if (res && 'error' in res) {
          setError(res.error)
        } else {
          router.push(`/contacts/${contact.id}`)
          router.refresh()
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred')
      }
    })
  }

  return (
    <div className="max-w-lg mx-auto">
      {error && (
        <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} id="edit-contact-form" className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              disabled={isPending}
              autoFocus
              autoComplete="given-name"
              defaultValue={contact.first_name}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Last name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              disabled={isPending}
              autoComplete="family-name"
              defaultValue={contact.last_name ?? ''}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            disabled={isPending}
            autoComplete="email"
            defaultValue={contact.email ?? ''}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            id="company"
            name="company"
            type="text"
            disabled={isPending}
            autoComplete="organization"
            defaultValue={contact.company ?? ''}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div>
          <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
            Job title
          </label>
          <input
            id="job_title"
            name="job_title"
            type="text"
            disabled={isPending}
            autoComplete="organization-title"
            defaultValue={contact.job_title ?? ''}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div className="pt-2 flex gap-3">
          <button
            id="edit-contact-submit"
            type="submit"
            disabled={isPending}
            className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
          <Link
            href={`/contacts/${contact.id}`}
            className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium text-center hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

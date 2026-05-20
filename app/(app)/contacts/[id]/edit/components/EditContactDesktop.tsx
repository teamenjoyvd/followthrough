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

export default function EditContactDesktop({ contact }: Props) {
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
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred')
      }
    })
  }

  return (
    <div className="hidden md:flex h-full">
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit details</h2>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="edit-contact-form-desktop" className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label htmlFor="ec-desktop-first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  id="ec-desktop-first_name"
                  name="first_name"
                  type="text"
                  required
                  disabled={isPending}
                  autoComplete="given-name"
                  defaultValue={contact.first_name}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              <div>
                <label htmlFor="ec-desktop-last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last name
                </label>
                <input
                  id="ec-desktop-last_name"
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
              <label htmlFor="ec-desktop-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="ec-desktop-email"
                name="email"
                type="email"
                disabled={isPending}
                autoComplete="email"
                defaultValue={contact.email ?? ''}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="ec-desktop-company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                id="ec-desktop-company"
                name="company"
                type="text"
                disabled={isPending}
                autoComplete="organization"
                defaultValue={contact.company ?? ''}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="ec-desktop-job_title" className="block text-sm font-medium text-gray-700 mb-1">
                Job title
              </label>
              <input
                id="ec-desktop-job_title"
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
                id="ec-desktop-submit"
                type="submit"
                disabled={isPending}
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {isPending ? 'Saving…' : 'Save changes'}
              </button>
              <Link
                href={`/contacts/${contact.id}`}
                className="px-6 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

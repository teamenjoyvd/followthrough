'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createContact } from '@/lib/actions/contacts'

export default function NewContactMobile() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const res = await createContact(formData)
        if ('error' in res) {
          setError(res.error)
        } else if (res.success) {
          router.push(`/contacts/${res.id}`)
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred')
      }
    })
  }

  return (
    <div className="md:hidden flex-1 overflow-y-auto px-4 py-6">
      {error && (
        <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} id="new-contact-form-mobile" className="space-y-4">
        <div>
          <label htmlFor="nc-mobile-first_name" className="block text-sm font-medium text-gray-700 mb-1">
            First name <span className="text-red-500">*</span>
          </label>
          <input
            id="nc-mobile-first_name"
            name="first_name"
            type="text"
            required
            autoFocus
            disabled={isPending}
            autoComplete="given-name"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Jane"
          />
        </div>

        <div>
          <label htmlFor="nc-mobile-last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Last name
          </label>
          <input
            id="nc-mobile-last_name"
            name="last_name"
            type="text"
            disabled={isPending}
            autoComplete="family-name"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Smith"
          />
        </div>

        <div>
          <label htmlFor="nc-mobile-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="nc-mobile-email"
            name="email"
            type="email"
            disabled={isPending}
            autoComplete="email"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="jane@example.com"
          />
        </div>

        <div>
          <label htmlFor="nc-mobile-company" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            id="nc-mobile-company"
            name="company"
            type="text"
            disabled={isPending}
            autoComplete="organization"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <label htmlFor="nc-mobile-job_title" className="block text-sm font-medium text-gray-700 mb-1">
            Job title
          </label>
          <input
            id="nc-mobile-job_title"
            name="job_title"
            type="text"
            disabled={isPending}
            autoComplete="organization-title"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Head of Partnerships"
          />
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <button
            id="nc-mobile-submit"
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Creating…' : 'Create contact'}
          </button>
          <Link
            href="/contacts"
            className="w-full py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium text-center hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

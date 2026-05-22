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
    <div className="md:hidden flex-1 overflow-y-auto px-4 py-6 bg-[#faf6f0]">
      {error && (
        <div className="mb-5 p-4 rounded-xl bg-[#ffdad8]/50 border border-[#b83230]/20 text-sm text-[#b83230] font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} id="new-contact-form-mobile" className="space-y-4">
        <div>
          <label htmlFor="nc-mobile-first_name" className="block text-sm font-medium text-[#2e3230] mb-1">
            First name <span className="text-[#b83230]">*</span>
          </label>
          <input
            id="nc-mobile-first_name"
            name="first_name"
            type="text"
            required
            disabled={isPending}
            autoComplete="given-name"
            className="w-full px-3 py-2.5 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
            placeholder="Jane"
          />
        </div>

        <div>
          <label htmlFor="nc-mobile-last_name" className="block text-sm font-medium text-[#2e3230] mb-1">Last name</label>
          <input
            id="nc-mobile-last_name"
            name="last_name"
            type="text"
            disabled={isPending}
            autoComplete="family-name"
            className="w-full px-3 py-2.5 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
            placeholder="Smith"
          />
        </div>

        <div>
          <label htmlFor="nc-mobile-email" className="block text-sm font-medium text-[#2e3230] mb-1">Email</label>
          <input
            id="nc-mobile-email"
            name="email"
            type="email"
            disabled={isPending}
            autoComplete="email"
            className="w-full px-3 py-2.5 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
            placeholder="jane@example.com"
          />
        </div>

        <div>
          <label htmlFor="nc-mobile-company" className="block text-sm font-medium text-[#2e3230] mb-1">Company</label>
          <input
            id="nc-mobile-company"
            name="company"
            type="text"
            disabled={isPending}
            autoComplete="organization"
            className="w-full px-3 py-2.5 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <label htmlFor="nc-mobile-job_title" className="block text-sm font-medium text-[#2e3230] mb-1">Job title</label>
          <input
            id="nc-mobile-job_title"
            name="job_title"
            type="text"
            disabled={isPending}
            autoComplete="organization-title"
            className="w-full px-3 py-2.5 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
            placeholder="Head of Partnerships"
          />
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <button
            id="nc-mobile-submit"
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3d6b4a] disabled:opacity-60 transition-colors shadow-sm"
          >
            {isPending ? 'Creating…' : 'Create contact'}
          </button>
          <Link
            href="/contacts"
            className="w-full py-2.5 rounded-xl bg-[#eae6de] text-[#4a4e4a] text-sm font-semibold text-center hover:bg-[#dedad2] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

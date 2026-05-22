'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createContact } from '@/lib/actions/contacts'

export default function NewContactDesktop() {
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
    <div className="hidden md:flex h-full bg-[#faf6f0]">
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-[#2e3230] mb-6">Contact details</h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#ffdad8]/50 border border-[#b83230]/20 text-sm text-[#b83230] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="new-contact-form-desktop" className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label htmlFor="nc-desktop-first_name" className="block text-sm font-medium text-[#2e3230] mb-1">
                  First name <span className="text-[#b83230]">*</span>
                </label>
                <input
                  id="nc-desktop-first_name"
                  name="first_name"
                  type="text"
                  required
                  disabled={isPending}
                  autoComplete="given-name"
                  className="w-full px-3 py-2 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label htmlFor="nc-desktop-last_name" className="block text-sm font-medium text-[#2e3230] mb-1">
                  Last name
                </label>
                <input
                  id="nc-desktop-last_name"
                  name="last_name"
                  type="text"
                  disabled={isPending}
                  autoComplete="family-name"
                  className="w-full px-3 py-2 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
                  placeholder="Smith"
                />
              </div>
            </div>

            <div>
              <label htmlFor="nc-desktop-email" className="block text-sm font-medium text-[#2e3230] mb-1">Email</label>
              <input
                id="nc-desktop-email"
                name="email"
                type="email"
                disabled={isPending}
                autoComplete="email"
                className="w-full px-3 py-2 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label htmlFor="nc-desktop-company" className="block text-sm font-medium text-[#2e3230] mb-1">Company</label>
              <input
                id="nc-desktop-company"
                name="company"
                type="text"
                disabled={isPending}
                autoComplete="organization"
                className="w-full px-3 py-2 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label htmlFor="nc-desktop-job_title" className="block text-sm font-medium text-[#2e3230] mb-1">Job title</label>
              <input
                id="nc-desktop-job_title"
                name="job_title"
                type="text"
                disabled={isPending}
                autoComplete="organization-title"
                className="w-full px-3 py-2 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
                placeholder="Head of Partnerships"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                id="nc-desktop-submit"
                type="submit"
                disabled={isPending}
                className="px-6 py-2 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3d6b4a] disabled:opacity-60 transition-colors shadow-sm"
              >
                {isPending ? 'Creating…' : 'Create contact'}
              </button>
              <Link
                href="/contacts"
                className="px-6 py-2 rounded-xl bg-[#eae6de] text-[#4a4e4a] text-sm font-semibold hover:bg-[#dedad2] transition-colors"
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

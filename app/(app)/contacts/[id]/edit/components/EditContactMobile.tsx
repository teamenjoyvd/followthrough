'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateContact } from '@/lib/actions/contacts'
import type { ContactDetail } from '@/lib/contacts-data'

interface Props {
  contact: ContactDetail
}

export default function EditContactMobile({ contact }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const primaryPhone = contact.phoneNumbers.find(p => p.is_primary)?.number ?? contact.phoneNumbers[0]?.number ?? ''

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
    <div className="md:hidden flex-1 overflow-y-auto px-4 py-6 bg-[#faf6f0]">
      {error && (
        <div className="mb-5 p-4 rounded-xl bg-[#ffdad8]/50 border border-[#b83230]/20 text-sm text-[#b83230] font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} id="edit-contact-form-mobile" className="space-y-4">
        <div>
          <label htmlFor="ec-mobile-first_name" className="block text-sm font-medium text-[#2e3230] mb-1">
            First name <span className="text-[#b83230]">*</span>
          </label>
          <input
            id="ec-mobile-first_name"
            name="first_name"
            type="text"
            required
            disabled={isPending}
            autoComplete="given-name"
            defaultValue={contact.first_name}
            className="w-full px-3 py-2.5 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="ec-mobile-last_name" className="block text-sm font-medium text-[#2e3230] mb-1">Last name</label>
          <input
            id="ec-mobile-last_name"
            name="last_name"
            type="text"
            disabled={isPending}
            autoComplete="family-name"
            defaultValue={contact.last_name ?? ''}
            className="w-full px-3 py-2.5 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="ec-mobile-phone" className="block text-sm font-medium text-[#2e3230] mb-1">Phone number</label>
          <input
            id="ec-mobile-phone"
            name="phone"
            type="tel"
            disabled={isPending}
            autoComplete="tel"
            defaultValue={primaryPhone}
            className="w-full px-3 py-2.5 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
            placeholder="+1 (555) 019-2834"
          />
        </div>

        <div>
          <label htmlFor="ec-mobile-email" className="block text-sm font-medium text-[#2e3230] mb-1">Email</label>
          <input
            id="ec-mobile-email"
            name="email"
            type="email"
            disabled={isPending}
            autoComplete="email"
            defaultValue={contact.email ?? ''}
            className="w-full px-3 py-2.5 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="ec-mobile-company" className="block text-sm font-medium text-[#2e3230] mb-1">Company</label>
          <input
            id="ec-mobile-company"
            name="company"
            type="text"
            disabled={isPending}
            autoComplete="organization"
            defaultValue={contact.company ?? ''}
            className="w-full px-3 py-2.5 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="ec-mobile-job_title" className="block text-sm font-medium text-[#2e3230] mb-1">Job title</label>
          <input
            id="ec-mobile-job_title"
            name="job_title"
            type="text"
            disabled={isPending}
            autoComplete="organization-title"
            defaultValue={contact.job_title ?? ''}
            className="w-full px-3 py-2.5 text-sm border border-[#e4e0d8] rounded-xl bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-60"
          />
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <button
            id="ec-mobile-submit"
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3d6b4a] disabled:opacity-60 transition-colors shadow-sm"
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
          <Link
            href={`/contacts/${contact.id}`}
            className="w-full py-2.5 rounded-xl bg-[#eae6de] text-[#4a4e4a] text-sm font-semibold text-center hover:bg-[#dedad2] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

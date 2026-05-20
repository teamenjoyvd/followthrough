import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateContact } from '@/lib/actions/contacts'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await (supabase as any).from('contacts').select('first_name, last_name').eq('id', id).maybeSingle() as { data: { first_name: string; last_name: string | null } | null }
  if (!data) return { title: 'Edit Contact — Followthrough' }
  return {
    title: `Edit ${data.first_name} ${data.last_name ?? ''} — Followthrough`.trim(),
  }
}

export default async function EditContactPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // Resolve profile
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle() as { data: { id: string } | null }

  if (!profile) redirect('/sign-in')

  // Fetch contact
  const { data: contact } = await (supabase as any)
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('profile_id', profile.id)
    .maybeSingle() as { data: import('@/types/supabase').Database['public']['Tables']['contacts']['Row'] | null }

  if (!contact) notFound()

  const action = updateContact.bind(null, contact.id)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-gray-200 bg-white">
        <Link
          href={`/contacts/${contact.id}`}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Back to contact"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">
          Edit {contact.first_name} {contact.last_name}
        </h1>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="max-w-lg mx-auto">
          <form action={action} id="edit-contact-form" className="space-y-5">
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
                  autoFocus
                  autoComplete="given-name"
                  defaultValue={contact.first_name}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  autoComplete="family-name"
                  defaultValue={contact.last_name ?? ''}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                autoComplete="email"
                defaultValue={contact.email ?? ''}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                autoComplete="organization"
                defaultValue={contact.company ?? ''}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                autoComplete="organization-title"
                defaultValue={contact.job_title ?? ''}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                id="edit-contact-submit"
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Save changes
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
      </div>
    </div>
  )
}

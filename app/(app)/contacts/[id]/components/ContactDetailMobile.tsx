import Link from 'next/link'
import { Pencil, Mail } from 'lucide-react'
import { PipelineStatusControl } from '../../components/PipelineStatusControl'
import type { Database } from '@/types/supabase'

type Contact = Database['public']['Tables']['contacts']['Row']

interface Props {
  contact: Contact
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function initials(c: Contact) {
  return [c.first_name[0], c.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()
}

export default function ContactDetailMobile({ contact }: Props) {
  return (
    <div className="md:hidden flex flex-col h-full overflow-y-auto">
      {/* Hero */}
      <div className="flex flex-col items-center py-8 px-4 bg-white border-b border-gray-100">
        <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold mb-3">
          {initials(contact)}
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center">
          {contact.first_name} {contact.last_name}
        </h2>
        {(contact.job_title || contact.company) && (
          <p className="mt-1 text-sm text-gray-500 text-center">
            {[contact.job_title, contact.company].filter(Boolean).join(' at ')}
          </p>
        )}

        {/* Quick actions */}
        <div className="mt-4 flex gap-3">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              id="email-contact-mobile"
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="text-[10px] font-medium">Email</span>
            </a>
          )}
          <Link
            href={`/contacts/${contact.id}/edit`}
            id="edit-contact-mobile"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            <span className="text-[10px] font-medium">Edit</span>
          </Link>
        </div>
      </div>

      {/* Pipeline status */}
      <div className="px-4 py-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pipeline status</p>
        <PipelineStatusControl contact={contact} />
      </div>

      {/* Details */}
      <div className="px-4 py-4 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact details</p>
        {[
          { label: 'Email', value: contact.email },
          { label: 'Company', value: contact.company },
          { label: 'Job title', value: contact.job_title },
          { label: 'Last contacted', value: formatDate(contact.last_contacted_at) },
          { label: 'Added', value: formatDate(contact.created_at) },
        ].map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-gray-400">{label}</dt>
            <dd className="mt-0.5 text-sm text-gray-800">{value || <span className="text-gray-300">—</span>}</dd>
          </div>
        ))}
      </div>
    </div>
  )
}

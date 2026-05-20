import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { PipelineStatusControl, PIPELINE_STATUSES } from '../../components/PipelineStatusControl'
import type { Database } from '@/types/supabase'

type Contact = Database['public']['Tables']['contacts']['Row']

interface Props {
  contact: Contact
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-gray-800">{value || <span className="text-gray-300">—</span>}</dd>
    </div>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ContactDetailDesktop({ contact }: Props) {
  const currentStatus = PIPELINE_STATUSES.find(s => s.value === contact.pipeline_status)

  return (
    <div className="hidden md:flex h-full">
      {/* Main panel */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        {/* Name + edit */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {contact.first_name} {contact.last_name}
            </h2>
            {(contact.job_title || contact.company) && (
              <p className="mt-1 text-sm text-gray-500">
                {[contact.job_title, contact.company].filter(Boolean).join(' at ')}
              </p>
            )}
          </div>
          <Link
            href={`/contacts/${contact.id}/edit`}
            id="edit-contact-desktop"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>

        {/* Pipeline status */}
        <div className="mb-8 p-4 rounded-xl border border-gray-100 bg-gray-50">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pipeline status</span>
            {currentStatus && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            )}
          </div>
          <PipelineStatusControl contact={contact} />
        </div>

        {/* Contact details */}
        <div className="p-4 rounded-xl border border-gray-100 bg-white">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Contact details</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoRow label="First name" value={contact.first_name} />
            <InfoRow label="Last name" value={contact.last_name} />
            <InfoRow label="Email" value={contact.email} />
            <InfoRow label="Company" value={contact.company} />
            <InfoRow label="Job title" value={contact.job_title} />
            <InfoRow label="Last contacted" value={formatDate(contact.last_contacted_at)} />
            <InfoRow label="Added" value={formatDate(contact.created_at)} />
          </dl>
        </div>
      </div>
    </div>
  )
}

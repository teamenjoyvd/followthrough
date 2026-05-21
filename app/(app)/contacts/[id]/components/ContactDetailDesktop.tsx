'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Pencil, Phone, Plus, Star, Trash2, Globe } from 'lucide-react'
import { PipelineStatusControl, PIPELINE_STATUSES } from '../../components/PipelineStatusControl'
import type { Database } from '@/types/supabase'
import type { ContactDetail } from '@/lib/contacts-data'
import {
  addPhoneNumber,
  updatePhoneNumber,
  deletePhoneNumber,
  setPrimary,
} from '@/lib/actions/phone-numbers'
import { addSocialLink, updateSocialLink, deleteSocialLink } from '@/lib/actions/social-links'

type PhoneType = Database['public']['Enums']['phone_type']
type SocialPlatform = Database['public']['Enums']['social_platform']
type PhoneRow = Database['public']['Tables']['phone_numbers']['Row']
type SocialRow = Database['public']['Tables']['social_links']['Row']

interface Props {
  contact: ContactDetail
  profileId: string
}

const PHONE_TYPES: PhoneType[] = ['mobile', 'work', 'home']
const PLATFORMS: SocialPlatform[] = ['linkedin', 'twitter', 'instagram', 'other']

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

// ---------------------------------------------------------------------------
// Phone numbers section
// ---------------------------------------------------------------------------

function PhoneNumbersSection({
  phones,
  contactId,
  profileId,
}: {
  phones: PhoneRow[]
  contactId: string
  profileId: string
}) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newNumber, setNewNumber] = useState('')
  const [newType, setNewType] = useState<PhoneType>('mobile')
  const [newPrimary, setNewPrimary] = useState(phones.length === 0)
  const [editNumber, setEditNumber] = useState('')
  const [editType, setEditType] = useState<PhoneType>('mobile')
  const [isPending, startTransition] = useTransition()

  const startEdit = (p: PhoneRow) => {
    setEditingId(p.id)
    setEditNumber(p.number)
    setEditType(p.type)
  }

  const handleAdd = () => {
    if (!newNumber.trim()) return
    startTransition(async () => {
      await addPhoneNumber(contactId, profileId, newNumber, newType, newPrimary)
      setAdding(false)
      setNewNumber('')
      setNewType('mobile')
      setNewPrimary(false)
    })
  }

  const handleUpdate = (phoneId: string) => {
    if (!editNumber.trim()) return
    startTransition(async () => {
      await updatePhoneNumber(phoneId, contactId, editNumber, editType)
      setEditingId(null)
    })
  }

  const handleDelete = (phoneId: string) => {
    startTransition(async () => {
      await deletePhoneNumber(phoneId, contactId)
    })
  }

  const handleSetPrimary = (phoneId: string) => {
    startTransition(async () => {
      await setPrimary(phoneId, contactId, profileId)
    })
  }

  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" />
          Phone numbers
        </h3>
        <button
          id="add-phone-desktop"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
          disabled={isPending}
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {phones.map((p) =>
          editingId === p.id ? (
            <li key={p.id} className="flex items-center gap-2">
              <input
                id={`edit-phone-number-${p.id}`}
                value={editNumber}
                onChange={(e) => setEditNumber(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Phone number"
              />
              <select
                id={`edit-phone-type-${p.id}`}
                value={editType}
                onChange={(e) => setEditType(e.target.value as PhoneType)}
                className="text-xs border border-gray-200 rounded-md px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                {PHONE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleUpdate(p.id)}
                disabled={isPending}
                className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </li>
          ) : (
            <li key={p.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-800">{p.number}</span>
                <span className="text-xs text-gray-400 capitalize">{p.type}</span>
                {p.is_primary && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!p.is_primary && (
                  <button
                    id={`set-primary-phone-${p.id}`}
                    onClick={() => handleSetPrimary(p.id)}
                    disabled={isPending}
                    title="Set as primary"
                    className="p-1 text-gray-300 hover:text-amber-500 transition-colors"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  id={`edit-phone-${p.id}`}
                  onClick={() => startEdit(p)}
                  className="p-1 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  id={`delete-phone-${p.id}`}
                  onClick={() => handleDelete(p.id)}
                  disabled={isPending}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      {phones.length === 0 && !adding && (
        <p className="text-xs text-gray-300 mt-1">No phone numbers yet</p>
      )}

      {adding && (
        <div className="mt-2 flex items-center gap-2 pt-2 border-t border-gray-50">
          <input
            id="new-phone-number"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Phone number"
            autoFocus
          />
          <select
            id="new-phone-type"
            value={newType}
            onChange={(e) => setNewType(e.target.value as PhoneType)}
            className="text-xs border border-gray-200 rounded-md px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            {PHONE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={newPrimary}
              onChange={(e) => setNewPrimary(e.target.checked)}
              className="rounded"
            />
            Primary
          </label>
          <button
            id="save-new-phone"
            onClick={handleAdd}
            disabled={isPending || !newNumber.trim()}
            className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button onClick={() => { setAdding(false); setNewNumber('') }} className="text-xs text-gray-400 hover:text-gray-600">
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Social links section
// ---------------------------------------------------------------------------

function SocialLinksSection({
  links,
  contactId,
  profileId,
}: {
  links: SocialRow[]
  contactId: string
  profileId: string
}) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('linkedin')
  const [newUrl, setNewUrl] = useState('')
  const [editPlatform, setEditPlatform] = useState<SocialPlatform>('linkedin')
  const [editUrl, setEditUrl] = useState('')
  const [isPending, startTransition] = useTransition()

  const startEdit = (l: SocialRow) => {
    setEditingId(l.id)
    setEditPlatform(l.platform)
    setEditUrl(l.url)
  }

  const handleAdd = () => {
    if (!newUrl.trim()) return
    startTransition(async () => {
      await addSocialLink(contactId, profileId, newPlatform, newUrl)
      setAdding(false)
      setNewUrl('')
      setNewPlatform('linkedin')
    })
  }

  const handleUpdate = (linkId: string) => {
    if (!editUrl.trim()) return
    startTransition(async () => {
      await updateSocialLink(linkId, contactId, editPlatform, editUrl)
      setEditingId(null)
    })
  }

  const handleDelete = (linkId: string) => {
    startTransition(async () => {
      await deleteSocialLink(linkId, contactId)
    })
  }

  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          Social links
        </h3>
        <button
          id="add-social-desktop"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
          disabled={isPending}
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {links.map((l) =>
          editingId === l.id ? (
            <li key={l.id} className="flex items-center gap-2">
              <select
                id={`edit-social-platform-${l.id}`}
                value={editPlatform}
                onChange={(e) => setEditPlatform(e.target.value as SocialPlatform)}
                className="text-xs border border-gray-200 rounded-md px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
              <input
                id={`edit-social-url-${l.id}`}
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="URL"
              />
              <button
                onClick={() => handleUpdate(l.id)}
                disabled={isPending}
                className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Save
              </button>
              <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-gray-600">
                Cancel
              </button>
            </li>
          ) : (
            <li key={l.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-gray-400 capitalize shrink-0">{l.platform}</span>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline truncate"
                >
                  {l.url}
                </a>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  id={`edit-social-${l.id}`}
                  onClick={() => startEdit(l)}
                  className="p-1 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  id={`delete-social-${l.id}`}
                  onClick={() => handleDelete(l.id)}
                  disabled={isPending}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      {links.length === 0 && !adding && (
        <p className="text-xs text-gray-300 mt-1">No social links yet</p>
      )}

      {adding && (
        <div className="mt-2 flex items-center gap-2 pt-2 border-t border-gray-50">
          <select
            id="new-social-platform"
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
            className="text-xs border border-gray-200 rounded-md px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
          <input
            id="new-social-url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="https://..."
            autoFocus
          />
          <button
            id="save-new-social"
            onClick={handleAdd}
            disabled={isPending || !newUrl.trim()}
            className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button onClick={() => { setAdding(false); setNewUrl('') }} className="text-xs text-gray-400 hover:text-gray-600">
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ContactDetailDesktop({ contact, profileId }: Props) {
  const currentStatus = PIPELINE_STATUSES.find((s) => s.value === contact.pipeline_status)

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
        <div className="mb-6 p-4 rounded-xl border border-gray-100 bg-white">
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

        {/* Phone numbers */}
        <div className="mb-6">
          <PhoneNumbersSection
            phones={contact.phoneNumbers}
            contactId={contact.id}
            profileId={profileId}
          />
        </div>

        {/* Social links */}
        <SocialLinksSection
          links={contact.socialLinks}
          contactId={contact.id}
          profileId={profileId}
        />
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Pencil, Mail, Phone, Globe, Plus, Star, Trash2 } from 'lucide-react'
import { PipelineStatusControl } from '../../components/PipelineStatusControl'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
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

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function initials(c: ContactDetail) {
  return [c.first_name[0], c.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()
}

// ---------------------------------------------------------------------------
// Phone numbers section (mobile)
// ---------------------------------------------------------------------------

function PhoneNumbersMobile({
  phones,
  contactId,
  profileId,
}: {
  phones: PhoneRow[]
  contactId: string
  profileId: string
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PhoneRow | null>(null)
  const [newNumber, setNewNumber] = useState('')
  const [newType, setNewType] = useState<PhoneType>('mobile')
  const [newPrimary, setNewPrimary] = useState(phones.length === 0)
  const [editNumber, setEditNumber] = useState('')
  const [editType, setEditType] = useState<PhoneType>('mobile')
  const [isPending, startTransition] = useTransition()

  const handleAdd = () => {
    if (!newNumber.trim()) return
    startTransition(async () => {
      await addPhoneNumber(contactId, profileId, newNumber, newType, newPrimary)
      setAddOpen(false)
      setNewNumber('')
      setNewType('mobile')
      setNewPrimary(false)
    })
  }

  const handleUpdate = () => {
    if (!editTarget || !editNumber.trim()) return
    startTransition(async () => {
      await updatePhoneNumber(editTarget.id, contactId, editNumber, editType)
      setEditTarget(null)
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

  const openEdit = (p: PhoneRow) => {
    setEditTarget(p)
    setEditNumber(p.number)
    setEditType(p.type)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" />
          Phone numbers
        </p>
        {/* Add sheet */}
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetTrigger asChild>
            <button
              id="add-phone-mobile"
              className="inline-flex items-center gap-1 text-xs text-indigo-600"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Add phone number</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3">
              <input
                id="add-phone-number-mobile"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="Phone number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <select
                id="add-phone-type-mobile"
                value={newType}
                onChange={(e) => setNewType(e.target.value as PhoneType)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                {PHONE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPrimary}
                  onChange={(e) => setNewPrimary(e.target.checked)}
                  className="rounded"
                />
                Set as primary
              </label>
              <button
                id="save-phone-mobile"
                onClick={handleAdd}
                disabled={isPending || !newNumber.trim()}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Edit sheet */}
      <Sheet open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Edit phone number</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <input
              id="edit-phone-number-mobile"
              value={editNumber}
              onChange={(e) => setEditNumber(e.target.value)}
              placeholder="Phone number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <select
              id="edit-phone-type-mobile"
              value={editType}
              onChange={(e) => setEditType(e.target.value as PhoneType)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              {PHONE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            <button
              id="save-edit-phone-mobile"
              onClick={handleUpdate}
              disabled={isPending || !editNumber.trim()}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Save changes
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {phones.length === 0 ? (
        <p className="text-sm text-gray-300">No phone numbers yet</p>
      ) : (
        <ul className="space-y-2">
          {phones.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-1">
              <div>
                <span className="text-sm text-gray-800">{p.number}</span>
                <span className="ml-2 text-xs text-gray-400 capitalize">{p.type}</span>
                {p.is_primary && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!p.is_primary && (
                  <button
                    id={`set-primary-mobile-${p.id}`}
                    onClick={() => handleSetPrimary(p.id)}
                    disabled={isPending}
                    className="p-1.5 text-gray-300 hover:text-amber-500 transition-colors"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  id={`edit-phone-mobile-${p.id}`}
                  onClick={() => openEdit(p)}
                  className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  id={`delete-phone-mobile-${p.id}`}
                  onClick={() => handleDelete(p.id)}
                  disabled={isPending}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Social links section (mobile)
// ---------------------------------------------------------------------------

function SocialLinksMobile({
  links,
  contactId,
  profileId,
}: {
  links: SocialRow[]
  contactId: string
  profileId: string
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SocialRow | null>(null)
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('linkedin')
  const [newUrl, setNewUrl] = useState('')
  const [editPlatform, setEditPlatform] = useState<SocialPlatform>('linkedin')
  const [editUrl, setEditUrl] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleAdd = () => {
    if (!newUrl.trim()) return
    startTransition(async () => {
      await addSocialLink(contactId, profileId, newPlatform, newUrl)
      setAddOpen(false)
      setNewUrl('')
      setNewPlatform('linkedin')
    })
  }

  const handleUpdate = () => {
    if (!editTarget || !editUrl.trim()) return
    startTransition(async () => {
      await updateSocialLink(editTarget.id, contactId, editPlatform, editUrl)
      setEditTarget(null)
    })
  }

  const handleDelete = (linkId: string) => {
    startTransition(async () => {
      await deleteSocialLink(linkId, contactId)
    })
  }

  const openEdit = (l: SocialRow) => {
    setEditTarget(l)
    setEditPlatform(l.platform)
    setEditUrl(l.url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          Social links
        </p>
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetTrigger asChild>
            <button id="add-social-mobile" className="inline-flex items-center gap-1 text-xs text-indigo-600">
              <Plus className="h-3 w-3" />
              Add
            </button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Add social link</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3">
              <select
                id="add-social-platform-mobile"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
              <input
                id="add-social-url-mobile"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                id="save-social-mobile"
                onClick={handleAdd}
                disabled={isPending || !newUrl.trim()}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Edit sheet */}
      <Sheet open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Edit social link</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <select
              id="edit-social-platform-mobile"
              value={editPlatform}
              onChange={(e) => setEditPlatform(e.target.value as SocialPlatform)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
            <input
              id="edit-social-url-mobile"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              id="save-edit-social-mobile"
              onClick={handleUpdate}
              disabled={isPending || !editUrl.trim()}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Save changes
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {links.length === 0 ? (
        <p className="text-sm text-gray-300">No social links yet</p>
      ) : (
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.id} className="flex items-center justify-between py-1">
              <div className="min-w-0 mr-2">
                <span className="text-xs text-gray-400 capitalize">{l.platform}</span>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-indigo-600 truncate hover:underline"
                >
                  {l.url}
                </a>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  id={`edit-social-mobile-${l.id}`}
                  onClick={() => openEdit(l)}
                  className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  id={`delete-social-mobile-${l.id}`}
                  onClick={() => handleDelete(l.id)}
                  disabled={isPending}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main mobile component
// ---------------------------------------------------------------------------

export default function ContactDetailMobile({ contact, profileId }: Props) {
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
      <div className="px-4 py-4 space-y-4 border-b border-gray-100">
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

      {/* Phone numbers */}
      <div className="px-4 py-4 border-b border-gray-100">
        <PhoneNumbersMobile
          phones={contact.phoneNumbers}
          contactId={contact.id}
          profileId={profileId}
        />
      </div>

      {/* Social links */}
      <div className="px-4 py-4">
        <SocialLinksMobile
          links={contact.socialLinks}
          contactId={contact.id}
          profileId={profileId}
        />
      </div>
    </div>
  )
}

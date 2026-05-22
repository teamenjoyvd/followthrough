'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Pencil, Mail, Phone, Globe, Plus, Star, Trash2 } from 'lucide-react'
import { PipelineStatusControl } from '../../components/PipelineStatusControl'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Database } from '@/types/supabase'
import type { ContactDetail } from '@/lib/contacts-data'
import {
  addPhoneNumber,
  updatePhoneNumber,
  deletePhoneNumber,
  setPrimary,
} from '@/lib/actions/phone-numbers'
import { addSocialLink, updateSocialLink, deleteSocialLink } from '@/lib/actions/social-links'
import InteractionTimeline from './InteractionTimeline'
import LogInteractionSheet from '@/components/LogInteractionSheet'
import type { ContactDetailProps } from './types'

type PhoneType = Database['public']['Enums']['phone_type']
type SocialPlatform = Database['public']['Enums']['social_platform']
type PhoneRow = Database['public']['Tables']['phone_numbers']['Row']
type SocialRow = Database['public']['Tables']['social_links']['Row']

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
      await addPhoneNumber(contactId, newNumber, newType, newPrimary)
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
      await setPrimary(phoneId, contactId)
    })
  }

  const openEdit = (p: PhoneRow) => {
    setEditTarget(p)
    setEditNumber(p.number)
    setEditType(p.type)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-[#74796e] uppercase tracking-wider flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" />
          Phone numbers
        </p>
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetTrigger asChild>
            <button
              id="add-phone-mobile"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#4a7c59] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[20px] px-6 pb-8 pt-4 bg-[#faf6f0]">
            <SheetHeader>
              <SheetTitle className="text-[#2e3230]">Add phone number</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <input
                id="add-phone-number-mobile"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="Phone number"
                className="w-full border border-[#e4e0d8] rounded-xl px-3 py-2.5 text-sm bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              />
              <select
                id="add-phone-type-mobile"
                value={newType}
                onChange={(e) => setNewType(e.target.value as PhoneType)}
                className="w-full border border-[#e4e0d8] rounded-xl px-3 py-2.5 text-sm bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              >
                {PHONE_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-[#4a4e4a] cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={newPrimary}
                  onChange={(e) => setNewPrimary(e.target.checked)}
                  className="rounded text-[#4a7c59] focus:ring-[#4a7c59]"
                />
                Set as primary
              </label>
              <button
                id="save-phone-mobile"
                onClick={handleAdd}
                disabled={isPending || !newNumber.trim()}
                className="w-full py-3 bg-[#4a7c59] text-white rounded-xl text-sm font-semibold hover:bg-[#3d6b4a] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Save
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Sheet open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <SheetContent side="bottom" className="rounded-t-[20px] px-6 pb-8 pt-4 bg-[#faf6f0]">
          <SheetHeader>
            <SheetTitle className="text-[#2e3230]">Edit phone number</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <input
              id="edit-phone-number-mobile"
              value={editNumber}
              onChange={(e) => setEditNumber(e.target.value)}
              placeholder="Phone number"
              className="w-full border border-[#e4e0d8] rounded-xl px-3 py-2.5 text-sm bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
            />
            <select
              id="edit-phone-type-mobile"
              value={editType}
              onChange={(e) => setEditType(e.target.value as PhoneType)}
              className="w-full border border-[#e4e0d8] rounded-xl px-3 py-2.5 text-sm bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
            >
              {PHONE_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <button
              id="save-edit-phone-mobile"
              onClick={handleUpdate}
              disabled={isPending || !editNumber.trim()}
              className="w-full py-3 bg-[#4a7c59] text-white rounded-xl text-sm font-semibold hover:bg-[#3d6b4a] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Save changes
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {phones.length === 0 ? (
        <p className="text-sm text-[#74796e] italic">No phone numbers yet</p>
      ) : (
        <ul className="space-y-2.5">
          {phones.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-[#eae6de] transition-colors">
              <div>
                <span className="text-sm font-medium text-[#2e3230]">{p.number}</span>
                <span className="ml-2 text-xs text-[#74796e] bg-[#eae6de] px-1.5 py-0.5 rounded capitalize">{p.type}</span>
                {p.is_primary && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-[#4a7c59]/10 text-[#4a7c59] font-bold uppercase tracking-wider">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {!p.is_primary && (
                  <button
                    id={`set-primary-mobile-${p.id}`}
                    onClick={() => handleSetPrimary(p.id)}
                    disabled={isPending}
                    className="p-1.5 text-[#74796e] hover:text-[#c4a66a] transition-colors cursor-pointer"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  id={`edit-phone-mobile-${p.id}`}
                  onClick={() => openEdit(p)}
                  className="p-1.5 text-[#74796e] hover:text-[#2e3230] transition-colors cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  id={`delete-phone-mobile-${p.id}`}
                  onClick={() => handleDelete(p.id)}
                  disabled={isPending}
                  className="p-1.5 text-[#74796e] hover:text-[#b83230] transition-colors cursor-pointer"
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
      await addSocialLink(contactId, newPlatform, newUrl)
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
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-[#74796e] uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          Social links
        </p>
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetTrigger asChild>
            <button id="add-social-mobile" className="inline-flex items-center gap-1 text-xs font-bold text-[#4a7c59] cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[20px] px-6 pb-8 pt-4 bg-[#faf6f0]">
            <SheetHeader>
              <SheetTitle className="text-[#2e3230]">Add social link</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <select
                id="add-social-platform-mobile"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
                className="w-full border border-[#e4e0d8] rounded-xl px-3 py-2.5 text-sm bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
              <input
                id="add-social-url-mobile"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-[#e4e0d8] rounded-xl px-3 py-2.5 text-sm bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              />
              <button
                id="save-social-mobile"
                onClick={handleAdd}
                disabled={isPending || !newUrl.trim()}
                className="w-full py-3 bg-[#4a7c59] text-white rounded-xl text-sm font-semibold hover:bg-[#3d6b4a] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Save
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Sheet open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <SheetContent side="bottom" className="rounded-t-[20px] px-6 pb-8 pt-4 bg-[#faf6f0]">
          <SheetHeader>
            <SheetTitle className="text-[#2e3230]">Edit social link</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <select
              id="edit-social-platform-mobile"
              value={editPlatform}
              onChange={(e) => setEditPlatform(e.target.value as SocialPlatform)}
              className="w-full border border-[#e4e0d8] rounded-xl px-3 py-2.5 text-sm bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <input
              id="edit-social-url-mobile"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-[#e4e0d8] rounded-xl px-3 py-2.5 text-sm bg-[#f5f1ea] text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
            />
            <button
              id="save-edit-social-mobile"
              onClick={handleUpdate}
              disabled={isPending || !editUrl.trim()}
              className="w-full py-3 bg-[#4a7c59] text-white rounded-xl text-sm font-semibold hover:bg-[#3d6b4a] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Save changes
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {links.length === 0 ? (
        <p className="text-sm text-[#74796e] italic">No social links yet</p>
      ) : (
        <ul className="space-y-2.5">
          {links.map((l) => (
            <li key={l.id} className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-[#eae6de] transition-colors">
              <div className="min-w-0 mr-2">
                <span className="text-xs text-[#74796e] bg-[#eae6de] px-1.5 py-0.5 rounded capitalize">{l.platform}</span>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-medium text-[#4a7c59] truncate hover:underline"
                >
                  {l.url}
                </a>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id={`edit-social-mobile-${l.id}`}
                  onClick={() => openEdit(l)}
                  className="p-1.5 text-[#74796e] hover:text-[#2e3230] transition-colors cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  id={`delete-social-mobile-${l.id}`}
                  onClick={() => handleDelete(l.id)}
                  disabled={isPending}
                  className="p-1.5 text-[#74796e] hover:text-[#b83230] transition-colors cursor-pointer"
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
export default function ContactDetailMobile({
  contact,
  interactions,
  profileId,
}: ContactDetailProps) {
  const displayName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')

  return (
    <div className="md:hidden flex flex-col h-full overflow-y-auto bg-[#faf6f0] pb-24">
      {/* Hero card */}
      <div className="flex flex-col items-center py-6 px-4 bg-[#f5f1ea] border-b border-[#e4e0d8] shadow-[0_4px_20px_rgba(46,50,48,0.04)] shrink-0">
        <div className="h-16 w-16 rounded-full bg-[#4a7c59]/10 text-[#4a7c59] flex items-center justify-center text-xl font-bold mb-3">
          {initials(contact)}
        </div>
        <h2 className="text-xl font-bold text-[#2e3230] text-center">
          {displayName}
        </h2>
        {(contact.job_title || contact.company) && (
          <p className="mt-1 text-sm font-medium text-[#74796e] text-center">
            {[contact.job_title, contact.company].filter(Boolean).join(' at ')}
          </p>
        )}

        {/* Quick actions row */}
        <div className="mt-4 flex gap-3">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              id="email-contact-mobile"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#eae6de] border border-[#e4e0d8] text-[#4a4e4a] hover:bg-[#dedad2] transition-colors text-xs font-semibold"
            >
              <Mail className="h-4 w-4 text-[#74796e]" />
              Email
            </a>
          )}
          <Link
            href={`/contacts/${contact.id}/edit`}
            id="edit-contact-mobile"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#eae6de] border border-[#e4e0d8] text-[#4a4e4a] hover:bg-[#dedad2] transition-colors text-xs font-semibold"
          >
            <Pencil className="h-4 w-4 text-[#74796e]" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Content stream */}
      <div className="p-4 space-y-4">
        {/* Pipeline status card */}
        <div className="p-4 bg-[#f5f1ea] rounded-[20px] border border-[#e4e0d8] shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
          <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-2.5">Pipeline status</p>
          <PipelineStatusControl contact={contact} />
        </div>

        {/* Details list card */}
        <div className="p-4 bg-[#f5f1ea] rounded-[20px] border border-[#e4e0d8] shadow-[0_4px_20px_rgba(46,50,48,0.04)] space-y-3.5">
          <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider">Contact details</p>
          <dl className="grid grid-cols-2 gap-y-3.5 gap-x-2">
            {[
              { label: 'Email Address', value: contact.email },
              { label: 'Company Name', value: contact.company },
              { label: 'Job Title', value: contact.job_title },
              { label: 'Last Contacted', value: formatDate(contact.last_contacted_at) },
              { label: 'Added Date', value: formatDate(contact.created_at) },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-[10px] font-semibold text-[#74796e] uppercase tracking-wider">{label}</dt>
                <dd className="text-sm font-medium text-[#2e3230]">{value || <span className="text-[#74796e]">—</span>}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Phone numbers card */}
        <div className="p-4 bg-[#f5f1ea] rounded-[20px] border border-[#e4e0d8] shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
          <PhoneNumbersMobile phones={contact.phoneNumbers} contactId={contact.id} profileId={profileId} />
        </div>

        {/* Social links card */}
        <div className="p-4 bg-[#f5f1ea] rounded-[20px] border border-[#e4e0d8] shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
          <SocialLinksMobile links={contact.socialLinks} contactId={contact.id} profileId={profileId} />
        </div>

        {/* Timeline feed card */}
        <div className="p-4 bg-[#f5f1ea] rounded-[20px] border border-[#e4e0d8] shadow-[0_4px_20px_rgba(46,50,48,0.04)]">
          <p className="text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-4">Interactions Timeline</p>
          <InteractionTimeline interactions={interactions} contactId={contact.id} />
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-4 z-50">
        <LogInteractionSheet
          contactId={contact.id}
          profileId={profileId}
          triggerLabel="+ Log"
          triggerClassName="h-12 px-5 rounded-full shadow-lg bg-[#4a7c59] hover:bg-[#3d6b4a] text-white font-bold text-sm cursor-pointer border-none"
        />
      </div>
    </div>
  )
}

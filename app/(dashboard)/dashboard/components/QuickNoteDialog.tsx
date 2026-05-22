'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Search, User } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import LogInteractionSheet from '@/components/LogInteractionSheet'
import type { Database } from '@/types/supabase'

type Contact = Database['public']['Tables']['contacts']['Row']

interface Props {
  allContacts: Contact[]
  profileId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function QuickNoteDialog({
  allContacts,
  profileId,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedContactId, setSelectedContactId] = React.useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  // Reset states when the dialog opens or closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery('')
      setSelectedContactId(null)
      setIsSheetOpen(false)
    }
  }, [open])

  // Filter contacts by query
  const filteredContacts = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return allContacts

    return allContacts.filter((contact) => {
      const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase()
      const company = (contact.company || '').toLowerCase()
      const jobTitle = (contact.job_title || '').toLowerCase()
      return (
        fullName.includes(q) ||
        company.includes(q) ||
        jobTitle.includes(q)
      )
    })
  }, [allContacts, searchQuery])

  // Partition contacts: Working List first, then other contacts
  const { workingListContacts, otherContacts } = React.useMemo(() => {
    const workingList = filteredContacts
      .filter((c) => c.on_working_list)
      .sort((a, b) => a.first_name.localeCompare(b.first_name))

    const others = filteredContacts
      .filter((c) => !c.on_working_list)
      .sort((a, b) => a.first_name.localeCompare(b.first_name))

    return {
      workingListContacts: workingList,
      otherContacts: others,
    }
  }, [filteredContacts])

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId)
    setIsSheetOpen(true)
  }

  const handleInteractionSuccess = () => {
    setIsSheetOpen(false)
    onOpenChange(false)
    router.refresh()
  }

  // Get initials for placeholder avatar
  const getInitials = (contact: Contact) => {
    const first = contact.first_name?.[0] || ''
    const last = contact.last_name?.[0] || ''
    return `${first}${last}`.toUpperCase() || '?'
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md w-[92vw] max-h-[85vh] flex flex-col gap-4 overflow-hidden p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-headline text-[#2e3230]">
              Quick Note
            </DialogTitle>
          </DialogHeader>

          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#74796e]" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f5f1ea] border border-[#e4e0d8]/80 text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all"
            />
          </div>

          {/* Scrollable contacts container */}
          <div className="flex-1 overflow-y-auto pr-1 mt-2 space-y-6 max-h-[450px]">
            {filteredContacts.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#74796e]">
                No contacts found matching "{searchQuery}"
              </div>
            ) : (
              <>
                {/* Working List Section */}
                {workingListContacts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#74796e] px-1 font-sans">
                      Focus List
                    </h3>
                    <div className="space-y-2">
                      {workingListContacts.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => handleSelectContact(contact.id)}
                          className="w-full text-left p-3 rounded-xl border border-[#e4e0d8]/80 bg-[#f5f1ea]/30 hover:bg-[#eae6de]/50 active:scale-[0.99] transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {contact.avatar_url ? (
                              <img
                                src={contact.avatar_url}
                                alt={`${contact.first_name} avatar`}
                                className="w-9 h-9 rounded-full object-cover border border-[#e4e0d8]/60 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#dbd7cf] flex items-center justify-center text-xs font-bold text-[#4a4e4a] flex-shrink-0">
                                {getInitials(contact)}
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <h4 className="text-sm font-semibold text-[#2e3230] truncate font-headline">
                                {contact.first_name} {contact.last_name || ''}
                              </h4>
                              {(contact.job_title || contact.company) && (
                                <p className="text-xs text-[#4a4e4a] truncate font-sans">
                                  {[contact.job_title, contact.company]
                                    .filter(Boolean)
                                    .join(' at ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="bg-[#d8f0de] text-[#4a7c59] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-sans flex-shrink-0">
                            Focus List
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Contacts Section */}
                {otherContacts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#74796e] px-1 font-sans">
                      Other Contacts
                    </h3>
                    <div className="space-y-2">
                      {otherContacts.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => handleSelectContact(contact.id)}
                          className="w-full text-left p-3 rounded-xl border border-[#e4e0d8]/40 bg-[#f5f1ea]/20 hover:bg-[#eae6de]/50 active:scale-[0.99] transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {contact.avatar_url ? (
                              <img
                                src={contact.avatar_url}
                                alt={`${contact.first_name} avatar`}
                                className="w-9 h-9 rounded-full object-cover border border-[#e4e0d8]/60 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#dbd7cf] flex items-center justify-center text-xs font-bold text-[#4a4e4a] flex-shrink-0">
                                {getInitials(contact)}
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <h4 className="text-sm font-semibold text-[#2e3230] truncate font-headline">
                                {contact.first_name} {contact.last_name || ''}
                              </h4>
                              {(contact.job_title || contact.company) && (
                                <p className="text-xs text-[#4a4e4a] truncate font-sans">
                                  {[contact.job_title, contact.company]
                                    .filter(Boolean)
                                    .join(' at ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Controlled Interaction Sheet */}
      {selectedContactId && (
        <LogInteractionSheet
          contactId={selectedContactId}
          profileId={profileId}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          showTrigger={false}
          onSuccess={handleInteractionSuccess}
        />
      )}
    </>
  )
}

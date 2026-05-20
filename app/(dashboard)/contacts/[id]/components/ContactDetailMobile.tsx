import InteractionTimeline from './InteractionTimeline'
import LogInteractionSheet from '@/components/LogInteractionSheet'
import type { ContactDetailProps } from './types'

export default function ContactDetailMobile({
  contact,
  interactions,
  profileId,
}: ContactDetailProps) {
  const displayName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold">{displayName}</h1>
        {contact.company && (
          <p className="text-sm text-muted-foreground mt-1">
            {contact.job_title ? `${contact.job_title} · ` : ''}{contact.company}
          </p>
        )}
        {contact.email && (
          <p className="text-sm text-muted-foreground mt-1">{contact.email}</p>
        )}
      </div>

      {/* Timeline */}
      <div className="px-4">
        <InteractionTimeline interactions={interactions} contactId={contact.id} />
      </div>

      {/* Floating action button */}
      <div className="fixed bottom-6 right-4">
        <LogInteractionSheet
          contactId={contact.id}
          profileId={profileId}
          triggerLabel="+ Log"
          triggerClassName="h-12 px-5 rounded-full shadow-lg"
        />
      </div>
    </div>
  )
}

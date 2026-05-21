import InteractionTimeline from './InteractionTimeline'
import LogInteractionSheet from '@/components/LogInteractionSheet'
import type { ContactDetailProps } from './types'

export default function ContactDetailDesktop({
  contact,
  interactions,
  profileId,
}: ContactDetailProps) {
  const displayName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')

  return (
    <div className="min-h-full p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          {contact.company && (
            <p className="text-muted-foreground mt-1">
              {contact.job_title ? `${contact.job_title} · ` : ''}{contact.company}
            </p>
          )}
          {contact.email && (
            <p className="text-sm text-muted-foreground mt-1">{contact.email}</p>
          )}
        </div>
        <LogInteractionSheet
          contactId={contact.id}
          profileId={profileId}
          triggerLabel="Log interaction"
        />
      </div>

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Timeline
        </h2>
        <InteractionTimeline interactions={interactions} contactId={contact.id} />
      </section>
    </div>
  )
}

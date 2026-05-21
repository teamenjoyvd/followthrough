import { formatDistanceToNow } from 'date-fns'
import { Phone, Mail, FileText, Trash2 } from 'lucide-react'
import { deleteInteraction } from '@/lib/actions/interactions'
import type { InteractionWithDetails } from './types'

const OUTCOME_LABELS: Record<string, string> = {
  connected: 'Connected',
  no_answer: 'No answer',
  voicemail: 'Voicemail',
}

function InteractionIcon({ type }: { type: string }) {
  if (type === 'call') return <Phone className="h-4 w-4 text-green-600" />
  if (type === 'email') return <Mail className="h-4 w-4 text-blue-600" />
  return <FileText className="h-4 w-4 text-yellow-600" />
}

function InteractionDetail({ interaction }: { interaction: InteractionWithDetails }) {
  if (interaction.type === 'call' && interaction.call_details) {
    const { outcome, duration_seconds, summary } = interaction.call_details
    return (
      <div className="mt-1 space-y-0.5">
        <p className="text-sm font-medium">{OUTCOME_LABELS[outcome] ?? outcome}</p>
        {duration_seconds != null && (
          <p className="text-xs text-muted-foreground">
            {Math.floor(duration_seconds / 60)}m {duration_seconds % 60}s
          </p>
        )}
        {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
      </div>
    )
  }

  if (interaction.type === 'email' && interaction.email_details) {
    const { subject, body } = interaction.email_details
    return (
      <div className="mt-1 space-y-0.5">
        {subject && <p className="text-sm font-medium">{subject}</p>}
        {body && <p className="text-sm text-muted-foreground line-clamp-2">{body}</p>}
      </div>
    )
  }

  if (interaction.type === 'note' && interaction.note_details) {
    return (
      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
        {interaction.note_details.body}
      </p>
    )
  }

  return null
}

async function DeleteButton({
  interactionId,
  contactId,
}: {
  interactionId: string
  contactId: string
}) {
  async function handleDelete() {
    'use server'
    await deleteInteraction(interactionId, contactId)
  }

  return (
    <form action={handleDelete}>
      <button
        type="submit"
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
        aria-label="Delete interaction"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </form>
  )
}

interface Props {
  interactions: InteractionWithDetails[]
  contactId: string
}

export default function InteractionTimeline({ interactions, contactId }: Props) {
  if (interactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-sm">No interactions yet.</p>
      </div>
    )
  }

  return (
    <ol className="relative space-y-0 pl-6 border-l border-border">
      {interactions.map((interaction) => (
        <li key={interaction.id} className="group relative pb-6 last:pb-0">
          <span className="absolute -left-[1.3125rem] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border">
            <InteractionIcon type={interaction.type} />
          </span>

          <div className="ml-2 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(interaction.occurred_at), { addSuffix: true })}
              </p>
              <InteractionDetail interaction={interaction} />
            </div>
            <DeleteButton interactionId={interaction.id} contactId={contactId} />
          </div>
        </li>
      ))}
    </ol>
  )
}

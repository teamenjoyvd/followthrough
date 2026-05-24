'use client'

import { useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Phone, Mail, FileText, Trash2 } from 'lucide-react'
import { deleteInteraction } from '@/lib/actions/interactions'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type { InteractionWithDetails } from './types'

const OUTCOME_LABELS: Record<string, string> = {
  connected: 'Connected',
  no_answer: 'No answer',
  voicemail: 'Voicemail',
}

function InteractionIcon({ type }: { type: string }) {
  if (type === 'call') return <Phone className="h-4 w-4 text-[#4a7c59]" />
  if (type === 'email') return <Mail className="h-4 w-4 text-[#3b6080]" />
  return <FileText className="h-4 w-4 text-[#c28434]" />
}

function InteractionDetail({ interaction }: { interaction: InteractionWithDetails }) {
  if (interaction.type === 'call' && interaction.call_details) {
    const { outcome, duration_seconds, summary } = interaction.call_details
    return (
      <div className="mt-1 space-y-0.5">
        <p className="text-sm font-semibold text-[#2e3230]">{OUTCOME_LABELS[outcome] ?? outcome}</p>
        {duration_seconds != null && (
          <p className="text-xs text-[#74796e]">
            {Math.floor(duration_seconds / 60)}m {duration_seconds % 60}s
          </p>
        )}
        {summary && <p className="text-sm text-[#4a4e4a]">{summary}</p>}
      </div>
    )
  }

  if (interaction.type === 'email' && interaction.email_details) {
    const { subject, body } = interaction.email_details
    return (
      <div className="mt-1 space-y-0.5">
        {subject && <p className="text-sm font-semibold text-[#2e3230]">{subject}</p>}
        {body && <p className="text-sm text-[#4a4e4a] line-clamp-2">{body}</p>}
      </div>
    )
  }

  if (interaction.type === 'note' && interaction.note_details) {
    return (
      <p className="mt-1 text-sm text-[#4a4e4a] line-clamp-3">
        {interaction.note_details.body}
      </p>
    )
  }

  return null
}

function DeleteButton({
  interactionId,
  contactId,
}: {
  interactionId: string
  contactId: string
}) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      await deleteInteraction(interactionId, contactId)
    })
  }

  return (
    <ConfirmDialog
      title="Delete this entry?"
      description="This interaction log will be permanently removed."
      confirmLabel="Delete this entry"
      destructive
      onConfirm={handleDelete}
    >
      <button
        disabled={isPending}
        className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-xl hover:bg-[#ffdad8]/50 text-[#74796e] hover:text-[#b83230] disabled:opacity-50 cursor-pointer"
        aria-label="Delete interaction"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </ConfirmDialog>
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
        <p className="text-[#74796e] text-sm">No interactions yet.</p>
      </div>
    )
  }

  return (
    <ol className="relative space-y-0 pl-6 border-l border-[#e4e0d8]">
      {interactions.map((interaction) => (
        <li key={interaction.id} className="group relative pb-6 last:pb-0">
          <span className="absolute -left-[1.3125rem] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-[#e4e0d8] shadow-sm">
            <InteractionIcon type={interaction.type} />
          </span>

          <div className="ml-2 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#74796e]">
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

'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { logCall, logEmail, logNote } from '@/lib/actions/interactions'
import type { Database } from '@/types/supabase'

type CallOutcome = Database['public']['Enums']['call_outcome']

const OUTCOMES: { value: CallOutcome; label: string }[] = [
  { value: 'connected', label: 'Connected' },
  { value: 'no_answer', label: 'No answer' },
  { value: 'voicemail', label: 'Voicemail' },
]

interface Props {
  contactId: string
  profileId: string
  triggerLabel?: string
  triggerClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
  onSuccess?: () => void
}

function CallForm({
  contactId,
  profileId,
  onSuccess,
}: {
  contactId: string
  profileId: string
  onSuccess: () => void
}) {
  const [outcome, setOutcome] = React.useState<CallOutcome | null>(null)
  const [duration, setDuration] = React.useState('')
  const [summary, setSummary] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function handleSubmit() {
    if (!outcome) return
    setPending(true)
    setError(null)
    const result = await logCall({
      contactId,
      profileId,
      outcome,
      durationSeconds: duration ? parseInt(duration, 10) * 60 : undefined,
      summary: summary || undefined,
    })
    setPending(false)
    if (result.error) {
      setError(result.error)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div>
        <p className="text-sm font-medium mb-2">Outcome</p>
        <div className="flex flex-wrap gap-2">
          {OUTCOMES.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setOutcome(o.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm border transition-colors',
                outcome === o.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-input hover:bg-accent'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="call-duration">
          Duration (minutes, optional)
        </label>
        <input
          id="call-duration"
          type="number"
          min="0"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g. 15"
        />
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="call-summary">
          Summary (optional)
        </label>
        <textarea
          id="call-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="What did you discuss?"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={!outcome || pending}
        className="w-full"
      >
        {pending ? 'Logging…' : 'Log call'}
      </Button>
    </div>
  )
}

function EmailForm({
  contactId,
  profileId,
  onSuccess,
}: {
  contactId: string
  profileId: string
  onSuccess: () => void
}) {
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function handleSubmit() {
    setPending(true)
    setError(null)
    const result = await logEmail({ contactId, profileId, subject: subject || undefined, body: body || undefined })
    setPending(false)
    if (result.error) {
      setError(result.error)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div>
        <label className="text-sm font-medium" htmlFor="email-subject">
          Subject (optional)
        </label>
        <input
          id="email-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Email subject"
        />
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="email-body">
          Body (optional)
        </label>
        <textarea
          id="email-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="What did you write?"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleSubmit} disabled={pending} className="w-full">
        {pending ? 'Logging…' : 'Log email'}
      </Button>
    </div>
  )
}

function NoteForm({
  contactId,
  profileId,
  onSuccess,
}: {
  contactId: string
  profileId: string
  onSuccess: () => void
}) {
  const [body, setBody] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function handleSubmit() {
    if (!body.trim()) return
    setPending(true)
    setError(null)
    const result = await logNote({ contactId, profileId, body })
    setPending(false)
    if (result.error) {
      setError(result.error)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div>
        <label className="text-sm font-medium" htmlFor="note-body">
          Note
        </label>
        <textarea
          id="note-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="What happened or what do you want to remember?"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={!body.trim() || pending}
        className="w-full"
      >
        {pending ? 'Logging…' : 'Save note'}
      </Button>
    </div>
  )
}

export default function LogInteractionSheet({
  contactId,
  profileId,
  triggerLabel = 'Log interaction',
  triggerClassName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
  onSuccess: onSuccessProp,
}: Props) {
  const [localOpen, setLocalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : localOpen
  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (isControlled) {
        controlledOnOpenChange?.(newOpen)
      } else {
        setLocalOpen(newOpen)
      }
    },
    [isControlled, controlledOnOpenChange]
  )

  const handleSuccess = React.useCallback(() => {
    setOpen(false)
    onSuccessProp?.()
  }, [setOpen, onSuccessProp])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button className={cn(triggerClassName)}>{triggerLabel}</Button>
        </SheetTrigger>
      )}
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log interaction</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="call" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="call" className="flex-1">Call</TabsTrigger>
            <TabsTrigger value="email" className="flex-1">Email</TabsTrigger>
            <TabsTrigger value="note" className="flex-1">Note</TabsTrigger>
          </TabsList>

          <TabsContent value="call">
            <CallForm
              contactId={contactId}
              profileId={profileId}
              onSuccess={handleSuccess}
            />
          </TabsContent>

          <TabsContent value="email">
            <EmailForm
              contactId={contactId}
              profileId={profileId}
              onSuccess={handleSuccess}
            />
          </TabsContent>

          <TabsContent value="note">
            <NoteForm
              contactId={contactId}
              profileId={profileId}
              onSuccess={handleSuccess}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

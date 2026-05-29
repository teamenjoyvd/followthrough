'use client'

import * as React from 'react'
import { useWorkspaceStore } from '../store/useWorkspaceStore'
import { Mail, Phone, Loader2, Save, Trash2, History, PlusCircle } from 'lucide-react'
import type { Database } from '@/types/supabase'
import { getInitials, getAvatarUrl, getContactDescription } from '@/lib/utils/dashboard'
import { deleteInteraction, getContactTimelineAndLabels } from '@/lib/actions/interactions'
import { cn } from '@/lib/utils'
import { useActionToast } from '@/components/ActionToast'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import LogInteractionSheet from '@/components/LogInteractionSheet'

type Contact = Database['public']['Tables']['contacts']['Row']
type Label = Database['public']['Tables']['labels']['Row']

interface Props {
  profileId: string
  allLabels: Label[]
}

interface NoteDetail {
  body: string
}

interface CallDetail {
  outcome: Database['public']['Enums']['call_outcome']
  summary: string | null
}

interface EmailDetail {
  subject: string | null
  body: string | null
}

interface MeetingDetail {
  body: string
}

interface PopulatedInteraction {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note'
  created_at: string
  note_details: NoteDetail | null
  call_details: CallDetail | null
  email_details: EmailDetail | null
  meeting_details: MeetingDetail | null
}

export default function ContextPanel({ profileId, allLabels }: Props) {
  const { selectedContact, updateContactDescription, toggleContactLabel, undoWindowSeconds } = useWorkspaceStore()
  const showToast = useActionToast()

  // Local State
  const [noteText, setNoteText] = React.useState('')
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [activeLabelIds, setActiveLabelIds] = React.useState<string[]>([])
  const [interactions, setInteractions] = React.useState<PopulatedInteraction[]>([])
  const [loadingTimeline, setLoadingTimeline] = React.useState(false)

  // Load Details Reusable Callback
  const loadDetails = React.useCallback(async () => {
    if (!selectedContact) return
    setLoadingTimeline(true)
    setActiveLabelIds([])
    setInteractions([])
    try {
      const res = await getContactTimelineAndLabels(selectedContact.id)
      if (!res.success) {
        console.error('Error loading timeline and labels from server action:', res.error)
        return
      }

      setActiveLabelIds(res.activeLabelIds || [])
      setInteractions((res.interactions || []) as PopulatedInteraction[])
    } catch (err) {
      console.error('Error loading details:', err)
    } finally {
      setLoadingTimeline(false)
    }
  }, [selectedContact])

  // Load Contact Details (Notes, Labels, Timeline)
  React.useEffect(() => {
    if (!selectedContact) return

    setNoteText(selectedContact.custom_description || '')
    setSaveStatus('idle')

    loadDetails()
  }, [selectedContact, loadDetails])

  // Debounced auto-save for working notes scratchpad.
  React.useEffect(() => {
    if (!selectedContact) return
    if (noteText === (selectedContact.custom_description || '')) return

    let active = true
    const contactId = selectedContact.id
    const textToSave = noteText

    const timer = setTimeout(async () => {
      if (!active) return
      setSaveStatus('saving')
      const res = await updateContactDescription(contactId, textToSave)
      if (!active) return
      if (res.success) {
        setSaveStatus('saved')
        setTimeout(() => { if (active) setSaveStatus('idle') }, 2000)
        if (res.logId) {
          showToast({
            actionLabel: 'Note saved',
            logId: res.logId,
            undoWindowSeconds,
          })
        }
      } else {
        setSaveStatus('error')
      }
    }, 800)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [noteText, selectedContact, updateContactDescription, showToast, undoWindowSeconds])

  if (!selectedContact) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#eae6de]/20 border border-dashed border-[#e4e0d8] rounded-[24px]">
        <div className="p-4 bg-[#eae6de] text-[#74796e] rounded-full mb-4">
          <History className="h-7 w-7" />
        </div>
        <h3 className="font-headline text-base font-bold text-[#2e3230]">Workspace Detail Panel</h3>
        <p className="text-xs text-[#74796e] max-w-xs mt-1.5 font-sans leading-relaxed">
          Select any contact from your Focus List to view their details, take debounced auto-saving notes, manage labels, and log interactions in place.
        </p>
      </div>
    )
  }

  const avatar = getAvatarUrl(selectedContact)
  const description = getContactDescription(selectedContact)

  // Label Color Palette Map
  const labelColors: Record<string, string> = {
    sage: 'bg-[#e6eeea] text-[#335c43] border-[#c2ded0]',
    ochre: 'bg-[#fbf4ea] text-[#8c6239] border-[#f0dfcc]',
    rose: 'bg-[#fbf0f0] text-[#a14b49] border-[#f2d8d7]',
    blue: 'bg-[#f0f4fb] text-[#3e649e] border-[#d8e3f2]',
    charcoal: 'bg-[#eaebeb] text-[#373b3e] border-[#d1d5db]',
  }

  // Toggle Label Tag in Database — optimistic update with rollback on failure
  const handleToggleLabel = async (labelId: string) => {
    const isAssigned = activeLabelIds.includes(labelId)
    const action = isAssigned ? 'clear' : 'assign'

    // Optimistic update
    setActiveLabelIds(prev =>
      isAssigned ? prev.filter(id => id !== labelId) : [...prev, labelId]
    )

    const res = await toggleContactLabel(selectedContact.id, labelId, action)
    if (!res.success) {
      // Rollback on failure
      setActiveLabelIds(prev =>
        isAssigned ? [...prev, labelId] : prev.filter(id => id !== labelId)
      )
    }
  }

  // Delete an interaction — gated by ConfirmDialog at the call site below
  const handleDeleteInteraction = async (interactionId: string) => {
    setInteractions(prev => prev.filter(i => i.id !== interactionId))
    await deleteInteraction(interactionId, selectedContact.id)
    await loadDetails()
  }

  return (
    <div className="space-y-6 h-full flex flex-col justify-start">

      {/* ── Contact Details card ────────────────────────────── */}
      <div className="bg-[#eae6de] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(46,50,48,0.02)] border border-[#e4e0d8]/30">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 bg-[#f8e0a8] text-[#221a05] font-bold text-lg flex items-center justify-center font-sans">
            {avatar ? <img className="w-full h-full object-cover" src={avatar} alt="" /> : getInitials(selectedContact.first_name, selectedContact.last_name)}
          </div>
          <div className="min-w-0">
            <h3 className="font-headline text-lg font-bold text-[#2e3230]">
              {selectedContact.first_name} {selectedContact.last_name || ''}
            </h3>
            <p className="text-xs text-[#74796e] font-sans truncate">{description}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#dbd7cf]/60 space-y-2">
          {selectedContact.email && (
            <a
              href={`mailto:${selectedContact.email}`}
              className="flex items-center gap-2.5 text-xs text-[#4a4e4a] hover:text-[#4a7c59] transition-colors font-sans py-1"
            >
              <Mail className="h-4 w-4 shrink-0 text-[#74796e]" />
              <span className="truncate">{selectedContact.email}</span>
            </a>
          )}
          {selectedContact.preferred_contact_method && (
            <div className="flex items-center gap-2.5 text-xs text-[#4a4e4a] font-sans py-1">
              <Phone className="h-4 w-4 shrink-0 text-[#74796e]" />
              <span className="capitalize">Prefers: {selectedContact.preferred_contact_method}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Working Notes Scratchpad (Debounced Auto-save) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#74796e] font-sans">Working Scratchpad</label>
          <span className="text-[10px] font-sans transition-opacity duration-200">
            {saveStatus === 'saving' && <span className="text-[#74796e] flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>}
            {saveStatus === 'saved' && <span className="text-[#4a7c59] flex items-center gap-1 font-bold"><Save className="h-3 w-3" /> Saved!</span>}
            {saveStatus === 'error' && <span className="text-[#b83230] font-bold">Error saving</span>}
          </span>
        </div>
        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Jot down active details, task updates, or phone notes here. Auto-saves..."
          className="w-full p-4 bg-[#eae6de]/30 focus:bg-[#eae6de]/10 border border-[#e4e0d8]/80 focus:border-[#4a7c59] rounded-2xl text-xs font-sans text-[#2e3230] placeholder-[#74796e]/70 focus:ring-1 focus:ring-[#4a7c59] outline-none transition-all resize-none shadow-sm"
        />
      </div>

      {/* ── Fast Labels Manager ───────────────────────────── */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-[#74796e] font-sans">Tags Manager</label>
        <div className="flex flex-wrap gap-1.5">
          {allLabels.length === 0 ? (
            <p className="text-[10px] font-sans text-[#74796e] italic">No custom tags created yet.</p>
          ) : (
            allLabels.map(label => {
              const isActive = activeLabelIds.includes(label.id)
              const baseColor = labelColors[label.color || 'charcoal'] || 'bg-gray-100 text-gray-800'
              return (
                <button
                  key={label.id}
                  onClick={() => handleToggleLabel(label.id)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-sans font-medium rounded-full border transition-all active:scale-95 duration-100",
                    isActive
                      ? `${baseColor} border-[#705c30] ring-1 ring-[#705c30]/20 font-semibold shadow-sm`
                      : "bg-[#faf6f0] border-[#e4e0d8] text-[#74796e] hover:bg-[#eae6de]/40"
                  )}
                >
                  {label.name}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Quick Touchpoint Logging ─────────────────────────── */}
      <div className="space-y-4 pt-2 border-t border-[#dbd7cf]/60">
        <LogInteractionSheet
          contactId={selectedContact.id}
          profileId={profileId}
          triggerLabel="Log interaction"
          triggerClassName="w-full bg-[#4a7c59] text-white hover:bg-[#3d6649] text-sm font-bold font-sans rounded-xl gap-2"
          onSuccess={loadDetails}
        />

        {/* ── Touchpoint History Timeline ──────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-[#74796e]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#74796e] font-sans">Timeline Activity</span>
          </div>

          {loadingTimeline ? (
            <div className="py-8 flex justify-center text-[#74796e]"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : interactions.length === 0 ? (
            <p className="text-[10px] text-[#74796e] font-sans italic pl-1">No touchpoints logged yet.</p>
          ) : (
            <div className="relative pl-4 border-l border-[#dbd7cf] space-y-4 py-1">
              {interactions.map(item => {
                let title = 'Touchpoint'
                let detail = ''

                if (item.type === 'call') {
                  title = 'Phone Call'
                  const callDetails = item.call_details
                  const outcome = callDetails?.outcome?.replace('_', ' ') || 'Completed'
                  const sum = callDetails?.summary ? `— "${callDetails.summary}"` : ''
                  detail = `Outcome: ${outcome} ${sum}`
                } else if (item.type === 'email') {
                  title = 'Email Synced'
                  const emailDetails = item.email_details
                  const sub = emailDetails?.subject || 'No Subject'
                  const body = emailDetails?.body ? `— "${emailDetails.body}"` : ''
                  detail = `${sub} ${body}`
                } else if (item.type === 'meeting') {
                  title = 'Meeting'
                  detail = item.meeting_details?.body || ''
                } else if (item.type === 'note') {
                  title = 'Note Complete'
                  detail = item.note_details?.body || 'Completed Focus Task'
                }

                const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })

                return (
                  <div key={item.id} className="relative space-y-1">
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#eae6de] border-2 border-[#705c30]" />
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-headline font-bold text-[#2e3230]">{title}</p>
                      <ConfirmDialog
                        title="Delete this entry?"
                        description="This interaction log will be permanently removed."
                        confirmLabel="Delete this entry"
                        destructive
                        onConfirm={() => handleDeleteInteraction(item.id)}
                      >
                        <button
                          className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 text-[#74796e] hover:text-[#b83230] rounded transition-all shrink-0"
                          title="Delete log"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </ConfirmDialog>
                    </div>
                    <p className="text-[10px] text-[#4a4e4a] font-sans leading-relaxed pl-0.5 pr-2 break-words">
                      {detail}
                    </p>
                    <p className="text-[9px] text-[#74796e]/70 font-sans tracking-wide">{dateStr}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

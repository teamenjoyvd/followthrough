'use client'

import * as React from 'react'
import { useWorkspaceStore } from '../store/useWorkspaceStore'
import { Search, UserPlus, PlusCircle, MoreHorizontal, CheckCircle2, Clock, Trash2 } from 'lucide-react'
import type { Database } from '@/types/supabase'
import { getContactDescription } from '@/lib/utils/dashboard'
import { cn } from '@/lib/utils'
import { useActionToast } from '@/components/ActionToast'
import LogInteractionSheet from '@/components/LogInteractionSheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Contact = Database['public']['Tables']['contacts']['Row']

interface Props {
  profileId: string
}

export default function FocusList({ profileId }: Props) {
  const { 
    workingList, 
    allContacts, 
    selectedContact, 
    setSelectedContact,
    pinContact, 
    unpinContact, 
    markContactDone, 
    snoozeContact,
    undoWindowSeconds,
  } = useWorkspaceStore()

  const showToast = useActionToast()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [activeSnoozeId, setActiveSnoozeId] = React.useState<string | null>(null)
  const [logSheetContactId, setLogSheetContactId] = React.useState<string | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const triggerError = (msg: string) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(null), 4000)
  }
  
  const suggestionsRef = React.useRef<HTMLDivElement>(null)
  const snoozeRef = React.useRef<HTMLDivElement | null>(null)

  const filteredSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return allContacts
      .filter(c => {
        const alreadyPinned = workingList.some(w => w.id === c.id)
        if (alreadyPinned) return false
        const fullName = `${c.first_name} ${c.last_name || ''}`.toLowerCase()
        return fullName.includes(q) || c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q)
      })
      .slice(0, 5)
  }, [searchQuery, allContacts, workingList])

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  React.useEffect(() => {
    function handleSnoozeClickOutside(event: MouseEvent) {
      if (snoozeRef.current && !snoozeRef.current.contains(event.target as Node)) {
        setActiveSnoozeId(null)
      }
    }
    document.addEventListener('mousedown', handleSnoozeClickOutside)
    return () => document.removeEventListener('mousedown', handleSnoozeClickOutside)
  }, [])

  const handlePin = async (contactId: string) => {
    setSearchQuery('')
    setShowSuggestions(false)
    const res = await pinContact(contactId)
    if (res.error) triggerError(res.error)
    else if (res.logId) {
      const contact = allContacts.find(c => c.id === contactId)
      showToast({
        actionLabel: `${contact?.first_name ?? 'Contact'} added to Focus`,
        logId: res.logId,
        undoWindowSeconds,
      })
    }
  }

  return (
    <div className="space-y-6">

      {errorMsg && (
        <div className="bg-[#fbf0f0] border border-[#f2d8d7] text-[#a14b49] px-4 py-3 rounded-2xl text-xs font-sans animate-in slide-in-from-top-1">
          {errorMsg}
        </div>
      )}

      {/* ── Search & Pin Input Command Bar ────────────────────── */}
      <div className="relative" ref={suggestionsRef}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#74796e]" />
          <input
            type="text"
            placeholder="Type any contact name to pin them to Focus..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-12 pr-4 py-3.5 bg-[#eae6de] border-0 focus:ring-2 focus:ring-[#4a7c59] rounded-2xl text-sm font-sans text-[#2e3230] placeholder-[#74796e] outline-none shadow-inner"
          />
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute w-full mt-2 bg-[#faf6f0] border border-[#e4e0d8] rounded-2xl shadow-[0_8px_30px_rgba(46,50,48,0.12)] overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150">
            <div className="p-2 space-y-1">
              {filteredSuggestions.map((c) => {
                const desc = getContactDescription(c)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handlePin(c.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#eae6de] text-left transition-colors active:scale-[0.99] duration-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#2e3230] truncate">{c.first_name} {c.last_name || ''}</p>
                        <p className="text-xs text-[#74796e] truncate font-sans">{desc}</p>
                      </div>
                    </div>
                    <UserPlus className="h-5 w-5 text-[#4a7c59] mr-1 shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Focus List Cards ────────────────────────────────────────────────── */}
      {workingList.length === 0 ? (
        <div className="bg-[#f5f1ea] rounded-[24px] py-20 flex flex-col items-center text-center border border-[#e4e0d8]/40 shadow-[0_4px_24px_rgba(46,50,48,0.02)]">
          <div className="p-4 bg-[#c8e8d0] text-[#4a7c59] rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="font-headline text-lg font-bold text-[#2e3230]">Focus List cleared!</h3>
          <p className="text-xs text-[#74796e] max-w-xs mt-1.5 font-sans leading-relaxed">
            Use the pinning bar above to select contacts you want to focus on next, or add them from your Contacts catalog.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {workingList.map((c) => {
            const desc = getContactDescription(c)
            const isSelected = selectedContact?.id === c.id
            const isSnoozeOpen = activeSnoozeId === c.id
            const isDimmed = activeSnoozeId !== null && !isSnoozeOpen

            return (
              <div
                key={c.id}
                onClick={() => setSelectedContact(c)}
                className={cn(
                  "group p-5 rounded-[24px] border flex flex-col transition-all duration-300 relative cursor-pointer shadow-[0_4px_20px_rgba(46,50,48,0.02)]",
                  isSelected
                    ? "bg-[#eae6de] border-[#705c30]/40 shadow-[0_6px_24px_rgba(46,50,48,0.05)]"
                    : "bg-[#f5f1ea] border-[#e4e0d8] hover:bg-[#e4e0d8]/60 hover:border-[#e4e0d8]/70",
                  isDimmed && "opacity-50 pointer-events-none"
                )}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#705c30] rounded-l-[24px]" />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="min-w-0">
                      <h4 className="font-headline text-base font-bold text-[#2e3230]">
                        {c.first_name} {c.last_name || ''}
                      </h4>
                      <p className="text-xs text-[#74796e] font-sans truncate mt-0.5 max-w-[240px] md:max-w-xs">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Action cluster — stopPropagation prevents card selection on button click */}
                  <div className="flex items-center gap-2 shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>

                    {/* PRIMARY: Log interaction */}
                    <button
                      type="button"
                      onClick={() => setLogSheetContactId(c.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4a7c59] text-white text-xs font-semibold rounded-xl hover:bg-[#3d6649] active:scale-95 transition-all duration-100 font-sans"
                    >
                      <PlusCircle className="h-4 w-4 shrink-0" />
                      <span>Log</span>
                    </button>

                    {/* OVERFLOW: Mark done, Snooze, Remove */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#eae6de] text-[#74796e] hover:bg-[#dedad2] hover:text-[#2e3230] active:scale-95 transition-all duration-100"
                          aria-label="More actions"
                          title="More actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onSelect={async () => {
                            const res = await markContactDone(c.id)
                            if (res.error) triggerError(res.error)
                            else if (res.logId) showToast({ actionLabel: `${c.first_name} marked done`, logId: res.logId, undoWindowSeconds })
                          }}
                          className="gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4 text-[#4a7c59]" />
                          Mark done
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setActiveSnoozeId(activeSnoozeId === c.id ? null : c.id)}
                          className="gap-2 cursor-pointer"
                        >
                          <Clock className="h-4 w-4 text-[#705c30]" />
                          Snooze
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={async () => {
                            const res = await unpinContact(c.id)
                            if (res.error) triggerError(res.error)
                            else if (res.logId) showToast({ actionLabel: `${c.first_name} removed from Focus`, logId: res.logId, undoWindowSeconds })
                          }}
                          className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Snooze picker — toggled by activeSnoozeId, closed by click-outside */}
                {isSnoozeOpen && (
                  <div
                    ref={snoozeRef}
                    className="mt-4 p-4 bg-[#faf6f0] rounded-2xl border border-[#e4e0d8] space-y-3 animate-in slide-in-from-top-2 duration-150 self-end w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#74796e] font-sans">Snooze until...</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ label: '1 Day', days: 1 }, { label: '3 Days', days: 3 }, { label: '1 Week', days: 7 }].map(
                        ({ label, days }) => (
                          <button
                            key={days}
                            type="button"
                            onClick={async () => {
                              setActiveSnoozeId(null)
                              const res = await snoozeContact(c.id, days)
                              if (res.error) triggerError(res.error)
                              else if (res.logId) showToast({ actionLabel: `${c.first_name} snoozed ${label.toLowerCase()}`, logId: res.logId, undoWindowSeconds })
                            }}
                            className="py-2 px-3 text-center text-xs font-semibold bg-[#faf6f0] border border-[#e4e0d8] text-[#2e3230] hover:bg-[#c8e8d0] hover:text-[#4a7c59] hover:border-[#4a7c59]/30 rounded-xl transition-colors font-sans"
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>
                    <div className="pt-2 border-t border-[#e4e0d8]">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#74796e] block mb-1 font-sans">Custom date</label>
                      <input
                        type="date"
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        onChange={async (e) => { 
                          if (e.target.value) {
                            setActiveSnoozeId(null)
                            const res = await snoozeContact(c.id, new Date(e.target.value))
                            if (res.error) triggerError(res.error)
                            else if (res.logId) showToast({ actionLabel: `${c.first_name} snoozed`, logId: res.logId, undoWindowSeconds })
                          }
                        }}
                        className="w-full text-xs border border-[#e4e0d8] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59] bg-[#faf6f0] font-sans text-[#2e3230]"
                      />
                    </div>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}

      {/* ── Controlled LogInteractionSheet — mounted once, driven by logSheetContactId ── */}
      {logSheetContactId && (
        <LogInteractionSheet
          contactId={logSheetContactId}
          profileId={profileId}
          showTrigger={false}
          open={true}
          onOpenChange={(open) => { if (!open) setLogSheetContactId(null) }}
        />
      )}

    </div>
  )
}

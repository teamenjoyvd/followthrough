'use client'

import * as React from 'react'
import { useWorkspaceStore } from '../store/useWorkspaceStore'
import { Search, UserPlus, CheckCircle2, Clock, Trash2 } from 'lucide-react'
import type { Database } from '@/types/supabase'
import { getInitials, getAvatarUrl, getContactDescription } from '@/lib/utils/dashboard'
import { cn } from '@/lib/utils'
import { useActionToast } from '@/components/ActionToast'

type Contact = Database['public']['Tables']['contacts']['Row']

export default function FocusList() {
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
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const triggerError = (msg: string) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(null), 4000)
  }
  
  const suggestionsRef = React.useRef<HTMLDivElement>(null)

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
      
      {/* ── Header Area ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-bold text-[#2e3230]">Focus List</h2>
          <p className="text-xs text-[#74796e] font-sans mt-0.5">
            You have <span className="font-bold text-[#4a7c59]">{workingList.length}</span> high-priority focus task{workingList.length !== 1 ? 's' : ''} active
          </p>
        </div>
      </div>

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
                const avatar = getAvatarUrl(c)
                const desc = getContactDescription(c)
                return (
                  <button
                    key={c.id}
                    onClick={() => handlePin(c.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#eae6de] text-left transition-colors active:scale-[0.99] duration-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 bg-[#f8e0a8] text-[#221a05] font-bold text-xs flex items-center justify-center font-sans">
                        {avatar ? <img className="w-full h-full object-cover" src={avatar} alt="" /> : getInitials(c.first_name, c.last_name)}
                      </div>
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
            const avatar = getAvatarUrl(c)
            const desc = getContactDescription(c)
            const isSelected = selectedContact?.id === c.id

            return (
              <div
                key={c.id}
                onClick={() => setSelectedContact(c)}
                className={cn(
                  "group p-5 rounded-[24px] border flex flex-col transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(46,50,48,0.02)]",
                  isSelected
                    ? "bg-[#eae6de] border-[#705c30]/40 shadow-[0_6px_24px_rgba(46,50,48,0.05)]"
                    : "bg-[#f5f1ea] border-[#e4e0d8]/30 hover:bg-[#e4e0d8]/60 hover:border-[#e4e0d8]/70"
                )}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#705c30]" />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 bg-[#f8e0a8] text-[#221a05] font-bold text-sm flex items-center justify-center font-sans">
                      {avatar ? <img className="w-full h-full object-cover" src={avatar} alt="" /> : getInitials(c.first_name, c.last_name)}
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="font-headline text-base font-bold text-[#2e3230]">
                        {c.first_name} {c.last_name || ''}
                      </h4>
                      <p className="text-xs text-[#74796e] font-sans truncate mt-0.5 max-w-[240px] md:max-w-xs">
                        {desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={async () => {
                        const res = await markContactDone(c.id)
                        if (res.error) triggerError(res.error)
                        else if (res.logId) showToast({ actionLabel: `${c.first_name} marked done`, logId: res.logId, undoWindowSeconds })
                      }}
                      className="p-2 bg-[#4a7c59] text-white hover:bg-[#3d6649] rounded-xl active:scale-95 duration-100 transition-transform"
                      title="Log Contact & Mark Done"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => setActiveSnoozeId(activeSnoozeId === c.id ? null : c.id)}
                      className={cn(
                        "p-2 rounded-xl transition-all duration-200 active:scale-95",
                        activeSnoozeId === c.id
                          ? "bg-[#c4a66a] text-[#554020]"
                          : "bg-[#eae6de] text-[#705c30] hover:bg-[#eae6de]/80"
                      )}
                      title="Snooze"
                    >
                      <Clock className="h-5 w-5" />
                    </button>

                    <button
                      onClick={async () => {
                        const res = await unpinContact(c.id)
                        if (res.error) triggerError(res.error)
                        else if (res.logId) showToast({ actionLabel: `${c.first_name} removed from Focus`, logId: res.logId, undoWindowSeconds })
                      }}
                      className="p-2 bg-[#eae6de] text-[#74796e] hover:text-[#b83230] hover:bg-[#ffdad8]/50 rounded-xl active:scale-95 duration-100 transition-transform"
                      title="Remove from Focus"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {activeSnoozeId === c.id && (
                  <div className="mt-4 p-4 bg-[#faf6f0] rounded-2xl border border-[#e4e0d8] space-y-3 animate-in slide-in-from-top-2 duration-150 relative z-20 self-end w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#74796e] font-sans">Snooze until...</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ label: '1 Day', days: 1 }, { label: '3 Days', days: 3 }, { label: '1 Week', days: 7 }].map(
                        ({ label, days }) => (
                          <button
                            key={days}
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

    </div>
  )
}

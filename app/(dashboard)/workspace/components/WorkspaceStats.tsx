'use client'

import * as React from 'react'
import { useWorkspaceStore } from '../store/useWorkspaceStore'
import { Heart, Flame, Inbox, Plus, Check, Clock, EyeOff } from 'lucide-react'
import { markInboxItemRead } from '@/lib/actions/inbox'
import type { InboxItem } from '@/types/inbox'

interface Props {
  initialInboxItems: InboxItem[]
  healthPercentage: number
}

export default function WorkspaceStats({ initialInboxItems, healthPercentage }: Props) {
  const { completedTodayCount, dailyGoal, streakDays, pinContact } = useWorkspaceStore()
  const [inboxItems, setInboxItems] = React.useState<InboxItem[]>(
    initialInboxItems.filter(item => !item.read).slice(0, 3)
  )

  const progressPercent = Math.min(100, Math.round((completedTodayCount / dailyGoal) * 100))

  // Handle in-place inbox item read
  const handleMarkRead = async (itemId: string) => {
    // Optimistic UI removal
    setInboxItems(prev => prev.filter(item => item.id !== itemId))
    await markInboxItemRead(itemId)
  }

  // Handle in-place pin to focus list
  const handlePinFromInbox = async (itemId: string, contactId: string | null) => {
    if (!contactId) return
    setInboxItems(prev => prev.filter(item => item.id !== itemId))
    await pinContact(contactId)
    await markInboxItemRead(itemId)
  }


  return (
    <div className="space-y-6">
      
      {/* ── Daily Focus Progress ────────────────────────────── */}
      <div className="bg-[#eae6de] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(46,50,48,0.03)] border border-[#e4e0d8]/30 flex flex-col items-center">
        <h3 className="font-headline text-lg font-bold text-[#2e3230] mb-4 self-start">Daily Focus Goal</h3>
        
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle 
              className="text-[#dbd7cf]" 
              cx="72" 
              cy="72" 
              fill="transparent" 
              r="64" 
              stroke="currentColor" 
              strokeWidth="8"
            />
            <circle 
              className="text-[#4a7c59] transition-all duration-700 ease-out" 
              cx="72" 
              cy="72" 
              fill="transparent" 
              r="64" 
              stroke="currentColor" 
              strokeDasharray="402" 
              strokeDashoffset={402 * (1 - progressPercent / 100)} 
              strokeWidth="8"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-headline font-bold text-[#4a7c59]">{completedTodayCount} / {dailyGoal}</span>
            <span className="text-[10px] text-[#74796e] font-sans font-bold uppercase tracking-wider mt-0.5">completed</span>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="mt-5 w-full bg-[#faf6f0] rounded-2xl p-3 flex items-center justify-between border border-[#e4e0d8]/40 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2">
            <div className="bg-[#fcf3e6] text-[#705c30] p-1.5 rounded-lg">
              <Flame className="h-4.5 w-4.5 text-[#c4a66a]" fill="currentColor" />
            </div>
            <div>
              <p className="text-xs text-[#2e3230] font-bold font-sans">Active Streak</p>
              <p className="text-[10px] text-[#74796e] font-sans">Keep the momentum going!</p>
            </div>
          </div>
          <span className="font-headline text-lg font-bold text-[#c4a66a]">{streakDays} Days 🔥</span>
        </div>
      </div>

      {/* ── Relationship Health ────────────────────────────── */}
      <div className="bg-[#eae6de]/60 rounded-[24px] p-5 border border-[#e4e0d8]/20 shadow-[0_4px_24px_rgba(46,50,48,0.01)]">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-headline text-sm font-bold text-[#2e3230]">CRM Health</h4>
            <p className="text-[10px] text-[#74796e] font-sans">Adherence to contact intervals</p>
          </div>
          <div className="p-1 bg-[#f0ecfb]/10 text-[#4a7c59]">
            <Heart className="h-5 w-5 text-[#4a7c59]" fill="currentColor" />
          </div>
        </div>
        <div className="flex items-end gap-3 mt-4">
          <span className="text-3xl font-headline font-bold text-[#4a7c59]">{healthPercentage}%</span>
          <div className="flex-1 bg-[#dbd7cf] h-2.5 rounded-full overflow-hidden mb-1.5">
            <div 
              className="bg-[#4a7c59] h-full rounded-full transition-all duration-1000" 
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Quick Inbox Widget ─────────────────────────────── */}
      <div className="bg-[#eae6de]/30 rounded-[24px] p-5 border border-[#e4e0d8]/30">
        <div className="flex items-center gap-2 mb-3">
          <Inbox className="h-4.5 w-4.5 text-[#4a7c59]" />
          <h4 className="font-headline text-sm font-bold text-[#2e3230]">Focus Inbox</h4>
          {inboxItems.length > 0 && (
            <span className="ml-auto bg-[#4a7c59] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {inboxItems.length}
            </span>
          )}
        </div>

        {inboxItems.length === 0 ? (
          <div className="py-6 text-center text-[#74796e] text-xs border border-dashed border-[#e4e0d8] rounded-2xl bg-[#faf6f0]/40 font-sans">
            Inbox is fully cleared!
          </div>
        ) : (
          <div className="space-y-3">
            {inboxItems.map(item => {
              const name = item.contacts ? `${item.contacts.first_name} ${item.contacts.last_name || ''}`.trim() : 'Unknown Lead'
              const company = item.contacts?.company ? `@ ${item.contacts.company}` : ''
              
              let desc = 'Snooze expired'
              if (item.type === 'working_list_changed') desc = 'Focus list updated'
              
              return (
                <div 
                  key={item.id} 
                  className="bg-[#faf6f0] border border-[#e4e0d8]/50 p-3 rounded-2xl flex flex-col justify-between hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow"
                >
                  <div>
                    <span className="text-[9px] font-bold text-[#705c30] uppercase tracking-wider font-sans bg-[#fbf4ea] px-1.5 py-0.5 rounded-md">
                      {desc}
                    </span>
                    <h5 className="font-headline text-xs font-bold text-[#2e3230] mt-1.5 truncate">
                      {name} <span className="font-sans text-[10px] text-[#74796e] font-normal">{company}</span>
                    </h5>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#e4e0d8]/40">
                    <button
                      onClick={() => handlePinFromInbox(item.id, item.contact_id)}
                      className="flex-1 bg-[#4a7c59] text-white text-[10px] font-bold py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 duration-100 hover:bg-[#3d6649] transition-colors font-sans"
                    >
                      <Plus className="h-3 w-3" /> Pin Focus
                    </button>
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      className="p-1.5 bg-[#eae6de] text-[#74796e] hover:text-[#2e3230] hover:bg-[#dbd7cf] rounded-xl transition-colors active:scale-95 duration-100"
                      title="Dismiss"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

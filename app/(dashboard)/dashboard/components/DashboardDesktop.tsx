'use client'

// Desktop Dashboard Component — Styled to match the Terra "Rooted Warmth" design specifications (Image 2 & reference HTML).
import * as React from 'react'
import Link from 'next/link'
import WorkingListDesktopClient from './WorkingListDesktopClient'
import type { Database } from '@/types/supabase'
import { Menu, Heart, MoreHorizontal, Settings } from 'lucide-react'
import QuickNoteDialog from './QuickNoteDialog'
import { formatSnoozedDate } from '@/lib/utils/date'
import { UserAvatar } from '@/components/UserAvatar'

type Contact = Database['public']['Tables']['contacts']['Row']

interface Stats {
  workingListCount: number
  inboxCount: number
  snoozedCount: number
  totalContactsCount: number
}

interface Props {
  profileId: string
  displayName: string
  workingList: Contact[]
  stats: Stats
  avatarUrl: string | null
  healthPercentage: number
  upcomingContacts: Contact[]
  allContacts: Contact[]
}

export default function DashboardDesktop({
  profileId,
  displayName,
  workingList,
  stats,
  avatarUrl,
  healthPercentage,
  upcomingContacts,
  allContacts,
}: Props) {
  const [isQuickNoteOpen, setIsQuickNoteOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Fallback to there if profile has no name, to maintain rooted friendly feeling
  const name = displayName || 'there'

  return (
    <div className="min-h-screen bg-[#faf6f0] pb-24 font-body">
      
      {/* ── Top App Bar ──────────────────────────────────────── */}
      <header className="w-full sticky top-0 z-40 bg-[#faf6f0] shadow-[0_4px_20px_rgba(46,50,48,0.06)] flex items-center justify-between px-8 py-4 border-b border-[#e4e0d8]/30">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <button className="active:scale-95 duration-200 hover:bg-[#f0ece4] p-2 rounded-full transition-colors">
              <Menu className="h-6 w-6 text-[#4a7c59]" />
            </button>
            <h1 className="font-headline text-xl font-bold text-[#4a7c59] tracking-tight">FollowThrough</h1>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link className="text-[#4a7c59] font-bold transition-colors text-sm" href="/dashboard">
              Dashboard
            </Link>
            <Link className="text-[#4a4e4a] hover:bg-[#f0ece4] hover:text-[#2e3230] transition-colors px-3 py-1.5 rounded-xl text-sm font-medium" href="/contacts">
              Contacts
            </Link>
            <Link className="text-[#4a4e4a] hover:bg-[#f0ece4] hover:text-[#2e3230] transition-colors px-3 py-1.5 rounded-xl text-sm font-medium" href="/pipeline">
              Queue
            </Link>
            <Link className="text-[#4a4e4a] hover:bg-[#f0ece4] hover:text-[#2e3230] transition-colors px-3 py-1.5 rounded-xl text-sm font-medium" href="/inbox">
              Inbox
            </Link>
            <Link className="text-[#4a4e4a] hover:bg-[#f0ece4] hover:text-[#2e3230] transition-colors px-3 py-1.5 rounded-xl text-sm font-medium" href="/settings">
              Settings
            </Link>
          </nav>
        </div>
        
        <div className="active:scale-95 duration-200">
          <UserAvatar avatarUrl={avatarUrl} name={name} />
        </div>
      </header>

      {/* ── Main Layout Container ────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        
        {/* ── Hero Summary Section (Grid) ──────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Due Today Card */}
          <div className="md:col-span-8 bg-[#4a7c59] text-white rounded-[20px] p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_4px_20px_rgba(46,50,48,0.06)] min-h-[280px]">
            <div className="relative z-10 my-auto">
              <h2 className="font-headline text-4xl font-semibold mb-2">Hello, {name}.</h2>
              <p className="text-[#d8f0de] text-base leading-relaxed opacity-90 max-w-md">
                You have {stats.workingListCount} critical follow-up{stats.workingListCount !== 1 ? 's' : ''} scheduled for today. Keeping the momentum is the key to deep relationships.
              </p>
              
              <div className="mt-8 flex gap-4">
                <Link
                  href="/contacts"
                  className="bg-[#faf6f0] text-[#4a7c59] font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#faf6f0]/95 transition-colors active:scale-95 duration-200"
                >
                  View Due Today
                </Link>
                <button
                  onClick={() => setIsQuickNoteOpen(true)}
                  className="bg-transparent border border-white/30 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition-colors active:scale-95 duration-200"
                >
                  Quick Note
                </button>
              </div>
            </div>
            
            {/* Abstract Organic Shapes */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#78a886] rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute right-10 top-10 w-24 h-24 bg-[#c4a66a] rounded-full blur-2xl opacity-10 pointer-events-none"></div>
          </div>

          {/* Metric Card: Relationship Health */}
          <div className="md:col-span-4 bg-[#eae6de] rounded-[20px] p-6 flex flex-col shadow-[0_4px_20px_rgba(46,50,48,0.06)] min-h-[280px]">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-headline text-lg font-medium text-[#2e3230]">Relationship Health</h3>
              <Heart className="h-5 w-5 text-[#705c30]" fill="currentColor" />
            </div>
            
            <div className="flex flex-col items-center justify-center flex-grow py-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-[#dbd7cf]" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-[#4a7c59] transition-all duration-1000" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364" strokeDashoffset={364 * (1 - healthPercentage / 100)} strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-headline font-bold text-[#4a7c59]">{healthPercentage}%</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-center text-[#4a4e4a] leading-relaxed px-4">
                Based on follow-up rule intervals. You're staying consistent with your inner circle.
              </p>
            </div>
          </div>

        </div>

        {/* ── Asymmetric Bento Grid for Lists ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Due Today Detailed List */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-semibold text-[#2e3230]">Due Today</h2>
              <Link href="/contacts" className="text-[#4a7c59] font-bold text-sm hover:underline">
                View All
              </Link>
            </div>
            
            <WorkingListDesktopClient workingList={workingList} />
          </div>

          {/* Sidebar Area: Upcoming & Motivation Widget */}
          <div className="space-y-6">
            
            {/* Upcoming Queue */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-2xl font-semibold text-[#2e3230]">Upcoming</h2>
                <button className="text-[#74796e] hover:text-[#2e3230]">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {upcomingContacts.length === 0 ? (
                  <div className="bg-[#f5f1ea]/50 border border-dashed border-[#e4e0d8] p-8 rounded-[20px] text-center flex flex-col items-center justify-center min-h-[140px] text-[#74796e]">
                    <p className="text-sm font-medium">No contacts resurfacing soon.</p>
                  </div>
                ) : (
                  upcomingContacts.map((contact) => {
                    const formattedDate = mounted ? formatSnoozedDate(contact.snoozed_until) : '...'
                    const isSoon = formattedDate === 'Today' || formattedDate === 'Tomorrow'
                    
                    return (
                      <Link
                        key={contact.id}
                        href={`/contacts/${contact.id}`}
                        className="block active:scale-[0.98] transition-transform duration-150"
                      >
                        <div className={`p-5 rounded-[20px] border-l-4 shadow-[0_4px_20px_rgba(46,50,48,0.02)] border transition-all duration-200 hover:shadow-[0_6px_24px_rgba(46,50,48,0.05)] hover:bg-[#eae6de]/40 ${
                          isSoon 
                            ? 'bg-[#faf6f0] border-l-[#705c30] border-[#e4e0d8]/50' 
                            : 'bg-[#f5f1ea] border-l-[#4a7c59]/40 border-[#e4e0d8]/30'
                        }`}>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 font-sans ${
                            isSoon ? 'text-[#705c30]' : 'text-[#4a4e4a]'
                          }`}>
                            {formattedDate}
                          </p>
                          <h4 className="font-headline text-base font-semibold text-[#2e3230]">
                            {contact.first_name} {contact.last_name || ''}
                          </h4>
                          {(contact.job_title || contact.company) && (
                            <p className="text-xs text-[#4a4e4a] mt-1 font-sans">
                              {[contact.job_title, contact.company].filter(Boolean).join(' at ')}
                            </p>
                          )}
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>

            {/* Motivation Widget */}
            <div className="bg-[#c4a66a] text-[#554020] p-6 rounded-[20px] shadow-inner relative overflow-hidden">
              <span className="font-headline text-4xl leading-none absolute top-4 left-4 opacity-15 select-none font-serif">“</span>
              <p className="font-headline italic text-lg leading-relaxed relative z-10 pl-2">
                “The quality of your life is the quality of your relationships.”
              </p>
              <p className="text-xs mt-4 opacity-80 pl-2 font-sans">— Tony Robbins</p>
            </div>

          </div>

        </div>

      </main>

      <QuickNoteDialog
        allContacts={allContacts}
        profileId={profileId}
        open={isQuickNoteOpen}
        onOpenChange={setIsQuickNoteOpen}
      />
    </div>
  )
}

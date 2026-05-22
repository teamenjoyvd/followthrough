'use client'

// Mobile Dashboard Component — Styled to match the Terra "Rooted Warmth" design specifications (Image 2).
import * as React from 'react'
import Link from 'next/link'
import WorkingListMobileClient from './WorkingListMobileClient'
import type { Database } from '@/types/supabase'
import { Menu, Heart, MoreHorizontal, Plus, LayoutDashboard, Users, GitBranch, History } from 'lucide-react'
import QuickNoteDialog from './QuickNoteDialog'

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

export default function DashboardMobile({
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
  // Use there as fallback if profile has no name, to maintain rooted friendly feeling
  const name = displayName || 'there'

  // Timezone-safe date formatter
  const formatSnoozedDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-').map(Number)
    const targetDate = new Date(year, month - 1, day)
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    
    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[#faf6f0] pb-24 font-body">
      
      {/* ── Top App Bar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#faf6f0] shadow-[0_4px_20px_rgba(46,50,48,0.06)] flex items-center justify-between px-6 py-4 w-full border-b border-[#e4e0d8]/30">
        <div className="flex items-center gap-4">
          <button className="active:scale-95 duration-200 hover:bg-[#f0ece4] p-2 rounded-full transition-colors">
            <Menu className="h-6 w-6 text-[#4a7c59]" />
          </button>
          <h1 className="font-headline text-xl font-bold text-[#4a7c59] tracking-tight">FollowThrough</h1>
        </div>
        <div className="active:scale-95 duration-200">
          <img
            alt="User Profile"
            className="w-10 h-10 rounded-full border-2 border-[#c8e8d0] shadow-sm object-cover"
            src={avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBgmqZ-naMC68qyB-8YDoi7m3XwER_oXB6HHtUYgDcXHeZ_uA1WzMzixSyP2IRtf9IKlR0X3ablr-Gn97Xrtx13-Oq-SRLdXF4GQY7-manjSaQV4_k3r4uOfTW7GtQ94NZ_cGHL2bma4C6-08LoNUNrfeJolIuf8ynkxHOp7VefkgBNr1oO2PIjhE4OZpSzYVuelHWp7I6pzuPQcrmsLdOvmIEZ5_2ILbyvtKcfayNUAtIQPNgQWPU0hUUmwj1dvwBSQX_4tmWhUw"}
          />
        </div>
      </header>

      {/* ── Main Content Container ────────────────────────────── */}
      <main className="px-6 py-6 space-y-6">
        
        {/* ── Hero Card ────────────────────────────────────────── */}
        <div className="bg-[#4a7c59] text-white rounded-[20px] p-7 relative overflow-hidden shadow-[0_4px_20px_rgba(46,50,48,0.06)]">
          <div className="relative z-10">
            <h2 className="font-headline text-3xl font-semibold mb-2">Hello, {name}.</h2>
            <p className="text-[#d8f0de] text-sm leading-relaxed opacity-90 max-w-[280px]">
              You have {stats.workingListCount} critical follow-up{stats.workingListCount !== 1 ? 's' : ''} scheduled for today. Keeping the momentum is the key to deep relationships.
            </p>
            
            <div className="mt-6 flex gap-3">
              <Link
                href="/contacts"
                className="bg-[#faf6f0] text-[#4a7c59] font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#faf6f0]/95 transition-colors active:scale-95 duration-200"
              >
                View Due Today
              </Link>
              <button
                onClick={() => setIsQuickNoteOpen(true)}
                className="bg-transparent border border-white/30 text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-white/10 transition-colors active:scale-95 duration-200"
              >
                Quick Note
              </button>
            </div>
          </div>
          
          {/* Abstract Organic Shape (SVG Pattern) */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#78a886] rounded-full blur-3xl opacity-20 pointer-events-none"></div>
          <div className="absolute right-10 top-10 w-24 h-24 bg-[#c4a66a] rounded-full blur-2xl opacity-10 pointer-events-none"></div>
        </div>

        {/* ── Relationship Health Card ─────────────────────────── */}
        <div className="bg-[#eae6de] rounded-[20px] p-6 flex flex-col shadow-[0_4px_20px_rgba(46,50,48,0.06)]">
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

        {/* ── Due Today Section ────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-2xl font-semibold text-[#2e3230]">Due Today</h2>
            <Link href="/contacts" className="text-[#4a7c59] font-bold text-sm hover:underline">
              View All
            </Link>
          </div>
          
          <WorkingListMobileClient workingList={workingList} />
        </div>

        {/* ── Upcoming Section ─────────────────────────────────── */}
        <div className="space-y-4 pt-2">
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
                const formattedDate = formatSnoozedDate(contact.snoozed_until)
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

        {/* ── Motivation Widget ───────────────────────────────── */}
        <div className="bg-[#c4a66a] text-[#554020] p-6 rounded-[20px] mt-8 shadow-inner relative overflow-hidden">
          <span className="font-headline text-4xl leading-none absolute top-4 left-4 opacity-15 select-none font-serif">“</span>
          <p className="font-headline italic text-lg leading-relaxed relative z-10 pl-2">
            "The quality of your life is the quality of your relationships."
          </p>
          <p className="text-xs mt-4 opacity-80 pl-2 font-sans">— Tony Robbins</p>
        </div>

      </main>

      {/* ── FAB ──────────────────────────────────────────────── */}
      <div className="fixed bottom-24 right-6 z-50">
        <Link
          href="/contacts"
          className="bg-[#4a7c59] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(74,124,89,0.3)] active:scale-90 transition-transform duration-150 hover:bg-[#3d664a] flex"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>

      {/* ── Bottom Navigation Bar ────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-6 bg-[#f0ece4] rounded-t-2xl shadow-[0_-4px_20px_rgba(46,50,48,0.04)] border-t border-[#e4e0d8]/40">
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center bg-[#78a886] text-white rounded-full px-5 py-1.5 active:scale-90 transition-transform duration-150 gap-0.5"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="font-label text-[10px] font-semibold font-sans">Dashboard</span>
        </Link>
        
        <Link
          href="/contacts"
          className="flex flex-col items-center justify-center text-[#4a4e4a] opacity-70 hover:opacity-100 transition-all active:scale-90 transition-transform duration-150 gap-0.5"
        >
          <Users className="h-4 w-4" />
          <span className="font-label text-[10px] font-medium font-sans">Contacts</span>
        </Link>
        
        <Link
          href="/pipeline"
          className="flex flex-col items-center justify-center text-[#4a4e4a] opacity-70 hover:opacity-100 transition-all active:scale-90 transition-transform duration-150 gap-0.5"
        >
          <GitBranch className="h-4 w-4" />
          <span className="font-label text-[10px] font-medium font-sans">Queue</span>
        </Link>
        
        <Link
          href="/inbox"
          className="flex flex-col items-center justify-center text-[#4a4e4a] opacity-70 hover:opacity-100 transition-all active:scale-90 transition-transform duration-150 gap-0.5"
        >
          <History className="h-4 w-4" />
          <span className="font-label text-[10px] font-medium font-sans">Inbox</span>
        </Link>
      </nav>

      <QuickNoteDialog
        allContacts={allContacts}
        profileId={profileId}
        open={isQuickNoteOpen}
        onOpenChange={setIsQuickNoteOpen}
      />
    </div>
  )
}

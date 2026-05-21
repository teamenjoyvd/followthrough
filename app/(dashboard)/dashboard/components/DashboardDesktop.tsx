// RSC shell — static sections rendered server-side.
// Mutation logic lives in WorkingListDesktopClient.
import Link from 'next/link'
import WorkingListDesktopClient from './WorkingListDesktopClient'
import type { Database } from '@/types/supabase'

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
}

export default function DashboardDesktop({ profileId, displayName, workingList, stats }: Props) {
  return (
    <div className="min-h-screen bg-background p-8">

      {/* ── Hero Card ────────────────────────────────────────── */}
      <div className="bg-primary text-primary-foreground rounded-xl p-8 mb-8 relative overflow-hidden shadow-[0_8px_32px_rgba(74,124,89,0.25)] max-w-2xl">
        <div className="absolute top-[-48px] right-[-48px] w-48 h-48 rounded-full bg-white/[0.07] pointer-events-none" />
        <div className="absolute bottom-[-28px] right-8 w-24 h-24 rounded-full bg-white/[0.05] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="font-headline text-3xl font-bold mb-2 leading-tight">
            Hello, {displayName}.
          </h1>
          <p className="text-sm leading-relaxed opacity-90 max-w-md" style={{ color: '#d8f0de' }}>
            You have{' '}
            <strong className="text-primary-foreground">
              {stats.workingListCount} follow-up{stats.workingListCount !== 1 ? 's' : ''}
            </strong>{' '}
            on your list. Keeping the momentum is the key to deep relationships.
          </p>
          <div className="flex gap-3 mt-6">
            <Link
              href="/contacts"
              className="bg-background text-primary font-bold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              View Contacts
            </Link>
            <Link
              href="/inbox"
              className="bg-white/15 text-primary-foreground font-bold text-sm px-6 py-2.5 rounded-lg border border-white/25 hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              Inbox{stats.inboxCount > 0 ? ` (${stats.inboxCount})` : ''}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-terra-surface-container-low border border-terra-outline-variant/40 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Working List</div>
          <div className="text-3xl font-extrabold text-foreground">{stats.workingListCount}</div>
          <p className="text-xs text-muted-foreground mt-2">Active follow-ups</p>
        </div>

        <Link
          href="/inbox"
          className="block bg-terra-surface-container-low border border-terra-outline-variant/40 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Inbox</div>
          <div className={`text-3xl font-extrabold ${
            stats.inboxCount > 0 ? 'text-destructive' : 'text-foreground'
          }`}>
            {stats.inboxCount}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Unread notifications</p>
        </Link>

        <div className="bg-terra-surface-container-low border border-terra-outline-variant/40 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Snoozed</div>
          <div className="text-3xl font-extrabold text-foreground">{stats.snoozedCount}</div>
          <p className="text-xs text-muted-foreground mt-2">Waiting to resurface</p>
        </div>

        <Link
          href="/contacts"
          className="block bg-terra-surface-container-low border border-terra-outline-variant/40 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Total Contacts</div>
          <div className="text-3xl font-extrabold text-foreground">{stats.totalContactsCount}</div>
          <p className="text-xs text-muted-foreground mt-2">Database population</p>
        </Link>
      </div>

      {/* ── Main Panels ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-8 items-start">
        {/* Working List — client boundary */}
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <h2 className="font-headline text-2xl font-bold text-foreground">Your Focus List</h2>
            <span className="bg-terra-primary-fixed text-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {workingList.length}
            </span>
          </div>
          <WorkingListDesktopClient workingList={workingList} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Inbox callout */}
          <div className="bg-terra-surface-container-low border border-terra-outline-variant/40 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-base font-bold text-foreground">Your Inbox</h3>
              {stats.inboxCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-destructive animate-ping" />
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Check notification logs, resurfaced reminders, and sync conflicts.
            </p>
            {stats.inboxCount > 0 ? (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                <span className="text-xs text-destructive font-semibold">
                  {stats.inboxCount} unread notification{stats.inboxCount !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-terra-primary-fixed/50 border border-primary/20 rounded-xl">
                <span className="text-xs text-primary font-semibold">All notifications read!</span>
              </div>
            )}
            <Link
              href="/inbox"
              className="mt-5 inline-flex items-center justify-center w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Go to Inbox
            </Link>
          </div>

          {/* Quote widget */}
          <div className="bg-terra-tertiary-container text-terra-on-tertiary-container rounded-xl p-6">
            <p className="font-headline italic text-base leading-relaxed mb-3">
              &ldquo;The quality of your life is the quality of your relationships.&rdquo;
            </p>
            <p className="text-xs opacity-75">&mdash; Tony Robbins</p>
          </div>

          {/* Getting started */}
          <div className="bg-primary rounded-xl p-6 text-primary-foreground">
            <h3 className="font-headline text-sm font-bold mb-2 opacity-80">Getting Started</h3>
            <p className="text-xs leading-relaxed mb-4 opacity-75">
              Browse your contact index and tap &ldquo;Add to Focus&rdquo; to pin contacts to your working list.
            </p>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Browse Contacts &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

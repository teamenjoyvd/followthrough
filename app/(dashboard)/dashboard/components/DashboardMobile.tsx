// RSC shell — static sections rendered server-side.
// Mutation logic lives in WorkingListMobileClient below.
import Link from 'next/link'
import WorkingListMobileClient from './WorkingListMobileClient'
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

export default function DashboardMobile({ profileId, displayName, workingList, stats }: Props) {
  return (
    <div className="min-h-screen bg-background px-4 pt-6 pb-28">

      {/* ── Hero Card ────────────────────────────────────────── */}
      <div className="bg-primary text-primary-foreground rounded-xl p-7 mb-6 relative overflow-hidden shadow-[0_8px_32px_rgba(74,124,89,0.3)]">
        {/* Decorative circles */}
        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-white/[0.07] pointer-events-none" />
        <div className="absolute bottom-[-24px] right-6 w-20 h-20 rounded-full bg-white/[0.05] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="font-headline text-2xl font-bold mb-2 leading-tight">
            Hello, {displayName}.
          </h1>
          <p className="text-sm leading-relaxed opacity-90" style={{ color: '#d8f0de' }}>
            You have{' '}
            <strong className="text-primary-foreground">
              {stats.workingListCount} follow-up{stats.workingListCount !== 1 ? 's' : ''}
            </strong>{' '}
            on your list. Keeping the momentum is the key to deep relationships.
          </p>
          <div className="flex gap-3 mt-5">
            <Link
              href="/contacts"
              className="bg-background text-primary font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              View Contacts
            </Link>
            <Link
              href="/inbox"
              className="bg-white/15 text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-lg border border-white/25 hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              Inbox{stats.inboxCount > 0 ? ` (${stats.inboxCount})` : ''}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────── */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x mb-6">
        <div className="flex-none w-[136px] bg-terra-surface-container-low border border-terra-outline-variant/40 rounded-xl p-4 shadow-sm snap-start">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Focus</div>
          <div className="text-2xl font-extrabold text-foreground">{stats.workingListCount}</div>
          <div className="text-[10px] text-muted-foreground mt-1">On list</div>
        </div>

        <Link
          href="/inbox"
          className="flex-none w-[136px] bg-terra-surface-container-low border border-terra-outline-variant/40 rounded-xl p-4 shadow-sm snap-start"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Inbox</div>
          <div className={`text-2xl font-extrabold ${
            stats.inboxCount > 0 ? 'text-destructive' : 'text-foreground'
          }`}>
            {stats.inboxCount}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Unread</div>
        </Link>

        <div className="flex-none w-[136px] bg-terra-surface-container-low border border-terra-outline-variant/40 rounded-xl p-4 shadow-sm snap-start">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Snoozed</div>
          <div className="text-2xl font-extrabold text-foreground">{stats.snoozedCount}</div>
          <div className="text-[10px] text-muted-foreground mt-1">Waiting</div>
        </div>

        <Link
          href="/contacts"
          className="flex-none w-[136px] bg-terra-surface-container-low border border-terra-outline-variant/40 rounded-xl p-4 shadow-sm snap-start"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Total</div>
          <div className="text-2xl font-extrabold text-foreground">{stats.totalContactsCount}</div>
          <div className="text-[10px] text-muted-foreground mt-1">Contacts</div>
        </Link>
      </div>

      {/* ── Working List (client boundary) ───────────────────────── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline text-xl font-bold text-foreground">
            Focus List
          </h2>
          <span className="bg-terra-primary-fixed text-primary text-xs font-bold px-2 py-0.5 rounded-full">
            {workingList.length}
          </span>
        </div>
        <WorkingListMobileClient workingList={workingList} />
      </div>

      {/* ── Quote Widget ───────────────────────────────────────── */}
      <div className="bg-terra-tertiary-container text-terra-on-tertiary-container rounded-xl p-6 mt-2">
        <p className="font-headline italic text-base leading-relaxed mb-3">
          &ldquo;The quality of your life is the quality of your relationships.&rdquo;
        </p>
        <p className="text-xs opacity-75">&mdash; Tony Robbins</p>
      </div>
    </div>
  )
}

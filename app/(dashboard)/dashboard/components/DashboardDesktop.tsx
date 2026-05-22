// Desktop Dashboard Component — Styled to match the Terra "Rooted Warmth" design specifications (Image 2 & reference HTML).
import Link from 'next/link'
import WorkingListDesktopClient from './WorkingListDesktopClient'
import type { Database } from '@/types/supabase'
import { Menu, Heart, MoreHorizontal, LayoutDashboard, Users, GitBranch, History } from 'lucide-react'

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
}

export default function DashboardDesktop({ profileId, displayName, workingList, stats, avatarUrl, healthPercentage }: Props) {
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
              History
            </Link>
          </nav>
        </div>
        
        <div className="active:scale-95 duration-200">
          <img
            alt="User Profile"
            className="w-10 h-10 rounded-full border-2 border-[#c8e8d0] shadow-sm object-cover"
            src={avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBgmqZ-naMC68qyB-8YDoi7m3XwER_oXB6HHtUYgDcXHeZ_uA1WzMzixSyP2IRtf9IKlR0X3ablr-Gn97Xrtx13-Oq-SRLdXF4GQY7-manjSaQV4_k3r4uOfTW7GtQ94NZ_cGHL2bma4C6-08LoNUNrfeJolIuf8ynkxHOp7VefkgBNr1oO2PIjhE4OZpSzYVuelHWp7I6pzuPQcrmsLdOvmIEZ5_2ILbyvtKcfayNUAtIQPNgQWPU0hUUmwj1dvwBSQX_4tmWhUw"}
          />
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
                <Link
                  href="/contacts"
                  className="bg-transparent border border-white/30 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Quick Note
                </Link>
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
                  <circle className="text-[#4a7c59] transition-all duration-1000" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364" stroke-dashoffset={364 * (1 - healthPercentage / 100)} strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-headline font-bold text-[#4a7c59]">{healthPercentage}%</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-center text-[#4a4e4a] leading-relaxed px-4">
                Up 5% from last month. You're staying consistent with your inner circle.
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
                {/* Team Sync-up */}
                <div className="bg-[#faf6f0] p-5 rounded-[20px] relative overflow-hidden border-l-4 border-[#705c30] shadow-[0_4px_20px_rgba(46,50,48,0.02)] border border-[#e4e0d8]/50">
                  <p className="text-[10px] font-bold text-[#705c30] uppercase tracking-widest mb-1 font-sans">Tomorrow</p>
                  <h4 className="font-headline text-base font-semibold text-[#2e3230] mb-3">Team Sync-up</h4>
                  
                  <div className="flex -space-x-2 items-center">
                    <img
                      alt="Team member"
                      className="w-6 h-6 rounded-full border-2 border-[#faf6f0] object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwQwIvivkauD3UBt9MGdMBo5Dk5HU6mW4rkrElMqduJql-TVXVfqqrfsY9E08D-R7cK0xWZsQQbukKZB9V9E3ZDmVQVCX734dXJe9BlCrR9UUeF2TYuFfg4DiV8tMEoe0Y0WZsDT7UM5STOAF-vjcwY2DVllZMBKcQqHc4iOj2h2vZT3G_Zc83qOF2nCdPC3aGlPg34OqmujLmq_SWfyTkNgzTaDEOS5AnTZADNjjjziuDKrEtrgmKnRi6TPn0FEGdW2ssVw2GrA"
                    />
                    <img
                      alt="Team member"
                      className="w-6 h-6 rounded-full border-2 border-[#faf6f0] object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN3Xyqj-6CP-V80X_jZ7Hb6vn0PeqQbKaz3GekZU7gx5t8yG3L__-oYTNDHHyWt6fbs03a2JMS477vXNRe014O7JF9Xaxb6KaAZfBZPCFzGoJUWnmXh-LcdBvaQjq0qotP2jvuvdIuR1V7TTR4Z1V8ArqNGjLclQITirDHGbr-egxnvWjMjFFIBexzgyBO0wAMvqEk-m0rH5hKKRgFhjCqV0hFinGWrZTIEM-Vx8ksANf4dCNcGtbAINDLx4TZMMX-uaFQ2P_Jww"
                    />
                    <div className="w-6 h-6 rounded-full border-2 border-[#faf6f0] bg-[#f0ece4] flex items-center justify-center text-[10px] font-bold text-[#4a4e4a] font-sans">
                      +3
                    </div>
                  </div>
                </div>

                {/* Quarterly Review */}
                <div className="bg-[#f5f1ea] p-5 rounded-[20px] border-l-4 border-[#4a7c59]/40 shadow-[0_4px_20px_rgba(46,50,48,0.02)] border border-[#e4e0d8]/30">
                  <p className="text-[10px] font-bold text-[#4a4e4a] uppercase tracking-widest mb-1 font-sans">Oct 24</p>
                  <h4 className="font-headline text-base font-semibold text-[#2e3230]">Quarterly Review</h4>
                  <p className="text-xs text-[#4a4e4a] mt-1 font-sans">Dr. Aris Vancamp</p>
                </div>

                {/* Podcast Introduction */}
                <div className="bg-[#f5f1ea] p-5 rounded-[20px] border-l-4 border-[#4a7c59]/40 shadow-[0_4px_20px_rgba(46,50,48,0.02)] border border-[#e4e0d8]/30">
                  <p className="text-[10px] font-bold text-[#4a4e4a] uppercase tracking-widest mb-1 font-sans">Oct 26</p>
                  <h4 className="font-headline text-base font-semibold text-[#2e3230]">Podcast Introduction</h4>
                  <p className="text-xs text-[#4a4e4a] mt-1 font-sans">Lina S. & David M.</p>
                </div>
              </div>
            </div>

            {/* Motivation Widget */}
            <div className="bg-[#c4a66a] text-[#554020] p-6 rounded-[20px] shadow-inner relative overflow-hidden">
              <span className="font-headline text-4xl leading-none absolute top-4 left-4 opacity-15 select-none font-serif">“</span>
              <p className="font-headline italic text-lg leading-relaxed relative z-10 pl-2">
                "The quality of your life is the quality of your relationships."
              </p>
              <p className="text-xs mt-4 opacity-80 pl-2 font-sans">— Tony Robbins</p>
            </div>

          </div>

        </div>

      </main>

    </div>
  )
}

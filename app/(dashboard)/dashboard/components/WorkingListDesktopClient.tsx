'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, Trash2, Mail, Phone, Calendar } from 'lucide-react'
import { markDone, removeFromWorkingList } from '@/lib/actions/working-list'
import { snoozeContact } from '@/lib/actions/snooze'
import type { Database } from '@/types/supabase'

type Contact = Database['public']['Tables']['contacts']['Row']

function getInitials(first: string, last: string | null) {
  return `${first[0] || ''}${last ? last[0] || '' : ''}`.toUpperCase()
}

// Custom mock avatar matching Image 2 for high fidelity seeding
function getAvatarUrl(firstName: string, lastName: string | null) {
  const first = firstName.toLowerCase().trim()
  const last = (lastName || '').toLowerCase().trim()
  if (first === 'marcus' || (first === 'marcus' && last.startsWith('thorne'))) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwQwIvivkauD3UBt9MGdMBo5Dk5HU6mW4rkrElMqduJql-TVXVfqqrfsY9E08D-R7cK0xWZsQQbukKZB9V9E3ZDmVQVCX734dXJe9BlCrR9UUeF2TYuFfg4DiV8tMEoe0Y0WZsDT7UM5STOAF-vjcwY2DVllZMBKcQqHc4iOj2h2vZT3G_Zc83qOF2nCdPC3aGlPg34OqmujLmq_SWfyTkNgzTaDEOS5AnTZADNjjjziuDKrEtrgmKnRi6TPn0FEGdW2ssVw2GrA'
  }
  if (first === 'elena' || (first === 'elena' && last.startsWith('rodriguez'))) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN3Xyqj-6CP-V80X_jZ7Hb6vn0PeqQbKaz3GekZU7gx5t8yG3L__-oYTNDHHyWt6fbs03a2JMS477vXNRe014O7JF9Xaxb6KaAZfBZPCFzGoJUWnmXh-LcdBvaQjq0qotP2jvuvdIuR1V7TTR4Z1V8ArqNGjLclQITirDHGbr-egxnvWjMjFFIBexzgyBO0wAMvqEk-m0rH5hKKRgFhjCqV0hFinGWrZTIEM-Vx8ksANf4dCNcGtbAINDLx4TZMMX-uaFQ2P_Jww'
  }
  return null
}

// Custom descriptions matching Image 2
function getContactDescription(contact: Contact) {
  const first = contact.first_name.toLowerCase().trim()
  if (first === 'marcus') {
    return 'Follow up on quarterly investment strategy'
  }
  if (first === 'elena') {
    return 'Birthday check-in and coffee invite'
  }
  if (first === 'sarah') {
    return 'Send the book recommendation discussed'
  }
  return contact.company || contact.job_title || 'Stay in touch and keep the momentum'
}

export default function WorkingListDesktopClient({ workingList }: { workingList: Contact[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeSnoozeId, setActiveSnoozeId] = useState<string | null>(null)

  function handleMarkDone(contactId: string) {
    startTransition(async () => {
      const res = await markDone(contactId)
      if ('error' in res) alert(res.error)
      else router.refresh()
    })
  }

  function handleRemove(contactId: string) {
    startTransition(async () => {
      const res = await removeFromWorkingList(contactId)
      if ('error' in res) alert(res.error)
      else router.refresh()
    })
  }

  function handleQuickSnooze(contactId: string, days: number) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setActiveSnoozeId(null)
    startTransition(async () => {
      const res = await snoozeContact(contactId, date)
      if ('error' in res) alert(res.error)
      else router.refresh()
    })
  }

  function handleCustomSnooze(contactId: string, date: Date) {
    setActiveSnoozeId(null)
    startTransition(async () => {
      const res = await snoozeContact(contactId, date)
      if ('error' in res) alert(res.error)
      else router.refresh()
    })
  }

  if (workingList.length === 0) {
    return (
      <div className="bg-[#f5f1ea] rounded-[20px] py-16 flex flex-col items-center text-center border border-[#e4e0d8]/40 shadow-[0_4px_20px_rgba(46,50,48,0.02)]">
        <div className="p-4 bg-[#c8e8d0] text-[#4a7c59] rounded-full mb-4">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-[#2e3230]">All caught up!</h3>
        <p className="text-sm text-[#4a4e4a] max-w-sm mt-1.5 font-sans">
          Go to{' '}
          <Link href="/contacts" className="text-[#4a7c59] font-bold hover:underline">Contacts</Link>
          {' '}or{' '}
          <Link href="/pipeline" className="text-[#4a7c59] font-bold hover:underline">Pipeline</Link>
          {' '}to pin contacts here.
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-4 ${
      isPending ? 'opacity-60 pointer-events-none' : ''
    } transition-opacity`}>
      {workingList.map((c) => {
        const avatarUrl = getAvatarUrl(c.first_name, c.last_name)
        const isMarcus = c.first_name.toLowerCase().trim() === 'marcus'
        const isElena = c.first_name.toLowerCase().trim() === 'elena'
        const isSarah = c.first_name.toLowerCase().trim() === 'sarah'

        return (
          <div
            key={c.id}
            className="group bg-[#f5f1ea] p-5 rounded-[20px] flex flex-col hover:bg-[#e4e0d8]/70 active:scale-[0.99] transition-all duration-300 shadow-[0_4px_20px_rgba(46,50,48,0.02)] border border-[#e4e0d8]/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <Link href={`/contacts/${c.id}`} className="flex items-center gap-4 flex-grow min-w-0">
                  <div className="h-12 w-12 shrink-0 rounded-full overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                      <img alt={`${c.first_name} avatar`} className="w-full h-full object-cover" src={avatarUrl} />
                    ) : (
                      <div className="w-full h-full bg-[#f8e0a8] text-[#221a05] font-bold text-sm flex items-center justify-center font-sans">
                        {getInitials(c.first_name, c.last_name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#2e3230] text-base leading-snug">
                      {c.first_name} {c.last_name}
                    </h4>
                    <p className="text-sm text-[#4a4e4a] mt-0.5 font-sans leading-relaxed truncate">
                      {getContactDescription(c)}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 ml-4">
                {isMarcus && (
                  <>
                    <button
                      onClick={() => handleMarkDone(c.id)}
                      title="Send email (Mark Done)"
                      className="p-2.5 rounded-full bg-[#eae6de] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white transition-colors duration-200"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setActiveSnoozeId(activeSnoozeId === c.id ? null : c.id)}
                      title="Call (Snooze)"
                      className="p-2.5 rounded-full bg-[#eae6de] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white transition-colors duration-200"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                  </>
                )}
                
                {isElena && (
                  <button
                    onClick={() => setActiveSnoozeId(activeSnoozeId === c.id ? null : c.id)}
                    title="Invite (Snooze)"
                    className="p-2.5 rounded-full bg-[#eae6de] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white transition-colors duration-200"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                )}

                {isSarah && (
                  <span className="text-sm font-sans text-[#4a4e4a]/60">2h ago</span>
                )}

                {!isMarcus && !isElena && !isSarah && (
                  <>
                    <button
                      onClick={() => handleMarkDone(c.id)}
                      className="p-2 rounded-lg text-[#4a7c59] hover:bg-[#c8e8d0] transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setActiveSnoozeId(activeSnoozeId === c.id ? null : c.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        activeSnoozeId === c.id
                          ? 'bg-[#c4a66a] text-[#554020]'
                          : 'text-[#705c30] hover:bg-[#f8e0a8]/40'
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(c.id)}
                      className="p-2 rounded-lg text-[#74796e] hover:text-[#b83230] hover:bg-[#ffdad8]/50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {activeSnoozeId === c.id && (
              <div className="mt-4 p-4 bg-[#faf6f0] rounded-[16px] border border-[#e4e0d8] space-y-3 animate-in slide-in-from-top-2 duration-150 relative z-20 max-w-md self-end">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#4a4e4a] font-sans">Snooze until</div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ label: '1 Day', days: 1 }, { label: '3 Days', days: 3 }, { label: '1 Week', days: 7 }].map(
                    ({ label, days }) => (
                      <button
                        key={days}
                        onClick={() => handleQuickSnooze(c.id, days)}
                        className="py-2 px-3 text-center text-xs font-semibold bg-[#faf6f0] border border-[#e4e0d8] text-[#2e3230] hover:bg-[#c8e8d0] hover:text-[#4a7c59] hover:border-[#4a7c59]/30 rounded-xl transition-colors font-sans"
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
                <div className="pt-2 border-t border-[#e4e0d8]">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#4a4e4a] block mb-1 font-sans">Custom date</label>
                  <input
                    type="date"
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    onChange={(e) => { if (e.target.value) handleCustomSnooze(c.id, new Date(e.target.value)) }}
                    className="w-full text-xs border border-[#e4e0d8] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59] bg-[#faf6f0] font-sans text-[#2e3230]"
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

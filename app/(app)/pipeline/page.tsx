import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import PipelineDesktop from './components/PipelineDesktop'
import PipelineMobile from './components/PipelineMobile'
import type { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Pipeline — Followthrough',
  description: 'View and manage your contact pipeline.',
}

export default async function PipelinePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createSupabaseServerClient()

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id, pipeline_view')
    .eq('clerk_id', userId)
    .maybeSingle() as { data: { id: string; pipeline_view: string } | null }

  if (!profile) redirect('/sign-in')

  const { data: contacts = [] } = await (supabase as any)
    .from('contacts')
    .select('id, first_name, last_name, company, pipeline_status, last_contacted_at')
    .eq('profile_id', profile.id)
    .order('first_name', { ascending: true }) as {
      data: Array<Database['public']['Tables']['contacts']['Row']> | null
    }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-gray-900">Pipeline</h1>
      </div>

      {/* Kanban — desktop only */}
      <PipelineDesktop contacts={contacts ?? []} profileId={profile.id} />

      {/* List — mobile only (+ desktop fallback when pipeline_view=list) */}
      <PipelineMobile
        contacts={contacts ?? []}
        profileId={profile.id}
        defaultView={profile.pipeline_view}
      />
    </div>
  )
}

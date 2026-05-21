import { PipelineKanban } from './PipelineKanban'
import type { Database } from '@/types/supabase'

type Contact = Pick<
  Database['public']['Tables']['contacts']['Row'],
  'id' | 'first_name' | 'last_name' | 'company' | 'pipeline_status' | 'last_contacted_at'
>

interface Props {
  contacts: Contact[]
  profileId: string
}

export default function PipelineDesktop({ contacts, profileId }: Props) {
  return (
    <div className="hidden md:flex flex-1 overflow-hidden">
      <PipelineKanban contacts={contacts} profileId={profileId} />
    </div>
  )
}

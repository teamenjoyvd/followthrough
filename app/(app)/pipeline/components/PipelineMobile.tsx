import { PipelineList } from './PipelineList'
import type { Database } from '@/types/supabase'

type Contact = Pick<
  Database['public']['Tables']['contacts']['Row'],
  'id' | 'first_name' | 'last_name' | 'company' | 'pipeline_status' | 'last_contacted_at'
>

interface Props {
  contacts: Contact[]
  profileId: string
  defaultView: string
}

export default function PipelineMobile({ contacts, profileId, defaultView }: Props) {
  // Shown on mobile always; also shown on desktop when pipeline_view is 'list'
  return (
    <div className={`flex flex-col flex-1 overflow-hidden ${
      defaultView === 'list' ? 'flex' : 'md:hidden flex'
    }`}>
      <PipelineList contacts={contacts} profileId={profileId} />
    </div>
  )
}

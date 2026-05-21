import type { Database } from '@/types/supabase'

type InteractionRow = Database['public']['Tables']['interactions']['Row']
type CallDetail = Database['public']['Tables']['call_details']['Row']
type EmailDetail = Database['public']['Tables']['email_details']['Row']
type NoteDetail = Database['public']['Tables']['note_details']['Row']

export type InteractionWithDetails = InteractionRow & {
  call_details: Pick<CallDetail, 'outcome' | 'duration_seconds' | 'summary'> | null
  email_details: Pick<EmailDetail, 'subject' | 'body'> | null
  note_details: Pick<NoteDetail, 'body'> | null
}

type ContactRow = Database['public']['Tables']['contacts']['Row']

export type ContactSummary = Pick<
  ContactRow,
  'id' | 'first_name' | 'last_name' | 'company' | 'job_title' | 'email' | 'last_contacted_at' | 'pipeline_status'
>

export interface ContactDetailProps {
  contact: ContactSummary
  interactions: InteractionWithDetails[]
  profileId: string
}

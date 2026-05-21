export interface InboxItem {
  id: string
  type: 'resurfaced' | 'working_list_changed' | 'sync_conflict'
  contact_id: string | null
  payload: Record<string, any>
  read: boolean
  created_at: string
  contacts: {
    first_name: string
    last_name: string | null
    company: string | null
    pipeline_status: string
  } | null
}

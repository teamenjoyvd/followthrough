export interface HistoryItem {
  id: string
  action_type: string
  entity_type: string
  entity_id: string | null
  created_at: string
  undo_expires_at: string | null
  undone_at: string | null
  contact_first_name: string | null
  contact_last_name: string | null
}

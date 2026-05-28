export interface SyncStep {
  label: string
  status: 'ok' | 'error' | 'warn'
  detail?: string
}

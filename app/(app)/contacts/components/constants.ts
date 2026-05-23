import type { Database } from '@/types/supabase'

type PipelineStatus = Database['public']['Enums']['pipeline_status']

export const PIPELINE_STATUSES: { value: PipelineStatus; label: string; color: string }[] = [
  { value: 'lead', label: 'Lead', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'qualified', label: 'Qualified', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  { value: 'bought', label: 'Bought', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'leave_alone', label: 'Leave alone', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { value: 'snoozed', label: 'Snoozed', color: 'bg-amber-100 text-amber-800 border-amber-200' },
]

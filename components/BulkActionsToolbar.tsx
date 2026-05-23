'use client'

import { useState, useTransition } from 'react'
import { Trash2, Tag, Calendar, ChevronRight, X, ArrowRightLeft, Loader2, Check } from 'lucide-react'
import { bulkUpdateContacts, bulkDeleteContacts, bulkManageContactLabels } from '@/lib/actions/contacts'
import { PIPELINE_STATUSES } from '@/app/(app)/contacts/components/constants'
import { getLabelColorClass, type Label } from '@/components/LabelManager'

interface BulkActionsToolbarProps {
  selectedIds: string[]
  onClearSelection: () => void
  labels: Label[]
}

export default function BulkActionsToolbar({
  selectedIds,
  onClearSelection,
  labels,
}: BulkActionsToolbarProps) {
  const [isPending, startTransition] = useTransition()
  const [activeMenu, setActiveMenu] = useState<'status' | 'label' | 'snooze' | null>(null)
  
  if (selectedIds.length === 0) return null

  const handleStatusChange = (status: any) => {
    startTransition(async () => {
      const res = await bulkUpdateContacts(selectedIds, { pipeline_status: status })
      if ('error' in res) {
        alert(res.error)
      } else {
        onClearSelection()
        setActiveMenu(null)
      }
    })
  }

  const handleLabelManage = (labelId: string, action: 'assign' | 'clear') => {
    startTransition(async () => {
      const res = await bulkManageContactLabels(selectedIds, [labelId], action)
      if ('error' in res) {
        alert(res.error)
      } else {
        onClearSelection()
        setActiveMenu(null)
      }
    })
  }

  const handleSnoozeChange = (days: number | null) => {
    startTransition(async () => {
      let snoozeDate: string | null = null
      if (days !== null) {
        const d = new Date()
        d.setDate(d.getDate() + days)
        snoozeDate = d.toISOString()
      }
      const res = await bulkUpdateContacts(selectedIds, { snooze_until: snoozeDate })
      if ('error' in res) {
        alert(res.error)
      } else {
        onClearSelection()
        setActiveMenu(null)
      }
    })
  }

  const handleDelete = () => {
    if (
      !confirm(
        `Are you sure you want to mass delete ${selectedIds.length} contact(s)? This action will permanently cascade delete all associated interactions and phone numbers, and cannot be undone.`
      )
    ) {
      return
    }

    startTransition(async () => {
      const res = await bulkDeleteContacts(selectedIds)
      if ('error' in res) {
        alert(res.error)
      } else {
        onClearSelection()
        setActiveMenu(null)
      }
    })
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-2xl bg-[#2e3230] text-[#faf6f0] rounded-[24px] shadow-[0_10px_35px_rgba(46,50,48,0.25)] border border-[#4a4e4a] py-3.5 px-5 flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 font-body">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-xs font-bold font-body">
            {selectedIds.length}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#eae6de]">
            selected contacts
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveMenu(activeMenu ? null : null)}
            className="text-[#74796e] hover:text-[#eae6de] p-1 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" onClick={onClearSelection} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-[#4a4e4a] pt-3">
        {/* Bulk Pipeline Change */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'status' ? null : 'status')}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeMenu === 'status'
                ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
                : 'bg-transparent text-[#eae6de] border-[#4a4e4a] hover:bg-[#4a4e4a]'
            }`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Update Status</span>
          </button>

          {activeMenu === 'status' && (
            <div className="absolute bottom-11 left-0 z-50 w-44 bg-[#2e3230] border border-[#4a4e4a] rounded-xl py-1.5 shadow-xl animate-in fade-in duration-100">
              {PIPELINE_STATUSES.map((st) => (
                <button
                  key={st.value}
                  onClick={() => handleStatusChange(st.value)}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#eae6de] hover:bg-[#4a7c59] hover:text-white transition-colors"
                >
                  {st.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Labels Change */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'label' ? null : 'label')}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeMenu === 'label'
                ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
                : 'bg-transparent text-[#eae6de] border-[#4a4e4a] hover:bg-[#4a4e4a]'
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Manage Labels</span>
          </button>

          {activeMenu === 'label' && (
            <div className="absolute bottom-11 left-0 z-50 w-52 bg-[#2e3230] border border-[#4a4e4a] rounded-xl p-2 shadow-xl animate-in fade-in duration-100 space-y-2">
              <span className="block text-[9px] font-bold text-[#74796e] uppercase tracking-wider px-1">Global Tag List</span>
              {labels.length === 0 ? (
                <p className="text-[10px] text-[#74796e] italic px-1">No labels created. Go to labels widget first.</p>
              ) : (
                <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1">
                  {labels.map((lbl) => (
                    <div key={lbl.id} className="flex items-center justify-between gap-1 p-1 hover:bg-[#4a4e4a] rounded-lg transition-colors">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border ${getLabelColorClass(lbl.color)}`}>
                        {lbl.name}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLabelManage(lbl.id, 'assign')}
                          className="px-1 py-0.5 rounded text-[9px] font-bold bg-[#4a7c59] text-white hover:bg-[#3d6b4a]"
                          title="Assign to all selected"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => handleLabelManage(lbl.id, 'clear')}
                          className="px-1 py-0.5 rounded text-[9px] font-bold bg-[#b83230] text-white hover:bg-[#a12f2c]"
                          title="Remove from all selected"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bulk Snooze */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'snooze' ? null : 'snooze')}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeMenu === 'snooze'
                ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
                : 'bg-transparent text-[#eae6de] border-[#4a4e4a] hover:bg-[#4a4e4a]'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Snooze Follow-up</span>
          </button>

          {activeMenu === 'snooze' && (
            <div className="absolute bottom-11 left-0 z-50 w-44 bg-[#2e3230] border border-[#4a4e4a] rounded-xl py-1.5 shadow-xl animate-in fade-in duration-100">
              <button
                onClick={() => handleSnoozeChange(7)}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#eae6de] hover:bg-[#4a7c59] hover:text-white transition-colors"
              >
                Snooze 7 Days
              </button>
              <button
                onClick={() => handleSnoozeChange(30)}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#eae6de] hover:bg-[#4a7c59] hover:text-white transition-colors"
              >
                Snooze 30 Days
              </button>
              <button
                onClick={() => handleSnoozeChange(90)}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#eae6de] hover:bg-[#4a7c59] hover:text-white transition-colors"
              >
                Snooze 90 Days
              </button>
              <button
                onClick={() => handleSnoozeChange(null)}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#b83230] hover:bg-[#b83230] hover:text-white border-t border-[#4a4e4a] mt-1 transition-colors"
              >
                Clear Snooze
              </button>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mass Delete button */}
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#b83230]/20 hover:bg-[#b83230] text-[#ff7875] hover:text-white border border-[#b83230]/40 hover:border-transparent transition-all duration-200"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          <span>Delete Selected</span>
        </button>
      </div>
    </div>
  )
}

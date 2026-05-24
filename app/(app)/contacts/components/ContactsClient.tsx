'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Upload, Download, Tag, Loader2 } from 'lucide-react'
import ContactsDesktop from './ContactsDesktop'
import ContactsMobile from './ContactsMobile'
import CSVImportModal from '@/components/CSVImportModal'
import LabelManager from '@/components/LabelManager'
import BulkActionsToolbar from '@/components/BulkActionsToolbar'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type { Label } from '@/components/LabelManager'
import type { Database } from '@/types/supabase'
import { bulkUpdateContacts, bulkDeleteContacts, bulkManageContactLabels } from '@/lib/actions/contacts'

type ContactRow = Database['public']['Tables']['contacts']['Row'] & {
  phone_numbers?: { number: string }[]
  contact_labels?: { label_id: string }[]
  created_by_source?: string
  last_updated_by_source?: string
  source_detail?: string | null
}

interface ContactsClientProps {
  contacts: ContactRow[]
  allFilteredIds: string[]
  labels: Label[]
  sortKey: any
  sortDir: any
  currentQuery: string
  currentStatus: string
  currentLastContacted: string
  currentCompany: string
}

export default function ContactsClient({
  contacts,
  allFilteredIds,
  labels,
  sortKey,
  sortDir,
  currentQuery,
  currentStatus,
  currentLastContacted,
  currentCompany,
}: ContactsClientProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false)

  const [isProcessing, setIsProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)
  const [totalToProcess, setTotalToProcess] = useState(0)
  const [processingMessage, setProcessingMessage] = useState('')

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === contacts.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(contacts.map((c) => c.id)))
  }

  const handleClearSelection = () => setSelectedIds(new Set())

  const startBatchProcess = async (
    message: string,
    idsToProcess: string[],
    actionFn: (batch: string[]) => Promise<{ success: true } | { error: string }>
  ) => {
    setIsProcessing(true)
    setProcessedCount(0)
    setTotalToProcess(idsToProcess.length)
    setProcessingMessage(message)

    const batchSize = 100
    const items = [...idsToProcess]

    try {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        const res = await actionFn(batch)
        if ('error' in res) throw new Error(res.error)
        setProcessedCount(Math.min(i + batch.length, items.length))
      }
      setSelectedIds(new Set())
      setIsProcessing(false)
      router.refresh()
    } catch (err: any) {
      alert(`Batch operation failed: ${err.message}`)
      setIsProcessing(false)
    }
  }

  const handleStatusChange = (status: any) => {
    startBatchProcess('Updating pipeline statuses...', Array.from(selectedIds), async (batch) => {
      return await bulkUpdateContacts(batch, { pipeline_status: status })
    })
  }

  const handleLabelManage = (labelId: string, action: 'assign' | 'clear') => {
    startBatchProcess(
      action === 'assign' ? 'Assigning tag labels...' : 'Clearing tag labels...',
      Array.from(selectedIds),
      async (batch) => {
        return await bulkManageContactLabels(batch, [labelId], action)
      }
    )
  }

  const handleSnoozeChange = (days: number | null) => {
    let snoozeDate: string | null = null
    if (days !== null) {
      const d = new Date()
      d.setDate(d.getDate() + days)
      snoozeDate = d.toISOString()
    }
    const finalDate = snoozeDate
    startBatchProcess('Scheduling snooze follow-ups...', Array.from(selectedIds), async (batch) => {
      return await bulkUpdateContacts(batch, { snooze_until: finalDate })
    })
  }

  // Called from ConfirmDialog onConfirm — no native confirm()
  const executeBulkDelete = () => {
    startBatchProcess('Cascade deleting selected contacts...', Array.from(selectedIds), async (batch) => {
      return await bulkDeleteContacts(batch)
    })
  }

  const handleExportCSV = () => {
    const headers = [
      'First Name', 'Last Name', 'Email', 'Phone', 'Company',
      'Job Title', 'Status', 'Created Source', 'Last Changed', 'Labels',
    ]
    const csvRows = [headers.join(',')]

    contacts.forEach((c) => {
      const labelNames =
        c.contact_labels
          ?.map((cl: any) => {
            const found = labels.find((l) => l.id === cl.label_id)
            return found ? found.name : ''
          })
          .filter(Boolean)
          .join('; ') || ''

      const primaryPhone = c.phone_numbers?.[0]?.number || ''

      const row = [
        `"${(c.first_name || '').replace(/"/g, '""')}"`,
        `"${(c.last_name || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(primaryPhone || '').replace(/"/g, '""')}"`,
        `"${(c.company || '').replace(/"/g, '""')}"`,
        `"${(c.job_title || '').replace(/"/g, '""')}"`,
        `"${(c.pipeline_status || '').replace(/"/g, '""')}"`,
        `"${(c.created_by_source || '').replace(/"/g, '""')}"`,
        `"${(c.last_updated_by_source || '').replace(/"/g, '""')}"`,
        `"${labelNames.replace(/"/g, '""')}"`,
      ]
      csvRows.push(row.join(','))
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'crm_contacts_export.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const isPageFullySelected = contacts.length > 0 && selectedIds.size === contacts.length
  const isAllMatchingSelected = selectedIds.size === allFilteredIds.length && allFilteredIds.length > contacts.length

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#faf6f0]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-4 border-b border-[#e4e0d8] bg-[#faf6f0] shrink-0 gap-3">
        <h1 className="font-headline text-2xl font-bold text-[#2e3230]">Contacts</h1>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e4e0d8] bg-[#f5f1ea] text-[#74796e] hover:text-[#2e3230] text-xs font-semibold hover:bg-[#eae6de] transition-all shadow-sm active:scale-95 duration-200"
            title="Export listed contacts to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e4e0d8] bg-[#f5f1ea] text-[#74796e] hover:text-[#2e3230] text-xs font-semibold hover:bg-[#eae6de] transition-all shadow-sm active:scale-95 duration-200"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setIsLabelManagerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e4e0d8] bg-[#f5f1ea] text-[#74796e] hover:text-[#2e3230] text-xs font-semibold hover:bg-[#eae6de] transition-all shadow-sm active:scale-95 duration-200"
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Manage Labels</span>
          </button>

          <Link
            href="/contacts/new"
            id="new-contact-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4a7c59] text-white text-xs font-semibold hover:bg-[#3d6b4a] transition-all duration-200 hover:scale-[1.02] shadow-sm active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New contact</span>
          </Link>
        </div>
      </div>

      {isPageFullySelected && allFilteredIds.length > contacts.length && (
        <div className="bg-[#4a7c59]/10 border border-[#4a7c59]/20 px-4 py-3 rounded-xl mx-4 md:mx-6 my-2 text-xs font-semibold text-[#2e3230] flex flex-wrap items-center justify-between gap-2 font-body animate-in fade-in slide-in-from-top-1">
          <span>All <strong>{selectedIds.size}</strong> contacts on this page are selected.</span>
          <button
            onClick={() => setSelectedIds(new Set(allFilteredIds))}
            className="text-[#4a7c59] hover:underline font-bold"
          >
            Select all {allFilteredIds.length} contacts matching this query
          </button>
        </div>
      )}

      {isAllMatchingSelected && (
        <div className="bg-[#4a7c59] text-white px-4 py-3 rounded-xl mx-4 md:mx-6 my-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 font-body animate-in fade-in slide-in-from-top-1 shadow-sm">
          <span>All <strong>{selectedIds.size}</strong> contacts matching your active filters are selected.</span>
          <button onClick={handleClearSelection} className="text-white underline hover:no-underline font-bold">
            Clear selection
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-[#faf6f0] pb-24">
        <ContactsDesktop
          contacts={contacts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          labels={labels}
          sortKey={sortKey}
          sortDir={sortDir}
          currentQuery={currentQuery}
          currentStatus={currentStatus}
          currentLastContacted={currentLastContacted}
          currentCompany={currentCompany}
        />
        <ContactsMobile
          contacts={contacts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          labels={labels}
        />
      </div>

      {/* Bulk Actions Toolbar — delete action wrapped with ConfirmDialog */}
      <BulkActionsToolbar
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
        labels={labels}
        onStatusChange={handleStatusChange}
        onLabelManage={handleLabelManage}
        onSnoozeChange={handleSnoozeChange}
        onDelete={() => {/* no-op: ConfirmDialog intercepts below */}}
        deleteOverride={
          <ConfirmDialog
            title={`Delete ${selectedIds.size} contact${selectedIds.size !== 1 ? 's' : ''}?`}
            description="This will permanently delete all selected contacts and their associated interactions. This cannot be undone."
            confirmLabel={`Delete ${selectedIds.size} contact${selectedIds.size !== 1 ? 's' : ''}`}
            destructive
            onConfirm={executeBulkDelete}
          />
        }
      />

      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center font-body animate-in fade-in duration-200">
          <div className="bg-[#faf6f0] border border-[#e4e0d8] rounded-[24px] p-6 shadow-[0_10px_35px_rgba(46,50,48,0.25)] max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="font-headline text-lg font-bold text-[#2e3230]">{processingMessage}</h3>
            <div className="w-full bg-[#eae6de] h-2.5 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-[#4a7c59] h-full rounded-full transition-all duration-300"
                style={{ width: `${(processedCount / totalToProcess) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#74796e] font-semibold">
              <span>{Math.round((processedCount / totalToProcess) * 100)}% Completed</span>
              <span>{processedCount} / {totalToProcess}</span>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#4a7c59]" />
              <span className="text-xs text-[#74796e] font-bold">Processing batches...</span>
            </div>
          </div>
        </div>
      )}

      <CSVImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <LabelManager
        isOpen={isLabelManagerOpen}
        onClose={() => setIsLabelManagerOpen(false)}
        labels={labels}
      />
    </div>
  )
}

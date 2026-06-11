'use client'

import { useState, useOptimistic, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Download, Upload, Tag, Loader2, Trash2, MoreHorizontal } from 'lucide-react'
import ContactsDesktop from './ContactsDesktop'
import ContactsMobile from './ContactsMobile'
import CSVImportModal from '@/components/CSVImportModal'
import LabelManager from '@/components/LabelManager'
import BulkActionsToolbar from '@/components/BulkActionsToolbar'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Label } from '@/components/LabelManager'
import type { Database } from '@/types/supabase'
import { bulkUpdateContacts, bulkDeleteContacts, bulkManageContactLabels } from '@/lib/actions/contacts'
import { toggleFocus } from '../actions/toggleFocus'

type ContactRow = Database['public']['Tables']['contacts']['Row'] & {
  phone_numbers?: { number: string }[]
  contact_labels?: { label_id: string }[]
  created_by_source?: string
  last_updated_by_source?: string
  source_detail?: string | null
}

interface ContactsClientProps {
  contacts: ContactRow[]
  labels: Label[]
  sortKey: any
  sortDir: any
  currentQuery: string
  currentLastContacted: string
  currentCompany: string
  currentFocused?: string
  desktopFilterBar?: React.ReactNode
}

export default function ContactsClient({
  contacts,
  labels,
  sortKey,
  sortDir,
  currentQuery,
  currentLastContacted,
  currentCompany,
  currentFocused = '',
  desktopFilterBar,
}: ContactsClientProps) {
  const router = useRouter()
  const [, startPinTransition] = useTransition()

  const [optimisticContacts, setOptimisticPin] = useOptimistic(
    contacts,
    (prev: ContactRow[], { id, value }: { id: string; value: boolean }) =>
      prev.map((c) => (c.id === id ? { ...c, on_working_list: value } : c)),
  )

  const handleTogglePin = (id: string, currentValue: boolean) => {
    startPinTransition(async () => {
      setOptimisticPin({ id, value: !currentValue })
      const result = await toggleFocus(id, currentValue)
      if ('error' in result) {
        router.refresh()
      }
    })
  }

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false)

  const [isProcessing, setIsProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)
  const [totalToProcess, setTotalToProcess] = useState(0)
  const [processingMessage, setProcessingMessage] = useState('')

  // Clear selection whenever the contacts list changes (page nav, filter change)
  useEffect(() => {
    setSelectedIds(new Set())
  }, [contacts])

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

  const executeBulkDelete = () => {
    startBatchProcess('Cascade deleting selected contacts...', Array.from(selectedIds), async (batch) => {
      return await bulkDeleteContacts(batch)
    })
  }

  const handleExportCSV = () => {
    const headers = [
      'First Name', 'Last Name', 'Email', 'Phone', 'Company',
      'Job Title', 'Created Source', 'Last Changed', 'Labels',
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

  const count = selectedIds.size

  // ── Shared actions dropdown (render function, not component) ────────────────
  const renderActionsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#eae6de] text-[#74796e] hover:bg-[#dedad2] hover:text-[#2e3230] active:scale-95 transition-all duration-100"
          aria-label="More actions"
          title="More actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onSelect={() => setIsLabelManagerOpen(true)}
          className="gap-2 cursor-pointer"
        >
          <Tag className="h-4 w-4 text-[#74796e]" />
          Manage Labels
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleExportCSV}
          className="gap-2 cursor-pointer"
        >
          <Download className="h-4 w-4 text-[#74796e]" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setIsImportOpen(true)}
          className="gap-2 cursor-pointer"
        >
          <Upload className="h-4 w-4 text-[#74796e]" />
          Import CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#faf6f0]">

      {/* ── Mobile heading ── */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-[#e4e0d8] bg-[#faf6f0] shrink-0">
        <h1 className="font-headline text-2xl font-bold text-[#2e3230]">Contacts</h1>
        <div className="flex items-center gap-2">
          {renderActionsDropdown()}
          <Link
            href="/contacts/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4a7c59] text-white text-xs font-semibold hover:bg-[#3d6b4a] transition-all duration-200 shadow-sm active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            New contact
          </Link>
        </div>
      </div>

      {/* ── Desktop header + filter bar (single combined row) ── */}
      <div className="hidden md:flex items-start justify-between gap-4 px-4 md:px-6 py-3 border-b border-[#e4e0d8] bg-[#faf6f0] shrink-0">
        <h1 className="font-headline text-2xl font-bold text-[#2e3230] shrink-0 pt-0.5">Contacts</h1>
        {desktopFilterBar && (
          <div className="flex-1 min-w-0">{desktopFilterBar}</div>
        )}
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          {renderActionsDropdown()}
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

      <div className="flex-1 overflow-y-auto bg-[#faf6f0] pb-24">
        <ContactsDesktop
          contacts={optimisticContacts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onTogglePin={handleTogglePin}
          labels={labels}
          sortKey={sortKey}
          sortDir={sortDir}
          currentQuery={currentQuery}
          currentLastContacted={currentLastContacted}
          currentCompany={currentCompany}
          currentFocused={currentFocused}
        />
        <ContactsMobile
          contacts={optimisticContacts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onTogglePin={handleTogglePin}
          labels={labels}
        />
      </div>

      <BulkActionsToolbar
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
        labels={labels}
        onLabelManage={handleLabelManage}
        onSnoozeChange={handleSnoozeChange}
        onDelete={() => { /* no-op: replaced by deleteOverride */ }}
        deleteOverride={
          <ConfirmDialog
            title={`Delete ${count} contact${count !== 1 ? 's' : ''}?`}
            description="This will permanently delete all selected contacts and their associated interactions. This cannot be undone."
            confirmLabel={`Delete ${count} contact${count !== 1 ? 's' : ''}`}
            destructive
            onConfirm={executeBulkDelete}
          >
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#b83230]/20 hover:bg-[#b83230] text-[#ff7875] hover:text-white border border-[#b83230]/40 hover:border-transparent transition-all duration-200">
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected</span>
            </button>
          </ConfirmDialog>
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

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Upload, Download, Tag, FileSpreadsheet } from 'lucide-react'
import ContactsDesktop from './ContactsDesktop'
import ContactsMobile from './ContactsMobile'
import CSVImportModal from '@/components/CSVImportModal'
import LabelManager from '@/components/LabelManager'
import BulkActionsToolbar from '@/components/BulkActionsToolbar'
import type { Label } from '@/components/LabelManager'

interface ContactsClientProps {
  contacts: any[]
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
  labels,
  sortKey,
  sortDir,
  currentQuery,
  currentStatus,
  currentLastContacted,
  currentCompany,
}: ContactsClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false)

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(contacts.map((c) => c.id))
    }
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  const handleExportCSV = () => {
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Company',
      'Job Title',
      'Status',
      'Created Source',
      'Last Changed',
      'Labels',
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
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#faf6f0]">
      {/* Header Controls Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-4 border-b border-[#e4e0d8] bg-[#faf6f0] shrink-0 gap-3">
        <h1 className="font-headline text-2xl font-bold text-[#2e3230]">Contacts</h1>
        
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e4e0d8] bg-[#f5f1ea] text-[#74796e] hover:text-[#2e3230] text-xs font-semibold hover:bg-[#eae6de] transition-all shadow-sm active:scale-95 duration-200"
            title="Export listed contacts to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Import CSV button */}
          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e4e0d8] bg-[#f5f1ea] text-[#74796e] hover:text-[#2e3230] text-xs font-semibold hover:bg-[#eae6de] transition-all shadow-sm active:scale-95 duration-200"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV</span>
          </button>

          {/* Manage Labels button */}
          <button
            onClick={() => setIsLabelManagerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e4e0d8] bg-[#f5f1ea] text-[#74796e] hover:text-[#2e3230] text-xs font-semibold hover:bg-[#eae6de] transition-all shadow-sm active:scale-95 duration-200"
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Manage Labels</span>
          </button>

          {/* New Contact */}
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

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto bg-[#faf6f0] pb-24">
        {/* Desktop View */}
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
        
        {/* Mobile View */}
        <ContactsMobile
          contacts={contacts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          labels={labels}
        />
      </div>

      {/* Bulk Actions Sliding Floating Toolbar */}
      <BulkActionsToolbar
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
        labels={labels}
      />

      {/* CSV Import Modal */}
      <CSVImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />

      {/* Relationship Label Manager */}
      <LabelManager
        isOpen={isLabelManagerOpen}
        onClose={() => setIsLabelManagerOpen(false)}
        labels={labels}
      />
    </div>
  )
}

'use client'

import { useState, useTransition, useRef } from 'react'
import { Upload, ArrowRight, Check, AlertCircle, FileSpreadsheet, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import Papa from 'papaparse'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { importContactsFromCSV } from '@/lib/actions/contacts'

interface CSVImportModalProps {
  isOpen: boolean
  onClose: () => void
}

const TARGET_FIELDS = [
  { key: 'first_name', label: 'First Name (Required)', required: true },
  { key: 'last_name', label: 'Last Name', required: false },
  { key: 'phone', label: 'Phone Number', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'company', label: 'Company', required: false },
  { key: 'job_title', label: 'Job Title', required: false },
] as const

interface SkippedRecord {
  row: number
  raw: string
}

export default function CSVImportModal({ isOpen, onClose }: CSVImportModalProps) {
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Steps: 'upload' | 'mapping' | 'preview'
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload')
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [parsedRows, setParsedRows] = useState<string[][]>([])

  // Mapping state: key is target field, value is index of csv header
  const [mapping, setMapping] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)

  // Preview / Dry run stats
  const [validRecords, setValidRecords] = useState<any[]>([])
  const [skippedRecords, setSkippedRecords] = useState<SkippedRecord[]>([])
  const [showSkipped, setShowSkipped] = useState(false)

  const resetState = () => {
    setStep('upload')
    setFileName('')
    setHeaders([])
    setParsedRows([])
    setMapping({})
    setError(null)
    setValidRecords([])
    setSkippedRecords([])
    setShowSkipped(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError(null)

    Papa.parse<string[]>(file, {
      skipEmptyLines: 'greedy',
      complete: (results) => {
        try {
          const grid = results.data

          if (!grid || grid.length === 0) {
            setError('The uploaded CSV file is empty')
            return
          }

          const csvHeaders = grid[0]
          const csvRows = grid.slice(1).filter((row) => row.some((val) => val && val.trim() !== ''))

          setHeaders(csvHeaders)
          setParsedRows(csvRows)

          // Auto-mapping heuristics
          const initialMapping: Record<string, number> = {}
          TARGET_FIELDS.forEach((field) => {
            const matchIndex = csvHeaders.findIndex((h) => {
              const hLower = h.toLowerCase().replace(/[^a-z0-9]/g, '')
              const fLower = field.key.toLowerCase().replace(/[^a-z0-9]/g, '')
              return (
                hLower === fLower ||
                hLower.includes(fLower) ||
                fLower.includes(hLower) ||
                (field.key === 'phone' && (hLower === 'tel' || hLower === 'mobile' || hLower === 'number')) ||
                (field.key === 'first_name' && (hLower === 'name' || hLower === 'givenname'))
              )
            })
            if (matchIndex !== -1) {
              initialMapping[field.key] = matchIndex
            }
          })

          setMapping(initialMapping)
          setStep('mapping')
        } catch (err: any) {
          setError('Failed to parse CSV file: ' + err.message)
        }
      },
      error: (err) => {
        setError('Failed to parse CSV file: ' + err.message)
      }
    })
  }

  const handleMappingSubmit = () => {
    if (mapping.first_name === undefined || mapping.first_name === -1) {
      setError('First Name is a required field mapping.')
      return
    }

    setError(null)

    const valid: any[] = []
    const skipped: SkippedRecord[] = []

    parsedRows.forEach((row, index) => {
      const firstNameVal = row[mapping.first_name]
      if (!firstNameVal?.trim()) {
        // Row number is 1-based relative to data rows (excluding header)
        skipped.push({ row: index + 1, raw: firstNameVal ?? '' })
        return
      }

      const record: Record<string, string> = {
        first_name: firstNameVal.trim()
      }

      TARGET_FIELDS.forEach((field) => {
        if (field.key !== 'first_name') {
          const idx = mapping[field.key]
          if (idx !== undefined && idx !== -1) {
            record[field.key] = row[idx]?.trim() || ''
          }
        }
      })

      valid.push(record)
    })

    setValidRecords(valid)
    setSkippedRecords(skipped)
    setShowSkipped(false)
    setStep('preview')
  }

  const handleImport = () => {
    setError(null)
    startTransition(async () => {
      const res = await importContactsFromCSV(fileName, validRecords)
      if ('error' in res) {
        setError(res.error)
      } else {
        alert(`Successfully imported ${res.imported} contacts!`)
        onClose()
        resetState()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-[calc(100%-32px)]">
        <DialogHeader>
          <DialogTitle>Import Contacts from CSV</DialogTitle>
          <DialogDescription>
            Import lists of sales contacts or leads directly into your CRM workspace.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-[#fbf0f0] border border-[#f2d8d7] rounded-xl text-xs text-[#a14b49] font-medium font-body flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Upload File */}
        {step === 'upload' && (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#e4e0d8] hover:border-[#4a7c59]/50 rounded-[20px] p-8 text-center bg-[#f5f1ea]/30 transition-all duration-300">
            <Upload className="h-10 w-10 text-[#74796e] mb-3" />
            <h3 className="text-sm font-semibold text-[#2e3230] mb-1 font-headline">Choose a CSV file to upload</h3>
            <p className="text-xs text-[#74796e] mb-4 font-body max-w-sm">
              Any spreadsheet exported in comma-separated value format will work. You will map columns in the next step.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3d6b4a] transition-all shadow-sm active:scale-95 duration-200"
            >
              Select CSV File
            </button>
          </div>
        )}

        {/* Step 2: Columns Mapping */}
        {step === 'mapping' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]">
              <FileSpreadsheet className="h-5 w-5 text-[#4a7c59]" />
              <span className="text-xs font-semibold text-[#2e3230] truncate">{fileName}</span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              <span className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider mb-2">Map CSV columns to CRM fields</span>

              {TARGET_FIELDS.map((field) => (
                <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]/80 hover:bg-[#eae6de]/50 transition-colors">
                  <span className="text-xs font-semibold text-[#2e3230] font-body">
                    {field.label}
                  </span>

                  <select
                    value={mapping[field.key] !== undefined ? mapping[field.key] : -1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      setMapping({ ...mapping, [field.key]: val })
                    }}
                    className="text-xs border border-[#e4e0d8] rounded-lg px-2 py-1 bg-white text-[#2e3230] font-medium focus:outline-none focus:ring-1 focus:ring-[#4a7c59] cursor-pointer"
                  >
                    <option value={-1}>-- Skip column --</option>
                    {headers.map((h, index) => (
                      <option key={index} value={index}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#e4e0d8]">
              <button
                onClick={resetState}
                className="text-xs font-semibold text-[#74796e] hover:text-[#2e3230]"
              >
                Back to upload
              </button>
              <button
                onClick={handleMappingSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4a7c59] text-white text-xs font-semibold hover:bg-[#3d6b4a] transition-all shadow-sm active:scale-95 duration-200"
              >
                <span>Preview Import</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Dry-run Verification & Preview */}
        {step === 'preview' && (
          <div className="space-y-4 animate-in fade-in duration-200 font-body">
            {/* Summary card */}
            <div className="p-4 rounded-xl bg-[#eae6de]/40 border border-[#e4e0d8] space-y-2">
              <h4 className="text-sm font-semibold text-[#2e3230] font-headline">Import Dry Run Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <span className="text-[#74796e] block">Ready to Import</span>
                  <span className="text-lg font-bold text-[#4a7c59]">{validRecords.length} contacts</span>
                </div>
                <div>
                  <span className="text-[#74796e] block">Skipped (No first name)</span>
                  <span className="text-lg font-bold text-[#b83230]">{skippedRecords.length} records</span>
                </div>
              </div>
            </div>

            {/* Skipped rows — collapsible, only shown when there are skipped rows */}
            {skippedRecords.length > 0 && (
              <div className="border border-[#f2d8d7] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSkipped(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-[#fbf0f0] text-xs font-semibold text-[#a14b49] hover:bg-[#f9e8e8] transition-colors"
                >
                  <span>{showSkipped ? 'Hide' : 'Show'} skipped rows ({skippedRecords.length})</span>
                  {showSkipped ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                {showSkipped && (
                  <table className="w-full text-left text-xs border-t border-[#f2d8d7]">
                    <thead>
                      <tr className="bg-[#fdf5f5] text-[#a14b49]">
                        <th className="px-3 py-2 font-semibold w-16">Row #</th>
                        <th className="px-3 py-2 font-semibold">Name column value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2d8d7]">
                      {skippedRecords.map((r) => (
                        <tr key={r.row} className="bg-white">
                          <td className="px-3 py-2 text-[#74796e] font-mono">{r.row}</td>
                          <td className="px-3 py-2 text-[#a14b49] italic">
                            {r.raw === '' ? <span className="text-[#b0aea8]">(empty)</span> : r.raw}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Valid records preview */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider">Previewing first 5 rows</span>
              <div className="border border-[#e4e0d8] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f1ea] border-b border-[#e4e0d8] text-[#74796e]">
                      <th className="p-2 font-semibold">Name</th>
                      <th className="p-2 font-semibold">Phone</th>
                      <th className="p-2 font-semibold">Company</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4e0d8]/50">
                    {validRecords.slice(0, 5).map((r, i) => (
                      <tr key={i} className="hover:bg-[#f5f1ea]/30">
                        <td className="p-2 font-semibold text-[#2e3230]">{r.first_name} {r.last_name || ''}</td>
                        <td className="p-2 text-[#595e55]">{r.phone || '—'}</td>
                        <td className="p-2 text-[#74796e]">{r.company || '—'}</td>
                      </tr>
                    ))}
                    {validRecords.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-[#74796e] italic">No valid records found to import.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#e4e0d8]">
              <button
                onClick={() => setStep('mapping')}
                disabled={isPending}
                className="text-xs font-semibold text-[#74796e] hover:text-[#2e3230]"
              >
                Back to mapping
              </button>
              <button
                onClick={handleImport}
                disabled={isPending || validRecords.length === 0}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3d6b4a] transition-all disabled:opacity-50 shadow-sm active:scale-95 duration-200"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Confirm Import</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

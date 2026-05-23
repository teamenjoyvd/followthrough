'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { createLabel, updateLabel, deleteLabel } from '@/lib/actions/contacts'

export interface Label {
  id: string
  name: string
  color: string
}

interface LabelManagerProps {
  isOpen: boolean
  onClose: () => void
  labels: Label[]
}

export const TERRA_LABEL_COLORS = [
  {
    name: 'Sage',
    value: 'bg-[#e6eeea] text-[#335c43] border-[#c2ded0]',
    preview: '#4a7c59'
  },
  {
    name: 'Ochre',
    value: 'bg-[#fbf4ea] text-[#8c6239] border-[#f0dfcc]',
    preview: '#b8860b'
  },
  {
    name: 'Rose',
    value: 'bg-[#fbf0f0] text-[#a14b49] border-[#f2d8d7]',
    preview: '#bc5a58'
  },
  {
    name: 'Blue',
    value: 'bg-[#f0f4fb] text-[#3e649e] border-[#d8e3f2]',
    preview: '#3b5998'
  },
  {
    name: 'Charcoal',
    value: 'bg-[#eaebeb] text-[#373b3e] border-[#d1d5db]',
    preview: '#4b5563'
  }
]

export default function LabelManager({ isOpen, onClose, labels }: LabelManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(TERRA_LABEL_COLORS[0].value)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setError(null)
    startTransition(async () => {
      const res = await createLabel(newName, newColor)
      if ('error' in res) {
        setError(res.error)
      } else {
        setNewName('')
        setNewColor(TERRA_LABEL_COLORS[0].value)
      }
    })
  }

  const handleUpdate = (id: string) => {
    if (!editName.trim()) return

    setError(null)
    startTransition(async () => {
      const res = await updateLabel(id, editName, editColor)
      if ('error' in res) {
        setError(res.error)
      } else {
        setEditingId(null)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this label? It will be removed from all assigned contacts.')) return

    setError(null)
    startTransition(async () => {
      const res = await deleteLabel(id)
      if ('error' in res) {
        setError(res.error)
      }
    })
  }

  const startEdit = (label: Label) => {
    setEditingId(label.id)
    setEditName(label.name)
    setEditColor(label.color)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[calc(100%-32px)]">
        <DialogHeader>
          <DialogTitle>Manage Relationship Labels</DialogTitle>
          <DialogDescription>
            Create and edit global labels to categorize your corporate contacts.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-[#fbf0f0] border border-[#f2d8d7] rounded-xl text-xs text-[#a14b49] font-medium font-body">
            {error}
          </div>
        )}

        {/* Create label form */}
        <form onSubmit={handleCreate} className="space-y-3.5 border-b border-[#e4e0d8] pb-5">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New label name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 text-sm border border-[#e4e0d8] rounded-xl px-3 py-2 bg-[#f5f1ea] text-[#2e3230] placeholder-[#74796e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent transition-all shadow-sm font-semibold"
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending || !newName.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3d6b4a] transition-all disabled:opacity-50 disabled:scale-100 shadow-sm active:scale-95 duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <span className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider">Label Color Theme</span>
            <div className="flex gap-2">
              {TERRA_LABEL_COLORS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setNewColor(col.value)}
                  className={`h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center`}
                  style={{ backgroundColor: col.preview, borderColor: newColor === col.value ? '#2e3230' : 'transparent' }}
                  title={col.name}
                >
                  {newColor === col.value && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Labels list */}
        <div className="max-h-[250px] overflow-y-auto space-y-2.5 pr-1 font-body">
          <span className="block text-[10px] font-bold text-[#74796e] uppercase tracking-wider">Existing Labels ({labels.length})</span>
          {labels.length === 0 ? (
            <p className="text-xs text-[#74796e] italic py-4 text-center">No labels created yet.</p>
          ) : (
            labels.map((label) => (
              <div
                key={label.id}
                className="flex items-center justify-between p-2 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8] shadow-sm hover:scale-[1.01] transition-transform duration-200"
              >
                {editingId === label.id ? (
                  <div className="flex-1 flex flex-col gap-2 mr-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-xs border border-[#e4e0d8] rounded-lg px-2.5 py-1.5 bg-white text-[#2e3230] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] w-full font-semibold"
                      disabled={isPending}
                    />
                    <div className="flex gap-1.5">
                      {TERRA_LABEL_COLORS.map((col) => (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => setEditColor(col.value)}
                          className="h-6 w-6 rounded-full border transition-all flex items-center justify-center"
                          style={{ backgroundColor: col.preview, borderColor: editColor === col.value ? '#2e3230' : 'transparent' }}
                        >
                          {editColor === col.value && <Check className="h-3.5 w-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${label.color}`}>
                    {label.name}
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {editingId === label.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(label.id)}
                        disabled={isPending}
                        className="h-7 w-7 rounded-lg hover:bg-[#eae6de] text-[#4a7c59] flex items-center justify-center transition-colors"
                        title="Save changes"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="h-7 w-7 rounded-lg hover:bg-[#eae6de] text-[#74796e] flex items-center justify-center transition-colors"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(label)}
                        className="h-7 w-7 rounded-lg hover:bg-[#eae6de] text-[#74796e] hover:text-[#2e3230] flex items-center justify-center transition-colors"
                        title="Edit label"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(label.id)}
                        disabled={isPending}
                        className="h-7 w-7 rounded-lg hover:bg-[#eae6de] text-[#b83230] flex items-center justify-center transition-colors"
                        title="Delete label"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

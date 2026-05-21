'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { moveContact } from '@/lib/actions/pipeline'
import { PIPELINE_STATUSES } from '@/app/(app)/contacts/components/PipelineStatusControl'
import type { Database } from '@/types/supabase'

type PipelineStatus = Database['public']['Enums']['pipeline_status']
type Contact = Pick<
  Database['public']['Tables']['contacts']['Row'],
  'id' | 'first_name' | 'last_name' | 'company' | 'pipeline_status' | 'last_contacted_at'
>

interface Props {
  contacts: Contact[]
  profileId: string
}

function ContactCard({ contact, isDragging }: { contact: Contact; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: contact.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm cursor-grab active:cursor-grabbing select-none"
    >
      <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
      {contact.company && (
        <p className="text-xs text-gray-500 truncate mt-0.5">{contact.company}</p>
      )}
    </div>
  )
}

function DragCard({ contact }: { contact: Contact }) {
  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
  return (
    <div className="bg-white border border-indigo-300 rounded-lg px-3 py-2.5 shadow-lg rotate-2 cursor-grabbing">
      <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
      {contact.company && (
        <p className="text-xs text-gray-500 truncate mt-0.5">{contact.company}</p>
      )}
    </div>
  )
}

export function PipelineKanban({ contacts, profileId }: Props) {
  const [items, setItems] = useState<Contact[]>(contacts)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const grouped = PIPELINE_STATUSES.reduce<Record<PipelineStatus, Contact[]>>(
    (acc, { value }) => {
      acc[value] = items.filter((c) => c.pipeline_status === value)
      return acc
    },
    {} as Record<PipelineStatus, Contact[]>,
  )

  const findColumn = useCallback(
    (contactId: string): PipelineStatus | null => {
      const contact = items.find((c) => c.id === contactId)
      return contact?.pipeline_status ?? null
    },
    [items],
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeStatus = findColumn(active.id as string)
    // over.id could be a contact id or a column id (status value)
    const overStatus = (PIPELINE_STATUSES.find((s) => s.value === over.id)
      ? over.id
      : findColumn(over.id as string)) as PipelineStatus | null

    if (!activeStatus || !overStatus || activeStatus === overStatus) return

    setItems((prev) =>
      prev.map((c) =>
        c.id === (active.id as string) ? { ...c, pipeline_status: overStatus } : c,
      ),
    )
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const contact = items.find((c) => c.id === (active.id as string))
    if (!contact) return

    const originalContact = contacts.find((c) => c.id === (active.id as string))
    if (!originalContact || contact.pipeline_status === originalContact.pipeline_status) return

    setIsPending(true)
    const result = await moveContact(contact.id, contact.pipeline_status, profileId)
    setIsPending(false)

    if ('error' in result) {
      // Revert optimistic update on failure
      setItems((prev) =>
        prev.map((c) =>
          c.id === contact.id ? { ...c, pipeline_status: originalContact.pipeline_status } : c,
        ),
      )
    }
  }

  const activeContact = activeId ? items.find((c) => c.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* opacity-70 indicates background save; pointer-events kept so user can scroll */}
      <div className={`flex gap-3 p-4 overflow-x-auto h-full ${isPending ? 'opacity-70' : ''}`}>
        {PIPELINE_STATUSES.map(({ value, label, color }) => (
          <div
            key={value}
            id={value}
            className="flex flex-col w-52 shrink-0"
          >
            {/* Column header */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mb-2 self-start ${color}`}>
              {label}
              <span className="text-current opacity-60">({grouped[value]?.length ?? 0})</span>
            </div>

            {/* Drop zone */}
            <SortableContext
              items={grouped[value]?.map((c) => c.id) ?? []}
              strategy={verticalListSortingStrategy}
            >
              <div
                className="flex flex-col gap-2 flex-1 min-h-16 rounded-lg bg-gray-50 border border-dashed border-gray-200 p-2"
              >
                {grouped[value]?.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    isDragging={contact.id === activeId}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeContact ? <DragCard contact={activeContact} /> : null}
      </DragOverlay>
    </DndContext>
  )
}

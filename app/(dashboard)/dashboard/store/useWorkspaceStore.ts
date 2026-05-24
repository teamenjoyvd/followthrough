import { create } from 'zustand'
import type { Database } from '@/types/supabase'
import { addToWorkingList, removeFromWorkingList, markDone } from '@/lib/actions/working-list'
import { snoozeContact } from '@/lib/actions/snooze'
import { bulkManageContactLabels, updateContactDescription as updateContactDescriptionAction } from '@/lib/actions/contacts'

type Contact = Database['public']['Tables']['contacts']['Row']

interface Stats {
  workingListCount: number
  inboxCount: number
  snoozedCount: number
  totalContactsCount: number
}

interface WorkspaceState {
  workingList: Contact[]
  allContacts: Contact[]
  selectedContact: Contact | null
  stats: Stats
  completedTodayCount: number
  dailyGoal: number
  streakDays: number
  activeTab: 'focus' | 'upcoming' | 'stats'
  isPending: boolean
  
  // Actions
  setInitialData: (
    workingList: Contact[], 
    allContacts: Contact[], 
    stats: Stats,
    completedTodayCount: number,
    streakDays: number
  ) => void
  setSelectedContact: (contact: Contact | null) => void
  setActiveTab: (tab: 'focus' | 'upcoming' | 'stats') => void
  
  // Optimistic Workspace Operations
  pinContact: (contactId: string) => Promise<{ success: boolean; error?: string }>
  unpinContact: (contactId: string) => Promise<{ success: boolean; error?: string }>
  markContactDone: (contactId: string) => Promise<{ success: boolean; error?: string }>
  snoozeContact: (contactId: string, daysOrDate: number | Date) => Promise<{ success: boolean; error?: string }>
  updateContactDescription: (contactId: string, description: string) => Promise<{ success: boolean; error?: string }>
  toggleContactLabel: (contactId: string, labelId: string, action: 'assign' | 'clear') => Promise<{ success: boolean; error?: string }>
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workingList: [],
  allContacts: [],
  selectedContact: null,
  stats: {
    workingListCount: 0,
    inboxCount: 0,
    snoozedCount: 0,
    totalContactsCount: 0
  },
  completedTodayCount: 0,
  dailyGoal: 8,
  streakDays: 0,
  activeTab: 'focus',
  isPending: false,

  setInitialData: (workingList, allContacts, stats, completedTodayCount, streakDays) => {
    set({
      workingList,
      allContacts,
      stats,
      completedTodayCount,
      streakDays,
      selectedContact: get().selectedContact || workingList[0] || null
    })
  },

  setSelectedContact: (contact) => set({ selectedContact: contact }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  pinContact: async (contactId) => {
    const { allContacts, workingList, stats } = get()
    const contact = allContacts.find(c => c.id === contactId)
    if (!contact || workingList.some(c => c.id === contactId)) return { success: false }

    const updatedContact = { ...contact, on_working_list: true, working_list_added_at: new Date().toISOString() }
    const newWorkingList = [...workingList, updatedContact]
    
    // Optimistic Update
    set({
      workingList: newWorkingList,
      stats: { ...stats, workingListCount: newWorkingList.length },
      selectedContact: get().selectedContact || updatedContact
    })

    const res = await addToWorkingList(contactId)
    if ('error' in res) {
      // Rollback
      set({
        workingList,
        stats
      })
      return { success: false, error: res.error }
    }

    return { success: true }
  },

  unpinContact: async (contactId) => {
    const { workingList, stats, selectedContact } = get()
    const newWorkingList = workingList.filter(c => c.id !== contactId)
    
    // Optimistic Update
    set({
      workingList: newWorkingList,
      stats: { ...stats, workingListCount: newWorkingList.length },
      selectedContact: selectedContact?.id === contactId ? newWorkingList[0] || null : selectedContact
    })

    const res = await removeFromWorkingList(contactId)
    if ('error' in res) {
      // Rollback
      set({
        workingList,
        stats,
        selectedContact
      })
      return { success: false, error: res.error }
    }

    return { success: true }
  },

  markContactDone: async (contactId) => {
    const { workingList, stats, selectedContact, completedTodayCount } = get()
    const newWorkingList = workingList.filter(c => c.id !== contactId)
    const newCompletedCount = completedTodayCount + 1

    // Optimistic Update
    set({
      workingList: newWorkingList,
      completedTodayCount: newCompletedCount,
      stats: { ...stats, workingListCount: newWorkingList.length },
      selectedContact: selectedContact?.id === contactId ? newWorkingList[0] || null : selectedContact
    })

    const res = await markDone(contactId)
    if ('error' in res) {
      // Rollback
      const rollbackCompleted = Math.max(0, newCompletedCount - 1)
      set({
        workingList,
        completedTodayCount: rollbackCompleted,
        stats,
        selectedContact
      })
      return { success: false, error: res.error }
    }

    return { success: true }
  },

  snoozeContact: async (contactId, daysOrDate) => {
    const { workingList, stats, selectedContact } = get()
    const newWorkingList = workingList.filter(c => c.id !== contactId)

    // Optimistic Update
    set({
      workingList: newWorkingList,
      stats: { 
        ...stats, 
        workingListCount: newWorkingList.length,
        snoozedCount: stats.snoozedCount + 1 
      },
      selectedContact: selectedContact?.id === contactId ? newWorkingList[0] || null : selectedContact
    })

    let targetDate: Date
    if (typeof daysOrDate === 'number') {
      targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + daysOrDate)
    } else {
      targetDate = daysOrDate
    }

    const res = await snoozeContact(contactId, targetDate)
    if ('error' in res) {
      // Rollback
      set({
        workingList,
        stats,
        selectedContact
      })
      return { success: false, error: res.error }
    }

    return { success: true }
  },

  updateContactDescription: async (contactId, description) => {
    const { workingList, allContacts, selectedContact } = get()
    
    // Optimistic Update local text
    const updateListItem = (list: Contact[]) =>
      list.map(c => (c.id === contactId ? { ...c, custom_description: description } : c))

    set({
      workingList: updateListItem(workingList),
      allContacts: updateListItem(allContacts),
      selectedContact: selectedContact?.id === contactId ? { ...selectedContact, custom_description: description } : selectedContact
    })

    const res = await updateContactDescriptionAction(contactId, description)
    if ('error' in res) {
      // Rollback
      set({
        workingList,
        allContacts,
        selectedContact
      })
      return { success: false, error: res.error }
    }

    return { success: true }
  },

  toggleContactLabel: async (contactId, labelId, action) => {
    // Invoke server action
    const res = await bulkManageContactLabels([contactId], [labelId], action)
    if ('error' in res) {
      return { success: false, error: res.error }
    }
    
    return { success: true }
  }
}))

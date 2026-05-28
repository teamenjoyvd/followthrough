import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { disconnectGoogle } from '@/lib/actions/settings'
import type { SyncStep } from '@/types/google-sync'

interface UseGoogleSyncOptions {
  syncSuccessPrefix?: string
}

export function useGoogleSync(options: UseGoogleSyncOptions = {}) {
  const { syncSuccessPrefix = 'Synced successfully' } = options
  const router = useRouter()
  
  const [isSyncing, startSyncTransition] = useTransition()
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [syncSteps, setSyncSteps] = useState<SyncStep[]>([])
  
  const [isDisconnecting, startDisconnectTransition] = useTransition()
  const [disconnectError, setDisconnectError] = useState<string | null>(null)

  const handleSync = useCallback(() => {
    setSyncResult(null)
    setSyncSteps([])
    startSyncTransition(async () => {
      try {
        const res = await fetch('/api/google/sync', { method: 'POST' })
        const json = await res.json().catch(() => ({}))
        const timeString = new Date().toLocaleTimeString()

        if (Array.isArray(json.steps)) {
          setSyncSteps(json.steps)
        }
        
        if (!res.ok) {
          const errMsg = json.error || 'Server error'
          setSyncResult(`Sync failed at ${timeString}: ${errMsg}`)
        } else {
          const imported = json.imported ?? 0
          const conflicts = json.conflicts ?? 0
          
          const contactText = imported === 1 ? '1 contact' : `${imported} contacts`
          const conflictText = conflicts === 1 ? '1 conflict' : `${conflicts} conflicts`
          
          setSyncResult(`${syncSuccessPrefix}: ${contactText} imported, ${conflictText} detected.`)
          router.refresh()
        }
      } catch (error: any) {
        const timeString = new Date().toLocaleTimeString()
        setSyncResult(`Sync failed at ${timeString}: ${error.message || 'Network error'}`)
      }
    })
  }, [syncSuccessPrefix, router])

  const handleDisconnect = useCallback(() => {
    setDisconnectError(null)
    startDisconnectTransition(async () => {
      const result = await disconnectGoogle()
      if ('error' in result) {
        setDisconnectError(result.error)
      } else {
        router.refresh()
      }
    })
  }, [router])

  return {
    isSyncing,
    syncResult,
    setSyncResult,
    syncSteps,
    setSyncSteps,
    isDisconnecting,
    disconnectError,
    handleSync,
    handleDisconnect,
    setDisconnectError,
  }
}

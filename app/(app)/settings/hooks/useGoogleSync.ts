import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { disconnectGoogle } from '@/lib/actions/settings'

interface UseGoogleSyncOptions {
  syncSuccessPrefix?: string
}

export function useGoogleSync(options: UseGoogleSyncOptions = {}) {
  const { syncSuccessPrefix = 'Synced successfully' } = options
  const router = useRouter()
  
  const [isSyncing, startSyncTransition] = useTransition()
  const [syncResult, setSyncResult] = useState<string | null>(null)
  
  const [isDisconnecting, startDisconnectTransition] = useTransition()
  const [disconnectError, setDisconnectError] = useState<string | null>(null)

  const handleSync = useCallback(() => {
    setSyncResult(null)
    startSyncTransition(async () => {
      try {
        const res = await fetch('/api/google/sync', { method: 'POST' })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          setSyncResult('Sync failed. Please try again.')
        } else {
          const imported = json.imported ?? 0
          const conflicts = json.conflicts ?? 0
          
          // Clean, robust pluralization formatting
          const contactText = imported === 1 ? '1 contact' : `${imported} contacts`
          const conflictText = conflicts === 1 ? '1 conflict' : `${conflicts} conflicts`
          
          setSyncResult(`${syncSuccessPrefix}: ${contactText} imported, ${conflictText} detected.`)
          router.refresh()
        }
      } catch {
        setSyncResult('Sync failed. Please try again.')
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
    isDisconnecting,
    disconnectError,
    handleSync,
    handleDisconnect,
    setSyncResult,
    setDisconnectError,
  }
}

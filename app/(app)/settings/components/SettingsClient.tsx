'use client'

import { useEffect, useRef } from 'react'
import SettingsDesktop from './SettingsDesktop'
import SettingsMobile from './SettingsMobile'
import { useGoogleSync } from '../hooks/useGoogleSync'
import { useSettingsForm } from '../hooks/useSettingsForm'
import type { SyncConflictWithContact } from './SyncConflictList'
import type { FollowupRules } from '@/lib/actions/settings'

export interface SettingsClientProps {
  profile: {
    id: string
    email: string
    display_name: string | null
    confirmation_enabled: boolean
    pipeline_view: string
    followup_rules: FollowupRules
    undo_window_seconds: number
  }
  isConnected: boolean
  syncState: { last_synced_at: string | null } | null
  conflicts: SyncConflictWithContact[]
  conflictCount: number
  flashConnected: boolean
  flashError: string | undefined
}

export default function SettingsClient({
  profile,
  isConnected,
  syncState,
  conflicts,
  conflictCount,
  flashConnected,
  flashError,
}: SettingsClientProps) {
  const googleSync = useGoogleSync({ syncSuccessPrefix: 'Synced successfully' })
  const settingsForm = useSettingsForm({
    display_name: profile.display_name,
    confirmation_enabled: profile.confirmation_enabled,
    pipeline_view: profile.pipeline_view,
    followup_rules: profile.followup_rules,
    undo_window_seconds: profile.undo_window_seconds,
  })

  const hasAutoSynced = useRef(false)
  const handleSync = googleSync.handleSync

  useEffect(() => {
    if (flashConnected && !hasAutoSynced.current) {
      hasAutoSynced.current = true
      const url = new URL(window.location.href)
      url.searchParams.delete('google_connected')
      window.history.replaceState({}, '', url.toString())
      handleSync()
    }
  }, [flashConnected, handleSync])

  const sharedProps = {
    profile,
    isConnected,
    syncState,
    conflicts,
    conflictCount,
    flashConnected,
    flashError,
    googleSync,
    settingsForm,
  }

  return (
    <>
      <div className="hidden md:block">
        <SettingsDesktop {...sharedProps} />
      </div>
      <div className="block md:hidden">
        <SettingsMobile {...sharedProps} />
      </div>
    </>
  )
}

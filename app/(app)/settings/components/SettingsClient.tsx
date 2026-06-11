'use client'

import SettingsDesktop from './SettingsDesktop'
import SettingsMobile from './SettingsMobile'
import { useSettingsForm } from '../hooks/useSettingsForm'

export interface SettingsClientProps {
  profile: {
    id: string
    email: string
    display_name: string | null
    confirmation_enabled: boolean
    undo_window_seconds: number
    followup_rules: any
  }
  labels: { id: string; name: string; color: string }[]
}

export default function SettingsClient({
  profile,
  labels,
}: SettingsClientProps) {
  const settingsForm = useSettingsForm({
    display_name: profile.display_name,
    confirmation_enabled: profile.confirmation_enabled,
    undo_window_seconds: profile.undo_window_seconds,
    followup_rules: profile.followup_rules,
  })

  const sharedProps = {
    profile,
    labels,
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

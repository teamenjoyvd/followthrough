'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, updatePreferences, updateLabelFollowupRules } from '@/lib/actions/settings'

export function useSettingsForm(initialProfile: {
  display_name: string | null
  confirmation_enabled: boolean
  undo_window_seconds: number
  followup_rules: any
}) {
  const router = useRouter()

  // ── Profile Form ───────────────────────────────────────────────────────────
  const [profileName, setProfileName] = useState(initialProfile.display_name ?? '')
  const [isProfilePending, startProfileTransition] = useTransition()
  const [profileFeedback, setProfileFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleProfileSave = useCallback(() => {
    setProfileFeedback(null)
    startProfileTransition(async () => {
      const result = await updateProfile(profileName)
      if ('error' in result) {
        setProfileFeedback({ ok: false, msg: result.error })
      } else {
        setProfileFeedback({ ok: true, msg: 'Saved.' })
        router.refresh()
      }
    })
  }, [profileName, router])

  // ── Preferences Form ───────────────────────────────────────────────────────
  const [confirmation, setConfirmation] = useState(initialProfile.confirmation_enabled)
  const [undoWindowSeconds, setUndoWindowSeconds] = useState<5 | 10 | 30>(
    ([5, 10, 30] as const).includes(initialProfile.undo_window_seconds as 5 | 10 | 30)
      ? (initialProfile.undo_window_seconds as 5 | 10 | 30)
      : 10
  )
  const [isPreferencesPending, startPreferencesTransition] = useTransition()
  const [preferencesFeedback, setPreferencesFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const handlePreferencesSave = useCallback(() => {
    setPreferencesFeedback(null)
    startPreferencesTransition(async () => {
      const result = await updatePreferences({
        confirmationEnabled: confirmation,
        undoWindowSeconds,
      })
      if ('error' in result) {
        setPreferencesFeedback({ ok: false, msg: result.error })
      } else {
        setPreferencesFeedback({ ok: true, msg: 'Saved.' })
        router.refresh()
      }
    })
  }, [confirmation, undoWindowSeconds, router])

  // ── Label Rules Form ──────────────────────────────────────────────────────
  const [followupRules, setFollowupRules] = useState<Record<string, number>>(initialProfile.followup_rules || {})
  const [isRulesPending, startRulesTransition] = useTransition()
  const [rulesFeedback, setRulesFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleLabelRuleChange = useCallback((labelId: string, val: number) => {
    setFollowupRules(prev => ({ ...prev, [labelId]: val }))
  }, [])

  const handleRulesSave = useCallback(() => {
    setRulesFeedback(null)
    startRulesTransition(async () => {
      const result = await updateLabelFollowupRules(followupRules)
      if ('error' in result) {
        setRulesFeedback({ ok: false, msg: result.error })
      } else {
        setRulesFeedback({ ok: true, msg: 'Saved.' })
        router.refresh()
      }
    })
  }, [followupRules, router])

  return {
    // Profile
    profileName,
    setProfileName,
    isProfilePending,
    profileFeedback,
    handleProfileSave,

    // Preferences
    confirmation,
    setConfirmation,
    undoWindowSeconds,
    setUndoWindowSeconds,
    isPreferencesPending,
    preferencesFeedback,
    handlePreferencesSave,

    // Label Rules
    followupRules,
    handleLabelRuleChange,
    isRulesPending,
    rulesFeedback,
    handleRulesSave,
  }
}

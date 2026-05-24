'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, updatePreferences, updateFollowupRules } from '@/lib/actions/settings'
import type { FollowupRules } from '@/lib/actions/settings'

export function useSettingsForm(initialProfile: {
  display_name: string | null
  confirmation_enabled: boolean
  pipeline_view: string
  followup_rules: FollowupRules
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
  const [view, setView] = useState(initialProfile.pipeline_view)
  const [isPreferencesPending, startPreferencesTransition] = useTransition()
  const [preferencesFeedback, setPreferencesFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const handlePreferencesSave = useCallback(() => {
    setPreferencesFeedback(null)
    startPreferencesTransition(async () => {
      const result = await updatePreferences({ confirmationEnabled: confirmation, pipelineView: view })
      if ('error' in result) {
        setPreferencesFeedback({ ok: false, msg: result.error })
      } else {
        setPreferencesFeedback({ ok: true, msg: 'Saved.' })
        router.refresh()
      }
    })
  }, [confirmation, view, router])

  // ── Follow-up Rules Form ───────────────────────────────────────────────────
  const [rawRuleInputs, setRawRuleInputs] = useState<Record<keyof FollowupRules, string>>({
    lead: String(initialProfile.followup_rules.lead),
    qualified: String(initialProfile.followup_rules.qualified),
    bought: String(initialProfile.followup_rules.bought),
    leave_alone: String(initialProfile.followup_rules.leave_alone),
  })
  const [isRulesPending, startRulesTransition] = useTransition()
  const [rulesFeedback, setRulesFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<keyof FollowupRules, string | null>>({
    lead: null,
    qualified: null,
    bought: null,
    leave_alone: null,
  })

  const handleRuleChange = useCallback((field: keyof FollowupRules, raw: string) => {
    setRulesFeedback(null)
    setRawRuleInputs(prev => ({ ...prev, [field]: raw }))

    const n = parseInt(raw, 10)
    
    // Validate rules inline
    let errorMsg: string | null = null
    if (raw.trim() === '') {
      errorMsg = 'Value cannot be empty'
    } else if (isNaN(n) || !/^\d+$/.test(raw.trim())) {
      errorMsg = 'Must be a valid integer'
    } else if (n < 1 || n > 365) {
      errorMsg = 'Must be between 1 and 365 days'
    }

    setValidationErrors(prev => ({ ...prev, [field]: errorMsg }))
  }, [])

  const hasValidationErrors = Object.values(validationErrors).some(err => err !== null)

  const handleRulesSave = useCallback(() => {
    if (hasValidationErrors) {
      setRulesFeedback({ ok: false, msg: 'Please resolve validation errors before saving.' })
      return
    }

    const updatedRules: FollowupRules = {
      lead: parseInt(rawRuleInputs.lead, 10),
      qualified: parseInt(rawRuleInputs.qualified, 10),
      bought: parseInt(rawRuleInputs.bought, 10),
      leave_alone: parseInt(rawRuleInputs.leave_alone, 10),
    }

    // Secondary sanity check
    for (const key of Object.keys(updatedRules) as (keyof FollowupRules)[]) {
      const val = updatedRules[key]
      if (isNaN(val) || val < 1 || val > 365) {
        setRulesFeedback({ ok: false, msg: 'All rules must be between 1 and 365 days.' })
        return
      }
    }

    setRulesFeedback(null)
    startRulesTransition(async () => {
      const result = await updateFollowupRules(updatedRules)
      if ('error' in result) {
        setRulesFeedback({ ok: false, msg: result.error })
      } else {
        setRulesFeedback({ ok: true, msg: 'Saved.' })
        router.refresh()
      }
    })
  }, [rawRuleInputs, hasValidationErrors, router])

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
    view,
    setView,
    isPreferencesPending,
    preferencesFeedback,
    handlePreferencesSave,

    // Rules
    rawRuleInputs,
    handleRuleChange,
    isRulesPending,
    rulesFeedback,
    validationErrors,
    hasValidationErrors,
    handleRulesSave,
  }
}

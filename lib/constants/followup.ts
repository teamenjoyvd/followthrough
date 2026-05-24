/**
 * Default follow-up interval thresholds (in days) per pipeline status.
 * Used as a fallback when a profile has no custom followup_rules set.
 */
export const DEFAULT_FOLLOWUP_RULES: Record<string, number> = {
  lead: 14,
  qualified: 7,
  bought: 30,
  leave_alone: 90,
}

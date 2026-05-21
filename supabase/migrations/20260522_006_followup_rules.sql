-- Add followup_rules jsonb column to profiles
-- Stores per-pipeline-status thresholds (days) for overdue calculation
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS followup_rules jsonb NOT NULL DEFAULT '{"lead": 14, "qualified": 7, "bought": 30, "leave_alone": 90}'::jsonb;

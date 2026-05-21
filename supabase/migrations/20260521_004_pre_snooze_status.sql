-- 004_pre_snooze_status.sql
-- Adds pre_snooze_status to contacts so snooze can restore previous pipeline_status on resurface.

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS pre_snooze_status text;

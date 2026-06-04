-- Migration: 20260604_015_google_sync_delete_policy
-- Description: Add RLS delete policy for google_sync_state table so users can disconnect Google Contacts.

CREATE POLICY google_sync_state_delete
  ON google_sync_state FOR DELETE
  USING (profile_id = get_my_profile_id());

-- ROLLBACK:
-- DROP POLICY IF EXISTS google_sync_state_delete ON google_sync_state;

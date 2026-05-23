-- Create an atomic database-level PL/pgSQL function to resurface expired snoozed contacts
CREATE OR REPLACE FUNCTION resurface_expired_contacts(
  p_profile_id uuid,
  p_today date
)
RETURNS integer AS $$
DECLARE
  v_count integer;
BEGIN
  -- 1. Insert 'resurfaced' notification items in the inbox for all expired snoozed contacts in bulk
  INSERT INTO inbox_items (profile_id, type, contact_id, payload, read)
  SELECT 
    profile_id, 
    'resurfaced'::inbox_item_type, 
    id, 
    jsonb_build_object('previous_status', pre_snooze_status), 
    false
  FROM contacts
  WHERE profile_id = p_profile_id
    AND pipeline_status = 'snoozed'
    AND snoozed_until <= p_today;

  -- 2. Bulk update all expired contacts to restore their pre_snooze_status
  WITH resurfaced AS (
    UPDATE contacts
    SET 
      pipeline_status = COALESCE(pre_snooze_status, 'lead'::pipeline_status),
      snoozed_until = null,
      pre_snooze_status = null
    WHERE profile_id = p_profile_id
      AND pipeline_status = 'snoozed'
      AND snoozed_until <= p_today
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM resurfaced;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

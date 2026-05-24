-- Migrations: 20260524_010_get_crm_stats.sql
-- Computes CRM stats (total, snoozed, overdue) atomically inside Postgres

CREATE OR REPLACE FUNCTION get_crm_stats(p_profile_id UUID)
RETURNS TABLE (
  total_contacts BIGINT,
  snoozed_contacts BIGINT,
  overdue_contacts BIGINT
) AS $$
DECLARE
  v_rules JSONB;
  v_total BIGINT;
  v_snoozed BIGINT;
  v_overdue BIGINT;
BEGIN
  -- Get the rules
  SELECT followup_rules INTO v_rules FROM profiles WHERE id = p_profile_id;
  IF v_rules IS NULL THEN
    v_rules := '{"lead": 14, "qualified": 7, "bought": 30, "leave_alone": 90}'::JSONB;
  END IF;

  -- Total contacts
  SELECT COUNT(*) INTO v_total FROM contacts WHERE profile_id = p_profile_id;

  -- Snoozed contacts
  SELECT COUNT(*) INTO v_snoozed FROM contacts WHERE profile_id = p_profile_id AND pipeline_status = 'snoozed';

  -- Overdue contacts
  SELECT COUNT(*) INTO v_overdue
  FROM contacts
  WHERE profile_id = p_profile_id
    AND pipeline_status != 'snoozed'
    AND (
      COALESCE(last_contacted_at, created_at) IS NULL
      OR
      (EXTRACT(EPOCH FROM (now() - COALESCE(last_contacted_at, created_at))) / 86400) > 
      COALESCE((v_rules->>pipeline_status)::NUMERIC, 14)
    );

  RETURN QUERY SELECT v_total, v_snoozed, v_overdue;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

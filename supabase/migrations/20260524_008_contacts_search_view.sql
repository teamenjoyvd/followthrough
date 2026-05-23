-- ============================================================
-- 20260524_008_contacts_search_view.sql
-- Optimizations for Contacts full-table fetch and atomic transactions:
-- 1. Contacts search view for unified database filtering/pagination
-- 2. create_contact_with_phone function for atomic transactions
-- ============================================================

-- 1. Create Advanced Search View with joined phone numbers and labels
CREATE OR REPLACE VIEW contacts_search_view WITH (security_barrier) AS
SELECT 
  c.*,
  coalesce(
    (SELECT json_agg(json_build_object('number', p.number)) FROM phone_numbers p WHERE p.contact_id = c.id),
    '[]'::json
  ) AS phone_numbers,
  coalesce(
    (SELECT json_agg(json_build_object('label_id', cl.label_id)) FROM contact_labels cl WHERE cl.contact_id = c.id),
    '[]'::json
  ) AS contact_labels,
  (SELECT array_agg(cl.label_id)::text[] FROM contact_labels cl WHERE cl.contact_id = c.id) AS label_ids,
  (SELECT string_agg(p.number, ' ') FROM phone_numbers p WHERE p.contact_id = c.id) AS phone_numbers_concat
FROM contacts c;

-- 2. Create create_contact_with_phone RPC function for database-level atomic inserts
CREATE OR REPLACE FUNCTION create_contact_with_phone(
  p_profile_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_company TEXT,
  p_job_title TEXT,
  p_phone TEXT
) RETURNS UUID AS $$
DECLARE
  v_contact_id UUID;
BEGIN
  -- Insert contact
  INSERT INTO contacts (
    profile_id,
    first_name,
    last_name,
    email,
    company,
    job_title,
    created_by_source,
    last_updated_by_source
  ) VALUES (
    p_profile_id,
    p_first_name,
    p_last_name,
    p_email,
    p_company,
    p_job_title,
    'manual',
    'manual'
  ) RETURNING id INTO v_contact_id;

  -- Insert phone number if provided
  IF p_phone IS NOT NULL AND trim(p_phone) <> '' THEN
    INSERT INTO phone_numbers (
      contact_id,
      profile_id,
      number,
      type,
      is_primary
    ) VALUES (
      v_contact_id,
      p_profile_id,
      trim(p_phone),
      'mobile',
      TRUE
    );
  END IF;

  RETURN v_contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

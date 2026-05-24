-- Migrations: 20260524_011_mark_done_with_note.sql
-- Executes interaction logging and focus list removal atomically

CREATE OR REPLACE FUNCTION mark_done_with_note(
  p_contact_id UUID,
  p_profile_id UUID,
  p_note_body TEXT
)
RETURNS VOID AS $$
DECLARE
  v_interaction_id UUID;
BEGIN
  -- 1. Insert interaction
  INSERT INTO interactions (contact_id, profile_id, type)
  VALUES (p_contact_id, p_profile_id, 'note')
  RETURNING id INTO v_interaction_id;

  -- 2. Insert note details
  INSERT INTO note_details (interaction_id, body)
  VALUES (v_interaction_id, p_note_body);

  -- 3. Update contact working list status
  UPDATE contacts
  SET on_working_list = false,
      working_list_added_at = null
  WHERE id = p_contact_id AND profile_id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

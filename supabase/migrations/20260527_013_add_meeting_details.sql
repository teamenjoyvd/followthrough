-- Create meeting_details table to store meeting notes linked to interactions
CREATE TABLE IF NOT EXISTS meeting_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id uuid UNIQUE NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
  body text NOT NULL
);

ALTER TABLE meeting_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meeting_details: owner access via interaction"
  ON meeting_details
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = meeting_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = meeting_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

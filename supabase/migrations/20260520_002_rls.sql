-- ============================================================
-- 002_rls.sql
-- Row Level Security — Pattern A helpers + all table policies
-- ============================================================

-- ──────────────────────────────────────────
-- PATTERN A HELPERS
-- ──────────────────────────────────────────

-- Returns the Clerk user ID from the JWT sub claim
CREATE OR REPLACE FUNCTION get_my_clerk_id()
RETURNS text
LANGUAGE sql STABLE
AS $$ SELECT auth.jwt() ->> 'sub' $$;

-- Returns the profile id for the current Clerk user
CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT id FROM profiles WHERE clerk_id = get_my_clerk_id()
$$;

-- ──────────────────────────────────────────
-- ENABLE RLS ON ALL TABLES
-- ──────────────────────────────────────────

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_numbers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links     ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_details     ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_details    ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_details     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts   ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────

-- Select own profile
CREATE POLICY profiles_select
  ON profiles FOR SELECT
  USING (clerk_id = get_my_clerk_id());

-- Insert own profile (needed for auto-creation on first sign-in)
CREATE POLICY profiles_insert
  ON profiles FOR INSERT
  WITH CHECK (clerk_id = get_my_clerk_id());

-- Update own profile
CREATE POLICY profiles_update
  ON profiles FOR UPDATE
  USING (clerk_id = get_my_clerk_id())
  WITH CHECK (clerk_id = get_my_clerk_id());

-- ──────────────────────────────────────────
-- CONTACTS
-- ──────────────────────────────────────────

CREATE POLICY contacts_select
  ON contacts FOR SELECT
  USING (profile_id = get_my_profile_id());

CREATE POLICY contacts_insert
  ON contacts FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY contacts_update
  ON contacts FOR UPDATE
  USING (profile_id = get_my_profile_id())
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY contacts_delete
  ON contacts FOR DELETE
  USING (profile_id = get_my_profile_id());

-- ──────────────────────────────────────────
-- PHONE NUMBERS
-- ──────────────────────────────────────────

CREATE POLICY phone_numbers_select
  ON phone_numbers FOR SELECT
  USING (profile_id = get_my_profile_id());

CREATE POLICY phone_numbers_insert
  ON phone_numbers FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY phone_numbers_update
  ON phone_numbers FOR UPDATE
  USING (profile_id = get_my_profile_id())
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY phone_numbers_delete
  ON phone_numbers FOR DELETE
  USING (profile_id = get_my_profile_id());

-- ──────────────────────────────────────────
-- SOCIAL LINKS
-- ──────────────────────────────────────────

CREATE POLICY social_links_select
  ON social_links FOR SELECT
  USING (profile_id = get_my_profile_id());

CREATE POLICY social_links_insert
  ON social_links FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY social_links_update
  ON social_links FOR UPDATE
  USING (profile_id = get_my_profile_id())
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY social_links_delete
  ON social_links FOR DELETE
  USING (profile_id = get_my_profile_id());

-- ──────────────────────────────────────────
-- INTERACTIONS
-- ──────────────────────────────────────────

CREATE POLICY interactions_select
  ON interactions FOR SELECT
  USING (profile_id = get_my_profile_id());

CREATE POLICY interactions_insert
  ON interactions FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY interactions_update
  ON interactions FOR UPDATE
  USING (profile_id = get_my_profile_id())
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY interactions_delete
  ON interactions FOR DELETE
  USING (profile_id = get_my_profile_id());

-- ──────────────────────────────────────────
-- CALL / EMAIL / NOTE DETAILS
-- These tables have no profile_id — access is gated via
-- interaction_id FK join to interactions (which has RLS).
-- We use a subquery to verify ownership.
-- ──────────────────────────────────────────

CREATE POLICY call_details_select
  ON call_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = call_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY call_details_insert
  ON call_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = call_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY call_details_update
  ON call_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = call_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY call_details_delete
  ON call_details FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = call_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY email_details_select
  ON email_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = email_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY email_details_insert
  ON email_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = email_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY email_details_update
  ON email_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = email_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY email_details_delete
  ON email_details FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = email_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY note_details_select
  ON note_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = note_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY note_details_insert
  ON note_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = note_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY note_details_update
  ON note_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = note_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

CREATE POLICY note_details_delete
  ON note_details FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM interactions
      WHERE interactions.id = note_details.interaction_id
        AND interactions.profile_id = get_my_profile_id()
    )
  );

-- ──────────────────────────────────────────
-- INBOX ITEMS
-- ──────────────────────────────────────────

CREATE POLICY inbox_items_select
  ON inbox_items FOR SELECT
  USING (profile_id = get_my_profile_id());

CREATE POLICY inbox_items_insert
  ON inbox_items FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY inbox_items_update
  ON inbox_items FOR UPDATE
  USING (profile_id = get_my_profile_id())
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY inbox_items_delete
  ON inbox_items FOR DELETE
  USING (profile_id = get_my_profile_id());

-- ──────────────────────────────────────────
-- GOOGLE SYNC STATE
-- ──────────────────────────────────────────

CREATE POLICY google_sync_state_select
  ON google_sync_state FOR SELECT
  USING (profile_id = get_my_profile_id());

CREATE POLICY google_sync_state_insert
  ON google_sync_state FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY google_sync_state_update
  ON google_sync_state FOR UPDATE
  USING (profile_id = get_my_profile_id())
  WITH CHECK (profile_id = get_my_profile_id());

-- ──────────────────────────────────────────
-- SYNC CONFLICTS
-- ──────────────────────────────────────────

CREATE POLICY sync_conflicts_select
  ON sync_conflicts FOR SELECT
  USING (profile_id = get_my_profile_id());

CREATE POLICY sync_conflicts_insert
  ON sync_conflicts FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY sync_conflicts_update
  ON sync_conflicts FOR UPDATE
  USING (profile_id = get_my_profile_id())
  WITH CHECK (profile_id = get_my_profile_id());

CREATE POLICY sync_conflicts_delete
  ON sync_conflicts FOR DELETE
  USING (profile_id = get_my_profile_id());

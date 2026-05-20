-- ============================================================
-- 001_initial_schema.sql
-- Full v1 data model for Followthrough
-- ============================================================

-- ──────────────────────────────────────────
-- ENUMS
-- ──────────────────────────────────────────

CREATE TYPE phone_type AS ENUM ('mobile', 'work', 'home');

CREATE TYPE social_platform AS ENUM ('linkedin', 'twitter', 'instagram', 'other');

CREATE TYPE pipeline_status AS ENUM (
  'lead',
  'qualified',
  'bought',
  'leave_alone',
  'snoozed'
);

CREATE TYPE interaction_type AS ENUM ('call', 'email', 'note');

CREATE TYPE call_outcome AS ENUM ('connected', 'no_answer', 'voicemail');

CREATE TYPE inbox_item_type AS ENUM (
  'resurfaced',
  'working_list_changed',
  'sync_conflict'
);

-- ──────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────

CREATE TABLE profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id              text NOT NULL UNIQUE,
  email                 text NOT NULL,
  display_name          text,
  confirmation_enabled  boolean NOT NULL DEFAULT true,
  pipeline_view         text NOT NULL DEFAULT 'kanban', -- 'kanban' | 'list'
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────
-- CONTACTS
-- ──────────────────────────────────────────

CREATE TABLE contacts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name          text NOT NULL,
  last_name           text,
  company             text,
  job_title           text,
  email               text,
  pipeline_status     pipeline_status NOT NULL DEFAULT 'lead',
  snoozed_until       date,
  last_contacted_at   timestamptz,
  google_contact_id   text, -- nullable; unique per profile enforced below
  on_working_list     boolean NOT NULL DEFAULT false,
  working_list_added_at timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- One google_contact_id per profile (no duplicate imports)
CREATE UNIQUE INDEX contacts_google_id_per_profile
  ON contacts (profile_id, google_contact_id)
  WHERE google_contact_id IS NOT NULL;

CREATE INDEX contacts_profile_id_idx ON contacts (profile_id);
CREATE INDEX contacts_pipeline_status_idx ON contacts (profile_id, pipeline_status);
CREATE INDEX contacts_snoozed_until_idx ON contacts (profile_id, snoozed_until)
  WHERE snoozed_until IS NOT NULL;
CREATE INDEX contacts_working_list_idx ON contacts (profile_id, on_working_list)
  WHERE on_working_list = true;

-- ──────────────────────────────────────────
-- PHONE NUMBERS
-- ──────────────────────────────────────────

CREATE TABLE phone_numbers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  number      text NOT NULL,
  type        phone_type NOT NULL DEFAULT 'mobile',
  is_primary  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX phone_numbers_contact_id_idx ON phone_numbers (contact_id);

-- ──────────────────────────────────────────
-- SOCIAL LINKS
-- ──────────────────────────────────────────

CREATE TABLE social_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform    social_platform NOT NULL,
  url         text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX social_links_contact_id_idx ON social_links (contact_id);

-- ──────────────────────────────────────────
-- INTERACTIONS
-- ──────────────────────────────────────────

CREATE TABLE interactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        interaction_type NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX interactions_contact_id_idx ON interactions (contact_id);
CREATE INDEX interactions_profile_occurred_idx ON interactions (profile_id, occurred_at DESC);

-- ──────────────────────────────────────────
-- INTERACTION DETAIL TABLES
-- ──────────────────────────────────────────

CREATE TABLE call_details (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id   uuid NOT NULL UNIQUE REFERENCES interactions(id) ON DELETE CASCADE,
  duration_seconds integer,
  outcome          call_outcome NOT NULL,
  summary          text
);

CREATE TABLE email_details (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id  uuid NOT NULL UNIQUE REFERENCES interactions(id) ON DELETE CASCADE,
  subject         text,
  body            text
);

CREATE TABLE note_details (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id  uuid NOT NULL UNIQUE REFERENCES interactions(id) ON DELETE CASCADE,
  body            text NOT NULL
);

-- ──────────────────────────────────────────
-- INBOX ITEMS
-- ──────────────────────────────────────────

CREATE TABLE inbox_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        inbox_item_type NOT NULL,
  contact_id  uuid REFERENCES contacts(id) ON DELETE SET NULL,
  payload     jsonb NOT NULL DEFAULT '{}',
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX inbox_items_profile_unread_idx ON inbox_items (profile_id, read)
  WHERE read = false;

-- ──────────────────────────────────────────
-- GOOGLE SYNC STATE
-- ──────────────────────────────────────────

CREATE TABLE google_sync_state (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  last_synced_at timestamptz,
  sync_token     text
);

-- ──────────────────────────────────────────
-- SYNC CONFLICTS
-- ──────────────────────────────────────────

CREATE TABLE sync_conflicts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id  uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  field_name  text NOT NULL,
  our_value   text,
  google_value text,
  resolved    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sync_conflicts_profile_unresolved_idx ON sync_conflicts (profile_id, resolved)
  WHERE resolved = false;

-- ──────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

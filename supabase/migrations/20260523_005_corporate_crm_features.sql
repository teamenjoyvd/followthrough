-- ============================================================
-- 20260523_005_corporate_crm_features.sql
-- Database extensions for Followthrough CRM features:
-- Granular contact audit trail source tracking,
-- Relational many-to-many labels system,
-- CSV Import Logs and rollback tracking.
-- ============================================================

-- 1. Create contact source type enum if not exists
DO $$ BEGIN
  CREATE TYPE contact_source AS ENUM ('manual', 'google_sync', 'csv_import', 'api');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create CSV Import Logs table to support rollbacks
CREATE TABLE IF NOT EXISTS csv_imports_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename      text NOT NULL,
  record_count  integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on csv_imports_log
ALTER TABLE csv_imports_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY csv_imports_log_select ON csv_imports_log FOR SELECT USING (profile_id = get_my_profile_id());
CREATE POLICY csv_imports_log_insert ON csv_imports_log FOR INSERT WITH CHECK (profile_id = get_my_profile_id());
CREATE POLICY csv_imports_log_delete ON csv_imports_log FOR DELETE USING (profile_id = get_my_profile_id());

-- 3. Add tracking columns to contacts table
ALTER TABLE contacts 
  ADD COLUMN IF NOT EXISTS created_by_source contact_source NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS last_updated_by_source contact_source NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_detail text,
  ADD COLUMN IF NOT EXISTS import_log_id uuid REFERENCES csv_imports_log(id) ON DELETE SET NULL;

-- Create index on import_log_id for quick rollback lookups
CREATE INDEX IF NOT EXISTS contacts_import_log_id_idx ON contacts(import_log_id) WHERE import_log_id IS NOT NULL;

-- 4. Create Labels table
CREATE TABLE IF NOT EXISTS labels (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          text NOT NULL,
  color         text NOT NULL, -- Terra cozy badge classes or color codes
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, name)
);

-- Enable RLS on labels
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY labels_select ON labels FOR SELECT USING (profile_id = get_my_profile_id());
CREATE POLICY labels_insert ON labels FOR INSERT WITH CHECK (profile_id = get_my_profile_id());
CREATE POLICY labels_update ON labels FOR UPDATE USING (profile_id = get_my_profile_id()) WITH CHECK (profile_id = get_my_profile_id());
CREATE POLICY labels_delete ON labels FOR DELETE USING (profile_id = get_my_profile_id());

-- 5. Create Contact Labels many-to-many join table
CREATE TABLE IF NOT EXISTS contact_labels (
  contact_id    uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  label_id      uuid NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, label_id)
);

-- Enable RLS on contact_labels
ALTER TABLE contact_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY contact_labels_select ON contact_labels FOR SELECT USING (profile_id = get_my_profile_id());
CREATE POLICY contact_labels_insert ON contact_labels FOR INSERT WITH CHECK (profile_id = get_my_profile_id());
CREATE POLICY contact_labels_delete ON contact_labels FOR DELETE USING (profile_id = get_my_profile_id());

-- Create index for quick relational tagging lookups
CREATE INDEX IF NOT EXISTS contact_labels_label_id_idx ON contact_labels(label_id);
CREATE INDEX IF NOT EXISTS contact_labels_profile_id_idx ON contact_labels(profile_id);

-- 007_contact_meta.sql
-- Add metadata columns to contacts for profile pictures, descriptions and action preferences.
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS custom_description text,
  ADD COLUMN IF NOT EXISTS preferred_contact_method text;

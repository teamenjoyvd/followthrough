-- ============================================================
-- 003_gcr_fixes.sql
-- Apply GCR PR12 schema delta to the live database
-- ============================================================

-- 1. Add CHECK constraint to profiles.pipeline_view
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_pipeline_view_check
  CHECK (pipeline_view IN ('kanban', 'list'));

-- 2. Add RLS optimization indexes
CREATE INDEX IF NOT EXISTS phone_numbers_profile_id_idx ON public.phone_numbers (profile_id);
CREATE INDEX IF NOT EXISTS social_links_profile_id_idx ON public.social_links (profile_id);

-- 3. Redefine get_my_profile_id() as SECURITY DEFINER to bypass recursion
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'
$$;

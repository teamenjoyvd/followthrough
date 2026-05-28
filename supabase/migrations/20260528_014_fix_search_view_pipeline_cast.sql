-- ============================================================
-- 20260528_014_fix_search_view_pipeline_cast.sql
-- Fix COALESCE type mismatch: pipeline_status enum vs text in
-- contacts_search_view. PostgREST wraps filtered columns in a
-- COALESCE with a text default; Postgres rejects the implicit
-- text <-> pipeline_status coercion in view context, breaking
-- all .eq('pipeline_status', ...) filtered queries.
--
-- Fix: enumerate all contacts columns explicitly, casting
-- pipeline_status::text so PostgREST receives a plain text
-- column. App code already treats pipeline_status as a string,
-- so no app-layer changes are required.
-- ============================================================

CREATE OR REPLACE VIEW contacts_search_view WITH (security_barrier) AS
SELECT
  -- identity & ownership
  c.id,
  c.profile_id,

  -- core contact fields
  c.first_name,
  c.last_name,
  c.company,
  c.job_title,
  c.email,

  -- enum cast to text so PostgREST .eq() filters work without
  -- hitting the implicit text <-> pipeline_status coercion error
  c.pipeline_status::text AS pipeline_status,

  -- scheduling & activity
  c.snoozed_until,
  c.last_contacted_at,

  -- google sync
  c.google_contact_id,

  -- working list
  c.on_working_list,
  c.working_list_added_at,

  -- audit / source tracking (from 005_corporate_crm_features)
  c.created_by_source,
  c.last_updated_by_source,
  c.source_detail,
  c.import_log_id,

  -- metadata (from 007_contact_meta)
  c.avatar_url,
  c.custom_description,
  c.preferred_contact_method,

  -- timestamps
  c.created_at,
  c.updated_at,

  -- joined aggregates (preserved from 008)
  COALESCE(
    (SELECT json_agg(json_build_object('number', p.number)) FROM phone_numbers p WHERE p.contact_id = c.id),
    '[]'::json
  ) AS phone_numbers,
  COALESCE(
    (SELECT json_agg(json_build_object('label_id', cl.label_id)) FROM contact_labels cl WHERE cl.contact_id = c.id),
    '[]'::json
  ) AS contact_labels,
  (SELECT array_agg(cl.label_id)::text[] FROM contact_labels cl WHERE cl.contact_id = c.id) AS label_ids,
  (SELECT string_agg(p.number, ' ') FROM phone_numbers p WHERE p.contact_id = c.id) AS phone_numbers_concat

FROM contacts c;

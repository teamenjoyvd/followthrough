-- ============================================================
-- 004_search_indexes.sql
-- Performance search and sort indexes for Followthrough contacts
-- ============================================================

-- Index on first_name and last_name for fast name-specific searches and queries
CREATE INDEX IF NOT EXISTS contacts_names_idx ON contacts (profile_id, first_name, last_name);

-- Index on company name for debounced company specific lookups and filtering
CREATE INDEX IF NOT EXISTS contacts_company_idx ON contacts (profile_id, company) 
  WHERE company IS NOT NULL;

-- Index on email address for specific email queries
CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts (profile_id, email) 
  WHERE email IS NOT NULL;

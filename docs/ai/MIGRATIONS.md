# MIGRATIONS.md — Database Migration Runbook

> This is a **living document**. AI appends entries after each migration is applied.

---

## Migration Workflow

### 1. Create Migration File
```bash
# Naming convention: YYYYMMDD_NNN_description.sql
# Example: 20260530_001_create_profiles.sql
touch supabase/migrations/YYYYMMDD_NNN_description.sql
```

### 2. Write SQL with Mandatory Rollback
Every migration MUST include a `-- ROLLBACK:` comment block:
```sql
-- Migration: 20260530_001_create_profiles
-- Description: Creates the profiles table with RLS

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ROLLBACK:
-- DROP TABLE IF EXISTS profiles;
```

### 3. Request User Approval
**AI must NEVER auto-apply migrations.** Present the SQL to the user and wait for explicit approval.

### 4. Apply Migration
```bash
supabase db push
# or
supabase migration up
```

### 5. Post-Apply Checklist
- [ ] Update `docs/ai/REF.md § Database Schema` with new table/column definitions
- [ ] Append entry to `docs/ai/REF.md § Migration Log`
- [ ] Append entry to this file's Migration History below
- [ ] Verify RLS policies are active on new tables

---

## Migration History

| Date | File | Description | Status |
|:---|:---|:---|:---|
| — | — | No migrations applied yet | — |

# REF.md — Followthrough Reference

> Read on demand during GATHER — sections only. Never read the whole file.

## Section Map

| Topic | Section |
|---|---|
| Auth / Clerk | §Auth |
| Database schema | §Schema |
| Directory structure | §Directory |
| Environment variables | §Env |
| Supabase RLS patterns | §RLS |

---

## §Auth

- Clerk handles all authentication.
- `auth()` from `@clerk/nextjs/server` — always `await auth()`, never sync.
- Protected routes: check `userId` from `auth()` at the top of every server action and route handler. Return 401 if null.
- `proxy.ts` (not `middleware.ts`) handles route protection at the edge.
- User identity in Supabase: Clerk native integration — domain `<your-clerk-instance>.clerk.accounts.dev`. RLS helpers read `auth.jwt() ->> 'sub'` via `get_my_clerk_id()`.

---

## §Schema

### Enums
| Enum | Values |
|---|---|
| `pipeline_status` | `lead`, `qualified`, `bought`, `leave_alone`, `snoozed` |
| `interaction_type` | `call`, `email`, `note` |
| `call_outcome` | `connected`, `no_answer`, `voicemail` |
| `phone_type` | `mobile`, `work`, `home` |
| `social_platform` | `linkedin`, `twitter`, `instagram`, `other` |
| `inbox_item_type` | `resurfaced`, `working_list_changed`, `sync_conflict` |

### Tables
| Table | Key Columns | FKs |
|---|---|---|
| `profiles` | `id`, `clerk_id` (unique), `email`, `confirmation_enabled`, `pipeline_view` | — |
| `contacts` | `id`, `profile_id`, `first_name`, `pipeline_status`, `snoozed_until`, `on_working_list`, `google_contact_id` | `profile_id → profiles` |
| `phone_numbers` | `id`, `contact_id`, `profile_id`, `number`, `type`, `is_primary` | `contact_id → contacts`, `profile_id → profiles` |
| `social_links` | `id`, `contact_id`, `profile_id`, `platform`, `url` | `contact_id → contacts`, `profile_id → profiles` |
| `interactions` | `id`, `contact_id`, `profile_id`, `type`, `occurred_at` | `contact_id → contacts`, `profile_id → profiles` |
| `call_details` | `id`, `interaction_id` (unique), `outcome`, `duration_seconds`, `summary` | `interaction_id → interactions` |
| `email_details` | `id`, `interaction_id` (unique), `subject`, `body` | `interaction_id → interactions` |
| `note_details` | `id`, `interaction_id` (unique), `body` | `interaction_id → interactions` |
| `inbox_items` | `id`, `profile_id`, `type`, `contact_id`, `payload` (jsonb), `read` | `profile_id → profiles`, `contact_id → contacts` |
| `google_sync_state` | `id`, `profile_id` (unique), `last_synced_at`, `sync_token` | `profile_id → profiles` |
| `sync_conflicts` | `id`, `profile_id`, `contact_id`, `field_name`, `our_value`, `google_value`, `resolved` | `profile_id → profiles`, `contact_id → contacts` |

---

## §Directory

```
followthrough/
├── app/
│   ├── (auth)/          # Clerk sign-in / sign-up routes
│   ├── (app)/           # Protected app routes
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── contacts/
│   │   ├── contacts/[id]/
│   │   ├── pipeline/
│   │   ├── inbox/
│   │   └── settings/
│   ├── api/             # Route handlers
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/          # Shared components (2+ routes)
├── lib/
│   ├── supabase/
│   │   ├── server.ts
│   │   └── client.ts
│   └── auth.ts
├── types/
│   └── supabase.ts      # Generated — do not hand-edit
├── supabase/
│   └── migrations/
├── config/
│   └── branding.ts
├── proxy.ts
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## §Env

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never reference in any file that could be client-bundled.

---

## §RLS

Pattern A helpers (live in `20260520_002_rls.sql`):

```sql
-- Returns the Clerk user ID from the JWT sub claim
CREATE OR REPLACE FUNCTION get_my_clerk_id()
RETURNS text LANGUAGE sql STABLE
AS $$ SELECT auth.jwt() ->> 'sub' $$;

-- Returns the profile id for the current Clerk user
CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS uuid LANGUAGE sql STABLE
AS $$ SELECT id FROM profiles WHERE clerk_id = get_my_clerk_id() $$;
```

All RLS policies reference these helpers only. Never inline `auth.jwt()` in a policy.
Detail tables (`call_details`, `email_details`, `note_details`) have no `profile_id` — policies gate via `EXISTS (SELECT 1 FROM interactions WHERE interactions.id = <detail>.interaction_id AND interactions.profile_id = get_my_profile_id())`.

---

## § Migration Log

> **Append after every migration apply.** Never delete entries.

| Date | File | Description | Applied By |
|:---|:---|:---|:---|
| — | — | No migrations logged yet | — |


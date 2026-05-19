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
- User identity in Supabase: pass `clerkId` as a claim via Supabase JWT template in Clerk dashboard. RLS helpers read `auth.jwt() ->> 'sub'` via `get_my_clerk_id()`.

---

## §Schema

> Populate this section as tables are created. Add each table name, columns, and FK relationships here after every migration.

*(empty — no migrations yet)*

---

## §Directory

```
followthrough/
├── app/
│   ├── (auth)/          # Clerk sign-in / sign-up routes
│   ├── (dashboard)/     # Protected app routes
│   │   └── dashboard/
│   │       ├── components/
│   │       │   ├── DashboardDesktop.tsx
│   │       │   └── DashboardMobile.tsx
│   │       └── page.tsx
│   ├── api/             # Route handlers
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/          # Shared components (2+ routes)
├── lib/
│   ├── supabase/
│   │   ├── server.ts    # createServerClient
│   │   └── client.ts    # createBrowserClient
│   └── auth.ts          # Clerk auth helpers
├── types/
│   └── supabase.ts      # Generated — do not hand-edit
├── supabase/
│   └── migrations/
├── proxy.ts             # Edge auth (NOT middleware.ts)
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
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never reference in any file that could be client-bundled.

---

## §RLS

Pattern A helpers (create these in an initial migration):

```sql
-- Returns the Clerk user ID from the JWT sub claim
CREATE OR REPLACE FUNCTION get_my_clerk_id()
RETURNS text
LANGUAGE sql STABLE
AS $$ SELECT auth.jwt() ->> 'sub' $$;

-- Returns true if the current user has admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$ SELECT EXISTS (
  SELECT 1 FROM profiles
  WHERE clerk_id = get_my_clerk_id()
  AND role = 'admin'
) $$;
```

All RLS policies reference these helpers only. Never inline `auth.jwt()` in a policy.

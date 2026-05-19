# GOTCHAS — followthrough

Read in full during SHAPE and GATHER. Add new entries here immediately when a sharp edge is discovered — never inline in code comments alone.

| Topic | Rule |
|---|---|
| `middleware.ts` | NEVER. Use `proxy.ts`. |
| Clerk auth | `await auth()` → `{ userId }`. No sync auth. No JWT template. |
| Clerk shadow DOM | CSS vars unavailable in Clerk components. Use hardcoded hex values. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Never import in any file under `app/` that could be bundled client-side. |
| Supabase DDL | `apply_migration` MCP only. Never raw `execute_sql` for DDL. Migration filename: `YYYYMMDD_NNN_description.sql` where `NNN` is zero-padded 3-digit counter. |
| `types/supabase.ts` | Regenerate via `Supabase:generate_typescript_types` MCP only after any schema change. |
| Large GitHub files | `create_or_update_file` times out above ~10KB. Use `push_files`. |
| shadcn install | NEVER `npx shadcn@latest init` — corrupts globals.css. Use `npx shadcn@latest add <n>`. After each add, revert any injected `@layer base` blocks. |
| Route handler `params` | `params` is a `Promise` in Next.js 16. Type as `{ params: Promise<{ id: string }> }` and `await params`. |
| `useParams()` | Takes NO type argument in Next.js 16. `const params = useParams(); const id = params.id as string`. |
| RLS policies | Use Pattern A helpers only — `is_admin()`, `get_my_clerk_id()`. Never raw `auth.jwt()`. |
| Dual layout law | NEVER a single responsive layout. Desktop and mobile are two complete, separate layouts in every page component. |
| 390px | Every UI surface must render correctly at 390px viewport width. Test before marking DONE. |

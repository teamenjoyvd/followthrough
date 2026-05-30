# GOTCHAS — followthrough

Read in full during SHAPE and GATHER. Add new entries here immediately when a sharp edge or common mistake is discovered — never inline in code comments alone.

| # | Topic | Rule |
|---|---|---|
| 1 | Supabase `setAll` type | Do NOT derive from `CookieMethodsServer['setAll']` — `setAll` is optional so `Parameters<>` breaks. Use inline type: `{ name: string; value: string; options?: Record<string, unknown> }`. |
| 2 | Migration rollback | Every SQL migration must include a `-- ROLLBACK:` comment block with the reverse statements. AI must not auto-apply — wait for explicit user approval. |
| 3 | Vercel Preview mutations | PR preview deployments connect to the **production** database. **NEVER** run INSERT/UPDATE/DELETE or seed scripts from a Vercel preview URL. |
| 4 | Middleware scope | Root `middleware.ts` is for Clerk `clerkMiddleware()` ONLY. Custom proxy/routing → `lib/proxy.ts`. |
| 5 | Layout overengineering | Do NOT create dual layouts (separate mobile/desktop files) unless a quantitative trigger fires: 5+ column table, drag-and-drop, persistent sidebar+pane, or interactive canvas/map. Default = single responsive layout. |
| 6 | Config secrets | `agentic.config.json` stores public values ONLY. Secrets (API keys, DB URLs) go exclusively in `.env.local` (git-ignored). |

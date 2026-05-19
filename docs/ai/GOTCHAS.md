# GOTCHAS — followthrough

Read in full during SHAPE and GATHER. Add new entries here immediately when a sharp edge is discovered — never inline in code comments alone.

| Topic | Rule |
|---|---|
| Supabase `setAll` type | `cookiesToSet` must be explicitly typed as `CookieToSet[]` — derive via `Parameters<CookieMethodsServer['setAll']>[0][number]`. Without it, `tsc --noEmit` fails with implicit `any`. |

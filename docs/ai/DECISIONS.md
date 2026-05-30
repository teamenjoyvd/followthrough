# DECISIONS.md — Architecture Decision Log

> This is a **living document**. AI appends decisions after PLAN or BUILD phases.
> Each entry captures the context, options considered, and rationale for significant choices.

---

## Decision Template

Copy this template when logging a new decision:

```markdown
### ADR-NNN: [Title]
**Date:** YYYY-MM-DD  
**Status:** Accepted | Superseded by ADR-NNN | Deprecated  
**Context:** [What problem or question prompted this decision?]  
**Options Considered:**
1. [Option A] — [pros/cons]
2. [Option B] — [pros/cons]

**Decision:** [Which option was chosen and why]  
**Consequences:** [What this enables or constrains going forward]
```

---

## Decisions

### ADR-001: Option C Hybrid Middleware
**Date:** 2026-05-29  
**Status:** Accepted  
**Context:** Needed to decide how to handle auth and custom routing at the edge layer. Three options were evaluated: (A) pure Clerk middleware with no custom routing, (B) pure custom proxy.ts with no middleware.ts, (C) hybrid — Clerk in middleware.ts, custom logic in lib/proxy.ts.  
**Options Considered:**
1. Option A (Pure Clerk) — Simple but no custom edge routing capability.
2. Option B (Pure Proxy) — Avoids middleware.ts but creates double-hop latency, leaves pages unprotected, fights the Next.js/Clerk framework.
3. Option C (Hybrid) — Clerk middleware for auth, lib/proxy.ts for custom logic. Best of both worlds.

**Decision:** Option C Hybrid. `middleware.ts` contains ONLY `clerkMiddleware()`. Custom proxy logic in `lib/proxy.ts`.  
**Consequences:** Overrides the original "NEVER create middleware.ts" rule. All developers and AI agents must understand the middleware is auth-only.

---

### ADR-002: Quantitative Layout Decision Rules
**Date:** 2026-05-29  
**Status:** Accepted  
**Context:** The original "Dual Layout Law" required separate mobile/desktop layout files for ALL complex pages, creating massive overhead for simple UIs.  
**Options Considered:**
1. Strict Dual Layout Law — Always two files. Safe but enormous productivity tax.
2. Quantitative Triggers — Default to single layout; only create dual layouts when specific complexity thresholds are met.

**Decision:** Quantitative triggers. Dual layout required ONLY for: 5+ column tables, drag-and-drop, persistent sidebar+pane, interactive canvas/map.  
**Consequences:** Most pages use single responsive layouts. Reduces boilerplate significantly for typical CRUD apps.

---

### ADR-003: Secret Isolation Strategy
**Date:** 2026-05-29  
**Status:** Accepted  
**Context:** Needed to decide where to store configuration values. Options: all in .env, all in config.json, or split.  
**Options Considered:**
1. All in `.env.local` — Simple but no committed reference for public values.
2. Split — `agentic.config.json` for public values (committed), `.env.local` for secrets (git-ignored).

**Decision:** Split approach. `agentic.config.json` stores ONLY public, non-secret values. All secrets exclusively in `.env.local`.  
**Consequences:** Config file is safe to commit. Developers can see project shape without touching secrets.

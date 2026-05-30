# CLAUDE.md — Followthrough
> Reference: `docs/ai/REF.md` (read on demand during GATHER by section only)

---

## What is this?

Followthrough is a contact follow-up tool. It supports the follow-through process when working with contacts — tracking interactions, surfacing who needs attention, and prompting next actions.

---

## Constants

| | |
|---|---|
| Repo | `teamenjoyvd/followthrough` |
| Branch | `main` |
| Supabase project | `pyeccxjwbjfrigcyyvar` |
| Production URL | `https://followthrough-blond.vercel.app` |

Never ask the user to confirm these.

---

## Core Tech Stack (Locked)

| Layer | Technology | Constraint |
|:---|:---|:---|
| Framework | Next.js 14+ (App Router, TypeScript) | No Pages Router. |
| Auth | Clerk | Async `auth()` only. No sync APIs. |
| Database | Supabase (Postgres + RLS) | Pattern A helpers only. No inline `auth.jwt()`. |
| Styling | Tailwind CSS + shadcn/ui (Radix) | Mobile-first (390px). No custom modal/select wrappers. |
| Hosting | Vercel | PR Previews hit production DB — never run mutations from previews. |

---

## Three-Tier Security Framework

| Tier | Layer | Mechanism |
|:---|:---|:---|
| Tier 1 | Edge | Clerk `clerkMiddleware()` in root `middleware.ts` — redirects unauthenticated users |
| Tier 2 | Server | Mandatory `auth()` check at top of every Server Action and API handler |
| Tier 3 | Database | Supabase RLS on every table using Pattern A helpers |

**Secret Isolation:** Public vars in `agentic.config.json` (committed). Secrets in `.env.local` only (git-ignored).

---

## ID Format

```
[YYMM]-DEV-[GH#]
```

- `YYMM` — year + month of creation (e.g. `2605` for May 2026)
- `DEV` — fixed segment, all work types
- `GH#` — the GitHub issue number assigned when the issue is created (no padding)

Examples: `2605-DEV-1`, `2605-DEV-12`

| Artifact | Format |
|---|---|
| GitHub Issue title | `[2605-DEV-1] Short description` |
| Branch | `dev/2605-DEV-1` |
| Commit prefix | `[2605-DEV-1] description` |
| PR title | `[2605-DEV-1] description` |

The GitHub issue number is the canonical unique identifier. Always create the issue first and read the number from the response — never infer or increment manually.

---

## GitHub Issue Labels

| Label | Purpose |
|---|---|
| `feat` | New functionality |
| `bug` | Something broken |
| `chore` | Refactor, deps, infrastructure |
| `priority:high` | Pick before anything else |
| `priority:low` | Pick last |
| `blocked` | Do not pick — has a dependency that isn't resolved |

READ order: `priority:high` first, then unlabelled, then `priority:low`. Never pick a `blocked` issue without explicit user acknowledgment.

---

## Hard Constraints

Violation = immediate stop, no exceptions.

- **NEVER push directly to `main`.** Use `dev/[YYMM]-DEV-[GH#]` branches only.
- **Middleware Rule:** Root `middleware.ts` is permitted **ONLY** for Clerk's `clerkMiddleware()`. No custom logic in middleware. Custom API proxy/routing logic goes in `lib/proxy.ts`.
- **NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to the client.**
- **NEVER bypass Clerk auth on a protected route.**
- **NEVER mark Done on static analysis alone.** Vercel PR preview must be READY and CI green.
- **NEVER write data to Supabase from a Preview URL** — preview URLs hit production DB.
- **390px mobile-first.** Every new UI surface must render correctly at 390px.
- **RLS policies use Pattern A helpers only** — `is_admin()`, `get_my_role()`, `get_my_profile_id()`, `get_my_clerk_id()`. Never raw `auth.jwt()`.
- **shadcn/ui for all interactive primitives** — dialog, popover, dropdown, sheet, tooltip, select, combobox, alert dialog.
- **Component co-location** — new components scoped to one route go in `app/[route]/components/`. Promote to `/components` only when used by 2+ unrelated routes.
- **Layout Decision Rules (Quantitative)** — Default to single responsive layout. Dual layout ONLY when triggers fire: 5+ column table, drag-and-drop, persistent sidebar+pane, interactive canvas/map.
- **NEVER modify or commit to a branch whose associated GitHub PR is closed/merged, or which is already merged into `origin/main`.** If a branch is closed or merged, any additional work must be done on a new branch created from the latest `main`.
- **Migration Safety:** Append-only SQL migrations. Never edit applied migrations. Mandatory `-- ROLLBACK:` block. AI never auto-applies — explicit user approval required.
- **Claim Gate:** **NEVER** call `create_or_update_file` or `push_files` before CLAIM is complete.
- **Agent Coexistence:** Antigravity and Claude.ai must not conflict. Claude reads `implementation_plan.md` in the brain directory if it exists to synchronize state; Antigravity formats its plan to match PLAN output.
- **SSU, PLAN, CLAIM, and BUILD are mutually exclusive within a session.** PLAN does no writes of any kind. CLAIM does no file writes. BUILD does no design work. Violation = immediate stop.
- **Technical Guidelines:** Detailed rules on RLS helpers, Clerk edge proxying, 390px mobile-first responsive styling, layout decision rules, and co-location live in **`docs/ai/RULES.md`** and **`.cursor/rules/`**.

---

## Document Lifecycle

| File | Type | Who Updates |
|:---|:---|:---|
| `CLAUDE.md` | Living | Human only |
| `docs/ai/REF.md` | Living | AI + Human (after BUILD) |
| `docs/ai/GOTCHAS.md` | Living | AI + Human (when sharp edges found) |
| `docs/ai/DECISIONS.md` | Living | AI (appends after PLAN/BUILD) |
| `docs/ai/MIGRATIONS.md` | Living | AI (appends after migration apply) |
| `docs/ai/PLAN.md`, `CLAIM.md`, `BUILD.md`, `GCR.md` | Static | Nobody (templates) |
| `docs/ai/RULES.md` | Static | Human only |
| `docs/ai/PROMPTS.md` | Static | Human only |
| `.cursor/rules/*.mdc` | Static | Human only |
| `agentic.config.json` | Living | Human |

---

## Commands

### SSU — System Startup

Run at the start of every session. Warms up tools and establishes ground truth before any other action.

1. **Tool warm-up (before anything else):**
   - `tool_search("get file contents github")`
   - `tool_search("branch issue pull request create")`
   Confirm both return results. If either fails — stop.

2. `get_file_contents` on `CLAUDE.md` — confirms GitHub connectivity and loads current state.

3. **Verify Git Sync & Branch Merge Status:**
   - Run `git fetch --all --prune` to synchronize all remote branches.
   - For the current local branch, run `git branch -r --merged origin/main` to check if it has already been merged into `main`.
   - If the branch is already merged or closed, do NOT commit to it. Report this to the user immediately.

4. `list_pull_requests` — check for any open PRs.
   - **Open PR found:** read its `## Session State` block and report what's in flight before doing anything else.
   - **No open PR, but a CLAIM-complete issue exists** (has `## Branch` block, no PR): report as CLAIM-complete/BUILD-not-started → ready to proceed to SHAPE.
   - **Nothing in flight:** report ready to pick up next issue.
   - **Antigravity Check:** If running as Antigravity, verify `implementation_plan.md`/`task.md` in the brain directory to synchronize state.

Output format:
```
| GitHub    | ✅/❌ |
| In flight | [YYMM]-DEV-[GH#] <title> / None |
| Handoff   | IN PROGRESS: <next action> / DONE / CLAIM-complete: ready for SHAPE / No active PR |
| Commands  | SSU · PLAN · CLAIM · BUILD · GCR |
```
If GitHub ❌ — stop.

### PLAN — See `docs/ai/PLAN.md`

### CLAIM — See `docs/ai/CLAIM.md`

### BUILD — See `docs/ai/BUILD.md`

### GCR — See `docs/ai/GCR.md`

---

## CLAIM-Complete Definition

An issue is CLAIM-complete (ready for BUILD) when its body contains:
1. A `## Design Checklist` section with all four items checked.
2. A `## Branch` section with the feature branch name.

```
## Design Checklist
- [x] DoD defined (specific, file-path-level)
- [x] Affected files listed by path
- [x] Gotchas flagged against docs/ai/GOTCHAS.md
- [x] Blocking unknowns: none

## Branch
`dev/YYMM-DEV-GH#`
```

BUILD verifies both at startup. If either section is absent or any checklist item is unchecked, BUILD refuses and states exactly what is missing.

---

## Gotchas

See `docs/ai/GOTCHAS.md`. Read in full during SHAPE and GATHER.

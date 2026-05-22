# Followthrough — MVP Wiring Implementation Plan

> Generated: 2026-05-22  
> Status: Active  
> PR #27 (dashboard profile loop fix): **MERGED**

---

## Context

The app has a complete UI and a working data layer. What's missing is the connection between them on several surfaces, plus a unified visual language. The dashboard is the only surface using the Terra "Rooted Warmth" design system. Everything else (contacts, pipeline, inbox, settings) was built with generic Tailwind/shadcn defaults.

### Confirmed working — do not touch

- Dashboard page data layer (contacts, stats, health, working list)
- `WorkingListDesktopClient` / `WorkingListMobileClient` — markDone, snooze, remove
- `createContact` → `NewContactDesktop/Mobile`
- `updateContact` → `EditContactDesktop/Mobile`
- `PipelineKanban` → `moveContact` (dnd-kit + optimistic update)
- `InboxDesktop` / `InboxMobile` → `markInboxItemRead`
- Settings (Profile, Preferences, FollowupRules, GoogleSync) → all wired to actions
- Google OAuth flow (`/api/google/oauth` → `/api/google/callback`)
- Google sync (`/api/google/sync` → `lib/google/sync.ts`)

---

## Terra Token Reference

| Purpose | Token |
|---|---|
| Page background | `bg-[#faf6f0]` |
| Card background | `bg-[#f5f1ea]` |
| Card hover | `bg-[#eae6de]` |
| Primary green | `#4a7c59` |
| Primary text | `#2e3230` |
| Secondary text | `#4a4e4a` |
| Muted text | `#74796e` |
| Border | `border-[#e4e0d8]` |
| Card radius | `rounded-[20px]` |
| Shadow | `shadow-[0_4px_20px_rgba(46,50,48,0.06)]` |
| Primary button | `bg-[#4a7c59] text-white` |
| Secondary button | `bg-[#eae6de] text-[#4a7c59]` |
| Destructive | `text-[#b83230]` / `bg-[#ffdad8]/50` |
| Amber accent | `#c4a66a` |
| Amber text | `#554020` |

---

## Execution Order

| # | ID | Title | Status |
|---|---|---|---|
| 1 | — | Merge PR #27 | ✅ Done |
| 2 | 2605-DEV-29 | Contacts: complete reskin to Terra | 🔄 In progress |
| 3 | TBD | Dashboard: replace fake "Upcoming" sidebar with real data | ⏳ Queued |
| 4 | TBD | Dashboard: "Quick Note" opens LogInteractionSheet | ⏳ Queued |
| 5 | TBD | Dashboard: fix hardcoded copy + nav label | ⏳ Queued |
| 6 | TBD | Settings: add nav link + reskin + sync UX improvements | ⏳ Queued |
| 7 | TBD | Pipeline + Inbox: reskin to Terra | ⏳ Queued |
| 8 | TBD | Google sync: auto-sync on connect + disconnect action | ⏳ Queued |

---

## Ticket Detail

---

### 2605-DEV-29 — Contacts: complete reskin to Terra design system

**Branch:** `dev/2605-DEV-29`  
**Issue:** #29  
**Priority:** P0

**Problem:**  
All contact surfaces use `bg-white`, `indigo-600`, `slate-*`, `gray-*` — completely divorced from Terra. The data wiring is correct and must not be touched.

**DoD:**
- Every contact surface uses Terra tokens exclusively
- No `indigo-`, `slate-`, `gray-` classes remain (except semantic shadows/borders)
- All existing data wiring, server actions, and form submissions are untouched
- Both desktop and mobile layouts pass at 390px
- Dual layout law upheld

**Files:**

| File | Change |
|---|---|
| `app/(app)/contacts/page.tsx` | Header, search input, filter bar, footer → Terra |
| `app/(app)/contacts/components/ContactsDesktop.tsx` | Table → Terra card list |
| `app/(app)/contacts/components/ContactsMobile.tsx` | Card reskin |
| `app/(app)/contacts/new/components/NewContactDesktop.tsx` | Form inputs, labels, buttons → Terra |
| `app/(app)/contacts/new/components/NewContactMobile.tsx` | Same |
| `app/(app)/contacts/[id]/page.tsx` | Header bar → Terra |
| `app/(app)/contacts/[id]/components/ContactDetailDesktop.tsx` | Left/right panels, action buttons, LogInteractionSheet trigger → Terra |
| `app/(app)/contacts/[id]/components/ContactDetailMobile.tsx` | Same |
| `app/(app)/contacts/[id]/edit/components/EditContactDesktop.tsx` | Form reskin |
| `app/(app)/contacts/[id]/edit/components/EditContactMobile.tsx` | Same |

**Gotchas:**
- `PipelineStatusControl` uses `PIPELINE_STATUSES` color classes — do not override, they are semantic
- `LogInteractionSheet` — only reskin via `triggerClassName` prop, not sheet internals
- `ContactsDesktop.tsx` sort links — preserve `href` query params, only change visual treatment
- Do not touch any `lib/actions/*` files
- `ContactFilterBar` / `FilterShortcuts` are shared components — only reskin their wrapper in `contacts/page.tsx`

---

### TBD — Dashboard: replace fake "Upcoming" sidebar with real snoozed contacts

**Priority:** P0

**Problem:**  
`DashboardDesktop.tsx` "Upcoming" sidebar has 3 hardcoded cards with fake dates, fake names, and external placeholder image URLs. No DB query backs it.

**DoD:**
- Upcoming sidebar shows contacts where `pipeline_status = 'snoozed'` AND `snooze_until` between now and now+7d, sorted by `snooze_until` ASC, limit 5
- Empty state: "No contacts resurfacing soon."
- No hardcoded names, dates, or external image URLs

**Files:**
- `app/(dashboard)/dashboard/page.tsx` — add snoozed query, pass `upcomingContacts` prop
- `app/(dashboard)/dashboard/components/DashboardDesktop.tsx` — replace hardcoded cards
- `app/(dashboard)/dashboard/components/DashboardMobile.tsx` — same

---

### TBD — Dashboard: "Quick Note" opens LogInteractionSheet

**Priority:** P0

**Problem:**  
"Quick Note" button is a `<Link href="/contacts">` — does nothing useful. Should log an interaction. `LogInteractionSheet` requires a `contactId`, so a contact-selection step is needed first.

**DoD:**
- "Quick Note" opens a shadcn `Dialog` with a searchable contact list (working list first, all contacts fallback)
- Selecting a contact opens `LogInteractionSheet` pre-filled for that contact
- Interaction is logged and dashboard refreshes

**Files:**
- `app/(dashboard)/dashboard/components/QuickNoteDialog.tsx` (new)
- `app/(dashboard)/dashboard/components/DashboardDesktop.tsx`
- `app/(dashboard)/dashboard/components/DashboardMobile.tsx`
- `app/(dashboard)/dashboard/page.tsx` — pass `allContacts` for fallback

---

### TBD — Dashboard: fix hardcoded copy + nav label

**Priority:** P1 (bundle with Upcoming ticket)

**Problems:**
- "Up 5% from last month" is hardcoded — no historical health data exists. Replace with factual copy.
- "View Due Today" goes to `/contacts` — rename to "View All Contacts" or wire to working list filter.
- Nav "History" link goes to `/inbox` — rename label to "Inbox".

**Files:**
- `app/(dashboard)/dashboard/components/DashboardDesktop.tsx`
- `app/(dashboard)/dashboard/components/DashboardMobile.tsx`

---

### TBD — Settings: add nav link + reskin + sync UX improvements

**Priority:** P1

**Problems:**
- Settings has no nav entry — unreachable without typing the URL
- `SettingsDesktop.tsx` uses `bg-card / text-foreground / bg-primary` CSS vars that may not resolve to Terra values
- "Sync now" is a full-page `<form>` POST — no loading state, no result feedback
- No disconnect option for Google

**DoD:**
- Settings reachable from the dashboard nav
- All CSS var references audited and replaced with explicit Terra tokens where broken
- "Sync now" uses client-side `fetch` with loading state and result display
- `disconnectGoogle` server action added to `lib/actions/settings.ts`
- Disconnect button shown in `SettingsDesktop`/`SettingsMobile` when connected

**Files:**
- `app/(dashboard)/dashboard/components/DashboardDesktop.tsx` — add Settings nav link
- `app/(dashboard)/dashboard/components/DashboardMobile.tsx` — same
- `app/(app)/settings/components/SettingsDesktop.tsx`
- `app/(app)/settings/components/SettingsMobile.tsx`
- `lib/actions/settings.ts` — add `disconnectGoogle`

---

### TBD — Pipeline + Inbox: reskin to Terra design system

**Priority:** P1

**Problem:**  
`PipelineKanban.tsx`, `PipelineList.tsx`, `InboxDesktop.tsx`, `InboxMobile.tsx` all use `bg-white`, `indigo-600`, `gray-*`.

**Files:**
- `app/(app)/pipeline/components/PipelineKanban.tsx`
- `app/(app)/pipeline/components/PipelineList.tsx`
- `app/(app)/inbox/components/InboxDesktop.tsx`
- `app/(app)/inbox/components/InboxMobile.tsx`

---

### TBD — Google sync: auto-sync on connect + disconnect

**Priority:** P2

**Problems:**
- After OAuth callback, no automatic first sync fires — user must manually click "Sync now"
- No disconnect option (addressed in Settings ticket above, coordinated here)

**DoD:**
- `useEffect` in `SettingsDesktop`/`SettingsMobile` fires `POST /api/google/sync` once when `flashConnected === true`
- Sync result ("Imported X contacts, Y conflicts") displayed after auto-sync completes
- This ticket coordinates with the Settings reskin ticket; do not create separately if Settings ticket is in flight

---

## Key Constraints (from CLAUDE.md)

- **NEVER push to `main` directly.** Branch: `dev/YYMM-DEV-GH#`
- **Dual layout law** — NEVER a single responsive layout. Two complete separate layouts only.
- **390px mobile-first** — every new UI surface must render correctly at 390px
- **shadcn/ui for all interactive primitives** — dialog, popover, dropdown, sheet, tooltip, select
- **Component co-location** — new components scoped to one route go in `app/[route]/components/`
- **NEVER mark Done on static analysis alone** — Vercel PR preview must be READY and CI green
- **NEVER write data to Supabase from a Preview URL**

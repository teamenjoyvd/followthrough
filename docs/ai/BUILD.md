# BUILD — File execution

Default mode. Executes against a CLAIM-complete issue.

## Precondition

Read the issue body. Verify `## Design Checklist` exists with all four items checked AND `## Branch` exists with the branch name. 
**Verification**: Check that the branch is not already merged. Run `git fetch --all --prune` and ensure the target branch is not merged into `origin/main` (run `git branch -r --merged origin/main`). If either check fails — stop, state exactly what is missing or merged, do not proceed.

## READ

Check open GitHub issues. Resume any in-progress issue (open PR exists). If a CLAIM-complete issue has no open PR, that is the next issue — read `## Branch` from its body and proceed to SHAPE. Otherwise pick the highest `priority:high` open issue without the `blocked` label. If none, pick the next unlabelled issue by creation order.

## SHAPE (read-only)

Verify the DoD is still coherent against current codebase state. Read relevant docs:

- Auth / Clerk sync → `docs/ai/REF.md §Auth`
- New external dependency → update `docs/architecture/C4.md` first
- New architectural pattern → write ADR in `docs/architecture/DECISIONS.md` before executing

If DoD is stale or wrong: stop and request user to update the issue body before proceeding.

**No writes (including issue body) in SHAPE.**

## GATHER

Read only the REF.md sections the ticket needs (section map at top of REF.md).

## EXECUTE

Change only lines required by DoD. All writes target the feature branch only. Push to trigger Vercel Preview.

Before any large task (>100 lines): write `IN PROGRESS` to PR `## Session State` first, then commit a skeleton with `// TODO:` items before implementing.

## VERIFY

DoD point-by-point. Vercel Preview READY. CI green. 390px check. No production side-effects. If ticket touched auth or routing: confirm `middleware.ts` does not exist.

## FINALIZE

Verify PR body contains `Closes #<issue_number>` — if missing, add it now. Mark PR ready for review. If this ticket ran a migration or changed a column/table/route/env var: update `docs/ai/REF.md` before marking DONE. User merges manually via GitHub UI. After merge: confirm production Vercel deployment READY.

## PR Session State block

The PR description is the sole handoff document.

```markdown
## Session State
**Status:** IN PROGRESS | DONE
**Completed:**
- [x] done thing
**Next:** single specific action for incoming instance
```

Write `IN PROGRESS` before starting a large task. Write `DONE` after verifying. If context runs out mid-task, the skeleton commit is the fallback — it must exist before implementation begins.

# PROCESS handover — interim

**Interim and pre-live.** A bridge, used only while nothing is in force and the
tool is still being first built. Once the shared-state issue exists, the handover
lives there in the `handover-process` record (design part 4, section 4; build text
5, section 4) and this file is retired.

Last written: 2026-11-19, by a PROCESS session (session_012hdw2UKJgbfzjKvHCV4eMY),
after resolving fault D (PR #16).

## What a successor should read first

Read in full, in order (PROCESS's starting text): all eleven design parts
(`design/00` to `design/10`); then `build/05-the-records-and-following.md`; then
the record of the owner's decisions (`process/design-decisions.md`); PROCESS's own
folder (`process/`, including `research/`); and this handover.

## Where things stand (end of 19 Nov 2026)

- **Nothing is in force.** The design is still "proposed"; per `CLAUDE.md` we are
  in the first-build phase. The `process4` approvals were widened (PR #12) to let
  PROCESS message a product's coordinator and ROOT and run its own lanes.
- **The tool is at stage 4.** `main` (tip `267b709`) has the stage-4 notice piece
  plus stages 1–3 and all the fixes below, including the fault-D fix (PR #16). Tool
  tests pass (85/85, Node 22, **with TS 5.6.3 — run `npm ci` first**; see the note
  at the end). `npm ci`/`npm test` in `tool/` takes ~2 min. Stage 5 (the walk
  commands) is not built yet.
- **The trial** runs in `neobobkrause/process3-probes` on `process4` commit
  `dfaad79`. The owner decided (19 Nov) to move it onto `process4` `main`; that
  move should point at the current tip `267b709` (all fixes, fault D included), and
  the trial ROOT must be restarted to load the widened File B approvals.

## This session's work (19 Nov) — all merged to `main`

- Set up PROCESS's records: PR #8 (`process/` folder). Merged.
- Shared-state issue: **deferred** on the owner's word until ROOT first runs.
- Approvals widened: File A (`process4` `CLAUDE.md`, PR #12) and File B
  (`process3-probes` `CLAUDE.md`), both committed by the owner.
- Faults 7 and 8 fixed: PR #13. Merged.
- Round-4 fixes B, A, C: PR #14. Merged. (B: PROCESS starting-text clarification;
  A: repo-aware required-check name; C: `ready`/`results`/`close` default to the
  job's one open pull request.)
- Decisions recorded verbatim in `process/design-decisions.md`: faults 7+8
  ("Decision: adopt the fixes for faults 7 and 8 in PR #13") and B/A/C
  ("Decision: adopt the round-4 fixes B, A and C in PR #14"), both 19 Nov 2026.

## Trial faults — status

Analysis in `process/research/trial-faults-19nov.md` and `round4-faults-19nov.md`.
The coordinator's current open list was five; four are resolved:
- Faults 1–4 (missing `check`/`listing`/`related`; cancelled-run misreport):
  fixed in `6be2618`; clear when the trial adopts a post-`6be2618` commit.
- Fault 6 (ROOT starting PROCESS / cross-repo messaging): approvals widened
  (PR #12 + File B). **Unproven** — confirm when ROOT next tries.
- Faults 7, 8 (coordinator relay; job reads ARCH decisions): fixed, merged (#13).
- Round-4 #1 (`close`/`ready` need the PR number): fixed by C, merged (#14).
- **Fault D — RESOLVED (PR #16, merged to `main` `267b709`, 19 Nov 2026).** The
  tool's `check` reported every type disagreement in a module's files, so it failed
  required runs on correct deliberate error-condition tests (`assert.throws` with a
  wrong-typed value). Researched in
  `process/research/faultD-check-wrong-type-tests-19nov.md` (four options, measured
  against the notice's proof). The owner chose Option B ("Decision: B", 19 Nov),
  recorded in `process/design-decisions.md`. The fix exempts values inside error
  assertions (reads them as "cannot tell"); it flips 1 of the proof's 48 recorded
  refusing decisions (P09) and keeps the rest. Tool tests 85/85 with TS 5.6.3.

## Next steps / waiting on the owner

1. **Fault D** — done (PR #16, above). No open process faults remain from the
   trial's list.
2. Once satisfied, the owner moves the trial onto `main` (now tip `267b709`, which
   carries the fault-D fix) — a marked decision in the trial coordinator's session —
   and restarts the trial ROOT.
3. Builder's "eight gaps in the texts" reconciled: the owner pasted the current
   list (five); all five are now addressed.

## Known environment facts (IMPORTANT — do not repeat the earlier mistake)

- **The tool works from this session.** `node tool/p4.mjs <cmd>` reaches GitHub
  (it spawns `gh` as a child, which is allowed) and is authenticated. This session
  merged PRs #8, #13 and #14 with `p4 merge`. Only a **direct** `gh`/git command is
  refused by the permission checker — that is by design (the deny list forces
  GitHub through the tool) and is **not** the tool being blocked. Always verify an
  act with the tool before telling the owner it cannot be done (this is now rule 8
  of the PROCESS starting text, fix B).
- There is **no MCP merge tool**; use `p4 merge <pr>`. The MCP `github` tools are
  available for reads and for opening/updating PRs.
- `main` is **branch-protected**: a merge needs the required check passing on the
  head commit. For the process repo the check is `tool-tests`; it runs ~2 min when
  a `tool/`, `shims/`, `starting_texts/` or `tool-tests.yml` file changed, and
  passes at once otherwise. A merge attempt before green returns "Required status
  check tool-tests is in progress" — wait and retry (not a permission refusal).
  `p4 merge` also waits 60 s between merges into the same branch.
- Cannot force-push, push to `main`, delete branches, or edit `CLAUDE.md` /
  `.claude/settings.json` (the owner commits approvals himself).
- **The tool's one dependency must be the pinned TypeScript (5.6.3).** This
  container came with TypeScript 6.0.2 in `tool/node_modules`, which makes
  `check`/`listing`/`notify` read differently and fails 3 tool tests (notify ×2,
  the round4 proof series) with a "reads with TypeScript 6.0.2" note. Run
  `cd tool && npm ci` first (CI does): it restores 5.6.3 and the suite is 85/85.
  A red suite here is almost always this, not a real break.
- Flow for a process change: research in `process/research/` → present options →
  the owner's marked "Decision:" words → record them in `process/design-decisions.md`
  in the same PR as the change → `p4 merge` once `tool-tests` is green.

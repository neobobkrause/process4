# PROCESS handover — interim

**Interim and pre-live.** A bridge, used only while nothing is in force and the
tool is still being first built. Once the shared-state issue exists, the handover
lives there in the `handover-process` record (design part 4, section 4; build text
5, section 4) and this file is retired.

Last written: 2026-11-19, by the first PROCESS session (session_012hdw2Ro5Cspj5nk3qL4vu3).

## What a successor should read first

Read in full, in order (PROCESS's starting text): all eleven design parts
(`design/00` to `design/10`); then `build/05-the-records-and-following.md`; then
the record of the owner's decisions (`process/design-decisions.md`); PROCESS's own
folder (`process/`); and this handover.

## Where things stand (2026-11-19)

- **Nothing is in force.** The design document is still "proposed"; per `CLAUDE.md`
  we are in the first-build phase. The `process4` repo approvals were widened on
  19 Nov (PR #12) to let PROCESS message a product's coordinator and ROOT and run
  its own lanes.
- **The tool is at stage 4.** `main` (tip `8225028`) has the stage-4 notice piece
  (`listing`, `notify`, `check`, `related`) plus stages 1–3. Tool tests pass
  (82/82, Node 22). TypeScript is the one dependency (the language reader); `npm
  ci` in `tool/` is slow (~2 min). Stage 5 (the walk commands) is not built yet.
- **The trial** runs in `neobobkrause/process3-probes` on `process4` commit
  `dfaad79`. The owner decided (19 Nov) to move it onto `process4` `main`; that
  move should now point at the post-fix `main` tip (see below), and its ROOT must
  be restarted to load the widened File B approvals.

## This session's work (19 Nov)

- Set up PROCESS's records: **PR #8** (`process/` folder — README, this handover,
  `research/`), open, awaiting the owner's merge.
- Shared-state issue: **deferred** on the owner's word until ROOT first runs.
- Gave the owner the full updated text for both approvals files (File A =
  `process4` `CLAUDE.md`, merged as PR #12; File B = `process3-probes`
  `CLAUDE.md`, merged by the owner).
- Prepared and recorded the fixes for trial faults 7 and 8: **PR #13** (ready),
  holding the two edits, the decisions record with the owner's words, and the
  research file. Owner's decision recorded verbatim: "Decision: adopt the fixes
  for faults 7 and 8 in PR #13" — 19 Nov 2026.

## The eight coordinator-reported trial faults — status

Analysis in `process/research/trial-faults-19nov.md`.
- Faults 1–4 and the command part of 8: **already fixed in `6be2618`** (adopt that
  commit — or the later `main` with the fixes — to clear them).
- Faults 1/5 (bare `ready`/`close` forms): **no change** (nothing broken).
- Fault 6 (ROOT starting PROCESS / cross-repo messaging): **approvals widened**
  (PRs #12 and File B). Cross-repo start/message is unproven; confirm by trying.
- Faults 7 and 8: **fixed in PR #13** (approved, awaiting merge).

## Waiting on the owner / next steps

1. Merge **PR #8** and **PR #13** (either order; no file conflict). This session
   cannot merge — no merge tool here and the `p4`/`gh` path is blocked, so merges
   are the owner's click (the first-build norm).
2. After merge, re-point the trial's "move onto `main`" decision at the new `main`
   tip (the commit that includes PR #13), not `6be2618`, so the trial restarts
   once onto the complete version. Give that as a marked decision in the trial
   coordinator's session; restart the trial ROOT (also loads File B approvals).
3. **Reconcile** the builder's separate "eight gaps in the texts" (on the owner's
   standing page, not in the repo, not reachable by PROCESS) with the coordinator's
   eight faults — ask the owner to paste them if they differ.

## Known environment facts (this harness/session)

- GitHub here is reached through the MCP `github` tools, not `gh`. The `p4` tool is
  built on `gh`, so `p4` GitHub commands are refused here, and **there is no MCP
  merge tool** — PRs are merged by the owner. Plain repo work (write, commit, push
  to a working branch, open/update a PR by MCP) is the sanctioned route, matching
  "the harness's ordinary means" for the first build (design part 4, section 11).
- Can't force-push, push to `main`, or edit `CLAUDE.md`/`.claude/settings.json`
  (approvals). Working branches this session: `claude/process-repo-setup-2wgwvz`
  (PR #8), `claude/process-fixes-faults-7-8` (PR #13).

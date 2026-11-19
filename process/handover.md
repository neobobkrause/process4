# PROCESS handover — interim

**Interim and pre-live.** A bridge, used only while nothing is in force and the
tool is still being first built. Once the shared-state issue exists, the handover
lives there in the `handover-process` record (design part 4, section 4; build text
5, section 4) and this file is retired.

Last written: 2026-11-19, by a PROCESS session (session_012hdw2UKJgbfzjKvHCV4eMY),
after validating cross-repo comms and starting tool stage 5 (the walks).

## The owner's standing direction (19 Nov 2026)

The owner told PROCESS, in conversation, to drive the goal autonomously: "develop,
test, and evolve process4 to the point that it meets all design requirements and can
be used for development of both the trial product and larger products like
civicsmith," taking on stage 5 and then each next task without waiting for per-step
go-aheads. So: build the designed remainder (stages 5, 6, 7), validate in the trial,
settle owner-open items as Claude-decided where technical (overrulable) and flagged
where product, and merge building work under the standing approvals (tool-tests
green), keeping this handover and the task list current. A marked "Decision:"/
"Instruction:" is still required to change a RULE/requirement or record approval.

## What a successor should read first

Read in full, in order (PROCESS's starting text): all eleven design parts
(`design/00` to `design/10`); then `build/05-the-records-and-following.md`; then
the record of the owner's decisions (`process/design-decisions.md`); PROCESS's own
folder (`process/`, including `research/`); and this handover.

## Where things stand (end of 19 Nov 2026)

- **Nothing is in force.** The design is still "proposed"; per `CLAUDE.md` we are
  in the first-build phase. The `process4` approvals were widened (PR #12) to let
  PROCESS message a product's coordinator and ROOT and run its own lanes.
- **Stage 5 (the walk commands) is BUILT and merged** (PR #21, `main` tip
  `12b7dfe`). `tool/lib/walk.mjs` has walk open/close/write/read/text/areas;
  walking-session and UX-lane starting texts verified; build text 2 §7 already
  specifies the `walk`/`deploy`/`walks_folder` config. Tool tests **95/95**,
  Node 22, **with TS 5.6.3 — run `cd tool && npm ci` first**. **Stage 6 (release)
  and stage 7 (account switch) are NOT built** — stage 6 is the next build.
- **The trial** runs in `neobobkrause/process3-probes`, now on `process4`
  `c14e4f9` (moved via product PR #364; ARCH record confirms). Rounds of jobs have
  run; no walk has run yet (blocked on stage 5). Live trial roles as of 20:48Z:
  coordinator `session_012hdw2R5GW3dLuFJs61jAHX`, ARCH `session_012hdw2SyBhE5uNvX4LtXXzR`,
  ROOT `session_012hdw2SNwQp6h8qJhDRrZoV`, watcher `session_012hdw2UPxUg4uJ5yPtwwGrF`.
- **Cross-repo PROCESS comms: VALIDATED.** Round-trip PROCESS↔coordinator confirmed
  20:50Z (coordinator replied "received, replying works"). The cause of the earlier
  "Unsanctioned Communication" denials was the auto-mode classifier treating
  cross-repo traffic as external; fixed by an `autoMode` block added to the **BIO**
  environment's setup script (all dev sessions run in BIO). Grounds:
  `process/research/automode-classifier-strategy-19nov.md` and
  `cross-repo-process-messaging-19nov.md`.

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
- Fault D fix: PR #16. Merged. ("Decision: B".)
- Environment permissions-management check on startup/account switch: PR #18.
  Merged. (Owner's "Instruction:" of 19 Nov; design part 7 §5 defines the autoMode
  strategy; the check is in parts 1 §3, 7 act 6, 4 §7.)
- Move-to-latest (decision C): PR #19. Merged. One instruction to the coordinator
  moves a product to the latest/named version; tool gained `latest-version`.
  ("Decision: C".)
- Research grounds landed on `main`: PR #20.
- autoMode block added to the BIO environment (via update_environment; the owner
  approved the card). Takes effect on fresh container starts.

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

## Next steps / the roadmap (task list mirrors this)

Driving the critical path autonomously (owner's standing direction above):

1. **Stage 5 — the walks: DONE** (PR #21, merged `12b7dfe`). Tool commands + texts
   built and tested. REMAINING is trial-side, not a process4 build: the made-up
   two-screen walk product (Screens doc, two journeys, `walk`/`deploy` config) and
   the actual walk runs happen in the trial repo, driven by the trial ARCH/ROOT
   (build text 3 §8, smallest first). Now that cross-repo comms work, PROCESS can
   message the trial coordinator to prompt it; the session-starting is theirs.
2. **Stage 6 — release: NEXT (start here).** Task #2. Build `release prepare
   <version> --notes <file> [--file ...] [--development]` and `release publish
   <version> --approval "<words>"` (specs: build text 1b commands 7–8; design part 3
   §6), the GitHub release API calls in `tool/lib/github.mjs`, and scope 5 — the
   mechanical edit — in `tool/lib/scope.mjs` (build text 1 §5 step 5: whole module
   for each module a non-job `work/` branch touches; plus the trial-only
   `trial.mechanical_edit_tests: "none"` form). Add tool tests; keep the suite green
   (run `npm ci` first). The fork pattern (delegate implementation, review, merge)
   worked well for stage 5 and is a good way to keep PROCESS context lean.
3. **Stage 7 — account switch + written procedures.** Task #3.
4. **Settle owner-open items** (part 10 §1). Task #4.
5. **Never-retry clarification** (coordinator-gh + classifier-noise) — Task #5;
   research recorded (`coordinator-gh-in-tool-command-19nov.md`); options A/B/C,
   recommended B+C; **awaiting the owner's marked decision** (the one item that needs
   his word before building). Not on the critical path.
6. Then the first real tranche (proof), and civicsmith conversion (needs its own
   conversion plan + the owner's setup acts + the autoMode settings on its env).

No open process faults remain from the trial's original list; all five are addressed.

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
  `cd tool && npm ci` first (CI does): it restores 5.6.3 and the suite is green
  (86/86 as of stage-5 start). A red suite here is almost always this, not a real
  break.
- Flow for a process change: research in `process/research/` → present options →
  the owner's marked "Decision:" words → record them in `process/design-decisions.md`
  in the same PR as the change → `p4 merge` once `tool-tests` is green.

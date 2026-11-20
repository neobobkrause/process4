# Queued consistency fixes + option-C ripples, and two owner findings (20 Nov 2026)

Recorded by PROCESS (rule 3) before proposing. Continues the 80% handover
(`process/handover.md`, main tip `5b7d624`). The verification sweep
(`verification-sweep-19nov.md`) and PR #34 did findings #1, #3 (design/06 only),
#4, #5. This note records the grounds for the remaining queued corrections, the
additional option-C ripples found while reconciling, and the two findings that
are the owner's to settle.

## A. Autonomous corrections (no rule change; standing direction; tool-tests green)

Each makes a text faithful to the settled design or to the built tool. None adds a
test, gate, review or stop (rule 2).

1. **build/01b command specs (sweep #2).** `ready`, `results`, `close` still show
   PR-number-only signatures. The built tool (the faithful artifact) takes
   `[<pr>] [--branch <b>]` with a current-branch default, per the decision record
   ("Naming the pull request for a job's commands", 19 Nov) and fault o. Tool help
   strings (`tool/p4.mjs:94-99`) are the source of the corrected wording:
   - `ready [<pr>] [--branch <b>]` — by number, by --branch, or the current branch's one open PR.
   - `results [<pr>] [--branch <b>]` — same.
   - `close [<pr>] [--branch <b>] [--nothing-to-change "<why>"]` — same; a job on a detached checkout names --branch or the number.

2. **build/01b "Nothing here is built" (sweep #3, build/01b half).** PR #34 fixed
   design/06 §5 but not build/01b:5. The tool is built (105/105); build/01b
   describes the built commands, so "Nothing here is built" is false. Reword to
   "built but not yet proven in a running process" (nothing is in force). build/01's
   own status line is checked in the same pass.

3. **process.md "interrupt" lane act (sweep #6).** The owner's approvals grant
   PROCESS "start, message, interrupt and archive its own lanes"; `process.md`
   lists only "Start, message and archive." Add "interrupt". process.md fills to
   4,091 bytes (5 under 4,096), so an offsetting trim is needed; per the decision
   record ("How the starting-text size limit is measured", 20 Nov) the limit is on
   the instructions proper and PROCESS carries no fetch line.

4. **starting_texts/00-index.md stale (sweep #7).** Section 1 raw-byte table is
   stale for several texts; the "as filled" table never measured the now-tighter
   coordinator/process texts; the self-declared line count is off by one. Refresh
   from measured `wc -c` values (20 Nov): root 3,770 (handover), coordinator 3,868
   raw, process 4,091 raw, arch 3,823 raw, etc. Re-measure after the process.md
   edit lands.

5. **Option-C ripples (same class as sweep #8; found while reconciling).** Option C
   (the owner's decision, 19 Nov; PR #32) made the OWNER start/refresh PROCESS and
   the COORDINATOR find PROCESS running. PR #32 updated design parts 1/4/6/7/10 and
   the PROCESS/ROOT/coordinator starting texts, but not these:
   - `build/04-the-trial.md:84` — "ROOT reads PROCESS's record ... and starts
     PROCESS" → the coordinator surfaces starting PROCESS on the owner's standing
     page, the owner starts it (design part 10 §4 item 10; part 6 §6).
   - `build/06-the-account-switch.md:105` — "or ROOT starting it" → drop; the owner
     starts PROCESS, surfaced by the coordinator (part 6 §7).
   - `build/05-the-records-and-following.md:110` — "ROOT finds PROCESS running" →
     the coordinator finds PROCESS running (part 6 §7; part 4 §5; decision record).
   - `build/01b-the-commands.md:28` — `state read --repository` example "ROOT reads
     PROCESS's record so" → the coordinator reads PROCESS's record so.
   - `starting_texts/arch.md:25` — rule 8 "ask ROOT to start PROCESS if it is not
     running" → ARCH passes the fault to the coordinator, which gets it to PROCESS /
     surfaces its start to the owner (design part 6 §6). arch.md was NOT in PR #32's
     list, so this is a genuine stale reference.
   root.md and coordinator.md already match option C (root.md: "you do not start or
   refresh PROCESS; the owner does"; coordinator rule 5 surfaces the start prompt,
   act line reads PROCESS's record). No change needed there.

6. **Item-8 dangling citation.** design/06 §2 and part 10 §1 item 8 cite a proposal
   file `process4/working/design_work_18nov/owner_acts_and_approvals.md` that the
   handover confirmed missing from the public process3 repo. The real in-force text
   is the owner's committed `CLAUDE.md` standing-approvals block and the
   `.claude/settings.json` deny list in each repository. Reword to point there and
   drop the dangling working-file citation. This does NOT decide the wording (that
   stays open with the owner — item 8); it only fixes a broken reference.

## B. The owner's to settle (bring options; do not build) — carried from the sweep

A. **Round-done deadlock on a walk-flaw-only module (sweep finding A, VW3 GAP 1).**
   A walk flaw is placed against module M; M's job finds the fix belongs elsewhere
   and closes its PR unmerged. `finished(M)` never returns true (a walk-flaw module
   is "finished only by a merge" — design part 2 §4), yet `open --module` already
   stripped the flaw from waiting-work, so `next-job` never re-picks M and
   `round-done` reports not-done forever. Design part 2 §4 sanctions the scenario
   ("the flaw goes back to ARCH, which places it against another module") but gives
   M no path to "finished" or to being dropped from the round. Latent; bites only
   once walks run (stage 5, unproven). A correction (not a new gate) but it changes
   round-done behaviour, so options go to the owner first.

B. **Lane→coordinator channel (sweep finding B, VW4-1).** design part 1 §4 and
   lane.md rule 4 say a marked owner message to a lane "is passed to the
   coordinator exactly as typed for the record," but lane.md's Acts grant only
   messaging ARCH, and design part 4 §3 routes all lane traffic through ARCH; no
   lane→coordinator channel exists. Resolve by routing via ARCH (conservative, keeps
   "lanes talk only to ARCH") or by granting a direct channel (an addition). A
   design choice for the owner.

Both A and B are surfaced on the owner-open review page
(https://claude.ai/artifact/617wp1vSKDpubVbwiGDpUU) as new open points, with
options and a recommendation, "no change" always included.

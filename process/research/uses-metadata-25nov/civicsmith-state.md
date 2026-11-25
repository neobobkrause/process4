# civicsmith's refactoring and tranche t2, as civicsmith ARCH #27 measured them (25 Nov 2026 ~16:00Z)

Asked for by PROCESS #15 after the owner said (conversation, 25 Nov ~15:25Z): "We need to recognize that civicsmith is in
the middle of a very important and involved refactoring process. But this process isn't going well at all because of this
provider/user flaw in the process. So while we know that this needs to be fixed, we also need to preserve the refactoring
plan, the current state of that work, the effort it'll take to add metadata to every module, and decide whether we start
the refactoring over after this flaw is fixed." Passed by coordinator #9 to ARCH #27, which answered read-only (p4-tranche
62d18613, main 32545487). Its message, shortened; counts are its, from git and the shared state.

## 1. The plan
- Design: `process/lanes/plane-scope/design.md` (25,024 bytes) with research in `process/lanes/plane-scope/research/`; ARCH's
  decisions in `process/decisions-arch.md` ("The layers: order and the refactoring plan" to "Test helpers other modules
  import"). Both on p4-tranche only, not on main.
- Intent: re-stack by the owner's layers so the door (control-plane) and launcher (plane) sit below the UI, routing moved into
  the door, a new top module (plane-program); move ~120 test files plane holds to the modules whose promises they prove.
  Eight steps: 1 capture move, 2 routing into the door, 3 tests to owners, 4 splits, 5 door takes UI from outside, 6 top
  module, 7 the order move, 8 upward reaches by path.
- Progress: step 1 built; step 2 half built (control-plane R124 and plane R6 not met); steps 3–8 not started.

## 2. Tranche t2 (opened 24 Nov ~22:05Z after the t1 drop)
- Round 1 only; no walk. Recorded scope: 12 requirements (10 met). Notices are always work, so most of t2 has been notices.
- Round record (stale): 200 modules; 143 finished (81 by merge, 98 by nothing-to-change, some both); 8 open; 49 "has work"
  (notices from 1339/1345/1350/1356 and others, never given a job).
- Open, all pushed, nothing running: link-sweep.1 PR 1675 (draft), scheduler.1 PR 1676 (no work). Closed by ARCH #26 to reopen
  after a move: filings.1 1669, following.1 1674 (job block over 65,536 characters), escalation.2 1670 (work at 128695f1).
- Waiting work: 943 entries (938 notices) over 51 modules, at GitHub's comment limit; `notify` cannot write it.
- **99 merged pull requests whose `notify` has not run** (waiting work cannot be written), plus 1350 held on the owner's
  instruction. Their users have not been told. The list lives only in ARCH's handover text. Job flaws owed, not placed.

## 3. Since t2 opened (PRs 1337–1678)
- 324 job pull requests over 168 modules: 154 merged, 170 not merged (~163 closed with nothing to change).
- 18 ARCH and coordinator pull requests. Most jobs for one module: office-readers 10, odf-reader 7.
- Cost unmeasured; ARCH #22's handover says ~$1.2–1.8 per nothing-to-change job (unverified). ARCH ran 27 generations, at
  least 3 compacted.

## 4. At risk while held
- No unpushed work known. Records over size: waiting work (at the limit), round (89,773 bytes), handover-arch (43,295).
- The real loss risk: the 99 unrun notices exist only as a list in ARCH's handover.

## 5. Size (204 modules)
- Source: 1,153 files, 450,311 lines. Tests: 3,647 files, 653,800 lines. 10 code files owned by no module.
- Largest by files: journey-check 159 src / 70 test; plane 6 / 190 (29,654 test lines); control-plane 11 / 101;
  store-assembly 6 / 100.

## 6. Tranche against main
- main is an ancestor of p4-tranche. 1,070 files changed: 444 under `process/`; 624 in 124 modules, +24,809 / −5,104 lines.
- Most of it is comment and interface-statement work and notice responses, not the plan; the plan's own built code is the
  capture move and `routing.mjs` (ARCH's reading).

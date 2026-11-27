# PROCESS research: the index

PROCESS records research here before it proposes a change (design part 6 §7; its rule 3). Research is background, not
governing text (design part 5 §3): PROCESS reads this index in full and opens a file when a question needs it. One short
line per file, with its outcome; keep it current.

## 27 Nov 2026
- `job-reading-27nov.md`: trimming a job's reading set, over the 175,000-byte maximum; options 0, A–D; "Decision: C & D".

## 26 Nov 2026
- `github-limits-26nov.md`: safeguards against GitHub's rate limits, process3's and ours; options 0, G1–G3; G1 and G2 decided (with A below).
- `unconverted-told-every-merge-26nov.md`: each ordinary merge told all ~199 unconverted modules; options 0, A, B, H, J, N; "Decision: A, G1, G2, H, J, N".
- `uses-rewrite-slow-26nov.md`: `p4 push` rewrote uses files slowly (a type-check per module); "Decision: A, the speed fix".
- `uses-file-version-26nov.md`: the uses file and the tool's version; how readers read older files; "Decision: A".
- `weakness-implications-26nov.md`: choices made without following their cost; decided: a principle in design part 1 §6 and a known-weakness row.
- `types-and-bounds-only-26nov.md`: "Decision: only a change of an item's stated types or bounds tells", built and measured; then "Decision: A".
- `first-pass-figures-26nov.md`: civicsmith's figures for its first 8 conversions; PROCESS's estimate for 204 modules; questions open.
- `conversion-tells-no-one-26nov.md`: "Decision: a conversion's merge tells no one.": why, the risk, what was built.
- `notify-size-26nov.md`: `notify` could not send five conversion notices; causes and the fix; "Decision: A".
- `rules-r15-r19-host-26nov.md`: R15 and R19 reading faults, Node features added by hand, option C sized; "Decision: A".
- `no-code-module-26nov.md`: civicsmith's `documents` has no code, so cannot finish converting; a list error for ARCH; options 0 (recommended), B.
- `facility-names-26nov.md`: process fault: facilities named by machine path, product members counted as host's; "Decision: A, as recommended".
- `conversion-notices-26nov.md`: first facility list read as a version change; a conversion telling every later module; "Decision: 1-A, 2-B1, 6B".
- `trial-who-is-told-26nov.md`: the plan for the trial of who is told on process3-probes (Part D step 5), and what it cannot show.
- `root-lineage-26nov/`: each ROOT takeover goes a level deeper; "Decision: B" (measurement failed, A built), then "Decision: D, as recommended".
- `precision-26nov/`: who is told, measured; misses traced; design checked and cut; "Decision: remove the rule that accepting more tells no one".

## 25 Nov 2026
- `tidy-25nov.md`: the tidy study (contradictions, combining, concision) of design, build and starting texts; settled under cleanup B; some items his.
- `arch-compacted-fill-unread-25nov.md`: civicsmith ARCH compacted while idle; options 0, A–C; "Instruction: Turn idle compaction off" (A); B open.
- `uses-metadata-25nov.md`: the owner's proposal: each module keeps a file of the providers it uses; first analysis; designed in the folder below.
- `uses-metadata-25nov/`: the uses-file design, the coding standard, studies and proofs; "Decision: C, the full standard, with the first pass of 8".
- `who-is-told-25nov.md`: how the tool decided who is told, flaws F1–F7, root cause; options 0, A–D; prototype `who-is-told-25nov/proto.diff`; not put to the owner.
- `cleanup-audit-25nov/`: audits of the last 36 hours' changes and limits; options A–C; PROCESS's reading set; "Decision: B, (ii)".
- `waiting-work-record-size-25nov.md`: waiting-work record over GitHub's comment limit; options A–C; `waiting-work-record-size-25nov/6b.patch`; 6B decided.
- `depth-limit-watcher-25nov.md`: a watcher at depth 8 could not arm its wake; warning one takeover late; options A–C; decided under `root-lineage-26nov/`.
- `first-comments-2c-25nov/`: prototype of options 2C, 2C+ and 2D; results in `notify-1356-still-197-25nov.md`.
- `same-name-entries-25nov.md`: five files export `generate`; the listing kept one; fix `same-name-entries-25nov/tool.patch`; "Decision: 4b".
- `notify-1356-still-197-25nov.md`: `notify 1356` still told 197 (first `@throws`/`@bound` as a change; an `unbracket` fault, 1B); options A–D.
- `narrowing-decision-2-25nov/`: prototype of narrowing decision 2; results in `notify-rerun-repeats-25nov.md`.
- `notify-1356-anything-to-stated-25nov.md`: comments stating kinds once "anything" told 198; a lost 422 reason; decision B, built.
- `notify-rerun-repeats-25nov.md`: a re-run told 125 and repeated notices to finished jobs; decision B; the narrowing measured; decision 3B; built.
- `ready-on-ready-pr-25nov.md`: `p4 ready` on a ready or merged pull request gave a GraphQL refusal; decision B (say so plainly).
- `not-followed-told-everything-25nov.md`: a user not followed fully was told of any change; decision B (only of a change that tells users).
- `waiting-work-too-large-25nov.md`: `notify 1339` could not write waiting work, losing notices; decision B (reasons on the merged pull request).
- `merges-held-for-notify-25nov.md`: ARCH held ready jobs while `notify` ran; options A–C; B chosen (merging goes on, `notify` in the background).
- `notify-slow-early-provider-25nov.md`: `notify` took 43 minutes and 8 GB on civicsmith; cause and fix; decision B, built.
- `test-on-stale-branch-25nov.md`: `p4 test` ran on the job branch, not its merge into the tranche; options A–C; B chosen (merge the tranche in first).

## 24 Nov 2026
- `move-with-new-workflow-24nov.md`: a move with a new workflow fails as one pull request, passes as two in order; "Decision: B, as recommended".
- `update-trial-process3-probes-24nov.md`: the update's trial on process3-probes: no fault; what it did not show.
- `civicsmith-check-count-brief-24nov.md`: brief for a read-only count of `check`'s refusals on civicsmith-copy before civicsmith moves.
- `update-build-spec-24nov.md`: what to build for "Decision: the update plan as laid out", and technical choices beyond it.
- `refactor-plan-check-24nov.md`: a worker's check of civicsmith's refactoring plan against the update plan.
- `update-plan-24nov.md`: the update plan: tests once in the job, notices to running jobs, merge order, slots; "Decision: the update plan as laid out".
- `dropped-tranche-24nov.md`: no route carried out the drop of civicsmith's t1; options A–C; "Decision: C, as recommended".

## 23 Nov 2026
- `change-group-23nov.md`: the group of changes put to the owner on 23 Nov; taken into the update plan of 24 Nov.
- `long-modules-23nov.md`: where tests run and how long each place allows; options (worker).
- `module-uses-23nov.md`: what the check saw as a use (path imports only); why the third reading found more; options (worker).
- `tests-once-and-merge-order-23nov.md`: the changes agreed in conversation on 23 Nov; taken into the update plan.
- `module-tests-timeout-23nov.md`: the required run's 45-minute limit cancels a module's passing tests; options A–C.
- `check-names-wrong-provider-23nov.md`: refusal (b) counted the giving side's comment, not the receiving one; options A, B.
- `draft-run-passes-ready-pr-23nov.md`: a run that saw a draft passes it once ready, with no tests run; options A–C; not put to the owner.
- `notice-reason-size-23nov.md`: a "not followed fully" reason lists every place and outgrows a comment; options A, B; not put to the owner.
- `class-member-bound-23nov.md`: a class member's own `@bound` left out of its listing; options A, B; not put to the owner.
- `held-requirements-23nov.md`: ARCH could not hold a requirement out of a tranche; options A–D; "Decision: D, as recommended" (a scope list).
- `blocked-record-not-cleared-23nov.md`: a job's blocked record stayed after it went on; decision B (`push --unblocked`).
- `notify-out-of-memory-23nov.md`: `p4 notify` ran out of memory on civicsmith; decision B, then decision D (a staged reading).
- `no-repository-secrets-rule-23nov.md`: the rule that a product's repository holds no secrets had no source; decision B (dropped).
- `job-branch-name-collides-23nov.md`: `job/<module>/<n>` collided with old `job/<module>` branches; decision B (`job/<module>.<n>`).

## 22 Nov 2026
- `repository-secrets-22nov.md`: civicsmith's workflows hold repository secrets act 3 would remove; withdrawn 23 Nov.
- `check-on-real-code-22nov.md`: `check` on civicsmith's real code refused nearly everything; "Decision: 3B, as recommended"; exclude list.
- `fault-fetch-copy-not-read-only-22nov.md`: `chmod -R a-w` did not make the process copy read-only; decision 1B (drop the step).
- `fault-lanes-record-before-start-22nov.md`: the lanes record could not name a lane claimed before its start; decision 2B.
- `lane-reading-set-over-maximum-22nov.md`: reading sets grew past the maximum through research; decision B (an index).
- `product-onboarding-22nov.md`: the onboarding lane, reading a product, settings, the product's token; the owner's decisions in it.
- `refresh-at-every-pause-22nov.md`: long-lived roles refreshed at every pause; decision B (the fill level decides).
- `root-refresh-cadence-22nov.md`: why the trial's ROOT refreshed about hourly; no change.
- `tests-referring-to-later-modules-22nov.md`: tests that reach a later module; decision B (`check` refuses it).
- `wake-left-after-archive-22nov.md`: a replaced session's wake kept firing; decision B (whoever archives removes it).

## 21 Nov 2026
- `approvals-draft-civicsmith-copy-21nov.md`: the drafted approvals and deny-list file for civicsmith-copy, with later corrections.
- `first-approvals-in-existing-product-21nov.md`: no route to a product's first approvals when its old ones forbid it; options A–C.

## 20 Nov 2026
- `approvals-draft-process4-20nov.md`: the drafted approvals for this repository, as the owner landed them.
- `civicsmith-lane-points-20nov.md`: the civicsmith lane's nine setup points judged; decision B.
- `coordinator-cannot-read-process-liveness-20nov.md`: a cross-repository read of PROCESS's record is refused; decision C.
- `design-history-separation-20nov.md`: the design carried history; the cleanup the owner approved.
- `owner-acts-without-files-20nov.md`: owner's acts that assumed he edits files; decision B (choose, don't type).
- `queued-consistency-and-option-c-ripple-20nov.md`: corrections after option C; two sweep findings put to the owner.
- `session-naming-standardization-20nov.md`: standard session names and the generation counter; decision B.
- `tranche-unrelated-to-main-20nov.md`: the trial's tranche branch shared no history with main; "Decision: option C".

## 19 Nov 2026
- `automode-classifier-strategy-19nov.md`: classifier refusals across repositories; the `autoMode` settings as the cure.
- `close-detached-checkout-19nov.md`: `close`/`ready`/`results` from a detached checkout; fix B (`--branch`).
- `coordinator-gh-in-tool-command-19nov.md`: a `gh` command mixed into a recording command; record from a file.
- `cross-repo-process-messaging-19nov.md`: "Unsanctioned Communication" refusals; the non-substantive re-attempt.
- `faultD-check-wrong-type-tests-19nov.md`: `check` refused deliberate error tests; decision B ("cannot tell").
- `move-to-latest-version-19nov.md`: one instruction moves a product to the latest Process4 version; decision C.
- `process-refresh-cross-repo-19nov.md`: the PROCESS refresh that never started; decision B.
- `root-refresh-of-process-failed-again-19nov.md`: the PROCESS refresh failed again; decision C (the owner starts PROCESS).
- `round4-faults-19nov.md`: the trial's round-4 faults; fixes B, A and C adopted.
- `trial-faults-19nov.md`: the trial's eight faults; faults 7 and 8 fixed.
- `verification-sweep-19nov.md`: six workers checked Process4 against its design; corrections and two owner items.

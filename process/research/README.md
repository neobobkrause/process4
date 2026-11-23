# PROCESS research: the index

PROCESS records its research here before it proposes a change (design part 6, section 7; rule 3 of PROCESS's starting
text). Research is background, not governing text (design part 5, section 3): PROCESS reads this index in full, and reads
a file, or gives it to a worker, when a question needs it. One line for each file; keep it current.

## 23 Nov 2026
- `change-group-23nov.md` — the group put to the owner on 23 Nov evening: tests once in the job (one background command, up to 2 hours), notices to running jobs, merging after the modules a job uses, slots, the check's two faults, module tests through imports only; and what to do now.
- `long-modules-23nov.md` — where tests run and how long each place allows: a session's background command up to 2 hours, GitHub 6 hours, the 45 minutes the process's own; tests already run in parallel; options (worker).
- `module-uses-23nov.md` — what the check sees as a use (imports by path only; misses `require` and the product's own name; no path strings); why the third reading found more; options (worker).
- `tests-once-and-merge-order-23nov.md` — the changes agreed in conversation on 23 Nov, for the owner's decision: tests once in the job, notices to running jobs, merging in provider order, slots.
- `module-tests-timeout-23nov.md` — the required run's 45-minute limit cancels plane (44 minutes of tests) after they pass; it stops round 1; options A to C.
- `check-names-wrong-provider-23nov.md` — refusal (b) counted control-plane's comment on the value handed over, where the receiving parameter (store-assembly's) stated nothing: a false refusal under 3B; options A and B.
- `draft-run-passes-ready-pr-23nov.md` — a run that saw the pull request as a draft passes it once ready, with no tests run (civicsmith PR 1228; process4 PR 205); options A to C (not yet put to the owner).
- `notice-reason-size-23nov.md` — a "not followed fully" reason lists every place, so the waiting-work record grows past a comment's size and the notice is lost; options A and B (not yet put to the owner).
- `class-member-bound-23nov.md` — a class member's own `@bound` is left out of its listing, so a changed bound tells nobody; options A and B (not yet put to the owner).
- `held-requirements-23nov.md` — ARCH cannot hold a requirement out of a tranche; the tool counts every not-yet-met line as work, so the round cannot end; options A to C.
- `blocked-record-not-cleared-23nov.md` — a job's blocked record stays after it goes on; measured three times ending by ARCH's decision, not a merge; decision B (`push --unblocked`).
- `notify-out-of-memory-23nov.md` — `p4 notify` reads the whole product twice before asking which modules changed, and runs out of memory on civicsmith; decision B (no reading when no module changed; most of the machine's memory); then a job merge did not fit in 12 GB; the owner asked whether the tool is well designed: decision D, a staged reading of only what a merge can affect.
- `no-repository-secrets-rule-23nov.md` — where Process4 says a product's repository holds no secrets: only act 3 (design part 7 §4), with no source; what is built on it; options A and B.
- `job-branch-name-collides-23nov.md` — `job/<module>/<n>` could not be made beside an old flat `job/<module>` branch (137 of civicsmith's modules); decision B (`job/<module>.<n>`).

## 22 Nov 2026
- `repository-secrets-22nov.md` — civicsmith's own workflows hold repository secrets that act 3 removes (Docker Hub, a Cloudflare token); withdrawn 23 Nov: it rested on act 3's "no repository secrets", which the owner says is false (`no-repository-secrets-rule-23nov.md`).
- `check-on-real-code-22nov.md` — the tool's `check` on civicsmith's real code: 74,271 refusals before decision 3B; after it, 177 of 204 modules pass, 217 comment-based refusals in 27 modules; the exclude list for vendored and built files.
- `fault-fetch-copy-not-read-only-22nov.md` — `chmod -R a-w` did not make the process copy read-only; decision 1B dropped the step.
- `fault-lanes-record-before-start-22nov.md` — the lanes record could not name a lane's session after a claim written before its start; decision 2B (claim first, address after).
- `lane-reading-set-over-maximum-22nov.md` — a lane's (and PROCESS's) reading set grew past the set maximum because research was required reading; decision B (research read through an index).
- `product-onboarding-22nov.md` — the onboarding lane, how it reads a product, who changes settings, a product's token made once; the signing keys stay.
- `refresh-at-every-pause-22nov.md` — long-lived roles refreshed at every natural pause, far below 50 percent (civicsmith ARCH #1 to #4); decision B (the fill level decides, the pause times it).
- `root-refresh-cadence-22nov.md` — why the trial's ROOT refreshed about hourly on 21 Nov: the cost of a quiet wake; no change.
- `tests-referring-to-later-modules-22nov.md` — tests that reach a later module; decision B (`check` refuses a declared later use); what the third reading of civicsmith found.
- `wake-left-after-archive-22nov.md` — a replaced session's scheduled wake left firing into an archived session; decision B (whoever archives removes the wake).

## 21 Nov 2026
- `approvals-draft-civicsmith-copy-21nov.md` — the drafted approvals and deny-list file for civicsmith-copy, with later corrections.
- `first-approvals-in-existing-product-21nov.md` — no route to a product's first Process4 approvals when its old approvals forbid it; options A to C.

## 20 Nov 2026
- `approvals-draft-process4-20nov.md` — the drafted approvals for this repository, as the owner landed them.
- `civicsmith-lane-points-20nov.md` — the civicsmith lane's nine setup points judged; decision B.
- `coordinator-cannot-read-process-liveness-20nov.md` — a cross-repository read of PROCESS's record is refused; decision C (ROOT records PROCESS from its message).
- `design-history-separation-20nov.md` — the design carried history; the cleanup the owner approved.
- `owner-acts-without-files-20nov.md` — owner's acts that assumed he edits files; decision B (choose, don't type) and who drafts approvals.
- `queued-consistency-and-option-c-ripple-20nov.md` — consistency corrections after option C, and the two sweep findings put to the owner.
- `session-naming-standardization-20nov.md` — the standard session names and the generation counter; decision B.
- `tranche-unrelated-to-main-20nov.md` — the trial's tranche branch shared no history with main; option C and its outcome.

## 19 Nov 2026
- `automode-classifier-strategy-19nov.md` — classifier refusals across repositories; the `autoMode` settings as the cure.
- `close-detached-checkout-19nov.md` — `close`/`ready`/`results` from a job's detached checkout; fix B (`--branch`).
- `coordinator-gh-in-tool-command-19nov.md` — a `gh` command mixed into a recording command; record from a file.
- `cross-repo-process-messaging-19nov.md` — "Unsanctioned Communication" refusals; the non-substantive refusal re-attempt.
- `faultD-check-wrong-type-tests-19nov.md` — `check` refused deliberate error tests; option B (error assertions are "cannot tell").
- `move-to-latest-version-19nov.md` — one instruction moves a product to the latest Process4 version; decision C.
- `process-refresh-cross-repo-19nov.md` — the PROCESS refresh that never started; decision B.
- `root-refresh-of-process-failed-again-19nov.md` — the PROCESS refresh failed again; decision C (the owner starts PROCESS).
- `round4-faults-19nov.md` — the trial's round-4 faults and fixes B, A, C.
- `trial-faults-19nov.md` — the trial's eight faults; faults 7 and 8 fixed.
- `verification-sweep-19nov.md` — six workers checked Process4 against its design; corrections and two owner items.

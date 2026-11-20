# PROCESS handover — interim

**Interim and pre-live.** A bridge while nothing is in force and the tool is first being built.
The process repo's shared-state issue EXISTS (#33); `handover-process` carries PROCESS liveness
and the `products` registry. During first-build this file stays the detailed handover.

Last written: 2026-11-20, by **PROCESS #1** `session_012hdw2Rehfe2YmS7NZKPmja`, written from
`main` tip `2b1ed0c` as part of the Decision-B change (the PR this handover is in). Generation 1
is now persisted in `handover-process` (the predecessor recorded none; the field was new), so you,
the successor, are **PROCESS #2** — read 1 there, name yourself `PROCESS #2`, record generation 2.

## You may be starting in a DIFFERENT Claude account — read this first

The owner is carrying out the **first account switch** right now. His marked decision:
**"Decision: B — Move PROCESS to the new account too (to simplify this first account switch)"**
(20 Nov 2026; recorded in `process/design-decisions.md`, subject "PROCESS and the products it
serves share one Claude account…"). So both PROCESS and the trial product (`process3-probes`)
move to a new Claude account **together**, staying single-account — because PROCESS↔product
coordination is session messaging, which the harness scopes to one account, so cross-account
coordination is not available (design part 7 §3; build text 6 §1). If you are PROCESS #2, you are
most likely running under the **new** account.

On start, confirm the switch landed with nothing lost:
1. The tool reaches GitHub from the new account: `node tool/p4.mjs state read handover-process`
   returns issue #33. The shared state is on GitHub, so it carried over untouched.
2. If any cross-session / cross-repo act is refused by the checker, the new account's environment
   setup script is probably **missing the `autoMode` permissions-management block** (design part 7
   §5). That block is not a secret; it rides in the environment's **setup script**. Tell the owner
   to copy the current setup script into the new account's environment (the account-switch checklist
   on his standing page says this). Without it the restart cannot complete.
3. The owner's secrets (the Cloudflare deploy token etc.) live in the new account's environment; he
   replicated them from the old environment (names were: `CLOUDFLARE_API_TOKEN`, `CF_TOKEN`,
   `CLOUDFLARE_ACCOUNT_ID`, `CF_ACCT`, `CS_TEST_CF_*`, `GITHUB_TOKEN`, `BIO_*`, `JOURNEY_*`, plus a
   `api.cloudflare.com` network secret). You do not touch these; the owner enters them.

## Read this first — merge behaviour

**Showing the owner a record entry is transparency, not an approval gate** (design part 5 §2/§5;
PROCESS rule 4). The owner's standing approvals let PROCESS merge into `main` once `tool-tests`
passes, without a person's review. So: once the owner gives a marked decision, record his words,
show him the entry, and **merge on CI-pass — do not wait for a separate "merge it."** Hold only on
a change he has NOT decided, on moving a product to a new version, or on publishing a release.
Faithful-to-settled corrections (making a text match an already-settled decision; no rule change)
merge the same way, under his standing direction.

## Done this session (PROCESS #1)

- Recorded my liveness in `handover-process` as PROCESS #1 (generation 1 now persisted).
- **Set my session title to `PROCESS #1` with set-session-title in Auto mode — it worked.** That is
  one of design part 7 §3's unproven items (a role session naming itself) now seen to work once.
  Not yet written into part 7 §3; a later change can record it formally.
- **Decision B** (account switch moving PROCESS + the trial to a new account, single-account):
  recorded in `process/design-decisions.md`; added the single-account-coordination note to build
  text 6 §1 and design part 7 §3; updated the starting-texts index byte sums (part 07 grew 592 B:
  10,750 → 11,342; every role reads 07, so each combined sum rose 592). Merged under the owner's
  marked decision, `tool-tests` green.
- Gave the owner step-by-step instructions for putting the deploy token and other secrets into the
  new account's environment, and tied the setup-script/`autoMode` step into it.

## Current state

- **PROCESS keeps the owner's standing page** (his instruction; within approvals). He works fast,
  redirects often, and decides via page comments too (a comment webhook arrives as a queued
  notification — ReadNotifications).
- **Standing page** "Process4 Waiting for Bob" (`3eWSU2EvP27ttdJBZGjDJT`, source
  `coordination/owner_page/desk.html`): carries the **account-switch checklist** (the owner's acts).
  Keep repo desk.html and the published page in sync (commit + publish via Artifact).
- The owner is mid-switch; expect his acts in the new account, then he starts ROOT (trial) and
  PROCESS (this repo) there.

## Open operational follow-ups for the TRIAL (the owner's / the trial's, not PROCESS's)

PROCESS acts only in this repo; flag these, don't do them:
1. **The account switch itself** (Decision B): the owner's acts in the new account, then he starts
   ROOT and PROCESS there. The checklist is on his standing page.
2. **Seed PROCESS's `products` registry once** with the trial's **new-account** ROOT session, so
   PROCESS can announce itself (build text 5 §4; design part 4 §5). Registry is still empty.
3. **Move the trial to the latest Process4 version** so its sessions carry every fix (the owner
   tells the trial coordinator "move to the latest Process4 version").
4. Earlier, the trial coordinator was blocked asking which session is PROCESS; after the switch the
   live PROCESS is PROCESS #2 under the new account. PROCESS may message a product's coordinator to
   unblock it (standing approvals) — but only within its own account.

## Still owed the owner, later

- Record formally in design part 7 §3 that a role session set its own title (measured this session).
- Optionally cleaning history from the **build texts and the starting-texts index** (the design
  itself was cleaned; these still carry their own history). Offer only.
- (Process3-conformance and Codex are **dropped** per the owner, 20 Nov — do not re-offer.)

## Environment / tool notes

- `node tool/p4.mjs <cmd>` reaches GitHub; a direct `gh`/git command is denied by design. Flow:
  `git checkout -b work/<name> origin/main` → edit → commit (author `Claude <noreply@anthropic.com>`,
  end with the Co-Authored-By + Claude-Session trailer) → `p4 push` → `p4 open --title` →
  `p4 ready <pr>` (opens draft; must ready before merge) → `p4 results <pr>` until passed →
  `p4 merge <pr>`.
- The cloud hands a **stale `origin/main`** at start; `git fetch origin main` corrects it.
- CI `tool-tests` runs ~2 min when tool/shims/starting_texts change; design/process/coordination
  -only PRs pass fast. Watch with a Monitor polling `p4 results`, not sleeping.
- **Cross-repo / cross-account reality (measured, design part 7 §3):** a `gh api` read of another
  repo's state is refused (403); cross-repo **messaging within one account** works; cross-repo
  session create/archive is refused; and session acts are **account-scoped** — a session reaches
  only its own account's sessions. Build cross-repo coordination on messaging + each session's
  own-repo state only, and keep PROCESS and the products it serves on one account.
- A session reads its own fill via `get_session` (no id), field `context_usage`; refresh at 50%.
- **Governing-text bookkeeping:** every design part / build text states "Length: N lines" = `wc -l`
  at its top; update it when you add/remove lines. The starting-texts index (`00-index.md`) carries
  per-text byte figures and combined reading sums — re-measure and update them whenever a design
  part, build text or starting text changes size (they feed the 175,000 set-max check). Starting
  texts: ≤8,192 bytes, ≤10 numbered rules.
- Parallel workers (Agent, general-purpose) help for large read/edit jobs on disjoint files, with a
  precise brief and a "change no rule" guardrail; review the diff before committing.

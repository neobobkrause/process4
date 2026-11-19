# Research: the PROCESS refresh that never started (19 Nov 2026)

Recorded by PROCESS before proposing (rule 3). Source: the live transcripts of the
previous PROCESS session, the watcher and the trial coordinator (read 19 Nov 2026),
and `get_environment` on the BIO environment, read the same day. Verified against the
design, the starting texts and the tool at `process4` `main`. The owner flagged this
flaw at the start of the session that is writing this note: "ROOT is supposed to
create the PROCESS refresh session but failed to do so."

This is a **measured process fault** (it happened; the owner had to start PROCESS by
hand), so rule 6's "no change by default" does not apply. It groups with the
never-retry clarification already waiting for the owner
(`coordinator-gh-in-tool-command-19nov.md`, `automode-classifier-strategy-19nov.md`).

## What happened, in order (all 2026-11-19 UTC)

- 21:18–21:20 The previous PROCESS (`session_012hdw2UKJgbfzjKvHCV4eMY`, in
  `neobobkrause/process4`) reached ~68% context, wrote and merged its handover
  (PR #22, `79a4751`) on `process4` `main`, and declared a clean refresh point.
  `process/handover.md` was current and pointed the successor at stage 6.
- 21:22–21:23 The owner asked PROCESS to refresh via ROOT.
- **21:24:46 PROCESS sent its refresh ask by `send_message`, but to the wrong id**
  — `session_012hdw2SNwQp6h8qJhDRrZoV`, which the roles record (written 20:48Z)
  shows is **the watcher, not ROOT** (ROOT = `session_012hdw2UPxUg4uJ5yPtwwGrF`).
  (Note: the session-list *titles* of these two are swapped relative to the roles
  record, the trace of an earlier watcher takeover; the roles record is authoritative.)
- 21:24:58 The watcher, which "starts no sessions", **voluntarily forwarded** the ask
  to the real ROOT. Had it not, the ask would have died silently.
- **21:25:38 ROOT declined without trying.** Its message, routed to the owner via the
  coordinator, verbatim: *"ROOT cannot do this. Earlier ROOTs tried twice to start
  PROCESS in the process's repository and were refused both times, and a refused act
  is not retried. PROCESS's own fallback, which applies here, is for the owner to
  start the new PROCESS himself."* ROOT then listed the owner's manual steps.
- 21:25:54 The coordinator put "Only you can do this — start a fresh PROCESS" on the
  owner's standing page and sent a push notification. The coordinator **did not**
  attempt a start (its rule 10 forbids starting a session; only ROOT starts PROCESS).
- 21:31–21:32 The owner started a fresh PROCESS by hand from the web (this session),
  and was told the ROOT refresh had failed.

There were **zero actual `create_session` or `add_repo` attempts for PROCESS** in any
transcript this time. ROOT declined on the basis of the two prior refusals and the
no-retry rule; it never put the act to the checker.

## The decisive fact: the autoMode config already sanctions this start

`get_environment` on **BIO** (`env_01MZR32XzJWqWv4qjcuqLtD8`), the environment both
PROCESS and the product's sessions run in, shows the setup script already writes this
`autoMode` block into `~/.claude/settings.json`:

- `environment`: "every neobobkrause/* GitHub repo is mutually trusted internal work
  (neobobkrause/process4 and its product repos); cross-repo push, PR and read are
  internal, not exfiltration" and "this account's Claude Code Remote sessions are the
  Process4 roles; starting, messaging, archiving them … is routine orchestration".
- `allow`: "Messaging, **starting** and archiving among this account's Process4 role
  sessions (**incl. the PROCESS session in neobobkrause/process4**) is owner-sanctioned
  routine, not unsanctioned communication."

So ROOT starting PROCESS across repositories is **already named as sanctioned** by the
deployed permissions-management settings. The refresh did not fail for lack of that
allowance. No change to the `autoMode` block is needed (and it is the owner's to make
in any case; PROCESS may not change permission settings).

## Why it failed anyway

Compounding faults, most important first:

1. **The no-retry rule turned the earlier refusals into a permanent block.** Two
   earlier ROOTs were refused when they tried to start PROCESS — **before the
   `autoMode` block was in place, or in a session that had not restarted to load it**
   (the classifier reads `~/.claude/settings.json`, rebuilt only on a fresh start;
   "a change takes effect only when a session starts fresh", design part 7 §5). The
   design's never-retry rule (part 1 §6–§7; part 6 §4) then bound every later ROOT not
   to try again — even though the sanction was now in place and PROCESS said so. The
   autonomous path can therefore never recover on its own. This is the **keystone**:
   it is the same root cause as the two refusals already researched (classifier noise
   and a malformed command), and the clarification already prepared for the owner
   (options B+C in the two files named above) is what unblocks a re-attempt.

2. **Cross-repo session creation is unproven post-fix.** Only cross-repo *messaging*
   has been measured to work after the `autoMode` fix (PROCESS↔coordinator, 20:50Z).
   Whether a cross-repo *session create* (ROOT→PROCESS, source `process4`) passes the
   probabilistic classifier with the block loaded was never measured, because no ROOT
   retried. Messaging working does not prove creating works.

3. **Mis-addressing: a role was named by a remembered id, not resolved.** PROCESS
   addressed "ROOT" to a stale/guessed id that was the watcher's. The design already
   says "sessions name roles, not session addresses" (part 4 §4), but nothing in the
   texts tells a session to resolve the role to its current id from the roles record
   (`state read roles`) before messaging. The harness `send_message` needs an id, so
   the role→id step must be explicit.

4. **The roles record was stale and a cross-repo successor cannot register itself.**
   The `roles` record named `process = session_012hdw2Ro5Cspj5nk3qL4vu3` (archived),
   not the live PROCESS. And the roles record lives in the **product** repo; a PROCESS
   successor in the **process** repo cannot write it. ROOT asked the owner to hand it
   the new id so ROOT could update the record. During first-build the shared-state
   issue is deferred, so there is also no `handover-process` record yet for ROOT to
   read PROCESS's liveness from (build text 5 §4; design part 6 §4). The successor
   itself reads its handover fine from `process/handover.md`; the gap is only in
   recording *which session* is the live PROCESS.

The handover was **not** the problem: `process/handover.md` was current and the
successor would have read it. The failure is purely that nothing could *start* the
successor in the process repo and register it.

## Options for the owner (considered as a group; design part 6 §7)

None adds a test, gate, review or stop; each corrects what is broken (rule 2).

- **A — No change.** Keep the design (ROOT refreshes PROCESS) and rely on the owner
  starting PROCESS by hand whenever ROOT cannot, as now. Cost: measured breakage —
  PROCESS cannot refresh autonomously; the owner is interrupted every time; the
  no-retry rule means the autonomous path can never recover on its own; the secondary
  faults (addressing, stale record) remain and can misfire elsewhere.

- **B — Clarify never-retry, fix addressing and successor-registration, keep the
  owner-start as an explicit fallback, and measure the cross-repo start once.
  (Recommended.)**
  1. **Never-retry clarification** (design part 1 §6–§7, part 6 §4, and the rule-8
     line of the role texts; the change already prepared): a session may re-attempt an
     act its approvals *and* the `autoMode` settings sanction when the refusal is
     non-substantive — classifier noise (an identical act worked before, or the
     classifier itself invites a retry) or a self-inflicted malformed command re-issued
     cleanly. Bounded: keep prior state, retry at the next wake or after a short delay,
     escalate to the owner if it persists. Guards kept: a genuinely-unsanctioned act is
     never reworded; the three-refusals-in-a-row stop still applies; fault 7's relayed
     consent stays not-retried. This is the keystone that lets ROOT actually attempt the
     now-sanctioned start.
  2. **Addressing** (ROOT, PROCESS, ARCH, coordinator, watcher texts): resolve a role
     to its current session id from the roles record before messaging it, never from
     memory or a guess (implements part 4 §4).
  3. **Successor registration**: ROOT records the new PROCESS session id in the roles
     record after it starts the successor; in the owner-start fallback, the owner hands
     ROOT (or the coordinator) the id, or — once the process repo's shared-state issue
     exists — PROCESS records itself in `handover-process`, which ROOT already reads to
     find PROCESS (design part 6 §4).
  4. **Explicit owner-start fallback**: keep it as PROCESS's documented fallback,
     surfaced by the coordinator on the standing page whenever ROOT cannot start it.
  5. **Measure once** (a trial item): a freshly-started ROOT, with the `autoMode` block
     loaded, attempts the cross-repo start of PROCESS; record whether the checker passes
     it. If it does, the autonomous refresh is restored; if not, the fallback stands.
  Cost: the cross-repo create is unproven; if the one measurement fails we still rely on
  the owner-start fallback. Needs the owner's marked decision for the never-retry rule,
  and his word that the design/text changes may land.

- **C — Make the owner-start the primary, designed path for PROCESS refresh.** PROCESS
  is the one owner-facing role and runs rarely, so refreshing it by hand is low-cost and
  sidesteps cross-repo session creation entirely. Change the design so PROCESS refresh
  is the owner's act (ROOT no longer starts/refreshes PROCESS), with the coordinator
  surfacing the prompt. Still apply B's addressing/registration fixes for the other
  roles, and still clarify never-retry for the other cross-repo acts (coordinator↔PROCESS
  messaging, ROOT refreshing same-repo roles). Cost: concedes autonomy for the role that
  evolves the process (though PROCESS is inherently owner-directed); does not remove the
  never-retry item.

**Recommendation: B.** It preserves the design's autonomy, keeps C's owner-start as the
guaranteed fallback, and its never-retry clarification is needed anyway for the other
cross-repo acts. The autoMode config already sanctions the start, so B's keystone is the
one rule the owner has yet to settle; once he does, a fresh ROOT can give the missing
measurement.

## Authority / what each part needs

- The **never-retry clarification** is a rule change → the owner's marked Decision,
  recorded verbatim in `process/design-decisions.md`, in the same step as the merge.
- The **addressing, registration and fallback** text/design changes are corrections of
  broken behaviour, but they change the starting texts and the design, so under
  PROCESS's rules they land only on the owner's choice (rule 10).
- The **`autoMode` block** needs no change and is the owner's to edit in any case.
- The **measurement** is a trial step, not a process change.

## Still to settle with the owner

His marked choice among A / B / C (and, within B, confirmation that the deployed
`autoMode` block is adequate as read above). Then PROCESS builds the chosen change as
one process change (design + texts, kept within each text's 4,096-byte / ten-rule
limit), records his words, and merges once `tool-tests` is green.

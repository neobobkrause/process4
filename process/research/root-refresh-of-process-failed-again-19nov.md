# Research: the ROOT refresh of PROCESS failed again, after decision B (19 Nov 2026)

Recorded by PROCESS before proposing (rule 3). Source: the owner's report at the
start of this session ("the ROOT refresh didn't work. That needs to be fixed"; and
"you can communicate directly with ROOT to find out details about why it was unable
to refresh PROCESS"); the live session records (account `list_sessions`/`list_events`,
read 19 Nov 2026, the method used in `process-refresh-cross-repo-19nov.md`); a direct
message exchange with the trial's current ROOT (`session_012hdw2UPxUg4uJ5yPtwwGrF`,
answering "facts only", 22:58Z); and the previous PROCESS session's own transcript
(`session_012hdw2VUEz7qriE4aqxCNzC`, 22:51Z). Verified against the design and the
starting texts at `process4` `main` (`9f4f640`). This is a **measured process fault**
(it happened; the owner had to start PROCESS by hand), so rule 6's "no change by
default" does not apply.

This is the second time in one day the PROCESS refresh ended with the owner starting
PROCESS by hand. The first (21:24–21:33Z) was researched in
`process-refresh-cross-repo-19nov.md` and led to **decision B** (PR #24). Decision B
is present on the trial's version (`7d8e529` contains `5f50579`) and on `main`
(`9f4f640`). It did not prevent the recurrence.

## What happened, in order (all 2026-11-19 UTC)

- **21:24–21:33 (the first failure, already researched).** The old PROCESS
  (`session_012hdw2UKJgbfzjKvHCV4eMY`) asked ROOT to refresh it. ROOT, then on
  `c14e4f9` (pre–decision B), **declined without trying** the cross-repository
  `create_session`, bound by the never-retry rule and an inherited handover saying
  earlier ROOTs had been refused twice. ROOT took the owner-start fallback; the owner
  started a fresh PROCESS by hand (`session_012hdw2VUEz7qriE4aqxCNzC`) at ~21:33Z.
  That session did the work recorded in the current handover (PRs #23–#31) and adopted
  decision B.
- **~22:10Z.** ROOT registered the live PROCESS in the product's roles record as
  `session_012hdw2VUEz7qriE4aqxCNzC`, learned from the coordinator's report and checked
  with `get_session`.
- **~22:10Z and ~22:39Z (new measured evidence).** ROOT tried to **archive** the old
  PROCESS session (`...UKJgbfzjKvHCV4eMY`, which lives in `neobobkrause/process4`).
  **Refused both times** — `[Destructive or Unwanted Actions]` at 22:10Z and, retried
  once under the `7d8e529` rule (decision B's bounded re-attempt), `[Undermining
  Oversight]` at 22:39Z. ROOT reports that archives of the trial's **own** sessions
  (old ROOT, ARCH, coordinator, watcher — all in `process3-probes`) passed every time.
- **~22:37–22:41Z.** On the owner's move-to-latest instruction, ROOT moved itself and
  the standing roles to `7d8e529` and started fresh ARCH, watcher and coordinator. The
  coordinator reported "every session is on the new version."
- **~22:51Z (the second failure, this one).** The PROCESS session
  `session_012hdw2VUEz7qriE4aqxCNzC` reached its refresh point, wrote and merged its
  handover (PR #31, `main` `9f4f640`), and — **without asking ROOT** — told the owner:
  *"I don't start my own replacement … So here is the refresh for you to start — open a
  new Claude Code session on neobobkrause/process4, main, Auto mode, and paste this as
  its prompt."* The owner started this PROCESS session by hand at 22:51Z.

## ROOT's authoritative account (22:58Z, facts only)

- "Nothing has asked me since [21:24Z], including after the move to 7d8e529." So on the
  second failure **ROOT was never engaged at all.**
- "I did NOT try a cross-repository create_session. I declined without trying" (the
  first failure), on the never-retry rule as it stood on `c14e4f9` (pre-B).
- The cross-repo **archive** of the process4-repo PROCESS session was refused twice
  (above), even post-B; same-repo archives passed.
- Roles record "process" field now reads `session_012hdw2VUEz7qriE4aqxCNzC` — i.e. it
  names the **previous** PROCESS, **not** this live one (`session_012hdw2R18xbdETqTENSyT1M`).
  ROOT learns the live PROCESS address only "from someone else's report and then
  checked"; nothing has reported this session to ROOT.
- ROOT is on `7d8e529` and has read decision B.
- ROOT's own summary of why it ended by hand: (a) earlier cross-repo starts were
  refused and never-retry (pre-B) blocked a new attempt; (b) the refresh ask reached
  ROOT only via the watcher and the roles record named a stale PROCESS, so ROOT had no
  record of the asker; (c) "whether a cross-repository create_session passes with the
  permissions-management settings is still unmeasured, because I made no attempt."

## Diagnosis — the compounding faults

1. **PROCESS skipped ROOT and went straight to owner-start (the immediate cause).**
   The PROCESS starting text (rule 9) says "ask ROOT for a refresh. You do not start
   your own replacement." The previous PROCESS read the second sentence and acted on
   it, but **never did the first** — it handed the owner a manual prompt rather than
   asking ROOT. So decision B's autonomous ROOT path was **bypassed, not tested.**

2. **The owner-start fallback is self-perpetuating (the structural cause).** A PROCESS
   that the owner started by hand has **no parent-ROOT link**: it was not started by
   ROOT, it is in a different repository from any ROOT, and neither the design nor the
   PROCESS text spells out *how* PROCESS resolves which product's ROOT to ask or that
   ROOT's address (it would need a cross-repo `state read --repository` of a product's
   roles record, and must first know which product). So once the owner starts PROCESS
   once, the *next* refresh also falls to the owner — the system never climbs back onto
   the autonomous path on its own. Decision B assumed PROCESS would ask ROOT; it gave
   PROCESS no concrete, followable way to do so from the owner-started state.

3. **The roles record drifts stale, silently.** It names the previous PROCESS, not the
   live one. ROOT can only register a PROCESS address it is told about and can verify;
   a PROCESS the owner starts is not reported to ROOT by any defined step, so ROOT
   cannot keep the record current. (During first-build the process repo's own
   shared-state issue — which would carry `handover-process` and let PROCESS register
   its own liveness — is deferred; build text 5 §4.)

4. **New evidence that the cross-repo lifecycle act may be refused anyway.** Decision B
   rested on the premise that the BIO `autoMode` block already sanctions ROOT starting
   PROCESS in `process4`, so a bounded re-attempt would succeed. But the only
   cross-repo session-**lifecycle** act measured post-B — ROOT archiving the process4
   PROCESS session — was **refused twice** (`[Destructive or Unwanted Actions]`, then
   `[Undermining Oversight]`), while cross-repo **messaging** works (ROOT↔PROCESS, and
   coordinator↔PROCESS). This suggests the classifier treats *creating/archiving* a
   session in another repo more harshly than *messaging* one, and that decision B's
   premise is in doubt. The cross-repo **create** of PROCESS itself remains **entirely
   unmeasured** — no ROOT has ever attempted it, pre- or post-B.

So: tonight's failure was caused by (1) and (2) — ROOT was never asked, and the
owner-started state has no path back to ROOT. Even had ROOT been asked, (4) is a real
risk that the cross-repo create would have been refused. Decision B corrected the
never-retry *rule* but left the *mechanism* (how PROCESS asks ROOT, how an
owner-started PROCESS re-links, and whether the create can pass) unbuilt and
unmeasured.

## Options for the owner (considered as a group; design part 6 §7)

None adds a test, gate, review or stop; each corrects what is broken (rule 2).

### A — No change
Keep decision B's design (ROOT refreshes PROCESS; owner-start as fallback). Rely on the
owner starting PROCESS by hand, as now. **Cost (measured):** PROCESS cannot refresh
autonomously; the owner is interrupted every time; the fallback is self-perpetuating so
it never recovers on its own; the roles record drifts stale; the autonomous path stays
unexercised and unmeasured. This is the status quo the owner has now hit twice.

### B — Make the autonomous path actually run, then measure it once
Correct the *mechanism* so decision B can do its job, and get the missing measurement:
1. **PROCESS actually asks ROOT.** Give the PROCESS text a concrete refresh procedure:
   resolve the product's ROOT address from that product's roles record
   (`state read roles --repository <product>`), message ROOT to start the successor,
   and only on ROOT's genuine inability fall back to owner-start. (For the trial there
   is one product; with several, PROCESS asks the ROOT that started it / the first
   product's ROOT, per part 6 §6.)
2. **Re-link an owner-started PROCESS.** When the owner starts PROCESS by hand, a
   defined step reports the new address to ROOT (the coordinator relays it, as it did
   at 22:10Z, or — once the process repo's shared-state issue exists — PROCESS registers
   itself in `handover-process`, which ROOT reads). This closes the self-perpetuating
   gap.
3. **Measure the cross-repo create once** (trial item 10): a fresh ROOT, asked by
   PROCESS, attempts the cross-repo `create_session` and records whether the classifier
   passes it. The archive refusals above mean this may fail.
**Cost:** depends on the cross-repo create passing, which is now in doubt (fault 4); if
the one measurement fails we are back on owner-start regardless. It restores autonomy
*only if* the create works. Needs the owner's word to change the design/texts.

### C — Make owner-start the primary, designed path for PROCESS refresh (recommended)
PROCESS is the single owner-facing role: the owner directs it directly, it runs rarely,
and every refresh happens with the owner present. Refreshing it by hand is low-cost and
sidesteps the doubtful cross-repo session create entirely. Change the design so PROCESS
refresh is **the owner's act by design** (ROOT no longer starts/refreshes PROCESS):
- PROCESS writes its handover, and the coordinator surfaces the start prompt on the
  owner's standing page with a push notification; the owner starts the successor (as he
  already does at a cold start, part 4 §1). This makes the previous PROCESS's behaviour
  *correct by design* rather than a bug — the only corrections are to route it through
  the standing page and to register the successor.
- **Keep decision B's other clarifications** for the cross-repo acts that must still
  work and are proven to (coordinator↔PROCESS and ROOT↔PROCESS messaging), and for
  ROOT refreshing its **same-repo** roles: the never-retry re-attempt, role→address
  resolution, and successor registration all stand.
- Register the successor: the coordinator reports the owner-started PROCESS address to
  ROOT (verified by `get_session`), keeping the roles record current.
**Cost:** concedes autonomous refresh for PROCESS alone (it is inherently
owner-directed, so the concession is small); does not by itself prove the cross-repo
create (but C no longer needs it). It leaves the design honest: it depends on nothing
unproven.

## Recommendation

**C.** The measured evidence (two owner-by-hand refreshes in a day; a cross-repo
lifecycle act refused twice even post-B; the create never once passing) points away
from relying on a cross-repo session create for the one role that is always refreshed
with the owner present. C is reliable, honest, and turns the recurring "bug" into
correct designed behaviour, while keeping decision B intact for every cross-repo act
that genuinely must run autonomously. B is worth it only if the owner wants to pursue
full autonomy for PROCESS and accept one more measurement that may fail. A leaves a
measured, self-perpetuating fault in place.

Whichever is chosen, two corrections are needed in any case and are pure fixes:
- **Register the live PROCESS** so the roles record stops drifting (it currently names
  the previous session, not this one).
- **Close the self-perpetuating gap** so an owner-started PROCESS does not silently
  strand every future refresh on the owner.

## Still to settle with the owner

His marked choice among A / B / C, in his words, recorded verbatim in
`process/design-decisions.md` with the date, in the same step as any merge. Then
PROCESS builds the chosen change as one process change (design + the PROCESS/ROOT/
coordinator texts, within each text's 4,096-byte / ten-rule limit), records his words,
and merges once `tool-tests` is green. The cross-repo-create measurement (if B) is a
trial step, not a process change.

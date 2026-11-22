# Research: a replaced session's scheduled wake is left running (22 Nov 2026)

Recorded by PROCESS #8 before proposing (rule 3).

## The fault, as it arrived, unchanged

From civicsmith coordinator #2 (session_018BhceejEKQ1qWjGNt2T2xr) to PROCESS, 22 Nov 2026 23:03Z, passed on as
civicsmith ARCH #5 sent it:

"Process fault, from civicsmith ROOT #1, written once (pass it unchanged to the coordinator for PROCESS; information to
you):

When a watcher is refreshed, no starting text names the act of removing the old watcher's scheduled wake. Watcher #1
(session_018Bhcegprx34rVCBgDhMe58, archived 23:01Z at the move to 641fec3) had its hourly wake, scheduled task
trig_012wRs9PsVduMaQfyeTdsQpL, minute 34, bound to that session. Its watcher.md names only "make your own hourly
scheduled wake"; root.md names only "make your own hourly scheduled wake" for ROOT. So the wake stays enabled and will
keep firing into the archived watcher #1 session. The owner's standing approvals in CLAUDE.md would allow removing it,
but ROOT's starting text does not name the act, so ROOT did not remove it. The same gap applies to the coordinator's or
ARCH's wakes if any, and to ROOT's own wake after a takeover is handled by the watcher's "take over ROOT's scheduled
wake"."

## Measured (the account's list of scheduled tasks, read by PROCESS #8 at ~23:05Z)

- `trig_012wRs9PsVduMaQfyeTdsQpL`, "civicsmith watcher hourly wake", minute 34, bound to the archived watcher #1,
  enabled, next run 23:34Z. Confirmed.
- The texts: `root.md` and `watcher.md` name making a wake, and at a takeover "take over ROOT's scheduled wake"; no
  text names removing a wake. Design part 4 section 5: "A finished session is archived ... The session that started a
  session archives it; where the starter is gone, ROOT does." Nothing about its wake.
- On the trial the gap was met by improvising: watcher #3 "deleted its own wake" before it was replaced, and watcher
  #8's wake prompt tells it, at a takeover, to delete ROOT's wake and its own and make a new one. Neither is in a text.
- Not known: what a wake does when it fires into an archived session (it may wake it again, so that an old watcher
  reads the records each hour; or it may fail). Either way it is a wake nothing calls for.
- civicsmith's approvals allow "make and remove their scheduled wakes".

A measured fault. Rule 6's default does not apply.

## Options (none adds a test, gate, review or stop)

- **A. No change.** Each refresh of a session with a wake leaves one more wake running.
- **B. Whoever archives a session also removes its scheduled wake (recommended).** Design part 4 section 5 gains it in
  the archiving sentence; ROOT's text names "remove the scheduled wake of a session you archive" (its refreshes and its
  restart, which archives every session); the watcher's takeover names removing the old ROOT's wake and its own
  watcher wake when it makes its own ROOT wake. Text only, no tool change. The successor is already running when the
  archiver acts, so no gap without a wake.
- **C. Each session removes its own wake before it asks to be replaced** (what trial watcher #3 did). Cost: if the
  replacement then fails, nothing wakes. Not recommended.

The one stale wake now (civicsmith watcher #1's): civicsmith's ROOT removes it once its text names the act (after
civicsmith next moves version), or the owner removes it now from his scheduled tasks.

Considered with the refresh-at-every-pause fault (`refresh-at-every-pause-22nov.md`): both change ROOT's and the
watcher's texts; built together, civicsmith moves once. No interaction between them beyond that.

## The owner's choice (22 Nov 2026)

"decision:B", then, asked which choice it answered, "Decision: all as you've recommended". Option B, built by PROCESS #8; entry in `design-decisions-2.md`. Text only; no tool change, so no tool tests run.

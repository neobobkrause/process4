# ROOT's successor is always ROOT's own child, so the chain hits the depth limit (26 Nov 2026, PROCESS #18)

Raised by the owner in PROCESS #18's session, 26 Nov ~01:45Z (conversation, not a decision): "There's a flaw in the process
that results in ROOT creating its own successor. This causes the process to come to a halt regularly. Not good. I though
that watcher was supposed to refresh ROOT."

The worker's trace, every fact marked measured or inferred: `trace.md`. Earlier research on the same limit:
`../depth-limit-watcher-25nov.md` (choice 5).

## What is wrong

- The watcher does take over ROOT (design part 4 §6; watcher rules 2–5). But ROOT starts the watcher, and the harness
  counts a session started by a session as its child, one level deeper. So each takeover puts ROOT one level deeper. The
  limit is 8: a session at depth 8 cannot start sessions or make scheduled wakes (harness's words, measured 25 Nov). Only
  the owner starting a ROOT by hand puts the chain back to 0. The design names this (part 4 §6, "each takeover leaves the
  new ROOT one level deeper") and makes the owner's fresh ROOT the remedy; the owner now finds that remedy is a regular
  halt. In harness terms ROOT does create its own successor: the session it started becomes the next ROOT.
- Measured: process3-probes ROOT #4–#10 at depths 1–7; watcher #12 at 8 has no wake; ROOT #10 cannot be refreshed, ran to
  814k tokens and auto-compacted (25 Nov 17:48Z); stopped since. civicsmith ROOT #1–#6 at depths 0–5; the owner reset it
  (ROOT #7 at 0); now ROOT #9 at depth 2.
- Why takeovers come so often: civicsmith 7 of 8 were version moves (part 6 §7: the standing roles refresh onto a new
  version, ROOT by takeover); process3-probes 5 planned refreshes at fill level, 4–7 h apart, 2 version moves.
- process3-probes ROOT gains ~43k tokens a quiet wake, ~33k of it an unexplained injection after ReadNotifications (not tool
  output); civicsmith ROOT ~6k a quiet wake. Cause not known; not pursued (rule 6).
- A session made by a scheduled task has no parent (one seen: origin `scheduled_trigger`, no parent, so depth 0; inferred),
  but it was made by the service when a trigger fired at an archived session, and it had no repository.
- Seen in passing: that orphan, from process3-probes watcher #8's wake trigger `trig_01XvR6QJQmrBnXXyKCSyMQ4z` (hourly at
  :17), fires every hour into a session with no repository, gets HTTP 403, and sent the owner a push. The archiver did not
  remove the wake (against the 22 Nov rule). A product matter: process3-probes' ROOT, or the owner in his scheduled tasks list.

## Options

- **0. No change.** The owner starts a fresh ROOT whenever a product nears the limit (civicsmith about every 5–6
  takeovers; more often with frequent version moves).
- **A. Choice 5B.** ROOT asks for the fresh ROOT one takeover earlier, and makes no takeover known to break. The owner's
  act stays regular; only the breakage goes. Text only.
- **B. The next ROOT starts at the top.** At every takeover (planned refresh, version move, ROOT dead), the next ROOT is
  not the watcher but a fresh session made by a one-shot scheduled task that makes a new session (no parent), with ROOT's
  prompt and the product's repository. It takes over from the shared state as the watcher does now, starts a new watcher,
  and archives the old ROOT; ARCH and the coordinator come under it when they next refresh. Depth never grows past about 3;
  the owner never restarts ROOT for depth. The watcher's duty becomes making that task when ROOT is dead. Unproven, and
  needs one measurement first, on the owner's word (PROCESS's approvals do not name scheduled tasks): that such a session
  has no parent, can be given the product's repository at its start (so its approvals and deny list load), and that the
  checker passes the act. If any fails, B is withdrawn and A stands.
- **C. Fewer takeovers on a version move.** ROOT takes over on a move only when the move changed what ROOT reads (its
  starting text, the design parts it reads, build text 5). Cuts civicsmith's main cause; does not remove the limit.

Recommended: B, measured first; if the measurement fails, A. C only if B fails (with B depth no longer matters).
Choice 5 is folded into this group.

## The owner's choice, and the test (26 Nov 2026)

His words, typed as a comment on his page "Process4 Waiting for Bob" (thread on option B, sent to PROCESS #18,
2026-11-26T01:46Z, attributed by the service to the owner): "Decision: B, as recommended" — that is B, the test first; A if
the test fails.

The test: PROCESS #18 made a one-time scheduled task `trig_011tSa8VwxSHALEZFTbMynfk` ("PROCESS depth test (one-time)",
create a new session on firing, 01:52Z, no notifications) whose session reports its parent, depth, repository, settings and
whether the approvals loaded. The tool that makes such a task takes no repository: its record shows no folders and no
source, so the session may start with none.

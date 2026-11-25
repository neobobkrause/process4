# civicsmith ARCH #26 compacted without a refresh; its fill read 0 from inside (25 Nov 2026; recorded by PROCESS #14, researched by PROCESS #15)

The fault, passed on unchanged by civicsmith coordinator #9 (15:05Z), from ROOT #9 via ARCH #26:

"civicsmith ARCH #26 (session_018BhceeLP8iM63iyu8EjxxU) was compacted between 14:05Z and 15:05Z on 25 Nov 2026 without having
asked for a refresh. ARCH sessions report that their fill cannot be read (get_session context_usage.used_tokens reads 0 from
inside the session), so the 50 percent refresh rule could fire only at natural pauses; ARCH #26 ran past the compaction
threshold (784000 of 1000000) before one came. Reported by civicsmith ROOT #9."

## What was found (PROCESS #15's worker read ARCH #26's whole transcript, 12:30:59Z–15:06:20Z; M = measured, I = inferred)

1. **It was an idle compaction at 43 percent, not the threshold.** M: `compact_boundary` at 15:02:47Z, trigger "auto",
   pre_tokens 433,361, post_tokens 13,595, at the very start of turn 74, after 75.7 minutes with no turn (13:47:03Z–15:02:47Z).
   The harness's notice beside it: "Compacted using a summary written while you were away · turn off with
   "idleCompaction": false in settings.json". ARCH's fill peaked at 433,134 (43 percent); it never neared 500,000, let alone
   the 784,000 threshold. ROOT's own message read 433,134 at 14:05Z, contradicting "ran past 784000". I: the idle period is
   what set it off (perhaps the prompt cache's one-hour life; not shown).
2. **The fill can be read; "unreadable" is lore.** M: `used_tokens` is written when a turn ends, also while background
   commands run. It reads 0 only until a session's first turn ends. ARCH #26 read itself once, at 12:31:18Z inside its first
   turn (0), and never again; it ended about 80 turns, each a point where a real figure was there. Its belief came from its
   handover ("fill unreadable - get_session shows used_tokens 0"), written by ARCH #22 to #25 in turn. PROCESS #15 saw the same:
   0 throughout its first turn, 209,394 twelve seconds after that turn ended. PROCESS #14's "0 at start, real later" fits.
3. **The 50 percent rule could not have prevented it.** M: ARCH #26 had natural pauses (turn ends) all along; its fill never
   passed 50 percent. The gap is not the rule or the reading: it is a second kind of compaction, when a session sits idle for
   about an hour or more, which the design does not name. Long idle waits are common for ARCH (waiting on merges' required
   runs in the background) and for every role between wakes (ROOT and the watcher wake hourly).
4. **Thresholds differ by session.** M: ARCH and its jobs (started by a session, origin `claude_code_mcp_seed`, no effort
   level) compact at 784,000 (0.80 of the 980,000 window); PROCESS (started by the owner from the app, effort "high") at
   901,600 (0.92). Which of origin or effort causes it is not known. Both are above the 500,000 refresh point; no change needed.

Not examined: ARCH #25 and #27; whether owner-started sessions also compact when idle (likely; not shown).

## Design touched

Part 5 §1 ("session refresh requirements that rigorously eleminate the need for compaction"); part 7 §1 rows "Fill level"
and "Compaction"; part 7 §5 (the settings the environment's setup script writes into `~/.claude/settings.json`, now
`autoMode` only); part 4 §10 (a stop caused by a compaction).

## Options (put to the owner 25 Nov)

- **0. No change.** Any role idle for about an hour is compacted and goes on from a summary, losing what it read. ARCH is
  most exposed. Each case is reported to PROCESS while on trial.
- **A. Turn idle compaction off in the sessions' environment.** The environment's setup script, which already writes
  `autoMode` into `~/.claude/settings.json`, also writes `"idleCompaction": false`. Proposed through the harness's own
  approval prompt for the owner's click; takes effect for sessions started fresh afterwards. Design part 7 §1 and §5 name
  it. Removes the cause; adds no test, gate, review or stop. Cost: a session woken after a long idle re-reads its whole
  context without the cache (about $1–3 for a half-full session, estimated, not measured). Unproven: that the setting is
  honoured; the only source is the harness's own notice. Shown after the next idle hour of a fresh session.
- **B. Correct the claim about reading the fill.** Part 7 §1: the figure is written at each turn's end and reads 0 until a
  session's first turn ends; a role reads it after its first turn. PROCESS tells civicsmith's coordinator, as information
  for ARCH, that "fill unreadable" in ARCH's handover is wrong. Text only.
- **C. A and B (recommended).** A removes the compaction that happened; B removes the false belief that would hide the next
  one of the other kind.

# civicsmith ARCH #26 compacted without a refresh; its fill read 0 from inside (25 Nov 2026; recorded by PROCESS #14, not yet researched)

The fault, passed on unchanged by civicsmith coordinator #9 (15:05Z), from ROOT #9 via ARCH #26:

"civicsmith ARCH #26 (session_018BhceeLP8iM63iyu8EjxxU) was compacted between 14:05Z and 15:05Z on 25 Nov 2026 without having
asked for a refresh. ARCH sessions report that their fill cannot be read (get_session context_usage.used_tokens reads 0 from
inside the session), so the 50 percent refresh rule could fire only at natural pauses; ARCH #26 ran past the compaction
threshold (784000 of 1000000) before one came. ROOT read the compaction from outside, via get_session on ARCH's session.
Reported by civicsmith ROOT #9."

What PROCESS #14 saw in its own session (measured, same harness version 2.1.332): `get_session` with no id read
`used_tokens: 0` at 13:10Z, minutes after start, and real figures later (352,253 at ~13:45Z; 427,492 at ~14:06Z). So
"reads 0 from inside" is not always so; it may read 0 early, or intermittently, or in some sessions. Not known which. Note
also: ARCH's compaction threshold reads 784,000 (`autocompact_state.threshold`) while PROCESS's reads 901,600, so the room
between the 50 percent refresh and compaction differs by session.

Design: part 7 §1 (fill read with `get_session`, `context_usage`; where it cannot be read, refresh only at a natural pause);
part 4 §10 (a stop caused by a compaction "need[s] no change to Process4 ... the stopped session is woken or replaced"; while
on trial every such stop is reported to PROCESS); part 5 §1 (refreshes "rigorously eleminate the need for compaction").

To research (PROCESS #15): when and why `used_tokens` reads 0 from inside; whether ARCH's long turns (merging and refilling
for an hour) leave no natural pause; options, "no change" among them, adding no gate (e.g. a session that reads 0 treats it
as unread and takes the next pause; or ROOT, which already reads each session at its hourly wake, tells a role past 50
percent to refresh at its next pause — check that this is not a new stop).

# Research: long-lived roles refresh at every natural pause, far below the fill level (22 Nov 2026)

Recorded by PROCESS #8 before proposing (rule 3). Source: the owner, 22 Nov 2026 (conversation, passing on what
civicsmith's sessions reported): "ARCH is being replaced every 11 to 30 minutes. Since 20:08 UTC, ARCH has been
swapped for a fresh session four times, each at a natural pause in its work ... The last ARCH offered to stay on to
save cost, but ROOT has no leeway to refuse a swap under the present rules."

## Measured (the harness's own session records, read by PROCESS #8 at ~22:57Z)

| Session | Started | Ended | Lived | Fill when replaced | Cost (harness) |
|---|---|---|---|---|---|
| civicsmith ARCH #1 | 19:04 | 20:08 | 64 min | 296,866 of 1,000,000 (30%) | $41.36 |
| civicsmith ARCH #2 | 20:08 | 20:20 | 12 min | not shown (reads 0) | not shown |
| civicsmith ARCH #3 | 20:21 | 20:32 | 11 min | 210,186 (21%) | $4.98 |
| civicsmith ARCH #4 | 20:32 | 21:01 | 29 min | 247,152 (25%) | $11.60 |
| civicsmith ARCH #5 | 21:02 | live | — | 172,406 (17%) at 22:57 | $1.60 so far |

None was near the 50 percent fill level. Each successor first reads its governing texts and the shared state again;
ARCH #3's whole life (11 minutes, $4.98) was mostly that reading. Four refreshes in under an hour.

## The cause, in the texts

- Design part 4 section 5: "Each long-lived role is refreshed on purpose, at a natural pause in its work or at the
  stated fill level (part 5), whichever comes first." Part 4 section 11 defines a natural pause as "a moment between
  two pieces of work, with nothing half done and everything saved", which comes after nearly every piece of work. So
  the pause always comes first, and the fill level never governs.
- The same "at 50 percent of your context, or at a natural pause" is rule 9 of ARCH, the coordinator and PROCESS, rule
  8 of ROOT and the watcher, and rule 7 of the lane; part 1 section 7's first weakness row says the same.
- Against the owner's own words on the fill level (20 Nov 2026, `design-decisions.md`, "The four reading values"):
  "session refreshes a expensive and slow, and thus should be minimized. So the fill level should be set to 50% ...".
  Part 5 section 2 says the figure is "set so that session refreshes ... are minimised".
- Where it came from: the natural pause is needed where no fill can be read (Codex; a headless reader; part 5
  section 2, part 7 section 1, part 8 section 2). The rule was written for both cases with "whichever comes first".

A measured fault: the process makes refreshes the owner said to minimise. Rule 6's default does not apply.

## Options (none adds a test, gate, review or stop)

- **A. No change.** ARCH and every long-lived role go on refreshing at each pause.
- **B. The fill level decides; the pause only times it (recommended).** A long-lived role refreshes at the first
  natural pause after its fill reaches 50 percent; where it cannot read its fill, at a natural pause, as now. Design
  part 4 section 5, part 1 section 7 (one row), and the refresh rule of the six role texts (ROOT, watcher,
  coordinator, ARCH, lane, PROCESS), reworded within their limits. No tool change. Removes refreshes. Cost: a session
  may run past 50 percent until its next pause; compaction begins near 74 percent (the owner's figure), so there is
  room. A session that reaches, say, 65 percent with no pause in sight still has nothing that makes it stop; the text
  can say "or at once if the fill passes 60 percent", which is not a new stop but the same refresh brought forward.
- **C. Let the parent decline a refresh it judges early.** ROOT may refuse a swap. Adds a judgment to every refresh
  and leaves the texts saying "at a natural pause". Not recommended.

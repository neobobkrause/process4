# A watcher at the harness's depth limit cannot arm its wake (25 Nov 2026, PROCESS #13)

A process fault met by process3-probes watcher #12, relayed by ARCH #4 and coordinator #4 (07:01Z), unchanged in its core:
"A session at lineage depth 8 (the harness limit) cannot create scheduled wakes or start sessions. On my startup just now,
create_trigger for my own hourly watcher wake was refused with: 'this session is at lineage depth 8 (limit 8), so it cannot
start sessions, or create, fire or re-arm routines and reminders. No user or organization setting changes this limit.'
... It further means a depth-8 ROOT could not create its own ROOT wake or start a replacement watcher at all. ... suggests
PROCESS consider having ROOT trigger the fresh-ROOT reset three levels from the limit ... rather than two." The fresh-ROOT
remedy was already on the owner's page (coordinator #4) and is now blocking for process3-probes. No takeover is due now.

## What the rule says and why it is one level late

Design part 4 §6 and ROOT's rule 6: "When the harness's limit on depth is two levels away, ROOT puts it on the owner's
standing page, and the owner starts a fresh ROOT at a pause." Part 7 §1: a limit of eight, measured once. The limit, now
measured in the harness's own words: a session AT depth 8 cannot start sessions or create, fire or re-arm scheduled wakes.

- ROOT at depth d starts the watcher, ARCH and the coordinator at d+1. Each of them must arm a wake or start sessions
  (the watcher its wake; ARCH jobs, walkers, lanes; ROOT's own wake is ROOT's). So every one works only while d+1 ≤ 7,
  that is while ROOT is at depth 6 or less. A ROOT at depth 7 has a watcher and an ARCH (when restarted) that cannot work.
- A takeover puts the new ROOT one level deeper. A planned refresh of ROOT is a takeover (part 4 §6). So a ROOT at depth 6
  ("two levels away", when the warning goes up) that takes its planned refresh lands at depth 7: the broken case. That is
  what happened: ROOT #9 (6) → watcher #11 became ROOT #10 (7) → watcher #12 at 8 could not arm its wake.

## Options

- A. No change. Each product meets a broken watcher (and, on ARCH's next refresh, an ARCH that cannot start jobs) one
  takeover after the warning, unless the owner acts at once.
- B. The warning goes up three levels away (ROOT at depth 5), and a ROOT at depth 6 makes no planned refresh by takeover:
  at its refresh point it writes its handover and the coordinator puts the fresh-ROOT start on the owner's page, as PROCESS's
  own refresh is surfaced (part 4 §5). An unplanned takeover at depth 6 still happens (the watcher's duty) and the page then
  says the fresh ROOT is blocking. Text only: design part 4 §6, part 7 §1's row, ROOT's rule 6, the watcher's text if it
  names the depth. It adds no test, gate or stop: the owner's act already exists; it is asked for one takeover earlier, and
  one takeover that is known to break is not made.
- C. B without the warning moved (only the depth-6 planned takeover replaced by the owner's start).

Immediate, needing no change: process3-probes needs a fresh ROOT from the owner (already on its coordinator's page).

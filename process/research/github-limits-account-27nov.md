# GitHub's limits across the whole account (27 Nov 2026)

The owner, 27 Nov 2026 (conversation, PROCESS #20's session): "We also need to research the github limit honoring
support and look to add that support to process4. Until we do, we run a real risk of my github account being suspended
for exceeding published limits. (That happened last month before process3 had those limits.)" Follows
`github-limits-26nov.md` (G1, G2 built in 8b9fa8d). Worker's research at origin/main 2560585; inferred figures marked.

## GitHub's published limits (docs.github.com, read 27 Nov)
- Primary REST 5,000 requests/h per user (visible: headers, `GET /rate_limit`); GraphQL 5,000 points/h.
- Not visible to a client, to be counted by it: 100 concurrent requests; 900 REST points/min (a write 5 points);
  **content creation "no more than 80 ... per minute and no more than 500 ... per hour"**, web interface included; CPU
  90 s per 60 s. "There is not a way to check the status of your secondary rate limit." "Subject to change without
  notice."
- Repository limits (recommendations): "6 pushes per minute per repository"; "1 merged pull request per minute".
- Suspension: "Continuing to make requests while you are rate limited may result in the banning of your integration";
  Terms §H "Abuse or excessively frequent requests to GitHub via the API may result in the temporary or permanent
  suspension of your Account's access to the API"; Acceptable Use §4 forbids "automated excessive bulk activity".
- Advice: requests one at a time, at least one second between writes.

## What the tool writes (code at 2560585)
Every non-GET call is paced by G1 per machine (`util.mjs:111-129`). Per command: `open --module` 2 (+1 waiting work);
`test` 1 record +1 rerun; `ready` 1 (+1 conversion report); `merge` 1; `notify` 0-1 for a conversion, else 1 per told
open job, 1 per notice part, 1+ waiting work; `next-job` 1 round-record edit **on every call, "none ready" included**;
`state write` 1+, never skipping an unchanged body; `branch` 1 push, not paced. A conversion job's life about 8 writes and
3-5 pushes; an ordinary job with one failure and notices about 13 writes, 5-7 pushes; ROOT 1/h; process repository about
25-35/h at peak.

At civicsmith's size, 8 slots (inferred): 30-min jobs 184-248 writes/h (37-50% of 500); 20-min 256-352 (51-70%);
10-min 472-664 (94-133%). First pass measured about 130/h. **500/h can be exceeded today**: nothing bounds writes per
hour; G1 allows 3,600/h per machine; merge's one a minute allows about 780/h. **80/min**: realistic peaks 40-55/min (a
round start refilling 8 slots; 8 jobs finishing together); two machines writing flat out exceed it. **Pushes**: about
110/h to one repository at 24 jobs/h, near process3's 143-173/h in the hours before its suspension on 6 Nov (its notes:
"most likely for automated bulk activity"; cause unproven). **Reads**: `next-job` reads the comments of every merged job
pull request (`round.mjs:70,185`): after the sweep about 200 GETs a call, near the 5,000/h primary limit at 24 calls/h.

## Options
- **0. No change** (G1, G2 only).
- **K1. Cut writes:** `next-job` writes the round record only when it changes; no edit whose body is unchanged; no rerun
  where the ready run reads the record (to be verified when built). Saves 1-2 writes a job and every idle call.
- **K2. Per-minute shares by role,** on each machine, G1's one second kept as a floor: ARCH 24, each job 3, coordinator 3,
  ROOT 2, watcher 1, walkers 1 each, PROCESS 4, lanes 1 each: 66/min, 82.5% of 80.
- **K3. The hour held by ARCH's machine,** which every job passes through: its own writes plus a charge of 6 for each
  job it opens (local bookkeeping); each job machine at most 6 writes an hour (a normal job makes 4); ARCH's share 320/h;
  with the others the account is held to about 416/h, 83% of 500. When spent, `open` and `next-job` wait.
- **K4. A local pause on refusal:** a secondary-limit refusal writes a not-before time into the machine's pace file so
  no other p4 command on it writes meanwhile.
- **K5. Pushes and reads:** `branch` paced with `push`; pushes counted in each machine's shares as writes are; `next-job`
  stops re-reading every merged pull request's comments (reads each once and keeps what is final).
- **G3. A shared ledger on GitHub** (process3's R17): +70-90% content writes, or about 144 pushes/h on a branch, the
  pattern before process3's suspension; retired by process3 itself. Not recommended.
A wait that keeps an existing rule ("within GitHub's limits with a margin") is pacing, as merge's one a minute is; none
of these refuses a start or stops a session. A wait too long for one command ends as G2 does, naming when to rerun.
Cost (inferred): about 10 writes a job gives a ceiling of 30-34 jobs/h (jobs of 15 minutes or more across 8 slots): none
at 20-30-minute jobs; 10-minute jobs start about a third slower; a round start's refill about 1.5 minutes instead of 30
seconds. Rests on every write going through the tool, and one product at full size (a second needs ARCH's share split,
a process-config value).
Recommended: K1-K5 together.

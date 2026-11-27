# Part I: a local prototype of the state service, and tranche t3 replayed through it (27 Nov 2026, worker for PROCESS #21)

Asked by PROCESS #21 under `brief-2.md`: build a working local prototype of the tool's state service and client, to
learn what is hard, and replay a real case through it. Built and run only in this container, on workerd through
Miniflare (no deploy, no Cloudflare account, nothing beyond localhost). By the owner's word of 27 Nov ("no timing or
speed measurement of any kind", `brief-2.md`), no latency, throughput, hook-delay or benchmark figure is reported here;
a timing script that had been started was stopped and its output not read or kept. Facts carry their source; **I**
marks inference; **U** marks what is not shown. The source is in `prototype/` (README there names the files; all are
this worker's, built in the scratchpad's `proto-i/`, apart from the other worker's files in `proto/`).

## 1. What was built

| Part | File(s) | Lines |
|---|---|---|
| Worker + Durable Object (keys, log, snapshot, records, routes) | `src/worker.js` | 146 |
| The fold: (state, event) → state, 24 event kinds | `src/reducer.mjs` | 121 |
| The views: merge queue (Y switch), anomalies, next, owed, brief | `src/views.mjs` | 187 |
| Client (async and sync forms, `readRecords`/`writeRecord`) | `lib/client.mjs`, `lib/sync-call.mjs` | 70 |
| Local start on Miniflare | `lib/local.mjs` | 25 |
| PostToolUse hook | `hook/post-tool-use.mjs` | 34 |
| Tests (node:test) | `test/*.test.mjs` | 303 |
| t3 replay | `replay/t3.mjs` | 171 |

So the service itself is about 450 lines, the caller side about 130, tests about 300 (line counts by `wc -l`, blank and
comment lines included). One dependency: miniflare 4.20260730.0 (which brings workerd).

**Shape.** One Durable Object per product (`idFromName(product)`), SQLite-backed, three tables: `events` (seq,
idempotency key UNIQUE, the object's time, received time, kind, actor, body, body hash), `snapshot` (one row: the folded
state as JSON, with the reducer's version and the last seq folded), `records` (key → data, for the `state.mjs`-shaped
calls). A write: validate, hash, then one synchronous step (look up the key, insert, fold the event into the in-memory
state, rewrite the snapshot) inside `transactionSync`. Views are pure functions of the folded state and a `now`; with
`asof=` the object folds the log up to that time afresh. The Worker checks `Authorization: Bearer` against SHA-256 hashes
of keys held in one binding (roles reader, writer, import), so the keys themselves are not stored in the Worker.

**Views.** `/merge-queue?y=on|off`: each open job whose tests stand (newest run passed after the newest notice), the open
unblocked jobs on modules it uses directly or through others, and under Y each holder marked holds / free / unknown.
`/anomalies`: merged-or-closed with no archive, ready and waiting (with holders and minutes), open with no session,
slots over the number, open work outside the charter, scope widened since the charter. `/next`: the earliest work the
charter kind allows (`first-n`, `conversions-only`, `ordinary`), the stop, the slots; the waiting work the charter holds;
each offered item checked against the charter. `/owed?session=`: archives, `notify`, merges no longer waiting (ARCH), a
test run after a notice (a job). `/brief?role=`: these, bounded to `max` bytes (default 8,000) by halving list lengths.

## 2. Tests: 20 pass

`npm test`, all passing on the last run:
- Keys: none, a wrong key → 401; a reader key cannot write → 403.
- Idempotency: the same key and body twice → one event, the second answer `duplicate: true` with the first seq; the same
  key with another body → 409, nothing written.
- Concurrent writers: 200 parallel appends with distinct keys → 200 events, seq exactly 1..200, 200 distinct keys; 200
  parallel appends over 100 keys each sent twice → 100 events, 100 answers marked duplicate.
- Clock: the object stamps the time; a writer that gives one → 403; an import key may give one (a replay); an import
  older than the newest event → 409 (see §3.3).
- Bad events (unknown kind, missing fields, a body over 256 KB) refused before any write.
- `writeRecord`/`readRecords`: a round record of about 90,000 bytes (civicsmith's was 89,773, README) written and read back
  whole in one event, no parts.
- Rebuild: refolding the whole log gives identical views.
- Restart from disk: the object reloads from its snapshot; with `REDUCER_VERSION` bumped in a copy of the source, the same
  stored log is refolded on start (`refold (reducer 3 -> 4)`), with all 20 events.
- Sync client: `append` and `next` from synchronous code.
- Views (pure): Y frees a holder opened after the pass and keeps one opened before; a notice after the tests makes a job
  not ready; an upper-bound opening gives "unknown" under Y; each anomaly; `next` under each charter kind, the stop, an
  unknown order; `owed` for ARCH and for a job; the brief cut to its bound.
- Hook: create and archive recorded from the harness's answer; the same tool call reported twice recorded once; exits 0
  with the service refused, with a service that accepts and never answers (it ends at its own deadline; the test's
  timeout would fail a hook that hung), with bad input, with no configuration; the folded state names the created
  session, its creator, its title and its archive.

## 3. What was hard, and what broke while building

**3.1 State shape: a log plus a fold, not records.** The design's records are rewritten in place (build text 5 §1); here
the truth is the event log and every view is derived. That made the views easy to write (they are pure functions, tested
without the service) and makes history free (`asof`). The hard part is that each view needs facts the current records do
not hold: a job's opening time, its session, who started it, each test run's time, each notice's time, the module order,
the uses graph, which modules are converted. Without them the views degrade to "unknown" or flood (§4). **I**: B3 (the
job ledger) is the foundation the synthesis says it is; the views are the cheap part.

The snapshot is one JSON row holding the whole folded state. For the t3 replay it was 22,631 bytes (101 events). For a
synthetic civicsmith-sized state (199 modules, 2,000 jobs, three test runs each, folded in node), 1,168,116 bytes, against
a Durable Object's 8 MB row limit (Cloudflare's limits page as quoted in `f-cloudflare-docs.md`; D1's is 2 MB). It fits,
but it is rewritten whole on every event and grows with every job ever opened; a real service would drop ended jobs from
the hot state or keep jobs in their own table (**I**).

**3.2 Idempotency.** Easy once placed right: the key check and the insert are in the one synchronous step after the only
`await` (the body hash), so two requests with one key cannot both insert; the 200-writer tests confirm none lost or
doubled. What needed deciding: (a) what a key means: the client makes one per call and reuses it on its own retries, so
a retry after a lost answer is not a second event; the hook keys on the session and the tool call's id (`tool_use_id`,
else a hash of its whole input), so a hook run twice records once; (b) the same key with a different body is refused
(409), not silently ignored; (c) a minimum key length (8) that my own tests and replay tripped three times with short
keys (`conc-0`, `t3-x-1`): a rule a caller meets only at run time.

**3.3 Ordering and the clock.** The object stamps each event; order is the sequence number. The first replay run gave
wrong answers (no holder named before 02:53) because its events reached the object out of time order and the fold goes by
seq, not by time. The fix: an import key may give a time, but not one older than the newest event (409). That also showed
that live stamps and an import cannot share a product: once a live event is stamped "now", a replay of older events is
refused, so a replay goes into its own product. A comment in `worker.js` states, from Cloudflare's documentation as I
recall it, that a Worker's clock does not advance while code runs, so events in one turn can share a time; not tested
here (**U**). Times a session states run 25–30 minutes ahead (t3 study, Sources); with the object's clock, no session's
estimate enters a record.

**3.4 Facts known only by bounds.** Rule Y turns on whether a provider job opened before or after the ready job's tests
passed. Where only "opened no later than X" is known, the answer is unknown, so the merge queue under Y is three-valued
(holds, free, unknown). This mattered at every refusal in t3 (§4).

**3.5 Size of a brief.** The brief is bounded by halving list lengths until it fits. In the replay, ARCH's brief grew from
734 bytes (21:30) to 5,550 (06:06) and the coordinator's from 934 to 6,172, under the 8,000 bound; most of the growth was
one anomaly list (merged-or-closed with no archive), which the replay cannot clear because the study names no sessions
for the provider jobs. In a 300-job synthetic test the unbounded brief passed 4,000 bytes and the bounded one held to it.
**I**: a bound in bytes works mechanically; which lines survive a cut is a design choice the prototype makes crudely (the
same cap for every list).

**3.6 Schema migration.** With a log as the truth, a change to the meaning of the fold is a version bump and a refold on
the object's next start (tested across a restart from disk). The event kinds are the schema that cannot be changed
lightly: an old event's body must stay readable by every later reducer. Not built: a version on each event kind.

**3.7 Fitting the tool.** The tool's commands are synchronous (`tool/lib/github.mjs` runs `gh` per call), so the client
has a sync form that runs a child `node` per call; `readRecords`/`writeRecord` keep `state.mjs`'s shape, so a command
could keep its logic (**I**; not tried against the tool). The 65,536-character comment limit and records in parts
disappear (one event took ~90,000 bytes).

**3.8 The hook.** Writing it is small (34 lines); what is hard is what it reads. The hooks docs give `tool_input` and
`tool_response`, not the shape of the harness's answers for `create_session` or `archive_session` (**U**). The prototype
takes the first `session_…` id in the create answer and treats an archive answer naming no error as done; both are guesses
until a real answer is captured. Whether `tool_use_id` is in the hook input is also **U** (a hash is the fallback).

## 4. Tranche t3 replayed

**Method.** Events from `tranche-t3-study-27nov.md` §§1–4 only, all times in that file; 26 Nov until midnight, 27 Nov
after. Three products: *facts* (the charter as civicsmith held it: "the first 8 … then stop", then at 02:52:51 the
"conversions only" decision read as the kind conversions-only; provider jobs' openings known only as "no later than" the
refusal that names them); *just* (as facts, with the study's "Each was a job ARCH had just opened" read as opened after
case-checker's test pass then standing, **I**); *x* (a counterfactual: a conversions-only charter from the owner's "lift
the stop" at 21:29:50, the intent PROCESS #19's handover recorded and civicsmith never held, §1). Each view was read at 24
points; read back afterwards with `asof`, the merge-queue answers agreed at 24 of 24. The replay lists 69 notes where a
fact is missing; the main ones:
- **U** the module order except case-checker's 125th; the names of the first eight and of the six conversions at 23:15
  (placeholders `first-8 #n`, `unnamed conversion n`); which of PRs 1706–1708 is which fix; the time of case-checker's one
  failing run; the sender of the 22:04 notice; when any provider job opened or ended; any session but case-checker #5's;
  when case-checker #5 was archived (`status-from-the-system-27nov.md`: archived as read ~08:00Z); the owner's words at
  01:17; when slots went back from 4 to 8; the 14 jobs open at the halt (14 placeholders, eight told, §3).
- **I** a provider named at one refusal and not the next is taken as ended by then; that case-checker uses each module that
  held it (from "a module case-checker uses", §4).
- A discrepancy in the study, left as found: case-checker's job "started 21:48" (§4), yet §2 says ARCH #32 at 22:01 "ran
  the four inherited fixes first (… case-checker; pull requests 1706–1708, 1710)"; 1706–1708 numbered below 1710 suggests
  they were opened before 21:48 (**I**).

**What the views said** (case-checker is PR 1710; "ready min" is minutes since the test pass then standing):

| Time | Event | Merge queue, Y off | Y on, facts | Y on, "just opened" (I) | Ready min | Not archived | Outside charter | Scope vs charter | Brief bytes (ARCH) |
|---|---|---|---|---|---|---|---|---|---|
| 21:30 | stop lifted | not ready | — | — | — | 0 | 0 | 0 | 734 |
| 22:01 | ARCH widens | merges | merges | merges | 1 | 0 | 4 | 1 | 1,513 |
| 22:05 | notice 22:04 | not ready | — | — | — | 0 | 4 | 1 | 1,470 |
| 22:57 | pass 22:56 | merges | merges | merges | 1 | 0 | 4 | 1 | 2,015 |
| 23:05 | ARCH widens | merges | merges | merges | 9 | 0 | 4 | 2 | 2,313 |
| 23:15 | refused | waits (6 conversions) | unknown | merges | 19 | 0 | 4 | 2 | 2,735 |
| 23:54 | refused | waits (ooxml, csv-reader) | unknown | merges | 58 | 0 | 6 | 2 | 2,678 |
| 01:18 | slots to 4 | waits (same) | unknown | merges | 142 | 6 | 6 | 2 | 3,987 |
| 01:58 | pass 01:57 | waits (same) | waits | waits (an artifact of the I above) | 1 | 6 | 6 | 2 | 3,991 |
| 02:17 | refused | waits (office-readers #13, odf-reader #9) | unknown | merges | 20 | 6 | 3 | 2 | 2,916 |
| 02:37 | refused | waits (ooxml 1739, office-readers 1734) | unknown | merges | 40 | 11 | 3 | 2 | 3,521 |
| 02:49 | refused | waits (format-registry, text-chain, site-profiles) | unknown | merges | 52 | 13 | 4 | 2 | 3,927 |
| 02:53 | "conversions only" | waits (same) | unknown | merges | 56 | 13 | 4 | 0 | 3,110 |
| 02:59, 03:19 | refused | waits (csv-reader) | unknown | merges | 62, 82 | 15, 18 | 2 | 0 | 3,076, 3,467 |
| 03:24 | refused | waits (office-readers, odf-reader) | unknown | merges | 87 | 18 | 3 | 0 | 3,607 |
| 03:26 | refused | waits (pdf-reader) | unknown | merges | 89 | 18 | 2 | 0 | 3,467 |
| 03:33 | refused | waits (docprofile 1752) | unknown | merges | 96 | 19 | 2 | 0 | 3,591 |
| 03:49 | merged | — | — | — | — | 23 | 0 | 0 | 3,675 |
| 04:06 | ARCH widens (round 2) | — | — | — | — | 25 (1710 included from here) | 0 | 1 | 4,157 |
| 06:06 | the halt | — | — | — | — | 25 | 14 | 1 | 5,550 |

Slots: over the number at 01:18 and 01:58 (6 of 4, inflated by the I above) and at the halt (14 of 8, the study's own
count). Open-with-no-session fired for the inherited fixes and placeholders from 22:57 to 01:58 (3–5 jobs), since the
study names no sessions for them.

**/next.** Under civicsmith's charter as held (*facts*), from 21:30 to 02:52 `/next` said: "the charter is done: its words
were "Instruction: once civicsmith is using the latest process4 version, open a tranche to convert the first 8 modules in
order …"; nothing more is given until the owner sets a new charter". So the service would have handed out nothing after
the stop was lifted; ARCH's widenings at 22:01 and 23:05 appear as "scope vs charter", and the four inherited fixes
(case-checker's among them) as "outside the charter" from 22:01. From 02:53 (conversions-only), and throughout the
counterfactual *x*, `/next` said "cannot say: the module order is not recorded for 23 module(s)": the study has no order,
and the service will not guess. What it could say: the flaws text-chain #3 and csv-reader #6 held by the charter (the
other two flaws were taken by jobs at 02:17); every item the tool actually offered judged "held" by a conversions-only
charter: test-support R16+R17 (23:17), docprofile #8 (04:58), the told jobs of 05:14–05:18 and 05:54–06:07, pdf-worker R45
(05:22). Under *x*, the same jobs count as outside the charter at each point (4 at 22:01, 6 at 23:54, 14 at the halt).

**What the replay shows.**
1. With rule Y off, the merge queue would have named case-checker's holder at each attempt, with the minutes waited (19 at
   23:15, 96 at 03:33 since the 01:57 pass), and "merges" at 22:01 and 22:57–23:05, when nothing the study names held it
   and no attempt is recorded (the first is 23:15). **I**: a queue read at the test pass could have merged it then, unless
   something not in the study held it.
2. With Y on and only the facts the study gives, every refusal reads "unknown": no provider job's opening time is recorded.
   With "just opened" read as after the pass (**I**), Y frees case-checker at all ten refusals. So Y's effect on t3 cannot be
   shown from the record; it depends on a fact the ledger (B3) would hold and nothing held then.
3. The charter as a record with a kind would have answered the 22:01 question ("the charter is done; nothing more is
   given") instead of leaving it to ARCH (t3 cause 2), and would have flagged each widening against the owner's words.
4. `/next` is only as good as its inputs: without the module order and each module's conversion state in the service
   (A2), it says "cannot say".
5. "Merged, not archived" is the noisiest view when sessions are not recorded; the hooks (E2) are what would fill it.

## 5. What I would change

- Keep jobs out of the one snapshot row: a `jobs` table updated with each event, ended jobs out of the hot state, so the
  rewrite per event stays small as jobs accumulate (§3.1).
- Give each event kind a version, and keep old kinds readable by later reducers; a test that folds a stored log from each
  earlier version (§3.6).
- Make the order rule explicit in the API: live events stamped by the object, imports only into a product of their own and
  only in time order (§3.3, now enforced).
- Record openings, sessions and test times at the source (the commands that open, test and merge; the hooks for sessions),
  since every view and rule Y turn on them (§4).
- Feed the module list (order, uses, conversion state) from the product's repository at each tranche-branch change, so
  `/next` can answer (§4).
- Choose per list what a brief cuts first, by role; "merged, not archived" grouped by count once it passes a few lines.
- Capture one real `create_session` and `archive_session` answer before relying on the hook's reading of them (§3.8).
- Not built and still open: the charter's place under part 3 §1 (whether ARCH may widen); what a conversions-only kind
  does with notices and job-reported flaws (here a switch, `notices: hold|work`; flaws always held, against the design's
  "always work"); a stop obeyed by commands other than `/next`; `wrangler dev --local` (not run; Miniflare's API was used).

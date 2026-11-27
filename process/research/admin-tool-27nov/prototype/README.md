# A local prototype of the Process4 state service (27 Nov 2026, worker I for PROCESS #21)

Built to learn what is hard in the tool's state service (opportunities E1, E2, B1–B5, A1, C1 in the owner's review
document), not to be used. It runs only on this machine, on workerd through Miniflare: no deploy, no Cloudflare
account, no network beyond localhost. No timing or speed measurement is reported (the owner's word, 27 Nov). The report
is `../i-prototype.md`.

## Which files are this worker's
All files in this folder were written by worker I, in the scratchpad folder `proto-i/` (moved there from `proto/`, which
another worker also wrote into: its `store.mjs`, `server.mjs`, `hook.mjs`, `hang.mjs` and `proto.test.mjs` are not
here). Nothing in this folder came from that worker.

## Parts
- `src/worker.js` — the Worker (bearer key, checked against SHA-256 hashes of keys with a role: reader, writer, import)
  and the Durable Object `Product` (one per product, SQLite-backed): append-only `events` table with a unique
  idempotency key, a `snapshot` row of the folded state, a `records` table. `POST /events`, `GET /brief?role=`,
  `/next`, `/owed?session=`, `/anomalies`, `/merge-queue?y=on`, `/records`, `/events`, `/state`, `/stats`,
  `POST /admin/rebuild`. Every view takes `now=` (for "how long") and `asof=` (the log folded up to that time).
- `src/reducer.mjs` — the pure fold (state, event) → state; its `REDUCER_VERSION` bump makes the object refold the
  whole log on its next start (the schema migration).
- `src/views.mjs` — the views as pure functions: merge queue with rule Y as a switch (three-valued where a job's
  opening is known only as "no later than"), anomalies, next work under a charter kind (`first-n`,
  `conversions-only`, `ordinary`), owed acts, a role's brief bounded in bytes.
- `lib/client.mjs` — `connect` (async) and `connectSync` (a child process per call, since the tool's commands are
  synchronous); `readRecords`/`writeRecord` shaped like `tool/lib/state.mjs`'s. `lib/sync-call.mjs` is the child.
  `lib/local.mjs` starts the service on Miniflare.
- `hook/post-tool-use.mjs` — a PostToolUse hook: reads the hook JSON on stdin, posts one event keyed by the tool call,
  exits 0 always (a short deadline and a hard exit guard).
- `test/` — node:test: views (pure), service (keys, idempotency, 200 parallel writers, the clock, refusals, records,
  rebuild, restart and reducer-version migration, sync client), hook.
- `replay/t3.mjs` — civicsmith's tranche t3 from `process/research/tranche-t3-study-27nov.md` only, as events into
  three products (facts; "just opened" read as after the standing test pass, an inference; a counterfactual
  conversions-only charter), with each view read at 24 points. It writes `replay/t3-output.json` (not kept here).
- `wrangler.toml` — for `wrangler dev --local`; not run in this study (Miniflare's API was used).

## Run
```
npm install          # miniflare 4.20260730.0 only
npm test             # 20 tests
npm run replay       # writes replay/t3-output.json
```

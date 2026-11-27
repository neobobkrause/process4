# Part H: the administrator tool's architecture, to build from (27 Nov 2026, worker for PROCESS #21)

Asked in brief 2 (`brief-2.md`): the tool designed to build from, so its challenges show; Cloudflare assumed (E1). Sources: parts D, E, F, G of this folder,
`tool/` (read 27 Nov), build text 5, the starting texts, Claude Code's hooks reference (`code.claude.com/docs/en/hooks.md`,
fetched 27 Nov, "hooks docs"). **I** marks inference, **U** unproven. A prototype of the core was built to find what is
hard (section 9): `/tmp/claude-0/-home-user-process4/03580b3f-d13c-5078-90d5-6603d38ec2c1/scratchpad/proto/` (store, server,
hook, 7 tests passing).

## 0. The shape in one paragraph

(1) **The state service**: one Cloudflare Worker, behind it one SQLite-backed Durable Object (DO) per product (and one for
Process4), holding an append-only event log and views derived from it. (2) **The tool** (node, each session's read-only
copy) keeps every computation that needs the checkout or GitHub (`workOf`, `chooseNext`, `jobWaits`, scope, uses, notices),
sends one event per transition it makes, and prints what the service answers. (3) **Hooks** in each product's
`.claude/settings.json` send the harness's own answers (session created, archived, message sent) and, on his word, ask at a
turn's end what is still owed. GitHub keeps code, pull requests, merges, test records, decision records; the service keeps
what GitHub cannot (who, when, owed, his words, the charter, session ids) and a mirror of GitHub facts, checked by
`p4 reconcile`.

## 1. Entities, states, transitions

Source column: **G** derived from GitHub (or git) at call time; **R** recorded in the service only; **H** reported by
the harness's own answer through a hook; **G→R** a GitHub fact the tool reports as an event (mirror; GitHub wins).

| Entity | States | Transition: cause (who) | Source |
|---|---|---|---|
| Tranche | `opened` → `running` ⇄ `stopped` → `closing` → `merged` \| `dropped` | open: `p4 tranche open <name>` (ARCH), pins the process commit; stop/lift: `p4 stop` (coordinator, on his marked word); closing: `round-done` done with charter met (tool); merged: `p4 merge` of the tranche PR into main (ARCH); dropped: `p4 drop` merged (ARCH) | open, stop: R; merged/dropped: G→R |
| Charter | `none` → `in force` → `superseded` (one in force per tranche) | `p4 charter --from <file>` (coordinator): his exact words + a kind (`all`, `listed`, `conversions-only`, `fixes-only`; X) + optional module list; a later marked word supersedes. ARCH may narrow, never widen, the list (`p4 scope`), logged (proposed; his call) | R |
| Round | `jobs` → `internal walk` → `deploy` → `external walk` → `done` | `p4 next-job` first pick opens it; `walk open/close`, `round-done` (ARCH); a round with no walk area goes `jobs` → `done` (d-synthesis §6, gap 1) | R, walks G (issues) |
| Module (per tranche) | `has work`, `open`, `blocked`, `finished`, `out of charter` | as `moduleStates` (`tool/lib/round.mjs`) today, plus `out of charter` from the kind | G (computed client-side), posted as a plan snapshot |
| Job | `planned` → `branched` → `opened` → `started` → (`tested` pass/fail n) → `ready` → (`waiting` on providers) → `merged` \| `closed` \| `replaced`; side state `blocked` | planned: `next-job` (ARCH); branched/opened: `branch`, `open` (ARCH); started: hook on `create_session` (H); tested: `p4 test` (job); ready: `p4 ready` (job); waiting: `p4 merge` reporting waits (ARCH); merged/closed: `p4 merge`/`p4 close`; blocked: `push --blocked` (job); replaced: `next-job` handing a branch to a new session | planned, started, waiting: R/H; the rest G→R |
| Session | `created` → `live` → `archived`; `unknown` after a reconcile finds it missing | created/archived: hooks on the harness tools (H); `last_seen`: any event it sends; reconcile: `p4 sessions --from <listing file>` (ROOT, ARCH) | H, R |
| Notice | `owed` (provider merged) → `run` → `placed` per told module → `in job` \| `answered` | owed: merge event; run: `p4 notify` end (ARCH); placed/in job: notify and `open` (as today, notice comments stay on GitHub) | G→R |
| Flaw | `placed` (module, kind, loop count) → `in job` → `fixed` \| `handed back` (count+1) \| `held` (only if the charter kind allows) | `p4 place` (ARCH), `open`, merge/close | R (replaces the waiting-work record) |
| Owed act | not stored; derived at read time (section 2.4) | — | derived |
| Owner word | `typed` → `captured` → `recorded` (decision record PR merged) → `relayed` (ARCH acknowledged) | captured: `p4 words --from <file>` (coordinator), service time; recorded: `p4 merge` of the record PR; relayed: `p4 ack <word id>` by ARCH, or a hook on the coordinator's `send_message` naming the id | R, G→R |
| Stop | `none` → `in force` → `lifted` | `p4 stop --from <file>` / `p4 stop --lift --from <file>` (coordinator, his word) | R |
| Role holder | per role: session, generation, since | ROOT on start and each start of a role (hook on `create_session` with the role's title), watcher at takeover | H, R |

Each event kind names the one role that may send it (build text 5 §1's "one writing session for each record", as a
table in the Worker), checked against the role holder view (3.2).

## 2. The data model in the DO

### 2.1 Tables (one SQLite database per product)

- `events(seq INTEGER PRIMARY KEY, id TEXT UNIQUE, kind, role, session, at, client_at, process_commit, schema, body JSON,
  digest)`: append-only; never updated or deleted during a tranche. `at` is the service's clock.
- Views, rebuilt by replaying events (and updated by the same reducer as each event lands): `tranche`, `charter`
  (+ `scope_log`), `round`, `jobs(pr, module, branch, kind, stage, session, opened_at, tested_at, test_passes, test_fails,
  ready_at, waits JSON, merged_at, closed_at, merge_sha, notified_at, replaced_by)`, `sessions(id, role, name, job, started_by,
  started_at, archived_at, last_seen)`, `roles`, `words(id, mark, text, at, via, recorded_pr, relayed_at)`, `stop`,
  `flaws(id, module, kind, from, words, loops, state)`, `notes` (standing notes, as build text 5 §3), `wakes`,
  `handovers(role, generation, written, words)`, `plan_snapshot(at, by, body)`, `anomalies`.
- `meta(schema, pinned_commit, product)`. (The prototype's store has the log, `jobs`, `sessions`, `words`, derived owed
  acts and anomalies.)

### 2.2 One writer, many senders

His words (e §1): "there only being one session that writes data … I don't expect there to be any contention." Here the
one writer is the DO: one instance, single-threaded, and "any series of write operations with no intervening `await` will
automatically be submitted atomically" (`f-cloudflare-docs.md` §1). Sessions *send* events; only the object *writes*,
each request whole, in arrival order, in `transactionSync`: no lost write, no lock in the tool, however many send at once.
His property holds more strongly (no session writes state), and "one writer for each record" becomes "one sender for each
event kind", checked by the service instead of held by text. Load: 270–450 acts an hour (part G) against a soft limit of
1,000 requests a second.

### 2.3 Ids, idempotency, ordering, clocks

- **Ids for facts** are natural keys, so the same fact reported twice (by the command and by a hook, or by a retry)
  collapses: `pr-merged:<n>`, `pr-ready:<n>:<head sha>`, `test:<n>:<head sha>:<run no>`, `session-created:<session>`,
  `session-archived:<session>`, `words:<sha256 of text>`, `notify-done:<n>`.
- **Ids for acts with no natural key** (a charter text, a flaw placed): `<command>:<uuid>` made once per command run and
  kept in the spool if the send fails, so a retry re-sends the same id.
- **A repeat** with the same id and body digest answers `200 {seq, dup:true}`; another body, `409` and an anomaly
  (prototype tests 1 and 4).
- **Ordering**: the service's `seq` is the order. Events can arrive late (a spool flushed an hour later; a hook racing the
  command). So reducers are order-tolerant: a job's stage only moves forward and a terminal stage is never left; times are
  `COALESCE`d (first report wins). **Found by the prototype:** owed acts stored as rows with "owe" and "clear" transitions
  went wrong when events came out of order (a late `ready` after `merged` owed a merge again). Owed acts are therefore not
  stored; they are a query over the views at the moment of asking (test 2 passes with that form).
- **Clocks**: every `at` is the Worker's; a session's time is kept as `client_at` only (sessions ran 25–30 minutes ahead
  in t3). "Takeover due" (B8), "ready for 30 min", his words' date (A4) use service time. The DO sets no timer or alarm, so
  it hibernates and costs about $0 (part F); time rules are computed when asked.

### 2.4 Owed acts (derived)

| Owed act | Owed by | Owed while |
|---|---|---|
| merge PR n | ARCH | job `ready`, not merged, and its recorded waits have ended (each waited module's job merged or blocked since the `waiting` event; B5/Y) |
| notify PR n | ARCH | job `merged`, no `notify-done` |
| archive session s | its starter | s not archived and its job merged, closed or replaced; or a walking session whose walk closed |
| refill a slot | ARCH | slots in use (from the last plan snapshot + live jobs) below the share and the plan has a ready module, outside a stop |
| relay word w | coordinator → ARCH | w captured, not acknowledged |
| record word w | coordinator | w captured, no decision-record PR merged that names its id |
| answer stopped session | ROOT | a role holder whose `last_seen` is older than two of ROOT's wakes |

## 3. The API

### 3.1 Calls (all JSON over HTTPS; path `/v1/products/<product>/…`)

| Call | Request | Answer | Bound |
|---|---|---|---|
| `POST events` | one event `{id, kind, role, session, client_at, body}`; headers `P4-Process: <commit>`, `P4-Schema: <n>` | `{seq, dup}`; 409 conflict; 403 wrong sender; 412 version; 413 size | 16 KB an event; 64 KB for `owner.words`, `handover`, `charter` |
| `POST events:batch` | up to 50 events (a spool flush, an import) | `[{seq,dup}|error]`, each applied alone | 256 KB |
| `GET brief?role=&session=` | — | role, generation, stop, charter, round line, what this role owes, anomalies for it, last handover's words, the reading list as file names in the copy | 10,000 bytes (a figure for the owner; A12 left it open); longer lists cut with "and n more: p4 owed" |
| `GET job/<pr>` | — | module, branch, kind, work lines, charter lines that bind it, replacement count and reason, notices placed, the commands it may run | 6,000 bytes |
| `PUT plan` / `GET plan` | the plan the tool computed (it needs the checkout): ranked ready modules, slots, waits | the last snapshot, `at`, `by` | 64 KB |
| `GET owed?session=&role=` | — | `[{key, what, since}]` | 4 KB |
| `GET anomalies` | — | ready-not-merged over 30 min, merged-not-archived, open with no session, sessions not seen, conflicts, events refused | 8 KB |
| `GET dashboard` | — | everything the coordinator's page shows (d-synthesis §5): stop, charter, round by module state, open PRs with stage times, owed, roles and generations, words waiting, last account, plan head, text sizes | 64 KB |
| `GET record/<key>`, `PUT record/<key>` | compatibility: the eight build-text-5 records as documents | as `state read/write` today | 1 MB (DO row limit 8 MB) |
| `GET export?from=<seq>` | — | events as JSON lines, paged | 1 MB a page |

Sizes are refusals, never silent cuts, reported as a process fault (build text 5 §1). Prototype: 413, 426 (test 6).

### 3.2 Authentication and identity

- One bearer key for the Worker's exact host, a network secret the proxy "adds … to requests for the hosts you list, after
  each request leaves the session's VM" (`f-cloudflare-docs.md`). The tool sends a placeholder; no session sees the key.
  **U**: that node's `fetch` passes the injecting proxy (plain `fetch` and `NODE_USE_ENV_PROXY=1` both reached a public
  host here; injection untested); the tool should set `NODE_USE_ENV_PROXY=1` or call `curl`.
- The key proves "a Process4 session of this owner", not a role. The role is claimed (`P4_ROLE`); the session id comes from
  `CLAUDE_CODE_REMOTE_SESSION_ID` (`cse_…`, the harness's address being `session_…` with the same suffix: observed here,
  mapping **I**). Authority-bearing kinds (`owner.words`, `charter`, `stop`, `roles`) are accepted only from the session
  the role holder view names; others get 403 and an anomaly. A session lying about role and id is not stopped (**I**: the
  trust today's text-held rule has).
- The environment, and so the key, is shared by PROCESS and every product; products are separated by path only.

### 3.3 Versioning

- The tool carries `SCHEMA` and sends its copy's commit. `tranche.opened` pins the commit ("a tranche runs on that one
  version from open to close", build text 2d); another commit gets 412 until ARCH sends `version.moved` (part 6 §7).
- One Worker serves products pinned to different versions: it keeps reducers for a range of schemas, changes are additive,
  a breaking change is a new schema kept until no product pins the old. **Challenge:** the Worker build is not in the
  pinned copy; who deploys it, from which account, under whose approvals, is his (6.3).

## 4. The client side

### 4.1 `tool/lib/state.mjs` and the commands

- `state.mjs` gets a backend seam: `backendFor(cfg)` returns `github` (today's issue comments, kept for fallback and
  migration) or `service` when `process.json` has `"state": {"url": "https://<host>/v1/products/<product>"}`. `readRecords`
  and `writeRecord` keep their signatures (the compatibility documents), so every command that reads records works
  unchanged on day one (part G: "one backend module to swap").
- New `tool/lib/service.mjs` (~250 lines): `send(event)` with a 3 s timeout, two tries, then the spool
  (`$HOME/.p4-spool-<product>.jsonl`), flushed at the start of every command; `get(path)`; version headers.
- Each writing command sends its event after its GitHub act: `branch`, `open`, `test` (pass/fail, head), `ready`,
  `merge` (merged with sha, or `job.waiting` with the waits it printed), `close`, `notify` (done/failed), `push
  --blocked/--unblocked`, `next-job` (`job.planned` + plan snapshot), `walk open/close`, `round-done`, `drop`, `release
  publish`. A failed send never fails the command: the event waits in the spool ("state service: sent later").
- `next-job` reads the charter first: a module outside the charter's list, or work the kind excludes (`conversions-only`
  keeps only conversions; flaws found are placed and held, a hold the kind allows: X), is not offered. `workOf` gains one
  argument (the kind); `chooseNext` is unchanged. `merge` reads the stop and the held-merge notes from the service.
- New commands: `brief <role>`, `job brief`, `owed`, `anomalies`, `plan` (computes and posts), `words --from <file>`,
  `charter --from <file>`, `stop [--lift] --from <file>`, `ack <word id>`, `place` (a flaw), `wake root|watcher`,
  `sessions --from <file>` (a harness listing passed in; the tool cannot list sessions), `handover --from <file>`
  (generation and session filled by the tool), `dashboard`, `reconcile`, `state import`, `state export`.

### 4.2 What each starting text shrinks to

Each keeps: who it is, its authority, the fetch line, the `p4` alias, who directs it, its acts and its rules (the rules
are the design's and stay in the copy). What goes: "Then … the shared state" reading, the handover's copied state, the job
text's work list. Example, the job (6,019 bytes today, **I** about 2,500 after):

> You are the job for `<module>` of `<product>`; branch `<branch>`, pull request `<n>`. Authority: the owner's approvals.
> First command: `<fetch line>`. Second: `p4 job brief --branch <branch>`: it prints your work, kind, the charter lines that
> bind you, why you were started (or replaced), and what to read. ARCH directs you. [Acts and rules 1–10 as now, less the
> sentences that restate the job block.]

ARCH's reading of the round and waiting work (89,773 bytes in civicsmith, d-synthesis §3) becomes `p4 brief arch`
(≤10,000); its rule 2: "the next job is what `next-job` gives; the charter bounds it". Handovers shrink to judgment in
flight (C2); `handover` prints its size, and past a bound he sets the lines restating a view (C3: a check, his word).

### 4.3 Commands at each defined point

| Role | Start / refresh / after compaction | Before acting | After an act | Before a status or handover | At a wake |
|---|---|---|---|---|---|
| ROOT | fetch; `brief root` | `sessions --from` before a restart's archives | hooks record create/archive | `anomalies`; `handover --from` | `wake root` (records the wake, prints stop, stopped sessions, sessions to archive) |
| watcher | fetch; `brief watcher` | — | — | `handover --from` | `wake watcher` ("takeover due: yes/no", service clock) |
| ARCH | fetch; `brief arch` | `next-job`, `merge`, `walk open` (each reads stop, charter) | `merge` prints owed (notify, archive, refill); `notify` end sends done | `anomalies`, `owed`; `handover --from` | — |
| coordinator | fetch; `brief coordinator` | — | `words --from` on each marked word, then the record PR; `charter`, `stop` | `dashboard` → page | — |
| job | fetch; `job brief` | — | `test`, `ready`, `close` send their events | — | — |
| PROCESS | `brief process --product <p>` for each product (reads across repositories) | — | — | — | — |

## 5. Hooks

### 5.1 The settings entries (each product's `.claude/settings.json`; his file, landed by his merge)

```json
{ "hooks": {
  "PostToolUse": [
    { "matcher": "mcp__claude-code-remote__create_session|mcp__claude-code-remote__archive_session|mcp__claude-code-remote__send_message",
      "hooks": [ { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/p4-hook.sh", "timeout": 10 } ] },
    { "matcher": "Bash",
      "hooks": [ { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/p4-hook.sh", "timeout": 10 } ] } ],
  "Stop": [ { "hooks": [ { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/p4-hook.sh", "timeout": 10 } ] } ],
  "SessionStart": [ { "matcher": "compact",
      "hooks": [ { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/p4-hook.sh", "timeout": 15 } ] } ] } }
```

- The MCP matcher is an exact list (only letters, digits, `_`, `|`: hooks docs, "Matcher patterns"). The Bash entry has
  no `if`: the alias expands to `P4_ROLE=arch node $HOME/process4/<commit>/tool/p4.mjs merge 41`, and whether a rule with a
  leading `*` matches past an environment prefix is **U**. So `p4-hook.sh` (~15 lines of bash) exits at once unless the
  command holds `p4.mjs merge` or `p4.mjs close`, starting no node for other Bash calls.
- The shim finds the copy from `process.json`'s `process.commit` and runs its `tool/hooks/hook.mjs`; with no copy yet
  (before the fetch) it exits 0. The hook logic is so versioned with the pinned process.
- Not used: `UserPromptSubmit` for his words (it also fires for "a message another session sends", part C §2.2);
  `PreToolUse` refusals (a gate); the `http` hook type (documented: POSTs the hook's JSON, failures non-blocking; **U**
  through the injecting proxy, and it cannot spool).

### 5.2 What each hook sends

| Event | Sends | Notes |
|---|---|---|
| PostToolUse `create_session` | `session.created {session, name: title, pr: the prompt's /pull/<n>, role: from the title}` | Docs: the input "includes both `tool_input` … and `tool_response`"; a failed call's response "is the error text". Id read by pattern `session_[A-Za-z0-9]+`; the shape is **U** (B3 (c)) |
| PostToolUse `archive_session` | `session.archived {session}` unless the response is an error | A refused archive records nothing |
| PostToolUse `send_message` | `message.sent {to, bytes, digest, word ids found in the text}` | Never the text itself; proves a relay (D3) without copying it |
| PostToolUse Bash `p4 merge`/`close` | nothing (the command sent it); prints "now owed: notify 41; archive session_…; a free slot" from `GET owed` | Next to the result (e §4) |
| Stop | `GET owed`; prints `{"decision":"block","reason":"Still owed …"}` or nothing | Guarded, 5.3 |
| SessionStart `compact` | prints `p4 brief <role>` as `additionalContext` | The copy exists by then; the ARCH #26 case (part C §2.2) |

### 5.3 The Stop hook's loop guard

1. `stop_hook_active` true → exit 0 (docs: "`true` when Claude Code is already continuing as a result of a stop hook";
   the harness's own `stop-hook-git-check.sh` in this container does exactly this, observed).
2. The Stop input's `background_tasks` non-empty (docs list the field) → no block: a job waiting on its two-hour
   `p4 test`, or ARCH's background `notify`, must be allowed to idle.
3. Only actionable acts block: a merge whose recorded waits still hold, a notify already running, an archive of a session
   whose job is open, do not.
4. The same owed set (digest) blocks at most once per 30 minutes per session; the service records each block (`stop.blocked`
   event) so the count survives the session's machine.
5. Claude Code's own cap: "after stop hooks have continued the turn eight times in a row, Claude Code overrides the next
   block and ends the turn" (docs).
6. Any error, timeout or unreachable service → no block.

A Stop block is a stop on stopping, a gate, so his explicit word (part 6 §7; e §4). Stop's `additionalContext` is no
softer form: the docs say "the conversation continues so Claude can act on it". Without his word there is no Stop hook,
and owed acts are shown only after `merge`/`close` and in `brief`.

### 5.4 When the tool or the service is unreachable

Every hook exits 0 on every path, network calls bounded (2 s events, 3 s reads); a failing hook is documented as
non-blocking ("The action goes ahead") unless `onFailure: "block"`, never set here. An unsent event goes to the spool,
sent by the next hook or command. In the prototype, with the service refusing, hanging or up, every hook exited 0 and
kept any unsent event for later.

### 5.5 Stated by the docs versus unproven in cloud sessions

Stated by the docs: project hooks load in a one-repository cloud session (part C §2.1; measured in process3, PD-13);
PostToolUse matches MCP tools and carries `tool_response`; Stop's `decision: block`, `stop_hook_active`, the cap of eight and
`background_tasks`; a hook's failure does not block. Observed here: the harness's own Stop hook guards on `stop_hook_active`;
`CLAUDE_CODE_REMOTE_SESSION_ID` holds the session's id. **U**: any of it in a Process4 session; the harness tools' response
shapes; the proxy injecting the secret into a hook's request. **I**: the checker does not judge a hook's acts.

## 6. Failure modes and recovery

### 6.1 Cases

| Case | What happens | Recovery |
|---|---|---|
| Service down | GitHub acts go on, events spool; `brief`, `owed` print "state service unreachable"; `next-job` declines (it cannot see charter or stop); hooks do nothing | Spools flush on return, then `reconcile`. A long outage: on his word, `process.json` back to the GitHub backend by one PR, after `state export --to-issue` |
| A lost event (spool lost with the machine) | The mirror misses a GitHub or harness fact | `reconcile` (ROOT's wake, ARCH's refresh) sends missing `pr-*` events under natural ids (a late duplicate is harmless); `sessions --from <listing>` the `session.*` ones |
| A session that never calls | Nothing it should have recorded is recorded | Its GitHub acts are found by `reconcile`; its absence shows in `anomalies` (open PR with no session, no `last_seen`); the hooks still record its harness acts. Not stopped (part C §3) |
| A wrong charter | The tool hands out the wrong work for the kind | Only his next marked word changes it; `charter` history is the log; the dashboard shows the charter beside the plan so he sees the mismatch (A1) |
| A tool bug in a reducer | Every role reads the same wrong view (d-synthesis, cause 6) | Fix, deploy, rebuild the views from the untouched log; a wrong event gets a compensating `event.void {seq, why}`, never an edit |
| Wrong role or session claims | 403, logged as an anomaly | ARCH or the coordinator reports a process fault |
| Version skew | 412 from the service | Move per part 6 §7; `version.moved` |
| Cloudflare data loss | **U**; DO storage is durable by the docs | Tranche exports (6.2) are the backup |

### 6.2 Halt, restart, migration, export

- **Halt**: his stop is a `stop` event; `next-job`, `open`, `merge`, `walk open` print his words and decline while it
  stands (A5; his call whether that is a new stop). Nothing needs saving: the store is durable (part G).
- **Restart** (ROOT rule 1): `brief root` prints the roles and live sessions from the view; ROOT passes the harness's
  listing with `sessions --from`, and the tool prints the archive list (sessions in roles, lanes and open jobs). Account
  switch: the state is untouched; the network secret is entered in the new environment (build 6 §3).
- **Migration in** (`state import`, ROOT, once, re-runnable): the issue's records as documents, every job PR into the
  tranche branch with its GitHub times, test record and job block, waiting work as flaws, all under natural ids. Open jobs'
  session ids are in no record (d-synthesis §6): they come from a listing passed in.
- **Export** (tranche end, or on demand): the log as JSON lines and the views as the eight build-text-5 records, landing
  where he says: comments on the issue, or one commit (part 4 §4 forbids running records as files; a closing export is
  history, part G). `--to-issue` lets the GitHub backend take over.

### 6.3 Deploying and owning the service

The Worker's code lives in Process4's repository (`service/`), tested there with workerd as civicsmith's tests already
use (part G). Deploying needs a Cloudflare account and a deploy key: which account (the product's development account,
or one of Process4's own), and the wording that lets a session deploy it, are his (part F, "What the price leaves out";
part G). Until then nothing here runs.

## 7. What stays with AI, and why

- Reading his words into a charter kind, and asking once when unmarked: free words bind nothing; the tool reads only the
  kind he confirms (A1, B1).
- Where a flaw belongs, interfaces, the order of changes that land together, walk areas, flaw versus observation: the
  design gives these to ARCH (part 2 §8; d-synthesis §1).
- Every act on a session (start, message, interrupt, archive, wakes): no program can call the harness's tools (part C); the
  tool names the acts and the hooks record what the harness answered.
- Code, tests, requirements, conversions; the plain words to the owner; judgment in flight in handovers (C2); what to do
  about an anomaly the tool lists.

## 8. Size of the work

From the tool's sizes (`wc -l`, 27 Nov: `tool/lib` 3,926 lines without `notice/`; tests 7,338 lines) and the prototype
(store 101, server 29, hook 60, tests 120 lines for 9 event kinds, 3 views, 7 tests). Estimates **I**.

| Part | Code (lines) | Tests (lines) | Reuses |
|---|---|---|---|
| Worker: routing, auth check, sizes, versions | 200–300 | 200–300 | — |
| DO: log, ~35 event kinds' reducers, 12 views, replay | 700–1,000 | 900–1,300 | prototype store's pattern |
| DO reads: brief, owed, anomalies, dashboard, job, export | 400–600 | 400–600 | — |
| `service.mjs` (send, spool, read, versions) | 200–300 | 200–300 | `pace.mjs`'s retry shape |
| `state.mjs` backend seam, compatibility documents | 100–150 | 150 | all of `state.mjs` as the GitHub backend |
| Events in 15 existing commands | 150–250 | 300–400 | commands unchanged otherwise |
| New commands (17) | 700–1,000 | 800–1,100 | `round.mjs` (`workOf`, `chooseNext`, `moduleStates`, `roundDone`, `blockOf`) for plan and charter; `jobWaits` for Y |
| Hooks: `hook.mjs`, shim, settings | 150–250 | 200–300 | prototype hook |
| Import, export, reconcile | 300–450 | 300–450 | `readAll`, `allPRs`, `jobBlockOf`, `jobRecordOf` |
| Text: build text for the service, part 4 §4 and part 9 changes, the eight starting texts | ~15–25 KB of text | — | — |
| **Total** | **≈3,000–4,300** | **≈3,450–4,900** | test fakes in `tool/test/helpers.mjs` |

That is about as large again as the tool's `lib/` outside the notice; the notice's 6,642 lines (`lib/notice/*.mjs`) are untouched.

## 9. The challenges that showed

1. **Two truths**: GitHub wins on PR facts; the mirror is right only if `reconcile` runs at fixed points (6.1).
2. **Order and duplicates**: natural-key ids and forward-only reducers hold; stored owed rows did not (2.3, prototype).
3. **Identity**: one key for every session and product; roles are claimed, checked only against what hooks recorded.
4. **Session to job**: parsed from the harness's answer and the starting text's PR address; the answer's shape is **U**.
5. **Version skew**: one Worker, many pinned versions; additive schemas, and a deploy owner outside any product.
6. **The Stop gate** can loop on acts not yet doable; five guards, and still his word.
7. **The fetch is first**: before the copy exists the hooks do nothing; the shim must never assume it.
8. **A new service**: host, network secret, deploy key, the checker on a new host (**U**; this environment already carries
   an `autoMode` line for one proxy-injected host, so the pattern exists), and a tie to one host.

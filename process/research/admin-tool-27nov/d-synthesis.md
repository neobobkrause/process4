# Part D: synthesis, an administrator tool for Process4 (27 Nov 2026, worker for PROCESS #21)

Sources: `brief.md`, parts A (`a-roles-and-owner.md`), B (`b-work-pipeline.md`), C (`c-storage-triggers-rules.md`) in this
folder; `tranche-t3-study-27nov.md` (t3), `status-from-the-system-27nov.md` (status), `sizes-handovers-goals-27nov.md`
(sizes). Citations name the part and item: A1, B5, C §1.4. **I** marks inference, **U** unproven. Nothing here is decided;
every choice named is the owner's.

## 1. The answer in one page

**What a tool can take.** The bookkeeping: what is open, ready, waiting and on what, owed (merges, `notify`, archives), who
holds each role, what the owner's words were, what the plan and the round look like, and the counts for the account. Part 4
§1 already gives the tool "whatever has one right answer" (A, "What stays with AI"); the parts find that the pipeline's state
is spread over the round record, three comments per pull request, GitHub's fields and the harness (B §0), and that most of
what handovers carry can be derived or held in a record (A3's table: of 11 kinds of content, 9 derivable or held by a
record, lessons belong in the design, judgment in flight stays). Of ARCH's 14 relays (B16), the tool can hold the content,
the list and whether it was done for all but one (his words given to a lane, in no record), and make none of the acts. No share of operational load can be measured
(ARCH's "passing things on" share is unmeasured, A8, B16); **I**: most of the reading and remembering, little of the acting.

**What it cannot do.** Every act on a session: start, message, interrupt, archive, list sessions, name, make or remove a
wake, read fill or depth (A fact 1; B §0; C §2). It can print the list and the text; the session acts. Judgment stays:
scope contents, where a flaw goes, interface decisions, walk areas, flaw vs observation, whether an unmarked message is a
decision, the plain words put to the owner (A, B "What stays with AI"). It cannot read free words: "conversions only" binds
only through a structured scope (A1, B1). It is held by text: a session that does not call it is not stopped (C §3), unless
a hook calls it, and hooks are the owner's file and unproven in Process4 (C §2.1).

**What it does and does not fix in t3** (t3 §6). Cause 1 (intent lost in handovers): touched by a charter (A1, B1), exact
capture (A2) and handovers that carry no instructions (A3, H). Cause 2 (ARCH decided what came next, as the design lets
it): not fixed; a charter puts his words beside ARCH's scope so a mismatch is visible (A1, I), but the choice stays ARCH's
unless part 3 §1 changes. Cause 3 (no form for "conversions only"): only with option X, which a charter kind would carry
(B1). Cause 4 (conversions' stated types make flaw jobs): untouched, a design question (B, last section; t3 §7). Cause 5
(case-checker's six hours): made visible at once (B4, B5), ended only by option Y (B5). Cause 6 (tool faults): a bigger
tool is more surface to keep right; a fault in a derived view misleads every role at once (A3, A12). Of ARCH's six drift
causes (status), causes 1, 3, 4, 5 are answered by reads of the system (A3, B4); cause 2 (habit) only if the session calls;
cause 6 (length) by a bounded `brief` (A12). Not a silver bullet: velocity gains are **I** throughout.

## 2. One merged list

[D] = derived from GitHub and existing records, no new writes; [N] = new state or new writes. "Gate?" = adds a test, gate,
review or stop.

| # | Item (sources) | Moves from AI to tool | State; one writer | Trigger | Main pro | Main con / risk | Gate? | Depends on |
|---|---|---|---|---|---|---|---|---|
| 1 | Charter [N] (A1, B1, X) | holding his tranche words and the scope's history | his words + kind: a charter record or a standing-note kind, coordinator; scope log in round, ARCH | coordinator's turn on his word; read at `next-job`, `open`, ARCH start/refresh, page | intent survives ARCH's 35 generations | conflicts with part 3 §1 "no single purpose"; choosing which words bear is judgment | no; a kind that holds flaws departs from "always work" (his word) | 2, X |
| 2 | Owner's words captured [D] (A2) | exact bytes, UTC date, six commands of the record's PR | existing decision record; coordinator | coordinator's turn; UserPromptSubmit hook (U) | true date (clocks 25–30 min ahead, A fact 11) | hook cannot tell owner from peer (U) | no, unless it refuses unmarked text | — |
| 3 | Handover block and derived handover (A3, A4, H) [D mostly] | generation, session, time, name; state copied into handovers | block filled by tool; each role its own | refresh; start (`p4 name`) | ARCH handover 43,295 B shrinks to judgment in flight (I) | derived view only as right as the tool | no | 1, 4, 9, 14, 17 |
| 4 | Job ledger and stamps [N] (B3, B11, B17) | each job's stages, times, session ids, lineage | stamps in round entry (`next-job`), job block (ARCH), test record (job) | the p4 command at each stage; `p4 started/archived` after harness acts | statuses read, not recalled; base of 5, 9, 15 | +2 writes a job (~48/h at 24 jobs/h); K3 share to raise | no | — |
| 5 | Anomalies and sessions check [D] (B4, A5, A6 restart-plan) | finding what did not happen: merged but live, live with no PR, ready not merged, owed acts, orphan wakes | none beyond 4; session/wake list passed in by a file | ARCH refresh and merge turn; ROOT wake; before a status | case-checker named at 23:15, not after 6 h (I) | thresholds the design lacks; a duty to clear would be a gate | no, if it only prints | 4, 6 |
| 6 | Wakes and takeover [N] (A6) | "takeover due" from a true clock; restart list | trigger ids per wake (ROOT or each role's block); depth in ROOT's block | the two wakes; ROOT start | one right answer, no clock error | acts stay harness; small gain on quiet wakes | no | 3, 5 |
| 7 | Stop and notes obeyed [D] (A7) | holding his stop across refreshes | existing `stop`; coordinator | `next-job`, `open`, `merge`, `walk open`, `brief` | his stop holds where work would act | part 6 §5 "holds none of the checks that could stop work" | carries out an existing stop; whether new is his call | 1 |
| 8 | Merge queue [D] (B5, Y) | remembering which ready job to retry | none (times from 4) | `merge` after its own merge; `notify` end; refresh | merges follow providers' merges at once | ends no starvation without Y; one merge a minute | no | 4, 9, Y |
| 9 | Notice ledger [N] (B8, A3) | owed `notify` runs (civicsmith's 99, handover only) | mark on merged PR or round; ARCH via `merge`/`notify` | `merge`, `notify` end or failure | owed notices survive refresh | +1–2 writes a merge; stale "running" | no | 4, 5 |
| 10 | Plan and fill print [D] (B2, B9) | "what comes next" | none (`workOf`, `rankReady`, `slots`) | round open, scope change, page | owner and PROCESS see the order before it runs | a forecast only; ~200 GETs a call pre-K5 | no | 1 |
| 11 | Job instructions [D] (B6, B10, B11) | charter lines, kind rules, replacement reason and count | job block via `open`; ARCH | `open` at start and replacement; `test` prints 3rd/5th run | intent reaches each job with no relay | breaks "names and addresses only" (part 4 §11) | no | 1, 4 |
| 12 | Flaw placement and holds [N] (B7, B10) | appending entries, hold reasons, loop counts | waiting work, round; ARCH | ARCH's placement; `block` | no whole-record hand rewrite (silent drops) | tool surface; same writes | no | 1 |
| 13 | Relays as records [N] (A8, B16) | content of relays; decisions since | fault entries (each sender); PR subscription (U) | each relay; PR events | "unchanged" becomes byte-exact | subscriptions go to one session; CI noise | no | 2, 14 |
| 14 | Owner's page [N] (A9) | composing the dashboard | `owner-items`, coordinator; page rendered by tool | each record-changing coordinator turn | page states records, not recall | is a pre-filled comment "typed myself"? | no | 1, 3, 7, 15 |
| 15 | Account and tranche report [N small] (A10, B12, B17) | counting for the account and report | round open/close stamps, ARCH | `round-done` done; tranche merge | removes ARCH→coordinator relay | some fields judgment; cost unreadable | no ("nothing waits") | 4 |
| 16 | Walks, phases, edit, drop [D mostly] (B13–B15) | areas shared, walkers tracked, phase, drop list | deploy/install stamps new | `round-done`, `walk close`, `drop` | successor finds where the round is | never run; outcome computation reverses "tool judges nothing" | no, if it prints | 4, 15 |
| 17 | `brief` and sizes [D] (A12, A11, S) | reading "the shared state"; rereading at refresh | none | start, refresh, before a status | bounded read of state; sets shrink | a second source if it restates rules | `p4 sizes` is a check (his word) | 1, 3, 5–7 |
| 18 | Callers: hooks, Actions recorder [—] (C §2) | the session's duty to call | none; a recorder would be a new writer | SessionStart startup/compact/resume, PreCompact, PostToolUse; `pull_request` closed | "called at defined points" mechanical | hooks escape the checker; U in Process4; recorder needs widened token | only if blocking or required | 17 |

**Fit and interactions, where they matter.**
- **1 + 2 + 14** are one chain (A9 "How these fit"): words captured exactly, held for the tranche, shown and answered on his
  page. B1's form (a note kind plus a scope log, a view over two records) needs no new record; A1's form (a `charter`
  record) is simpler to read. Either is only binding with X (A1, B1).
- **3 + 17** are one chain: what a handover no longer carries, `brief` prints (A, "How these fit"). H is 3's text side; V is
  what 3, 5 and 17 serve (A3, status).
- **4 is the foundation** of 5, 8, 9, 15 and 16 (B3 item 10). Its harness columns (session id, archive) need either a stamp
  command after the act or a listing passed in (B3 (b)/(c)); (c) writes nothing.
- **5 absorbs A5 and B4**: the same join of a session listing against roles, lanes, round and PRs (A5, B4). 6 adds the wake
  ids that let it find orphan wakes (A5, A6).
- **7 and 1** are the same kind of record read by the same commands (A7 item 10).
- **8 without Y** names the wait; only Y changes what holds (B5 items 6, 10).
- **11** needs a design exception to part 4 §11 or a print beside the block (B6).
- **13** depends on PR subscription in products, U (A8, B5).
- **18** does not add function; it turns "speak when asked" into "asked at a fixed point" (C §2.2). SessionStart `compact`
  is the one point no text gives today (the ARCH #26 case, C §2.2).

## 3. How the items form one tool

**Core state** (smallest form the parts allow): the charter (1: his words, kind, scope log); the build plan (10: computed,
none kept); round state (round record plus open/close stamps, 15); the pipeline ledger (4: mostly derived, stamps for slot
taken, session, archive; notice marks, 9); job instructions (11: the job block `open` writes). Added small records:
`owner-items` (14), wake trigger ids (6), fault entries (13). All else is read from GitHub and git at call time (B,
"Cross-cutting facts").

**Commands at each defined point** (A §1; B, "Defined points"):
- *Start:* `p4 brief <role>` (17) and `p4 name` (3); a job reads its block with charter lines (11).
- *Before acting:* `next-job`, `open`, `merge`, `walk open` print stop, notes, charter (1, 7); a status claim rests on
  `brief`/the anomalies print (5, V).
- *After a merge or close:* `merge` names jobs no longer waiting (8), marks `notify` owed (9), prints the session to
  archive (5, option A); `round-done` done → `account` (15), phase (16).
- *Before a summary or handover:* `p4 handover --from <words>` fills the block (3); the anomalies print (5).
- *At refresh:* the same, then the successor's `brief`; it re-subscribes to open PRs if 13 is used (A8).
- *At a wake:* `p4 wake root|watcher` (6) and `p4 sessions --from <file>` (5).
- *At a stop:* commands decline while `stop` stands and print his words (7); `restart-plan` after a full stop (A6).
- *The owner's word:* `p4 words --from <file>` (2); page render `p4 page` (14).

**Hooks and events** (C §2.2–2.3): SessionStart `startup`/`resume`/`compact` could print `brief`, but the process copy is
fetched by the session's first command, so at `startup` the tool is absent unless the hook fetches it, moving the judged
fetch out of the checker (C §2.2). PreCompact could tell the summary to keep pointers (C §2.2). PostToolUse on `p4` could
record a transition. Any blocking use (PreToolUse deny, Stop block, UserPromptSubmit reject) is a gate (C §3). A
`pull_request` closed workflow could compute the queue but wakes no one without a subscription (B5) and needs a widened
token to write (C §2.3); `issue_comment`, `workflow_run`, `schedule` work only from the default branch, which moves only at a
tranche's merge (C §2.3).

**What a `brief` replaces** (figures from A and B; totals **I**):
- *Reading:* "the shared state" in eight reading lines (A12), which civicsmith made unreadable in full: round record
  89,773 bytes, waiting work at 65,536 characters (A11). With typed record commands, build 5 §2–3 (6,319 bytes) leaves five
  roles' sets; with a plain-words block, build 5b (9,351) leaves a job's (A12). Job start ~58k tokens, ~38k after C & D (B6).
- *Handovers:* most of ARCH's 43,295-byte handover (A3, I); ~1,000 of PROCESS's 2,478 (A3, I); job lists, session ids,
  "ready, waiting on", owed notices, phase lines (B3, B5, B8, B14).
- *Per refresh, I:* if a brief were held to a set bound (say 10,000 bytes, a figure not yet chosen), ARCH would replace
  roughly 90,000 (round) + most of 43,000 (handover) with it; ARCH had 27 generations by 25 Nov, and ARCH #3's 11-minute life
  cost $4.98 "mostly that reading" (A3, A12). ROOT's quiet wake (~10,500 tokens) might lose ~4,700 of `get_session` calls
  to one listing (A5).

## 4. Storage

**Load to carry (civicsmith).** State writes today about 2–4 a job; at 24 jobs an hour, 48–96 writes (C §1.4). The account
runs 184–352 content writes an hour of 500 at 8 slots (B3); item 4 adds ~48, item 9 ~24–48 (B3, B8, I). Jobs push ~110
times an hour to the one repository (C §1.4).

**What bounds the choice.** Part 4 §4: running records "never build up as files or commits in a repository" (C §0). The
owner's decisions already live as repository files (C §0), so a charter's words have a home today. Process3's state branch:
1,387 pushes in 19 hours, 173 in the busiest hour, before the 6 Nov suspension, cause unproven (C §1.1); 70% of all commits;
races needed six commits and three reviews; it could not be removed (C §1.1). Issue comments: a silent lost write when two
writers meet, a 65,536-character limit, records in parts written non-atomically (C §1.3). Approvals: "push to their own
working branches" does not cover a shared branch (C §1.4).

| Option | Pros | Cons |
|---|---|---|
| (a) issue comments now, mostly derived + few small records | nothing new from him; counted writes fit (C §3); derived items (D rows) add no writes | lost write if two writers; 65,536 cap needs parts; no edit history over REST (C §1.3) |
| (b) never-merged `p4-state` branch | compare-and-swap free via act 4; full history; one file per record removes cross-record conflict (C §1.4) | 160–200 pushes/h vs process3's 143–173 before suspension (I); permanent under act 4; required run's `fetch-depth: 0` downloads its history; a non-orphan branch fires `on: push` workflows; approvals wording and a part 4 §4 change (C §1.4, §3) |
| (c) process repository | product sessions can `git fetch` a branch (public) | product sessions cannot write; product state public (C §1.5) |
| (d1) git notes / (d2) state repository | history; (d2) off the product's repository | (d1) proxy U, not covered by rulesets, still commits; (d2) unreachable from one-repository sessions, new owner acts (C §1.5) |
| (e) claude.ai page database | allowed by approvals; beside his page | not reachable from `node` or workflows; each call a judged act; account-bound (C §1.5) |
| (f) Cloudflare DO/D1 | transactional; large; off GitHub | a new service the approvals forbid; token, host, secret; ties Process4 to one host (C §1.5) |

**The middle course the parts point to** (B, "Cross-cutting facts"; A fact 10, **I**): keep D rows derived (no store at
all), put stamps into existing one-writer places, and add only small records (owner-items, wake ids, notice marks) as
comments. One writer per record still holds by text; the lost-write risk does not grow if each new field has one writer.
Its weakness is history: a status "as of when" needs stamps, since records are rewritten in place (B1, C §4). Batching a
command's writes (C §1.4) lowers (b)'s count but not its permanence. No option is chosen here.

## 5. The dashboard

**What the coordinator could render** (A9): stop and notes; charter and scope (with its log, B1); the round by module state,
blocked with reasons, walks; open PRs with tests standing, `merge`'s wait, failed runs, time open (4, 8); waiting-work counts;
owed acts (5, 9); roles with generation; PROCESS's liveness; the last account (15); the plan (10); items only he can clear,
from `owner-items`. Reads per render ~10–20, no content write (A9, I). The coordinator has no wake, so the page shows when it
was rendered (A9).

**His choices as his marked words.** A button can pre-fill a page comment ("Decision: B", "Instruction: lift the stop") that
he reads, may edit and sends; the comment reaches the coordinator, which records it as item 2 does (A9). What holds and what
is open:
- Page comments have counted at PROCESS: decisions are recorded as "typed as a comment on his page" (A fact 7).
- Whether the checker passes a *standing-note* or charter write at the coordinator from a page comment is U; fault 7 refused
  one relayed through another session (A facts 6, 7).
- Whether a pre-filled comment is "a message I typed myself" is his call (A9).
- A page database row is data, never an instruction; a click that writes a row cannot be his word (A fact 8).
- Words he gives ARCH or a lane still reach the record by relay (A1, A2). One page per product leaves PROCESS's page apart,
  which the design's "one page" does not name (A9).

## 6. Gaps found in the current design

- A round with no walk area cannot meet the tranche-end rule "both come clean" (B14; t3 §1, his 02:52 decision).
- civicsmith's round record (89,773 bytes) exceeds the 60,000 single-text maximum; waiting work hit 65,536 (A11).
- The tool reads the `stop` record in no command; it is only a key (A7; checked: `tool/lib/state.mjs` l.11).
- Job session ids are in no record, yet ROOT rule 1 archives "every open job's session" (B3, A5).
- No moment is named for archiving a job (status; A5; B3).
- Owed notices have no record form; civicsmith's 99 lived only in ARCH's handover (B4, B8, A3).
- The round record keeps no open/close times, so a round's account has no window (A10, B12).
- The scope is rewritten in place; who widened it and when is not kept (B1).
- No counter for "handed back twice" or "blocked twice by the same module" (B7).
- Install and update confirmations for release have no record form (B14).
- A replacement job's text does not say it is one, or why (B11).
- Set-aside reasons have no fixed place (B12).
- Nothing says what a handover may not hold (A3; sizes §3).
- The weakness row "a claim not checked" signs only claims to the owner (status).
- No scope form says "conversions only"; told starts above the slot number have no cap (t3 §3; B9).
- `starting_texts/00-index.md` byte figures are stale (A11).
- PROCESS's own page is outside the design's "one page" (A9).
- The design's "a conversion changes no behaviour" is contradicted by what the check refuses in users (t3 §2).

## 7. A staged path (each stage triable on process3-probes first)

process3-probes has no ROOT on this account (`process/handover.md`), so a trial needs it restarted first (I).

- **Stage 0, text only.** V, H, A, Z (and S if he allows the check). No tool change. Shows: whether statements and handovers
  change with text alone; a baseline for later stages. Folds: H is item 3's text side; V is the rule items 5 and 17 serve;
  A is the act item 5 lists; Z cuts PROCESS's reading, which no product tool reaches (A fact 2); S is item 17's `p4 sizes`
  (sizes §2).
- **Stage 1, read-only prints [D].** `brief` (17), the anomalies/sessions check with a listing passed in (5), the merge queue
  (8), the plan (10). No writes, no store decision. Shows: brief size against the bound; whether a status from the print
  matches the system; read cost. Unproven after: civicsmith-scale reads (~200 GETs pre-K5, B2); whether sessions call it.
- **Stage 2, his words and the stop.** Item 2, item 7, and item 1 with X (and Y beside item 8). Small writes in store (a).
  Shows: a charter surviving a refresh; a job reading it; his stop held by commands. Unproven: the checker on writes from
  relayed words or page comments (A1, A9).
- **Stage 3, the ledger.** Items 4, 9, 6, 3, 15, then 14's page. Shows: writes per job against K3's share; a handover's size
  once derived; the account as a print. Unproven: harness listing formats (B3 (c)); product handover contents (A3).
- **Stage 4, callers.** Item 18: first prove a project SessionStart hook in a one-repository process3-probes session (C §2.1),
  then `compact`. A writing Actions recorder last, if at all (C §2.3). Item 13 needs PR subscriptions in products (U).
- **Later.** Items 11, 12, 16: 11 needs a part 4 §11 exception; 16 waits until any walk has run (B13).
- The store question (§4) must be settled before stage 2 only if stage 2 needs more than option (a).

## 8. What it needs from the owner

- **Decisions:** whether an administrator function joins part 6 §5's closed list (C §3); whether a charter exists, against
  part 3 §1 (A1); X, and whether a kind may hold flaws back (B1); Y (B5); whether the tool declining work while `stop`
  stands is a new stop (A7); whether a pre-filled page comment counts as words he typed (A9); H's handover rule (A3); the
  store (§4), and for (b) a change to part 4 §4 (C §3).
- **Approvals wording:** for (b), pushes to a shared state branch in each product (C §1.4); for a writing workflow, a widened
  token (C §2.3); for (f), a new service and account (C §1.5); for item 13, PR subscriptions in each product's approvals
  (A8, B5, I).
- **Settings:** project hooks in each product's `.claude/settings.json`, landed by his merge; or user hooks via the
  environment's setup script, by his approval prompt (C §2.1, §3); for (f), host and network secret (C §1.5).
- **The bar on new tests, gates, reviews, stops** (part 6 §7; C §3). Items that cross it, or may: `p4 sizes`/S (sizes §2);
  item 7 (his call); a duty to clear item 5's anomalies (B4); a Stop hook or `/goal` holding a turn while owed acts remain
  (A11); a tool refusal of unmarked text (A2); a lock on `next-job` for the mechanical edit (B15); any blocking hook or a
  required recorder (C §3). Item 16's computed outcome reverses "the tool judges nothing" (B13). All other items only print
  or record and add none (A, B items 9).

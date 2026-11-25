Length: 238 lines. Last section: "8. Unproven, and not settled here".

# Process4 build text 5: the records, and what the tool follows

Written by Claude on 18 Nov 2026, beside the design (`design/`, "the design"). **Status: proposed. Built in the tool, not run in a process in force; nothing is in force.** It answers item 12 of the design's part 10, section 2. It adds no rule to the design, and no test, check, gate, review or stop: the test record's hold on `ready` and `merge` is the design's (part 2, section 6). The carrier is taken from `process4/working/design_work_18nov/shared_state_carrier.md` and the following from `notified_job_tests.md` beside it; where either, or this text, differs from the design, the design rules. Every example is made up.

Marks: **Decided here:** a choice of this text; the owner or PROCESS can overrule any. **Unproven:** never shown to work.

## 1. The issue that carries the shared state

- One issue in the product's repository, titled `Process4 shared state`, with the label `process4-state`. Its body is two fixed lines: what it is, and that only the tool writes it.
- Each record is one comment. Its first line is the hidden mark `<!-- process4-record: <key> -->`. **Decided here:** after the mark comes one JSON block; a handover has its plain words after the block; an empty record is the mark and `{}`. Gives: every command reads fixed fields. Costs: the owner reads JSON on the page, where the carrier file had plain lines.
- Times are UTC, written `2026-11-20T09:00Z`. A session is named by the address its harness gives it. No record uses "@".
- **Finding it.** Once in a session the tool lists open issues with the label and takes the lowest number. `state write --create`, run by ROOT, makes the label, the issue and the comments of section 2 that are not a lane's, each empty, and locks the issue.
- **Reading.** One call lists the issue's comments, 100 to a page. The tool keeps those whose first line is a mark, with each comment's id. A missing key reads as empty. `state read [<record>]` prints one or all. With `--repository <address>` it reads the issue of another repository (section 4).
- **Writing.** `state write <record> --from <file>` sends the whole new body in one request to that comment. A key with no comment yet is created. The tool prints the record's size and refuses none for size.
- **A failed write.** On a rate-limit answer the tool waits as GitHub says and tries again up to four times (the design, part 4, section 4); the same on a server or network failure. A comment that is gone is made afresh. Anything else, or tries used up: exit 1 with GitHub's words, the record stays as it was, and the session reports a process fault. No list of later writes is kept.
- **One writing session for each record** (the design, part 4, section 4). All sessions act as one GitHub account, so this is held by the starting texts. A job writes none. So the carrier file's read-back for two writers is not built.

## 2. The eight records

| Key | Record | Its one writer |
|---|---|---|
| `roles` | Roles | The holder of ROOT; at a takeover the watcher, which by that write becomes ROOT |
| `lanes` | Lanes | ARCH |
| `wakes` | Wakes | ROOT |
| `stop` | Stop | The coordinator |
| `standing-notes` | Standing notes | The coordinator |
| `round` | Round | ARCH's session, by the tool |
| `waiting-work` | Waiting work | ARCH's session, by the tool |
| `handover-root`, `-watcher`, `-arch`, `-coordinator`, `-lane-<name>` | Handover | The holder of that role |

**Roles.**

```json
{ "root": "session_01A", "watcher": "session_01B", "arch": "session_01C",
  "coordinator": "session_01D", "process": "session_01G", "written": "2026-11-20T09:00Z" }
```

`process` is the live PROCESS session, written by ROOT from the message PROCESS sends it on start (section 4); it is `"none"` until a PROCESS has announced itself, or when the recorded one no longer answers. The coordinator reads it here, never across repositories.

**Lanes.** `state write lanes` refuses a record that names a second live session for a lane the present record shows live (the design's own refusal). The starter writes the entry before the start as a claim, `"session": null` and `"live": true`, and after the start writes it again with the address; a live entry with no session yet may be given one, and that write is not refused.

```json
{ "lanes": [ { "name": "ux", "session": "session_01E", "live": true } ] }
```

**Wakes.**

```json
{ "root_last_woke": "2026-11-20T10:00Z" }
```

**Stop.** Cleared, it is `{ "stopped": false }`.

```json
{ "stopped": true, "account": "the first account", "since": "2026-11-20T10:12Z",
  "words": "Instruction: stop all work" }
```

**Standing notes.** One entry for each instruction now in force; what ends each is in section 3.

```json
{ "notes": [
  { "kind": "held-merge", "pull_request": 41, "written": "2026-11-20T10:20Z", "words": "Instruction: hold the merge of orders" },
  { "kind": "module-first", "module": "pricing", "written": "2026-11-20T10:25Z", "words": "Instruction: do pricing first" },
  { "kind": "slot-number", "number": 10, "written": "2026-11-20T10:30Z", "words": "Instruction: make it ten" },
  { "kind": "full-external-walk", "tranche": "t1", "written": "2026-11-20T10:35Z", "words": "Instruction: walk everything" } ] }
```

**Round.** A module's `state` is `has work`, `open`, `finished` or `blocked`. `finished` and `blocked` are worked out afresh from GitHub at each write: a job's pull request merged, or closed with its nothing-to-change record; a blocked record on an open one. An area's `outcome` is `not yet`, `clean`, `flawed` or `not walked`; a walk's is `not yet`, `without flaws` or `with flaws`, as ARCH writes it. `sessions` are the walking sessions, `live` until ARCH archives each; `copy` is the name and address of an external walker's deployment.

Where ARCH records the tranche's scope (the design, part 2, section 3), `scope` is `{ "tranche": "<this tranche>", "holds": ["<module> R<n>", "<module>", ...] }`. While `tranche` names this round's tranche, a requirement not yet met is work only where `holds` names it or its whole module, and every other requirement waits for a later tranche; notices, walk flaws and flaws a job reports are always work. ARCH rewrites it with `state write round` as the tranche goes on, and in the same act as a split moves requirement lines to a new module. No `scope`, or one naming another tranche, counts every requirement. `next-job` keeps it when it rewrites the record.

```json
{ "tranche": "t1", "round": 2, "scope": { "tranche": "t1", "holds": ["orders R3", "dates"] },
  "modules": [ { "module": "orders", "state": "open", "pull_request": 41 },
               { "module": "dates", "state": "blocked", "by": "pricing", "why": "priceOf refuses a valid date" } ],
  "walks": [ { "kind": "internal", "full": false, "issue": 57, "outcome": "not yet",
    "areas": [ { "area": "checkout", "source": "orders, step header", "session": 1, "outcome": "not yet" } ],
    "sessions": [ { "number": 1, "session": "session_01F", "live": true, "copy": null } ] } ] }
```

**Waiting work.** What is placed against a module and waits for its next job: a notice, by its provider and merged pull request, a walk flaw by number and link, a flaw another module's job reported. A requirement not yet met is not here; it is read from the requirements file. A notice's uses are not kept here but in the notice comments on the merged provider's pull request (section 5). `open --module` copies a module's entries into its job block, reading each notice's uses from those comments, and takes them out of this record. An older entry that still carries `uses` is read as it is.

```json
{ "work": [
  { "module": "orders", "kind": "notice", "from": "pricing", "merged": 40 },
  { "module": "orders", "kind": "walk-flaw", "flaw": "t1-2-I-1-3", "link": "<the comment's address>" },
  { "module": "dates", "kind": "job-flaw", "from": "orders", "words": "a leap day is refused" } ] }
```

**Handover.** The block, then what the successor needs, in plain words. `generation` is the
role's session count (design part 4, section 11): the successor reads it on start, its own
generation is one more (one if the field is absent), it names itself `<product> <role>
#<generation>`, and it records that number here. It survives a cold restart, so the count
never resets. A job and a walking session keep no handover; their number (the job number
`<n>` of `job/<module>.<n>`, the walking-session number) is their generation, and ARCH names
them when it starts them.

```json
{ "role": "arch", "session": "session_01C", "generation": 3, "written": "2026-11-20T11:00Z" }
```

**Slots in use** for a product, and who starts above the slot number, are as build text 1b, command 9 says; a `slot-number` note, where one stands, replaces the product's share.

## 3. What ends each kind of standing note

| Kind | What ends it | How the tool tells |
|---|---|---|
| `held-merge` | The owner's approval, or his lifting it | The coordinator, on his word, writes the note with `"ended": "approved"` or `"ended": "lifted"` |
| `module-first` | That module's job merging | A job pull request of that module merged after the note's `written` |
| `slot-number` | A later slot number | The file holds another `slot-number` note with a later `written` |
| `full-external-walk` | That walk recorded | The round record holds an external walk with `"full": true` and an outcome other than `not yet` |

**Decided here:** `state write standing-notes` leaves each ended note out of what it writes, and a command that reads a note whose ending has come true treats it as gone. Gives: `merge` and `next-job` act rightly before the coordinator's next write. Costs: a held merge ends only by the coordinator's write, since nothing on GitHub shows the owner's word.

## 4. In the process's repository

The process's repository has an issue of the same label and form, made by PROCESS with `state write --create`. It holds three records, all written by PROCESS: `handover-process`; `lanes`, for PROCESS's own lanes; and `changes`, the running record of the changes now proposed. **Decided here (design part 6, section 7; part 4, section 5):** a product's sessions cannot read the process repository's state (part 7, section 3), but a cross-repository message is not refused. So the coordinator does **not** read `handover-process`. Instead `handover-process` carries a `products` registry, each product PROCESS serves and that product's ROOT session; PROCESS, on start, reads it locally and messages each product's ROOT its own session and generation, and ROOT writes it into that product's `roles` record, `process` field (section 2), where the coordinator reads it. The owner seeds a product's ROOT into the registry once; thereafter, on its own start, ROOT messages the PROCESS named in `roles.process` its new address. The owner starts PROCESS.

```json
{ "role": "process", "session": "session_01G", "live": true, "generation": 4,
  "products": [ { "product": "acme-shop", "root": "session_01A" } ], "written": "2026-11-20T11:30Z" }
{ "changes": [ { "change": "shorter job text", "pull_request": 12, "waits_for": "the owner's choice" } ] }
```

## 5. The comments on pull requests: a job's three, and the notice's

Each has a hidden mark on its first line and one JSON block, one writing session, and is written and read only by the tool (the design, part 4, section 11).

The job block, `<!-- process4-job -->`, is written by ARCH's session, first by `open --module <name>` from the waiting-work record and the requirements file, and again by `notify` for each notice that reaches the job while it is open:

```json
{ "module": "orders", "work": ["notice from pricing (pull request 40)"], "kind": "told",
  "notice_seq": 0, "notices": [ { "from": "pricing", "merged": 40 } ],
  "uses": [ { "module": "pricing", "entry": "PriceArgs", "changes": ["bound changed"],
              "lines": ["src/orders/lines.mjs:41", "test/orders/lines.test.mjs:17"], "through": null,
              "before": { "bounds": ["quantity: whole number, 1 to 999"] },
              "after": { "bounds": ["quantity: whole number, 1 to 99"] } } ] }
```

- `work` is the work placed: requirement numbers, notices, and flaws by number and link. The job's starting text carries none of it; it names the pull request.
- `notice_seq` (absent is 0) counts the notices `notify` has added while the job is open, and `notices` holds each notice the block carries as `{ "from": <provider>, "merged": <pull request> }`, those `open --module` copied from waiting work among them, so a second run for the same merge adds nothing, whatever the job's state. Each notice `notify` adds puts its words in `work` and its reasons in `uses`; the kind stays as it was. A test record made before the latest notice no longer stands. An older block with no `notices` that names a notice in its `work` line counts as holding it.
- `kind` is `told` only when notices are the module's only work. With other work as well it is `ordinary`: the block still carries the `uses`, which the job reads, and the whole module's tests run (the design, part 2, section 7). A block with no notice has no `uses`.
- Each of `uses` is a reason of the proof's notice (proof: `tool/lib/notice.mjs:223-259`; the proof is the one build text 2, section 1 names). `module` is the provider, or a later module changed `through` the provider, which `through` then names. `entry` is the entry's name in that module. `changes` holds the proof's words (build text 2b, section 6); the three on the accepting side are one word, `cannot stand in`. `lines` are the places in the told module that use the entry.
- A module the tool does not follow fully has, in place of that, the proof's reason `{ "module": "pricing", "notFollowed": ["<why>"], "through": null }`, with no lines (section 6).
- **Decided here:** each reason also carries `before` and `after`, the parts of the entry that differ, taken from the same notice's own entry; and `lines` is the whole list. Gives: the job reads what changed, and section 7 has every place. Costs: the proof's notice kept only the first six lines for an entry, so the whole list in a notice is unproven. **Unproven:** the job block itself; nothing in the proof wrote or read one.

The job's record, `<!-- process4-job-record -->`, is written only by the job's session and holds one of three things:

```json
{ "blocked": { "by": "pricing", "why": "<one plain sentence>" } }
{ "unblocked": "<one plain sentence>" }
{ "nothing_to_change": "<one plain sentence>" }
```

- `blocked` is written by `push --blocked <module> "<why>"`, `unblocked` by `push --unblocked "<why>"` (where ARCH ended the block by its own decision; the job is then open and holds its slot), `nothing_to_change` by `close <pr> --nothing-to-change "<why>"`. A later record rewrites the comment in place.
- The tool reads `blocked.by` to make the job ready again when that module merges, and reads `nothing_to_change` on a pull request closed unmerged to count the module finished (the design, part 2, section 4). No test runs for that record.
- **Decided here:** one JSON block for each. Gives: the required run and every command read fixed places, and no write is lost to another session's.

The test record, `<!-- process4-test-record -->`, is written only by the session that ran the tests, by `p4 test` (the job's; ARCH's for a pull request that is not a job's), and rewritten in place at each run:

```json
{ "commit": "<head sha>", "notice_seq": 1, "scope": "related", "why": "told job of orders: 2 related test file(s), 5 left out",
  "files": ["test/orders/lines.test.mjs", "test/orders/total.test.mjs"], "passed": 14, "failed": 0,
  "result": "pass", "fails_total": 1, "written": "2026-11-24T20:00Z" }
```

- It stands for a head commit when `commit` is that commit, `notice_seq` is at least the job block's, and `result` is `pass` (`tool/lib/testrecord.mjs`). `ready`, the required run's verdict and `merge` read it so (the design, part 2, section 6; build text 1b, commands 4 and 6).
- `fails_total` counts the fail results across every run on the pull request, with no reset; `failed-runs` reads it (the design, part 4, section 10).
- Held by text: the job writes its own pass record, as it writes its own tests.

The notice comments, `<!-- process4-notice -->`, are on a merged provider's pull request, not a job's. `notify`, in ARCH's session, writes there the uses of each told user with no open job, once for each merge: each comment one JSON block `{ "from", "merged", "part", "users": { <module>: <its uses> } }`, under 60,000 characters, as many as needed, rewritten in place by a second run for the same merge. The waiting-work record names only the module, the provider and the merged pull request (section 2); `open --module` reads the uses from here.

## 6. "Cannot follow": between modules, at the notice

These are the proof's forms (proof: `tool/lib/usage.mjs`, `tool/lib/notice.mjs:223-259`, `PROOF_RESULT.md`). The proof's words for "cannot follow" are "not followed fully". The reader is the language reader the process config names, with its own type checker.

**Who is a user.** Every later module in the order, declared or not. Uses are read from the user's source and tests as they stood before the change; for the narrowing of a user not followed fully, below, names are read on both sides. A **use** of an entry of provider P by module U is a file and line in U that the reader resolves to that entry's declaration, or to a declaration inside it. These count:

- a name in code or in a structured comment;
- a member read, a member filled in an object, a member taken apart;
- a value handed where a kind of P is expected, which uses the members it fills;
- objects merged with `...`;
- a call through a carrier (build text 2b, section 5) whose name is that entry's operation or table.

A use of a provider that U does not declare is noted on the notice: `note: uses pricing without declaring it`.

**Not followed fully.** For a provider P that U declares, any of four causes:

1. U declares P and no use of P is found in its code.
2. U reads or calls a value of unknown kind anywhere in its files, unless the value comes from outside the product.
3. U calls by a name the tool cannot read, and P has operations.
4. U names a table the tool cannot read, and P has tables.

Each cause names at most its first six places, then `and N more`, so a notice is never lost for its size. U is then told:

- of every change to a kind of P (a kind, handle kind, class, operation, table or table of operations) that tells any user;
- of a changed function, method, value or class member only where U's files, before or after, name that entry (for a member, the member's name), or where U reaches P in a way the scan cannot read: an import the scan cannot follow anywhere in what U's files reach, P's whole exports taken (`import * as`, `import('…')`, `require('…')` of a file of P), or another module in that reach that re-exports or carries P, or hands the entry on as a value or takes P whole;
- of nothing that tells no user: a confirmed accepts-more or a new entry.

Accepted misses: a function handed in as a callback from a module U does not reach, and a name built from pieces. This is the design's part 2, section 7, point 2; the code is `tool/lib/notice/narrow.mjs`. The notice says so under the user, and the reason it carries is `{ "module": "pricing", "notFollowed": ["<why>", "told of <entries>"], "through": null }`, with no places:

```
  TOLD orders
      not followed fully for pricing: reads or calls values of unknown kind: src/orders/report.mjs:13 source.list
```

Gives: the forms that ran. Costs: notices for nothing, since a module not followed fully is told of every changed kind, and of a changed function wherever it may use it; how many on a real product is unmeasured (the measures made so far are in the owner's decision record). A missed user is still possible, and the design accepts one (part 2, section 7). **Unproven:** the proven tool refused an import of a file that is not an interface file, a refusal the design does not take; following without that refusal is unproven. None of this has run on a real product.

## 7. "Reaches": inside the told module

**Decided here.** A **piece** is a function, a method, or the top-level code of one file, among the files under the module's `files` and `tests`. A place belongs to the innermost piece that holds its line. Piece A **calls** piece B when A's code holds a call that the reader resolves to B's declaration. A test file **reaches** piece B when a chain of calls leads from any piece of that test file to B.

The related list, made on GitHub's merge of the pull request into its base, is every test file of the module that:

- holds a place named in the job block's `uses`; or
- reaches the piece that holds such a place; or
- reaches a piece with a line this pull request changed; or
- was itself added or changed by this pull request.

**Losing the thread, one step wider each time:**

1. Where a piece B the list needs is named anywhere in the module other than in a call the reader resolves (handed on as a value, kept in a table, called by a name with no comment tying it), every test file whose imports, followed from file to file, lead to B's file counts as reaching B.
2. Where a test file has an import the reader cannot resolve, that test file is related.
3. Where a use is a `notFollowed` reason (section 6), every test file is related: the whole module's tests run.

`related <pr>` prints, for each file in the list, which of these put it there, and the files left out; the test record's `why` gives the counts. An empty list is a pass with no files. Files in the module's `walk/internal/` and `walk/external/` folders are never in the list.

Gives: the list errs toward running a test file. Costs: where a module is one large file, or its tests all enter through one front file, the list is the whole module. **Unproven:** all of it. The proof followed between modules only; following inside one, and the tool knowing it has lost the thread, were never shown (the design, part 2, section 7).

## 8. Unproven, and not settled here

1. Every form in sections 1 to 5 is built and has not run in a process in force. Not verified from GitHub's own pages: the size a comment holds, that a rewrite notifies no one, and that a locked issue still takes the sessions' writes. On a product, GitHub refused the write of a waiting-work record that repeated a notice's uses for each user, its reason not kept; the tool now keeps the notice comments and a job block under 60,000 characters each.
2. Whether the owner can read the JSON records well enough on the page.
3. The proof's forms are in section 5's `uses` and in section 6; what the proof showed, and that it was measured with 23 refusals the design does not take, is in build text 2, section 1. Section 7 has nothing from the proof: "What a told job does was not run."
4. What is read of the shared state to show that an account switch lost no work is not written (build text 4, stage 7).

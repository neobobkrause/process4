Length: 216 lines. Last section: "8. Unproven, and not settled here".

# Process4 build text 5: the records, and what the tool follows

Beside the design (`design/`, "the design"). **Status: proposed. Built in the tool, not run in a process in force; nothing is in force.** It answers item 12 of the design's part 10, section 2. It adds no rule to the design, and no test, check, gate, review or stop: the test record's hold on `ready` and `merge` is the design's (part 2, section 6). Where this text differs from the design, the design rules. Every example is made up.

Marks: **Decided here:** a choice of this text; the owner or PROCESS can overrule any. **Unproven:** never shown to work.

## 1. The issue that carries the shared state

- One issue in the product's repository, titled `Process4 shared state`, with the label `process4-state`. Its body is two fixed lines: what it is, and that only the tool writes it.
- Each record is one comment. Its first line is the hidden mark `<!-- process4-record: <key> -->`. **Decided here:** after the mark comes one JSON block; a handover has its plain words after the block; an empty record is the mark and `{}`. Gives: every command reads fixed fields. Costs: the owner reads JSON on the page.
- Times are UTC, written `2026-11-20T09:00Z`. A session is named by the address its harness gives it. No record uses "@".
- **Finding it.** Once in a session the tool lists open issues with the label and takes the lowest number. `state write --create`, run by ROOT, makes the label, the issue and the comments of section 2 that are not a lane's, each empty, and locks the issue.
- **Reading.** One call lists the issue's comments, 100 to a page. The tool keeps those whose first line is a mark, with each comment's id. A missing key reads as empty. `state read [<record>]` prints one or all. With `--repository <address>` it reads the issue of another repository (section 4).
- **Writing.** `state write <record> --from <file>` sends the whole new body in one request to that comment. A key with no comment yet is created. The tool prints the record's size and refuses none for size.
- **A failed write.** On a rate-limit answer the tool waits as GitHub says and tries again up to four times (the design, part 4, section 4); the same on a server or network failure. A comment that is gone is made afresh. Anything else, or tries used up: exit 1 with GitHub's words, the record stays as it was, and the session reports a process fault. No list of later writes is kept.
- **One writing session for each record** (the design, part 4, section 4). All sessions act as one GitHub account, so this is held by the starting texts. A job writes none.

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

Where ARCH records the tranche's scope (the design, part 2, section 3), `scope` is `{ "tranche": "<this tranche>", "holds": ["<module> R<n>", "<module>", ...] }`. While `tranche` names this round's tranche, a requirement not yet met is work only where `holds` names it or its whole module, and a conversion only where `holds` names the module or one of its requirements; every other requirement and conversion waits for a later tranche; notices, walk flaws and flaws a job reports are always work. ARCH rewrites it with `state write round` as the tranche goes on, and in the same act as a split moves requirement lines to a new module. No `scope`, or one naming another tranche, counts every requirement. `next-job` keeps it when it rewrites the record.

```json
{ "tranche": "t1", "round": 2, "scope": { "tranche": "t1", "holds": ["orders R3", "dates"] },
  "modules": [ { "module": "orders", "state": "open", "pull_request": 41 },
               { "module": "dates", "state": "blocked", "by": "pricing", "why": "priceOf refuses a valid date" } ],
  "walks": [ { "kind": "internal", "full": false, "issue": 57, "outcome": "not yet",
    "areas": [ { "area": "checkout", "source": "orders, step header", "session": 1, "outcome": "not yet" } ],
    "sessions": [ { "number": 1, "session": "session_01F", "live": true, "copy": null } ] } ] }
```

**Waiting work.** What is placed against a module and waits for its next job: a notice, by its provider and merged pull request, a walk flaw by number and link, a flaw another module's job reported, and each item whose meaning ARCH names as changed by the work it places, with one line saying what it was and is now (`meaning`; the design, part 2, section 7). A requirement not yet met is not here; it is read from the requirements file. A notice's uses are not kept here but in the notice comments on the merged provider's pull request (section 5). `open --module` copies a module's entries into its job block, reading each notice's uses from those comments, and takes them out of this record. An older entry that still carries `uses` is read as it is.

```json
{ "work": [
  { "module": "orders", "kind": "notice", "from": "pricing", "merged": 40 },
  { "module": "orders", "kind": "walk-flaw", "flaw": "t1-2-I-1-3", "link": "<the comment's address>" },
  { "module": "dates", "kind": "job-flaw", "from": "orders", "words": "a leap day is refused" },
  { "module": "pricing", "kind": "meaning", "item": "priceOf", "line": "pence was for one; is now for the whole quantity" } ] }
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

## 5. The comments on pull requests: a job's three, a conversion's report, a declaration, and the notice's

Each has a hidden mark on its first line and one JSON block, one writing session, and is written and read only by the tool (the design, part 4, section 11).

The job block, `<!-- process4-job -->`, is written by ARCH's session, first by `open --module <name>` from the waiting-work record and the requirements file, and again by `notify` for each notice that reaches the job while it is open:

```json
{ "module": "orders", "work": ["notice from pricing (pull request 40)"], "kind": "told", "meaning": [],
  "notice_seq": 0, "notices": [ { "from": "pricing", "merged": 40 } ],
  "uses": [ { "module": "pricing", "item": "PriceArgs", "found": "means", "changes": ["bound changed"], "why": null,
              "route": "direct", "places": ["src/orders/lines.mjs:41 addLine", "test/orders/lines.test.mjs:17 lines > refuses 1000"],
              "before": { "bounds": ["quantity: whole number, 1 to 999"] },
              "after": { "bounds": ["quantity: whole number, 1 to 99"] } } ] }
```

- `work` is the work placed: requirement numbers, notices, and flaws by number and link. The job's starting text carries none of it; it names the pull request.
- `notice_seq` (absent is 0) counts the notices `notify` has added while the job is open, and `notices` holds each notice the block carries as `{ "from": <provider>, "merged": <pull request> }`, those `open --module` copied from waiting work among them, so a second run for the same merge adds nothing, whatever the job's state. Each notice `notify` adds puts its words in `work` and its reasons in `uses`; the kind stays as it was. A test record made before the latest notice no longer stands. An older block with no `notices` that names a notice in its `work` line counts as holding it.
- `kind` is `conversion` where the module's conversion is its work (none merged, within the scope): its work is the conversion alone, its other work waiting for its next job, since a conversion changes no behaviour. Otherwise it is `told` only when notices are the module's only work, and with other work as well `ordinary`: the block still carries the `uses`, which the job reads, and the whole module's tests run (the design, part 2, section 7). A block with no notice has no `uses`.
- `meaning` holds each item ARCH named in the work placed, from the waiting-work `meaning` entries: `{ "item", "line" }`.
- Each of `uses` is a reason: the provider; the changed `item`; `found`, `means`, `named` (in ARCH's placed work) or `declared` (on the provider's pull request); `changes`, the parts of the means that differ (build text 2b, section 6); `why`, a named or declared change's line; `route`; `places`, from the told module's uses file, the first six and `and N more`, so a notice is never lost for its size; `before` and `after`, the parts that differ; `members`, for a change told member by member, the members `added`, `removed`, `changed`, made `optional`, or changed only inside another kind (`through`). A place outside the standard gives `outside`, an order fault `orderFault`, each `<rule> <file>:<line>`; a module with no uses file, `noUsesFile`. **Unproven:** the job block and these reasons; not built.

The job's record, `<!-- process4-job-record -->`, is written only by the job's session and holds one of three things:

```json
{ "blocked": { "by": "pricing", "why": "<one plain sentence>" } }
{ "unblocked": "<one plain sentence>" }
{ "nothing_to_change": "<one plain sentence>" }
```

- `blocked` is written by `push --blocked <module> "<why>"`, `unblocked` by `push --unblocked "<why>"` (where ARCH ended the block by its own decision; the job is then open and holds its slot), `nothing_to_change` by `close <pr> --nothing-to-change "<why>"`. A later record rewrites the comment in place.
- The tool reads `blocked.by` to make the job ready again when that module merges, and reads `nothing_to_change` on a pull request closed unmerged to count the module finished (the design, part 2, section 4). No test runs for that record.
- **Decided here:** one JSON block for each. Gives: the required run and every command read fixed places, and no write is lost to another session's.

The conversion's report, `<!-- process4-conversion -->`, is written by `ready` on a conversion job for the owner's review, from the uses file at the head and as `uses` reads the base: places outside the standard gone, by rule; copies; places still outside, with what each waits on; the time from opening to `ready`; the cost where it can be read: `{ "converted": { "S5": 3, "R1": 12 }, "copies": ["<file>:<line> <item>"], "waits": ["S5 <file>:<line>: <waitsOn>"], "time": "2h 10m", "cost": "unmeasured" }`.

The declaration, `<!-- process4-meaning -->`, written by `push --meaning <item> "<was; is now>"` by the session that owns the pull request (the job; ARCH for its own), holds one line for each item whose meaning it changes: `{ "meaning": [ { "item": "priceOf", "line": "<was; is now>" } ] }`. `notify` reads it on the merged pull request.

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

## 6. The means, and who is told: between modules, at the notice

**The means** of an item are the design's (part 2, section 7), worked out before and after a merge from the provider's files and its providers' stated types, by the reader the process config names. Its stated types, expanded with their names, and its bound lines are its listing (build text 2b, section 6). The parts worked out from its code (errors that can leave it, its providers' included; plain data or class instance; `this`; arguments it writes into; files, tables, settings, streams and start arguments) are worked out over its closure: those reached through an owner's reader are that reader's stated types. A type error in the item counts as a change.

**The closure** of an item is every piece of its module its behaviour can depend on; a piece is a declaration, a local, an object or class member, a top-level statement or a data file, its text leaving out the pieces nested in it. From the item's own pieces, add each piece reached by control: one whose binding a piece names; each function, getter or setter member named as a member a piece reads, writes or calls (every function member for a computed access); a file named by a literal; a piece that runs when the piece holding it runs; an import's declaration and that file's top-level statements. From every piece also add its file's top-level statements and the order of its statements and imports, the members the language calls implicitly (`toString`, `valueOf`, `toJSON`, `then`, `next`, `return`, `throw`, `constructor`) and those with a computed name, and, where a name resolves to nothing in the module, every piece. Then add the writers of every location a piece in it reads (a binding, a field by name, the contents of either, with contents reached through a parameter, `this` or a call's result as one location, and the state outside the module), and every piece that reaches such a writer by control; repeat to a fixpoint (source: `process/research/uses-metadata-25nov/study-changes.md`, section 3.2). Each part is exact where the language decides it, and as wide as this rule elsewhere: an error raised in a try block whose catch never names the error it caught does not leave the item, nor one raised by code that block calls to run at once (not async, not a generator), though a promise made rejected and a function built and handed back still do; a stream written out of the program (standard output or error, a message to the parent) by code outside the call does not reach the item; what the item's own code reads of what its caller handed it (a parameter with no default, or a `const` set from one) is its input, and does not take in the code that made it; and a call into another module proven to keep no state writes nothing another piece reads. A module keeps no state when its files hold at their top only imports, functions, classes with no static state and `const` values made without running code, none ever written, written into or, holding a list or object, handed on; write nothing that outlives a call (only into what a function made fresh itself, and into `this` only in a constructor); name none of the host's facilities that keep state; and import only such modules and Node's modules that keep none. It may say "changed" for an equivalent rewrite, never "unchanged" for a different one.

**Who is told.** The changed items of a merged module are those whose means differs, those removed, and those named in its job block's `meaning` or declared in its `process4-meaning` comment; not a new item, an item the checker confirms only accepts more, or an item's first means, at its conversion. `notify` then reads the later modules' uses files and tells, once each: every module whose file names a changed item, or a member of a changed type, by any route, where the change reaches its use; and, on any change to the provider's files whether or not an item changed, every module with a place outside the standard whose `mayRefer` names the provider or an order fault naming it, and every later module with no uses file yet that imports it. A middle module that passes a value on is told only where its own file names the item. Each gets the reasons of section 5. **Unproven:** all of it; not built.

**Where a change reaches a use.** A kind, a handle kind or a class whose means differ only in its members (added, removed, changed or made optional; a class's are its instances') is told member by member, by each use's `value` (build text 2c): a member added reaches the uses of the whole value; one removed, changed or made optional, those and the reads of that member (for a handle kind, of its method's own item); a use that only names the kind or holds its value under a name, none. Any other change to it (what kind it is, what it is used for, a class's constructor, an index or call signature, a bound line, any part of its means besides its members) reaches every use, as does a use without `value`. A member whose kind differs only inside another kind that changed member by member reaches only the whole value's uses. An item whose means differ only inside such kinds (a function that hands one back) is told through them: a use that calls it (by its name, or an operation by its written-out name) or only names it hears of it by those kinds' own uses, where each value the call hands back or takes is listed; a use that reads, hands on or converts the item itself still hears of it, as does a file without `value`. A changed method of a handle kind also reaches the uses of the handle's whole value. A change of meaning alone (named or declared, its means the same) does not reach a module whose every use of the item is `none` or `handed back`, at least one handed back and none a marked copy, where a later module that gets the value through it is told of the item: its code and tests neither read, compare, format, store nor assert the value. It is decided from the last module to the first; a module whose later receivers are all left untold stays told.

## 7. "Reaches": inside the told module

**Decided here.** A **piece** is a function, a method, or the top-level code of one file, among the files under the module's `files` and `tests`. A place belongs to the innermost piece that holds its line. Piece A **calls** piece B when A's code holds a call that the reader resolves to B's declaration. A test file **reaches** piece B when a chain of calls leads from any piece of that test file to B.

The related list, made on GitHub's merge of the pull request into its base, is every test file of the module that:

- holds a place a reason in the job block's `uses` names, a place outside the standard or an order fault among them, taking every place from the told module's uses file; or
- reaches the piece that holds such a place; or
- reaches a piece with a line this pull request changed; or
- was itself added or changed by this pull request.

**Losing the thread, one step wider each time:**

1. Where a piece B the list needs is named anywhere in the module other than in a call the reader resolves (handed on as a value, kept in a table), every test file whose imports, followed from file to file, lead to B's file counts as reaching B.
2. Where a test file has an import the reader cannot resolve, that test file is related.
3. Where a reason is a module with no uses file (section 5), every test file is related: the whole module's tests run.

`related <pr>` prints, for each file in the list, which of these put it there, and the files left out; the test record's `why` gives the counts. An empty list is a pass with no files. Files in the module's `walk/internal/` and `walk/external/` folders are never in the list.

Gives: the list errs toward running a test file. Costs: where a module is one large file, or its tests all enter through one front file, the list is the whole module. **Unproven:** all of it: following inside a module, and the tool knowing it has lost the thread, were never shown (the design, part 2, section 7).

## 8. Unproven, and not settled here

1. Every form in sections 1 to 5 is built and has not run in a process in force. Not verified from GitHub's own pages: the size a comment holds, that a rewrite notifies no one, and that a locked issue still takes the sessions' writes.
2. Whether the owner can read the JSON records well enough on the page.
3. Sections 5's `uses`, 6 and 7 are not built; the proof's 150 changes are to be recorded again under them (build text 4, stage 4). The proof's own run is in build text 2, section 1: "What a told job does was not run."
4. What is read of the shared state to show that an account switch lost no work is not written (build text 4, stage 7).

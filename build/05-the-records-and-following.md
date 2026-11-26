Length: 184 lines. Last section: "8. Unproven, and not settled here".

# Process4 build text 5: the records, and what the tool follows

Beside the design (`design/`, "the design"). **Status: proposed. Built in the tool, not run in a process in force; nothing is in force.** The test record's hold on `ready` and `merge` is the design's (part 2, section 6). Every example is made up.

Marks: **Decided here:** a choice of this text; the owner or PROCESS can overrule any. **Unproven:** never shown to work.

## 1. The issue that carries the shared state

- One issue in the product's repository, titled `Process4 shared state`, with the label `process4-state`. Its body is two fixed lines: what it is, and that only the tool writes it.
- Each record is one comment, or more where it outgrows one. Its first line is the hidden mark `<!-- process4-record: <key> -->`. **Decided here:** after the mark comes one JSON block; a handover has its plain words after the block; an empty record is the mark and `{}`.
- Times are UTC, written `2026-11-20T09:00Z`. A session is named by the address its harness gives it. No record uses "@".
- **Finding it.** Once in a session the tool lists open issues with the label and takes the lowest number. `state write --create`, run by ROOT, makes the label, the issue and the comments of section 2 that are not a lane's, each empty, and locks the issue.
- **Reading.** One call lists the issue's comments, 100 to a page. The tool keeps those whose first line is a mark, with each comment's id. A missing key reads as empty. `state read [<record>]` prints one or all. With `--repository <address>` it reads the issue of another repository (section 4).
- **Writing.** `state write <record> --from <file>` sends the whole new body in one request to that comment. A key with no comment yet is created. A record of 60,000 characters or more is instead written in as many comments as it needs, each under 60,000: its longest list (`work`, `modules`) spread over them, the first holding the rest and `parts`, the count, each further one, marked `<!-- process4-record: <key>, part <i> -->`, the next items; it is read back as one. The tool prints the first comment's size and refuses no work for size; a record with no list, or one entry too large for a comment alone, cannot be written and fails plainly.
- **A failed write.** On a rate-limit answer the tool waits as GitHub says and tries again up to four times (the design, part 4, section 4); the same on a server or network failure. A comment that is gone is made afresh. Anything else, or tries used up: exit 1 with GitHub's words, the record stays as it was, and the session reports a process fault.
- **One writing session for each record** (the design, part 4, section 4). All sessions act as one GitHub account, so this is held by the starting texts. A job writes none.

## 2. The eight records

Keys (each record's one writer: the design, part 4, section 4): `roles`, `lanes`, `wakes`, `stop`, `standing-notes`, `round`, `waiting-work`, and `handover-root`, `-watcher`, `-arch`, `-coordinator`, `-lane-<name>` for the handovers.

**Roles.**

```json
{ "root": "session_01A", "watcher": "session_01B", "arch": "session_01C",
  "coordinator": "session_01D", "process": "session_01G", "written": "2026-11-20T09:00Z" }
```

`process` is the live PROCESS session, written by ROOT from the message PROCESS sends it on start (section 4); it is `"none"` until a PROCESS has announced itself, or when the recorded one no longer answers.

**Lanes.** `state write lanes` refuses a record that names a second live session for a lane the present record shows live (the design's own refusal). The claim written before a start (the design, part 4, section 3) is `"session": null` and `"live": true`; giving it its session is not refused.

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

**Waiting work.** What is placed against a module for its next job: a notice, a walk flaw, a flaw another module's job reported, and each interface change ARCH names in the work it places (`meaning`: the item, and one line of what it was and is now; the design, part 2, section 7). A requirement not yet met is not here; it is read from the requirements file. A notice's uses are not kept here but in the notice comments on the merged provider's pull request (section 5). `open --module` copies a module's entries into its job block, reading each notice's uses from those comments, and takes them out of this record. An older entry that still carries `uses` is read as it is.

```json
{ "work": [
  { "module": "orders", "kind": "notice", "from": "pricing", "merged": 40 },
  { "module": "orders", "kind": "walk-flaw", "flaw": "t1-2-I-1-3", "link": "<the comment's address>" },
  { "module": "dates", "kind": "job-flaw", "from": "orders", "words": "a leap day is refused" },
  { "module": "pricing", "kind": "meaning", "item": "priceOf", "line": "pence was for one; is now for the whole quantity" } ] }
```

**Handover.** The block, then what the successor needs, in plain words. `generation` is the role's session count, which the successor reads, names itself by and records as the design says (part 4, section 11); absent reads as 0.

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

**Decided here:** `state write standing-notes` leaves each ended note out of what it writes, and a command that reads a note whose ending has come true treats it as gone. Costs: a held merge ends only by the coordinator's write, since nothing on GitHub shows the owner's word.

## 4. In the process's repository

The process's repository has an issue of the same label and form, made by PROCESS with `state write --create`. It holds three records, all written by PROCESS: `handover-process`; `lanes`, for PROCESS's own lanes; and `changes`, the running record of the changes now proposed. `handover-process` carries a `products` registry: each product PROCESS serves, and that product's ROOT session. PROCESS, on start, reads it and messages each product's ROOT its own session and generation, which ROOT writes into the product's `roles` record, `process` field (section 2; the design, part 4, section 5). The owner seeds a product's ROOT into the registry once; thereafter, on its own start, ROOT messages the PROCESS named in `roles.process` its new address.

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

- `work` is the work placed: requirement numbers, notices, and flaws by number and link.
- `notice_seq` (absent is 0) counts the notices `notify` has added while the job is open; `notices` holds each notice the block carries, `{ "from": <provider>, "merged": <pull request> }`, those `open --module` copied among them, so a second run for the same merge adds nothing. Each added notice puts its words in `work` and its reasons in `uses`; the kind stays. An older block with no `notices` that names a notice in its `work` counts as holding it.
- `kind` is `conversion`, `told` or `ordinary`, as `open` decides (build text 1b, command 3); an `ordinary` block still carries its notices' `uses`. A block with no notice has no `uses`.
- `meaning` holds each item ARCH named in the work placed, from the waiting-work `meaning` entries: `{ "item", "line" }`.
- Each of `uses` is a reason: the provider; the changed `item`; `found`, `means`, `named` (in ARCH's placed work), `declared` (on the provider's pull request) or `any change` (a reason of point 3 or 4 of section 6, which names no one item), with `items`, the provider's changed items, where any; `namedBy`, where the tool found an item changed by its means and ARCH named or the pull request declared it too, which; `changes`, the parts of the means that differ (build text 2b, section 6); `why`, a named or declared change's line; `route`; `places`, from the told module's uses file, the first six and `and N more`; `before` and `after`, the parts that differ; `members`, for a change told member by member, the members `added`, `removed`, `changed`, made `optional`, or changed only inside another kind (`through`). A place outside the standard gives `outside`, an order fault `orderFault`, each `<rule> <file>:<line>`, or, for a module with no uses file, read from its imports, `imports <file>:<line>`, with `noUsesFile` and `places`; a use of type `mock`, `mock`; a package's or the host's version, `package`, with the package; a module with no uses file, `noUsesFile`; a use through a kind another module relabelled as its own, `copy`, that module and its kind; a name that now reaches the module through another's re-export, `resolves`, `{ "via": <that module> }`; and `whole`, where the reason runs the whole module's tests (a notice too large for the job block).
- The block stays under 60,000 characters, at `open` as at `notify`: the reasons lose `before` and `after` where needed, then a notice's reasons become one `whole` reason (at `open`, the notices with most reasons first, one by one); an `open` that still cannot fit opens nothing and fails plainly.

The job's record, `<!-- process4-job-record -->`, is written only by the job's session and holds one of three things, and beside it the notices that need no change:

```json
{ "blocked": { "by": "pricing", "why": "<one plain sentence>" } }
{ "unblocked": "<one plain sentence>", "notice_needs_no_change": { "notice_seq": 2, "why": "<one plain sentence>" } }
{ "nothing_to_change": "<one plain sentence>", "notice_needs_no_change": { "notice_seq": 1, "why": "<one plain sentence>" } }
```

- `blocked` is written by `push --blocked <module> "<why>"`, `unblocked` by `push --unblocked "<why>"` (where ARCH ended the block by its own decision; the job is then open and holds its slot), `nothing_to_change` by `close <pr> --nothing-to-change "<why>"`, and `notice_needs_no_change` by `push --notice-nothing "<why>"`, with the n of `--notice <n>` (the last notice the job read, not above the block's `notice_seq`), else the job block's `notice_seq` at that moment, and by `close --nothing-to-change` where notices reached the job, beside its `nothing_to_change` in one record. It answers the notices up to its count, never a later one. It lives only here, never in the job block: each comment has one writer. A later record rewrites the comment in place and keeps `notice_needs_no_change`.
- The tool reads `blocked.by` to make the job ready again when that module merges; `nothing_to_change` to count the module finished on a pull request closed unmerged (the design, part 2, section 4); and it and `notice_needs_no_change` as the test record below says. No test runs for them.
- **Decided here:** one JSON block for each.

The conversion's report, `<!-- process4-conversion -->`, is written by `ready` on a conversion job for the owner's review, from the uses file at the head and as `uses` reads the base (places converted by rule, copies, what each place still outside waits on, time from opening, cost where it can be read): `{ "converted": { "S5": 3, "R1": 12 }, "copies": ["<file>:<line> <item>"], "waits": ["S5 <file>:<line>: <waitsOn>"], "time": "2h 10m", "cost": "unmeasured" }`.

The declaration, `<!-- process4-meaning -->`, written by `push --meaning <item> "<was; is now>"` by the session that owns the pull request (the job; ARCH for its own), holds one line for each item whose meaning it changes, and, written by `push --same <item> "<why>"`, each item the tool found changed whose domain and range the job records as the same: `{ "meaning": [ { "item": "priceOf", "line": "<was; is now>" } ], "same": [ { "item": "totalOf", "why": "<one line>" } ] }`. `notify` reads it on the merged pull request; a `same` item tells no one unless ARCH named it or `meaning` holds it (the design, part 2, section 7, "The insides only").

The test record, `<!-- process4-test-record -->`, is written only by the session that ran the tests, by `p4 test` (the job's; ARCH's for a pull request that is not a job's), and rewritten in place at each run:

```json
{ "commit": "<head sha>", "notice_seq": 1, "scope": "related", "why": "told job of orders: 2 related test file(s), 5 left out",
  "modules": ["orders"], "files": ["test/orders/lines.test.mjs", "test/orders/total.test.mjs"], "passed": 14, "failed": 0,
  "result": "pass", "fails_total": 1, "written": "2026-11-24T20:00Z" }
```

- It stands for a head commit when `result` is `pass`; `commit` is that commit, or an earlier one from which the head differs only in the module's uses file; and its `notice_seq`, or the job's record's `notice_needs_no_change.notice_seq`, is at least the job block's (`tool/lib/testrecord.mjs`). Where the scope is nothing (build text 1, section 5) no record is needed, except by a `told` job whose job's record does not hold `nothing_to_change`, which stands in for its test record, or a job whose block's `notice_seq` is above 0 and above its record's `notice_needs_no_change`. `ready`, the required run's verdict (`run verdict --job-record`) and `merge` read it so (the design, part 2, section 6; build text 1b, commands 4 and 6).
- `modules` names the modules whose tests ran; with scope `whole module`, those whose whole tests ran on the merged result of the head into the base. `notify` reads it for the whole-tests exception (section 6), where the record is a pass made at a commit from which the merge commit differs in uses files at most.
- `fails_total` counts the fail results across every run on the pull request, with no reset; `failed-runs` reads it (the design, part 4, section 10).

The notice comments, `<!-- process4-notice -->`, are on a merged provider's pull request, not a job's. `notify`, in ARCH's session, writes there the uses of each told user with no open job, once for each merge: each comment one JSON block `{ "from", "merged", "part", "users": { <module>: <its uses> } }`, under 60,000 characters, as many as needed, rewritten in place by a second run for the same merge. The waiting-work record names only the module, the provider and the merged pull request (section 2); `open --module` reads the uses from here.

## 6. The means, and who is told: how the tool works them out

The rules are the design's (part 2, section 7); this section gives what the tool reads and its order (unproven: section 8).

- **The means**, before and after a merge, come from the provider's files and its providers' stated types, by the reader the process config names: the stated parts are the listing (build text 2b, section 6); a part reached through an owner's reader is that reader's stated types; a new type error in the item is a change. Only its stated types and bounds tell (the owner's decision of 26 November): the closure below decides plain data or an instance, `this`, and a started program's start arguments and output streams; the errors, other channels and arguments written into it also finds are listed and tell no one.
- **The closure, in order.** From the item's own pieces (a piece's text leaves out the pieces nested in it): (1) add by control each piece whose binding a piece names; each function, getter or setter member read, written or called by name, every function member for a computed access; a file named by a literal; a piece that runs when the piece holding it runs; an import's declaration and that file's top-level statements. (2) From every piece add its file's top-level statements and the order of its statements and imports; the implicit members, exactly `toString`, `valueOf`, `toJSON`, `then`, `next`, `return`, `throw` and `constructor`, and those with a computed name; and every piece, where a name resolves to nothing in the module. (3) Add the writers of every location a piece reads (a binding, a field by name, the contents of either, contents reached through a parameter, `this` or a call's result being one location, and the state outside the module), and each piece that reaches such a writer by control. Repeat until nothing is added (source: `process/research/uses-metadata-25nov/study-changes.md`, section 3.2).
- **Left out, as read.** A catch that never names its error covers what its try block raises and the code that block calls to run at once (not async, not a generator). A stream is standard output or error, or a message to the parent. The caller's input is a parameter with no default, or a `const` set from one. A module keeps no state when its files hold at top level only imports, functions, classes with no static state and `const` values made without running code, never written, written into or (a list or object) handed on; it writes only into what a function made fresh, and into `this` only in a constructor; it names no host facility that keeps state, and imports only such modules and Node's modules that keep none.
- **Who is told**, from the uses files (build text 2c). A conversion's merge (the merged job block's `kind` is `conversion`) tells no one, and nothing is read. Point 1: a use naming a changed item or a member of a changed kind, by any `route`, reached as its `value` says; a provider's error or channel a middle module's item takes in (`takesIn`) makes no item changed, and is not read. Point 2: a `marked copy` use, a `copies` entry, an S4 place whose `relabels` names the item. Point 3: an `outside` place whose `mayRefer` names the provider or is `*`; a `mock` use of it; an `orderFaults` entry naming it, or, in an earlier module with no uses file, an import of it (`orderFault` `imports <file>:<line>`); a later module with no uses file that imports it, directly or through a module that re-exports it (its `why` saying `imports through <module>, which re-exports`), reads its files or starts its program, or every such module where the tool cannot tell. Point 4: a `packages` entry for a package whose version changed in `package.json` or its lockfile, or for the host (`node`, `workerd`) whose version changed in the facility list; and, on either, each module with no uses file yet. A new item tells no one, unless it changes what a name already used resolves to, found by lookup in the uses files and the providers' export lists, no user's code read: a name another module answers in the tables of operations (`<module> now answers the same name`), or a name reached through a module that hands the provider on by `export *` (`<provider> <name> now reaches it through a re-export`, with `resolves`); then that name's users are told. A module whose code or tests the merge changed is not told where the merged pull request's test record ran that module's whole tests on the merged result (`modules`, section 5).

## 7. A told job's related tests

The rule is the design's (part 2, section 7). The pieces are those of the files under the module's `files` and `tests`; a place belongs to the innermost piece holding its line; a call counts where the reader resolves it. The list is made on GitHub's merge of the pull request into its base, from the places the job block's `uses` names, out of the told module's uses file, and the lines the pull request changed. A `noUsesFile` or `whole` reason, and a reason that names no item (a `mock` or `package` reason), make every test file related, as does a module with no uses file; a line changed only in its comments or layout is not a changed line (the design, part 2, section 6); a file under `walk/internal/` or `walk/external/` never is. `related <pr>` prints each file with its cause, and the files left out; the test record's `why` counts them.

## 8. Unproven, and not settled here

1. Every form in sections 1 to 5 is built and has not run in a process in force. Not verified from GitHub's own pages: the size a comment holds, that a rewrite notifies no one, and that a locked issue still takes the sessions' writes.
2. Whether the owner can read the JSON records well enough on the page.
3. Sections 5's `uses`, 6 and 7 are built and pass the tool's own tests, the proof's 150 changes recorded again under them among those tests; none of it has run on a product.
4. What is read of the shared state to show that an account switch lost no work is not written (build text 4, stage 7).

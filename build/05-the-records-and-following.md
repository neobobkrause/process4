Length: 119 lines. Last section: "8. Unproven, and not settled here".

# Process4 build text 5: the records, and what the tool follows

Beside the design (`design/`, "the design"). **Status: proposed. Built in the tool, not run in a process in force; nothing is in force.** Its other sections: 5 in `05b-`; 6 and 7 in `05c-`. Every example is made up.

Marks: **Decided here:** a choice of this text; the owner or PROCESS can overrule any. **Unproven:** never shown to work.

## 1. The issue that carries the shared state

- One issue in the product's repository, titled `Process4 shared state`, with the label `process4-state`. Its body is two fixed lines: what it is, and that only the tool writes it.
- Each record is one comment, or more where it outgrows one. Its first line is the hidden mark `<!-- process4-record: <key> -->`. **Decided here:** after the mark comes one JSON block; a handover has its plain words after the block; an empty record is the mark and `{}`.
- Times are UTC, written `2026-11-20T09:00Z`. A session is named by the address its harness gives it. No record uses "@".
- **Finding it.** Once in a session the tool lists open issues with the label and takes the lowest number. `state write --create`, run by ROOT, makes the label, the issue and the comments of section 2 that are not a lane's, each empty, and locks the issue.
- **Reading.** One call lists the issue's comments, 100 to a page. The tool keeps those whose first line is a mark, with each comment's id. A missing key reads as empty. `state read [<record>]` prints one or all. With `--repository <address>` it reads the issue of another repository (section 4).
- **Writing.** `state write <record> --from <file>` sends the whole new body in one request to that comment. A key with no comment yet is created. A record of 60,000 characters or more is instead written in as many comments as it needs, each under 60,000: its longest list (`work`, `modules`) spread over them, the first holding the rest and `parts`, the count, each further one, marked `<!-- process4-record: <key>, part <i> -->`, the next items; it is read back as one. The tool prints the first comment's size and refuses no work for size; a record with no list, or one entry too large for a comment alone, cannot be written and fails plainly.
- **A failed write.** On a rate-limit answer the tool waits as GitHub says, or longer at each try, and tries again up to four times (the design, part 4, section 4; build text 1, section 3); the same on a server or network failure. A comment that is gone is made afresh. Anything else, or tries used up: exit 1 with GitHub's words, the record stays as it was, and the session reports a process fault.
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

**Waiting work.** What is placed against a module for its next job: a notice, a walk flaw, a flaw another module's job reported, and each interface change ARCH names in the work it places (`meaning`: the item, and one line of what it was and is now; the design, part 2, section 7). A requirement not yet met is not here; it is read from the requirements file. A notice's uses are not kept here but in the notice comments on the merged provider's pull request (section 5). `open --module` copies a module's entries into its job block, reading each notice's uses from those comments, and takes them out of this record. An entry that carries `uses` is read as it is.

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

## 8. Unproven, and not settled here

1. Every form in sections 1 to 5 is built and has not run in a process in force. Not verified from GitHub's own pages: the size a comment holds, that a rewrite notifies no one, and that a locked issue still takes the sessions' writes.
2. Whether the owner can read the JSON records well enough on the page.
3. Sections 5's `uses`, 6 and 7 are built and pass the tool's own tests; none of it has run on a product.
4. What is read of the shared state to show that an account switch lost no work is not written (build text 4, stage 7).

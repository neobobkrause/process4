Length: 59 lines. Last section: "5. The comments on pull requests: a job's three, a conversion's report, a declaration, and the notice's".

# Process4 build text 5b: the comments on pull requests

Section 5 of build text 5. Its other sections: 1 to 4 and 8 in `05-`; 6 and 7 in `05c-`. **Status: proposed. Built in the tool, not run in a process in force; nothing is in force.** The test record's hold on `ready` and `merge` is the design's (part 2, section 6). Every example is made up.

Marks: **Decided here:** a choice of this text; the owner or PROCESS can overrule any. **Unproven:** never shown to work.

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
- `notice_seq` (absent is 0) counts the notices `notify` has added while the job is open; `notices` holds each notice the block carries, `{ "from": <provider>, "merged": <pull request> }`, those `open --module` copied among them, so a second run for the same merge adds nothing. Each added notice puts its words in `work` and its reasons in `uses`; the kind stays. A block with no `notices` that names a notice in its `work` counts as holding it.
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

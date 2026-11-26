# `notify` cannot send five of civicsmith's conversion notices; R15's alias and member cases (26 Nov 2026, PROCESS #18)

Two process faults from civicsmith ARCH #28 via coordinator #10, 14:18Z, unchanged. Not yet researched: for PROCESS #19.

1. From the job jurisdictions #3 (PR 1691, merged): "R15 flags a list converted to an own alias (Value) but not to the same
   union spelled out, and a list passed as an argument but not one assigned to a Fields member."

2. Met by ARCH #28, Process4 1216397f, each `p4 notify` run alone on a 15 GB machine with 14 GB free: "`p4 notify` cannot
   send the notices for five of tranche t3's seven conversion merges. For pull requests 1689 (record-grammar), 1691
   (jurisdictions) and 1692 (civil-time) it fails with: Error: reading the product failed: ...
   tool/lib/notice/notices.mjs:14 process.stdout.write(JSON.stringify(mods.map((m) => notice(treeB, treeA, m.module, { ...
   RangeError: Invalid string length. The notices for every module are serialized as one JSON string, which passes the
   language's string limit. For pull requests 1688 (setup-words) and 1693 (calc-grammar) it prints: 'p4 notify: could not
   read the product within this machine's memory; nobody is told; the notice for pull request 1688 is owed' (likewise
   1693), run twice, the second time alone. Pull request 1694 (connection-grammar) notified fine (nobody told)."
   ARCH adds: the notices for 1688, 1689, 1691, 1692 and 1693 are owed; no job is open and none outside the eight starts;
   the notices only tell later modules' next jobs what to re-check.

Reading (not researched): (2) is a tool fault that loses notices (owed, recorded by ARCH, re-runnable once mended): the
child process's whole result is one JSON string; write it as one line per module, or in parts, and see why the
conversion merges read so much (decision 2-B1 should make a conversion that changed no item tell almost no one, so the
reading may be wider than needed). This is urgent for civicsmith's next merges. (1) looks a tool inconsistency in R15.
Both measured; put options to the owner with the group in `facility-names-26nov.md` (civil-time #3's items).

## Researched (worker), item 2 (26 Nov 2026)

civicsmith was not read. Everything below is measured on synthetic products of its shape, built by scripts in the
worker's scratchpad (not kept): 200 modules, the provider third in the order, 150 later modules importing it, of which 20
to 60 converted (a uses file written by the tool's own writer) and the rest with none. The merge is the provider's
conversion (job kind `conversion`). The before and after products are written to two folders of different names, as
`notify` writes them. Tools: 1216397 (what civicsmith ran), main at cb649ba (with 54d7eee's facility-name corrections),
and this branch.

### First: is a conversion that only states types read as changing items? Yes, by a tool fault (built, `de6d5eb`)

Case: the provider's code is the same text before and after but for JSDoc; it reads a file with no encoding
(`readFileSync(p).toString('utf8')`), runs `spawnSync(cmd, [], { encoding: 'utf8', maxBuffer })`, uses `Buffer`, and
has plain functions. Only types are stated.

| Tool | Items found changed | Told (of 150 importers) |
|---|---|---|
| 1216397 | `readText`, `run`: `type error in its code` | 150: 130 with no uses file (point 3, any change); 8 by a use of a changed item; 12 by a place outside the standard |
| main (cb649ba) | none | 0 |
| 1216397 with only the rule below corrected | none | 0 |

So on 1216397 all 150 told modules are told only because the conversion was read as changing an item; none would be told
otherwise. The cause: 1216397's host description had no `Buffer` (a file read with no encoding handed back a
`Uint8Array`, whose `toString` takes no argument: TS2554) and no `maxBuffer` in spawn's options (TS2353). The code had
those errors before the conversion as well; the conversion only took away the checker's "Parameter 'p' implicitly has an
'any' type" (TS7006) by stating the type. `compareItem` counted any difference in the item's list of errors as
`type error in its code`; build text 2b, section 6 says "a new error, or any change to its code while it has one". An
error gone is no new error, and the code (comments left out) is the same. With the item counted changed, `hearsAny` is
true and the conversion tells every module with no uses file that imports the provider (design part 2, section 7, point
3, which a conversion tells "only where an item changed").

Main tells nobody in that case because 54d7eee describes `Buffer` and spawn's options, so those errors are gone. It still
has the rule's fault: with a lasting error of the code's own (`const n = 1; return n.toUpperCase() + p;`, TS2339 before
and after), a conversion stating `p` tells all 150 on main, as on 1216397. `de6d5eb` counts only a new error, or a
change to the code while it has one: that case tells nobody, on main's code and on 1216397's alike; a new error the
stated types bring, or the code changed while it has one, still tells.

Not a source of change, by the code and measured: the means name files relative to the product (`pathOf`, `rel`) and
channels by what the code writes (`node:fs (readFileSync)`), so the two folders' different paths change no item; the
facility names that 59fa682 corrected are written only into uses files (`refs.mjs`), which `notify` reads as a lookup
and never compares; `means.mjs` is the same at 1216397 and main. Describing a kind or function (types stated where the
checker read any value) is read as no change on both tools: a conversion of record kinds and a node union with no bound
line tells nobody on 1216397 and on main.

How many of civicsmith's 130-odd told modules were told this way is unknown (civicsmith not read); any of its early
providers whose code used a file read with no encoding, `Buffer`, or spawn's later options, or had any lasting type
error, would have been read so on 1216397. Running `notify` again on this branch's tool shows it.

### (a) The two failures, measured

1. **The notices as one text pass the longest string (1689, 1691, 1692).** The child wrote all notices as one JSON text,
   and each told module's reasons carried a copy of the changed item's `before` and `after`, which held what the item
   accepts and hands back with each kind written out in full. A provider of 24 functions over record kinds (6 kinds of 6
   fields naming one another and a union `Node` of 4 node kinds whose fields name `Node` again, as a grammar's nodes
   do) and one `@bound` line on two kinds: each function's `after` 5 MB. Size = the items' forms once, plus for each
   told module with a uses file, each changed item it uses times that size; the 130 modules with no uses file add
   60 KB in all. 30 converted users: 453 MB, passes. 60 converted users: `RangeError: Invalid string length` at
   `notices.mjs:14`, civicsmith's own failure, after 76 s.
2. **The reading does not fit (1688, 1693).** Not both products loaded whole (`loadTree` reads file lists), and not
   per-user work (a lookup in uses files). It is the provider's means on the after side: a conversion states the types
   for the first time (the before side, with none, is small), and the canonical form writes each kind out in full
   wherever it appears, cut only where the same object kind comes round again on its path, so kinds that name each
   other give about five times more for each kind in the cycle; every item's form was held whole. The 30 functions'
   means, after (K node kinds):

   | K | written out | held, 1216397 / main | peak resident | time | held, this branch | time |
   |---|---|---|---|---|---|---|
   | 3 | 35 MB | 88 MB | 255 MB | 3 s | 36 MB | 2.4 s |
   | 4 | 175 MB | 343 MB | 893 MB | 17 s | 25 MB | 12 s |
   | 5 | 948 MB | 1,757 MB (out of memory at 1 GB) | 4,092 MB | 113 s | 23 MB (fits 1 GB) | 71 s |
   | 6 | 5,292 MB | out of memory at node's default heap (8 GB), after 437 s | | | 23 MB at the end; fits node's default heap (8 GB, peak 7.8 GB resident), not a 2 GB one | 477 s |

   At K=4 the forms are 7.8 million parts of which 671 are distinct. That 1688 and 1693 fail in the reading and 1689,
   1691 and 1692 in the writing fits forms somewhat larger in the first two; which of civicsmith's kinds are how large is
   unknown.

### (b) Against the design

- `de6d5eb` above: against build text 2b, section 6 (`type error in its code`: "a new error, or any change to its code
  while it has one"), and so against design part 2, section 7, point 3 at a conversion.
- `f330aa2`: a reason's `changes` are "the parts of the means that differ" and its `before` and `after` "the parts that
  differ" (build text 5, section 5); describing "is no change" (design part 2, section 7). `partsThatDiffer` compared
  the written forms, so at a conversion that changed a bound, `changes` said `bound changed` while `before` and `after`
  also carried what the item accepts and hands back, written out in full, and errors gone. This made the reasons large.
- As the design asks, not a fault: a conversion that adds a `@bound` line changes each item whose bounds take it in
  (rule 3: "A change to those words is a change to the interface"), so it tells as any merge, every unconverted
  importer included (point 3). One bound line at an early provider's conversion runs the whole tests of every
  unconverted module that imports it.

### (c) Commits on `work/notify-size`

1. `60ef88b` The child writes its notices into a file of JSON lines: the report, one line for each changed item (its
   `before` and `after` once), one for each told module (its reasons name the item's line); `notify` reads it a part at a
   time and links each reason back to the item's own objects. No answer changes: read back, identical text for text to
   the old output where that fit (453 MB); where it failed, 120 MB, longest line 5 MB, read in 0.3 s.
2. `f330aa2` (tool fault) A reason's `before` and `after` hold only the parts its `changes` name, as they were and are.
   Same told modules (150) and reasons (360); the failing case's notices 120 MB to 153 KB, longest line 2 KB.
3. `4dbbe3c` Equal parts of the canonical forms kept once (`canon.mjs`), the kinds each item names read once per item
   (`means.mjs`, a third of the time), `known` and `byName` worked out once per part (`notice.mjs`). The forms are the
   same values (the same hash of every item's means at K=3, 4, 5); the notices byte for byte those of commit 2. A K=5
   conversion end to end (200 modules, 150 told) within a 2 GB heap: 256 s, peak 2.6 GB resident, notices 118 KB.
4. `de6d5eb` (tool fault) A type error gone, or one the code still has with its code the same, is no change. Changes who
   is told, as the design asks: above.

### Not built: an option for the owner

The time still grows about six times for each kind in a cycle (K=6: 8 minutes for the after side's means), as each form
is still built path by path and compared as text. Cutting a cycle also where a named union comes round again, as
`canon.mjs`'s own comment says ("a cycle is cut at a name"), measured in a scratch copy: K=4 175 MB to 53 MB written,
20 s to 5.6 s; the 150-change replay passes. It writes the forms differently (the reasons' words and before and after),
so it is the owner's choice, not a correction.

### (e) Unknown

- civicsmith's own case: which of its told modules were told only by the type-error rule, and how large its kinds'
  forms are; so whether 1688 and 1693 now fit, and in what time. `notify` 1688 to 1693 run again on this branch shows
  it; the five notices are owed and nothing else is lost.
- Whether its conversions changed items otherwise (bound lines, errors or channels from changed code): those tell as
  before.
- What makes the K=6 reading's passing peak exceed 2 GB on this branch, though it ends holding 23 MB: not measured. The
  comparisons and the sorting of a union's members still write each form out as text (one K=6 item: 176 MB), several
  at a time.

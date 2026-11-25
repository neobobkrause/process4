# Who is told when an earlier module changes: how the tool decides, what is wrong, and a plan (25 Nov 2026)

Status: research for the owner, by a worker of PROCESS #14. Nothing is changed. Read at origin/main b798e6a.

The owner's concern: "the reason that the length of notices are overflowing is because the process for determining which
modules need to be told when an earlier module changes is broken." His rule (design part 2 §7): "any change to either a
provider's domain or range necessitates that its users be retested. But if both domain and range stay the same, then no
retesting of users is needed"; who is told: "ideally only the users of the entry that changed".

How sure each part is: **proved** means read in the code and shown by running it; **reproduced** means shown on a made-up
product under `/tmp`; **measured on civicsmith** means a number civicsmith's ARCH reported (cited from earlier research);
**inference** means reasoning not yet shown.

## Short answer

The tool tells too many for one main reason with two halves. First, it decides "something changed" by comparing two
written descriptions of a module (its listing), not what actually crosses between modules. On civicsmith, comments are
being written for the first time, so the description changes when the code does not. Second, when the tool cannot follow
a user's code, it tells that user. In plain JavaScript almost no user can be followed, so each false change reaches
nearly every later module. Several separate faults in the code make both halves worse. The same causes also make the
tool miss a few users it should tell.

## 1. How the tool decides today

### 1.1 The steps, in words

```
merge of module P
   |
   v
(a) Which modules' files changed?  -- none --> "nobody is told"
   |
   v
(b) Write P's listing before and after.  -- same --> "nobody is told"
   |
   v
(c) Find later modules whose listing may change "through" P
    (their own files did not change, but they pass on a kind of P).
    Write their listings before and after too.
   |
   v
(d) For each entry that differs, give it a word:
    removed / cannot stand in / hands back differently / bound changed /
    declaration changed (not classified) / parameters moved  --> tells its users
    new entry / accepts more (confirmed) / an "anything" now stated  --> tells nobody
   |
   v
(e) For each later module U, for each changed module M (P or one changed through it):
      route 1: U's code uses a changed entry that tells          --> U told ("uses ...")
      route 2: U declares M, U is "not followed fully",
               and some entry of M tells                          --> U told ("not followed fully")
                  - a changed kind: always
                  - a changed function, value, method or member: only if
                       U's files contain that name anywhere (any text), or
                       U reaches M by a route the scan cannot read, or
                       a module U reaches hands it on or takes M whole
      route 3: a new operation whose name another module answers  --> that operation's users
   |
   v
(f) A told module with an open job: the notice goes into its job block.
    Otherwise: reasons on the merged pull request, one line in waiting work.
```

### 1.2 What counts as a change to a provider's listing

A listing is written by TypeScript's reader from the module's interface files: for each export, what it accepts, what it
hands back, its `@bound` lines, its `@throws` kinds, and the printed declaration as a backstop. Two listings are compared
entry by entry (`diffListings`, `tool/lib/notice/notice.mjs:104-192`). An entry tells its users when what it accepts can
no longer stand in for the old one, when what it hands back differs, when its error kinds differ, when its bound words
differ, or when nothing else differs but the printed declaration does (the backstop, `notice.mjs:174-178`). Two softenings
are built: a confirmed "accepts more" tells nobody (the checker is asked only when the tool's own comparison already says
"accepts more", `notice.mjs:373-381`), and a place that was "anything" before and is a stated kind after is not counted
(`known`, `knownDecl`, `notice.mjs:61-101`). A module's first comments tell nobody only where the module had no interface
comments at all before and the whole merge changed comments only (`notice.mjs:355-363`).

### 1.3 How users of a changed entry are found

Every later module is a possible user, declared or not. The tool reads each one's source and tests "before" and asks the
type checker what each name, member read, object field and call argument resolves to; a place that resolves inside a
changed entry is a use (`usage.mjs:86-213`). To save memory it reads only later modules that can reach P: by relative
import paths followed file to file, by declaring P, or by having an import it cannot follow (`staged.mjs:232-257`). Later
modules whose listing may change "through" P are found the same way, by relative paths from their source files only
(`staged.mjs:235`).

### 1.4 When a user is "not followed fully", and what it is then told

For a provider U declares, any of four causes (`notice.mjs:446-451`): (1) U declares P but no use is found; (2) U reads or
calls a value of unknown kind ("anything") **anywhere in its files**, unless it comes from outside the product; (3) an
operation name it cannot read, where P has operations; (4) a table name it cannot read, where P has tables. Cause 2 is
about the whole user, not about P: one untyped parameter read anywhere makes U not followed for every provider it
declares. Such a user is told of every changed kind of P that tells anyone, and of a changed function, value, method or
member only under the narrowing 3B (`narrow.mjs:86-95`), shown in route 2 above.

### 1.5 Every route by which a module ends up told

1. It uses a changed entry of P that tells (named in its code or comments, or reached by member, field or argument).
2. It uses a changed entry of a later module whose listing changed through P.
3. It is not followed fully for P, or for a module changed through P, and that module has a telling change it may use.
4. A new operation's name is answered by a second module.
5. The merge changed several modules: each is run as its own notice, so one user can be told more than once.

## 2. The flaws

Ranked by how much over-telling each is known or likely to cause on civicsmith. "Rule" means the owner's rule as the
design states it. "Implementation" means the code does not do what the design says; "wording" means the design's own text
asks for the telling.

### F1. A description written for unchanged code counts as a change (largest)

- **What happens.** When a function that already worked gets its first `@throws`, its first `@bound`, a named kind for a
  shape the reader had guessed, or a stated kind where the reader had guessed one other than "anything" (for example
  `null`), the listing differs. Its users are told, and the difference passes on through every later module that hands
  the value on.
- **Cause in the code.** `notice.mjs:165` (`bound changed` on any bound difference, including none → one), `:167` (error
  kinds part of "hands back"), `:174-178` with `knownDecl` `:75-101` (the backstop accepts only "`any` became one kind";
  a shape written out before and named after, `{ name: any; }[]` → `Call[]`, is "declaration changed"), `known` `:61-69`
  (only `any` counts as unknown; an inferred `null` or `{}` stated later is a change). The first-comments exemption is for
  a whole module with no comments at all and a comments-only merge (`:355-363`).
- **Size.** Measured on civicsmith: setup-words 1356 told 197; ARCH's quotes showed the telling entries were `word`,
  `localize`, `callsOf`, `extract`, whose code did not change, given first `@throws`/`@bound` comments
  (`notify-1356-still-197-25nov.md`). jurisdictions 1404, comments only, told about 150; membership's first comments
  told 140. Reproduced: on the made-up product (48 users), a first `@throws` on unchanged `word` told 24 (12 callers, 12
  others), a first `@bound` 24, and naming an inferred shape in `callsOf` told 18, with the "declaration changed" word
  rippling into all 6 modules that pass `callsOf`'s answer on. With the 2C+ prototype each became 0.
- **Rule or wording.** The first `@throws`/`@bound` part is the design's wording (point 3: "A change to those words is a
  change to the interface"; "Any other difference in the same entry tells as before"); it is choice 2 on the owner's
  page. The backstop part is an implementation fault against the design's own sentence "Describing an entry is not
  changing it, and tells no one". The `null`/`{}` part is wording: the design names only "anything".

### F2. "Not followed fully" covers almost every plain-JavaScript module, for every provider it declares

- **What happens.** Cause 2 fires on any untyped parameter whose member is read, anywhere in a module's source or tests,
  and makes the module not followed for every provider it declares, whether or not that value has anything to do with
  that provider. Such a user is told of every telling change to a kind, with no narrowing.
- **Cause in the code.** `usage.mjs:199-204` (any "anything" read or called), `notice.mjs:449` (the cause, per user, not
  per provider), `narrow.mjs:89` (kinds always tell).
- **Size.** Measured on civicsmith: test-support 1350 told about 125, about 120 of them only because they were not
  followed (before 3B); setup-words 1356 printed 1,785 "not followed" lines, 194 of 197 users not followed. Reproduced:
  30 of 48 made-up users were not followed because of one `opts.limit` each. A real kind change still told them all
  (that part is right: they use the kind).
- **Rule or wording.** Wording (build text 5 §6 cause 2; design point 2, "told of every change to a kind").

### F3. The narrowing 3B is defeated by routes the scan calls unreadable

- **What happens.** 3B tells a not-followed user of a changed function only if it names the function or reaches the
  provider by an unreadable route. Four kinds of import count as unreadable, and any one **anywhere in what the user's
  files reach, in any module**, makes the user "opaque" for **every** provider:
  1. an import by the product's own package name (`civ/words`) or by its imports map (`#util`);
  2. an `import()` or `require()` of a computed path, for example a test helper's loader;
  3. the words `require(` or `import(` in a prose comment;
  4. an own-name `import('civ/x')` inside a JSDoc kind.
- **Cause in the code.** `staged.mjs:62` returns "cannot follow" for an own-name or `#` import, though `check.mjs:599-620`
  and `uses.mjs:16-60` each follow it with their own resolver (the tool audit's NA1: three resolvers); `staged.mjs:37,71`
  tests the whole text, comments included; `narrow.mjs:61-62` treats any unreadable import in the closure as hiding P.
- **Size.** Reproduced: on the made-up product, the 6 users that import by the product's name and the 6 whose tests import
  a helper with a computed loader were each told of every changed function (12 of 12), while the 6 plain users without
  such a route were told of none. All four kinds were confirmed unreadable by the tool's own scan. On civicsmith:
  unmeasured. Whether civicsmith imports itself by name, or has a computed loader in test-support (second in the order,
  imported by nearly every module's tests), decides whether 3B saves anything there (inference).
- **Rule or wording.** Kinds 1, 3 and 4 are implementation faults: the tool can follow them, and the design names only
  imports "the scan cannot follow". Kind 2 is the design's wording ("anywhere in what U's files reach"). By the design's
  own order rule a module may use only modules before it, so an unreadable import in a module before P (or inside P)
  cannot hide a route to P; the wording does not use this.

### F4. The narrowing matches names as plain text, so a module's own names count

- **What happens.** "Its files name that entry" is tested by whether the identifier appears anywhere in the user's
  files, comments and strings included. Every civicsmith module has its own `DECLARED_OPS`; short names such as `build`,
  `word`, `extract` are common. A module's own `DECLARED_OPS` makes it "name" every other module's `DECLARED_OPS`.
- **Cause in the code.** `narrow.mjs:43-50` (`namesIn`), `:90`.
- **Size.** Reproduced: 6 made-up users that import only `rows` from a module whose `DECLARED_OPS` changed were all told
  because each defines its own `DECLARED_OPS`; renamed, none was told. On civicsmith: unmeasured; ARCH's report of 1356
  shows every module's `DECLARED_OPS` among the changed entries, so it may be large once F1 and F3 are mended (inference).
- **Rule or wording.** Implementation: the user's own declaration does not name the provider's entry.

### F5. Changes pass "through" every module that hands a kind on

- **What happens.** A later module whose listing changes because it passes on a kind of P counts as changed; its users and
  its not-followed declarers are told. When the change in P is real, this is the rule working. When it is a description
  (F1), the false change is multiplied by the number of passers.
- **Cause in the code.** `notice.mjs:398` and `:428-458` (users of every changed module, not only P).
- **Size.** Measured on civicsmith: 1356's first run, 164 listings changed through setup-words; second run, 90. Why 90
  still changed is not known (inference: F1's backstop or a `null` stated, as reproduced with `callsOf`).
- **Rule or wording.** The rule (design part 2 §7 "in every later module whose listing passes it on"); the multiplier is
  harmful only through F1.

### F6. In plain JavaScript an added parameter reads as "newly required"

- **What happens.** `build(list)` → `build(list, upTo)`, both untyped, is "cannot stand in" and tells. TypeScript itself
  lets callers leave an untyped parameter out, and its checker finds the new function assignable to the old, but the
  checker is asked only when the tool's own comparison already says "accepts more".
- **Cause in the code.** `canon.mjs:163-172` (`paramOptional` does not see that an untyped JavaScript parameter may be left
  out); `notice.mjs:373-376`.
- **Size.** Reproduced: 12 told, none a caller. With the checker asked: 0. In the proof's 150 answers, asking the checker
  removes T10's 3 notices for nothing (`Door.call` gained an operation name), with no user missed. On civicsmith:
  unmeasured (1350's "added an optional `upTo`" was not the telling entry; its `registerDeclared` really changed).
- **Rule or wording.** Implementation, against "Accepting more tells no one" and point 7.

### F7. A value from the language's own library counts as "unknown"

- **What happens.** `JSON.parse(text).rows` makes a module not followed, though the design excepts a value from outside
  the product. Only Node's names and imports by package are excepted.
- **Cause in the code.** `usage.mjs:50-61` (`externalRoot` does not treat the language library, e.g. `JSON`, as outside).
- **Size.** Reproduced: 6 of 6 carefully typed made-up users became not followed; they were told only where they really
  used the changed entry. On civicsmith: unmeasured.
- **Rule or wording.** Implementation.

### Misses (users that should be told and are not)

- **M1. A module that imports P by the product's own name is never "changed through" P.** Its listing is not compared,
  so its own users are missed. Reproduced: with a real change to `Row`, the 6 own-name importers that hand `Row` on were
  left out of the changed modules. Cause: `staged.mjs:235` follows relative paths only. Implementation.
- **M2. A real change hidden under "anything".** `build` changed from a list to a text; both read as "anything", so the
  listing did not change and nobody was told. Reproduced. This is the design's accepted miss: a plain-JavaScript module
  without comments has no interface the tool can compare.

### Not a flaw found

- The first-comments rule for a whole module works as written (reproduced: stated kinds only, nothing else, told 0).
- Decision B ("anything" → stated) works in the structured comparison (reproduced).
- A followed user of a changed entry is told at the entry, as the owner's rule says, not finer.

## 3. Root cause

One design-level cause, made worse by several independent faults.

- **The trigger compares descriptions, not what crosses.** A listing is what the reader knows about a module. On a product
  being described for the first time, the reader's knowledge changes far more often than the values that cross between
  modules. Every rule built to soften this so far (decision B, the first-comments step, 2C+) is a patch on the same point:
  a difference in the description of code that did not change.
- **The fallback for code it cannot read is "tell", applied to the whole user.** One unknown value anywhere makes a user
  unknown for every provider it declares, and unreadable imports anywhere make it unknown everywhere.
- These multiply. Told users ≈ (entries falsely judged changed, multiplied by the modules that pass them on) × (nearly all
  later modules, since nearly all are not followed). Mending either factor cuts the product sharply. Mending both, with
  the implementation faults F3, F4, F6, F7 and M1, is what the prototype below did.

The overflowing notices follow from this: each told module is one waiting-work entry and one set of reasons, so a few
hundred told modules per early merge, times about 70 queued merges, outgrows any comment (inference from the counts in
`waiting-work-record-size-25nov.md`; choice 6, a record in parts, is still needed, since the record grows with merges even
when telling is right).

## 4. A plan

Four options. Each "costs" line is the tool work; each is proven the same three ways: the proof's 150 recorded answers
(`tool/test/fixtures/notice-proof`, whose `needs` say who really needed a change), the made-up civicsmith-shaped
product, and a read-only measurement on civicsmith (section 5).

**What the prototype showed** (switches in a scratch copy, all off by default; details in the appendix):

| | Proof: told / told without need / needed and missed / answers changed | Made-up product, told in 7 changes (sum) |
|---|---|---|
| Now | 116 / 62 / 45 / 0 | 192 |
| A. 2C+ only | 115 / 61 / 45 / 1 (Z19) | 114 |
| B. Faults mended (F3 kinds 1, 3 and 4, plus the order rule; F4, F6, F7, M1) | 114 / 60 / 45 / 1 (T10) | 126 |
| C. B and 2C+ | 113 / 59 / 45 / 2 (Z19, T10) | 78 |
| D. C, and a not-followed user told of a changed kind only where it names the kind or a member | 113 / 59 / 45 / 2 | 54 |

In C and D every remaining told made-up user really uses the changed entry; no option missed a user the proof says needed
a change. The proof's product is mostly commented, so it shows little saving; its value here is that nothing that
mattered was lost.

### Option 0. No change

Every early merge keeps telling most of civicsmith: about 120 to 200 told jobs, at about $1.40 to $1.90 each, most
closing with nothing to change. The waiting-work record and job blocks keep overflowing. Not recommended.

### Option A. Choice 2C+ alone (already on the owner's page)

- **Changes.** Design part 2 §7 and build text 2b §6: on an entry whose own running code is unchanged, a first `@throws`
  or first `@bound`, the declaration backstop and an unconfirmed "accepts more" tell no one. Tool: a digest of each
  entry's own code (`listing.mjs`), used in `diffListings`.
- **Costs.** Small; the prototype exists (`first-comments-2c-25nov/prototype.diff`).
- **Risks.** A first bound written to tighten unchanged code, or a narrowing stated on unchanged code, tells no one; the
  user's own check finds it at its next job. A change inside a helper the entry calls still tells.
- **Proof.** 1 answer changes (Z19, needed by no one).

### Option B. Mend the faults against the rules as written

- **Changes.** No change to the owner's rules except one sentence on the order rule. Tool: (1) one resolver for imports
  by the product's own name and imports map, shared by the notice, the check and `uses` (F3, M1; audit NA1, U1); (2) read
  imports from code and JSDoc kinds, not from prose comments (F3); (3) an unreadable import counts only where it sits in the
  user or in a module after P, since by the design's order rule nothing before P can reach P (F3; a sentence in build
  text 5 §6 and design point 2, for the owner); (4) "names the entry" excludes the user's own declaration of the same name
  (F4); (5) ask the type checker also where the tool's own comparison says "cannot stand in" (F6; build text 2b §6); (6) a
  value from the language's own library is from outside the product (F7).
- **Costs.** Medium: about six small changes in `staged.mjs`, `narrow.mjs`, `usage.mjs`, `notice.mjs`, `canon.mjs`, with
  tests. The resolver is the largest (the audit rated it medium).
- **Risks.** The order rule trusts the module order; a use made against the order is a design error the check already
  refuses in declarations, and is then caught by the user's own tests. The name test (4) can miss a user that declares a
  name equal to the provider's and also reaches it by an untyped value; accepted as the design accepts a missed user.
- **Proof.** 1 answer changes (T10, 3 notices for nothing gone). Made-up product: own-name and helper-loader users are
  narrowed like plain users; own-name passers now count as changed through.

### Option C. B and 2C+ together (recommended)

- **Changes, costs, risks.** The sum of A and B. Both carry out what the owner has already said: "describing is not
  changing" and "ideally only the users of the entry that changed".
- **Proof.** 2 answers change (Z19, T10), neither a user that needed telling. On the made-up product, 192 told → 78, and
  each of the 78 uses the changed entry.

### Option D. C, and narrow the fallback itself

- **Changes.** Design point 2: a user not followed fully is told of a changed kind only where its files name the kind or
  one of its members, or reach P by an unreadable route (as functions are already, under 3B). A further choice, not
  prototyped: cause 2 counts only unknown values that can come from P (an import of P, a call into P), not the user's own
  untyped parameters.
- **Costs.** Small for the kind narrowing (prototyped); medium for the per-provider cause 2.
- **Risks.** Larger: a user that receives a P value through an untyped path and reads a member under a name it never
  writes (a built name, a spread) is missed until its own tests or a walk.
- **Proof.** The proof cannot test it (its one not-followed user is `reports`): no answer changed. On the made-up
  product, a first bound on a kind told 24 → 0. Needs the civicsmith measurement before it is put.

### Not proposed

Comparing the values that really cross (running providers and recording what they hand back) would answer the root cause
directly, but it is a test of users, which the design rules out ("It is a notice, not a test"), and is far larger.

### Recommendation

**Option C**, built after the cleanup with choice 6 (the record in parts), proven on the 150 answers and the made-up
product, then measured read-only on civicsmith (section 5) before civicsmith moves. Decide D only after that measurement
shows how many told modules C leaves, and why.

## 5. What only civicsmith can show, and a brief for a read-only session there

PROCESS cannot read civicsmith. These are unknown until measured there: how many modules import civicsmith by its own
name or through an imports map; whether test-support (or another widely reached module) has a computed import; where
test-support and setup-words stand in the order; how many modules define the same names (`DECLARED_OPS`); why 1356's
second run still changed 90 listings through setup-words; and, for C and D, how many of each merge's told users would
remain. These decide whether C is enough.

### Draft brief (for a session the owner starts in civicsmith; it writes nothing to GitHub and changes no file in the repository)

> Read-only measurement for Process4's PROCESS. Do not run `p4 notify`, `p4 open`, `p4 state write` or any command that
> writes to GitHub; do not push or commit. Work under `/tmp` only.
>
> 1. Clone the tool twice under `/tmp`: Process4 at the commit civicsmith's `process.json` names, and Process4 at the
>    branch PROCESS names for the prototype (switches `P4_PROTO` and `P4_OWNCODE`, off by default). In each, run
>    `cd tool && npm ci`.
> 2. For each merge — setup-words 1356, test-support 1350, jurisdictions 1404, record-grammar 1339 — find the merge commit
>    (`gh pr view <n> --json mergeCommit`, a read), its first parent, and the modules whose files it changed. Write both
>    commits out with `git archive <sha> | tar -x -C /tmp/m<n>/before` (and `after`).
> 3. Run the notice without GitHub, as notify's reading does:
>    `echo '{"dirB":"/tmp/m<n>/before","dirA":"/tmp/m<n>/after","mods":["<module>"]}' | node --max-old-space-size=<3/4 of memory> /tmp/<tool>/tool/lib/notice/notices.mjs > /tmp/m<n>/<config>.json`
>    for these configurations: the current tool; `P4_OWNCODE=2C+`; `P4_PROTO=ownname,order,names,lib,jsopt,scan`; both;
>    both plus `kinds`.
> 4. For each output, report: the number of changed listings and of telling entries, by word; the number told; each told
>    user split into (a) uses an entry of the provider, (b) uses an entry of a module changed through it, (c) told only as
>    not followed; for (c), which of the four causes, and whether it was kept by a name match (which name) or by an
>    unreadable route (which file and which kind of import). PROCESS supplies a short read-only script for (c), which calls
>    `makeNarrow(...).opaqueWhy` and `namesIn` on the same two folders.
> 5. Also report: the modules whose files contain an import by civicsmith's own name or by `#`, and a computed `import(` or
>    `require(`; the position of test-support and setup-words in the order; the modules that export `DECLARED_OPS`.
> 6. From GitHub (read only): of the told jobs that 1356, 1350, 1404 and 1339 started, how many merged a change and how many
>    closed with nothing to change. This is civicsmith's own "needed" count.
> 7. Send the counts to PROCESS through the coordinator, unchanged. Stop.

Cost: four merges × five readings, each up to about 45 minutes for an early provider on civicsmith (1339 took 43 minutes),
so a few hours of one session; nothing it does is seen by the product's other sessions.

## Appendix A. The made-up product and the runs

Under `/tmp/whotold/` (scratch; gone at the next restart). `gen.mjs` writes a product named `civ` with `package.json`
`exports` for `./*`: `support` (a test helper with `await import(p)`), then `words` (a typedef `Row` with comments already,
`WORD_ROWS`, `word`, `localize`, `build`, `callsOf`, code with prose comments only), then six each of: A plain users of
`WORD_ROWS` with one untyped `opts`; B callers of `word`; C as A but importing `civ/words`; D as A with a test importing
`support`; E fully typed, only `JSON.parse` unknown; F fully typed; P passers (own `DECLARED_OPS` with `word(...)`,
`rows()` handing `Row[]` on, `calls = callsOf(...)`); Q plain users of one P, each with its own `DECLARED_OPS`. 48 users.
`run.mjs` calls `notice(loadTree(before), loadTree(after), 'words')`, the function notify runs in its child process.

Told, of 48, by change and configuration:

| Change to `words` (code unchanged unless said) | Now | 2C+ | B | C | D |
|---|---|---|---|---|---|
| body of `word` reworded, same behaviour | 0 | | | | |
| `word` gets `@param`/`@returns` only | 0 | | | | |
| `word` gets a first `@throws` | 24 | 0 | 12 | 0 | 0 |
| `word` gets a first `@bound` | 24 | 0 | 12 | 0 | 0 |
| `build` gets an untyped second parameter | 12 | 12 | 0 | 0 | 0 |
| `Row` gains an optional field (real) | 42 | 42 | 42 | 42 | 42 |
| `Row` gets a first `@bound` | 42 | 30 | 42 | 24 | 0 |
| `word` may now hand back null (real; from a commented `word`) | 30 | 30 | 12 | 12 | 12 |
| `callsOf` described, a new `Call` kind named | 18 | 0 | 6 | 0 | 0 |

In the real changes, C leaves exactly the users that use the changed entry (12 callers of `word`; 42 users of `Row`
through `WORD_ROWS` and the passers). `build(list)` → `.join(" ")` (a real change under "anything") told 0 in every
configuration (M2).

Proof replay (`replay.mjs`, the same reading as `test/notice-replay.mjs`'s `answer`, notice only, against `expected.json`;
about 47 s each): numbers in section 4. With every switch off, 0 answers differ from those recorded. Z19 (`front` not told
of a first `@bound` on unchanged `isEmail`; needs none) and T10 (`billing`, `front` not told of `Door.call` accepting one
more operation name, confirmed by the checker; needs none) are the only changes.

## Appendix B. The prototype switches (scratch, not committed)

Diff at `/tmp/whotold/proto.diff` against b798e6a (scratch; PROCESS would rebuild it on a work branch if C is chosen).
`P4_OWNCODE=2C+` is the earlier 2C+ prototype unchanged. `P4_PROTO`:

- `ownname`: `makeReach.resolve` asks TypeScript's resolver (`ts.resolveModuleName`, the reader's own settings) for an
  own-name or `#` import before calling it unreadable (`staged.mjs:62`).
- `scan`: imports and computed imports are read with prose comments removed; JSDoc blocks with kind tags are kept
  (`staged.mjs:71`).
- `order`: the closure records which files hold an unreadable import; one counts only in a module after the provider, or
  in no module (`narrow.mjs:62`).
- `names`: `namesIn` drops a name the user declares itself (`const`, `let`, `var`, `function`, `class`) unless an import
  clause in its files also names it (`narrow.mjs:46`).
- `lib`: `externalRoot` treats a declaration in the language's own library as outside the product (`usage.mjs:54`).
- `jsopt`: an entry whose only word is "cannot stand in" is put to the checker; confirmed, it is "accepts more" and tells
  nobody (`notice.mjs`, before the rule-52 loop).
- `kinds` (option D): a changed kind or handle kind tells a not-followed user only where its files name the kind or a
  field written in its before or after, or it reaches the provider unreadably (`narrow.mjs:89`).

## Appendix C. Sources read

Design part 2 §7; build texts 2b §5-6, 5 §6, 1b command 11; `tool/lib/notify.mjs`, `notice/notice.mjs`, `narrow.mjs`,
`staged.mjs`, `usage.mjs`, `listing.mjs`, `canon.mjs`, `ts.mjs`, `notices.mjs`; research `notify-1356-anything-to-stated`,
`notify-1356-still-197`, `not-followed-told-everything`, `notify-rerun-repeats`, `waiting-work-too-large`,
`waiting-work-record-size`, `first-comments-2c-25nov/`, `narrowing-decision-2-25nov/`, `cleanup-audit-25nov/tool.md`
(NA1, NT1, NT2, U1).

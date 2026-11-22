# Research: tests that refer to a later module (22 Nov 2026)

Recorded by PROCESS #6 before proposing (rule 3). Source: the owner, 22 Nov 2026, in PROCESS's session
(conversation): "Something to note in civicsmith-copy that needs to be fixed... There are 4 modules that
T53 under process3 was stopped while working on. Beyond the problems that process3 had, one thing that
was being struggled with is that the tests for some modules referred to other modules that were later
in the order. So there are cyclic references among the 4. That needs to be identified and fixed,
otherwise process4 runs the risk of similarly getting stuck. How should process4 running
civicsmith-copy development resolve this issue?"

## What is known, and what is not

- The first read-only reading of civicsmith-copy's main (21 Nov) found no module importing a later one
  and no cycle between modules. It counted relative imports only (17,839), source and tests. It would
  miss a reference by package name across the eleven npm packages, a started process or worker, a
  config naming another module's entry, or a fixture read from another module's folder.
- T53's branch (2,030 commits) is not in civicsmith-copy, and by the owner's decision of 22 Nov
  development starts from main. So what he describes may be on T53 only, or on main in a form the first
  reading missed. Not known until read. The second reading's prompt gains an item for it (the lane).
- Which four modules: not known here.

## What the design already says

- A module may use only modules before it; a use of a later module is a design error, corrected by
  reshaping the code without changing what it does (part 2 section 1).
- Module tests include a check that a module's declared uses match its imports, and it reads the test
  files as well as the source (part 2 section 6). So a test that imports a module the entry does not
  declare fails that module's own run, at its job, with the import named.
- A job writes only its own module's files. A job stopped by another module reports to ARCH, records
  that it is blocked, and frees its slot; other work goes on. Blocked twice by the same module, the
  boundary is an architecture bug and ARCH corrects the module list or the interface (part 2 sections 3
  and 8; part 4 section 10). So a round is not held: a blocked module's work carries over (part 2
  section 4).
- "A chain of notices ends of itself, because a module is used only by modules after it" (part 4
  section 10). The order rule is what makes that true.

## The hole, read in the tool and build text 2

The tool reads the order (`tool/lib/config.mjs`) but nothing in it compares a module's `uses` with the
order. Build text 2 section 3 says so: "a job may change the `uses` of its own entry ... Costs: a job
adding a use of a later module is caught only by ARCH's reading." So the cheapest way for a job to make
the declared-uses check pass, when its test reaches a later module, is to declare that module. The
check then passes, the order rule is broken, and with 178 modules ARCH's reading is a weak catch. It
also breaks the ground on which notice chains end. Nothing of this is measured in Process4: no job has
done it. The owner reports the same shape as measured in the earlier process.

## For civicsmith (the product's own work; ARCH decides each)

Found by the second reading, then sorted by kind: a test that exercises several modules belongs in the
latest of them; a shared helper or fixture belongs in an earlier module and its public files; two
modules whose boundary is wrong are an architecture bug, corrected in the module list; or the order is
simply changed. The module list is converted so that no module's tests reach a later module, and the
four modules stay out of the first tranche's slice until that is so. No product behaviour changes.

## Options for the process (none adds a test run, review or stop of its own)

- **A. No change.** ARCH's reading catches a declared use of a later module. Cost: the hole above.
- **B. The declared-uses check also refuses a declared use of a module at the same or a later place in
  the order (recommended).** It is part of a check that already runs, it enforces a rule the design
  already has, and its result is one the design already handles: the job cannot fix it in its own
  files, so it reports to ARCH, is recorded blocked, and other work goes on. Cost: it is one more thing
  an existing check refuses, beyond the two refusals the owner approved (part 2 section 6), so it needs
  his word. Tool change, with the tests of that tool; design part 2 section 6; build text 2 section 3.
- **C. The tool tells ARCH, and refuses nothing.** When a merge leaves a declared use of a later
  module, the tool says so to ARCH's session. Cost: the broken order is already on the tranche branch
  when ARCH hears of it.

## The owner's choice, and what was built (22 Nov 2026)

"decision: option B, as recommended". Built: `declaredUses` in `tool/lib/notice/check.mjs` refuses a
declared use of a module whose place in the order is the same or later, and an undeclared import of a
later module now says that declaring it would not settle it. One new test in
`tool/test/notify.test.mjs`. The three test files that exercise the check were run and pass
(`notify`, `notice-proof`, `scope`); the proof's recorded answers are unchanged. A limit found while
reading the code, not changed: the check counts only imports by path inside the product
(`spec.startsWith('.')`), so a reference by package name across a product's packages is "from outside
the product" to it. For civicsmith's eleven packages that matters; the second reading's item 12 looks
for exactly those.


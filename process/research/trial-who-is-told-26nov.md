# The trial of "who is told" on process3-probes (26 Nov 2026, PROCESS #18)

Length: 49 lines. Last section: "What it cannot show".

Step 5 of the plan the owner read in his design document (https://claude.ai/artifact/FtqUWACJcaoWi9KZmubkAk, Part D):
"The whole path on the trial product (process3-probes): a conversion, a change, a notice", finished when "a notice reaches
exactly its users". Steps 1 to 4 are merged (29c05fe). The trial runs on Process4's newest main. It adds no test, gate,
review or stop to the process: it is ordinary work on the trial product, read afterwards.

## How it starts

The owner types two lines in process3-probes' coordinator session:

1. `Instruction: move process3-probes to the latest Process4 version`
2. `Instruction: run the trial in process/research/trial-who-is-told-26nov.md of the Process4 copy`

The coordinator records both and tells ARCH. ARCH moves the product as design part 6 §7 says (a second pull request for
the workflow copy where it differs), then reads this file in its copy and carries out the steps below. ARCH decides every
technical matter; this file names what is to be shown, not how ARCH builds it.

## The steps (ARCH, with jobs, as ordinary work)

1. **Facility list.** ARCH writes the product's facility list (design part 2 §7) before any conversion.
2. **Conversion.** ARCH opens a tranche whose scope is every module's conversion (part 2 §3; the product is small). Each
   module's first job is its conversion: it changes no behaviour, states its items' types, and the tool writes its uses
   file. Shown when: every module's conversion has merged, or a module's blocker is recorded, and each has a uses file.
3. **Choose the provider.** ARCH picks a provider used by at least two later modules through different items, so that a
   change to one item can show that only that item's users are told. Before anything is built, ARCH writes down, from
   the uses files, which modules a change to that item should tell, and which a change to its insides only should tell
   (none, for converted modules).
4. **A change to the insides.** One made-up requirement that the provider meets without changing any item's domain or
   range. Its job merges. Shown when: the notice tells no module (or exactly those step 3 named).
5. **A change of an interface.** One made-up requirement that changes one item's domain or range in a way its means show
   (a new required parameter, a narrower bound, a new error kind). ARCH names the change in the work it places. Its job
   merges. Shown when: the notice tells exactly the modules step 3 named, each told job reruns only its related tests
   (or none, recording that nothing needs changing), and no other module is told.
6. **A change of meaning** (if a provider offers one cheaply): a change its means cannot show (for example the order or the
   unit of a value), declared in the job's pull request. Shown when: its users are told as for step 5.
7. **The account.** ARCH writes, in the round's account for the owner, each step's result: expected and told modules side
   by side, the related tests run, the time and cost each step took where they can be read, and any process fault, which
   goes to PROCESS as part 6 §6 says. The coordinator tells PROCESS when the account is written.

The trial ends when the account is written. PROCESS then reports it to the owner with what is proven and what is not;
civicsmith moves only on his instruction at its coordinator.

## What it cannot show

A product of a few small modules cannot show civicsmith's cost of conversion, its volume of notices, or a module whose
tests near two hours. Those are the first pass of 8 civicsmith modules (Part D, step 7), which stops for his review.

## The result (relayed by process3-probes coordinator #6, 26 Nov ~05:28Z, from ARCH #7's account in process3-probes' `process/decisions-arch.md`, PR 424)

Provider `units`; users `shipping` (the grams function and the `Weight` type) and `invoice` (`Weight` only). Each change a
made-up requirement, merged as ordinary work, its notice read at merge.
- Insides only (how `units` reads weight text): told no module. As expected.
- An optional "rounding mode" argument added to the grams function (default unchanged, no new error): told `shipping` only;
  `invoice` not told; `shipping` needed no change. As expected (accepting more tells its users).
- A changed default (an exact half gram rounds down): told `shipping` only; `shipping`'s cost changed at one boundary (100.5 g
  now 100 g / 150p, was 101 g / 300p), it changed one test and declared its own change, which told `invoice`; `invoice`
  declared its own, which told no one. Each hop told only its own direct users and stopped at the end of the chain.
- Cost read: five job sessions, about US$28.6; ARCH and coordinator unmeasured; steps 5–6 about 45 minutes. No process fault.

ARCH's four findings, unchanged: "(a) first creation of the facility list was mis-read by the tool as a host-version change
and told all six modules spuriously; (b) converting a previously-unconverted product generates O(n^2) moot inter-module
notices via places-outside-the-standard; (c) the planned "change the means cannot show" example turned out means-visible
because an earlier job wrote the tie-break onto a marked bound line (so the coding standard made it an interface change) —
the declaration path was still exercised; (d) the change of meaning cascaded two further hops with no ARCH placement, each
hop telling exactly its next user and stopping at the module with no users."

Proven once, on a six-module product: a notice reached exactly its users for a change to the insides, a change its means
show, and a declared change carried along a chain. Not shown: a change of meaning its means cannot show (c); that a told
job ran only its related tests (not reported); anything at civicsmith's scale. (a) and (b) are measured, and are looked
into before civicsmith moves (research `conversion-notices-26nov.md`).

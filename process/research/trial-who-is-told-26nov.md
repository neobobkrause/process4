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

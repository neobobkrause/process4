Written by a worker of PROCESS #10, 24 Nov 2026, from the civicsmith refactoring plan (https://claude.ai/artifact/HA4xENnaXEjX8cx4SQeAoL).

Bottom line:
1. The plan moves each whole-program test to the part it proves, or to a new top part after the launcher; that fits change 6, but its rule is "loads only earlier parts", judged by the order check, not "only by import".
2. The order check sees imports only, so the plan's "order check clean" (steps 3 and 7) cannot show that path reaches are gone; the plan names the fix for the main one (the shared test helper) only at its last step, 8.
3. Declared uses will not equal real uses: the document counts 1,279 undeclared non-import pairs and 143 declarations with nothing behind them, and plans to fix neither beyond the door's and launcher's UI uses.
4. No module is expected near 2 hours; the plan holds every run under 45 minutes, and plane drops from 147 test files to its own 27, 7 of them then moving to the top part.
5. Gaps for the update plan: test runs for ARCH's list-only pull requests and ownership moves under change 1, a test running in two places during step 3, and the interim when change 3 is not exact.

## How it was read

"Civicsmith layers: research report" (Claude Doc, one tab 6e100cd1-3fc8, rev 135, no comments), read whole; sections cited by heading. **States** = the document says it; **Infer** = mine; **Unsaid** = silent.

## 1. Change 6: module tests reach other modules only by import

- **States** ("What the lane recommends"; plan step 3; "ARCH's conditions"): each whole-program test moves to the part it proves, "rebuilt as a new file there". A test that loads a later part is rebuilt so it does not. Only a test with no route stays at the end, in "proof parts" after the launcher. ARCH's condition: "a moved test loads only its own part and parts before it, not the launcher, the door's assembly or a copy of either, and the process's order check decides."
- **States** ("Where each whole-program test can go"): none of plane's 120 whole-program tests needs the assembled program; 0 have "no route". 17 were moved or rebuilt and pass; 103 are placed by reading only.
- **Where whole-product tests go** (step 6): a new top part after the launcher owns the entry, the UI plug-in, the 14 door tests that check screens, and "the tests that start the whole program". This matches change 6's "the latest module it reaches". The walks are not used for tests (**States**: only one area, the background delivery, goes to the walks at step 5).
- **Reading other modules' files** (Stage 1 sections): 432 of 597 upper test files read later parts' files through a shared helper; tests of 27 parts read journey-check's design files; test-support's declarations helper imports 95 later parts by a computed path. Step 8 says "the shared test helper stops reading later parts' files". **Unsaid**: how (import, or data moved earlier), and whether it stops reading earlier parts' files by path too. **Infer**: the plan's rule is about order, not form: a test reading an EARLIER part's file by path, or running its program, is allowed by the plan, not by change 6's title.
- **Programs started**: 19 tests go "on the real runtime, through a test-only store"; **Unsaid** whether that runtime loads other parts' files by path.
- **Left**: 341 open computed references, 211 outside journey-check; operations called by name through the door and tables read by name, which **States** the process tool cannot see. (**Infer**: the tool reads carrier calls by name if civicsmith declares the door as one; not checked.)
- **Product code by path at run time**: **States** two computed imports while running: the test helper above and "the bundler's bundle script", which reached 7 later parts. The word table's generator (part 2) reads the source of 201 later parts. 3,884 of the 5,350 references to later parts come from code, not tests. After the move the launcher keeps the deployment file, build script and built files (ARCH's condition "Ownership"), which name the top part's entry by path and build the UI's files into its program. **Unsaid**: any step for the bundler, the generator or the rest. **Infer**: no deployed-program code loads another module by path at run time beyond the entry named in the deployment file; the rest is build-time tooling.

## 2. Order

Every moved test points earlier (**States**, step 3 and ARCH's conditions). Exceptions or open points:
- The launcher (before the UI and the top part) owns the build and deployment files that name the top part's entry and build in the UI (**States** ownership; **Infer** this is a by-path reach to later parts).
- The word table's generator at part 2 reads 201 later parts' source (**States**; no step addresses it).
- The bundler's computed import of 7 later parts (**States**; no step addresses it).
- Until step 8, the shared helper still reads later parts' files; step 7 (the move) comes before it (**States** order of steps).
- Step 7 "merges only when the order check finds nothing in either part's code"; the check sees imports only (**Infer** from module-uses-23nov.md §1), so a clean check does not show path reaches gone.
- Steps 1 to 6: today's later reaches remain (the door's helper starts the launcher's entry).

## 3. Declared uses

- **States** (dependency facts): of 3,142 declared uses, 143 in 51 parts have nothing behind them; 1,279 pairs are referred to and not declared, none by import.
- **States**: the door's 12 and the launcher's 13 declared UI uses go before step 7; the top part "shows one stale declared use".
- **Unsaid**: reconciling the other 143 and the 1,279, and how operation-name uses (UI names 560 of 1,068 operations) are declared.
- **Infer**: after the plan, declared uses will still not equal real uses. Change 3's wait and change 2's notice stay inexact for path reaches to earlier parts and for uses by operation name. With change 5, honest path uses can be declared ("cannot tell"), but the plan does not ask anyone to declare them.

## 4. Long modules

- **States**: plane's run is 33 to 44 minutes today (2,562 s longest whole run); afterwards it "keeps only its own 27 tests", and 7 of those 27 files move to the top part ("At each layer").
- **States** ("What the plan depends on"; ARCH's conditions): no part's run may come near 45 minutes; store-assembly takes the memory-heavy shape tests only if it stays clearly under, else ARCH splits it. Run times of parts gaining tests are not measured.
- **Infer**: nothing is expected near 2 hours. The top part's run time (all whole-program tests) is **Unsaid**. Document faults: "120 tests" mixes tests and files; "plan step 12" in an eight-step plan.

## 5. Against the update plan

- **Change 1, ARCH's pull requests.** Steps 3, 6 and 7 include ARCH-only changes to the module list (ownership moves, reordering) that "run no tests". **Unsaid in both plans**: what `p4 test` records, and what `module-tests` reads, for a pull request with no tests in scope, or one that only moves test files' ownership or reorders modules. **Gap**: change 1 should say it (e.g. `check` and tests of each module whose files or place change).
- **Change 1, ownership moves.** At step 6 files change owner with no top-part job; **Infer** they first run at that part's next job. Change 1 should say whether a move starts one.
- **"Tests run once" during step 3.** The new file lands in its part; "the part that holds the old file removes it in its next job". Until then the same test runs in two places, though ARCH's condition says "No test sits in two places". **Gap**: the old file should go in the same round, or ARCH removes it by list edit.
- **45 minutes.** The plan uses today's limit; change 1 makes it 2 hours. No conflict (the plan is stricter); ARCH should be told.
- **Change 3 and change 6.** Change 3 is "exact once item 6 holds". By the document, item 6 holds only after step 8, and even then not for the 1,279 undeclared pairs. **Gap**: the update plan should state that change 3 is not exact during the refactoring.
- **Change 5.** The lane's order-check counts were made with today's tool. **Infer**: reading `require` and the product's own package name may add refusals the counts do not show; **Unsaid** whether the lane's graph read `require`.
- **Changes 2 and 4.** **States** after step 7 the door's changes reach 19 screens parts as notices, count unknown. **Infer**: change 4 may then start many told jobs at once above the slot number.
- **Change 6's text.** Its title says "only by importing"; its body says a reaching test "belongs to the latest module it reaches". The plan follows the body plus rebuilding. **Suggest**: say plainly whether a test may read an earlier module's file by path (change 5 makes such a declared use "cannot tell").
- **Folded-in fixes**: untouched by the plan.
- **Expected and provided**: `p4 check`, the three-step provider change, the 60,000-byte file limit, ARCH-only list edits, notices, walks.
- **Expected but not in the update**: an order check that "decides" whether a test "loads" only earlier parts. The check sees imports only. The lane's own graph (`process/lanes/plane-scope/research/tools/graph.mjs` in civicsmith) sees path reaches; ARCH could use it at steps 3 and 7 as a measurement, not a gate.

## 6. Other bearings on Process4

- "Where whole-program tests find flaws" **States** a Process4 property: a later part's tests run only when it has work, so a behaviour change that keeps the interface tells no user. Change 2 keeps this (notices only on interface change). The plan relies on test placement, not the process, to cover it.
- **States** the process tool cannot see operations called by name through the door, or tables read by name. If true for civicsmith's settings, notices miss those users.
- **States** development is halted; nothing starts before his marked decision. **Unsaid**: whether the refactoring waits for this update (the update plan assumes it lands first).

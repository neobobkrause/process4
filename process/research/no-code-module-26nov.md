# A module with no code cannot finish its conversion (26 Nov 2026, PROCESS #18)

A process fault from civicsmith ARCH #28 via coordinator #10, 09:16Z, unchanged: "A module with no code can never finish
its conversion. After ARCH's module-list change (civicsmith PR 1695) left the module `documents` with no code (`p4 uses
documents`: 0 providers, 0 uses, 0 places; its uses file already committed, unchanged), its conversion job closed PR 1687
with `close --nothing-to-change`. The tool counts a conversion done only by a merged conversion pull request (build text
1b, command 9: 'a module none of whose conversions has merged has its conversion as work'), so `p4 finished documents`
prints 'not finished ... it has work again: conversion', and `next-job` will offer the same conversion again with nothing
to convert. Design part 2, section 4 names no finish for a conversion that changes nothing." ARCH adds: "documents is
converted in substance (it holds no code), but the tool will keep it unfinished, and `round-done` will not show the round
done. ARCH is starting no new documents job."

## Reading

Design part 2 §1: "A module that holds requirements and no code is a list error. ARCH decides which module's code meets
each such requirement, and the move is made as a mechanical edit." A module with no code is not a module the process
expects to convert; ARCH corrects the list (moves its requirements, removes it). Once removed, the tool no longer counts
its conversion as work. PROCESS told coordinator #10 this as information (09:20Z), changing nothing.

## Options

- **0. No change (recommended).** ARCH corrects the module list as part 2 §1 says. Nothing measured shows the rule fails.
- **B. A conversion closed with nothing to change finishes the module.** Would let a module with no code stay on the list,
  against part 2 §1; and a conversion that closes unmerged would also let a module with code skip its uses file.

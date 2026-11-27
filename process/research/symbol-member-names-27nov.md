# A symbol-keyed member's name shifts with its module's code (27 Nov 2026)

Process fault from civicsmith office-readers #15 (PR 1754), passed unchanged by ARCH #34 and coordinator #16 (~03:26Z),
civicsmith on Process4 7916c03: "`p4 uses office-readers`, run on unchanged code, rewrote the uses file. The only
difference was an item name the tool takes from the checker's internal symbol id, `ooxml Chunks.__@asyncIterator@3605` →
`Chunks.__@asyncIterator@3641`. The number shifts whenever ooxml.mjs changes. So an item's name in a uses file can stop
matching the provider's listing even though nothing about the use changed. That may send notices for "changes" that
aren't real, or miss real ones, and it may be why #1745 produced 238 reasons from a two-line type change. I did not keep
that rewrite."

Read in the tool: TypeScript names a member keyed by a well-known symbol (`[Symbol.asyncIterator]`, `[Symbol.iterator]`,
`[Symbol.toPrimitive]`, …) internally as `__@<name>@<id>`, the id depending on the program's other code. The listing and
the uses file take that internal name as the member's name. Decision J (27 Nov) made R17 print and match it by its
symbol (`refs.mjs` ~999-1005); the item names in listings and uses files were left. A tool fault against design part 2 §7
(an item is named by its name within its module; a use is matched to the provider's item by name): an unchanged use
looks removed and a new one added whenever the provider's file changes, so its users are told of a change that is not
one (a removed item tells), and a real change to that member can be missed under the old name.

Options:
- 0. No change.
- A. Name such a member by its symbol everywhere (`Chunks.[Symbol.asyncIterator]`), in listings, uses files and notices;
  read a name of the old form in an older uses file as the symbol it stands for, so no file needs rewriting and old and
  new names match. Small; no text change (design part 2 §7 already names items by their name).
Recommended: A. Whether it explains #1745's 238 reasons is not known; the rebuilt tool on that merge would show it.

# One name exported by several interface files of a module (25 Nov 2026, PROCESS #13)

A process fault from civicsmith ARCH #18 via coordinator #9 (04:44Z), reported independently by pdf-reader #2 (PR 1414)
and #3 (PR 1427), unchanged: "test-support has five files that each export an entry named `generate` (pdfgen.mjs,
sheetgen.mjs, docgen.mjs, imggen.mjs, corpus.mjs). The interface listing names entries by name within a module, so the five
are one entry. Notice 1340's 'after' shape for `generate` (accepts a sheet recipe, hands back test-support.SheetFile) is
sheetgen.mjs's, yet pdf-reader, which uses only pdfgen.mjs's generate, was told twice for a change to another file. This
likely accounts for part of the 1340 users told (126) that use only one generator."

## Reproduced

Build text 2b §6: "An entry is named by its name within its module." Nothing says what happens when two of a module's
interface files (`public`) export one name for two different things. `list()` in `tool/lib/notice/listing.mjs` writes
`entries[name]` once per export, so the last file read wins; the usage map finds every file's declaration by range and
names it the same entry. On a two-file provider (`a.mjs` and `b.mjs` each export `generate`; `ua` uses a's, `ub` b's):

- a change to b's `generate` told **ua and ub** (a notice for nothing to ua);
- a change to a's `generate` told **nobody** (ua missed: the listing held only b's).

So it is both notices for nothing and a missed user, against the notice's rules (design part 2, section 7).

## The correction (built, tested, not committed: `same-name-entries-25nov/tool.patch`)

Where two of a module's interface files export one name for two different things (different resolved declarations), each
is its own entry named `<file>:<name>`, the file as the module list writes it; the same thing exported again from another
file stays one entry; names exported once are unchanged, so every other listing is the same. With it: a change to a's tells
ua only, b's ub only. A test (fails without it); notify, commands, related and the proof replay pass, all 150 answers
unchanged. Build text 2b §6 gains one sentence saying so.

Process note: the commit of this correction with the build-text sentence was refused by the permission checker (04:5xZ,
"Destructive or Unwanted Actions"): build/ changes only on the owner's marked decision. Not retried. It waits for his word as
option 4 of the group on his page.

Options: A no change (ARCH could rename the five exports, a product change); B the correction.

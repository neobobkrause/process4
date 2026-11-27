# Build text 3. How a walk is made

Length: 74 lines. Last section: "6. The record, a flaw and an observation".

**Status: proposed. Nothing here has run.** It stands beside the design (`design/`, "the design" below). Words in quotation marks are the owner's unless a line says otherwise. The tool's commands named here are in build text 1b, section 4. Its other sections: 2, 4, 5 and 7 in `03b-`; 8 in `03c-`.

Marks: **Decided here:** a choice made in this text. **Unproven:** never shown to work.

## 3. Steps

**Decided here:** a step is a small program that drives a browser through one thing a user does and states what must then be so. It is kept with the module whose requirement it proves, under that module's `tests` paths, in `walk/internal/` or `walk/external/`. The module's test command never runs those two folders (build text 2, section 3). Its first lines are fixed: A journey step that no module's requirement covers has no home until ARCH writes the requirement.

```
requirement: <module> <requirement number>
follows: screen <page> / <screen> / <part>     (internal)
follows: journey <page> / step <number>        (external)
expects: <the document's own words for what must be so>
```

- **Who and when.** The module's job writes the step in the same pull request that meets or changes the requirement. A job given a flaw corrects or adds the step that shows it. ARCH, writing requirement text, names the screen or journey step a requirement serves, by the text's ending (build text 2, section 4), so the job knows what to follow.
- A step runs only in a walk. A job may run its own step on its own machine while it works; nothing requires it and nothing reads the result.
- The program that runs steps and serves the product on one machine is itself product code in a module ARCH names. A journey's order comes from the step numbers in its page.

**Decided here:** a walk is measured against the document, not against the steps. The walking session reads each page of its areas in full. Whatever the page says that no step covers, the session walks by hand in its browser. For a part walked by hand, the record is the session's own words.

## 6. The record, a flaw and an observation

**Decided here: where.** For each walk ARCH's session, by the tool (`walk open`), opens one issue in the product's repository, the walk issue, titled with the tranche, the round and the kind of walk, and writes its number in the round record. Each walking session writes one comment there by the tool (`walk write`), its own, rewritten in place as it goes. It sends ARCH its message only after its last write.

**Unproven:** the size a comment holds.

**The comment's form.**

```
<hidden mark: walk, session number>
walk: <tranche> / <round> / internal or external
built from: <commit>            copy: <name, external only>
area: <page or journey> | walked to the end | flaws: <n>
area: <page or journey> | not walked | <reason>
```

followed by its flaws and then its observations.

**A flaw's exact form.**

```
flaw: <tranche>-<round>-<I or E>-<session>-<n>
kind: does not match the Screens document | journey cannot be completed | journey completes with a wrong result
area: <page or journey>
where: <screen and part, or journey step number>
the document says: "<its exact words>"
the product did: <what was seen, plainly; any error text exactly>
how: <the step's file, or "by hand" and the actions in order>
seen twice: yes or no
module, as the walker guesses: <from the step's requirement line, or "not known">
```

**An observation's form.**

```
observation: <same numbering, with O>
area: <page or journey>
noted: <one to three lines>
```

Among observations: a part of a page that no step covers and that matched when walked by hand; words in a document that can be read two ways; something slow or ugly that the document does not speak of.

**How ARCH turns a flaw into work.** ARCH reads the whole walk issue (`walk read`). For each flaw it does one of three things.

1. **Work for a named module.** It names the module: the one in the step's requirement line; for a part walked by hand, the module that owns the screen's code in the module list; where the step itself is wrong, the module that holds the step. Where no requirement covers what the document says, ARCH first writes one, marked not yet met. ARCH's session, by the tool, writes the flaw's number, the module and a link to the comment into the waiting-work record (`state write`). The job block on its pull request carries them, and the job reads the flaw where it lies (`walk read`).
2. **The document is wrong.** ARCH gives it to the UX lane, which corrects the page. It is named in the account after the round.
3. **It is none of the three things.** ARCH sets it aside with one line of reason. **Decided here:** each flaw set aside is named in the account after the round with that reason. ARCH judges entries about a product it designed; the account after the round is what lets the owner see each one.

Observations go into the same account. ARCH may write a requirement from one. When ARCH has placed every entry, its session closes the walk issue (`walk close`).

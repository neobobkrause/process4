# Civicsmith's conversion plan: outline

Length: 127 lines. Last section: "6. Open, and who settles it".

**Status: outline, by PROCESS civicsmith lane #1, 20 Nov 2026. Nothing here is decided by the owner,
built or run.** It is the product's conversion plan that design part 0 §1 and part 10 §2 item 2 name.
It rests on the research in `research/` and changes no rule of Process4; where it and the design
differ, the design rules. Steps that wait on the owner's facts are marked so.
"Inference" marks what no record shows.

## 1. What the plan aims at

- Civicsmith's development runs under Process4 from its own repository, with no second codebase
  kept alive beside it (good practice: research/conversion-best-practice.md §2, the 90-percent stall).
- The first tranche is small and is the proof that Process4 works on real code: merges by the tool,
  the notice on real interfaces, one partial internal walk, one development deployment to Cloudflare,
  and one journey walked there (PROCESS's standing recommendation; design part 10 §3).
- No product behaviour changes in the conversion itself. Behaviour changes come as tranche work.

## 2. Before anything: what the owner has told the lane, and what is still to learn

Told, 20 Nov 2026 (research/civicsmith-facts.md §7): the repository is `neobobkrause/civicsmith2`; its
founding documents are in it; no work is in flight; its languages can be seen in it; and "there are
several problems that need to be resolved before process4 development can begin".

Still to learn, from a session started in civicsmith2 under its own approvals (the lane cannot read a
private repository; `civicsmith2-reading-brief.md`) or from the owner: the founding documents' paths and
content, the languages and tools, the module count, Process3's traces, and the several problems. The
problems are resolved before act 1 of section 3, or placed in the plan where each belongs.

## 3. The owner's acts, for an existing Process3 repository

Design part 7 §4's ten acts as corrected on the owner's "Decision: B" of 20 Nov 2026 (process4
PR 104, main 7b42e37), read for civicsmith. Bracketed numbers are the lane's points to PROCESS
(`process-points.md`).

1. **Sessions' GitHub account (acts 1, 2, 5).** Give the sessions' account write access to civicsmith's
   repository, and install Claude's GitHub App on it. The process repository is done already.
2. **Settle Process3's leftovers (act 3) [2].** Before any Process4 file lands, Process3's workflows
   (`process-gate.yml`, `process-record.yml`) and any repository secrets are removed (act 3: no
   repository secrets), and Process3's rulesets give way to act 4's rule. Its required check `gate` is
   replaced by `module-tests` at act 10. The trial measured what one leftover does: its main still
   required `gate`, and the merge into main was blocked until the owner changed it.
3. **Branch rule (act 4).** No deleting and no overwriting on every branch, no one excepted.
4. **Environment check (act 6) [7].** A session reads the cloud environment the sessions will run under
   and confirms its permissions-management settings name civicsmith's repository. They name
   repositories by owner, so a repository under any other owner must be added, by the owner's click on
   the change the session proposes (part 7 §5). The deploy token for the development Cloudflare account
   is entered then.
5. **The set-up session (act 8) [1, 3].** One plain session the owner starts on civicsmith's repository
   for this act alone, in this order (part 7 §4 act 8; part 6 §2):
   - drafts civicsmith's approvals for the owner, as no coordinator exists yet, and places his approved
     text, with the forbidden commands, in a pull request into main that he lands by his click;
   - writes civicsmith's first Process4 files by pull request into main: `process.json` naming the
     Process4 version, the module list (section 4), the required-run workflow, the forbidden-commands
     copy;
   - then makes the tranche branch from main's newest commit; main already holds Process3's history,
     which act 8 now covers (the trial's fault was a branch with history of its own).
   Civicsmith's present Process3 approvals may forbid a session to place the new text; that stays
   unproven (part 6 §2), and if it is refused the matter goes back to PROCESS, not round it.
6. **Registry.** The owner tells PROCESS civicsmith's ROOT once it starts, so PROCESS can reach it
   (build text 5 §4).
7. **Start ROOT (act 9),** on civicsmith's repository alone, the tranche branch, Auto mode, a plain
   prompt. ROOT makes the shared state's issue (`state write --create`; build text 5 §1).
8. **Required check (act 10) [2].** Once `module-tests` has reported once, main and the tranche branch
   take changes by pull request only with it passing, replacing `gate` (act 10 as corrected). The
   trial did act 10 before act 9.

## 4. The conversion work, before the first tranche's jobs

What the texts leave unassigned (research/process4-for-a-product.md §3). This lane's design for it:

- **The module list from the real import graph.** Act 8's set-up session now writes the first module
  list; for civicsmith it derives it, with workers, from what the code actually imports, and ARCH keeps
  it after. It does not start from Process3's list, and it records every cycle or backward use it finds as an
  architecture bug placed against a named module. Nothing refuses a breach (design part 2 §1), so the
  list is what holds it. Good practice records the existing breaches as a baseline and shrinks it to
  none (research/conversion-best-practice.md §1).
- **Cycles: one module for each cycle, then split by jobs.** The owner, 20 Nov 2026: civicsmith2 has
  cyclic references within modules and other source-code issues that made it hard to close a round.
  Process4's order allows a module to use only modules before it (design part 2 §1), so a cycle has no
  valid order. The lane's design: the set-up session puts each strongly connected group of modules
  (each set that reach each other) into one module, so the first list is valid as written and no
  product code changes before Process4 runs. Breaking each merged module apart, behind interfaces, is
  then tranche work done by jobs under Process4, an architecture matter ARCH places (part 1 §6). The
  first tranche is chosen from modules outside the largest group where it can be. The groups come from
  the reading report (`civicsmith2-reading-brief.md` item 7). Rejected: breaking the cycles by hand
  before the move, which would be product work under no process; and leaving the cycles in the list,
  which a list with backward uses cannot hold.
- **Every file owned.** Each file belongs to exactly one module; unowned files are assigned in the same
  pull request as the list.
- **Requirements files from what exists.** Each module's requirements come from Process3's requirement
  texts where they exist, marked `[met]` only where a test shows it; the rest `[not yet met]`.
- **The ranking page from the founding documents** (design part 5 §6), once the owner has said where
  they are.
- **Process3's own files leave the tree** (the `.process` pin, the ledger, its shims) in one pull
  request; they stay in history.
- **The walks' documents.** The UX lane turns civicsmith's existing UX files into the Screens document
  and the journeys, one page each, with an index (build text 3 §2 calls this conversion work).
  Inference: the 133 files in `docs/development/ux-substrate/` named in build text 3 §1 are civicsmith's.
- **Language reader.** Only TypeScript 5.6.3 reading plain JavaScript (`.mjs`) has been tried. If
  civicsmith is TypeScript or uses `.js`/`.ts`, the `source` globs are set and the first tranche shows
  whether the reader follows it. The workflow installs by `npm ci` only.

## 5. The first tranche: the proof

- **Scope.** A thin slice: a few modules early in the order, and one journey that runs through them
  end to end. ARCH chooses them; the lane's advice is a journey that touches no AI account, so the
  first external walk needs no connected AI account.
- **What it must show.** Jobs merge through the tool under the checker; a notice reaches a real user
  module; one partial internal walk; one development deployment; that journey walked on it.
- **What is expected and is not a failure.** Broad notices at first: legacy code without structured
  comments is mostly "not followed fully" (build text 5 §6), and each module's first job adds its
  comments. Under Process3 all 12 development deployments failed and walks never passed (build text 3
  §1; inference that this was civicsmith), so the deployment step is the likeliest first stop.
- **Then.** Later tranches widen in module order at the pace the slots and the walks bear.

## 6. Open, and who settles it

| Matter | Who settles |
|---|---|
| The founding documents, languages, module count and the several problems | A session in civicsmith2, or the owner |
| Points 1, 2, 3, 5, 6, 9 to Process4's texts | Settled: the owner's "Decision: B", 20 Nov 2026 |
| Whether Process3's approvals let a session place the new ones | Shown at act 8; unproven |
| Where the "about 200 modules" figure comes from | The owner, or ARCH's import graph |
| Whether the reader follows civicsmith's language | Shown in the first tranche |
| Walks, deployment and release by sessions on Cloudflare | Shown in the first tranche (design part 10 §3) |

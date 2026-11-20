# Civicsmith's conversion plan: outline

Length: 105 lines. Last section: "6. Open, and who settles it".

**Status: outline, by PROCESS civicsmith lane #1, 20 Nov 2026. Nothing here is decided by the owner,
built or run.** It is the product's conversion plan that design part 0 §1 and part 10 §2 item 2 name.
It rests on the research in `research/` and changes no rule of Process4; where it and the design
differ, the design rules. Steps that wait on the owner's facts or on PROCESS's points are marked so.
"Inference" marks what no record shows.

## 1. What the plan aims at

- Civicsmith's development runs under Process4 from its own repository, with no second codebase
  kept alive beside it (good practice: research/conversion-best-practice.md §2, the 90-percent stall).
- The first tranche is small and is the proof that Process4 works on real code: merges by the tool,
  the notice on real interfaces, one partial internal walk, one development deployment to Cloudflare,
  and one journey walked there (PROCESS's standing recommendation; design part 10 §3).
- No product behaviour changes in the conversion itself. Behaviour changes come as tranche work.

## 2. Before anything: what the owner tells the lane

1. The repository's exact name, its companions, and whether the real repository or "civicsmith-copy"
   moves (the lane recommends the real one, from its own main; the page's Choice 1).
2. Where the purpose, audiences, principles and requirements are written.
3. Whether work is in flight under Process3, so it is finished or stopped before the switch.
4. The language and build tools, if he knows them.

## 3. The owner's acts, for an existing Process3 repository

Design part 7 §4's ten acts, read for civicsmith. Bracketed numbers are the lane's points to PROCESS
(`process-points.md`); steps marked **[waits on PROCESS]** follow the owner's choice on those points.

1. **Sessions' GitHub account (acts 1, 2, 5).** Give the sessions' account write access to civicsmith's
   repository, and install Claude's GitHub App on it. The process repository is done already.
2. **Settle Process3's leftovers (act 3) [2].** Before any Process4 file lands: Process3's required
   check (`gate`) and its rulesets come off; its workflows (`process-gate.yml`, `process-record.yml`) and
   any repository secrets are removed. The trial measured what one leftover does: its main still
   required `gate`, and the merge into main was blocked until the owner changed it.
3. **Branch rule (act 4).** No deleting and no overwriting on every branch, no one excepted.
4. **Environment check (act 6) [7].** A session reads the cloud environment the sessions will run under
   and confirms its permissions-management settings name civicsmith's repository. They name
   repositories by owner, so a repository under any other owner must be added, by the owner's click on
   the change the session proposes (part 7 §5). The deploy token for the development Cloudflare account
   is entered then.
5. **Approvals and first files (act 8) [1, 3] [waits on PROCESS].** One plain session started on
   civicsmith's repository: makes the tranche branch from main's newest commit (the trial's fault was a
   branch with history of its own); drafts civicsmith's approvals for the owner and places his
   approved text, with the forbidden commands, in a pull request he lands by his click. Under option B
   that session also writes the first Process4 files: `process.json` naming the Process4 version, the
   `module-tests` workflow, and `state write --create`. Civicsmith's present Process3 approvals may
   forbid a session to place the new text; that is unproven (part 6 §2), and if it is refused the
   matter goes back to PROCESS, not round it.
6. **Registry.** The owner tells PROCESS civicsmith's ROOT once it starts, so PROCESS can reach it
   (build text 5 §4).
7. **Start ROOT (act 9),** on civicsmith's repository alone, the tranche branch, Auto mode, a plain prompt.
8. **Required check (act 10) [2].** main and the tranche branch take changes by pull request only,
   with `module-tests` passing; it replaces `gate`. The trial did this before act 9.

## 4. ARCH's conversion work, before the first tranche's jobs

What the texts leave unassigned (research/process4-for-a-product.md §3). This lane's design for it:

- **The module list from the real import graph.** ARCH derives the order from what the code actually
  imports, not from Process3's list, and records every cycle or backward use it finds as an
  architecture bug placed against a named module. Nothing refuses a breach (design part 2 §1), so the
  list is what holds it. Good practice records the existing breaches as a baseline and shrinks it to
  none (research/conversion-best-practice.md §1).
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
| Which repository moves; where the founding documents are; work in flight | The owner |
| Points 1, 2, 3, 5, 6, 9 to Process4's texts | The owner at PROCESS (PROCESS recommends correcting) |
| Whether Process3's approvals let a session place the new ones | Shown at act 8; unproven |
| Where the "about 200 modules" figure comes from | The owner, or ARCH's import graph |
| Whether the reader follows civicsmith's language | Shown in the first tranche |
| Walks, deployment and release by sessions on Cloudflare | Shown in the first tranche (design part 10 §3) |

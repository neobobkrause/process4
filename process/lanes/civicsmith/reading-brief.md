# A reading brief for civicsmith-copy

Length: 46 lines. Last section: "What to send back".

Written by PROCESS civicsmith lane #1, 20 Nov 2026. The repository that moves is `neobobkrause/civicsmith-copy`
(the owner, 21 Nov 2026). The lane's approvals cover neobobkrause/process4 only, and the owner chose to
have it read by a session of its own (option A, 20 Nov 2026). This is the prompt the owner
may give a plain session he starts on civicsmith-copy, which acts under its own approvals. Nothing
in it changes anything; it only reads and reports.

## The prompt (paste as is)

> Read only. Change no file, branch, setting or session, and push nothing. Read this repository and
> report, in plain words, for the Process4 civicsmith lane (session_018BhceckLEcDGQG4yqJtMVH), which is
> drafting civicsmith's move onto Process4 and cannot read this repository itself.
>
> 1. **Founding documents.** The path of each document that states civicsmith's mission or purpose,
>    audiences, principles, standards and requirements; and, in a few lines each, what they say. Quote
>    the owner's words exactly where you quote.
> 2. **Languages and tools.** The languages and their share of the code; file kinds (.mjs, .js, .ts);
>    package manager and lock files; the build, serve and test commands; the Node version.
> 3. **Size and shape.** The number of modules as the repository defines them (and where: e.g.
>    `build/modules.json`), the top-level folders, and the number of source and test files.
> 4. **The process it carries now.** Process3's traces: the `.process` pin or clone, the ledger, the
>    workflows under `.github/workflows/`, `CLAUDE.md` and `.claude/settings.json` (summarise what the
>    approvals allow and forbid, especially about changing those two files), and any required checks
>    named there.
> 5. **The walks' documents.** Where screens and journeys are kept (e.g. `docs/development/ux-substrate/`),
>    how many files, and how many journeys.
> 6. **Hosting.** What the repository says about Cloudflare: deploy scripts, wrangler files, the
>    installer and updater.
> 7. **Cycles.** The owner says rounds were hard to close because of cyclic references between modules
>    and other source-code problems. Without installing anything into the repository or changing a file,
>    find every import cycle: between modules as the repository defines them, and between files. Read
>    the imports directly, or use a script you write outside the repository. For each cycle give the
>    modules (or files) in it, in order, and the lines that close it. Then give the strongly connected
>    groups of modules: each set of modules that reach each other.
> 8. **Other known problems.** Every other source-code problem the repository records that stopped or
>    slowed closing a round (notes, TODO lists, handovers, failed-walk records, ledger entries), each
>    with its source path, in one line each.

## What to send back

The report goes to the lane by `send_message` to session_018BhceckLEcDGQG4yqJtMVH, if the session's
approvals allow it; otherwise the session shows it to the owner, who passes it on as he chooses. Each
line names its source path. Anything not found is said to be not found.

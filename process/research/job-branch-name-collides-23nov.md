# A job's branch cannot be made where an old branch has the module's name

Written by PROCESS #9, 23 Nov 2026. A process fault from civicsmith ARCH #7, passed on unchanged by civicsmith
coordinator #3 at 00:32Z. It stops every civicsmith job.

## What was measured (as reported)

- `p4 branch job/setup-words/1` failed: GitHub refused the push, "! [remote rejected] ... -> job/setup-words/1
  (directory file conflict)". Then `p4 open --module setup-words` failed: "no branch job/setup-words/<n>; make it
  with branch first". Met 23 Nov ~00:30Z on civicsmith-copy `p4-tranche` 9d4b022, Process4 4614f8f, the first
  job of tranche t1, round 1.
- civicsmith-copy holds 207 branches named `job/<module>` from the earlier process (for example
  `refs/heads/job/setup-words`). Git cannot hold `refs/heads/job/setup-words/1` beside
  `refs/heads/job/setup-words`: a ref name cannot be both a file and a folder. 137 of civicsmith's 204 modules
  have such a branch.
- `next-job` picks the earliest ready module in order; setup-words is first. So no job can start. The round
  record names setup-words open with branch `job/setup-words/1` and no pull request.

## Why it happens

The tool names a job's branch `job/<module>/<n>` (build text 1b, command 1; `tool/lib/round.mjs` `nextJobName`,
`tool/lib/commands.mjs` `JOB` and `BRANCH`; the required run's `job/` test in `shims/module-tests.yml`). Nothing
checked that a product converted from an earlier process might already use `job/<module>` as a flat branch name.
The trial repository never had one. Sessions may not delete branches, and the owner's branch rule (act 4) forbids
deleting any branch, with no one excepted.

## Options

- **A. No change.** civicsmith's jobs stay stopped until the 137 old branches are gone: the owner lifts the
  no-delete rule, deletes 137 or 207 branches by hand on GitHub, and puts the rule back. Many clicks, and it
  loses the earlier process's history, which his T53 decision kept.
- **B. A job's branch takes a form that cannot meet a flat name (recommended).** New job branches are
  `job/<module>.<n>` (for example `job/setup-words.1`): one flat name under `job/`, so an old flat
  `job/setup-words` does not stand in its way, and a module name never holds a dot, so the module and the number
  read back unambiguously. It still begins `job/`, so every product's committed required-run workflow, which
  reads the job block only on a branch beginning `job/` (`shims/module-tests.yml`, step "the job block"), needs no
  change: a product gets the fix by the owner's one line moving it to the latest version. The tool still reads an
  earlier `job/<module>/<n>` pull request as a job, so the trial's history and job numbers carry on. A collision
  would need an old branch named exactly `job/<module>.<n>`. Changes: the tool (`round.mjs`, `commands.mjs`,
  `notify.mjs`, `scope.mjs`, `p4.mjs` help, their tests) and build texts 1, 1b, 2 and 5. The design names no
  branch form and is unchanged. A variant, `p4-job/<module>/<n>`, would also avoid it but needs every product's
  committed workflow changed by pull request, so it is not recommended.
- **C. The tool skips a module whose branch cannot be made.** A workaround, not a fix: 137 modules never get a job.

## Not known

- Whether civicsmith has flat `work/<name>` branches that a later `work/<a>/<b>` name would meet. Nothing has met
  one; ARCH and lanes name work branches flat.
- After the move, civicsmith's round record still names setup-words open on `job/setup-words/1` with no pull
  request; its ARCH puts that right with the tool, as product work.

## Outcome

The owner chose B, 23 Nov 2026: "Decision: Change the job branch's form as recommended (B)". Built with a test that
makes `job/orders.1` beside an old flat `job/orders` (where `job/orders/1` is refused by git: "'refs/heads/job/orders'
exists; cannot create 'refs/heads/job/orders/1'"), and reads an old `job/dates/3` and an old merged `job/pricing/9` (the
next job of pricing is `job/pricing.10`). Entry "The form of a job's branch" in `design-decisions-2.md`.

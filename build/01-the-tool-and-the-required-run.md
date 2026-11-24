Length: 117 lines. Last section: "8. Not settled here".

# Process4 build specification, part 1: the tool and the required test run

Written by Claude (a design worker) on 18 Nov 2026. **Status: proposed. Nothing here is built and nothing here has run.** It answers items 4 and 8 of part 10, section 2 of the design (`process4/definition/process4_definition_v7/`, all eleven parts read in full, 902 lines). It adds no rule to the design. Reconciled the same day with the design and build texts 2 to 5. "The earlier tool" is the one in this repository at `tool/`, with `shims/process-gate.yml`. Section 4, the commands, is in `01b-the-commands.md` (build text 1b) since 19 Nov 2026, to keep each file under 24,000 bytes; the numbers are kept.

Marks: **Decided here:** a choice of this text, with what it gives and costs; the owner or PROCESS can overrule any. **Unproven:** never shown to work. **Record:** stated in a named file of this repository; not seen to run by me.

## 1. What carries over, what is dropped, what is new

**Carries over** (the code exists and ran in the earlier process):

- One program, a fresh process for each command, run as `node <copy>/tool/<name>.mjs <command>` (`tool/p3.mjs`): the command table, the argument reader, one plain line on failure and exit code 1.
- GitHub reached only through the `gh` program and `git`, with no token held or read by the tool (`tool/lib/util.mjs`, `tool/lib/github.mjs`): reading and opening a pull request; listing and rewriting comments; the hidden-mark comment holding one JSON block; reading a commit's check runs; marking ready by the session proxy's own route first and `gh pr ready` second.
- The merge call itself: one request, merge commit, guarded by the commit id that was tested (`mergePR` in `tool/lib/merge.mjs`).
- The run on GitHub: one workflow on every pull request, on GitHub's merge of the pull request into its base, with the tool fetched at the version the base branch names, credentials not kept in the checkout, and product code started with the token variables removed (`shims/process-gate.yml`, `NO_TOKENS`).
- The suite runner: a module's test command run over a list of test files, the default being all of them (`tool/lib/suite.mjs`). It already takes a shorter list.
- The scope rule's shape: nothing when no code changed, the job's module otherwise (`tool/lib/gate.mjs`).
- The tool's tests: Node's own test runner, with GitHub calls passed in so that tests replace them (`tool/test/`).

**Dropped** (each could stop work, or built up records): the ledger and its checks; the receipt; the check that a job changed only its own files; the check that new tests fail with the change reverted; the "zero tests ran" finding; the record check (size, paths, approvals); `--reviewed` / `--no-review` on merge; merge bringing the branch up to date, writing a row and waiting for a second run; the run's comment on the pull request and the artifact that vouched for it; metrics; `status`; the state branch; the submodule entry.

**New:** every other command of section 4 (build text 1b), and the related scope of section 5.

## 2. Where the tool lives, its language, and how a session gets it

- **Where.** The process's repository has five folders: `tool/` (entry file `tool/p4.mjs`, libraries in `tool/lib/`, tests in `tool/test/`); `shims/`, with the workflow a product copies, `shims/module-tests.yml`, and the list of forbidden commands a product copies as its `.claude/settings.json`, `shims/claude-settings.json` (the design, part 6, section 2); `starting_texts/`, one text for each role (part 4, section 11), of which the tool fills in a job's and a walking session's; `design/`, the design's eleven parts; and `build/`, the build texts. PROCESS's own folder is a sixth.
- **Decided here:** the language is plain JavaScript modules on Node 22 or newer, no build step. Gives: the carried-over code is reused; the reader that proved the notice is TypeScript's, a Node program; Node is on GitHub's machines and in the sessions. Costs: a product in another language still needs Node on the machine.
- **Decided here:** the tool has one dependency, the `typescript` package at one exact version (5.6.3 was the version studied), named in `tool/package.json` with a lock file and installed with `npm ci` when the copy is fetched. Gives: both listings of a comparison use one reader version. Costs: the fetch needs the public package registry. Commands that do not read code must work without it.
- **How a product names its version. Decided here:** the process config names the process repository's address and one full 40-character commit id of its main branch, beside the version's name (build text 2, section 7). No submodule entry and no branch name. Gives: one place names the version, and it reads the same on GitHub's machines and in a session. Costs: any pull request can change the line; the design already says nothing physical stops that (part 6, section 7).
- **How a session fetches it. Decided here:** each session's first command, written in its starting instructions (for ROOT, in the owner's plain prompt), is one line, the fetch line, which names the commit id once, as a shell variable: `git clone` of the process repository into `$HOME/process4/<commit id>`, checkout of that commit, `npm ci` in `tool/`. Every later command is `node $HOME/process4/<commit id>/tool/p4.mjs ...`. Gives: the copy is outside the product's working tree, so no job commits it. No session edits it; that is held by text, since cloud sessions run with full rights and a file permission would not stop a write (measured 22 Nov 2026). Costs: the fetch is not made by the tool, the one exception the design names (part 6, section 3), and it is a judged act.
- **Record:** in the earlier process every session held one repository and fetched the process as its first command, `git submodule update --init .process`, from the public process repository, with the deny list loaded (`process4/evidence/permissions_inventory.md`, probe row 17). **Unproven:** that a plain clone to a folder outside the repository works the same from a one-repository session and leaves the deny list loaded; that it works if the process repository is private; all of it on Codex. The reserve is the earlier route, a submodule entry.
- **What the tool reads from the product:** the process config and the module list (each module's name, by which it is identified, its order, code paths, test paths, interface files and declared uses). Their forms are in build text 2 (`02-the-forms.md`), sections 3, 4 and 7.

## 3. Signing in, and what the permission checker sees

- **In a session.** The tool starts `gh` and `git` as child programs. The harness has already connected them to GitHub as the sessions' second account through the session's proxy. The tool holds, reads and prints no token, and removes the token variables from every `git` it starts. Only GitHub's REST calls are used; the earlier process measured that sessions could not reach the other interface (note in `tool/lib/github.mjs`).
- **On GitHub's machines.** The workflow's own token, read-only by the owner's setting; the required run starts no product code (section 5).
- **Limits.** Every write obeys GitHub's rate-limit answer: it waits as told and tries again up to four times, then fails. `merge` waits until a minute has passed since the last merge into the same branch. `push` keeps to six a minute. No queue of later writes is kept.
- **The deny list** takes `git push` and `gh` away from the session's own commands. It does not reach programs the tool starts.
- **One judged act for each command.** The checker sees one line, `node <copy>/tool/p4.mjs <command> <arguments>`, and judges it against the owner's approvals.

| Command | What the checker sees as the act |
|---|---|
| `branch` | Making a new branch in the product's repository |
| `push` | A push to the session's own working branch |
| `open`, `ready`, `close` | Opening a draft pull request; marking it ready; closing it unmerged. `open`, `close` and `push` may also write a comment on it; `open --module` and `walk open` also rewrite a shared-state comment |
| `test` | Running a pull request's module tests in the session's own checkout, writing the test record on the pull request, and asking GitHub to run the required run again |
| `merge` | Merging a pull request into the tranche branch (or the tranche's into main) after the required run passed, with no person's review |
| `release prepare`; `release publish` | Making an unpublished release, or with `--development` a pre-release with its tag; publishing a release, with the owner's approval typed in that session |
| `notify`, `state write`, `next-job`, `walk write` | Rewriting a comment on an issue; `notify` also rewrites an open job's block |
| `walk open`, `walk close` | Opening an issue in the product's repository; closing it |
| `listing`, `finished`, `round-done`, `results`, `failed-runs`, `state read`, `check`, `related`, `latest-version`, `walk areas`, `walk text`, `walk read` | Reading only |

**Unproven:** every row. No approvals wording for Process4 is committed, and no act of this tool has been judged. Trial item 2 measures `merge`.

## 5. The tests of a pull request, and the required run

Since the owner's decision of 24 Nov 2026 ("the update plan as laid out"), a pull request's module tests run once, in the session that owns it, and GitHub's required run only reads the result (the design, part 2, section 6).

- **Where the tests run.** `p4 test` (build text 1b, command 27), in the job's own session, as one background command of up to two hours that the session waits for within its turn; or in ARCH's session for a pull request that is not a job's and changes module code or tests. The session's checkout must be clean and at the pull request's head commit, so the tests run on what was pushed, with the dependencies the session has installed.
- **The scope** is decided on GitHub's merge of the head into the base's newest commit, made by `git merge-tree` into a temporary checkout outside the working tree, by the steps below. A merge conflict fails plainly: the job merges the base in first.
- **What runs.** For each module in scope, `check` and then the module's test command over the files in scope, one module after another, as before. A check disagreement counts as a failure.
- **The test record.** One comment on the pull request, hidden mark `<!-- process4-test-record -->`, rewritten in place (build text 5, section 5): the commit, the job block's notice count then, the scope and why, the files, the counts, pass or fail, and the fails across every run. Scope nothing writes a pass with no files.
- **After a pass** `p4 test` asks GitHub to run the head's newest required run again, so a run that started before the record passes. Where none exists, or GitHub refuses, it says so in one line.
- **`ready`** runs nothing. It marks the pull request ready only where the record stands for its head (a pass, at that commit, made after every notice the job block holds), or where the scope is nothing and no notice has reached the job. Otherwise it says why and marks nothing.
- **What defines the required run.** One workflow file, `.github/workflows/module-tests.yml`, copied into the product from `shims/module-tests.yml`. It runs on every pull request event that changes the head, the base, or draft to ready.
- **Its one name.** The check GitHub requires is named `module-tests`, the workflow's one job. A product changes no setting for the update.
- **What it does.** It holds the read-only token and runs no product code and installs none of the product's dependencies; it ends within ten minutes. It reads the process config **at the base branch's commit**, clones the process repository at the commit it names (so the pull request cannot move the version that judges it; where the base has no process config, the head's is used and the run says so), reads the job block and the test record with GitHub's REST interface, and runs `run verdict`. That passes when the steps below give **nothing**, or when the record stands for the head; otherwise it fails with `no pass recorded for <sha>; run p4 test`, or why the record does not stand. It writes a summary. For the verdict a told job always needs its record: the run does not make the related list.
- **Removed by the update:** the run's two parts, part two's installing and running of tests on GitHub's machines with the token variables removed, its 45-minute limit, and a second run of a job's tests.

**How the scope is decided,** in order (`decideScope`, used by `p4 test`, `ready` and the verdict):

1. The base is the main branch: **nothing**, passes at once (the tranche's own pull request).
1a. A draft: **nothing** for the required run, which passes it at once; `p4 test` decides as for a ready one.
2. No changed file is under any module's code or test folders, by the module list of the merged result: **nothing**, passes at once.
2a. The head branch is a dropped tranche's, `drop/<tranche>` (build text 1b, command 26), and every file it changes is byte for byte the main branch's (`origin/main`), or absent from both: **nothing**, passes at once, as step 1 (design part 3, section 5; the owner's decision of 24 Nov 2026). If one file is not the main branch's, or the main branch cannot be read, the steps below apply and the summary says which file.
3. The head branch is a job's, `job/<module>.<n>` (build text 1b, command 1), and its job block says `told`: **related**: the list that build text 5, section 7 defines, chosen by whole file, and one step wider each time the tool loses the thread, up to the whole module. An empty list is a pass with no files.
4. The head branch is a job's otherwise: **whole module**, that module only.
5. Any other branch that changes module code (the mechanical edit): whole module for each module touched, tested by ARCH's session. One trial-only line of the process config asks for none (build text 2, section 7).

- No scope runs a module's `walk/internal/` or `walk/external/` folders, which lie under its `tests` paths (build text 3, section 3).
- A test file the module list gives to another module, unchanged, changes no module file, so it is not run for the move; it runs at the new owner's next job.
- **Decided here:** a module with no test files passes, and the summary says none ran. Gives: no refusal the design did not approve. Costs: a job that wrote no tests is not stopped.
- **GitHub settings that name it** are the owner's act 10 (build text 4, section 4).
- **Unproven:** all of it: the background command of two hours, the re-run asked after a pass, the verdict on GitHub, and the related scope.

## 6. The tool's own tests

- **What they cover:** each command against replaced GitHub calls (what it sends, prints, and does on each failure); the slot rule giving the same answer for the same inputs; finished and round-done; the scope rule, one case for each of the five steps and for losing the thread; state writes, the four tries, an ended note removed, the lane refusal; the listing and notice over the recorded changes from the notice's proof (150 changes on eleven made-up modules, in `notice-proof/` of the probes repository; **not read by me**), each with the answer recorded for it.
- **When they run:** only where the tool changed. The workflow named `tool-tests` in the process's repository is that repository's required run and reports on every pull request. It runs the tests only on a ready pull request that changes a file of the tool (`tool/`, `shims/`, the two starting texts the tool fills in, or the workflow itself); a draft, and a pull request that changes no such file, pass at once. Before pushing, PROCESS runs only the tests of the tool it changed, and none where no tool changed.
- **Never on a product's work.** A product's workflow fetches `tool/` and runs commands from it; nothing in `shims/` or in any command starts `tool/test/`.
- **Decided here:** the size of a role's text, a record or a requirements file is not among them (part 5, section 3).

## 7. Build order

The order is build text 4's (`04-the-trial.md`, section 3), which rules. What each stage builds of the tool:

0. Nothing: one throwaway script.
1. The fetch line; `branch`, `push`, `open`, `ready`, `results`, `merge`; `state read`, and `state write` with `--create`; the workflow with scopes 1, 2 and 4.
2. No command: the standing roles' texts, and the trials of the shared state.
3. `next-job`, `finished`, `round-done`, `failed-runs`, `close`.
4. `listing`, `notify`, `check`; then scope 3 and `related`.
5. The walk commands.
6. Scope 5; `release prepare`, `release publish`.

**Who builds it** (part 4, section 11): a building session that holds the process's repository alone. The tool is built; only PROCESS changes it, and the owner merges none of its pull requests (the design, part 4, section 11). Stage 1 needs the owner's acts 1 to 8 and a plain-started session.

## 8. Not settled here

Everything in this text is unproven; each doubt is marked where it lies.

1. **Whether the process repository is public.** The fetch on GitHub's machines assumes it is, as the earlier one was. If private, the required run needs a token to fetch the tool.
2. **The mechanical edit's scope** (step 5): whole module for each module touched, tested by ARCH's session; trial item 9 can try none.
3. **The owner's approvals** must name the fetch, each act of section 3, and the tool's path; the proposal in `owner_acts_and_approvals.md` was written before the path existed.
4. **Codex:** how `gh` and `git` are signed in there, and whether a child can fetch, are not known (part 8).
5. **The proof's data** and the earlier tool's `github push` (on another branch) were not read.

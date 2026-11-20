Length: 121 lines. Last section: "5. Candidate points to raise with PROCESS".

# Starting a product on Process4: the owner's acts, and what the trial taught

Research for the civicsmith lane, 20 Nov 2026, read at `process4` main `19844b7`. "Trial" = `neobobkrause/process3-probes`,
branch `p4-tranche`. **Inference** marks a conclusion no source states.

## 1. The ten acts of design part 7 §4

The trial did acts 1-8 before stage 0 (build/04 §2), act 10 at stage 1, act 9 at stage 2. How acts
1-6 were done is **not recorded** here; the set-up log starts after them (coordination/trial/setup_log_19nov.md).

| # | Act | Who | Needs | Trial showed | Source |
|---|---|---|---|---|---|
| 1 | A second GitHub account for the sessions | Owner | GitHub sign-up | **Worked.** The sessions act as `believeinoakland` | stage0_report step 5a |
| 2 | Give that account write access to the product's repo and the process's repo, and accept as that account | Owner | Collaborator invitation | **Worked** for process3-probes and process4. Civicsmith needs a new invitation (**inference**) | stage0_report; setup_log |
| 3 | Repo settings: merge commits, no auto-merge, no auto-delete of branches, read-only Actions token, no repo secrets | Owner | Settings page | **Not reported.** Seen: a PR opened before main had a workflow got no run (close and reopen started one); with "require branches up to date" off there is no Update branch button | setup_log 01:03 block |
| 4 | Rule on every branch: no deleting, no overwriting, nobody excepted | Owner | Ruleset | **In force.** It stopped the "delete p4-tranche" route, which would have needed the rule loosened first | tranche-unrelated §"What the tool already offers" |
| 5 | Connect Claude to GitHub as the second account, and install the Claude GitHub App on both repos | Owner | claude.ai connector; App install | **Worked.** A session's `add_repo` with push access to process4 was refused once | setup_log |
| 6 | Make the deploy token and enter the secret values in the cloud environment. A session checks the environment for the permissions-management settings and proposes them if missing; the owner clicks to approve | Owner, plus a session for the check | Environment settings page | **Partly.** There was no deploy token, because stage 5 (walks) was never reached. The `autoMode` block was added late, through the BIO environment's setup script, after refusals of type "Unsanctioned Communication". The route where a session proposes the settings and the owner clicks has **not been tried** | automode-classifier-strategy-19nov; process-refresh-cross-repo-19nov |
| 7 | Decide the process repo's approvals in PROCESS (drafted or typed) and land them, with the forbidden commands, by clicking Merge on PROCESS's PR | Owner + PROCESS | PROCESS session | **Done for process4.** The owner landed PROCESS #4's draft on main himself (`2276962`). Whether that was through a PR that PROCESS placed is not stated. Forbidden-commands master: `shims/claude-settings.json` (PR #89) | process/handover.md; design-decisions "owner never edits" |
| 8 | Do the same for the product, in a plain session started on the product repo for this one act. That session also makes the tranche branch from main | Owner + plain session | Product repo session | **Failed in the trial.** Approvals were edited directly on main (PR 351, and the 20 Nov approvals). `p4-tranche` was made with unrelated history (§3) | owner-acts-without-files; tranche-unrelated |
| 9 | Start ROOT: product repo only, the tranche branch, Auto mode, a plain prompt | Owner | `process.json` already on the branch (the prompt fetches the version it names) | **Worked** (stage 2, 03:21 UTC). Faults: ROOT ran on opus-4-8, not 5.5; a first watcher had no checkout; new sessions do not inherit the starter's repo; tag prefix `product:` refused; ARCH's filled text over the size limit then in force | setup_log findings (d)-(f) |
| 10 | Once the required run has reported, rule on main and the tranche branch: PR only, that run passing | Owner | One ruleset (build/04 §4: 0 approvals, merge only, check `module-tests`, source Actions, no bypass) | **Worked, before act 9.** It was added after trial merge 1, and `module-tests` had reported before it was required. Requiring the check before its first run was **not tried**. A mistyped check name ("tool-checks") was corrected on process4. Main's old ruleset still required Process3's `gate`, which nothing produces. That blocked the option-C merge until the owner changed it | setup_log; tranche-unrelated §Outcome |

## 2. The permissions-management check, and the PROCESS↔product registry

**The check (part 7 §5; design-decisions "Checking the environment's permissions-management settings").**
- The `autoMode.environment` and `autoMode.allow` blocks live only in `~/.claude/settings.json` or in managed settings, never in a repo.
- In the cloud, the environment's setup script writes them, and they take effect only at a fresh session start.
- Before ROOT starts, a session reads the environment and reports whether the blocks are present. If they are missing, it proposes the change through the harness's prompt, and the owner clicks to approve. He never pastes a script.
- The process repo's approvals allow PROCESS to make that proposal (CLAUDE.md).

What exists:
- The BIO block trusts "every neobobkrause/* GitHub repo" and sanctions messaging, starting and archiving among the account's role sessions (process-refresh-cross-repo).
- PROCESS now runs on **BioDefault** (process/handover.md, check 1).

What civicsmith needs (**inference** from the above):
- The environment its sessions run under carries the block.
- The block's wording covers civicsmith's repository. If the repo is under `neobobkrause/`, the BIO wording covers it. If it is under another owner, the block must name it.
- If civicsmith gets its own environment, its setup script needs the block too.
- The check is made on the account that civicsmith will actually run under (§3d).

Not proven:
- That the block brings refusals to zero (part 7 §5).
- That a cross-repo `create_session` or archive passes. ROOT's archive of a PROCESS session was refused twice even with the block in place (part 7 §3; root-refresh-of-process-failed-again).

**Registry (build/05 §§2,4; design-decisions "How the coordinator finds the live PROCESS"; starting_texts/process.md, root.md).**
- `handover-process` on process4 issue #33 holds `products: [{product, root}]`. PROCESS #5 has entered process3-probes ROOT #4 (coordination/owner_page/desk.html).
- The product's own `roles` record holds `process`. It is `"none"` until PROCESS announces itself, and ROOT writes it from PROCESS's start message.
- The owner seeds a product's ROOT into the registry once. After that, ROOT messages the PROCESS named in `roles.process` at each of its starts.

For civicsmith:
1. The owner starts civicsmith ROOT (act 9). It names itself `civicsmith ROOT #1`. Its shared state is created by `state write --create`.
2. PROCESS's registry needs `{product: civicsmith, root: <id>}`. The texts have PROCESS ask the owner "where a product you serve has no ROOT in the registry", but only as part of PROCESS's start (process.md line 20).
3. Until PROCESS messages civicsmith ROOT, `roles.process` stays "none", and the coordinator surfaces "start PROCESS" on the owner's standing page even though a PROCESS is running (part 6 §7). See §5 point 4.
4. Cross-repo messaging works in one account; cross-repo `gh api` reads get 403 (part 7 §3).

## 3. Trial faults that bear on a product with existing history

**a. Tranche branch not made from main.**
- Fault: `p4-tranche` had its own root commit and could not merge into main.
- Cause: build text 4 stage 1 read as if the repo were empty. Act 8 and part 6 §2 already said "from main".
- **Fixed in text:** build/04 stage 1 now says "also where main already holds an earlier history" (PR #93, `56a8c18`; decision "fix the setup text").
- One-off repair: option C, an unrelated-histories join by ARCH (PR 383, merge commit `96a4dd7`), followed by the owner's PR 384 from main into the tranche. Done 20 Nov.
- For civicsmith: make the tranche branch from main's newest commit with `p4 branch <name> --into main` or an equivalent (process/research/tranche-unrelated-to-main-20nov.md). First-content PRs go into it.

**b. Old process gates still in force on an existing main.**
- Measured: main's ruleset still required Process3's `gate`, which nothing produces; the merge into main was blocked until the owner changed it to `module-tests` (tranche-unrelated §Outcome).
- **Inference:** civicsmith, as a Process3 product, very likely has the same kind of ruleset, the old workflows and possibly repo secrets. Before act 10, list them and set act 3 and act 10 against them. Otherwise an old required check blocks every PR, and old workflows run on new PRs.
- **Open:** act 3's "no repository secrets" may conflict with secrets civicsmith uses today.

**c. Approvals landing.**
- Measured: the owner edited approvals directly on main twice (PR 351, then the 20 Nov text). The tranche then held older approvals, which caused a `CLAUDE.md` conflict and then a two-file difference (owner-acts-without-files; tranche-unrelated).
- **Fixed in text** (decision "owner never edits a file", options B and (ii)):
  - The coordinator or PROCESS drafts the approvals. A session places the approved text unchanged in a PR that changes only that file, and the owner clicks Merge.
  - The forbidden commands are copied from `shims/claude-settings.json`.
  - First landing is on main. Later edits go on the tranche branch, after a stop. If the branches differ, the owner chooses between them with GitHub's buttons.
- **Still unproven:** that the checker lets a session place the text. That route works only once the repo's existing approvals allow it (part 6 §2). Civicsmith's main carries its Process3 approvals, and their wording was not read here.

**d. Reused repository, and the account switch.**
- The trial reused a repo with Process3 history. That brought the faults in a, b and c and left Process3 files on main (option C's tree replaced them).
- For civicsmith the old code is the product. Main must keep it, and the tranche branch inherits it.
- Account switch: the trial was stopped at 18:12Z for the owner's account-switch instruction, and stage 7 has not run (build/06 §7: "everything" unproven).
- Decision B (20 Nov): PROCESS and its products share one Claude account and move together.
- **Inference:** civicsmith should be set up on the account it will live on, after the switch or together with it. Otherwise its acts 5 and 6 and the settings check must be redone at once, and old sessions may not be archivable from the new account (build/06 §4 step 2).

## 4. What remains unproven or unknown for a first real product

1. All of part 7 §4 on a real product. Part 10 §5 lists what only a real tranche shows: the merge rate, fault frequency and cost.
2. A session placing the owner's approved approvals text, and the forbidden-commands copy, in a PR (part 6 §2).
3. The settings check carried out through a session's proposal and the owner's click (part 7 §5).
4. Requiring `module-tests` before it has ever reported (part 7 §4, "Not known").
5. **Who writes the first Process4 content on an existing product**, and where, before ROOT starts. That content is `process.json`, the module list, the `module-tests` workflow, `.claude/settings.json` and the shared-state issue. The trial used a plain session acting as ARCH, which ran `state write --create` in ROOT's place (build/04 stage 1). Part 7 §4 names no actor or act for it. The ROOT prompt needs `process.json` to exist (starting_texts/root.md part A).
6. A module list for real code: the trial's modules were made-up (build/04 §5); the reader on real code and test times are unknown.
7. Whether Process3's leftovers on civicsmith main (workflows, `.claude/` files, rulesets, issues and open PRs) interfere with Process4.
8. Cross-repo session create or archive (part 7 §3); the account's session ceiling (~50 once).
9. Set-session-title naming: worked three times for PROCESS, not yet recorded (desk.html).
10. The checker passing merges at a real rate on a real product (part 6 §5).

## 5. Candidate points to raise with PROCESS

1. **Part 7 §4 names no act for the first Process4 content on an existing product.**
   - Grounds: §4 point 5; build/04 stage 1 covers only the trial; ROOT's prompt reads `process.json`; ARCH's acts (starting_texts/arch.md) assume ARCH exists.
   - Ask: does act 8's plain session also write, by the tool into the tranche branch, `process.json`, the module list, the workflow and the forbidden-commands copy? And who runs `state write --create`?
2. **Act 3 and act 10 are silent on an existing repo's old rulesets, required checks, workflows and secrets.**
   - Grounds: measured `gate` block (§3b).
   - A clarifying line could be: "replace, don't add to, existing rules". That is a correction of setup text, not a new gate.
3. **Act 8 meets the product's existing approvals.**
   - Grounds: part 6 §2 "Unproven" clause; civicsmith main's Process3 `CLAUDE.md` may forbid a session to change it.
   - The text gives no route that keeps to "never edits a file" if the placing is refused. The handover's fallback, "his one-time copy into GitHub's editor", contradicts part 1 §3.
3b. Part 6 §2 says a coordinator drafts a product's approvals, but at act 8 no coordinator exists. Who drafts at first landing: PROCESS, or the plain session? The text is silent.
4. **Registry when a product starts while PROCESS is already running.**
   - Grounds: process.md line 20 asks the owner only "on start"; ROOT messages PROCESS only if `roles.process` names it (root.md line 23). So they never meet unless the owner tells PROCESS, and the coordinator meanwhile asks for a second PROCESS.
5. **Part 7 §4 still says "Not known: whether act 10 can be done before act 9".** The trial did act 10 before act 9 (setup_log 01:43 to 03:21). Only "before the run's first report" is still unknown. This would record a measured fact.
6. **Part 7 §4's "none of it has been carried out for Process4"** is out of date: the trial carried out acts 1-10. "Carried out for the trial, not for a real product" would record a measured fact.
7. **The `autoMode` wording names repos by owner prefix** (`neobobkrause/*`). If civicsmith's repo has another owner, the check must catch that the block does not cover it.
   - Grounds: process-refresh-cross-repo §"decisive fact". Part 7 §5 says only "names the process's repository and its products' repositories".
   - This is an **inference** until civicsmith's repo address is known.
8. **Order relative to the account switch.** Part 7 §4 and build/06 do not say whether a new product should start before or after a pending switch.
   - Grounds: decision B (one account); build/06 §4 step 2 unproven.

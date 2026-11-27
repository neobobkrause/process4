# Part 7 (continued): not proven, the owner's acts, and the settings

Length: 45 lines. Last section: "5. The permissions-management settings".

Part 7's other sections: 1 and 2 in `07-`.

Everything in this part is specific to Claude Code.

## 3. Not proven on Claude Code

- Whether the cloud can hand a session a copy of its branch about an hour old.
- Whether approvals that reach a session after its start count the same as approvals read at the start.
- Whether a session's browser can reach the development site.
- Whether a session can create or archive a session on another repository. Cross-repository messaging between roles works with the permissions-management settings (section 5) in place; a cross-repository session-lifecycle act, such as ROOT archiving the process-repository PROCESS session, is refused even with them in place.
- A cross-repository read of another repository's shared state is refused. A session is scoped to its own repository; a `gh api` read of another repository's issue returns HTTP 403 ("GitHub access to this repository is not enabled for this session"), even for a public repository, in both directions (a product session reading the process repository, and the reverse). A plain `git` clone of the public process repository works (the session's copy of the process); only the `gh api` read of its issue — where the shared state lives — is refused.
- Whether a session can reach a session under a **different Claude account**. Session-to-session acts are scoped to one account by the harness's own tools — creating a session requires the same account, and a listing shows only the account's own sessions — so a cross-account reach (messaging, listing, create, archive) is treated as unavailable. PROCESS and the products it serves therefore run under one account, and an account switch moves them together (build text 6, section 1). Not measured directly across two accounts.
- How many live sessions the account bears; new starts can fail silently at about fifty.
- Whether a program goes on reaching GitHub from a session at a real rate. With the ordinary push and every `gh` command refused to the session itself, a script run with `node` that starts `gh` and `git` can read the repository's pull requests, open an issue, write and rewrite a comment in place, and push a branch, acting as the sessions' account. GitHub's other interface (GraphQL) is refused by the session's route; only REST calls work.

## 4. The owner's acts to start a product

**Unproven** for a real product.

Before these acts PROCESS starts the product's onboarding lane (part 6, section 8). The owner starts a read-only session on the product's repository with the lane's brief, and its report reaches the lane. The lane keeps the product's page of what is waiting for him, which gives each act below as fully detailed steps, starting with GitHub (acts 1 to 5), and writes the brief for act 8's session. Each change to a setting among these acts is his own click from that page.

1. Have a second GitHub account for the sessions.
2. Give that account write access to the product's repository and the process's, and accept as that account.
3. Set each repository's settings: merges by merge commit, no automatic merging, no automatic deleting of branches, a read-only token for GitHub's machines.
4. Make the rule for every branch: no deleting and no overwriting, with no one excepted.
5. Connect Claude to GitHub as the second account, and install Claude's GitHub App on both repositories. Sessions act on GitHub through this connection, so no GitHub token is made (part 6, section 8).
6. Make the product's tokens, once, each with every permission the product's development will need at every stage (part 1, section 3); the lane's page lists them. Enter the secret values in the fields of Claude's cloud environment settings page. A session checks that environment carries the process's permissions-management settings; where they are missing, he approves with a click the change it proposes (section 5).
7. Decide his approvals in PROCESS's session and land them, with the forbidden commands, on the process repository's main branch (part 6, section 2).
8. Do the same for the product, in a plain session he starts on the product's repository for this one act, with the lane's brief. Before the product has a coordinator, that session drafts the product's approvals (part 6, section 2). It also writes the product's first Process4 files — `process.json`, the module list, the required-run workflow and the copy of the forbidden commands — by pull request into main, and then makes the tranche branch from main's newest commit, also where main already holds an earlier history.
9. Start ROOT: the product's repository alone, the tranche branch, Auto mode, a plain prompt.
10. Once the required run has reported for the first time, make the rule for the main and tranche branches: change by pull request only, with that run passing, replacing any check an earlier process required there.

## 5. The permissions-management settings

Auto mode's checker (section 1) is steered by `autoMode` settings the environment provides. The checker reads them from the session's user settings (`~/.claude/settings.json`) or the account's managed settings, and never from a repository: a repository's `.claude/settings.json` is not read for `autoMode`, so these settings cannot live in the product's or the process's repository.

- **What they are.** An `autoMode.environment` block that names the process's repository and its products' repositories as mutually trusted internal work, and an `autoMode.allow` block that names the roles' cross-session and cross-repository coordination — starting, messaging and archiving the account's role sessions, PROCESS in its own repository among them, and making their scheduled wakes — as sanctioned routine. Each keeps the built-in defaults (`$defaults`).
- **Why.** Without them the checker, by default, trusts only a session's own repository and treats any other destination as external; a product session's message to PROCESS in the process's repository is then refused, unevenly, as "Unsanctioned Communication" (one of the checker's server-side policy categories, with "Undermining Oversight"). The settings remove the cause by telling the checker these repositories and acts are internal and expected.
- **Where they are written.** In a cloud session the per-session user settings are rebuilt at each start, so the environment's setup script writes these settings into `~/.claude/settings.json`, and beside them `"idleCompaction": false`, so that a session left idle is not compacted; a change takes effect only when a session starts fresh. The `permissions.deny` list (part 6, section 3) and the working rules (part 6, section 4) stand unchanged beside them.
- **The check, on setup and on an account switch.** Before ROOT is started — at a product's start, and whenever Process4 development or a product's development moves to another Claude account — a session reads the cloud environment the sessions will run under and tells the owner whether it carries these settings. Where they are missing, the session proposes the change through the harness's own approval prompt, and the owner approves it with a click. He never pastes a script.
- **Unproven:** that these settings reduce the checker's refusals of sanctioned acts to zero. The settings are expected to work, but the checker remains probabilistic; only `permissions.deny` is an absolute gate, and it blocks rather than permits. Also unproven: that the harness honours `"idleCompaction": false`.

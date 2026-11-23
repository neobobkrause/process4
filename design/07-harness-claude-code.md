# Part 7. The harness table for Claude Code

Length: 87 lines. Last section: "5. The permissions-management settings".

Everything in this part is specific to Claude Code.

## 1. What carries each term

| Term in parts 1 to 6 | On Claude Code |
|---|---|
| Session | A session in Claude Code's cloud, handed a copy of one repository when it starts |
| The owner's standing approvals | A block of the owner's text in the repository's `CLAUDE.md`, read once when a session starts |
| Forbidden commands | The deny list in the repository's `settings.json`. A session that holds more than one repository loads no deny list |
| Unattended mode and the permission checker | Auto mode: the platform's automatic checker judges each risky act and may refuse it |
| One session starting another | A separate session on the account, started by a session |
| A message; interrupting | A message sent to a session wakes it. A session can be interrupted |
| Scheduled wake | A scheduled task on the account |
| Secret values, the deploy token and a product's production signing keys among them | Settings of Claude's cloud environment, entered by the owner. The only route measured to work |
| Instruction files loaded at start | `CLAUDE.md` and `settings.json`. The product's `CLAUDE.md` stays under thirty lines |
| Worker | A helper the session starts inside itself. A worker cannot start workers |
| Fill level | A session reads how full its context is from the harness's own usage data (`get_session`, field `context_usage`), the route the role sessions use. A bare headless `claude -p` reader cannot see it and guesses (early, the safe way); where a session cannot read its fill, it refreshes only at a natural pause (part 5, section 2) |
| Compaction | A full context is shrunk automatically, which loses what was read |
| The time a session can run one thing | About thirty minutes for one command |
| Archiving | A session can be archived and unarchived |
| A notification to the owner | A push notification to his phone |
| The owner's standing page; a lane's design pages | Pages on claude.ai |
| The owner speaking to a role | He opens that role's session and types |
| Grouping sessions under a product | A tag naming the product, set on each session when it is started. Sessions can be listed by tag. Workers are not sessions and so carry none. Not measured |
| The owner seeing each open job | Each job's session is named `<product> <module> #<n>` (the naming row below; part 4, section 11), so each open job is told apart by its module, and the list of sessions shows each one's name and whether it is working, waiting or finished. Whether the list he sees meets the rule is not measured |
| Naming a session | A session's name is set with the harness's set-session-title. A session that keeps a handover record names itself on start, from the generation in that record; ARCH names a job and a walking session when it starts them; the owner-started ROOT and PROCESS name themselves. Seen to work in Auto mode: PROCESS #1, #4 and #5 named themselves, and the trial's ROOT, watcher, ARCH and coordinator sessions carry their standard names |
| Starting instructions | The prompt a session is started with |
| Model and effort passed on | The starter names both when it starts a session. Not measured |
| Planned replacement | The parent starts a fresh session and archives the old one |
| The limit on depth | One session reported a limit of eight. It bounds how many times a watcher can take over before the owner starts a fresh ROOT (part 4, section 6) |
| The shared state | Not carried by the harness. It is on GitHub (part 4, section 4) |
| Connecting the harness to GitHub | The owner connects his GitHub to Claude and installs Claude's GitHub App on the repository |
| A session's browser | A browser on the session's own machine. Not shown to reach the development site |
| A session's copy of the process | A plain clone of the process's public repository into a folder outside the session's working files. Sessions run with full rights, so the file system does not stop a write to it; that no session edits it is held by text |
| What the subscription covers; cost | **Open (a session):** where cost can be read is not named anywhere read |

## 2. Reading, as measured

As measured on Claude Code:

- A plain read returns a file whole up to the harness's mechanical cut, about 25,000 tokens: about 76,000 bytes of dense governing prose, and about 63,000 bytes of table-dense prose. The single-text maximum on Claude Code, 60,000 bytes, sits below both (part 5, section 2).
- A file past the cut comes back as a partial read. In this harness version the tool result carried no notice of the cut, so a session that did not compare the lines returned against the file's length would act on part of a text. The guard is keeping the single-text maximum below the cut, which 60,000 is.
- A file over 256 KB is refused, with no lines returned.

## 3. Not proven on Claude Code

- Why the cloud once handed a session a copy of its branch about an hour old, and whether it still does.
- Whether approvals that reach a session after its start count the same as approvals read at the start.
- Whether a session's browser can reach the development site.
- Whether a session can create or archive a session on another repository. Cross-repository messaging between roles worked once the permissions-management settings (section 5) were in place; but a cross-repository session-lifecycle act was still refused with those settings in place (ROOT archiving the process-repository PROCESS session was refused twice, as "Destructive or Unwanted Actions" and "Undermining Oversight"). PROCESS is therefore started and refreshed by the owner, not by ROOT (part 4, section 5; part 6, section 7).
- A cross-repository read of another repository's shared state is refused. A session is scoped to its own repository; a `gh api` read of another repository's issue returns HTTP 403 ("GitHub access to this repository is not enabled for this session"), even for a public repository, measured 20 November 2026 in both directions (a product session reading the process repository, and the reverse). A plain `git` clone of the public process repository works (the session's copy of the process); only the `gh api` read of its issue — where the shared state lives — is refused. So the coordinator finds the live PROCESS from its own product's roles record, kept current by a cross-repository message, not by reading the process repository (part 4, section 5; part 6, section 7).
- Whether a session can reach a session under a **different Claude account**. Session-to-session acts are scoped to one account by the harness's own tools — creating a session requires the same account, and a listing shows only the account's own sessions — so a cross-account reach (messaging, listing, create, archive) is treated as unavailable. PROCESS and the products it serves therefore run under one account, and an account switch moves them together (part 6, section 7; build text 6, section 1; the owner's decision of 20 November 2026). Not measured directly across two accounts.
- How many live sessions the account bears. New starts once failed silently at about fifty.
- Whether a program goes on reaching GitHub from a session at a real rate. With the ordinary push and every `gh` command refused to the session itself, a script run with `node` that started `gh` and `git` read the repository's pull requests, opened an issue, wrote and rewrote a comment in place, and pushed a branch, acting as the sessions' account. GitHub's other interface (GraphQL) was refused by the session's route; only REST calls work. The owner received no email from GitHub about the issue or its rewritten comment.

## 4. The owner's acts to start a product

Carried out once, for the trial repository (acts 1 to 10). **Unproven** for a real product.

Before these acts PROCESS starts the product's onboarding lane (part 6, section 8). The owner starts a read-only session on the product's repository with the lane's brief, and its report reaches the lane. The lane keeps the product's page of what is waiting for him, which gives each act below as fully detailed steps, starting with GitHub (acts 1 to 5), and writes the brief for act 8's session. Each change to a setting among these acts is his own click from that page.

1. Have a second GitHub account for the sessions.
2. Give that account write access to the product's repository and the process's, and accept as that account.
3. Set each repository's settings: merges by merge commit, no automatic merging, no automatic deleting of branches, a read-only token for GitHub's machines.
4. Make the rule for every branch: no deleting and no overwriting, with no one excepted.
5. Connect Claude to GitHub as the second account, and install Claude's GitHub App on both repositories. Sessions act on GitHub through this connection, so no GitHub token is made (part 6, section 8).
6. Make the product's tokens, once, each with every permission the product's development will need at every stage (part 1, section 3); the lane's page lists them. Enter the secret values in the fields of Claude's cloud environment settings page. A session checks that environment carries the process's permissions-management settings; where they are missing, he approves with a click the change it proposes (section 5).
7. Decide his approvals in PROCESS's session, drafted there on his request or typed by him, and land them, with the forbidden commands, on the process repository's main branch by clicking Merge on the pull requests PROCESS opens (part 6, section 2).
8. Do the same for the product, in a plain session he starts on the product's repository for this one act, with the lane's brief. Before the product has a coordinator, that session drafts the product's approvals (part 6, section 2). It also writes the product's first Process4 files — `process.json`, the module list, the required-run workflow and the copy of the forbidden commands — by pull request into main, and then makes the tranche branch from main's newest commit, also where main already holds an earlier history.
9. Start ROOT: the product's repository alone, the tranche branch, Auto mode, a plain prompt.
10. Once the required test run has reported for the first time, make the rule for the main and tranche branches: change by pull request only, with that run passing, replacing any check an earlier process required there.

Act 10 was done before act 9 on the trial.

## 5. The permissions-management settings

Auto mode's checker (section 1) is steered by `autoMode` settings the environment provides. The checker reads them from the session's user settings (`~/.claude/settings.json`) or the account's managed settings, and never from a repository: a repository's `.claude/settings.json` is not read for `autoMode`, so these settings cannot live in the product's or the process's repository.

- **What they are.** An `autoMode.environment` block that names the process's repository and its products' repositories as mutually trusted internal work, and an `autoMode.allow` block that names the roles' cross-session and cross-repository coordination — starting, messaging and archiving the account's role sessions, PROCESS in its own repository among them, and making their scheduled wakes — as sanctioned routine. Each keeps the built-in defaults (`$defaults`).
- **Why.** Without them the checker, by default, trusts only a session's own repository and treats any other destination as external; a product session's message to PROCESS in the process's repository is then refused, unevenly, as "Unsanctioned Communication" (one of the checker's server-side policy categories, with "Undermining Oversight"). The settings remove the cause by telling the checker these repositories and acts are internal and expected.
- **Where they are written.** In a cloud session the per-session user settings are rebuilt at each start, so the environment's setup script writes these settings into `~/.claude/settings.json`; a change takes effect only when a session starts fresh. The `permissions.deny` list (part 6, section 3) and the working rules (part 6, section 4) stand unchanged beside them.
- **The check, on setup and on an account switch.** Before ROOT is started — at a product's start, and whenever Process4 development or a product's development moves to another Claude account — a session reads the cloud environment the sessions will run under and tells the owner whether it carries these settings. Where they are missing, the session proposes the change through the harness's own approval prompt, and the owner approves it with a click. He never pastes a script.
- **Unproven:** that these settings reduce the checker's refusals of sanctioned acts to zero. The settings are expected to work, but the checker remains probabilistic; only `permissions.deny` is an absolute gate, and it blocks rather than permits.

# Part C: where an administrator tool's state could live, what could call it, and the rules around it (27 Nov 2026)

Research worker for PROCESS #21, brief `brief.md` in this folder. Facts with sources; **inference** and **unproven** are
marked. No recommendation. Read in full: design 06, 06b, 06c, 06d, 06e, 07, 07b, 09, 10; build 01, 05, 06;
`github-limits-account-27nov.md`, `waiting-work-record-size-25nov.md`, `tranche-t3-study-27nov.md`,
`status-from-the-system-27nov.md`; design part 4 §4 (the shared state). Also read: the public repository
neobobkrause/process3 (branches `main`, `tranche`, `process-state`, `process4`; read only, cloned to the scratchpad);
Claude Code's docs fetched 27 Nov (`code.claude.com/docs/en/hooks.md`, `cloud-environments.md`, `settings.md`,
`goal.md`); GitHub's docs fetched 27 Nov (REST rate limits, repository limits, events that trigger workflows,
`GITHUB_TOKEN`, workflow syntax, concurrency; `actions/checkout` v4 README); Cloudflare's KV, D1 and Durable Objects
limits pages; this container's own `~/.claude/` files (keys only, no values).

## 0. What the design already says about where running state lives

- Design part 4 §4: "What sessions say to each other, and the process's running records, never build up as files or
  commits in a repository." The shared state is "a small fixed set of records, each rewritten in place. Each record has one
  writer. It is read and written only through the tool, and writing it needs no merge." Carried as comments of one issue
  in the product's repository. "GitHub keeps no guard against two writes to one comment at the same moment: one is lost,
  silently. So every record has exactly one writing session." "The owner's decisions are not kept here. They are in the
  record of decisions (part 5)", which is a file in the product's repository (civicsmith: `process/decisions-owner.md`,
  `process/lanes/civicsmith/research/setup-session-report.md`).
- So by the design as it stands, durable owner words (a charter's decisions) already live as repository files; only
  running records are kept out of files and commits. Any store that keeps running records as commits (option b, d) changes
  the part 4 §4 sentence above, a process change (design part 6 §7).

## 1. Storage options

### 1.1 Why earlier processes found operational state in a product's repository "a really bad idea"

From process3's own records (public neobobkrause/process3):

- **Where it was.** Process3 kept a ledger on the tranche branch (`process/ledger/<id>.json`, one file per entry, README)
  and its running records on a **state branch** of the product's repository, never merged (`state_branch`, default
  `process-state`; README on `tranche`): addresses, holds, lanes, notices, triage verdicts, messages (`messages/<from>.jsonl`),
  handoffs (`handoff/bob.md`), metrics rows, walk reports, the GitHub usage ledger (`github/use/*.jsonl`). Its approvals
  added "and to the process's state branch" to what sessions may push to (`CLAUDE.md` on `tranche`). Writes were
  fast-forward pushes with fetch-and-retry (README, `start record`).
- **Suspension.** `DECISIONS.md` PD-3 (6 Nov): "the civicsmith account was suspended on 6 Nov at 19:19Z, most likely for
  automated bulk activity. GitHub publishes no limit on git pushes, and push volume is the likely cause: the copy's state
  branch alone took 1,387 pushes in 19 hours, 173 in the busiest hour". Its coordinator, quoted in
  `process4/evidence/causal_forensics.md` (branch `process4`): "1,387 state pushes in 19 h plus PRs/polling on one account
  is what likely got civicsmith suspended." **Cause unproven** (PD-6: a 120/h ceiling "would not have prevented the
  suspension it was set against"). The owner, 27 Nov (`github-limits-account-27nov.md`): "That happened last month before
  process3 had those limits."
- **Volume.** "12,881 of 18,295 commits (70%) were on it" (`process4/evidence/audit_A.md`, REC-1); the state branch held
  8,937 files, among them `notices/triage` 3,125 and `notices/answered` 2,542 (`causal_forensics.md`); "a third of pushes
  are the process's own bookkeeping" (PD-6). The pacing ledger shared to the state branch added "86 share commits / 25
  share-only pushes in an hour" before PD-22 removed it.
- **Guards and stops.** "each record the process keeps ... needs guards on its form, its freshness and its writer, and
  each guard is a place the product can stop" (`causal_forensics.md`). The record check on every push "ran 495 times in
  eight and a half hours, 403 of them on branches where nothing reads it" (`audit_A.md`, REC-10; workflow
  `shims/process-record.yml`, `on: push` to any branch).
- **Write races.** At least six commits and three review rounds went into racing writers on the state branch, 4–7 Nov
  (`ede3b7eb` "State writes redo on a moved tip"; `ebd99a58` retry "cannot-lock-ref and 5xx rejections like fetch-first";
  `5310bc25` "non-fast-forward, landed 5xx on the last try"; `a6654bcb` "a superseded write is dropped"; `f03e161c`; C18
  "append-only state", three reviews).
- **Cannot be removed.** "Remove the state branch, which sessions may not delete and a pull request cannot" (`audit_A.md`
  D25); the scheduled prune that was to squash it (REC-10) needs an overwrite the rules forbid.
- **What process3's own review suggested instead.** REC-1, modified: "move coordination traffic to PR bodies, comments and
  issues, or to a separate bookkeeping repository"; its open question: "Home for transient state: state branch, PRs and
  issues, or a bookkeeping repository | Repository growth; writer conflicts; status latency" (`foundations.md`). Process4
  took the issue-comments route (part 4 §4). `github-limits-26nov.md` adds the counterpoint: process3's notices were
  "files on a state branch, all of one merge's in one commit ... This, more than any pacing, is why process3 never made
  such a burst" as Process4's notify did with comments on 26 Nov.
- Nothing in this repository's research or in `process/lanes/civicsmith/research/` names another reason; the lane's files
  mention process3's ledger and shims only as traces to clear (`civicsmith-facts.md`, `civicsmith-copy-reading.md`).

### 1.2 GitHub's limits that bear on every GitHub option (docs fetched 27 Nov)

- REST "content-generating requests": "no more than 80 ... per minute and no more than 500 ... per hour ... Content
  creation limits include actions taken on the GitHub web interface as well as via the REST API and GraphQL API." **Git
  pushes are not named there.** Whether a push counts against the 80/500 is **unknown** (not stated by GitHub). "You may
  also encounter a secondary rate limit for undisclosed reasons."
- Repository limits (recommendations): "Push rate: ... 6 pushes per minute per repository"; Git reads "15 operations per
  second per repository"; single object "recommended maximum 1MB ... enforced at 100 MB"; on-disk 10 GB; directory width
  3,000 entries; 5,000 branches; 1 merged pull request a minute.
- `GITHUB_TOKEN` (Actions): "1,000 requests per hour per repository"; it is "a GitHub App installation access token", so
  **inference**: its writes are not the sessions' account's (whether they draw on the account's 80/500 is not stated).
- The tool already counts pushes per machine (5.7 a minute in all to one repository; `branch` counts as a push) and every
  non-GET call as a content write (build 1 §3; `tool/lib/pace.mjs`).

### 1.3 The options compared

| | (a) shared-state issue comments (now) | (b) never-merged branch `p4-state` in the product's repository | (c) branch or issue in the process's repository | (d1) git notes in the product's repository | (d2) a separate state repository per product | (e) claude.ai page database | (f) Cloudflare (Durable Object, D1, KV) |
|---|---|---|---|---|---|---|---|
| Survives full stop | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Survives account switch | Yes (build 6 §2: on GitHub) | Yes | Yes | Yes | Yes, if the sessions' GitHub account keeps access | **Inference: no.** Pages are made "under the Claude account the acting session runs under" (approvals); build 6 §2 lists what carries over as what is not in the Claude account | Yes, unless the hosting account changes; its token is re-entered in the new environment (build 6 §3 step 4) |
| Read/write from each session's `node` | Yes, `gh` REST (build 1 §1) | Yes, `git` through the session proxy, as `push` already does | Product sessions: read by plain `git clone` works (the process copy); `gh api` read refused, HTTP 403 (design 7 §3); write not available, and not in a product's approvals | Same repository: **unproven** that the proxy passes pushes to `refs/notes/*` | No: a session is scoped to one repository (design 7 §3); a two-repository session loads no deny list and no project hooks (7 §1; cloud docs) | **No.** Only through the session's own built-in tool, one judged tool call each, never from a program | Yes over HTTPS, once the host is allowed and its key saved as a network secret (owner-approved environment change) |
| Read from a workflow on GitHub's machines | Yes, read-only token | Yes, read-only token | Process repository is public: yes | Yes | Needs a token for the other repository | No | Needs a repository secret |
| Two writers at once | **Silent lost write**, last write wins (part 4 §4); a record in parts is written part by part, not atomically (`tool/lib/state.mjs` `writeRecord`) | **Rejected, retryable.** A non-fast-forward push is refused by git/GitHub; force is forbidden by the branch rule (act 4) and the deny list; the writer fetches, re-applies its change, pushes again. One file per record means writers of different records never conflict in content | As (a) or (b) | As (b), but a ruleset for branches does not cover `refs/notes/*` (**inference**), so nothing on GitHub stops an overwrite made by a program | As (b) | Not read here (the tool's "update merges fields"; no compare-and-swap documented in what I read) | Durable Object: one object serialises its requests (transactional); D1: SQL transactions; KV: "eventually-consistent", changes "up to 60 seconds or more" to be seen elsewhere, "1 per second" writes to one key (Cloudflare docs) |
| GitHub account cost | 1 content write per record write (the tool counts edits as writes); reads 1 GET per 100 comments against 5,000/h | 1 push per write (or per command, if a command's writes are batched into one commit); reads are git fetches, not REST | Process-repository sessions only | 1 push per write | 1 push per write, in another repository | None | None (Cloudflare account limits instead; design 9 §1) |
| Size | 65,536 characters a comment (GitHub's 422, measured 25 Nov); records in parts (`waiting-work-record-size-25nov.md`, 6B) | A file per record: 100 MB enforced, 1 MB recommended; the branch grows forever (see below); directory width 3,000 recommended | As (a)/(b) | Per note object as (b) | As (b) | "a small shared database" (brief); limits not read here | KV value 25 MiB; DO 10 GB per object, key+value 8 MB; D1 10 GB (paid) / 500 MB (free) |
| History | Edits show on the web page (**inference**); REST gives no edit history (**inference**; GraphQL is refused to sessions, design 7 §3) | Full git history, readable by the tool (`git log p4-state -- round.json`), immutable under the no-overwrite rule; every commit's author is the one sessions' account, so a writer's role must be in the message | As (a)/(b) | Git history of the notes ref | Git history | Not read | D1 point-in-time recovery 30 days (paid) |
| "In the product's repository" in the owner's sense | Yes, as an issue; not files or commits | **Yes**: commits and pushes in the product's repository, the form process3 used and the owner warns against | No (the process's repository, which is public, so a product's running state would be public) | Yes, as commits on a non-branch ref | No | No | No |

### 1.4 Option (b), a never-merged branch, in detail

- **Branch rules.** Act 4 (design 7 §4): "Make the rule for every branch: no deleting and no overwriting, with no one
  excepted." So GitHub itself refuses any non-fast-forward update: that refusal is the compare-and-swap, for free. It also
  means the branch can never be deleted, squashed or pruned by anyone without the owner changing his ruleset; process3 met
  exactly this (D25). Act 10's rule (pull request only, required run passing) names only main and the tranche branch, so a
  `p4-state` branch takes direct pushes. The deny list forbids a session's own `git push --force`, `--delete` and pushes to
  main (`shims/claude-settings.json`); it does not reach programs the tool starts (build 1 §3).
- **The owner's approvals.** A product's approvals let sessions "push to their own working branches" (civicsmith draft,
  `approvals-draft-civicsmith-copy-21nov.md`). A branch every role writes is not one session's own working branch;
  process3's approvals had to add "and to the process's state branch". **Inference:** (b) needs his wording in each
  product's approvals, landed by his click (design 6 §2).
- **The required run and workflows.** `module-tests` and `tool-tests` run only on `pull_request` events
  (`shims/module-tests.yml`, `.github/workflows/tool-tests.yml`); no pull request is opened from `p4-state`, so neither
  fires. A `push` event "includes workflows that are not merged into the default branch" (GitHub docs): the workflows that
  run on a push are those in the pushed commit (**inference** from the docs and GitHub's known behaviour). An **orphan**
  `p4-state` (no `.github/` in its tree) fires none; one made from main carries main's workflows and fires any `on: push`
  workflow without a branch filter (process3's `process-record.yml` did, 403 runs where nothing read them). A product's
  own workflows are not known here (civicsmith keeps "the product's four" unchanged, setup-session report).
- **Fetch weight.** The required run checks out with `fetch-depth: 0`, which per `actions/checkout` "fetch[es] all history
  for all branches and tags": every required run would also download `p4-state`'s whole history. A plain `git fetch` with
  the default refspec in a session fetches every branch too (**inference**). Process3 measured "the full checkout of a
  large product took up to 4 minutes" (decision 3A, `process-gate.yml`). What refs the harness's own clone of a session's
  repository fetches is **unknown**.
- **Pushes at civicsmith's size (inference).** Today's state-record writes are about 2–4 a job (`open --module` round +
  waiting work, `next-job` when changed, `notify` waiting work; `github-limits-account-27nov.md`). At 24 jobs an hour that
  is about 48–96 pushes an hour added to about 110 job pushes an hour on the one repository: about 160–200 an hour, against
  process3's 143–173 an hour "in the hours before its suspension" and GitHub's recommended 6 a minute (360 an hour).
  Batching all of one command's writes into one commit (process3's "all of a command's state writes in one push",
  `github-limits-26nov.md`) lowers it. The tool's push share (5.7 a minute in all) would have to carry them.
- **Compared with (a) for the account's 80/500.** If pushes do not count as content-generating requests (unknown), (b)
  moves 48–96 writes an hour off the 500 (10–19 percent of it, **inference**) and onto the unpublished push behaviour
  process3 is thought to have tripped.

### 1.5 Options (c)–(f), what decides them

- **(c)** A product session cannot read the process repository's issue (`gh api` 403, both directions, even public;
  design 7 §3, `coordinator-cannot-read-process-liveness-20nov.md`), but can `git clone`/`fetch` it, since it is public.
  So a **branch** in the process repository is readable by every product session and writable only by PROCESS's sessions;
  an issue there cannot be read by product sessions. Product sessions cannot write it (scope; their approvals name only
  their repository; process4's `CLAUDE.md` says a session acts on a product's repository only from a session started in
  it). A product's running state would be published in a public repository.
- **(d1)** Git notes: not proven through the session proxy; not covered by a branch ruleset (inference); still commits in
  the product's repository. **(d2)** A separate repository: not reachable from a one-repository session (7 §3), and a
  second repository per product is a new owner act (accounts, App install, ruleset).
- **(e)** A claude.ai page's database: allowed by the approvals ("create and edit Process4 pages and documents on
  claude.ai"); reachable only by a session's own tool call, never by `node` or by a workflow; each read or write is a
  judged act and costs context; account-bound (inference above). The owner's standing page already lives there (7 §1).
- **(f)** Cloudflare: "act on any account or service other than those named here" is forbidden by both approvals texts;
  the product's Cloudflare account is named only for the development deployment, and the deploy token is "for the
  development account only" (design 9 §2). So a store there needs the owner's approvals for a new use, a token, an
  allowed host and a network secret (environment change by his click, 7 §5), and ties Process4 to one host (design part 9
  is "the first hosting provider"; "Support for other hosting is not built"). A store in a product's own account splits
  Process4's state across each product's hosting account.

## 2. Triggers: what could call such a tool, and when

### 2.1 Claude Code hooks: where configured, and whether they run in these cloud sessions

- **Configured in** settings files: `~/.claude/settings.json`, a repository's `.claude/settings.json`,
  `.claude/settings.local.json`, managed settings, plugins, skill or subagent frontmatter (hooks.md, "Hook locations").
- **Project hooks in cloud sessions: documented yes, for a session with one repository.** cloud-environments.md, "What
  carries over": "Your repo's `.claude/settings.json` hooks and permission rules | Yes, in a session with one repository";
  "a session with several repositories doesn't load hooks from any repository's `.claude/settings.json`"; not in a
  project's cloud threads. Process4's role sessions each hold one repository (design 7 §1). **Measured in process3**
  (`DECISIONS.md` PD-13, 8 Nov): project PreToolUse hooks loaded in sessions rooted on a checkout carrying them; a session
  whose "container's project root is /home/user, which has no .claude/settings.json" loaded none, and its calls went
  uncounted. Civicsmith keeps a project SessionStart hook (Node 26 install, `setup-session-report.md`, PR 1120, ready, not
  merged at that time); whether it runs now is not read here. Still **unproven in Process4** (brief; nothing here ran one).
- **User-settings hooks written by the environment's setup script.** The docs say user `~/.claude/settings.json` "on your
  machine" does not reach a cloud session; they do not speak of a file the setup script writes inside the cloud machine.
  This container's `~/.claude/settings.json` holds `autoMode` and `idleCompaction` (written as design 7 §5 says), and the
  harness's own `~/.claude/launcher-settings.json` holds `autoMode`, `permissions` and two **harness hooks**, SessionStart
  (`session-start-setup-script-failure.sh`) and Stop (`stop-hook-git-check.sh`). So hooks do run in these cloud machines
  from settings the harness provides (observed, 27 Nov). Whether a `hooks` block the setup script writes into
  `~/.claude/settings.json` runs is **unproven** (the autoMode keys are read; hooks not tested). Such hooks would apply to
  every session on that environment, all products and PROCESS alike, take effect only on a fresh start (7 §5), and must be
  re-made in a new account's environment at a switch (build 6 §3 step 5 already checks that environment).
- **Trust and checker.** "Command hooks execute shell commands with your full user permissions." A hook is run by Claude
  Code, not as a tool call, so **inference**: the auto-mode checker does not judge it and the deny list (tool-call
  permission rules) does not reach it. A hook that writes to GitHub moves acts out of "one judged act for each command"
  (design 6 §4) and out of the approvals' judgment (6 §1, the first holder of a rule).

### 2.2 What each event could call the tool to do (hooks.md, fetched 27 Nov)

| Event (matcher) | Defined point it gives | Output reaches the session? | Can it block? | What it could call (inference) |
|---|---|---|---|---|
| SessionStart `startup` | New session, before its first turn | Yes: plain stdout or `additionalContext` added "at the start of the conversation" | No | Print the role's or job's brief, charter, current state. **But** the process copy is fetched by the session's first command, after start (build 1 §2), so at `startup` the tool is not there unless the hook fetches it, which moves the one judged fetch (6 §3) out of the checker |
| SessionStart `resume` | A resumed session (and VM restored) | Yes | No | Re-state the state that may have moved while it slept |
| SessionStart `compact` | Right after compaction | Yes | No | Re-inject the role's charter and state lost by compaction (the ARCH #26 case, `arch-compacted-fill-unread-25nov.md`) |
| SessionStart `clear` | After `/clear` | Yes | No | As startup |
| UserPromptSubmit | Each prompt, **also** "a message another session sends", a scheduled task firing, a background subagent reporting | Yes, `additionalContext` beside the prompt | Yes (rejects the prompt) | Attach the facts a message refers to (a job's state when ARCH messages it; ROOT's wake); default timeout 30 s, output discarded on timeout |
| PreToolUse, `if: "Bash(node *p4.mjs *)"` | Before a `p4` command | Yes, next to the result | Yes (exit 2 / deny) | Refuse or annotate a command against recorded scope; any refusal is a gate (§3). The `if` filter is "best-effort" per the docs |
| PostToolUse, same `if` | After a `p4` command | Yes; `classifierContext` goes to the checker, treated as unverified | No (stderr shown) | Record the transition the command made; state "what is now true" |
| Stop | End of each turn | `additionalContext` continues the turn; `decision: block` keeps it working | Yes | Check that a status the session stated matches the system (a gate if it blocks); 8 continuations cap |
| SubagentStop | A worker ends | As Stop | Yes | Same, for a worker's report |
| PreCompact (`auto`, `manual`) | Before compaction (idle compaction included) | stdout becomes "instructions for the compaction summary" (10,000 characters) | Yes (blocks compaction) | Tell the summary to keep pointers to where state is read |
| SessionEnd | Session ends | No (output discarded) | No | Record the end; 1.5 s default budget, up to 60 s |
| Notification (`idle_prompt` etc.) | A notice to a person | No | No | Side effects only |

- **`/goal`** (goal.md): "a wrapper around a session-scoped prompt-based Stop hook"; after each turn a small model judges
  a condition of up to 4,000 characters "against what Claude has surfaced in the conversation. It doesn't run commands or
  read files independently". So it can call nothing; it judges the transcript, the source the t3 study and
  `status-from-the-system-27nov.md` found unreliable, unless the turn printed a `p4` read. Background work defers its
  evaluation (relevant to `p4 test`'s two-hour background command). It is set by typing `/goal`; whether a session's
  starting prompt can set one in these cloud sessions is **unproven** (`claude -p "/goal ..."` is documented).

### 2.3 GitHub Actions: recording transitions with no session

| Trigger | When it fires | Where its workflow file must be |
|---|---|---|
| `pull_request` (`opened`, `ready_for_review`, `synchronize`, `closed`) | Each job's pull request event; `closed` with `merged` true is the merge | The pull request's own merge ref (so the pull request can change it; `module-tests` guards by fetching the tool at the base's version) |
| `push` | Each merge into the tranche branch (a push to it), each push to a job branch | The pushed commit |
| `issue_comment` (`created`, `edited`, `deleted`) | Each shared-state record write, each test record, each notice comment | **Default branch only** |
| `workflow_run`, `check_run` | After the required run completes | **Default branch only** |
| `schedule` | Cron; "can be delayed ... some queued jobs may be dropped"; disabled after 60 days without activity in a public repository | **Default branch only** |

- **Default branch.** "This event will only trigger a workflow run if the workflow file exists on the default branch"
  (issue_comment, workflow_run, check_run, schedule, and others). In Process4 main moves only at a tranche's merge (and the
  first files' pull request, 7 §4 act 8), so such a recorder would start working only after the tranche that adds it
  reaches main.
- **Token.** The repository's default is read-only (act 3), but "You can use `permissions` to modify the default
  permissions granted to the `GITHUB_TOKEN`, adding or removing access" (workflow syntax). A recorder that writes the
  shared state needs `issues: write` or `contents: write` declared in its file. Both approvals texts forbid "widening any
  workflow's or job's permissions", and workflow files change only by pull request. So a writing recorder needs the
  owner's word (and his approvals' wording). The required run itself "holds the read-only token, runs no product code"
  (build 1 §5) and is the one required check; a separate recorder need not be required.
- **Behaviour.** Writes made with `GITHUB_TOKEN` "will not create a new workflow run" (no loops). A `concurrency` group
  keeps "at most one running" and by default "any existing `pending` ... will be canceled and replaced", so a serialised
  recorder drops events unless it uses `queue: max` (up to 100 pending). A recorder's writes would be a second writer of a
  record unless it is the record's only writer (part 4 §4's one-writer rule).

## 3. The rules that bound such a tool, and what it would need from the owner

- **What holds a rule** (6 §1): his approvals judged by the checker, the forbidden commands, GitHub's rules; "Every other
  rule ... is held by text"; the tool "guards against mistakes, and not against a session that sets out to defeat it". A
  tool that only "speaks when asked" is held by text: a session that does not ask is not stopped (6 §1), unless a hook
  calls it, and hooks are in the owner's file (below).
- **The tool's limits** (6 §5): "It does only this: ..." (a closed list), "It refuses no work for size, and holds none of
  the checks that could stop work." An administrator function is a new item on that list; it is a process change made at
  PROCESS, explained to the owner, chosen by his marked decision (6 §7). Its tests run only where the tool changed (6 §5;
  build 1 §6).
- **No new test, gate, review or stop** (6 §7): "A change must not add a new test, gate, review or stop. It may only
  correct or remove what is broken", unless he explicitly approves; "caution is a cost". **Inference:** a call that only
  prints state or records a transition adds none of these; a PreToolUse refusal, a UserPromptSubmit block, a Stop or
  SubagentStop block, a PreCompact block, or a recorder made a required check each adds a gate or stop.
- **One writer per record** (part 4 §4; build 5 §1 "held by the starting texts"). A store with compare-and-swap (b, f's
  Durable Object or D1) removes the silent loss; a recorder on GitHub's machines or a hook in every session would be a new
  writer to be placed in that table.
- **GitHub's limits** (6 §3; build 1 §3): every write goes through the tool's shares; the shares sum to about 95 percent
  of each limit with eight jobs, four walkers, four lanes; pushes 5.7 a minute in all. A store that adds pushes or writes
  must fit inside those shares or change them (a process-config or code change).
- **Forbidden commands** (6 §3; `shims/claude-settings.json`): "the same for every repository", kept by PROCESS, changed
  only as a process change on his marked decision, copied into a repository by a pull request he lands. They do not reach
  hooks or programs the tool starts (inference; build 1 §3).
- **His files.** `.claude/settings.json` (where project hooks live) and `CLAUDE.md` change only by a pull request he
  merges (both approvals texts; 6 §2). Hooks in user settings come through the environment's setup script, changed only
  by the harness's approval prompt with his click (7 §5; process4 approvals). Either route is his act.
- **What the tool would need from him, by option (inference from the texts above):** (a) nothing new. (b) approvals
  wording for pushes to a shared state branch in each product; a change to part 4 §4's "never build up as files or
  commits"; the branch rule as it stands (act 4) works as compare-and-swap but makes the branch permanent. (c) not
  writable by product sessions; making it so would need cross-repository access the harness refuses. (d2) a second
  repository per product with his acts 1–5 for it, and still not reachable from one-repository sessions. (e) nothing new
  in the approvals; account-bound. (f) approvals naming the store's account and use, a token, an allowed host and a
  network secret (7 §5 approval prompt), and a hosting choice for Process4 itself. Hooks: his merge of a settings change
  per product (project hooks), or his approval of an environment change (user hooks). A writing workflow: his word for
  the widened permission, landed by pull request into the tranche and then main.
- **Process changes** (6 §7): one group with any other change proposed at the same time; "No change" always among the
  options; ARCH moves a product to the new version only on his instruction at the coordinator.

## 4. Points for the synthesis (facts and inferences only)

- (6) Risks seen: (a) loses a write silently when two writers meet; (b) repeats process3's form, whose push volume is the
  likely (unproven) cause of the 6 Nov suspension, and is permanent under act 4; (c)/(d2) unreachable from product
  sessions; (e) unreachable from `node` and account-bound; (f) a new service and host. Hooks: project hooks documented to
  run in one-repository cloud sessions and measured in process3, unproven in Process4; user-settings hooks unproven; a
  hook's GitHub write escapes the checker.
- (7) Velocity: a read at a hook point costs one REST listing (a few seconds, inference) or one git fetch; UserPromptSubmit
  hooks hold each prompt (30 s default). (b) adds pushes on the product's one repository (§1.4).
- (8) What it could remove: handover copies of state that the tool can print at SessionStart `startup`/`compact`/`resume`
  (sizes in `sizes-handovers-goals-27nov.md`, part of another worker's brief).
- (9) Gates: only blocking hook outputs and any required recorder add one (§3).
- (10) Interactions: any store choice is shared by every other opportunity (charter, plan, job instructions, pipeline
  state); a store with history (b, f) lets "what was true when" be read, which status-from-the-system's cause list (results
  arriving later, details dropped in rewrites) turns on; hooks depend on the copy being fetched before the tool can run.

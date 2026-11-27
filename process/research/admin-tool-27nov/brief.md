# Brief: a study of Process4 for an administrator tool (27 Nov 2026, PROCESS #21)

You are a research worker for PROCESS, the session that changes Process4: the process under which AI sessions (Claude Code
cloud sessions) build a software product in a GitHub repository. Work in `/home/user/process4` (read-only, except the one
report file you are given). Change no other file, run no `p4` write command, message no session, push nothing.

## The owner's ask (his words, 27 Nov 2026, conversation)
"I want to explore the design of a new tool capable of take responsibility for several operational functions of the
development process. At a high level I'm thinking this tool as a stable resource of shared wisdom that process4 sessions
refer at defined points in their lifecycle to keep sessions with roles in the process on their assigned course." Services he
named: "performing various "accounting functions" like tracking jobs and lanes"; "being involved in transitions in the
lifecycle of session, module, and other development entities"; "reminding sessions of important state, process, and policy
decisions and directions"; "providing a persistent, stable shared memory of facts". Information he wants it to keep: "the
charter of the current (or about to be opened) tranche/round"; "the build plan of the current round/tranche"; "state
information about the current round/tranche"; "a job-specific instructions (which might include elements of the current
charter)"; "state information for the pipeline of jobs in the current build plan". "The tool I'm talking about would also
"only speak when asked" … The use of the tool would be mandated by process4 to be called a given way at defined points."
"We need to openly recognize that we're not expecting to find this tool to be a silver bullet". Benefits he expects: "a
significant reduction in size and scope of the handoff docs"; "the insertion of a sane administrator function that off-load
responsibilities and keep sessions efficient, on point, and on track"; "Avoid situations where sessions are
reporting/acting "from memory" when that memory doesn't reflect operational realities". He imagines "the coordinator session
will maintain a straightforward, information richer, interactive (html?) dashboard that the owner interacts with to monitor
and evolve the direction of development." "We've learned from earlier process versions that using a product's repo for
operational state is a really bad idea. If the repo is used, can the state be kept on a branch that's never merged?"
The question: "how far could process4 requirements benefit from offloading features/responsibilities/constructs from AI to
a mechanical tool like this." For each opportunity: "a thorough analysis looking at the pros and cons of converting it and
how it would fit into the other opportunities being considered."

## Why (what went wrong; read `process/research/tranche-t3-study-27nov.md` and `status-from-the-system-27nov.md` in full)
In civicsmith's tranche t3 the owner's intent (conversions only) was lost in handovers; ARCH widened scope and ran fixes;
the tool cannot express "conversions only"; a ready job waited six hours; ARCH stated statuses from its transcript (e.g.
jobs archived that were not). Sessions forget, generalise habits, drop details in handover rewrites, and act from a
narrative instead of the system (ARCH's six causes).

## What exists now
- The p4 tool (`tool/`, `build/01-the-tool-and-the-required-run.md`, `build/01b-the-commands.md`): a node program each
  session runs from its own copy; the only door to GitHub; it already decides who takes a slot, when work is finished,
  notices, merge order, test scope, and reads/writes the shared state.
- The shared state (design part 4 §4; `build/05-the-records-and-following.md`): eight records as comments of one GitHub
  issue in the product's repository, one writer each; handovers are among them; PROCESS keeps three in this repository.
- The runtime (design part 7): each session is its own short-lived cloud machine; nothing runs between sessions; a command
  runs up to ~2 hours; sessions message, start, archive each other through the harness's own tools (a program cannot be
  assumed to); Claude Code hooks exist (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, SubagentStop,
  PreCompact, SessionEnd, Notification; configured in settings.json; a repository's `.claude/settings.json` is the owner's
  file to change; whether project hooks run in these cloud sessions is unproven); `/goal` (a completion condition judged by
  a small model after each turn); GitHub Actions workflows run on GitHub's machines on events (pull_request opened /
  ready_for_review / synchronize / closed, push, issue_comment, workflow_run, check_run, schedule); a session can subscribe
  to a pull request's activity; scheduled tasks wake sessions; claude.ai pages can hold a small shared database.
- Rules that bound any change (PROCESS's starting text, design part 6 §7): a change must not add a new test, gate, review
  or stop, unless the owner explicitly approves; caution is a cost; every choice weighs development velocity at the
  product's real size (civicsmith: ~204 modules, 8 slots, GitHub's account limits of 80 content writes a minute and 500 an
  hour, design part 6 §3).

## How to work
- Read IN FULL the files your part names (each is under 31 KB; use the Read tool, not cat, and check the line count against
  the file's "Length:" header). Read the decision-record entries (`process/design-decisions.md`, `-2.md`, via
  `process/decisions-index.md`) and research files that touch your opportunities.
- An opportunity is a responsibility, construct, record or judgment that an AI session holds now (or a text it must read
  and remember) that a mechanical tool could hold, carry out, or present at a defined point. Also name what must stay with
  AI (judgment), and why.
- For each opportunity give: (1) what the design says now, cited (part §, file); (2) who holds it and what failure or cost
  it has shown (cite research or the t3 study), or "none seen"; (3) what the tool would do, the state it keeps, and its one
  writer; (4) the trigger: which defined point, hook, GitHub event or command calls it; (5) pros; (6) cons and risks
  (including GitHub's limits, one-writer records, a session that does not call it, what is unproven); (7) effect on
  velocity at civicsmith's size; (8) what text it removes from starting texts, design reading or handovers (bytes where you
  can); (9) whether it adds a test, gate, review or stop; (10) how it depends on or interacts with other opportunities.
- Facts only; mark inference as inference and anything unproven as unproven. No recommendation beyond each opportunity's
  pros and cons; the synthesis comes later.
- Write your report as markdown to the path your part gives, then reply with a summary under 300 words.

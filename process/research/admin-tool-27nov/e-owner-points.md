# Part E: the owner's points on the study, answered (27 Nov 2026, PROCESS #21)

His message in PROCESS #21's session, 27 Nov ~21:10Z (conversation, unmarked), point by point; sources cited. **I** marks
inference, **U** unproven.

## 1. One writer to the tool's branch
His words: "there only being one session that writes data to the tools branch. I don't expect there to be any contention."
With one writer, neither store loses writes (issue comments lose a write only when two writers meet, C §1.3). The branch
choice then turns on: push rate (process3's state branch, 1,387 pushes in 19 h before the 6 Nov suspension, cause unproven,
C §1.1); whether pushes count toward GitHub's 80/500 content-write limits (GitHub's docs name only the web interface, REST
and GraphQL, C §1.4: unknown); history (a branch keeps it; comments do not); size (a comment holds 65,536 characters; a file
far more). One writer means the other sessions' events reach that writer some other way: each job already writes its own
pull-request comments (one writer each, build text 5 §5), which the writer's tool reads (**I**, a design detail).

## 2. A deletable branch for transient state
Today two things forbid it: his approvals ("They may never: … delete a branch") and the branch rule he set (act 4: "no
deleting and no overwriting, with no one excepted"; design part 7 §4). The route: PROCESS drafts the approvals wording on his
request and places it in a pull request he merges (design part 6 §2); the rule's exception for a named branch pattern is his
click in GitHub's settings. The design's "running records never build up as files or commits" (part 4 §4) changes by his
decision. A permanent-history concern then goes; the push-rate concern stays.

## 3. A dedicated session that holds live state, called by message
- What connects sessions: messages through the harness. A message wakes its receiver (design part 7 §1); the answer is
  another message, arriving as a new turn of the asker. There is no call-and-return: the asker stops, waits to be woken,
  and acts on the reply in a later turn. Sessions' machines take no inbound network connections (**I**; each runs alone,
  outbound through the proxy).
- So each request is a model turn of the dedicated session: its cost in tokens, a delay of at least one turn (**U**,
  unmeasured), and an AI in the loop of every mechanical step, which could misreport, the very thing the tool is for.
- Its machine is reclaimed when idle (the environment's own note), so state on its disk must be saved elsewhere anyway; it
  fills its context with every request and needs refreshing (compaction is off, his setting); while it is down or
  refreshing, every session that needs an answer waits (a single point of failure); its messages are judged by the checker
  (cross-repository messages were refused before the permissions settings, design part 7 §5).
- Pros: one writer by construction; no GitHub write for each transition; state richer than records allow.
- Against the alternative (each session runs the same tool against one shared store, writes by one writer): the dedicated
  session adds latency, cost and judgment to every step and still needs a store. **I**: not better.
- A true live shared memory that `node` in every session could reach directly exists only as a hosted service (C §1.5 (f):
  Cloudflare, a new service under his approvals and network settings, tying Process4 to a host).

## 4. Telling a session to archive, and confirming it mechanically
The tool speaks when called, but hooks call it at every point that matters (Claude Code hooks docs,
https://code.claude.com/docs/en/hooks.md, read 27 Nov):
- "MCP tools … appear as regular tools in tool events (`PreToolUse`, `PostToolUse`, ...), so you can match them the same
  way": a PostToolUse hook on `mcp__claude-code-remote__archive_session` receives "both `tool_input` … and `tool_response`",
  so the tool records the archive from the harness's own answer, not the session's word. The same on `create_session`
  records the new session's id (today in no record), and on `send_message` what was delivered.
- A Stop hook can refuse to let a session end its turn: `decision: "block"` with a `reason` that "Tells Claude why it should
  continue"; a loop guard (`stop_hook_active`) and a cap of eight blocks in a row. So when ARCH's turn would end with an
  archive owed, the tool names it and the session goes on. That is a stop on stopping, a gate in the design's sense, so his
  explicit word (part 6 §7); it serves the design's own rule that work does not stop while work remains (part 1 §7).
- PostToolUse after a merge can add the owed acts "next to the tool result"; SessionStart's stdout is "added to Claude's
  context". A hook "inherits the parent environment" and runs up to 600 s by default.
- Not stated in the docs: whether a repository's `.claude/settings.json` hooks run in cloud sessions (process3 saw them run,
  8 Nov, C §2.1; this container's environment runs its own Stop hook). A hook's writes are not judged by the checker (**I**,
  C §2.2): what it may write is bounded by the tool's code.
- Whether a session can archive itself: **U**. The starter archives (design part 4 §5).

## 5. "Nothing for ARCH choosing what comes next" — corrected
He is right. In t3, ARCH chose because the design gives it the choice (part 3 §1) and the tool's scope could not hold his
intent. With a charter he sets (his words and a kind, e.g. "convert every module in order"), the build plan is the tool's to
compute (`next-job` already chooses the job, design part 4 §1), and ARCH's text says the next work is what the tool gives.
What stays judgment is only what the charter leaves open (where a flaw belongs, an interface, walk areas). Likewise a job:
its starting text can be little more than "fetch, then run `p4 job brief`", which gives its goal, its work, the charter
lines it needs and its commands (today the job block, build text 5 §5). The synthesis's "not fixed" for cause 2 assumed
part 3 §1 stays; under T2 with the plan given to the tool, cause 2 is largely answered.

## 6. Minimal starting texts; fetch, then ask the tool
Agreed: the snag that the tool is absent at SessionStart `startup` goes away when the starting text's first command fetches
the copy and its second runs `p4 brief`; no SessionStart hook is needed for it.

## 7. Wider GitHub grants
Sessions reach GitHub through the harness's GitHub connection, with no token (design part 7 §4 act 5). A workflow's token
is set in its workflow file; widening it is today forbidden by his approvals ("never widening any workflow's or job's
permissions") and so needs his wording changed (part 6 §2).

## 8. A pre-filled comment as his words; the checker on a record written from a comment
- Whether a comment he sends from his page, pre-filled by a button and read and sent by him, is "a message I typed myself"
  is his rule's meaning (CLAUDE.md approvals; design part 1 §4), so his to settle. His words "I'm pretty sure it does" are
  unmarked; PROCESS asks once whether to record it as a decision.
- Evidence on the checker: decisions he typed as page comments have been recorded and merged by PROCESS's `p4 merge`, which
  the checker judged (decision record, "The limit on depth", "Writing a lane's entry"; A fact 7). The refusal of trial fault
  7 was for an instruction relayed through another session ("Undermining Oversight"); a comment on a page the coordinator
  publishes reaches the coordinator's own session from the service, attributed to him, not through another session (**I**:
  not relayed in that sense). Not yet seen: a coordinator writing a standing note from his page comment. One trial settles
  it: he comments one marked instruction on a page the coordinator publishes (on process3-probes, or civicsmith once it runs).

## 9. The gaps, in plain words
See PROCESS #21's message of 27 Nov ~21:30Z and `d-synthesis.md` §6.

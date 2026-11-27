# J: Claude Code hooks, run for B2, B3, C1 and E2 (27 Nov 2026, brief 2)

Claude Code 2.1.332 (`claude --version`). All runs were nested headless runs, `claude -p "<prompt>" --model haiku
--output-format json --no-session-persistence --strict-mcp-config < /dev/null`, started from a fresh git repository at
the scratchpad's `hooks-test/` (hook scripts, logs, `runN.json` stay there), each run with its own `.claude/settings.json`. `haiku`
resolved to `claude-haiku-5-5` (run JSON, `modelUsage`). Docs: https://code.claude.com/docs/en/hooks.md, fetched 27 Nov; "docs L" means the line in that
fetched file. Facts give their source, **I** marks inference, **U** marks anything not shown. All timings are local, from
this container, and are not a forecast.

## Result in one line per use
- **B2, recording session acts (PostToolUse):** works for built-in tools. The hook got the harness's own `tool_response`.
  For MCP tool names (`mcp__claude-code-remote__*`) the evidence is the docs only (see section 7).
- **B3, owed acts kept working (Stop):** works. One block sent the model back to work and it wrote the owed file.
- **C1, a brief at fixed points (SessionStart; PostToolUse `additionalContext`):** works. Both strings reached the model
  word for word.
- **E2, hooks as callers:** a failing call did not break the session. The hook's time is added to the turn as it runs
  (local: +2.0 s for a 2 s timeout). Project hooks ran with no trust step in `-p`.

## 1. PostToolUse, matcher "Bash" (run 1)
The prompt asked the model to run `echo hello`. The hook appended its stdin to `logs/t1.jsonl` (fact, that log). The fields
it got:
`session_id`, `transcript_path` (`/root/.claude/projects/<dir>/<session>.jsonl`), `cwd`, `scratchpad_dir`, `prompt_id`,
`permission_mode` ("default"), `effort` ({"level":"medium"}), `hook_event_name` ("PostToolUse"), `tool_name` ("Bash"),
`tool_input` ({"command":"echo hello","description":"Print hello via echo"}), `tool_response` ({"stdout":"hello",
"stderr":"","interrupted":false,"isImage":false,"noOutputExpected":false}), `tool_use_id` ("toolu_01Qj…"), and
`duration_ms` (52).
The hook's environment had `CLAUDE_PROJECT_DIR` set to the repository root (fact: the logged `project_dir`).
- For a failed call, `tool_response` "is the error text as a string" (docs L2375). Calls that fail also fire a separate
  `PostToolUseFailure` event, "or an MCP tool returned an error result" (docs L2469–2471). "For tool calls that fail, add
  the same hook under PostToolUseFailure" (docs L2358). **I:** a B2 recorder needs both events, or it misses a failed
  archive or a failed `send_message`.
- The first run printed `Warning: no stdin data received in 3s` (fact, run1.err). Later runs used `< /dev/null`. **I:** any
  scripted `claude -p` needs that redirect, or it waits 3 s.

## 2. Hooks for one command only (run 2)
Three handlers sat under matcher "Bash": one with no condition, one with `"if": "Bash(echo p4 merge *)"`, and one script
that checks `tool_input.command` for "p4 merge". The model ran `echo hello` and then `echo p4 merge 12`. (`echo` stood in
for the real command, because no p4 write command may be run.) Logs:
- the handler with no condition fired for both commands;
- the `if` handler fired only for `echo p4 merge 12`;
- the script check fired only for `echo p4 merge 12`.

The `if` field takes one permission rule only, with no `&&`, `||` or list (docs L431). It applies only on tool events
(docs L426). "Because the `if` filter is best-effort, use the permission system … to enforce" (docs L447). When the
command cannot be split into subcommands, the hook runs whatever the pattern says (same line). **I:** `if` saves a process
start. The script check is the exact one. Use both: `if` to narrow, the script to decide.

**Run 7 (C1 and B3, after a merge):** the same `if` hook returned
`{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"OWED after merge: archive job session J-12"}}`.
Asked to quote any note it got, the model replied: "The result also came with a note, quoted verbatim: \"OWED after merge:
archive job session J-12\"" (fact, run7.json `result`). The docs cap these strings at 10,000 characters (docs L1098).

## 3. Stop hook that blocks once (run 3)
The prompt was only "Reply with the single word: hi". The hook script logs its input. If the marker
`logs/t3.marker` exists, or `stop_hook_active` is true, it exits 0. Otherwise it creates the marker and prints
`{"decision":"block","reason":"You still owe: write OWED.txt"}`. What happened (facts: logs, run3.json):
- First Stop: `stop_hook_active:false`, `last_assistant_message:"hi"`. The hook blocked.
- The model went on. It tried Bash first; `-p` refused that (`permission_denials`, because Bash was not allowed). It then
  used Write (`--allowedTools Write`) and created `OWED.txt`. A PostToolUse Write hook logged the file.
- Second Stop: `stop_hook_active:true`, so the hook let the turn end. 4 turns, 12.0 s wall (local).
- The run's `result` holds only the last message ("I wrote `OWED.txt` …"). The "hi" is not in it. **I:** a parent that
  reads `result` sees the text after the gate, not the reply before it.
- Stop input adds `stop_hook_active`, `last_assistant_message`, `background_tasks`, `session_crons` to the common fields.
- Cap: "after stop hooks have continued the turn eight times in a row, Claude Code overrides the next block". The count
  resets each time Claude calls a tool. `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` raises it (docs L2945). `additionalContext` on
  Stop continues the turn as "Stop hook feedback", with no error shown (docs L3024).
- **I:** the reason should say how to do the act; the model guessed the file's content.
- **I:** the stop condition should come from the tool's record, not from a marker. "Still owes X" stays true until X is
  recorded, and `stop_hook_active` guards the loop.

## 4. SessionStart printing a line (run 4)
The hook printed `BRIEF: charter conversions-only` to stdout. Asked to quote any line a SessionStart hook added, the model
replied `SessionStart:startup hook success: BRIEF: charter conversions-only` (fact, run4.json). So plain stdout arrives,
wrapped in that label. The input had `source:"startup"`, along with `cwd`, `hook_event_name`, `scratchpad_dir`,
`session_id` and `transcript_path`.
- Other sources are `startup`, `resume`, `clear`, `compact` and `fork` (docs L297). Only `startup` was run. **U:** the
  `compact` and `resume` cases in these cloud sessions.
- The prompt named SessionStart. **U:** whether a model uses such a line unasked.

## 5. A network call that fails, with a 2 s timeout (runs 5 and 5b)
- Run 5: the hook called curl `-m 2` on `http://192.0.2.1` with no proxy, then on `https://p4-state.invalid` through the
  proxy. Both failed at once: exit 7 after 0.009 s, and exit 56 (proxy CONNECT 502) after 0.31 s. The session was
  unharmed (`is_error:false`, `result` "hello\n\ndone"). Local `duration_ms`: 3,440.
- Run 5b: a silent host, a local socket that accepts and never answers (127.0.0.1:47999), with curl `-m 2`. curl exited 28
  after 2.011 s and the hook exited 0. The session was unharmed (`is_error:false`). Stream events
  (`--include-hook-events`) showed `hook_started`, then `hook_response` with `exit_code:0` and `outcome:"success"`. The
  tool_use was at 21:37:19.426 and the tool result went back at 21:37:21.547, a 2.1 s gap. Local `duration_ms` was 5,359,
  against 3,169 to 3,440 for the same prompt without the slow hook. So the hook's time is added in full, as it runs.
- Default timeout is 600 s for command hooks (docs L427). `"async": true` runs a hook "in the background without blocking"
  but "can't block or control Claude's behavior" (docs L457, L4263). Not run here (**U** locally).
- **I:** with exit 0 the call fails silently and the act goes unrecorded. A recorder needs a local spool, such as an
  appended file the tool reads on its next call, plus the B4 checks for what didn't happen. A hook must not depend on a
  service answering. For E2 this argues for a local writer (node `tool/`) over a remote one. If E1 is chosen, short
  timeouts are needed, `async` for pure records, and synchronous only where the hook must speak (Stop, `additionalContext`).

## 6. Trust step in headless mode
None was needed for hooks. Every project hook above ran in a folder never trusted: `/root/.claude.json` has no entry for
it (fact). In the same run, stderr said:
`Ignoring 1 permissions.allow entry from .claude/settings.json: this workspace has not been trusted.` (fact, run1.err).
So in `-p`, project **hooks run** but project **permission allows are ignored**. The docs say the same: "`-p` or SDK session:
Claude Code never shows the dialog and treats the folder as trusted, so hooks committed in a repository's
`.claude/settings.json` run" (docs L4384). An interactive session holds them back until trust is accepted (docs L4383).
The hooks fire "wherever it runs … and cloud sessions" (docs L13), and cloud sessions do not read a local
`~/.claude/settings.json` (docs L252).
- **U:** that a project hook in Process4's own cloud sessions (not nested `-p`) runs the same way. **I:** likely, since
  those sessions are SDK-driven. Process3 saw project hooks run on 8 Nov (c-storage §2.1). Proving it needs a hook landed
  in a repository's `.claude/settings.json`, which only Bob merges. Not done here.
- The nested run inherited this container's environment. Only the project hooks showed in its hook events
  (`PostToolUse:Bash` ×2 in run 5b). This environment's own Stop hook did not appear there. **U:** why.

## 7. MCP tool names
Not testable here. The nested run had no MCP servers (`--strict-mcp-config`; init `mcp_servers:[]`), so the
claude-code-remote tools were absent. The docs say "MCP server tools appear as regular tools in tool events (`PreToolUse`,
`PostToolUse`, `PostToolUseFailure`, …), so you can match them the same way" (docs L347). Names follow
`mcp__<server>__<tool>`. A server-wide matcher needs `.*`: `mcp__memory` alone "matches no tool" (docs L349–359). A matcher
for B2 would be `mcp__claude-code-remote__(create_session|archive_session|send_message)`.
- The input also carries `mcp_server` {name, source}, from v2.1.274 (docs L1886). Base trust on `source`, not on the
  `mcp__` prefix (same line).
- Plugin-bundled servers are named `mcp__plugin_<plugin>_<server>__<tool>` (docs L361). **U:** how the claude-code-remote
  server is named in these sessions. This session lists its tools as `mcp__claude-code-remote__…`. **I:** the plain form.
- **U:** the shape of `tool_response` for those tools (an id for a created session, the archive reply). It is "the result it
  returned" (docs L2375). Seeing it needs one hook in a real cloud session.

## 8. Cost of each run (from the run JSON)
Hooks use no tokens; the turns they cause do.

| run | what | turns | input | cache write | cache read | output | USD | local duration_ms |
|---|---|---|---|---|---|---|---|---|
| 0 | no hooks, "ok" | 1 | 2 | 11,208 | 26,829 | 4 | 0.00251 | 2,130 |
| 1 | PostToolUse Bash log | 2 | 4 | 9,427 | 66,779 | 83 | 0.00260 | 3,169 |
| 2 | one-command `if` / script | 3 | 6 | 9,577 | 104,999 | 161 | 0.00305 | 4,715 |
| 3 | Stop block once | 4 | 8 | 19,279 | 135,173 | 839 | 0.00563 | 10,806 |
| 4 | SessionStart line | 1 | 2 | 9,359 | 28,730 | 275 | 0.00230 | 6,048 |
| 5 | network fails at once | 2 | 4 | 8,871 | 67,339 | 83 | 0.00249 | 3,440 |
| 5b | silent host, 2 s timeout | 2 | 4 | 8,868 | 67,339 | 77 | 0.00249 | 5,359 |
| 7 | PostToolUse additionalContext | 2 | 4 | 9,492 | 66,803 | 248 | 0.00269 | 5,096 |

About 9,000 to 11,000 tokens of cache write and 27,000 to 67,000 of cache read come with every haiku run (system prompt
and tools). One Stop block roughly doubled the run (run 3 against run 1: +2 turns, +10k cache write, about 2.2× the cost).
**I:** a Stop gate costs a model turn each time it fires, so it should fire only when an act is truly owed.

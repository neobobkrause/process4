# Part 7. The harness table for Claude Code

Length: 49 lines. Last section: "2. Reading, as measured".

Part 7's other sections: 3, 4 and 5 in `07b-`.

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
| Fill level | A session reads how full its context is from the harness's own usage data (`get_session`, field `context_usage`), the route the role sessions use. A bare headless `claude -p` reader cannot see it and guesses (early, the safe way) |
| Compaction | A full context is shrunk automatically, which loses what was read. The environment turns off the compaction of a session left idle for about an hour, far below the fill level (section 5) |
| The time a session can run one thing | Two hours for one command the session runs in the background, which it waits for within its turn; ten minutes for one in the foreground. A command a worker starts ends with the worker. A command started in the foreground and then moved to the background can be cut at thirty minutes. Whether a background command goes on while the session waits between turns is not known |
| Archiving | A session can be archived and unarchived |
| A notification to the owner | A push notification to his phone |
| The owner's standing page; a lane's design pages | Pages on claude.ai |
| The owner speaking to a role | He opens that role's session and types |
| Grouping sessions under a product | A tag naming the product, set on each session when it is started. Sessions can be listed by tag. Workers are not sessions and so carry none. Not measured |
| The owner seeing each open job | Each job's session carries its standard name (part 4, section 11), so each open job is told apart by its module, and the list of sessions shows each one's name and whether it is working, waiting or finished. Whether the list he sees meets the rule is not measured |
| Naming a session | A session's name is set with the harness's set-session-title. The owner-started ROOT and PROCESS name themselves. It works in Auto mode |
| Starting instructions | The prompt a session is started with |
| Model and effort passed on | The starter names both when it starts a session. Not measured |
| Planned replacement | The parent starts a fresh session and archives the old one |
| The limit on depth | Eight. A session at depth eight cannot start a session or make a scheduled wake. A session reads its own depth with `get_session` (field `lineage`). A session made by a scheduled task has no parent, but starts with no repository and without the tools to start or message sessions, so it cannot hold a role. The limit bounds how many times a watcher can take over before the owner starts a fresh ROOT (part 4, section 6) |
| The shared state | Not carried by the harness. It is on GitHub (part 4, section 4) |
| Connecting the harness to GitHub | The owner connects his GitHub to Claude and installs Claude's GitHub App on the repository |
| A session's browser | A browser on the session's own machine. |
| A session's copy of the process | A plain clone of the process's public repository into a folder outside the session's working files. Sessions run with full rights, so the file system does not stop a write to it; that no session edits it is held by text |
| What the subscription covers; cost | **Open (a session):** where cost can be read is not named anywhere read |

## 2. Reading, as measured

As measured on Claude Code:

- A plain read returns a file whole up to the harness's mechanical cut, about 25,000 tokens: about 76,000 bytes of dense governing prose, and about 63,000 bytes of table-dense prose. The single-text maximum on Claude Code, 60,000 bytes, sits below both (part 5, section 2).
- A file past the cut comes back as a partial read. The tool result carries no notice of the cut, so a session that does not compare the lines returned against the file's length acts on part of a text.
- A file over 256 KB is refused, with no lines returned.

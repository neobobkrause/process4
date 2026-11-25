# `p4 ready` on a pull request already ready or merged answers with a GraphQL refusal (25 Nov 2026)

A process fault from civicsmith store-request #4 (PR 1378), via ARCH #16 and coordinator #7 at 02:37Z, unchanged:

> "Process fault, written once: `p4 ready --branch job/store-request.4` answered "no open pull request for the branch
> job/store-request.4; name it by its number". `p4 ready 1378` then failed with "GitHub refused: HTTP 403: GitHub GraphQL is
> not available from Claude Code sessions" (the ready-for-review call goes through GraphQL). The PR was marked ready before
> the notice (the earlier `p4 ready` answered "open and ready"), so it may still be ready, or may already be merged or
> closed. I can't see which with my acts. I'm making no further attempt."

ARCH's note: "PR 1378 had stayed ready and merged at 02:40Z; nothing waits on this."

## What the code shows

- `ready` (tool/lib/commands.mjs) calls `markReady` whatever the pull request's state. `markReady`
  (tool/lib/github.mjs) tries the proxy's ready route, and where that fails falls back to `gh pr ready`, which uses
  GraphQL, refused to every session. On a pull request already ready, or merged, the first route fails and the
  fallback's refusal is what the job sees.
- `--branch` finds only an open pull request, so on a merged one it says "name it by its number".
- Nothing was lost: the first `ready` had worked and ARCH merged. Cost: a confused job and a fault report.

## Options

- **A. No change.** Harmless; the job stopped as it should.
- **B. `ready` says plainly where there is nothing to do (recommended, small).** On a pull request that is not a draft it
  marks nothing and says "already ready"; on a merged or closed one it says so; `--branch` finds a merged pull request
  of the branch and says it is merged. The GraphQL fallback is dropped, since no session can reach it. A tool change
  with a test; adds no test, gate, review or stop.

# Research: eliminating transient auto-mode classifier denials in Process4 (19 Nov 2026)

Recorded by PROCESS before proposing (rule 3). Tasks set by the owner: (A) change
Process4's permissions-management strategy so **zero** transient false-positive
denials from the Claude Code auto-mode classifier occur; (B) close the
authorization gaps stopping development sessions from communicating with PROCESS.

Sources: process3's own research on the `process4` branch
(`process4/evidence/permissions_inventory.md`, `process4/working/enforcement_levers.md`);
the live Claude Code docs `code.claude.com/docs/en/auto-mode-config` (fetched 19 Nov
2026); `get_environment` on this session's environment (BIO). An earlier worker
concluded process3 had no such mechanism; that was wrong and is corrected here.

## Root cause (confirmed)

The denials ("Permission for this action was denied by the Claude Code auto mode
classifier. Reason: [Unsanctioned Communication]") are **server-side classifier
policy denials**, not an approvals-wording gap. Per the live doc:

- `[Unsanctioned Communication]`, `[Undermining Oversight]`, `[Unauthorized Access]`,
  `[Destructive or Unwanted Actions]` are **server-side classifier policy
  categories**. (`[Undermining Oversight]` was fault 7's reason — same family.)
- "By default, the classifier trusts only the working directory and the current
  repo's configured remotes." Any other destination "is a potential exfiltration
  target," and "a pull request to another repository" is blocked by default.
- Process4 puts PROCESS in a **separate repository** (`neobobkrause/process4`) from
  the product repos. So a product session messaging/starting PROCESS, or PROCESS
  reaching a product session, is **cross-repository** and the classifier treats it
  as external → `[Unsanctioned Communication]`. Because the classifier is
  probabilistic, it fires **unevenly** (the "transient" denials): ROOT's same-repo
  create and the coordinator's cross-repo reply both tripped it; identical acts had
  passed before.

## The lever (from the doc, and what process3 used)

The classifier reads `autoMode` config from these scopes only:

| Scope | File |
|---|---|
| One developer | `~/.claude/settings.json` |
| Organization-wide | managed / server-managed settings |
| Per-invocation | `--settings` flag / Agent SDK inline |

- **It does NOT read `autoMode` from the repo's `.claude/settings.json` /
  `settings.local.json`** ("a checked-in repo or a build step could otherwise inject
  its own allow rules"). So the fix canNOT live in a repo; it must be user settings
  or managed settings.
- Repo `CLAUDE.md` steers the classifier too ("reads the same CLAUDE.md content
  Claude itself loads"), but per-repo — it cannot name another repo as trusted.
- `autoMode.environment` = prose naming trusted repos/source-control/infra.
  `autoMode.allow` = prose naming routine actions as sanctioned (exceptions to soft
  blocks). Keep `"$defaults"` in every list to preserve built-in protections.
- For the policy categories specifically the doc says: "For a routine action you
  want allowed from now on: describe it in an `autoMode.allow` entry"; "For a
  destination you trust: add it to `autoMode.environment`."
- In a **cloud** session `/auto-mode-setup` is unavailable; the config must be
  written by the **cloud environment's setup script** into `~/.claude/settings.json`
  (process3's measured route: a setup script writing user-level auto-mode settings
  passed **19 of 19**), or supplied as **managed settings**.
- `permissions.deny` (repo or managed) still runs **before** the classifier and is
  the hard physical guard — keep the existing deny list unchanged.

## Why process4 is hit and process3 was not

Process3 configured `autoMode.environment` (its trusted repos/infra) via user-level
settings; Process4 configured **none** — `get_environment` shows BIO has env vars, a
walk-certificate setup script, and **no `autoMode` block**. So process4 runs auto
mode with the bare defaults, which treat every cross-repo and cross-session act as
untrusted. The owner's premise ("process3 avoids 100%") is supported: process3's
permissions strategy = `autoMode` config + committed CLAUDE.md approvals + the
discipline; process4 has the approvals and most of the discipline but is missing the
`autoMode` config, the decisive piece for cross-repo/cross-session acts.

## Proposed fix (A and B together)

Write an `autoMode` block to `~/.claude/settings.json` (via the setup script of
every environment a Process4 role runs in — PROCESS's and the product sessions'), or
to managed settings if the owner's plan has them. Draft (keep `$defaults`):

```json
{
  "autoMode": {
    "environment": [
      "$defaults",
      "Organization: Bob's Process4 autonomous development. Primary use: software development across a process repo and its product repos.",
      "Source control: GitHub owner neobobkrause. The process repo neobobkrause/process4 and the product repos it develops (e.g. neobobkrause/process3-probes) are all trusted and are each other's own work; pushes, pull requests, reads and coordination among them are internal, not exfiltration.",
      "Key internal services: this account's Claude Code Remote sessions are the process's own roles (ROOT, watcher, ARCH, coordinator, lanes, jobs, PROCESS). Starting, messaging, interrupting and archiving them, and creating their scheduled wake tasks, is routine internal orchestration."
    ],
    "allow": [
      "$defaults",
      "Cross-session messaging and session lifecycle among this account's Process4 roles is routine and owner-sanctioned: a product session (ROOT, coordinator, ARCH) starting or messaging the PROCESS session in neobobkrause/process4, and PROCESS messaging a product's coordinator or ROOT, are not unsanctioned communication.",
      "Creating and managing the roles' own scheduled wake tasks is routine."
    ]
  }
}
```

- **Delivery route:** environment setup script writing `~/.claude/settings.json`
  (cloud sessions cannot run `/auto-mode-setup`). Applied to **both** PROCESS's
  environment and the product sessions' environment — this is the cross-repo
  compatibility PROCESS owns.
- **Keep** the `permissions.deny` list in each repo's `.claude/settings.json`
  unchanged (hard guard, pre-classifier).
- **Keep** the discipline (one judged act per command; never reword/reroute a
  refused act; name every act in the starting prompt; create tasks once). These now
  prevent denials at the source rather than only recovering from them.

## Honesty about "zero"

`autoMode.environment`/`allow` is the documented, proven way to stop these false
positives (process3: 19/19), and it removes the *cause* (the classifier no longer
sees these as external/unsanctioned). But the classifier is probabilistic: only
`permissions.deny` is a hard gate, and it blocks rather than forces-allow. So "zero"
is achieved in practice by complete `autoMode` config + the discipline + early
refresh — not by an absolute switch. An absolute, non-probabilistic guarantee would
require managed/server-managed settings, which depend on the owner's plan (Team/
Enterprise). To be confirmed by running once configured.

## What this means for the charter / authorization

- The fix is an **environment** change (`autoMode` in user/managed settings), which
  `update_environment` applies **only after an owner approval prompt**, and which my
  standing approvals class as a permission-settings change I may not make alone. So:
  **PROCESS drafts and verifies; the owner approves/commits.**
- It spans the **product** sessions' environment too, which PROCESS cannot currently
  see or edit. To own cross-repo compatibility (the owner's charter), PROCESS needs
  at least visibility of the environments the product roles run in. This is the
  concrete authorization gap behind task B.
- It should also enter the Process4 **design** (part 6 "what holds a rule"; part 7
  Claude Code harness table; the owner's acts to start a product): `autoMode`
  configuration is now a named part of the process's setup, not an afterthought.

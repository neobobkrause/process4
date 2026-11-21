# Research: no route to a product's first Process4 approvals when its old approvals forbid it (21 Nov 2026)

Recorded by PROCESS #5 before proposing (rule 3). Source: the civicsmith lane's point 10 (message of
21 Nov 2026), measured from `neobobkrause/civicsmith-copy`'s own text as read by the owner's
read-only session (the lane's `research/civicsmith-copy-reading.md`, PR 113): its approvals (1 Nov
2026) count changing `CLAUDE.md` or `.claude/settings.json` as changing permission settings, which they
forbid; the commit that removed the earlier process says "Bob commits the new one himself".

## The gap

- Design part 7 §4 act 8 (as changed 20 Nov): the set-up session drafts the product's approvals and
  places them in a pull request the owner merges. Part 6 §2: the placing "works only once his
  approvals allow it".
- Part 1 §3: no act of the owner's asks him to edit a file.
- civicsmith-copy's approvals forbid the placing. So no route in the texts reaches civicsmith's first
  Process4 approvals without the owner editing a file. The same will hold for any product whose old
  approvals protect those two files.
- Measured precedent: on 20 Nov the owner landed new approvals in `neobobkrause/process4` himself
  through GitHub's web editor (commit `2276962`), and on the trial's main the same way. Both worked.

## Options (none adds a test, gate, review or stop)

- **A — No change; a one-time paste.** For a product's first Process4 approvals only, the set-up
  session shows the drafted text on a page with a copy button; the owner opens
  `CLAUDE.md` on GitHub, clicks the pencil, pastes, clicks "Commit changes". Proven twice. Cost: one
  paste into a file, once per product, against part 1 §3; the design would state the exception.
- **B — Clicks only: he deletes the old file first (recommended to try).** On GitHub he opens
  `CLAUDE.md`, clicks "…" then "Delete file", then "Commit changes". With no approvals forbidding it,
  the set-up session places the drafted text in a pull request and he clicks Merge. Every act is a
  click. Unproven: that the permission checker lets the session write `CLAUDE.md` with no approvals
  loaded; if it refuses, fall back to A. The deny list (`.claude/settings.json`) is placed the same way
  after the approvals land, under the new approvals.
- **C — His typed instruction in the set-up session.** He types an instruction allowing the placing.
  Committed approvals are read at start and forbid it; a typed instruction is unlikely to pass the
  checker. Not recommended.

Recommendation: B, with A as its stated fallback; record whichever is measured.

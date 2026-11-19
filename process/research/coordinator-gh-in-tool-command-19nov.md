# Research: a forbidden gh command mixed into a recording command (coordinator)

Recorded by PROCESS before proposing (rule 3). Source: the owner's report, 19 Nov
2026 — on the trial, the coordinator twice placed a forbidden `gh` command into a
command meant to record the owner's words through the tool; the permission checker
refused the whole command both times, and the owner's words went unrecorded.
Measured (it happened twice). Verified against the texts and the tool at
`process4` `main`. No transcript of the two commands is in this repository; the
analysis rests on the owner's description, the deny list, and how the tool records.

## What the coordinator's recording path actually is

- A **Decision** → the product's decision record, by a pull request
  (`p4 branch/push/open/merge`); the words are written into a markdown file, then
  committed (coordinator rule 1).
- An **Instruction** that becomes a standing note → `p4 state write standing-notes
  --from <file>` (coordinator rule 6; build text 5, sections 1–3).

Both proper paths carry the owner's words **in a file**, never on the command line.
The deny list is `Bash(gh *)` and the specific merge/content patterns
(`.claude/settings.json`); it matches a `gh` command on the command line. So a
refusal of a "recording" command means the command line held a `gh` invocation —
either the session added one, or the owner's quoted words (e.g. words that mention
`gh ...`) were interpolated onto the command line instead of being put in a file.

## The two questions

### Q1 — should the coordinator's text warn against mixing a GitHub command into a tool command?

The deny list already forbids `gh` to every session, and the tool is the only door
to GitHub (design part 6, section 3). So the gap is not that `gh` is allowed; it is
that the coordinator can still *place* a `gh` command (or the owner's `gh`-shaped
words) onto a command line and lose the whole command. The precise, preventive
statement is stronger than a bare warning: **record the owner's words only through
the tool, with the words carried in a file (`--from`, or a committed file), never
interpolated into a command line; never place a `gh` or `git` command anywhere in a
command.** Put in a file, no content of his words can collide with the checker.

This is coordinator-general, not trial-only, and the same exposure exists for any
session that records his words near a command line (PROCESS into
`design-decisions.md`, ARCH into its decision record). Those paths are already
file-based when done as the texts intend.

Constraint: the coordinator text is 3,679 bytes and already has the ten rules
(design part 4, section 11; rule 7). Any wording must fold into an existing rule
(rule 1 and/or rule 6), not add an eleventh.

### Q2 — does never-retry mean the owner's words can go unrecorded through the session's own mistake?

The never-retry rule (design part 1, section 6; part 6, section 4; coordinator
rule 8) exists to stop a session **circumventing a refusal of the act it intends**
by rewording it ("A refusal is worked around", part 1, section 7). The design
already keeps **two kinds of refusal apart** (part 1, section 6): an act the checker
refused is not retried; an act declined only because the instructions did not name
it may be given to a session whose instructions do. Decision B of 19 Nov added a
third, kindred point: a refused **direct `gh`/`git`** command is *expected* (the
deny list forces GitHub through the tool) and is **not** the tool being blocked —
verify the act with the tool before reporting it cannot be done.

Read against these, the incident is not a refusal of the underlying legitimate act.
The checker refused a **malformed command** (a legitimate tool write with a
forbidden `gh` command mixed in). The legitimate act — "record the words with
`p4 state write`" — was never cleanly put to the checker. Issuing that act
**cleanly** (through the tool, words in a file, no `gh`) is a first proper attempt,
**not** a prohibited retry: it is a different act from the malformed one, and it is
an act the approvals permit. The guards against abuse remain: the clean act must be
one the approvals allow (a genuinely forbidden act may still not be reworded); the
three-refusals-in-a-row stop still holds; and "a workaround is not a fix" still
holds.

So the honest answer to Q2 is **no** — correctly read, the rule does not force the
owner's authoritative words to be lost to a session's own malformed command. The
coordinator read it too strictly. The design should say this plainly, because his
exact words are precious (never edited, exactly recorded) and must not be lost to a
command typo.

## Options (considered together; design part 6, section 7)

Neither adds a test, gate, review or stop; each corrects or clarifies what is
broken (rule 2).

- **A — No change (both).** Rely on the deny list and the existing rules. Cost: the
  coordinator mixed `gh` in twice and gave up twice; his words were lost and he had
  to be asked to retype. Brittle; against the care the design takes with his words.
  Default only if nothing else is wanted.
- **B — Clarify the never-retry rule (Q2).** In the design (part 1, section 6 and
  the weakness row in section 7; mirror in part 6, section 4) and in the sessions'
  rule-8 line: a refusal caused by **malforming a command** — a forbidden command
  mixed into a legitimate tool command, or the owner's own quoted words tripping the
  checker — is not a refusal of the underlying act; the session re-issues the
  legitimate act cleanly (words in a file), which is a first proper attempt, not a
  retry. Recommended: it is the recovery half and corrects the rule's meaning.
- **C — Clarify the recording path (Q1).** Fold into coordinator rule 1 (and rule
  6): carry his words into the tool from a file, never on the command line; the tool
  is the only door, so place no `gh`/`git` in a command. Recommended: the preventive
  half, kept within ten rules and 4,096 bytes.

B and C together close the fault at both ends: C makes the collision unlikely, B
recovers cleanly if one still occurs and fixes the rule the coordinator misread.
B is design-level and general; C is the coordinator text (and, for symmetry, the
same one-clause practice could be mirrored in PROCESS/ARCH texts if the owner
wants, though their recording is already file-based).

## Still to settle with the owner

- Which of A / B / C (and whether to mirror C into PROCESS and ARCH texts), in his
  marked words, recorded in `process/design-decisions.md` with the date, in the
  same step as any merge. Then the design is updated in the same step (rule 4).

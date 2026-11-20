# Research: standardizing Process4 session names (20 Nov 2026)

Recorded by PROCESS before proposing (rule 3). Need, from the owner (20 Nov 2026,
conversation): "The names of process4 sessions need to be standardized. The PROCESS
session should be named 'PROCESS #N' where N indicates which generation the session
is (+1 of the just prior session). Project-specific sessions should be named 'product
role #N' where product is the product being built, role is the session's process4
role, and N indicates which generation the session is." Not yet his marked decision;
this note prepares the options.

Verified against the design, the starting texts, build text 5 and the tool at
`process4` `main` (`d462a59`).

## What session naming is today

- **Titling is specified only in the Claude Code harness table** (design part 7 §1),
  not in the harness-neutral body. Two rows bear on it:
  - *Grouping sessions under a product:* "A tag naming the product, set on each session
    when it is started. Sessions can be listed by tag." (This is the product **tag** —
    grouping, separate from the title; it stays.)
  - *The owner seeing each open job:* "Each job's session is **titled with its module's
    name**, and the list of sessions shows each one's title and whether it is working,
    waiting or finished."
- A **walking session** is titled by its per-walk **number** (`walking-session.md`:
  "You are walking session <number> for <product>").
- The other roles have **no stated title convention**. Starters are told only to start
  sessions "grouped under the product, passing on the owner's suggestion of model and
  effort" (e.g. `root.md` Acts; `watcher.md`; `arch.md`). The index flags this gap:
  "How a session tags or titles the sessions it starts is given for Claude Code only"
  (`starting_texts/00-index.md` §4, item 5).
- **The product name** is the `<product>` string the owner gives in his plain ROOT
  prompt (`root.md` part A) and that ROOT fills into the watcher/ARCH/coordinator texts
  and ARCH into the job/walker/lane texts. It is ~40 characters (index §1). It is **not**
  a field of `process.json` — it flows from the owner's prompt. So the convention's
  "product" token needs no new plumbing; the string already propagates.
- **There is no generation counter anywhere.** Nothing records "which generation" a
  role's session is. This is the one genuinely new mechanism the change needs.

## Who sets a session's title (and who starts whom)

- Owner → ROOT, PROCESS. ROOT → watcher, ARCH, coordinator. watcher → new watcher (at a
  takeover, as the new ROOT). ARCH → jobs, walking sessions, lanes. PROCESS → its own
  lanes. (design part 4 §2.)
- The harness tool `mcp__claude-code-remote__set_session_title` sets a session's title;
  a session can set its own. Setting a title on the account's own session is benign and
  routine (lesser than the start/message/archive the approvals already sanction).

## The proposed convention (concrete)

Title = `<product> <role> #<generation>` for product sessions; `PROCESS #<generation>`
for PROCESS. Generation = the session's refresh count for that role on that product:
**#1** for the first, **+1** at each refresh, replacement or takeover.

| Role | Title | Generation lives in |
|---|---|---|
| PROCESS | `PROCESS #N` | `handover-process` record (process repo) |
| ROOT | `<product> ROOT #N` | `handover-root` |
| watcher | `<product> watcher #N` | `handover-watcher` |
| coordinator | `<product> coordinator #N` | `handover-coordinator` |
| ARCH | `<product> ARCH #N` | `handover-arch` |
| lane | `<product> <area> lane #N` | `handover-lane-<name>` |
| job | **owner's call — see below** | round record module entry / job block |
| walking session | **minor call — see below** | round record walker entry |
| PROCESS's own lane | `PROCESS <area> lane #N` | PROCESS's `lanes` record (process repo) |

**Generation mechanism (technical — PROCESS decides, stated here).** Each long-lived
role's handover record gains a `generation` integer (the handover-process record, and
`handover-lane-<name>`, among them); a job's lives in the round record's module entry
(a job "continues from the same branch and pull request" on replacement, so its
generation increments there); a walker's in the round record's walker entry. The
starter reads the prior generation from the shared state and titles the new session
+1; an owner-started ROOT or PROCESS self-titles on start from its own handover
record. The counter lives in the shared state, not inferred from live sessions, so it
**survives a cold restart** (where ROOT archives every session and starts the roles
afresh — part 4 §7): the generation continues rather than resetting. First session of
a role = #1. All of this is **additive** to the record forms; it adds no test, gate,
review or stop.

## The genuine judgment calls for the owner

1. **A job's title (his to settle — it touches what he sees).** A job holds no process4
   role (part 0 §6); today it is titled by its **module name** precisely so the owner
   can see and tell apart each open job (part 4 §9; part 7 §1). Options:
   - **(J-a, recommended)** `<product> <module> #N` — e.g. `civicsmith orders #2`.
     Keeps the module signal the "see each open job" requirement needs; N = that
     module's job generation.
   - **(J-b)** `<product> job <module> #N` — adds the literal word "job".
   - **(J-c)** `<product> job #N` — literal "job", no module. **Not recommended:** it
     drops the module and weakens part 4 §9 / part 7 §1 (seeing each open job).
2. **A walking session's title (minor).** Walkers already carry a per-walk number.
   Recommended: `<product> walk <number> #N` (number as today; N increments only if that
   walker is replaced mid-walk). PROCESS can decide this; raised only because it is
   visible.

The standing roles and PROCESS are unambiguous; only the two roleless kinds (job,
walker) need a word from the owner, and only J above truly does.

## What the change touches

- **Design:** part 4 (state the naming convention, harness-neutral — e.g. §11 "Smaller
  rules a session needs"); part 7 §1 (replace the "titled with its module's name" row
  with the full convention and the title-setting mechanism; the product **tag** row is
  unchanged). Part 8 (Codex) titling stays "Not known" / later work — consistent with
  the owner's 20 Nov direction to defer Codex here; so a cross-harness requirement is
  stated with its Codex mechanism owed, no Codex file touched (rule 7).
- **Starting texts:** fold the title into each starter's existing start-act line
  (`root.md`, `watcher.md`, `arch.md`, `process.md` for its lanes) and the self-title
  for owner-started ROOT/PROCESS; update the `walking-session.md` / `job.md` self-
  description if needed. Each fits within 8,192 B / ten rules (titling folds into an
  existing Acts line, not a new rule).
- **Records (build text 5):** add `generation` to the handover records, the round
  record's module and walker entries, and the job block (§2, §5). Additive.
- **Tool:** where the tool writes a job's / walker's starting instructions and the
  starter titles the session, carry the generation; `next-job` / `walk text` surface it.
  A small, additive tool change; its own tests move with it (rule 7). No new test/gate.

## Checks against the rules

- Rule 2: this is a **requirement change** (a new naming requirement) made with the
  owner's explicit approval; it adds **no** test, gate, review or stop. The process
  after it still meets the process4 requirements, and it strengthens part 4 §9 (seeing
  each open job) by keeping the module in a job's title (J-a).
- Rule 7: Claude Code only; no Codex file touched; tool change carries its own tests.
- Part 1 §5: the title-setting mechanism and generation storage are technical — PROCESS
  decides them and reports in one line; only the job/walker naming (what he sees) goes
  to the owner.

## Options for the owner (considered as one change)

- **A — No change.** Keep today's ad-hoc titling (module name for jobs, number for
  walkers, nothing stated for the standing roles). Cost: no generation lineage; the
  standing roles have no stated title; the gap the index flags stays.
- **B — Adopt the convention above (recommended), with the job title = J-a.** One
  process change: the design/text/record/tool edits listed, the generation counter in
  the shared state, no new test/gate/stop.
- **C — B, but with a different job title (J-b or J-c) or walker form**, as the owner
  prefers.

To settle: his marked decision (and his pick for the job title), recorded verbatim in
`process/design-decisions.md` with the date, in the same step as the merge.

## Separate finding (not part of this proposal): stale "owner approves/proposes a tranche"

Found while surveying the starting texts for this task. The owner's settled decision
**"Decision: Remove the owner's tranche-approval" — 20 November 2026** (record entry
"No owner approval of a tranche"; design part 1 §3, part 3 §1, part 4 §1) removed any
owner approval or proposal of a tranche — ARCH now opens each tranche and decides its
scope. Two texts still carry the old rule and were missed when that decision landed:

1. `starting_texts/arch.md:23` rule 6: "**Propose each tranche to him before it opens**;
   …" — contradicts part 4 §1 ("opens each tranche and decides its scope").
2. `process/design-decisions.md:443` (inside the "Which list of journeys counts" entry,
   prose, **not** the owner's quoted words): "**The owner still approves each tranche**
   (part 3, section 1); he simply does not separately approve the journey list." —
   contradicts the later "No owner approval of a tranche" decision.

Both are **faithful-to-settled corrections**: the rule already changed on the owner's
marked word; only these stale references lag. They change no rule and add no test, gate,
review or stop. PROCESS will correct them under the owner's standing direction (fix
arch.md rule 6 to "Open each tranche and decide its scope"; drop the stale parenthetical
in the decisions entry, leaving his quoted words untouched), tool-tests green, and note
it to the owner — kept apart from the naming change.

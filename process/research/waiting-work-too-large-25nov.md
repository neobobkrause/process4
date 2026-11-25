# The notices of record-grammar's merge were not saved to waiting work (25 Nov 2026)

A process fault from civicsmith ARCH #15, passed unchanged by coordinator #7 at 01:28Z:

> "`p4 notify 1339` (record-grammar), rerun at 00:47Z, finished at about 01:30Z (about 43 minutes). It wrote the notice
> into the job blocks of the seven open jobs it told (case-checker 1358, escalation 1359, wizard-scripts 1353, affordances
> 1360, interface-shell 1351, screens-capture 1361, control-plane 1338), then printed `p4 notify: GitHub would not rewrite
> the waiting-work record; it stays as it was` and exited 0. The waiting-work record is unchanged (empty), so every notice
> for a told module with no open job was not recorded. Most users were told as 'not followed fully' (each with many
> places), so the record it tried to write was likely very large; not measured. I kept only the last 60 lines of the
> output, so I cannot list the modules whose notices were lost (my error). Not worked round: I do not re-create the notices
> by hand; per design part 2 section 7 a missed user is caught by its own next job or a walk."

## What the code shows

- `notify` (tool/lib/notify.mjs) puts every told user with no open job into the one `waiting-work` record, each entry with
  its whole `uses` (every reason, each "not followed fully" reason with up to six places per cause and a count).
- `writeRecord` (tool/lib/state.mjs) writes the record as one comment, JSON indented by two spaces. When GitHub refuses the
  edit, the tool reads the record back, finds it still there, and fails with "GitHub would not rewrite ..."; GitHub's own
  words are dropped (the edit is sent with allowFail), against build text 5 §1 ("exit 1 with GitHub's words").
- "exited 0" is most likely the session's `| tail -60` hiding the exit code; `fail` exits 1. Not a tool fault.
- GitHub refuses a comment body longer than 65,536 characters. The design rule is that each record is kept under the
  single-text maximum (design part 4, section 4; 60,000 bytes on Claude Code), "as a rule"; nothing keeps waiting work
  under it, and one notice of an early provider can tell nearly every later module. Likely cause, not measured.
- Why so many are told: in plain JavaScript most users are "not followed fully" (cause 2: a value of unknown kind
  somewhere in its files), and such a user is told on any change to the provider's listing (design part 2, section 7,
  rule 2). So a stated-comment fix in the third module tells most of the 200 after it. That is the notice's rule working
  as written; how much work it saves on civicsmith is the open question (information for the owner).

## Consequence

The told modules with no open job did not get their notices; which ones is not known (ARCH's output is cut). A re-run of
`notify 1339` with the record fixed would recover them (a second run rewrites its own entries); at today's speed that
is about 43 minutes.

## Options (to be put together with the speed options; they interact)

- **A. No change.** Lost notices are caught by each module's next job or a walk (design part 2, section 7).
- **B. Keep waiting work small.** A waiting notice in the record holds only the module, the provider and the merged pull
  request; its reasons are written once per `notify` on the merged provider's pull request, as one or more comments
  each under the limit, and `open --module` copies a module's reasons from there into the job block. Also: the tool
  prints GitHub's words when a write fails. Then re-run `notify 1339` once to recover the lost notices.
- **C. Let a record span several comments** (waiting-work, then continuation comments), read back together. General,
  but against the design's rule that a record stays under the single-text maximum.

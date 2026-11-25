# The waiting-work record outgrows one comment (25 Nov 2026, PROCESS #13; not yet put through options in full)

A process fault from civicsmith ARCH #24 via coordinator #9 (10:38Z), unchanged: "civicsmith, Process4 version 55db8e45df.
`p4 notify 1445` (office-readers' merge) ran to its end at 10:37Z 25 Nov, told the one open job it names (sources, PR 1585)
and wrote the notice's reasons on PR 1445 (9 comments), then failed on its last act: 'p4 notify: GitHub would not rewrite the
waiting-work record; it stays as it was. GitHub said: gh: Validation Failed (HTTP 422); ... body is too long (maximum is 65536
characters)'. The waiting-work record (issue 1122) already holds 1,937 entries, 256,350 bytes as `state read` prints it
(171,183 as compact JSON), almost all notices; older entries still carry their `uses` from before decision B of 25 Nov.
`writeRecord` (tool/lib/state.mjs) writes each record as one comment, and the design keeps each record under the single-text
maximum 'as a rule', which nothing now keeps for waiting work. So every notify still to run (about 67 merged pull requests
queued, from 1436 to 1583) can tell open jobs but cannot place its notice against a module with no open job; those placements
are lost until it is mended. A re-run after the mend adds them (a second run adds nothing to job blocks)." ARCH #24 holds the
notify queue and goes on merging and filling slots from the waiting work that stands.

## Reading

Decision B of 25 Nov moved a notice's reasons onto the merged pull request so the record names only the notice; but the
number of entries (one per told module per notice) still grows with every early provider's merge, and old entries keep
their `uses`. Even without `uses`, ~1,937 entries of about 60 bytes is ~115,000 bytes, past 65,536. So the record needs to
span more than one comment, as the notice comments already do, and old `uses` can be dropped where the pull request holds
the reasons. 3B and (if chosen) 2C+ would shrink how many entries arise, not the bound itself.

## Options (to put)

- A. No change: notices for modules with no open job are lost while the record is full.
- B. The waiting-work record (and any record that can grow with the product) is written in as many comments as it needs,
  each under GitHub's limit, read back as one (`writeRecord`/`readRecords` in `tool/lib/state.mjs`; build text 5 §1–2),
  and an entry no longer carries `uses` where its merged pull request holds the reasons. After it lands and civicsmith
  moves, ARCH re-runs the queued notifies, which place what was lost. Recommended.
- C. Only drop the old `uses` and group entries by module: smaller, but still past the limit on civicsmith.

# A notice's "not followed fully" reason lists every place, without bound

Written by PROCESS #9, 23 Nov 2026, at its refresh point; left for PROCESS #10. A process fault from civicsmith ARCH #9
(`session_018BhcefbF7yfG4BzPcVX5su`), passed on unchanged by coordinator #4 at 08:22Z:

> "`p4 notify 1236` (screens-public #1, merged into p4-tranche at 33479831a1, tool 0eec86f, run with node
> --max-old-space-size=12000 to pass the earlier OOM) finished its listing and told journey-check, then ended "p4 notify:
> GitHub would not rewrite the waiting-work record; it stays as it was". Its output was 3,837,417 bytes: the notice's
> reasons for journey-check ("not followed fully for screens-public" and "... for screens-publish [changed through
> screens-public]": "reads or calls values of unknown kind") list every unknown-kind place in journey-check's files
> (agent-worker/test/*, bio-plane/test/*, bio-plane/src/journey-check/*, docs/.../words-reads.src.mjs ...) without bound,
> so the waiting-work body is far past what one GitHub comment holds. No notice from 1236 is placed; the waiting-work
> record is unchanged. ARCH will not trim the record by hand."

Note: civicsmith still runs tool 0eec86f; the owner's move line (on his page) has not been typed, so decision D (PR 205)
is not yet in civicsmith. D does not change this: the reason text is the same.

## Why (main)

`tool/lib/notice/notice.mjs` line ~376: `why.push(\`reads or calls values of unknown kind: ${ub.anything.join('; ')}\`)`
joins every place. The reason goes into the waiting-work record as the told user's `uses` (build text 5, sections 2 and
6). A "not followed fully" user runs its whole module's tests (build text 5, section 7, step 3), so the places in this
reason choose nothing; they only explain. The proof's notice kept the first six lines for an entry (build text 5,
section 5).

## Options

- **A. No change.** Any user with many unknown-kind places makes the record too large to write; its notice is lost.
- **B. Bound the reason (recommended).** Each "not followed fully" cause lists its first few places (six, as the proof
  did) and then "and N more"; the whole module's tests still run for that user, as now. Changes the tool's reason text
  only (`notice.mjs`, a test); the proof replay must still pass (its reasons may be shortened; any `expected.json` change
  written with its reason). Adds no test, gate, review or stop.

# `notify` cannot send five of civicsmith's conversion notices; R15's alias and member cases (26 Nov 2026, PROCESS #18)

Two process faults from civicsmith ARCH #28 via coordinator #10, 14:18Z, unchanged. Not yet researched: for PROCESS #19.

1. From the job jurisdictions #3 (PR 1691, merged): "R15 flags a list converted to an own alias (Value) but not to the same
   union spelled out, and a list passed as an argument but not one assigned to a Fields member."

2. Met by ARCH #28, Process4 1216397f, each `p4 notify` run alone on a 15 GB machine with 14 GB free: "`p4 notify` cannot
   send the notices for five of tranche t3's seven conversion merges. For pull requests 1689 (record-grammar), 1691
   (jurisdictions) and 1692 (civil-time) it fails with: Error: reading the product failed: ...
   tool/lib/notice/notices.mjs:14 process.stdout.write(JSON.stringify(mods.map((m) => notice(treeB, treeA, m.module, { ...
   RangeError: Invalid string length. The notices for every module are serialized as one JSON string, which passes the
   language's string limit. For pull requests 1688 (setup-words) and 1693 (calc-grammar) it prints: 'p4 notify: could not
   read the product within this machine's memory; nobody is told; the notice for pull request 1688 is owed' (likewise
   1693), run twice, the second time alone. Pull request 1694 (connection-grammar) notified fine (nobody told)."
   ARCH adds: the notices for 1688, 1689, 1691, 1692 and 1693 are owed; no job is open and none outside the eight starts;
   the notices only tell later modules' next jobs what to re-check.

Reading (not researched): (2) is a tool fault that loses notices (owed, recorded by ARCH, re-runnable once mended): the
child process's whole result is one JSON string; write it as one line per module, or in parts, and see why the
conversion merges read so much (decision 2-B1 should make a conversion that changed no item tell almost no one, so the
reading may be wider than needed). This is urgent for civicsmith's next merges. (1) looks a tool inconsistency in R15.
Both measured; put options to the owner with the group in `facility-names-26nov.md` (civil-time #3's items).

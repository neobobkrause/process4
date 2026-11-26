# civicsmith's first pass of 8 conversions: the figures (26 Nov 2026, PROCESS #19)

Asked for by PROCESS #19 through coordinator #10, for the owner's review of the first pass (the plan in
`uses-metadata-25nov/design.md` §2 H and §4: effort, the uses file beside the code, whether it serves the provider/user
requirement). Sent by civicsmith ARCH #28, 16:19Z, from the jobs' reports, session records and merged uses files (tool
1216397f); nothing new run. Summary, not changed in substance:

- **Time and cost per job:** documents 24 min $1.74; jurisdiction-profiles 6 min $2.58; setup-words 23 min $7.47;
  connection-grammar 37 min $14.03; record-grammar 48 min $24.49; civil-time 59 min $22.77; calc-grammar 65 min $25.67 (one
  send-back); jurisdictions 103 min $51.67. About $150 in all, run in parallel 08:49–10:47Z. ARCH's own cost not read.
- **Places (at the job's start -> left outside in the merged uses file):** setup-words 775 -> 186; record-grammar 1,527 ->
  116; jurisdiction-profiles 5 -> 0; jurisdictions 6,440 -> 73; civil-time 2,308 -> 50; calc-grammar 2,118 -> 70;
  connection-grammar 926 -> 233; documents 219 -> 0 (its script moved, not converted). In all 14,318 -> 728 (95% converted).
- **By cause, as the jobs judged:** tool faults (most S12 `x.test`, R14 unnamed members, Hash, R1/R2 false places; fixed in
  54d7eee and 70022da); a provider or data owner not yet converted (most R2 and S5; "data owners all come later in the
  order"); no form in the standard (tests replacing host globals — clock, fetch, Date — in civil-time, jurisdictions and
  record-grammar; eval; child processes and gc in calc-grammar; a generic deep copy); ARCH's (boundary modules and the
  facility list). Order faults: none. Merged-file counts exceed three jobs' own reports: not investigated.
- **Copies:** none found or marked.
- **Uses files:** not checked against the code by ARCH; unknown. No job reported a wrong or missing use.
- **Hard or worked around:** behaviour kept exactly (jurisdictions compared old and new on 24,000 profiles and 10,607
  inputs; calc-grammar sent back once for changed edges); a committed bundle and a location list that go stale; existing
  bugs found and left (jurisdictions 7, calc-grammar 2); `notify` failed on five merges.

**PROCESS's reading.** At ~$19 a module on average (range $2–52), 204 modules is roughly $2,000–6,000 for the jobs, ARCH
unread, and at 8 slots about 26 batches; the first 8 include some of the largest modules, so this is an estimate only.
Open questions: whether an earlier module waiting on a later "data owner" is an order matter; whether the uses files are
right (unchecked); a form in the standard for a test that replaces a host global (three modules already).

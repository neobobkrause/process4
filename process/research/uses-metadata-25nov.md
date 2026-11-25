# Each module records the providers it uses: the owner's proposal (25 Nov 2026, PROCESS #14; not yet designed)

The owner, in PROCESS #14's session, 25 Nov 2026 (conversation, after the research `who-is-told-25nov.md`):

"We don't need to measure the impact of the coding bugs as much as we need to fix them. But a fix now would be perhaps the
third time we've "fixed" this process. Any further change must be rigorously understood to be a fix that will actually fix
the problems we've been experiencing and the problems we haven't yet experienced yet know are problems.

It's my sense that a root problem we've not properly addressing is that we don't have a clear accounting if the
relationships between providers and users. That needs to be addressed. I've suggested that every module maintain a metadata
file that defines which providers the module and tests refer to. I think we need to fully appreciate that the means by which
JS code might refer to a provider is not straightforward. And yet, every references, through any means, was initially
written with forethought and knowledge of available providers earlier in the order.

If we were to adopt the metadata file method I'm proposing, we would need a job to run on every module to go through and
really understand the code so that its metadata is accurate. Every real change to real code (either module code or test)
would need to keep the metadata up to date in light of the code changes. Further, the metadata should indicate whether
references to a provider is in the module code, tests, or both.

Once every module has a metadata file, then the process of finding all users of a provider would be a github grep, right?
Would a tool that does that be an efficient/fast means of notifying users when a provider has a material change to one of
its interfaces? If so, then this might be a real solution rather than a "let's try this or that" approach that we've taken
so far."

Not marked: conversation, not a decision. Option C of `who-is-told-25nov.md` is set aside while this is designed (PROCESS #14
proposed so to him; he has not decided).

## PROCESS #14's first analysis (to be designed in full by PROCESS #15, with workers)

- **Why it is a root fix.** The tool now infers uses by reading plain JavaScript, which refers to a provider in too many ways
  to read reliably, and its fallback when it cannot is "tell" (F2, F3 of `who-is-told-25nov.md`): most of the over-telling.
  Every reference was written by a job that knew the providers; the job is where the record can be complete.
- **Finding users becomes a lookup.** ARCH's session holds the tranche branch: reading ~200 small files takes seconds, not
  the 40 minutes and 8 GB notify has taken. Removable then: the staged reading and type-checking of later modules, the
  not-followed fallback, `narrow.mjs`, much of `usage.mjs`; the merge wait's "modules it uses" can read the files too.
- **Entry level, and files.** For "ideally only the users of the entry that changed": per provider, the entries used and the
  files using them, marked code, tests or both. The files let the tool pick a told job's related tests from the record
  (build text 5 §7's call-following, unproven, could go).
- **The other half: what changed.** The metadata answers who uses an entry, not whether the entry changed. F1 (describing
  unchanged code counts as a change; setup-words' 197) must be settled in the same design: the provider's listing diff with
  F1 mended, or the provider's job stating which entries changed in domain or range, or both. One module only, so cheap.
- **Kept accurate without a new gate.** The job writes it as part of its own module (as it writes its tests). The existing
  check of declared uses against imports (design part 2 §6) can compare the file with the imports the tool does see; it
  already refuses a declared later module. A reference the job forgot is a missed notice, caught by the user's own tests or a
  walk, which the design accepts. Whether the module list's declared uses are replaced by the file: to design.
- **It reverses a rule of the owner's:** design part 2 §7, "For the tool that finds the change", point 1: "Which parts of a
  provider a user uses is worked out by the tool from the user's code and comments. No list is kept by hand." Needs his word.
  Not the same as the uses file tried on 25 Nov (`notify-slow-early-provider-25nov.md`): that cached the tool's own inference
  and went stale; this is authored by the job with understanding, and a provider's change tells exactly the users who must
  update their files.
- **Cost.** One job on every module once (civicsmith: 204; guessed, not measured, a few hundred dollars), then a small part
  of each job. Against ~$150–300 lost per early merge now.
- **To design:** the file's form and place (inside the module's files, so its job owns it); the first-writing job and its
  brief; how a job keeps it current; notify, merge wait and related tests reading it; "really changed"; what is removed from
  the tool and texts; the move of civicsmith (its tranche, held notices, choice 6); proof on the trial product (every proof
  case: who needed telling is told), then civicsmith read-only. Also explain the proof's "needed and missed: 45".

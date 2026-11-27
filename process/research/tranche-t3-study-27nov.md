# civicsmith's tranche t3: why conversions gave way to fixes, and case-checker's merge (27 Nov 2026, PROCESS #21)

Asked by the owner in PROCESS #21's session, 27 Nov ~06:11Z: "What caused civicsmith development during the tranche in
which only conversions were to be done to switch purposes to the point where conversions stopped happening, bug fixed
started being worked on, and case-checker got stuck unable to merge causing a blockage of other jobs that couldn't merge?
Don't guess." Earlier, in PROCESS #20's session (~06:09Z): "we need to study what happened to the last tranche".

**Sources.** Read in full by six workers, reports kept for this session only: civicsmith coordinators #13–#16, ARCH
#31–#35, case-checker #5, docprofile #7 (three sessions), site-profiles #5 (two), PROCESS #20; the tool (`tool/lib/round.mjs`
`workOf`, `chooseNext`, `slots`; `tool/lib/commands.mjs` `jobWaits`, `merge`); the design (part 2 §§3, 5, 7, 8; part 3 §1);
build text 5 §2; civicsmith's conversion plan §5. Not readable from here: civicsmith's repository and round record (seen only
as its sessions printed them), and sessions of the old Claude account (before 26 Nov ~21:15Z). Times are event times (UTC);
the sessions' own clock estimates run 25–30 minutes ahead.

## 1. What the owner's word was, and when

- civicsmith's decision record, as coordinator #13 read it at 21:21:57 (26 Nov), held one instruction on the tranche:
  "Instruction: once civicsmith is using the latest process4 version, open a tranche to convert the first 8 modules in order,
  writing the facility list first; then stop for my review". ARCH's round record held `scope.holds` = those eight, and
  six fixes the eight conversions had found sat in waiting work, marked by ARCH #30 "for later; no job starts".
- PROCESS #19's handover (commit abce26f) said civicsmith was "converting all modules (the owner's instruction at its
  coordinator: every module in order, conversions only)". No civicsmith session on this account holds such an instruction.
  Whether he typed it to the old account's coordinator cannot be read from here.
- 21:22:28, the owner to PROCESS #20: "Will telling the civicsmith coordinator to lift the stop result in it doing the sweep
  to convert all modules? That's the next step, right?" PROCESS #20, 21:22:51, unverified: "Your "every module in order,
  conversions only" isn't kept by any session. Civicsmith's ARCH wrote it into the current round's record … Once you lift
  the stop, ARCH … goes on through the remaining modules in order." This was wrong: the round record held the first eight
  only, and no scope form can say "conversions only" (section 3). PROCESS #20 said so itself at 22:18: "the round's scope
  can't express "conversions only"".
- 21:29:50, at the coordinator: "The review of the first 8 modules is complete. The process has been updated based on that
  work. Instruction: lift the stop". 21:37:42: "The fact that the review of the first eight modules is complete isn't a
  decision, it's a fact that I've confirmed for you." Coordinator #14 relayed it to ARCH #32 (21:37:55): "Whether the review
  pause is now over, and what comes next in t3, is yours to decide."
- 22:18, PROCESS #20's options on the 199-module notices included B: "Hold all ordinary work, like these bug fixes, until
  every module is converted (your earlier "conversions only")". He chose A (no module told before its conversion).
- 02:51:53, to PROCESS #20: "The conversion tranche is a housekeeping. No new features are being added. So the walks are
  unnecessary. Tell me what to tell the civicsmith coordinator…". PROCESS #20 gave the marked text, and said that to stop
  bug fixes he should add: "Place no work but conversions until every module is converted; bug fixes wait for the next
  tranche." 02:52:51, at the coordinator, he typed the first text only: "Decision: this tranche is housekeeping: module
  conversions only, no new features. A conversion changes no behaviour, so ARCH names no walk area for it; a round in which
  no area is named has no walk and no deployment." ARCH #34 read it as "conversions only, plus the small fixes those
  conversions turn up".

So the owner's "conversions only, every module" never reached civicsmith as a marked word before 02:52, and the word that
reached it then did not hold fixes back. Until then the tranche was, in civicsmith's record, "the first 8, then stop".

## 2. How the fixes began (round 1, 21:40Z–03:49Z)

- ARCH #31 (21:31) and #32 (21:33) each said they would start no job until his marked word. At 22:01 ARCH #32 decided:
  "The review pause is over…", added the next eight modules to the scope, and ran the four inherited fixes first
  (setup-words, jurisdictions, calc-grammar, case-checker; pull requests 1706–1708, 1710): waiting work is work whatever
  the scope (design part 2 §3; build text 5 §2), and the tool ranks them earliest in the order.
- The three fix merges each told all ~199 unconverted modules (decision A, made at 22:18 and moved to at 01:42, ended that),
  each notice ~100 MB; GitHub's secondary limit refused writes 22:10–22:50 and ~01:08; a gap in the tool's description of
  Node (TextDecoder) refused correct code in ooxml, csv-reader and office-readers. The owner cut slots to 4 at 01:17.
- ARCH widened the scope three more times on its own judgment (23:05, csv-reader to docprofile: "conversions are the
  cheapest work to run while PROCESS looks at the fix"; 04:06, round 2's sixteen). Naming a whole module brings its unmet
  requirements in with its conversion: `next-job` offered test-support's R16 and R17 as an ordinary job (23:17), and ARCH
  took test-support out of scope.
- The tranche's own conversions found real defects ("A conversion can't fix that", ARCH #32, 23:57, 23:59) and placed them
  as flaws on the same modules: text-chain #3, csv-reader #6, office-readers #13, odf-reader #9. By 02:15 the open jobs were
  three such fixes and case-checker.
- **Conversions make flaws in later modules.** A conversion states its module's types. The tool's check then refuses a later
  module whose own stated types claim more than its code hands back, or a provider whose stated answer hands out `unknown`
  (coding standard R4). docprofile #6, 03:09:57: "4 disagreements with site-profiles' stated interface. They appeared after
  site-profiles' conversion (789a46fb), which merged after docprofile's uses file was written and told no one." Under ARCH's
  decision of 27 Nov (pull request 1738) the later module widens its stated type (a change of means, told to its users) and a
  provider's `unknown` is a flaw placed against the provider. So each conversion could put ordinary work on an earlier,
  already converted module, and each such merge told its users: round 1 under ARCH #34 opened no conversion at all, only
  ordinary and told jobs, "14 told checks closed with nothing to change". The design says a conversion "changes no behaviour,
  so no user has anything to re-check" (part 2 §7); what the check refuses in its users does change.

## 3. Why "conversions only" could not be kept even once said (round 2, 04:06Z–06:06Z)

- Round 2 opened with ten conversions. Then the tool gave, in order of the module list, ahead of the six conversions still
  unopened: docprofile #8, an ordinary job for a flaw legistar-reader's conversion found (04:58); pdf-worker R45, a
  requirement of a whole module in scope (05:22); told jobs from docprofile's two merges, started above the slot number
  (05:14–05:18 and 05:54–06:07; "slots in use 11 of 8"). At the halt 14 job sessions were open against 8 slots, eight of
  them told by docprofile's merge.
- What the tool can do, by its code: a module not yet converted has its conversion as its only work; once it has merged, its
  work is every requirement not yet met that the scope holds, and everything waiting for it (`workOf`). The scope names
  whole modules or single requirements; there is no form that holds a module's conversion and not its requirements, and no
  form that leaves flaws or notices out. Slots go earliest in the order first, and a told job earlier than the latest
  running one starts above the slot number (`chooseNext`). So in a tranche of conversions in order, the earlier modules'
  fixes and checks always rank ahead of the later modules' conversions.
- ARCH #35 then held three job-reported flaws "for the next tranche, since t3 is conversions only" (05:06, 06:07), against
  the design's rule that such flaws are always work. No session raised the conflict with PROCESS.

## 4. case-checker

- case-checker is 125th in the order; its job (#5, pull request 1710, started 21:48) was an ordinary fix: regenerate a
  committed bundle of 87 inputs that civil-time's and connection-grammar's conversions had left stale. Its tests ran four
  times: one failure (check disagreements caused by three conversions), then three passes (160/160) at 22:00, 22:56 and 01:57.
- Its merge was refused at every attempt: notices arrived after its tests (22:04; 01:48, text-chain's fix, each leaving the
  bundle stale again); and it waited on a provider's open job each time ARCH tried: six conversions (23:15), ooxml and
  csv-reader held by the TextDecoder refusal (23:54), office-readers #13 and odf-reader #9 (02:17), ooxml 1739 and
  office-readers 1734 (02:37), format-registry, text-chain and site-profiles (02:49), csv-reader (02:59, 03:19),
  office-readers and odf-reader (03:24), pdf-reader (03:26), docprofile 1752 (03:33). Each was a job ARCH had just opened on
  a module case-checker uses. It merged at 03:49 (1c12b6bd), about six hours after it started.
- The merge rule (`jobWaits`): a ready job waits while any module it uses, directly or through others, has an open job not
  recorded blocked. Nothing stops a new job starting on such a module while a ready job waits on it, so a late module with
  many providers can wait as long as its providers keep getting work.
- Holding others: in these sessions case-checker held no other job's merge. Every module in t3's scope is earlier in the
  order (positions up to about 38), so none could wait on it. While it waited it held a slot (an open job not blocked counts),
  one of four after 01:17. No case-checker job was open in round 2. Whether the owner saw a different hold is not in the
  record read here.

## 5. The build plan

civicsmith's conversion plan (§5, written 22 Nov, before the coding standard) planned a first tranche of "a thin slice … and
one journey through them", with walks and a deployment, and "Later tranches widen in module order". The coding standard (25
Nov) made a conversion each module's first job, mixed into ordinary tranche work by the tool (design part 2 §3). No text
of Process4 or of the plan describes a tranche of conversions alone, how it is opened, or what happens to the flaws the
conversions find; the owner's own phrase for it ("the sweep", "housekeeping") has no counterpart in the design.

## 6. The causes, in short

1. His intent did not reach civicsmith: PROCESS #19's handover recorded an instruction civicsmith's record does not hold,
   and PROCESS #20 told him, unchecked, that it was in the round record. The marked word came at 02:52, without the sentence
   that would have held fixes. (Faults of PROCESS's own: a claim not checked, design part 1 §7.)
2. With "the first 8, then stop" ended by his confirmed fact, ARCH decided what came next, as the design lets it (part 3
   §1): the inherited fixes first, then wider scopes.
3. The process has no way to hold a tranche to conversions: a module's scope brings its requirements, flaws and notices are
   always work, and the earliest modules rank first.
4. Conversions, by stating types, make the check refuse code in other modules, which became flaw jobs whose merges told
   users: a chain the design says conversions do not start.
5. A ready job waits while any provider has an open job, and new provider jobs keep it waiting: case-checker waited six
   hours; it held a slot, not other merges.
6. Tool faults (notices to 199 modules, GitHub's limits, host-description gaps) slowed round 1 and cut slots to 4.

## 7. Options put to the owner

See `process/handover.md` and the owner's page. Proposed together: X (a scope of conversions only) and Y (a provider job
started after a ready job's tests does not hold it), with 0 always; recommended X and Y. What X and Y do not settle: cause 4
(a conversion's stated types refusing other modules' code) is ARCH's decision 1738 in civicsmith and the check's refusal (b)
here; whether it should exist inside a conversions-only tranche is a further question, unmeasured beyond these runs.

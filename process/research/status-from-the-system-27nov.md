# A status stated from the transcript, not from the system (27 Nov 2026, PROCESS #21)

The owner, in PROCESS #21's session, 27 Nov (conversation, unmarked), relaying his talk with civicsmith's ARCH: a session
sometimes states as fact something it believes but never verified; "A session keeps a running picture of its own actions in
its context. When it writes a summary, it can draw on that picture or check the real state." ARCH's account, as he relayed
it: the picture is the transcript itself, and a summary drifts from the real state because (1) things that did not happen
leave no trace ("26 archive calls are in it; the 2 that were never made aren't"); (2) a habit stands in for checking each
case ("I archive each job when it's done" became "every job is archived"); (3) results arrive later, elsewhere (case-checker's
merge ran in a background command, and "the step that should follow a merge was tied to a job's message, not to the merge");
(4) details drop out when notes are rewritten (#34 kept "case-checker 1710 (ready…)" but dropped the session's id); (5)
other sessions change things; (6) length. Its conclusion: "the reliable fix is mechanical: before stating a status, ask the
system (list the sessions, read the pull request), and say plainly when I haven't."

## What was checked here
- case-checker #5 (`session_012hdw2S1BUKkpkTUqQfAK43`): archived as read by PROCESS #21 (get_session, ~08:00Z 27 Nov); its
  last turn ended 01:59Z. When it was archived was not read. The "26 archive calls" and "2 never made" are ARCH's count, not
  checked here.
- The same failure in PROCESS's own lineage this day: PROCESS #20 told the owner, unchecked, that "every module in order,
  conversions only" was in civicsmith's round record (`tranche-t3-study-27nov.md` §1).

## What the process says now
- Design part 1 §7, the known weakness "A claim is made that was not checked": its sign is only "It is about to tell the owner
  that something works or will work". A status (what is archived, merged, open, recorded), a fact told to another session,
  and a line in a handover are outside that sign. Both cases above fell outside it.
- Part 1 §5: each claim put to the owner says what is proven and names its source. Again only claims to him.
- Part 4 §5: "A finished session is archived … The session that started a session archives it". No moment is named, so ARCH
  tied it to the job's report, which a job that was already ready never sends (cause 3).
- Part 4 §4: a handover holds "what that role's successor needs to carry on"; nothing says it should name where state is read
  rather than copy it (cause 4; see H in `sizes-handovers-goals-27nov.md`).

## Options (to be considered with S, H, X, Y, Z)
- 0. No change.
- V. Correct the weakness row's reach. Sign: it is about to state a status or a fact, to the owner, to another session, or in
  a handover or record. What it does: reads the system that holds it first (the session list, the pull request, the shared
  state, git) and states it with what it read; anything it did not read it calls unchecked. It widens an existing row; it adds
  no gate (nothing is refused or stopped). Velocity: one read per status, seconds; fewer wrong statements to undo.
- H (widened). A handover carries no instruction or decision of the owner and no copy of state another system keeps
  (sessions, pull requests, records); it names where each is read. Its successor reads them there.
- A. Archiving tied to the act that ends a job: ARCH archives a job's session in the turn its pull request merges or closes,
  as it refills the slot; and at each refresh it lists the product's sessions by tag against the pull requests and archives
  any whose job has ended. The second reads the system for the events the transcript cannot show (cause 1). Text only.
Recommended: V, H and A, with S and H as one text change.

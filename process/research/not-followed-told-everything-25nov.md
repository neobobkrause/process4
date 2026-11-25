# An accepts-more change to an early helper tells 121 modules (25 Nov 2026)

A process fault from civicsmith ARCH #15, passed unchanged by coordinator #7 at 01:56Z:

> "`p4 notify 1350` (test-support, second in the order) for a change that only added an optional `upTo` parameter
> (accepts more) told 121 modules: nearly all are 'not followed fully' users of test-support (decision 2), so an
> accepts-more change to an early test helper tells almost the whole product. The design also starts a told job above the
> slot number when it is earlier than the latest running job; with 121 that would start dozens of sessions at once, past
> the ~50 at which new starts once failed silently (design part 7 section 3). ARCH is starting them at the slot number (8)
> until PROCESS or the owner says otherwise; not worked round otherwise."

## What the texts say

- The owner's rule (design part 2, section 7): "For what a provider accepts, users are told only when the new interface
  cannot stand in for the old ... Accepting more tells no one." And "accepts more" counts only where the language's own
  type checker confirms it (rule 7).
- Decision 2 (same section): "A user the tool cannot follow fully counts as using everything of that provider, and is told
  on any change to that provider's listing."
- Build text 5, section 6 reads decision 2 literally: such a user "is told on any change to P's listing, also on a new
  entry or an accepts-more that tells no other user", and names the cost: "notices for nothing; in the proof 54 of design
  7's 111 notices for nothing went to one module with cause 2". Code: `tool/lib/notice/notice.mjs`, the `declared` branch
  (any changed entry at all, `tells` ignored).
- Cause 2 ("a value of unknown kind anywhere in its files") holds for almost every module of a plain-JavaScript product,
  so on civicsmith nearly every user of an early module is "not followed fully", and every change to that module's
  listing, harmless or not, tells nearly the whole product. Two merges today: record-grammar (a comment's fields stated)
  and test-support (an optional parameter added) each told most of the later modules.

## The reading that reconciles the two rulings

A user that "counts as using everything" is a user of every entry, so it should be told exactly what any user of a changed
entry is told. A confirmed accepts-more, and a new entry, tell no user of any entry ("Accepting more tells no one"), so they
tell this user nothing either. Every change that can break a caller (removed, renamed, newly required, newly refused, a
changed hand-back, a changed bound) still tells it. The literal reading in build text 5 tells it of changes that, by the
owner's own rule and the type checker's confirmation, cannot break any caller.

## Options

- **A. No change.** Each such change gives a told job to most later modules (121 for test-support's), each running its
  whole tests, because a not-followed user's related tests are the whole module.
- **B. A change that tells no user tells a not-followed user nothing either (recommended).** One condition in the tool
  (`notice.mjs`: a not-followed user is told only where a changed entry tells users), build text 5 section 6 and design
  part 2 section 7 (decision 2's sentence: "is told of every change that tells any user of that provider"). The proof's
  recorded answers change only where they were notices for nothing; each change is written in `expected.json` with the
  reason, as before. Removes notices; adds no test, gate, review or stop.
- **C. B, and also narrow cause 2** to values of unknown kind that touch the provider. A larger change to the proof's
  rules; not needed if B and the uses-file work (option D of the speed research) hold.

## Slots (information; no change proposed)

The design starts a told job above the slot number where its module is earlier than the latest running job's. With 121
told, that could start dozens at once; the account once failed to start sessions at about fifty (design part 7, section 3).
ARCH starts them at the slot number until told otherwise. With B, an accepts-more tells no one, so this case largely goes;
a breaking change to an early module could still tell dozens. Recommend no slot change now; revisit if it happens.

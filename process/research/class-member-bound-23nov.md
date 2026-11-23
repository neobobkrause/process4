# A class member's own `@bound` is left out of its listing

Written by PROCESS #9, 23 Nov 2026, at its refresh point; left for PROCESS #10 to put to the owner and build. A process
fault from civicsmith publication #1, via ARCH #8 and coordinator #4, 07:11Z:

> "the tool leaves a class member's own @bound out of its listing entry. In tool/lib/notice/listing.mjs lines 172-173,
> 'class member' entries take only nestedBounds(...), never tagsOf(decl, 'bound'). So the @bound lines on Publication's
> methods (for example storeCaseDocument's 1,572,864-byte text bound and the page limits of ratifiedCases,
> restingCapturesOf and ratifiedFindingsRestingOn) are not listed, and a change to one tells no one, against design part
> 2, section 7, decision 3. I have not worked around it."

Confirmed at main: a class's own bounds are read (`ownBounds = tagsOf(decl, 'bound')`, line 154), but each member's entry
(lines 172-173) takes only `nestedBounds(...)` of its accepts and hands-back, never the member declaration's own
`@bound` tags. Design part 2, section 7, decision 3: "A bound that a kind of value cannot express is written on its own
marked line in the comment. A change to those words is a change to the interface." So a changed member bound tells no
user: an implementation error in the tool, measured on civicsmith's code.

## Options

- **A. No change.** A changed bound on a class member tells nobody; the user's own tests or a walk may catch it.
- **B. List a member's own `@bound` (recommended).** Each class member's entry takes `tagsOf(p.declarations[0], 'bound')`
  with its nested bounds, as a class and a function already do. Adds no test, gate, review or stop. The proof replay
  (`tool/test/notice-proof.test.mjs`) must still pass; the proof's fixtures hold class members (e.g. Z13 "static method
  hands back") and `@bound` lines, so an answer may change; any change is written in `expected.json` with its reason.
  civicsmith gets it by the move line.

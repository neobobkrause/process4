# A known weakness: a choice made without following its consequences through (26 Nov 2026, PROCESS #19)

**The owner's words (conversation, 26 Nov):** "you don't think through the implications of many decisions you make
related to testing, measuring, and specific implementation details like the uses file format. It's truly shocking to
experience so many of these extremely poor choices when I discover their implications." And: "putting a comment in a
handover is a temporary patch that disappears in a generation or two, after which you go right back to making the same
poor decisions as before."

**Seen today, each found by the owner or by a real run, not foreseen:**
- The uses file held the tool's own notes on Node features it did not know, so every tool version looked like a reason
  to rewrite all 203 files: about an hour per push on civicsmith, three times in one day.
- A line outside the standard, even one only the tool's ignorance made, was told of every earlier module: a steady source
  of notices nobody needed.
- A conversion the tool read as changing items told every unconverted importer; the notices outgrew what the tool could
  hand back.
- Errors, values and side effects counted as interface changes, against the owner's own definition of domain and range.
- Repeated proposals to measure and test before acting, against the row already in the table ("Caution grows the
  process") and against the handover's own lesson.

**Where a durable rule lives.** A handover lesson lasts a generation or two. Design part 1 §7, "Known weaknesses of AI
sessions", is read in full by every role at every start, and "grows only at PROCESS". PROCESS's starting text is at ten
rules and cannot take another.

**Options.**
- **0. No change.**
- **A. One row in design part 1 §7:** Weakness: "A choice is made without following its consequences through." The sign:
  "It is about to fix a file's form, what sets off an act, or a rule other roles' work depends on." What the session
  does: "Before proposing it, follows it through: what it makes each role do, at the real product's size, now and at
  every later version; reasons from the texts, and adds no measurement or test to find out." Adds no test, gate, review
  or stop: it is a principle held by text, like the rows beside it.

Recommendation: A.

**Reframed by the owner:** "proper consideration should be made of development velocity in design and implementation
choices made by and for process4 and products like civicsmith and all others." PROCESS replaced A with a working
principle in design part 1 §6 and the row pointed at velocity. **Decided:** "Decision: every design and implementation
choice, for Process4 and each product, weighs its effect on development velocity; add the principle and the
known-weakness row as drafted." — 26 November 2026.

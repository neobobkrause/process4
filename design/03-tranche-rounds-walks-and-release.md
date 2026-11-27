# Part 3. The tranche, rounds, walks, and release

Length: 35 lines. Last section: "3. The walks".

Part 3's other sections: 1, 4, 5, 6, 7 and 8 in `03b-`.

## 2. A round

1. **Jobs.** Every module that has work gets its job (part 2).
2. **The internal walk.** When the round's jobs are done, walking sessions walk the product as built against the Screens document, in the areas ARCH names.
3. **Deployment and the external walk.** Only when the internal walk lists no flaw is the product deployed to the development site. Walking sessions then follow the journeys there, in the areas ARCH names.
4. Each flaw becomes work for a named module in the next round, "not the next tranche".

## 3. The walks

- Every round's walks are partial, the first round included. ARCH names the areas a round's updates affect before each walk. A partial walk is without flaws when it lists no flaw in the areas it was given.
- What an area is: for the internal walk, a screen or a named group of screens in the Screens document; for the external walk, a journey. ARCH works out a round's areas from the modules the round changed and the notices it sent.
- **A flaw is one of three things:** the workflow as built does not match the Screens document; a journey cannot be completed; a journey completes with a wrong result. Anything else a walker notes goes to ARCH as an observation and does not hold the tranche.
- Where ARCH judges the document wrong and the product right, the UX lane corrects the document.
- Where it is in doubt how a change will affect the product, and inspecting or testing the code cannot settle it, the walks exercise the running workflow concerned; if it does what is expected, there is no problem. This adds no test; it is part of what ARCH names for a round's walks. It is not stated as a habit in any role's principles.
- **A full external walk is opt-in.** By default it is not made. If the owner asks the coordinator for one before a round's partial walks come clean, it is made, and the tranche ends only if it is clean. A full walk is without flaws when it lists no flaw and leaves out no step that the walk before it made.
- A journey that uses AI is walked only once the owner has connected an AI account to the development deployment (part 1, section 3). Until then it is recorded not walked, and a tranche may end with such journeys recorded not walked. For each such journey the UX lane sets the words for what must be present in any proper result.
- There is no walk outside a tranche. The only walk made on the owner's word is the opt-in full external walk. There are no triage lanes.

**The walks' documents.**

- The Screens document and the journeys are pages kept in the product repository's folder named in the process config. The UX lane owns them and maintains the journey list, which is the list to use; the owner does not approve that list per tranche (part 4, section 3).
- During a tranche they change only to correct an error a walk has shown, and each such change is named in the account after the round.

**Who makes a walk.**

- Walking sessions make both walks, and they walk the product being developed, whatever product that is. ARCH starts them. ARCH's session makes the development deployment.
- A walk is shared among walking sessions by area, with at most as many walking sessions as there are slots. Each walking session's single run, and each step of a deployment, is kept within the time a session can run one thing.
- How a walk is made (its steps, its record, a flaw's form, and how ARCH turns a flaw into work) is in the build text `03-the-walks.md`.
- **Unproven:** that a session's browser can reach the development site; that a walk shared among sessions works; that a deployment can be made from a session in steps that fit; how many external walkers the hosting account can bear. No walk of either kind has ever been made by a session.

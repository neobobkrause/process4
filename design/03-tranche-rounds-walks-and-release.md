# Part 3. The tranche, rounds, walks, and release

Length: 75 lines. Last section: "8. Support beyond the process".

## 1. Opening a tranche

- A tranche opens because the product has work to do — requirements added or changed, issues raised by its lanes, flaws found by walks or by jobs, and notices between modules. There is no single purpose to state and no owner review before it opens: ARCH opens the tranche and decides its scope, recording it where the tranche holds less than all the work (part 2, section 3, step 1), and the owner directs the product continuously through the coordinator and the lanes and by marked instructions.
- The tranche is built on the tranche branch. The main branch never moves while a tranche runs. There is one lasting tranche branch. After a tranche merges into the main branch, the next tranche goes on from the same branch.
- A product's tranche runs on one fixed version of the process from open to close (part 6). A product moves to a changed process version only on the owner's approval (part 6, section 7). A version move loses no work — where no job is open it is made at once; where jobs are open it is made at the next round boundary, or, on the owner's word to move now, open jobs stop and restart from their branches on the new version (as after an approvals edit, part 4, section 7).
- While a tranche runs, ARCH prepares what the next round or tranche needs.

## 2. A round

1. **Jobs.** Every module that has work gets its job (part 2).
2. **The internal walk.** When the round's jobs are done, walking sessions walk the product as built against the Screens document, in the areas ARCH names.
3. **Deployment and the external walk.** Only when the internal walk lists no flaw is the product deployed to the development site. Walking sessions then follow the journeys there, in the areas ARCH names.
4. Each flaw becomes work for a named module in the next round, "not the next tranche".

The order is jobs, then the internal walk, and deployment only after an internal walk with no flaws.

## 3. The walks

- Every round's walks are partial, the first round included. ARCH names the areas a round's updates affect before each walk. A partial walk is without flaws when it lists no flaw in the areas it was given.
- What an area is: for the internal walk, a screen or a named group of screens in the Screens document; for the external walk, a journey. ARCH works out a round's areas from the modules the round changed and the notices it sent.
- **A flaw is one of three things:** the workflow as built does not match the Screens document; a journey cannot be completed; a journey completes with a wrong result. Anything else a walker notes goes to ARCH as an observation and does not hold the tranche.
- Where ARCH judges the document wrong and the product right, the UX lane corrects the document.
- Where it is in doubt how a change will affect the product, and inspecting or testing the code cannot settle it, the walks exercise the running workflow concerned; if it does what is expected, there is no problem. This adds no test; it is part of what ARCH names for a round's walks. It is not stated as a habit in any role's principles.
- **A full external walk is opt-in.** By default it is not made. If the owner asks the coordinator for one before a round's partial walks come clean, it is made, and the tranche ends only if it is clean. A full walk is without flaws when it lists no flaw and leaves out no step that the walk before it made.
- There is no walk outside a tranche. The only walk made on the owner's word is the opt-in full external walk. There are no triage lanes.

**The walks' documents.**

- The Screens document and the journeys are pages kept in the product repository's folder named in the process config. The UX lane owns them and maintains the journey list, which is the list to use; the owner does not approve that list per tranche (part 4, section 3).
- During a tranche they change only to correct an error a walk has shown, and each such change is named in the account after the round.

**Who makes a walk.**

- Walking sessions make both walks, and they walk the product being developed, whatever product that is. ARCH starts them. ARCH's session makes the development deployment.
- A walk is shared among walking sessions by area, with at most as many walking sessions as there are slots. Each walking session's single run, and each step of a deployment, is kept within the time a session can run one thing.
- How a walk is made (its steps, its record, a flaw's form, and how ARCH turns a flaw into work) is in the build text `03-the-walks.md`.
- **Unproven:** that a session's browser can reach the development site; that a walk shared among sessions works; that a deployment can be made from a session in steps that fit; how many external walkers the hosting account can bear. No walk of either kind has ever been made by a session.

## 4. After each round

The coordinator gives the owner a short account: the tranche's scope where one is recorded, jobs done, flaws found, flaws carried over, observations set aside, changes to the walks' documents, rewordings made, and cost where it can be read. Nothing waits on it.

## 5. How a tranche ends

- A tranche ends when a round's partial walks, internal and external, both come clean; or, where the owner asked for a full external walk, when that walk is clean.
- What shows that the product's journeys complete at the tranche's end is the rounds' partial walks themselves, each scoped to the areas that round changed; there is no end-of-tranche sweep.
- When the tranche ends, ARCH merges the tranche branch into the main branch as a whole, by pull request. None of the tests runs on that pull request (part 2, section 9).
- A tranche that does not come clean goes on in rounds until the owner says. He then chooses between merging it with its flaws named and dropping it.
- **A dropped tranche** is carried out as the tranche's merge into the main branch run the other way. ARCH, by the tool, puts back on the tranche branch the main branch's version of every module code and test file the tranche changed, and nothing else: the requirement text, the module list, the process's named files, the decision records and the lanes' folders stay as they are. That pull request runs none of the tests, and the required run passes it at once only when every file it changes is the main branch's own (part 2, section 9). ARCH merges it, closes the tranche's open jobs unmerged, clears the round and waiting-work records, and puts back "not yet met" only on each requirement whose met mark came from the dropped tranche (part 2, section 2). No notice is sent: every module goes back together to the main branch's code. The next tranche goes on from the same branch.
- A tranche merged with its flaws named has not ended in the sense of section 6; its flaws become work in the next tranche. The process neither forces nor forbids a release from such a tranche: whether anything is released is the owner's call, governed by his release approval and a clean install and update (section 6). Process4 is a development process, not the product, and leaves the balance of time, resources and quality to the owner.
- One report is written at the tranche's end, by ARCH, only from what git and GitHub already hold: time, work done and left, anything deferred and why, cost where it can be read and "unmeasured" otherwise, the overhead share, ARCH's idle time while work was ready, the owner's minutes, and every change the UX lane made during the tranche to the two documents the walks are measured against. No number is a target. Nothing reads the report to decide anything.

## 6. Release

- Any tranche that has ended can be released, on the owner's approval, once an install and an update have each been run and confirmed successful. Neither is walked.
- The install and the update run on a development account; "successful" means the installer or updater finishes without error and the site it produced starts; on a failure no release is offered and the fault becomes work in the next tranche.
- ARCH prepares the release and waits for the owner's approval. No session publishes a release without it. A development release, made only for development, is made and published in one act as a pre-release and needs no approval; his approval is for public releases.
- On his approval ARCH carries out the publish — the release ceremony places the new installer where the product's check-for-updates and outside users expect it, using the release token and, to produce the installer, the production signing keys of part 1, section 2. Running an install or an update on a real site is always the user's or operator's act, never a session's.
- How his approval reaches the publishing session, if ARCH publishes: ARCH prepares the release unpublished and the coordinator puts it on his standing page. He types his approval in ARCH's own session, as a marked decision naming that release. ARCH publishes in that turn and passes his words to the coordinator for the record. Approval relayed through another session is not used. **Unproven:** that the checker accepts an approval typed this way.
- With each release the process writes what changed, what the update does to stored data, and how to go back. These notes, the written procedures of section 8 and each tranche report are kept in the product repository's process folder, named in the process config, and change as the process's named files do (part 2, section 9).
- **Unproven:** the whole release path. No release of any kind has been made by sessions.

## 7. An urgent fix

- An urgent fix is a tranche whose content is that fix alone.
- When an urgent fix is needed while a tranche is open, the open tranche is paused on the owner's word; the fix is built as its own tranche from the main branch and merged; the paused tranche then takes the main branch in and goes on.

## 8. Support beyond the process

- For each product the process keeps a short written procedure for each of three things: promoting a release to installed sites; rolling one back; and handling a problem reported from an installed site.
- The owner, or whoever runs the product, carries the procedures out. Each is written for the owner as clicks on pages named by their full address; none asks him to edit a file or type a command. No session carries them out.

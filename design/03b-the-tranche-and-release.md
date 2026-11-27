# Part 3 (continued): the tranche and release

Length: 46 lines. Last section: "8. Support beyond the process".

Part 3's other sections: 2 and 3 in `03-`.

## 1. Opening a tranche

- A tranche opens because the product has work to do — requirements added or changed, issues raised by its lanes, flaws found by walks or by jobs, and notices between modules. There is no single purpose to state and no owner review before it opens: ARCH opens the tranche and decides its scope, recording it where the tranche holds less than all the work (part 2, section 3, step 1).
- The tranche is built on the tranche branch. The main branch never moves while a tranche runs. There is one lasting tranche branch. After a tranche merges into the main branch, the next tranche goes on from the same branch.
- A product moves to a changed process version only on the owner's approval (part 6, section 7). A version move loses no work — where no job is open it is made at once; where jobs are open it is made at the next round boundary, or, on the owner's word to move now, open jobs stop and restart from their branches on the new version (as after an approvals edit, part 4, section 7).
- While a tranche runs, ARCH prepares what the next round or tranche needs.

## 4. After each round

The coordinator gives the owner a short account: the tranche's scope where one is recorded, jobs done, flaws found, flaws carried over, observations set aside, changes to the walks' documents, rewordings made, and cost where it can be read. Nothing waits on it.

## 5. How a tranche ends

- A tranche ends when a round's partial walks, internal and external, both come clean; or, where the owner asked for a full external walk, when that walk is clean.
- What shows that the product's journeys complete at the tranche's end is the rounds' partial walks themselves, each scoped to the areas that round changed; there is no end-of-tranche sweep.
- When the tranche ends, ARCH merges the tranche branch into the main branch as a whole, by pull request. None of the tests runs on that pull request (part 2, section 9).
- A tranche that does not come clean goes on in rounds until the owner says. He then chooses between merging it with its flaws named and dropping it.
- **A dropped tranche** is carried out as the tranche's merge into the main branch run the other way. ARCH, by the tool, puts back on the tranche branch the main branch's version of every module code and test file the tranche changed, with that module's uses file, and nothing else: the requirement text, the module list, the process's named files, the decision records and the lanes' folders stay as they are. That pull request runs none of the tests, and the required run passes it at once only when every file it changes is the main branch's own (part 2, section 9). ARCH merges it, closes the tranche's open jobs unmerged, clears the round and waiting-work records, and puts back "not yet met" only on each requirement whose met mark came from the dropped tranche (part 2, section 2). No notice is sent: every module goes back together to the main branch's code. The next tranche goes on from the same branch.
- A tranche merged with its flaws named has not ended in the sense of section 6; its flaws become work in the next tranche. The process neither forces nor forbids a release from such a tranche: whether anything is released is the owner's call, governed by his release approval and a clean install and update (section 6). Process4 is a development process, not the product, and leaves the balance of time, resources and quality to the owner.
- One report is written at the tranche's end, by ARCH, only from what git and GitHub already hold: time, work done and left, anything deferred and why, cost where it can be read and "unmeasured" otherwise, the overhead share, ARCH's idle time while work was ready, the owner's minutes, and every change the UX lane made during the tranche to the two documents the walks are measured against. No number is a target. Nothing reads the report to decide anything.

## 6. Release

- Any tranche that has ended can be released, on the owner's approval, once an install and an update have each been run and confirmed successful. Neither is walked.
- The install and the update run on a development account; "successful" means the installer or updater finishes without error and the site it produced starts; on a failure no release is offered and the fault becomes work in the next tranche.
- ARCH prepares the release and waits for the owner's approval. No session publishes a release without it. A development release, made only for development, is made and published in one act as a pre-release and needs no approval; his approval is for public releases.
- On his approval ARCH carries out the publish — the release ceremony places the new installer where the product's check-for-updates and outside users expect it, using the release token and, to produce the installer, the production signing keys of part 1, section 2. Running an install or an update on a real site is always the user's or operator's act, never a session's.
- How his approval reaches ARCH: ARCH prepares the release unpublished and the coordinator puts it on his standing page. He types his approval in ARCH's own session, as a marked decision naming that release. ARCH publishes in that turn and passes his words to the coordinator for the record. Approval relayed through another session is not used. **Unproven:** that the checker accepts an approval typed this way.
- With each release the process writes what changed, what the update does to stored data, and how to go back. These notes, the written procedures of section 8 and each tranche report are kept in the product repository's process folder, named in the process config, and change as the process's named files do (part 2, section 9).
- **Unproven:** the whole release path. No release of any kind has been made by sessions.

## 7. An urgent fix

- An urgent fix is a tranche whose content is that fix alone.
- When an urgent fix is needed while a tranche is open, the open tranche is paused on the owner's word; the fix is built as its own tranche from the main branch and merged; the paused tranche then takes the main branch in, a merge told as any is (part 2, section 7), and goes on.

## 8. Support beyond the process

- For each product the process keeps a short written procedure for each of three things: promoting a release to installed sites; rolling one back; and handling a problem reported from an installed site.
- The owner, or whoever runs the product, carries the procedures out. Each is written for the owner as clicks on pages named by their full address; none asks him to edit a file or type a command. No session carries them out.

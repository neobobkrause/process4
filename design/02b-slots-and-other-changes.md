# Part 2 (continued): slots, and changes that are not a job's

Length: 20 lines. Last section: "9. Changes that are not a job's".

Part 2's other sections: 1, 2, 3, 4, 6, 7 and 8 in `02-`.

## 5. Slots

- Eight by default, counted across the account. The owner can change the number by a marked instruction. A product's slots in use are its open jobs that are not recorded blocked, and its live walking sessions.
- Ready jobs take free slots, earliest in the module order first, only while the slots in use are below the number. Only the owner's marked instruction puts a module ahead. One exception: after a provider's interface change, a module told of it, with no open job, that is earlier in the order than the latest running job's module starts its told job at once, above the number; a later one waits its turn.
- The standing roles and workers use no slot. Lane sessions use none either, and walking sessions use the slots, since a walk is made when no job is open.
- When two products run at once, each product's process config names its share of the slots, and the shares add up to the account's number. The default is an equal split. The owner changes a share by a marked instruction. A product does not borrow another's unused share, because no record is shared between two products. **Unproven:** two products have never run at once.

## 9. Changes that are not a job's

- **The mechanical edit.** A worker in ARCH's session makes it as one change covering every affected module, with each touched module's uses file rewritten by the tool (section 7), and it is merged once, when no job is open, between a round's last merge and its internal walk. ARCH's session tests it as section 6 says. A module where the change needs judgment gets its own job.
- **A lane's folder.** A change that touches only files in a lane's own folder needs no module tests. Design documents do not need testing.
- **Requirement text, the module list, and the process's named files.** These change no code and no tests, so their pull requests merge through the tool with no module tests run and no record of them.
- **The required run.** There is one required run on GitHub, with one name. It reports on every pull request, judging it with the tool at the version its base branch names. It passes at once, needing no record of tests, when no module's code or tests changed; on the tranche's own pull request into the main branch; and on a dropped tranche's pull request whose every file is the main branch's own (part 3, section 5).
- **The owner's approvals and forbidden commands** are committed by the owner alone (part 6).

# Part 2. Modules, jobs, module tests, and the notice

Length: 154 lines. Last section: "9. Changes that are not a job's".

## 1. Modules and their order

- The product is one ordered list of modules. A module may use only modules before it. A use of a later module is a design error, corrected by reshaping the code without changing what it does. The check of declared uses refuses one (section 6).
- Every code file has exactly one owner module. ARCH edits the module list until this is so.
- Every file in the product's repository belongs to exactly one of these: a module; a lane's folder; or the process's own named files (the standing approvals, the forbidden commands, the required-run workflow, the process config, the module list and the facility list, the product's two decision records and its ranking page). A file that fits none is given to a module by ARCH before any job touches it.
- A module that holds requirements and no code is a list error. ARCH decides which module's code meets each such requirement, and the move is made as a mechanical edit.

## 2. Requirements

- Each module has one requirements file. Each requirement has a permanent number and is marked met or not yet met.
- ARCH writes and rewords the requirement text, and touches no code and no tests, other than by the mechanical edit (section 9). The module's job marks a requirement met in its own pull request. ARCH writes "not yet met" on a new requirement, and puts it back on a met one when a rewording changes what the product does, and on each one whose met mark came from a dropped tranche (part 3, section 5).
- A rewording that changes what the product does comes to the owner first. One that only says the same thing more clearly is made, and told to him in the account after the round.
- A requirements file is kept under the single-text maximum (part 5) as a rule ARCH applies. When a file nears it, ARCH splits the module into two real modules. Nothing refuses a job or a merge for size.

## 3. The life of one module's job

1. **The module has work.** A requirement in its file is marked not yet met and is within the tranche's scope; or a walk flaw, a notice, or a flaw reported by another module's job has been placed against it; or the module has had no conversion yet and is within the tranche's scope (section 7). The scope is all the work unless ARCH records a smaller one in the round record: a list of the requirements, or whole modules, the tranche is for, which ARCH rewrites as the tranche goes on and which ends with the tranche. A requirement outside it waits until the tranche ends.
2. **Its job is ready:** the module has work and no job already open. It does not wait for the modules it uses.
3. **It takes a slot,** in the order section 5 gives. The tool decides who takes a free slot.
4. **The job session is started,** with instructions naming every act the job may take.
5. **The job works** in a draft pull request, writing only its own module's files, its tests among them. A flaw it finds in another module goes to ARCH, which places it against that module.
6. **The job completes.** It pushes and runs its module's tests by the tool (section 6). It fixes its own failures and runs them again. On a pass it marks the pull request ready and sends ARCH one message.
7. **ARCH merges it** into the tranche branch with the tool, the only way a session can merge, once no job is open among the modules this one uses (section 8). There is no review and no act of the owner's.
8. **The slot is refilled** in the same turn, and the notice is sent to whoever section 7 says the merge's changes tell. Working out the notice does not hold other merges: ARCH goes on merging ready jobs while it is worked out.

- A job decides how to meet its module's requirements and writes that module's tests. In the owner's words: "Yes, a job writes its own tests. That's an important responsibility."
- A job writes only its own module's files. In the owner's words: "A job for module A isn't allowed to change module B. The only other way of editing a module is when a mechanical edit (like a word table change) makes the change." This is held by the job's instructions and by no check.
- A job never merges, starts a session, deploys or changes the process.
- A job stopped by another module's flaw reports the flaw to ARCH, records that it is blocked, pushes and stops. Its slot is freed. When the other module merges, the job is made ready again. Where ARCH ends the block by its own decision instead (section 8) and tells the job to go on, the job records that it goes on, and holds its slot again.
- A job's module tests run at its pull request's head, which the tool first brings up to the tranche branch's newest commit by a plain merge, so the tests judge what would merge at that moment. A later merge by another module does not run them again, unless a notice reaches the job while it is open (section 7). A break caused another way is found by that module's next job or by a walk.

## 4. When a module's work is finished, and when a round's jobs are done

The tool decides both, because each has one right answer:

- A module's work is finished when its job's pull request has merged.
- A module whose only work was a notice is also finished when its job records in its own pull request that nothing needs changing, and closes it unmerged.
- A module with a walk flaw against it, or a flaw another module's job reported against it, is finished by a merge; or, when its job finds that nothing in the module needs changing, by its job recording that in its pull request and closing it unmerged, which hands the flaw back to ARCH. ARCH then places the flaw against another module or, where the walks' document is wrong, gives it to the UX lane; the module that handed it back is finished for the round, and the re-placed flaw is the other module's work. A flaw handed back twice is not placed a third time; ARCH decides it as a design question (part 4, section 10).
- A round's jobs are done when every module that had work when the round opened, or was given work during it, is finished, or is recorded blocked on a matter that no open job of the round can clear. A blocked module's work carries into the next round and is named in the account after the round.

## 5. Slots

- Eight by default, counted across the account. The owner can change the number by a marked instruction. A product's slots in use are its open jobs that are not recorded blocked, and its live walking sessions.
- Ready jobs take free slots, earliest in the module order first, only while the slots in use are below the number. Only the owner's marked instruction puts a module ahead. One exception: after a provider's interface change, a module told of it, with no open job, that is earlier in the order than the latest running job's module starts its told job at once, above the number; a later one waits its turn.
- The standing roles and workers use no slot. Lane sessions use none either, and walking sessions use the slots, since a walk is made when no job is open.
- When two products run at once, each product's process config names its share of the slots, and the shares add up to the account's number. The default is an equal split. The owner changes a share by a marked instruction. A product does not borrow another's unused share, because no record is shared between two products. **Unproven:** two products have never run at once.

## 6. Module tests

- The tests of Process4 are module tests, the internal walk and the external walk. Before a release, an install and an update are each confirmed to have succeeded. Nothing more: no further test phases, gates or reviews, and no full regression, on request or otherwise. Every other check that could stop work has ended.
- A test runs only when there is a fully informed reason to run it.
- Module tests run for the job's own module only, once, before the job marks its pull request ready: in the job's own session, by the tool, as one command of that session, which it waits for within its turn. The tool records the result on the pull request (its form is in build text 5, section 5). The pull request can be marked ready and merged only on a pass recorded for its head after every notice that reached the job. GitHub's required run only reads that record; it runs no product code (section 9). A failure goes back to the job. Held by text: the job writes its own pass record, as it writes its own tests. **Unproven:** a job's tests run as one command of its own session, and the required run reading the record; neither has run in a round.
- A pull request that is not a job's and changes module code or tests is tested the same way by ARCH's session, each touched module whole, other than a dropped tranche's whose every file is the main branch's own (section 9; part 3, section 5). A test file the module list gives to another module, unchanged, is not run for the move; it runs at the new owner's next job. A module whose tests take longer than one command of a session can run is ARCH's to split.
- They give appropriate coverage of the code, demonstrate correct results, show that error conditions are properly identified and communicated, and check bounds. A test does not fail because it got a different but still valid response. They "must be complete yet fast and efficient". This is a duty of the job, held by its instructions; nothing measures it.
- The structured comments and the tool can also inform module tests, so that boundaries are properly checked.
- Every requirement is tested at the module's interface.
- Module tests include, in the words of the record, "a check that the module's declared uses match its imports". The check reads the module's test files as well as its source: "I think it has to check tests too". A module's declared uses are the providers its uses file names, which the tool writes from the module's code and tests (section 7), so they match its imports by construction. The check refuses a use of a module that is not before this one in the order. A place outside the coding standard that may refer to a later module is "cannot tell", not refused. A job cannot settle an order fault in its own module's files; where the use is needed it reports to ARCH and is recorded blocked (section 3), and ARCH corrects the order, the module list or the boundary (section 8).
- Beside the check of declared uses against the order (above), the owner approved two refusals, and no other is taken. Inside a module's own tests the tool may refuse a structured comment that disagrees with the module's code, and may refuse the module's code where it disagrees with a provider's stated interface; for a value handed across, only the comment on the side that receives it counts. These are parts of module tests, not further tests. A value a test passes on purpose inside an error assertion (`assert.throws` or `assert.rejects` and their kin), to show that an error condition is "properly identified and communicated", is neither refusal: the tool reads it as "cannot tell" and never refuses it. Nor is a complaint of the tool's reader about plain code, where no structured comment states what the code contradicts: that too is "cannot tell".
- A module's tests and a walk's steps are product work. Each exists only to prove a product requirement, which it names. A test or step that serves the process is not allowed. This is a rule in text.
- Built files are never committed. They are built at each walk, deployment and release.

## 7. The notice to user modules

- It is a notice, not a test. Its purpose is to save work. In the owner's words: "any change to either a provider's domain or range necessitates that its users be retested. But if both domain and range stay the same, then no retesting of users is needed." An item's **domain** is what it accepts, its **range** what it hands back. No test of users runs before a provider's change merges.

**Who knows that an interface changes.** Every change to a provider's code has a cause, and someone who knows then whether it changes an item's domain or range, or its meaning under the same types:

| The change comes from | Who knows |
|---|---|
| A requirement added or reworded; a walk flaw; a flaw another job reports | ARCH, which writes the requirement (from a lane's design where one stands behind it) or places the flaw, deciding any interface change first (section 8); then the job, from what it builds. A fix that keeps the interface changes none |
| A notice; the job's own failed tests | The job, from what it changes. A fix that would change a used item beyond the work placed goes to ARCH first (section 8) |
| A conversion | The job: it changes no behaviour, so it describes (below) |
| A mechanical edit; a module-list change; a dropped tranche | ARCH, which makes it (section 9; below; part 3, section 5) |
| An urgent fix | ARCH, as for any work; the paused tranche's taking the main branch in is told as any merge (part 3, section 7) |

How that knowledge reaches the tool:

- **ARCH,** before it places work, recognizes which items' domain, range or meaning it changes (a lane's design says what the product will do differently, never which items), and, from the uses files, who uses them; it names in the work each item changed under the same types, with what it was and is now. Held by text.
- **The job** recognizes, from what it changed, whether any of its items' domain, range or meaning changed. Where a type can carry the change it changes the stated type, so the tool sees it with certainty; a bound no type can express it rewords on its marked bound line (rule 3); any other change under the same types (what a value means, the order of two values of one type, the timing, effects or state the item requires) it declares in its pull request, one line saying what was and is now, as ARCH does for its own. Held by text, as the job's tests are.
- **The provider's own tests** test every requirement at the module's interface (section 6), a program the module starts among them through the item that starts it, and catch a change of meaning made by accident, which nobody named or declared; then the users' tests at their next job, and the walks. Held by text.
- **The tool** works out the means, adds the items named and declared, and tells their users. Whether an item gives the same answers no tool can decide.

**What the tool compares.** An **item** is anything a module offers: an export, a member of a handle kind or class, an operation, a shared table or a message kind (build text 2b, section 6). Its **means** is the checkable form of its domain and range:

- **What it accepts:** its parameters in order, each required, optional or a rest; their stated types, expanded through every type they name, the providers' included, with names kept; the functions it accepts and what it hands them; its named types for meaningful values (R13) and read-only arguments; whether it needs its object as `this`; its marked bound lines; and the settings, start arguments and channels it reads.
- **What it hands back:** its stated type, expanded the same way; at once or later; plain data or a class instance; the errors that can leave it, its providers' included; the arguments it writes into; the channels it writes (files, tables, streams, messages); and its marked bound lines.
- A kind, handle kind or class: its members, each with its own means. An item that starts a program: the program's streams, start arguments, settings and files among its channels; what the program writes within them is meaning under the same means.
- The stated parts are read from its stated types. The rest the tool works out from its code over its **closure**, every piece of its module its behaviour can depend on, by calls or by data, taken wider wherever the language does not decide it (build text 5, section 6).

A **changed item** is one whose means differs, that is removed, whose code no longer matches its stated types, that ARCH named, or that a pull request declared. Any difference in what it accepts changes its domain, accepting more included: what it newly accepts can receive what a user already hands it, as a function handed to `map` is handed the index. The tool may say "changed" for an equivalent rewrite, never "unchanged" for a different one.

**Not a change.** Describing an item leaves its domain and range as they were, and tells no one: its first means at its module's conversion, and a type read as "anything" before and stated after, in the item or in a later item that passes it on. A new item has no users. Code whose items' means are the same, with nothing named or declared, changes only the module's insides.

**Who uses what.** Each module's uses file, `process/modules/<module>.uses.json`, is written by the tool from the module's code and tests at every push of its job and every change ARCH makes to it, never by hand but for a data file's copy: each earlier item used, how, by what route and where, and its places outside the standard. A use calls it or reads a member; uses the whole value (hands it on, returns, stores, compares, iterates or writes it as text); builds the module's own value of the provider's kind; holds a marked copy; or reads a kind another module relabelled as its own. It depends only on its module's code, its providers' stated types and the facility list; a change to that list, or a Process4 version that classifies facilities differently, rewrites every uses file.

**The coding standard.** Every module's code and tests keep the coding standard (build text 2c), derived from the language's own definitions. Under it, every way a change to an earlier module can change what a later module's code or tests do is a listed use, direct or through a middle module, or a listed place outside the standard, never refused. It rests on two premises: that the pinned type checker computes types as documented, and that the host's descriptions of its facilities are true. The tool classifies Node's and workerd's facilities; ARCH names the boundary modules and classifies the product's packages, in its facility list.

**Who is told.** In the owner's words, "ideally only the users of the entry that changed". The tool tells each later module once, naming each changed item it uses and the places:

1. whose uses file names a changed item, or a member of a changed kind, directly or through a middle module, where the change reaches the use (below); a middle module is told only where its own file names the item;
2. that holds a marked copy of a changed item, or reads a kind relabelled from one;
3. on any change to the provider's files, whether or not an item changed: a module with a place outside the standard that may refer to the provider, or an order fault naming it, and a module with no uses file yet that imports it.

A change reaches every use of the item, except:

- A kind, handle kind or class changed only in its members: a member added reaches the uses of the whole value, building one's own value among them; one removed, changed or made optional reaches those and the reads of that member. A use that only names the kind, or holds its value under a name of its own, is reached through that name's uses.
- A change of meaning alone, its means the same, does not reach a module that only hands the value back to a later module told of it, where its code and tests neither read, compare, format, store nor assert the value.
- A mechanical edit does not tell a module whose code or tests it changed: that module's whole tests ran on it (section 9).

Not telling the others is safe: an earlier module cannot use the provider (section 1); under the standard a module that uses no changed item cannot see the change; and in each exception the module's code and tests touch nothing that changed, or already ran on it.

**The insides only.** The job knows, from what it changed, when the change stays inside its module, and declares nothing; ARCH, placing work that changes no interface, names nothing; the tool, finding no item's means changed and nothing named or declared, tells only the modules of point 3 above. Where the tool finds an item changed whose domain and range the job knows are the same (a computed fact wider than the code's effect, an equivalent rewrite), the job records in its pull request that item and, in one line, why its domain and range are the same; that item then tells no one. The record takes off only that item: every other changed item, every item ARCH named or a pull request declared, and every module of point 3 are told as above. A wrong record is caught as any change of meaning made by accident is: by the provider's own tests, then the users' tests at their next job, and the walks. Held by text.

**What a told module does.**

- A module whose job is open gets the notice at once, in the job's record of its work, and ARCH tells the job, which deals with it and runs its tests again (section 6). A module with no open job gets a told job, its next job: told only when notices are its only work, otherwise ordinary, reading the notice's uses.
- A told job checks only the changed parts and runs only the tests that relate to them, which the tool picks by whole file, from the places the notice names and the code the job changed (build text 5, section 7). The tool sets the scope: the whole module for an ordinary job, the related tests for a told job, nothing where no running code changed; the whole module where it cannot follow a told module's code, or it has no uses file yet.
- A told job that finds nothing to change closes as section 4 says, and runs no test.

**The conversion.** A module's first job under the coding standard is its conversion. It brings the module's references to earlier modules into the standard, states its items' types, obtains or marks its copies, and lets the tool write its uses file. It changes no behaviour, declares no change of meaning, and runs its tests only where running code changed. What waits on a provider, and each order fault, it reports to ARCH; the place stays listed until then. Conversions start earliest in the order first (section 5), and merge as any job does (section 8).

**When the module list changes,** the change sends no notice of itself. Where it moves an item, splits a module or renames a provider, the tool rewrites in the same change the uses files of the modules touched and of every user naming a moved or renamed item. An item moved is removed from one module and new in the other, so its users are told; where only a provider's name changes, their code is changed by a mechanical edit.

**Unproven:** all of this section on a real product, and following a use to the tests that reach it (part 10).

Rules for the tool that finds the change:

1. Users are found by reading their uses files.
2. A place outside the standard is told as above until converted; where the tool cannot say which modules it may refer to, it may refer to every earlier one.
3. A bound that a kind of value cannot express is written on its own marked line in the comment. A change to those words is a change to the interface. In the owner's words: "If those words are changing, then there must be a reason why. It must be that that interface is changing, right?"
4. Code that checks or builds what crosses a module's interface says, in a comment, which kind it checks or builds.
5. A call by name uses a written-out name through the provider's one table of its operations, the tables gathered into one list.
6. Both sides of a comparison are worked out at the same moment with the same version of the tool.

Which language reader the tool uses is a fact of the product, named in its process config.

## 8. Who decides an interface, and changes that must land together

- ARCH decides the interface between two modules. A change to the domain, range or meaning of an item a later module uses is ARCH's to decide before it is built, with the users it reaches, read from their uses files. A provider's job may propose one, and does not build it until ARCH decides. Held by text.
- A job's pull request merges once no job is open among the modules it uses: the providers its uses file names, read at the tranche's newest commit and at the job's head, and theirs in turn. A blocked job holds no one. A module with no uses file yet waits on the earlier modules it imports.
- There is no merge of several modules together other than the mechanical edit. Where modules must change together, ARCH orders the work so that each merge passes on its own: the provider first accepts the new form beside the old, the users move, and the provider then drops the old form.
- Where that cannot be done, the boundary between those modules is an architecture bug. ARCH corrects the module list or the interface, and does not work round it.

## 9. Changes that are not a job's

- **The mechanical edit.** A worker in ARCH's session makes it as one change covering every affected module, with each touched module's uses file rewritten by the tool (section 7), and it is merged once, when no job is open, between a round's last merge and its internal walk. ARCH's session tests it as section 6 says. A module where the change needs judgment gets its own job.
- **A lane's folder.** A change that touches only files in a lane's own folder needs no module tests. Design documents do not need testing.
- **Requirement text, the module list, and the process's named files.** These change no code and no tests, so their pull requests merge through the tool with no module tests run and no record of them.
- **The required run.** There is one required run on GitHub, with one name. It reports on every pull request, judging it with the tool at the version its base branch names. It passes at once, needing no record of tests, when no module's code or tests changed; on the tranche's own pull request into the main branch; and on a dropped tranche's pull request whose every file is the main branch's own (part 3, section 5).
- **The owner's approvals and forbidden commands** are committed by the owner alone (part 6).

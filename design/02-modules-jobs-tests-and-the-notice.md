# Part 2. Modules, jobs, module tests, and the notice

Length: 157 lines. Last section: "9. Changes that are not a job's".

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
- A job's module tests run at its pull request's head, which the tool first brings up to the tranche branch's newest commit by a plain merge, so the tests judge what would merge at that moment. A later merge by another module does not run them again, unless a notice makes the job change its code (section 7). A break caused another way is found by that module's next job or by a walk.

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
- A test runs only when there is a fully informed reason to run it. The tool sets what runs: the whole module for an ordinary job; the related tests for a told job (section 7); nothing where no running code changed; the whole module where it cannot follow a told module's code, or the module has no uses file yet.
- Module tests run for the job's own module only, once, before the job marks its pull request ready: in the job's own session, by the tool, as one command of that session, which it waits for within its turn. The tool records the result on the pull request (its form is in build text 5, section 5). The pull request can be marked ready and merged only on a pass recorded after every notice for which the job changed code, for its head or for an earlier head that differs from it only in the uses file (section 7). GitHub's required run only reads that record; it runs no product code (section 9). A failure goes back to the job. Held by text: the job writes its own pass record, as it writes its own tests. **Unproven:** a job's tests run as one command of its own session, and the required run reading the record; neither has run in a round.
- A pull request that is not a job's and changes module code or tests is tested the same way by ARCH's session, each touched module whole, other than a dropped tranche's whose every file is the main branch's own (section 9; part 3, section 5). A test file the module list gives to another module, unchanged, is not run for the move; it runs at the new owner's next job. A module whose tests take longer than one command of a session can run is ARCH's to split.
- They give appropriate coverage of the code, demonstrate correct results, show that error conditions are properly identified and communicated, and check bounds. A test does not fail because it got a different but still valid response. They "must be complete yet fast and efficient". This is a duty of the job, held by its instructions; nothing measures it.
- The structured comments and the tool can also inform module tests, so that boundaries are properly checked.
- Every requirement is tested at the module's interface.
- Module tests include, in the words of the record, "a check that the module's declared uses match its imports". The check reads the module's test files as well as its source: "I think it has to check tests too". A module's declared uses are the providers its uses file names, which the tool writes from the module's code and tests (section 7), so they match its imports by construction. The check refuses a use of a module that is not before this one in the order. A place outside the coding standard that may refer to a later module is "cannot tell", not refused. A job cannot settle an order fault in its own module's files; where the use is needed it reports to ARCH and is recorded blocked (section 3), and ARCH corrects the order, the module list or the boundary (section 8).
- Beside the check of declared uses against the order (above), the owner approved two refusals, and no other is taken. Inside a module's own tests the tool may refuse a structured comment that disagrees with the module's code, and may refuse the module's code where it disagrees with a provider's stated interface; for a value handed across, only the comment on the side that receives it counts. These are parts of module tests, not further tests. A value a test passes on purpose inside an error assertion (`assert.throws` or `assert.rejects` and their kin), to show that an error condition is "properly identified and communicated", is neither refusal: the tool reads it as "cannot tell" and never refuses it. Nor is a complaint of the tool's reader about plain code, where no structured comment states what the code contradicts: that too is "cannot tell".
- A module's tests and a walk's steps are product work. Each exists only to prove a product requirement, which it names. A test or step that serves the process is not allowed. This is a rule in text.
- Built files are never committed. They are built at each walk, deployment and release.

## 7. The notice to user modules

- It is a notice, not a test. Its purpose is to save work. In the owner's words (14 November 2026): "The interface to a provider is it's domain. The bounds of valid values passed to and received from a provider are it's range. So what I'm saying is that any change to either a provider's domain or range necessitates that its users be retested. But if both domain and range stay the same, then no retesting of users is needed." An item's **domain** is its interface, what it accepts and hands back; its **range**, the values valid there, with their **meaning**: what they stand for, their order and units, and the timing, effects and state the item requires. Its **means** is the part of its domain and range the tool can check (below); a **change of meaning** is a change to its domain or range that its means cannot show. No test of users runs before a provider's change merges.

**Who knows that an interface changes.** Every change to a provider's code has a cause, and someone who knows then whether it changes an item's domain or range:

| The change comes from | Who knows |
|---|---|
| A requirement added or reworded; a walk flaw; a flaw another job reports | ARCH, which writes the requirement (from a lane's design where one stands behind it) or places the flaw, and decides each interface change it brings (section 8); then the job, from what it builds. A fix that keeps the interface changes none |
| A notice; the job's own failed tests | The job, from what it changes. A change to a used item that the placed work does not name goes to ARCH first (section 8) |
| A conversion | The job: it changes no behaviour, so it describes (below) |
| A mechanical edit; a module-list change; a package's or the host's version; a dropped tranche | ARCH, which makes it (section 9; below; part 3, section 5) |
| An urgent fix | ARCH, as for any work; the paused tranche's taking the main branch in is told as any merge (part 3, section 7) |

How that knowledge reaches the tool:

- **ARCH** names in the work it places each interface change it decided: the item, and what it was and is now. So the job can tell what is beyond its work. Held by text.
- **The job** recognizes, from what it changed, whether any of its items' domain or range changed. Where a type can carry the change, it changes the stated type; a bound no type can express it rewords on the item's marked bound line; a change of meaning (for example, the order of two values of one type, or what a program it starts writes on its streams) it declares in its pull request, one line saying what was and is now, as ARCH does for its own. A changed expected answer in its own tests at the interface is such a change. Held by text, as its tests are.
- **The provider's own tests** test every requirement at its interface (section 6), which for a program it starts is the item that starts it. They catch a change of meaning made by accident; then the users' tests at their next job, and the walks.
- **The tool** works out the means, adds what is named and declared, takes off what the job records (below), and tells the users.

**Items and their means.** An item is anything a module offers: an export (a function, a constant or other value, a kind, a message's kind among them, a handle kind or a class), each member of a handle kind or class, each operation of its table, and each shared table (build text 2b, section 6). Its means:

- **What it accepts:** its parameters in order, each required, optional or a rest; their stated types, expanded through every type they name, the providers' included, with names kept; the functions it accepts and what it hands them; the named types it gives meaningful values and the arguments it must not write; whether it needs its object as `this`; its marked bound lines; and the settings, start arguments and channels it reads.
- **What it hands back:** its stated type, expanded the same way, which says whether it answers at once or later; plain data or a class instance; the errors that can leave it; the arguments it writes into; the channels it writes (files, tables, streams, messages); its marked bound lines; and, for a constant, its value.
- A kind, handle kind or class: its members, each with its own means. An item that starts a program: the program's streams, start arguments, settings and files among its channels.
- Each part takes in the providers': an error of a provider that can pass through the item is among its errors, a provider's channel it reaches among its channels.
- The stated parts are read from its stated types. The rest the tool works out from its code over its **closure**: every piece of its module (a declaration, a local, a member, a top-level statement, a data file) that its behaviour can depend on. That is each piece reached from it by a call, a name, a member read, written or called (every function member, where the member is computed), an import or a file named by a literal; the top-level statements of each file reached; the members the language calls by itself; and the writers of every place a piece reads, repeated until nothing is added. Where the language does not decide which piece is meant, every candidate is in. It leaves out only what cannot reach the item's answer: an error caught where it is raised and never named, a stream written outside the call, a started program's code beyond its channels, the code that made what the caller handed in, and the insides of a module that keeps no state (build text 5, section 6).

**What changes.** A changed item is one whose means differs, that is removed, whose code no longer matches its stated types, that ARCH named, or that a pull request declared. Any difference in what it accepts changes its domain or range, accepting more included. The tool may find a change in an equivalent rewrite, never miss one in a different one. Where a later module's item takes in a changed part of a provider, as its uses file records, that item is a changed item of that module too, told as any is, and so on through the modules after it.

**Not a change.** Describing an item: stating a part that the type checker read as any value (no stated type, or one that admits every value), where the item's code is unchanged or the change is its module's conversion. A new item, which no one uses yet. A change to the insides only, which leaves every item's domain and range, meaning included, as they were.

**Who uses what.** Each module's uses file, `process/modules/<module>.uses.json`, is written by the tool from the module's code and tests, never by hand but for a data file's copy: each earlier item used, how, by what route and where, and its places outside the standard. A use calls the item; reads or writes one named member of its value; uses the whole value (hands it on, returns, stores, spreads, lists, copies, compares, iterates or writes it as text, or any use the tool cannot prove reads one named member); builds its own value of the provider's kind; names the kind, or holds the value under a local name whose every use is a use of its own; holds a marked copy; reads a kind another module relabelled as its own; replaces or mocks a provider's member in a test; or uses a facility of a package or the host, recorded by package. It also records, for each of the module's own items, the providers' parts its means take in (an error that can pass through, a channel it reaches), so that who is told is a lookup with no user's code read. The tool rewrites it at every push of the module's job, in every change ARCH makes to the module, in a module-list change for each module touched and each user naming a moved or renamed item, and in every module when the facility list changes. A provider's change that alters what a uses file records changes an item that file names, so the module is told (point 1 below), and its job's next push rewrites it.

**The coding standard.** Every module's code and tests keep the coding standard (build text 2c), derived from the language's own definitions. Under it, every way a change to an earlier module can change what a later module's code or tests do is a listed use, direct or through a middle module, or a listed place outside the standard, never refused. It rests on two premises: that the pinned type checker computes types as documented, and that each host's descriptions of its facilities are true. The tool classifies the facilities of the hosts the product runs on; ARCH names the boundary modules and classifies the product's packages, in its facility list.

**Who is told.** In the owner's words, "ideally only the users of the entry that changed". A merge sends one notice for each module whose files it changed, and each notice tells each module once, naming each changed item it uses and the places:

1. each later module whose uses file names a changed item, or a member of a changed kind, by any route, where the change reaches the use (below);
2. each module that holds a marked copy of a changed item, or reads a kind relabelled from one;
3. on any change to the provider's code or test files, whether or not an item changed: each later module with a place outside the standard that may refer to the provider, or a test that replaces or mocks one of its members; each earlier module with an order fault naming it; and each later module with no uses file yet that imports it, reads its files by path or starts its program, or, where the tool cannot tell which, every later module with no uses file;
4. on a change to a package's version, each module whose uses file names the package; on a change to the host's version, each module that uses a facility of it.

A change reaches every use of the item, except:

- A kind, handle kind or class whose means differ only in its members (a class's are its instances'). A member added reaches the uses of the whole value, building one's own among them; one removed, changed or made optional reaches those and the reads of that member, and a handle kind's method changed also reaches the whole handle's uses. A member whose kind differs only inside another kind that changed only in its members reaches only the whole value's uses. A use that only names the kind, or holds the value under a local name, is reached through that name's uses. Any other change (what kind it is, a class's constructor, an index or call signature, a bound line, any part of its means besides its members) reaches every use.
- An item whose means differ only inside such kinds (a function that hands one back or takes one) is told through them: a use that calls it or only names it is reached by those kinds' own uses; a use that reads, hands on or converts the item itself is reached as any.
- A change of meaning alone, its means unchanged, does not reach a module whose every use of the item only names it or hands it back from its own interface, at least one handing it back and none a marked copy, where a later module that gets the value through it is told: its code and tests neither read, compare, format, store nor assert the value. This is decided from the last module to the first, and a module whose later receivers are all left untold stays told.
- A mechanical edit does not tell a module whose code or tests it changed: that module's whole tests ran on it (section 9).

Not telling the others is safe. For a module kept to the standard, every way its code and tests can depend on a provider is a use its uses file lists, so a module that none of the change's reached uses names cannot see it; in each exception the module's code and tests touch nothing that changed, or already ran on it. A module not kept to the standard (a place outside it, an order fault, no uses file yet) is told of every change it might see.

**The insides only.** The job knows, from what it changed, when the change stays inside its module, and declares nothing; ARCH, placing work that changes no interface, names nothing; the tool, finding no item's means changed and nothing named or declared, tells only the modules of points 3 and 4. Where the tool finds an item changed whose domain and range the job knows are the same (a computed fact that takes in more of the closure than the code's effect reaches, an equivalent rewrite), the job records in its pull request that item and, in one line, why its domain and range are the same; that item then tells no one. The record takes off only that item: every other changed item, every item ARCH named or a pull request declared, and every module of points 3 and 4 are told as above. A wrong record is caught as any change of meaning made by accident is: by the provider's own tests, then the users' tests at their next job, and the walks. Held by text.

**What a told module does.**

- A module with an open job gets the notice at once, in the job's record of its work, and ARCH tells the job. Where the job changes code for it, it runs its tests again (section 6); where it finds nothing to change, it records that, and its recorded pass stands. A module with no open job gets a told job, its next job: told only when notices are its only work, otherwise ordinary, reading the notice's uses.
- A told job checks only the changed parts and runs only the tests that relate to them (section 6), chosen by the tool by whole test file: each that holds a place the notice names, or reaches a piece that holds one or a piece with a line the job changed, and each the job changed. A piece is a function, a method or one file's top-level code; a test file reaches a piece when a chain of calls the reader resolves leads to it from that file. Where a piece is named other than in such a call (handed on, kept in a table), every test file whose imports lead to its file reaches it; a test file with an import the reader cannot resolve is related. A walk's steps are never among them.
- A told job that finds nothing to change records that and runs no test. Where its uses file was rewritten, it pushes it and its pull request merges; otherwise it closes unmerged (section 4).

**The conversion.** A module's first job under the coding standard is its conversion. It brings the module's references to earlier modules into the standard, states its items' types, obtains or marks its copies, and lets the tool write its uses file. It changes no behaviour, declares no change of meaning, and runs its tests only where running code changed. What waits on a provider, and each order fault, it reports to ARCH; the place stays listed until then. Conversions start earliest in the order first (section 5), and merge as any job does (section 8).

**When the module list changes,** the change sends no notice of itself. An item moved, or a module split or renamed, is removed from one module and new in the other, so its users are told; where only a provider's name changes, their code is changed by a mechanical edit.

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

- ARCH decides the interface between two modules. A change to the domain or range of an item a later module uses is ARCH's to decide before it is built, with the users it reaches, read from their uses files. A provider's job may propose one, and does not build it until ARCH decides. Held by text.
- A job's pull request merges once no job is open among the modules it uses: the providers its uses file names, read at the tranche's newest commit and at the job's head, and theirs in turn. A blocked job holds no one. A module with no uses file yet waits on the earlier modules it imports.
- There is no merge of several modules together other than the mechanical edit. Where modules must change together, ARCH orders the work so that each merge passes on its own: the provider first accepts the new form beside the old, the users move, and the provider then drops the old form.
- Where that cannot be done, the boundary between those modules is an architecture bug. ARCH corrects the module list or the interface, and does not work round it.

## 9. Changes that are not a job's

- **The mechanical edit.** A worker in ARCH's session makes it as one change covering every affected module, with each touched module's uses file rewritten by the tool (section 7), and it is merged once, when no job is open, between a round's last merge and its internal walk. ARCH's session tests it as section 6 says. A module where the change needs judgment gets its own job.
- **A lane's folder.** A change that touches only files in a lane's own folder needs no module tests. Design documents do not need testing.
- **Requirement text, the module list, and the process's named files.** These change no code and no tests, so their pull requests merge through the tool with no module tests run and no record of them.
- **The required run.** There is one required run on GitHub, with one name. It reports on every pull request, judging it with the tool at the version its base branch names. It passes at once, needing no record of tests, when no module's code or tests changed; on the tranche's own pull request into the main branch; and on a dropped tranche's pull request whose every file is the main branch's own (part 3, section 5).
- **The owner's approvals and forbidden commands** are committed by the owner alone (part 6).

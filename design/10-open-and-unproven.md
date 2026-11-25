# Part 10. What is open, what is unproven, and the trial

Length: 101 lines. Last section: "6. Risks with no trial".

Most items are also marked where they belong in parts 1 to 9. This part gathers them and adds what belongs to no one part.

## 1. Open with the owner

One item remains open with the owner, to be put to him in full before the design can be called settled.

1. **His approvals and forbidden commands for Process4** (part 6, section 2): the wording of his approvals, which only he decides, and his word on the forbidden commands as they stand. What is in force is his committed `CLAUDE.md` standing-approvals block and the `.claude/settings.json` deny list; what is open is his word confirming the wording as settled, or his revision of it.

## 2. Open design work

For a session to do, and to report.

1. The written procedures for promoting, rolling back and support, for each product. The rule is in part 3, section 8; no procedure is written yet.
2. Each product's conversion plan. It is not part of this document; the product's onboarding lane writes it (part 6, section 8).
3. Where cost can be read on Claude Code (part 7).

**What a session needs before it can build the tool, and this document does not yet say.** Each is design work, to be written as its own text beside this one and not into it:

4. The tool itself. Written: build texts `01-the-tool-and-the-required-run.md` and `01b-the-commands.md`. Not built. Unproven there: a session that holds one repository fetching the tool's copy; and it assumes the process's repository is public.
5. Each role's starting text. Drafted: eight texts in the build folder `starting_texts/`, each under 8,192 bytes. None has been put before the permission checker, and each has ten numbered rule lines or fewer, as part 4, section 11 counts them.
6. The form of a structured comment and of an interface listing. Written: build text `02b-the-comment-and-the-listing.md`. The forms used when the notice's method was proven are in a repository this work could not open, and win where they differ.
7. The form of the module list, a requirements file and the process config. Written in build text `02-the-forms.md`.
8. The required run. Written in build text `01-the-tool-and-the-required-run.md`. Not built.
9. The walks. Written: build text `03-the-walks.md`. Nothing in it has run.
10. Left unsettled by the forms text: helpers under one module's tests that another module imports, which the interface listing does not cover; one written form for messages between two separately running parts of a product; and how the owner's record of decisions is split when it outgrows the maximum.
11. The steps of an account switch, and what is read to show that it lost no work. The switch includes confirming the new account's environment carries the process's permissions-management settings (part 7, section 5); the steps, on the sessions' side and his, and what is read, are written in build text 6 (`06-the-account-switch.md`), still unproven.
12. The forms of the shared state's records, and what the tool means by "cannot follow" and "reaches". Written: build text `05-the-records-and-following.md`. Nothing in it has run.
13. What is read to show that archived sessions do not use up the account's room.

## 3. Unproven

Process4 has never run and its tool is not built. Nothing below has been shown to work as this design uses it.

- **The tool,** and merges made by it passing the permission checker at a real rate. That a program run by a session can reach GitHub has been seen (part 7, section 3).
- **The shared state,** and a successor starting only from it.
- **A ROOT started by a plain prompt** coming up on the owner's newest approvals and acting as ROOT.
- **Replacing ARCH while jobs are open.**
- **The watcher's takeover,** and ROOT's refresh by it.
- **Walks made by sessions:** a session's browser reaching the development site; a walk shared among sessions; the hosting account bearing the walkers.
- **A walk ending without flaws.**
- **A deployment made from a session** inside a round.
- **The mechanical edit's one merge,** tested by ARCH's session.
- **A job's tests run once in its own session,** within the time a session can run one thing, and GitHub's required run reading the record of them; **a notice reaching a running job**; and **a merge that waits** for a job of a module it uses.
- **The tranche branch merging into the main branch.**
- **The release path:** an install, an update, and a release prepared as far as the owner's approval.
- **A stop on the owner's word** that the hourly wake does not undo; a held merge; a module put first; a new slot number.
- **An account switch that loses no work.**
- **Two products sharing the slots.**
- **An edit to the approvals with a restart** that carries a round on.
- **The notice as part of a running process,** unproven and not built or run on a real product. Picking a told job's related tests is not proven at all.
- **Cross-repository acts.** Cross-repository messaging between roles works. A cross-repository session-lifecycle act is refused even with the permissions-management settings in place (ROOT archiving the process-repository PROCESS session), so PROCESS is started and refreshed by the owner, not ROOT (part 6, section 7).
- **The owner's approvals placed by a session:** whether the permission checker lets a session place his approved text in his approvals file, and the route in a repository whose approvals forbid it (part 6, section 2).
- **The owner's acts to start a product** (part 7, section 4), an onboarding lane carried through to a product's ROOT starting (part 6, section 8), and that nothing physical stops a product's session from changing the process (part 6, section 7).
- **Everything listed as not proven on Claude Code** in part 7. A session fetching its copy of the process has been seen.
- **Everything on Codex not marked measured in part 8.**

## 4. The trial

- The trial runs in the trial repository, on a few small made-up modules built by the whole chain of sessions. What it asks of the owner, stage by stage, is in the build text `04-the-trial.md`, section 4: session starts; merging the building session's pull requests; the branch rule once the required run has reported; two edits to his approvals; one stop; three short marked instructions; entering the development copies' hosts among the allowed hosts, and connecting an AI account only if a journey that uses AI is tried; one typed approval of a trial release; and for the account switch his acts in a second account.
- A trial can break a claim. It cannot prove one. Proof is the first real tranche.

The order in which these are built and tried, the most doubtful first, and what each stage asks of the owner, is the build text `04-the-trial.md`.

What the trial rehearses, each once unless a number is given:

1. A plain-started ROOT fetches the newest copy, comes up on the newest approvals and forbidden commands, also straight after an approvals commit, and starts the watcher, ARCH and the coordinator.
2. Twenty or more merges by the tool pass the permission checker.
3. A freed slot is refilled within minutes, and jobs obey a replaced ARCH.
4. The shared state takes writes without a merge and is read by a successor; the hourly wake rouses ROOT.
5. The watcher takes over from a ROOT that has died, and from one that asks.
6. A stop, a held merge, a module put first and a new slot number each work on the owner's word, and the hourly wake does not undo a stop.
7. Finished sessions, once archived, do not use up the account's room.
8. Several walking sessions share one walk by area; a session makes a deployment and an external walk within a round; the tranche branch merges into the main branch.
9. A mechanical edit across several modules merges once, with the touched modules' tests run by ARCH's session (part 2, section 9).
10. A process fault travels from a job to PROCESS, and the owner starts PROCESS in the process's repository, surfaced by the coordinator on the owner's standing page (part 6, section 6). PROCESS is then refreshed by the owner starting its successor from the coordinator's standing page (part 4, section 5). Cross-repository messaging between PROCESS and the product's roles is exercised, with a non-substantive refusal re-attempted where one occurs (part 6, section 4).
11. An edit to the approvals with a restart carries a round on.
12. An install and an update are run and confirmed on a development account, and a release is prepared as far as the owner's approval.
13. The rule for who takes a free slot gives the same answer every time.
14. The hosting account bears the external walkers.
15. An account switch loses no work.
16. A job runs its tests once in its own session and the required run passes on its record; a notice reaches a job while it is open and its tests run again; a ready job's merge waits for an open job of a module it uses, and merges once that one has.

## 5. Only the first real tranche can show

- Whether a tranche can end.
- Whether the permission checker goes on passing merges at a real rate.
- How often a process fault stops work and so waits for the owner.
- Whether cost can be read for the account after each round and for the tranche report.
- The share of ARCH's work that is passing things on.
- Whether a lane's session is better kept running or started when a question arrives.

## 6. Risks with no trial

- A job's tests judge its own work. Most requirements are looked at only by the job's own tests.
- Sessions write and count the walks' steps. A step that was loosened cannot be seen. A walk starts from a fresh copy and cannot see an update breaking a user's existing data; only the confirmed update before a release looks at that.
- A module's tests run only on its own job. A failure caused by another module's merge can sit unseen until a walk meets it.
- Most rules in this design are held by text alone. Nothing physical stops a session building a product from changing the process's files, or from moving to a changed process.

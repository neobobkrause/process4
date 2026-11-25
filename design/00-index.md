# Process4: the design

Length: 91 lines. Last section: "6. Words used".

**Status: proposed. Nothing here is in force and nothing here has run.**

## 1. What this is

- This is the design of Process4, in eleven parts. It is "the process4 requirements" and is what sessions follow.
- It states the design as it now stands. It carries no history of how the design came to be, beyond naming where a figure or a quotation comes from. The owner's decisions, in his exact dated words, are kept in the record of decisions (part 5). The reasons and the evidence are in the background document.
- It names no product. A product's own facts and the steps to bring it under Process4 belong to that product's conversion plan, which the product's onboarding lane writes (part 6, section 8).
- Parts 1 to 6 name no hosting provider and use harness-neutral terms. A harness is named there only in part 5, where a figure comes from one. Part 7 says what carries each term on Claude Code, part 8 on Codex, part 9 on Cloudflare.
- Each part is kept under the single-text maximum, and the eleven together under the set maximum (part 5).

## 2. Status

Process4 is **proposed** now. It is **on trial** from the owner's acceptance: used for the trial repository and the first real tranche. It is **in force** after the first real tranche ends, on the owner's word.

## 3. Marks used in every part

- Words in quotation marks are the owner's, exactly as typed, unless the marks only name a term, a mark or an option. Where a quotation is not among his typed words and comes through an earlier record, the line says which record.
- **Open:** not settled. The line says who settles it.
- **Unproven:** the rule depends on something never shown to work. Part 10 gathers these.

A rule with no mark is the owner's ruling, or follows from one directly.

## 4. The parts

| Part | File | Subject |
|---|---|---|
| 0 | `00-index.md` | This page, and the words used |
| 1 | `01-purpose-owner-and-decisions.md` | What Process4 is for; the owner and the AI; how his words become decisions; working principles |
| 2 | `02-modules-jobs-tests-and-the-notice.md` | Modules, requirements, jobs, slots, module tests, the notice to user modules, changes that are not a job's |
| 3 | `03-tranche-rounds-walks-and-release.md` | The tranche, rounds, the two walks, deployment, release, support beyond the process |
| 4 | `04-roles-and-sessions.md` | Each role; starting, refreshing and replacing sessions; messages; the shared state; when something goes wrong |
| 5 | `05-reading-and-documents.md` | Reading in full; the maximums; the documents and records |
| 6 | `06-rules-permissions-and-changing-the-process.md` | What holds a rule; the tool; how the process is changed |
| 7 | `07-harness-claude-code.md` | What carries each term on Claude Code, and the owner's acts to start a product there |
| 8 | `08-harness-codex.md` | What carries each term on Codex, and what is not known |
| 9 | `09-hosting-cloudflare.md` | What carries each hosting term on Cloudflare |
| 10 | `10-open-and-unproven.md` | What is open, with whom; what is unproven; the trial |

## 5. The build texts

How the tool, the forms, the walks and each role's starting text are made is written in the build texts, in `build/`. They are kept with this design in the process's repository, and a session reads those its starting text names. They stand beside this design and change no rule of it. Where a build text and this design differ, this design rules.

## 6. Words used

- **The owner:** the person the product is built for. He defines the product. The AI decides everything technical and tells him in plain words what it decided.
- **Harness:** the system that runs AI sessions. Two are covered: Claude Code and Codex.
- **Session:** one running AI conversation on a harness.
- **Role:** a standing responsibility that one session holds at a time: ROOT, the watcher, the coordinator, ARCH, a lane, PROCESS. A role lasts; its sessions are replaced.
- **ROOT, the watcher, the coordinator, ARCH, PROCESS:** the standing roles (part 4). A lane is a role a product has while its design needs one. A job, a walking session and a worker hold no role.
- **Long-lived role:** a role whose session runs long enough to need refreshing. Every standing role, and a lane that is kept running, is long-lived; a job and a walking session are not. **Handover:** what its successor needs, written before a refresh.
- **Worker:** a helper that a long-lived role or a job starts inside itself for one bounded piece of work.
- **The account:** the owner's account on a harness, under which every session runs. The development account, the hosting account and the GitHub account are always named in full. **The account after each round** is a short report, not an account in this sense.
- **Starting instructions:** the text a session is started with, naming every act it may take. A role's starting text is the same thing for a standing role, and a role's principles are the rules in that text.
- **Process fault:** a fault in the process itself and not in the product: a rule of this design that cannot be kept, a fault in the tool, or a stop that nothing called for.
- **Architecture bug and implementation error:** an architecture bug is a fault in the design itself; an implementation error is a fault in code or text that does not follow the design (part 1, section 6).
- **Held merge:** a merge the owner has told the coordinator to hold until he approves it.
- **Foundations:** the owner's own earlier document of the reasons and evidence behind the process.
- **Trial repository:** the throwaway repository in which the process is rehearsed before any product uses it.
- **Module:** one part of the product, with its own code files, tests and requirements file. The product is one ordered list of modules, and a module may use only modules before it.
- **Provider and user:** a **provider** is a module that provides a service to other modules through an interface; a **user** is a module that uses the service of another module through the provider's interface.
- **Interface:** what a module accepts and what it hands back. An item's **domain** is its interface, its **range** the values valid there with their **meaning**: what they stand for, their order and units, and the timing, effects and state it requires. **Means:** the part of an item's domain and range the tool can check: its stated types, and the facts the tool works out from its code (part 2, section 7). **Uses file:** a module's record, written by the tool from its code and tests, of each earlier module and item it uses, and where. **Declared uses:** the providers a module's uses file names. **The coding standard:** the forms in which a module's code and tests may refer to an earlier module, and the rules on types, host facilities and order, under which the tool finds every use (part 2, section 7). **Conversion:** a module's first job under the coding standard.
- **Job:** one session's work on one module, delivered as one pull request.
- **Slot:** room for one job to run. Eight by default, counted across the account.
- **Tranche:** one batch of product work, built on the tranche branch and reaching the main branch only as a whole.
- **Round:** one pass within a tranche: jobs, then the internal walk, then a deployment and the external walk.
- **Internal walk:** in the owner's words, it "uses the UX Screens document to confirm that the workflow matches the definition". It is made on the product as built, without deploying it.
- **External walk:** in the owner's words, it "follows the UX journeys to confirm that all journeys can be completed successfully to produce proper results". It is made on a development deployment.
- **The Screens document and the journeys:** the two documents the walks are measured against. A **walking session** makes a walk.
- **Area:** a named part of what a walk covers (part 3).
- **Flaw:** one of three things a walk can find (part 3). Anything else a walker notes is an **observation**.
- **Mechanical edit:** one change that touches many modules in the same trivial way and needs no judgment. The owner's example: "a word table change".
- **Development site and development deployment:** the product put on a site in its own development account, reaching no one else. It holds no secrets and keeps no permanent record.
- **Pull request:** a proposed change to a repository, which GitHub can test and then merge. A draft pull request is one not yet offered for merging.
- **Release:** a public version of the product offered for installing. A development release, made only for development, is not one. **Installed sites** are where releases run for real users.
- **The notice:** what tells a user module that a provider's interface changed. A **structured comment** is a comment in code that states the interface for the tool.
- **Governing text:** a text a session must read in full and follow. **The maximums:** the largest single text and the largest set (part 5).
- **The tool:** the process's own small program, each session's only door to GitHub (part 6).
- **Shared state:** what every role works from. Its form is a small fixed set of records (part 4).
- **Standing approvals:** the owner's text saying what sessions may do without asking him and what they may never do. Its wording may be drafted for him; only he changes it, by his own click.
- **Forbidden commands:** the list of commands taken away from every session outright.
- **Permission checker:** the harness's automatic judge of each risky act, which may refuse it.
- **Unattended mode:** the harness's way of running a session with nobody answering it. **Scheduled wake:** a timer that rouses a session. **Compaction:** a harness shrinking a full context, which loses what was read.
- **Standing page:** the one page that always shows everything waiting for the owner. **Full stop:** everything halted, with only the owner able to restart it.
- **Deploy token:** the secret value that lets a session deploy to the development account. It is made once for a product, with every permission its development will need (part 1, section 3). **Hosting provider:** where a product is hosted and released.
- **Fill level:** how full a session's context window is. **Refresh:** the planned replacement of a role's session by a fresh one.
- **Lane:** a standing design responsibility for one area of a product. **The UX lane** is the lane for the user's experience: the screens and the journeys. **Design pages:** the pages a lane keeps its designs on, where the owner works with it. **Onboarding lane:** the lane of PROCESS that plans one product's move onto Process4 (part 6, section 8).
- **Process config:** the product's short file of process settings. What it holds, among other fields (each is in the build text `02-the-forms.md`): the process version it runs on, the default slot number, its lanes, its hosting provider and development account, the process folder and the folder of the walks' documents, the commands that build, serve and walk the product on one machine, the most external walkers, and the language reader the tool uses. **The language reader** is the program that reads the product's code for the tool.

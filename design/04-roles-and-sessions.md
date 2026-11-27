# Part 4. Roles and sessions

Length: 64 lines. Last section: "11. Smaller rules a session needs".

Part 4's other sections: 1, 2, 3, 5, 7 and 9 in `04b-`; 6 in `04c-`.

## 4. The shared state

- What belongs to one job stays in that job's pull request, and what every role needs is in the shared state.
- What sessions say to each other, and the process's running records, never build up as files or commits in a repository.
- Every kind of standing note in the shared state says what ends it, and the coordinator's session removes the note, by the tool, when that comes true.

- The shared state is a small fixed set of records, each rewritten in place. Each record has one writer. It is read and written only through the tool, and writing it needs no merge.

| Record | Holds | Writer |
|---|---|---|
| Roles | Which session holds ROOT, the watcher, ARCH, the coordinator and PROCESS | The holder of ROOT. At a takeover the watcher writes it, and by that write becomes ROOT |
| Lanes | Which session holds each of the product's lanes | ARCH. PROCESS keeps a like record of its own lanes in the process's repository |
| Wakes | The time ROOT last woke | ROOT |
| Stop | A stop on the owner's word, naming the account | The coordinator |
| Standing notes | The owner's instructions now in force for running work: a held merge, a module put first, the slot number, a full external walk asked for | The coordinator |
| Round | The tranche, its scope where one is recorded, the round, the areas named, the modules with work, and which are finished or blocked and why | ARCH's session, by the tool |
| Waiting work | Notices, walk flaws and flaws reported by jobs, placed against modules with no open job | ARCH's session, by the tool |
| Handover, one for each long-lived role | What that role's successor needs to carry on | The holder of the role |

- Sessions name roles, not session addresses, so that a replaced role can be obeyed.
- The owner's decisions are not kept here. They are in the record of decisions (part 5).
- What carries the records on GitHub: one issue in the product's repository, found by its label, with each record one comment, or more where it outgrows one, rewritten in place. Each comment's first line is a hidden mark naming its record. One listing call reads them all; one call rewrites a record.
- GitHub keeps no guard against two writes to one comment at the same moment: one is lost, silently. So every record has exactly one writing session. A job writes none. It records that it is blocked, or that a notice needs no change, in its own pull request, and sends ARCH its one message; the tool in ARCH's session then rewrites the round and waiting-work records. Which modules are finished is worked out afresh each time from GitHub's own record of pull requests: merged, or closed with the job's record that nothing needed changing.
- On a failed write the tool waits as long as GitHub's rate-limit answer says, or longer at each try, and tries again up to four times. If the write still fails, that is a process fault. It keeps no list of writes to make later.
- Each record is kept under the single-text maximum, as a rule.
- **Unproven:** all of it. The tool builds the shared state and passes its own tests; it has not run in a round. Not verified from GitHub's own pages: the size a comment can hold, that rewriting a comment notifies no one, and any limit on how often one comment can be rewritten.

## 8. Messages

- A message wakes its receiver at once.
- Whatever the receiver needs is saved before the message is sent. It is saved in the sender's pull request, in the repository, in a record of the shared state, or for a walk in that walk's own issue; the message itself is not stored.
- Where a harness has not been shown to wake a session at once, that is noted as a shortcoming (part 8).

## 10. When something goes wrong

- **A job fails its tests.** The job fixes its module and runs the tests again. The tool counts the failed runs on a job's pull request in the job's record of its tests. After two failed corrections (the third failed run on the pull request) it tells ARCH, which replaces the session with a fresh one. The fresh session first works out why the corrections were made, so as to foresee the others. If the replacement also fails twice (the fifth failed run), the module is recorded as blocked with the reason, its slot is freed, and the matter goes to ARCH as a design question.
- **A loop that would not end.** A flaw handed back twice is decided by ARCH as a design question (part 2, section 4). A job blocked twice by the same other module is the same: the boundary between the two is an architecture bug (part 2, section 8). A design that ARCH has sent back to a lane twice comes to the owner as a question, with both views. A chain of notices ends of itself, because a module is used only by modules after it. A tranche's rounds end on the owner's word (part 3, section 5), and takeovers by the watcher at the limit on depth (section 6). In each case other work goes on.
- **A session dies or stops.** ROOT's hourly wake finds it, and it is woken or replaced as section 5 says.
- **A stop nothing called for** is a process fault. Some need no change to Process4, for example a stop caused by a compaction; then the stopped session is woken or replaced. Each such case may be studied and reported to PROCESS. While Process4 is on trial every such stop is reported to PROCESS; the simpler handling applies once it is beyond trial.
- **The process itself has a fault:** part 6, section 6.
- **A stop on the owner's word.** He tells the coordinator, which writes the stop record and tells ARCH, which interrupts each job. It is lifted the same way: he tells the coordinator, which clears the record and tells ARCH, which wakes or replaces each job from its pull request. A stop takes effect in the turn in which a session receives it. ROOT reads the stop record at every wake, so that the hourly wake does not undo it.

## 11. Smaller rules a session needs

- **Starting texts** are kept in the process's repository beside the tool, one for each role, at the product's fixed version. PROCESS writes and changes them, as a process change. The tool fills in a job's and a walking session's. This design is kept there too, in a folder of its own beside the build texts, and a session reads it from its copy of the process.
- **Who directs whom.** The session that started a session directs it. The owner directs every session he speaks to. The coordinator's message carrying the owner's marked words is an instruction to ARCH.
- **Naming a role to message it.** A session resolves a role to its current session address from the roles record, and a lane from the lanes record, and messages that address, never one it remembered (section 4, "sessions name roles, not session addresses"). The live PROCESS is found as section 5 says; PROCESS finds each product's ROOT in its products registry (build text 5, section 4). A role whose session the record does not yet name cannot be messaged until it is recorded.
- **Naming a session.** Every session carries a standard name, so the owner can see each one and its lineage. A session that holds a role is named `<product> <role> #<generation>`; PROCESS, which serves no one product, `PROCESS #<generation>`. The generation counts that role's sessions on that product — one for the first, one more at each refresh, replacement or takeover — and for a long-lived role it is kept in that role's handover record, so it continues across a full stop and never resets. A job, which holds no role, is named `<product> <module> #<n>`, `<n>` its job number (part 2, section 3); a walking session `<product> walk #<number>`, its walking-session number (part 3, section 3). A session that keeps a handover record names itself on start, from the generation there; ARCH names a job and a walking session when it starts them. How a name is set is in the harness part.
- **ROOT's start.** The owner's plain prompt tells ROOT to fetch the process's copy and read ROOT's starting text. ROOT then reads the roles record. If it names sessions, this is a restart, and ROOT archives them first (section 7). ROOT makes its own scheduled wake; the watcher makes its own.
- **A stopped session** is first woken by a message from ROOT. If it has not answered by ROOT's next wake, ROOT replaces it, or asks ARCH to where ARCH started it.
- **Pull requests that are not a job's.** The role that writes one opens it and merges it by the tool: a lane for its own folder; ARCH for requirement text, the module list and its decision record; the coordinator for the owner's decision record; PROCESS in the process's repository, on the owner's word. Each recorded decision is one pull request.
- **For a job,** ARCH's session makes the branch and opens the pull request before it starts the job's session, and writes there the job's kind, the work placed and the uses its notice carries; it adds to that each notice that reaches the job while it is open. The job writes its own record (blocked; going on; nothing needs changing; a notice needs no change) as a separate comment, and the record of its tests as another, so each has one writer. A job runs its module's tests by the tool (part 2, section 6).
- **A job that reaches the fill level** pushes, tells ARCH in one message, and stops. ARCH replaces it from the same branch. A walking session that reaches it writes its last lines in the walk's issue, tells ARCH, and stops; ARCH gives the areas not yet walked to a fresh session. A walking session starts no workers.
- **A natural pause** is a moment between two pieces of work, with nothing half done and everything saved.
- **What ARCH learns from the coordinator** (a held or approved merge, a module put first, a new slot number, a request for a full external walk) comes by the standing notes, which the tool reads before every merge, and a message.
- **The one message when the process is completely blocked** is sent by the coordinator, or by ROOT where the coordinator is what has stopped.
- **The tool:** only PROCESS changes it, as a process change merged on the owner's word (part 6, section 7). The owner merges none of its pull requests.
- **"At most ten rules"** counts the numbered rule lines of a starting text, the lines that say what the session never does among them. A line may hold closely related rules. A starting text must name every act its session may take. The size limit applies to the role's instructions as filled in for a session, with the one mechanical fetch line (the clone command the session runs once and never rereads) left out of the count. What is filled in is names and addresses only. A list (the work placed, the uses a notice carries, a walk's areas) stays in the pull request or the round record, which the text names.

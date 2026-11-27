# Part 4 (continued): the roles, lanes, refresh and the one way back

Length: 78 lines. Last section: "9. What the owner can see".

Part 4's other sections: 4, 8, 10 and 11 in `04-`; 6 in `04c-`.

## 1. The roles, and the sessions that hold no standing role

- **ROOT** is the first session. The owner starts it with a plain prompt on the product's repository. It starts the watcher, ARCH and the coordinator. The owner starts PROCESS (section 2; part 6). Once an hour a scheduled wake rouses it as a safety net, to wake or replace a session that has stopped. It decides nothing about the product and builds nothing.
- **The watcher** is a standby session that takes over if ROOT dies. ROOT starts it (section 6).
- **The coordinator** is the owner's front door for the product. It passes on his marked decisions and instructions exactly as typed and dated, and keeps the product's record of them. It answers his questions in words, never by building anything. It tells him what ARCH decided, one plain line each, puts to him the questions that are his, and gives him the account after each round. On his word it holds or approves one merge, puts a module first, changes the slot number, stops work, or moves the product to the latest or a named Process4 version (part 6, section 7). It decides nothing about the product.
- **ARCH** is the architecture session, one for each product. It decides every technical matter of the product, writes each decision in the product's decision record, and settles a design before anything is built on it. It writes requirement text, keeps the module list and the facility list of boundary modules and packages (part 2, section 7), opens each tranche and decides its scope, names each walk's areas, turns each flaw into work for a named module, names in the work it places each interface change it decided (part 2, sections 7 and 8), makes the development deployment, prepares a release, starts the product's lanes, writes the tranche report, and carries out a move to a new Process4 version on the owner's approval (part 6, section 7). It never edits the owner's approvals, changes the process, or publishes a release without him.
- **A lane** is a standing design responsibility for one area of a product (section 3).
- **PROCESS** is where the process is changed, and the only place (part 6).
- **A job** is a session started to do one module's work (part 2).
- **A walking session** is started by ARCH for a walk (part 3).

What the tool does and what ARCH keeps: whatever has one right answer is done by the tool: who takes a free slot, when a notice is sent and to whom, whether a round's jobs are done. ARCH's session keeps what needs judgment. The share of ARCH's work that is passing things on is measured on the first tranche. The tool chooses the next job and writes its starting instructions; ARCH's session makes the start.

## 2. Who starts whom

| Starter | Starts |
|---|---|
| The owner | ROOT, PROCESS |
| ROOT | The watcher, ARCH, the coordinator |
| ARCH | Jobs, walking sessions, the product's lanes |
| PROCESS | Its own lanes, each joining product's onboarding lane among them (part 6, section 8) |
| A long-lived role or a job | Its own workers |

- Under a ROOT the owner started, sessions sit at most three levels deep: ROOT; then ARCH, the coordinator and the watcher; then jobs, walking sessions and lanes. PROCESS is started by the owner in the process's repository (part 6), not under ROOT. A takeover by the watcher adds a level (section 6).
- No session starts its own replacement.
- A session is started with one repository only; from the newest commit of the tranche branch, or for PROCESS of the process repository's main branch; in the harness's unattended mode; and with starting instructions that name every act it may take.
- ROOT's first act is to fetch the newest copy of its branch, and to stop if it cannot.
- Every session passes the owner's suggestion of model and effort on to each session it starts. His note: "always a model and effort sufficient for quality, and a permissions mode appropriate for the task at hand".
- **Unproven:** that a ROOT started by a plain prompt, whose instructions name no acts, comes up on the owner's newest approvals and can act as ROOT.

## 3. Lanes

The owner's rulings:

- A lane decides design in its area. ARCH decides whether and when a design is built and whether it can be built as given. A design ARCH cannot build goes back to the lane.

- A lane has a folder of design knowledge in the product's repository, which it owns. It reads its area whole. It delivers designs, never product code.
- The owner identifies the need for a lane, and ARCH opens it. The UX lane is always there. A product's other lanes are named in its process config.
- A lane runs as one session at a time. Whether it is kept running or started when a question arrives is ARCH's call, judged by cost, and is measured at the end of the first tranche.
- The first time a lane runs, it uses workers to research the product's founding documents, the existing code and the best practice of its area, and answers no question until that research is recorded in its folder. The lane keeps an index of its research, one line for each file saying what it holds. Every later session of the lane reads that index first, reads a research file, or gives it to a worker, when a question needs it, and adds to it.
- A lane decides design and wording in its area, within the product's principles.
- The owner keeps the product's direction, audiences and principles. A lane decision that would change one comes to him with options and the lane's recommendation.
- Questions from the work reach a lane only through ARCH, which passes each on with enough context to decide. A job never talks to a lane, and lanes never talk to each other.
- A lane ends when the owner or ARCH says its area needs no further design. Its folder and research stay.

A fresh lane session begins by reading the index of the lane's research and the links to its design pages. One session for each lane is held by the lanes record. The record is written before the session is started, as a claim naming no session yet; once the start returns, the starter writes the same entry again with the session's address. The tool accepts that one fill-in and refuses to write a second session while the first is recorded as live.

The questions ARCH puts to a lane, and its answers, are not kept as a running record. What a lane decides is written into its folder as design.

## 5. Refresh and replacement

- Each long-lived role is refreshed on purpose, at the first natural pause in its work after its fill reaches the stated fill level (part 5). Where it cannot read its fill, it is refreshed at a natural pause. A pause alone does not call for a refresh. It asks its parent. Its successor starts only from the shared state and the repository.
- Before it asks, the role rewrites its handover record.
- The parent of ARCH and the coordinator is ROOT; PROCESS is started and refreshed by the owner (part 6, section 7). The parent of a product's lane is ARCH. ROOT replaces the watcher, and ROOT itself is refreshed by the watcher (section 6).
- ROOT records in the roles record the address of each standing session it starts or refreshes, so another session can resolve the role to it (section 4; section 11). PROCESS runs in a separate repository, and a product's sessions cannot read its state across repositories (part 7, section 3); so the live PROCESS is recorded in the product's own roles record, in its `process` field, by ROOT — from a message PROCESS sends ROOT on start — and the coordinator reads it there, with no cross-repository read (part 6, section 7).
- At its refresh point PROCESS rewrites its handover record and asks the coordinator, which puts the start prompt on the owner's standing page and notifies him; the owner starts the successor. The successor records its liveness and generation in its handover record and announces itself by message to each product's ROOT. The re-attempt of a non-substantive refusal (part 6, section 4), role-to-address resolution and successor registration apply to every cross-repository act, messaging among the roles among them.
- A job that fills up or dies is replaced by ARCH with a new session that continues from the same branch and pull request.
- A finished session is archived, not deleted. The session that started a session archives it; where the starter is gone, ROOT does. Whoever archives a session also removes that session's scheduled wake, if it has one, so that no wake fires into an archived session.
- Sessions other than ROOT and the watcher are relatively short-lived. A role such as ARCH lasts, while its sessions are refreshed often.
- **Unproven:** replacing ARCH while jobs are open.

## 7. The one way back

- After any full stop there is one way back: the owner starts ROOT, and ROOT rebuilds everything from the shared state and the repository.
- An edit to the owner's approvals goes with a restart of ROOT by this way. What it does to a running round: the owner first tells the coordinator to stop, and open jobs push and stop; he lands the edit (part 6, section 2) and starts ROOT; ROOT starts the standing roles afresh; ARCH starts a new session for each module with an open pull request, continuing from its branch. The round goes on from the round record.
- A restarted ROOT first archives every session still named in the roles and lanes records, except PROCESS, which the owner starts and refreshes (section 5), and every open job's session, and then starts the roles afresh.
- A switch of account adds only the owner's own acts in the new account (part 1, section 3; part 7, section 5). **Unproven:** an account switch that loses no work.

## 9. What the owner can see

- He can see each open job's progress and status without speaking to it.
- A product's ROOT, ARCH, coordinator, lanes and jobs are grouped under that product. Workers are left out.

# Part 6. What holds a rule, the tool, and changing the process

Length: 81 lines. Last section: "8. Process4 develops itself".

## 1. What holds a rule

- Three things hold a rule whatever a session intends: the owner's standing approvals, judged by the permission checker; the list of forbidden commands; and GitHub's own rules, which are the owner's settings.
- Every other rule in this design is held by text: by a session's instructions and by this document. That is a known limit. Rules held by text alone are a known risk.
- The tool guards against mistakes, and not against a session that sets out to defeat it. That too is a known limit.

## 2. The owner's standing approvals

- They are a block of text that is the owner's, saying what sessions may do without asking him and what they may never do. Their wording is drafted with care: on his request PROCESS (for the process's repository) or the coordinator (for a product; before a product has one, the session that sets it up, part 7, section 4, act 8) drafts the whole text and shows it to him in plain words, or he types it himself. The session places the text he has approved, unchanged, in a pull request that changes only that file, and never merges it; he reads the changed file on the pull request's page and lands it by clicking Merge there, on GitHub's website. A draft has no effect until he lands it. No session changes his approvals on its own, and no session merges a change to them.
- A session loads the approvals only when it starts. An edit therefore goes with a restart of ROOT (part 4, section 7), and no session compares the approvals it loaded with the newest.
- The list of forbidden commands is a technical list, the same for every repository. PROCESS keeps it in the process's repository as `shims/claude-settings.json`, beside the workflow a product copies, and changes it only as a process change on the owner's marked decision. A session copies it, unchanged, into a repository by a pull request he lands with a click, as for his approvals.
- The approvals and the list of forbidden commands are protected by the permission checker and by the owner's own click that lands a change to them.
- In the process's repository the approvals say that a process change is merged only on the owner's word given at PROCESS. Nothing enforced by GitHub is added for this.
- They live in the product's repository on the tranche branch, carried to the main branch by each tranche's merge, so that every session starts from a commit that holds them; and in the process's repository on its main branch.
- His two files are first landed on the main branch this way, and the tranche branch is made from it. A later edit is a pull request on the tranche branch, opened the same way and landed by his click, after he tells the coordinator to stop (part 4, section 7).
- Where one of the two files differs between two branches, he chooses which of his own committed versions stands, and GitHub's own buttons carry it out (for example, Revert on the pull request that brought the version he does not keep). No session resolves it.
- **Unproven:** that the permission checker lets a session place the owner's approved text in his approvals file; and, in a repository whose approvals forbid a session to change that file, this route works only once his approvals allow it.
- The ordered list of his acts to start a product is in part 7, section 4, for Claude Code. For Codex it is not known (part 8).
- **Open (the owner):** the wording of his approvals for Process4, which only he decides, and his word on the forbidden commands as they stand. What is in force is his committed `CLAUDE.md` standing-approvals block and the `.claude/settings.json` deny list in each repository (part 7, section 1); what is open is his word confirming that wording as settled, or his revision of it.

## 3. Forbidden commands and GitHub's rules

- The list of forbidden commands takes these away from every session outright: every direct push, every GitHub command, the ordinary merge commands, overwriting a branch's history, deleting branches, and writing files through GitHub's web interface. So the tool is each session's only door to GitHub. The one exception: a session's first command fetches its read-only copy of the process, the tool with it, and that fetch is not made by the tool.
- Sessions act as a second GitHub account that can push and merge but cannot change settings. No branch can be deleted or overwritten. The tranche branch takes a session's change only by pull request with its required test run passing. Only the owner's click lands a change to his approvals or the forbidden commands (section 2).
- GitHub's published limits are kept to: sessions stay within them with a margin and obey GitHub's own rate-limit responses.

## 4. Working rules that exist because of the permission checker

- One judged act for each command.
- A refused act is never reworded or handed to another session.
- Three refusals in a row stop a session, which is replaced.
- A non-substantive refusal does not count as working the act around. Where the checker refuses an act the approvals and the permissions-management settings (part 7, section 5) sanction, and it allowed an identical act before or invites a retry, or the refusal fell on a command the session malformed, the session re-attempts the sanctioned act cleanly and bounded (part 1, section 6): it keeps its prior state, tries again at its next wake or after a short wait, and brings the matter to the owner if it persists. A genuinely unsanctioned act, and a relayed consent (part 3, section 6), are still never retried; three refusals in a row still stop the session.

## 5. The tool

- The tool is the process's own small program. It does only this: make a branch; push; open a pull request, mark it ready, and close it; merge; prepare a release and, on the owner's approval, publish it; choose the next job and write its starting instructions; write out a module's interface listing and send notices; decide when a module's work is finished and a round's jobs are done; read a pull request's test results, and count failed runs on a job's pull request; write and read a job's kind, the work placed and its record on its pull request; list a told job's related tests; list the modules a round changed and the areas they name, for ARCH to choose from; open and close a walk's issue, and write and read what is in it; read and write the shared state, removing a standing note when what ends it comes true and refusing a second live session for a lane; and, inside a module's own tests, check declared uses and make the two refusals the owner approved (part 2, section 6); and, on GitHub's machines, set the scope of the required run and run the tests chosen (part 2, section 7). Its commands, one for each act, are in the build text `01b-the-commands.md`.
- It refuses nothing for size, and holds none of the checks that could stop work.
- The tool has tests of its own. They test no product and never run on a product's work. They run only where the tool is changed: before pushing, PROCESS runs only the tests of the tool it changed; and the required run in the process's repository runs them only on a pull request that changes the tool, and passes at once on any other. The changes recorded when the notice's method was proven become tests of the tool.
- The AI builds the tool, before anything is in force.
- A product names one fixed version of the process in its process config, and a tranche runs on that one version from open to close. Each session fetches a read-only copy of it.
- PROCESS answers a finding against the tool that needs a deliberate attack with "no change" unless the owner says otherwise.
- **Unproven:** the tool is built but has not run in a process in force. Whether merges made by it pass the permission checker at a real rate is unmeasured.

## 6. A process fault

- No session building a product fixes a process fault or works round it.
- A fault goes from the session that met it to ARCH, from ARCH to the coordinator, and from the coordinator to PROCESS. If PROCESS is not running, the coordinator puts starting it on the owner's standing page and notifies him; the owner starts it (section 7).
- The fault's description is written once by the session that met it and passed on unchanged.
- A process fault that stops work waits for the owner at PROCESS. Other work goes on.

## 7. How the process is changed

The owner's words, in full:

"Lets be clear about how the process is changed (and how it's not changed). Process changes only happen in a separate process lane call PROCESS that I interact with. Though process changes are often technical and detailed, the PROCESS session will explain the nature of the problem and suggestion options for fixing it for me to explore and ultimately choose. Because updates require my involvement and I might be away from my computer for extended periods, there could end up being more than one change being proposed in the PROCESS session at a time. When that happens, the set of changes are considered together as a group that could potentially have interactions and implications between. The process after a proposed change is made must continue to meet the process4 requirements (or the requirements changed with my explicit approval). The transition from the process a product is being built using to the updated process will be done only with my prior approval, with PROCESS proposing the best and least disruptive means of making the update."

What follows from them:

- A change must not add a new test, gate, review or stop. It may only correct or remove what is broken.
- "No change" is always among the options. His written instructions: "caution is a cost, paid only against a measured failure or your word", and "the default answer to a finding with nothing measured behind it is no change".
- Any change to Process4 is explained to the owner, who decides whether and how the process is updated.
- No session building a product may change the process, add a test, check, gate or review to it, or adopt a changed process on its own. ARCH moves a product to a changed process only with the owner's prior approval, by the means PROCESS proposes.
- The means: the owner, in the coordinator's session, instructs it to move a product to the latest Process4 version — or to a named version. That one instruction is his prior approval, and he needs give no commit id and do nothing more. The coordinator records his words and tells ARCH; ARCH resolves the latest version with the tool (`latest-version`: the newest commit of the process repository's main, which holds only merged, tested changes), updates the product's process config to that commit by pull request, and merges it; then the sessions refresh onto it (ROOT refreshes the standing roles; ARCH restarts any open job from its branch), losing no work (part 3, section 1). The coordinator tells the owner, in one line, when every session is on the new version.
- The owner starts PROCESS, and refreshes it (part 4, section 5). PROCESS works in the process's own repository, with the owner directly. The coordinator can talk to it, and surfaces on the owner's standing page when PROCESS needs starting or refreshing.
- The coordinator finds PROCESS by the product's own roles record, in its `process` field, which ROOT keeps current from a message PROCESS sends on start (part 4, section 5). A cross-repository read of the process's repository is refused (part 7, section 3), so the coordinator never reads it there. When that field names a running PROCESS the coordinator does not ask the owner to start a second; it messages the one that runs. When the field is empty, or names a session that no longer answers, the coordinator surfaces starting PROCESS on the owner's standing page (section 6). **Unproven** with two products.
- PROCESS runs as one session at a time, keeps its own folder in the process's repository, and records its research there before it proposes.
- PROCESS writes the owner's approving words into the record of the change, exactly as typed, with the date. Nothing else counts as approval.
- **Unproven:** nothing physical stops a session building a product from changing the process's files, or from moving to a changed process.

## 8. Process4 develops itself

- PROCESS may have lanes of its own for standing subjects, as needed. PROCESS starts its own lanes.
- **The onboarding lane.** For each product that joins Process4, PROCESS starts one onboarding lane, in the process's repository. The lane plans the product's move. It writes the product's conversion plan. It writes the owner's page of his acts to start the product (the harness part lists them), each as clicks with what he should see, and with the whole list of permissions for each token he makes (part 1, section 3). It writes the brief for the session that sets the product up. It ends when the product's ROOT has started; its folder and research stay.
- **How the lane reads the product.** The lane does not read or act on the product's repository, accounts or services itself. The owner starts a read-only session on the product's repository with the lane's brief. That session changes nothing, and its report reaches the lane: by message where that repository's approvals allow it, and through the owner otherwise.
- **Settings.** Every change that onboarding needs to a setting of GitHub or of the hosting account is the owner's own click, from the lane's page. No session is given the means to change those settings (section 3).
- **Unproven:** an onboarding lane carried through to a product's ROOT starting.
- When a new model version arrives, PROCESS puts one question to the owner: which parts of the process, and which working rules that exist because of the permission checker, may no longer be needed. Nothing is removed or tried unless he says so.

# Part 6 (continued): how the process is changed

Length: 24 lines. Last section: "7. How the process is changed".

Part 6's other sections: 1, 3, 4 and 6 in `06-`; 2 in `06b-`; 5 in `06c-`; 8 in `06e-`.

## 7. How the process is changed

The owner's words, in full:

"Lets be clear about how the process is changed (and how it's not changed). Process changes only happen in a separate process lane call PROCESS that I interact with. Though process changes are often technical and detailed, the PROCESS session will explain the nature of the problem and suggestion options for fixing it for me to explore and ultimately choose. Because updates require my involvement and I might be away from my computer for extended periods, there could end up being more than one change being proposed in the PROCESS session at a time. When that happens, the set of changes are considered together as a group that could potentially have interactions and implications between. The process after a proposed change is made must continue to meet the process4 requirements (or the requirements changed with my explicit approval). The transition from the process a product is being built using to the updated process will be done only with my prior approval, with PROCESS proposing the best and least disruptive means of making the update."

What follows from them:

- A change must not add a new test, gate, review or stop. It may only correct or remove what is broken.
- "No change" is always among the options. His written instructions: "caution is a cost, paid only against a measured failure or your word", and "the default answer to a finding with nothing measured behind it is no change".
- Any change to Process4 is explained to the owner, who decides whether and how the process is updated.
- No session building a product may change the process, add a test, check, gate or review to it, or adopt a changed process on its own. ARCH moves a product to a changed process only with the owner's prior approval, by the means PROCESS proposes.
- The means: the owner, in the coordinator's session, instructs it to move a product to the latest Process4 version — or to a named version. That one instruction is his prior approval, and he needs give no commit id and do nothing more. The coordinator records his words and tells ARCH; ARCH resolves the latest version with the tool (`latest-version`: the newest commit of the process repository's main, which holds only merged, tested changes), updates the product's process config to that commit by pull request, and merges it. Where the new version's required-run workflow differs from the product's copy, ARCH then replaces the copy by a second pull request, merged after the first (part 2, section 9). The sessions then refresh onto it when part 3, section 1 says (ROOT fetches the new copy and refreshes ARCH, the coordinator and the watcher from it, and goes on itself; ARCH restarts any open job from its branch), losing no work. The coordinator tells the owner, in one line, when every session is on the new version.
- The owner starts PROCESS and refreshes it. PROCESS works in the process's own repository, with the owner directly. The coordinator can talk to it, and surfaces on the owner's standing page when PROCESS needs starting or refreshing.
- The coordinator finds PROCESS as part 4, section 5 says. When the `process` field of the product's roles record names a running PROCESS, the coordinator messages it and does not ask the owner to start a second; when it is empty, or names a session that no longer answers, the coordinator surfaces starting PROCESS on the owner's standing page (section 6). **Unproven** with two products.
- PROCESS runs as one session at a time, keeps its own folder in the process's repository, and records its research there before it proposes. It reads in full the design and its handover, and reads its research, the record of the owner's decisions and the build texts through their indexes (part 5, section 3).
- PROCESS writes the owner's approving words into the record of the change, exactly as typed, with the date. Nothing else counts as approval.
- **Unproven:** nothing physical stops a session building a product from changing the process's files, or from moving to a changed process.

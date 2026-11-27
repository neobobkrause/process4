# Part 6 (continued): the owner's standing approvals

Length: 19 lines. Last section: "2. The owner's standing approvals".

Part 6's other sections: 1, 3, 4 and 6 in `06-`; 5 in `06c-`; 7 in `06d-`; 8 in `06e-`.

## 2. The owner's standing approvals

- They are a block of text that is the owner's, saying what sessions may do without asking him and what they may never do. Their wording is drafted with care: on his request PROCESS (for the process's repository) or the coordinator (for a product; before a product has one, the session that sets it up, part 7, section 4, act 8) drafts the whole text and shows it to him in plain words, or he types it himself. The session places the text he has approved, unchanged, in a pull request that changes only that file, and never merges it; he reads the changed file on the pull request's page and lands it by clicking Merge there, on GitHub's website. A draft has no effect until he lands it. No session changes his approvals on its own, and no session merges a change to them.
- A session loads the approvals only when it starts. An edit therefore goes with a restart of ROOT (part 4, section 7), and no session compares the approvals it loaded with the newest.
- The list of forbidden commands is a technical list, the same for every repository. PROCESS keeps it in the process's repository, beside the workflow a product copies (the harness part names the file), and changes it only as a process change on the owner's marked decision. A session copies it, unchanged, into a repository by a pull request he lands with a click, as for his approvals.
- The approvals and the list of forbidden commands are protected by the permission checker and by the owner's own click that lands a change to them.
- In the process's repository the approvals say that a process change is merged only on the owner's word given at PROCESS. Nothing enforced by GitHub is added for this.
- They live in the product's repository on the tranche branch, carried to the main branch by each tranche's merge, so that every session starts from a commit that holds them; and in the process's repository on its main branch.
- His two files are first landed on the main branch this way, and the tranche branch is made from it. A later edit is a pull request on the tranche branch, opened the same way and landed by his click, after he tells the coordinator to stop (part 4, section 7).
- Where one of the two files differs between two branches, he chooses which of his own committed versions stands, and GitHub's own buttons carry it out (for example, Revert on the pull request that brought the version he does not keep). No session resolves it.
- **Unproven:** that the permission checker lets a session place the owner's approved text in his approvals file; and, in a repository whose approvals forbid a session to change that file, this route works only once his approvals allow it.
- The ordered list of his acts to start a product is in the harness part, where it is known.
- **Open (the owner):** the wording of his approvals for Process4, which only he decides, and his word on the forbidden commands as they stand. What is in force is his committed approvals and list of forbidden commands in each repository (the harness part names the files); what is open is his word confirming that wording as settled, or his revision of it.

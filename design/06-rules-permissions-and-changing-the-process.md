# Part 6. What holds a rule, the tool, and changing the process

Length: 31 lines. Last section: "6. A process fault".

Part 6's other sections: 2 in `06b-`; 5 in `06c-`; 7 in `06d-`; 8 in `06e-`.

## 1. What holds a rule

- Three things hold a rule whatever a session intends: the owner's standing approvals, judged by the permission checker; the list of forbidden commands; and GitHub's own rules, which are the owner's settings.
- Every other rule in this design is held by text: by a session's instructions and by this document. That is a known limit.
- The tool guards against mistakes, and not against a session that sets out to defeat it. That too is a known limit.

## 3. Forbidden commands and GitHub's rules

- The list of forbidden commands takes these away from every session outright: every direct push, every GitHub command, the ordinary merge commands, overwriting a branch's history, deleting branches, and writing files through GitHub's web interface. So the tool is each session's only door to GitHub. The one exception: a session's first command fetches its copy of the process, the tool with it, and that fetch is not made by the tool.
- Sessions act as a second GitHub account that can push and merge but cannot change settings. No branch can be deleted or overwritten. The tranche branch takes a session's change only by pull request with its required run passing.
- GitHub's published limits are kept to: sessions stay within them with a margin and obey GitHub's own rate-limit responses. The tool spaces the writes that create content, and on a refusal waits as long as GitHub says, longer at each try (build text 1, section 3).

## 4. Working rules that exist because of the permission checker

- One judged act for each command.
- A refused act is never reworded or handed to another session.
- Three refusals in a row stop a session, which is replaced.
- A non-substantive refusal does not count as working the act around. Where the checker refuses an act the approvals and the permissions-management settings (part 7, section 5) sanction, and it allowed an identical act before or invites a retry, or the refusal fell on a command the session malformed (mixing a forbidden command into a legitimate one), the session re-attempts the sanctioned act cleanly and bounded: it keeps its prior state, tries again at its next wake or after a short wait, and brings the matter to the owner if it persists. A genuinely unsanctioned act, and a relayed consent (part 3, section 6), are still never retried.

## 6. A process fault

- No session building a product fixes a process fault or works round it.
- A fault goes from the session that met it to ARCH, from ARCH to the coordinator, and from the coordinator to PROCESS. If PROCESS is not running, the coordinator puts starting it on the owner's standing page and notifies him; the owner starts it (section 7).
- The fault's description is written once by the session that met it and passed on unchanged.
- A process fault that stops work waits for the owner at PROCESS. Other work goes on.

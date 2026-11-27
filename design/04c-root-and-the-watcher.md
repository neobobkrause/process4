# Part 4 (continued): ROOT and the watcher

Length: 16 lines. Last section: "6. ROOT and the watcher".

Part 4's other sections: 4, 8, 10 and 11 in `04-`; 1, 2, 3, 5, 7 and 9 in `04b-`.

## 6. ROOT and the watcher

**Unproven:** all of it; it is rehearsed in the trial.

- ROOT starts the watcher before the other roles, after fetching and, at a restart, archiving (section 11). The watcher has no other duty.
- The watcher has its own scheduled wake. At each wake it reads the time ROOT last woke.
- The watcher wakes hourly, half an hour after ROOT. If ROOT has missed two wakes, the watcher takes over. It writes itself into the roles record as ROOT, makes its own ROOT wake and removes the old ROOT's wake and its own watcher wake, starts a new watcher, tells the coordinator, and archives the old ROOT session if it still exists.
- ARCH, the coordinator and PROCESS go on as they were. They name ROOT by role.
- A planned refresh of ROOT is the same takeover, asked for: ROOT rewrites its handover record and asks the watcher to take over. ROOT is taken over only at its fill level or when it has died, never for a version move: its own acts do not change with a version, and it reads the new version's texts at its next takeover.
- Each takeover leaves the new ROOT one level deeper than the one before, because the watcher was started by the ROOT it replaces. A session at the harness's limit on depth can start no session and make no scheduled wake, so ROOT's watcher, ARCH and coordinator work only while ROOT is at least two levels above it. ROOT reads its depth at its start. Three levels above the limit, it puts a fresh ROOT on the owner's standing page. Two levels above, it makes no planned takeover: at its refresh point it rewrites its handover record and the coordinator surfaces the fresh ROOT's start as blocking, as for PROCESS (section 5). A takeover for a ROOT that has died still happens, and the page then says the fresh ROOT is blocking. The owner starts a fresh ROOT at a pause.

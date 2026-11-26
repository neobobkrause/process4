# The rewrite of every uses file takes an hour (26 Nov 2026)

## The fault (civicsmith ARCH #28)

"`p4 push` rewrites every module's uses file, one module at a time, whenever a branch changes the facility list, the
module list (every module it touches, which for civicsmith's documents move was about 190), or the pinned Process4
version (every module, when the host classification differs). On civicsmith (203 modules) each rewrite is a full
type-check, about 15-20 s, so each such push takes about an hour." The owner: "moving to the latest process4 version is
expected to take an hour?! No way! There's no reasonable justification for that."

## Cause

`writeUsesFiles` (tool/lib/usescmd.mjs) reads module after module in one process. Each module's reading
(`readReferences`, then `moduleMeans`) built two or three TypeScript programs from nothing, and each program:

- parsed and bound again the language's library, node.d.ts, host.d.ts and every product file it reached;
- read and parsed again, for every file, the package.json that decides how the file is read: the tool's resolver
  hook gave the reader no resolution cache, so it had none to keep them in;
- resolved every import, and every library reference inside the language's library, again, with a stat of each
  folder on the way.

`readCopies` also re-parsed every other module's interface files for each module read: work that grows with the
square of the number of modules.

## The fix

- `notice/ts.mjs`: every standard program in a process shares the files already parsed (by name, reused only where
  the text and the way it is read are the same; TypeScript's own editor support shares files among programs in the
  same way). The resolver hook gives the reader its resolution cache. Within `whileFilesStay`, a run over a commit
  written out, the programs also share file reads, existence checks and import and library resolution.
- `notice/refs.mjs`: each interface file's exported literals are read once per run for each text.
- `usescmd.mjs`: `readAllUses` reads the modules of a rewrite in up to four processes at once (`usesworker.mjs`; one
  for each 8 modules, limited by the machine's cores and by its free memory at 2 GB a reader), each a share of the
  modules; with 15 modules or fewer, one, in the same process. A module a reader does not give back is read again in
  the main process. Which modules are rewritten, and what is written, are unchanged.
- `notice/notices.mjs` (notify's reading) runs its modules within `whileFilesStay` too.

Not changed: `moduleMeans` still builds its own program from the module's own code (`mod.src`). Reusing the
program `readReferences` built, which also holds the tests and other modules' files, could change what it finds, and
with the shared files that second program is now cheap.

## Check

`tool/test/usesrun.test.mjs`: a dozen modules, each read alone with nothing parsed before it, then all in one run in
this process, in three readers, and by `writeUsesFiles` after a change to the facility list. Every file is the same,
byte for byte. `npm test`: 289 tests pass.

## Timing

A synthetic product of 200 small modules in a chain (each importing two earlier modules, a few typed exports and a
test), a change of the facility list, `writeUsesFiles` on a machine with 4 cores:

| | whole rewrite | per module |
|---|---|---|
| main | 33.4 s | 167 ms |
| this branch | 5.6 s | 28 ms |

The 200 files are the same on both (compared without the `written` line, which names the tool's commit). On these
small modules most of what is left is fixed cost: starting the readers and several hundred `git show` calls. Unknown: how
much of civicsmith's 15-20 s a module is checking that cannot be shared. Checking is still done for every module; the
readers divide it among the cores.

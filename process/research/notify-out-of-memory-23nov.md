# `p4 notify` runs out of memory on civicsmith

Written by PROCESS #9, 23 Nov 2026. A process fault from civicsmith ARCH #8, passed on unchanged by civicsmith
coordinator #4 at 05:31Z:

> "`p4 notify 1161` (0eec86f tool, civicsmith-copy, a merge that changed only process/ files) crashed with a JavaScript
> heap out-of-memory error (node's default heap, on a machine with 15 GB free). Run once more with node
> --max-old-space-size=12000 it finished: 'The merge changed no module's files. Nobody is told.' Every merge's notify on
> this 204-module product will likely meet the same crash at the default heap."

## Why (read in the tool at 0eec86f)

`notifyCmd` (`tool/lib/notify.mjs`) writes out the product before and after the merge, then calls `analyse` on each
(`tool/lib/notice/notice.mjs`): one whole TypeScript program over every code file, every module's listing and every
module's uses, twice. Only after both does it ask which modules' files the merge changed (`changedModules`), and that
question needs only the module list and the file list. So a merge that changes no module's files (requirement text, the
module list, a lane's folder, process files) still reads the whole product twice. On civicsmith (204 modules) that
needs more than node's default heap (about 8 GB on a 16 GB session machine, measured here) and finished within 12 GB.

A job's merge does change a module's files, and then the whole reading is needed by the method as built (a provider's
users are every later module). So that case needs the memory too: not measured yet, expected the same.

## Options

- **A. No change.** Every notify on civicsmith crashes; ARCH has no text that lets it raise the memory itself, so each
  merge's notice is lost or the fault comes back each time.
- **B. Two repairs (recommended).** (1) `notify` first works out the changed modules from the module list and the
  changed file names alone, and stops at once, reading no code, when none changed: the same answer, without the
  reading. (2) The commands that read code (`listing`, `notify`, `check`) give themselves a memory allowance of most of
  the machine's memory, the way ARCH's rerun did, instead of node's default. Removes a crash; adds no test, gate, review
  or stop. A product gets it by moving to the latest version.
- **C. Repair (1) only.** Fixes merges that change no module; every job merge still crashes.

## Not known

- Whether a job merge's notify on civicsmith fits in the memory a session machine has (16 GB here). Seen first at its
  first job merge.
- Whether `check` inside a module's tests on GitHub's machines meets the same limit: it reads one module and its
  providers, not the whole product twice; no crash reported.

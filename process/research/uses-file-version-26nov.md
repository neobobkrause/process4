# The uses file and the tool's version (26 Nov 2026)

Written by a worker for PROCESS on branch `work/uses-file-version`, from `main` at the time. It records the build only.

## The owner's decision

"Decision: a uses file names the tool version that wrote it, as information only; it is rewritten only when its module's own code or tests change, or when the module list moves items into or out of it, never because the Process4 version or the facility list changed; every version of the tool reads uses files written by earlier versions as their version meant them; and the tool's notes on Node features it does not know are not kept in the file."

Why: on civicsmith (203 modules), a move to a new Process4 version and a change to the facility list each made `p4 push` rewrite every module's uses file. It took about 15 to 20 s per module, about an hour in all. No module's interface had changed.

## What changed

- `tool/lib/usescmd.mjs`: `modulesToWrite` no longer adds every module when the facility list changes. It no longer adds every module whose file was written under another classification when `process.json`'s Process4 version moves. `classificationAt` is gone. `writeUsesFiles` writes a file only where what it says differs (`sameUses`, which ignores `written`). The rules that stay are:
  - a job's own module;
  - each module whose code or tests differ from the base;
  - the module-list rule: the modules touched, and each user whose file names a touched or gone module.
- `written.tool` is still the tool's commit. It is information only, and no reader looks at it.
- `tool/lib/notice/refs.mjs`: a place can carry `unknownHost`. `usesReading` leaves those places out of the file's `outside`. `p4 uses` still prints them, each marked `[a Node or workerd facility the tool does not know: not kept in the uses file]`.
- Build texts: 1b command 2 (`push`: the version and facility-list rewrites removed) and command 28 (`uses` prints the notes but does not write them). 2c has a new bullet, "When it is written". 5 §6 now says each file is read as the tool that wrote it meant it. Build text 6 does not mention rewriting uses files, so it is unchanged. Command 27 (`test`) says "as `push` does" and still holds as written.
- Tests:
  - refs.test: a facility-list change and a version move rewrite nothing. A code change rewrites its module, and a second push with nothing new writes nothing. The notes are printed but not stored.
  - who-is-told.test: a file in the oldest form, read through `check` and `notice`.

## Which places are no longer stored

These places are marked `unknownHost`:

1. R14 `uses X, a facility of the host the tool's classification leaves out`, where X is Node's or workerd's. A facility counts as Node's or workerd's when its package is `node` and its declaration is not in TypeScript's own `lib.*.d.ts`, or when its package is `workerd`.
2. R14 `uses M, which the tool has no description of`, where M is a host module: `node:*`, `cloudflare:*`, or any name Node's `isBuiltin` accepts.
3. S4 checker complaints that stand only because the description lacks something:
   - codes 2580, 2591, 2867 and 2868 (a global name of Node's, "install type definitions for node");
   - codes 2305, 2614 and 2724 (a member a host module does not export);
   - codes 2339 and 2551 (a property missing on a kind that Node's or workerd's description declares).

These places are still stored:

- the language's own facilities that the classification leaves out on purpose, such as `Proxy` (study-references, row 23);
- a package facility not on the facility list;
- a use that reaches out from outside a boundary module;
- a write to a member the host or a package declares;
- a test-runner facility used in code;
- the never-allowed facilities;
- S4 complaints of any other kind.

The places that an unknown value makes downstream, such as R1 `a value of kind any` where an undescribed Node call's result is used, are other rules. They are still stored.

## The readers, and how each reads an older file

The oldest form the tool has written is the one written at `78a2c83`, which is also build text 2c's first form. It has no `value`, no `item` or `relabels` on a place, no `packages` and no `takesIn`. The first tool, at `785767a`, wrote `what`, `facilities` and copies of the form `{file, pointer, of}`. It lasted 40 minutes on a branch and never reached `main`. On `main`, the first form is at `29c05fe` and already has every field that is written today.

- **notify, who is told** (`notice/notice.mjs`, `usesOf`). Each list is read as a list, or as empty where it is missing. A use with no `value` reads as the whole value: a file is held to say what each use does with a value only where some use in it has a `value`. Places tell by `mayRefer`. An S4 copy needs `item` and `relabels`, so an older file holds none. `resolvesAnew` reads only `uses`.
- **notify, version notices** (`versionNotices`): reads `packages`. A file without `packages` names no package, so it is told of no version change.
- **check** (`notice/check.mjs`, `declaredUsesCheck`, and `ownProgram` through `declaredUses`): reads `providers`, `orderFaults` and `outside[].mayRefer`. All of these are in every form.
- **related, `test`'s scope** (`notice/related.mjs`): reads whether a file exists, and `uses[].where`.
- **merge's wait on providers** (`uses.mjs` `earlierUsesAt`, through `declaredUses`): reads `providers` and `orderFaults[].provider`.
- **walk** (`usersMap`, through `declaredUses`): reads the same two fields.
- **re-exports** (`reExportsOf`, `reExportsReached`): read `uses[].type`, `item` and `where`.
- **close** (`usesFileDiffers`): runs `writeUsesFiles` for the job's own module, then diffs the file's path.
- **ready's conversion report** (`commands.mjs`, `conversionReport`): reads `outside[].rule`, `file`, `line` and `waitsOn`, and `copies`. Missing fields print as `?` or blank.
- **the writer itself:**
  - `refs.mjs` `handCopies` keeps each `{provider, item, file, pointer}` copy;
  - `modulesToWrite` reads `providers`, `uses[].provider` and `orderFaults[].provider`;
  - `sameUses` compares the whole file except `written`.
- **next-job, drop, testrun's "differs only in uses files", and notify's "only uses files changed"** read no file's content. They match only the file's path (`isUsesPath`).

No reader fails on, or misreads, the oldest form, so no reader was changed. The new test reads the `78a2c83` file through `check` and `notice`. With no `value` on its uses, u is told of a change to Row's `id`. A file written today says u reads only `name`, so u is not told of that change.

## Not done, and why: stored notes in an older file still tell

From an older file alone, a stored note on an unknown Node facility cannot be told apart from other places. In no form on `main` do its stored fields differ from those of a kept place:

- At `29c05fe` the note is `{R14, waitsOn "ARCH: the facility list", mayRefer ["*"]}`. A package facility missing from the list, or a module with no description, gives the same fields.
- From `54d7eee` on it is `{R14, waitsOn "this module", mayRefer ["*"]}`. A write to a host member, a test-runner facility in code, or a never-allowed R14 facility gives the same fields.
- S4 complaints are stored without their message.

Only `785767a`'s form kept `what`, and that form never reached `main`. So each reader reads these notes as their version wrote them, by `mayRefer`: a note with `*` hears of any change to every earlier module until the module's code changes and the file is rewritten without it. The new test asserts exactly this.

Making such notes tell no one would need a rule the owner has not decided. For example, "no R14 place refers to a product module", applied to every R14 place in old and new files alike. Or one rewrite of every file, which the decision rules out.

Also found: where a module uses an undescribed Node module, the value it gets back is `any`, so an R1 place (`mayRefer ["*"]`) usually stands beside the note. That R1 place is kept, so such a module still hears of every earlier module's change.

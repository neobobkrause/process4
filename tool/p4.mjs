#!/usr/bin/env node
// The Process4 tool: one program, a fresh process for each command, run from the read-only copy.
// Usage: node <copy>/tool/p4.mjs <command> [arguments]
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { totalmem } from 'node:os';
import { getHeapStatistics } from 'node:v8';
import * as c from './lib/commands.mjs';
import { github } from './lib/github.mjs';
import { checkCmd, listingCmd, notifyCmd, relatedCmd } from './lib/notify.mjs';
import { usesCmd } from './lib/usescmd.mjs';
import { walkOpen, walkClose, walkWrite, walkRead, walkText, walkAreas } from './lib/walk.mjs';
import { releasePrepare, releasePublish } from './lib/release.mjs';
import { parseBlock } from './lib/github.mjs';
import { JOB_MARK, RECORD_MARK } from './lib/round.mjs';
import { TEST_MARK } from './lib/testrecord.mjs';
import { testCmd, verdict } from './lib/testrun.mjs';
import { Fail, fail, git, parseArgs, repoRoot, repoSlug, sleep } from './lib/util.mjs';

const pr = (a) => {
  const n = Number(a._[0]);
  return Number.isInteger(n) && n > 0 ? n : fail('name the pull request by its number');
};

// For ready/results/close: the pull request number if given, else the one open pull request
// of the branch named with --branch, else of the current branch (a job has exactly one). A job
// starts on a detached checkout of the tranche branch (design part 4, section 2), so it names
// --branch <its branch>; `open` takes --branch the same way (fault o).
const prOf = (ctx, a) => {
  if (a._[0] != null) return pr(a);
  const branch = (typeof a.branch === 'string' && a.branch) || git(['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: ctx.root });
  if (branch === 'HEAD') fail('the checkout is detached; name the pull request by its number, or its branch with --branch <b>');
  const found = ctx.gh.prForBranch(ctx.slug, branch) || ctx.gh.lastPRForBranch?.(ctx.slug, branch);
  return found?.number || fail(`no pull request for the branch ${branch}; name it by its number`);
};

// A block as the required run's workflow wrote it to a file: the comment's body, or its JSON alone. None when
// the file is absent or empty, or holds no block. The job block (JOB_MARK), the job's record (RECORD_MARK) and the test
// record (TEST_MARK).
function readBlockFile(file, mark) {
  if (typeof file !== 'string' || !existsSync(file)) return null;
  const text = readFileSync(file, 'utf8').trim();
  if (!text) return null;
  const b = parseBlock(text, mark);
  if (b) return b.data;
  try { return JSON.parse(text); } catch { return null; }
}

const commands = {
  branch: (ctx, a) => c.branch(ctx, a._[0], a.into),
  push: (ctx, a) => c.push(ctx, a),
  open: (ctx, a) => c.open(ctx, a),
  test: (ctx, a) => testCmd(ctx, prOf(ctx, a)),
  ready: (ctx, a) => c.ready(ctx, prOf(ctx, a)),
  results: (ctx, a) => c.results(ctx, prOf(ctx, a)),
  merge: (ctx, a) => c.merge(ctx, pr(a)),
  drop: (ctx, a) => c.drop(ctx, a),
  'release prepare': (ctx, a) => releasePrepare(ctx, a._[0], a),
  'release publish': (ctx, a) => releasePublish(ctx, a._[0], a),
  close: (ctx, a) => c.close(ctx, prOf(ctx, a), a),
  'next-job': (ctx) => c.nextJob(ctx),
  finished: (ctx, a) => c.finishedCmd(ctx, a._[0]),
  'latest-version': (ctx) => c.latestVersion(ctx),
  'round-done': (ctx) => c.roundDoneCmd(ctx),
  'failed-runs': (ctx, a) => c.failedRunsCmd(ctx, pr(a)),
  'state read': (ctx, a) => c.stateRead(ctx, a._[0], a),
  'state write': (ctx, a) => c.stateWrite(ctx, a._[0], a),
  listing: (ctx, a) => listingCmd(ctx, a._[0], a),
  notify: (ctx, a) => notifyCmd(ctx, pr(a)),
  check: (ctx, a) => checkCmd(ctx, a._[0], a),
  uses: (ctx, a) => usesCmd(ctx, a._[0], a),
  related: (ctx, a) => relatedCmd(ctx, pr(a)),
  'walk open': (ctx, a) => walkOpen(ctx, a._[0]),
  'walk close': (ctx, a) => walkClose(ctx, a._[0]),
  'walk write': (ctx, a) => walkWrite(ctx, a._[0], a),
  'walk read': (ctx, a) => walkRead(ctx, a._[0], a._[1]),
  'walk text': (ctx, a) => walkText(ctx, a._[0]),
  'walk areas': (ctx) => walkAreas(ctx),
  // The required run's one job, on GitHub's machines only (build text 1, section 5): runs no test, reads the test record.
  'run verdict': (ctx, a) => {
    if (typeof a.head !== 'string' || !/^[0-9a-f]{40}$/.test(a.head)) fail('say --head <the head commit>');
    return verdict(ctx.root, {
      base: a.base, baseRef: a['base-ref'], branch: a.branch, draft: a.draft === 'true' || a.draft === true, head: a.head,
      jobBlock: readBlockFile(a['job-block'], JOB_MARK), jobRecord: readBlockFile(a['job-record'], RECORD_MARK),
      record: readBlockFile(a['test-record'], TEST_MARK), log: ctx.log,
    });
  },
};

// What each command does, printed by --help (or -h) and nothing else: a help flag never acts.
export const HELP = {
  branch: 'branch <name> [--into <branch>]: makes job/<module>.<n> or work/<what> from the newest commit of the tranche branch (process.json), else of --into or the default branch, and pushes it.',
  push: 'push [--blocked <module>[,<module>] "<why>" | --unblocked "<why>"] [--meaning <item> "<was; is now>"]... [--same <item> "<why its domain and range are the same>"]... [--notice-nothing "<why>" [--notice <n>]]: first rewrites, from the code at the current commit, the uses file of each module whose code or tests the branch changes against its base (a job\'s: its own module) and, where the branch changes the module list, of each module it touches and each user whose uses file names one, and where it changes the facility list, of every module, and commits any that changed; then pushes the current working branch (job/, work/ or drop/) to the same-named branch, never forced; with --blocked (repeated, or names joined by commas), writes the job\'s record on its pull request; with --unblocked, rewrites that record to say the job goes on, where ARCH ended the block by its own decision; with --meaning (repeated, each with its line), declares in the pull request\'s meaning comment a change of meaning under the same means, which makes the item a changed item when the pull request merges; with --same (repeated, each with its line), records in that comment that an item the tool finds changed keeps its domain and range, so that item tells no one when the pull request merges (every other changed, named or declared item still tells); with --notice-nothing, records in the job\'s record alone (never in the job block, which is ARCH\'s) that the notices that reached the open job need no change (notice_needs_no_change, with the job block\'s notice_seq read at that moment, or the n named by --notice, the last notice the job read, never above the block\'s), so its recorded pass stands for those notices and none that comes later. A record any flag writes keeps notice_needs_no_change. A told job that finds nothing to change in its code but whose own item changes with the provider\'s (a value computed from the changed item, or its bound handed back) declares it with --meaning, then runs close --nothing-to-change.',
  open: 'open --module <name> | --title "<t>" [--into-main | --into <branch>] [--branch <b>]: opens a draft pull request (from a detached checkout, name the branch with --branch); for a job writes the job block, with the items ARCH named as changing meaning (the module\'s `meaning` entries in waiting work), and prints its starting instructions. With one open already, prints it and its job block.',
  test: 'test [<pr>] [--branch <b>]: runs the pull request\'s tests in this checkout, which must be clean and at the pull request\'s head commit: the scope decided on the merge of the head into the base\'s newest commit, then each module\'s check and its test files. Prints each module as it starts and ends. Writes the test record on the pull request, rewritten in place, naming the modules run; after a pass asks GitHub to run the required run again; exit 1 on a fail, with the last lines of the failing output.',
  ready: 'ready [<pr>] [--branch <b>]: marks the pull request ready (named by number, by --branch, or the current branch\'s one open pull request), which asks for the required run; only where its test record stands for the head commit, or for an earlier commit from which the head differs only in the module\'s uses file, after every notice the job\'s record does not say needs no change; or where nothing needs one (scope nothing: no changed file under a module, or only comments and layout changed; every notice that reached the job one the job\'s record says needs no change; and, for a told job, its record that it found nothing to change). Otherwise marks nothing and says why: run test. On a conversion job, once marked, writes the conversion\'s report on the pull request: places outside the standard gone, by rule; copies; places still outside, with what each waits on; the time from opening; the cost, unmeasured where it cannot be read.',
  results: 'results [<pr>] [--branch <b>]: prints whether the test record stands for the head commit (or for an earlier commit from which the head differs only in the module\'s uses file) and what it holds, then the required run\'s state on the head commit (pull request named by number, by --branch, or the current branch), and for a failure the last lines of its output.',
  merge: 'merge <pr>: merges with a merge commit at the head commit, unless the owner holds it; for a job, refuses (exit 1) when a notice reached it after its tests ran that it has not recorded as needing no change (push --notice-nothing), and merges nothing while a module it uses (a provider its uses file names, or without one a module it imports, directly or through others, earlier in the order) has an open job not blocked, printing waits for <module> (pull request <n>).',
  drop: 'drop --tranche <name>: for ARCH, makes drop/<name> from the tranche branch\'s newest commit, puts each module\'s code and test files, and its uses file, back to main\'s version (deleting those main lacks), keeps requirements files, the module list, process.json, the decision records and the lanes\' folders as they are, pushes it, and opens a draft pull request into the tranche branch; prints its number and the files restored and deleted. ARCH marks it ready and merges it with ready and merge.',
  'release prepare': 'release prepare <version> --notes <file> [--file <built file>]...: makes an unpublished release at main\'s newest commit with the notes and files; with --development, a published pre-release with its tag.',
  'release publish': 'release publish <version> --approval "<the owner\'s words>": publishes the prepared release of that version; prints the owner\'s words back, unjudged.',
  close: 'close [<pr>] [--branch <b>] [--nothing-to-change "<why>"]: closes the pull request unmerged (named by number, by --branch, or the current branch); with the flag, first writes the job\'s record (nothing_to_change, and, where notices reached the open job, notice_needs_no_change at the job block\'s notice_seq; the job block is never written), rewrites the job\'s uses file from the code in this checkout at the job\'s branch and pushes it where it changed; then, where the pull request declares an item of the job\'s module changed (push --meaning: an item of its own that changes with the provider\'s) or the uses file differs from its base\'s, marks the pull request ready with no test (scope nothing; ARCH merges it as any, and notify on that merge tells the declared items\' users) instead of closing it. A job starts on a detached checkout, so it names --branch <its branch> or the number.',
  'next-job': 'next-job: chooses the next job for a free slot (counting only the requirements, and conversions, the tranche\'s scope in the round record names, where ARCH has written one; a module none of whose conversions has merged has its conversion as its only work, kind conversion), rewrites the round record, and prints its module, branch, work and kind; or none ready, or no free slot. With no free slot, a module with a notice waiting and no open job, earlier in the order than the latest running job, starts at once, and it says why.',
  finished: 'finished <module>: prints finished or not finished, with the ground, worked out afresh from GitHub.',
  'latest-version': 'latest-version: prints the newest commit of the process repository\'s main (what a move to the latest version adopts), and whether it differs from the pinned one; reads only.',
  'round-done': 'round-done: prints done or not done, and each module of the round finished, open or blocked with its reason.',
  'failed-runs': 'failed-runs <pr>: prints the count of failed test runs on the pull request, from its test record (none written counts 0); at the third and fifth, the line for ARCH.',
  'state read': 'state read [<record>] [--repository <owner/name>]: prints one record of the shared state, or all.',
  'state write': 'state write <record> --from <file> [--create [--process]]: rewrites one record in place; --create makes the issue and its empty records once.',
  listing: 'listing <module> [--at <commit>]: writes the product at that commit (default HEAD) into a folder outside the working tree and prints the module\'s listing: each item\'s means, its stated kinds and bounds, a message kind\'s channel (@message), and what the tool works out from its code; writes nothing to GitHub.',
  notify: 'notify <pr>: for a merged pull request, prints the notice for each module whose files the merge changed, or whose item\'s meaning ARCH named or the job declared, in module order: its changed items (any change to what an item accepts or hands back, accepting more included; a constant\'s value; describing, a part read as any value (none stated, or unknown) now stated, with the code unchanged or at the module\'s conversion, is none, and at a conversion every other change tells; an item the pull request records with push --same tells no one, nor does what takes it in only; a new item tells no one unless it changes what a name already used resolves to: a name another module answers in the tables of operations, or a name reached through a module that hands the provider on by export *), each later module\'s item that takes in a changed error or channel of it (its uses file\'s takesIn), and the modules told, found in their uses files: users of a changed item, places outside the standard, tests that mock the provider, order faults (of a module with no uses file, read from its imports), and modules with no uses file that import it, directly or through a module that re-exports it, name a path into it or that the tool cannot follow; and, where the merge changes a package\'s version or the host\'s (the facility list\'s versions), a notice from that package to each module whose uses file names it. A module whose files the pull request changed and whose tests its test record ran whole on the merged result (a pass of scope whole module naming it in modules, at a commit from which the merge commit differs in uses files at most) is not told. Writes each told user\'s reasons into its open job\'s block (printing that ARCH messages the job), or with no open job into notice comments on the merged pull request, which the waiting-work record names.',
  check: 'check <module> [--files <list>]: prints each use of a module not before this one in the order (from its uses file; without one, its imports), each disagreement of a structured comment with its code, and of the code with a provider\'s stated interface, with file and line; exit 1 if any.',
  uses: 'uses <module>: reads the module\'s code and tests in the checkout under the coding standard (build text 2c), writes its uses file into the checkout (its uses, mocks among them; places outside the standard; order faults; copies; each package and host facility used; and what each of its items takes in of its providers\' errors and channels), and prints every reference in standard form, every place outside the standard with its rule and what it may refer to, the order faults, the copies, the candidate restated facts, what a conversion needs from a provider first, the packages and host facilities used, and what its items take in; writes nothing to GitHub.',
  related: 'related <pr>: lists a told job\'s related test files (those holding a place its uses file names for the changed items, or reaching one, and those reaching a line the job changed or changed by it, a line whose change is comments or layout only not counting as changed), each with the rule that put it there, and the files left out, from the merged result of the pull request into its base; runs nothing.',
  'walk open': 'walk open <internal|external>: opens the walk issue, titled with the tranche, round and kind, and writes its number into the round record.',
  'walk close': 'walk close <issue>: closes the walk issue once ARCH has placed every entry.',
  'walk write': 'walk write <issue> --session <n> --from <file>: writes walking session n\'s one comment on the walk issue, rewritten in place.',
  'walk read': 'walk read <issue> [<flaw>]: prints the walk issue\'s comments, or one flaw.',
  'walk text': 'walk text <session>: prints a walking session\'s starting instructions, filled with names and addresses only.',
  'walk areas': 'walk areas: lists the round\'s candidate internal and external areas from changed modules\' step headers and requirement endings (for a changed module that names none, its users\', read from their uses files), for ARCH to choose from.',
  'run verdict': 'run verdict --base <sha> --base-ref <b> --branch <b> --draft <true|false> --head <sha> [--job-block <file>] [--job-record <file>] [--test-record <file>]: on GitHub\'s machines only, the required run: runs no test; reads the job block (ARCH\'s), the job\'s record (the job\'s) and the test record; passes where no test record is needed (scope nothing, every notice that reached the job one its record says needs no change, and for a told job its record of nothing to change; a draft passes at once), or where the test record stands for the head commit after every notice the job\'s record does not answer; fails otherwise, saying why.',
};

// GitHub is reached only for commands that need it; `run`, `listing` and `check` read the checkout alone.
const LOCAL = new Set(['listing', 'check', 'uses']);
export function context(name, overrides = {}) {
  const root = overrides.root || repoRoot();
  return {
    root,
    slug: name.startsWith('run ') || LOCAL.has(name) ? null : repoSlug(root),
    gh: github,
    log: console.log,
    wait: sleep,
    nowMs: () => Date.now(),
    ...overrides,
  };
}

export function main(argv, overrides) {
  const a = parseArgs(argv.filter((x) => x !== '-h'));
  const two = a._.slice(0, 2).join(' ');
  const name = commands[two] ? two : a._[0];
  const log = overrides?.log || console.log;
  if (argv.includes('--help') || argv.includes('-h')) {
    if (HELP[name]) log(HELP[name]);
    else for (const k of Object.keys(commands)) log(HELP[k] || k);
    return 0;
  }
  if (!commands[name]) {
    console.log(`commands: ${Object.keys(commands).join(', ')}`);
    return name ? 1 : 0;
  }
  a._ = a._.slice(name.split(' ').length);
  try {
    const ctx = context(name, overrides);
    const code = commands[name](ctx, a) ?? 0;
    if (code === 0) ctx.log('ok');
    return code;
  } catch (e) {
    if (e instanceof Fail) { console.log(`p4 ${name}: ${e.message}`); return 1; }
    throw e;
  }
}

// The commands that read a product's code may read the whole product twice, which on a large product needs more
// memory than node gives by default (build text 1b, command 11, "Limits"). They run with most of the machine's memory: the
// node flag that allows it, or null where the default already allows that much or the run already carries it.
const READS_CODE = new Set(['listing', 'notify', 'check', 'uses', 'push']);
export function heapFlag(name, { total = totalmem(), limit = getHeapStatistics().heap_size_limit, env = process.env } = {}) {
  if (!READS_CODE.has(name) || env.P4_HEAP) return null;
  const mb = Math.floor((total / 1048576) * 0.75);
  return limit / 1048576 >= mb ? null : `--max-old-space-size=${mb}`;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const flag = heapFlag(process.argv[2]);
  if (flag) {
    const r = spawnSync(process.execPath, [flag, process.argv[1], ...process.argv.slice(2)], { stdio: 'inherit', env: { ...process.env, P4_HEAP: '1' } });
    process.exitCode = r.status ?? 1;
  } else {
    process.exitCode = main(process.argv.slice(2));
  }
}

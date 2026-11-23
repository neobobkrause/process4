#!/usr/bin/env node
// The Process4 tool: one program, a fresh process for each command, run from the read-only copy.
// Usage: node <copy>/tool/p4.mjs <command> [arguments]
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { totalmem } from 'node:os';
import { getHeapStatistics } from 'node:v8';
import * as c from './lib/commands.mjs';
import { github } from './lib/github.mjs';
import { decideScope, runTests } from './lib/scope.mjs';
import { checkCmd, listingCmd, notifyCmd, relatedCmd } from './lib/notify.mjs';
import { walkOpen, walkClose, walkWrite, walkRead, walkText, walkAreas } from './lib/walk.mjs';
import { releasePrepare, releasePublish } from './lib/release.mjs';
import { parseBlock } from './lib/github.mjs';
import { JOB_MARK } from './lib/round.mjs';
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
  const found = ctx.gh.prForBranch(ctx.slug, branch);
  return found?.number || fail(`no open pull request for the branch ${branch}; name it by its number`);
};

// The job block as part one's workflow wrote it: the comment's body, or its JSON alone. None when
// the file is absent or empty, or holds no block.
function readJobBlock(file) {
  if (typeof file !== 'string' || !existsSync(file)) return null;
  const text = readFileSync(file, 'utf8').trim();
  if (!text) return null;
  const b = parseBlock(text, JOB_MARK);
  if (b) return b.data;
  try { return JSON.parse(text); } catch { return null; }
}

const commands = {
  branch: (ctx, a) => c.branch(ctx, a._[0], a.into),
  push: (ctx, a) => c.push(ctx, a),
  open: (ctx, a) => c.open(ctx, a),
  ready: (ctx, a) => c.ready(ctx, prOf(ctx, a)),
  results: (ctx, a) => c.results(ctx, prOf(ctx, a)),
  merge: (ctx, a) => c.merge(ctx, pr(a)),
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
  related: (ctx, a) => relatedCmd(ctx, pr(a)),
  'walk open': (ctx, a) => walkOpen(ctx, a._[0]),
  'walk close': (ctx, a) => walkClose(ctx, a._[0]),
  'walk write': (ctx, a) => walkWrite(ctx, a._[0], a),
  'walk read': (ctx, a) => walkRead(ctx, a._[0], a._[1]),
  'walk text': (ctx, a) => walkText(ctx, a._[0]),
  'walk areas': (ctx) => walkAreas(ctx),
  // On GitHub's machines only (build text 1, section 5).
  'run scope': (ctx, a) => {
    const s = decideScope(ctx.root, { base: a.base, baseRef: a['base-ref'], branch: a.branch, draft: a.draft === 'true' || a.draft === true, jobBlock: readJobBlock(a['job-block']) });
    if (typeof a.out === 'string') writeFileSync(a.out, JSON.stringify(s));
    ctx.log(`scope: ${s.scope}, because ${s.why}; config from ${s.config_from}`);
    for (const m of s.modules) {
      ctx.log(`  ${m.name}: ${m.files.length} test file(s)`);
      for (const r of m.related || []) ctx.log(`    ${r.file}: ${r.reasons.join('; ')}`);
      if (m.left_out) ctx.log(`    left out: ${m.left_out.join(', ') || 'none'}`);
    }
    return 0;
  },
  'run tests': (ctx, a) => {
    if (typeof a.scope !== 'string') fail('say --scope <file>');
    if (!runTests(ctx.root, JSON.parse(readFileSync(a.scope, 'utf8')), { log: ctx.log })) fail('a module\'s tests failed');
    return 0;
  },
};

// What each command does, printed by --help (or -h) and nothing else: a help flag never acts.
export const HELP = {
  branch: 'branch <name> [--into <branch>]: makes job/<module>.<n> or work/<what> from the newest commit of the tranche branch (process.json), else of --into or the default branch, and pushes it.',
  push: 'push [--blocked <module>[,<module>] "<why>"]: pushes the current working branch to the same-named branch, never forced; with --blocked (repeated, or names joined by commas), writes the job\'s record on its pull request.',
  open: 'open --module <name> | --title "<t>" [--into-main | --into <branch>] [--branch <b>]: opens a draft pull request (from a detached checkout, name the branch with --branch); for a job writes the job block and prints its starting instructions. With one open already, prints it and its job block.',
  ready: 'ready [<pr>] [--branch <b>]: marks the pull request ready (named by number, by --branch, or the current branch\'s one open pull request), which asks for the required run.',
  results: 'results [<pr>] [--branch <b>]: prints the required run\'s state on the head commit (pull request named by number, by --branch, or the current branch), and for a failure the last lines of its output.',
  merge: 'merge <pr>: merges with a merge commit at the head commit, unless the owner holds it.',
  'release prepare': 'release prepare <version> --notes <file> [--file <built file>]...: makes an unpublished release at main\'s newest commit with the notes and files; with --development, a published pre-release with its tag.',
  'release publish': 'release publish <version> --approval "<the owner\'s words>": publishes the prepared release of that version; prints the owner\'s words back, unjudged.',
  close: 'close [<pr>] [--branch <b>] [--nothing-to-change "<why>"]: closes the pull request unmerged (named by number, by --branch, or the current branch); with the flag, first writes the job\'s record. A job starts on a detached checkout, so it names --branch <its branch> or the number.',
  'next-job': 'next-job: chooses the next job for a free slot, rewrites the round record, and prints its module, branch, work and kind; or none ready, or no free slot.',
  finished: 'finished <module>: prints finished or not finished, with the ground, worked out afresh from GitHub.',
  'latest-version': 'latest-version: prints the newest commit of the process repository\'s main (what a move to the latest version adopts), and whether it differs from the pinned one; reads only.',
  'round-done': 'round-done: prints done or not done, and each module of the round finished, open or blocked with its reason.',
  'failed-runs': 'failed-runs <pr>: prints the count of failed required runs on the pull request, not counting cancelled runs; at the third and fifth, the line for ARCH.',
  'state read': 'state read [<record>] [--repository <owner/name>]: prints one record of the shared state, or all.',
  'state write': 'state write <record> --from <file> [--create [--process]]: rewrites one record in place; --create makes the issue and its empty records once.',
  listing: 'listing <module> [--at <commit>]: writes the product at that commit (default HEAD) into a folder outside the working tree and prints the module\'s interface listing; writes nothing to GitHub.',
  notify: 'notify <pr>: for a merged pull request, prints the notice for each module whose files the merge changed, in module order, and writes each told user\'s reasons into the waiting-work record.',
  check: 'check <module> [--files <list>]: prints each disagreement of declared uses with imports and with the order (a declared use of a module not before this one), of a structured comment with its code, and of the code with a provider\'s stated interface, with file and line; exit 1 if any.',
  related: 'related <pr>: lists a told job\'s related test files, each with the rule that put it there, and the files left out, from the merged result of the pull request into its base; runs nothing.',
  'walk open': 'walk open <internal|external>: opens the walk issue, titled with the tranche, round and kind, and writes its number into the round record.',
  'walk close': 'walk close <issue>: closes the walk issue once ARCH has placed every entry.',
  'walk write': 'walk write <issue> --session <n> --from <file>: writes walking session n\'s one comment on the walk issue, rewritten in place.',
  'walk read': 'walk read <issue> [<flaw>]: prints the walk issue\'s comments, or one flaw.',
  'walk text': 'walk text <session>: prints a walking session\'s starting instructions, filled with names and addresses only.',
  'walk areas': 'walk areas: lists the round\'s candidate internal and external areas from changed modules\' step headers and requirement endings, for ARCH to choose from.',
  'run scope': 'run scope --base <sha> --base-ref <b> --branch <b> --draft <true|false> [--job-block <file>] [--out <file>]: on GitHub\'s machines only, decides the required run\'s scope; for a job branch, the file holds its job block.',
  'run tests': 'run tests --scope <file>: on GitHub\'s machines only, runs the tests in scope.',
};

// GitHub is reached only for commands that need it; `run`, `listing` and `check` read the checkout alone.
const LOCAL = new Set(['listing', 'check']);
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
// memory than node gives by default (civicsmith, 23 Nov 2026). They run with most of the machine's memory: the
// node flag that allows it, or null where the default already allows that much or the run already carries it.
const READS_CODE = new Set(['listing', 'notify', 'check']);
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

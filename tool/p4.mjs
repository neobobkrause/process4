#!/usr/bin/env node
// The Process4 tool: one program, a fresh process for each command, run from the read-only copy.
// Usage: node <copy>/tool/p4.mjs <command> [arguments]
import { readFileSync, writeFileSync } from 'node:fs';
import * as c from './lib/commands.mjs';
import { github } from './lib/github.mjs';
import { decideScope, runTests } from './lib/scope.mjs';
import { Fail, fail, parseArgs, repoRoot, repoSlug, sleep } from './lib/util.mjs';

const pr = (a) => {
  const n = Number(a._[0]);
  return Number.isInteger(n) && n > 0 ? n : fail('name the pull request by its number');
};

const commands = {
  branch: (ctx, a) => c.branch(ctx, a._[0], a.into),
  push: (ctx, a) => c.push(ctx, a),
  open: (ctx, a) => c.open(ctx, a),
  ready: (ctx, a) => c.ready(ctx, pr(a)),
  results: (ctx, a) => c.results(ctx, pr(a)),
  merge: (ctx, a) => c.merge(ctx, pr(a)),
  close: (ctx, a) => c.close(ctx, pr(a), a),
  'next-job': (ctx) => c.nextJob(ctx),
  finished: (ctx, a) => c.finishedCmd(ctx, a._[0]),
  'round-done': (ctx) => c.roundDoneCmd(ctx),
  'failed-runs': (ctx, a) => c.failedRunsCmd(ctx, pr(a)),
  'state read': (ctx, a) => c.stateRead(ctx, a._[0], a),
  'state write': (ctx, a) => c.stateWrite(ctx, a._[0], a),
  // On GitHub's machines only (build text 1, section 5).
  'run scope': (ctx, a) => {
    const s = decideScope(ctx.root, { base: a.base, baseRef: a['base-ref'], branch: a.branch, draft: a.draft === 'true' || a.draft === true });
    if (typeof a.out === 'string') writeFileSync(a.out, JSON.stringify(s));
    ctx.log(`scope: ${s.scope}, because ${s.why}; config from ${s.config_from}`);
    for (const m of s.modules) ctx.log(`  ${m.name}: ${m.files.length} test file(s)`);
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
  branch: 'branch <name> [--into <branch>]: makes job/<module>/<n> or work/<what> from the newest commit of the tranche branch (process.json), else of --into or the default branch, and pushes it.',
  push: 'push [--blocked <module>[,<module>] "<why>"]: pushes the current working branch to the same-named branch, never forced; with --blocked (repeated, or names joined by commas), writes the job\'s record on its pull request.',
  open: 'open --module <name> | --title "<t>" [--into-main | --into <branch>] [--branch <b>]: opens a draft pull request (from a detached checkout, name the branch with --branch); for a job writes the job block and prints its starting instructions. With one open already, prints it and its job block.',
  ready: 'ready <pr>: marks the pull request ready, which asks for the required run.',
  results: 'results <pr>: prints the required run\'s state on the head commit, and for a failure the last lines of its output.',
  merge: 'merge <pr>: merges with a merge commit at the head commit, unless the owner holds it.',
  close: 'close <pr> [--nothing-to-change "<why>"]: with the flag, first writes the job\'s record; then closes the pull request unmerged.',
  'next-job': 'next-job: chooses the next job for a free slot, rewrites the round record, and prints its module, branch, work and kind; or none ready, or no free slot.',
  finished: 'finished <module>: prints finished or not finished, with the ground, worked out afresh from GitHub.',
  'round-done': 'round-done: prints done or not done, and each module of the round finished, open or blocked with its reason.',
  'failed-runs': 'failed-runs <pr>: prints the count of failed required runs on the pull request, not counting cancelled runs; at the third and fifth, the line for ARCH.',
  'state read': 'state read [<record>] [--repository <owner/name>]: prints one record of the shared state, or all.',
  'state write': 'state write <record> --from <file> [--create [--process]]: rewrites one record in place; --create makes the issue and its empty records once.',
  'run scope': 'run scope --base <sha> --base-ref <b> --branch <b> --draft <true|false> [--out <file>]: on GitHub\'s machines only, decides the required run\'s scope.',
  'run tests': 'run tests --scope <file>: on GitHub\'s machines only, runs the tests in scope.',
};

// GitHub is reached only for commands that need it; `run` reads the checkout alone.
export function context(name, overrides = {}) {
  const root = overrides.root || repoRoot();
  return {
    root,
    slug: name.startsWith('run ') ? null : repoSlug(root),
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

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  process.exitCode = main(process.argv.slice(2));
}

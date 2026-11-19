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
  branch: (ctx, a) => c.branch(ctx, a._[0]),
  push: (ctx, a) => c.push(ctx, a),
  open: (ctx, a) => c.open(ctx, a),
  ready: (ctx, a) => c.ready(ctx, pr(a)),
  results: (ctx, a) => c.results(ctx, pr(a)),
  merge: (ctx, a) => c.merge(ctx, pr(a)),
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
  const a = parseArgs(argv);
  const two = a._.slice(0, 2).join(' ');
  const name = commands[two] ? two : a._[0];
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

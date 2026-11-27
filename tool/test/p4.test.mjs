import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { HELP, heapFlag, main } from '../p4.mjs';
import { requiredCheck } from '../lib/config.mjs';
import { block } from '../lib/github.mjs';
import { TEST_MARK } from '../lib/testrecord.mjs';
import { git } from '../lib/util.mjs';
import { fakeGitHub, isolated, makeRepo, productFiles, write } from './helpers.mjs';

// Any reach to GitHub, git's checkout or the clock fails the test: --help must only print.
// A pass recorded for a pull request's head, so that ready marks it.
const passFor = (gh, pr) => gh.addComment('o/product', pr.number, block(TEST_MARK, { commit: pr.head.sha, notice_seq: 0, scope: 'whole module', result: 'pass', passed: 1, failed: 0 }));

const untouchable = new Proxy({}, { get: (_, k) => () => { throw new Error(`--help reached ${String(k)}`); } });

test('every command\'s --help only prints its help, and acts on nothing', () => {
  for (const name of Object.keys(HELP)) {
    for (const flag of ['--help', '-h']) {
      const out = [];
      const code = main([...name.split(' '), 'x', flag], { root: '/nonexistent', slug: 'o/p', gh: untouchable, wait: untouchable.wait, log: (l) => out.push(l) });
      assert.equal(code, 0, name);
      assert.deepEqual(out, [HELP[name]], name);
    }
  }
  const out = [];
  assert.equal(main(['--help'], { log: (l) => out.push(l) }), 0);
  assert.equal(out.length, Object.keys(HELP).length);
});

// Tests once, in the job (24 Nov 2026): the required run is one job, still named module-tests, that runs no test,
// installs none of the product's dependencies, and only reads the test record.
test('the required run is one short job named module-tests that runs no test, only the verdict', () => {
  const wf = readFileSync(new URL('../../shims/module-tests.yml', import.meta.url), 'utf8');
  assert.match(wf, /\njobs:\n {2}module-tests:\n {4}runs-on: ubuntu-latest\n {4}timeout-minutes: 10\n/);
  assert.equal(wf.match(/^ {2}[\w-]+:\n {4}runs-on:/gm).length, 1);
  assert.match(wf, /p4\.mjs" run verdict --base "\$BASE" --base-ref "\$BASE_REF" --branch "\$HEAD_REF" --draft "\$DRAFT" --head "\$HEAD_SHA"/);
  assert.doesNotMatch(wf, /run tests|lock_files|needs:/);
  assert.match(wf, /concurrency:\n {2}group: module-tests-\$\{\{ github\.event\.pull_request\.number \}\}\n {2}cancel-in-progress: true/);
  assert.match(wf, /types: \[opened, synchronize, reopened, edited, ready_for_review, converted_to_draft\]/);
});

// Fault A: the required check's name is tool-tests on the process repo (which holds the tool),
// module-tests on a product (which does not).
test('the required check is tool-tests on the process repo, module-tests on a product', () => {
  const root = makeRepo();
  assert.equal(requiredCheck(root), 'module-tests');
  write(root, { 'tool/p4.mjs': '// tool\n' });
  assert.equal(requiredCheck(root), 'tool-tests');
});

// Fault C: ready/results/close with no number use the current branch's one open pull request.
test('ready with no number uses the current branch\'s open pull request', () => {
  const root = makeRepo(productFiles());
  git(['checkout', '-q', '-b', 'job/dates/1'], { cwd: root });
  const gh = fakeGitHub();
  const pr = gh.createPR('o/product', { head: 'job/dates/1', base: 'tranche', draft: true, title: 'x' });
  passFor(gh, pr);
  const out = [];
  const code = main(['ready'], { root, slug: 'o/product', gh, ...isolated(), log: (l) => out.push(String(l)), wait: () => {} });
  assert.equal(code, 0);
  assert.equal(gh.getPR('o/product', pr.number).draft, false);
  assert.match(out.join('\n'), new RegExp(`pull request ${pr.number} is open and ready`));
});

test('close --nothing-to-change with no number uses the current branch\'s pull request', () => {
  const root = makeRepo(productFiles());
  git(['checkout', '-q', '-b', 'job/orders/1'], { cwd: root });
  const gh = fakeGitHub();
  const pr = gh.createPR('o/product', { head: 'job/orders/1', base: 'tranche', draft: true, title: 'x' });
  const code = main(['close', '--nothing-to-change', 'nothing here'], { root, slug: 'o/product', gh, ...isolated(), log: () => {}, wait: () => {} });
  assert.equal(code, 0);
  assert.equal(gh.getPR('o/product', pr.number).state, 'closed');
});

// A job starts on a detached checkout of the tranche branch, so a told job that finds nothing
// to change names --branch (close ignored it before; the trial's invoice job hit this, 19 Nov).
test('close/ready resolve the pull request from --branch on a detached checkout', () => {
  const root = makeRepo(productFiles());
  git(['checkout', '-q', '--detach'], { cwd: root });
  assert.equal(git(['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root }), 'HEAD');
  const gh = fakeGitHub();
  const pr = gh.createPR('o/product', { head: 'job/invoice/8', base: 'tranche', draft: true, title: 'x' });
  const code = main(['close', '--branch', 'job/invoice/8', '--nothing-to-change', 'nothing here'],
    { root, slug: 'o/product', gh, ...isolated(), log: () => {}, wait: () => {} });
  assert.equal(code, 0);
  assert.equal(gh.getPR('o/product', pr.number).state, 'closed');
  // ready resolves --branch the same way.
  const pr2 = gh.createPR('o/product', { head: 'job/dates/3', base: 'tranche', draft: true, title: 'y' });
  passFor(gh, pr2);
  assert.equal(main(['ready', '--branch', 'job/dates/3'], { root, slug: 'o/product', gh, ...isolated(), log: () => {}, wait: () => {} }), 0);
  assert.equal(gh.getPR('o/product', pr2.number).draft, false);
});

test('close with neither a number nor --branch on a detached checkout fails and closes nothing', () => {
  const root = makeRepo(productFiles());
  git(['checkout', '-q', '--detach'], { cwd: root });
  const gh = fakeGitHub();
  const pr = gh.createPR('o/product', { head: 'job/invoice/8', base: 'tranche', draft: true, title: 'x' });
  const code = main(['close', '--nothing-to-change', 'x'], { root, slug: 'o/product', gh, ...isolated(), log: () => {}, wait: () => {} });
  assert.equal(code, 1);
  assert.equal(gh.getPR('o/product', pr.number).state, 'open');
});

test('the commands that read code run with most of the machine\'s memory; others, and a run that has it, do not', () => {
  const GB = 1024 ** 3;
  assert.equal(heapFlag('notify', { total: 16 * GB, limit: 8 * GB, env: {} }), '--max-old-space-size=12288');
  assert.equal(heapFlag('check', { total: 16 * GB, limit: 8 * GB, env: {} }), '--max-old-space-size=12288');
  assert.equal(heapFlag('listing', { total: 16 * GB, limit: 13 * GB, env: {} }), null);
  assert.equal(heapFlag('notify', { total: 16 * GB, limit: 8 * GB, env: { P4_HEAP: '1' } }), null);
  assert.equal(heapFlag('merge', { total: 16 * GB, limit: 1 * GB, env: {} }), null);
});

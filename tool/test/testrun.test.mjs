// Tests once, in the job: `p4 test`, `ready` by the test record, `failed-runs` from it, and the required run's verdict.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { JOB_MARK, failedRunsCmd, ready, results } from '../lib/commands.mjs';
import { block, parseBlock } from '../lib/github.mjs';
import { TEST_MARK } from '../lib/testrecord.mjs';
import { testCmd, verdict } from '../lib/testrun.mjs';
import { git } from '../lib/util.mjs';
import { main } from '../p4.mjs';
import { commit, ctxFor, fakeGitHub, makeRepo, productFiles, write } from './helpers.mjs';

const passing = "import { test } from 'node:test';\ntest('R1 holds', () => {});\n";
const failing = "import { test } from 'node:test';\nimport assert from 'node:assert';\ntest('R2 holds', () => assert.equal(1, 2));\n";
const USES = "import { d } from '../dates/index.mjs';\nexport const o = d + 1;\n";

// A product with its tranche on origin, a job's branch with one commit pushed, the session's checkout on it,
// and the job's draft pull request with its job block.
function job(files, { branch = 'job/orders/1', kind = 'ordinary', seq } = {}) {
  const root = makeRepo(productFiles());
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  git(['checkout', '-q', '-b', branch], { cwd: root });
  const gh = fakeGitHub();
  const t = ctxFor(root, gh);
  const pr = gh.createPR('o/product', { head: branch, base: 'tranche', draft: true });
  const jb = { module: 'orders', work: ['R2'], kind };
  if (seq !== undefined) jb.notice_seq = seq;
  gh.addComment('o/product', pr.number, block(JOB_MARK, jb));
  const j = { root, gh, pr, ...t };
  j.change = (f) => { pr.head.sha = commit(root, f); git(['push', '-q', 'origin', `HEAD:refs/heads/${branch}`], { cwd: root }); return pr.head.sha; };
  j.change(files);
  return j;
}
const records = (gh) => gh.s.comments.filter((c) => parseBlock(c.body, TEST_MARK));
const recordOf = (gh) => parseBlock(records(gh)[0].body, TEST_MARK).data;
const putRecord = (gh, n, data) => gh.addComment('o/product', n, block(TEST_MARK, { scope: 'whole module', why: 'w', files: [], passed: 1, failed: 0, fails_total: 0, notice_seq: 0, written: '2026-11-20T10:00Z', ...data }));

test('p4 test runs the module\'s check and tests at the head, writes a pass record, and asks the newest required run again', () => {
  const j = job({ 'src/orders/index.mjs': USES, 'test/orders/a.test.mjs': passing });
  const sha = j.pr.head.sha;
  j.gh.s.wfruns.push(
    { id: 6, name: 'module-tests', head_sha: sha, status: 'completed', conclusion: 'failure', created_at: '2026-11-20T09:00:00Z', html_url: 'W6' },
    { id: 7, name: 'module-tests', head_sha: sha, status: 'completed', conclusion: 'failure', created_at: '2026-11-20T09:30:00Z', html_url: 'W7' },
    { id: 8, name: 'other', head_sha: sha, status: 'completed', conclusion: 'failure', created_at: '2026-11-20T09:40:00Z', html_url: 'W8' });
  assert.equal(testCmd(j.ctx, j.pr.number), 0);
  assert.deepEqual(recordOf(j.gh), {
    commit: sha, notice_seq: 0, scope: 'whole module', why: 'job branch for orders; its job block says ordinary',
    files: ['test/orders/a.test.mjs'], passed: 1, failed: 0, result: 'pass', fails_total: 0, written: '2026-11-20T10:00Z',
  });
  assert.deepEqual(j.gh.s.calls.filter((c) => c[0] === 'rerun'), [['rerun', 7]]);
  const text = j.out.join('\n');
  assert.match(text, /scope: whole module[\s\S]*orders: started, check then 1 test file\(s\)[\s\S]*orders: passed; 1 passed, 0 failed \(exit 0\)/);
  assert.match(text, /asked GitHub to run module-tests again on .*W7/);
  // The temporary worktree of the merged result is gone.
  assert.equal(git(['worktree', 'list'], { cwd: j.root }).split('\n').length, 1);
});

test('p4 test records a fail, counts every fail across runs, and rewrites the one record in place', () => {
  const j = job({ 'src/orders/index.mjs': USES, 'test/orders/a.test.mjs': passing, 'test/orders/b.test.mjs': failing });
  assert.equal(testCmd(j.ctx, j.pr.number), 1);
  let r = recordOf(j.gh);
  assert.deepEqual([r.result, r.passed, r.failed, r.fails_total, r.commit], ['fail', 1, 1, 1, j.pr.head.sha]);
  assert.match(j.out.join('\n'), /orders: FAILED; 1 passed, 1 failed[\s\S]*== orders failed; the last lines of its output:[\s\S]*R2 holds/);
  assert.deepEqual(j.gh.s.calls.filter((c) => c[0] === 'rerun'), []);
  j.change({ 'test/orders/b.test.mjs': failing.replace('R2 holds', 'R2 still') });
  assert.equal(testCmd(j.ctx, j.pr.number), 1);
  assert.equal(recordOf(j.gh).fails_total, 2);
  j.change({ 'test/orders/b.test.mjs': passing });
  j.out.length = 0;
  assert.equal(testCmd(j.ctx, j.pr.number), 0);
  r = recordOf(j.gh);
  assert.deepEqual([r.result, r.passed, r.failed, r.fails_total], ['pass', 2, 0, 2]);
  assert.equal(records(j.gh).length, 1);
  assert.match(j.out.join('\n'), /no module-tests run on .* yet; the next one reads the record/);
});

test('p4 test with scope nothing writes a pass with no files', () => {
  const j = job({ 'README.md': 'more\n' }, { branch: 'work/readme' });
  assert.equal(testCmd(j.ctx, j.pr.number), 0);
  const r = recordOf(j.gh);
  assert.deepEqual([r.scope, r.files, r.result, r.passed], ['nothing', [], 'pass', 0]);
  assert.match(r.why, /no changed file/);
});

test('p4 test refuses a checkout not at the head, or with changes not committed, and a branch that does not merge', () => {
  const j = job({ 'src/orders/index.mjs': USES });
  commit(j.root, { 'src/orders/index.mjs': `${USES}// later\n` });
  assert.throws(() => testCmd(j.ctx, j.pr.number), /push first/);
  git(['reset', '-q', '--hard', 'HEAD^'], { cwd: j.root });
  write(j.root, { 'src/orders/index.mjs': 'x' });
  assert.throws(() => testCmd(j.ctx, j.pr.number), /commit first/);
  git(['checkout', '-q', '--', '.'], { cwd: j.root });
  // The tranche moves on with another change to the same file: the merge conflicts.
  git(['checkout', '-q', '--detach', 'main'], { cwd: j.root });
  const moved = commit(j.root, { 'src/orders/index.mjs': 'export const o = 9;\n' });
  git(['push', '-q', 'origin', `${moved}:refs/heads/tranche`], { cwd: j.root });
  git(['checkout', '-q', 'job/orders/1'], { cwd: j.root });
  assert.throws(() => testCmd(j.ctx, j.pr.number), /merge tranche into the branch first/);
  assert.equal(records(j.gh).length, 0);
});

test('p4 test first merges in the tranche\'s newer commits, pushes, and records the merged head', () => {
  const j = job({ 'src/orders/index.mjs': USES, 'test/orders/a.test.mjs': passing });
  const old = j.pr.head.sha;
  // Another job's merge moves the tranche on, in a file this branch does not touch.
  git(['checkout', '-q', '--detach', 'main'], { cwd: j.root });
  const moved = commit(j.root, { 'README.md': 'moved on\n' });
  git(['push', '-q', 'origin', `${moved}:refs/heads/tranche`], { cwd: j.root });
  git(['checkout', '-q', 'job/orders/1'], { cwd: j.root });
  assert.equal(testCmd(j.ctx, j.pr.number), 0);
  const head = git(['rev-parse', 'HEAD'], { cwd: j.root });
  assert.notEqual(head, old);
  // pushed as push pushes it: the merge, then the job's module's uses file written from it
  assert.equal(git(['diff', '--name-only', 'HEAD^', 'HEAD'], { cwd: j.root }), 'process/modules/orders.uses.json');
  assert.equal(git(['rev-parse', 'HEAD^^1'], { cwd: j.root }), old);
  assert.equal(git(['rev-parse', 'HEAD^^2'], { cwd: j.root }), moved);
  assert.equal(git(['ls-remote', 'origin', 'refs/heads/job/orders/1'], { cwd: j.root }).split('\t')[0], head);
  const r = recordOf(j.gh);
  assert.deepEqual([r.commit, r.result], [head, 'pass']);
  assert.match(j.out.join('\n'), /lacked tranche's newest commit .*: merged it in and pushed/);
  // Up to date now: a second run merges nothing.
  j.pr.head.sha = head;
  j.out.length = 0;
  assert.equal(testCmd(j.ctx, j.pr.number), 0);
  assert.equal(git(['rev-parse', 'HEAD'], { cwd: j.root }), head);
  assert.doesNotMatch(j.out.join('\n'), /merged it in/);
});

test('ready marks ready where the record stands for the head, and refuses where there is none', () => {
  const j = job({ 'src/orders/index.mjs': USES });
  assert.throws(() => ready(j.ctx, j.pr.number), /not marked ready: no test record; run p4 test/);
  assert.equal(j.pr.draft, true);
  putRecord(j.gh, j.pr.number, { commit: j.pr.head.sha, result: 'pass' });
  assert.equal(ready(j.ctx, j.pr.number), 0);
  assert.equal(j.pr.draft, false);
  assert.match(j.out.join('\n'), /pass recorded for [\s\S]*ready; the required run module-tests has been asked for/);
});

test('ready refuses a record made before the newest notice, and a stale or failed one', () => {
  const j = job({ 'src/orders/index.mjs': USES }, { seq: 2 });
  putRecord(j.gh, j.pr.number, { commit: j.pr.head.sha, result: 'pass', notice_seq: 1 });
  assert.throws(() => ready(j.ctx, j.pr.number), /a notice reached the job after its tests ran/);
  assert.equal(j.pr.draft, true);
  const k = job({ 'src/orders/index.mjs': USES });
  putRecord(k.gh, k.pr.number, { commit: 'a'.repeat(40), result: 'pass' });
  assert.throws(() => ready(k.ctx, k.pr.number), /not the head/);
});

test('ready marks ready with no record where the scope is nothing and no notice reached the job', () => {
  const j = job({ 'README.md': 'more\n' }, { branch: 'work/readme' });
  assert.equal(ready(j.ctx, j.pr.number), 0);
  assert.equal(j.pr.draft, false);
  assert.match(j.out.join('\n'), /no test record needed: scope nothing, because no changed file/);
  // A job whose own change touches no module file, but a notice has reached it: it needs a record.
  const k = job({ 'README.md': 'more\n' }, { seq: 1 });
  assert.throws(() => ready(k.ctx, k.pr.number), /scope nothing, but 1 notice\(s\) reached the job/);
});

test('ready judges a told job as the verdict does: it needs its record even where its related list would be empty', () => {
  const j = job({ 'src/orders/index.mjs': USES }, { kind: 'told' });
  assert.throws(() => ready(j.ctx, j.pr.number), /not marked ready: no test record[\s\S]*told job of orders/);
});

test('in the process repository, ready keeps marking a pull request into main ready, with no record and no merge', () => {
  const root = makeRepo({ 'tool/p4.mjs': '// tool\n' });
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(root, gh);
  gh.createPR('o/process4', { head: 'work/x', base: 'main', draft: true });
  assert.equal(ready(ctx, 1), 0);
  assert.equal(gh.getPR('o/process4', 1).draft, false);
  assert.match(out.join('\n'), /scope nothing, because the pull request is into the main branch[\s\S]*the required run tool-tests/);
});

test('failed-runs reads fails_total from the test record and speaks at the third and fifth', () => {
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(makeRepo(), gh);
  const pr = gh.createPR('o/product', { head: 'job/dates.1', base: 'tranche', draft: false });
  failedRunsCmd(ctx, pr.number);
  assert.deepEqual(out, [`0 failed test run(s) on pull request ${pr.number}, from its test record (none written yet)`]);
  putRecord(gh, pr.number, { commit: 'c'.repeat(40), result: 'fail', fails_total: 3 });
  out.length = 0; failedRunsCmd(ctx, pr.number);
  assert.match(out[0], /^3 failed test run\(s\) .*the last: fail at cccccccccc/);
  assert.match(out[1], /replace its session with a fresh one/);
  records(gh)[0].body = block(TEST_MARK, { ...recordOf(gh), fails_total: 5 });
  out.length = 0; failedRunsCmd(ctx, pr.number);
  assert.match(out.join('\n'), /^5 failed[\s\S]*record dates blocked/);
});

test('results prints the test record\'s standing first, then the required run', () => {
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(makeRepo(), gh);
  const pr = gh.createPR('o/product', { head: 'job/orders/1', base: 'tranche', draft: false });
  results(ctx, 1);
  assert.deepEqual(out, ['test record: does not stand: no test record; run p4 test', `waiting: module-tests on ${pr.head.sha.slice(0, 10)} has not started`]);
  putRecord(gh, 1, { commit: pr.head.sha, result: 'pass', passed: 4 });
  out.length = 0; results(ctx, 1);
  assert.match(out[0], /^test record: stands: pass recorded/);
  assert.match(out[1], /pass at hhhhhhhhhh: 4 passed, 0 failed, scope whole module/);
});

test('results says no test record is needed where the scope is nothing', () => {
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(makeRepo(), gh);
  gh.createPR('o/product', { head: 'work/tranche-end', base: 'main', draft: false });
  results(ctx, 1);
  assert.match(out[0], /^test record: none needed: scope nothing, because the pull request is into the main branch/);
});

// GitHub's merge of a branch into the tranche, checked out, as the required run sees it.
function merged(files, { branch = 'job/orders/1' } = {}) {
  const root = makeRepo(productFiles());
  const base = git(['rev-parse', 'HEAD'], { cwd: root });
  git(['checkout', '-q', '-b', branch], { cwd: root });
  const head = commit(root, files);
  git(['checkout', '-q', '--detach', base], { cwd: root });
  git(['merge', '-q', '--no-ff', '--no-edit', branch], { cwd: root });
  return { root, base, head, branch };
}
const opts = (m, over = {}) => ({ base: m.base, baseRef: 'tranche', branch: m.branch, draft: false, head: m.head, jobBlock: null, record: null, log: () => {}, summary: null, ...over });

test('the verdict passes at once where the scope is nothing: into main, a draft, no module file changed', () => {
  const m = merged({ 'README.md': 'y' }, { branch: 'work/readme' });
  assert.equal(verdict(m.root, opts(m)), 0);
  const j = merged({ 'src/orders/index.mjs': USES });
  assert.equal(verdict(j.root, opts(j, { draft: true })), 0);
  assert.equal(verdict(j.root, opts(j, { baseRef: 'main' })), 0);
});

test('the verdict needs a record where a notice reached the job, as ready does, even with no module file changed; a draft passes at once', () => {
  const m = merged({ 'README.md': 'y' });
  const jobBlock = { module: 'orders', kind: 'ordinary', notice_seq: 1 };
  assert.throws(() => verdict(m.root, opts(m, { jobBlock })), new RegExp(`no pass recorded for ${m.head}; run p4 test`));
  assert.equal(verdict(m.root, opts(m, { jobBlock, draft: true })), 0);
  const rec = { commit: m.head, notice_seq: 1, scope: 'nothing', why: 'w', files: [], passed: 0, failed: 0, result: 'pass', fails_total: 0, written: 'x' };
  assert.equal(verdict(m.root, opts(m, { jobBlock, record: rec })), 0);
});

test('the verdict passes where the record stands for the head, and fails where it is missing, stale or behind a notice', () => {
  const m = merged({ 'src/orders/index.mjs': USES });
  const summary = join(mkdtempSync(join(tmpdir(), 'p4-sum-')), 'summary.md');
  assert.throws(() => verdict(m.root, opts(m, { summary })), new RegExp(`no pass recorded for ${m.head}; run p4 test`));
  assert.match(readFileSync(summary, 'utf8'), /Scope: \*\*whole module\*\*[\s\S]*Failed: no pass recorded/);
  const rec = { commit: m.head, notice_seq: 0, scope: 'whole module', why: 'w', files: [], passed: 3, failed: 0, result: 'pass', fails_total: 1, written: 'x' };
  assert.equal(verdict(m.root, opts(m, { record: rec })), 0);
  assert.throws(() => verdict(m.root, opts(m, { record: { ...rec, commit: 'b'.repeat(40) } })), /not the head/);
  assert.throws(() => verdict(m.root, opts(m, { record: { ...rec, result: 'fail', failed: 1 } })), /is a fail/);
  assert.throws(() => verdict(m.root, opts(m, { record: rec, jobBlock: { module: 'orders', kind: 'ordinary', notice_seq: 1 } })), /a notice reached the job/);
  // A told job is judged as needing its record: the verdict makes no related list.
  assert.throws(() => verdict(m.root, opts(m, { jobBlock: { module: 'orders', kind: 'told', uses: [] } })), /no pass recorded/);
});

test('run verdict reads the job block and the test record from the files the workflow wrote', () => {
  const m = merged({ 'src/orders/index.mjs': USES });
  const dir = mkdtempSync(join(tmpdir(), 'p4-verdict-'));
  const jb = join(dir, 'job-block.txt');
  const tr = join(dir, 'test-record.txt');
  writeFileSync(jb, block(JOB_MARK, { module: 'orders', kind: 'ordinary' }));
  writeFileSync(tr, '');
  const args = ['run', 'verdict', '--base', m.base, '--base-ref', 'tranche', '--branch', m.branch, '--draft', 'false', '--head', m.head, '--job-block', jb, '--test-record', tr];
  const out = [];
  assert.equal(main(args, { root: m.root, log: (l) => out.push(String(l)) }), 1);
  writeFileSync(tr, block(TEST_MARK, { commit: m.head, notice_seq: 0, scope: 'whole module', why: 'w', files: [], passed: 1, failed: 0, result: 'pass', fails_total: 0, written: 'x' }));
  out.length = 0;
  assert.equal(main(args, { root: m.root, log: (l) => out.push(String(l)) }), 0);
  assert.match(out.join('\n'), /Passed: pass recorded for/);
});

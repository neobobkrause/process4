import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { JOB_MARK, RECORD_MARK, branch, latestVersion, merge, open, push, ready, results, stateWrite } from '../lib/commands.mjs';
import { block, parseBlock } from '../lib/github.mjs';
import { writeNotice } from '../lib/noticecomments.mjs';
import { mark } from '../lib/state.mjs';
import { TEST_MARK } from '../lib/testrecord.mjs';
import { MEANING_MARK } from '../lib/round.mjs';
import { git } from '../lib/util.mjs';
import { commit, config, ctxFor, fakeGitHub, makeRepo, productFiles, write } from './helpers.mjs';

function product() {
  const root = makeRepo(productFiles());
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  return root;
}
const remote = (root, b) => git(['ls-remote', '--heads', 'origin', `refs/heads/${b}`], { cwd: root }).split(/\s/)[0];

test('branch makes a job branch from the tranche with one empty commit, without moving the checkout', () => {
  const root = product();
  const { ctx, out } = ctxFor(root, fakeGitHub());
  const before = git(['rev-parse', 'HEAD'], { cwd: root });
  assert.equal(branch(ctx, 'job/orders/1'), 0);
  const tip = remote(root, 'job/orders/1');
  assert.equal(git(['rev-parse', `${tip}^`], { cwd: root }), remote(root, 'tranche'));
  assert.equal(git(['diff', '--name-only', `${tip}^`, tip], { cwd: root }), '');
  assert.equal(git(['rev-parse', 'HEAD'], { cwd: root }), before);
  assert.equal(git(['branch', '--show-current'], { cwd: root }), 'main');
  branch(ctx, 'job/orders/1');
  assert.match(out.join('\n'), /exists already/);
  assert.throws(() => branch(ctx, 'tranche'), /job\/<module>\.<n> or work\/<what>/);
});

test('without a process config, branch starts from the repository\'s default branch', () => {
  const root = makeRepo();
  const { ctx } = ctxFor(root, fakeGitHub());
  branch(ctx, 'work/first-content');
  assert.equal(git(['rev-parse', `${remote(root, 'work/first-content')}^`], { cwd: root }), remote(root, 'main'));
});

test('push sends the current branch, never forced, and refuses the tranche and main', () => {
  const root = product();
  const { ctx } = ctxFor(root, fakeGitHub());
  assert.throws(() => push(ctx, { _: [] }), /not a working branch/);
  git(['checkout', '-q', '-b', 'job/orders/1'], { cwd: root });
  const sha = commit(root, { 'src/orders/index.mjs': 'export const o = 2;\n' });
  assert.equal(push(ctx, { _: [] }), 0);
  assert.equal(remote(root, 'job/orders/1'), sha);
  // Someone else's commit now stands there: the push is refused, never forced.
  const other = git(['commit-tree', 'HEAD^{tree}', '-p', 'main', '-m', 'other'], { cwd: root });
  git(['push', '-q', '--force', 'origin', `${other}:refs/heads/job/orders/1`], { cwd: root });
  assert.throws(() => push(ctx, { _: [] }), /git push failed/);
  assert.equal(remote(root, 'job/orders/1'), other);
});

test('push keeps to six a minute', () => {
  const root = product();
  const { ctx, out } = ctxFor(root, fakeGitHub());
  git(['checkout', '-q', '-b', 'work/x'], { cwd: root });
  for (let i = 0; i < 7; i++) push(ctx, { _: [] });
  assert.equal(out.filter((l) => l.startsWith('(waited')).length, 1);
});

test('push --blocked writes the job\'s record on its pull request, rewritten in place', () => {
  const root = product();
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  git(['checkout', '-q', '-b', 'job/orders/1'], { cwd: root });
  gh.createPR('o/product', { head: 'job/orders/1', base: 'tranche', draft: true });
  push(ctx, { _: ['dates refuses a leap day'], blocked: 'dates' });
  push(ctx, { _: ['dates refuses any day'], blocked: 'dates' });
  const recs = gh.s.comments.map((c) => parseBlock(c.body, RECORD_MARK)).filter(Boolean);
  assert.deepEqual(recs.map((r) => r.data), [{ blocked: { by: 'dates', why: 'dates refuses any day' } }]);
  assert.throws(() => push(ctx, { _: [], blocked: true }), /--blocked <module>/);
});

test('push --meaning declares a change of meaning in the pull request\'s meaning comment; a later line for the item takes its place', () => {
  const root = product();
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(root, gh);
  git(['checkout', '-q', '-b', 'job/orders/1'], { cwd: root });
  gh.createPR('o/product', { head: 'job/orders/1', base: 'tranche', draft: true });
  push(ctx, { _: ['the whole stay; one night', 'a day; a day and a time'], meaning: ['total', 'parseDay'] });
  assert.match(out.join('\n'), /declared on pull request 1: a change of meaning of total \(the whole stay; one night\)/);
  push(ctx, { _: ['dates refuses a leap day', 'the whole stay; two nights'], blocked: 'dates', meaning: 'total' });
  const meaning = gh.s.comments.map((c) => parseBlock(c.body, MEANING_MARK)).filter(Boolean);
  assert.deepEqual(meaning.map((r) => r.data), [{ meaning: [{ item: 'parseDay', line: 'a day; a day and a time' }, { item: 'total', line: 'the whole stay; two nights' }] }]);
  const recs = gh.s.comments.map((c) => parseBlock(c.body, RECORD_MARK)).filter(Boolean);
  assert.deepEqual(recs.map((r) => r.data), [{ blocked: { by: 'dates', why: 'dates refuses a leap day' } }]);
  assert.throws(() => push(ctx, { _: [], meaning: 'total' }), /say --meaning <item> "<what it was; what it is now>"/);
  assert.throws(() => push(ctx, { _: ['x'], meaning: true }), /say --meaning/);
});

test('open --module writes the job block from the requirements and waiting work, and prints the job text', () => {
  const root = product();
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(root, gh);
  const f = join(root, 'ww.json');
  writeFileSync(f, JSON.stringify({ work: [
    { module: 'orders', kind: 'walk-flaw', flaw: 't1-1-I-1-1', link: 'L' },
    { module: 'dates', kind: 'job-flaw', from: 'orders', words: 'a leap day is refused' }] }));
  stateWrite(ctx, 'waiting-work', { _: [], create: true, from: f });
  branch(ctx, 'job/orders/1');
  assert.equal(open(ctx, { _: [], module: 'orders' }), 0);
  const pr = gh.s.prs[0];
  assert.deepEqual([pr.head.ref, pr.base.ref, pr.draft], ['job/orders/1', 'tranche', true]);
  const job = gh.s.comments.map((c) => parseBlock(c.body, JOB_MARK)).find(Boolean).data;
  assert.deepEqual(job, { module: 'orders', work: ['R2', 'walk flaw t1-1-I-1-1 L'], kind: 'ordinary' });
  const ww = parseBlock(gh.s.comments.find((c) => c.body.includes(mark('waiting-work'))).body, mark('waiting-work')).data;
  assert.deepEqual(ww.work.map((w) => w.module), ['dates']);
  const text = out.join('\n');
  assert.match(text, /You are the job for the module orders of o\/product\. Your branch is job\/orders\/1; your pull request is https:\/\/gh\/pr\//);
  assert.match(text, /First command, the fetch line: C=a{40};/);
  assert.doesNotMatch(text, /<fetch line>|<module>|<branch>|<pull request>/);
  // A job reads its block with the same command.
  out.length = 0;
  git(['checkout', '-q', '-b', 'job/orders/1'], { cwd: root });
  open(ctx, { _: [] });
  assert.equal(gh.s.prs.length, 1);
  assert.match(out.join('\n'), /job block:[\s\S]*"walk flaw t1-1-I-1-1 L"/);
});

test('open --module copies the module\'s meaning entries from waiting work into the job block\'s meaning', () => {
  const root = product();
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  const f = join(root, 'ww.json');
  writeFileSync(f, JSON.stringify({ work: [{ module: 'orders', kind: 'meaning', item: 'total', line: 'the whole stay; one night' },
    { module: 'dates', kind: 'meaning', item: 'parseDay', line: 'a day; a day and a time' }] }));
  stateWrite(ctx, 'waiting-work', { _: [], create: true, from: f });
  branch(ctx, 'job/orders/1');
  assert.equal(open(ctx, { _: [], module: 'orders' }), 0);
  const job = gh.s.comments.map((c) => parseBlock(c.body, JOB_MARK)).find(Boolean).data;
  assert.deepEqual(job.meaning, [{ item: 'total', line: 'the whole stay; one night' }]);
  assert.ok(job.work.includes('change of meaning of total: the whole stay; one night'));
  const ww = parseBlock(gh.s.comments.find((c) => c.body.includes(mark('waiting-work'))).body, mark('waiting-work')).data;
  assert.deepEqual(ww.work.map((w) => w.module), ['dates']);
});

test('a job whose only work is notices is told; with other work it is ordinary and keeps the uses', () => {
  const root = makeRepo({ ...productFiles(), 'process/modules/orders.md': '- **R1** [met] one\n' });
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  const f = join(root, 'ww.json');
  writeFileSync(f, JSON.stringify({ work: [{ module: 'orders', kind: 'notice', from: 'dates', merged: 7, uses: [{ module: 'dates', entry: 'd' }] }] }));
  stateWrite(ctx, 'waiting-work', { _: [], create: true, from: f });
  branch(ctx, 'job/orders/1');
  open(ctx, { _: [], module: 'orders' });
  const job = gh.s.comments.map((c) => parseBlock(c.body, JOB_MARK)).find(Boolean).data;
  assert.equal(job.kind, 'told');
  assert.deepEqual(job.uses, [{ module: 'dates', entry: 'd' }]);
});

test('open --module copies each waiting notice\'s reasons for its module from the notice comments on the merged pull request', () => {
  // The owner's decision B of 25 Nov 2026: the waiting-work entry names the notice; its reasons are on the merged pull request.
  const root = makeRepo({ ...productFiles(), 'process/modules/orders.md': '- **R1** [met] one\n' });
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  const day = { module: 'dates', entry: 'Day', changes: ['bound changed'], lines: ['src/orders/index.mjs:6'], through: null };
  const big = Array.from({ length: 30 }, (_, i) => ({ ...day, entry: `e${i}`, before: { handsBack: 'x'.repeat(3000) }, after: { handsBack: 'y'.repeat(3000) } }));
  writeNotice(gh, 'o/product', 7, 'dates', [['report', [day]], ['orders', big]]);
  writeNotice(gh, 'o/product', 9, 'dates', [['orders', [day]]]);
  assert.ok(gh.s.comments.filter((c) => c.on === 7).length > 1);
  const f = join(root, 'ww.json');
  writeFileSync(f, JSON.stringify({ work: [
    { module: 'orders', kind: 'notice', from: 'dates', merged: 7 },
    { module: 'orders', kind: 'notice', from: 'dates', merged: 8, uses: [{ module: 'dates', entry: 'old' }] },
    { module: 'orders', kind: 'notice', from: 'dates', merged: 9 },
    { module: 'report', kind: 'notice', from: 'dates', merged: 7 },
  ] }));
  stateWrite(ctx, 'waiting-work', { _: [], create: true, from: f });
  branch(ctx, 'job/orders/1');
  open(ctx, { _: [], module: 'orders' });
  const job = gh.s.comments.map((c) => parseBlock(c.body, JOB_MARK)).find(Boolean).data;
  assert.equal(job.kind, 'told');
  assert.deepEqual(job.work, ['notice from dates (pull request 7)', 'notice from dates (pull request 8)', 'notice from dates (pull request 9)']);
  // Every part's reasons of this module, in order; an older entry that carries its reasons, as is; not another module's.
  assert.deepEqual(job.uses, [...big, { module: 'dates', entry: 'old' }, day]);
  // The notices it carries, so a re-run of notify skips it whatever its state (no repeats).
  assert.deepEqual(job.notices, [{ from: 'dates', merged: 7 }, { from: 'dates', merged: 8 }, { from: 'dates', merged: 9 }]);
  const waiting = parseBlock(gh.s.comments.find((c) => c.body.includes(mark('waiting-work'))).body, mark('waiting-work')).data.work;
  assert.deepEqual(waiting.map((w) => w.module), ['report']);
});

test('open --module of a waiting notice with no reasons on its pull request fails plainly and opens nothing', () => {
  const root = makeRepo({ ...productFiles(), 'process/modules/orders.md': '- **R1** [met] one\n' });
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  const f = join(root, 'ww.json');
  writeFileSync(f, JSON.stringify({ work: [{ module: 'orders', kind: 'notice', from: 'dates', merged: 7 }] }));
  stateWrite(ctx, 'waiting-work', { _: [], create: true, from: f });
  branch(ctx, 'job/orders/1');
  assert.throws(() => open(ctx, { _: [], module: 'orders' }), /the notice from dates \(pull request 7\) has no reasons for orders on its pull request; run notify 7 again, then open/);
  assert.equal(gh.s.prs.length, 0);
});

test('open --title opens a draft into the tranche, or into main with --into-main', () => {
  const root = product();
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  git(['checkout', '-q', '-b', 'work/reqs'], { cwd: root });
  open(ctx, { _: [], title: 'Requirement text' });
  git(['checkout', '-q', '-b', 'work/tranche-end'], { cwd: root });
  open(ctx, { _: [], title: 'Tranche 1', 'into-main': true });
  assert.deepEqual(gh.s.prs.map((p) => [p.head.ref, p.base.ref, p.draft]), [['work/reqs', 'tranche', true], ['work/tranche-end', 'main', true]]);
  assert.throws(() => open(ctx, { _: [], module: 'orders' }), /no branch job\/orders/);
});

// A pass recorded for a pull request's head (tests once, in the job), so that ready marks it.
const passFor = (gh, pr) => gh.addComment('o/product', pr.number, block(TEST_MARK, { commit: pr.head.sha, notice_seq: 0, scope: 'whole module', result: 'pass', passed: 1, failed: 0 }));

test('ready marks ready and reads it back', () => {
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(makeRepo(), gh);
  passFor(gh, gh.createPR('o/product', { head: 'work/x', base: 'tranche', draft: true }));
  ready(ctx, 1);
  assert.match(out.join('\n'), /ready; the required run module-tests has been asked for/);
  const stuck = fakeGitHub({ markReady: () => {} });
  passFor(stuck, stuck.createPR('o/product', { head: 'work/x', base: 'tranche', draft: true }));
  assert.throws(() => ready(ctxFor(makeRepo(), stuck).ctx, 1), /still a draft/);
});

test('ready says plainly where there is nothing to mark: already ready, merged or closed', () => {
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(makeRepo(), gh);
  gh.createPR('o/product', { head: 'work/a', base: 'tranche', draft: false });
  const merged = gh.createPR('o/product', { head: 'work/b', base: 'tranche', draft: false });
  merged.state = 'closed'; merged.merged_at = '2026-11-25T02:40:00Z';
  const closed = gh.createPR('o/product', { head: 'work/c', base: 'tranche', draft: true });
  closed.state = 'closed';
  assert.equal(ready(ctx, 1), 0);
  assert.equal(ready(ctx, 2), 0);
  assert.equal(ready(ctx, 3), 0);
  const text = out.join('\n');
  assert.match(text, /pull request 1 is ready already; nothing marked/);
  assert.match(text, /pull request 2 is merged; there is nothing to mark ready/);
  assert.match(text, /pull request 3 is closed; there is nothing to mark ready/);
});

test('results reads the required run on the head commit', () => {
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(makeRepo(), gh);
  const pr = gh.createPR('o/product', { head: 'job/orders/1', base: 'tranche', draft: false });
  results(ctx, 1);
  gh.s.runs.push({ id: 1, sha: pr.head.sha, name: 'module-tests', status: 'completed', conclusion: 'failure', started_at: '1', html_url: 'R1' });
  gh.s.runs.push({ id: 2, sha: pr.head.sha, name: 'module-tests', status: 'completed', conclusion: 'success', started_at: '2', html_url: 'R2' });
  results(ctx, 1);
  gh.s.runs.push({ id: 3, sha: pr.head.sha, name: 'module-tests', status: 'completed', conclusion: 'failure', started_at: '3', html_url: 'R3' });
  gh.s.logs[3] = 'line 1\nnot ok 1 - orders refuses 1000\n';
  results(ctx, 1);
  assert.deepEqual(out.filter((l) => !l.startsWith('test record:')).map((l) => l.split(':')[0]), ['waiting', 'passed', 'failed (failure)', 'line 1\nnot ok 1 - orders refuses 1000']);
});

test('merge obeys the owner\'s hold, waits a minute after the last merge, and merges at the head commit', () => {
  const root = product();
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(root, gh);
  const pr = gh.createPR('o/product', { head: 'job/orders/1', base: 'tranche', draft: false });
  const f = join(root, 'n.json');
  writeFileSync(f, JSON.stringify({ notes: [{ kind: 'held-merge', pull_request: 1, written: '2026-11-20T09:00Z', words: 'Instruction: hold orders' }] }));
  stateWrite(ctx, 'standing-notes', { _: [], create: true, from: f });
  assert.equal(merge(ctx, 1), 0);
  assert.deepEqual(gh.s.calls.filter((c) => c[0] === 'merge'), []);
  assert.match(out.join('\n'), /held: the owner holds pull request 1/);
  writeFileSync(f, JSON.stringify({ notes: [{ kind: 'held-merge', pull_request: 1, written: '2026-11-20T09:00Z', ended: 'approved' }] }));
  stateWrite(ctx, 'standing-notes', { _: [], from: f });
  gh.s.prs.push({ number: 50, state: 'closed', merged_at: '2026-11-20T09:59:30Z', head: { ref: 'job/dates/1' }, base: { ref: 'tranche' } });
  assert.equal(merge(ctx, 1), 0);
  assert.deepEqual(gh.s.calls.filter((c) => c[0] === 'merge'), [['merge', 1, pr.head.sha]]);
  assert.match(out.join('\n'), /waiting 30 s since the last merge[\s\S]*merged pull request 1 into tranche/);
});

// The owner's decision of 24 Nov 2026, item 3: a job merges once no job is open among the modules it uses.
function usingProduct() {
  const mod = (name, uses = []) => ({ name, files: [`src/${name}/`], tests: [`test/${name}/`], uses });
  const root = makeRepo({
    'process.json': config(),
    'package.json': { name: 'shop', type: 'module', exports: { '.': './src/orders/index.mjs', './tax': './src/tax/index.mjs' } },
    'process/modules/order.txt': 'base\ntax\ndates\npricing\norders\nlate\n',
    'process/modules/base.json': mod('base'),
    'process/modules/tax.json': mod('tax'),
    'process/modules/dates.json': mod('dates'),
    'process/modules/pricing.json': mod('pricing', ['dates']),
    'process/modules/orders.json': mod('orders'),
    'process/modules/late.json': mod('late'),
    'src/base/index.mjs': 'export const b = 1;\n',
    'src/base/legacy.cjs': 'module.exports = 1;\n',
    'src/tax/index.mjs': 'export const t = 1;\n',
    'src/dates/index.mjs': 'export const d = 1;\n',
    // pricing imports nothing; its uses file names dates (a use the import scan cannot see, such as a file read by path)
    'src/pricing/index.mjs': 'export const p = 1;\n',
    'process/modules/pricing.uses.json': { module: 'pricing', providers: ['dates'], outside: [], orderFaults: [], copies: [],
      uses: [{ provider: 'dates', item: 'd', itemKind: 'value', type: 'read', route: 'direct', standard: true, where: [{ file: 'src/pricing/index.mjs', side: 'code', line: 1 }] }] },
    // orders: pricing by import, base by require, tax by the product's own package name in a test, late (later) by import
    'src/orders/index.mjs': "import { p } from '../pricing/index.mjs';\nimport { l } from '../late/index.mjs';\nexport const o = p + l;\n",
    'src/orders/old.mjs': "import { createRequire } from 'node:module';\nconst require = createRequire(import.meta.url);\nexport const x = require('../base/legacy.cjs');\n",
    'test/orders/a.test.mjs': "import { t } from 'shop/tax';\nt;\n",
    'src/late/index.mjs': 'export const l = 1;\n',
  });
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  return root;
}

test('merge of a job waits for an open job of each earlier module it uses: by its uses file, by import where it has none yet, and through others', () => {
  const root = usingProduct();
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(root, gh);
  const jobs = Object.fromEntries(['base', 'tax', 'dates', 'pricing', 'late', 'orders'].map((m) => [m, gh.createPR('o/product', { head: `job/${m}.1`, base: 'tranche', draft: false })]));
  const n = jobs.orders.number;
  assert.equal(merge(ctx, n), 0);
  assert.deepEqual(out.filter((l) => l.startsWith('waits for')), [
    `waits for base (pull request ${jobs.base.number})`, `waits for tax (pull request ${jobs.tax.number})`,
    `waits for dates (pull request ${jobs.dates.number})`, `waits for pricing (pull request ${jobs.pricing.number})`]);
  assert.match(out.at(-1), new RegExp(`pull request ${n} not merged`));
  assert.deepEqual(gh.s.calls.filter((c) => c[0] === 'merge'), []);
  // A blocked job holds no one; dates still holds it, through pricing's uses file.
  gh.addComment('o/product', jobs.pricing.number, block(RECORD_MARK, { blocked: { by: 'dates', why: 'dates refuses a leap day' } }));
  out.length = 0;
  merge(ctx, n);
  assert.deepEqual(out.filter((l) => l.startsWith('waits for')).map((l) => l.split(' ')[2]), ['base', 'tax', 'dates']);
  // Once those have merged or closed, it merges: late is later in the order and holds no one.
  for (const m of ['base', 'tax', 'dates']) jobs[m].state = 'closed';
  out.length = 0;
  assert.equal(merge(ctx, n), 0);
  assert.deepEqual(gh.s.calls.filter((c) => c[0] === 'merge'), [['merge', n, jobs.orders.head.sha]]);
  assert.match(out.join('\n'), new RegExp(`merged pull request ${n} into tranche`));
});

test('merge of a job waits for a module its head newly imports, though the tranche does not show the use', () => {
  const root = usingProduct();
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(root, gh);
  // The job's branch adds an import of dates to late, on its head commit only.
  git(['checkout', '-q', '-b', 'job/late.1'], { cwd: root });
  commit(root, { 'src/late/index.mjs': "import { d } from '../dates/index.mjs';\nexport const l = d;\n" });
  git(['push', '-q', 'origin', 'job/late.1'], { cwd: root });
  git(['checkout', '-q', 'main'], { cwd: root });
  const dates = gh.createPR('o/product', { head: 'job/dates.1', base: 'tranche', draft: false });
  const late = gh.createPR('o/product', { head: 'job/late.1', base: 'tranche', draft: false });
  assert.equal(merge(ctx, late.number), 0);
  assert.deepEqual(out.filter((l) => l.startsWith('waits for')), [`waits for dates (pull request ${dates.number})`]);
  assert.deepEqual(gh.s.calls.filter((c) => c[0] === 'merge'), []);
});

test('merge of a job refuses when a notice reached it after its tests ran', () => {
  const root = product();
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  const pr = gh.createPR('o/product', { head: 'job/orders.1', base: 'tranche', draft: false });
  gh.addComment('o/product', pr.number, block(JOB_MARK, { module: 'orders', work: ['R2', 'notice from dates (pull request 4)'], kind: 'ordinary', notice_seq: 1, notices: [{ from: 'dates', merged: 4 }] }));
  const rec = gh.addComment('o/product', pr.number, block(TEST_MARK, { commit: pr.head.sha, notice_seq: 0, result: 'pass' }));
  assert.throws(() => merge(ctx, pr.number), /a notice reached orders's job after its tests ran; it must run p4 test again/);
  assert.deepEqual(gh.s.calls.filter((c) => c[0] === 'merge'), []);
  gh.editComment('o/product', rec.id, block(TEST_MARK, { commit: pr.head.sha, notice_seq: 1, result: 'pass' }));
  assert.equal(merge(ctx, pr.number), 0);
  assert.deepEqual(gh.s.calls.filter((c) => c[0] === 'merge'), [['merge', pr.number, pr.head.sha]]);
});

test('merge prints GitHub\'s refusal', () => {
  const gh = fakeGitHub({ mergePR: () => ({ message: 'Required status check "module-tests" is expected.' }) });
  const { ctx } = ctxFor(product(), gh);
  gh.createPR('o/product', { head: 'job/orders/1', base: 'tranche', draft: false });
  assert.throws(() => merge(ctx, 1), /Required status check "module-tests" is expected/);
});

test('with no process.json, branch and open take --into, so a first pull request needs no config written first', () => {
  const root = makeRepo();
  git(['push', '-q', 'origin', 'main:refs/heads/p4-tranche'], { cwd: root });
  commit(root, { 'x.txt': 'later on main\n' });
  git(['push', '-q', 'origin', 'main'], { cwd: root });
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  branch(ctx, 'work/first-content', 'p4-tranche');
  assert.equal(git(['rev-parse', `${remote(root, 'work/first-content')}^`], { cwd: root }), remote(root, 'p4-tranche'));
  git(['checkout', '-q', '-b', 'work/first-content'], { cwd: root });
  open(ctx, { _: [], title: 'First content', into: 'p4-tranche' });
  assert.equal(gh.s.prs[0].base.ref, 'p4-tranche');
  assert.throws(() => branch(ctx, 'work/y', true), /--into <branch>/);
});

test('results passes over a run cancelled by a newer one', () => {
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(makeRepo(), gh);
  const pr = gh.createPR('o/product', { head: 'job/orders/1', base: 'tranche', draft: false });
  gh.s.runs.push({ id: 1, sha: pr.head.sha, name: 'module-tests', status: 'completed', conclusion: 'success', started_at: '1', html_url: 'R1' });
  gh.s.runs.push({ id: 2, sha: pr.head.sha, name: 'module-tests', status: 'completed', conclusion: 'cancelled', started_at: '2', html_url: 'R2' });
  results(ctx, 1);
  assert.match(out.join('\n'), /^test record: does not stand: no test record; run p4 test\npassed: .*R1$/);
});

test('results says waiting, not failed, when the only run on the head was cancelled by the newer one (fault k)', () => {
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(makeRepo(), gh);
  const pr = gh.createPR('o/product', { head: 'job/orders/1', base: 'tranche', draft: false });
  gh.s.runs.push({ id: 2, sha: pr.head.sha, name: 'module-tests', status: 'completed', conclusion: 'cancelled', started_at: '2', html_url: 'R2' });
  results(ctx, 1);
  assert.match(out.join('\n'), /\nwaiting: .*no run that was not cancelled yet/);
  assert.doesNotMatch(out.join('\n'), /failed/);
});

test('push --blocked records two blocking modules, repeated or with a comma (fault n)', () => {
  const root = product();
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  git(['checkout', '-q', '-b', 'job/orders/1'], { cwd: root });
  gh.createPR('o/product', { head: 'job/orders/1', base: 'tranche', draft: true });
  push(ctx, { _: ['both refuse a leap day'], blocked: ['dates', 'pricing'] });
  let recs = gh.s.comments.map((c) => parseBlock(c.body, RECORD_MARK)).filter(Boolean);
  assert.deepEqual(recs.map((r) => r.data), [{ blocked: { by: ['dates', 'pricing'], why: 'both refuse a leap day' } }]);
  push(ctx, { _: ['still'], blocked: 'dates,pricing' });
  recs = gh.s.comments.map((c) => parseBlock(c.body, RECORD_MARK)).filter(Boolean);
  assert.deepEqual(recs[0].data.blocked.by, ['dates', 'pricing']);
  assert.throws(() => push(ctx, { _: ['x'], blocked: ['dates', true] }), /--blocked <module>/);
  assert.throws(() => push(ctx, { _: ['x'], blocked: 'Dates!' }), /not a module's name/);
});

test('a job branch is made beside an old flat job/<module> branch, and open finds the newest of either form', () => {
  // civicsmith (23 Nov 2026): a product kept job/<module> branches from an earlier process, and GitHub cannot hold
  // job/<module>/<n> beside one ("directory file conflict"). job/<module>.<n> is a flat name beside it.
  const root = product();
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  const f = join(root, 'ww.json');
  writeFileSync(f, JSON.stringify({ work: [] }));
  stateWrite(ctx, 'waiting-work', { _: [], create: true, from: f });
  git(['push', '-q', 'origin', 'main:refs/heads/job/orders'], { cwd: root });
  git(['push', '-q', 'origin', 'main:refs/heads/job/dates/3'], { cwd: root });
  assert.equal(branch(ctx, 'job/orders.1'), 0);
  assert.ok(remote(root, 'job/orders.1'));
  assert.ok(remote(root, 'job/orders'));
  assert.equal(open(ctx, { _: [], module: 'orders' }), 0);
  assert.equal(gh.s.prs[0].head.ref, 'job/orders.1');
  assert.equal(gh.s.prs[0].title, 'orders: job 1');
  assert.equal(open(ctx, { _: [], module: 'dates' }), 0);
  assert.equal(gh.s.prs[1].head.ref, 'job/dates/3');
  assert.throws(() => open(ctx, { _: [], module: 'pricing' }), /no branch job\/pricing\.<n>/);
});

test('open works from a detached checkout (fault o)', () => {
  const root = product();
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(root, gh);
  git(['checkout', '-q', '--detach'], { cwd: root });
  open(ctx, { _: [], title: 'Requirement text', branch: 'work/req' });
  assert.equal(gh.s.prs[0].head.ref, 'work/req');
  assert.throws(() => open(ctx, { _: [], title: 'No branch' }), /detached; name the branch with --branch/);
  assert.match(out.join('\n'), /pull request 1/);
});

test('latest-version prints the newest main commit of the process repository', () => {
  // a stand-in process repository: a repo with a bare origin whose main tip is known
  const proc = makeRepo({ 'README.md': 'process\n' });
  const bare = git(['remote', 'get-url', 'origin'], { cwd: proc });
  const tip = git(['rev-parse', 'HEAD'], { cwd: proc });
  const root = product();
  write(root, { 'process.json': config({ process: { repository: bare, version: '4.0.0', commit: 'a'.repeat(40) } }) });
  const { ctx, out } = ctxFor(root, fakeGitHub());
  assert.equal(latestVersion(ctx), 0);
  assert.equal(out[0], tip);
  assert.match(out[1], /newer than the pinned a{40}/);
  // when the pin already equals latest, it says so
  write(root, { 'process.json': config({ process: { repository: bare, version: '4.0.0', commit: tip } }) });
  const second = ctxFor(root, fakeGitHub());
  assert.equal(latestVersion(second.ctx), 0);
  assert.equal(second.out[1], 'already the pinned version');
});

import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { JOB_MARK, RECORD_MARK, branch, latestVersion, merge, open, push, ready, results, stateWrite } from '../lib/commands.mjs';
import { parseBlock } from '../lib/github.mjs';
import { mark } from '../lib/state.mjs';
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
  assert.throws(() => branch(ctx, 'tranche'), /job\/<module>\/<n> or work\/<what>/);
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

test('ready marks ready and reads it back', () => {
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(makeRepo(), gh);
  gh.createPR('o/product', { head: 'work/x', base: 'tranche', draft: true });
  ready(ctx, 1);
  assert.match(out.join('\n'), /ready; the required run module-tests has been asked for/);
  const stuck = fakeGitHub({ markReady: () => {} });
  stuck.createPR('o/product', { head: 'work/x', base: 'tranche', draft: true });
  assert.throws(() => ready(ctxFor(makeRepo(), stuck).ctx, 1), /still a draft/);
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
  assert.deepEqual(out.map((l) => l.split(':')[0]), ['waiting', 'passed', 'failed (failure)', 'line 1\nnot ok 1 - orders refuses 1000']);
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

test('merge prints GitHub\'s refusal', () => {
  const gh = fakeGitHub({ mergePR: () => ({ message: 'Required status check "module-tests" is expected.' }) });
  const { ctx } = ctxFor(makeRepo(), gh);
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
  assert.match(out.join('\n'), /^passed: .*R1$/);
});

test('results says waiting, not failed, when the only run on the head was cancelled by the newer one (fault k)', () => {
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(makeRepo(), gh);
  const pr = gh.createPR('o/product', { head: 'job/orders/1', base: 'tranche', draft: false });
  gh.s.runs.push({ id: 2, sha: pr.head.sha, name: 'module-tests', status: 'completed', conclusion: 'cancelled', started_at: '2', html_url: 'R2' });
  results(ctx, 1);
  assert.match(out.join('\n'), /^waiting: .*no run that was not cancelled yet/);
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

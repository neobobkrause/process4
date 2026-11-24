import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { close, failedRunsCmd, finishedCmd, nextJob, open, push, roundDoneCmd, branch, stateWrite } from '../lib/commands.mjs';
import { parseBlock } from '../lib/github.mjs';
import { mark } from '../lib/state.mjs';
import { git } from '../lib/util.mjs';
import { commit, config, ctxFor, fakeGitHub, makeRepo } from './helpers.mjs';

// Three made-up modules: dates (R1 not yet met), pricing (R1 not yet met), orders (all met).
function product(over = {}) {
  const root = makeRepo({
    'process.json': config({ slots: { default: 8, share: 2 } }),
    'process/modules/order.txt': 'dates\npricing\norders\n',
    'process/modules/dates.json': { name: 'dates', files: ['src/dates/'], tests: ['test/dates/'], uses: [] },
    'process/modules/pricing.json': { name: 'pricing', files: ['src/pricing/'], tests: ['test/pricing/'], uses: ['dates'] },
    'process/modules/orders.json': { name: 'orders', files: ['src/orders/'], tests: ['test/orders/'], uses: ['pricing'] },
    'process/modules/dates.md': '- **R1** [not yet met] one\n',
    'process/modules/pricing.md': '- **R1** [not yet met] one\n',
    'process/modules/orders.md': '- **R1** [met] one\n',
    ...over,
  });
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const gh = fakeGitHub();
  const c = ctxFor(root, gh);
  stateWrite(c.ctx, undefined, { _: [], create: true });
  c.out.length = 0;
  return { root, gh, ...c };
}
const record = (gh, key) => parseBlock(gh.s.comments.find((c) => c.body.startsWith(`<!-- ${mark(key)} -->`)).body, mark(key)).data;
const writeRec = (ctx, root, key, data) => { const f = join(root, `${key}.json`); writeFileSync(f, JSON.stringify(data)); stateWrite(ctx, key, { _: [], from: f }); };
const merged = (gh, n, at) => Object.assign(gh.getPR('o/product', n), { state: 'closed', merged_at: at });
function startJob(t, module) {
  t.out.length = 0;
  nextJob(t.ctx);
  const b = t.out.find((l) => l.startsWith('branch: ')).split(' ')[1];
  branch(t.ctx, b);
  open(t.ctx, { _: [], module });
  return t.gh.s.prs.at(-1);
}

test('next-job picks the earliest ready module, one for each call, and stops at the share', () => {
  const t = product();
  nextJob(t.ctx);
  assert.deepEqual(t.out.slice(0, 4), ['module: dates', 'branch: job/dates.1', 'work: R1', 'kind: ordinary']);
  // Same inputs, same answer, every time.
  t.out.length = 0; nextJob(t.ctx);
  assert.equal(t.out[0], 'module: dates');
  startJob(t, 'dates');
  const p = startJob(t, 'pricing');
  assert.equal(p.head.ref, 'job/pricing.1');
  t.out.length = 0; nextJob(t.ctx);
  assert.match(t.out[0], /none ready; slots in use 2 of 2/);
  assert.deepEqual(record(t.gh, 'round').modules.map((m) => [m.module, m.state, m.pull_request]), [['dates', 'open', t.gh.s.prs[0].number], ['pricing', 'open', p.number]]);
});

test('the owner\'s module first and slot number are obeyed', () => {
  const t = product();
  writeRec(t.ctx, t.root, 'standing-notes', { notes: [
    { kind: 'module-first', module: 'pricing', written: '2026-11-20T09:00Z', words: 'Instruction: do pricing first' },
    { kind: 'slot-number', number: 1, written: '2026-11-20T09:00Z', words: 'Instruction: one at a time' }] });
  const p = startJob(t, 'pricing');
  assert.equal(p.head.ref, 'job/pricing.1');
  t.out.length = 0; nextJob(t.ctx);
  assert.match(t.out[0], /no free slot: 1 in use of 1, from the owner's slot number/);
});

test('with no free slot, a told module earlier than the latest running job starts at once; a later one waits its turn', () => {
  // The owner's decision of 24 Nov 2026, item 4.
  const t = product({ 'process/modules/dates.md': '- **R1** [met] one\n', 'process/modules/orders.md': '- **R1** [met] one\n' });
  writeRec(t.ctx, t.root, 'standing-notes', { notes: [{ kind: 'slot-number', number: 1, written: '2026-11-20T09:00Z' }] });
  const p = startJob(t, 'pricing');
  writeRec(t.ctx, t.root, 'waiting-work', { work: [
    { module: 'orders', kind: 'notice', from: 'pricing', merged: 4, uses: [] },
    { module: 'dates', kind: 'notice', from: 'clock', merged: 5, uses: [] }] });
  t.out.length = 0; nextJob(t.ctx);
  assert.deepEqual(t.out.slice(0, 4), ['module: dates', 'branch: job/dates.1', 'work: notice from clock (pull request 5)', 'kind: told']);
  assert.match(t.out.join('\n'), new RegExp(`dates starts above the slot number \\(1 in use of 1\\): a notice from clock \\(pull request 5\\) waits for it, and it comes before pricing \\(pull request ${p.number}\\), the latest running job\nslots in use 2 of 1`));
  assert.match(t.out.join('\n'), /waiting their turn \(after pricing, the latest running job\): orders, each with a notice waiting/);
  branch(t.ctx, 'job/dates.1');
  open(t.ctx, { _: [], module: 'dates' });
  // orders comes after pricing, the latest running job: it waits for a free slot.
  t.out.length = 0; nextJob(t.ctx);
  assert.deepEqual(t.out, ['no free slot: 2 in use of 1, from the owner\'s slot number (1)', 'waiting their turn (after pricing, the latest running job): orders, each with a notice waiting']);
  // A module with only a requirement does not start above the slot number either.
  const t2 = product({ 'process/modules/orders.md': '- **R1** [met] one\n' });
  writeRec(t2.ctx, t2.root, 'standing-notes', { notes: [{ kind: 'slot-number', number: 1, written: '2026-11-20T09:00Z' }, { kind: 'module-first', module: 'pricing', written: '2026-11-20T09:00Z' }] });
  startJob(t2, 'pricing');
  t2.out.length = 0; nextJob(t2.ctx);
  assert.match(t2.out[0], /^no free slot: 1 in use of 1/);
});

test('a job whose block ARCH ended by its own decision says so with push --unblocked, and holds its slot again', () => {
  // civicsmith, 23 Nov 2026: three blocks ended by ARCH's module-list change or rewritten decision, not by a merge.
  const t = product();
  writeRec(t.ctx, t.root, 'standing-notes', { notes: [{ kind: 'slot-number', number: 1, written: '2026-11-20T09:00Z' }] });
  startJob(t, 'dates');
  git(['fetch', '-q', 'origin', 'job/dates.1'], { cwd: t.root });
  git(['checkout', '-q', '-b', 'job/dates.1', 'FETCH_HEAD'], { cwd: t.root });
  push(t.ctx, { _: ['pricing refuses a leap day'], blocked: 'pricing' });
  assert.throws(() => push(t.ctx, { _: [], unblocked: true }), /say --unblocked "<why>"/);
  push(t.ctx, { _: [], unblocked: 'ARCH gave the leap-day rule to dates' });
  git(['checkout', '-q', 'main'], { cwd: t.root });
  t.out.length = 0; nextJob(t.ctx);
  assert.match(t.out[0], /no free slot: 1 in use of 1/);
  assert.equal(record(t.gh, 'round').modules.find((m) => m.module === 'dates').state, 'open');
  assert.equal(t.gh.s.comments.filter((c) => c.body.includes('process4-job-record')).length, 1);
});

test('a blocked job frees its slot, and is ready again once the blocking module merges after the block', () => {
  const t = product();
  writeRec(t.ctx, t.root, 'standing-notes', { notes: [{ kind: 'slot-number', number: 1, written: '2026-11-20T09:00Z' }] });
  const d = startJob(t, 'dates');
  // An earlier merge of pricing does not end the block.
  t.gh.s.prs.push({ number: 90, state: 'closed', merged_at: '2026-11-20T09:00:00Z', head: { ref: 'job/pricing/9' }, base: { ref: 'tranche' } });
  git(['fetch', '-q', 'origin', 'job/dates.1'], { cwd: t.root });
  git(['checkout', '-q', '-b', 'job/dates.1', 'FETCH_HEAD'], { cwd: t.root });
  push(t.ctx, { _: ['pricing refuses a leap day'], blocked: 'pricing' });
  git(['checkout', '-q', 'main'], { cwd: t.root });
  const p = startJob(t, 'pricing');
  assert.equal(p.head.ref, 'job/pricing.10');
  assert.equal(record(t.gh, 'round').modules.find((m) => m.module === 'dates').state, 'blocked');
  t.out.length = 0; roundDoneCmd(t.ctx);
  assert.match(t.out.join('\n'), /not done[\s\S]*dates: blocked by pricing, which an open job of the round can clear/);
  merged(t.gh, p.number, '2026-11-20T11:00:00Z');
  t.out.length = 0; nextJob(t.ctx);
  assert.deepEqual(t.out.slice(0, 2), ['module: dates', 'branch: job/dates.1 (its job is ready again: the block by pricing ended when pricing merged)']);
  // Handed out once: it holds its slot again and is not handed out a second time.
  t.out.length = 0; nextJob(t.ctx);
  assert.match(t.out[0], /no free slot: 1 in use of 1/);
  assert.equal(record(t.gh, 'round').modules.find((m) => m.module === 'dates').state, 'open');
});

test('finished, close --nothing-to-change, and round-done', () => {
  const t = product({ 'process/modules/pricing.md': '- **R1** [met] one\n' });
  writeRec(t.ctx, t.root, 'waiting-work', { work: [{ module: 'pricing', kind: 'notice', from: 'dates', merged: 5, uses: [] }] });
  const d = startJob(t, 'dates');
  const p = startJob(t, 'pricing');
  t.out.length = 0; finishedCmd(t.ctx, 'dates');
  assert.match(t.out[0], new RegExp(`^not finished: its job is open: pull request ${d.number}`));
  assert.throws(() => close(t.ctx, p.number, { _: [], 'nothing-to-change': true }), /--nothing-to-change "<why>"/);
  close(t.ctx, p.number, { _: [], 'nothing-to-change': 'pricing reads no date' });
  assert.equal(p.state, 'closed');
  t.out.length = 0; finishedCmd(t.ctx, 'pricing');
  assert.match(t.out[0], new RegExp(`^finished: pull request ${p.number} closed with nothing to change: pricing reads no date`));
  t.out.length = 0; roundDoneCmd(t.ctx);
  assert.match(t.out.join('\n'), new RegExp(`^not done\n {2}dates: open, pull request ${d.number}\n {2}pricing: finished`));
  // dates' job merged, but its requirement is still not met at the tranche's tip: it has work again.
  merged(t.gh, d.number, '2026-11-20T11:00:00Z');
  t.out.length = 0; finishedCmd(t.ctx, 'dates');
  assert.match(t.out[0], new RegExp(`^not finished: pull request ${d.number} merged, but it has work again: R1`));
  git(['checkout', '-q', 'tranche'], { cwd: t.root });
  commit(t.root, { 'process/modules/dates.md': '- **R1** [met] one\n' });
  git(['push', '-q', 'origin', 'tranche'], { cwd: t.root });
  t.out.length = 0; roundDoneCmd(t.ctx);
  assert.match(t.out.join('\n'), new RegExp(`^done\n {2}dates: finished \\(pull request ${d.number} merged\\)`));
});

test('a job closed with nothing to change is not finished while the module has an unmet requirement', () => {
  const t = product();
  const d = startJob(t, 'dates');
  close(t.ctx, d.number, { _: [], 'nothing-to-change': 'nothing' });
  t.out.length = 0; finishedCmd(t.ctx, 'dates');
  assert.match(t.out[0], /not finished: .*has work again: R1/);
});

// Item 12 (owner's decision, 20 Nov 2026): a walk-flaw module whose job finds the fix belongs
// elsewhere and closes unmerged is finished for the round (the flaw is handed back to ARCH).
test('a walk-flaw module whose job closes nothing-to-change is finished for the round', () => {
  const t = product({ 'process/modules/dates.md': '- **R1** [met] one\n' });
  writeRec(t.ctx, t.root, 'waiting-work', { work: [{ module: 'dates', kind: 'walk-flaw', flaw: 't1-1-I-1-1', link: '<the comment>' }] });
  const d = startJob(t, 'dates');
  close(t.ctx, d.number, { _: [], 'nothing-to-change': 'the fix belongs in pricing' });
  t.out.length = 0; finishedCmd(t.ctx, 'dates');
  assert.match(t.out[0], /^finished: pull request \d+ closed with nothing to change: the fix belongs in pricing/);
});

test('a block recorded by ARCH at the fifth failed run carries into the next round', () => {
  const t = product();
  const d = startJob(t, 'dates');
  const round = record(t.gh, 'round');
  writeRec(t.ctx, t.root, 'round', { ...round, modules: round.modules.map((m) => (m.module === 'dates' ? { ...m, state: 'blocked', why: 'five failed runs' } : m)) });
  t.out.length = 0; roundDoneCmd(t.ctx);
  assert.match(t.out.join('\n'), /dates: blocked, carried into the next round: five failed runs/);
  assert.equal(d.state, 'open');
});

test('failed-runs counts failed required runs, not cancelled ones, and speaks at the third and fifth', () => {
  const t = product();
  const pr = t.gh.createPR('o/product', { head: 'job/dates.1', base: 'tranche', draft: false });
  const run = (conclusion, name = 'module-tests') => t.gh.s.wfruns.push({ name, conclusion, head_branch: 'job/dates.1', html_url: `R${t.gh.s.wfruns.length}`, pull_requests: [{ number: pr.number }] });
  run('failure'); run('cancelled'); run('success'); run('failure'); run('failure', 'other');
  t.out.length = 0; failedRunsCmd(t.ctx, pr.number);
  assert.deepEqual(t.out, [`2 failed run(s) of module-tests on pull request ${pr.number}: R0 R3`]);
  run('timed_out');
  t.out.length = 0; failedRunsCmd(t.ctx, pr.number);
  assert.match(t.out[1], /replace its session with a fresh one/);
  run('failure'); run('failure');
  t.out.length = 0; failedRunsCmd(t.ctx, pr.number);
  assert.match(t.out.join('\n'), /^5 failed[\s\S]*record dates blocked/);
});

test('a job blocked by two modules stays blocked until both have merged after the block (fault n)', () => {
  const t = product();
  const o = startJob(t, 'dates');
  git(['fetch', '-q', 'origin', 'job/dates.1'], { cwd: t.root });
  git(['checkout', '-q', '-b', 'job/dates.1', 'FETCH_HEAD'], { cwd: t.root });
  push(t.ctx, { _: ['both refuse a leap day'], blocked: ['pricing', 'orders'] });
  git(['checkout', '-q', 'main'], { cwd: t.root });
  t.out.length = 0; roundDoneCmd(t.ctx);
  assert.match(t.out.join('\n'), /dates: blocked by pricing and orders/);
  t.gh.s.prs.push({ number: 91, state: 'closed', merged_at: '2026-11-20T11:00:00Z', head: { ref: 'job/pricing/1' }, base: { ref: 'tranche' } });
  t.out.length = 0; roundDoneCmd(t.ctx);
  assert.match(t.out.join('\n'), /dates: blocked by pricing and orders/);
  t.gh.s.prs.push({ number: 92, state: 'closed', merged_at: '2026-11-20T11:05:00Z', head: { ref: 'job/orders/1' }, base: { ref: 'tranche' } });
  t.out.length = 0; nextJob(t.ctx);
  assert.deepEqual(t.out.slice(0, 2), ['module: dates', `branch: job/dates.1 (its job is ready again: the block by pricing and orders ended when pricing and orders merged)`]);
  assert.equal(record(t.gh, 'round').modules.find((m) => m.module === 'dates').pull_request, o.number);
});

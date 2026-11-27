// The owner's decisions K1-K5 (27 Nov 2026), as amended: "support all published limits, and add no restriction GitHub
// doesn't name as a limit"; shares at about 95% of each limit (decision A). Clocks, sleeps and gh's answers are injected.
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { branch, jobText, merge, nextJob, open, stateWrite } from '../lib/commands.mjs';
import { JOB_CHARGE, SHARES, note, paceState, roleFor, roomAt, take } from '../lib/pace.mjs';
import { mergedKinds } from '../lib/round.mjs';
import { mark, readRecords, writeRecord } from '../lib/state.mjs';
import { Fail, git, makeGh, methodOf } from '../lib/util.mjs';
import { config, converted, ctxFor, fakeGitHub, makeRepo } from './helpers.mjs';

const T0 = Date.parse('2026-11-27T10:00:00Z');
const clock = () => {
  const c = { t: T0, waits: [], said: [] };
  c.nowMs = () => c.t;
  c.wait = (ms) => { c.waits.push(ms); c.t += ms; };
  c.say = (l) => c.said.push(l);
  return c;
};
const file = () => join(mkdtempSync(join(tmpdir(), 'p4-pace-')), 'writes.json');
const headed = (status, headers, body) => `HTTP/2.0 ${status}\n${Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${body}`;
const sum = (k, counts = { arch: 1, job: 8, coordinator: 1, root: 1, watcher: 1, walker: 4, process: 1, lane: 4 }) => Object.entries(counts).reduce((t, [r, n]) => t + SHARES[r][k] * n, 0);

test('the one table of shares comes to about 95% of each of GitHub\'s limits with eight jobs, four walkers and four lanes', () => {
  assert.equal(sum('minute'), 76);
  assert.equal(sum('hour'), 475);
  assert.equal(sum('points'), 854);
  assert.ok(Math.abs(sum('pushes') - 5.7) < 0.02 && sum('pushes') <= 6);
  assert.equal(JOB_CHARGE, SHARES.job.hour);
});

test('the role: P4_ROLE, else process where the repository has no process.json, else job', () => {
  const product = makeRepo({ 'process.json': config() });
  const processRepo = makeRepo();
  assert.equal(roleFor(product, { P4_ROLE: 'arch' }), 'arch');
  assert.equal(roleFor(product, {}), 'job');
  assert.equal(roleFor(processRepo, {}), 'process');
  assert.equal(roleFor(processRepo, { P4_ROLE: 'nonsense' }), 'process');
});

test('roomAt: the earliest time a sliding window has room', () => {
  assert.equal(roomAt([[0, 1], [10, 1]], 60, 3, 1), 0);
  assert.equal(roomAt([[0, 1], [10, 1], [20, 1]], 60, 3, 1), 60);
  assert.equal(roomAt([[0, 6], [5, 6]], 3600, 12, 6), 3600);
});

test('K2: a job\'s content writes keep to 3 a minute, a second apart; the fourth waits for the window, saying so', () => {
  const c = clock();
  const f = file();
  for (let i = 0; i < 4; i++) take({ kind: 'write', role: 'job', file: f, nowMs: c.nowMs, wait: c.wait, say: c.say });
  assert.deepEqual(paceState(f).writes.map((t) => (t - T0) / 1000), [0, 1, 2, 60]);
  assert.equal(c.said.length, 1);
  assert.match(c.said[0], /^p4: waiting 58 s for the job share of content writes, 3 a minute on this machine$/);
  assert.equal(existsSync(`${f}.lock`), false);
});

test('K3: an hour\'s share; a wait over 30 minutes fails as G2 does, naming the time to run again', () => {
  const c = clock();
  const f = file();
  // a job's six an hour, spread
  for (let i = 0; i < 6; i++) { take({ kind: 'write', role: 'job', file: f, nowMs: c.nowMs, wait: c.wait, say: c.say }); c.t += 5 * 60000; }
  // the seventh would wait until the first is an hour old: 30 minutes from now, which is borne
  c.t = T0 + 31 * 60000;
  take({ kind: 'write', role: 'job', file: f, nowMs: c.nowMs, wait: c.wait, say: c.say });
  assert.equal(c.t, T0 + 3600000);
  assert.match(c.said.at(-1), /6 an hour on this machine/);
  // the eighth: the second write (T0 + 5 min) leaves the hour at T0 + 65 min, so from T0 + 60 min it is under 30 minutes
  take({ kind: 'write', role: 'job', file: f, nowMs: c.nowMs, wait: c.wait, say: c.say });
  assert.equal(c.t, T0 + 65 * 60000);
  // a fresh file full for the hour fails at once
  const g = file();
  const d = clock();
  for (let i = 0; i < 6; i++) take({ kind: 'write', role: 'job', file: g, nowMs: d.nowMs, wait: d.wait });
  assert.throws(() => take({ kind: 'write', role: 'job', file: g, nowMs: d.nowMs, wait: d.wait }),
    (e) => e instanceof Fail && /run the command again after 2026-11-27T11:00:00Z$/.test(e.message));
});

test('K3: ARCH\'s charge for each job it opens counts in its hour; when spent, room waits', () => {
  const c = clock();
  const f = file();
  const n = Math.floor(SHARES.arch.hour / JOB_CHARGE);
  for (let i = 0; i < n; i++) take({ kind: 'charge', role: 'arch', file: f, nowMs: c.nowMs, wait: c.wait });
  assert.equal(paceState(f).charges.length, n);
  // the charges are bookkeeping only: no write, no points, and the minute is untouched
  assert.deepEqual([paceState(f).writes.length, paceState(f).points.length], [0, 0]);
  c.t = T0 + 40 * 60000;
  take({ kind: 'room', role: 'arch', file: f, nowMs: c.nowMs, wait: c.wait, say: c.say });
  assert.equal(c.t, T0 + 3600000);
  assert.match(c.said[0], /arch share of content writes, 302 an hour \(each job opened counts 6\)/);
  assert.equal(paceState(f).charges.length, n);
});

test('REST points: a watcher\'s 11 a minute, a write 5 and a read 1', () => {
  const c = clock();
  const f = file();
  take({ kind: 'write', role: 'watcher', file: f, nowMs: c.nowMs, wait: c.wait });
  c.t += 60000 - 1;
  // the write's minute has not ended: 5 + 1 x 6 = 11
  for (let i = 0; i < 6; i++) take({ kind: 'read', role: 'watcher', file: f, nowMs: c.nowMs, wait: c.wait });
  assert.deepEqual(c.waits, []);
  take({ kind: 'read', role: 'watcher', file: f, nowMs: c.nowMs, wait: c.wait });
  assert.deepEqual(c.waits, [1]);
});

test('pushes: the role\'s share a minute to one repository, each repository apart', () => {
  const c = clock();
  const f = file();
  for (let i = 0; i < 2; i++) take({ kind: 'push', role: 'arch', slug: 'o/a', file: f, nowMs: c.nowMs, wait: c.wait });
  take({ kind: 'push', role: 'arch', slug: 'o/b', file: f, nowMs: c.nowMs, wait: c.wait });
  // ARCH's 0.65 a minute: one push every 92 s, to each repository
  assert.deepEqual(c.waits, [92308]);
  // a push is no content write, and takes no point
  assert.deepEqual([paceState(f).writes.length, paceState(f).points.length], [0, 0]);
});

test('K4 and the primary limit: a secondary refusal pauses every write of the machine; remaining 0 pauses every request', () => {
  const c = clock();
  const f = file();
  const limited = { code: 1, stderr: 'gh: You have exceeded a secondary rate limit (HTTP 403)', stdout: headed('403 Forbidden', { 'Retry-After': '120' }, '{}') };
  const ok = (h = {}) => ({ code: 0, stdout: headed('200 OK', h, '{"ok":1}') });
  const rs = [limited, ok()];
  const gh = makeGh({ exec: () => rs.shift(), wait: c.wait, nowMs: c.nowMs, paceFile: f, role: 'arch', say: c.say });
  assert.deepEqual(gh(['api', '-X', 'POST', 'x', '--input', '-']), { ok: 1 });
  assert.equal(paceState(f).notBefore, T0 + 120000);
  // another p4 command on this machine, started during the pause: its read goes now, its write waits for the pause
  const calls = [];
  const d = clock();
  const other = makeGh({ exec: (a) => { calls.push([d.t, methodOf(a)]); return ok(); }, wait: d.wait, nowMs: d.nowMs, paceFile: f, role: 'arch', say: d.say });
  d.t = T0 + 10000;
  other(['api', 'y']);
  other(['api', '-X', 'PATCH', 'y', '--input', '-']);
  // (a second after the refused write's own retry, at 120 s)
  assert.deepEqual(calls.map(([t, m]) => [(t - T0) / 1000, m]), [[10, 'GET'], [121, 'PATCH']]);
  assert.match(d.said[0], /GitHub's refusal \(a secondary rate limit\) on this machine/);
  // a read's answer says the primary limit is spent: every request waits until its reset
  const reset = Math.floor((T0 + 600000) / 1000);
  const e = clock();
  e.t = T0 + 200000;
  const at = [];
  const third = makeGh({ exec: () => { at.push(e.t); return ok(at.length === 1 ? { 'X-Ratelimit-Remaining': '0', 'X-Ratelimit-Reset': String(reset) } : {}); }, wait: e.wait, nowMs: e.nowMs, paceFile: f, role: 'arch', say: e.say });
  third(['api', 'z']);
  third(['api', 'z']);
  assert.deepEqual(at.map((t) => (t - T0) / 1000), [200, 601]);
  note({ file: f, nowMs: e.nowMs, points: 3 });
  assert.ok(paceState(f).points.some(([, p]) => p === 3));
});

test('a paginated read is counted page by page, and its primary refusal reads the free /rate_limit for the reset', () => {
  const c = clock();
  const f = file();
  const reset = Math.floor((T0 + 300000) / 1000);
  const calls = [];
  const rs = [
    { code: 1, stderr: 'gh: API rate limit exceeded for user ID 1. (HTTP 403)', stdout: '' },
    { code: 0, stdout: JSON.stringify({ resources: { core: { remaining: 0, reset } } }) },
    { code: 0, stdout: '[[1,2],[3],[4]]' },
  ];
  const gh = makeGh({ exec: (a) => { calls.push(a); return rs.shift(); }, wait: c.wait, nowMs: c.nowMs, paceFile: f, role: 'arch', say: c.say });
  assert.deepEqual(gh(['api', '--paginate', '--slurp', 'repos/o/p/issues/1/comments']), [[1, 2], [3], [4]]);
  assert.deepEqual(calls[1], ['api', 'rate_limit']);
  assert.ok(!calls[0].includes('-i'));
  assert.equal(c.t, T0 + 301000);
  // within the minute: the read that answered, and its two further pages (the refused read's minute has passed)
  assert.deepEqual(paceState(f).points.map(([, p]) => p), [1, 2]);
});

test('K1: a record whose body is unchanged is not written again; next-job writes the round record only when it changes', () => {
  const root = makeRepo({
    'process.json': config(),
    'process/modules/order.txt': 'dates\n',
    'process/modules/dates.json': { name: 'dates', files: ['src/dates/'], tests: ['test/dates/'], uses: [] },
    'process/modules/dates.md': '- **R1** [not yet met] one\n',
  });
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const gh = fakeGitHub();
  converted(gh, ['dates']);
  let edits = 0;
  const edit = gh.editComment;
  gh.editComment = (...a) => { edits++; return edit(...a); };
  const t = ctxFor(root, gh, { role: 'arch' });
  stateWrite(t.ctx, undefined, { _: [], create: true });
  const { issue, records } = readRecords(gh, 'o/product');
  edits = 0;
  writeRecord(gh, 'o/product', issue, records, 'stop', {});
  assert.equal(edits, 0);
  writeRecord(gh, 'o/product', issue, records, 'stop', { stop: true });
  writeRecord(gh, 'o/product', issue, records, 'stop', { stop: true });
  assert.equal(edits, 1);
  // back to what it was, from the same records: written, since the comment now holds the other body
  writeRecord(gh, 'o/product', issue, records, 'stop', {});
  assert.equal(edits, 2);
  edits = 0;
  nextJob(t.ctx);
  nextJob(t.ctx);
  nextJob(t.ctx);
  assert.equal(edits, 1);
  assert.match(t.out.join('\n'), /module: dates/);
});

test('K3: ARCH\'s open --module charges its hour, locally; next-job waits for room when the hour is spent', () => {
  const root = makeRepo({
    'process.json': config(),
    'process/modules/order.txt': 'dates\n',
    'process/modules/dates.json': { name: 'dates', files: ['src/dates/'], tests: ['test/dates/'], uses: [] },
    'process/modules/dates.md': '- **R1** [not yet met] one\n',
  });
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const gh = fakeGitHub();
  converted(gh, ['dates']);
  const t = ctxFor(root, gh, { role: 'arch' });
  stateWrite(t.ctx, undefined, { _: [], create: true });
  branch(t.ctx, 'job/dates.2');
  open(t.ctx, { _: [], module: 'dates' });
  assert.equal(paceState(t.ctx.paceFile).charges.length, 1);
  // a job's own open charges nothing
  const u = ctxFor(root, gh, { role: 'job' });
  open(u.ctx, { _: [], module: 'dates' });
  assert.equal(paceState(u.ctx.paceFile).charges.length, 0);
  // ARCH's hour spent: next-job waits for room
  writeFileSync(t.ctx.paceFile, JSON.stringify({ charges: [[t.ctx.nowMs(), SHARES.arch.hour]] }));
  t.out.length = 0;
  let now = t.ctx.nowMs() + 40 * 60000;
  t.ctx.wait = (ms) => { t.out.push(`(waited ${ms})`); now += ms; };
  t.ctx.nowMs = () => now;
  nextJob(t.ctx);
  assert.match(t.out[0], /^\(waited 1200000\)$/);
});

test('merges keep to GitHub\'s one a minute per repository, whatever the branch', () => {
  const root = makeRepo({ 'process.json': config() });
  const gh = fakeGitHub();
  const t = ctxFor(root, gh);
  const other = gh.createPR('o/product', { head: 'work/a', base: 'main', draft: false });
  Object.assign(other, { state: 'closed', merged_at: new Date(t.ctx.nowMs() - 20000).toISOString() });
  const pr = gh.createPR('o/product', { head: 'work/b', base: 'tranche', draft: false });
  assert.equal(merge(t.ctx, pr.number), 0);
  assert.ok(t.out.includes('waiting 40 s since the last merge into o/product'));
});

test('K5: a merged pull request\'s job block kind is read once, then kept by repository and number', () => {
  const kindsFile = join(mkdtempSync(join(tmpdir(), 'p4-kinds-')), 'k.json');
  let reads = 0;
  const read = () => { reads++; return 'conversion'; };
  assert.equal(mergedKinds({ slug: 'o/a', kindsFile })(5, read), 'conversion');
  assert.equal(mergedKinds({ slug: 'o/a', kindsFile })(5, read), 'conversion');
  assert.equal(mergedKinds({ slug: 'o/a', kindsFile })(6, () => { reads++; return null; }), null);
  assert.equal(mergedKinds({ slug: 'o/a', kindsFile })(6, read), null);
  assert.equal(mergedKinds({ slug: 'o/b', kindsFile })(5, () => { reads++; return 'ordinary'; }), 'ordinary');
  assert.equal(reads, 3);
  assert.deepEqual(JSON.parse(readFileSync(kindsFile, 'utf8')), { 'o/a#5': 'conversion', 'o/a#6': null, 'o/b#5': 'ordinary' });
});

test('K5: next-job reads a merged job pull request\'s comments once, across calls', () => {
  const root = makeRepo({
    'process.json': config(),
    'process/modules/order.txt': 'dates\npricing\n',
    'process/modules/dates.json': { name: 'dates', files: ['src/dates/'], tests: ['test/dates/'], uses: [] },
    'process/modules/pricing.json': { name: 'pricing', files: ['src/pricing/'], tests: ['test/pricing/'], uses: [] },
    'process/modules/dates.md': '- **R1** [not yet met] one\n',
    'process/modules/pricing.md': '- **R1** [met] one\n',
  });
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const gh = fakeGitHub();
  converted(gh, ['dates', 'pricing']);
  const read = {};
  const comments = gh.comments;
  gh.comments = (slug, n) => { read[n] = (read[n] || 0) + 1; return comments(slug, n); };
  const t = ctxFor(root, gh, { role: 'arch' });
  stateWrite(t.ctx, undefined, { _: [], create: true });
  for (let i = 0; i < 3; i++) nextJob(t.ctx);
  const merged = gh.s.earlier.map((p) => p.number);
  assert.ok(merged.every((n) => read[n] === 1), JSON.stringify(read));
});

test('each starting text\'s p4 line sets its role, the filled job and walking texts included, each under 8,192 bytes', () => {
  const texts = new URL('../../starting_texts/', import.meta.url);
  const roles = { 'arch.md': 'arch', 'coordinator.md': 'coordinator', 'job.md': 'job', 'lane.md': 'lane', 'process.md': 'process', 'root.md': 'root', 'walking-session.md': 'walker', 'watcher.md': 'watcher' };
  for (const [f, role] of Object.entries(roles)) {
    const text = readFileSync(new URL(f, texts), 'utf8');
    assert.match(text, new RegExp(`\`p4\` means \`P4_ROLE=${role} node `), f);
    assert.ok(Buffer.byteLength(text) <= 8192, f);
  }
  const job = jobText({ slug: 'o/product' }, config(), { module: 'dates', branch: 'job/dates.2', url: 'https://github.com/o/product/pull/12' });
  assert.match(job, /`p4` means `P4_ROLE=job node /);
  assert.ok(Buffer.byteLength(job) <= 8192);
  // the filled walking text: walk.test.mjs
});

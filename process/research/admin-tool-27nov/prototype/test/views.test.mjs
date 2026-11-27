// The views as pure functions over a folded log: no service needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold } from '../src/reducer.mjs';
import { mergeQueue, anomalies, next, owed, brief } from '../src/views.mjs';

let seq = 0;
const ev = (at, kind, body, actor = null) => ({ seq: ++seq, at: `2026-11-26T${at}:00.000Z`, kind, body, actor });
const mods = (n, conv = 0) => ev('20:00', 'module.declared', { modules: Array.from({ length: n }, (_, i) => ({ name: `m${i + 1}`, order: i + 1, converted: i < conv, uses: i ? [`m${i}`] : [] })) });

test('merge queue: a ready job waits on a provider job, and rule Y frees it when the provider opened after its tests', () => {
  const s = fold([
    mods(5, 5),
    ev('21:00', 'job.opened', { pr: 10, module: 'm5', kind: 'ordinary', session: 'S5' }),
    ev('21:10', 'job.tests', { pr: 10, passed: true }),
    ev('21:05', 'job.opened', { pr: 11, module: 'm2', kind: 'ordinary' }),
    ev('21:20', 'job.opened', { pr: 12, module: 'm3', kind: 'conversion' }),
  ]);
  const off = mergeQueue(s, { now: '2026-11-26T21:30:00.000Z' });
  assert.equal(off.ready[0].verdict, 'waits');
  assert.deepEqual(off.ready[0].holders.map((h) => h.module).sort(), ['m2', 'm3']);
  assert.equal(off.ready[0].waited_min, 20);
  const on = mergeQueue(s, { now: '2026-11-26T21:30:00.000Z', y: true });
  assert.deepEqual(on.ready[0].holders.map((h) => [h.module, h.under_y]).sort(), [['m2', 'holds'], ['m3', 'free']]);
  assert.equal(on.ready[0].verdict, 'waits');
});

test('merge queue: a notice after the tests makes the job not ready; an upper-bound opening gives "unknown" under Y', () => {
  const s = fold([
    mods(3, 3),
    ev('21:00', 'job.opened', { pr: 1, module: 'm3' }),
    ev('21:10', 'job.tests', { pr: 1, passed: true }),
    ev('21:20', 'job.opened', { pr: 2, module: 'm1', bound: 'no-later-than' }),
  ]);
  assert.equal(mergeQueue(s, { now: '2026-11-26T21:30:00.000Z', y: true }).ready[0].verdict, 'unknown');
  const s2 = fold([...[mods(3, 3), ev('21:00', 'job.opened', { pr: 1, module: 'm3' }), ev('21:10', 'job.tests', { pr: 1, passed: true })], ev('21:12', 'notice.arrived', { module: 'm3', from: 'm1' })]);
  const q = mergeQueue(s2, { now: '2026-11-26T21:30:00.000Z' });
  assert.equal(q.ready.length, 0);
  assert.match(q.not_ready[0].why, /notice/);
});

test('anomalies: merged not archived, open with no session, over slots, outside the charter, scope against charter', () => {
  const s = fold([
    mods(4, 0),
    ev('20:01', 'charter.set', { words: 'Instruction: convert every module in order, conversions only', kind: 'conversions-only' }),
    ev('20:02', 'slots.set', { number: 1 }),
    ev('20:05', 'job.opened', { pr: 1, module: 'm1', kind: 'conversion', session: 'A' }),
    ev('20:06', 'job.merged', { pr: 1 }),
    ev('20:07', 'job.opened', { pr: 2, module: 'm2', kind: 'conversion' }),
    ev('20:08', 'job.opened', { pr: 3, module: 'm3', kind: 'ordinary', session: 'C' }),
    ev('20:09', 'scope.widen', { by: 'ARCH', what: 'm4' }),
  ]);
  const a = anomalies(s, { now: '2026-11-26T21:00:00.000Z' });
  assert.deepEqual(a.merged_not_archived.map((x) => x.pr), [1]);
  assert.deepEqual(a.open_no_session.map((x) => x.pr), [2]);
  assert.deepEqual(a.over_slots, { in_use: 2, number: 1 });
  assert.deepEqual(a.outside_charter.map((x) => x.pr), [3]);
  assert.equal(a.scope_vs_charter.length, 1);
  const s2 = fold([...[mods(1, 0), ev('20:05', 'job.opened', { pr: 1, module: 'm1', kind: 'conversion', session: 'A' }), ev('20:06', 'job.merged', { pr: 1 })], ev('20:07', 'session.archived', { session: 'A' })]);
  assert.equal(anomalies(s2, { now: '2026-11-26T21:00:00.000Z' }).merged_not_archived.length, 0);
});

test('next: conversions-only gives conversions in order and holds flaws; ordinary gives the flaw; first-n stops when done', () => {
  const base = [mods(4, 2), ev('20:01', 'work.waiting', { module: 'm1', kind: 'flaw', ref: 'm1#3' }), ev('20:02', 'work.waiting', { module: 'm2', kind: 'notice', ref: 'n1' })];
  const conv = next(fold([...base, ev('20:03', 'charter.set', { words: 'conversions only', kind: 'conversions-only' })]));
  assert.deepEqual(conv.next, { module: 'm3', kind: 'conversion' });
  assert.deepEqual(conv.held.map((h) => h.ref), ['m1#3', 'n1']);
  const told = next(fold([...base, ev('20:03', 'charter.set', { words: 'conversions only; notices are work', kind: 'conversions-only', notices: 'work' })]));
  assert.deepEqual(told.next, { module: 'm2', kind: 'told', work: ['n1'] });
  const ord = next(fold(base));
  assert.deepEqual(ord.next, { module: 'm1', kind: 'ordinary', work: ['m1#3'] });
  const firstN = next(fold([...base, ev('20:03', 'charter.set', { words: 'the first 2, then stop', kind: 'first-n', n: 2 })]));
  assert.equal(firstN.next, null);
  assert.match(firstN.why, /charter is done/);
  const stopped = next(fold([...base, ev('20:04', 'stop.set', { words: 'stop' })]));
  assert.match(stopped.why, /stop stands/);
  const unordered = next(fold([...base, ev('20:05', 'module.declared', { modules: [{ name: 'x', order: null }] })]));
  assert.match(unordered.why, /order is not recorded/);
});

test('owed: ARCH owes the archive, notify and a merge that no longer waits; a job owes a test run after a notice', () => {
  const s = fold([
    mods(3, 3),
    ev('20:00', 'session.created', { session: 'ARCH1', role: 'arch' }),
    ev('20:01', 'job.opened', { pr: 1, module: 'm1', session: 'J1', started_by: 'ARCH1' }),
    ev('20:02', 'job.merged', { pr: 1, by: 'ARCH1' }),
    ev('20:03', 'job.opened', { pr: 2, module: 'm2', session: 'J2', started_by: 'ARCH1' }),
    ev('20:04', 'job.tests', { pr: 2, passed: true }),
    ev('20:05', 'job.opened', { pr: 3, module: 'm3', session: 'J3', started_by: 'ARCH1' }),
    ev('20:06', 'job.tests', { pr: 3, passed: true }),
    ev('20:07', 'notice.arrived', { module: 'm3', from: 'm1' }),
  ]);
  const a = owed(s, { session: 'ARCH1', now: '2026-11-26T20:30:00.000Z' });
  assert.deepEqual(a.owed.map((x) => `${x.act} ${x.pr}`).sort(), ['archive 1', 'merge 2', 'notify 1']);
  assert.deepEqual(owed(s, { session: 'J3', now: '2026-11-26T20:30:00.000Z' }).owed.map((x) => x.act), ['test again']);
});

test('brief: bounded; lists are cut to fit', () => {
  const evs = [mods(300, 0), ev('20:01', 'charter.set', { words: 'conversions only', kind: 'conversions-only' })];
  for (let i = 1; i <= 300; i++) evs.push(ev('20:02', 'job.opened', { pr: i, module: `m${i}`, kind: 'ordinary' }));
  const s = fold(evs);
  const big = brief(s, { role: 'arch', now: '2026-11-26T22:00:00.000Z', max: 1e9 });
  const small = brief(s, { role: 'arch', now: '2026-11-26T22:00:00.000Z', max: 4000 });
  assert.ok(big.bytes > 4000);
  assert.ok(small.bytes <= 4000, `${small.bytes}`);
  assert.ok(small.list_cap < 50);
});

// The service on workerd (Miniflare): keys, idempotency, concurrent writers, the object's clock, records, rebuild,
// restart from disk and a reducer version change (the schema migration), and the sync client.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startService } from '../lib/local.mjs';
import { connect, connectSync } from '../lib/client.mjs';

let svc; let w; let r; let imp;
before(async () => {
  svc = await startService();
  w = (product) => connect({ url: svc.url, key: svc.keys.writer, product });
  r = (product) => connect({ url: svc.url, key: svc.keys.reader, product });
  imp = (product) => connect({ url: svc.url, key: svc.keys.import, product });
});
after(() => svc.stop());

test('keys: none is refused; a reader key cannot write; a wrong key is refused', async () => {
  assert.equal((await fetch(`${svc.url}/p/k/next`)).status, 401);
  assert.equal((await fetch(`${svc.url}/p/k/next`, { headers: { authorization: 'Bearer not-a-key-at-all-xxxxxx' } })).status, 401);
  await assert.rejects(r('k').append('slots.set', { number: 3 }), (e) => e.status === 403);
  assert.ok((await r('k').next()).charter);
});

test('idempotency: the same key twice records once; the same key with another body is refused', async () => {
  const c = w('idem');
  const a = await c.append('slots.set', { number: 4 }, { key: 'idem-key-1' });
  const b = await c.append('slots.set', { number: 4 }, { key: 'idem-key-1' });
  assert.equal(a.seq, b.seq);
  assert.equal(b.duplicate, true);
  await assert.rejects(c.append('slots.set', { number: 5 }, { key: 'idem-key-1' }), (e) => e.status === 409);
  assert.equal((await c.stats()).events, 1);
});

test('concurrent writers: 200 parallel events, none lost or doubled; 200 parallel with 100 keys sent twice record 100', async () => {
  const c = w('conc');
  const res = await Promise.all(Array.from({ length: 200 }, (_, i) => c.append('work.waiting', { module: `m${i % 7}`, kind: 'flaw', ref: `f${i}` }, { key: `conc-key-${i}` })));
  const seqs = res.map((x) => x.seq).sort((a, b) => a - b);
  assert.deepEqual(seqs, Array.from({ length: 200 }, (_, i) => i + 1));
  const all = await c.events({ limit: 1000 });
  assert.equal(all.length, 200);
  assert.equal(new Set(all.map((e) => e.key)).size, 200);
  const c2 = w('conc2');
  const res2 = await Promise.all(Array.from({ length: 200 }, (_, i) => c2.append('work.waiting', { module: 'm', kind: 'flaw', ref: `g${i % 100}` }, { key: `dup-key-${i % 100}` })));
  assert.equal(res2.filter((x) => x.duplicate).length, 100);
  assert.equal((await c2.stats()).events, 100);
});

test('clock: the object stamps time; a writer may not give one; an import key may (a replay)', async () => {
  const before = Date.now();
  const a = await w('clock').append('slots.set', { number: 2 });
  assert.ok(Date.parse(a.at) >= before - 1000 && Date.parse(a.at) <= Date.now() + 1000);
  await assert.rejects(w('clock').append('slots.set', { number: 2 }, { at: '2020-01-01T00:00:00.000Z' }), (e) => e.status === 403);
  await assert.rejects(imp('clock').append('slots.set', { number: 2 }, { at: '2020-01-01T00:00:00.000Z' }), (e) => e.status === 409); // older than the live event
  const b = await imp('clock-import').append('slots.set', { number: 2 }, { at: '2020-01-01T00:00:00.000Z' });
  assert.equal(b.at, '2020-01-01T00:00:00.000Z');
  // an import older than the newest event is refused: the views fold in sequence order, which must be time order
  await assert.rejects(imp('clock-import').append('slots.set', { number: 3 }, { at: '2019-01-01T00:00:00.000Z' }), (e) => e.status === 409);
});

test('bad events are refused before anything is written', async () => {
  const c = w('bad');
  await assert.rejects(c.append('no.such', {}), (e) => e.status === 400);
  await assert.rejects(c.append('job.opened', { module: 'x' }), (e) => e.status === 400);
  await assert.rejects(c.append('record.put', { key: 'round', data: 'x'.repeat(300 * 1024) }), (e) => e.status === 413);
  assert.equal((await c.stats()).events, 0);
});

test('records: writeRecord/readRecords as tool/lib/state.mjs has them; a round record of about 90,000 bytes (civicsmith had 89,773) fits in one write', async () => {
  const c = w('rec');
  const round = { scope: { tranche: 't3', holds: [] }, modules: Array.from({ length: 1270 }, (_, i) => ({ module: `module-${i}`, state: 'finished', why: 'pull request merged' })) };
  const size = JSON.stringify(round).length;
  await c.writeRecord('round', round);
  await c.writeRecord('stop', { words: 'stop' });
  const { records } = await c.readRecords();
  assert.deepEqual(records.round.data, round);
  assert.equal(records.stop.data.words, 'stop');
  console.log(`# round record of ${size} bytes written and read back whole`);
});

test('rebuild: refolding the log gives the same views', async () => {
  const c = w('rb');
  await c.append('module.declared', { modules: [{ name: 'a', order: 1, converted: true }, { name: 'b', order: 2, converted: true, uses: ['a'] }] });
  await c.append('job.opened', { pr: 1, module: 'b', session: 'S' });
  await c.append('job.tests', { pr: 1, passed: true });
  await c.append('job.opened', { pr: 2, module: 'a' });
  const q1 = await c.mergeQueue({ now: '2030-01-01T00:00:00.000Z' });
  const rb = await (await fetch(`${svc.url}/p/rb/admin/rebuild`, { method: 'POST', headers: { authorization: `Bearer ${svc.keys.import}` } })).json();
  assert.equal(rb.rebuilt, true);
  assert.deepEqual(await c.mergeQueue({ now: '2030-01-01T00:00:00.000Z' }), q1);
});

test('restart and migration: the log survives a restart; a new reducer version refolds it on start', async () => {
  const dir = mkdtempSync(fileURLToPath(new URL('../.mig-', import.meta.url)));
  const persist = join(dir, 'do');
  const one = await startService({ persist });
  const c = connect({ url: one.url, key: one.keys.writer, product: 'mig' });
  for (let i = 0; i < 20; i++) await c.append('work.waiting', { module: 'm', kind: 'flaw', ref: `r${i}` });
  await one.stop();
  const two = await startService({ persist });
  const s2 = await connect({ url: two.url, key: two.keys.reader, product: 'mig' }).stats();
  assert.equal(s2.events, 20);
  assert.equal(s2.loaded.how, 'snapshot');
  await two.stop();
  // a copy of the source with the reducer's version bumped, as a schema change would
  const src = fileURLToPath(new URL('../src', import.meta.url));
  const copy = join(dir, 'src2');
  cpSync(src, copy, { recursive: true });
  const rf = join(copy, 'reducer.mjs');
  writeFileSync(rf, readFileSync(rf, 'utf8').replace(/REDUCER_VERSION = (\d+)/, (_, n) => `REDUCER_VERSION = ${Number(n) + 1}`));
  const three = await startService({ persist, scriptDir: copy });
  const s3 = await connect({ url: three.url, key: three.keys.reader, product: 'mig' }).stats();
  assert.equal(s3.events, 20);
  assert.match(s3.loaded.how, /refold \(reducer \d+ -> \d+\)/);
  await three.stop();
  rmSync(dir, { recursive: true, force: true });
});

test('sync client: the same calls from synchronous code, as the tool makes them', async () => {
  const c = connectSync({ url: svc.url, key: svc.keys.writer, product: 'sync' });
  const a = c.append('slots.set', { number: 6 });
  const n = c.next();
  assert.equal(a.seq, 1);
  assert.ok(n.charter);
});

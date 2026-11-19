import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchLine, loadModules, notYetMet, ownerOf } from '../lib/config.mjs';
import { Fail, makeGh, parseArgs } from '../lib/util.mjs';
import { config, makeRepo, productFiles } from './helpers.mjs';

const answers = (...rs) => {
  const calls = [];
  return { calls, exec: (args) => { calls.push(args); return rs.shift(); } };
};

test('a rate-limit answer is waited on and tried again', () => {
  const e = answers({ code: 1, stderr: 'HTTP 403: API rate limit exceeded' }, { code: 0, stdout: '{"ok":1}' });
  const waits = [];
  const gh = makeGh({ exec: e.exec, wait: (ms) => waits.push(ms) });
  assert.deepEqual(gh(['api', 'x']), { ok: 1 });
  assert.deepEqual(waits, [60000]);
});

test('a write is tried up to four times again, then fails with GitHub\'s words', () => {
  const e = answers(...Array(6).fill({ code: 1, stderr: 'HTTP 502: Bad Gateway' }));
  const gh = makeGh({ exec: e.exec, wait: () => {} });
  assert.throws(() => gh(['api', 'x']), (err) => err instanceof Fail && /502/.test(err.message));
  assert.equal(e.calls.length, 5);
});

test('any other refusal is not tried again', () => {
  const e = answers({ code: 1, stderr: 'HTTP 422: Validation Failed' });
  const gh = makeGh({ exec: e.exec, wait: () => {} });
  assert.throws(() => gh(['api', 'x']), /422/);
  assert.equal(e.calls.length, 1);
});

test('arguments', () => {
  assert.deepEqual(parseArgs(['push', '--blocked', 'dates', 'why not']), { _: ['push', 'why not'], blocked: 'dates' });
  assert.deepEqual(parseArgs(['open', '--into-main', '--title', 't']), { _: ['open'], 'into-main': true, title: 't' });
});

test('the module list, ownership by the longest path, and requirements not yet met', () => {
  const root = makeRepo(productFiles());
  const mods = loadModules(root, config());
  assert.deepEqual(mods.map((m) => [m.name, m.order]), [['dates', 1], ['orders', 2]]);
  assert.equal(ownerOf(mods, 'src/orders/index.mjs').name, 'orders');
  assert.equal(ownerOf(mods, 'README.md'), null);
  assert.equal(ownerOf([...mods, { name: 'deep', files: ['src/orders/deep/'], tests: [] }], 'src/orders/deep/x.mjs').name, 'deep');
  assert.deepEqual(notYetMet(productFiles()['process/modules/orders.md']), ['R2']);
});

test('the fetch line names the commit once and makes the copy read-only', () => {
  const line = fetchLine(config());
  assert.equal(line.split('a'.repeat(40)).length, 2);
  assert.match(line, /chmod -R a-w \$D$/);
  assert.match(line, /npm ci/);
  assert.ok(Buffer.byteLength(line) < 200);
  assert.throws(() => fetchLine(config({ process: { repository: 'r', commit: 'abc' } })), /40-character/);
});

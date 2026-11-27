import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchLine, loadModules, notYetMet, ownerOf } from '../lib/config.mjs';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Fail, makeGh, methodOf, parseArgs, splitHeaders, writePace } from '../lib/util.mjs';
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

test('a call allowed to fail answers null and keeps GitHub\'s words until the next call', () => {
  const e = answers({ code: 1, stderr: 'gh: Validation Failed (HTTP 422)\nbody is too long' }, { code: 0, stdout: '{"ok":1}' });
  const gh = makeGh({ exec: e.exec, wait: () => {} });
  assert.equal(gh(['api', 'x'], { allowFail: true }), null);
  assert.equal(gh.refused, 'gh: Validation Failed (HTTP 422) body is too long');
  gh(['api', 'y']);
  assert.equal(gh.refused, null);
});

test('a refusal keeps GitHub\'s own message from standard output, thrown or kept', () => {
  const body = JSON.stringify({ message: 'Validation Failed', errors: [{ resource: 'IssueComment', code: 'custom', field: 'body', message: 'body is too long (maximum is 65536 characters)' }], status: '422' });
  const refused = { code: 1, stderr: 'gh: Validation Failed (HTTP 422)', stdout: body };
  const gh = makeGh({ exec: answers(refused, refused).exec, wait: () => {} });
  const words = 'gh: Validation Failed (HTTP 422); GitHub said: Validation Failed; body is too long (maximum is 65536 characters)';
  assert.throws(() => gh(['api', 'x']), (e) => e instanceof Fail && e.message === `GitHub refused: ${words}`);
  assert.equal(gh(['api', 'x'], { allowFail: true }), null);
  assert.equal(gh.refused, words);
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

test('the fetch line names the commit once and ends with the install', () => {
  const line = fetchLine(config());
  assert.equal(line.split('a'.repeat(40)).length, 2);
  assert.match(line, /npm ci -s\)$/);
  assert.doesNotMatch(line, /chmod/);
  assert.match(line, /npm ci/);
  assert.ok(Buffer.byteLength(line) < 200);
  assert.throws(() => fetchLine(config({ process: { repository: 'r', commit: 'abc' } })), /40-character/);
});

// G1 and G2 (the owner's decision, 27 Nov 2026): content-creating writes are paced across this machine's p4 commands;
// a rate-limited call waits as GitHub says, from the answer's headers.
const clock = (start = Date.parse('2026-11-27T10:00:00Z')) => {
  const c = { t: start, waits: [] };
  c.nowMs = () => c.t;
  c.wait = (ms) => { c.waits.push(ms); c.t += ms; };
  return c;
};
const paceFile = () => join(mkdtempSync(join(tmpdir(), 'p4-pace-')), 'writes.json');
const headed = (status, headers, body) => `HTTP/2.0 ${status}\n${Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${body}`;
const LIMITED = 'gh: You have exceeded a secondary rate limit and have been temporarily blocked from content creation. (HTTP 403)';

test('every write starts at least a second after the last write of any p4 command on this machine; reads are not paced', () => {
  const c = clock();
  const file = paceFile();
  const calls = [];
  const exec = (args) => { calls.push([c.t, args]); return { code: 0, stdout: methodOf(args) === 'GET' ? '{"r":1}' : headed('201 Created', { 'Content-Type': 'application/json' }, '{"id":5}') }; };
  const gh = makeGh({ exec, wait: c.wait, nowMs: c.nowMs, paceFile: file });
  // another p4 command on the same machine, sharing the file
  const other = makeGh({ exec, wait: c.wait, nowMs: c.nowMs, paceFile: file });
  assert.deepEqual(gh(['api', '-X', 'POST', 'repos/o/p/issues/1/comments', '--input', '-'], { input: '{}' }), { id: 5 });
  assert.deepEqual(gh(['api', 'repos/o/p/pulls/1']), { r: 1 });
  assert.deepEqual(gh(['api', 'repos/o/p/pulls/2']), { r: 1 });
  other(['api', '-X', 'PATCH', 'repos/o/p/issues/comments/9', '--input', '-'], { input: '{}' });
  c.t += 5000;
  gh(['api', '--method', 'PUT', 'repos/o/p/pulls/1/merge', '--input', '-'], { input: '{}' });
  assert.deepEqual(c.waits, [1000]);
  const writes = calls.filter(([, a]) => methodOf(a) !== 'GET');
  assert.deepEqual(writes.map(([t]) => t - writes[0][0]), [0, 1000, 6000]);
  // a write asks for the answer's headers; a read does not
  assert.ok(writes.every(([, a]) => a[1] === '-i'));
  assert.ok(calls.filter(([, a]) => methodOf(a) === 'GET').every(([, a]) => !a.includes('-i')));
});

test('writePace never gives two writes the same start, and waits outside its lock', () => {
  const c = clock();
  const file = paceFile();
  for (let i = 0; i < 3; i++) writePace({ file, nowMs: c.nowMs, wait: () => {} });
  assert.equal(JSON.parse(readFileSync(file, 'utf8')).last, c.t + 2000);
  assert.equal(existsSync(`${file}.lock`), false);
});

test('a rate-limited write waits the retry-after its headers give', () => {
  const c = clock();
  const e = answers({ code: 1, stderr: LIMITED, stdout: headed('403 Forbidden', { 'Retry-After': '30' }, '{"message":"You have exceeded a secondary rate limit"}') },
    { code: 0, stdout: headed('201 Created', {}, '{"id":1}') });
  const gh = makeGh({ exec: e.exec, wait: c.wait, nowMs: c.nowMs, pace: () => {} });
  assert.deepEqual(gh(['api', '-X', 'POST', 'x', '--input', '-']), { id: 1 });
  assert.deepEqual(c.waits, [30000]);
});

test('with no retry-after and x-ratelimit-remaining 0, it waits until x-ratelimit-reset', () => {
  const c = clock();
  const reset = Math.floor(c.t / 1000) + 200;
  const e = answers({ code: 1, stderr: 'gh: API rate limit exceeded (HTTP 403)', stdout: headed('403 Forbidden', { 'X-Ratelimit-Remaining': '0', 'X-Ratelimit-Reset': String(reset) }, '{}') },
    { code: 0, stdout: headed('200 OK', {}, '{"ok":1}') });
  const gh = makeGh({ exec: e.exec, wait: c.wait, nowMs: c.nowMs, pace: () => {} });
  assert.deepEqual(gh(['api', '-X', 'PATCH', 'x', '--input', '-']), { ok: 1 });
  assert.deepEqual(c.waits, [reset * 1000 - Date.parse('2026-11-27T10:00:00Z') + 1000]);
});

test('otherwise a minute, doubling each time; after the fourth wait it fails, naming the time after which to run again; every write is paced', () => {
  const c = clock();
  const e = answers(...Array(6).fill({ code: 1, stderr: LIMITED, stdout: headed('403 Forbidden', { 'X-Ratelimit-Remaining': '4000' }, '{"message":"You have exceeded a secondary rate limit"}') }));
  let paced = 0;
  const gh = makeGh({ exec: e.exec, wait: c.wait, nowMs: c.nowMs, pace: () => { paced++; } });
  assert.throws(() => gh(['api', '-X', 'POST', 'x', '--input', '-'], { allowFail: true }),
    (err) => err instanceof Fail && /secondary rate limit/.test(err.message) && /run the command again after 2026-11-27T10:31:00Z$/.test(err.message));
  assert.deepEqual(c.waits, [60000, 120000, 240000, 480000]);
  assert.equal(e.calls.length, 5);
  assert.equal(paced, 5);
});

test('a server error is still tried again after 5, 10, 15 and 20 seconds; the headers are taken off what a write hands back', () => {
  const c = clock();
  const e = answers({ code: 1, stderr: 'gh: HTTP 502: Bad Gateway' }, { code: 0, stdout: headed('200 OK', { Server: 'GitHub.com' }, '') });
  const gh = makeGh({ exec: e.exec, wait: c.wait, nowMs: c.nowMs, pace: () => {} });
  assert.equal(gh(['api', '-X', 'POST', 'x']), null);
  assert.deepEqual(c.waits, [5000]);
  // a caller that asks for the headers itself gets them
  const f = answers({ code: 0, stdout: headed('201 Created', {}, '') });
  assert.match(makeGh({ exec: f.exec, wait: c.wait, nowMs: c.nowMs, pace: () => {} })(['api', '-i', '-X', 'POST', 'y']), /^HTTP\/2\.0 201/);
  assert.deepEqual(splitHeaders('HTTP/2.0 403 Forbidden\r\nRetry-After: 7\r\n\r\n{"a":1}'), { headers: { 'retry-after': '7' }, body: '{"a":1}' });
});

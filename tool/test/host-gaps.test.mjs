// The owner's decision of 27 Nov 2026, H, J and N: a gap in the tool's description of the host never refuses code, and a
// note standing only on one is not kept (H); the reading faults the jobs reported, corrected where the tool contradicted
// build text 2c (J); the host facilities they reported, described and classified (N).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadTree } from '../lib/notice/model.mjs';
import { check } from '../lib/notice/check.mjs';
import { hostFacilities } from '../lib/notice/refs.mjs';
import { usesReading } from '../lib/usescmd.mjs';
import { caseProduct, read } from './refs-helpers.mjs';

const outside = (r, rule) => r.outside.filter((o) => !rule || o.rule === rule);
const at = (r, rule) => outside(r, rule).map((o) => `${o.rule} ${o.line}${o.unknownHost ? ' host' : ''}`);

test('N: new TextDecoder("utf-16le", { fatal: true }) and .decode(bytes, { stream: true }) read clean, in the reading and the check', () => {
  const root = caseProduct({ 'src/u/index.mjs': `/** @param {Uint8Array} bytes @returns {string} */
export function utf16(bytes) {
  const d = new TextDecoder('utf-16le', { fatal: true });
  return d.decode(bytes, { stream: true }) + d.encoding + String(d.fatal && d.ignoreBOM) + String(globalThis.TextDecoder === TextDecoder);
}
` });
  const r = read(root, 'u');
  assert.deepEqual(r.outside.filter((o) => !(o.rule === 'R14' && /reaches out/.test(o.what))), []);
  const c = check(loadTree(root), 'u');
  assert.deepEqual(c.refusals, []);
  assert.deepEqual(c.cannotTell, []);
  for (const f of ['TextDecoder', 'TextDecoder.decode', 'TextDecoder.encoding', 'TextDecoder.fatal', 'TextDecoder.ignoreBOM']) assert.equal(hostFacilities().get(f), 'in', f);
});

test('N: the facilities the jobs reported are described and classified, those that reach out as out', () => {
  const root = caseProduct({ 'src/u/index.mjs': `import { gzipSync, constants } from 'node:zlib';
import { webcrypto, createPrivateKey, createPublicKey, sign, verify, KeyObject, createCipheriv, createDecipheriv, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { lstatSync, chmodSync, chownSync, openSync, closeSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
/** @param {Uint8Array} bytes @returns {Promise<string>} */
export async function all(bytes) {
  const z = gzipSync(bytes, { level: constants.Z_BEST_SPEED });
  const h = await crypto.subtle.digest('SHA-256', bytes);
  const h2 = await webcrypto.subtle.digest('SHA-256', bytes);
  const k = createPrivateKey('pem');
  const pub = createPublicKey(k);
  const s = sign(null, bytes, k);
  const ok = verify(null, bytes, pub, s) && k instanceof KeyObject;
  const c = createCipheriv('aes-256-gcm', bytes, bytes); c.update(bytes); c.final();
  const dc = createDecipheriv('aes-256-gcm', bytes, bytes); dc.setAuthTag(bytes);
  const dig = createHash('sha256').update(bytes).digest();
  const b = Buffer.of(1, 2, 3); const n = b.readUInt32BE(0); b.writeUIntLE(1, 0, 2);
  const out = spawnSync('ls', []).output;
  const mode = lstatSync('/x').mode; chmodSync('/x', 0o644); chownSync('/x', 1, 1); closeSync(openSync('/x', 'r')); rmSync('/x', { maxRetries: 3 });
  const uid = process.getuid?.(); const mem = process.memoryUsage().rss; const cpu = process.cpuUsage().user;
  process.stdout.write(bytes); process.stdout.once('drain', () => {}); process.stdout.end(() => {});
  const blob = new Blob([bytes]); const ab = await blob.arrayBuffer();
  const reader = blob.stream().pipeThrough(new DecompressionStream('gzip')).getReader(); const chunk = await reader.read();
  const cs = new CompressionStream('gzip');
  const dgs = new crypto.DigestStream('SHA-256');
  const a = atob(btoa('x'));
  const row = new DatabaseSync(':memory:').prepare('select 1').get();
  const srv = createServer((req, res) => { res.writeHead(200); res.end(String(req.url)); });
  const nx = [1].values().next(); const done = nx.done;
  return [z, h, h2, ok, dig, n, out, mode, uid, mem, cpu, ab, chunk.done, cs, dgs, a, row, srv, done].join();
}
` });
  const r = read(root, 'u');
  // nothing left out of the description or the classification; closeSync takes a descriptor, not a path (no S5)
  assert.deepEqual(r.outside.filter((o) => !(o.rule === 'R14' && /reaches out/.test(o.what))).map((o) => `${o.rule} ${o.line} ${o.what}`), []);
  assert.deepEqual(check(loadTree(root), 'u').refusals, []);
  const cls = hostFacilities();
  for (const f of ['atob', 'btoa', 'Blob', 'ReadableStream.pipeThrough', 'DecompressionStream', 'CompressionStream', 'crypto.subtle', 'SubtleCrypto.digest',
    'crypto.DigestStream', 'node:crypto.createPrivateKey', 'node:crypto.verify', 'node:crypto.KeyObject', 'node:crypto.createCipheriv', 'node:crypto.webcrypto',
    'BufferConstructor.of', 'Buffer.readUInt32BE', 'Buffer.writeUIntLE', 'node:zlib.gzipSync', 'NodeSpawnResult.output', 'NodeStats.mode', 'IteratorResult.done', 'IteratorResult.value']) {
    assert.equal(cls.get(f), 'in', f);
  }
  for (const f of ['node:crypto.sign', 'SubtleCrypto.sign', 'SubtleCrypto.encrypt', 'node:http.createServer', 'node:sqlite.DatabaseSync', 'NodeStatementSync.get',
    'node:fs.lstatSync', 'node:fs.chmodSync', 'node:fs.openSync', 'NodeProcess.getuid', 'NodeProcess.memoryUsage', 'NodeProcess.cpuUsage', 'NodeWritable.once', 'crypto.randomUUID']) {
    assert.equal(cls.get(f), 'out', f);
  }
});

test('H: a complaint that rests only on the host\'s description is "cannot tell" in the check, even beside the module\'s own comments', () => {
  // URL takes at most two arguments in the tool's description; the third is the module's own stated parameter, which
  // made this refusal (a) before
  const root = caseProduct({ 'src/u/index.mjs': `/** @param {string} label @param {{ fatal: boolean }} opts @returns {URL} */
export const f = (label, opts) => new URL(label, 'http://x/', opts);
/** @param {string} s @returns {number} */
export const g = (s) => s.length;
/** @returns {number} */
export const h = () => g(3);
` });
  const c = check(loadTree(root), 'u');
  assert.deepEqual(c.refusals.map((x) => x.at), ['src/u/index.mjs:6']);
  assert.ok(c.cannotTell.some((x) => x.at === 'src/u/index.mjs:2' && x.code === 2554 && /the tool's description of it/.test(x.why)), JSON.stringify(c.cannotTell));
});

test('H: a value of kind any that only a gap in the host\'s description makes is a note on the host, not kept; any other is kept', () => {
  const root = caseProduct({ 'src/u/index.mjs': `import dgram from 'node:dgram';
/** @returns {Promise<unknown>} */
export async function gaps() {
  const usage = process.resourceUsage();
  const { resourceUsage } = process;
  const key = await crypto.subtle.generateKey('AES-GCM', true, []);
  return [usage.maxRSS, resourceUsage, key.type, dgram.createSocket('udp4')];
}
/** @returns {void} */
export function listen() { process.on('x', (v) => { console.log(v.a); }); }
` });
  const r = read(root, 'u');
  assert.deepEqual(at(r, 'R1'), ['R1 4 host', 'R1 6 host', 'R1 7 host', 'R1 10']);
  assert.ok(at(r, 'S4').every((x) => x.endsWith(' host')), at(r, 'S4').join(', '));
  const { data } = usesReading(loadTree(root), 'u', 'a'.repeat(40));
  assert.deepEqual(data.outside.filter((o) => o.rule === 'R1' || o.rule === 'S4').map((o) => `${o.rule} ${o.line}`), ['R1 10']);
});

test('H: a loop\'s label is never read as a value, beside a const of the same name', () => {
  const root = caseProduct({ 'src/u/index.mjs': `/** @param {number[][]} rows @returns {number} */
export function find(rows) {
  const outer = 3;
  let n = 0;
  outer: for (const r of rows) { for (const x of r) { if (x === outer) break outer; n++; } }
  return n;
}
` });
  assert.deepEqual(at(read(root, 'u'), 'R1'), []);
});

test('J: the module\'s own data, a file it wrote in a folder it made, its own program\'s output and its own map are its own channel (R2); a caller\'s are not', () => {
  const root = caseProduct({
    'src/u/data.mjs': 'export const DATA = \'{"a":1}\';\n',
    'src/u/child.mjs': 'process.stdout.write(\'{"a":1}\');\n',
    'src/a/index.mjs': 'export const other = \'{}\';\n',
    'src/u/index.mjs': `import { DATA } from './data.mjs';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { other } from '../a/index.mjs';
/** @returns {unknown} */
export function a() { const v = JSON.parse(DATA); return v.a; }
/** @returns {unknown} */
export function b() { const dir = mkdtempSync(join(tmpdir(), 'u-')); const f = join(dir, 'x.json'); writeFileSync(f, '{}'); const v = JSON.parse(readFileSync(f, 'utf8')); return v.a; }
const CHILD = fileURLToPath(new URL('./child.mjs', import.meta.url));
/** @returns {unknown} */
export function c() { const r = spawnSync(process.execPath, [CHILD], { encoding: 'utf8' }); const v = JSON.parse(r.stdout); return v.a; }
/** @type {Map<string, unknown>} */
const cache = new Map();
/** @param {string} k @returns {unknown} */
export function d(k) { cache.set(k, 1); const v = cache.get(k); return v.a; }
/** @param {Map<string, unknown>} m @param {string} k @returns {unknown} */
export function e(m, k) { const v = m.get(k); return v.a; }
/** @param {string} dir @returns {unknown} */
export function f(dir) { const v = JSON.parse(readFileSync(join(dir, 'p.json'), 'utf8')); return v.a; }
/** @returns {unknown} */
export function g() { const v = JSON.parse(other); return v.a; }
/** @param {string} s @returns {unknown} */
export function h(s) { const r = spawnSync(process.execPath, [s], { encoding: 'utf8' }); const v = JSON.parse(r.stdout); return v.a; }
`,
  }, { order: ['a', 'u'] });
  // a map handed in (20), a folder the caller names (22), another module's data (24), a program the caller names (26)
  assert.deepEqual(at(read(root, 'u'), 'R2'), ['R2 20', 'R2 22', 'R2 24', 'R2 26']);
});

test('J: a member keyed by a well-known symbol is looked up by its own name (R17); one really dropped is still a place', () => {
  const root = caseProduct({ 'src/u/index.mjs': `/** @typedef {{ name: string, [Symbol.asyncIterator]: () => AsyncIterator<string> }} Lines */
/** @returns {Lines} */
function make() { const it = { name: 'x', async *[Symbol.asyncIterator]() { yield 'a'; } }; return it; }
/** @type {AsyncIterable<string>} */
export const lines = make();
/** @type {Iterable<number>} */
export const nums = { *[Symbol.iterator]() { yield 1; } };
/** @type {{ name: string }} */
export const named = make();
` });
  const r = read(root, 'u');
  assert.deepEqual(outside(r, 'R17').map((o) => `${o.line} ${o.what}`), ['9 a value given a stated type: drops [Symbol.asyncIterator], which the language calls by itself']);
});

test('J: "Object is possibly \'null\'" (2531) is "cannot tell", as 2532, 18047 and 18048 are', () => {
  const root = caseProduct({ 'src/u/index.mjs': `/** @returns {{ a: string } | null} */
function g() { return null; }
/** @returns {string} */
export const h = () => g().a;
` });
  const c = check(loadTree(root), 'u');
  assert.deepEqual(c.refusals, []);
  assert.deepEqual(c.cannotTell.map((x) => x.code), [2531]);
});

test('J: a deliberately bad input in a function stored before and handed to assert.throws or assert.rejects is "cannot tell", never a disagreement', () => {
  const root = caseProduct({
    'src/u/index.mjs': `/** @param {string} s @returns {number} */\nexport function len(s) { if (typeof s !== 'string') throw new TypeError('s'); return s.length; }\n`,
    'test/u/index.test.mjs': `import assert from 'node:assert/strict';
import { test } from 'node:test';
import { len } from '../../src/u/index.mjs';
test('bad', () => {
  const bad = () => len(3);
  assert.throws(bad, TypeError);
  const cases = [() => len(null)];
  for (const c of cases) assert.throws(c);
  const later = async () => len(4);
  return assert.rejects(later);
});
`,
  });
  const c = check(loadTree(root), 'u');
  assert.deepEqual(c.refusals, []);
  assert.deepEqual(c.cannotTell.filter((x) => x.code === 2345).map((x) => x.at), ['test/u/index.test.mjs:5', 'test/u/index.test.mjs:7', 'test/u/index.test.mjs:9']);
  assert.deepEqual(at(read(root, 'u'), 'S4'), []);
});

test('J: a guard TypeScript infers (5.5) is no hand-written guard (R3); a written one still is', () => {
  const root = caseProduct({ 'src/u/index.mjs': `/** @param {unknown[]} xs @returns {number[]} */
export function nums(xs) { return xs.filter((x) => typeof x === 'number'); }
/** @param {unknown} x @returns {x is number} */
export const isNum = (x) => typeof x === 'number';
` });
  assert.deepEqual(at(read(root, 'u'), 'R3'), ['R3 4']);
});

// The reference reader under the coding standard (notice/refs.mjs; design part 2, section 7): the 27 cases of
// process/research/uses-metadata-25nov/every-reference.md and the holes of study-references.md §2.4, each a reference
// that today's settings hide and that the rules find, as a use or as a place outside the standard; ordinary code that
// keeps the standard raises nothing. Then the path rule (S5), order faults, copies (S13), test names (S12), the uses
// file's form, and push writing it.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { loadTree } from '../lib/notice/model.mjs';
import { loadReader, makeProgram, ts } from '../lib/notice/ts.mjs';
import { check } from '../lib/notice/check.mjs';
import { push } from '../lib/commands.mjs';
import { usesCmd, usesData } from '../lib/usescmd.mjs';
import { readUses, sameUses, usesPath, writeUses } from '../lib/usesfile.mjs';
import { git } from '../lib/util.mjs';
import { caseProduct, places, read, usesOf } from './refs-helpers.mjs';
import { commit, config, ctxFor, fakeGitHub, makeRepo, write } from './helpers.mjs';

// The providers of every case: a (animals), c (Cat), d (Dog), p (rows, amounts, words), q (a module that passes p's on).
const A = `export class Animal {
  constructor() { /** @type {string} */ this.name = 'animal'; }
}
/** @typedef {{ handle(a: Animal): void }} Handler */
/** @typedef {{ pet: Animal }} Box */
/**
 * @template T
 * @typedef {{ put(x: T): void, get(): T }} Holder
 */
export class Base {
  /**
   * @param {Animal} a
   * @returns {void}
   */
  handle(a) { void a; }
}
/**
 * @param {(x: number) => void} cb
 * @returns {void}
 */
export function each(cb) { cb(1); }
`;
const C = `import { Animal } from '../a/index.mjs';
export class Cat extends Animal {
  /** @returns {string} */
  meow() { return 'meow'; }
}
`;
const D = `import { Animal } from '../a/index.mjs';
export class Dog extends Animal {
  /** @returns {string} */
  bark() { return 'woof'; }
}
`;
const P = `/** @typedef {{ id: number, name: string }} Row */
/** @typedef {string & { readonly __kind: 'p.RowText' }} RowText */
/** @typedef {{ a: number, then(resolve: (v: string) => void): void }} Lazy */
/** @returns {Row[]} */
export function make() { return [{ id: 1, name: 'one' }]; }
export class PError extends Error {
  /** @param {string} code */
  constructor(code) { super(code); /** @type {string} */ this.code = code; }
}
/**
 * @param {unknown} x
 * @returns {Row}
 */
export function readRow(x) {
  if (typeof x === 'object' && x !== null && 'id' in x && 'name' in x && typeof x.id === 'number' && typeof x.name === 'string') return { id: x.id, name: x.name };
  throw new PError('not a row');
}
/**
 * @param {Row} r
 * @returns {RowText}
 */
export function encode(r) { return /** @type {RowText} */ (JSON.stringify(r)); }
/**
 * @param {RowText} t
 * @returns {Row}
 */
export function decode(t) { return readRow(JSON.parse(t)); }
export class Amount {
  /** @param {number} n */
  constructor(n) { /** @type {number} */ this.n = n; }
  /** @returns {string} */
  toString() { return String(this.n); }
  /** @returns {string} */
  format() { return 'GBP ' + String(this.n / 100); }
}
export class Gauge {
  /** @returns {number | string} */
  get value() { return Math.random() > 0.5 ? 1 : 'cat'; }
}
/** @type {unknown[]} */
const store = [];
/** @returns {unknown} */
export function take() { return store.pop(); }
/** @returns {Lazy} */
export function lazy() { return { a: 1, then(resolve) { resolve('from-then'); } }; }
/** @returns {string} */
export function dataPath() { return new URL('./data.json', import.meta.url).pathname; }
export const TITLE = 'Price list';
export const LIMIT = 250;
export const OP_PRICE = 'priceof';
export const WORDS = { title: 'Price list', empty: 'Nothing to price yet' };
`;
const Q = `import { make, encode } from '../p/index.mjs';
import { Cat } from '../c/index.mjs';
import { Dog } from '../d/index.mjs';
/** @import { Row, RowText } from '../p/index.mjs' */
/** @returns {Row[]} */
export function rows() { return make(); }
/** @returns {string} */
export function text() { return JSON.stringify(make()); }
/** @returns {RowText} */
export function encoded() { return encode({ id: 2, name: 'two' }); }
/** @returns {Array<Cat | Dog>} */
export function pets() { return [new Cat(), new Dog()]; }
`;
const BASE = { 'src/a/index.mjs': A, 'src/c/index.mjs': C, 'src/d/index.mjs': D, 'src/p/index.mjs': P, 'src/q/index.mjs': Q };
const product = (u, more = {}) => caseProduct({ ...BASE, 'src/u/index.mjs': u, ...more });
const lines = (r, rule) => r.outside.filter((o) => o.rule === rule && o.file === 'src/u/index.mjs').map((o) => o.line);

/** Today's settings (the check's, ts.mjs options()) on the user's files: the checker's complaints there. */
function todayComplaints(root) {
  loadReader();
  const tree = loadTree(root);
  const program = makeProgram(tree.byId.get('u').files);
  return tree.byId.get('u').files.flatMap((f) => program.getSemanticDiagnostics(program.getSourceFile(f)));
}

// ---- the 27 cases ----

const CASES = [
  // A: values from channels without a kind, and kinds of one's own
  { id: 'A1 a cast of decoded foreign data', rule: 'R2', line: 5, u: `import { text } from '../q/index.mjs';
/** @typedef {{ id: number, name: string }} MyRow */
/** @returns {string} */
export function name() {
  const v = /** @type {MyRow} */ (JSON.parse(text()));
  return v.name;
}
` },
  { id: 'A2 narrowing of decoded foreign data', rule: 'R2', line: 5, u: `import { text } from '../q/index.mjs';
/** @returns {string} */
export function name() {
  const v = JSON.parse(text());
  if (typeof v === 'object' && v !== null && 'name' in v) return String(v.name);
  return '';
}
` },
  { id: 'A3 a message of kind any', rule: 'R1', line: 5, node: true, u: `import { parentPort } from 'node:worker_threads';
/** @type {string[]} */
export const seen = [];
parentPort?.on('message', (data) => {
  seen.push(data.name);
});
` },
  { id: 'A4 an environment value another module owns', rule: 'R12', line: 2, u: `/** @returns {string} */
export function url() { return process.env.PRICE_URL ?? ''; }
` },
  { id: 'A5 a guard written over values of c and d', rule: 'R3', line: 9, found: ['c:Cat'], u: `import { pets } from '../q/index.mjs';
/** @import { Cat } from '../c/index.mjs' */
/** @import { Dog } from '../d/index.mjs' */
/** a guard of its own, claiming c's kind for what d may hand out */
/**
 * @param {Cat | Dog} x
 * @returns {x is Cat}
 */
function isCat(x) { return 'meow' in x; }
/** @returns {string[]} */
export function sounds() { return pets().filter(isCat).map((c) => c.meow()); }
` },
  { id: 'A6 an own copy of a kind handed on', found: ['p:Row'], via: { provider: 'p', item: 'Row', route: { via: 'q', item: 'rows' } }, u: `import { rows } from '../q/index.mjs';
/** @typedef {{ id: number, name: string }} MyRow */
/** @returns {string[]} */
export function names() {
  /** @type {MyRow[]} */
  const mine = rows();
  return mine.map((r) => r.name);
}
` },
  // B: the checker's unsound points
  { id: 'B1 method-parameter bivariance in a kind', rule: 'R5', line: 4, u: `import { Dog } from '../d/index.mjs';
/** @import { Handler } from '../a/index.mjs' */
/** @type {Handler} */
export const h = {
  /** @param {Dog} d @returns {void} */
  handle(d) { d.bark(); },
};
` },
  { id: 'B1b a class override narrowing its parameter', rule: 'R5', line: 5, u: `import { Base } from '../a/index.mjs';
import { Dog } from '../d/index.mjs';
export class MyHandler extends Base {
  /** @param {Dog} d @returns {void} */
  handle(d) { d.bark(); }
}
` },
  { id: 'B2 a writable list of dogs given the kind of a list of animals', rule: 'R6', line: 8, u: `import { Dog } from '../d/index.mjs';
import { Cat } from '../c/index.mjs';
/** @import { Animal } from '../a/index.mjs' */
/** @returns {Dog[]} */
export function mix() {
  const dogs = [new Dog()];
  /** @type {Animal[]} */
  const animals = dogs;
  animals.push(new Cat());
  return dogs;
}
` },
  { id: 'B2b a writable member covariant', rule: 'R6', line: 8, u: `import { Dog } from '../d/index.mjs';
/** @import { Box } from '../a/index.mjs' */
/** @returns {Box} */
export function box() {
  /** @type {{ pet: Dog }} */
  const mine = { pet: new Dog() };
  /** @type {Box} */
  const theirs = mine;
  return theirs;
}
` },
  { id: 'B11 width into an optional member', rule: 'R6', line: 8, u: `import { make } from '../p/index.mjs';
/** @import { Cat } from '../c/index.mjs' */
/** @returns {string} */
export function f() {
  for (const row of make()) {
    /** @type {{}} */
    const w = row;
    const n = /** @type {{ name?: Cat }} */ (w);
    const cat = n.name;
    return cat ? cat.meow() : '';
  }
  return '';
}
` },
  { id: 'B5 an extra optional parameter', rule: 'R7', line: 5, u: `import { each } from '../a/index.mjs';
/** @import { Row } from '../p/index.mjs' */
/** @returns {void} */
export function go() {
  each(/** @param {number} x @param {Row} [r] @returns {void} */ (x, r) => { void x; void r; });
}
` },
  { id: 'B6 a narrowed member path kept across a call', rule: 'R19', line: 11, u: `import { Dog } from '../d/index.mjs';
/** @import { Box } from '../a/index.mjs' */
/**
 * @param {Box} b
 * @param {(b: Box) => void} f
 * @returns {string}
 */
export function check(b, f) {
  if (b.pet instanceof Dog) {
    f(b);
    return b.pet.bark();
  }
  return '';
}
` },
  { id: 'B6b a narrowed variable a closure assigns', rule: 'R19', line: 11, u: `import { Dog } from '../d/index.mjs';
import { Cat } from '../c/index.mjs';
import { Animal } from '../a/index.mjs';
/** @returns {string} */
export function check() {
  /** @type {Animal} */
  let a = new Dog();
  const reset = () => { a = new Cat(); };
  if (a instanceof Dog) {
    reset();
    return a.bark();
  }
  return '';
}
` },
  { id: 'B7 new Map() holds any', rule: 'R1', line: 4, u: `import { make } from '../p/index.mjs';
/** @returns {string} */
export function f() {
  const m = new Map();
  for (const r of make()) m.set('k', r);
  const got = m.get('k');
  return got.name;
}
` },
  { id: 'B8 a caught value', rule: 'R2', line: 4, u: `import { readRow } from '../p/index.mjs';
/** @returns {string} */
export function f() {
  try { readRow(1); return ''; } catch (e) { return e.code; }
}
` },
  { id: 'B9 a suppression comment', rule: 'R10', u: `/** @returns {number} */
export function f() {
  // @ts-ignore
  const x = /** @type {number} */ ('a');
  return x;
}
` },
  { id: 'B10 a member the language calls by itself', found: ['p:Amount#toString implicit'], u: `import { Amount } from '../p/index.mjs';
/** @returns {string} */
export function f() { return \`\${new Amount(5)}\`; }
` },
  { id: 'B4 Object.assign onto another module\'s value', rule: 'R8', line: 6, found: ['p:Row read'], u: `import { make } from '../p/index.mjs';
/** @returns {number} */
export function f() {
  let n = 0;
  for (const row of make()) {
    Object.assign(row, { name: 'patched' });
    const copy = Object.assign({}, row);
    n += copy.id;
  }
  return n;
}
` },
  { id: 'B3 an index read (found before and after)', found: ['p:Row read'], u: `import { make } from '../p/index.mjs';
/** @returns {string} */
export function f() { const rows = make(); return rows[5].name; }
` },
  { id: 'C1 a structured copy (found before and after)', found: ['p:Amount#format call'], u: `import { Amount } from '../p/index.mjs';
/** @returns {string} */
export function f() { return structuredClone(new Amount(1)).format(); }
` },
  { id: 'D1 a store of kind unknown, cast to an own kind', rule: 'R2', line: 4, u: `import { take } from '../p/index.mjs';
/** @typedef {{ id: number }} Mine */
/** @returns {number} */
export function f() { const m = /** @type {Mine} */ (take()); return m.id; }
` },
  // the converted forms
  { id: 'A1 converted: the owner\'s reader', none: true, found: ['p:Row', 'p:readRow'], u: `import { text } from '../q/index.mjs';
import { readRow } from '../p/index.mjs';
/** @returns {string} */
export function name() { return readRow(JSON.parse(text())).name; }
` },
  { id: 'A2 converted: a branded text, decoded by its owner', none: true, found: ['p:RowText', 'p:decode'], u: `import { encoded } from '../q/index.mjs';
import { decode } from '../p/index.mjs';
/** @returns {string} */
export function name() { return decode(encoded()).name; }
` },
  // study-references §2.4: the holes R1 to R12 left open
  { id: 'x1 a downcast', rule: 'R16', line: 6, u: `import { Animal } from '../a/index.mjs';
/**
 * @param {Animal} an
 * @returns {string}
 */
export function f(an) { return /** @type {import('../d/index.mjs').Dog} */ (an).bark(); }
` },
  { id: 'w1 then hidden by width', rule: 'R17', line: 5, u: `import { lazy } from '../p/index.mjs';
/** @returns {Promise<number>} */
export async function f() {
  /** @type {{ a: number }} */
  const x = lazy();
  const y = await x;
  return y.a;
}
` },
  { id: 'w3 Object.values re-exposes members a kind hides', rule: 'R17', line: 3, u: `import { make } from '../p/index.mjs';
/** @returns {number} */
export function f() { let n = 0; for (const r of make()) n += Object.values(r).length; return n; }
` },
  { id: 'w6 a receiver of another kind given to call', rule: 'R18', line: 3, u: `import { Amount } from '../p/index.mjs';
/** @returns {string} */
export function f() { return Amount.prototype.format.call({ n: 1 }); }
` },
  { id: 'w7 a getter\'s result narrowed', rule: 'R19', line: 6, u: `import { Gauge } from '../p/index.mjs';
/**
 * @param {Gauge} g
 * @returns {string}
 */
export function f(g) { if (typeof g.value === 'number') return g.value.toFixed(1); return ''; }
` },
  { id: 'w14 a generic kind through method syntax', rule: 'R5', line: 7, u: `import { Dog } from '../d/index.mjs';
/** @import { Animal, Holder } from '../a/index.mjs' */
/**
 * @param {Holder<Dog>} dogs
 * @returns {Holder<Animal>}
 */
export function f(dogs) { return dogs; }
` },
  { id: 'h2 a host value given a product kind', rule: 'R15', line: 4, node: true, u: `import fs from 'node:fs';
/** @typedef {{ readFileSync(path: string, enc: string): string }} Reader */
/** @type {Reader} */
export const reader = fs;
` },
];

for (const c of CASES) {
  test(`every reference: ${c.id}`, () => {
    const root = product(c.u);
    // Hidden today: under the check's settings the checker says nothing in the user's code.
    if (!c.node && !c.none && !['B3 an index read (found before and after)'].includes(c.id) && c.rule !== 'R10') assert.deepEqual(todayComplaints(root).map((d) => d.code), [], 'today\'s settings complain');
    const r = read(root, 'u');
    if (c.rule) {
      const at = lines(r, c.rule);
      assert.ok(at.length, `${c.rule} found: ${places(r).join('; ')}`);
      if (c.line) assert.ok(at.includes(c.line), `${c.rule} at line ${c.line}, found at ${at.join(', ')}`);
    }
    if (c.none) assert.deepEqual(places(r), []);
    for (const f of c.found ?? []) assert.ok(usesOf(r).some((u) => u.startsWith(f)), `${f} found among ${usesOf(r).join('; ')}`);
    if (c.via) assert.ok(r.uses.some((u) => u.provider === c.via.provider && u.item === c.via.item && JSON.stringify(u.route) === JSON.stringify(c.via.route)), JSON.stringify(r.uses));
  });
}

test('every reference: B12 an overload signature is a place in the module that writes it', () => {
  const root = caseProduct({ ...BASE, 'src/p/index.mjs': `${P}
/**
 * @overload
 * @param {string} x
 * @returns {string}
 */
/**
 * @param {unknown} x
 * @returns {unknown}
 */
export function pick(x) { return x; }
` });
  const r = read(root, 'p');
  assert.ok(r.outside.some((o) => o.rule === 'R10' && /@overload/.test(o.what)), places(r).join('; '));
  // D1, in p: nothing untyped handed out (R4), on the export that hands out unknown.
  assert.ok(r.outside.some((o) => o.rule === 'R4' && o.item === 'take'), places(r).join('; '));
});

test('every reference: A4 names the module that may own the setting: the earlier boundary modules the facility list names', () => {
  const root = product(CASES.find((c) => c.id.startsWith('A4')).u, { 'process/modules/facilities.json': facilityList([], { boundary: ['p'] }) });
  const r = read(root, 'u');
  assert.deepEqual(r.outside.filter((o) => o.rule === 'R12').map((o) => [o.mayRefer, o.waitsOn]), [[['p'], 'p: an accessor for PRICE_URL']]);
});

// ---- ordinary code that keeps the standard raises nothing ----

/** A facility list in build text 2c's form: each name in the process, those in `out` reaching out. */
const facilityList = (names, { out = [], boundary = [] } = {}) => ({ versions: { node: '22.12.0', workerd: '2026-11-01' }, boundary,
  facilities: [...new Set([...names, ...out])].map((name) => ({ name, reach: out.includes(name) ? 'out' : 'in' })) });
test('every reference: the controls, ordinary code, raise no place at all once its facilities are on the list', () => {
  // A1b: an own channel decoded to an own kind. K1: spread, destructuring, a generic identity, for...of, a read-only
  // list parameter, a structural parameter, catch with instanceof of the provider's class; a test with written names.
  const root = product(`import { readFileSync } from 'node:fs';
import { make, PError, readRow } from '../p/index.mjs';
/** @typedef {{ id: number }} Own */
/** @returns {number} */
export function own() {
  const v = /** @type {Own} */ (JSON.parse(readFileSync(new URL('./data.json', import.meta.url), 'utf8')));
  return v.id;
}
/**
 * @template T
 * @param {T} x
 * @returns {T}
 */
function id(x) { return x; }
/**
 * @param {ReadonlyArray<{ name: string }>} list
 * @returns {string[]}
 */
function names(list) { return list.map((x) => x.name); }
/** @returns {string} */
export function all() {
  /** @type {string[]} */
  const out = [];
  for (const r of make()) {
    const { name } = r;
    const copy = { ...r };
    out.push(id(name), copy.name);
  }
  try { readRow(1); } catch (e) { if (e instanceof PError) out.push(e.code); }
  return [...names(make()), ...out].join(',');
}
`, { 'src/u/data.json': '{ "id": 3 }\n', 'test/u/u.test.mjs': `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { all } from '../../src/u/index.mjs';
test('u > lists every name', () => { assert.equal(all().split(',').length, 3); });
` });
  const first = read(root, 'u');
  assert.deepEqual(places(first), [], 'no place but the facility rule\'s own');
  // the tool classifies the host's facilities: only the file read, which reaches out, outside a boundary module, is a place
  assert.deepEqual(first.outside.map((o) => `${o.rule} ${o.what}`), ['R14 uses node:fs.readFileSync, which reaches out, outside a boundary module']);
  // the product's facility list, beside the module list (build text 2c), names u a boundary module
  write(root, { 'process/modules/facilities.json': { versions: { node: '22.12.0' }, boundary: ['u'], facilities: [] } });
  const r = read(root, 'u');
  assert.deepEqual(r.outside, []);
  assert.deepEqual(r.orderFaults, []);
  assert.deepEqual(r.copies, []);
  assert.deepEqual(r.providers, ['p']);
  // what is used, by name, by type and through the conversions it makes
  for (const f of ['p:make call', 'p:PError', 'p:Row read', 'p:readRow call']) assert.ok(usesOf(r).some((u) => u.startsWith(f)), `${f} among ${usesOf(r).join('; ')}`);
  assert.ok(r.facilities.includes('node:fs.readFileSync') && r.facilities.includes('JSON.parse'), r.facilities.join(', '));
});

// ---- the path rule (S5, S6) ----

test('S5: a cwd-relative path is always a place; an anchored literal join to the own folder is not; a path into another module\'s folder names it', () => {
  const root = product(`import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, basename } from 'node:path';
import { dataPath } from '../p/index.mjs';
/**
 * @param {string} name
 * @param {string} given
 * @returns {string[]}
 */
export function f(name, given) {
  return [
    readFileSync('src/p/data.json', 'utf8'),
    readFileSync(new URL('./own.json', import.meta.url), 'utf8'),
    readFileSync(join(import.meta.dirname, '../p/data.json'), 'utf8'),
    readFileSync(join(import.meta.dirname, 'fixtures', basename(name)), 'utf8'),
    readFileSync(given, 'utf8'),
    readFileSync(dataPath(), 'utf8'),
    spawnSync(process.execPath, [new URL('../q/cli.mjs', import.meta.url).pathname]).stdout,
    spawnSync(process.execPath, [join(import.meta.dirname, 'own-cli.mjs')]).stdout,
  ];
}
`);
  const r = read(root, 'u');
  const s5 = (line) => r.outside.find((o) => o.rule === 'S5' && o.line === line);
  assert.match(s5(12).what, /relative to the working directory/);
  assert.deepEqual(s5(12).mayRefer, ['p']);
  assert.equal(s5(13), undefined, 'an anchored URL to its own folder');
  assert.deepEqual(s5(14).mayRefer, ['p']);
  assert.match(s5(14).what, /into p's folder/);
  assert.equal(s5(15), undefined, 'a run-time name only through basename, under its own folder');
  assert.deepEqual(s5(16).mayRefer, ['*']);
  assert.equal(s5(17), undefined, 'the result of the owner\'s reader');
  assert.deepEqual(r.outside.filter((o) => o.rule === 'S6').map((o) => [o.line, o.mayRefer]), [[18, ['q']]]);
  assert.ok(usesOf(r).includes('p:dataPath call'));
});

test('S5: a test reading another module\'s fixture is a place, with the tests it sits in', () => {
  const root = product('export const x = 1;\n', { 'test/u/u.test.mjs': `import { test } from 'node:test';
import { readFileSync } from 'node:fs';
function fixture() { return readFileSync(new URL('../../src/p/fixture.json', import.meta.url), 'utf8'); }
test('u > reads a saved row', () => { fixture(); });
` });
  const o = read(root, 'u').outside.find((x) => x.rule === 'S5');
  assert.deepEqual([o.file, o.side, o.line, o.mayRefer, o.tests], ['test/u/u.test.mjs', 'test', 3, ['p'], ['u > reads a saved row']]);
  assert.equal(o.waitsOn, 'p: an exported reader or accessor');
});

// ---- order faults ----

test('a reference to a later module is an order fault, not a use; check refuses it from the uses file', () => {
  const root = caseProduct({ ...BASE, 'src/u/index.mjs': 'export const x = 1;\n', 'src/u1/index.mjs': `import { x } from '../u/index.mjs';
import { make } from '../p/index.mjs';
/** @returns {number} */
export function f() { return x + make().length; }
` });
  const tree = loadTree(root);
  const r = read(root, 'u1');
  assert.deepEqual(r.providers, ['p']);
  assert.deepEqual([...new Set(r.orderFaults.map((o) => `${o.provider}:${o.item}`))], ['u:x']);
  assert.ok(!r.uses.some((u) => u.provider === 'u'));
  writeUses(root, 'u1', usesData(tree, 'u1', 'c'.repeat(40)), { cfg: tree.cfg });
  const c = check(loadTree(root), 'u1');
  assert.ok(c.refusals.some((x) => /^src\/u1\/index\.mjs:\d+$/.test(x.at) && /uses u x \(\w+\), and u is later in the order/.test(x.text)), JSON.stringify(c.refusals));
});

// ---- copies (S13) ----

test('S13: marked copies are uses, with drift shown; exact copies are listed; a hand-written data copy is kept', () => {
  const root = product(`import { WORDS } from '../p/index.mjs';
const copyOf_p_TITLE = 'Price list';
/** @copyof p:LIMIT */
const max = 200;
/** @returns {string[]} */
export function f() { return [copyOf_p_TITLE, String(max), WORDS.empty, 'price' + 'of']; }
`, {
    'test/u/u.test.mjs': `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { f } from '../../src/u/index.mjs';
test('u > lists the words', () => { assert.equal(f()[0], 'Price list'); });
test('u > a chance match', () => { assert.equal(f().length, /** @notcopy */ ('Price list').length - 6); });
`,
    'test/u/fixture.json': '{ "heading": "Price list", "op": "priceof" }\n',
    'process/modules/u.uses.json': { module: 'u', copies: [{ provider: 'p', item: 'OP_PRICE', file: 'test/u/fixture.json', pointer: '/op' }] },
  });
  const r = read(root, 'u');
  const m = (pred) => r.marked.filter(pred);
  const c = (pred) => r.candidates.filter(pred);
  assert.deepEqual(m((x) => x.marked === 'copyOf_p_TITLE').map((x) => [x.provider, x.item, x.line]), [['p', 'TITLE', 2]]);
  assert.deepEqual(m((x) => x.marked === '@copyof p:LIMIT').map((x) => x.differs), [{ here: 200, provider: 250 }]);
  assert.deepEqual(c((x) => x.file === 'src/u/index.mjs').map((x) => `${x.provider}:${x.item}@${x.line}`), ['p:OP_PRICE@6']);
  assert.deepEqual(c((x) => x.file === 'test/u/u.test.mjs').map((x) => `${x.provider}:${x.item}@${x.line} ${x.test}`).sort(), ['p:TITLE@4 u > lists the words', 'p:WORDS.title@4 u > lists the words']);
  assert.deepEqual(c((x) => x.file === 'test/u/fixture.json').map((x) => `${x.item}${x.pointer}`).sort(), ['TITLE/heading', 'WORDS.title/heading']);
  // the uses file keeps the hand-written copy in a JSON file as written (build text 2c)
  assert.deepEqual(r.copies, [{ provider: 'p', item: 'OP_PRICE', file: 'test/u/fixture.json', pointer: '/op' }]);
  // a marked copy is read as a use of the item; so is the hand-written one, at its line
  for (const f of ['p:TITLE marked copy', 'p:LIMIT marked copy', 'p:OP_PRICE marked copy']) assert.ok(usesOf(r).includes(f), `${f} among ${usesOf(r).join('; ')}`);
  assert.deepEqual(r.uses.find((u) => u.item === 'OP_PRICE').where, [{ file: 'test/u/fixture.json', side: 'test', line: 1 }]);
});

// ---- test names (S12) and places ----

test('S12: each place in a test names the full name of each test case that holds it or calls a helper that does', () => {
  const root = product('export const x = 1;\n', { 'test/u/u.test.mjs': `import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { make } from '../../src/p/index.mjs';
function firstName() { for (const r of make()) return r.name; return ''; }
describe('rows', () => {
  test('the first is one', () => { assert.equal(firstName(), 'one'); });
  test('there is one', () => { assert.equal(make().length, 1); });
});
const name = 'computed';
test(name, () => {});
` });
  const r = read(root, 'u');
  const make = r.uses.find((u) => u.provider === 'p' && u.item === 'make' && u.type === 'call');
  assert.deepEqual(make.where, [
    { file: 'test/u/u.test.mjs', side: 'test', line: 4, test: 'rows > the first is one' },
    { file: 'test/u/u.test.mjs', side: 'test', line: 7, test: 'rows > there is one' },
  ]);
  assert.deepEqual(r.outside.filter((o) => o.rule === 'S12').map((o) => [o.line, o.what]), [[10, 'a test whose name is not written out']]);
});

// ---- the other rules of form: loading, namespaces, shared state, code from text, the host's facilities ----

test('S2, S3, S8, S9, R14, R21, R22: each breach is a place with its rule; nothing is refused', () => {
  const root = product(`import * as P from '../p/index.mjs';
/** @param {string} which @param {'TITLE' | 'OP_PRICE'} known @returns {Promise<unknown>} */
export async function f(which, known) {
  void P[known];
  void P[/** @type {'TITLE'} */ (which)];
  const k = Symbol.for('shared');
  void k;
  return import(which);
}
/** @returns {unknown} */
export function g() { return eval('1 + 1'); }
setInterval(() => {}, 1000);
export let counter = 0;
`, { 'test/u/u.test.mjs': `import { test } from 'node:test';
test('u > times itself', () => { console.log(Date.now()); });
` });
  write(root, { 'process/modules/facilities.json': facilityList([]) });
  const r = read(root, 'u');
  const at = (rule) => r.outside.filter((o) => o.rule === rule).map((o) => `${o.file.split('/')[0]}:${o.line}`);
  assert.deepEqual(at('S2'), ['src:8']);
  assert.deepEqual(at('S8').sort(), ['src:13', 'src:6']);
  assert.deepEqual(at('S9'), ['src:11']);
  assert.deepEqual(at('R21'), ['src:12']);
  assert.deepEqual(at('R22'), ['test:2']);
  // facilities the tool classifies as reaching out (the console, a timer, the clock), used outside a boundary module
  assert.ok(r.outside.some((o) => o.rule === 'R14' && /uses console\.log, which reaches out, outside a boundary module/.test(o.what) && o.side === 'test'));
  assert.ok(r.outside.some((o) => o.rule === 'R14' && /uses setInterval, which reaches out, outside a boundary module/.test(o.what) && o.side === 'code'));
  assert.ok(r.outside.some((o) => o.rule === 'R14' && /uses DateConstructor\.now, which reaches out, outside a boundary module/.test(o.what) && o.side === 'test'));
  assert.ok(r.facilities.includes('SymbolConstructor.for'));
  // a member of the module object named by a choice of written-out names is a use; the cast one is a downcast (R16)
  assert.ok(usesOf(r).some((u) => u.startsWith('p:TITLE')) && usesOf(r).some((u) => u.startsWith('p:OP_PRICE')), usesOf(r).join('; '));
  // with the module a boundary module, the boundary facility is its own to use
  const b = caseProduct({ ...BASE, 'src/u/index.mjs': 'setInterval(() => {}, 1000);\n', 'process/modules/facilities.json': facilityList([], { out: ['setInterval'], boundary: ['u'] }) });
  assert.ok(!read(b, 'u').outside.some((o) => o.rule === 'R14'));
});

// ---- every conversion site of the checker (process/research/uses-metadata-25nov/conversion-sites.md) ----

test('conversion sites: at each, the tool relates the two types itself, member by member', () => {
  // A list of dogs, which the module may keep writing to, given the writable type of a list of animals: R6 at each site
  // where a value passes from one type to another; a method that takes less than its kind promises: R5.
  const u = `import { Dog } from '../d/index.mjs';
import { Cat } from '../c/index.mjs';
import { Base } from '../a/index.mjs';
import { make, PError } from '../p/index.mjs';
/** @import { Animal, Handler } from '../a/index.mjs' */
const dogs = [new Dog()];
const cats = [new Cat()];
/** @type {Dog[] | undefined} */
const maybe = dogs;
/** @type {{ la: Dog[] }} */
const box = { la: dogs };
/** @param {Animal[]} a @returns {void} */
function take(a) { void a; }
/** @param {...Animal[]} a @returns {void} */
function takeAll(...a) { void a; }
/** @param {TemplateStringsArray} s @param {Animal[]} a @returns {void} */
function tag(s, a) { void s; void a; }
/** @this {{ pets: Animal[] }} @returns {number} */
function count() { return this.pets.length; }
/** @param {boolean} flag @returns {Animal[]} */
export function sites(flag) {
  take(dogs); // site: argument
  takeAll(...[dogs]); // site: spread argument
  tag\`\${dogs}\`; // site: tagged template
  const holder = { pets: dogs, count };
  holder.count(); // site: receiver
  /** @type {() => Animal[]} */
  const g = () => dogs; // site: arrow body
  /** @type {Animal[]} */
  let a = [];
  a = dogs; // site: assignment
  /** @type {Animal[] | undefined} */
  let b;
  b ??= dogs; // site: logical assignment
  /** @type {Animal[][]} */
  const ll = [dogs]; // site: list element
  /** @type {Animal[][]} */
  const l2 = [...[dogs]]; // site: list spread
  ll[0] = dogs; // site: element assignment
  /** @type {{ pets: Animal[] }} */
  const o = { pets: dogs }; // site: field
  const pets = dogs;
  /** @type {{ pets: Animal[] }} */
  const o2 = { pets }; // site: shorthand field
  /** @type {Animal[]} */
  let la = [];
  ({ la } = box); // site: assignment taken apart
  const { lb = dogs } = /** @type {{ lb?: Animal[] }} */ ({}); // site: default taken apart
  // a for-of variable: in JavaScript the checker gives it the type iterated, whatever its comment says (run), so no conversion
  for (const /** @type {Animal[]} */ each of [dogs]) void each;
  /** @type {Animal[]} */
  const c = flag ? dogs : cats; // site: conditional
  /** @type {Animal[]} */
  const d = maybe ?? []; // site: logical
  /** @type {{ [k: string]: unknown }} */
  const spread = { ...make()[0] }; // site: object spread
  const s = /** @satisfies {Animal[]} */ (dogs);
  void [g, a, b, l2, o, o2, la, lb, c, d, spread, s];
  return dogs; // site: return
}
/** @param {Animal[]} [a] @returns {void} */
export function withDefault(a = dogs) { void a; } // site: parameter default
/** @returns {Generator<Animal[]>} */
export function* gen() { yield dogs; } // site: yield
export class Pen {
  /** @type {Animal[]} */
  animals = dogs; // site: class field
}
export class Keeper extends Base {
  /** @param {Dog} d @returns {Dog} */
  static keep(d) { return d; } // site: static override
}
/** @implements {Handler} */
export class Barker { // site: implements
  /** @param {Dog} d @returns {void} */
  handle(d) { d.bark(); }
}
/** @returns {void} */
export function fails() {
  try { throw new PError('x'); } catch (e) { if (e instanceof PError) void e.code; } // site: throw and catch
}
`;
  const A2 = A.replace('export class Base {', 'export class Base {\n  /**\n   * @param {Animal} a\n   * @returns {Animal}\n   */\n  static keep(a) { return a; }');
  const root = caseProduct({ ...BASE, 'src/a/index.mjs': A2, 'src/u/index.mjs': u });
  const r = read(root, 'u');
  const lineOf = (site) => u.split('\n').findIndex((l) => l.endsWith(`// site: ${site}`)) + 1;
  const at = (rule, site) => r.outside.some((o) => o.rule === rule && o.file === 'src/u/index.mjs' && o.line === lineOf(site));
  for (const site of ['argument', 'spread argument', 'tagged template', 'receiver', 'arrow body', 'assignment', 'logical assignment', 'list element',
    'list spread', 'element assignment', 'field', 'shorthand field', 'assignment taken apart', 'default taken apart', 'conditional',
    'logical', 'return', 'parameter default', 'yield', 'class field']) assert.ok(at('R6', site), `R6 at the ${site} (line ${lineOf(site)}): ${places(r).join('; ')}`);
  for (const site of ['static override', 'implements']) assert.ok(at('R5', site), `R5 at the ${site}: ${places(r).join('; ')}`);
  assert.ok(at('R17', 'object spread'), `R17 at the object spread: ${places(r).join('; ')}`);
  // satisfies only checks: both types are used, the value keeps its own
  assert.ok(!r.outside.some((o) => o.rule === 'R6' && o.line === u.split('\n').findIndex((l) => l.includes('@satisfies')) + 1));
  // a value of another module's type thrown, and its error class caught
  const types = (item) => r.uses.filter((x) => x.provider === 'p' && x.item === item && x.where.some((w) => w.line === lineOf('throw and catch'))).map((x) => x.type);
  assert.ok(types('PError').includes('throw') && types('PError').includes('catch'), types('PError').join(', '));
});

test('conversion sites: a decorator receives the value it decorates', () => {
  const root = caseProduct({ ...BASE, 'src/a/index.mjs': `${A}
/**
 * @param {{ new (): Animal, kind: Animal[] }} target
 * @returns {void}
 */
export function register(target) { void target; }
`, 'src/u/index.mjs': `import { Dog } from '../d/index.mjs';
import { register } from '../a/index.mjs';
@register
export class Kennel extends Dog {
  static kind = [new Dog()];
}
` });
  const r = read(root, 'u');
  assert.ok(r.outside.some((o) => o.rule === 'R6' && o.line === 3 && /a decorated declaration/.test(o.what)), places(r).join('; '));
  assert.ok(usesOf(r).includes('a:register conversion'), usesOf(r).join('; '));
});

test('S7: a call by name through a door written as build text 2b, section 5 now writes it is a use of the operation; R20 holds for the old form', () => {
  const root = caseProduct({ ...BASE,
    'src/p/index.mjs': `${P}
/**
 * @typedef {{
 *   priceof: {req: { n: number }, res: number}
 * }} PricingOps
 * @optable
 */
`,
    'src/q/index.mjs': `/**
 * @typedef {(op: 'priceof', body: { n: number }) => Promise<number>} AllOps
 */
/**
 * @typedef {Object} Door
 * @property {AllOps} call
 * @carriesop call
 */
/** @returns {Door} */
export function door() { return { call: async (op, body) => (op === 'priceof' ? body.n : 0) }; }
/** @typedef {{[K in 'a' | 'b']: number}} OldForm */
`,
    'src/u/index.mjs': `import { door } from '../q/index.mjs';
/** @returns {Promise<number>} */
export function price() { return door().call('priceof', { n: 1 }); }
` });
  assert.ok(usesOf(read(root, 'u')).includes('p:op:priceof operation by name'), usesOf(read(root, 'u')).join('; '));
  // the door's own module: a mapped type, the form 2b no longer uses, is a place outside the standard
  assert.ok(read(root, 'q').outside.some((o) => o.rule === 'R20'));
});

// ---- the module list changes ----

test('push, where the branch changes the module list, rewrites the uses files of the modules it touches and of their users', () => {
  const files = {
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': 'p\nq\nu\n',
    'process/modules/p.json': { name: 'p', files: ['src/p/'], tests: ['test/p/'], public: ['src/p/index.mjs'] },
    'process/modules/q.json': { name: 'q', files: ['src/q/'], tests: ['test/q/'], public: ['src/q/index.mjs'] },
    'process/modules/u.json': { name: 'u', files: ['src/u/'], tests: ['test/u/'], public: ['src/u/index.mjs'] },
    'src/p/index.mjs': "export { two } from './two.mjs';\n/** @returns {number} */\nexport function one() { return 1; }\n",
    'src/p/two.mjs': '/** @returns {number} */\nexport function two() { return 2; }\n',
    'src/q/index.mjs': 'export const q = 1;\n',
    'src/u/index.mjs': "import { two } from '../p/index.mjs';\n/** @returns {number} */\nexport function four() { return two() * 2; }\n",
  };
  const root = makeRepo(files);
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const { ctx } = ctxFor(root, fakeGitHub());
  // first, every module's uses file, as conversions would write them
  git(['checkout', '-q', '-b', 'work/first'], { cwd: root });
  commit(root, { 'src/p/index.mjs': `${files['src/p/index.mjs']}\n`, 'src/q/index.mjs': `${files['src/q/index.mjs']}\n`, 'src/u/index.mjs': `${files['src/u/index.mjs']}\n` });
  push(ctx, { _: [] });
  assert.deepEqual(readUses(root, 'u', { ref: 'HEAD' }).providers, ['p']);
  git(['push', '-q', 'origin', 'HEAD:refs/heads/tranche'], { cwd: root });
  // ARCH moves two.mjs from p to q in the module list, as one change: u's code is not touched
  git(['checkout', '-q', '-b', 'work/move'], { cwd: root });
  commit(root, {
    'process/modules/p.json': { name: 'p', files: ['src/p/index.mjs'], tests: ['test/p/'], public: ['src/p/index.mjs'] },
    'process/modules/q.json': { name: 'q', files: ['src/q/', 'src/p/two.mjs'], tests: ['test/q/'], public: ['src/q/index.mjs', 'src/p/two.mjs'] },
  });
  push(ctx, { _: [] });
  const changed = git(['diff', '--name-only', 'HEAD^', 'HEAD'], { cwd: root }).split('\n').sort();
  // p lost two and u's names it; q's own uses are as they were, so its file is unchanged
  assert.deepEqual(changed, ['process/modules/p.uses.json', 'process/modules/u.uses.json']);
  // u now uses q's two, which the move took there, through p's re-export
  assert.ok(readUses(root, 'u', { ref: 'HEAD' }).uses.some((x) => x.provider === 'q' && x.item === 'two'), JSON.stringify(readUses(root, 'u', { ref: 'HEAD' }).uses));
});

test('a push that changes the facility list, or moves to a Process4 version that classifies facilities differently, rewrites every uses file', () => {
  const files = {
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': 'p\nu\n',
    'process/modules/p.json': { name: 'p', files: ['src/p/'], tests: ['test/p/'], public: ['src/p/index.mjs'] },
    'process/modules/u.json': { name: 'u', files: ['src/u/'], tests: ['test/u/'], public: ['src/u/index.mjs'] },
    'src/p/index.mjs': '/** @returns {number} */\nexport function one() { return 1; }\n',
    // u writes to the console, which reaches out: a place outside the standard unless u is a boundary module
    'src/u/index.mjs': "import { one } from '../p/index.mjs';\n/** @returns {void} */\nexport function say() { console.log(one()); }\n",
  };
  const root = makeRepo(files);
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const { ctx } = ctxFor(root, fakeGitHub());
  git(['checkout', '-q', '-b', 'work/first'], { cwd: root });
  commit(root, { 'src/p/index.mjs': `${files['src/p/index.mjs']}\n`, 'src/u/index.mjs': `${files['src/u/index.mjs']}\n` });
  push(ctx, { _: [] });
  assert.ok(readUses(root, 'u', { ref: 'HEAD' }).outside.some((o) => o.rule === 'R14'));
  git(['push', '-q', 'origin', 'HEAD:refs/heads/tranche'], { cwd: root });
  // ARCH names u a boundary module: every module's uses file is rewritten in the same push, u's changes
  git(['checkout', '-q', '-b', 'work/facilities'], { cwd: root });
  commit(root, { 'process/modules/facilities.json': { versions: { node: '22.12.0' }, boundary: ['u'], facilities: [] } });
  push(ctx, { _: [] });
  assert.deepEqual(git(['diff', '--name-only', 'HEAD^', 'HEAD'], { cwd: root }).split('\n'), ['process/modules/u.uses.json']);
  assert.ok(!readUses(root, 'u', { ref: 'HEAD' }).outside.some((o) => o.rule === 'R14'));
  git(['push', '-q', 'origin', 'HEAD:refs/heads/tranche'], { cwd: root });
  // A move to another Process4 version: a file written under a tool whose classification differs (here one this
  // repository cannot read) is rewritten; one written under this tool's is left as it is.
  git(['checkout', '-q', '-b', 'work/move'], { cwd: root });
  const u = readUses(root, 'u', { ref: 'HEAD' });
  commit(root, { 'process/modules/u.uses.json': { ...u, written: { ...u.written, tool: 'f'.repeat(40) } } });
  git(['push', '-q', 'origin', 'HEAD:refs/heads/tranche'], { cwd: root });
  commit(root, { 'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] }, process: { repository: 'https://github.com/o/process4', version: '4.1.0', commit: 'b'.repeat(40) } }) });
  push(ctx, { _: [] });
  assert.deepEqual(git(['diff', '--name-only', 'HEAD^', 'HEAD'], { cwd: root }).split('\n'), ['process/modules/u.uses.json']);
  assert.notEqual(readUses(root, 'u', { ref: 'HEAD' }).written.tool, 'f'.repeat(40));
});

// ---- the uses file ----

test('the uses file: its form, written and read back, and the same reading written again is the same file', () => {
  const root = product(CASES.find((c) => c.id.startsWith('A6')).u, { 'test/u/u.test.mjs': `import { test } from 'node:test';
import { names } from '../../src/u/index.mjs';
test('u > names', () => { names(); });
` });
  const tree = loadTree(root);
  const d = usesData(tree, 'u', 'a'.repeat(40));
  assert.deepEqual(Object.keys(d), ['module', 'written', 'providers', 'uses', 'outside', 'orderFaults', 'copies']);
  assert.deepEqual(d.written.commit, 'a'.repeat(40));
  // the tool's commit: the commit of the copy it runs from
  assert.equal(d.written.tool, git(['rev-parse', 'HEAD'], { cwd: new URL('..', import.meta.url).pathname }));
  assert.deepEqual(d.providers, ['p', 'q']);
  const rows = d.uses.find((u) => u.provider === 'q' && u.item === 'rows' && u.type === 'call');
  assert.deepEqual(rows, { provider: 'q', item: 'rows', itemKind: 'function', type: 'call', route: 'direct', standard: true, where: [{ file: 'src/u/index.mjs', side: 'code', line: 6, in: 'names' }] });
  assert.ok(d.uses.some((u) => u.provider === 'p' && u.item === 'Row' && u.itemKind === 'type' && u.type === 'receive' && u.route.via === 'q' && u.route.item === 'rows'));
  for (const o of d.outside) assert.deepEqual(Object.keys(o), ['rule', 'file', 'side', 'line', 'mayRefer', 'waitsOn', 'tests']);
  const rel = writeUses(root, 'u', d, { cfg: tree.cfg });
  assert.equal(rel, usesPath(tree.cfg, 'u'));
  assert.equal(rel, 'process/modules/u.uses.json');
  const back = readUses(root, 'u', { cfg: tree.cfg });
  assert.deepEqual(back, JSON.parse(JSON.stringify(d)));
  // each listed thing on a line of its own
  const text = readFileSync(join(root, rel), 'utf8');
  assert.ok(text.split('\n').filter((l) => l.startsWith('    {"provider"')).length >= d.uses.length);
  assert.ok(sameUses(back, { ...usesData(loadTree(root), 'u', 'b'.repeat(40)) }), 'apart from when it was written, the same');
});

test('push writes the uses file of the module it changes, from the code as pushed, and the check reads it', () => {
  const files = {
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': 'p\nu\n',
    'process/modules/p.json': { name: 'p', files: ['src/p/'], tests: ['test/p/'], public: ['src/p/index.mjs'] },
    'process/modules/u.json': { name: 'u', files: ['src/u/'], tests: ['test/u/'], public: ['src/u/index.mjs'] },
    'src/p/index.mjs': '/** @returns {number} */\nexport function one() { return 1; }\n',
    'src/u/index.mjs': 'export const x = 1;\n',
  };
  const root = makeRepo(files);
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const { ctx, out } = ctxFor(root, fakeGitHub());
  git(['checkout', '-q', '-b', 'job/u.1'], { cwd: root });
  const sha = commit(root, { 'src/u/index.mjs': "import { one } from '../p/index.mjs';\n/** @returns {number} */\nexport function two() { return one() + one(); }\n", 'test/u/u.test.mjs': "import { test } from 'node:test';\nimport { one } from '../../src/p/index.mjs';\ntest('u > one is one', () => { one(); });\n" });
  // uncommitted work in the checkout is not what is pushed: the file is read from the commit
  write(root, { 'src/u/index.mjs': 'export const unpushed = 1;\n' });
  assert.equal(push(ctx, { _: [] }), 0);
  const d = readUses(root, 'u', { ref: 'HEAD' });
  assert.equal(d.written.commit, sha);
  assert.equal(git(['rev-parse', 'HEAD^'], { cwd: root }), sha);
  assert.equal(git(['status', '--porcelain'], { cwd: root }), ' M src/u/index.mjs');
  assert.deepEqual(d.providers, ['p']);
  assert.deepEqual(d.uses.find((u) => u.item === 'one' && u.type === 'call').where, [
    { file: 'src/u/index.mjs', side: 'code', line: 3, in: 'two' },
    { file: 'test/u/u.test.mjs', side: 'test', line: 3, test: 'u > one is one' },
  ]);
  assert.match(out.join('\n'), /wrote process\/modules\/u\.uses\.json: 1 provider\(s\)/);
  // p was not changed by the push: no uses file is written for it.
  assert.equal(readUses(root, 'p', { ref: 'HEAD' }), null);
  // the check reads u's declared uses from it
  git(['checkout', '-q', '--', 'src/u/index.mjs'], { cwd: root });
  const c = check(loadTree(root), 'u');
  assert.deepEqual(c.refusals, []);
  // `uses` reads the checkout, writes the uses file into it, and prints what a conversion's first step lists
  out.length = 0;
  assert.equal(usesCmd(ctx, 'u'), 0);
  assert.match(out.join('\n'), /^Uses of u\nproviders: p\nreferences in standard form \(\d+\):\n {2}p one \(function\): call, direct\n {6}src\/u\/index\.mjs:3 in two\n {6}test\/u\/u\.test\.mjs:3 test "u > one is one"/);
  assert.match(out.join('\n'), /unchanged: process\/modules\/u\.uses\.json, from the code in the checkout/);
  write(root, { 'src/u/index.mjs': 'export const x = 2;\n' });
  out.length = 0;
  usesCmd(ctx, 'u');
  assert.match(out.join('\n'), /written: process\/modules\/u\.uses\.json/);
  assert.deepEqual(readUses(root, 'u').uses.filter((u) => u.where.some((w) => w.side === 'code')), []);
  assert.equal(git(['status', '--porcelain'], { cwd: root }), ' M process/modules/u.uses.json\n M src/u/index.mjs');
  assert.throws(() => usesCmd(ctx, 'nobody'), /no module is named nobody/);
});

test('the reading is attributed by the checker: TypeScript is the pinned version', () => {
  loadReader();
  assert.equal(ts.version, '5.6.3');
});

// ---- the tool's classification of the host's facilities (build text 2c, "Facilities") ----

test('the host\'s facilities: a clock read, Symbol.for, WeakRef and an unreviewed Node module are places; path.join and structuredClone are not', () => {
  const root = product(`import { join } from 'node:path';
import { tmpdir } from 'node:os';
/** @returns {string} */
export function where() { return join('a', 'b'); }
/** @returns {{ n: number }} */
export function copy() { return structuredClone({ n: 1 }); }
/** @returns {number} */
export function when() { return new Date().getTime(); }
/** @returns {symbol} */
export function shared() { return Symbol.for('x'); }
/** @returns {WeakRef<object>} */
export function weak() { return new WeakRef({}); }
/** @returns {string} */
export function temp() { return tmpdir(); }
/** @returns {number} */
export function day() { return new Date('2026-11-25T00:00:00Z').getUTCDate(); }
`);
  const r = read(root, 'u');
  const at = (line) => r.outside.filter((o) => o.file === 'src/u/index.mjs' && o.line === line).map((o) => `${o.rule} ${o.what}`);
  assert.deepEqual(at(4), [], 'path.join stays in the process');
  assert.deepEqual(at(6), [], 'structuredClone stays in the process');
  assert.deepEqual(at(8), ['R14 uses Date(), which reaches out, outside a boundary module'], 'the clock');
  assert.deepEqual(at(10), ['S8 uses SymbolConstructor.for, which no product may use']);
  assert.ok(at(12).some((x) => /^R14 uses WeakRef.*reaches out, outside a boundary module$/.test(x)), at(12).join('; '));
  assert.ok(at(14).some((x) => /^R14 uses node:os\.tmpdir, which reaches out, outside a boundary module$/.test(x)), at(14).join('; '));
  assert.deepEqual(at(16), [], 'a date from its arguments, read in UTC, stays in the process');
  // the test runner, outside the module's tests
  const t = read(product("import { test } from 'node:test';\n/** @returns {void} */\nexport function x() { test('a', () => {}); }\n"), 'u');
  assert.ok(t.outside.some((o) => o.rule === 'R14' && /the test runner's, outside the module's tests/.test(o.what)), JSON.stringify(t.outside));
});

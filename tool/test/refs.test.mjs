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

test('every reference: A4 names the module that owns the setting, where the facility list says', () => {
  const root = product(CASES.find((c) => c.id.startsWith('A4')).u);
  const r = read(root, 'u', { facilities: { entries: {}, owners: { 'env:PRICE_URL': 'p' } } });
  assert.deepEqual(r.outside.filter((o) => o.rule === 'R12').map((o) => [o.mayRefer, o.waitsOn]), [[['p'], 'p: an accessor for PRICE_URL']]);
});

// ---- ordinary code that keeps the standard raises nothing ----

const ordinary = (r) => ({ entries: Object.fromEntries(r.facilities.map((f) => [f, 'in-process'])), owners: {} });
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
  assert.deepEqual(places(first), [], 'no place but the facility list\'s own');
  assert.ok(first.outside.every((o) => o.rule === 'R14'), 'with no facility list, each host facility is listed');
  // the product's facility list, at the place the config names by default (build text 2c, section 12)
  write(root, { 'process/facilities.json': { versions: { node: '22', typescript: '5.6.3' }, ...ordinary(first) } });
  const r = read(root, 'u');
  assert.deepEqual(r.outside, []);
  assert.deepEqual(r.orderFaults, []);
  assert.deepEqual(r.copies, []);
  assert.deepEqual(r.providers, ['p']);
  // what is used, by name, by type and through the conversions it makes
  for (const f of ['p:make call', 'p:PError', 'p:Row read', 'p:readRow call']) assert.ok(usesOf(r).some((u) => u.startsWith(f)), `${f} among ${usesOf(r).join('; ')}`);
  assert.ok(r.facilities.includes('"node:fs".readFileSync') && r.facilities.includes('JSON.parse'), r.facilities.join(', '));
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
    'process/modules/u.uses.json': { module: 'u', copies: [{ file: 'test/u/fixture.json', pointer: '/op', of: 'p:OP_PRICE' }] },
  });
  const r = read(root, 'u');
  const c = (pred) => r.copies.filter(pred);
  assert.deepEqual(c((x) => x.marked === 'copyOf_p_TITLE').map((x) => [x.provider, x.item, x.line]), [['p', 'TITLE', 2]]);
  assert.deepEqual(c((x) => x.marked === '@copyof p:LIMIT').map((x) => x.differs), [{ here: 200, provider: 250 }]);
  assert.deepEqual(c((x) => !x.marked && !x.of && x.file === 'src/u/index.mjs').map((x) => `${x.provider}:${x.item}@${x.line}`), ['p:OP_PRICE@6']);
  assert.deepEqual(c((x) => x.file === 'test/u/u.test.mjs').map((x) => `${x.provider}:${x.item}@${x.line} ${x.test}`).sort(), ['p:TITLE@4 u > lists the words', 'p:WORDS.title@4 u > lists the words']);
  assert.deepEqual(c((x) => x.file === 'test/u/fixture.json' && !x.of).map((x) => `${x.item}${x.pointer}`).sort(), ['TITLE/heading', 'WORDS.title/heading']);
  assert.deepEqual(c((x) => x.of), [{ file: 'test/u/fixture.json', pointer: '/op', of: 'p:OP_PRICE' }]);
  // a marked copy is read as a use of the item; so is the hand-written one
  for (const f of ['p:TITLE copy', 'p:LIMIT copy', 'p:OP_PRICE copy']) assert.ok(usesOf(r).includes(f), `${f} among ${usesOf(r).join('; ')}`);
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
test('u > times itself', () => { const t = Date.now(); void t; });
` });
  const r = read(root, 'u', { facilities: { entries: { 'SymbolConstructor.for': 'in-process', setInterval: 'boundary', 'DateConstructor.now': 'boundary' }, owners: {} } });
  const at = (rule) => r.outside.filter((o) => o.rule === rule).map((o) => `${o.file.split('/')[0]}:${o.line}`);
  assert.deepEqual(at('S2'), ['src:8']);
  assert.deepEqual(at('S8').sort(), ['src:13', 'src:6']);
  assert.deepEqual(at('S9'), ['src:11']);
  assert.deepEqual(at('R21'), ['src:12']);
  assert.deepEqual(at('R22'), ['test:2']);
  // a listed facility that is boundary, outside a boundary module; one not on the list
  assert.ok(r.outside.some((o) => o.rule === 'R14' && /setInterval, a boundary facility, outside a boundary module/.test(o.what)));
  assert.ok(r.outside.some((o) => o.rule === 'R14' && /uses DateConstructor\.now/.test(o.what) && o.side === 'test'));
  assert.ok(r.facilities.includes('SymbolConstructor.for'));
  // a member of the module object named by a choice of written-out names is a use; the cast one is a downcast (R16)
  assert.ok(usesOf(r).some((u) => u.startsWith('p:TITLE')) && usesOf(r).some((u) => u.startsWith('p:OP_PRICE')), usesOf(r).join('; '));
  // with the module a boundary module, the boundary facility is its own to use
  const b = caseProduct({ ...BASE, 'src/u/index.mjs': 'setInterval(() => {}, 1000);\n' }, { entries: { u: { boundary: true } } });
  assert.ok(!read(b, 'u', { facilities: { entries: { setInterval: 'boundary' }, owners: {} } }).outside.some((o) => o.rule === 'R14'));
});

// ---- the uses file ----

test('the uses file: its form, written and read back, and the same reading written again is the same file', () => {
  const root = product(CASES.find((c) => c.id.startsWith('A6')).u, { 'test/u/u.test.mjs': `import { test } from 'node:test';
import { names } from '../../src/u/index.mjs';
test('u > names', () => { names(); });
` });
  const tree = loadTree(root);
  const d = usesData(tree, 'u', 'a'.repeat(40));
  assert.deepEqual(Object.keys(d), ['module', 'written', 'providers', 'uses', 'outside', 'orderFaults', 'copies', 'facilities']);
  assert.deepEqual(d.written.commit, 'a'.repeat(40));
  assert.match(d.written.tool, /^process4-tool \S+, typescript 5\.6\.3$/);
  assert.deepEqual(d.providers, ['p', 'q']);
  const rows = d.uses.find((u) => u.provider === 'q' && u.item === 'rows' && u.type === 'call');
  assert.deepEqual(rows, { provider: 'q', item: 'rows', itemKind: 'function', type: 'call', route: 'direct', standard: true, where: [{ file: 'src/u/index.mjs', side: 'code', line: 6, in: 'names' }] });
  assert.ok(d.uses.some((u) => u.provider === 'p' && u.item === 'Row' && u.itemKind === 'kind' && u.route.via === 'q' && u.route.item === 'rows'));
  for (const o of d.outside) assert.deepEqual(Object.keys(o).filter((k) => k !== 'item'), ['rule', 'file', 'side', 'line', 'what', 'mayRefer', 'waitsOn', 'tests']);
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
  // `uses` prints the same reading for a conversion job, and writes nothing
  out.length = 0;
  const status = git(['status', '--porcelain'], { cwd: root });
  assert.equal(usesCmd(ctx, 'u', { _: [] }), 0);
  assert.match(out.join('\n'), /^Uses of u\nproviders: p\nuses \(\d+\):\n {2}p one \(function\): call, direct\n {6}src\/u\/index\.mjs:3 in two\n {6}test\/u\/u\.test\.mjs:3 test "u > one is one"/);
  assert.match(out.join('\n'), /read at [0-9a-f]{10}; the file is process\/modules\/u\.uses\.json, written by push/);
  out.length = 0;
  usesCmd(ctx, 'u', { _: [], json: true, at: 'HEAD^' });
  assert.deepEqual(JSON.parse(out.join('\n')).providers, ['p']);
  assert.equal(git(['status', '--porcelain'], { cwd: root }), status);
  assert.throws(() => usesCmd(ctx, 'nobody', { _: [] }), /no module is named nobody/);
});

test('the reading is attributed by the checker: TypeScript is the pinned version', () => {
  loadReader();
  assert.equal(ts.version, '5.6.3');
});

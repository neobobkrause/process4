// What counts as a change (design part 2, section 7; build text 5, section 6): an item whose type is written differently
// but means the same is unchanged, as the type checker finds it; accepting more is confirmed wherever the checker proves
// it, and never where it does not; and the facts worked out from the code are exact where the language decides them.
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { loadTree } from '../lib/notice/model.mjs';
import { changedItems, makeConfirm } from '../lib/notice/notice.mjs';
import { moduleMeans } from '../lib/notice/means.mjs';
import { loadReader } from '../lib/notice/ts.mjs';
import { config, write } from './helpers.mjs';

const entry = (name) => ({ name, files: [`src/${name}/`], tests: [`test/${name}/`], public: [`src/${name}/index.mjs`] });
/** A product of the modules given ({ name: index.mjs text }, in order), with any further files. */
function product(mods, extra = {}) {
  const root = mkdtempSync(join(tmpdir(), 'p4-what-'));
  const names = Object.keys(mods);
  write(root, {
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': `${names.join('\n')}\n`,
    ...Object.fromEntries(names.map((m) => [`process/modules/${m}.json`, entry(m)])),
    ...Object.fromEntries(names.map((m) => [`src/${m}/index.mjs`, mods[m]])),
    ...extra,
  });
  return loadTree(root);
}
/** The changed items of module p, before and after, each as "item: words" and "(tells no one)" where it tells no one. */
function changes(before, after, { others = {}, extraB = {}, extraA = extraB } = {}) {
  loadReader();
  const r = changedItems(product({ ...others, p: before }, extraB), product({ ...others, p: after }, extraA), 'p');
  return r.changed.map((c) => `${c.item}: ${c.changes.join(', ')}${c.tells ? '' : ' (tells no one)'}`);
}
/** Why the type checker does not confirm that an item accepts more (makeConfirm). */
const why = (before, after, item) => {
  loadReader();
  const b = product({ p: before }), a = product({ p: after });
  moduleMeans(b, 'p');
  moduleMeans(a, 'p');
  const r = makeConfirm(b, a, 'p')(item);
  return r.confirmed ? null : r.why;
};
const fn = (params, ret, body = 'return /** @type {any} */ (0);', args = 'x') => `/**\n${params.map((p) => ` * @param ${p}\n`).join('')} * @returns {${ret}}\n */\nexport function f(${args}) { ${body} }\n`;
const generic = (extra = '', constraint = '') => `/**\n * @template ${constraint}T\n * @param {T} x\n${extra} * @returns {T}\n */\nexport function f(x) { return x; }\n`;

test('a type written differently that the checker finds the same is unchanged', () => {
  const cents = '/** @typedef {{cents: number}} Cents */\n';
  const rooms = (name) => `/**\n * @typedef {Object} ${name}\n * @property {(id: string) => number} find\n */\n${fn(['{string} x'], name, 'return { find: () => 1 };')}`;
  const cases = [
    // already the same in the written form
    [fn(["{'a' | 'b' | number} x"], 'string | number'), fn(["{number | 'b' | 'a'} x"], 'number | string'), []],
    [fn(['{Array<string>} x'], 'Array<number>'), fn(['{string[]} x'], 'number[]'), []],
    [`/**\n * @typedef {Object} T\n * @property {number} a\n * @property {string} [b]\n */\n${fn(['{T} x'], 'T')}`, `/** @typedef {{a: number, b?: string}} T */\n${fn(['{T} x'], 'T')}`, []],
    [fn(['{string} x'], 'string', 'return x;'), fn(['{string} y'], 'string', 'return y;', 'y'), []],
    [fn(['{number} [x]'], 'number'), fn(['{number | undefined} [x]'], 'number'), []],
    [`/**\n * @callback Cb\n * @param {string} s\n * @returns {number}\n */\n${fn(['{Cb} x'], 'number')}`, `/** @typedef {(s: string) => number} Cb */\n${fn(['{Cb} x'], 'number')}`, []],
    [fn(['{Record<string, number>} x'], 'number'), fn(['{{[k: string]: number}} x'], 'number'), []],
    [fn(['{ReadonlyArray<string>} x'], 'number'), fn(['{readonly string[]} x'], 'number'), []],
    [fn(['{boolean} x'], 'boolean'), fn(['{true | false} x'], 'false | true'), []],
    [fn(['{{a: number} & {b: string}} x'], 'number'), fn(['{{b: string} & {a: number}} x'], 'number'), []],
    // the same only by the checker: a kind's name given, dropped or changed, a type parameter renamed
    [fn(['{{cents: number}} x'], '{cents: number}'), `${cents}${fn(['{Cents} x'], 'Cents')}`, []],
    [`${cents}${fn(['{Cents} x'], 'number')}`, `${cents}${fn(['{{cents: number}} x'], 'number')}`, []],
    [`${cents}${fn(['{Cents} x'], 'Cents')}`, `/** @typedef {{cents: number}} Money */\n${fn(['{Money} x'], 'Money')}`, ['Cents: removed']],
    [generic(), generic().replaceAll('T', 'U'), []],
    [rooms('Rooms'), rooms('RoomDirectory'), ['Rooms: removed', 'Rooms.find: removed']],
  ];
  for (const [b, a, want] of cases) assert.deepEqual(changes(b, a), want, a);
  // a kind's comment moved to another file of the module, and named there otherwise
  const moved = { extraB: {}, extraA: { 'src/p/types.mjs': '/** @typedef {{cents: number}} Money */\nexport {};\n' } };
  assert.deepEqual(changes(`${cents}${fn(['{Cents} x'], 'Cents')}`, `/** @typedef {import('./types.mjs').Money} Cents */\n${fn(['{Cents} x'], 'Cents')}`, moved), []);
});

test('a type written differently that the checker can tell apart is a change', () => {
  const handle = (ret) => `/**\n * @typedef {Object} Rooms\n * @property {(id: string) => ${ret}} find\n */\n${fn(['{string} x'], 'Rooms', 'return { find: () => /** @type {any} */ (1) };')}`;
  const cases = [
    // under exactOptionalPropertyTypes a stated undefined is not the mark of an optional member
    [fn(['{{a?: number | undefined}} x'], 'number'), fn(['{{a?: number}} x'], 'number'), ['f: cannot stand in']],
    [fn(['{string} x'], '{a?: number}'), fn(['{string} x'], '{a?: number | undefined}'), ['f: hands back differently']],
    [fn(['{string} x'], 'readonly string[]'), fn(['{string} x'], 'string[]'), ['f: hands back differently']],
    [fn(['{string} x'], 'Promise<number>'), fn(['{string} x'], 'Promise<number | undefined>'), ['f: hands back differently']],
    [fn(['{string} x'], '[number, string]'), fn(['{string} x'], '[number, string?]'), ['f: hands back differently']],
    [fn(['{{a?: number}} x'], 'number'), fn(['{{a: number}} x'], 'number'), ['f: cannot stand in']],
    [fn(['{string} x'], '{[k: string]: number}'), fn(['{string} x'], '{}'), ['f: hands back differently']],
    // a handle kind is written by its name; a member changed under the same name is its own item
    [handle('number'), handle('string'), ['Rooms.find: hands back differently']],
  ];
  for (const [b, a, want] of cases) assert.deepEqual(changes(b, a), want, a);
});

test('accepting more is confirmed wherever the type checker proves it', () => {
  const cases = [
    [fn(['{string} x'], 'number'), `/**\n * @param {string} x\n * @param {number} [y]\n * @returns {number}\n */\nexport function f(x, y = 1) { return y; }\n`],
    [fn(['{string} x'], 'number'), `/**\n * @param {string} x\n * @param {...number} more\n * @returns {number}\n */\nexport function f(x, ...more) { return more.length; }\n`],
    [fn(["{'a'} x"], 'number'), fn(["{'a' | 'b'} x"], 'number')],
    [fn(['{{a: string}} x'], 'number'), fn(['{{a: string, b?: number}} x'], 'number')],
    // a function handed in that is now handed fewer or narrower arguments: the old written form cannot show these; the
    // checker proves them
    [fn(['{(s: string | number) => void} x'], 'number'), fn(['{(s: string) => void} x'], 'number')],
    [fn(['{(s: string, n?: number) => void} x'], 'number'), fn(['{(s: string) => void} x'], 'number')],
    [fn(['{{each: (s: string | number) => void}} x'], 'number'), fn(['{{each: (s: string) => void}} x'], 'number')],
    // generic: a parameter added
    [generic(), generic(' * @param {number} [n]\n').replace('f(x)', 'f(x, n)')],
    // a class member, a class's constructor (what it builds the same), a handle's member
    [`export class C {\n  /** @param {string} x @returns {number} */\n  m(x) { return 1; }\n}\n`, `export class C {\n  /** @param {string} x @param {number} [y] @returns {number} */\n  m(x, y = 0) { return y; }\n}\n`, ['C: hands back differently', 'C#m: accepts more (tells no one)']],
    [`export class C {\n  /** @param {string} x */\n  constructor(x) { this.x = x; }\n}\n`, `export class C {\n  /** @param {string} [x] */\n  constructor(x = 'a') { this.x = x; }\n}\n`, ['C: accepts more (tells no one)']],
    [`/**\n * @typedef {Object} H\n * @property {(s: string) => number} m\n */\n${fn(['{string} x'], 'H', 'return { m: () => 1 };')}`, `/**\n * @typedef {Object} H\n * @property {(s: string | number) => number} m\n */\n${fn(['{string} x'], 'H', 'return { m: () => 1 };')}`, ['H.m: accepts more (tells no one)']],
  ];
  for (const [b, a, want = ['f: accepts more (tells no one)']] of cases) assert.deepEqual(changes(b, a), want, a);
});

test('accepting more is never confirmed where the checker does not prove it', () => {
  // a function handed in that will be handed more than it took
  assert.deepEqual(changes(fn(['{(s: string) => void} x'], 'number'), fn(['{(s: string | number) => void} x'], 'number')), ['f: cannot stand in']);
  // a function handed in whose parameter list grows: the provider will hand it another argument, which breaks a user's
  // function whose further parameter is optional, of another kind (misses.md, section 5, "the reverse"); the checker
  // lets a function of fewer parameters stand where more are expected, so it would confirm each of these
  const handedMore = [
    [fn(['{(s: string) => void} x'], 'number'), fn(['{(s: string, n: number) => void} x'], 'number')],
    [fn(['{(s: string) => void} x'], 'number'), fn(['{(s: string, n?: number) => void} x'], 'number')],
    [fn(['{(s: string) => void} x'], 'number'), fn(['{(s: string, ...n: number[]) => void} x'], 'number')],
    [fn(['{{each: (s: string) => void}} x'], 'number'), fn(['{{each: (s: string, n: number) => void}} x'], 'number')],
    [fn(['{Array<(s: string) => void>} x'], 'number'), fn(['{Array<(s: string, n: number) => void>} x'], 'number')],
    [fn(['{((s: string) => void) | string} x'], 'number'), fn(['{((s: string, n: number) => void) | string} x'], 'number')],
    // handed back a function that takes one of the user's: the user's is still handed in
    [fn(['{string} x'], '(cb: (s: string) => void) => void', 'return () => {};'), fn(['{string} x'], '(cb: (s: string, n: number) => void) => void', 'return () => {};')],
  ];
  for (const [b, a] of handedMore) {
    const got = changes(b, a);
    assert.ok(got.length && got.every((x) => !x.includes('accepts more') && !x.includes('tells no one')), `${a}: ${got}`);
    assert.ok(got.some((x) => x.includes('cannot stand in') || x.includes('hands back differently')), `${a}: ${got}`);
  }
  assert.deepEqual(changes(...handedMore[0]), ['f: cannot stand in']);
  assert.match(why(...handedMore[1], 'f'), /handed more arguments/);
  // a kind on the accepting side with a function member (a handle kind), whose method grows
  const opts = (ps) => `/** @typedef {{label: string, onDone: (${ps}) => void}} Opts */\n/** @param {Opts} o @returns {void} */\nexport function g(o) {}\n`;
  assert.deepEqual(changes(opts('s: string'), opts('s: string, n?: number')), ['Opts.onDone: cannot stand in']);
  // a handle kind the user hands in (it implements it): a method of it that now takes another argument is called with
  // one; a handle only handed out, whose method the user calls, accepts more
  const handle = (ps, dir) => `/**\n * @typedef {Object} Clock\n * @property {(${ps}) => string} now\n */\n${dir === 'in' ? '/** @param {Clock} c @returns {string} */\nexport function stamp(c) { return c.now(); }\n' : '/** @returns {Clock} */\nexport function clock() { return { now: () => \'t\' }; }\n'}`;
  assert.deepEqual(changes(handle('', 'in'), handle('zone?: string', 'in')), ['Clock.now: cannot stand in']);
  assert.deepEqual(changes(handle('', 'out'), handle('zone?: string', 'out')), ['Clock.now: accepts more (tells no one)']);
  // a generic item, handed to the old as a whole, may hand back otherwise for some calls: only what the written forms
  // show as accepting more is confirmed
  assert.deepEqual(changes(generic('', '{string} '), generic('', '{string | number} ')), ['f: cannot stand in']);
  const two = (t) => `/**\n * @template ${t}\n * @param {T} x\n * @param {${t.includes('U') ? 'U' : 'T'}} y\n * @returns {T}\n */\nexport function f(x, y) { return x; }\n`;
  assert.deepEqual(changes(two('T'), two('T, U')), ['f: cannot stand in']);
  const method = (t) => `export class C {\n  /**\n   * @template ${t}\n   * @param {T} x\n   * @param {${t.includes('U') ? 'U' : 'T'}} y\n   * @returns {T}\n   */\n  m(x, y) { return x; }\n}\n`;
  assert.deepEqual(changes(method('T'), method('T, U')), ['C: hands back differently', 'C#m: cannot stand in']);
  // a member written as a method: the checker relates its parameters both ways
  assert.deepEqual(changes(fn(['{{m(s: string): void}} x'], 'number'), fn(['{{m(s: string | number): void}} x'], 'number')), ['f: cannot stand in']);
  assert.deepEqual(changes(fn(['{{m(s: string | number): void}} x'], 'number'), fn(['{{m(s: string): void}} x'], 'number')), ['f: cannot stand in']);
  assert.match(why(fn(['{{m(s: string | number): void}} x'], 'number'), fn(['{{m(s: string): void}} x'], 'number'), 'f'), /method, a class's object or "anything"/);
  // "anything" in what it accepted: the checker lets it through, so nothing is proven
  assert.deepEqual(changes(fn(['{{a: any}} x'], 'number'), fn(['{{a: string, b?: number}} x'], 'number')), ['f: cannot stand in']);
  // what it hands back changed although the written form, a handle by name, did not
  const thing = (opt, ret) => `/**\n * @typedef {Object} Thing\n * @property {() => ${ret}} size\n */\n${fn([`{{ name: string${opt} }} o`], 'Thing', `return { size: () => /** @type {any} */ (1) };`, 'o')}`;
  assert.deepEqual(changes(thing('', 'number'), thing('; size?: number', 'string')), ['Thing.size: hands back differently', 'f: cannot stand in']);
});

test('errors that can leave an item: one raised inside a try whose catch never names it is caught', () => {
  const p = (extra) => `/** @param {string} s @returns {number} */
function parse(s) { if (!s) throw new TypeError('empty');${extra} return s.length; }
/** @param {string} s @returns {number} */
export function safe(s) { try { return parse(s); } catch { return -1; } }
/** @param {string} s @returns {number} */
export function handsOn(s) { try { return parse(s); } catch (e) { throw e; } }
/** @param {string} s @returns {number} */
export function bare(s) { return parse(s); }
/** @param {string} s @returns {number} */
export function own(s) { try { if (!s) throw new RangeError('x'); } catch { return 0; } return 1; }
/** @param {string} s @returns {Promise<number>} */
async function later(s) { if (!s) throw new TypeError('empty');${extra} return 1; }
/** @param {string} s @returns {Promise<number>} */
export async function notAwaited(s) { try { return later(s); } catch { return -1; } }
/** @param {string} s @returns {() => number} */
function build(s) { return () => { if (!s) throw new TypeError('later');${extra} return 1; }; }
/** @param {string} s @returns {() => number} */
export function maker(s) { try { return build(s); } catch { return () => 0; } }
`;
  const m = moduleMeans(product({ p: p('') }), 'p').items;
  assert.deepEqual(m.safe.throws, []);
  assert.deepEqual(m.own.throws, []);
  assert.deepEqual(m.handsOn.throws, ['(an error caught and thrown again)', 'TypeError']);
  // a promise's rejection, and a function built and handed back, leave the item, whatever block they were made in
  assert.deepEqual(m.notAwaited.throws, ['TypeError']);
  assert.deepEqual(m.maker.throws, ['TypeError']);
  // the helper's errors grow: only the items whose callers can see that are changed
  assert.deepEqual(changes(p(''), p(" if (s === 'x') throw new RangeError('x');")), [
    'bare: errors that can leave it changed', 'handsOn: errors that can leave it changed', 'maker: errors that can leave it changed', 'notAwaited: errors that can leave it changed']);
});

test('channels: what code outside the call writes to a stream out of the program does not reach the item; a file it writes does', () => {
  const p = (more) => `import { writeFileSync } from 'node:fs';
let last = '';
/** @param {string} s @returns {void} */
export function put(s) { last = s;${more} }
/** @returns {string} */
export function get() { return last; }
`;
  assert.deepEqual(changes(p(''), p(' console.log(s);')), ['put: channels, settings or files changed']);
  assert.deepEqual(changes(p(''), p(" writeFileSync('kept.txt', s);")), ['get: channels, settings or files changed', 'put: channels, settings or files changed']);
});

test('a call into a module proven to keep no state couples nothing; into one that keeps state, it does', () => {
  const p = (more) => `import { tag } from '../m/index.mjs';
/** @param {string} s @returns {string} */
export function a(s) { return tag(s); }
/** @returns {string} */
export function b() { return tag(${more}); }
`;
  const pure = { m: `const MARK = '#';\nconst NAMES = Object.freeze(['a', 'b']);\n/** @param {string} s @returns {string} */\nexport function tag(s) { return NAMES.includes(s) ? s : MARK + s; }\n` };
  const keeps = { m: `let n = 0;\n/** @param {string} s @returns {string} */\nexport function tag(s) { n += 1; return s + n; }\n` };
  const listed = { m: `/** @type {string[]} */\nconst seen = [];\n/** @param {string} s @returns {string} */\nexport function tag(s) { seen.push(s); return s + seen.length; }\n` };
  const before = p("'x'"), after = p("process.env.MODE ?? 'x'");
  assert.deepEqual(changes(before, after, { others: pure }), ['b: channels, settings or files changed']);
  const both = ['a: channels, settings or files changed', 'b: channels, settings or files changed'];
  assert.deepEqual(changes(before, after, { others: keeps }), both);
  assert.deepEqual(changes(before, after, { others: listed }), both);
  // state kept inside what it hands out or is handed: a closure, an object's own fields, an argument written into
  const tag = '/** @param {string} s @returns {string} */\nexport function tag(s) { return s; }\n';
  for (const kept of [
    `${tag}/** @returns {{inc: () => number}} */\nexport function counter() { let n = 0; return { inc: () => { n += 1; return n; } }; }\n`,
    `${tag}export class Counter {\n  constructor() { this.n = 0; }\n  /** @returns {number} */\n  inc() { this.n += 1; return this.n; }\n}\n`,
    `${tag}/** @param {{last: string}} box @param {string} s @returns {void} */\nexport function keep(box, s) { box.last = s; }\n`,
  ]) assert.deepEqual(changes(before, after, { others: { m: kept } }), both, kept);
});

test('what an item reads of what it is handed is its input: the code that made that value is not its means', () => {
  const p = (made) => `/** @typedef {{room: string}} Req */
/** @type {Req[]} */
const kept = [];
/** @returns {Req} */
export function make() { const r = { room: ${made} }; kept.push(r); return r; }
/** @param {Req} req @returns {string} */
export function use(req) { return req.room; }
/** @returns {string} */
export function last() { return kept[kept.length - 1]?.room ?? ''; }
/** @param {{req: Req}} o @returns {string} */
export function nested(o) { const { req } = o; return req.room; }
`;
  // use and nested read only what their caller hands them; last reads the module's own state, which make writes
  assert.deepEqual(changes(p("'r'"), p('String(Math.random())')), ['last: channels, settings or files changed', 'make: channels, settings or files changed']);
});

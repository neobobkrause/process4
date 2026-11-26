// What counts as a change (design part 2, section 7; build text 5, section 6): an item whose type is written differently
// but means the same is unchanged, as the type checker finds it; accepting more is a change, which tells its users; only
// a change of an item's stated types or bounds tells (the owner's decision of 26 November): errors, channels, arguments
// written into and a constant's value within its type tell no one; describing is no change only where the item's code
// is unchanged; and the facts worked out from the code, listed though they tell no one, are exact where the language
// decides them.
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { loadTree } from '../lib/notice/model.mjs';
import { changedItems } from '../lib/notice/notice.mjs';
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
/** The parts of module p's items worked out from the code and listed, which tell no one, that differ before and after. */
function worked(before, after, { others = {}, extraB = {}, extraA = extraB } = {}) {
  loadReader();
  const mb = moduleMeans(product({ ...others, p: before }, extraB), 'p').items, ma = moduleMeans(product({ ...others, p: after }, extraA), 'p').items;
  const WORDS = { throws: 'errors that can leave it', writesArguments: 'arguments written into', channels: 'channels, settings and files' };
  return Object.keys(ma).filter((k) => mb[k]).sort().flatMap((k) => Object.keys(WORDS)
    .filter((w) => JSON.stringify(mb[k][w] ?? []) !== JSON.stringify(ma[k][w] ?? [])).map((w) => `${k}: ${WORDS[w]}`));
}
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

test('accepting more tells its users: the word only says, as the written forms show it, whether the old stands in', () => {
  const cases = [
    [fn(['{string} x'], 'number'), `/**\n * @param {string} x\n * @param {number} [y]\n * @returns {number}\n */\nexport function f(x, y = 1) { return y; }\n`, ['f: accepts more']],
    [fn(['{string} x'], 'number'), `/**\n * @param {string} x\n * @param {...number} more\n * @returns {number}\n */\nexport function f(x, ...more) { return more.length; }\n`, ['f: accepts more']],
    [fn(["{'a'} x"], 'number'), fn(["{'a' | 'b'} x"], 'number'), ['f: accepts more']],
    [fn(['{{a: string}} x'], 'number'), fn(['{{a: string, b?: number}} x'], 'number'), ['f: accepts more']],
    // a function handed in that is now handed fewer or narrower arguments: the written form cannot show the old stands in
    [fn(['{(s: string | number) => void} x'], 'number'), fn(['{(s: string) => void} x'], 'number'), ['f: cannot stand in']],
    // a function handed in that will be handed more than it took
    [fn(['{(s: string) => void} x'], 'number'), fn(['{(s: string, n?: number) => void} x'], 'number'), ['f: cannot stand in']],
    // a class member, a class's constructor, a handle's member
    [`export class C {\n  /** @param {string} x @returns {number} */\n  m(x) { return 1; }\n}\n`, `export class C {\n  /** @param {string} x @param {number} [y] @returns {number} */\n  m(x, y = 0) { return y; }\n}\n`, ['C: hands back differently', 'C#m: accepts more']],
    [`export class C {\n  /** @param {string} x */\n  constructor(x) { this.x = x; }\n}\n`, `export class C {\n  /** @param {string} [x] */\n  constructor(x = 'a') { this.x = x; }\n}\n`, ['C: accepts more']],
    [`/**\n * @typedef {Object} H\n * @property {(s: string) => number} m\n */\n${fn(['{string} x'], 'H', 'return { m: () => 1 };')}`, `/**\n * @typedef {Object} H\n * @property {(s: string | number) => number} m\n */\n${fn(['{string} x'], 'H', 'return { m: () => 1 };')}`, ['H.m: accepts more']],
  ];
  for (const [b, a, want] of cases) assert.deepEqual(changes(b, a), want, a);
});

test('only a stated type or a bound tells: errors, channels, arguments written into and a constant\'s value tell no one', () => {
  const p = (body, ret = 'number', bound = '0 to 9', limit = 5) => `/** @type {number} */\nexport const LIMIT = ${limit};
/**
 * @param {{n: number}} box
 * @returns {${ret}}
 * @bound the answer: ${bound}
 */
export function f(box) { ${body} return /** @type {any} */ (box.n); }
`;
  // each of these is worked out and listed, and tells no one
  assert.deepEqual(changes(p(''), p("if (box.n < 0) throw new RangeError('n');")), []);
  assert.deepEqual(changes(p(''), p("console.error('f');")), []);
  assert.deepEqual(changes(p(''), p('box.n += 1;')), []);
  assert.deepEqual(changes(p(''), p('', 'number', '0 to 9', 6)), []);
  assert.deepEqual(worked(p(''), p("if (box.n < 0) throw new RangeError('n'); console.error('f'); box.n += 1;")),
    ['f: errors that can leave it', 'f: arguments written into', 'f: channels, settings and files']);
  // a stated type, a bound and a new type error still tell
  assert.deepEqual(changes(p(''), p('', 'string')), ['f: hands back differently']);
  assert.deepEqual(changes(p(''), p('', 'number', '0 to 8')), ['f: bound changed']);
  assert.deepEqual(changes(p(''), p("const s = /** @type {string} */ (1);")), ['f: type error in its code']);
  // while the same type error stands, a change to its code changes no stated type
  assert.deepEqual(changes(p("const s = /** @type {string} */ (1);"), p("const s = /** @type {string} */ (1); box.n += 1;")), []);
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
  assert.deepEqual(worked(p(''), p(" if (s === 'x') throw new RangeError('x');")), [
    'bare: errors that can leave it', 'handsOn: errors that can leave it', 'maker: errors that can leave it', 'notAwaited: errors that can leave it']);
});

test('channels: what code outside the call writes to a stream out of the program does not reach the item; a file it writes does', () => {
  const p = (more) => `import { writeFileSync } from 'node:fs';
let last = '';
/** @param {string} s @returns {void} */
export function put(s) { last = s;${more} }
/** @returns {string} */
export function get() { return last; }
`;
  assert.deepEqual(worked(p(''), p(' console.log(s);')), ['put: channels, settings and files']);
  assert.deepEqual(worked(p(''), p(" writeFileSync('kept.txt', s);")), ['get: channels, settings and files', 'put: channels, settings and files']);
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
  assert.deepEqual(worked(before, after, { others: pure }), ['b: channels, settings and files']);
  const both = ['a: channels, settings and files', 'b: channels, settings and files'];
  assert.deepEqual(worked(before, after, { others: keeps }), both);
  assert.deepEqual(worked(before, after, { others: listed }), both);
  // state kept inside what it hands out or is handed: a closure, an object's own fields, an argument written into
  const tag = '/** @param {string} s @returns {string} */\nexport function tag(s) { return s; }\n';
  for (const kept of [
    `${tag}/** @returns {{inc: () => number}} */\nexport function counter() { let n = 0; return { inc: () => { n += 1; return n; } }; }\n`,
    `${tag}export class Counter {\n  constructor() { this.n = 0; }\n  /** @returns {number} */\n  inc() { this.n += 1; return this.n; }\n}\n`,
    `${tag}/** @param {{last: string}} box @param {string} s @returns {void} */\nexport function keep(box, s) { box.last = s; }\n`,
  ]) assert.deepEqual(worked(before, after, { others: { m: kept } }), both, kept);
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
  assert.deepEqual(worked(p("'r'"), p('String(Math.random())')), ['last: channels, settings and files', 'make: channels, settings and files']);
});

test('a program of the module started by a literal path: its channels are its starter\'s; env and argv from node:process are read', () => {
  const index = `import { spawn } from 'node:child_process';
export const PROGRAM = new URL('./worker.mjs', import.meta.url).pathname;
/** @param {(line: string) => void} onLine @returns {void} */
export function start(onLine) { const c = spawn(process.execPath, [PROGRAM]); c.stdout.on('data', (/** @type {unknown} */ d) => onLine(String(d))); }
/** @param {string} line @returns {string} */
export function trim(line) { return line.trim(); }
`;
  const worker = (body) => ({ 'src/p/worker.mjs': `import { trim } from './index.mjs';\n${body}\n` });
  const run = (b, a) => worked(index, index, { extraB: worker(b), extraA: worker(a) });
  // a stream the program writes moves: what start hands on changes; trim, which starts nothing, is unchanged
  assert.deepEqual(run("process.stdout.write(trim(' a '));", "process.stderr.write(trim(' a '));"), ['PROGRAM: channels, settings and files', 'start: channels, settings and files']);
  // the program now needs a start argument or a setting, read through Node's process or imported from node:process:
  // every item whose closure names the program hears of it (trim's start-up code names it too)
  const needs = ['PROGRAM: channels, settings and files', 'start: channels, settings and files', 'trim: channels, settings and files'];
  assert.deepEqual(run("process.stdout.write('a');", "process.stdout.write(process.argv[2] ?? 'a');"), needs);
  assert.deepEqual(run("process.stdout.write('a');", "import { argv } from 'node:process';\nprocess.stdout.write(argv[2] ?? 'a');"), needs);
  assert.deepEqual(run("process.stdout.write('a');", "import { env } from 'node:process';\nprocess.stdout.write(env.CURRENCY ?? 'a');"), needs);
  assert.deepEqual(run("process.stdout.write('a');", "import * as proc from 'node:process';\nprocess.stdout.write(proc.env.CURRENCY ?? 'a');"), needs);
  // what the program writes on the same stream, and its code, are not its starter's means (a rule the owner keeps)
  assert.deepEqual(run("process.stdout.write('a');", "process.stdout.write('a\\n\\n');"), []);
  // read in the module's own code, a setting imported from node:process is the item's
  const own = (v) => `import { env } from 'node:process';\n/** @returns {string} */\nexport function currency() { return ${v}; }\n`;
  assert.deepEqual(moduleMeans(product({ p: own("env.CURRENCY ?? 'EUR'") }), 'p').items.currency.channels, ['setting CURRENCY']);
});

// civicsmith, 26 Nov 2026: a conversion stated the types of a module whose kinds name each other; each kind written out
// in full wherever it appears made millions of parts of a few hundred distinct ones, and the means did not fit memory.
test('equal parts of the means are kept once, written the same; a kind\'s instances are read from the items that name it', () => {
  loadReader();
  const p = `/**\n * @typedef {Object} Leaf\n * @property {'leaf'} tag\n * @property {Tree[]} kids\n */
/**\n * @typedef {Object} Fork\n * @property {'fork'} tag\n * @property {Tree} left\n * @property {Tree} right\n * @property {Leaf} [first]\n */
/** @typedef {Leaf | Fork} Tree */
class Box { constructor() { this.v = 1; } }
/** @param {Tree} t @returns {Tree} */
export function keep(t) { return t; }
/** @param {Tree} t @returns {Fork} */
export function fork(t) { return { tag: 'fork', left: t, right: t }; }
/** @param {Fork} f @returns {Box} */
export function box(f) { return f.left ? new Box() : new Box(); }
`;
  const m = moduleMeans(product({ p }), 'p');
  const tree = (it) => it.accepts.items[0].t;
  // the same part, one object: what keep and fork accept, and what keep hands back
  assert.equal(tree(m.items.keep), tree(m.items.fork));
  assert.equal(tree(m.items.keep), m.items.keep.handsBack);
  // written out as before: the kinds in full, each cycle cut where it comes round again
  const text = JSON.stringify(m.items.keep.accepts);
  assert.match(text, /"k":"cycle"/);
  assert.ok(text.split('"name":"p.Leaf"').length > 3, text);
  // a kind's instances: those of every item whose means name it (as the text of its means shows the name)
  for (const [name, it] of Object.entries(m.items).filter(([, x]) => x.kind === 'kind')) {
    const tag = `"name":${JSON.stringify(`p.${name}`)}`;
    const by = Object.values(m.items).filter((x) => x.instances && JSON.stringify([x.accepts, x.handsBack]).includes(tag));
    assert.deepEqual(it.instances, [...new Set(by.flatMap((x) => x.instances))].sort(), name);
  }
  assert.ok(m.items.Fork.instances.length, 'Fork is named by an item that builds an instance');
});

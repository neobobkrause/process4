import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkCmd, listingCmd, notifyCmd } from '../lib/notify.mjs';
import { loadTree } from '../lib/notice/model.mjs';
import { notice } from '../lib/notice/notice.mjs';
import { parseBlock } from '../lib/github.mjs';
import { create, mark } from '../lib/state.mjs';
import { git } from '../lib/util.mjs';
import { commit, config, ctxFor, fakeGitHub, makeRepo, write } from './helpers.mjs';

// GitHub that fails on any reach: listing and check read the checkout only.
const untouchable = new Proxy({}, { get: (_, k) => () => { throw new Error(`reached GitHub: ${String(k)}`); } });

const DATES = (bound = '1 to 31', extra = '') => `/**
 * @typedef {Object} Day
 * @property {number} n
 * @bound n: whole number, ${bound}
 */
/**
 * @param {string} text
 * @returns {Day}
 */
export function parseDay(text) { return { n: Number(text) }; }
/**
 * @param {Day} d
 * @returns {string}
 */
export function formatDay(d) { return String(d.n)${extra}; }
`;
const ORDERS = `import { parseDay } from '../dates/index.mjs';
/**
 * @param {string} t
 * @returns {number}
 */
export function orderDay(t) { return parseDay(t).n; }
`;
const entry = (name, uses = [], over = {}) => ({ name, files: [`src/${name}/`], tests: [`test/${name}/`], public: [`src/${name}/index.mjs`], uses, ...over });
const productFiles = () => ({
  'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
  'process/modules/order.txt': 'dates\norders\nreport\n',
  'process/modules/dates.json': entry('dates'),
  'process/modules/orders.json': entry('orders', ['dates']),
  'process/modules/report.json': entry('report', ['dates']),
  'src/dates/index.mjs': DATES(),
  'src/orders/index.mjs': ORDERS,
  'src/report/index.mjs': `import { formatDay } from '../dates/index.mjs';\n/** @param {number} n @returns {string} */\nexport const show = (n) => formatDay({ n });\n`,
  'test/orders/index.test.mjs': `import { orderDay } from '../../src/orders/index.mjs';\norderDay('3');\n`,
});

// A merged pull request whose merge commit is real: a branch with `files`, merged into main with --no-ff.
function mergedPR(root, gh, files, n = 7) {
  git(['checkout', '-q', '-b', `job/dates/${n}`], { cwd: root });
  commit(root, files, 'the job');
  git(['checkout', '-q', 'main'], { cwd: root });
  git(['merge', '-q', '--no-ff', '-m', `Merge pull request #${n}`, `job/dates/${n}`], { cwd: root });
  const sha = git(['rev-parse', 'HEAD'], { cwd: root });
  gh.s.prs.push({ number: n, state: 'closed', merged_at: '2026-11-20T10:00:00Z', merge_commit_sha: sha, head: { ref: `job/dates/${n}`, sha: 'h'.repeat(40) }, base: { ref: 'main' } });
  return sha;
}

const waitingWork = (gh) => gh.s.comments.map((c) => parseBlock(c.body, mark('waiting-work'))).find(Boolean)?.data;

test('commands that do not read code never load the language reader', () => {
  const p4 = new URL('../p4.mjs', import.meta.url).href;
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import { createRequire } from 'node:module';
    const { main } = await import(${JSON.stringify(p4)});
    main(['--help'], { log: () => {} });
    main(['state', 'read', '--help'], { log: () => {} });
    const req = createRequire(import.meta.url);
    console.log(Object.keys(req.cache).some((k) => k.includes('typescript')) ? 'loaded' : 'not loaded');
  `], { encoding: 'utf8' });
  assert.equal(r.stdout.trim(), 'not loaded', r.stderr);
});

test('the module list is read from the Process4 forms: the longest matching path owns a file', () => {
  const root = mkdtempSync(join(tmpdir(), 'p4-model-'));
  write(root, {
    ...productFiles(),
    'process/modules/order.txt': 'dates\norders\nreport\nlate\n',
    'process/modules/late.json': entry('late', [], { files: ['src/dates/late/'], public: ['src/dates/late/'] }),
    'src/dates/late/x.mjs': 'export const x = 1;\n',
    'src/dates/notes.txt': 'not code\n',
  });
  const t = loadTree(root);
  assert.deepEqual(t.modules.map((m) => m.id), ['dates', 'orders', 'report', 'late']);
  assert.deepEqual(t.byId.get('dates').files.map((f) => f.slice(root.length + 1)), ['src/dates/index.mjs']);
  assert.deepEqual(t.byId.get('late').public.map((f) => f.slice(root.length + 1)), ['src/dates/late/x.mjs']);
  assert.deepEqual(t.byId.get('orders').tests.map((f) => f.slice(root.length + 1)), ['test/orders/index.test.mjs']);
  assert.equal(t.moduleOfFile(join(root, 'src/dates/late/x.mjs')), 'late');
  assert.equal(t.moduleOfFile(join(root, 'README.md')), null);
});

test('listing prints a module\'s listing at HEAD or at a named commit, and writes nothing to GitHub', () => {
  const root = makeRepo(productFiles());
  const first = git(['rev-parse', 'HEAD'], { cwd: root });
  commit(root, { 'src/dates/index.mjs': DATES('1 to 30') });
  const { ctx, out } = ctxFor(root, untouchable);
  assert.equal(listingCmd(ctx, 'dates', { _: [] }), 0);
  const now = out.join('\n');
  assert.match(now, /^Listing of dates\n {2}kind Day {3}\[src\/dates\/index\.mjs:2\]\n {6}accepts: \{ n: number \}\n {6}hands back: \{ n: number \}\n {6}bound: n: whole number, 1 to 30\n/);
  assert.match(now, /\n {2}function formatDay {3}\[src\/dates\/index\.mjs:15\]\n {6}accepts: \(arg0: \{ n: number \}\)\n {6}hands back: string\n {6}bound: n: whole number, 1 to 30\n/);
  out.length = 0;
  listingCmd(ctx, 'dates', { _: [], at: first });
  assert.match(out.join('\n'), /bound: n: whole number, 1 to 31/);
  assert.throws(() => listingCmd(ctx, 'dates', { _: [], at: 'nosuch' }), /nosuch is not a commit/);
  assert.throws(() => listingCmd(ctx, 'nobody', { _: [] }), /no module is named nobody/);
  assert.equal(git(['status', '--porcelain'], { cwd: root }), '');
});

test('notify tells the users of a changed entry and writes their reasons into waiting work, once per provider and user', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  const { issue, records } = create(gh, 'o/product', ['waiting-work'], () => {});
  gh.editComment('o/product', records['waiting-work'].id, `<!-- ${mark('waiting-work')} -->\n\`\`\`json\n{"work":[{"module":"report","kind":"walk-flaw","flaw":"t1-1-I-1-1","link":"x"}]}\n\`\`\`\n`);
  assert.ok(issue);
  const sha = mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 30') });
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  const text = out.join('\n');
  assert.match(text, new RegExp(`before ${git(['rev-parse', `${sha}^1`], { cwd: root }).slice(0, 10)} \\(first parent\\), after ${sha.slice(0, 10)}`));
  assert.match(text, /Notice for a change to dates \(TypeScript 5\.6\.3\)/);
  assert.match(text, /dates parseDay: bound changed -> tells users/);
  assert.match(text, /TOLD orders\n {6}uses dates Day \(bound changed\) at src\/orders\/index\.mjs:6\n {6}uses dates parseDay \(bound changed\) at src\/orders\/index\.mjs:1, src\/orders\/index\.mjs:6\n/);
  assert.match(text, /TOLD report\n {6}uses dates Day \(bound changed\) at src\/report\/index\.mjs:3\n {6}uses dates formatDay \(bound changed\) at src\/report\/index\.mjs:1, src\/report\/index\.mjs:3\n/);
  const work = waitingWork(gh).work;
  assert.equal(work.length, 3);
  assert.equal(work[0].kind, 'walk-flaw');
  const orders = work.find((w) => w.module === 'orders');
  assert.deepEqual({ ...orders, uses: undefined }, { module: 'orders', kind: 'notice', from: 'dates', merged: 7, uses: undefined });
  const day = orders.uses.find((u) => u.entry === 'Day');
  assert.deepEqual(day, { module: 'dates', entry: 'Day', changes: ['bound changed'], lines: ['src/orders/index.mjs:6'], through: null,
    before: { bounds: ['n: whole number, 1 to 31'] }, after: { bounds: ['n: whole number, 1 to 30'] } });
  assert.deepEqual(orders.uses.map((u) => u.entry).sort(), ['Day', 'parseDay']);
  // Run again for the same merge: its own entries are rewritten, not doubled.
  notifyCmd(ctx, 7);
  assert.equal(waitingWork(gh).work.length, 3);
});

test('notify on a merge that changes no listing tells nobody and writes nothing', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  mergedPR(root, gh, { 'src/dates/index.mjs': DATES('1 to 31', " + ''") });
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  assert.match(out.join('\n'), /Notice for a change to dates[^\n]*\nThe listing before and after is the same\. Nobody is told\./);
  assert.equal(gh.s.comments.length, 0);
  gh.s.prs.push({ number: 9, state: 'closed', merged_at: null, head: { ref: 'x' }, base: { ref: 'main' } });
  assert.throws(() => notifyCmd(ctx, 9), /pull request 9 is not merged/);
});

test('notify runs once for each module the merge changed, in module order', () => {
  const root = makeRepo(productFiles());
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  mergedPR(root, gh, {
    'src/orders/index.mjs': ORDERS.replace('@returns {number}', '@returns {number} the day').replace('parseDay(t).n', 'parseDay(t).n + 0'),
    'src/dates/index.mjs': DATES('1 to 30'),
  });
  const { ctx, out } = ctxFor(root, gh);
  notifyCmd(ctx, 7);
  const text = out.join('\n');
  assert.ok(text.indexOf('Notice for a change to dates') < text.indexOf('Notice for a change to orders'));
  assert.match(text, /Notice for a change to orders[^\n]*\nThe listing before and after is the same\. Nobody is told\./);
});

test('rule 52: accepting more tells nobody only where the type checker confirms it', () => {
  const p = (opt, ret) => `/**
 * @typedef {Object} Thing
 * @property {() => ${ret}} size
 */
/**
 * @param {{ name: string${opt} }} o
 * @returns {Thing}
 */
export function make(o) { return { size: () => ${ret === 'number' ? 1 : "'1'"} }; }
`;
  const files = (opt, ret) => ({
    'process.json': config(),
    'process/modules/order.txt': 'p\nu\n',
    'process/modules/p.json': entry('p'),
    'process/modules/u.json': entry('u', ['p']),
    'src/p/index.mjs': p(opt, ret),
    'src/u/index.mjs': "import { make } from '../p/index.mjs';\nexport const one = () => make({ name: 'a' });\n",
  });
  const before = mkdtempSync(join(tmpdir(), 'p4-r52-'));
  const more = mkdtempSync(join(tmpdir(), 'p4-r52-'));
  const hidden = mkdtempSync(join(tmpdir(), 'p4-r52-'));
  write(before, files('', 'number'));
  write(more, files('; size?: number', 'number'));
  write(hidden, files('; size?: number', 'string'));
  const a = notice(before, more, 'p');
  assert.deepEqual(a.entries.map((e) => `${e.entry}: ${e.changes}`), ['make: accepts more']);
  assert.deepEqual(a.told, []);
  // The tool's own comparison sees only "accepts more" for make (Thing is written by name); the checker does not
  // confirm it, since what make hands back changed: it is "cannot stand in", and u, which calls make, is told.
  const b = notice(before, hidden, 'p');
  const mk = b.entries.find((e) => e.entry === 'make');
  assert.deepEqual(mk.changes, ['cannot stand in']);
  assert.match(mk.notConfirmed, /not find the new entry assignable to the old/);
  assert.deepEqual(b.told.map((t) => t.user), ['u']);
  assert.deepEqual(b.told[0].reasons.map((r) => `${r.entry}: ${r.changes}`), ['make: cannot stand in']);
});

test('not followed fully: a declared provider with no use found tells the user on any change, a new entry too', () => {
  const root = mkdtempSync(join(tmpdir(), 'p4-nf-'));
  const after = mkdtempSync(join(tmpdir(), 'p4-nf-'));
  const files = productFiles();
  files['process/modules/order.txt'] = 'dates\norders\nreport\nidle\n';
  files['process/modules/idle.json'] = entry('idle', ['dates']);
  files['src/idle/index.mjs'] = 'export const idle = 1;\n';
  write(root, files);
  write(after, { ...files, 'src/dates/index.mjs': `${DATES()}\n/** @returns {number} */\nexport function today() { return 1; }\n` });
  const r = notice(root, after, 'dates');
  assert.deepEqual(r.entries.map((e) => `${e.entry}: ${e.changes}`), ['today: new entry']);
  assert.deepEqual(r.told.map((t) => [t.user, t.reasons]), [['idle', [{ module: 'dates', notFollowed: ['declares dates but no use of it is found in its code'], through: null }]]]);
});

test('check prints each disagreement with file and line, and exits 1', () => {
  const files = productFiles();
  files['src/orders/index.mjs'] = `import { parseDay } from '../dates/index.mjs';
import { show } from '../report/index.mjs';
/**
 * @param {string} t
 * @returns {string}
 */
export function orderDay(t) { return parseDay(t).n; }
export const bad = () => parseDay(3);
export const s = show;
/** @returns {number} */
export const word = () => 'a';
`;
  files['test/orders/index.test.mjs'] = `import { orderDay } from '../../src/orders/index.mjs';\n/** @type {boolean} */\nexport const x = orderDay('3');\n`;
  const root = makeRepo(files);
  const { ctx, out } = ctxFor(root, untouchable);
  assert.throws(() => checkCmd(ctx, 'orders', { _: [] }), /disagreement\(s\) in orders/);
  const text = out.join('\n');
  assert.match(text, /src\/orders\/index\.mjs:2 declared uses disagree with the imports: imports report, which process\/modules\/orders\.json does not declare in uses/);
  assert.match(text, /src\/orders\/index\.mjs:7 \(b\) code disagrees with the stated interface of dates: Type 'number' is not assignable to type 'string'/);
  assert.match(text, /src\/orders\/index\.mjs:8 \(b\) code disagrees with the stated interface of dates: Argument of type 'number'/);
  assert.match(text, /src\/orders\/index\.mjs:11 \(a\) a comment disagrees with this module's code: Type 'string' is not assignable to type 'number'/);
  // --files: only the files named.
  out.length = 0;
  assert.throws(() => checkCmd(ctx, 'orders', { _: [], files: 'test/orders/index.test.mjs' }), /1 disagreement/);
  assert.match(out.join('\n'), /test\/orders\/index\.test\.mjs:3 \(a\) a comment disagrees with this module's tests/);
  assert.doesNotMatch(out.join('\n'), /src\/orders\/index\.mjs/);
});

test('check: a declared use no code makes disagrees; what the reader cannot tell is said, never refused; rules of form are not taken', () => {
  const files = productFiles();
  files['process/modules/report.json'] = entry('report', ['dates', 'orders']);
  const root = makeRepo(files);
  const { ctx, out } = ctxFor(root, untouchable);
  assert.throws(() => checkCmd(ctx, 'report', { _: [] }), /1 disagreement/);
  assert.match(out.join('\n'), /process\/modules\/report\.json declared uses disagree with the imports: declares orders in uses, but neither its source nor its tests import it/);
  // An import of a provider's private file (the proof's rule 28), `this` in a plain handle (rule 49), a throw of an
  // unstated kind (rule 29): none refused. A computed import(): cannot tell.
  commit(root, {
    'src/dates/inner.mjs': 'export const z = 1;\n',
    'src/orders/index.mjs': `import { parseDay } from '../dates/index.mjs';
import { z } from '../dates/inner.mjs';
/** @typedef {{ n: number, get: () => number }} Box */
/** @type {Box} */
export const box = { n: z, get() { return this.n; } };
/**
 * @param {string} t
 * @returns {number}
 * @throws {RangeError}
 */
export function orderDay(t) { if (!t) throw new TypeError('no'); return parseDay(t).n; }
export const later = (/** @type {string} */ name) => import(name);
`,
  });
  out.length = 0;
  assert.equal(checkCmd(ctx, 'orders', { _: [] }), 0);
  assert.match(out.join('\n'), /Check of orders: no disagreement found/);
  assert.match(out.join('\n'), /cannot tell, not refused: src\/orders\/index\.mjs:12 an import of a name the tool cannot read/);
});

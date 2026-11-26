// The final check's experiments (process/research/precision-26nov/final-check.md, E1 to E8), rebuilt as tests of the
// tool, with the corrections they asked for (design part 2, sections 6 to 8): a told job that declares an item of its
// own that changes with the provider's; one writer for each record; a conversion; an order fault, and a re-export, of a
// module with no uses file; a new item that changes what a name resolves to; comments and layout alone; a stated
// unknown; a --same item and what takes it in; a message's channel.
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { close, push, RECORD_MARK } from '../lib/commands.mjs';
import { block, parseBlock } from '../lib/github.mjs';
import { notifyCmd } from '../lib/notify.mjs';
import { notice } from '../lib/notice/notice.mjs';
import { hunkRuns, runningCode, tokensOf } from '../lib/notice/running.mjs';
import { JOB_MARK } from '../lib/round.mjs';
import { decideScope } from '../lib/scope.mjs';
import { create, mark } from '../lib/state.mjs';
import { git, parseArgs } from '../lib/util.mjs';
import { commit, config, converted, ctxFor, fakeGitHub, makeRepo, write } from './helpers.mjs';
import { withUsesFiles } from './usesfiles.mjs';

const entry = (name, over = {}) => ({ name, files: [`src/${name}/`], tests: [`test/${name}/`], public: [`src/${name}/index.mjs`], ...over });
const product = (src, { order = ['dates', 'orders', 'report'], entries = {} } = {}) => ({
  'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
  'process/modules/order.txt': `${order.join('\n')}\n`,
  ...Object.fromEntries(order.map((m) => [`process/modules/${m}.json`, entries[m] ?? entry(m)])),
  ...src,
});
const sides = (before, after) => {
  const b = mkdtempSync(join(tmpdir(), 'p4-check-')), a = mkdtempSync(join(tmpdir(), 'p4-check-'));
  write(b, before);
  write(a, after);
  return [b, a];
};
const toldOf = (r) => Object.fromEntries(r.told.map((t) => [t.user, t.reasons.map((x) => (x.item ? `${x.module} ${x.item}: ${x.changes.join(', ')}` : `${x.module}: ${x.orderFault ? 'order fault' : x.outside ? 'outside' : 'no uses file'}`))]));

// E1 and E2: dates' LIMIT and lim; orders computes MAX from LIMIT and hands back lim's answer in m; report uses MAX and m.
const DATES = (limit, bound) => `/** @type {number} */
export const LIMIT = ${limit};
/**
 * @returns {number}
 * @bound the answer: ${bound}
 */
export function lim() { return 5; }
`;
const ORDERS = `import { LIMIT, lim } from '../dates/index.mjs';
/** @type {number} */
export const MAX = LIMIT * 2;
/** @returns {number} */
export function m() { return lim(); }
`;
const REPORT = `import { MAX, m } from '../orders/index.mjs';
/** @returns {number} */
export const most = () => MAX + m();
`;

test('E1, E2: a told job that changes no code but declares its own items that change with the provider\'s merges with no test, and its merge tells their users', () => {
  const files = withUsesFiles(product({ 'src/dates/index.mjs': DATES(5, '0 to 9'), 'src/orders/index.mjs': ORDERS, 'src/report/index.mjs': REPORT }));
  // the provider's change tells orders alone: report's uses file names only orders' MAX and m
  const [b, a] = sides(files, { ...files, 'src/dates/index.mjs': DATES(6, '0 to 8') });
  const first = notice(b, a, 'dates');
  assert.deepEqual(Object.keys(toldOf(first)), ['orders']);
  assert.deepEqual(toldOf(first).orders, ['dates LIMIT: value changed', 'dates lim: bound changed']);

  // orders' told job: the change reaches MAX's value and m's bound, so it declares both and finds nothing to change
  const root = makeRepo({ ...files, 'src/dates/index.mjs': DATES(6, '0 to 8') });
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const gh = fakeGitHub();
  converted(gh, ['dates', 'orders', 'report']);
  create(gh, 'o/product', ['waiting-work'], () => {});
  const { ctx, out } = ctxFor(root, gh);
  git(['checkout', '-q', '-b', 'job/orders.2', 'origin/tranche'], { cwd: root });
  git(['commit', '-q', '--allow-empty', '-m', 'Start job/orders.2'], { cwd: root });
  git(['push', '-q', 'origin', 'job/orders.2'], { cwd: root });
  const pr = gh.createPR('o/product', { head: 'job/orders.2', base: 'tranche', draft: true });
  gh.addComment('o/product', pr.number, block(JOB_MARK, { module: 'orders', work: ['notice from dates (pull request 4)'], kind: 'told', uses: first.told[0].reasons, notices: [{ from: 'dates', merged: 4 }] }));
  assert.equal(push(ctx, parseArgs(['--meaning', 'MAX', 'twice dates LIMIT: 10; now 12', '--meaning', 'm', 'dates lim handed back: 0 to 9; now 0 to 8'])), 0);
  pr.head.sha = git(['rev-parse', 'HEAD'], { cwd: root });
  const blockBefore = gh.s.comments.find((c) => parseBlock(c.body, JOB_MARK)).body;
  assert.equal(close(ctx, pr.number, { _: [], 'nothing-to-change': 'orders computes MAX and m as before; their values follow dates' }), 0);
  const text = out.join('\n');
  assert.match(text, new RegExp(`pull request ${pr.number} declares MAX, m of orders changed with its provider: it merges, with no test, and its merge tells their users`));
  assert.match(text, /no test record needed: scope nothing, because no changed file is under a module's code or tests; the told job recorded that it found nothing to change/);
  assert.equal(pr.state, 'open');
  assert.equal(pr.draft, false);
  // the job wrote only its own record; the job block is ARCH's and is as ARCH wrote it
  assert.deepEqual(gh.s.comments.map((c) => parseBlock(c.body, RECORD_MARK)).find(Boolean).data, { nothing_to_change: 'orders computes MAX and m as before; their values follow dates' });
  assert.equal(gh.s.comments.find((c) => parseBlock(c.body, JOB_MARK)).body, blockBefore);

  // ARCH merges it; notify on that merge tells report of the two declared items
  git(['checkout', '-q', '-B', 'tranche', 'origin/tranche'], { cwd: root });
  git(['merge', '-q', '--no-ff', '-m', `Merge pull request #${pr.number}`, 'job/orders.2'], { cwd: root });
  Object.assign(pr, { state: 'closed', merged_at: '2026-11-26T10:00:00Z', closed_at: '2026-11-26T10:00:00Z', merge_commit_sha: git(['rev-parse', 'HEAD'], { cwd: root }) });
  out.length = 0;
  assert.equal(notifyCmd(ctx, pr.number), 0);
  const told = out.join('\n');
  assert.match(told, /TOLD report\n {6}uses orders MAX \(meaning changed; found by the pull request's declaration\)[^\n]*\n {6}uses orders m \(meaning changed; found by the pull request's declaration\)/);
  const waiting = gh.s.comments.map((c) => parseBlock(c.body, mark('waiting-work'))).find(Boolean).data;
  assert.deepEqual(waiting.work.map((w) => `${w.module} ${w.from}`), ['report orders']);
});

test('E1: a told job that declares nothing and whose uses file is unchanged is closed unmerged', () => {
  const files = withUsesFiles(product({ 'src/dates/index.mjs': DATES(6, '0 to 8'), 'src/orders/index.mjs': ORDERS, 'src/report/index.mjs': REPORT }));
  const root = makeRepo(files);
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const gh = fakeGitHub();
  converted(gh, ['dates', 'orders', 'report']);
  const { ctx, out } = ctxFor(root, gh);
  git(['checkout', '-q', '-b', 'job/report.2', 'origin/tranche'], { cwd: root });
  git(['push', '-q', 'origin', 'job/report.2'], { cwd: root });
  const pr = gh.createPR('o/product', { head: 'job/report.2', base: 'tranche', draft: true });
  gh.addComment('o/product', pr.number, block(JOB_MARK, { module: 'report', work: ['notice from orders (pull request 5)'], kind: 'told', notice_seq: 1 }));
  assert.equal(close(ctx, pr.number, { _: [], 'nothing-to-change': 'report shows MAX as it is' }), 0);
  assert.equal(pr.state, 'closed');
  assert.match(out.join('\n'), /closed pull request 1 unmerged/);
  // one write, by the job: nothing to change, and the notice it answers
  assert.deepEqual(gh.s.comments.map((c) => parseBlock(c.body, RECORD_MARK)).find(Boolean).data,
    { nothing_to_change: 'report shows MAX as it is', notice_needs_no_change: { notice_seq: 1, why: 'report shows MAX as it is' } });
  assert.equal(parseBlock(gh.s.comments.find((c) => parseBlock(c.body, JOB_MARK)).body, JOB_MARK).data.notice_needs_no_change, undefined);
});

// E3 and E7: a module with no uses file.
const PARSE = (extra = '') => `/** @param {string} t @returns {number} */\nexport function parseDay(t) {${extra} return Number(t); }\n`;

test('E3: a later module with no uses file is told when it imports the provider through a module that re-exports it', () => {
  for (const reexport of ["export { parseDay } from '../dates/index.mjs';\n", "export * from '../dates/index.mjs';\n"]) {
    const base = withUsesFiles(product({
      'src/dates/index.mjs': PARSE(),
      'src/orders/index.mjs': reexport,
      'src/report/index.mjs': "import { parseDay } from '../orders/index.mjs';\n/** @returns {number} */\nexport const r = () => parseDay('1');\n",
    }));
    const f = Object.fromEntries(Object.entries(base).filter(([k]) => !k.endsWith('report.uses.json')));
    const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': PARSE(" if (!t) throw new RangeError('empty');") });
    const r = notice(b, a, 'dates');
    assert.ok(r.told.some((t) => t.user === 'report'), `${reexport}: ${JSON.stringify(toldOf(r))}`);
    const why = r.told.find((t) => t.user === 'report').reasons.find((x) => x.module === 'dates').why;
    assert.match(why, /report has no uses file yet and imports through orders, which re-exports dates/);
    // with its uses file, it is told through the route, as before (E6)
    const [b2, a2] = sides(base, { ...base, 'src/dates/index.mjs': PARSE(" if (!t) throw new RangeError('empty');") });
    assert.ok(notice(b2, a2, 'dates').told.some((t) => t.user === 'report'));
  }
});

test('E7: an earlier module with no uses file and an order fault naming the provider, read from its imports, is told', () => {
  const base = withUsesFiles(product({
    'src/dates/index.mjs': "import { m } from '../orders/index.mjs';\n/** @returns {number} */\nexport const d = () => m();\n",
    'src/orders/index.mjs': '/** @returns {number} */\nexport function m() { return 1; }\n',
    'src/report/index.mjs': 'export const r = 1;\n',
  }));
  const change = { 'src/orders/index.mjs': '/** @returns {number} */\nexport function m() { return 2; }\n/** @returns {string} */\nexport function n() { return "x"; }\n' };
  // with its uses file, dates is told by the order fault the file lists
  const [b, a] = sides(base, { ...base, ...change });
  assert.ok(toldOf(notice(b, a, 'orders')).dates.every((x) => x === 'orders: order fault'));
  // without it, from its imports
  const f = Object.fromEntries(Object.entries(base).filter(([k]) => !k.endsWith('dates.uses.json')));
  const [b2, a2] = sides(f, { ...f, ...change });
  const r = notice(b2, a2, 'orders');
  assert.deepEqual(toldOf(r).dates, ['orders: order fault']);
  const x = r.told.find((t) => t.user === 'dates').reasons[0];
  assert.match(x.why, /dates has no uses file yet and imports orders, a later module: an order fault names orders/);
  assert.equal(x.orderFault, 'imports src/dates/index.mjs:1');
  assert.deepEqual(x.places, ['src/dates/index.mjs:1']);
});

test('E8: a new item that changes what a name already used resolves to (two items of one name through export *) tells that name\'s users', () => {
  const f = withUsesFiles(product({
    'src/dates/index.mjs': PARSE(),
    'src/orders/index.mjs': "export * from '../dates/index.mjs';\nexport * from './own.mjs';\n",
    'src/orders/own.mjs': '/** @returns {number} */\nexport function x() { return 1; }\n',
    'src/report/index.mjs': "import { x } from '../orders/index.mjs';\n/** @returns {number} */\nexport const r = () => x();\n",
  }, { entries: { orders: entry('orders', { public: ['src/orders/index.mjs', 'src/orders/own.mjs'] }) } }));
  const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': `${PARSE()}/** @returns {string} */\nexport function x() { return 'x'; }\n` });
  const r = notice(b, a, 'dates');
  assert.deepEqual(r.fresh, ['x']);
  assert.deepEqual(r.changed.map((c) => `${c.module} ${c.item}: ${c.changes}`), ['orders x: dates x now reaches it through a re-export']);
  assert.deepEqual(toldOf(r).report, ['orders x: dates x now reaches it through a re-export']);
  // a new item no name reaches tells no one
  const [b2, a2] = sides(f, { ...f, 'src/dates/index.mjs': `${PARSE()}/** @returns {string} */\nexport function y() { return 'y'; }\n` });
  assert.deepEqual(notice(b2, a2, 'dates').changed, []);
});

test('the insides only: a --same item tells no one, and neither does what takes in a change only through it', () => {
  const f = withUsesFiles(product({
    'src/dates/index.mjs': PARSE(),
    'src/orders/index.mjs': "import { parseDay } from '../dates/index.mjs';\n/** @param {string} t @returns {number} */\nexport function orderDay(t) { return parseDay(t) + 1; }\n",
    'src/report/index.mjs': "import { orderDay } from '../orders/index.mjs';\n/** @returns {number} */\nexport const r = () => orderDay('1');\n",
  }));
  const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': PARSE(" if (t === 'never') throw new RangeError('no');") });
  const told = notice(b, a, 'dates');
  assert.deepEqual(told.changed.map((c) => `${c.module} ${c.item}`), ['dates parseDay', 'orders orderDay', 'report r']);
  assert.deepEqual(Object.keys(toldOf(told)), ['orders', 'report']);
  const same = notice(b, a, 'dates', { sameAs: [{ item: 'parseDay', why: "no caller hands it 'never'" }] });
  assert.deepEqual(same.changed.map((c) => `${c.module} ${c.item} ${c.tells}`), ['dates parseDay false']);
  assert.deepEqual(same.told, []);
});

test('a message\'s channel is part of what a kind hands back: a change of it tells', () => {
  const MSG = (ch) => `/**\n * @typedef {Object} Reading\n * @property {number} n\n * @message ${ch}\n */\n/** @param {Reading} r @returns {number} */\nexport function read(r) { return r.n; }\n`;
  const f = withUsesFiles(product({
    'src/dates/index.mjs': MSG('stdout'),
    'src/orders/index.mjs': "/** @typedef {import('../dates/index.mjs').Reading} Reading */\n/** @param {Reading} r @returns {number} */\nexport const o = (r) => r.n;\n",
    'src/report/index.mjs': 'export const r = 1;\n',
  }));
  const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': MSG('stdin') });
  const r = notice(b, a, 'dates');
  const c = r.changed.find((x) => x.item === 'Reading');
  assert.deepEqual(c.changes, ['hands back differently']);
  assert.match(c.words, /hands back differently: a message on stdout -> a message on stdin/);
  assert.ok(r.told.some((t) => t.user === 'orders'));
});

test('comments and layout alone are not running code: the scope is nothing, and a told job\'s related tests ignore such a line', () => {
  const A = "import { d } from '../dates/index.mjs';\nexport const o = d + 1;\n";
  const B = "import { d } from '../dates/index.mjs';\n/** The order, one more than the day. @type {number} */\nexport const o =   d +\n  1; // one more\n";
  assert.equal(runningCode('a.mjs', A), runningCode('a.mjs', B));
  assert.notEqual(runningCode('a.mjs', A), runningCode('a.mjs', A.replace('d + 1', 'd + 2')));
  assert.equal(runningCode('a.json', '{}'), null);
  // a hunk of comments only does not run; one that changes a token does, a token across lines included
  const t1 = tokensOf('a.mjs', 'const a = 1;\n// x\nconst s = `a\nb`;\n'), t2 = tokensOf('a.mjs', 'const a = 1;\n// y\nconst s = `a\nc`;\n');
  assert.equal(hunkRuns('a.mjs', t1, t2, { os: 2, oc: 1, ns: 2, nc: 1 }), false);
  assert.equal(hunkRuns('a.mjs', t1, t2, { os: 4, oc: 1, ns: 4, nc: 1 }), true);
  assert.equal(hunkRuns('a.json', null, null, { os: 1, oc: 1, ns: 1, nc: 1 }), true);
  // the scope of a job whose change is comments and layout only
  const files = {
    'process.json': config(), 'process/modules/order.txt': 'dates\norders\n',
    'process/modules/dates.json': { name: 'dates', files: ['src/dates/'], tests: ['test/dates/'] },
    'process/modules/orders.json': { name: 'orders', files: ['src/orders/'], tests: ['test/orders/'] },
    'src/dates/index.mjs': 'export const d = 1;\n', 'src/orders/index.mjs': A,
  };
  const scopeOf = (change) => {
    const root = makeRepo(files);
    const base = git(['rev-parse', 'HEAD'], { cwd: root });
    git(['checkout', '-q', '-b', 'job/orders.2'], { cwd: root });
    commit(root, change);
    git(['checkout', '-q', '--detach', base], { cwd: root });
    git(['merge', '-q', '--no-ff', '--no-edit', 'job/orders.2'], { cwd: root });
    return decideScope(root, { base, baseRef: 'tranche', branch: 'job/orders.2', draft: false, jobBlock: { module: 'orders', kind: 'ordinary' } });
  };
  const s = scopeOf({ 'src/orders/index.mjs': B });
  assert.equal(s.scope, 'nothing');
  assert.match(s.why, /changes running code: in 1 file\(s\) only comments or layout changed/);
  assert.equal(scopeOf({ 'src/orders/index.mjs': A.replace('d + 1', 'd + 2') }).scope, 'whole module');
  assert.equal(scopeOf({ 'src/orders/data.json': '{}\n' }).scope, 'whole module');
});

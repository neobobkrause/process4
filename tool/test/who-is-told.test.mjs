// Who a change tells (design part 2, section 7), as the tool builds it: a middle module's item that takes in a changed
// part of a provider; a constant's value; a test that mocks a provider's member; packages and the host; a module with
// no uses file that reaches a provider by a path, or where the tool cannot tell; the mechanical edit; and an item the
// pull request records as keeping its domain and range.
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { notifyCmd } from '../lib/notify.mjs';
import { notice, noticeText, versionNotices } from '../lib/notice/notice.mjs';
import { block } from '../lib/github.mjs';
import { MEANING_MARK } from '../lib/round.mjs';
import { create } from '../lib/state.mjs';
import { TEST_MARK } from '../lib/testrecord.mjs';
import { git } from '../lib/util.mjs';
import { commit, config, ctxFor, fakeGitHub, makeRepo, write } from './helpers.mjs';
import { withUsesFiles } from './usesfiles.mjs';

const entry = (name, over = {}) => ({ name, files: [`src/${name}/`], tests: [`test/${name}/`], public: [`src/${name}/index.mjs`], ...over });
const DATES = (extra = '') => `/**
 * @param {string} text
 * @returns {number}
 */
export function parseDay(text) {${extra} return Number(text); }
/** @param {number} n @returns {string} */
export function formatDay(n) { return String(n); }
`;
// orders calls parseDay where its errors are not caught; report uses only orders.
const ORDERS = `import { parseDay } from '../dates/index.mjs';
/** @param {string} t @returns {number} */
export function orderDay(t) { return parseDay(t) + 1; }
/** @param {string} t @returns {number} */
export function safeDay(t) { try { return parseDay(t); } catch { return 0; } }
`;
const REPORT = `import { orderDay, safeDay } from '../orders/index.mjs';
/** @returns {number} */
export const first = () => orderDay('1');
/** @returns {number} */
export const second = () => safeDay('2');
`;
const files = (over = {}) => ({
  'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
  'process/modules/order.txt': 'dates\norders\nreport\n',
  'process/modules/dates.json': entry('dates'),
  'process/modules/orders.json': entry('orders'),
  'process/modules/report.json': entry('report'),
  'src/dates/index.mjs': DATES(),
  'src/orders/index.mjs': ORDERS,
  'src/report/index.mjs': REPORT,
  ...over,
});
const sides = (before, after) => {
  const b = mkdtempSync(join(tmpdir(), 'p4-who-')), a = mkdtempSync(join(tmpdir(), 'p4-who-'));
  write(b, before);
  write(a, after);
  return [b, a];
};

test('a later module\'s item that takes in a changed error of a provider is a changed item too, found in its uses file, and so on', () => {
  const f = withUsesFiles(files({
    'process/modules/order.txt': 'dates\norders\nreport\nfar\n',
    'process/modules/far.json': entry('far'),
    'src/report/index.mjs': `${REPORT}/** @returns {number} */\nexport const both = () => first() + 1;\n`,
    'src/far/index.mjs': "import { both } from '../report/index.mjs';\n/** @returns {number} */\nexport const f = () => both();\n",
  }));
  // The uses file records what each of the module's own items takes in: orderDay can pass parseDay's errors on;
  // safeDay catches them, so takes in only its channels.
  const takes = f['process/modules/orders.uses.json'].takesIn;
  assert.deepEqual(takes, [
    { item: 'orderDay', provider: 'dates', providerItem: 'parseDay', part: 'channels' },
    { item: 'orderDay', provider: 'dates', providerItem: 'parseDay', part: 'errors' },
    { item: 'safeDay', provider: 'dates', providerItem: 'parseDay', part: 'channels' },
  ]);
  const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': DATES(" if (!text) throw new RangeError('empty');") });
  const r = notice(b, a, 'dates');
  assert.deepEqual(r.changed.map((c) => `${c.module} ${c.item}: ${c.changes}`), [
    'dates parseDay: errors that can leave it changed',
    'orders orderDay: errors that can leave it changed',
    'report both: errors that can leave it changed',
    'report first: errors that can leave it changed',
    'far f: errors that can leave it changed',
  ]);
  assert.deepEqual(r.changed[1].takesIn, [{ module: 'dates', item: 'parseDay', part: 'errors' }]);
  // report is told of orderDay (and not of safeDay, which caught them), and far of both, through two middle modules
  assert.deepEqual(r.told.map((t) => [t.user, t.reasons.map((x) => `${x.module} ${x.item}`)]), [
    ['orders', ['dates parseDay']], ['report', ['orders orderDay']], ['far', ['report both']]]);
  assert.match(noticeText(r), /orders orderDay: errors that can leave it changed \[found by its means\] -> tells its users\n {6}means: takes in the errors of dates parseDay, which changed/);
  // A change only to the channels of parseDay reaches safeDay too.
  const [b2, a2] = sides(f, { ...f, 'src/dates/index.mjs': DATES(" console.error('parsing');") });
  assert.deepEqual(notice(b2, a2, 'dates').changed.filter((c) => c.module === 'orders').map((c) => c.item), ['orderDay', 'safeDay']);
});

test('a constant\'s value is in its means: a changed value tells its users, whether or not its kind is stated', () => {
  const p = (v, typed = false) => `${typed ? '/** @type {number} */\n' : ''}export const LIMIT = ${v};\n`;
  const f = (src) => withUsesFiles(files({ 'src/dates/index.mjs': `${DATES()}${src}`, 'src/orders/index.mjs': `${ORDERS}import { LIMIT } from '../dates/index.mjs';\n/** @returns {number} */\nexport const most = () => LIMIT;\n` }));
  const run = (bv, av, typed) => {
    const before = f(p(bv, typed));
    const [b, a] = sides(before, { ...before, 'src/dates/index.mjs': `${DATES()}${p(av, typed)}` });
    return notice(b, a, 'dates');
  };
  const plain = run(5, 6);
  assert.deepEqual(plain.changed.map((c) => `${c.item}: ${c.changes}`), ['LIMIT: hands back differently']);
  assert.match(plain.changed[0].words, /hands back differently: 5 -> 6/);
  assert.deepEqual(plain.told.map((t) => t.user), ['orders']);
  const typed = run(5, 6, true);
  assert.deepEqual(typed.changed.map((c) => `${c.item}: ${c.changes}`), ['LIMIT: value changed']);
  assert.match(typed.changed[0].words, /value changed: 5 -> 6/);
  assert.deepEqual(typed.told.map((t) => t.user), ['orders']);
  // written otherwise, the same value: its code is the same
  assert.deepEqual(run('5', '(5)', true).changed, []);
});

test('describing tells no one only where the item\'s code is unchanged', () => {
  const RAW = (body) => `\nexport function raw(x) { ${body} }\n`;
  const STATED = (body) => `\n/** @param {string} x @returns {string} */\nexport function raw(x) { ${body} }\n`;
  const f = withUsesFiles(files({ 'src/dates/index.mjs': DATES() + RAW('return x;'), 'src/orders/index.mjs': `${ORDERS}import { raw } from '../dates/index.mjs';\n/** @returns {unknown} */\nexport const r = () => raw('a');\n` }));
  const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': DATES() + STATED('return x;') });
  assert.deepEqual(notice(b, a, 'dates').changed, []);
  const [b2, a2] = sides(f, { ...f, 'src/dates/index.mjs': DATES() + STATED("return x + '';") });
  assert.deepEqual(notice(b2, a2, 'dates').changed.map((c) => `${c.item}: ${c.changes}`), ['raw: cannot stand in,hands back differently']);
  // at the module's conversion, describing with the code changed still tells no one
  assert.deepEqual(notice(b2, a2, 'dates', { conversion: true }).changed, []);
  // a stated unknown made specific is describing too: no change where the code is unchanged
  const UNKNOWN = (body) => `\n/** @param {unknown} x @returns {unknown} */\nexport function raw(x) { ${body} }\n`;
  const g = withUsesFiles(files({ 'src/dates/index.mjs': DATES() + UNKNOWN('return x;'), 'src/orders/index.mjs': `${ORDERS}import { raw } from '../dates/index.mjs';\n/** @returns {unknown} */\nexport const r = () => raw('a');\n` }));
  const [b3, a3] = sides(g, { ...g, 'src/dates/index.mjs': DATES() + STATED('return x;') });
  assert.deepEqual(notice(b3, a3, 'dates').changed, []);
  const [b4, a4] = sides(g, { ...g, 'src/dates/index.mjs': DATES() + STATED("return x + '';") });
  assert.deepEqual(notice(b4, a4, 'dates').told.map((t) => t.user), ['orders']);
});

test('at a conversion only describing tells no one: an item removed, a constant\'s value changed, tell as always (E4)', () => {
  const f = withUsesFiles(files({
    'src/dates/index.mjs': `${DATES()}/** @type {number} */\nexport const LIMIT = 5;\n/** @returns {number} */\nexport function gone() { return 1; }\n`,
    'src/orders/index.mjs': `${ORDERS}import { LIMIT, gone } from '../dates/index.mjs';\n/** @returns {number} */\nexport const most = () => LIMIT + gone();\n`,
  }));
  const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': `${DATES()}/** @type {number} */\nexport const LIMIT = 6;\n` });
  const r = notice(b, a, 'dates', { conversion: true });
  assert.deepEqual(r.changed.map((c) => `${c.item}: ${c.changes} ${c.tells}`), ['LIMIT: value changed true', 'gone: removed true']);
  assert.deepEqual(r.told.map((t) => [t.user, t.reasons.map((x) => x.item)]), [['orders', ['LIMIT', 'gone']]]);
  // the same at no conversion
  assert.deepEqual(notice(b, a, 'dates').told.map((t) => t.user), ['orders']);
});

test('a test that replaces or mocks a provider\'s member is a use of type mock, told of any change to the provider\'s files', () => {
  const f = withUsesFiles(files({
    'test/orders/index.test.mjs': `import { mock, test } from 'node:test';
import * as dates from '../../src/dates/index.mjs';
import { orderDay } from '../../src/orders/index.mjs';
test('orders > a day', () => { mock.method(dates, 'parseDay', () => 2); orderDay('1'); });
`,
  }));
  const mocks = f['process/modules/orders.uses.json'].uses.filter((u) => u.type === 'mock');
  assert.deepEqual(mocks.map((u) => [u.provider, u.item, u.where.map((w) => w.test)]), [['dates', 'parseDay', [['orders > a day']].flat()]]);
  // a change to dates' files that changes no item: orders is told, for its mock; report is not
  const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': `${DATES()}/** @returns {number} */\nexport function today() { return 1; }\n` });
  const r = notice(b, a, 'dates');
  assert.deepEqual(r.changed, []);
  assert.deepEqual(r.told.map((t) => [t.user, t.reasons.map((x) => [x.found, x.mock])]), [['orders', [['any change', 'parseDay']]]]);
  assert.match(noticeText(r), /TOLD orders\n {6}a mock of parseDay: its files changed, though no item's means did; a test of orders replaces or mocks parseDay of dates/);
});

test('packages and the host: each facility used is recorded with its package; a version change tells the modules that use it', () => {
  const f = withUsesFiles(files({
    'process/modules/facilities.json': { versions: { node: '22.12.0' }, boundary: [], facilities: [] },
    'package.json': { name: 'product', dependencies: { 'left-pad': '1.0.0' } },
    'src/orders/index.mjs': `${ORDERS}/** @param {string} s @returns {string} */\nexport const tidy = (s) => s.trim();\n`,
    'src/report/index.mjs': `${REPORT}import pad from 'left-pad';\n/** @returns {unknown} */\nexport const padded = () => pad;\n`,
  }));
  const pk = (m) => f[`process/modules/${m}.uses.json`].packages;
  assert.ok(pk('orders').some((x) => x.package === 'node' && x.facility === 'String.trim'), JSON.stringify(pk('orders')));
  assert.ok(pk('report').some((x) => x.package === 'left-pad'), JSON.stringify(pk('report')));
  // the host's version changes: every module that uses a facility of it
  const [b, a] = sides(f, { ...f, 'process/modules/facilities.json': { versions: { node: '22.13.0' }, boundary: [], facilities: [] } });
  const host = versionNotices(b, a);
  assert.deepEqual(host.map((v) => [v.package, v.told.map((t) => t.user)]), [['node', ['dates', 'orders']]]);
  assert.match(host[0].told[1].reasons[0].why, /node's version changed .* orders uses .*String\.trim/);
  // a package's version changes: the modules whose uses file names it
  const [b2, a2] = sides(f, { ...f, 'package.json': { name: 'product', dependencies: { 'left-pad': '1.1.0' } } });
  assert.deepEqual(versionNotices(b2, a2).map((v) => [v.package, v.told.map((t) => t.user), v.told[0].reasons[0].package]), [['left-pad', ['report'], 'left-pad']]);
  assert.deepEqual(versionNotices(b, b), []);
  // a module with no uses file yet cannot say which packages it uses: it is told of every version change
  const g = { ...f }; delete g['process/modules/report.uses.json'];
  const [b3, a3] = sides(g, { ...g, 'package.json': { name: 'product', dependencies: { 'left-pad': '1.1.0' } } });
  const v3 = versionNotices(b3, a3);
  assert.deepEqual(v3.map((v) => [v.package, v.told.map((t) => t.user)]), [['left-pad', ['report']]]);
  assert.match(v3[0].told[0].reasons[0].why, /report has no uses file yet/);
});

test('a version written for the first time tells no one: the facility list\'s first creation; a real change of the host\'s version still tells', () => {
  const list = (v) => ({ versions: { node: v }, boundary: [], facilities: [] });
  const f = withUsesFiles(files({
    'process/modules/facilities.json': list('22.12.0'),
    'src/orders/index.mjs': `${ORDERS}/** @param {string} s @returns {string} */\nexport const tidy = (s) => s.trim();\n`,
  }));
  const none = { ...f }; delete none['process/modules/facilities.json'];
  // the list first written: the host had no version before, so none changed
  const [b, a] = sides(none, f);
  assert.deepEqual(versionNotices(b, a), []);
  // node 22 -> 24: every module that uses a facility of it
  const [b2, a2] = sides(f, { ...f, 'process/modules/facilities.json': list('24.1.0') });
  assert.deepEqual(versionNotices(b2, a2).map((v) => [v.package, v.was, v.told.map((t) => t.user)]),
    [['node', 'the facility list\'s versions "22.12.0"', ['dates', 'orders']]]);
});

test('a module with no uses file is told when it imports a provider, reads its files by path or starts its program; every one where the tool cannot tell', () => {
  const base = files({
    'process/modules/order.txt': 'dates\norders\nreport\nreader\nopen\n',
    'process/modules/reader.json': entry('reader'), 'process/modules/open.json': entry('open'),
    'src/dates/table.json': '{}\n',
    'src/reader/index.mjs': "import { readFileSync } from 'node:fs';\nexport const t = () => readFileSync('src/dates/table.json', 'utf8');\n",
    'src/open/index.mjs': "import { readFileSync } from 'node:fs';\nexport const t = (/** @type {string} */ p) => readFileSync(p, 'utf8');\n",
  });
  // orders and report have uses files; reader and open have none yet
  const withUses = withUsesFiles(base);
  const f = Object.fromEntries(Object.entries(withUses).filter(([k]) => !/(reader|open)\.uses\.json$/.test(k)));
  const [b, a] = sides(f, { ...f, 'src/dates/table.json': '{"a": 1}\n' });
  const r = notice(b, a, 'dates');
  const told = Object.fromEntries(r.told.map((t) => [t.user, t.reasons.map((x) => x.why)]));
  assert.deepEqual(Object.keys(told), ['reader', 'open']);
  assert.match(told.reader[0], /reader has no uses file yet and names a path into dates/);
  assert.match(told.open[0], /open has no uses file yet, and the tool cannot tell which modules it reaches \(readFileSync by a path the tool cannot read at src\/open\/index\.mjs:2\)/);
});

test('a conversion\'s merge tells no module by point 3; an ordinary job\'s merge does; a conversion that changed an item tells as any merge', () => {
  const LIMIT = (v) => `/** @type {number} */\nexport const LIMIT = ${v};\n`;
  // loose holds a place outside the standard (an untyped call of dates); plain has no uses file yet and imports dates
  const base = withUsesFiles(files({
    'process/modules/order.txt': 'dates\norders\nreport\nloose\nplain\n',
    'process/modules/loose.json': entry('loose'), 'process/modules/plain.json': entry('plain'),
    'src/dates/index.mjs': DATES() + LIMIT(5),
    'src/orders/index.mjs': `${ORDERS}import { LIMIT } from '../dates/index.mjs';\n/** @returns {number} */\nexport const most = () => LIMIT;\n`,
    'src/loose/index.mjs': "import { parseDay } from '../dates/index.mjs';\nexport function l(x) { return parseDay(x); }\n",
    'src/plain/index.mjs': "import { formatDay } from '../dates/index.mjs';\nexport const p = () => formatDay(1);\n",
  }));
  const f = Object.fromEntries(Object.entries(base).filter(([k]) => !k.endsWith('plain.uses.json')));
  assert.ok(f['process/modules/loose.uses.json'].outside.length, JSON.stringify(f['process/modules/loose.uses.json']));
  // the insides only: a helper no item reaches
  const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': `${DATES()}${LIMIT(5)}function helper() { return 1; }\nhelper();\n` });
  const ordinary = notice(b, a, 'dates');
  assert.deepEqual(ordinary.told.map((t) => [t.user, [...new Set(t.reasons.map((x) => (x.outside ? 'outside' : x.noUsesFile ? 'no uses file' : x.item)))]]),
    [['loose', ['outside']], ['plain', ['no uses file']]]);
  const conv = notice(b, a, 'dates', { conversion: true });
  assert.deepEqual(conv.told, []);
  assert.match(conv.summary, /nobody is told/);
  // a conversion that changes a constant's value: it does not change nothing, so it tells as any merge: its users by
  // point 1, and the place outside and the module with no uses file by point 3
  const [b2, a2] = sides(f, { ...f, 'src/dates/index.mjs': DATES() + LIMIT(6) });
  const conv2 = notice(b2, a2, 'dates', { conversion: true });
  assert.deepEqual(conv2.told.map((t) => t.user).sort(), ['loose', 'orders', 'plain']);
  assert.deepEqual(conv2.told.find((t) => t.user === 'orders').reasons.map((x) => x.item ?? x.found), ['LIMIT']);
});

// A merged pull request whose merge commit is real.
function mergedPR(root, gh, branch, files, n = 7) {
  git(['checkout', '-q', '-b', branch], { cwd: root });
  commit(root, files, 'the change');
  git(['checkout', '-q', 'main'], { cwd: root });
  git(['merge', '-q', '--no-ff', '-m', `Merge pull request #${n}`, branch], { cwd: root });
  const sha = git(['rev-parse', 'HEAD'], { cwd: root });
  gh.s.prs.push({ number: n, state: 'closed', merged_at: '2026-11-20T10:00:00Z', merge_commit_sha: sha, head: { ref: branch, sha: 'h'.repeat(40) }, base: { ref: 'main' } });
  return sha;
}

test('notify: a mechanical edit does not tell a module whose files it changed and whose tests its record ran whole', () => {
  const day = (s) => `${REPORT}import { formatDay } from '../dates/index.mjs';\n/** @returns {string} */\nexport const day = () => formatDay(${s});\n`;
  const root = makeRepo(withUsesFiles(files({ 'src/report/index.mjs': day('1') })));
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  // formatDay now takes text: one change covering dates and its one user, report, whose whole tests the record ran
  mergedPR(root, gh, 'work/rename', {
    'src/dates/index.mjs': DATES().replace('/** @param {number} n @returns {string} */', '/** @param {string} n @returns {string} */'),
    'src/report/index.mjs': day("'1'"),
  });
  const head = git(['rev-parse', 'work/rename'], { cwd: root });
  const record = { commit: head, scope: 'whole module', modules: ['dates', 'report'], result: 'pass', passed: 3, failed: 0 };
  gh.addComment('o/product', 7, block(TEST_MARK, record));
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  assert.match(out.join('\n'), /TOLD report/);
  assert.match(out.join('\n'), /not told, as the pull request changed their files and its test record ran their whole tests on the merged result: report/);
  assert.doesNotMatch(out.join('\n'), /waiting work:/);
});

test('notify: the whole-tests exception holds only for a record of the merged result; a record of an earlier commit, or of related tests, tells', () => {
  const day = (s) => `${REPORT}import { formatDay } from '../dates/index.mjs';\n/** @returns {string} */\nexport const day = () => formatDay(${s});\n`;
  const run = (record) => {
    const root = makeRepo(withUsesFiles(files({ 'src/report/index.mjs': day('1') })));
    const gh = fakeGitHub();
    create(gh, 'o/product', ['waiting-work'], () => {});
    const tested = git(['rev-parse', 'HEAD'], { cwd: root });
    mergedPR(root, gh, 'work/rename', {
      'src/dates/index.mjs': DATES().replace('/** @param {number} n @returns {string} */', '/** @param {string} n @returns {string} */'),
      'src/report/index.mjs': day("'1'"),
    });
    const head = git(['rev-parse', 'work/rename'], { cwd: root });
    gh.addComment('o/product', 7, block(TEST_MARK, record({ head, tested })));
    const { ctx, out } = ctxFor(root, gh);
    assert.equal(notifyCmd(ctx, 7), 0);
    return out.join('\n');
  };
  const whole = { scope: 'whole module', modules: ['dates', 'report'], result: 'pass', passed: 3, failed: 0 };
  // the record ran an earlier commit, before the change: report is told
  const early = run(({ tested }) => ({ ...whole, commit: tested }));
  assert.match(early, /told although its test record ran their whole tests, as the record is not of the merged result/);
  assert.match(early, /waiting work: report \(notice from dates\)/);
  // a related run is not the whole tests
  assert.match(run(({ head }) => ({ ...whole, commit: head, scope: 'related' })), /waiting work: report \(notice from dates\)/);
  // a module the record did not run whole is told
  assert.match(run(({ head }) => ({ ...whole, commit: head, modules: ['dates'] })), /waiting work: report \(notice from dates\)/);
});

test('notify: an item the pull request records as keeping its domain and range tells no one; every other change still tells', () => {
  const root = makeRepo(withUsesFiles(files({ 'src/report/index.mjs': `${REPORT}import { formatDay } from '../dates/index.mjs';\n/** @returns {string} */\nexport const day = () => formatDay(1);\n` })));
  const gh = fakeGitHub();
  create(gh, 'o/product', ['waiting-work'], () => {});
  mergedPR(root, gh, 'job/dates/7', {
    'src/dates/index.mjs': DATES(" if (!text) throw new RangeError('empty');").replace('formatDay(n) { return String(n); }', "formatDay(n) { if (n < 0) throw new RangeError('n'); return String(n); }"),
  });
  gh.addComment('o/product', 7, block(MEANING_MARK, { meaning: [], same: [{ item: 'formatDay', why: 'n is never below zero: the check is one no caller reaches' }] }));
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  const text = out.join('\n');
  assert.match(text, /the pull request records that dates formatDay keeps its domain and range: n is never below zero/);
  assert.match(text, /dates formatDay: errors that can leave it changed \[found by its means\] -> tells no one\n {6}means: [^\n]*\n {6}the same domain and range, as the pull request records: n is never below zero/);
  assert.doesNotMatch(text, /uses dates formatDay/);
  assert.match(text, /TOLD orders\n {6}uses dates parseDay \(errors that can leave it changed/);
});

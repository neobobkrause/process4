// Who a change tells (design part 2, section 7), as the tool builds it: a provider's error or channel taken in by a
// middle module's item, which tells no one; a constant's value; a test that mocks a provider's member; packages and the host; a module with
// no uses file that reaches a provider by a path, or where the tool cannot tell; the mechanical edit; and an item the
// pull request records as keeping its domain and range.
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { notifyCmd } from '../lib/notify.mjs';
import { notice, noticeText, versionNotices } from '../lib/notice/notice.mjs';
import { check } from '../lib/notice/check.mjs';
import { loadTree } from '../lib/notice/model.mjs';
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

test('a provider\'s error or channel taken in by a later module\'s item makes no item changed; the uses file still records it', () => {
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
  // Only a change of an item's stated types or bounds tells (the owner's decision of 26 November): a new error, or a
  // channel, of parseDay changes no item, here or in a later module.
  for (const extra of [" if (!text) throw new RangeError('empty');", " console.error('parsing');"]) {
    const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': DATES(extra) });
    const r = notice(b, a, 'dates');
    assert.deepEqual(r.changed, [], extra);
    assert.deepEqual(r.told, [], extra);
  }
  // its stated type still tells its users
  const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': DATES().replace('@returns {number}', '@returns {number | null}') });
  assert.deepEqual(notice(b, a, 'dates').told.map((t) => t.user), ['orders']);
});

test('a constant\'s value within its stated type tells no one; with no stated type, the value is its type and tells', () => {
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
  assert.deepEqual(typed.changed, []);
  assert.deepEqual(typed.told, []);
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

// civicsmith, 26 Nov 2026: a conversion that only stated types took away an item's "implicitly has an 'any' type" while a
// type error its code had before stayed; the list of errors differed, the item counted as changed, and every module
// importing the provider with no uses file was told.
test('a type error the code had before and still has, its code the same, is no change; a new one is; the code changed while it has the same one is not', () => {
  const RAW = (body) => `\nexport function shout(p) { const n = 1; ${body} }\n`;
  const STATED = (body) => `\n/** @param {string} p @returns {string} */\nexport function shout(p) { const n = 1; ${body} }\n`;
  const user = `${ORDERS}import { shout } from '../dates/index.mjs';\n/** @returns {unknown} */\nexport const s = () => shout('a');\n`;
  const f = withUsesFiles(files({
    'process/modules/order.txt': 'dates\norders\nreport\nlate\n', 'process/modules/late.json': entry('late'),
    'src/dates/index.mjs': DATES() + RAW('return n.toUpperCase() + p;'), 'src/orders/index.mjs': user,
    'src/late/index.mjs': "import { shout } from '../dates/index.mjs';\nexport const t = () => shout('b');\n",
  }));
  delete f['process/modules/late.uses.json'];
  const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': DATES() + STATED('return n.toUpperCase() + p;') });
  const conv = notice(b, a, 'dates', { conversion: true });
  assert.deepEqual(conv.changed, []);
  assert.deepEqual(conv.told, []);
  // a type error the stated types bring: a change, told as any (late, with no uses file, by point 3)
  const [b2, a2] = sides(f, { ...f, 'src/dates/index.mjs': DATES() + STATED('return n.toUpperCase() + p;').replace('{string} p', '{number} p').replace(' + p;', ' + p.trim();') });
  const two = notice(b2, a2, 'dates', { conversion: true });
  assert.deepEqual(two.changed.map((c) => `${c.item}: ${c.changes}`), ['shout: type error in its code']);
  assert.deepEqual(two.told.map((t) => t.user), ['orders', 'late']);
  // the code changed while it has the same one: no stated type changed (the owner's decision of 26 November)
  const [b3, a3] = sides(f, { ...f, 'src/dates/index.mjs': DATES() + STATED("return n.toUpperCase() + p + '!';") });
  assert.deepEqual(notice(b3, a3, 'dates', { conversion: true }).changed, []);
});

// civicsmith, 26 Nov 2026: a conversion that stated an early provider's types and added a bound line told its users of
// the bound, and each reason's before and after also carried what it accepts and hands back, written out in full,
// though stating them only describes the item (no change, design part 2, section 7).
test('a reason\'s before and after hold only the parts that changed: a part only described is left out of them', () => {
  const KIND = (bound) => `/**\n * @typedef {Object} Span\n * @property {number} from\n * @property {number} to\n${bound ? ` * @bound to: ${bound}\n` : ''} */\n`;
  const RAW = '\nexport function spanOf(x) { return x; }\n';
  const STATED = '\n/** @param {Span} x @returns {Span} */\nexport function spanOf(x) { return x; }\n';
  const STATED_N = '\n/** @param {Span} x @returns {number} */\nexport function spanOf(x) { return x.to; }\n';
  const user = `${ORDERS}import { spanOf } from '../dates/index.mjs';\n/** @returns {unknown} */\nexport const s = () => spanOf({ from: 1, to: 2 });\n`;
  const f = withUsesFiles(files({ 'src/dates/index.mjs': DATES() + KIND() + RAW, 'src/orders/index.mjs': user }));
  const reasonOf = (r) => r.told.find((t) => t.user === 'orders').reasons.find((x) => x.item === 'spanOf');
  // at the conversion: what spanOf accepts and hands back is only described; its bound changed
  const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': DATES() + KIND('at most 99') + STATED });
  const conv = notice(b, a, 'dates', { conversion: true });
  assert.deepEqual(conv.changed.find((c) => c.item === 'spanOf').changes, ['bound changed']);
  assert.deepEqual(reasonOf(conv).before, { bounds: null });
  assert.deepEqual(reasonOf(conv).after, { bounds: ['to: at most 99'] });
  // the same where the code is unchanged and the merge is no conversion: describing is no change there either
  const plain = notice(b, a, 'dates');
  assert.deepEqual(Object.keys(reasonOf(plain).after), ['bounds']);
  // a part that changed besides describing is kept, as it was and is: it handed back text, and now a number
  const g = withUsesFiles(files({ 'src/dates/index.mjs': DATES() + KIND() + RAW.replace('return x;', 'return String(x);'), 'src/orders/index.mjs': user }));
  const [b2, a2] = sides(g, { ...g, 'src/dates/index.mjs': DATES() + KIND('at most 99') + STATED_N });
  const r2 = reasonOf(notice(b2, a2, 'dates', { conversion: true }));
  assert.deepEqual(r2.changes, ['hands back differently', 'bound changed']);
  assert.deepEqual(r2.before, { handsBack: 'string', bounds: null });
  assert.deepEqual(r2.after, { handsBack: 'number', bounds: ['to: at most 99'] });
});

test('at a conversion only describing tells no one: an item removed tells as always; a constant\'s value within its type tells no one (E4)', () => {
  const f = withUsesFiles(files({
    'src/dates/index.mjs': `${DATES()}/** @type {number} */\nexport const LIMIT = 5;\n/** @returns {number} */\nexport function gone() { return 1; }\n`,
    'src/orders/index.mjs': `${ORDERS}import { LIMIT, gone } from '../dates/index.mjs';\n/** @returns {number} */\nexport const most = () => LIMIT + gone();\n`,
  }));
  const [b, a] = sides(f, { ...f, 'src/dates/index.mjs': `${DATES()}/** @type {number} */\nexport const LIMIT = 6;\n` });
  const r = notice(b, a, 'dates', { conversion: true });
  assert.deepEqual(r.changed.map((c) => `${c.item}: ${c.changes} ${c.tells}`), ['gone: removed true']);
  assert.deepEqual(r.told.map((t) => [t.user, t.reasons.map((x) => x.item)]), [['orders', ['gone']]]);
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
  // a conversion that changes a constant's stated type: it does not change nothing, so it tells as any merge: its users
  // by point 1, and the place outside and the module with no uses file by point 3
  const [b2, a2] = sides(f, { ...f, 'src/dates/index.mjs': `${DATES()}/** @type {number | null} */\nexport const LIMIT = 6;\n` });
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
    'src/dates/index.mjs': DATES().replace('@returns {number}', '@returns {number | null}').replace('/** @param {number} n @returns {string} */', '/** @param {number} n @returns {string} @bound n: zero or more */'),
  });
  gh.addComment('o/product', 7, block(MEANING_MARK, { meaning: [], same: [{ item: 'formatDay', why: 'n is never below zero: the check is one no caller reaches' }] }));
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(notifyCmd(ctx, 7), 0);
  const text = out.join('\n');
  assert.match(text, /the pull request records that dates formatDay keeps its domain and range: n is never below zero/);
  assert.match(text, /dates formatDay: bound changed \[found by its means\] -> tells no one\n {6}means: [^\n]*\n {6}the same domain and range, as the pull request records: n is never below zero/);
  assert.doesNotMatch(text, /uses dates formatDay/);
  assert.match(text, /TOLD orders\n {6}uses dates parseDay \(hands back differently/);
});

// ---- a uses file an earlier tool wrote, read as that tool meant it ----

const OLD_P = `/** @typedef {{ id: number, name: string }} Row */
/** @returns {Row} */
export function row() { return { id: 1, name: 'one' }; }
/** @returns {number} */
export function one() { return 1; }
`;
const OLD_U = `import { row, one } from '../p/index.mjs';
import dgram from 'node:dgram';
/** @returns {string} */
export function name() { return row().name; }
/** @returns {number} */
export function two() { return one() + 1; }
/** @returns {unknown} */
export const sock = () => dgram.createSocket('udp4');
`;
// u's uses file exactly as the tool at commit 78a2c83 (25 Nov 2026) wrote it, the oldest form the tool has written and
// build text 2c's first: no `value` on a use, no `item` or `relabels` on a place, no `packages`, no `takesIn`; the
// note on node:dgram, a Node module the tool has no description of, kept as a place (R14) that may refer to any
// earlier module and waits on ARCH; `written.tool` the tool's version where its commit could not be read.
const OLDEST_U = {
  module: 'u',
  written: { commit: 'c'.repeat(40), tool: 'process4-tool 0.1.0' },
  providers: ['p'],
  uses: [
    { provider: 'p', item: 'Row', itemKind: 'type', type: 'read', route: 'direct', standard: true, where: [{ file: 'src/u/index.mjs', side: 'code', line: 4, in: 'name' }] },
    { provider: 'p', item: 'Row', itemKind: 'type', type: 'receive', route: 'direct', standard: true, where: [{ file: 'src/u/index.mjs', side: 'code', line: 4, in: 'name' }] },
    { provider: 'p', item: 'one', itemKind: 'function', type: 'call', route: 'direct', standard: true, where: [{ file: 'src/u/index.mjs', side: 'code', line: 6, in: 'two' }] },
    { provider: 'p', item: 'one', itemKind: 'function', type: 'import', route: 'direct', standard: true, where: [{ file: 'src/u/index.mjs', side: 'code', line: 1, in: '(top level)' }] },
    { provider: 'p', item: 'row', itemKind: 'function', type: 'call', route: 'direct', standard: true, where: [{ file: 'src/u/index.mjs', side: 'code', line: 4, in: 'name' }] },
    { provider: 'p', item: 'row', itemKind: 'function', type: 'import', route: 'direct', standard: true, where: [{ file: 'src/u/index.mjs', side: 'code', line: 1, in: '(top level)' }] },
  ],
  outside: [
    { rule: 'R14', file: 'src/u/index.mjs', side: 'code', line: 2, mayRefer: ['*'], waitsOn: 'ARCH: the facility list', tests: [] },
    { rule: 'R1', file: 'src/u/index.mjs', side: 'code', line: 8, mayRefer: ['*'], waitsOn: 'this module', tests: [] },
    { rule: 'R4', file: 'src/u/index.mjs', side: 'code', line: 8, mayRefer: [], waitsOn: 'this module: a stated kind for what it hands out', tests: [] },
  ],
  orderFaults: [],
  copies: [],
};

test('a uses file in the oldest form the tool wrote is read by check and notify as that tool meant it', () => {
  const product = (uses) => ({
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': 'p\nu\n',
    'process/modules/p.json': entry('p'),
    'process/modules/u.json': entry('u'),
    'src/p/index.mjs': OLD_P,
    'src/u/index.mjs': OLD_U,
    ...(uses ? { 'process/modules/u.uses.json': uses } : {}),
  });
  const old = product(OLDEST_U);
  // check: its providers are before it in the order; no place of it refers to a later module
  const [dir] = sides(old, old);
  const c = check(loadTree(dir), 'u');
  assert.deepEqual(c.refusals, []);
  assert.deepEqual(c.cannotTell.filter((x) => /^src\/u\/index\.mjs:/.test(x.at) && ['R14', 'R1', 'R4'].includes(x.code)), []);
  // notify: Row's id changes kind, a member u's code does not read. The oldest file says nothing of what u does with
  // a Row, so its uses read as the whole value and u is told of Row; today's file says u reads only `name`, and u is
  // not told of Row
  const changed = OLD_P.replace('id: number', 'id: string');
  const told = (f) => { const [b, a] = sides(f, { ...f, 'src/p/index.mjs': changed }); return notice(b, a, 'p').told.find((t) => t.user === 'u')?.reasons ?? []; };
  const byOld = told(old);
  assert.ok(byOld.some((r) => r.item === 'Row'), JSON.stringify(byOld));
  const now = withUsesFiles(product(null));
  assert.ok(!now['process/modules/u.uses.json'].outside.some((o) => o.line === 2), 'the note on node:dgram is not kept');
  const byNow = told(now);
  assert.ok(!byNow.some((r) => r.item === 'Row'), JSON.stringify(byNow));
  // the older file's places are read as written: each that may refer to any earlier module hears of any change to it
  assert.deepEqual(byOld.filter((r) => r.outside).map((r) => r.outside), ['R14 src/u/index.mjs:2', 'R1 src/u/index.mjs:8']);
  assert.deepEqual(byNow.filter((r) => r.outside).map((r) => r.outside), ['R1 src/u/index.mjs:8']);
});

test('an R14 place refers to no product module, in a file of any tool\'s writing; a name the tool could not resolve may be the product\'s, and still tells', () => {
  const P1 = '/** @returns {number} */\nexport function one() { return 1; }\n';
  const f = withUsesFiles({
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': 'p\nu\n',
    'process/modules/p.json': entry('p'),
    'process/modules/u.json': entry('u'),
    'src/p/index.mjs': P1,
    // shared-lib: a bare name the tool cannot resolve, which may be a module of the product's own (a workspace
    // package); console.log: the host's, reaching out outside a boundary module
    'src/u/index.mjs': "import * as shared from 'shared-lib';\nexport { shared };\n/** @param {string} s @returns {void} */\nexport function say(s) { console.log(s); }\n",
  });
  const now = f['process/modules/u.uses.json'];
  assert.deepEqual(now.outside.map((o) => `${o.rule} ${o.line} ${JSON.stringify(o.mayRefer)}`), ['R14 1 ["*"]', 'R14 4 []']);
  // p's code changes, no item's stated types: only a place that may refer to p hears of it
  const heard = (files) => {
    const [b, a] = sides(files, { ...files, 'src/p/index.mjs': P1.replace('return 1;', 'return 1 + 0;') });
    return (notice(b, a, 'p').told.find((t) => t.user === 'u')?.reasons ?? []).filter((r) => r.outside).map((r) => r.outside);
  };
  assert.deepEqual(heard(f), ['R14 src/u/index.mjs:1']);
  // u's file as the tool wrote it before: every R14 place may refer to any earlier module, and a note on a host
  // facility the classification left out waits on the module itself. Read now, only the unresolved name hears of p.
  const older = { ...now, outside: [...now.outside.map((o) => ({ ...o, mayRefer: ['*'] })), { rule: 'R14', file: 'src/u/index.mjs', side: 'code', line: 2, mayRefer: ['*'], waitsOn: 'this module', tests: [] }] };
  assert.deepEqual(heard({ ...f, 'process/modules/u.uses.json': older }), ['R14 src/u/index.mjs:1']);
});

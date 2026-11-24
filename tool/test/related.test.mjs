import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { relatedList } from '../lib/notice/related.mjs';
import { relatedCmd } from '../lib/notify.mjs';
import { block } from '../lib/github.mjs';
import { JOB_MARK } from '../lib/round.mjs';
import { decideScope, runTests } from '../lib/scope.mjs';
import { git } from '../lib/util.mjs';
import { commit, config, ctxFor, fakeGitHub, makeRepo } from './helpers.mjs';

// A made-up told module, orders, which uses dates.
const entry = (name, uses = []) => ({ name, files: [`src/${name}/`], tests: [`test/${name}/`], public: [`src/${name}/index.mjs`], uses });
const INDEX = `import { parseDay } from '../dates/index.mjs';
import { total } from './sum.mjs';
/** @param {string} t */
export function dayOf(t) {
  return parseDay(t).n;
}
/** @param {number[]} xs */
export function bill(xs) {
  return total(xs);
}
export function plain() {
  return 1;
}
export function lonely() {
  return 2;
}
`;
const SUM = `/** @param {number[]} xs */
export function total(xs) {
  return xs.reduce((a, b) => a + b, 0);
}
`;
const APPLY = `/**
 * @param {(x: number) => number} f
 * @param {number} x
 */
export function apply(f, x) { return f(x); }
/** @param {number} x */
export function half(x) {
  return x / 2;
}
export const run2 = () => apply(half, 4);
`;
const t = (imp, body) => `import { test } from 'node:test';\nimport { ${imp} } from '../../src/orders/${imp === 'run2' ? 'apply' : 'index'}.mjs';\ntest('it', () => { ${body}; });\n`;
const product = () => ({
  'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
  'process/modules/order.txt': 'dates\norders\n',
  'process/modules/dates.json': entry('dates'),
  'process/modules/orders.json': entry('orders', ['dates']),
  'src/dates/index.mjs': '/** @param {string} s */\nexport function parseDay(s) { return { n: Number(s) }; }\n',
  'src/orders/index.mjs': INDEX,
  'src/orders/sum.mjs': SUM,
  'src/orders/apply.mjs': APPLY,
  'test/orders/day.test.mjs': t('dayOf', "dayOf('1')"),
  'test/orders/bill.test.mjs': t('bill', 'bill([1])'),
  'test/orders/plain.test.mjs': t('plain', 'plain()'),
  'test/orders/apply.test.mjs': t('run2', 'run2()'),
  'test/orders/walk/internal/day.test.mjs': t('dayOf', "dayOf('2')").replace('../../src', '../../../../src'),
});

// GitHub's merge of a job branch into the tranche, checked out, as the run sees it.
function merged(files, branch = 'job/orders/2') {
  const root = makeRepo(product());
  const base = git(['rev-parse', 'HEAD'], { cwd: root });
  git(['checkout', '-q', '-b', branch], { cwd: root });
  commit(root, files);
  git(['checkout', '-q', '--detach', base], { cwd: root });
  git(['merge', '-q', '--no-ff', '--no-edit', branch], { cwd: root });
  return { root, base };
}
const list = (root, base, uses) => relatedList({ dir: root, gitRoot: root, base, after: 'HEAD', module: 'orders', uses });
const files = (r) => Object.fromEntries(r.files.map((f) => [f.file, f.reasons]));
const place = (...lines) => [{ module: 'dates', entry: 'parseDay', changes: ['bound changed'], lines, through: null }];

test('a test file that reaches a place of uses is related; one that holds a place is related; the rest are left out', () => {
  const { root, base } = merged({ 'README.md': 'x\n' });
  const r = list(root, base, place('src/orders/index.mjs:5', 'test/orders/plain.test.mjs:3'));
  assert.deepEqual(files(r), {
    'test/orders/day.test.mjs': ['reaches a piece that holds a place named in uses'],
    'test/orders/plain.test.mjs': ['holds a place named in the job block\'s uses'],
  });
  assert.deepEqual(r.leftOut, ['test/orders/apply.test.mjs', 'test/orders/bill.test.mjs']);
});

test('a place is read in the base and followed to where it stands in the merged result', () => {
  // The job put two lines above dayOf: the place's line 5 is now line 7, still in dayOf.
  const { root, base } = merged({ 'src/orders/index.mjs': `// one\n// two\n${INDEX}` });
  const r = list(root, base, place('src/orders/index.mjs:5'));
  // (The two new lines are top-level code of index.mjs, which runs on import: every test file importing it reaches them.)
  assert.deepEqual(files(r)['test/orders/day.test.mjs'], ['reaches a piece that holds a place named in uses', 'reaches a piece with a line this pull request changed']);
  assert.deepEqual(files(r)['test/orders/plain.test.mjs'], ['reaches a piece with a line this pull request changed']);
});

test('a test file that reaches a changed line, or was itself added or changed, is related', () => {
  const { root, base } = merged({
    'src/orders/sum.mjs': SUM.replace('a + b, 0', 'b + a, 0'),
    'test/orders/plain.test.mjs': t('plain', 'plain(); plain()'),
    'test/orders/new.test.mjs': t('lonely', 'lonely()'),
  });
  const r = list(root, base, []);
  assert.deepEqual(files(r), {
    'test/orders/bill.test.mjs': ['reaches a piece with a line this pull request changed'],
    'test/orders/new.test.mjs': ['added or changed by this pull request'],
    'test/orders/plain.test.mjs': ['added or changed by this pull request'],
  });
});

test('step 1: a needed piece handed on as a value: every test file whose imports lead to its file', () => {
  const { root, base } = merged({ 'src/orders/apply.mjs': APPLY.replace('x / 2', 'x * 0.5') });
  const r = list(root, base, []);
  assert.deepEqual(Object.keys(files(r)), ['test/orders/apply.test.mjs']);
  assert.match(files(r)['test/orders/apply.test.mjs'][0], /^lost the thread, step 1: its imports lead to src\/orders\/apply\.mjs, whose piece at line 7 is named at src\/orders\/apply\.mjs:10/);
});

test('step 2: a test file with an import the reader cannot resolve is related', () => {
  const { root, base } = merged({
    'test/orders/odd.test.mjs': "import { x } from './nowhere.mjs';\nx();\n",
    'test/orders/later.test.mjs': 'const n = "./a.mjs";\nawait import(n);\n',
  });
  git(['commit', '-q', '--allow-empty', '-m', 'x'], { cwd: root });
  // The two files are new, so they are related anyway: ask about the merged result as the base too.
  const r = list(root, 'HEAD', []);
  assert.deepEqual(files(r), {
    'test/orders/later.test.mjs': ['lost the thread, step 2: an import the reader cannot resolve: import() of a computed name at test/orders/later.test.mjs:2'],
    'test/orders/odd.test.mjs': ['lost the thread, step 2: an import the reader cannot resolve: ./nowhere.mjs at test/orders/odd.test.mjs:1'],
  });
});

test('step 3: a use not followed fully runs the whole module; walk folders are never in the list', () => {
  const { root, base } = merged({ 'README.md': 'x\n' });
  const r = list(root, base, [{ module: 'dates', notFollowed: ['reads or calls values of unknown kind'], through: null }]);
  assert.equal(r.whole, true);
  assert.deepEqual(r.files.map((f) => f.file), ['test/orders/apply.test.mjs', 'test/orders/bill.test.mjs', 'test/orders/day.test.mjs', 'test/orders/plain.test.mjs']);
  assert.match(r.files[0].reasons[0], /^lost the thread, step 3: not followed fully for dates/);
  assert.equal(r.files.some((f) => /walk/.test(f.file)), false);
});

const told = (uses) => ({ module: 'orders', work: ['notice from dates (pull request 4)'], kind: 'told', uses });
const scopeOf = (root, base, jobBlock) => decideScope(root, { base, baseRef: 'tranche', branch: 'job/orders/2', draft: false, jobBlock });

test('decideScope: a told job runs its related list; an ordinary one, or one with no job block, its whole module', () => {
  const { root, base } = merged({ 'src/orders/sum.mjs': SUM.replace('a + b, 0', 'b + a, 0') });
  const s = scopeOf(root, base, told(place('src/orders/index.mjs:5')));
  assert.equal(s.scope, 'related');
  assert.deepEqual(s.modules.map((m) => [m.name, m.files, m.left_out]), [['orders', ['test/orders/bill.test.mjs', 'test/orders/day.test.mjs'], ['test/orders/apply.test.mjs', 'test/orders/plain.test.mjs']]]);
  assert.deepEqual(s.modules[0].related.map((r) => r.reasons), [['reaches a piece with a line this pull request changed'], ['reaches a piece that holds a place named in uses']]);
  const o = scopeOf(root, base, { ...told(place('src/orders/index.mjs:5')), kind: 'ordinary' });
  assert.equal(o.scope, 'whole module');
  assert.match(o.why, /its job block says ordinary/);
  assert.equal(o.modules[0].files.length, 4);
  assert.match(scopeOf(root, base, null).why, /no job block was read/);
});

test('decideScope: an empty related list passes at once and says so', () => {
  const { root, base } = merged({ 'src/orders/index.mjs': INDEX.replace('return 2;', 'return 3;') });
  const s = scopeOf(root, base, told(place('src/orders/index.mjs:15')));
  assert.equal(s.scope, 'nothing');
  assert.match(s.why, /told job of orders, and its related list is empty: it passes at once/);
  assert.equal(s.left_out.length, 4);
});

test('the run\'s summary gives each related file\'s rule and the files left out', () => {
  const { root, base } = merged({ 'src/orders/sum.mjs': SUM.replace('a + b, 0', 'b + a, 0') });
  const s = scopeOf(root, base, told([]));
  const out = [];
  assert.equal(runTests(root, s, { log: (x) => out.push(x), summary: '', check: () => ({ code: 0, stdout: '', stderr: '' }) }), true);
  const text = out.join('\n');
  assert.match(text, /Scope: \*\*related\*\*/);
  assert.match(text, /- related: test\/orders\/bill\.test\.mjs: reaches a piece with a line this pull request changed/);
  assert.match(text, /- left out: test\/orders\/apply\.test\.mjs, test\/orders\/day\.test\.mjs, test\/orders\/plain\.test\.mjs/);
  assert.match(text, /- orders: exit 0; 1 file\(s\): test\/orders\/bill\.test\.mjs/);
});

test('related <pr> lists the same from the session, from the merged result of the pull request, and runs nothing', () => {
  const root = makeRepo(product());
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  git(['checkout', '-q', '-b', 'job/orders/2'], { cwd: root });
  commit(root, { 'src/orders/sum.mjs': SUM.replace('a + b, 0', 'b + a, 0') });
  git(['push', '-q', 'origin', 'job/orders/2'], { cwd: root });
  git(['checkout', '-q', 'main'], { cwd: root });
  const gh = fakeGitHub();
  const pr = gh.createPR('o/product', { head: 'job/orders/2', base: 'tranche', draft: false });
  gh.addComment('o/product', pr.number, block(JOB_MARK, told(place('src/orders/index.mjs:5'))));
  const { ctx, out } = ctxFor(root, gh);
  assert.equal(relatedCmd(ctx, pr.number), 0);
  const text = out.join('\n');
  assert.match(text, /^related tests of orders for pull request 1: job\/orders\/2 at [0-9a-f]{10} merged into tranche at [0-9a-f]{10}/);
  assert.match(text, /\n {2}test\/orders\/bill\.test\.mjs: reaches a piece with a line this pull request changed\n {2}test\/orders\/day\.test\.mjs: reaches a piece that holds a place named in uses\n {2}left out: test\/orders\/apply\.test\.mjs, test\/orders\/plain\.test\.mjs$/);
  assert.equal(git(['status', '--porcelain'], { cwd: root }), '');
  assert.equal(git(['branch', '--show-current'], { cwd: root }), 'main');
  // An ordinary job has no related list.
  gh.s.comments[0].body = block(JOB_MARK, { ...told([]), kind: 'ordinary' });
  out.length = 0;
  relatedCmd(ctx, pr.number);
  assert.match(out.join('\n'), /an ordinary job of orders: the required run runs its whole module/);
  void join;
});

test('run scope reads the job block from the comment part one\'s workflow wrote to a file', async () => {
  const { main } = await import('../p4.mjs');
  const { mkdtempSync, writeFileSync, readFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { root, base } = merged({ 'src/orders/sum.mjs': SUM.replace('a + b, 0', 'b + a, 0') });
  const dir = mkdtempSync(join(tmpdir(), 'p4-jb-'));
  writeFileSync(join(dir, 'jb.txt'), block(JOB_MARK, told([])));
  const out = [];
  const args = ['run', 'scope', '--base', base, '--base-ref', 'tranche', '--branch', 'job/orders/2', '--draft', 'false', '--out', join(dir, 's.json')];
  assert.equal(main([...args, '--job-block', join(dir, 'jb.txt')], { root, log: (x) => out.push(x) }), 0);
  assert.equal(JSON.parse(readFileSync(join(dir, 's.json'), 'utf8')).scope, 'related');
  assert.match(out.join('\n'), /test\/orders\/bill\.test\.mjs: reaches a piece with a line this pull request changed/);
  // No file, or an empty one (the comment could not be read): the whole module.
  for (const jb of [join(dir, 'none.txt'), (writeFileSync(join(dir, 'empty.txt'), ''), join(dir, 'empty.txt'))]) {
    main([...args, '--job-block', jb], { root, log: () => {} });
    assert.equal(JSON.parse(readFileSync(join(dir, 's.json'), 'utf8')).scope, 'whole module');
  }
});

test('the shim reads the job block and the test record with its read-only token, and widens no permission', async () => {
  const { readFileSync } = await import('node:fs');
  const wf = readFileSync(new URL('../../shims/module-tests.yml', import.meta.url), 'utf8');
  assert.deepEqual(wf.match(/^\s*permissions:\n(\s+\w[\w-]*: \w+\n)+/gm).map((x) => x.replace(/\s+/g, ' ').trim()), ['permissions: contents: read', 'permissions: contents: read']);
  assert.match(wf, /- name: the job block and the test record\n[\s\S]*case "\$HEAD_REF" in job\/\*\) read_mark process4-job [\s\S]*read_mark process4-test-record /);
  assert.match(wf, /--job-block "\$RUNNER_TEMP\/job-block\.txt" --test-record "\$RUNNER_TEMP\/test-record\.txt"/);
});

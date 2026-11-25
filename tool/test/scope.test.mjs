import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decideScope, runModules } from '../lib/scope.mjs';
import { git } from '../lib/util.mjs';
import { commit, config, makeRepo, productFiles } from './helpers.mjs';

const passing = "import { test } from 'node:test';\ntest('R1 holds', () => {});\n";
const failing = "import { test } from 'node:test';\nimport assert from 'node:assert';\ntest('R2 holds', () => assert.equal(1, 2));\n";

// GitHub's merge of a branch into the tranche, checked out, as the run sees it.
const USES = "import { d } from '../dates/index.mjs';\nexport const o = d + 1;\n";
function merged(files, { branch = 'job/orders/1', base = productFiles() } = {}) {
  const root = makeRepo(base);
  const baseSha = git(['rev-parse', 'HEAD'], { cwd: root });
  git(['checkout', '-q', '-b', branch], { cwd: root });
  commit(root, files);
  git(['checkout', '-q', '--detach', baseSha], { cwd: root });
  git(['merge', '-q', '--no-ff', '--no-edit', branch], { cwd: root });
  return { root, base: baseSha };
}

test('step 1: a pull request into the main branch, or a draft, runs nothing', () => {
  const { root, base } = merged({ 'src/orders/index.mjs': 'x' });
  assert.equal(decideScope(root, { base, baseRef: 'main', branch: 'work/tranche-end', draft: false }).scope, 'nothing');
  assert.equal(decideScope(root, { base, baseRef: 'tranche', branch: 'job/orders/1', draft: true }).scope, 'nothing');
});

test('step 2: no changed file under a module\'s code or tests runs nothing', () => {
  const { root, base } = merged({ 'process/modules/orders.md': '- **R1** [met] one\n', 'README.md': 'y' }, { branch: 'work/reqs' });
  const s = decideScope(root, { base, baseRef: 'tranche', branch: 'work/reqs', draft: false });
  assert.equal(s.scope, 'nothing');
  assert.match(s.why, /no changed file/);
});

test('step 4: a job branch runs its whole module only, without its walk steps', () => {
  const { root, base } = merged({
    'src/orders/index.mjs': 'x', 'src/dates/index.mjs': 'y',
    'test/orders/a.test.mjs': passing, 'test/orders/helper.mjs': '',
    'test/orders/walk/internal/checkout.test.mjs': passing, 'test/dates/d.test.mjs': passing,
  });
  const s = decideScope(root, { base, baseRef: 'tranche', branch: 'job/orders/1', draft: false });
  assert.equal(s.scope, 'whole module');
  assert.deepEqual(s.modules, [{ name: 'orders', files: ['test/orders/a.test.mjs'] }]);
  assert.equal(s.config_from, 'the base');
});

test('another branch that changes module code runs each module it touches', () => {
  const { root, base } = merged({ 'src/orders/index.mjs': 'x', 'src/dates/index.mjs': 'y', 'test/dates/d.test.mjs': passing }, { branch: 'work/word-table' });
  const s = decideScope(root, { base, baseRef: 'tranche', branch: 'work/word-table', draft: false });
  assert.deepEqual(s.modules, [{ name: 'dates', files: ['test/dates/d.test.mjs'] }, { name: 'orders', files: [] }]);
});

test('a mechanical edit runs none when the trial config asks for it', () => {
  const base = { ...productFiles(), 'process.json': config({ trial: { mechanical_edit_tests: 'none' } }) };
  const { root, base: sha } = merged({ 'src/orders/index.mjs': 'x', 'src/dates/index.mjs': 'y' }, { branch: 'work/word-table', base });
  const s = decideScope(root, { base: sha, baseRef: 'tranche', branch: 'work/word-table', draft: false });
  assert.equal(s.scope, 'nothing');
  assert.match(s.why, /mechanical edit[\s\S]*no test run/);
});

test('a base with no process config is judged by the head\'s, and says so', () => {
  const { root, base } = merged({ ...productFiles(), 'test/orders/a.test.mjs': passing }, { branch: 'work/first-content', base: { 'README.md': 'x' } });
  const s = decideScope(root, { base, baseRef: 'tranche', branch: 'work/first-content', draft: false });
  assert.match(s.config_from, /the head/);
  const none = merged({ 'README.md': 'y' }, { branch: 'work/x', base: { 'README.md': 'x' } });
  assert.equal(decideScope(none.root, { base: none.base, baseRef: 'tranche', branch: 'work/x', draft: false }).scope, 'nothing');
});

test('the module tests pass when every command exits 0, fail otherwise, and count what ran', () => {
  const { root, base } = merged({ 'src/orders/index.mjs': USES, 'test/orders/a.test.mjs': passing });
  const s = decideScope(root, { base, baseRef: 'tranche', branch: 'job/orders/1', draft: false });
  const [r] = runModules(root, s);
  assert.equal(r.ok, true);
  assert.deepEqual([r.name, r.code, r.files.length, r.tests, r.passed, r.failed], ['orders', 0, 1, 1, 1, 0]);
  commit(root, { 'test/orders/b.test.mjs': failing });
  const s2 = decideScope(root, { base, baseRef: 'tranche', branch: 'job/orders/1', draft: false });
  assert.equal(runModules(root, s2).every((x) => x.ok), false);
});

test('a module with no test files passes, and none ran', () => {
  const { root, base } = merged({ 'src/orders/index.mjs': USES });
  const [r] = runModules(root, decideScope(root, { base, baseRef: 'tranche', branch: 'job/orders/1', draft: false }));
  assert.equal(r.ok, true);
  assert.equal(r.code, null);
});

test('product code runs without the token variables', () => {
  const { root, base } = merged({
    'src/orders/index.mjs': USES,
    'test/orders/t.test.mjs': "import { test } from 'node:test';\nimport assert from 'node:assert';\ntest('R1 no token', () => assert.equal(process.env.GH_TOKEN, undefined));\n",
  });
  process.env.GH_TOKEN = 'secret-for-test';
  try {
    assert.equal(runModules(root, decideScope(root, { base, baseRef: 'tranche', branch: 'job/orders/1', draft: false })).every((x) => x.ok), true);
  } finally { delete process.env.GH_TOKEN; }
});

test('the module tests run the tool\'s check before a module\'s tests, and a disagreement fails them', () => {
  // orders imports dates without declaring it: the check refuses that. (A declared use no code makes is "cannot
  // tell", so it does not serve as the disagreement here.)
  const { root, base } = merged({
    'process/modules/orders.json': { name: 'orders', files: ['src/orders/'], tests: ['test/orders/'], uses: [] },
    'src/dates/index.mjs': 'export const d = 1;\n',
    'src/orders/index.mjs': "import { d } from '../dates/index.mjs';\nexport const o = d;\n", 'test/orders/a.test.mjs': passing });
  const s = decideScope(root, { base, baseRef: 'tranche', branch: 'job/orders/1', draft: false });
  const [r] = runModules(root, s);
  assert.notEqual(r.check.code, 0);
  assert.equal(r.code, 0);
  assert.equal(r.ok, false);
});

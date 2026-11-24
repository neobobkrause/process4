// A dropped tranche: the drop command, and the required run's rule for its pull request.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { drop, push } from '../lib/commands.mjs';
import { decideScope } from '../lib/scope.mjs';
import { git } from '../lib/util.mjs';
import { commit, config, ctxFor, fakeGitHub, makeRepo, productFiles } from './helpers.mjs';

const show = (root, ref, path) => {
  const r = git(['show', `${ref}:${path}`], { cwd: root, allowFail: true });
  return r.code === 0 ? r.stdout : null;
};
const remote = (root, b) => git(['ls-remote', '--heads', 'origin', `refs/heads/${b}`], { cwd: root }).split(/\s/)[0];

// main as productFiles with a UX lane; the tranche branch with module code changed, added and
// deleted, a new module, and the files a drop keeps changed too.
const MAIN = () => ({ ...productFiles(), 'process.json': config({ lanes: [{ name: 'ux', folder: 'lanes/ux/' }] }), 'test/orders/o.test.mjs': 'main test\n' });
function product({ tranche = true } = {}) {
  const root = makeRepo(MAIN());
  if (!tranche) return root;
  git(['checkout', '-q', '-b', 'tranche'], { cwd: root });
  commit(root, {
    'src/orders/index.mjs': 'export const o = 2;\n',
    'src/orders/extra.mjs': 'export const e = 1;\n',
    'test/orders/a.test.mjs': 'tranche test\n',
    'process/modules/order.txt': 'dates\norders\npricing\n',
    'process/modules/pricing.json': { name: 'pricing', files: ['src/pricing/'], tests: ['test/pricing/'], uses: [] },
    'process/modules/pricing.md': '- **R1** [not yet met] price\n',
    'src/pricing/p.mjs': 'export const p = 1;\n',
    'process/modules/orders.md': '- **R1** [met] one\n- **R2** [met] two\n- **R3** [not yet met] three\n',
    'process.json': config({ lanes: [{ name: 'ux', folder: 'lanes/ux/' }], slots: { default: 4, share: 4 } }),
    'process/decisions-arch.md': 'Decision: whole pence.\n',
    'lanes/ux/notes.md': 'screens\n',
    'README.md': 'tranche readme\n',
  }, 'tranche work');
  git(['rm', '-q', 'src/dates/index.mjs', 'test/orders/o.test.mjs'], { cwd: root });
  git(['commit', '-q', '-m', 'tranche deletes'], { cwd: root });
  git(['push', '-q', 'origin', 'tranche'], { cwd: root });
  git(['checkout', '-q', 'main'], { cwd: root });
  return root;
}

test('drop restores module code and tests to main\'s, deletes what main lacks, and keeps the rest', () => {
  const root = product();
  const gh = fakeGitHub();
  const { ctx, out } = ctxFor(root, gh);
  const before = git(['rev-parse', 'HEAD'], { cwd: root });
  assert.equal(drop(ctx, { _: [], tranche: 't1' }), 0);
  const tip = remote(root, 'drop/t1');
  const tranche = remote(root, 'tranche');
  git(['fetch', '-q', 'origin', 'drop/t1'], { cwd: root });
  assert.equal(git(['rev-parse', `${tip}^`], { cwd: root }), tranche);
  const changed = git(['diff', '--no-renames', '--name-only', tranche, tip], { cwd: root }).split('\n').sort();
  assert.deepEqual(changed, ['src/dates/index.mjs', 'src/orders/extra.mjs', 'src/orders/index.mjs', 'src/pricing/p.mjs', 'test/orders/a.test.mjs', 'test/orders/o.test.mjs']);
  // Changed module files and files the tranche deleted are main's again; files main lacks are gone.
  for (const f of ['src/orders/index.mjs', 'src/dates/index.mjs', 'test/orders/o.test.mjs']) assert.equal(show(root, tip, f), show(root, 'main', f), f);
  for (const f of ['src/orders/extra.mjs', 'test/orders/a.test.mjs', 'src/pricing/p.mjs']) assert.equal(show(root, tip, f), null, f);
  // Requirements, the module list, process.json, the decision records, a lane's folder and other files stay the tranche's.
  for (const f of ['process/modules/orders.md', 'process/modules/pricing.md', 'process/modules/order.txt', 'process/modules/pricing.json',
    'process.json', 'process/decisions-arch.md', 'lanes/ux/notes.md', 'README.md']) assert.equal(show(root, tip, f), show(root, tranche, f), f);
  assert.equal(git(['log', '-1', '--format=%an <%ae>|%s', tip], { cwd: root }), "Claude <noreply@anthropic.com>|Drop tranche t1: module code and tests back to main's");
  const pr = gh.s.prs[0];
  assert.deepEqual([pr.head.ref, pr.base.ref, pr.title, pr.draft], ['drop/t1', 'tranche', 'Drop tranche t1', true]);
  assert.match(out.join('\n'), /pull request 1: [\s\S]*3 file\(s\) restored to main's, 3 deleted/);
  // The session's checkout did not move.
  assert.equal(git(['rev-parse', 'HEAD'], { cwd: root }), before);
  assert.equal(git(['branch', '--show-current'], { cwd: root }), 'main');
  // Its pull request, merged by GitHub into the tranche, passes the required run at once.
  git(['checkout', '-q', '--detach', tranche], { cwd: root });
  git(['merge', '-q', '--no-ff', '--no-edit', tip], { cwd: root });
  const s = decideScope(root, { base: tranche, baseRef: 'tranche', branch: 'drop/t1', draft: false });
  assert.equal(s.scope, 'nothing');
  assert.match(s.why, /^drop of tranche t1: every one of the 6 changed file\(s\) is main's/);
});

test('drop refuses an existing drop branch, nothing to restore, a missing tranche branch, and no name', () => {
  const root = product();
  const gh = fakeGitHub();
  const { ctx } = ctxFor(root, gh);
  drop(ctx, { _: [], tranche: 't1' });
  assert.throws(() => drop(ctx, { _: [], tranche: 't1' }), /drop\/t1 exists already on origin/);
  assert.equal(gh.s.prs.length, 1);
  assert.throws(() => drop(ctx, { _: [] }), /say --tranche <name>/);
  assert.throws(() => drop(ctx, { _: [], tranche: 'a b' }), /say --tranche <name>/);

  const none = product({ tranche: false });
  assert.throws(() => drop(ctxFor(none, fakeGitHub()).ctx, { _: [], tranche: 't1' }), /the tranche branch tranche that process\.json names is not on origin/);
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: none });
  assert.throws(() => drop(ctxFor(none, fakeGitHub()).ctx, { _: [], tranche: 't1' }), /nothing to restore/);
  assert.equal(remote(none, 'drop/t1'), '');
});

test('push accepts a drop/ branch', () => {
  const root = product();
  const { ctx } = ctxFor(root, fakeGitHub());
  git(['checkout', '-q', '-b', 'drop/t2'], { cwd: root });
  const sha = commit(root, { 'src/orders/index.mjs': 'export const o = 3;\n' });
  assert.equal(push(ctx, { _: [] }), 0);
  assert.equal(remote(root, 'drop/t2'), sha);
});

// GitHub's merge of drop/<t> into the tranche, checked out; `files` are the drop's changes.
function mergedDrop(files, del = []) {
  const root = product();
  git(['checkout', '-q', 'tranche'], { cwd: root });
  const base = git(['rev-parse', 'HEAD'], { cwd: root });
  git(['checkout', '-q', '-b', 'drop/t1'], { cwd: root });
  if (del.length) git(['rm', '-q', ...del], { cwd: root });
  commit(root, files, 'drop');
  git(['checkout', '-q', '--detach', base], { cwd: root });
  git(['merge', '-q', '--no-ff', '--no-edit', 'drop/t1'], { cwd: root });
  return { root, base };
}
const opts = (base, over = {}) => ({ base, baseRef: 'tranche', branch: 'drop/t1', draft: false, mainRef: 'main', ...over });

test('a drop\'s pull request passes at once when every changed file is main\'s, by default against origin/main', () => {
  const m = MAIN();
  const { root, base } = mergedDrop({ 'src/orders/index.mjs': m['src/orders/index.mjs'], 'src/dates/index.mjs': m['src/dates/index.mjs'] }, ['src/orders/extra.mjs']);
  const s = decideScope(root, opts(base));
  assert.equal(s.scope, 'nothing');
  assert.equal(s.why, "drop of tranche t1: every one of the 3 changed file(s) is main's; none of the tests runs, as on the tranche's pull request into main");
  assert.equal(decideScope(root, opts(base, { mainRef: undefined })).scope, 'nothing');
});

test('a drop\'s pull request with one file not main\'s, by one byte, is judged as any other branch', () => {
  const m = MAIN();
  const { root, base } = mergedDrop({ 'src/orders/index.mjs': `${m['src/orders/index.mjs']} `, 'src/dates/index.mjs': m['src/dates/index.mjs'] });
  const s = decideScope(root, opts(base));
  assert.equal(s.scope, 'whole module');
  assert.match(s.why, /^drop of tranche t1, but src\/orders\/index\.mjs is not main's, so it is judged as any other branch: branch drop\/t1 is not a job's/);
  assert.deepEqual(s.modules.map((x) => x.name).sort(), ['dates', 'orders']);
  // A file the drop adds that main lacks is not main's either.
  const added = mergedDrop({ 'src/orders/new.mjs': 'x\n' });
  assert.match(decideScope(added.root, opts(added.base)).why, /src\/orders\/new\.mjs is not main's/);
});

test('a drop\'s pull request never passes at once when main cannot be read', () => {
  const m = MAIN();
  const { root, base } = mergedDrop({ 'src/orders/index.mjs': m['src/orders/index.mjs'] });
  const s = decideScope(root, opts(base, { mainRef: 'origin/no-such-main' }));
  assert.equal(s.scope, 'whole module');
  assert.match(s.why, /^drop of tranche t1, but main \(origin\/no-such-main\) cannot be read/);
});

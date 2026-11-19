import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { HELP, main } from '../p4.mjs';
import { requiredCheck } from '../lib/config.mjs';
import { git } from '../lib/util.mjs';
import { fakeGitHub, makeRepo, productFiles, write } from './helpers.mjs';

// Any reach to GitHub, git's checkout or the clock fails the test: --help must only print.
const untouchable = new Proxy({}, { get: (_, k) => () => { throw new Error(`--help reached ${String(k)}`); } });

test('every command\'s --help only prints its help, and acts on nothing', () => {
  for (const name of Object.keys(HELP)) {
    for (const flag of ['--help', '-h']) {
      const out = [];
      const code = main([...name.split(' '), 'x', flag], { root: '/nonexistent', slug: 'o/p', gh: untouchable, wait: untouchable.wait, log: (l) => out.push(l) });
      assert.equal(code, 0, name);
      assert.deepEqual(out, [HELP[name]], name);
    }
  }
  const out = [];
  assert.equal(main(['--help'], { log: (l) => out.push(l) }), 0);
  assert.equal(out.length, Object.keys(HELP).length);
});

test('the required run\'s second part does not run when the run was cancelled', () => {
  const wf = readFileSync(new URL('../../shims/module-tests.yml', import.meta.url), 'utf8');
  assert.match(wf, /module-tests:\n\s+needs: scope\n(\s+#.*\n)*\s+if: \$\{\{ !cancelled\(\) \}\}/);
});

// Fault A: the required check's name is tool-tests on the process repo (which holds the tool),
// module-tests on a product (which does not).
test('the required check is tool-tests on the process repo, module-tests on a product', () => {
  const root = makeRepo();
  assert.equal(requiredCheck(root), 'module-tests');
  write(root, { 'tool/p4.mjs': '// tool\n' });
  assert.equal(requiredCheck(root), 'tool-tests');
});

// Fault C: ready/results/close with no number use the current branch's one open pull request.
test('ready with no number uses the current branch\'s open pull request', () => {
  const root = makeRepo(productFiles());
  git(['checkout', '-q', '-b', 'job/dates/1'], { cwd: root });
  const gh = fakeGitHub();
  const pr = gh.createPR('o/product', { head: 'job/dates/1', base: 'tranche', draft: true, title: 'x' });
  const out = [];
  const code = main(['ready'], { root, slug: 'o/product', gh, log: (l) => out.push(String(l)), wait: () => {} });
  assert.equal(code, 0);
  assert.equal(gh.getPR('o/product', pr.number).draft, false);
  assert.match(out.join('\n'), new RegExp(`pull request ${pr.number} is open and ready`));
});

test('close --nothing-to-change with no number uses the current branch\'s pull request', () => {
  const root = makeRepo(productFiles());
  git(['checkout', '-q', '-b', 'job/orders/1'], { cwd: root });
  const gh = fakeGitHub();
  const pr = gh.createPR('o/product', { head: 'job/orders/1', base: 'tranche', draft: true, title: 'x' });
  const code = main(['close', '--nothing-to-change', 'nothing here'], { root, slug: 'o/product', gh, log: () => {}, wait: () => {} });
  assert.equal(code, 0);
  assert.equal(gh.getPR('o/product', pr.number).state, 'closed');
});

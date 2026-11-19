import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { HELP, main } from '../p4.mjs';

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

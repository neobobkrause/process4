// The required run's two parts (build text 1, section 5): `run scope` on part one, which holds
// the read-only token and runs no product code; `run tests` on part two, which holds none.
import { appendFileSync } from 'node:fs';
import { loadConfig, loadModules, ownerOf } from './config.mjs';
import { NO_TOKENS, git, run, underPath } from './util.mjs';

const WALK = /(^|\/)walk\/(internal|external)\//;
const isTestFile = (f) => /\.test\.[^/]*$/.test(f) && !WALK.test(f);

// A module's test files in the checkout: under its tests paths, named `*.test.*`, never in its
// walk folders (build text 2, section 3). Each belongs to this module by the longest match.
export function testFiles(all, modules, m) {
  return all.filter((f) => m.tests.some((p) => underPath(f, p)) && isTestFile(f) && ownerOf(modules, f) === m);
}

// Decides the scope. `root` is GitHub's merge of the pull request into its base, checked out.
// Returns { scope, why, config_from, modules: [{ name, files }] }.
export function decideScope(root, { base, baseRef, branch, draft }) {
  const parents = git(['rev-list', '--parents', '-n', '1', 'HEAD'], { cwd: root }).split(' ').slice(1);
  const mergedBase = parents.length === 2 ? parents[0] : base;
  let cfg = loadConfig(root, mergedBase);
  let from = 'the base';
  if (!cfg) { cfg = loadConfig(root, 'HEAD'); from = cfg ? "the head (the base has none)" : 'nowhere (none in base or head)'; }
  const out = (scope, why, modules = []) => ({ scope, why, config_from: from, modules });

  if (baseRef === 'main') return out('nothing', 'the pull request is into the main branch');
  if (draft) return out('nothing', 'the pull request is a draft');
  if (!cfg) return out('nothing', 'no process config, so no module');

  const modules = loadModules(root, cfg, 'HEAD');
  const changed = git(['diff', '--name-only', '-z', mergedBase, 'HEAD'], { cwd: root }).split('\0').filter(Boolean);
  const touched = [...new Set(changed.map((f) => ownerOf(modules, f)).filter(Boolean))];
  if (!touched.length) return out('nothing', "no changed file is under a module's code or tests");

  const all = git(['ls-files', '-z'], { cwd: root }).split('\0').filter(Boolean);
  const whole = (ms) => ms.map((m) => ({ name: m.name, files: testFiles(all, modules, m) }));
  const job = branch?.match(/^job\/([a-z0-9-]+)\/\d+$/)?.[1];
  if (job) {
    const m = modules.find((x) => x.name === job);
    if (!m) return out('whole module', `job branch for ${job}, which the module list does not name: every module touched`, whole(touched));
    // The related scope (step 3) is built at stage 4; until then a told job's run is its whole
    // module, the widest step of the related scope.
    return out('whole module', `job branch for ${job}`, whole([m]));
  }
  return out('whole module', `branch ${branch} is not a job's: each module touched`, whole(touched));
}

// Runs each module's test command over its files, with the token variables removed.
export function runTests(root, scope, { log = console.log, summary = process.env.GITHUB_STEP_SUMMARY } = {}) {
  const lines = [`## module-tests`, '', `Scope: **${scope.scope}**, because ${scope.why}. Config read from ${scope.config_from}.`, ''];
  let ok = true;
  if (scope.scope !== 'nothing') {
    const cfg = loadConfig(root, 'HEAD');
    const [cmd, ...args] = cfg.test_command.split(/\s+/).filter(Boolean);
    for (const m of scope.modules) {
      if (!m.files.length) { lines.push(`- ${m.name}: no test files; none ran`); continue; }
      log(`== ${m.name}: ${cmd} ${[...args, ...m.files].join(' ')}`);
      const r = run(cmd, [...args, ...m.files], { cwd: root, unset: [...NO_TOKENS, 'NODE_TEST_CONTEXT'] });
      log(r.stdout + r.stderr);
      const count = (k) => (r.stdout + r.stderr).match(new RegExp(`^(?:ℹ|#) ${k} (\\d+)`, 'm'))?.[1] ?? '?';
      lines.push(`- ${m.name}: exit ${r.code}; ${m.files.length} file(s): ${m.files.join(', ')}; tests ${count('tests')}, pass ${count('pass')}, fail ${count('fail')}`);
      if (r.code !== 0) ok = false;
    }
  }
  lines.push('', ok ? 'Passed.' : 'Failed.');
  if (summary) appendFileSync(summary, lines.join('\n') + '\n');
  log(lines.join('\n'));
  return ok;
}

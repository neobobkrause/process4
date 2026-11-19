// The required run's two parts (build text 1, section 5): `run scope` on part one, which holds
// the read-only token and runs no product code; `run tests` on part two, which holds none.
import { appendFileSync } from 'node:fs';
import { loadConfig, loadModules, ownerOf } from './config.mjs';
import { relatedList } from './notice/related.mjs';
import { NO_TOKENS, git, run, underPath } from './util.mjs';

const WALK = /(^|\/)walk\/(internal|external)\//;
const isTestFile = (f) => /\.test\.[^/]*$/.test(f) && !WALK.test(f);

// A module's test files in the checkout: under its tests paths, named `*.test.*`, never in its
// walk folders (build text 2, section 3). Each belongs to this module by the longest match.
export function testFiles(all, modules, m) {
  return all.filter((f) => m.tests.some((p) => underPath(f, p)) && isTestFile(f) && ownerOf(modules, f) === m);
}

// Decides the scope. `root` is GitHub's merge of the pull request into its base, checked out.
// `jobBlock` is the job block of the pull request (its `<!-- process4-job -->` comment), or null.
// Returns { scope, why, config_from, modules: [{ name, files, related?, left_out? }] }.
export function decideScope(root, { base, baseRef, branch, draft, jobBlock = null }) {
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
    if (jobBlock?.kind === 'told') {
      // Step 3: the related list, made with the reader on the merged result (build text 5, section 7).
      let r;
      try {
        r = relatedList({ dir: root, gitRoot: root, base: mergedBase, after: 'HEAD', module: job, uses: jobBlock.uses || [] });
      } catch (e) {
        return out('whole module', `told job of ${job}, but the reader could not make the related list (${e.message}): the whole module, the widest step`, whole([m]));
      }
      if (!r.files.length) return { ...out('nothing', `told job of ${job}, and its related list is empty: it passes at once`), left_out: r.leftOut };
      return out('related', `told job of ${job}: ${r.files.length} related test file(s), ${r.leftOut.length} left out`,
        [{ name: job, files: r.files.map((f) => f.file), related: r.files, left_out: r.leftOut }]);
    }
    const kind = jobBlock ? `its job block says ${jobBlock.kind || 'no kind'}` : 'no job block was read';
    return out('whole module', `job branch for ${job}; ${kind}`, whole([m]));
  }
  // Step 5, the mechanical edit (a non-job branch that changes module code). One trial-only config
  // line asks the required run to run none, so trial item 9's "none run" form can be tried
  // (build text 1, section 5, step 5; build text 2, section 7).
  if (cfg.trial?.mechanical_edit_tests === 'none') {
    return out('nothing', `mechanical edit on branch ${branch}, and the trial config asks for no test run`);
  }
  return out('whole module', `branch ${branch} is not a job's: each module touched`, whole(touched));
}

// Runs each module's test command over its files, with the token variables removed.
// Before each module's tests, the tool's `check` of that module (build text 1, section 5, part
// two), run from this same copy of the tool with the token variables removed.
const P4 = new URL('../p4.mjs', import.meta.url).pathname;
const runCheck = (root, name) => run(process.execPath, [P4, 'check', name], { cwd: root, unset: [...NO_TOKENS, 'NODE_TEST_CONTEXT'] });

export function runTests(root, scope, { log = console.log, summary = process.env.GITHUB_STEP_SUMMARY, check = runCheck } = {}) {
  const lines = [`## module-tests`, '', `Scope: **${scope.scope}**, because ${scope.why}. Config read from ${scope.config_from}.`, ''];
  let ok = true;
  if (scope.scope !== 'nothing') {
    const cfg = loadConfig(root, 'HEAD');
    const [cmd, ...args] = cfg.test_command.split(/\s+/).filter(Boolean);
    for (const m of scope.modules) {
      const c = check(root, m.name);
      log(c.stdout + c.stderr);
      if (c.code !== 0) { ok = false; lines.push(`- ${m.name}: check found a disagreement (exit ${c.code})`); }
      for (const r of m.related || []) lines.push(`  - related: ${r.file}: ${r.reasons.join('; ')}`);
      if (m.left_out) lines.push(`  - left out: ${m.left_out.length ? m.left_out.join(', ') : 'none'}`);
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

// The scope of a pull request's tests, and the tests themselves (build text 1, section 5). The tests run once, in
// the session that owns the work (`p4 test`, tool/lib/testrun.mjs); GitHub's required run only reads the record
// (`run verdict`). `run scope` and `run tests` stay for reading a scope and for running it by hand.
import { appendFileSync } from 'node:fs';
import { loadConfig, loadModules, ownerOf } from './config.mjs';
import { relatedList } from './notice/related.mjs';
import { NO_TOKENS, git, run, underPath } from './util.mjs';
import { JOB } from './round.mjs';

const WALK = /(^|\/)walk\/(internal|external)\//;
const isTestFile = (f) => /\.test\.[^/]*$/.test(f) && !WALK.test(f);

// A module's test files in the checkout: under its tests paths, named `*.test.*`, never in its
// walk folders (build text 2, section 3). Each belongs to this module by the longest match.
export function testFiles(all, modules, m) {
  return all.filter((f) => m.tests.some((p) => underPath(f, p)) && isTestFile(f) && ownerOf(modules, f) === m);
}

// A drop's branch: drop/<tranche>, made by `p4 drop`.
export const DROP = /^drop\/([A-Za-z0-9._-]+)$/;

// Decides the scope. `root` is GitHub's merge of the pull request into its base, checked out.
// `jobBlock` is the job block of the pull request (its `<!-- process4-job -->` comment), or null.
// `mainRef` is the main branch as the checkout holds it (fetch-depth 0 brings origin/main), read
// only for a drop's pull request (branch drop/<tranche>).
// `related: false` makes no related list: a told job is judged as needing its test record, as the required run's
// verdict judges it (it runs no reader on GitHub's machines).
// Returns { scope, why, config_from, modules: [{ name, files, related?, left_out? }] }.
export function decideScope(root, { base, baseRef, branch, draft, jobBlock = null, mainRef = 'origin/main', related = true }) {
  const parents = git(['rev-list', '--parents', '-n', '1', 'HEAD'], { cwd: root }).split(' ').slice(1);
  const mergedBase = parents.length === 2 ? parents[0] : base;
  let cfg = loadConfig(root, mergedBase);
  let from = 'the base';
  if (!cfg) { cfg = loadConfig(root, 'HEAD'); from = cfg ? "the head (the base has none)" : 'nowhere (none in base or head)'; }
  let note = '';
  const out = (scope, why, modules = []) => ({ scope, why: note + why, config_from: from, modules });

  if (baseRef === 'main') return out('nothing', 'the pull request is into the main branch');
  if (draft) return out('nothing', 'the pull request is a draft');
  if (!cfg) return out('nothing', 'no process config, so no module');

  const modules = loadModules(root, cfg, 'HEAD');
  const changed = git(['diff', '--name-only', '-z', mergedBase, 'HEAD'], { cwd: root }).split('\0').filter(Boolean);
  const drop = branch?.match(DROP)?.[1];
  if (drop) {
    const d = dropCheck(root, mergedBase, mainRef);
    if (d.ok) return out('nothing', `drop of tranche ${drop}: every one of the ${d.count} changed file(s) is main's; none of the tests runs, as on the tranche's pull request into main`);
    note = `drop of tranche ${drop}, but ${d.why}, so it is judged as any other branch: `;
  }
  const touched = [...new Set(changed.map((f) => ownerOf(modules, f)).filter(Boolean))];
  if (!touched.length) return out('nothing', "no changed file is under a module's code or tests");

  const all = git(['ls-files', '-z'], { cwd: root }).split('\0').filter(Boolean);
  const whole = (ms) => ms.map((m) => ({ name: m.name, files: testFiles(all, modules, m) }));
  const job = branch?.match(JOB)?.[1];
  if (job) {
    const m = modules.find((x) => x.name === job);
    if (!m) return out('whole module', `job branch for ${job}, which the module list does not name: every module touched`, whole(touched));
    if (jobBlock?.kind === 'told' && !related) {
      return out('whole module', `told job of ${job}: its related tests run in its own session (p4 test), so it needs its test record`, whole([m]));
    }
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

// A drop's pull request passes at once only when every file it changes is main's: the same blob,
// or absent on both. Renames are not followed, so a file a rename removed is judged by its own
// name. Where main cannot be read, never at once.
function dropCheck(root, mergedBase, mainRef) {
  const known = git(['rev-parse', '--verify', '-q', `${mainRef}^{commit}`], { cwd: root, allowFail: true });
  if (known.code !== 0) return { ok: false, why: `main (${mainRef}) cannot be read` };
  const names = (a, b) => git(['diff', '--no-renames', '--name-only', '-z', a, b], { cwd: root }).split('\0').filter(Boolean);
  const changed = names(mergedBase, 'HEAD');
  const notMain = new Set(names(mainRef, 'HEAD'));
  const first = changed.find((f) => notMain.has(f));
  return first ? { ok: false, why: `${first} is not main's` } : { ok: true, count: changed.length };
}

// Runs each module's check and test command over its files, with the token variables removed. One code path for
// `p4 test` in the session and `run tests`. Before each module's tests, the tool's `check` of that module (build
// text 1, section 5), run from this same copy of the tool. `onStart`/`onEnd` report each module as it goes.
// Returns [{ name, files, check: { code, out }, code, out, passed, failed, ok }]; `code` is null where no test file ran.
const P4 = new URL('../p4.mjs', import.meta.url).pathname;
const runCheck = (root, name) => run(process.execPath, [P4, 'check', name], { cwd: root, unset: [...NO_TOKENS, 'NODE_TEST_CONTEXT'] });
const countOf = (text, k) => { const m = text.match(new RegExp(`^(?:ℹ|#) ${k} (\\d+)`, 'm')); return m ? Number(m[1]) : null; };

export function runModules(root, scope, { check = runCheck, onStart = () => {}, onEnd = () => {} } = {}) {
  if (scope.scope === 'nothing') return [];
  const cfg = loadConfig(root, 'HEAD');
  const [cmd, ...args] = cfg.test_command.split(/\s+/).filter(Boolean);
  const results = [];
  for (const m of scope.modules) {
    onStart(m, `${cmd} ${[...args, ...m.files].join(' ')}`);
    const c = check(root, m.name);
    const res = { name: m.name, files: m.files, check: { code: c.code, out: c.stdout + c.stderr }, code: null, out: '', passed: 0, failed: 0, tests: 0 };
    if (m.files.length) {
      const r = run(cmd, [...args, ...m.files], { cwd: root, unset: [...NO_TOKENS, 'NODE_TEST_CONTEXT'] });
      res.code = r.code;
      res.out = r.stdout + r.stderr;
      res.tests = countOf(res.out, 'tests');
      res.passed = countOf(res.out, 'pass');
      res.failed = countOf(res.out, 'fail');
    }
    res.ok = c.code === 0 && (res.code === null || res.code === 0);
    results.push(res);
    onEnd(res);
  }
  return results;
}

export function runTests(root, scope, { log = console.log, summary = process.env.GITHUB_STEP_SUMMARY, check = runCheck } = {}) {
  const lines = [`## module-tests`, '', `Scope: **${scope.scope}**, because ${scope.why}. Config read from ${scope.config_from}.`, ''];
  const byName = new Map(scope.modules.map((m) => [m.name, m]));
  const results = runModules(root, scope, {
    check,
    onStart: (m, line) => { if (m.files.length) log(`== ${m.name}: ${line}`); },
    onEnd: (r) => { log(r.check.out); if (r.code !== null) log(r.out); },
  });
  const n = (x) => x ?? '?';
  for (const r of results) {
    const m = byName.get(r.name);
    if (r.check.code !== 0) lines.push(`- ${r.name}: check found a disagreement (exit ${r.check.code})`);
    for (const x of m.related || []) lines.push(`  - related: ${x.file}: ${x.reasons.join('; ')}`);
    if (m.left_out) lines.push(`  - left out: ${m.left_out.length ? m.left_out.join(', ') : 'none'}`);
    if (r.code === null) { lines.push(`- ${r.name}: no test files; none ran`); continue; }
    lines.push(`- ${r.name}: exit ${r.code}; ${r.files.length} file(s): ${r.files.join(', ')}; tests ${n(r.tests)}, pass ${n(r.passed)}, fail ${n(r.failed)}`);
  }
  const ok = results.every((r) => r.ok);
  lines.push('', ok ? 'Passed.' : 'Failed.');
  if (summary) appendFileSync(summary, lines.join('\n') + '\n');
  log(lines.join('\n'));
  return ok;
}

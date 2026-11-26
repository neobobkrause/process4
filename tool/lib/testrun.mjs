// Tests once, in the job (design part 2, section 6; build text 1, section 5; build text 5, section 5). `p4 test` runs a pull
// request's tests in the session that owns the work and writes the test record; `ready` marks ready only where the
// record stands, or where nothing needs one; GitHub's required run (`run verdict`) runs no test and only reads the
// record. The scope is decided as the required run decided it before: on GitHub's merge of the pull request's head
// into its base's newest commit.
import { appendFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadConfig, requiredCheck } from './config.mjs';
import { isUsesPath, usesPath } from './usesfile.mjs';
import { block } from './github.mjs';
import { JOB, jobBlockOf, jobRecordOf } from './round.mjs';
import { pushPace } from './commands.mjs';
import { writeUsesFiles } from './usescmd.mjs';
import { DROP, decideScope, runModules } from './scope.mjs';
import { TEST_MARK, noticeSeq, recordNeed, recordStands, testRecordOf } from './testrecord.mjs';
import { fail, git } from './util.mjs';

const short = (sha) => String(sha).slice(0, 10);
const utc = (ms) => new Date(ms).toISOString().replace(/:\d\d(\.\d+)?Z$/, 'Z');

/**
 * Whether two commits differ only in a module's uses file (design part 2, section 6: a test record stands for a later
 * head that differs from its commit only there): the job's module, named by its branch; for a pull request that is not
 * a job's, only in uses files. False where either commit cannot be read here.
 */
export function usesOnly(root, branch) {
  const module = branch?.match(JOB)?.[1] ?? null;
  return (from, to) => {
    if (!/^[0-9a-f]{40}$/.test(from || '') || !/^[0-9a-f]{40}$/.test(to || '')) return false;
    const d = git(['diff', '--name-only', '--no-renames', from, to], { cwd: root, allowFail: true });
    if (d.code !== 0) return false;
    const files = d.stdout.split('\n').filter(Boolean);
    const cfg = loadConfig(root, to) ?? loadConfig(root);
    if (!cfg || !files.length) return false;
    return files.every((f) => (module ? f === usesPath(cfg, module) : isUsesPath(cfg, f)));
  };
}

/** A pull request's job block (ARCH's), the job's record (the job's) and its test record, from one read of its comments. */
export function recordsOf(ctx, n) {
  const comments = ctx.gh.comments(ctx.slug, n);
  return { jobBlock: jobBlockOf(comments)?.data || null, jobRecord: jobRecordOf(comments)?.data || null, record: testRecordOf(comments) };
}

/**
 * The scope of a pull request, as the required run decides it: GitHub's merge of its head into its base's newest
 * commit, made with git merge-tree and checked out into a temporary worktree that is removed after. Draft-ness does
 * not count. A pull request into main runs nothing without any merge (the process repository's own case).
 * `related: false` judges a told job as needing its record, as the verdict does.
 */
export function scopeForPR(ctx, pr, { jobBlock = null, related = true } = {}) {
  const baseRef = pr.base.ref;
  const branch = pr.head.ref;
  if (baseRef === 'main') return { scope: 'nothing', why: 'the pull request is into the main branch', config_from: 'not read', modules: [] };
  const cwd = ctx.root;
  git(['fetch', '-q', 'origin', `refs/heads/${baseRef}`], { cwd });
  const baseTip = git(['rev-parse', 'FETCH_HEAD'], { cwd });
  const head = pr.head.sha;
  if (git(['cat-file', '-e', `${head}^{commit}`], { cwd, allowFail: true }).code !== 0) git(['fetch', '-q', 'origin', `refs/heads/${branch}`], { cwd });
  // A drop's pull request is judged against main as GitHub's run holds it (origin/main).
  if (DROP.test(branch)) git(['fetch', '-q', 'origin', '+refs/heads/main:refs/remotes/origin/main'], { cwd, allowFail: true });
  const m = git(['merge-tree', '--write-tree', baseTip, head], { cwd, allowFail: true });
  if (m.code !== 0) fail(`${branch} does not merge cleanly into ${baseRef}; merge ${baseRef} into the branch first`);
  const merged = git(['commit-tree', m.stdout.split('\n')[0].trim(), '-p', baseTip, '-p', head, '-m', `merged result of pull request ${pr.number}`], { cwd });
  const dir = join(mkdtempSync(join(tmpdir(), 'p4-merged-')), 'tree');
  git(['worktree', 'add', '-q', '--detach', dir, merged], { cwd });
  try {
    return { ...decideScope(dir, { base: baseTip, baseRef, branch, draft: false, jobBlock, related }), base: baseTip, merged };
  } finally {
    git(['worktree', 'remove', '--force', dir], { cwd, allowFail: true });
    rmSync(join(dir, '..'), { recursive: true, force: true });
    git(['worktree', 'prune'], { cwd, allowFail: true });
  }
}

// The test record, written once on the pull request and rewritten in place.
function writeTestRecord(ctx, n, data, words) {
  const body = block(TEST_MARK, data, words);
  const had = testRecordOf(ctx.gh.comments(ctx.slug, n));
  if (had) ctx.gh.editComment(ctx.slug, had.id, body); else ctx.gh.addComment(ctx.slug, n, body);
}

// After a pass, the newest required run on the head is run again, so that a run which started before the record
// was written reads it. A run that has passed already is left; a refusal (a run still going) is said and passed over.
function askRerun(ctx, head) {
  const required = requiredCheck(ctx.root);
  const runs = (ctx.gh.runsForHead(ctx.slug, head) || []).filter((r) => r.name === required)
    .sort((x, y) => String(y.created_at).localeCompare(String(x.created_at)) || (y.id - x.id));
  const r = runs[0];
  if (!r) { ctx.log(`no ${required} run on ${short(head)} yet; the next one reads the record`); return; }
  if (r.status === 'completed' && r.conclusion === 'success') { ctx.log(`the newest ${required} run on ${short(head)} has passed already: ${r.html_url}`); return; }
  if (ctx.gh.rerunRun(ctx.slug, r.id)) ctx.log(`asked GitHub to run ${required} again on ${short(head)}: ${r.html_url}`);
  else ctx.log(`GitHub refused to run ${required} again on ${short(head)} (${r.status}${r.conclusion ? `, ${r.conclusion}` : ''}); run results, and ask again when it ends: ${r.html_url}`);
}

const tail = (text, n = 40) => text.trimEnd().split('\n').slice(-n).join('\n');

/**
 * Before the tests run, the branch takes in its base's newest commit (design part 2, section 3): where the
 * base holds commits the head lacks, the base is merged into the checkout with a plain merge commit, never a rebase,
 * and pushed, so the tests run on code that holds what the base already holds. Where the two do not merge cleanly,
 * nothing is changed and nothing runs. A pull request into main, and a drop's, are left as they are. Returns the head.
 */
export function bringBaseIn(ctx, pr) {
  const cwd = ctx.root;
  const baseRef = pr.base.ref;
  const branch = pr.head.ref;
  if (baseRef === 'main' || DROP.test(branch)) return pr.head.sha;
  git(['fetch', '-q', 'origin', `refs/heads/${baseRef}`], { cwd });
  const baseTip = git(['rev-parse', 'FETCH_HEAD'], { cwd });
  if (git(['merge-base', '--is-ancestor', baseTip, 'HEAD'], { cwd, allowFail: true }).code === 0) return pr.head.sha;
  const who = git(['config', 'user.email'], { cwd, allowFail: true }).stdout?.trim()
    ? [] : ['-c', 'user.name=Claude', '-c', 'user.email=noreply@anthropic.com'];
  const m = git([...who, 'merge', '-q', '--no-ff', '--no-edit', '-m', `Merge ${baseRef} into ${branch} before its tests (p4 test)`, baseTip], { cwd, allowFail: true });
  if (m.code !== 0) {
    git(['merge', '--abort'], { cwd, allowFail: true });
    fail(`${branch} does not merge cleanly into ${baseRef}; merge ${baseRef} into the branch first, resolve, push, then run test`);
  }
  // pushed as push pushes it, uses file and all (build text 1b, command 27)
  writeUsesFiles(ctx, branch, { job: branch.match(JOB)?.[1] ?? null, base: baseTip });
  pushPace(ctx);
  git(['push', '-q', 'origin', `HEAD:refs/heads/${branch}`], { cwd });
  const head = git(['rev-parse', 'HEAD'], { cwd });
  ctx.log(`${branch} lacked ${baseRef}'s newest commit ${short(baseTip)}: merged it in and pushed ${short(head)}; the tests run there`);
  return head;
}

/**
 * test [<pr>]: the pull request's tests, in this session's checkout at the pull request's head commit, brought up to
 * its base's newest commit first, then the test record. Exit 1 on a fail, after the record is written.
 */
export function testCmd(ctx, n, { runner = runModules } = {}) {
  const pr = ctx.gh.getPR(ctx.slug, n) || fail(`there is no pull request ${n}`);
  const cwd = ctx.root;
  if (git(['status', '--porcelain'], { cwd })) fail('the checkout has changes not committed; commit first, push, then run test');
  const here = git(['rev-parse', 'HEAD'], { cwd });
  if (here !== pr.head.sha) fail(`the checkout is at ${short(here)}, but pull request ${n}'s head is ${short(pr.head.sha)}; push first (or check out the head), then run test`);
  const head = bringBaseIn(ctx, pr);
  const at = { ...pr, head: { ...pr.head, sha: head } };
  const { jobBlock } = recordsOf(ctx, n);
  const seq = noticeSeq(jobBlock);
  const scope = scopeForPR(ctx, at, { jobBlock });
  ctx.log(`pull request ${n}: ${pr.head.ref} at ${short(head)}${scope.base ? `, merged into ${pr.base.ref} at ${short(scope.base)}` : ` into ${pr.base.ref}`}`);
  ctx.log(`scope: ${scope.scope}, because ${scope.why}`);
  const results = runner(cwd, scope, {
    onStart: (m) => ctx.log(`${m.name}: started, check then ${m.files.length} test file(s)`),
    onEnd: (r) => ctx.log(`${r.name}: ${r.ok ? 'passed' : 'FAILED'}${r.check.code !== 0 ? ', check found a disagreement' : ''}; ${r.code === null ? 'no test files' : `${r.passed ?? '?'} passed, ${r.failed ?? '?'} failed (exit ${r.code})`}`),
  });
  const ok = results.every((r) => r.ok);
  const sum = (k) => results.reduce((t, r) => t + (Number(r[k]) || 0), 0);
  // In a failed module, a check's disagreement counts as one failure, and a test command that failed with no count as one.
  const failed = results.filter((r) => !r.ok).reduce((t, r) => t + Math.max(1, (Number(r.failed) || 0) + (r.check.code !== 0 ? 1 : 0)), 0);
  const prev = testRecordOf(ctx.gh.comments(ctx.slug, n))?.data;
  const data = {
    commit: head, notice_seq: seq, scope: scope.scope, why: scope.why,
    modules: scope.modules.map((m) => m.name), files: scope.modules.flatMap((m) => m.files), passed: sum('passed'), failed,
    result: ok ? 'pass' : 'fail', fails_total: (Number(prev?.fails_total) || 0) + (ok ? 0 : 1),
    written: utc(ctx.nowMs()),
  };
  writeTestRecord(ctx, n, data, `Written by p4 test in the session that ran the tests. GitHub's required run reads it and runs none.`);
  ctx.log(`test record written on pull request ${n}: ${data.result} at ${short(head)}, ${data.passed} passed, ${data.failed} failed, ${data.fails_total} failed run(s) in all`);
  if (!ok) {
    for (const r of results.filter((x) => !x.ok)) {
      ctx.log(`== ${r.name} failed; the last lines of its output:`);
      if (r.check.code !== 0) ctx.log(tail(r.check.out));
      if (r.code !== null && r.code !== 0) ctx.log(tail(r.out));
    }
    return 1;
  }
  askRerun(ctx, head);
  return 0;
}

/**
 * run verdict: on GitHub's machines, the required run's one job. It runs no test: it passes where the pull request
 * needs no test record (recordNeed), or where the record stands for the head; it fails otherwise. A draft cannot
 * merge, so it is judged without its notices: a draft whose scope is nothing passes at once (build text 1, section 5,
 * step 2). It reads the three comments of a job's pull request, each with its one writer: the job block (ARCH's), the
 * job's record (the job's: which notices need no change, and a told job's `nothing_to_change`) and the test record
 * (build text 1, section 5; build text 5, section 5). Writes the step summary.
 */
export function verdict(root, { base, baseRef, branch, draft, head, jobBlock, jobRecord = null, record, log = console.log, summary = process.env.GITHUB_STEP_SUMMARY }) {
  const s = decideScope(root, { base, baseRef, branch, draft, jobBlock, related: false });
  const lines = [`## module-tests`, '', `Scope: **${s.scope}**, because ${s.why}. Config read from ${s.config_from}.`, ''];
  let ok;
  let why;
  if (!recordNeed(s, draft ? null : jobBlock, draft ? null : jobRecord).needed) { ok = true; why = 'nothing needs a test record: passed at once'; }
  else {
    const st = recordStands(record, head, jobBlock, { usesOnly: usesOnly(root, branch), jobRecord });
    ok = st.ok;
    why = st.ok || record ? st.why : `no pass recorded for ${head}; run p4 test`;
    if (record) lines.push(`Test record: ${record.result} at ${short(record.commit)}, ${record.passed} passed, ${record.failed} failed, scope ${record.scope}, written ${record.written}.`, '');
  }
  lines.push(`${ok ? 'Passed' : 'Failed'}: ${why}.`);
  if (summary) appendFileSync(summary, lines.join('\n') + '\n');
  log(lines.join('\n'));
  return ok ? 0 : fail(why);
}

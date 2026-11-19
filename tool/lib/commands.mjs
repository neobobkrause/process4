// The commands of stage 1 (build text 1, sections 4 and 7). Each takes a context
// { root, slug, gh, log, wait, nowMs } so that tests replace GitHub, the clock and the output.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fetchLine, loadConfig, needConfig, readAt, requirementsFile } from './config.mjs';
import { block, parseBlock } from './github.mjs';
import {
  PROCESS_RECORDS, PRODUCT_RECORDS, checkKey, create, findIssue, laneRefusal, liveNotes,
  noteEnded, parseRecordFile, readAll, readRecords, writeRecord,
} from './state.mjs';
import { fail, git } from './util.mjs';

import {
  JOB_MARK, RECORD_MARK, REQUIRED, describe, failedRuns as countFailed, finished as isFinished, moduleStates,
  nextJobName, pickNext, readView, roundDone as isRoundDone, slots, workOf,
} from './round.mjs';

export { JOB_MARK, RECORD_MARK, REQUIRED };
const CANCELLED = ['cancelled', 'skipped'];
const JOB = /^job\/([a-z0-9-]+)\/(\d+)$/;
const BRANCH = /^(job\/[a-z0-9-]+\/\d+|work\/[A-Za-z0-9._/-]+)$/;
const TEXTS = new URL('../../starting_texts/', import.meta.url);

// The branch pull requests go into: the one named with --into, else the config's tranche branch,
// else the repository's default. --into lets a product's first pull request, made before any
// process.json exists, go into the tranche branch without writing the config locally first.
function intoBranch(ctx, cfg, into) {
  if (into !== undefined) {
    if (typeof into !== 'string' || !/^[A-Za-z0-9._/-]+$/.test(into)) fail('say --into <branch>');
    return into;
  }
  if (cfg?.tranche_branch) return cfg.tranche_branch;
  const d = ctx.gh.repo(ctx.slug).default_branch;
  ctx.log(`no process.json in the working tree: into the default branch ${d}; name another with --into <branch>`);
  return d;
}

const currentBranch = (root) => git(['branch', '--show-current'], { cwd: root }) || fail('the checkout is on no branch');

// 1. branch <name> [--into <branch>]: from the newest commit of the branch pull requests go into,
// with one empty commit so that a pull request can open, made without moving the session's checkout.
export function branch(ctx, name, into) {
  if (!BRANCH.test(name || '')) fail('name the branch job/<module>/<n> or work/<what>');
  const had = git(['ls-remote', '--heads', 'origin', `refs/heads/${name}`], { cwd: ctx.root });
  if (had) { ctx.log(`${name} exists already at ${had.split(/\s/)[0]}`); return 0; }
  const base = intoBranch(ctx, loadConfig(ctx.root), into);
  git(['fetch', '-q', 'origin', `refs/heads/${base}`], { cwd: ctx.root });
  const tip = git(['rev-parse', 'FETCH_HEAD'], { cwd: ctx.root });
  const c = git(['commit-tree', `${tip}^{tree}`, '-p', tip, '-m', `Start ${name}`], { cwd: ctx.root });
  git(['push', '-q', 'origin', `${c}:refs/heads/${name}`], { cwd: ctx.root });
  ctx.log(`${name} made from ${base} at ${tip.slice(0, 10)}; its first commit is ${c}`);
  return 0;
}

// Six pushes a minute at most, counted across this machine's runs of the tool.
function pushPace(ctx) {
  const file = ctx.paceFile || join(tmpdir(), 'p4-pushes.json');
  let times = [];
  try { times = JSON.parse(readFileSync(file, 'utf8')); } catch { /* none yet */ }
  times = times.filter((t) => ctx.nowMs() - t < 60000);
  if (times.length >= 6) ctx.wait(60000 - (ctx.nowMs() - times[0]));
  times.push(ctx.nowMs());
  writeFileSync(file, JSON.stringify(times.slice(-6)));
}

// The job's record on its pull request: one comment, written only by the job's session.
function writeJobRecord(ctx, n, data) {
  const body = block(RECORD_MARK, data);
  const had = ctx.gh.comments(ctx.slug, n).find((c) => parseBlock(c.body, RECORD_MARK));
  if (had) ctx.gh.editComment(ctx.slug, had.id, body); else ctx.gh.addComment(ctx.slug, n, body);
}

// 2. push [--blocked <module> "<why>"]: the current branch to the same-named branch, never forced.
export function push(ctx, a) {
  const name = currentBranch(ctx.root);
  const cfg = loadConfig(ctx.root);
  if (!BRANCH.test(name) || name === 'main' || name === cfg?.tranche_branch) fail(`${name} is not a working branch; push only job/ and work/ branches`);
  if (a.blocked !== undefined && (a.blocked === true || !a._[0])) fail('say --blocked <module> "<why>"');
  pushPace(ctx);
  git(['push', '-q', 'origin', `HEAD:refs/heads/${name}`], { cwd: ctx.root });
  ctx.log(`pushed ${git(['rev-parse', 'HEAD'], { cwd: ctx.root })} to ${name}`);
  if (a.blocked !== undefined) {
    const pr = ctx.gh.prForBranch(ctx.slug, name) || fail(`${name} has no open pull request to record the block on`);
    writeJobRecord(ctx, pr.number, { blocked: { by: a.blocked, why: a._[0] } });
    ctx.log(`recorded on pull request ${pr.number}: blocked by ${a.blocked}`);
  }
  return 0;
}

// The job's starting instructions: the job text filled in with names and addresses only.
export function jobText(ctx, cfg, { module, branch: b, url }) {
  const text = readFileSync(new URL('job.md', TEXTS), 'utf8');
  const fill = { '<module>': module, '<product>': ctx.slug, '<branch>': b, '<pull request>': url, '<fetch line>': fetchLine(cfg) };
  return Object.entries(fill).reduce((t, [k, v]) => t.split(k).join(v), text);
}


// The newest remote job branch of a module.
function newestJobBranch(ctx, module) {
  const refs = git(['ls-remote', '--heads', 'origin', `refs/heads/job/${module}/*`], { cwd: ctx.root });
  const ns = refs.split('\n').map((l) => l.match(/refs\/heads\/job\/[a-z0-9-]+\/(\d+)$/)?.[1]).filter(Boolean).map(Number);
  return ns.length ? `job/${module}/${Math.max(...ns)}` : fail(`no branch job/${module}/<n>; make it with branch first`);
}

function printJob(ctx, cfg, pr) {
  ctx.log(`pull request ${pr.number}: ${pr.html_url}`);
  const job = ctx.gh.comments(ctx.slug, pr.number).map((c) => parseBlock(c.body, JOB_MARK)).find(Boolean);
  if (!job) return;
  ctx.log('job block:');
  ctx.log(JSON.stringify(job.data, null, 2));
  ctx.log('starting instructions:');
  ctx.log(jobText(ctx, cfg, { module: job.data.module, branch: pr.head.ref, url: pr.html_url }));
}

// 3. open --module <name> | --title "<t>" [--into-main | --into <branch>] [--branch <b>]: a draft pull request.
// With no pull request to open, prints the one open for the branch and its job block.
export function open(ctx, a) {
  const cfg = loadConfig(ctx.root);
  const module = typeof a.module === 'string' ? a.module : null;
  const name = typeof a.branch === 'string' ? a.branch
    : module && !JOB.test(currentBranch(ctx.root)) ? newestJobBranch(ctx, module) : currentBranch(ctx.root);
  if (module && name.match(JOB)?.[1] !== module) fail(`${name} is not a job branch of ${module}`);
  const had = ctx.gh.prForBranch(ctx.slug, name);
  if (had) { printJob(ctx, cfg, had); return 0; }
  if (!module && typeof a.title !== 'string') fail('say --module <name> or --title "<title>"');
  const base = a['into-main'] ? 'main' : intoBranch(ctx, cfg, a.into);
  if (!module) {
    const pr = ctx.gh.createPR(ctx.slug, { head: name, base, title: a.title, body: `Opened by the Process4 tool from ${name}.`, draft: true });
    ctx.log(`pull request ${pr.number}: ${pr.html_url}`);
    return 0;
  }
  needConfig(ctx.root);
  git(['fetch', '-q', 'origin', `refs/heads/${base}`], { cwd: ctx.root });
  const { issue, records } = readRecords(ctx.gh, ctx.slug);
  const waiting = records['waiting-work']?.data?.work || [];
  const { reqs, mine, notices, kind } = workOf({ requirements: { [module]: readAt(ctx.root, requirementsFile(cfg, module), 'FETCH_HEAD') }, waiting }, module);
  const job = { module, work: [...reqs, ...mine.map(describe)], kind };
  if (notices.length) job.uses = notices.flatMap((w) => w.uses || []);
  const n = Number(name.match(JOB)[2]);
  const pr = ctx.gh.createPR(ctx.slug, { head: name, base, title: `${module}: job ${n}`, body: `The job for ${module}. Its work is in the job block below.`, draft: true });
  ctx.gh.addComment(ctx.slug, pr.number, block(JOB_MARK, job));
  if (mine.length) {
    writeRecord(ctx.gh, ctx.slug, issue, records, 'waiting-work', { ...records['waiting-work'].data, work: waiting.filter((w) => w.module !== module) });
  }
  printJob(ctx, cfg, pr);
  return 0;
}

// 4. ready <pr>
export function ready(ctx, n) {
  ctx.gh.markReady(ctx.slug, n);
  const pr = ctx.gh.getPR(ctx.slug, n);
  if (pr.draft) fail(`pull request ${n} is still a draft`);
  ctx.log(`pull request ${n} is ${pr.state} and ready; the required run ${REQUIRED} has been asked for`);
  return 0;
}

// 14. results <pr>: the required run's state on the head commit.
export function results(ctx, n) {
  const pr = ctx.gh.getPR(ctx.slug, n);
  const runs = ctx.gh.checkRuns(ctx.slug, pr.head.sha, REQUIRED).sort((x, y) => String(y.started_at).localeCompare(String(x.started_at)));
  // A run cancelled by a newer one (`ready` cancels the draft's) is not the result.
  const r = runs.find((x) => !CANCELLED.includes(x.conclusion)) || runs[0];
  if (!r || r.status !== 'completed') { ctx.log(`waiting: ${REQUIRED} on ${pr.head.sha.slice(0, 10)} ${r ? `is ${r.status}: ${r.html_url}` : 'has not started'}`); return 0; }
  if (r.conclusion === 'success') { ctx.log(`passed: ${REQUIRED} on ${pr.head.sha.slice(0, 10)}: ${r.html_url}`); return 0; }
  ctx.log(`failed (${r.conclusion}): ${REQUIRED} on ${pr.head.sha.slice(0, 10)}: ${r.html_url}`);
  const out = ctx.gh.jobLog(ctx.slug, r.id);
  if (out) ctx.log(out.trimEnd().split('\n').slice(-40).join('\n'));
  return 0;
}

// The standing notes in force, or none where the repository has no shared state.
function notesInForce(ctx) {
  const issue = findIssue(ctx.gh, ctx.slug);
  if (!issue) return [];
  return liveNotes(readAll(ctx.gh, ctx.slug, issue)['standing-notes']?.data);
}

// 6. merge <pr>: the owner's hold, then one merge commit guarded by the head commit id.
export function merge(ctx, n) {
  const pr = ctx.gh.getPR(ctx.slug, n);
  const held = notesInForce(ctx).find((x) => x.kind === 'held-merge' && Number(x.pull_request) === n);
  if (held) { ctx.log(`held: the owner holds pull request ${n} ("${held.words}"); not merged`); return 0; }
  const last = ctx.gh.closedPRs(ctx.slug, pr.base.ref).map((p) => p.merged_at).filter(Boolean).sort().pop();
  const since = last ? ctx.nowMs() - Date.parse(last) : Infinity;
  if (since < 60000) { ctx.log(`waiting ${Math.ceil((60000 - since) / 1000)} s since the last merge into ${pr.base.ref}`); ctx.wait(60000 - since); }
  const r = ctx.gh.mergePR(ctx.slug, n, pr.head.sha, `Merge pull request #${n} from ${pr.head.ref}`);
  if (!r?.merged) fail(`GitHub did not merge pull request ${n}: ${r?.message || 'no answer'}`);
  ctx.log(`merged pull request ${n} into ${pr.base.ref}: ${r.sha}`);
  return 0;
}

// 16. state read [<record>] [--repository <owner/name>]
export function stateRead(ctx, key, a) {
  const slug = typeof a.repository === 'string' ? a.repository.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '') : ctx.slug;
  if (key) checkKey(key);
  const { issue, records } = readRecords(ctx.gh, slug);
  ctx.log(`issue ${issue.number} of ${slug}`);
  for (const k of key ? [key] : Object.keys(records)) {
    const r = records[k] || { data: {}, words: '' };
    ctx.log(`== ${k}\n${JSON.stringify(r.data, null, 2)}${r.words ? `\n\n${r.words}` : ''}`);
  }
  return 0;
}

// Merged job pull requests into a branch, for the module-first note's ending.
function mergedJobs(ctx, base) {
  return ctx.gh.closedPRs(ctx.slug, base).filter((p) => p.merged_at && JOB.test(p.head?.ref || ''))
    .map((p) => ({ module: p.head.ref.match(JOB)[1], merged_at: p.merged_at.replace(/:\d\dZ$/, 'Z') }));
}

// 17. state write <record> --from <file> [--create [--process]]
export function stateWrite(ctx, key, a) {
  let issue;
  let records;
  if (a.create) {
    ({ issue, records } = create(ctx.gh, ctx.slug, a.process ? PROCESS_RECORDS : PRODUCT_RECORDS, ctx.log));
    if (!key) { ctx.log(`records made in issue ${issue.number}`); return 0; }
  }
  checkKey(key);
  if (typeof a.from !== 'string' || !existsSync(a.from)) fail('say --from <file>');
  let { data, words } = parseRecordFile(readFileSync(a.from, 'utf8'));
  if (!issue) ({ issue, records } = readRecords(ctx.gh, ctx.slug));
  if (key === 'lanes') { const why = laneRefusal(records.lanes?.data, data); if (why) fail(why); }
  if (key === 'standing-notes' && Array.isArray(data.notes)) {
    const cfg = loadConfig(ctx.root);
    const ends = { mergedJobs: cfg ? mergedJobs(ctx, cfg.tranche_branch) : [], round: records.round?.data || {} };
    const kept = data.notes.filter((x, _, all) => !noteEnded(x, all, ends));
    if (kept.length !== data.notes.length) ctx.log(`left out ${data.notes.length - kept.length} ended note(s)`);
    data = { ...data, notes: kept };
  }
  const body = writeRecord(ctx.gh, ctx.slug, issue, records, key, data, words);
  ctx.log(`wrote ${key} in issue ${issue.number}: ${Buffer.byteLength(body)} bytes`);
  return 0;
}

// 5. close <pr> [--nothing-to-change "<why>"]: with the flag, first the job's record; then closed unmerged.
export function close(ctx, n, a) {
  const why = a['nothing-to-change'];
  if (why !== undefined && (typeof why !== 'string' || !why.trim())) fail('say --nothing-to-change "<why>"');
  const pr = ctx.gh.getPR(ctx.slug, n) || fail(`there is no pull request ${n}`);
  if (pr.state !== 'open') fail(`pull request ${n} is ${pr.merged_at ? 'merged' : pr.state} already`);
  if (why !== undefined) { writeJobRecord(ctx, n, { nothing_to_change: why }); ctx.log(`recorded on pull request ${n}: nothing to change`); }
  ctx.gh.closePR(ctx.slug, n);
  ctx.log(`closed pull request ${n} unmerged`);
  return 0;
}

// 9. next-job: one job for each call. Rewrites the round record and prints what open needs.
export function nextJob(ctx) {
  const { issue, records } = readRecords(ctx.gh, ctx.slug);
  const view = readView(ctx, { records });
  const states = moduleStates(view);
  const s = slots(view, states);
  const pick = pickNext(view, states);
  const write = (modules) => writeRecord(ctx.gh, ctx.slug, issue, records, 'round', { ...view.round, modules });
  if (!pick) { write(states); ctx.log(`none ready; slots in use ${s.inUse} of ${s.share}`); return 0; }
  if (s.inUse >= s.share) { write(states); ctx.log(`no free slot: ${s.inUse} in use of ${s.share}, from ${s.from}`); return 0; }
  let entry;
  if (pick.ready_again) {
    const pr = view.prs.find((p) => p.number === pick.pull_request);
    const b = view.jobRecord(pr.number);
    entry = { module: pick.module, state: 'open', pull_request: pr.number, restarted: b.at };
    ctx.log(`module: ${pick.module}`);
    ctx.log(`branch: ${pr.head.ref} (its job is ready again: the block by ${b.blocked.by} ended when ${b.blocked.by} merged)`);
    ctx.log(`work: as its job block on pull request ${pr.number} says`);
    ctx.log(`kind: ${view.jobBlock(pr.number)?.kind || 'ordinary'}`);
    ctx.log(`then: open --branch ${pr.head.ref} prints its starting instructions`);
  } else {
    const w = workOf(view, pick.module);
    const name = nextJobName(view, pick.module);
    entry = { module: pick.module, state: 'open', pull_request: null, branch: name };
    ctx.log(`module: ${pick.module}`);
    ctx.log(`branch: ${name}`);
    ctx.log(`work: ${[...w.reqs, ...w.mine.map(describe)].join('; ')}`);
    ctx.log(`kind: ${w.kind}`);
    ctx.log(`then: branch ${name}; open --module ${pick.module} prints its starting instructions`);
  }
  write(states.map((x) => (x.module === pick.module ? entry : x)));
  ctx.log(`slots in use ${s.inUse + 1} of ${s.share}`);
  return 0;
}

const roundView = (ctx) => readView(ctx, { records: findIssue(ctx.gh, ctx.slug) ? readRecords(ctx.gh, ctx.slug).records : {} });

// 12. finished <module>
export function finishedCmd(ctx, module) {
  if (!/^[a-z0-9-]+$/.test(module || '')) fail('name the module');
  const f = isFinished(roundView(ctx), module);
  ctx.log(`${f.finished ? 'finished' : 'not finished'}: ${f.why}`);
  return 0;
}

// 13. round-done
export function roundDoneCmd(ctx) {
  const view = roundView(ctx);
  const r = isRoundDone(view, moduleStates(view));
  ctx.log(r.done ? 'done' : 'not done');
  for (const l of r.lines) ctx.log(`  ${l}`);
  return 0;
}

// 15. failed-runs <pr>: every failed required run on the pull request, with no reset.
export function failedRunsCmd(ctx, n) {
  const pr = ctx.gh.getPR(ctx.slug, n) || fail(`there is no pull request ${n}`);
  const failed = countFailed(ctx.gh.workflowRuns(ctx.slug, pr.head.ref), pr);
  ctx.log(`${failed.length} failed run(s) of ${REQUIRED} on pull request ${n}${failed.length ? `: ${failed.map((r) => r.html_url).join(' ')}` : ''}`);
  const module = pr.head.ref.match(/^job\/([a-z0-9-]+)\/\d+$/)?.[1] || pr.head.ref;
  if (failed.length === 3) ctx.log(`for ARCH: two corrections of ${module} have failed; replace its session with a fresh one, which first works out why the corrections were made`);
  if (failed.length >= 5) ctx.log(`for ARCH: the replacement of ${module} has also failed twice; record ${module} blocked with the reason, free its slot, and take it as a design question`);
  return 0;
}

// The commands that read code (build text 1b, commands 10, 11 and 18): listing, notify, check. They load the
// language reader (TypeScript, the tool's one dependency) when they run; no other command loads it.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTree } from './notice/model.mjs';
import { loadReader, makeProgram, readerVersion } from './notice/ts.mjs';
import { makeLister } from './notice/listing.mjs';
import { describe, noticeText } from './notice/notice.mjs';
import { check } from './notice/check.mjs';
import { relatedList } from './notice/related.mjs';
import { block, parseBlock } from './github.mjs';
import { NOTICE_LIMIT, cutReason, writeNotice } from './noticecomments.mjs';
import { JOB, JOB_MARK, describe as workLine } from './round.mjs';
import { noticeSeq } from './testrecord.mjs';
import { readRecords, writeRecord } from './state.mjs';
import { fail, git, run } from './util.mjs';

const MODULE = /^[a-z0-9-]+$/;

/** A commit's id, or a plain failure naming what was given. */
function commitOf(root, at) {
  const r = git(['rev-parse', '--verify', '-q', `${at}^{commit}`], { cwd: root, allowFail: true });
  return r.code === 0 ? r.stdout.trim() : fail(`${at} is not a commit here`);
}

/** Writes the product's files at a commit into a fresh folder outside the working tree (git archive). */
export function writeOut(root, sha, base) {
  const dir = join(base, sha);
  mkdirSync(dir, { recursive: true });
  const tar = join(base, `${sha}.tar`);
  git(['archive', '--format=tar', '-o', tar, sha], { cwd: root });
  const r = run('tar', ['-xf', tar, '-C', dir]);
  if (r.code !== 0) fail(`could not write out ${sha.slice(0, 10)}: ${r.stderr.trim()}`);
  rmSync(tar, { force: true });
  return dir;
}

const tempBase = () => mkdtempSync(join(tmpdir(), 'p4-read-'));

/** The language reader the config names, when it is not the one loaded. */
function readerNote(ctx, tree) {
  const want = tree.cfg.language_reader;
  if (want?.version && want.version !== readerVersion()) ctx.log(`note: process.json names ${want.name ?? 'typescript'} ${want.version}; this copy of the tool reads with TypeScript ${readerVersion()}`);
}

/** A listing in build text 2b, section 6's printed form. */
export function listingText(l) {
  const L = [`Listing of ${l.module}${l.hasInterfaceComments ? '' : ' (no interface comments)'}`];
  for (const [name, e] of Object.entries(l.entries)) {
    L.push(`  ${e.kind} ${name}   [${e.where}]`);
    if (e.accepts) L.push(`      accepts: ${e.accepts}`);
    if (e.handsBack) L.push(`      hands back: ${e.handsBack}`);
    for (const b of e.bounds ?? []) L.push(`      bound: ${b}`);
    if (e.throws) L.push(`      throws: ${e.throws.join(', ')}`);
    if (e.channel) L.push(`      message on: ${e.channel}`);
    if (e.optional) L.push('      may be missing');
  }
  return L.join('\n');
}

/** One module's listing in a product folder: made with the reader's checker from its interface files. */
export function listingOf(tree, moduleId) {
  loadReader();
  const mod = tree.byId.get(moduleId) || fail(`no module is named ${moduleId}`);
  const l = makeLister(makeProgram(mod.public), tree).list(mod);
  return { module: l.module, hasInterfaceComments: l.hasInterfaceComments, entries: Object.fromEntries(Object.entries(l.entries).map(([k, e]) => [k, { ...describe(e), where: e.where }])) };
}

// 10. listing <module> [--at <commit>]: reads only; writes nothing to GitHub.
export function listingCmd(ctx, moduleId, a) {
  if (!MODULE.test(moduleId || '')) fail('name the module');
  const sha = commitOf(ctx.root, typeof a.at === 'string' ? a.at : 'HEAD');
  const base = tempBase();
  try {
    const tree = loadTree(writeOut(ctx.root, sha, base));
    readerNote(ctx, tree);
    ctx.log(listingText(listingOf(tree, moduleId)));
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
  return 0;
}

/** The modules a merge changed, in module order: owners of the changed files, by either side's module list. */
function changedModules(root, before, after, B, A) {
  const files = git(['diff', '--name-only', '--no-renames', before, after], { cwd: root }).split('\n').filter(Boolean);
  const names = new Set();
  for (const f of files) {
    for (const t of [A.tree, B.tree]) { const m = t.moduleOfFile(join(t.root, f)); if (m) names.add(m); }
  }
  return A.tree.modules.map((m) => m.id).filter((id) => names.has(id));
}

/**
 * The notices of a merge, read in a process of its own (notice/notices.mjs), one changed module after another, each in
 * stages (notice/staged.mjs). Running out of memory there ends that process, not this one: notify then says so plainly.
 * P4_READ_HEAP_MB, where set, is that process's heap in megabytes (for a test of running out).
 */
function readNotices(dirB, dirA, mods, n) {
  const child = fileURLToPath(new URL('./notice/notices.mjs', import.meta.url));
  const heap = process.execArgv.filter((a) => /^--(max-old-space-size|stack-size)=/.test(a));
  if (process.env.P4_READ_HEAP_MB) heap.push(`--max-old-space-size=${Number(process.env.P4_READ_HEAP_MB)}`);
  const r = spawnSync(process.execPath, [...heap, child], { input: JSON.stringify({ dirB, dirA, mods }), encoding: 'utf8', maxBuffer: 1 << 30 });
  if (r.status === 0) return JSON.parse(r.stdout);
  const err = `${r.stderr ?? ''}${r.error ? ` ${r.error.message}` : ''}`;
  if (/heap out of memory|Allocation failed|out of memory|ENOMEM/i.test(err) || r.signal === 'SIGABRT' || r.signal === 'SIGKILL' || r.status === 134) {
    fail(`could not read the product within this machine's memory; nobody is told; the notice for pull request ${n} is owed`);
  }
  const f = /^p4-fail: (.*)$/m.exec(err);
  if (f) fail(f[1]);
  throw new Error(`reading the product failed:\n${err.trim().split('\n').slice(-12).join('\n')}`);
}

// A notice reaches a running job at once (the owner's decision of 24 Nov 2026, item 2): for each told user with an open
// job pull request into the tranche branch, blocked or not, the notice goes into its job block, edited in place: its
// work line, its reasons added to `uses`, `notice_seq` one higher (a test record made before it no longer stands), and
// `notices` naming it by provider and merged pull request. The block's kind stays as it is. Three more rules (the
// owner's decision B of 25 Nov 2026, after notify 1350 and 1356 on civicsmith):
// - no repeats: a told user whose job pull request of any state, open, merged or closed, already names the notice in
//   its block's `notices` has it; nothing more is written for it;
// - a job block stays under the size of one comment: where the notice's reasons would pass it, they go in without their
//   before and after; where still too many, one reason in their place says so, and the whole module's tests run;
// - a job merged or closed while its block was written did not carry the notice: the block is put back as it was, and
//   the user counts as having no open job.
// Returns the told users with no open job, whose notices wait for their next job.
function toOpenJobs(ctx, base, told, n, mergedAt) {
  if (!base || base === 'main') return told;
  // Every job pull request into the tranche branch that was still open when the merge was made.
  const jobs = ctx.gh.allPRs(ctx.slug, base).filter((p) => p.base?.ref === base && JOB.test(p.head?.ref || '')
    && (p.state === 'open' || !mergedAt || !p.closed_at || p.closed_at >= mergedAt));
  const blocks = new Map();
  const blockOf = (pr) => {
    if (!blocks.has(pr.number)) {
      const c = ctx.gh.comments(ctx.slug, pr.number).find((x) => parseBlock(x.body, JOB_MARK));
      blocks.set(pr.number, c ? { c, ...parseBlock(c.body, JOB_MARK) } : null);
    }
    return blocks.get(pr.number);
  };
  const names = (b, t) => (Array.isArray(b?.data.notices) ? b.data.notices : []).some((x) => x.from === t.from && Number(x.merged) === n);
  const rest = [];
  for (const t of told) {
    const mine = jobs.filter((p) => p.head.ref.match(JOB)[1] === t.module).sort((a, b) => Number(b.head.ref.match(JOB)[2]) - Number(a.head.ref.match(JOB)[2]));
    const holder = mine.find((p) => names(blockOf(p), t) || (p.state === 'open' && (blockOf(p)?.data.work || []).includes(workLine(t))));
    if (holder) {
      ctx.log(`the job of ${t.module} (pull request ${holder.number}${holder.state === 'open' ? '' : `, ${holder.merged_at ? 'merged' : 'closed'}`}) holds the notice from ${t.from} (pull request ${n}) already`);
      continue;
    }
    const pr = mine.find((p) => p.state === 'open');
    if (!pr) { rest.push(t); continue; }
    const b = blockOf(pr);
    if (!b) { ctx.log(`pull request ${pr.number} of ${t.module} has no job block; the notice from ${t.from} waits for its next job`); rest.push(t); continue; }
    const { c, data, words } = b;
    const bodyWith = (uses) => block(JOB_MARK, { ...data, work: [...(data.work || []), workLine(t)], uses: [...(data.uses || []), ...uses], notice_seq: noticeSeq(data) + 1, notices: [...(data.notices || []), { from: t.from, merged: n }] }, words);
    const reasons = t.uses || [];
    const tooMany = { module: t.from, notFollowed: [`the notice from ${t.from} (pull request ${n}) has ${reasons.length} reasons, too many for the job block; the whole module's tests run`], through: null };
    const body = [reasons, reasons.map(cutReason), [tooMany]].map(bodyWith).find((x) => x.length < NOTICE_LIMIT);
    if (!body) { ctx.log(`the job block of ${t.module} (pull request ${pr.number}) is too large to take the notice from ${t.from}; it waits for its next job`); rest.push(t); continue; }
    const was = c.body;
    ctx.gh.editComment(ctx.slug, c.id, body);
    blocks.delete(pr.number);
    // A job merged or closed meanwhile ran its tests without the notice: its block is put back, and the notice waits.
    const now = ctx.gh.getPR(ctx.slug, pr.number);
    if (!now || now.state !== 'open' || now.merged_at) {
      ctx.gh.editComment(ctx.slug, c.id, was);
      ctx.log(`the job of ${t.module} (pull request ${pr.number}) ${now?.merged_at ? 'merged' : 'closed'} while the notice from ${t.from} was written; it waits for its next job`);
      rest.push(t);
      continue;
    }
    ctx.log(`message the job of ${t.module} (pull request ${pr.number}): a notice from ${t.from} reached it${body === bodyWith(reasons) ? '' : ' (its reasons shortened to fit the job block)'}`);
  }
  return rest;
}

// 11. notify <pr>: for a merged pull request, the notice for each module whose files the merge changed, in module
// order; each told user's reasons go into its open job's block, or, with no open job, into the notice comments on the
// merged pull request (noticecomments.mjs), and the waiting-work record names the notice, for the module's next job
// (the owner's decision B of 25 Nov 2026: the record held every reason and grew past what GitHub takes).
export function notifyCmd(ctx, n) {
  const pr = ctx.gh.getPR(ctx.slug, n) || fail(`there is no pull request ${n}`);
  if (!pr.merged_at || !pr.merge_commit_sha) fail(`pull request ${n} is not merged`);
  const after = pr.merge_commit_sha;
  if (git(['cat-file', '-e', `${after}^{commit}`], { cwd: ctx.root, allowFail: true }).code !== 0) {
    git(['fetch', '-q', 'origin', after], { cwd: ctx.root });
  }
  const before = git(['rev-parse', `${after}^1`], { cwd: ctx.root });
  const base = tempBase();
  let told = [];
  let tranche = null;
  try {
    // Both products are written out first. Which modules the merge changed is read from the module lists and the
    // changed file names alone; only when one changed is the code read, by one tool and one reader, in stages: the
    // changed module's listing before and after, and only where it changed, the later modules that can use it, one
    // at a time (a whole product read twice needs much memory: civicsmith, 23 Nov 2026).
    const dirB = writeOut(ctx.root, before, base);
    const dirA = writeOut(ctx.root, after, base);
    const treeB = loadTree(dirB), treeA = loadTree(dirA);
    tranche = treeA.cfg.tranche_branch;
    ctx.log(`pull request ${n}: before ${before.slice(0, 10)} (first parent), after ${after.slice(0, 10)} (the merge commit)`);
    const mods = changedModules(ctx.root, before, after, { tree: treeB }, { tree: treeA });
    if (!mods.length) {
      ctx.log('The merge changed no module\'s files.');
      ctx.log('The listing before and after is the same. Nobody is told.');
      return 0;
    }
    readerNote(ctx, treeA);
    const read = mods.filter((m) => treeB.byId.has(m));
    const reports = new Map(read.length ? readNotices(dirB, dirA, read, n).map((r) => [r.provider, r]) : []);
    for (const m of mods) {
      if (!treeB.byId.has(m)) { ctx.log(`${m} is a new module: it had no listing before, and nobody is told.`); continue; }
      const r = reports.get(m);
      ctx.log(noticeText(r));
      for (const t of r.told) told.push({ module: t.user, kind: 'notice', from: m, merged: n, uses: t.reasons });
    }
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
  if (!told.length) return 0;
  told = toOpenJobs(ctx, tranche, told, n, pr.merged_at);
  if (!told.length) return 0;
  // The reasons first, on the merged pull request, one notice for each changed module; then the record that names them.
  for (const from of [...new Set(told.map((t) => t.from))]) {
    const parts = writeNotice(ctx.gh, ctx.slug, n, from, told.filter((t) => t.from === from).map((t) => [t.module, t.uses]));
    ctx.log(`the notice from ${from} is written on pull request ${n} (${parts} comment(s))`);
  }
  told = told.map(({ uses, ...w }) => w);
  const { issue, records } = readRecords(ctx.gh, ctx.slug);
  const had = records['waiting-work']?.data || {};
  // A second run for the same merge rewrites its own entries and keeps every other.
  const same = (w) => w.kind === 'notice' && Number(w.merged) === n && told.some((t) => t.module === w.module && t.from === w.from);
  const work = [...(had.work || []).filter((w) => !same(w)), ...told];
  writeRecord(ctx.gh, ctx.slug, issue, records, 'waiting-work', { ...had, work });
  ctx.log(`waiting work: ${told.map((t) => `${t.module} (notice from ${t.from})`).join(', ')}; each waits for the module's next job`);
  return 0;
}

// 18. check <module> [--files <list>]: inside module tests. Exit 1 if any part disagrees.
export function checkCmd(ctx, moduleId, a) {
  if (!MODULE.test(moduleId || '')) fail('name the module');
  const files = a.files === undefined ? null : [].concat(a.files).flatMap((x) => (x === true ? fail('say --files <list>') : String(x).split(/[,\s]+/))).filter(Boolean);
  loadReader();
  const tree = loadTree(ctx.root);
  if (!tree.byId.has(moduleId)) fail(`no module is named ${moduleId}`);
  readerNote(ctx, tree);
  const r = check(tree, moduleId, { files });
  ctx.log(`Check of ${moduleId}: ${r.refused ? `${r.refusals.length} disagreement(s)` : 'no disagreement found'}`);
  for (const x of r.refusals) ctx.log(`  ${x.at} ${x.kind}: ${x.text}`);
  for (const x of r.cannotTell) ctx.log(`  cannot tell, not refused: ${x.at} ${x.why}`);
  if (r.refused) fail(`${r.refusals.length} disagreement(s) in ${moduleId}`);
  return 0;
}

// 24. related <pr>: a told job's related tests, as the required run's step 3 picks them, made from the merged result
// of the pull request's head into its base (git merge-tree, written out to a folder outside the working tree). It
// only lists; it runs nothing and writes nothing to GitHub.
export function relatedCmd(ctx, n) {
  const pr = ctx.gh.getPR(ctx.slug, n) || fail(`there is no pull request ${n}`);
  const module = pr.head.ref.match(JOB)?.[1] || fail(`pull request ${n} is not a job's (its branch is ${pr.head.ref})`);
  const block = ctx.gh.comments(ctx.slug, n).map((c) => parseBlock(c.body, JOB_MARK)).find(Boolean)?.data || fail(`pull request ${n} has no job block`);
  if (block.kind !== 'told') { ctx.log(`pull request ${n} is an ${block.kind || 'ordinary'} job of ${module}: the required run runs its whole module; there is no related list`); return 0; }
  const tip = (ref) => { git(['fetch', '-q', 'origin', ref], { cwd: ctx.root }); return git(['rev-parse', 'FETCH_HEAD'], { cwd: ctx.root }); };
  const baseSha = tip(`refs/heads/${pr.base.ref}`);
  const headSha = tip(`refs/heads/${pr.head.ref}`);
  const m = git(['merge-tree', '--write-tree', baseSha, headSha], { cwd: ctx.root, allowFail: true });
  if (m.code !== 0) fail(`${pr.head.ref} does not merge cleanly into ${pr.base.ref}; GitHub's run has no merged result either`);
  const merged = git(['commit-tree', m.stdout.split('\n')[0].trim(), '-p', baseSha, '-p', headSha, '-m', `merged result of pull request ${n}`], { cwd: ctx.root });
  const base = tempBase();
  let r;
  try {
    r = relatedList({ dir: writeOut(ctx.root, merged, base), gitRoot: ctx.root, base: baseSha, after: merged, module, uses: block.uses || [] });
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
  ctx.log(`related tests of ${module} for pull request ${n}: ${pr.head.ref} at ${headSha.slice(0, 10)} merged into ${pr.base.ref} at ${baseSha.slice(0, 10)}`);
  if (!r.files.length) ctx.log('The related list is empty: the required run passes at once.');
  for (const f of r.files) ctx.log(`  ${f.file}: ${f.reasons.join('; ')}`);
  ctx.log(`  left out: ${r.leftOut.join(', ') || 'none'}`);
  return 0;
}

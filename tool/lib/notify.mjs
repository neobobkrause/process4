// The commands that read code (build text 1b, commands 10, 11 and 18): listing, notify, check. They load the
// language reader (TypeScript, the tool's one dependency) when they run; no other command loads it.
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadTree } from './notice/model.mjs';
import { loadReader, makeProgram, readerVersion } from './notice/ts.mjs';
import { makeLister } from './notice/listing.mjs';
import { analyse, describe, makeConfirm, notice, noticeText } from './notice/notice.mjs';
import { check } from './notice/check.mjs';
import { relatedList } from './notice/related.mjs';
import { parseBlock } from './github.mjs';
import { JOB_MARK } from './round.mjs';
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

// 11. notify <pr>: for a merged pull request, the notice for each module whose files the merge changed, in module
// order; each told user's reasons are written into the waiting-work record, for the module's next job.
export function notifyCmd(ctx, n) {
  const pr = ctx.gh.getPR(ctx.slug, n) || fail(`there is no pull request ${n}`);
  if (!pr.merged_at || !pr.merge_commit_sha) fail(`pull request ${n} is not merged`);
  const after = pr.merge_commit_sha;
  if (git(['cat-file', '-e', `${after}^{commit}`], { cwd: ctx.root, allowFail: true }).code !== 0) {
    git(['fetch', '-q', 'origin', after], { cwd: ctx.root });
  }
  const before = git(['rev-parse', `${after}^1`], { cwd: ctx.root });
  const base = tempBase();
  const told = [];
  try {
    // Both products are written out first, then read by one tool and one reader.
    const dirB = writeOut(ctx.root, before, base);
    const dirA = writeOut(ctx.root, after, base);
    const B = analyse(dirB), A = analyse(dirA);
    readerNote(ctx, A.tree);
    ctx.log(`pull request ${n}: before ${before.slice(0, 10)} (first parent), after ${after.slice(0, 10)} (the merge commit)`);
    const mods = changedModules(ctx.root, before, after, B, A);
    if (!mods.length) {
      ctx.log('The merge changed no module\'s files.');
      ctx.log('The listing before and after is the same. Nobody is told.');
      return 0;
    }
    const confirm = makeConfirm(B, A);
    for (const m of mods) {
      if (!B.tree.byId.has(m)) { ctx.log(`${m} is a new module: it had no listing before, and nobody is told.`); continue; }
      const r = notice(B, A, m, confirm);
      ctx.log(noticeText(r));
      for (const t of r.told) told.push({ module: t.user, kind: 'notice', from: m, merged: n, uses: t.reasons });
    }
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
  if (!told.length) return 0;
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
  const module = pr.head.ref.match(/^job\/([a-z0-9-]+)\/\d+$/)?.[1] || fail(`pull request ${n} is not a job's (its branch is ${pr.head.ref})`);
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

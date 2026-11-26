// The commands of stage 1 (build text 1, sections 4 and 7). Each takes a context
// { root, slug, gh, log, wait, nowMs } so that tests replace GitHub, the clock and the output.
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CONFIG_FILE, fetchLine, loadConfig, loadModules, needConfig, ownerOf, readAt, requiredCheck, requirementsFile } from './config.mjs';
import { block, parseBlock } from './github.mjs';
import { noticeReasons } from './noticecomments.mjs';
import {
  PROCESS_RECORDS, PRODUCT_RECORDS, checkKey, create, findIssue, laneRefusal, liveNotes,
  noteEnded, parseRecordFile, readAll, readRecords, writeRecord,
} from './state.mjs';
import { ORDER, fail, git, underPath } from './util.mjs';
import { DROP } from './scope.mjs';
import { noticeAfterTests, noticeSeq, recordNeed, recordStands } from './testrecord.mjs';
import { recordsOf, scopeForPR, usesOnly } from './testrun.mjs';

import {
  JOB, JOB_MARK, RECORD_MARK, REQUIRED, chooseNext, describe, finished as isFinished, isBlocked, jobBlockOf, jobRecordOf, MEANING_MARK, meaningsOf,
  hasConverted, moduleStates, nextJobName, openJob, readView, roundDone as isRoundDone, slots, workLines, workOf,
} from './round.mjs';
import { earlierUsesAt } from './uses.mjs';
import { loadTree } from './notice/model.mjs';
import { writeOut } from './notify.mjs';
import { usesReading, writeUsesFiles } from './usescmd.mjs';
import { isUsesPath, readUses, usesPath } from './usesfile.mjs';

export { JOB_MARK, RECORD_MARK, REQUIRED };
const CANCELLED = ['cancelled', 'skipped'];
const BRANCH = /^(job\/[a-z0-9-]+[./]\d+|work\/[A-Za-z0-9._/-]+)$/;
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
// The branch checked out, or null on a detached checkout (fault o: open must not refuse one).
const branchOrNone = (root) => git(['branch', '--show-current'], { cwd: root }) || null;

// The modules named by --blocked: repeated (--blocked a --blocked b) or with commas (a,b).
export function blockers(v) {
  const names = [].concat(v).filter((x) => typeof x === 'string').flatMap((x) => x.split(',')).map((x) => x.trim()).filter(Boolean);
  if (!names.length || [].concat(v).some((x) => x === true)) fail('say --blocked <module> "<why>"');
  for (const n of names) if (!/^[a-z0-9-]+$/.test(n)) fail(`${n} is not a module's name`);
  return [...new Set(names)];
}

// 1. branch <name> [--into <branch>]: from the newest commit of the branch pull requests go into,
// with one empty commit so that a pull request can open, made without moving the session's checkout.
export function branch(ctx, name, into) {
  if (!BRANCH.test(name || '')) fail('name the branch job/<module>.<n> or work/<what>');
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
export function pushPace(ctx) {
  const file = ctx.paceFile || join(tmpdir(), 'p4-pushes.json');
  let times = [];
  try { times = JSON.parse(readFileSync(file, 'utf8')); } catch { /* none yet */ }
  times = times.filter((t) => ctx.nowMs() - t < 60000);
  if (times.length >= 6) ctx.wait(60000 - (ctx.nowMs() - times[0]));
  times.push(ctx.nowMs());
  writeFileSync(file, JSON.stringify(times.slice(-6)));
}

// The job's record on its pull request: one comment, written only by the job's session. A record that a notice needs
// no change (`notice_needs_no_change`) is kept beside whatever a later flag writes.
function writeJobRecord(ctx, n, data) {
  const had = ctx.gh.comments(ctx.slug, n).find((c) => parseBlock(c.body, RECORD_MARK));
  const kept = parseBlock(had?.body, RECORD_MARK)?.data?.notice_needs_no_change;
  const body = block(RECORD_MARK, { ...(kept && !data.notice_needs_no_change ? { notice_needs_no_change: kept } : {}), ...data });
  if (had) ctx.gh.editComment(ctx.slug, had.id, body); else ctx.gh.addComment(ctx.slug, n, body);
}

// The declaration on a pull request (build text 5, section 5): one comment, `<!-- process4-meaning -->`, written only by
// the session that owns the pull request, holding one line for each item whose meaning it changes (`meaning`), and one
// for each item the tool found changed whose domain and range the job knows are the same (`same`: push --same, design
// part 2, section 7, "The insides only"); a later line for the same item takes its place.
function writeMeaning(ctx, n, { meaning: added = [], same: sameAdded = [] }) {
  const had = ctx.gh.comments(ctx.slug, n).find((c) => parseBlock(c.body, MEANING_MARK));
  const was = parseBlock(had?.body, MEANING_MARK)?.data ?? {};
  const held = meaningsOf(was.meaning);
  const heldSame = (Array.isArray(was.same) ? was.same : []).filter((x) => x && typeof x.item === 'string');
  const data = { meaning: [...held.filter((x) => !added.some((y) => y.item === x.item)), ...added] };
  const same = [...heldSame.filter((x) => !sameAdded.some((y) => y.item === x.item)), ...sameAdded];
  if (same.length) data.same = same;
  const body = block(MEANING_MARK, data);
  if (had) ctx.gh.editComment(ctx.slug, had.id, body); else ctx.gh.addComment(ctx.slug, n, body);
}

/**
 * The words given with push's flags, each paired with its flag: --blocked (one reason for all its modules), --meaning
 * and --same (one line each, in turn). From the order the words were given in, where it is known (util.mjs, ORDER);
 * otherwise in this order: the block's reason, the --meaning lines, the --same lines.
 */
function pushLines(a, by, meanings, sames) {
  const order = a[ORDER];
  if (!order) {
    const rest = a._.slice(by ? 1 : 0);
    return { reason: by ? a._[0] : undefined, meaning: rest.slice(0, meanings.length), same: rest.slice(meanings.length, meanings.length + sames.length), extra: rest.length - meanings.length - sames.length };
  }
  const out = { reason: undefined, meaning: [], same: [], extra: 0 };
  const pending = [];
  let blockedSeen = false;
  let word = 0;
  // the command's own words (`push`) come first, and are no longer among the words given
  let skip = order.filter((k) => k === '_').length - a._.length;
  for (const k of order) {
    if (k === '_' && skip > 0) { skip--; continue; }
    if (k === 'blocked') { if (!blockedSeen) pending.push('blocked'); blockedSeen = true; } else if (k === 'meaning' || k === 'same') pending.push(k);
    else if (k === '_') {
      const line = a._[word++];
      const to = pending.shift();
      if (to === 'blocked') out.reason = line; else if (to) out[to].push(line); else out.extra++;
    }
  }
  return out;
}

// 2. push [--blocked <module> "<why>" | --unblocked "<why>"] [--meaning <item> "<was; is now>"]... [--same <item> "<why>"]...
// [--notice-nothing "<why>"]: the current branch to the same-named branch, never forced. --unblocked rewrites the job's
// record when a block ends by ARCH's decision rather than by the blocking module's merge. --meaning (repeated) declares,
// on the branch's pull request, a change of meaning under the same means (design part 2, section 7): each a changed item
// when the pull request merges. --same (repeated) records on it that an item the tool finds changed keeps its domain and
// range, with one line why: that item then tells no one (design part 2, section 7, "The insides only"). --notice-nothing
// [--notice <n>] records, for an open job, that the notices that reached it, up to the block's count now or to the n-th
// it names, need no change: its recorded pass then stands for them (design part 2, section 7, "What a told module
// does"); written in the job's record alone, which the required run reads. First the uses file of each module the push changes, and of a job's own module, is
// rewritten from the code as pushed and committed, so the push carries it (design part 2, section 7; usescmd.mjs). No
// check of the file is made.
export function push(ctx, a) {
  const name = currentBranch(ctx.root);
  const cfg = loadConfig(ctx.root);
  if (!(BRANCH.test(name) || DROP.test(name)) || name === 'main' || name === cfg?.tranche_branch) fail(`${name} is not a working branch; push only job/, work/ and drop/ branches`);
  const by = a.blocked === undefined ? null : blockers(a.blocked);
  if (a.unblocked !== undefined && (by || typeof a.unblocked !== 'string' || !a.unblocked)) fail('say --unblocked "<why>", without --blocked');
  const nothing = a['notice-nothing'];
  if (nothing !== undefined && (typeof nothing !== 'string' || !nothing.trim() || Array.isArray(nothing))) fail('say --notice-nothing "<why>"');
  if (a.notice !== undefined && nothing === undefined) fail('say --notice <n> only with --notice-nothing "<why>"');
  noticeNamed(a.notice);
  const items = a.meaning === undefined ? [] : [].concat(a.meaning);
  const sames = a.same === undefined ? [] : [].concat(a.same);
  const words = pushLines(a, by, items, sames);
  if (by && !words.reason) fail('say --blocked <module> "<why>"');
  const bad = (list, lines) => list.some((x) => x === true || !String(x)) || lines.length !== list.length || lines.some((l) => !String(l ?? '').trim());
  if (bad(items, words.meaning)) fail('say --meaning <item> "<what it was; what it is now>", once for each item');
  if (bad(sames, words.same)) fail('say --same <item> "<why its domain and range are the same>", once for each item');
  if (words.extra > 0) fail('a word is given that no flag takes; say each line with its flag');
  const meaning = items.map((item, i) => ({ item: String(item), line: String(words.meaning[i]).trim() }));
  const same = sames.map((item, i) => ({ item: String(item), why: String(words.same[i]).trim() }));
  writeUsesFiles(ctx, name, { job: name.match(JOB)?.[1] ?? null });
  pushPace(ctx);
  git(['push', '-q', 'origin', `HEAD:refs/heads/${name}`], { cwd: ctx.root });
  ctx.log(`pushed ${git(['rev-parse', 'HEAD'], { cwd: ctx.root })} to ${name}`);
  const prOf2 = (what) => ctx.gh.prForBranch(ctx.slug, name) || fail(`${name} has no open pull request to ${what}`);
  if (a.blocked !== undefined) {
    const pr = prOf2('record the block on');
    writeJobRecord(ctx, pr.number, { blocked: { by: by.length === 1 ? by[0] : by, why: words.reason } });
    ctx.log(`recorded on pull request ${pr.number}: blocked by ${by.join(' and ')}`);
  }
  if (a.unblocked !== undefined) {
    const pr = prOf2('record on');
    writeJobRecord(ctx, pr.number, { unblocked: a.unblocked });
    ctx.log(`recorded on pull request ${pr.number}: going on (${a.unblocked})`);
  }
  if (meaning.length || same.length) {
    const pr = prOf2(meaning.length ? 'declare the change of meaning on' : 'record the same domain and range on');
    writeMeaning(ctx, pr.number, { meaning, same });
    for (const x of meaning) ctx.log(`declared on pull request ${pr.number}: a change of meaning of ${x.item} (${x.line})`);
    for (const x of same) ctx.log(`recorded on pull request ${pr.number}: ${x.item} keeps its domain and range (${x.why}); it tells no one`);
  }
  if (nothing !== undefined) {
    const pr = prOf2('record on');
    recordNoticeNeedsNoChange(ctx, pr.number, nothing.trim(), noticeNamed(a.notice));
  }
  return 0;
}

/** The notice count a job names with --notice <n> (the last notice it read), or null where it names none. */
function noticeNamed(v) {
  if (v === undefined) return null;
  const k = Number(v);
  return Number.isInteger(k) && k > 0 && !Array.isArray(v) ? k : fail('say --notice <n>, the count of the last notice read (the job block\'s notice_seq)');
}

/**
 * An open job's record that the notices that reached it need no change (design part 2, section 7): the job's record's
 * `notice_needs_no_change` { notice_seq, why }, written only in the job's record, the job's own comment; the job block is
 * ARCH's and is never written here (design part 4, sections 4 and 11: one writer for each record). `notice_seq` is the
 * job block's notice count read at the moment of recording, or, where the job names the last notice it read
 * (`--notice <n>`), that count, never above the block's: the record answers the notices up to it and none that comes
 * later, so a notice `notify` adds after the job read its block still needs the job's answer. The required run reads
 * the job's record, and the recorded pass then stands for those notices (testrecord.mjs). Returns the value recorded.
 */
function recordNoticeNeedsNoChange(ctx, n, why, named = null, record = null) {
  const comments = ctx.gh.comments(ctx.slug, n);
  const jb = jobBlockOf(comments);
  if (!jb) fail(`pull request ${n} has no job block: only a job records that a notice needs no change`);
  const seq = noticeSeq(jb.data);
  if (!seq) fail(`no notice has reached the job of pull request ${n}; there is nothing to record`);
  if (named !== null && named > seq) fail(`the job block of pull request ${n} counts ${seq} notice(s); there is no notice ${named}`);
  const value = { notice_seq: named ?? seq, why };
  // `record`, where given, is what the record says beside it (close's nothing_to_change); else it keeps what it says
  writeJobRecord(ctx, n, { ...(record ?? jobRecordOf(comments)?.data ?? {}), notice_needs_no_change: value });
  ctx.log(`recorded on pull request ${n}: the notice(s) that reached the job, to notice ${value.notice_seq}, need no change (${why}); its recorded pass stands for them${value.notice_seq < seq ? `; notice(s) ${value.notice_seq + 1} to ${seq} still need the job's answer` : ''}`);
  return value;
}

// drop --tranche <name>: the tranche's merge into main run the other way, on its own branch
// drop/<name> from the tranche branch's tip. Each file that differs between main and the tranche
// branch and that a module owns (its files or tests, by either branch's module list) goes back to
// main's version, or is deleted where main has none. What stays as the tranche has it: process.json,
// everything under the process folder (the module list, each module's requirements file, the
// decision records) and each lane's folder, by either branch's config. Made without moving the
// session's checkout; opens a draft pull request into the tranche branch, which ARCH marks ready
// and merges with the existing commands.
export function drop(ctx, a) {
  const name = a.tranche;
  if (typeof name !== 'string' || !DROP.test(`drop/${name}`)) fail('say --tranche <name>');
  const head = `drop/${name}`;
  const cfg = needConfig(ctx.root);
  const tranche = cfg.tranche_branch;
  if (!tranche || tranche === 'main') fail(`${CONFIG_FILE} names no tranche branch apart from main`);
  if (git(['ls-remote', '--heads', 'origin', `refs/heads/${head}`], { cwd: ctx.root })) fail(`${head} exists already on origin; nothing made`);
  if (!git(['ls-remote', '--heads', 'origin', `refs/heads/${tranche}`], { cwd: ctx.root })) fail(`the tranche branch ${tranche} that ${CONFIG_FILE} names is not on origin`);
  const tipOf = (b) => { git(['fetch', '-q', 'origin', `refs/heads/${b}`], { cwd: ctx.root }); return git(['rev-parse', 'FETCH_HEAD'], { cwd: ctx.root }); };
  const tip = tipOf(tranche);
  const main = tipOf('main');

  // Both branches' configs and module lists: a module either names owns its files.
  const cfgs = [loadConfig(ctx.root, tip), loadConfig(ctx.root, main)].filter(Boolean);
  const modules = cfgs.flatMap((c, i) => loadModules(ctx.root, c, i === 0 ? tip : main));
  const kept = (f) => f === CONFIG_FILE || cfgs.some((c) => underPath(f, c.process_folder.replace(/\/?$/, '/'))
    || (c.lanes || []).some((l) => typeof l?.folder === 'string' && l.folder && underPath(f, l.folder.replace(/\/?$/, '/')))
    || modules.some((m) => f === requirementsFile(c, m.name)));

  const differs = git(['diff', '--no-renames', '--name-only', '-z', main, tip], { cwd: ctx.root }).split('\0').filter(Boolean);
  // A module's uses file is written from its code (design part 2, section 7): it goes back to main's with that code.
  const usesFile = (f) => cfgs.some((c) => isUsesPath(c, f));
  const files = differs.filter((f) => usesFile(f) || (ownerOf(modules, f) && !kept(f)));
  if (!files.length) fail(`nothing to restore: no file a module owns differs between main and ${tranche}`);

  // main's version of each, into a separate index made from the tranche's tip.
  const wanted = new Set(files);
  const onMain = new Map();
  for (const l of git(['ls-tree', '-r', '-z', main], { cwd: ctx.root }).split('\0').filter(Boolean)) {
    const tab = l.indexOf('\t');
    const path = l.slice(tab + 1);
    if (!wanted.has(path)) continue;
    const [mode, , sha] = l.slice(0, tab).split(' ');
    onMain.set(path, `${mode},${sha},${path}`);
  }
  const dir = mkdtempSync(join(tmpdir(), 'p4-drop-'));
  const env = {
    GIT_INDEX_FILE: join(dir, 'index'),
    GIT_AUTHOR_NAME: 'Claude', GIT_AUTHOR_EMAIL: 'noreply@anthropic.com',
    GIT_COMMITTER_NAME: 'Claude', GIT_COMMITTER_EMAIL: 'noreply@anthropic.com',
  };
  let c;
  try {
    git(['read-tree', tip], { cwd: ctx.root, env });
    for (const f of files) {
      if (onMain.has(f)) git(['update-index', '--add', '--cacheinfo', onMain.get(f)], { cwd: ctx.root, env });
      else git(['update-index', '--force-remove', '--', f], { cwd: ctx.root, env });
    }
    const tree = git(['write-tree'], { cwd: ctx.root, env });
    c = git(['commit-tree', tree, '-p', tip, '-m', `Drop tranche ${name}: module code and tests back to main's`], { cwd: ctx.root, env });
  } finally { rmSync(dir, { recursive: true, force: true }); }
  const restored = files.filter((f) => onMain.has(f)).length;
  const deleted = files.length - restored;
  pushPace(ctx);
  git(['push', '-q', 'origin', `${c}:refs/heads/${head}`], { cwd: ctx.root });
  ctx.log(`${head} made from ${tranche} at ${tip.slice(0, 10)}; its commit is ${c}`);
  const pr = ctx.gh.createPR(ctx.slug, {
    head, base: tranche, title: `Drop tranche ${name}`, draft: true,
    body: `Drops tranche ${name}: each module's code and tests on ${tranche} go back to main's (${restored} file(s) restored, ${deleted} deleted). Requirements files, the module list, ${CONFIG_FILE}, the decision records and the lanes' folders stay as they are. Opened by the Process4 tool.`,
  });
  ctx.log(`pull request ${pr.number}: ${pr.html_url}`);
  ctx.log(`${restored} file(s) restored to main's, ${deleted} deleted`);
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
  const refs = git(['ls-remote', '--heads', 'origin', 'refs/heads/job/*'], { cwd: ctx.root });
  const jobs = refs.split('\n').map((l) => l.split(/\s/)[1]?.replace('refs/heads/', '').match(JOB)).filter((m) => m && m[1] === module);
  const top = jobs.sort((a, b) => Number(b[2]) - Number(a[2]))[0];
  return top ? top[0] : fail(`no branch job/${module}.<n>; make it with branch first`);
}

function printJob(ctx, cfg, pr) {
  ctx.log(`pull request ${pr.number}: ${pr.html_url}`);
  const job = jobBlockOf(ctx.gh.comments(ctx.slug, pr.number));
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
  const here = branchOrNone(ctx.root);
  const name = typeof a.branch === 'string' ? a.branch
    : module && !JOB.test(here || '') ? newestJobBranch(ctx, module)
      : here || fail('the checkout is detached; name the branch with --branch <b>');
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
  const round = records.round?.data || {};
  // Whether the module has had its conversion: a merged job pull request of kind conversion (build text 1b, command 9).
  const prsInto = ctx.gh.allPRs(ctx.slug, base).filter((p) => p.base?.ref === base && JOB.test(p.head?.ref || ''));
  const converted = (m) => hasConverted(prsInto, (k) => jobBlockOf(ctx.gh.comments(ctx.slug, k))?.data || null, m);
  const w = workOf({ requirements: { [module]: readAt(ctx.root, requirementsFile(cfg, module), 'FETCH_HEAD') }, waiting, round, converted }, module);
  const { mine, notices, kind, waits } = w;
  // A conversion's work is the conversion alone; the module's other work waits for its next job.
  const job = { module, work: workLines(w), kind };
  // The items whose meaning the placed work changes, which ARCH names as `meaning` entries in waiting work (design part 2,
  // section 7; build text 5, sections 2 and 5): each a changed item when the job's pull request merges.
  const meaning = meaningsOf(mine.filter((w) => w.kind === 'meaning'));
  if (meaning.length) job.meaning = meaning;
  // Requirements not yet met that the tranche's scope leaves for later are named, so the job knows they are not its work.
  if (waits.length) job.not_this_tranche = waits;
  // Each notice's reasons for this module: from its entry where it carries them, else from the notice comments on its
  // merged pull request (noticecomments.mjs).
  const comments = new Map();
  if (notices.length) job.uses = notices.flatMap((w) => noticeReasons(ctx.gh, ctx.slug, w, comments));
  // The notices the job carries, by provider and merged pull request, so a re-run of notify knows it has them (no repeats).
  if (notices.length) job.notices = notices.map((w) => ({ from: w.from, merged: Number(w.merged) }));
  const n = Number(name.match(JOB)[2]);
  const pr = ctx.gh.createPR(ctx.slug, { head: name, base, title: `${module}: job ${n}`, body: `The job for ${module}. Its work is in the job block below.`, draft: true });
  ctx.gh.addComment(ctx.slug, pr.number, block(JOB_MARK, job));
  if (mine.length) {
    writeRecord(ctx.gh, ctx.slug, issue, records, 'waiting-work', { ...records['waiting-work'].data, work: waiting.filter((w) => w.module !== module) });
  }
  printJob(ctx, cfg, pr);
  return 0;
}

// 4. ready <pr>: marks ready only where the test record stands for the head commit, or where nothing needs a record:
// the scope, judged as the required run's verdict judges it, is nothing and no notice has reached the job. Otherwise
// marks nothing and says why. In the process repository every pull request is into main: its scope is nothing.
export function ready(ctx, n) {
  const before = ctx.gh.getPR(ctx.slug, n) || fail(`there is no pull request ${n}`);
  // Nothing to mark: said plainly, ending ok (build text 1b, command 4).
  if (before.merged_at) { ctx.log(`pull request ${n} is merged; there is nothing to mark ready`); return 0; }
  if (before.state === 'closed') { ctx.log(`pull request ${n} is closed; there is nothing to mark ready`); return 0; }
  if (before.draft === false) { ctx.log(`pull request ${n} is ready already; nothing marked`); return 0; }
  const { jobBlock, jobRecord, record } = recordsOf(ctx, n);
  const st = recordStands(record?.data, before.head.sha, jobBlock, { usesOnly: usesOnly(ctx.root, before.head.ref), jobRecord });
  if (st.ok) ctx.log(st.why);
  else {
    const need = recordNeed(scopeForPR(ctx, before, { jobBlock, related: false }), jobBlock, jobRecord);
    if (need.needed) fail(`not marked ready: ${st.why} (${need.why})`);
    ctx.log(`no test record needed: ${need.why}`);
  }
  ctx.gh.markReady(ctx.slug, n);
  const pr = ctx.gh.getPR(ctx.slug, n);
  if (pr.draft) fail(`pull request ${n} is still a draft`);
  ctx.log(`pull request ${n} is ${pr.state} and ready; the required run ${requiredCheck(ctx.root)} has been asked for`);
  if (jobBlock?.kind === 'conversion') conversionReport(ctx, pr, jobBlock.module);
  return 0;
}

export const CONVERSION_MARK = 'process4-conversion';

/**
 * The conversion's report (build text 1b, command 4; build text 5, section 5), written once a conversion job is marked
 * ready, for the owner's review, and rewritten in place: from the module's uses file at the head, and from the base as
 * `uses` reads it, the places outside the standard gone, by rule; the copies; the places still outside, with what each waits
 * on; the time from the pull request's opening to `ready`; and the cost, "unmeasured" where it cannot be read.
 */
function conversionReport(ctx, pr, module) {
  const at = (ref) => { const f = git(['fetch', '-q', 'origin', ref], { cwd: ctx.root, allowFail: true }); return f.code === 0 ? git(['rev-parse', 'FETCH_HEAD'], { cwd: ctx.root }) : null; };
  const baseSha = at(`refs/heads/${pr.base.ref}`);
  const headSha = at(`refs/heads/${pr.head.ref}`) ?? pr.head.sha;
  const cfg = loadConfig(ctx.root, headSha) ?? loadConfig(ctx.root);
  const head = readUses(ctx.root, module, { cfg, ref: headSha });
  // The base, read as `uses` reads it: the module's code there, under the coding standard (usescmd.mjs).
  let base = null;
  if (baseSha) {
    const tmp = mkdtempSync(join(tmpdir(), 'p4-conversion-'));
    try {
      const tree = loadTree(writeOut(ctx.root, baseSha, tmp));
      if (tree.byId.has(module)) base = usesReading(tree, module, baseSha).data;
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
  const count = (u) => { const c = {}; for (const o of u?.outside ?? []) c[o.rule ?? '?'] = (c[o.rule ?? '?'] ?? 0) + 1; return c; };
  const was = count(base), now = count(head);
  const converted = {};
  for (const [rule, k] of Object.entries(was)) if (k > (now[rule] ?? 0)) converted[rule] = k - (now[rule] ?? 0);
  const mins = Math.max(0, Math.round((ctx.nowMs() - Date.parse(pr.created_at ?? new Date(ctx.nowMs()).toISOString())) / 60000));
  const data = {
    converted: base ? converted : 'unknown: the base could not be read',
    copies: (head?.copies ?? []).map((c) => `${c.file}${c.line ? `:${c.line}` : ''}${c.pointer ? ` ${c.pointer}` : ''} ${c.provider ? `${c.provider} ` : ''}${c.item ?? ''}`.trim()),
    waits: (head?.outside ?? []).map((o) => `${o.rule ?? '?'} ${o.file}:${o.line ?? ''}: ${o.waitsOn ?? 'nothing named'}`),
    time: `${Math.floor(mins / 60)}h ${mins % 60}m`,
    cost: 'unmeasured',
  };
  if (!head) data.note = `the head holds no uses file of ${module} that can be read`;
  const body = block(CONVERSION_MARK, data);
  const had = ctx.gh.comments(ctx.slug, pr.number).find((c) => parseBlock(c.body, CONVERSION_MARK));
  if (had) ctx.gh.editComment(ctx.slug, had.id, body); else ctx.gh.addComment(ctx.slug, pr.number, body);
  ctx.log(`the conversion's report is written on pull request ${pr.number}: ${Object.entries(converted).map(([r, k]) => `${r} ${k}`).join(', ') || 'no place converted'}; ${data.waits.length} place(s) still outside`);
}

// 14. results <pr>: the test record's standing, then the required run's state on the head commit.
export function results(ctx, n) {
  const pr = ctx.gh.getPR(ctx.slug, n);
  const { jobBlock, jobRecord, record } = recordsOf(ctx, n);
  const st = recordStands(record?.data, pr.head.sha, jobBlock, { usesOnly: usesOnly(ctx.root, pr.head.ref), jobRecord });
  // Where there is no record, say whether one is needed, as `ready` judges it (recordNeed).
  let none = null;
  if (!record) {
    try { const need = recordNeed(scopeForPR(ctx, pr, { jobBlock, related: false }), jobBlock, jobRecord); if (!need.needed) none = need.why; } catch { /* say only what the record says */ }
  }
  if (none) ctx.log(`test record: none needed: ${none}`);
  else ctx.log(`test record: ${st.ok ? 'stands' : 'does not stand'}: ${st.why}`);
  const d = record?.data;
  if (d) ctx.log(`  ${d.result} at ${String(d.commit).slice(0, 10)}: ${d.passed} passed, ${d.failed} failed, scope ${d.scope}, notice ${d.notice_seq}, ${d.fails_total} failed run(s) in all, written ${d.written}`);
  const required = requiredCheck(ctx.root);
  const runs = ctx.gh.checkRuns(ctx.slug, pr.head.sha, required).sort((x, y) => String(y.started_at).localeCompare(String(x.started_at)));
  // A run cancelled by a newer one (`ready` cancels the draft's) is not the result. Where every
  // run so far was cancelled, the newer one has not yet made its check: waiting (fault k).
  const r = runs.find((x) => !CANCELLED.includes(x.conclusion));
  if (!r && runs.length) { ctx.log(`waiting: ${required} on ${pr.head.sha.slice(0, 10)} has no run that was not cancelled yet (newest: ${runs[0].html_url})`); return 0; }
  if (!r || r.status !== 'completed') { ctx.log(`waiting: ${required} on ${pr.head.sha.slice(0, 10)} ${r ? `is ${r.status}: ${r.html_url}` : 'has not started'}`); return 0; }
  if (r.conclusion === 'success') { ctx.log(`passed: ${required} on ${pr.head.sha.slice(0, 10)}: ${r.html_url}`); return 0; }
  ctx.log(`failed (${r.conclusion}): ${required} on ${pr.head.sha.slice(0, 10)}: ${r.html_url}`);
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

// A job's merge waits for the modules it uses (design part 2, section 8; build text 1b, command 6). First its tests must
// stand after every notice that reached it: refused (exit 1) when a notice came after they ran. Then the modules it
// uses, directly or through others, earlier in the order, read at the tranche branch's newest commit and at the job's
// head commit (the union): each with an open job that is not blocked holds it. Returns the jobs it waits for, as lines.
function jobWaits(ctx, pr, module) {
  const { jobBlock, jobRecord, record } = recordsOf(ctx, pr.number);
  if (noticeAfterTests(record?.data, jobBlock, jobRecord)) fail(`a notice reached ${module}'s job after its tests ran; it must run p4 test again`);
  const issue = findIssue(ctx.gh, ctx.slug);
  const view = readView(ctx, { records: issue ? readAll(ctx.gh, ctx.slug, issue) : {} });
  if (!view.modules.some((m) => m.name === module)) return [];
  const tip = git(['rev-parse', 'FETCH_HEAD'], { cwd: ctx.root });
  // The job's head commit too: a use the job adds holds it as well. Fetched by its branch where it is not here.
  const has = (sha) => /^[0-9a-f]{40}$/.test(sha || '') && git(['cat-file', '-e', `${sha}^{commit}`], { cwd: ctx.root, allowFail: true }).code === 0;
  let head = pr.head?.sha;
  if (!has(head)) {
    const f = git(['fetch', '-q', 'origin', `refs/heads/${pr.head.ref}`], { cwd: ctx.root, allowFail: true });
    head = has(head) ? head : f.code === 0 ? git(['rev-parse', 'FETCH_HEAD'], { cwd: ctx.root }) : null;
    if (!head) ctx.log(`note: could not fetch ${pr.head.ref}; the uses are read at ${pr.base.ref}'s newest commit only`);
  }
  const lines = [];
  for (const u of earlierUsesAt(ctx.root, head ? [tip, head] : [tip], module)) {
    const open = openJob(view, u.module);
    if (open && open.number !== pr.number && !isBlocked(view, u.module, open)) lines.push(`waits for ${u.module} (pull request ${open.number})`);
  }
  return lines;
}

// 6. merge <pr>: the owner's hold; for a job, its tests after every notice and the modules it uses; then one merge
// commit guarded by the head commit id.
export function merge(ctx, n) {
  const pr = ctx.gh.getPR(ctx.slug, n) || fail(`there is no pull request ${n}`);
  const held = notesInForce(ctx).find((x) => x.kind === 'held-merge' && Number(x.pull_request) === n);
  if (held) { ctx.log(`held: the owner holds pull request ${n} ("${held.words}"); not merged`); return 0; }
  const module = pr.head?.ref?.match(JOB)?.[1];
  if (module) {
    const waits = jobWaits(ctx, pr, module);
    if (waits.length) {
      for (const l of waits) ctx.log(l);
      ctx.log(`pull request ${n} not merged: ${module} uses ${waits.length === 1 ? 'a module whose job is' : 'modules whose jobs are'} open; merge it once ${waits.length === 1 ? 'that job has' : 'those have'} merged`);
      return 0;
    }
  }
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

// 5. close <pr> [--nothing-to-change "<why>"]: with the flag, first the job's record. A told job that finds nothing to
// change in its code (design part 2, section 7, "What a told module does") runs no test. Its uses file is rewritten from
// the code here and pushed where it changed. Where the job declared on its pull request an item of its own that changes
// with the provider's (push --meaning: a value computed from the changed item, or its bound handed back), or its uses file
// differs from its base's, the pull request is marked ready with no test (its scope is nothing, and the job's record says
// it found nothing to change and the notices need no change; ARCH merges it as any, and `notify` on that merge tells the
// declared items' users); otherwise it is closed unmerged. Only the job's record is written: the job block is ARCH's.
export function close(ctx, n, a) {
  const why = a['nothing-to-change'];
  if (why !== undefined && (typeof why !== 'string' || !why.trim())) fail('say --nothing-to-change "<why>"');
  const pr = ctx.gh.getPR(ctx.slug, n) || fail(`there is no pull request ${n}`);
  if (pr.state !== 'open') fail(`pull request ${n} is ${pr.merged_at ? 'merged' : pr.state} already`);
  if (why !== undefined) {
    const comments = ctx.gh.comments(ctx.slug, n);
    const jb = jobBlockOf(comments);
    if (jb && noticeSeq(jb.data)) recordNoticeNeedsNoChange(ctx, n, why.trim(), null, { nothing_to_change: why });
    else writeJobRecord(ctx, n, { nothing_to_change: why });
    ctx.log(`recorded on pull request ${n}: nothing to change`);
    const module = pr.head?.ref?.match(JOB)?.[1];
    const declared = meaningsOf(comments.map((c) => parseBlock(c.body, MEANING_MARK)?.data).find(Boolean)?.meaning);
    const usesDiffer = !!module && usesFileDiffers(ctx, pr, module);
    if (module && (usesDiffer || declared.length)) {
      if (declared.length) ctx.log(`pull request ${n} declares ${declared.map((x) => x.item).join(', ')} of ${module} changed with its provider: it merges, with no test, and its merge tells their users`);
      if (usesDiffer) ctx.log(`the uses file of ${module} differs from ${pr.base.ref}'s: pull request ${n} merges, with no test`);
      return ready(ctx, n);
    }
  }
  ctx.gh.closePR(ctx.slug, n);
  ctx.log(`closed pull request ${n} unmerged`);
  return 0;
}

/**
 * For close --nothing-to-change: rewrites the module's uses file from the code in this checkout, where it is at the
 * pull request's branch, and pushes it where it changed; then whether the branch differs from its base in that file.
 */
function usesFileDiffers(ctx, pr, module) {
  const here = branchOrNone(ctx.root);
  if (here === pr.head.ref) {
    if (writeUsesFiles(ctx, here, { job: module }).length) {
      pushPace(ctx);
      git(['push', '-q', 'origin', `HEAD:refs/heads/${here}`], { cwd: ctx.root });
      ctx.log(`pushed ${git(['rev-parse', 'HEAD'], { cwd: ctx.root })} to ${here}, with the rewritten uses file of ${module}`);
    }
  } else ctx.log(`note: the checkout is not at ${pr.head.ref}; the uses file is read as the branch holds it`);
  const tip = (ref) => { const f = git(['fetch', '-q', 'origin', `refs/heads/${ref}`], { cwd: ctx.root, allowFail: true }); return f.code === 0 ? git(['rev-parse', 'FETCH_HEAD'], { cwd: ctx.root }) : null; };
  const head = tip(pr.head.ref), base = tip(pr.base.ref);
  if (!head || !base) return false;
  const mb = git(['merge-base', base, head], { cwd: ctx.root, allowFail: true });
  if (mb.code !== 0) return false;
  const cfg = loadConfig(ctx.root, head) ?? loadConfig(ctx.root);
  if (!cfg) return false;
  return !!git(['diff', '--name-only', mb.stdout.trim(), head, '--', usesPath(cfg, module)], { cwd: ctx.root });
}

// 9. next-job: one job for each call. Rewrites the round record and prints what open needs.
export function nextJob(ctx) {
  const { issue, records } = readRecords(ctx.gh, ctx.slug);
  const view = readView(ctx, { records });
  const states = moduleStates(view);
  const s = slots(view, states);
  const { pick, above, why, later, latest } = chooseNext(view, states, s);
  const write = (modules) => writeRecord(ctx.gh, ctx.slug, issue, records, 'round', { ...view.round, modules });
  const wait = () => { if (later.length) ctx.log(`waiting their turn (after ${latest ? `${latest.module}, the latest running job` : 'no running job'}): ${later.join(', ')}, each with a notice waiting`); };
  if (why === 'none ready') { write(states); ctx.log(`none ready; slots in use ${s.inUse} of ${s.share}`); return 0; }
  if (!pick) { write(states); ctx.log(`no free slot: ${s.inUse} in use of ${s.share}, from ${s.from}`); wait(); return 0; }
  let entry;
  if (pick.ready_again) {
    const pr = view.prs.find((p) => p.number === pick.pull_request);
    const b = view.jobRecord(pr.number);
    entry = { module: pick.module, state: 'open', pull_request: pr.number, restarted: b.at };
    ctx.log(`module: ${pick.module}`);
    const names = [].concat(b.blocked.by).join(' and ');
    ctx.log(`branch: ${pr.head.ref} (its job is ready again: the block by ${names} ended when ${names} merged)`);
    ctx.log(`work: as its job block on pull request ${pr.number} says`);
    ctx.log(`kind: ${view.jobBlock(pr.number)?.kind || 'ordinary'}`);
    ctx.log(`then: open --branch ${pr.head.ref} prints its starting instructions`);
  } else {
    const w = workOf(view, pick.module);
    const name = nextJobName(view, pick.module);
    entry = { module: pick.module, state: 'open', pull_request: null, branch: name };
    ctx.log(`module: ${pick.module}`);
    ctx.log(`branch: ${name}`);
    ctx.log(`work: ${workLines(w).join('; ')}${w.conversion && (w.later.reqs.length || w.later.mine.length) ? ` (its other work waits for its next job: ${[...w.later.reqs, ...w.later.mine.map(describe)].join('; ')})` : ''}`);
    ctx.log(`kind: ${w.kind}`);
    ctx.log(`then: branch ${name}; open --module ${pick.module} prints its starting instructions`);
  }
  write(states.map((x) => (x.module === pick.module ? entry : x)));
  if (above) ctx.log(above);
  ctx.log(`slots in use ${s.inUse + 1} of ${s.share}`);
  if (above) wait();
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

// Resolves "latest": the newest commit of the process repository's main branch (the version a move to
// latest adopts), read by git from the address process.json already names. Read-only; prints the commit
// and whether it differs from the pinned one. ARCH uses it so a version move needs no commit id (build
// text 1b, command 25).
export function latestVersion(ctx) {
  const cfg = needConfig(ctx.root);
  const repo = cfg.process?.repository;
  if (!repo) fail('process.json must name process.repository');
  const r = git(['ls-remote', repo, 'refs/heads/main'], { cwd: ctx.root, allowFail: true });
  if (r.code !== 0) fail(`could not read the process repository's main: ${r.stderr.trim()}`);
  const commit = (r.stdout.split('\n').find((l) => l.trim()) || '').split(/\s+/)[0];
  if (!/^[0-9a-f]{40}$/.test(commit)) fail("could not read the process repository's latest main commit");
  ctx.log(commit);
  ctx.log(commit === cfg.process.commit ? 'already the pinned version' : `newer than the pinned ${cfg.process.commit}`);
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

// 15. failed-runs <pr>: the failed test runs on the pull request, from its test record's fails_total, with no reset.
export function failedRunsCmd(ctx, n) {
  const pr = ctx.gh.getPR(ctx.slug, n) || fail(`there is no pull request ${n}`);
  const d = recordsOf(ctx, n).record?.data;
  const failed = Number(d?.fails_total) || 0;
  ctx.log(`${failed} failed test run(s) on pull request ${n}, from its test record${d ? ` (the last: ${d.result} at ${String(d.commit).slice(0, 10)}, written ${d.written})` : ' (none written yet)'}`);
  const module = pr.head.ref.match(JOB)?.[1] || pr.head.ref;
  if (failed === 3) ctx.log(`for ARCH: two corrections of ${module} have failed; replace its session with a fresh one, which first works out why the corrections were made`);
  if (failed >= 5) ctx.log(`for ARCH: the replacement of ${module} has also failed twice; record ${module} blocked with the reason, free its slot, and take it as a design question`);
  return 0;
}

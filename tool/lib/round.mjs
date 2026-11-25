// A round's jobs (stage 3): who takes a free slot, when a module's work is finished, when a
// round's jobs are done, and the count of failed runs (design part 2, sections 3 to 5; part 4,
// section 10; build text 1b, section 4; build text 5, sections 2, 3 and 5). Everything is
// worked out afresh from GitHub's record of pull requests and the shared state.
import { loadModules, needConfig, notYetMet, readAt, requirementsFile } from './config.mjs';
import { parseBlock } from './github.mjs';
import { liveNotes } from './state.mjs';
import { fail, git } from './util.mjs';

export const JOB_MARK = 'process4-job';
export const RECORD_MARK = 'process4-job-record';
// A job's branch is job/<module>.<n>: one flat name under job/, so it never meets a branch named job/<module>
// that a product kept from an earlier process. The earlier form job/<module>/<n> is still read as a job's.
export const JOB = /^job\/([a-z0-9-]+)[./](\d+)$/;
export const jobBranch = (module, n) => `job/${module}.${n}`;
export const REQUIRED = 'module-tests';

/** A pull request's job block among its comments, the first marked <!-- process4-job --> (build text 5, section 5): { data, words, comment }, or null. */
export function jobBlockOf(comments) {
  for (const c of comments || []) {
    const b = parseBlock(c.body, JOB_MARK);
    if (b) return { ...b, comment: c };
  }
  return null;
}

const jobOf = (pr) => {
  const m = (pr.head?.ref || '').match(JOB);
  return m ? { module: m[1], n: Number(m[2]) } : null;
};

/**
 * A change of meaning under the same means (design part 2, section 7), as ARCH names it in the work it places and the
 * job declares it in its pull request: one line `[<module> ]<item> | <what it was> | <what it is now>`, the module
 * left out where it is the job's own. Returns { module, item, was, is }.
 */
export function parseMeaning(text, defaultModule = null) {
  const parts = String(text ?? '').split('|').map((x) => x.trim());
  if (parts.length !== 3 || !parts[0]) fail(`say a change of meaning as "[<module> ]<item> | <what it was> | <what it is now>": ${text}`);
  const head = parts[0].split(/\s+/);
  if (head.length > 2) fail(`a change of meaning names one item: ${parts[0]}`);
  const [module, item] = head.length === 2 ? head : [defaultModule, head[0]];
  if (!module) fail(`name the module of ${item}: "<module> ${item} | <what it was> | <what it is now>"`);
  return { module, item, was: parts[1], is: parts[2] };
}

/** The changes of meaning a job block or a job's record holds ({ module?, item, was, is } each), the job's module where none is named. */
export const meaningsOf = (list, defaultModule = null) => (Array.isArray(list) ? list : [])
  .filter((x) => x && typeof x.item === 'string' && (x.module || defaultModule))
  .map((x) => ({ module: x.module || defaultModule, item: x.item, was: x.was ?? '', is: x.is ?? '' }));

export const describe = (w) => (w.kind === 'notice' ? `notice from ${w.from} (pull request ${w.merged})`
  : w.kind === 'walk-flaw' ? `walk flaw ${w.flaw} ${w.link}` : `flaw from ${w.from}: ${w.words}`);

// The tranche's scope (design part 2, section 3, point 1; build text 5, section 2): ARCH writes in the round record
// `"scope": { "tranche": "<the round's tranche>", "holds": ["<module> R<n>", "<module>", ...] }`. While the round record
// names that tranche, a requirement not yet met is work only where the scope names it, or names its whole module; every
// other requirement waits until the tranche ends. Notices, walk flaws and flaws a job reports are always work. No scope,
// or one written for another tranche, means every requirement, as before.
export function scopeOf(round) {
  const s = round?.scope;
  if (!s || !Array.isArray(s.holds) || !round.tranche || s.tranche !== round.tranche) return null;
  return new Set(s.holds.map((x) => String(x).trim().replace(/\s+/g, ' ')));
}
const inScope = (holds, module, r) => !holds || holds.has(module) || holds.has(`${module} ${r}`);

// The work a module has now: requirements not yet met at the tranche branch's newest commit, within the tranche's scope,
// and what waits for it in the waiting-work record. A told job's kind when notices are all. `waits` holds the
// requirements not yet met that the scope leaves for a later tranche.
export function workOf(view, module) {
  const holds = scopeOf(view.round);
  const all = notYetMet(view.requirements[module]);
  const reqs = all.filter((r) => inScope(holds, module, r));
  const waits = all.filter((r) => !inScope(holds, module, r));
  const mine = view.waiting.filter((w) => w.module === module);
  const notices = mine.filter((w) => w.kind === 'notice');
  const kind = notices.length && notices.length === mine.length && !reqs.length ? 'told' : 'ordinary';
  return { reqs, mine, notices, kind, waits, any: reqs.length + mine.length > 0 };
}

// Everything the round's commands read, in one place. `ctx` is the commands' context.
export function readView(ctx, { records } = {}) {
  const cfg = needConfig(ctx.root);
  const base = cfg.tranche_branch;
  git(['fetch', '-q', 'origin', `refs/heads/${base}`], { cwd: ctx.root });
  const modules = loadModules(ctx.root, cfg, 'FETCH_HEAD');
  const requirements = Object.fromEntries(modules.map((m) => [m.name, readAt(ctx.root, requirementsFile(cfg, m.name), 'FETCH_HEAD')]));
  const prs = ctx.gh.allPRs(ctx.slug, base).filter((p) => jobOf(p));
  const merged = prs.filter((p) => p.merged_at).map((p) => ({ module: jobOf(p).module, merged_at: p.merged_at }));
  const recs = records || {};
  const round = recs.round?.data || {};
  const notesData = recs['standing-notes']?.data;
  const ends = { mergedJobs: merged.map((m) => ({ ...m, merged_at: m.merged_at.replace(/:\d\dZ$/, 'Z') })), round };
  const comments = {};
  const commentsOf = (n) => (comments[n] ||= ctx.gh.comments(ctx.slug, n));
  return {
    cfg, base, modules, requirements, prs, merged, round, records: recs,
    waiting: recs['waiting-work']?.data?.work || [],
    notes: liveNotes(notesData, ends),
    jobBlock: (n) => jobBlockOf(commentsOf(n))?.data || null,
    jobRecord: (n) => {
      const c = commentsOf(n).find((x) => parseBlock(x.body, RECORD_MARK));
      return c ? { ...parseBlock(c.body, RECORD_MARK).data, at: c.updated_at || c.created_at || '' } : null;
    },
  };
}

// A module's job pull requests, the newest job first.
const jobsOf = (view, module) => view.prs.filter((p) => jobOf(p).module === module).sort((a, b) => jobOf(b).n - jobOf(a).n);
export const openJob = (view, module) => jobsOf(view, module).find((p) => p.state === 'open') || null;

// A job's blocked record holds until a job of the blocking module merges after it was written
// (build text 5, section 5). Returns null (no block), { holds: true, ... } or { holds: false, ... }.
export function blockOf(view, pr) {
  const rec = view.jobRecord(pr.number);
  if (!rec?.blocked) return null;
  // A job blocked by several modules is ready again once each of them has merged after the block.
  const by = [].concat(rec.blocked.by);
  const ended = by.every((name) => view.merged.some((m) => m.module === name && Date.parse(m.merged_at) > Date.parse(rec.at)));
  return { by: by.length === 1 ? by[0] : by, why: rec.blocked.why, at: rec.at, holds: !ended };
}

const entryOf = (view, module) => (view.round.modules || []).find((e) => e.module === module) || null;

// A blocked job whose block has ended is ready again until next-job hands it out once.
function readyAgain(view, module, pr) {
  const b = blockOf(view, pr);
  return !!b && !b.holds && entryOf(view, module)?.restarted !== b.at;
}

// Recorded blocked in the round by ARCH (the fifth failed run), with no record of the job's own.
const archBlocked = (view, module, pr) => {
  const e = entryOf(view, module);
  return e?.state === 'blocked' && !view.jobRecord(pr.number)?.blocked ? e : null;
};

// Whether a module's open job is blocked, and so holds no one: its own blocked record holds, or ARCH recorded it blocked.
export const isBlocked = (view, module, pr) => !!blockOf(view, pr)?.holds || !!archBlocked(view, module, pr);

// 12. Whether a module's work is finished, with the ground.
export function finished(view, module) {
  const jobs = jobsOf(view, module);
  const last = jobs[0];
  if (!last) {
    // A module with no job and no work now (the tranche's scope leaves its requirements for later) has nothing to finish.
    const w0 = workOf(view, module);
    return w0.any ? { finished: false, why: 'no job yet' } : { finished: true, why: `no work in this tranche${w0.waits.length ? ` (${w0.waits.join(', ')} wait for a later tranche)` : ''}` };
  }
  if (last.state === 'open') return { finished: false, why: `its job is open: pull request ${last.number}` };
  let why;
  if (last.merged_at) why = `pull request ${last.number} merged`;
  else {
    const rec = view.jobRecord(last.number);
    if (!rec?.nothing_to_change) return { finished: false, why: `pull request ${last.number} closed unmerged with no nothing-to-change record` };
    // A job that finds nothing in the module needs changing and closes unmerged finishes the
    // module: a notice-only told job, or one handing a walk flaw or job-reported flaw back to
    // ARCH (design part 2 §4). An unmet requirement is not cleared this way: the workOf check
    // below keeps such a module unfinished.
    why = `pull request ${last.number} closed with nothing to change: ${rec.nothing_to_change}`;
  }
  const w = workOf(view, module);
  if (w.any) return { finished: false, why: `${why}, but it has work again: ${[...w.reqs, ...w.mine.map(describe)].join('; ')}` };
  return { finished: true, why };
}

// The state of each module of the round, worked out afresh: the round's entries, every module
// with work now, and every module with an open job.
export function moduleStates(view) {
  const names = new Set((view.round.modules || []).map((e) => e.module));
  for (const m of view.modules) if (workOf(view, m.name).any || openJob(view, m.name)) names.add(m.name);
  const order = new Map(view.modules.map((m) => [m.name, m.order]));
  const out = [];
  for (const module of [...names].sort((a, b) => (order.get(a) ?? 1e9) - (order.get(b) ?? 1e9))) {
    const prev = entryOf(view, module) || {};
    const pr = openJob(view, module);
    const keep = prev.restarted ? { restarted: prev.restarted } : {};
    if (pr) {
      const b = blockOf(view, pr);
      const arch = archBlocked(view, module, pr);
      if (b?.holds) out.push({ module, state: 'blocked', pull_request: pr.number, by: b.by, why: b.why, ...keep });
      else if (b && readyAgain(view, module, pr)) out.push({ module, state: 'has work', pull_request: pr.number, ready_again: true, ...keep });
      else if (arch) out.push({ ...arch });
      else out.push({ module, state: 'open', pull_request: pr.number, ...keep });
    } else {
      const f = finished(view, module);
      out.push(f.finished ? { module, state: 'finished', why: f.why } : { module, state: 'has work', why: f.why });
    }
  }
  return out;
}

// Slots in use: open job pull requests not blocked (nor blocked and waiting to be handed out
// again), plus the live walking sessions of the round record (build text 5, section 2).
export function slots(view, states) {
  const note = view.notes.filter((n) => n.kind === 'slot-number').sort((a, b) => String(b.written).localeCompare(String(a.written)))[0];
  const share = note ? Number(note.number) : Number(view.cfg.slots?.share ?? view.cfg.slots?.default ?? 8);
  const jobs = states.filter((s) => s.state === 'open').length;
  const walkers = (view.round.walks || []).flatMap((w) => w.sessions || []).filter((s) => s.live).length;
  return { share, inUse: jobs + walkers, from: note ? `the owner's slot number (${note.words || note.number})` : 'process.json' };
}

// 9. The ready modules, ranked: any module the owner put first, then the earliest in order.
function rankReady(view, states) {
  const ready = states.filter((s) => s.state === 'has work' && (s.ready_again || workOf(view, s.module).any));
  const order = new Map(view.modules.map((m) => [m.name, m.order]));
  const first = view.notes.filter((n) => n.kind === 'module-first').map((n) => n.module);
  const rank = (s) => (first.includes(s.module) ? first.indexOf(s.module) - 1e6 : order.get(s.module) ?? 1e9);
  return ready.sort((a, b) => rank(a) - rank(b));
}

// 9. The next job, with the slots (design part 2, section 5; build text 1b, command 9). New work starts, the ranked first,
// only while the slots in use are below the slot number. Above it, only a told start: a module with a notice waiting
// for it and no open job, earlier in the order than the latest running (open, not blocked) job's module, starts at
// once; a later one waits its turn. Returns { pick, above, why, later }: `pick` null with `why` 'none ready' or
// 'no free slot'; `above` the ground of a told start above the slot number; `later` the told modules that wait.
export function chooseNext(view, states, s) {
  const ready = rankReady(view, states);
  if (!ready.length) return { pick: null, why: 'none ready', later: [] };
  if (s.inUse < s.share) return { pick: ready[0], later: [] };
  const order = new Map(view.modules.map((m) => [m.name, m.order]));
  const latest = states.filter((x) => x.state === 'open').sort((a, b) => (order.get(b.module) ?? 0) - (order.get(a.module) ?? 0))[0];
  const notice = (m) => view.waiting.find((w) => w.module === m && w.kind === 'notice');
  const told = ready.filter((x) => !x.ready_again && !x.pull_request && notice(x.module));
  const earlier = latest ? told.filter((x) => (order.get(x.module) ?? 1e9) < (order.get(latest.module) ?? 0)) : [];
  const later = told.filter((x) => !earlier.includes(x)).map((x) => x.module);
  if (!earlier.length) return { pick: null, why: 'no free slot', later, latest };
  const pick = earlier[0];
  const w = notice(pick.module);
  return {
    pick, later, latest,
    above: `${pick.module} starts above the slot number (${s.inUse} in use of ${s.share}): a notice from ${w.from} (pull request ${w.merged}) waits for it, and it comes before ${latest.module} (pull request ${latest.pull_request}), the latest running job`,
  };
}

export function nextJobName(view, module) {
  const ns = jobsOf(view, module).map((p) => jobOf(p).n);
  return jobBranch(module, Math.max(ns.length, ...ns, 0) + 1);
}

// 13. Whether the round's jobs are done (design part 2, section 4).
export function roundDone(view, states) {
  const clearable = (by) => [].concat(by || []).some((one) => states.some((s) => s.module === one && (s.state === 'open' || s.state === 'has work')));
  const lines = states.map((s) => {
    if (s.state === 'finished') return { done: true, line: `${s.module}: finished (${s.why})` };
    if (s.state === 'blocked') {
      const by = s.by ? ` by ${[].concat(s.by).join(' and ')}` : '';
      return clearable(s.by)
        ? { done: false, line: `${s.module}: blocked${by}, which an open job of the round can clear: ${s.why}` }
        : { done: true, line: `${s.module}: blocked${by}, carried into the next round: ${s.why}` };
    }
    if (s.state === 'open') return { done: false, line: `${s.module}: open, pull request ${s.pull_request}` };
    return { done: false, line: `${s.module}: has work${s.ready_again ? ', its block ended; ready again' : ''}${s.why ? ` (${s.why})` : ''}` };
  });
  return { done: lines.every((l) => l.done), lines: lines.map((l) => l.line) };
}

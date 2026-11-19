// A round's jobs (stage 3): who takes a free slot, when a module's work is finished, when a
// round's jobs are done, and the count of failed runs (design part 2, sections 3 to 5; part 4,
// section 10; build text 1b, section 4; build text 5, sections 2, 3 and 5). Everything is
// worked out afresh from GitHub's record of pull requests and the shared state.
import { loadModules, needConfig, notYetMet, readAt, requirementsFile } from './config.mjs';
import { parseBlock } from './github.mjs';
import { liveNotes } from './state.mjs';
import { git } from './util.mjs';

export const JOB_MARK = 'process4-job';
export const RECORD_MARK = 'process4-job-record';
export const JOB = /^job\/([a-z0-9-]+)\/(\d+)$/;
export const REQUIRED = 'module-tests';

const jobOf = (pr) => {
  const m = (pr.head?.ref || '').match(JOB);
  return m ? { module: m[1], n: Number(m[2]) } : null;
};

export const describe = (w) => (w.kind === 'notice' ? `notice from ${w.from} (pull request ${w.merged})`
  : w.kind === 'walk-flaw' ? `walk flaw ${w.flaw} ${w.link}` : `flaw from ${w.from}: ${w.words}`);

// The work a module has now: requirements not yet met at the tranche branch's newest commit,
// and what waits for it in the waiting-work record. A told job's kind when notices are all.
export function workOf(view, module) {
  const reqs = notYetMet(view.requirements[module]);
  const mine = view.waiting.filter((w) => w.module === module);
  const notices = mine.filter((w) => w.kind === 'notice');
  const kind = notices.length && notices.length === mine.length && !reqs.length ? 'told' : 'ordinary';
  return { reqs, mine, notices, kind, any: reqs.length + mine.length > 0 };
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
    jobBlock: (n) => commentsOf(n).map((c) => parseBlock(c.body, JOB_MARK)).find(Boolean)?.data || null,
    jobRecord: (n) => {
      const c = commentsOf(n).find((x) => parseBlock(x.body, RECORD_MARK));
      return c ? { ...parseBlock(c.body, RECORD_MARK).data, at: c.updated_at || c.created_at || '' } : null;
    },
  };
}

// A module's job pull requests, the newest job first.
const jobsOf = (view, module) => view.prs.filter((p) => jobOf(p).module === module).sort((a, b) => jobOf(b).n - jobOf(a).n);
const openJob = (view, module) => jobsOf(view, module).find((p) => p.state === 'open') || null;

// A job's blocked record holds until a job of the blocking module merges after it was written
// (build text 5, section 5). Returns null (no block), { holds: true, ... } or { holds: false, ... }.
export function blockOf(view, pr) {
  const rec = view.jobRecord(pr.number);
  if (!rec?.blocked) return null;
  const endedBy = view.merged.find((m) => m.module === rec.blocked.by && Date.parse(m.merged_at) > Date.parse(rec.at));
  return { by: rec.blocked.by, why: rec.blocked.why, at: rec.at, holds: !endedBy };
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

// 12. Whether a module's work is finished, with the ground.
export function finished(view, module) {
  const jobs = jobsOf(view, module);
  const last = jobs[0];
  if (!last) return { finished: false, why: 'no job yet' };
  if (last.state === 'open') return { finished: false, why: `its job is open: pull request ${last.number}` };
  let why;
  if (last.merged_at) why = `pull request ${last.number} merged`;
  else {
    const rec = view.jobRecord(last.number);
    if (!rec?.nothing_to_change) return { finished: false, why: `pull request ${last.number} closed unmerged with no nothing-to-change record` };
    if (view.jobBlock(last.number)?.kind !== 'told') return { finished: false, why: `pull request ${last.number} closed with nothing to change, but its work was not only a notice; only a merge finishes it` };
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

// 9. The next job: the earliest ready module in order, after any module the owner put first.
export function pickNext(view, states) {
  const ready = states.filter((s) => s.state === 'has work' && (s.ready_again || workOf(view, s.module).any));
  const order = new Map(view.modules.map((m) => [m.name, m.order]));
  const first = view.notes.filter((n) => n.kind === 'module-first').map((n) => n.module);
  const rank = (s) => (first.includes(s.module) ? first.indexOf(s.module) - 1e6 : order.get(s.module) ?? 1e9);
  return ready.sort((a, b) => rank(a) - rank(b))[0] || null;
}

export function nextJobName(view, module) {
  const ns = jobsOf(view, module).map((p) => jobOf(p).n);
  return `job/${module}/${Math.max(ns.length, ...ns, 0) + 1}`;
}

// 13. Whether the round's jobs are done (design part 2, section 4).
export function roundDone(view, states) {
  const clearable = (by) => states.some((s) => s.module === by && (s.state === 'open' || s.state === 'has work'));
  const lines = states.map((s) => {
    if (s.state === 'finished') return { done: true, line: `${s.module}: finished (${s.why})` };
    if (s.state === 'blocked') {
      const by = s.by ? ` by ${s.by}` : '';
      return clearable(s.by)
        ? { done: false, line: `${s.module}: blocked${by}, which an open job of the round can clear: ${s.why}` }
        : { done: true, line: `${s.module}: blocked${by}, carried into the next round: ${s.why}` };
    }
    if (s.state === 'open') return { done: false, line: `${s.module}: open, pull request ${s.pull_request}` };
    return { done: false, line: `${s.module}: has work${s.ready_again ? ', its block ended; ready again' : ''}${s.why ? ` (${s.why})` : ''}` };
  });
  return { done: lines.every((l) => l.done), lines: lines.map((l) => l.line) };
}

// 15. Failed required runs on a pull request, from GitHub's record of runs. A cancelled run
// (`ready`'s newer run cancels the draft's) is not a failure and is not counted.
const FAILED = ['failure', 'timed_out', 'startup_failure'];
export function failedRuns(runs, pr) {
  return runs.filter((r) => r.name === REQUIRED && (r.head_branch === pr.head.ref || (r.pull_requests || []).some((p) => p.number === pr.number))
    && FAILED.includes(r.conclusion));
}

// The state a product's object derives from its event log. Pure: (state, event) -> state, no clock, no I/O.
// The object keeps the folded state in memory and in one snapshot row; a change to this file's meaning bumps
// REDUCER_VERSION, and the object then refolds the whole log on its next start (the schema migration).
export const REDUCER_VERSION = 3;

export const KINDS = new Set([
  'module.declared', 'charter.set', 'stop.set', 'stop.lift', 'scope.widen', 'slots.set', 'owner.words',
  'job.opened', 'job.session', 'job.tests', 'job.blocked', 'job.unblocked', 'job.merged', 'job.closed',
  'merge.refused', 'notice.arrived', 'notify.done', 'work.waiting', 'work.offered', 'work.taken',
  'session.created', 'session.archived', 'record.put', 'hook.post_tool_use',
]);

export const initial = () => ({
  v: REDUCER_VERSION, seq: 0, last_at: null,
  modules: {}, jobs: {}, sessions: {}, waiting: [], offered: [],
  charter: null, charter_log: [], scope_log: [], stop: null, slots: null, words: [], refusals: [], records: {},
  hooks: { seen: 0, unknown: 0 },
});

const req = (cond, msg) => { if (!cond) throw new Error(msg); };

// Validation that does not need the state; the object answers 400 on a throw, before anything is written.
export function validate(kind, b) {
  req(KINDS.has(kind), `no event kind ${kind}`);
  req(b && typeof b === 'object' && !Array.isArray(b), 'the body must be a JSON object');
  switch (kind) {
    case 'module.declared': req(Array.isArray(b.modules) && b.modules.every((m) => typeof m.name === 'string'), 'modules: [{name, order, uses}]'); break;
    case 'charter.set': req(typeof b.words === 'string' && ['first-n', 'conversions-only', 'ordinary'].includes(b.kind), 'charter: {words, kind: first-n|conversions-only|ordinary}'); break;
    case 'job.opened': req(b.pr != null && typeof b.module === 'string', 'job.opened: {pr, module, kind}'); break;
    case 'job.tests': req(b.pr != null && typeof b.passed === 'boolean', 'job.tests: {pr, passed}'); break;
    case 'record.put': req(typeof b.key === 'string', 'record.put: {key, data}'); break;
    case 'owner.words': req(typeof b.text === 'string', 'owner.words: {text}'); break;
    default:
  }
}

const job = (s, pr) => s.jobs[String(pr)];

// A job's opening time as known: exact, or only an upper bound ("no later than") with an optional lower bound.
const openedOf = (b, at) => ({ at, bound: b.bound === 'no-later-than' ? 'no-later-than' : 'exact', after: b.opened_after || null });

export function apply(s, ev) {
  const { kind, at, body: b } = ev;
  s.seq = ev.seq;
  s.last_at = at;
  switch (kind) {
    case 'module.declared':
      for (const m of b.modules) s.modules[m.name] = { order: m.order ?? null, uses: m.uses || [], converted: !!m.converted, ...(s.modules[m.name]?.converted_at ? { converted_at: s.modules[m.name].converted_at } : {}) };
      break;
    case 'charter.set':
      s.charter = { words: b.words, kind: b.kind, n: b.n ?? null, notices: b.notices || 'hold', by: b.by || ev.actor, at, source: b.source || null };
      s.charter_log.push({ at, kind: b.kind, words: b.words, by: s.charter.by });
      break;
    case 'stop.set': s.stop = { words: b.words || '', at, by: b.by || ev.actor }; break;
    case 'stop.lift': s.stop = null; break;
    case 'scope.widen': s.scope_log.push({ at, by: b.by || ev.actor, words: b.words || '', modules: b.modules || null, what: b.what || '' }); break;
    case 'slots.set': s.slots = { number: Number(b.number), words: b.words || '', at }; break;
    case 'owner.words': s.words.push({ at, text: b.text, marked: /^(Decision|Instruction):/.test(b.text), where: b.where || '' }); break;
    case 'job.opened': {
      s.jobs[String(b.pr)] = {
        pr: b.pr, module: b.module, kind: b.kind || 'ordinary', state: 'open', session: b.session || null,
        started_by: b.started_by || null, opened: openedOf(b, at), tests: [], notice_at: null, blocked: null,
        merged_at: null, closed_at: null, merged_by: null, notify_done: false, label: b.label || null,
      };
      s.waiting = s.waiting.filter((w) => !(w.module === b.module && (b.takes || []).includes(w.ref)));
      break;
    }
    case 'job.session': { const j = job(s, b.pr); if (j) j.session = b.session; break; }
    case 'job.tests': { const j = job(s, b.pr); if (j) j.tests.push({ at, passed: b.passed, count: b.count || null }); break; }
    case 'job.blocked': { const j = job(s, b.pr); if (j) j.blocked = { by: b.by, why: b.why || '', at }; break; }
    case 'job.unblocked': { const j = job(s, b.pr); if (j) j.blocked = null; break; }
    case 'job.merged': {
      const j = job(s, b.pr);
      if (j) { j.state = 'merged'; j.merged_at = at; j.merged_by = b.by || ev.actor; j.merge_bound = b.bound || 'exact'; }
      if (j && j.kind === 'conversion' && s.modules[j.module]) { s.modules[j.module].converted = true; s.modules[j.module].converted_at = at; }
      break;
    }
    case 'job.closed': { const j = job(s, b.pr); if (j) { j.state = 'closed'; j.closed_at = at; j.close_bound = b.bound || 'exact'; } break; }
    case 'merge.refused': s.refusals.push({ at, pr: b.pr, held_by: b.held_by || [], said: b.said || '' }); break;
    case 'notice.arrived': {
      const open = Object.values(s.jobs).filter((j) => j.state === 'open' && j.module === b.module);
      for (const j of open) j.notice_at = at;
      if (!open.length) s.waiting.push({ ref: b.ref || `notice:${b.from || '?'}@${at}`, module: b.module, kind: 'notice', words: `notice from ${b.from || 'unknown'}`, at });
      break;
    }
    case 'notify.done': { const j = job(s, b.pr); if (j) j.notify_done = true; break; }
    case 'work.waiting': s.waiting.push({ ref: b.ref, module: b.module, kind: b.kind || 'flaw', words: b.words || '', at, bound: b.bound || 'exact' }); break;
    case 'work.offered': s.offered.push({ at, module: b.module, kind: b.kind || 'ordinary', items: b.items || [], words: b.words || '' }); break;
    case 'work.taken': s.waiting = s.waiting.filter((w) => w.ref !== b.ref); break;
    case 'session.created': s.sessions[b.session] = { role: b.role || null, created: at, by: b.by || ev.actor, archived: null, title: b.title || '' }; break;
    case 'session.archived': (s.sessions[b.session] ||= { role: null, created: null, by: null, archived: null }).archived = at; break;
    case 'record.put': s.records[b.key] = { seq: ev.seq, at }; break; // the data itself lives in its own table
    case 'hook.post_tool_use': fromHook(s, ev); break;
    default:
  }
  return s;
}

// A PostToolUse hook's report, read for the harness's own answer. The answer's exact shape for these MCP tools is not in
// the hooks docs (U); this reads the first session id the answer names and treats an answer that says "error" as a refusal.
const SESSION = /session_[A-Za-z0-9]{16,40}/;
function fromHook(s, ev) {
  const b = ev.body;
  s.hooks.seen++;
  const name = String(b.tool_name || '');
  const answer = typeof b.tool_response === 'string' ? b.tool_response : JSON.stringify(b.tool_response ?? '');
  const failed = /"is_error"\s*:\s*true|\berror\b/i.test(answer) && !SESSION.test(answer);
  if (name.endsWith('__create_session')) {
    const id = answer.match(SESSION)?.[0];
    if (id && !failed) s.sessions[id] = { role: b.tool_input?.role || null, created: ev.at, by: b.session_id || null, archived: null, title: b.tool_input?.title || '' };
  } else if (name.endsWith('__archive_session')) {
    const id = b.tool_input?.session_id;
    if (id && !/\b(error|refused|not found)\b/i.test(answer)) (s.sessions[id] ||= { role: null, created: null, by: b.session_id || null, archived: null }).archived = ev.at;
  } else if (!name.endsWith('__send_message')) s.hooks.unknown++;
}

export function fold(events) {
  const s = initial();
  for (const e of events) apply(s, e);
  return s;
}

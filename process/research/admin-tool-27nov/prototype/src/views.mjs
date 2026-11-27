// The derived views: pure functions of the folded state and a time ("now"). Nothing here is stored.
const ms = (t) => Date.parse(t);
const mins = (a, b) => Math.round((ms(b) - ms(a)) / 60000);
const openJobs = (s) => Object.values(s.jobs).filter((j) => j.state === 'open');
const holdsSlot = (j) => j.state === 'open' && !j.blocked;

// A job's tests stand when its newest run passed after the newest notice that reached its module.
export function standing(j) {
  const last = j.tests[j.tests.length - 1];
  if (!last) return { since: null, why: 'no test run recorded' };
  if (!last.passed) return { since: null, why: `its newest run failed (${last.at})` };
  if (j.notice_at && ms(j.notice_at) >= ms(last.at)) return { since: null, why: `a notice reached it at ${j.notice_at}, after its tests (${last.at}); it runs them again` };
  return { since: last.at };
}

// The modules a module uses, directly or through others.
export function usesOf(s, module) {
  const seen = new Set();
  const todo = [...(s.modules[module]?.uses || [])];
  while (todo.length) {
    const m = todo.pop();
    if (seen.has(m) || m === module) continue;
    seen.add(m);
    todo.push(...(s.modules[m]?.uses || []));
  }
  return seen;
}

// Under rule Y a provider job opened after the ready job's tests passed does not hold it. With only an upper bound on
// the opening ("no later than"), the answer can be unknown.
function yEffect(h, since) {
  const o = h.opened;
  if (o.bound === 'exact') return ms(o.at) <= ms(since) ? 'holds' : 'free';
  if (ms(o.at) <= ms(since)) return 'holds';
  if (o.after && ms(o.after) >= ms(since)) return 'free';
  return 'unknown';
}

export function mergeQueue(s, { now, y = false } = {}) {
  const ready = [];
  const notReady = [];
  for (const j of openJobs(s)) {
    if (j.blocked) { notReady.push({ pr: j.pr, module: j.module, why: `blocked by ${j.blocked.by}` }); continue; }
    const st = standing(j);
    if (!st.since) { notReady.push({ pr: j.pr, module: j.module, why: st.why }); continue; }
    const uses = usesOf(s, j.module);
    const holders = openJobs(s).filter((h) => h !== j && !h.blocked && uses.has(h.module)).map((h) => ({
      pr: h.pr, module: h.module, label: h.label, opened: h.opened.at, opened_bound: h.opened.bound,
      ...(y ? { under_y: yEffect(h, st.since) } : {}),
    }));
    const effective = y ? holders.filter((h) => h.under_y === 'holds') : holders;
    const unknown = y ? holders.filter((h) => h.under_y === 'unknown') : [];
    const verdict = effective.length ? 'waits' : unknown.length ? 'unknown' : 'merges';
    ready.push({ pr: j.pr, module: j.module, ready_since: st.since, waited_min: now ? mins(st.since, now) : null, verdict, holders });
  }
  return { rule_y: y, ready: ready.sort((a, b) => ms(a.ready_since) - ms(b.ready_since)), not_ready: notReady };
}

const KIND_ALLOWED = {
  ordinary: () => true,
  'conversions-only': (w, c) => w.kind === 'conversion' || (w.kind === 'notice' && c.notices === 'work'),
  'first-n': (w, c) => w.kind === 'conversion' || (w.kind === 'notice' && c.notices === 'work'),
};
const allowed = (c, w) => KIND_ALLOWED[c?.kind || 'ordinary'](w, c || {});

export function anomalies(s, { now, y = false, grace = 10 } = {}) {
  const out = { merged_not_archived: [], ready_waiting: [], open_no_session: [], over_slots: null, outside_charter: [], scope_vs_charter: [] };
  for (const j of Object.values(s.jobs)) {
    const ended = j.merged_at || j.closed_at;
    if (ended && (!j.session || !s.sessions[j.session]?.archived) && mins(ended, now) >= grace) {
      out.merged_not_archived.push({ pr: j.pr, module: j.module, ended, for_min: mins(ended, now), session: j.session || 'not recorded' });
    }
    if (j.state === 'open') {
      if (!j.session && mins(j.opened.at, now) >= grace) out.open_no_session.push({ pr: j.pr, module: j.module, label: j.label, opened: j.opened.at, for_min: mins(j.opened.at, now) });
      else if (j.session && s.sessions[j.session]?.archived) out.open_no_session.push({ pr: j.pr, module: j.module, opened: j.opened.at, why: `its session ${j.session} was archived at ${s.sessions[j.session].archived}` });
      if (s.charter && !allowed(s.charter, { kind: j.kind === 'conversion' ? 'conversion' : j.kind })) out.outside_charter.push({ pr: j.pr, module: j.module, kind: j.kind, charter: s.charter.kind });
    }
  }
  for (const r of mergeQueue(s, { now, y }).ready) {
    if (r.verdict !== 'merges') out.ready_waiting.push({ pr: r.pr, module: r.module, ready_since: r.ready_since, waited_min: r.waited_min, verdict: r.verdict, held_by: r.holders.map((h) => `${h.module}${h.pr != null && !String(h.pr).includes('@') ? ` (${h.pr})` : ''}${y ? ` [${h.under_y}]` : ''}`) });
    else if (r.waited_min >= grace) out.ready_waiting.push({ pr: r.pr, module: r.module, ready_since: r.ready_since, waited_min: r.waited_min, verdict: 'nothing holds it; not merged', held_by: [] });
  }
  if (s.slots) {
    const n = openJobs(s).filter(holdsSlot).length;
    if (n > s.slots.number) out.over_slots = { in_use: n, number: s.slots.number };
  }
  if (s.charter) for (const w of s.scope_log.filter((x) => ms(x.at) > ms(s.charter.at))) out.scope_vs_charter.push({ at: w.at, by: w.by, widened: w.what || (w.modules || []).join(', '), charter: `${s.charter.kind}${s.charter.n ? ` ${s.charter.n}` : ''}: "${s.charter.words}"` });
  return out;
}

// The next work the charter allows, given the module order, which modules are converted, open jobs, the waiting work
// and the slots. "Cannot say" where the order or a module's conversion is not recorded.
export function next(s, { now } = {}) {
  const c = s.charter || { kind: 'ordinary', words: null };
  const base = { charter: { kind: c.kind, n: c.n ?? null, words: c.words } };
  const held = s.waiting.filter((w) => !allowed(c, w)).map((w) => ({ module: w.module, kind: w.kind, ref: w.ref, why: `the charter (${c.kind}) does not allow ${w.kind} work` }));
  const offered = s.offered.map((o) => ({ at: o.at, module: o.module, kind: o.kind, items: o.items, charter_allows: allowed(c, { kind: o.kind === 'told' ? 'notice' : o.kind }) }));
  const res = (x) => ({ ...base, ...x, held, offered_check: offered });
  if (s.stop) return res({ next: null, why: `the owner's stop stands: "${s.stop.words}"` });
  const mods = Object.entries(s.modules).map(([name, m]) => ({ name, ...m }));
  const known = mods.filter((m) => m.order != null).sort((a, b) => a.order - b.order);
  const unordered = mods.filter((m) => m.order == null).map((m) => m.name);
  const open = new Set(openJobs(s).map((j) => j.module));
  let scope = known;
  if (c.kind === 'first-n') {
    scope = known.slice(0, c.n || 0);
    if (scope.length < (c.n || 0)) return res({ next: null, why: `the charter names the first ${c.n} modules; only ${scope.length} have a recorded order` });
    if (scope.every((m) => m.converted === true) && !scope.some((m) => open.has(m.name))) {
      return res({ next: null, why: `the charter is done: its words were "${c.words}"; nothing more is given until the owner sets a new charter` });
    }
  }
  const work = [];
  for (const m of scope) {
    if (open.has(m.name)) continue;
    if (m.converted == null) { work.push({ module: m.name, unknown: 'whether it is converted is not recorded' }); continue; }
    if (!m.converted) { work.push({ module: m.name, kind: 'conversion' }); continue; }
    const mine = s.waiting.filter((w) => w.module === m.name && allowed(c, w));
    if (mine.length) work.push({ module: m.name, kind: mine.every((w) => w.kind === 'notice') ? 'told' : 'ordinary', work: mine.map((w) => w.ref) });
  }
  const first = work[0];
  if (c.kind !== 'first-n' && unordered.length) return res({ next: null, why: `cannot say: the module order is not recorded for ${unordered.length} module(s): ${unordered.slice(0, 8).join(', ')}${unordered.length > 8 ? ', ...' : ''}`, candidates: work.slice(0, 5) });
  if (!first) return res({ next: null, why: 'nothing the charter allows is waiting' });
  if (first.unknown) return res({ next: null, why: `cannot say: ${first.module}: ${first.unknown}` });
  if (s.slots) {
    const inUse = openJobs(s).filter(holdsSlot).length;
    if (inUse >= s.slots.number) return res({ next: null, why: `no free slot (${inUse} in use of ${s.slots.number})`, would_be: first });
  }
  return res({ next: first, why: c.kind === 'ordinary' && !s.charter ? 'no charter recorded: every kind of work is given, earliest first' : `the earliest work the charter (${c.kind}) allows` });
}

// What a session still owes, from the records: archives of the sessions it started whose jobs ended, notify after its
// merges, merges no longer waiting (ARCH), a test run after a notice (a job).
export function owed(s, { session, now, y = false } = {}) {
  const role = s.sessions[session]?.role || null;
  const isArch = role === 'arch';
  const out = [];
  for (const j of Object.values(s.jobs)) {
    const ended = j.merged_at || j.closed_at;
    const starter = j.started_by || null;
    if (ended && (starter === session || (isArch && !starter)) && (!j.session || !s.sessions[j.session]?.archived)) out.push({ act: 'archive', pr: j.pr, session: j.session || 'not recorded', since: ended });
    if (j.state === 'merged' && j.kind !== 'conversion' && !j.notify_done && (j.merged_by === session || (isArch && !j.merged_by))) out.push({ act: 'notify', pr: j.pr, since: j.merged_at });
    if (j.state === 'open' && j.session === session) {
      const st = standing(j);
      if (!st.since && j.notice_at) out.push({ act: 'test again', pr: j.pr, why: st.why });
    }
  }
  if (isArch) for (const r of mergeQueue(s, { now, y }).ready.filter((x) => x.verdict === 'merges')) out.push({ act: 'merge', pr: r.pr, why: `ready since ${r.ready_since}; nothing holds it${y ? ' under rule Y' : ''}` });
  return { session, role, stop: s.stop ? s.stop.words : null, owed: out };
}

// A role's brief: what it needs now, bounded to `max` bytes; lists are cut, with the count left out, to fit.
export function brief(s, { role = 'arch', session = null, now, y = false, max = 8000 } = {}) {
  const a = anomalies(s, { now, y });
  const q = mergeQueue(s, { now, y });
  const n = next(s, { now });
  const o = session ? owed(s, { session, now, y }) : null;
  const render = (k) => {
    const cut = (list, f) => [...list.slice(0, k).map(f), ...(list.length > k ? [`  (+${list.length - k} more)`] : [])];
    const L = [`# brief: ${role}${session ? ` ${session}` : ''}, as of ${now} (event ${s.seq})`];
    L.push(s.charter ? `charter (${s.charter.kind}${s.charter.n ? ` ${s.charter.n}` : ''}), the owner's words exactly: "${s.charter.words}"` : 'charter: none recorded');
    L.push(s.stop ? `STOP: "${s.stop.words}" (${s.stop.at})` : 'stop: none');
    if (role === 'arch' || role === 'coordinator') {
      L.push(`next: ${n.next ? `${n.next.module} (${n.next.kind})` : n.why}`);
      if (n.held.length) L.push(`held by the charter: ${n.held.length}`, ...cut(n.held, (h) => `  ${h.module}: ${h.kind} ${h.ref}`));
      L.push(`merge queue (rule Y ${y ? 'on' : 'off'}): ${q.ready.length} ready`, ...cut(q.ready, (r) => `  ${r.module} (${r.pr}): ${r.verdict}, ready ${r.waited_min} min${r.holders.length ? `; held by ${r.holders.map((h) => h.module).join(', ')}` : ''}`));
      L.push(`anomalies: ${Object.entries(a).map(([key, v]) => `${key} ${Array.isArray(v) ? v.length : v ? 1 : 0}`).join(', ')}`);
      for (const key of ['ready_waiting', 'merged_not_archived', 'open_no_session', 'outside_charter', 'scope_vs_charter']) if (a[key].length) L.push(`  ${key}:`, ...cut(a[key], (x) => `    ${JSON.stringify(x)}`));
      if (a.over_slots) L.push(`  over_slots: ${a.over_slots.in_use} of ${a.over_slots.number}`);
      if (role === 'coordinator') L.push(`owner's words recorded: ${s.words.length}`, ...cut(s.words.slice().reverse(), (w) => `  ${w.at} ${w.marked ? '[marked]' : '[conversation]'} "${w.text}"`));
    }
    if (role === 'job') {
      const mine = Object.values(s.jobs).filter((j) => j.session === session);
      L.push(...mine.map((j) => `job ${j.module} (${j.pr}), ${j.kind}, ${j.state}; tests: ${standing(j).since ? `stand since ${standing(j).since}` : standing(j).why}`));
    }
    if (o) L.push(`owed by ${session}: ${o.owed.length}`, ...cut(o.owed, (x) => `  ${x.act} ${x.pr}${x.why ? `: ${x.why}` : ''}`));
    return L.join('\n');
  };
  let text;
  let k = 50;
  for (;;) {
    text = render(k);
    if (new TextEncoder().encode(text).length <= max || k === 0) break;
    k = Math.floor(k / 2);
  }
  const bytes = new TextEncoder().encode(text).length;
  return { bytes, list_cap: k, over_max: bytes > max, text };
}

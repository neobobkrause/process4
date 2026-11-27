// The shared state (design part 4, section 4; build text 5, sections 1 to 4): one issue, found by
// its label, each record one comment rewritten in place.
import { block, parseBlock } from './github.mjs';
import { fail } from './util.mjs';

export const LABEL = 'process4-state';
export const TITLE = 'Process4 shared state';
export const BODY = 'The shared state of Process4: each comment below is one record.\nOnly the Process4 tool writes here.';
export const mark = (key) => `process4-record: ${key}`;

export const PRODUCT_RECORDS = ['roles', 'lanes', 'wakes', 'stop', 'standing-notes', 'round', 'waiting-work',
  'handover-root', 'handover-watcher', 'handover-arch', 'handover-coordinator'];
export const PROCESS_RECORDS = ['handover-process', 'lanes', 'changes'];
const KEY = /^(roles|lanes|wakes|stop|standing-notes|round|waiting-work|changes|handover-(root|watcher|arch|coordinator|process|lane-[a-z0-9-]+))$/;
export const checkKey = (key) => (KEY.test(key || '') ? key : fail(`no record is named ${key}`));

const keyOf = (body) => body?.split('\n')[0].match(/^<!-- process4-record: ([a-z0-9-]+) -->$/)?.[1] || null;
// A record too large for one comment goes on in further comments, each marked with its part (build text 5, section 1).
export const partMark = (key, part) => `process4-record: ${key}, part ${part}`;
const partOf = (body) => { const m = body?.split('\n')[0].match(/^<!-- process4-record: ([a-z0-9-]+), part (\d+) -->$/); return m ? { key: m[1], part: Number(m[2]) } : null; };
/** The most characters one record comment holds; GitHub takes 65,536. */
export const RECORD_LIMIT = 60000;

// The lowest-numbered open issue with the label.
export function findIssue(gh, slug) {
  const issues = gh.issuesByLabel(slug, LABEL).sort((a, b) => a.number - b.number);
  return issues[0] || null;
}

// Every record of the issue: key -> { id, data, words, more }. One listing call. A record written in parts (its first
// comment's `parts` above one) is read back as one: each further part's list is added, in order, to the same list of
// the first, and `parts` is left out of the data. `more` holds the further part comments' ids, by part.
export function readAll(gh, slug, issue) {
  const out = {};
  const parts = {};
  for (const c of gh.comments(slug, issue.number)) {
    const p = partOf(c.body);
    if (p) {
      parts[p.key] ??= {};
      if (!parts[p.key][p.part]) parts[p.key][p.part] = { id: c.id, data: parseBlock(c.body, partMark(p.key, p.part))?.data, body: c.body };
      continue;
    }
    const key = keyOf(c.body);
    if (!key || out[key]) continue;
    const b = parseBlock(c.body, mark(key));
    out[key] = { id: c.id, data: b ? b.data : {}, words: b ? b.words : '', more: {}, body: c.body, bodies: {} };
  }
  for (const [key, rec] of Object.entries(out)) {
    for (const [part, p] of Object.entries(parts[key] || {})) { rec.more[part] = p.id; rec.bodies[part] = p.body; }
    const n = Number(rec.data?.parts) || 1;
    if (n <= 1) continue;
    const { parts: _, ...data } = rec.data;
    for (let i = 2; i <= n; i++) {
      const p = parts[key]?.[i]?.data;
      const field = p && Object.keys(p)[0];
      if (!field || !Array.isArray(p[field])) fail(`the ${key} record is written in ${n} parts and part ${i} is missing; write the record again`);
      data[field] = [...(Array.isArray(data[field]) ? data[field] : []), ...p[field]];
    }
    rec.data = data;
  }
  return out;
}

export function readRecords(gh, slug) {
  const issue = findIssue(gh, slug);
  if (!issue) fail(`${slug} has no open issue labelled ${LABEL}; ROOT makes it with state write --create`);
  return { issue, records: readAll(gh, slug, issue) };
}

// The file a session writes: a JSON value, then for a handover its plain words.
export function parseRecordFile(text) {
  const t = text.trim();
  if (!t) return { data: {}, words: '' };
  try { return { data: JSON.parse(t), words: '' }; } catch { /* words follow the block */ }
  const end = jsonEnd(t);
  if (end > 0) {
    try { return { data: JSON.parse(t.slice(0, end)), words: t.slice(end).trim() }; } catch { /* fall through */ }
  }
  return fail('the file must begin with one JSON value; a handover may have plain words after it');
}

// Where the first JSON object or array in the text ends, or -1.
function jsonEnd(t) {
  if (t[0] !== '{' && t[0] !== '[') return -1;
  let depth = 0;
  let str = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (str) { if (c === '\\') i++; else if (c === '"') str = false; continue; }
    if (c === '"') str = true;
    else if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') { depth--; if (depth === 0) return i + 1; }
  }
  return -1;
}

// What ends each kind of standing note (build text 5, section 3). `mergedJobs` lists merged job
// pull requests as { module, merged_at }; `round` is the round record's data.
export function noteEnded(note, notes, { mergedJobs = [], round = {} } = {}) {
  switch (note.kind) {
    case 'held-merge': return !!note.ended;
    case 'module-first': return mergedJobs.some((m) => m.module === note.module && m.merged_at > note.written);
    case 'slot-number': return notes.some((n) => n !== note && n.kind === 'slot-number' && n.written > note.written);
    case 'full-external-walk': return (round.walks || []).some((w) => w.kind === 'external' && w.full === true && w.outcome && w.outcome !== 'not yet');
    default: return false;
  }
}

export const liveNotes = (data, ctx) => (data?.notes || []).filter((n, _, all) => !noteEnded(n, all, ctx));

// The design's own refusal: a second live session for a lane the present record shows live. A live entry written
// before its lane starts names no session yet ("session": null); the starter fills in the address once, after the
// start, and that one fill-in is not refused.
export function laneRefusal(present, next) {
  const live = new Map();
  for (const l of present?.lanes || []) if (l.live) live.set(l.name, l.session);
  const seen = new Map();
  for (const l of next?.lanes || []) {
    if (!l.live) continue;
    if (seen.has(l.name) && seen.get(l.name) !== l.session) return `lane ${l.name} is named live twice`;
    seen.set(l.name, l.session);
    if (live.has(l.name) && live.get(l.name) && live.get(l.name) !== l.session) return `lane ${l.name} is live in ${live.get(l.name)}; a second live session is refused`;
  }
  return null;
}

// Makes the label, the issue and each empty record once, and locks the issue.
export function create(gh, slug, keys, log) {
  gh.createLabel(slug, LABEL, '5319e7', 'Process4 shared state');
  let issue = findIssue(gh, slug);
  if (!issue) {
    issue = gh.createIssue(slug, { title: TITLE, body: BODY, labels: [LABEL] });
    log(`made issue ${issue.number}`);
  } else log(`issue ${issue.number} is there already`);
  const have = readAll(gh, slug, issue);
  for (const key of keys) {
    if (have[key]) continue;
    const c = gh.addComment(slug, issue.number, block(mark(key), {}));
    have[key] = { id: c.id, data: {}, words: '' };
  }
  gh.lockIssue(slug, issue.number);
  return { issue, records: have };
}

// The comments of one record: where its body fits one comment, that comment alone. Otherwise its longest list is spread
// over as many comments as it needs, each under RECORD_LIMIT: the first holds the rest of the record, the list's first
// items and `parts`; each further part holds only the list's next items. A record with no list, or one item too large
// for a comment, fails plainly.
export function recordParts(key, data, words = '') {
  const one = block(mark(key), data, words);
  if (one.length < RECORD_LIMIT) return [one];
  const lists = Object.entries(data || {}).filter(([, v]) => Array.isArray(v)).sort((a, b) => JSON.stringify(b[1]).length - JSON.stringify(a[1]).length);
  if (!lists.length) fail(`the ${key} record is ${one.length} characters, too large for one comment, and has no list to spread over more`);
  const [field, items] = lists[0];
  const chunks = [[]];
  const first = (n, list) => block(mark(key), { ...data, [field]: list, parts: n }, words);
  const later = (i, list) => block(partMark(key, i), { [field]: list });
  for (const item of items) {
    const i = chunks.length;
    const cur = chunks[i - 1];
    const body = i === 1 ? first(99, [...cur, item]) : later(i, [...cur, item]);
    if (body.length < RECORD_LIMIT) { cur.push(item); continue; }
    if (!cur.length || later(i + 1, [item]).length >= RECORD_LIMIT) fail(`an entry of the ${key} record is too large for one comment on its own`);
    chunks.push([item]);
  }
  if (first(chunks.length, chunks[0]).length >= RECORD_LIMIT) fail(`the ${key} record is too large for one comment even with its list spread over more`);
  return chunks.map((list, i) => (i === 0 ? first(chunks.length, list) : later(i + 1, list)));
}

// Rewrites one record in place, or makes it where it has no comment yet (a gone comment is made afresh). A record too
// large for one comment is written in parts (recordParts): the further parts first, then the first comment, which names
// how many parts there are; a further part no longer needed is emptied. A comment whose body would be the same as it is
// (`body`/`bodies`, as readAll read it) is not written again (the owner's decision K1). Returns the body of the first
// comment.
export function writeRecord(gh, slug, issue, records, key, data, words = '') {
  const bodies = recordParts(key, data, words);
  const had = records[key];
  const more = { ...(had?.more || {}) };
  const was = (part) => (part ? had?.bodies?.[part] : had?.body);
  const put = (id, body, what, part) => {
    if (id && was(part) === body) return;
    if (id && gh.editComment(slug, id, body, { allowFail: true }) !== null) return;
    const said = id ? gh.refusal?.() || '' : '';
    const still = () => { try { const r = readAll(gh, slug, issue)[key]; return part ? !!r?.more[part] : !!r; } catch { return !part; } };
    if (id && still()) fail(`GitHub would not rewrite the ${what}; it stays as it was${said ? `. GitHub said: ${said}` : ''}`);
    try {
      gh.addComment(slug, issue.number, body);
    } catch (e) {
      fail(`GitHub would not write the ${what}: ${e.message}`);
    }
  };
  bodies.slice(1).forEach((body, i) => put(more[i + 2], body, `${key} record's part ${i + 2}`, i + 2));
  put(had?.id, bodies[0], `${key} record`);
  for (const [part, id] of Object.entries(more)) {
    const emptied = block(partMark(key, part), { emptied: [] });
    if (Number(part) > bodies.length && was(part) !== emptied) gh.editComment(slug, id, emptied, { allowFail: true });
  }
  // what was written is what a later write in the same command compares with; where in doubt, nothing is skipped
  if (had) {
    had.body = bodies[0];
    had.bodies = {};
    bodies.slice(1).forEach((body, i) => { if (more[i + 2]) had.bodies[i + 2] = body; });
  }
  return bodies[0];
}

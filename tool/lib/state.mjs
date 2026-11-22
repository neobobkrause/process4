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

// The lowest-numbered open issue with the label.
export function findIssue(gh, slug) {
  const issues = gh.issuesByLabel(slug, LABEL).sort((a, b) => a.number - b.number);
  return issues[0] || null;
}

// Every record of the issue: key -> { id, data, words }. One listing call.
export function readAll(gh, slug, issue) {
  const out = {};
  for (const c of gh.comments(slug, issue.number)) {
    const key = keyOf(c.body);
    if (!key || out[key]) continue;
    const b = parseBlock(c.body, mark(key));
    out[key] = { id: c.id, data: b ? b.data : {}, words: b ? b.words : '' };
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

// Rewrites one record in place, or makes it where it has no comment yet (a gone comment is made
// afresh). Returns the body written.
export function writeRecord(gh, slug, issue, records, key, data, words = '') {
  const body = block(mark(key), data, words);
  const had = records[key];
  if (had) {
    const r = gh.editComment(slug, had.id, body, { allowFail: true });
    if (r !== null) return body;
    if (readAll(gh, slug, issue)[key]) fail(`GitHub would not rewrite the ${key} record; it stays as it was`);
  }
  gh.addComment(slug, issue.number, body);
  return body;
}

// The walk commands (stage 5; build text 3, and build text 1b commands 19 to 23). ARCH opens one
// issue for each walk; each walking session writes its one comment there, rewritten in place; ARCH
// reads the issue to place flaws. The tool judges nothing: it opens and closes the issue, writes and
// reads comments, lists the round's candidate areas, and fills a walking session's starting text.
import fs from 'node:fs';
import path from 'node:path';
import { fetchLine, loadConfig, loadModules, needConfig, readAt, requirementsFile } from './config.mjs';
import { readRecords, writeRecord } from './state.mjs';
import { fail } from './util.mjs';
import { hasUsesFile, providersOf, readUsesFile } from './usesfile.mjs';

export const WALK_LABEL = 'process4-walk';
const KINDS = new Set(['internal', 'external']);
// Each walking session's comment carries this hidden mark on its first line, so it is rewritten in place.
const sessionMark = (n) => `process4-walk-session: ${n}`;
const markLine = (n) => `<!-- ${sessionMark(n)} -->`;

const posInt = (x, what) => {
  const n = Number(x);
  return Number.isInteger(n) && n > 0 ? n : fail(`name the ${what} by its number`);
};

// The current round record, or a failure (ARCH writes it before any walk).
function roundOf(ctx) {
  const { issue, records } = readRecords(ctx.gh, ctx.slug);
  const round = records.round?.data;
  if (!round || !round.tranche) fail('no round record yet; ARCH writes it before a walk');
  return { issue, records, round };
}

// 19. walk open <internal|external>: opens the walk issue, records its number in the round record.
export function walkOpen(ctx, kind) {
  if (!KINDS.has(kind)) fail('say walk open internal | external');
  const { issue, records, round } = roundOf(ctx);
  const walks = round.walks || (round.walks = []);
  let walk = walks.find((w) => w.kind === kind);
  if (walk?.issue) { ctx.log(`walk issue ${walk.issue} is there already for the ${kind} walk`); return 0; }
  ctx.gh.createLabel(ctx.slug, WALK_LABEL, '0e8a16', 'A Process4 walk');
  const title = `Process4 walk: ${round.tranche} / round ${round.round} / ${kind}`;
  const body = `The ${kind} walk of ${round.tranche}, round ${round.round}. Each walking session writes one comment here, through the Process4 tool.`;
  const made = ctx.gh.createIssue(ctx.slug, { title, body, labels: [WALK_LABEL] });
  if (!walk) { walk = { kind, full: false, outcome: 'not yet', areas: [], sessions: [] }; walks.push(walk); }
  walk.issue = made.number;
  writeRecord(ctx.gh, ctx.slug, issue, records, 'round', round);
  ctx.log(`walk issue ${made.number}${made.html_url ? `: ${made.html_url}` : ''} for the ${kind} walk`);
  return 0;
}

// 19. walk close <issue>: closes the walk issue when ARCH has placed every entry.
export function walkClose(ctx, issueArg) {
  const n = posInt(issueArg, 'walk issue');
  ctx.gh.closeIssue(ctx.slug, n);
  ctx.log(`closed walk issue ${n}`);
  return 0;
}

// 20. walk write <issue> --session <n> --from <file>: a walking session's one comment, rewritten in place.
export function walkWrite(ctx, issueArg, a) {
  const n = posInt(issueArg, 'walk issue');
  const session = posInt(a.session, 'walking session');
  if (typeof a.from !== 'string') fail('say --from <file>');
  const text = fs.readFileSync(a.from, 'utf8').replace(/\s+$/, '');
  const body = `${markLine(session)}\n${text}\n`;
  const had = ctx.gh.comments(ctx.slug, n).find((c) => c.body.split('\n')[0].trim() === markLine(session));
  if (had) {
    const r = ctx.gh.editComment(ctx.slug, had.id, body, { allowFail: true });
    if (r !== null) { ctx.log(`rewrote walking session ${session}'s comment on walk issue ${n}`); return 0; }
  }
  ctx.gh.addComment(ctx.slug, n, body);
  ctx.log(`wrote walking session ${session}'s comment on walk issue ${n}`);
  return 0;
}

// 21. walk read <issue> [<flaw>]: prints the issue's comments, or one flaw.
export function walkRead(ctx, issueArg, flaw) {
  const n = posInt(issueArg, 'walk issue');
  const comments = ctx.gh.comments(ctx.slug, n);
  if (flaw) {
    for (const c of comments) {
      const found = flawBlock(c.body, flaw);
      if (found) { ctx.log(found); return 0; }
    }
    fail(`walk issue ${n} has no flaw ${flaw}`);
  }
  if (!comments.length) { ctx.log(`walk issue ${n} has no comments yet`); return 0; }
  ctx.log(comments.map((c) => c.body.replace(/^<!-- process4-walk-session: \d+ -->\n/, '')).join('\n\n---\n\n'));
  return 0;
}

// The lines of one flaw: from its `flaw: <id>` line to the next flaw or observation, or the end.
function flawBlock(body, id) {
  const lines = body.split('\n');
  const start = lines.findIndex((l) => l.trim() === `flaw: ${id}`);
  if (start < 0) return null;
  let end = start + 1;
  while (end < lines.length && !/^(flaw|observation):\s/.test(lines[end].trim())) end++;
  return lines.slice(start, end).join('\n').trim();
}

// 22. walk text <session>: a walking session's starting instructions, filled with names and addresses only.
export function walkText(ctx, sessionArg) {
  const session = posInt(sessionArg, 'walking session');
  const cfg = needConfig(ctx.root);
  const { round } = roundOf(ctx);
  // The walk this session serves: prefer a live entry, else any walk that names it.
  let walk = null; let entry = null;
  for (const w of round.walks || []) {
    const e = (w.sessions || []).find((s) => s.number === session);
    if (e && (!entry || e.live)) { walk = w; entry = e; if (e.live) break; }
  }
  if (!walk) fail(`the round record names no walking session ${session}`);
  const copy = entry.copy && typeof entry.copy === 'object' ? entry.copy : null;
  const copyName = copy ? copy.name : (entry.copy || '');
  const copyAddr = copy ? copy.address : '';
  const external = walk.kind === 'external';
  const fill = {
    '<number>': String(session),
    '<product>': ctx.slug,
    '<the internal walk | the external walk>': external ? 'the external walk' : 'the internal walk',
    '<tranche>': String(round.tranche),
    '<round>': String(round.round),
    '<walk issue>': String(walk.issue ?? ''),
    "<folder of the walks' documents>": cfg.walks_folder || '',
    '<External walk: your copy is <name> at <address>.>': external ? `Your copy is ${copyName} at ${copyAddr}.` : '',
    '<fetch line>': fetchLine(cfg),
    '<the Screens document | the journeys>': external ? 'the journeys' : 'the Screens document',
  };
  const text = fs.readFileSync(new URL('../../starting_texts/walking-session.md', import.meta.url), 'utf8');
  ctx.log(Object.entries(fill).reduce((t, [k, v]) => t.split(k).join(v), text));
  return 0;
}

// 23. walk areas: the round's candidate areas, for ARCH to choose from (build text 3, section 2).
export function walkAreas(ctx) {
  const cfg = loadConfig(ctx.root);
  const { records, round } = roundOf(ctx);
  const modules = loadModules(ctx.root, cfg);
  const byName = new Map(modules.map((m) => [m.name, m]));
  // Changed modules: the round's modules, plus those a notice was sent to (waiting-work).
  const changed = new Set((round.modules || []).map((m) => m.module));
  for (const w of records['waiting-work']?.data?.work || []) if (w.kind === 'notice') changed.add(w.module);
  // Users of a module: the later modules whose uses files name it (a place outside the standard that may refer to any
  // earlier module names every one); a module with no uses file yet, by the uses its entry in the module list declares.
  const providers = new Map(modules.map((m) => {
    const u = readUsesFile({ root: ctx.root, cfg }, m.name);
    return [m.name, hasUsesFile(u) ? providersOf(u) : new Set(m.uses || [])];
  }));
  const usersOf = (name) => modules.filter((m) => m.order > (byName.get(name)?.order ?? Infinity) && (providers.get(m.name).has(name) || providers.get(m.name).has('*'))).map((m) => m.name);

  const internal = new Map(); const external = new Map(); // page -> Set of "module (source)"
  const add = (map, page, label) => { if (!page) return; if (!map.has(page)) map.set(page, new Set()); map.get(page).add(label); };
  const areasOf = (name, seen = new Set()) => {
    if (seen.has(name)) return false; seen.add(name);
    const m = byName.get(name); if (!m) return false;
    let found = false;
    // Requirement-text endings.
    const req = readAt(ctx.root, requirementsFile(cfg, name)) || '';
    for (const mt of req.matchAll(/\(screen:\s*([^/)]+?)\s*(?:\/|\))/g)) { add(internal, mt[1].trim(), `${name} (requirement)`); found = true; }
    for (const mt of req.matchAll(/\(journey:\s*(.+?)\s+step\s+\d+\s*\)/g)) { add(external, mt[1].trim(), `${name} (requirement)`); found = true; }
    // Step headers under the module's walk/internal and walk/external folders.
    for (const line of stepHeaders(ctx.root, m)) {
      let mt = line.match(/^follows:\s*screen\s+([^/]+?)\s*\//i);
      if (mt) { add(internal, mt[1].trim(), `${name} (step header)`); found = true; continue; }
      mt = line.match(/^follows:\s*journey\s+([^/]+?)\s*\//i);
      if (mt) { add(external, mt[1].trim(), `${name} (step header)`); found = true; }
    }
    return found;
  };
  for (const name of changed) {
    if (areasOf(name)) continue;
    // Names none: take its users' areas, upward until some are found.
    const up = (n, seen = new Set()) => { for (const u of usersOf(n)) { if (seen.has(u)) continue; seen.add(u); if (!areasOf(u)) up(u, seen); } };
    up(name);
  }
  const print = (title, map) => {
    ctx.log(title);
    if (!map.size) { ctx.log('  (none)'); return; }
    for (const page of [...map.keys()].sort()) ctx.log(`  ${page} <- ${[...map.get(page)].sort().join(', ')}`);
  };
  ctx.log(`candidate areas for ${round.tranche} round ${round.round} (ARCH chooses, adds and removes):`);
  print('internal areas (screen pages):', internal);
  print('external areas (journeys):', external);
  return 0;
}

// The `follows:` header lines of a module's step files, under its tests paths in walk/internal and walk/external.
function stepHeaders(root, m) {
  const out = [];
  for (const base of m.tests || []) {
    for (const sub of ['walk/internal', 'walk/external']) {
      const dir = path.join(root, base, sub);
      let entries = [];
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
      for (const e of entries) {
        if (!e.isFile()) continue;
        let head = '';
        try { head = fs.readFileSync(path.join(dir, e.name), 'utf8').split('\n').slice(0, 8).join('\n'); } catch { continue; }
        for (const line of head.split('\n')) if (/^follows:/i.test(line.trim())) out.push(line.trim());
      }
    }
  }
  return out;
}

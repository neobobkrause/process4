// The uses file at work (design part 2, sections 7 and 9; build text 1b, commands 2, 27 and 28; build text 2c): `push`,
// and `test` where it merges the base in, rewrite the uses file of every module the branch changes against its base
// (a job's: its own module), where the branch changes the module list, of the modules it touches and their users, and
// where it changes the facility list, or moves to a Process4 version whose classification of the host's facilities
// differs from the one a file was written under, of every module (that file),
// from the code at the commit pushed, and carry it in the push; `uses <module>` writes one module's uses file into the
// checkout from the code there and prints what a conversion's first step lists.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { availableParallelism, freemem, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig, loadModules } from './config.mjs';
import { loadTree } from './notice/model.mjs';
import { readReferences, ANY } from './notice/refs.mjs';
import { moduleMeans } from './notice/means.mjs';
import { readerVersion, whileFilesStay } from './notice/ts.mjs';
import { facilitiesPath, readUses, sameUses, usesPath, writeUses } from './usesfile.mjs';
import { writeOut } from './notify.mjs';
import { fail, git } from './util.mjs';

const MODULE = /^[a-z0-9-]+$/;
const TOOL_DIR = dirname(fileURLToPath(new URL('../p4.mjs', import.meta.url)));
let toolCommit = null;
/** The tool's commit (build text 2c: the uses file's `written.tool`): the commit of the copy it runs from. */
export function toolVersion() {
  if (toolCommit) return toolCommit;
  const r = git(['rev-parse', 'HEAD'], { cwd: TOOL_DIR, allowFail: true });
  const version = JSON.parse(readFileSync(join(TOOL_DIR, 'package.json'), 'utf8')).version;
  toolCommit = r.code === 0 && /^[0-9a-f]{40}$/.test(r.stdout.trim()) ? r.stdout.trim() : `process4-tool ${version}`;
  return toolCommit;
}

const CLASSIFICATION = 'tool/lib/notice/facilities.json';
const classifications = new Map();
/**
 * The text of the classification of the host's facilities that the tool at a commit carries (notice/facilities.json),
 * read from the tool's own repository; null where that commit cannot be read there (then it counts as different).
 */
export function classificationAt(commit) {
  if (!commit) return null;
  if (!classifications.has(commit)) {
    let text = null;
    if (commit === toolVersion()) { try { text = readFileSync(join(TOOL_DIR, 'lib/notice/facilities.json'), 'utf8'); } catch { text = null; } }
    else if (/^[0-9a-f]{40}$/.test(commit)) { const r = git(['show', `${commit}:${CLASSIFICATION}`], { cwd: TOOL_DIR, allowFail: true }); text = r.code === 0 ? r.stdout : null; }
    classifications.set(commit, text);
  }
  return classifications.get(commit);
}

/**
 * The reading of one module and its uses file. The file holds what build text 2c states: the providers, the uses, the
 * places outside the standard (rule, file, side, line, what they may refer to, what they wait on, their tests; for a
 * kind written as a copy of another module's, the copy and the kind it copies), the
 * order faults and the hand-written copies in JSON files. The reading also holds what `uses` prints for a conversion:
 * what each place is, the marked copies and their drift, the candidate restated facts, the host facilities used.
 */
export function usesReading(tree, moduleId, commit) {
  const r = readReferences(tree, moduleId);
  const data = {
    module: r.module,
    written: { commit, tool: toolVersion() },
    providers: r.providers,
    uses: r.uses,
    outside: r.outside.map(({ rule, file, side, line, mayRefer, waitsOn, tests, item, relabels }) => ({ rule, file, side, line, ...(relabels ? { item, relabels } : {}), mayRefer, waitsOn, tests })),
    orderFaults: r.orderFaults,
    copies: r.copies,
    packages: r.packages,
    takesIn: moduleMeans(tree, moduleId).takesIn,
  };
  return { data, reading: { ...r, takesIn: data.takesIn } };
}
/** The uses file of one module, as the tool writes it. */
export const usesData = (tree, moduleId, commit) => usesReading(tree, moduleId, commit).data;

const READER = fileURLToPath(new URL('./usesworker.mjs', import.meta.url));
/**
 * How many processes read the uses files of n modules (civicsmith ARCH #28): one for up to 15 modules; otherwise one
 * for each 8 modules, up to four, as the machine's cores and free memory (2 GB a reader) allow.
 */
export const readersFor = (n) => Math.max(1, Math.min(4, Math.floor(n / 8), availableParallelism(), Math.floor(freemem() / 2 ** 31)));

/**
 * The uses file of each of the modules named, by module, from a product written out (a commit, which stays as it is
 * while it is read): read here, one module after another, with their programs sharing what they read of the files
 * (notice/ts.mjs, whileFilesStay); or, with more than one reader, in that many processes at once (usesworker.mjs), each
 * a share of the modules. Each module's file is the same either way: a module's reading depends on the product alone.
 * A module a reader did not give back is read here.
 */
export function readAllUses(tree, ids, commit, dir, readers = null) {
  const k = Math.min(readers ?? readersFor(ids.length), ids.length);
  const got = new Map();
  if (k > 1) {
    mkdirSync(dir, { recursive: true });
    const shares = Array.from({ length: k }, (_, i) => ids.filter((_, j) => j % k === i));
    const heap = process.execArgv.filter((a) => /^--(max-old-space-size|stack-size)=/.test(a));
    spawnSync(process.execPath, [...heap, READER], { input: JSON.stringify({ root: tree.root, commit, shares, out: dir }), stdio: ['pipe', 'ignore', 'pipe'], maxBuffer: 1 << 26 });
    for (const id of ids) { try { got.set(id, JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8'))); } catch { /* read here */ } }
  }
  const rest = ids.filter((id) => !got.has(id));
  if (rest.length) whileFilesStay(() => { for (const id of rest) got.set(id, usesData(tree, id, commit)); });
  return got;
}

/** Files changed between two commits. */
const changedFiles = (root, from, to) => git(['diff', '--name-only', '--no-renames', from, to], { cwd: root }).split('\n').filter(Boolean);

/**
 * The modules whose uses files a branch's change asks to rewrite (design part 2, sections 7 and 9): for a job, its own
 * module; otherwise each module whose code or tests differ from the base. Where the facility list differs from the base,
 * every module. Where the module list differs from the base
 * (an entry, the order), also the modules it touches (an entry changed, added or removed; a file whose owner changed)
 * and every module whose uses file names one of them, or a provider no longer in the list.
 */
function modulesToWrite(root, baseTree, headTree, base, head, job) {
  const files = changedFiles(root, base, head);
  const out = new Set();
  const ownerAt = (tree, f) => tree?.moduleOfFile(join(tree.root, f)) ?? null;
  if (job) { if (headTree.byId.has(job)) out.add(job); }
  else for (const f of files) { const m = ownerAt(headTree, f); if (m) out.add(m); }
  const dir = `${(headTree.cfg.process_folder || 'process/').replace(/\/?$/, '/')}modules/`;
  // A change to the facility list changes what every module's places outside the standard are (R14): every module's
  // uses file is rewritten in the same push (design part 2, section 7).
  if (files.includes(facilitiesPath(headTree.cfg))) for (const m of headTree.modules) out.add(m.id);
  // A move to a Process4 version (process.json's process commit changed): every uses file written under a tool whose
  // classification of the host's facilities differs from this tool's is rewritten (design part 2, section 7).
  if (files.includes('process.json') && baseTree && JSON.stringify(baseTree.cfg.process ?? null) !== JSON.stringify(headTree.cfg.process ?? null)) {
    const mine = classificationAt(toolVersion());
    for (const m of headTree.modules) {
      const d = readUses(headTree.root, m.id, { cfg: headTree.cfg });
      if (!d || classificationAt(d.written?.tool) !== mine) out.add(m.id);
    }
  }
  const listChanged = files.some((f) => f.startsWith(dir) && (f.endsWith('.json') && !f.endsWith('.uses.json') && !f.endsWith('facilities.json') || f.endsWith('order.txt')));
  if (!listChanged || !baseTree) return out;
  const touched = new Set();
  const ids = (t) => new Map(t.modules.map((m) => [m.id, JSON.stringify({ files: m.entry.files, tests: m.entry.tests, public: m.entry.public })]));
  const before = ids(baseTree), after = ids(headTree);
  for (const [id, e] of after) if (before.get(id) !== e) touched.add(id);
  const gone = [...before.keys()].filter((id) => !after.has(id));
  for (const id of gone) touched.add(id);
  // a file whose owner changed: an item moved from one module to another
  const all = git(['ls-tree', '-r', '--name-only', head], { cwd: root }).split('\n').filter(Boolean);
  for (const f of all) { const a = ownerAt(baseTree, f), b = ownerAt(headTree, f); if (a !== b) { if (a) touched.add(a); if (b) touched.add(b); } }
  for (const id of touched) if (headTree.byId.has(id)) out.add(id);
  // every user whose uses file names a moved or renamed item: one that names a touched module, or one gone
  for (const m of headTree.modules) {
    const d = readUses(headTree.root, m.id, { cfg: headTree.cfg });
    const named = new Set([...(d?.providers ?? []), ...(d?.uses ?? []).map((u) => u.provider), ...(d?.orderFaults ?? []).map((u) => u.provider)]);
    if ([...touched].some((t) => named.has(t))) out.add(m.id);
  }
  return out;
}

/**
 * Before a push, and in `test` after it merges the base in (build text 1b, commands 2 and 27): rewrites, from HEAD, the
 * uses files the branch's change asks for (modulesToWrite) where they differ from what the files hold, and commits
 * them. Returns the modules written. No check of a file is made. `readers`: how many processes read the modules (by
 * default, readersFor).
 */
export function writeUsesFiles(ctx, branch, { job = null, base = null, readers = null } = {}) {
  const root = ctx.root;
  const cfg = loadConfig(root, 'HEAD');
  if (!cfg || !loadModules(root, cfg, 'HEAD').length) return [];
  const head = git(['rev-parse', 'HEAD'], { cwd: root });
  const has = (sha) => /^[0-9a-f]{40}$/.test(sha || '') && git(['cat-file', '-e', `${sha}^{commit}`], { cwd: root, allowFail: true }).code === 0;
  const tipOf = (b) => {
    const line = git(['ls-remote', '--heads', 'origin', `refs/heads/${b}`], { cwd: root, allowFail: true });
    const sha = line.code === 0 ? line.stdout.split(/\s/)[0] : '';
    if (sha && !has(sha)) git(['fetch', '-q', 'origin', `refs/heads/${b}`], { cwd: root, allowFail: true });
    return has(sha) ? sha : null;
  };
  // the base: where the branch's change starts, against the branch pull requests go into
  if (!base) {
    const into = tipOf(cfg.tranche_branch) ?? tipOf('main');
    const mb = into ? git(['merge-base', into, head], { cwd: root, allowFail: true }) : null;
    base = mb?.code === 0 ? mb.stdout.trim() : null;
  } else {
    const mb = git(['merge-base', base, head], { cwd: root, allowFail: true });
    base = mb.code === 0 ? mb.stdout.trim() : base;
  }
  const tmp = mkdtempSync(join(tmpdir(), 'p4-uses-'));
  const written = [];
  try {
    const headTree = loadTree(writeOut(root, head, tmp));
    let baseTree = null;
    if (base && base !== head && loadConfig(root, base) && loadModules(root, loadConfig(root, base), base).length) baseTree = loadTree(writeOut(root, base, tmp));
    const mods = base ? modulesToWrite(root, baseTree, headTree, base, head, job) : new Set(job && headTree.byId.has(job) ? [job] : []);
    const ids = headTree.modules.map((m) => m.id).filter((x) => mods.has(x));
    const read = readAllUses(headTree, ids, head, join(tmp, 'uses-read'), readers);
    for (const id of ids) {
      const data = read.get(id);
      const before = readUses(root, id, { cfg: headTree.cfg, ref: 'HEAD' });
      // the same file, unless it was written under a classification of the host's facilities other than this tool's
      if (sameUses(before, data) && classificationAt(before?.written?.tool) === classificationAt(toolVersion())) continue;
      written.push({ module: id, file: writeUses(root, id, data, { cfg: headTree.cfg }), data });
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  if (!written.length) return [];
  const who = git(['config', 'user.email'], { cwd: root, allowFail: true }).stdout?.trim() ? [] : ['-c', 'user.name=Claude', '-c', 'user.email=noreply@anthropic.com'];
  git(['add', '--', ...written.map((w) => w.file)], { cwd: root });
  git([...who, 'commit', '-q', '-m', `Uses files of ${written.map((w) => w.module).join(', ')}, written by the tool from ${head.slice(0, 10)}`, '--', ...written.map((w) => w.file)], { cwd: root });
  for (const w of written) {
    ctx.log(`wrote ${w.file}: ${w.data.providers.length} provider(s), ${w.data.uses.length} use(s), ${w.data.outside.length} place(s) outside the standard, ${w.data.orderFaults.length} order fault(s)`);
  }
  return written.map((w) => w.module);
}

const placeText = (w) => `${w.file}:${w.line}${w.test ? ` test "${w.test}"` : w.in ? ` in ${w.in}` : ''}`;
const routeText = (r) => (r === 'direct' ? 'direct' : `via ${r.via} ${r.item}`);
const mayText = (m) => (m.includes(ANY) ? 'every earlier module' : m.length ? m.join(', ') : 'no other module');

/** What a conversion's first step lists (build text 2c, "The conversion", step 1), from a module's reading. */
export function printedUses(r) {
  const L = [`Uses of ${r.module}`];
  L.push(`providers: ${r.providers.join(', ') || 'none'}`);
  L.push(`references in standard form (${r.uses.length}):`);
  for (const u of r.uses) {
    const value = u.value === 'member' ? `, member ${u.member}` : u.value === 'none' ? ', no member used' : u.value ? `, ${u.value === 'whole' ? 'the whole value' : 'the whole value handed back'}` : '';
    L.push(`  ${u.provider} ${u.item} (${u.itemKind}): ${u.type}${value}, ${routeText(u.route)}${u.standard ? '' : ', not by a standard form'}`);
    for (const w of u.where) L.push(`      ${placeText(w)}`);
  }
  const byRule = new Map();
  for (const o of r.outside) byRule.set(o.rule, (byRule.get(o.rule) ?? 0) + 1);
  L.push(`places outside the standard (${r.outside.length}${byRule.size ? `: ${[...byRule].sort().map(([k, n]) => `${k} ${n}`).join(', ')}` : ''}):`);
  for (const o of r.outside) {
    L.push(`  ${o.rule} ${o.file}:${o.line} (${o.side}) ${o.what}`);
    L.push(`      may refer to ${mayText(o.mayRefer)}; waits on ${o.waitsOn}${o.tests.length ? `; tests: ${o.tests.map((t) => `"${t}"`).join(', ')}` : ''}`);
  }
  L.push(`order faults, for ARCH (${r.orderFaults.length}):`);
  for (const o of r.orderFaults) L.push(`  ${o.provider} ${o.item} (${o.type}) at ${placeText(o)}: ${o.provider} is later in the order`);
  L.push(`marked copies (${r.marked.length}):`);
  for (const c of r.marked) L.push(`  ${c.provider} ${c.item} at ${placeText(c)}, marked ${c.marked}${c.differs ? `; differs: ${JSON.stringify(c.differs.here)} here, ${JSON.stringify(c.differs.provider)} in ${c.provider}` : ''}`);
  L.push(`copies in JSON files, kept as written (${r.copies.length}):`);
  for (const c of r.copies) L.push(`  ${c.file}${c.pointer}: ${c.provider} ${c.item}`);
  L.push(`candidate restated facts: written-out values exactly equal to an earlier module's (${r.candidates.length}):`);
  for (const c of r.candidates) L.push(`  ${c.provider} ${c.item} at ${placeText(c)}${c.pointer ? ` ${c.pointer}` : ''}`);
  const waits = [...new Set(r.outside.map((o) => o.waitsOn).filter((w) => !/^this module/.test(w)))];
  L.push(`what the conversion needs first (${waits.length}):`);
  for (const w of waits) L.push(`  ${w}`);
  L.push(`host facilities used (${r.facilities.length}): ${r.facilities.join(', ') || 'none'}`);
  const byPackage = new Map();
  for (const x of r.packages ?? []) byPackage.set(x.package, [...(byPackage.get(x.package) ?? []), x.facility]);
  L.push(`packages used (${byPackage.size}): ${[...byPackage].map(([p, f]) => `${p} (${f.length})`).join(', ') || 'none'}`);
  L.push(`what its items take in of their providers (${r.takesIn?.length ?? 0}):`);
  for (const t of r.takesIn ?? []) L.push(`  ${t.item}: the ${t.part} of ${t.provider} ${t.providerItem}`);
  return L.join('\n');
}

// 28. uses <module>: reads the module's code and tests in the checkout, writes its uses file into the checkout, and
// prints what a conversion's first step lists. Writes nothing to GitHub.
export function usesCmd(ctx, moduleId) {
  if (!MODULE.test(moduleId || '')) fail('name the module');
  if (!existsSync(join(ctx.root, 'process.json'))) fail('this checkout has no process.json');
  const tree = loadTree(ctx.root);
  if (!tree.byId.has(moduleId)) fail(`no module is named ${moduleId}`);
  const want = tree.cfg.language_reader;
  if (want?.version && want.version !== readerVersion()) ctx.log(`note: process.json names ${want.name ?? 'typescript'} ${want.version}; this copy of the tool reads with TypeScript ${readerVersion()}`);
  const head = git(['rev-parse', 'HEAD'], { cwd: ctx.root, allowFail: true });
  const { data, reading } = usesReading(tree, moduleId, head.code === 0 ? head.stdout.trim() : null);
  const before = readUses(ctx.root, moduleId, { cfg: tree.cfg });
  const file = usesPath(tree.cfg, moduleId);
  if (!sameUses(before, data)) writeUses(ctx.root, moduleId, data, { cfg: tree.cfg });
  ctx.log(printedUses(reading));
  ctx.log(`${sameUses(before, data) ? 'unchanged' : 'written'}: ${file}, from the code in the checkout; push carries it`);
  return 0;
}

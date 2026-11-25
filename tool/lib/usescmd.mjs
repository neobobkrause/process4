// The uses file at work (design part 2, section 7, "Who uses what"; build text 1b, commands 2 and 28): `push` rewrites
// the uses file of every module whose code or tests the push changes, from the code as pushed, and carries it in the
// push; `uses <module>` prints what the tool reads in a module, for a conversion job, and writes nothing.
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadConfig, loadModules } from './config.mjs';
import { loadTree } from './notice/model.mjs';
import { readReferences, ANY } from './notice/refs.mjs';
import { readerVersion } from './notice/ts.mjs';
import { readUses, sameUses, usesPath, writeUses } from './usesfile.mjs';
import { writeOut } from './notify.mjs';
import { fail, git } from './util.mjs';

const MODULE = /^[a-z0-9-]+$/;
const TOOL_VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

/** What the tool writes: the reading, with the commit it was read at and the tool that read it. */
export function usesData(tree, moduleId, commit) {
  const r = readReferences(tree, moduleId);
  return {
    module: r.module,
    written: { commit, tool: `process4-tool ${TOOL_VERSION}, typescript ${readerVersion()}` },
    providers: r.providers, uses: r.uses, outside: r.outside, orderFaults: r.orderFaults, copies: r.copies, facilities: r.facilities,
  };
}

/** The modules whose files differ between two commits (either side's module list), in module order. */
function changedModules(tree, root, from, to) {
  const names = new Set();
  const files = git(['diff', '--name-only', '--no-renames', from, to], { cwd: root }).split('\n').filter(Boolean);
  for (const f of files) { const m = tree.moduleOfFile(join(tree.root, f)); if (m) names.add(m); }
  return tree.modules.map((m) => m.id).filter((id) => names.has(id));
}

/**
 * Before a push (build text 1b, command 2): rewrites, from HEAD as it will be pushed, the uses file of each module whose
 * code or tests the push changes (against the branch as it stands on origin, or, for a new branch, against the branch
 * pull requests go into), and of a job's own module, and commits the files that changed. Returns the modules written.
 * Adds no check of the file: it is written, never judged.
 */
export function writeUsesFiles(ctx, branch, { job = null } = {}) {
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
  let from = tipOf(branch);
  if (!from) {
    const base = tipOf(cfg.tranche_branch) ?? tipOf('main');
    const mb = base ? git(['merge-base', base, head], { cwd: root, allowFail: true }) : null;
    from = mb?.code === 0 ? mb.stdout.trim() : null;
  }
  const tmp = mkdtempSync(join(tmpdir(), 'p4-uses-'));
  const written = [];
  try {
    const tree = loadTree(writeOut(root, head, tmp));
    const mods = new Set(from ? changedModules(tree, root, from, head) : []);
    if (job && tree.byId.has(job)) mods.add(job);
    for (const id of tree.modules.map((m) => m.id).filter((x) => mods.has(x))) {
      const data = usesData(tree, id, head);
      const before = readUses(root, id, { cfg: tree.cfg, ref: 'HEAD' });
      if (sameUses(before, data)) continue;
      written.push({ module: id, file: writeUses(root, id, data, { cfg: tree.cfg }), data });
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  if (!written.length) return [];
  git(['add', '--', ...written.map((w) => w.file)], { cwd: root });
  git(['commit', '-q', '-m', `Uses files of ${written.map((w) => w.module).join(', ')}, written by the tool from ${head.slice(0, 10)}`, '--', ...written.map((w) => w.file)], { cwd: root });
  for (const w of written) {
    ctx.log(`wrote ${w.file}: ${w.data.providers.length} provider(s), ${w.data.uses.length} use(s), ${w.data.outside.length} place(s) outside the standard, ${w.data.orderFaults.length} order fault(s), ${w.data.copies.length} cop${w.data.copies.length === 1 ? 'y' : 'ies'}`);
  }
  return written.map((w) => w.module);
}

const placeText = (w) => `${w.file}:${w.line}${w.test ? ` test "${w.test}"` : w.in ? ` in ${w.in}` : ''}`;
const routeText = (r) => (r === 'direct' ? 'direct' : `via ${r.via} ${r.item}`);
const mayText = (m) => (m.includes(ANY) ? 'every earlier module' : m.length ? m.join(', ') : 'no other module');

/** The reading in printed form (build text 1b, command 28). */
export function printedUses(d) {
  const L = [`Uses of ${d.module}`];
  L.push(`providers: ${d.providers.join(', ') || 'none'}`);
  L.push(`uses (${d.uses.length}):`);
  for (const u of d.uses) {
    L.push(`  ${u.provider} ${u.item} (${u.itemKind}): ${u.type}, ${routeText(u.route)}${u.standard ? '' : ', not by a standard form'}`);
    for (const w of u.where) L.push(`      ${placeText(w)}`);
  }
  const byRule = new Map();
  for (const o of d.outside) byRule.set(o.rule, (byRule.get(o.rule) ?? 0) + 1);
  L.push(`outside the standard (${d.outside.length}${byRule.size ? `: ${[...byRule].sort().map(([r, n]) => `${r} ${n}`).join(', ')}` : ''}):`);
  for (const o of d.outside) {
    L.push(`  ${o.rule} ${o.file}:${o.line} (${o.side}) ${o.what}`);
    L.push(`      may refer to ${mayText(o.mayRefer)}; waits on ${o.waitsOn}${o.tests.length ? `; tests: ${o.tests.map((t) => `"${t}"`).join(', ')}` : ''}`);
  }
  L.push(`order faults (${d.orderFaults.length}):`);
  for (const o of d.orderFaults) L.push(`  ${o.provider} ${o.item} (${o.type}) at ${placeText(o)}: ${o.provider} is later in the order`);
  L.push(`copies (${d.copies.length}):`);
  for (const c of d.copies) {
    if (c.of) { L.push(`  ${c.file}${c.pointer}: a copy of ${c.of} (hand-written)`); continue; }
    L.push(`  ${c.provider} ${c.item} at ${placeText(c)}${c.pointer ? ` ${c.pointer}` : ''}${c.marked ? ` marked ${c.marked}` : ', unmarked: obtain it from its owner, or mark it'}${c.differs ? `; differs: ${JSON.stringify(c.differs.here)} here, ${JSON.stringify(c.differs.provider)} in ${c.provider}` : ''}`);
  }
  L.push(`host facilities used (${d.facilities.length}): ${d.facilities.join(', ') || 'none'}`);
  return L.join('\n');
}

// 28. uses <module> [--at <commit>] [--json]: reads only; writes nothing, to GitHub or to the checkout.
export function usesCmd(ctx, moduleId, a) {
  if (!MODULE.test(moduleId || '')) fail('name the module');
  const at = typeof a.at === 'string' ? a.at : 'HEAD';
  const r = git(['rev-parse', '--verify', '-q', `${at}^{commit}`], { cwd: ctx.root, allowFail: true });
  if (r.code !== 0) fail(`${at} is not a commit here`);
  const sha = r.stdout.trim();
  const base = mkdtempSync(join(tmpdir(), 'p4-read-'));
  try {
    const tree = loadTree(writeOut(ctx.root, sha, base));
    if (!tree.byId.has(moduleId)) fail(`no module is named ${moduleId}`);
    const want = tree.cfg.language_reader;
    if (want?.version && want.version !== readerVersion()) ctx.log(`note: process.json names ${want.name ?? 'typescript'} ${want.version}; this copy of the tool reads with TypeScript ${readerVersion()}`);
    const d = usesData(tree, moduleId, sha);
    if (a.json) ctx.log(JSON.stringify(d, null, 2));
    else {
      ctx.log(`${printedUses(d)}\nread at ${sha.slice(0, 10)}; the file is ${usesPath(tree.cfg, moduleId)}, written by push`);
    }
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
  return 0;
}

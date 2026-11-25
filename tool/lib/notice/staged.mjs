// The notice read in stages (notify on a large product, civicsmith, 23 Nov 2026: a whole product read before and after
// a merge ran out of memory). The rules and the answers are the whole reading's (notice.mjs); only what is read
// changes:
// 1. the changed module's listing before and after, each from a program over its own files and what they import; the
//    same listing tells nobody, and no user is read;
// 2. otherwise only the later modules that can use it (build text 5, section 6: every later module counts, declared or
//    not) are read, one at a time, each from a program over its own files and what they import. A later module that
//    can use it is one whose files reach a file of the changed module by their imports, followed file to file by
//    relative path, directly or through any other files; one with an import the scan cannot follow; one that declares
//    a module that may change; and, where operations or tables are in play, one that reaches a carrier (build text 2b,
//    section 5) or a module that answers operations or owns tables. A module that is none of these cannot use it;
// 3. the parsed files are kept between programs of one side; each program, and its type checker, goes before the next.
// Made faster without changing an answer (the owner's decision B of 25 Nov 2026; an early provider's notice on
// civicsmith took most of an hour):
// 4. the later modules are read in batches of BATCH, one program for each batch, not one for each module; never the
//    whole product in one program, which ran out of memory on civicsmith (23 Nov 2026);
// 5. each file's plain kinds, written out from its declarations, are kept for the side (listing.mjs), not written out
//    again for each program;
// 6. the users' code after the change is read only where it can add a use: where operations or tables are in play,
//    where an entry is new or renamed (a call by a new name is seen only after it), or where the user's own files
//    changed; otherwise the uses read before the change are the uses.
import fs from 'node:fs';
import path from 'node:path';
import { builtinModules } from 'node:module';
import { ts, loadReader, options, makeProgram } from './ts.mjs';
import { makeLister } from './listing.mjs';
import { makeUsage } from './usage.mjs';

/** How many later modules one program reads at once. */
export const BATCH = 20;

const UNRESOLVED = Symbol('cannot follow');
// Import specifiers written out: static imports and exports from, @import in comments, import("...") in code and in
// comment kinds, side-effect imports, require. Read over the whole text, comments too: reading too much only reads more.
const SPECS = [/\bfrom\s*(['"])([^'"\n]+)\1/g, /\bimport\s*\(\s*(['"])([^'"\n]+)\1/g, /\bimport\s*(['"])([^'"\n]+)\1/g, /\brequire\s*\(\s*(['"])([^'"\n]+)\1/g];
// An import or require of a name not written out: the scan cannot follow it.
const COMPUTED = /\b(?:import|require)\s*\((?=\s*[^\s'"])/;
const CARRIER = /@carries(?:op|table)\b/;
const OWNS_NAMES = /@(?:optable|storedrows)\b/;
const REEXPORT = /\bexport\s*(?:\*|\{)/;
const BUILTIN = new Set(builtinModules);

/** The product's own package: its root package.json read once ({} where it has none or cannot be read). */
export function ownPackage(root) {
  try { return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) ?? {}; } catch { return {}; }
}

/** The files a product's files import, followed by relative path without the reader. */
export function makeReach(tree) {
  const own = ownPackage(tree.root).name ?? null;
  const isFile = (f) => { try { return fs.statSync(f).isFile(); } catch { return false; } };
  function resolve(spec, from) {
    if (spec.startsWith('.') || spec.startsWith('/')) {
      const base = path.resolve(path.dirname(from), spec);
      const tries = [base, `${base}.mjs`, `${base}.js`, `${base}.cjs`, `${base}.ts`, `${base}.mts`, `${base}.json`,
        base.replace(/\.js$/, '.ts'), base.replace(/\.mjs$/, '.mts'), base.replace(/\.cjs$/, '.cts'),
        path.join(base, 'index.mjs'), path.join(base, 'index.js'), path.join(base, 'index.ts')];
      return tries.find(isFile) ?? UNRESOLVED;
    }
    if (spec.startsWith('node:') || BUILTIN.has(spec.split('/')[0])) return null;
    // the package's own imports map, or the product named by its own package name: not followed here
    if (spec.startsWith('#') || (own && (spec === own || spec.startsWith(`${own}/`)))) return UNRESOLVED;
    return null; // a package from outside the product
  }
  const files = new Map(); // file -> { deps, unresolved, carrier, ownsNames, reexport }
  function scan(file) {
    if (files.has(file)) return files.get(file);
    let text = '';
    try { text = fs.readFileSync(file, 'utf8'); } catch { text = ''; }
    const deps = new Set();
    let unresolved = COMPUTED.test(text);
    if (!file.endsWith('.json')) {
      for (const re of SPECS) {
        re.lastIndex = 0;
        for (let m; (m = re.exec(text));) {
          const r = resolve(m[2], file);
          if (r === UNRESOLVED) unresolved = true;
          else if (r) deps.add(r);
        }
      }
    } else unresolved = false;
    const rec = { deps: [...deps], unresolved, carrier: CARRIER.test(text), ownsNames: OWNS_NAMES.test(text), reexport: REEXPORT.test(text) };
    files.set(file, rec);
    return rec;
  }
  /** Every file the roots reach, the roots too, and whether any import on the way cannot be followed. */
  function closure(roots) {
    const seen = new Set();
    const todo = [...roots];
    let unresolved = false;
    while (todo.length) {
      const f = todo.pop();
      if (seen.has(f)) continue;
      seen.add(f);
      const r = scan(f);
      if (r.unresolved) unresolved = true;
      for (const d of r.deps) if (!seen.has(d)) todo.push(d);
    }
    return { files: seen, unresolved };
  }
  return { closure, scan, resolve };
}

/** Programs that share the files they have parsed, for one side; the lib files are shared by both sides. */
function makeHost(side, libCache) {
  const host = ts.createCompilerHost(options());
  const get = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, how, onError, fresh) => {
    const cache = path.resolve(fileName).startsWith(side.tree.root + path.sep) ? side.parsed : libCache;
    const key = `${fileName}|${typeof how === 'object' ? `${how.languageVersion}|${how.impliedNodeFormat}` : how}`;
    if (!fresh && cache.has(key)) return cache.get(key);
    const sf = get(fileName, how, onError, fresh);
    if (sf) cache.set(key, sf);
    return sf;
  };
  return host;
}

/**
 * The files a program built from `roots` alone would hold: the roots, and every file their imports resolve to, followed
 * through the given program (the same reader, settings and files resolve each import the same way in any program).
 */
function heldBy(program, roots) {
  const held = new Set();
  const todo = [...roots];
  while (todo.length) {
    const f = todo.pop();
    if (held.has(f)) continue;
    held.add(f);
    const sf = program.getSourceFile(f);
    if (!sf) continue;
    for (const spec of sf.imports ?? []) {
      const to = program.getResolvedModuleFromModuleSpecifier(spec, sf)?.resolvedModule?.resolvedFileName;
      if (to && !held.has(to)) todo.push(to);
    }
    for (const ref of sf.referencedFiles ?? []) todo.push(path.resolve(path.dirname(f), ref.fileName));
  }
  return held;
}

/**
 * The staged reader of one notice: what notice.mjs's noticeWith asks of a reading.
 * @param treeB the product before the change
 * @param treeA the product after it
 * @param differs (module, listing before, listing after) => whether the two listings differ (notice.mjs's comparison)
 * @param addsNames (module, listing before, listing after) => whether an entry is new or renamed (a use by its name can
 *   be seen only in the code after the change)
 */
export function stagedReader(treeB, treeA, provider, confirm, differs, addsNames) {
  loadReader();
  const libCache = new Map();
  const side = (tree) => ({ tree, reach: makeReach(tree), parsed: new Map(), plainKinds: new Map(), listings: new Map(), uses: new Map() });
  const S = { B: side(treeB), A: side(treeA) };
  for (const s of Object.values(S)) s.host = makeHost(s, libCache);
  const order = treeA.modules.map((m) => m.id);
  const pIndex = order.indexOf(provider);
  const through = new Set(); // later modules whose listing may change through the provider
  const candidates = new Set(); // later modules that can use what changed
  let flagged = []; // modules that may answer operations or own tables
  let opsInPlay = false;
  let afterUses = true; // whether the users' code after the change was read for uses with side A's batches

  /** A module's listing on one side, from a program over its own source files and what they import. */
  function listing(s, id) {
    const x = S[s];
    if (x.listings.has(id)) return x.listings.get(id);
    const mod = x.tree.byId.get(id);
    if (!mod) return undefined;
    const program = makeProgram(mod.src, x.host);
    const l = makeLister(program, x.tree, { plainKinds: x.plainKinds }).list(mod);
    x.listings.set(id, l);
    return l;
  }

  // What a module's files reach, on one side: from its source files (for its listing) or all its files (for its uses).
  const closures = new Map();
  const closureOf = (s, id, which) => {
    const key = `${s}|${id}|${which}`;
    if (!closures.has(key)) {
      const mod = S[s].tree.byId.get(id);
      closures.set(key, mod ? S[s].reach.closure(which === 'src' ? mod.src : mod.files) : null);
    }
    return closures.get(key);
  };
  /** Does a module reach a file of one of the given modules, on either side? */
  const reaches = (id, which, targets) => ['B', 'A'].some((s) => {
    const c = closureOf(s, id, which);
    if (!c) return false;
    for (const f of c.files) { const m = S[s].tree.moduleOfFile(f); if (m && m !== id && targets.has(m)) return true; }
    return false;
  });
  const unresolvedIn = (id) => ['B', 'A'].some((s) => !!closureOf(s, id, 'files')?.unresolved);
  const reachesCarrier = (id) => ['B', 'A'].some((s) => [...(closureOf(s, id, 'files')?.files ?? [])].some((f) => S[s].reach.scan(f).carrier));

  /**
   * A user's uses on one side, from a program that holds its files: every listing read so far that may matter, in
   * module order (the operations' and tables' owners as the whole reading finds them), those read before the side's
   * batches and those of the modules up to the user.
   */
  function usesFrom(s, program, mod, before) {
    const x = S[s];
    const at = order.indexOf(mod.id);
    const ls = new Map(order.filter((m) => x.listings.has(m) && (before.has(m) || order.indexOf(m) <= at) && (m === provider || through.has(m) || (opsInPlay && flagged.includes(m))))
      .map((m) => [m, x.listings.get(m)]));
    return makeUsage(program, x.tree, ls).usesOf(mod);
  }

  /** A user's uses after the change, read when first asked (point 6): one program over its own files. */
  function usesAfter(id) {
    const x = S.A;
    if (x.uses.has(id) || !candidates.has(id) || !x.tree.byId.get(id)) return x.uses.get(id);
    const mod = x.tree.byId.get(id);
    x.uses.set(id, usesFrom('A', makeProgram(mod.files, x.host), mod, new Set()));
    x.parsed.clear();
    return x.uses.get(id);
  }

  /** Whether a module's own files differ before and after the change (a merge that changed it too). */
  const ownChanged = new Map();
  function filesChanged(id) {
    if (!ownChanged.has(id)) {
      const b = treeB.byId.get(id), a = treeA.byId.get(id);
      const rel = (t, f) => path.relative(t.root, f);
      const read = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } };
      ownChanged.set(id, !b || !a || b.files.length !== a.files.length
        || a.files.some((f, i) => rel(treeA, f) !== rel(treeB, b.files[i]) || read(f) !== read(b.files[i])));
    }
    return ownChanged.get(id);
  }

  /** Decides what to read, once the provider's listing has changed, and reads it: side B whole, then side A. */
  function prepare() {
    const later = order.slice(pIndex + 1);
    const pSet = new Set([provider]);
    for (const id of later) if (reaches(id, 'src', pSet)) through.add(id);
    // Modules that may list operations or tables: the comment that makes them is in their own source, or a public file
    // passes on what another file holds.
    const flag = new Set();
    for (const s of ['B', 'A']) {
      for (const mod of S[s].tree.modules) {
        const R = S[s].reach;
        if (mod.src.some((f) => R.scan(f).ownsNames)) { flag.add(mod.id); continue; }
        if (mod.public.some((f) => R.scan(f).reexport) && [...R.closure(mod.public).files].some((f) => R.scan(f).ownsNames)) flag.add(mod.id);
      }
    }
    flagged = order.filter((id) => flag.has(id));
    const hasNames = (l) => !!l && Object.keys(l.entries).some((n) => n.startsWith('op:') || n.startsWith('table:'));
    // Operations and tables are in play where a module that may change has them: the provider, or a later module that
    // may list them whose listing changes through the provider (read first, from its source files alone).
    const changes = (id) => { const b = listing('B', id), a = listing('A', id); return !!b && !!a && differs(id, b, a); };
    opsInPlay = hasNames(listing('B', provider)) || hasNames(listing('A', provider)) || [...through].some((id) => flag.has(id) && changes(id));
    const mayChange = new Set([provider, ...through, ...(opsInPlay ? flagged : [])]);
    for (const id of later) {
      const mod = treeA.byId.get(id);
      const declared = [...new Set([...(mod?.uses ?? []), ...(treeB.byId.get(id)?.uses ?? [])])];
      if (reaches(id, 'files', mayChange) || declared.some((u) => mayChange.has(u)) || unresolvedIn(id) || (opsInPlay && reachesCarrier(id))) candidates.add(id);
    }
    // The code after the change adds a use only by a name new or renamed in it, by operations or tables, or where the
    // user's own files changed (notice.mjs reads it then); otherwise it is not read for uses here.
    afterUses = opsInPlay || addsNames(provider, listing('B', provider), listing('A', provider));
    for (const s of ['B', 'A']) {
      const x = S[s];
      if (opsInPlay) for (const id of flagged) listing(s, id);
      // The listings read before this side's batches: a user is given these and those of the modules up to itself, as
      // when the later modules were read one at a time, in order.
      const before = new Set(x.listings.keys());
      const readsUses = (id) => candidates.has(id) && (s === 'B' || afterUses);
      const work = later.filter((id) => x.tree.byId.get(id) && (through.has(id) || readsUses(id)));
      for (let b = 0; b < work.length; b += BATCH) {
        const batch = work.slice(b, b + BATCH);
        // Each module's own program would read its own files (its source alone, where it is only listed) and what they import.
        const rootsOf = (id) => (candidates.has(id) ? x.tree.byId.get(id).files : x.tree.byId.get(id).src);
        const program = makeProgram([...new Set(batch.flatMap(rootsOf))], x.host);
        const lister = makeLister(program, x.tree, { plainKinds: x.plainKinds });
        for (const id of batch) {
          const mod = x.tree.byId.get(id);
          if (through.has(id) && !x.listings.has(id)) x.listings.set(id, lister.list(mod, { holds: heldBy(program, rootsOf(id)) }));
          if (readsUses(id)) x.uses.set(id, usesFrom(s, program, mod, before));
        }
      }
      x.parsed.clear();
    }
    libCache.clear();
  }

  return {
    B: { tree: treeB },
    A: { tree: treeA },
    staged: true,
    listing,
    confirm,
    prepare,
    mayChangeThrough: (id) => through.has(id),
    isCandidate: (id) => candidates.has(id),
    /** A user's uses on one side; after the change, read when first asked where the batches did not read them. */
    uses: (s, id) => (s === 'A' && !afterUses ? usesAfter(id) : S[s].uses.get(id)),
    /** Whether the users' code after the change may add a use for this user (point 6). */
    readsAfter: (id) => afterUses || filesChanged(id),
    opsInPlay: () => opsInPlay,
    /** The listings after the change of every module that may answer operations, in module order. */
    opListings: (s) => new Map((opsInPlay ? flagged : []).concat([provider, ...through]).filter((id, i, a) => a.indexOf(id) === i)
      .sort((a, b) => order.indexOf(a) - order.indexOf(b)).map((id) => [id, listing(s, id)]).filter(([, l]) => l)),
    /** Lets go of the parsed files, once the reading is done. */
    release() { for (const s of Object.values(S)) { s.parsed.clear(); s.plainKinds.clear(); } libCache.clear(); },
  };
}

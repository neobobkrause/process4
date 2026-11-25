// Builds the tool's classification of the host's facilities (build text 2c, "Facilities"; R14), facilities.json beside
// this file: every facility the declarations the tool pins describe, by its qualified name as the reference reader
// (refs.mjs) names a use of it, `in` the process or reaching `out`. Run by PROCESS when the pinned reader or the host
// descriptions change: `node tool/lib/notice/facilities-build.mjs`. Never run on a product's work.
//
// What it is built from:
// - the declarations the tool pins: the language's own library at the reader's version (TypeScript's lib files that
//   ts.mjs's settings name: the language's facilities, ECMA-262, every one `in` the process), and the tool's two
//   descriptions of Node 22 (node.d.ts, host.d.ts), which name each Node facility a product may use;
// - Node's documentation (nodejs.org/docs/latest-v22.x/api), read for each module the descriptions declare: a facility
//   reaches `out` where it reads or writes something outside the process's own memory (files, other processes and
//   threads, streams, the terminal, the network, the environment, the host's settings and the module loader); every
//   other facility (paths and URLs as text, hashing, events, timers, assertions, the test runner) stays `in`. The rule
//   is written below as OUT, by module and by the names of the host's own objects.
// - workerd: the tool pins no description of workerd's facilities yet, so none is classified; a product's use of one is a
//   place outside the standard until its description is added here.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ts, loadReader, options, NODE_DESCRIPTION, HOST_DESCRIPTION } from './ts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const FACILITIES_FILE = path.join(HERE, 'facilities.json');

/** Node's modules whose facilities reach out of the process (Node's documentation, v22). */
const OUT_MODULES = ['node:fs', 'node:fs/promises', 'node:child_process', 'node:worker_threads', 'node:readline', 'node:process', 'node:os', 'node:module', 'node:vm', 'node:net', 'node:http', 'node:https', 'node:dns', 'node:dgram', 'node:tls', 'node:cluster', 'node:repl', 'node:tty', 'node:inspector', 'node:v8'];
/** The host's own objects whose members reach out: the process, the console, child processes and their streams, threads' ports. */
const OUT_OBJECTS = ['process', 'NodeProcess', 'console', 'NodeConsole', 'NodeChild', 'NodeReadable', 'NodeWritable', 'NodeMessagePort', 'NodeWorker', 'fetch'];

/** Whether a facility, by its listed name, reaches out of the process. */
export function reachOf(name) {
  if (OUT_MODULES.some((m) => name === m || name.startsWith(`${m}.`))) return 'out';
  if (OUT_OBJECTS.some((o) => name === o || name.startsWith(`${o}.`))) return 'out';
  return 'in';
}

/** Every facility the pinned declarations describe, named as refs.mjs names a use (its qualified name, quotes left out). */
export function facilitiesDescribed() {
  loadReader();
  const o = options();
  const program = ts.createProgram([NODE_DESCRIPTION, HOST_DESCRIPTION], o);
  const checker = program.getTypeChecker();
  const names = new Set();
  const nameOf = (s, holder = null) => {
    let name = checker.getFullyQualifiedName(s);
    if (/^__type\./.test(name) && holder) name = `${holder}.${s.name}`;
    return name.replace(/^global\./, '').replace(/^"([^"]+)"/, '$1');
  };
  const membersOf = (t, holder) => { for (const p of checker.getPropertiesOfType(t)) { const n = nameOf(p, holder); if (!/__type|__object/.test(n)) names.add(n); } };
  const seen = new Set();
  const take = (s, holder = null) => {
    if (!s || seen.has(s)) return;
    seen.add(s);
    const n = nameOf(s, holder);
    if (!/__type|__object/.test(n)) names.add(n);
    if (s.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.Class)) membersOf(checker.getDeclaredTypeOfSymbol(s), n);
    if (s.flags & ts.SymbolFlags.Value) { try { membersOf(checker.getTypeOfSymbol(s), n); } catch { /* none */ } }
    if (s.flags & ts.SymbolFlags.Module) for (const e of checker.getExportsOfModule(s)) take(e.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(e) : e, n);
  };
  for (const sf of program.getSourceFiles()) {
    if (!sf.isDeclarationFile) continue;
    for (const st of sf.statements) {
      const decls = ts.isVariableStatement(st) ? st.declarationList.declarations : [st];
      for (const d of decls) {
        const s = d.name ? checker.getSymbolAtLocation(d.name) : d.symbol;
        take(s ?? d.symbol);
      }
    }
  }
  return [...names].sort();
}

/** The classification, as the tool keeps it. */
export function buildFacilities() {
  const all = facilitiesDescribed();
  return {
    about: 'The host\'s facilities the tool classifies (build text 2c, "Facilities"; R14): each by its qualified name, in the process or reaching out. Built by facilities-build.mjs from the declarations the tool pins and Node\'s documentation; never edited by hand.',
    pinned: { typescript: loadReader().version, node: '22', workerd: null },
    out: all.filter((n) => reachOf(n) === 'out'),
    in: all.filter((n) => reachOf(n) === 'in'),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = buildFacilities();
  fs.writeFileSync(FACILITIES_FILE, `${JSON.stringify(data, null, 1)}\n`);
  process.stdout.write(`wrote ${FACILITIES_FILE}: ${data.in.length} in, ${data.out.length} out\n`);
}

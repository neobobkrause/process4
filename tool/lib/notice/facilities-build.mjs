// Builds the tool's classification of the host's facilities (build text 2c, "Facilities"; R14), facilities.json beside
// this file, for the versions the tool pins: TypeScript 5.6.3's library (the language) and Node 22 as the tool's two
// descriptions declare it (node.d.ts, host.d.ts). Run by PROCESS when the pinned reader or a description changes:
// `node tool/lib/notice/facilities-build.mjs`. Never run on a product's work, never edited by hand.
//
// Each facility is named as the reference reader (refs.mjs) names a use of it: its qualified declaration, a module's
// name without its quotes (node:fs.readFileSync), `Date()` for the clock read by `new Date()` with no argument.
//
// Nothing defaults to `in` (study-references.md, sections 1.4 and 1.5). Every name the pinned declarations describe is
// put in exactly one of:
// - `in`: positively reviewed as staying inside the process, deterministic on its arguments: the groups IN_* below;
// - `tests`: the test runner's facilities, inside the process in a module's tests, a boundary use in its code;
// - `out` (boundary): reaching outside the process, or process-wide, or reading state outside the code (clocks and
//   timers, randomness, the host's locale and time zone, weak references, shared memory): the groups OUT_* below, and
//   every facility of a Node module not reviewed;
// - left out: never on any list (the reader's NEVER, refs.mjs: always a place with its rule), and every facility of the
//   language library in no reviewed group (Proxy, decorators' contexts and the rest), which R14 makes a place.
// workerd: the tool pins no description of workerd, so none of its facilities is classified: each use is a place.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ts, loadReader, options, NODE_DESCRIPTION, HOST_DESCRIPTION } from './ts.mjs';
import { neverRule } from './refs.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const FACILITIES_FILE = path.join(HERE, 'facilities.json');

const starts = (name, heads) => heads.some((h) => name === h || name.startsWith(`${h}.`));

// ---- in: the language (ECMA-262, the TypeScript library files ts.mjs names), reviewed by intrinsic ----
// Source: ECMA-262 (2025), sections 20 to 28: these intrinsics compute on their arguments and the objects handed to
// them, and keep no state outside them.
const IN_LANGUAGE = [
  'Array', 'ReadonlyArray', 'ArrayConstructor', 'ArrayLike', 'ConcatArray', 'ArrayIterator', 'FlatArray', 'TemplateStringsArray',
  'ArrayBuffer', 'ArrayBufferConstructor', 'ArrayBufferLike', 'ArrayBufferTypes', 'ArrayBufferView', 'DataView', 'DataViewConstructor',
  ...['Int8', 'Uint8', 'Uint8Clamped', 'Int16', 'Uint16', 'Int32', 'Uint32', 'Float32', 'Float64', 'BigInt64', 'BigUint64'].flatMap((k) => [`${k}Array`, `${k}ArrayConstructor`]),
  'BigInt', 'BigIntConstructor', 'Boolean', 'BooleanConstructor', 'Number', 'NumberConstructor', 'String', 'StringConstructor', 'StringIterator',
  'Symbol', 'SymbolConstructor', 'Object', 'ObjectConstructor', 'PropertyDescriptor', 'PropertyDescriptorMap', 'TypedPropertyDescriptor', 'PropertyKey',
  'Map', 'ReadonlyMap', 'MapConstructor', 'MapIterator', 'Set', 'ReadonlySet', 'SetConstructor', 'SetIterator', 'ReadonlySetLike',
  'WeakMap', 'WeakMapConstructor', 'WeakSet', 'WeakSetConstructor', 'WeakKey', 'WeakKeyTypes',
  'Promise', 'PromiseConstructor', 'PromiseLike', 'PromiseConstructorLike', 'PromiseFulfilledResult', 'PromiseRejectedResult', 'PromiseSettledResult', 'PromiseWithResolvers',
  'Iterable', 'IterableIterator', 'Iterator', 'IteratorObject', 'IteratorResult', 'IteratorReturnResult', 'IteratorYieldResult', 'BuiltinIteratorReturn',
  'AsyncIterable', 'AsyncIterableIterator', 'AsyncIterator', 'AsyncIteratorObject', 'Generator', 'AsyncGenerator', 'GeneratorFunction', 'AsyncGeneratorFunction',
  'RegExp', 'RegExpConstructor', 'RegExpExecArray', 'RegExpMatchArray', 'RegExpIndicesArray', 'RegExpStringIterator',
  'Error', 'ErrorConstructor', 'ErrorOptions', 'AggregateError', 'AggregateErrorConstructor', 'EvalError', 'EvalErrorConstructor', 'RangeError', 'RangeErrorConstructor',
  'ReferenceError', 'ReferenceErrorConstructor', 'SyntaxError', 'SyntaxErrorConstructor', 'TypeError', 'TypeErrorConstructor', 'URIError', 'URIErrorConstructor',
  'JSON', 'Math', 'Reflect', 'CallableFunction', 'NewableFunction', 'IArguments',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI', 'encodeURIComponent', 'decodeURI', 'decodeURIComponent', 'escape', 'unescape', 'NaN', 'Infinity',
  // the library's type operators: they compute nothing at run time
  'Record', 'Partial', 'Required', 'Readonly', 'Pick', 'Omit', 'Exclude', 'Extract', 'NonNullable', 'Parameters', 'ConstructorParameters', 'ReturnType',
  'InstanceType', 'Awaited', 'ThisType', 'ThisParameterType', 'OmitThisParameter', 'NoInfer', 'Uppercase', 'Lowercase', 'Capitalize', 'Uncapitalize',
];
// ---- out: what in those intrinsics reads state outside the code (ECMA-262 and ECMA-402) ----
// Source: ECMA-262 21.4 (Date: the current time value, LocalTZA and the host's local time), 21.3.2.27 (Math.random),
// 22.1.3.13 (localeCompare) and every toLocale* method (ECMA-402: the host's default locale), Intl (ECMA-402).
const DATE_LOCAL = ['getDate', 'getDay', 'getFullYear', 'getHours', 'getMilliseconds', 'getMinutes', 'getMonth', 'getSeconds', 'getTimezoneOffset', 'getYear',
  'setDate', 'setFullYear', 'setHours', 'setMilliseconds', 'setMinutes', 'setMonth', 'setSeconds', 'setYear', 'toString', 'toDateString', 'toTimeString',
  'toLocaleString', 'toLocaleDateString', 'toLocaleTimeString'];
const OUT_LANGUAGE = (name) => name === 'Date()' || name === 'DateConstructor.now' || name === 'DateConstructor.parse' || name === 'Math.random'
  || DATE_LOCAL.some((m) => name === `Date.${m}`) || /\.toLocale[A-Za-z]*$/.test(name) || /\.localeCompare$/.test(name) || starts(name, ['Intl'])
  || starts(name, ['SharedArrayBuffer', 'SharedArrayBufferConstructor', 'Atomics', 'WeakRef', 'WeakRefConstructor', 'FinalizationRegistry', 'FinalizationRegistryConstructor', 'globalThis']);
// Date itself: a date from its arguments is computation; its UTC and ISO readings likewise.
const IN_DATE = (name) => name === 'Date' || name === 'DateConstructor' || name === 'DateConstructor.UTC' || (name.startsWith('Date.') && !OUT_LANGUAGE(name));

// ---- in: Node's facilities reviewed as pure (Node v22 documentation, nodejs.org/docs/latest-v22.x/api) ----
// - node:path: "utilities for working with file and directory paths", string operations on their arguments; except
//   resolve, relative and toNamespacedPath, which read the process's working directory (path.html#pathresolvepaths).
// - node:url: URL parsing and formatting, fileURLToPath; except pathToFileURL, which resolves against the working directory.
// - node:assert, node:assert/strict: compare their arguments and throw (assert.html).
// - node:events: EventEmitter, listeners kept on the object, called in the process (events.html); except the
//   process-wide defaults (defaultMaxListeners, setMaxListeners, captureRejections).
// - node:crypto: hashing and comparing what it is handed (createHash, createHmac, hash, timingSafeEqual, getHashes);
//   its random sources are out (crypto.html#cryptorandombytessize-callback).
// - URL, URLSearchParams, TextEncoder, TextDecoder, structuredClone, queueMicrotask: WHATWG encodings and URL, the
//   structured clone and the microtask queue, inside the process (globals.html).
// - process.argv, process.execPath, and reading process.exitCode: values fixed at start or set by the module itself
//   (process.html; study-references.md 1.5); every other member of process is out.
// - process, console, crypto, performance as objects: a use of one of their members is classified by that member.
// - ImportMeta.url, dirname, filename: the module's own location (esm.html#importmeta); resolve asks the loader: out.
// - the descriptions' own option and result kinds (NodeDirent, NodeStats and the like): plain data, no facility.
const IN_NODE = (name) => {
  const m = /^(?:node:)?(path|url|assert|assert\/strict|events|crypto)(?:\.(.+))?$/.exec(name);
  if (m) {
    const [, mod, member = ''] = m;
    if (mod === 'path') return !['resolve', 'relative', 'toNamespacedPath'].includes(member.split('.').pop());
    if (mod === 'url') return member !== 'pathToFileURL';
    if (mod === 'events') return !/^(defaultMaxListeners|setMaxListeners|captureRejections)/.test(member.split('.').pop());
    if (mod === 'crypto') return ['createHash', 'createHmac', 'hash', 'timingSafeEqual', 'getHashes'].includes(member);
    return true;
  }
  return starts(name, ['URL', 'URLSearchParams', 'TextEncoder', 'TextDecoder', 'NodeAssert', 'assert', 'NodeDirent', 'NodeStats', 'NodeReadOptions', 'NodeRmOptions',
    'NodeSpawnOptions', 'NodeSpawnResult', 'NodePathLike'])
    // the host's objects themselves: a use of a member is classified by the member
    || ['process', 'console', 'crypto', 'performance']
    .includes(name)
    || ['structuredClone', 'queueMicrotask', 'NodeProcess.argv', 'NodeProcess.execPath', 'NodeProcess.exitCode', 'ImportMeta.url', 'ImportMeta.dirname', 'ImportMeta.filename'].includes(name);
};
// ---- tests: the test runner (test.html), inside a module's tests; used in its code it is a boundary use ----
const TESTS = (name) => /^(?:node:)?test(\.|$)/.test(name) || starts(name, ['NodeTestContext', 'NodeTestFn', 'NodeMock', 'NodeMockFunction']);
// ---- out: everything else Node's descriptions declare ----
// Source: Node v22 documentation. Files, other processes and threads, streams and the terminal, the network, the
// environment, the host, the module loader (fs, fs/promises, child_process, worker_threads, readline, os, module,
// process, console, fetch); clocks and timers (timers.html, perf_hooks.html: setTimeout, setInterval, setImmediate and
// their clears, performance.now, process.hrtime and uptime); randomness (crypto.randomUUID, getRandomValues); the
// process-wide channels and hooks (diagnostics_channel, async_hooks, perf_hooks, trace_events, wasi, sqlite, sea); and
// any facility of a Node module not reviewed above.
const NODE_HOST = (name) => /^node:/.test(name) || /^(fs|fs\/promises|path|url|os|child_process|worker_threads|module|crypto|events|readline|process|assert)(\.|$)/.test(name)
  || /^Node[A-Z]/.test(name) || starts(name, ['process', 'console', 'fetch', 'performance', 'crypto', 'setTimeout', 'setInterval', 'setImmediate', 'clearTimeout',
    'clearInterval', 'clearImmediate', 'ImportMeta', 'ImportAssertions', 'ImportAttributes', 'ImportCallOptions', 'URL', 'URLSearchParams', 'TextEncoder', 'TextDecoder',
    'structuredClone', 'queueMicrotask']);

/** The classification of one facility: 'in', 'tests', 'out', or null (never on a list, or not reviewed: a place). */
export function classify(name) {
  if (neverRule(name)) return null;
  if (TESTS(name)) return 'tests';
  if (IN_NODE(name)) return 'in';
  if (NODE_HOST(name)) return 'out';
  if (OUT_LANGUAGE(name)) return 'out';
  if (IN_DATE(name) || starts(name, IN_LANGUAGE)) return 'in';
  return null;
}

/** Every facility the pinned declarations describe, named as refs.mjs names a use (its qualified name, quotes left out). */
export function facilitiesDescribed() {
  loadReader();
  const program = ts.createProgram([NODE_DESCRIPTION, HOST_DESCRIPTION], options());
  const checker = program.getTypeChecker();
  const names = new Set(['Date()']);
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
      for (const d of decls) take((d.name ? checker.getSymbolAtLocation(d.name) : null) ?? d.symbol);
    }
  }
  return [...names].sort();
}

/** The classification, as the tool keeps it. */
export function buildFacilities() {
  const all = facilitiesDescribed();
  const by = { in: [], tests: [], out: [] };
  const left = { never: 0, unreviewed: 0 };
  for (const n of all) { const c = classify(n); if (c) by[c].push(n); else left[neverRule(n) ? 'never' : 'unreviewed']++; }
  return {
    about: 'The host\'s facilities the tool classifies (build text 2c, "Facilities"; R14), by qualified name: in the process, inside a module\'s tests (tests), or reaching out (out). Built by facilities-build.mjs, which records the source of each group; never edited by hand. A facility in none of the lists is a place.',
    pinned: { typescript: loadReader().version, node: '22', workerd: null },
    left_out: left,
    ...by,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = buildFacilities();
  fs.writeFileSync(FACILITIES_FILE, `${JSON.stringify(data, null, 1)}\n`);
  process.stdout.write(`wrote ${FACILITIES_FILE}: ${data.in.length} in, ${data.tests.length} tests, ${data.out.length} out; left out ${data.left_out.never} never, ${data.left_out.unreviewed} not reviewed\n`);
}

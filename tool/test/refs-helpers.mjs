// Small products for the reference reader's tests (notice/refs.mjs): one module per name, each with src/<m>/index.mjs
// as its interface file and test/<m>/ as its tests, in the order given.
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadTree } from '../lib/notice/model.mjs';
import { readReferences } from '../lib/notice/refs.mjs';
import { config, write } from './helpers.mjs';

export const ORDER = ['a', 'c', 'd', 'p', 'q', 'u1', 'u'];

/** A product folder: the modules in `order`, the files given, and a facility list where given. */
export function caseProduct(files, { order = ORDER, facilities = null, entries = {} } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'p4-refs-'));
  const all = {
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': `${order.join('\n')}\n`,
    ...Object.fromEntries(order.map((m) => [`process/modules/${m}.json`, { name: m, files: [`src/${m}/`], tests: [`test/${m}/`], public: [`src/${m}/index.mjs`], ...(entries[m] ?? {}) }])),
    ...Object.fromEntries(order.map((m) => [`src/${m}/index.mjs`, 'export {};\n'])),
    ...files,
  };
  if (facilities) all['process/facilities.json'] = facilities;
  write(root, all);
  return root;
}

/** What the reader finds in a module of a product folder. */
export const read = (root, module, opts) => readReferences(loadTree(root), module, opts);

/** The places outside the standard, as "rule file:line", leaving out the facility list's own (R14) unless asked. */
export const places = (r, { withR14 = false } = {}) => r.outside.filter((o) => withR14 || o.rule !== 'R14').map((o) => `${o.rule} ${o.file}:${o.line}`);

/** The uses, as "provider:item type". */
export const usesOf = (r) => [...new Set(r.uses.map((u) => `${u.provider}:${u.item} ${u.type}`))].sort();

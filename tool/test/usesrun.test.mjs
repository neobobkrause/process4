// A rewrite of many uses files in one run (civicsmith ARCH #28): the programs of a run share what they read of the files
// (notice/ts.mjs, whileFilesStay and the parsed files), and a rewrite of many modules reads them in a few processes at
// once (usescmd.mjs, readAllUses; usesworker.mjs). Each module's uses file is the same, byte for byte, as when that
// module alone is read with nothing read before it.
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { loadTree } from '../lib/notice/model.mjs';
import { forgetParsed } from '../lib/notice/ts.mjs';
import { readAllUses, usesData, writeUsesFiles } from '../lib/usescmd.mjs';
import { readUses, usesPath, usesText } from '../lib/usesfile.mjs';
import { git } from '../lib/util.mjs';
import { commit, config, ctxFor, fakeGitHub, makeRepo } from './helpers.mjs';

const IDS = ['base', 'kinds', ...Array.from({ length: 9 }, (_, i) => `m${i}`), 'user'];

/** A product of a dozen modules: a class and its users, kinds, a chain of modules each using two earlier ones, copies. */
function productFiles() {
  const files = {
    'process.json': config({ language_reader: { name: 'typescript', version: '5.6.3', source: ['**/*.mjs'] } }),
    'process/modules/order.txt': `${IDS.join('\n')}\n`,
    'src/base/index.mjs': `export class Animal {
  constructor() { /** @type {string} */ this.name = 'animal'; }
  /** @returns {string} */
  speak() { return this.name; }
}
export const TITLE = 'Price list';
export const LIMIT = 250;
`,
    'src/kinds/index.mjs': `import { readFileSync } from 'node:fs';
import { Animal } from '../base/index.mjs';
/** @typedef {{ id: number, name: string }} Row */
/**
 * @param {string} file
 * @returns {Row[]}
 */
export function load(file) {
  const v = JSON.parse(readFileSync(file, 'utf8'));
  return Array.isArray(v) ? v.map((x, i) => ({ id: i, name: String(x) })) : [];
}
export class Cat extends Animal {
  /** @returns {string} */
  meow() { return this.speak() + ' meow'; }
}
`,
    'src/user/index.mjs': `import { Cat } from '../kinds/index.mjs';
import { make } from '../m8/index.mjs';
const copyOf_base_TITLE = 'Price list';
/** @copyof base:LIMIT */
const max = 200;
/** @returns {string[]} */
export function words() { return [copyOf_base_TITLE, String(max), new Cat().meow(), make('x').name]; }
`,
    'test/user/user.test.mjs': `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { words } from '../../src/user/index.mjs';
test('user > the words', () => { assert.equal(words()[0], 'Price list'); });
`,
    'test/user/fixture.json': '{ "heading": "Price list" }\n',
  };
  for (const id of IDS) files[`process/modules/${id}.json`] = { name: id, files: [`src/${id}/`], tests: [`test/${id}/`], public: [`src/${id}/index.mjs`] };
  for (let i = 0; i < 9; i++) {
    const deps = i === 0 ? ['kinds'] : [`m${i - 1}`, i > 1 ? `m${Math.floor(i / 2)}` : 'kinds'];
    const imports = deps.map((d) => (d === 'kinds' ? "import { load } from '../kinds/index.mjs';\n" : `import { make as make_${d} } from '../${d}/index.mjs';\n`)).join('');
    const call = deps.map((d) => (d === 'kinds' ? 'load(name).length' : `make_${d}(name).count`)).join(' + ');
    files[`src/m${i}/index.mjs`] = `${imports}/** @typedef {{ name: string, count: number }} Item */
/**
 * @param {string} name
 * @returns {Item}
 */
export function make(name) { return { name, count: ${call} }; }
/** @type {Map<string, Item>} */
export const seen = new Map();
`;
    files[`test/m${i}/m${i}.test.mjs`] = `import { test } from 'node:test';
import { make } from '../../src/m${i}/index.mjs';
test('m${i} > makes', () => { make('a'); });
`;
  }
  return files;
}

/** Each module's uses file, read alone: nothing read before it, outside any run. */
function eachAlone(root, commitId) {
  const out = new Map();
  for (const id of IDS) {
    forgetParsed();
    out.set(id, usesText(usesData(loadTree(root), id, commitId)));
  }
  return out;
}

test('rewriting many modules in one run, here or in several readers, gives each the file it has when read alone', () => {
  const files = productFiles();
  const root = makeRepo(files);
  const alone = eachAlone(root, 'c');
  const ids = loadTree(root).modules.map((m) => m.id);
  assert.deepEqual(ids, IDS);
  // the product is read as meant: uses of earlier modules, copies, packages
  const user = JSON.parse(alone.get('user'));
  assert.deepEqual(user.providers, ['base', 'kinds', 'm8']);
  assert.ok(user.uses.some((u) => u.item === 'LIMIT'));
  assert.ok(JSON.parse(alone.get('kinds')).packages.some((p) => p.facility.includes('readFileSync')));
  for (const readers of [1, 3]) {
    const dir = mkdtempSync(join(tmpdir(), 'p4-uses-read-'));
    const read = readAllUses(loadTree(root), ids, 'c', dir, readers);
    for (const id of IDS) assert.equal(usesText(read.get(id)), alone.get(id), `${id}, ${readers} reader(s)`);
    // with several readers, each module was read in a reader's process, not again here
    assert.equal(readdirSync(dir).filter((f) => f.endsWith('.json')).length, readers > 1 ? IDS.length : 0);
  }

  // a push that changes every module's code rewrites every module's uses file: the same files, in three readers
  git(['push', '-q', 'origin', 'main:refs/heads/tranche'], { cwd: root });
  const base = git(['rev-parse', 'HEAD'], { cwd: root });
  git(['checkout', '-q', '-b', 'work'], { cwd: root });
  const head = commit(root, Object.fromEntries(Object.entries(files).filter(([f]) => f.startsWith('src/') && f.endsWith('.mjs')).map(([f, t]) => [f, `${t}// changed\n`])));
  const want = eachAlone(root, head);
  const { ctx } = ctxFor(root, fakeGitHub());
  assert.deepEqual(writeUsesFiles(ctx, 'work', { base, readers: 3 }), IDS);
  const cfg = loadTree(root).cfg;
  for (const id of IDS) {
    assert.equal(git(['show', `HEAD:${usesPath(cfg, id)}`], { cwd: root }) + '\n', want.get(id), id);
    assert.equal(readUses(root, id, { cfg, ref: 'HEAD' }).written.commit, head);
  }
});

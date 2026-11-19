// The process config and the module list (build text 2, sections 2, 3 and 7).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fail, git, underPath } from './util.mjs';

export const CONFIG_FILE = 'process.json';

// Reads a file from the working tree, or with a commit, from that commit. Null when absent.
export function readAt(root, path, ref) {
  if (!ref) return existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : null;
  const r = git(['show', `${ref}:${path}`], { cwd: root, allowFail: true });
  return r.code === 0 ? r.stdout : null;
}

const parse = (text, what) => {
  try { return JSON.parse(text); } catch (e) { return fail(`${what} is not JSON: ${e.message}`); }
};

// process.json, or null where the repository has none yet (a product's first pull request).
export function loadConfig(root, ref) {
  const text = readAt(root, CONFIG_FILE, ref);
  if (text === null) return null;
  const c = parse(text, `${CONFIG_FILE}${ref ? ` at ${ref.slice(0, 10)}` : ''}`);
  return { process_folder: 'process/', tranche_branch: 'tranche', test_command: 'node --test', lock_files: [], node: '22', ...c };
}

export function needConfig(root, ref) {
  return loadConfig(root, ref) || fail(`this repository has no ${CONFIG_FILE}`);
}

// The required check's name for the repository at `root`: the process repo holds the tool
// (tool/p4.mjs) and runs `tool-tests`; a product repo does not and runs `module-tests`.
export const requiredCheck = (root) => (existsSync(join(root, 'tool', 'p4.mjs')) ? 'tool-tests' : 'module-tests');

const modulesDir = (cfg) => `${cfg.process_folder.replace(/\/?$/, '/')}modules/`;

// The order file and each module's entry, in order. Empty when there is no order file.
export function loadModules(root, cfg, ref) {
  const dir = modulesDir(cfg);
  const order = readAt(root, `${dir}order.txt`, ref);
  if (order === null) return [];
  return order.split('\n').map((l) => l.trim()).filter(Boolean).map((name, i) => {
    const text = readAt(root, `${dir}${name}.json`, ref);
    if (text === null) fail(`module ${name} is in the order file but has no ${dir}${name}.json`);
    const e = parse(text, `${dir}${name}.json`);
    return { name, files: [], tests: [], uses: [], ...e, order: i + 1 };
  });
}

export const requirementsFile = (cfg, name) => `${modulesDir(cfg)}${name}.md`;

// The module that owns a file: the longest matching path among files and tests.
export function ownerOf(modules, file) {
  let best = null;
  let len = -1;
  for (const m of modules) {
    for (const p of [...m.files, ...m.tests]) {
      if (underPath(file, p) && p.length > len) { best = m; len = p.length; }
    }
  }
  return best;
}

// Requirement lines marked not yet met, as `R<n>`.
export function notYetMet(text) {
  return [...(text || '').matchAll(/^- \*\*(R\d+)\*\* \[not yet met\]/gm)].map((m) => m[1]);
}

// The fetch line (build text 1, section 2): the commit id named once, as a shell variable.
export function fetchLine(cfg) {
  const { repository, commit } = cfg.process || {};
  if (!repository || !/^[0-9a-f]{40}$/.test(commit || '')) fail(`${CONFIG_FILE} must name process.repository and a 40-character process.commit`);
  return `C=${commit};D=$HOME/process4/$C;git clone -q ${repository} $D&&git -C $D checkout -q $C&&(cd $D/tool&&npm ci -s)&&chmod -R a-w $D`;
}

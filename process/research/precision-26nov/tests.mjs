#!/usr/bin/env node
// Each module's own tests, before and after each recorded change of a proof (precision-26nov, step 2): which pass.
// A later module whose tests pass before a change and fail after it needs telling.
//
//   node process/research/precision-26nov/tests.mjs <proof folder> <out.json> [--only id,...] [--jobs N]
//
// Before trees (the product with a change's setups) are run once each. Each module's tests are run as its process.json
// says (node --test), on the test files under the folders its module entry names.
import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const ONLY = opt('--only')?.split(',');
const JOBS = Number(opt('--jobs') ?? 8);
const [PROOF, OUT] = args.map((a) => path.resolve(a));
const SERIES = ['planned', 'adversarial', 'adversarial-independent', 'round3-independent', 'round4-independent',
  'round5-independent', 'round6-independent', 'round7-independent', 'round8-independent'];

const readChange = (series, id) => ({ ...JSON.parse(fs.readFileSync(path.join(PROOF, 'changes', series, id, 'change.json'), 'utf8')), id, series, dir: path.join(PROOF, 'changes', series, id) });
const listChanges = (series) => fs.readdirSync(path.join(PROOF, 'changes', series), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}
function applyChange(change, dir) {
  if (fs.existsSync(path.join(change.dir, 'files'))) copyDir(path.join(change.dir, 'files'), dir);
  for (const d of change.delete ?? []) fs.rmSync(path.join(dir, d), { force: true });
}
function digestOf(dir) {
  const h = crypto.createHash('sha256');
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(r); else h.update(r).update('\0').update(fs.readFileSync(path.join(dir, r))).update('\0');
    }
  };
  walk('');
  return h.digest('hex');
}
function modules(dir) {
  const order = fs.readFileSync(path.join(dir, 'process/modules/order.txt'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
  return order.map((id) => {
    const m = JSON.parse(fs.readFileSync(path.join(dir, 'process/modules', `${id}.json`), 'utf8'));
    const files = [];
    for (const t of m.tests ?? []) {
      const walk = (rel) => {
        const abs = path.join(dir, rel);
        if (!fs.existsSync(abs)) return;
        for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
          const r = path.join(rel, e.name);
          if (e.isDirectory()) walk(r); else if (/\.test\.m?js$/.test(e.name)) files.push(r);
        }
      };
      walk(t);
    }
    return { id, files: files.sort() };
  });
}

let running = 0;
const queue = [];
const slot = () => new Promise((res) => { if (running < JOBS) { running++; res(); } else queue.push(res); });
const free = () => { running--; const n = queue.shift(); if (n) { running++; n(); } };
function runTests(dir, files) {
  if (!files.length) return Promise.resolve({ pass: true, none: true });
  return slot().then(() => new Promise((res) => {
    execFile(process.execPath, ['--test', ...files], { cwd: dir, timeout: 120_000, maxBuffer: 64 << 20 }, (err, stdout) => {
      free();
      const failed = [...String(stdout).matchAll(/^not ok \d+ - (.*)$/gm)].map((m) => m[1]);
      res({ pass: !err, ...(err ? { failed: failed.slice(0, 8), timedOut: !!err.killed } : {}) });
    });
  }));
}

const beforeCache = new Map();
async function outcomes(dir, from, cacheKey) {
  if (cacheKey && beforeCache.has(cacheKey)) return beforeCache.get(cacheKey);
  const ms = modules(dir);
  const i = ms.findIndex((m) => m.id === from);
  const p = (async () => {
    const out = {};
    await Promise.all(ms.slice(Math.max(i, 0)).map(async (m) => { out[m.id] = await runTests(dir, m.files); }));
    return out;
  })();
  if (cacheKey) beforeCache.set(cacheKey, p);
  return p;
}

const result = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'p4-tests-'));
const jobs = [];
for (const series of SERIES) for (const id of listChanges(series)) if (!ONLY || ONLY.includes(id)) jobs.push(readChange(series, id));
let done = 0;
await Promise.all(jobs.map(async (change) => {
  const base = path.join(tmp, change.id);
  const before = path.join(base, 'before'), after = path.join(base, 'after');
  copyDir(path.join(PROOF, 'product'), before);
  for (const pre of change.before ?? []) {
    const [s, i] = pre.includes('/') ? pre.split('/') : [change.series, pre];
    applyChange(readChange(s, i), before);
  }
  copyDir(before, after);
  applyChange(change, after);
  // a before tree is the same for every change from the same provider with the same setups: run it once
  const key = `${digestOf(before)}|${change.provider}`;
  const [b, a] = await Promise.all([outcomes(before, change.provider, key), outcomes(after, change.provider)]);
  const order = modules(after).map((m) => m.id);
  const later = order.slice(order.indexOf(change.provider) + 1);
  result[change.id] = { provider: change.provider, before: b, after: a, breaks: later.filter((m) => b[m]?.pass && a[m] && !a[m].pass) };
  done++;
  if (done % 10 === 0) process.stderr.write(`${done}/${jobs.length}\n`);
}));
fs.rmSync(tmp, { recursive: true, force: true });
fs.writeFileSync(OUT, `${JSON.stringify(result, null, 1)}\n`);
console.log(`${Object.keys(result).length} changes; written ${OUT}`);

// Shared helpers: running programs, git, GitHub through gh, arguments.
// The tool holds, reads and prints no token (build text 1, section 3).
import { spawnSync } from 'node:child_process';
import { closeSync, openSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export class Fail extends Error {}
export const fail = (msg) => { throw new Fail(msg); };

// Run a program. Never throws on a non-zero exit.
export function run(cmd, args = [], opts = {}) {
  const env = { ...process.env, ...(opts.env || {}) };
  for (const k of opts.unset || []) delete env[k];
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd, env, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, input: opts.input, timeout: opts.timeout,
  });
  return {
    code: r.status === null ? (r.error ? 127 : 1) : r.status,
    stdout: r.stdout || '', stderr: (r.stderr || '') + (r.error ? String(r.error) : ''),
  };
}

// Token variables are removed from every git the tool starts and every product program.
export const NO_TOKENS = ['GH_TOKEN', 'GITHUB_TOKEN', 'ACTIONS_RUNTIME_TOKEN', 'ACTIONS_ID_TOKEN_REQUEST_TOKEN'];

export function git(args, opts = {}) {
  const r = run('git', ['-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null', ...args],
    { ...opts, unset: [...NO_TOKENS, ...(opts.unset || [])] });
  if (r.code !== 0 && !opts.allowFail) fail(`git ${args[0]} failed: ${r.stderr.trim()}`);
  return opts.allowFail ? r : r.stdout.replace(/\n$/, '');
}

export const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

// A failure worth trying again: GitHub's rate limit, a server error, or the network.
export const RATE = /rate limit|HTTP 429|abuse/i;
export const TRANSIENT = /HTTP 5\d\d|ECONNRESET|ETIMEDOUT|EAI_AGAIN|connection reset|timed out|unexpected EOF/i;

// GitHub through the gh program, REST only. Every call obeys the rate-limit answer (build text 1, section 3; GitHub's
// own advice for its secondary limits): it waits the answer's retry-after where it gives one; else, where
// x-ratelimit-remaining is 0, until x-ratelimit-reset; else a minute, doubling each time (60, 120, 240, 480 s); after
// the fourth wait it fails, naming the time (UTC) after which to run the command again.
// A write (any method but GET) asks gh for the answer's headers (`-i`), so that those are seen, and starts at least a
// second after the last write of any p4 command on this machine (writePace).
// A call allowed to fail answers null; GitHub's own words for that failure are kept, as gh.refused, until the next call.
// GitHub's whole refusal: gh's own line (standard error) and the message GitHub sent with it, which `gh api` prints on
// standard output as JSON ({ message, errors }): "body is too long" is only there.
export function refusalWords(r) {
  const err = (r.stderr || '').trim().split('\n').slice(0, 3).join(' ');
  const out = (r.stdout || '').trim();
  let body = '';
  try {
    const j = JSON.parse(out);
    const errors = (Array.isArray(j?.errors) ? j.errors : []).map((e) => (typeof e === 'string' ? e : e?.message || [e?.resource, e?.field, e?.code].filter(Boolean).join(' '))).filter(Boolean);
    body = [j?.message, ...errors].filter(Boolean).join('; ');
  } catch { body = out.split('\n').slice(0, 3).join(' '); }
  if (!err) return body;
  return body && !err.includes(body) ? `${err}; GitHub said: ${body}` : err;
}
/** The method a gh call names (`-X`/`--method`, `--method=`), upper case; GET where none. */
export function methodOf(args) {
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '-X' || args[i] === '--method') && i + 1 < args.length) return String(args[i + 1]).toUpperCase();
    const m = /^(?:--method=|-X)(\w+)$/.exec(args[i]);
    if (m) return m[1].toUpperCase();
  }
  return 'GET';
}
export const isWrite = (args) => args[0] === 'api' && methodOf(args) !== 'GET';

/**
 * What `gh api -i` printed, split: the status line and headers (names in lower case), and the body after the first
 * empty line. Output that does not begin with a status line is all body.
 */
export function splitHeaders(out) {
  const s = out || '';
  if (!/^HTTP\/[\d.]+ \d{3}/.test(s)) return { headers: {}, body: s };
  const m = /\r?\n\r?\n/.exec(s);
  const head = m ? s.slice(0, m.index) : s;
  const body = m ? s.slice(m.index + m[0].length) : '';
  const headers = {};
  for (const line of head.split(/\r?\n/).slice(1)) {
    const c = line.indexOf(':');
    if (c > 0) headers[line.slice(0, c).trim().toLowerCase()] = line.slice(c + 1).trim();
  }
  return { headers, body };
}

/**
 * How long to wait before trying a rate-limited call again (ms), from the answer's headers, or failing those its words:
 * retry-after; else, with x-ratelimit-remaining 0, until x-ratelimit-reset (epoch seconds) and a second more; else 60 s
 * doubled for each earlier rate-limited try.
 */
export function rateWait(headers, text, rateTries, nowMs) {
  const num = (v) => (v !== undefined && /^\d+$/.test(String(v).trim()) ? Number(v) : undefined);
  const after = num(headers['retry-after'] ?? text.match(/retry[- ]after:?\s*(\d+)/i)?.[1]);
  if (after !== undefined) return after * 1000;
  const remaining = num(headers['x-ratelimit-remaining'] ?? text.match(/x-ratelimit-remaining:?\s*(\d+)/i)?.[1]);
  const reset = num(headers['x-ratelimit-reset'] ?? text.match(/x-ratelimit-reset:?\s*(\d+)/i)?.[1]);
  if (remaining === 0 && reset !== undefined) return Math.max(0, reset * 1000 - nowMs) + 1000;
  return 60000 * 2 ** rateTries;
}

/**
 * Content-creating writes start at least `gap` ms apart, counted across this machine's p4 commands through one small
 * file in the temporary folder, as pushes are (commands.mjs, pushPace). Each write takes the next free start under a
 * lock made by creating a file only where none is (so parallel runs never take the same start), then waits for that
 * start outside the lock. A lock left by a run that died is taken over after ten seconds.
 */
export function writePace({ file = join(tmpdir(), 'p4-writes.json'), nowMs = Date.now, wait = sleep, gap = 1000 } = {}) {
  const lock = `${file}.lock`;
  let held = false;
  for (let i = 0; i < 4000 && !held; i++) {
    try { closeSync(openSync(lock, 'wx')); held = true; } catch {
      try { if (Date.now() - statSync(lock).mtimeMs > 10000) rmSync(lock, { force: true }); } catch { /* gone already */ }
      if (!held) sleep(5);
    }
  }
  let start = nowMs();
  try {
    let last = 0;
    try { last = Number(JSON.parse(readFileSync(file, 'utf8')).last) || 0; } catch { /* none yet */ }
    start = Math.max(start, last + gap);
    writeFileSync(file, JSON.stringify({ last: start }));
  } finally { if (held) rmSync(lock, { force: true }); }
  const d = start - nowMs();
  if (d > 0) wait(d);
}

const utc = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');

export function makeGh({ exec = (args, input) => run('gh', args, { input }), wait = sleep, nowMs = Date.now, pace, paceFile } = {}) {
  const paced = pace || (() => writePace({ file: paceFile, nowMs, wait }));
  return function gh(args, opts = {}) {
    gh.refused = null;
    const write = isWrite(args);
    // the headers are asked for where the caller did not ask for them itself, and then taken off the answer
    const own = write && !args.includes('-i') && !args.includes('--include');
    const call = own ? ['api', '-i', ...args.slice(1)] : args;
    let r;
    let rateTries = 0;
    let transient = 0;
    for (;;) {
      if (write) paced();
      r = exec(call, opts.input);
      const { headers, body } = own ? splitHeaders(r.stdout) : { headers: {}, body: r.stdout };
      if (own) r = { ...r, stdout: body };
      if (r.code === 0) break;
      const text = `${r.stderr}\n${r.stdout}`;
      const rate = RATE.test(text) || (/HTTP 403/.test(text) && (headers['retry-after'] !== undefined || headers['x-ratelimit-remaining'] === '0'));
      if (rate) {
        const ms = rateWait(headers, text, rateTries, nowMs());
        if (rateTries >= 4) {
          fail(`GitHub refused: ${refusalWords(r)}; GitHub's rate limit held after four waits: run the command again after ${utc(nowMs() + ms)}`);
        }
        rateTries++;
        wait(ms);
        continue;
      }
      if (transient >= 4 || !TRANSIENT.test(text)) break;
      transient++;
      wait(5000 * transient);
    }
    if (r.code !== 0) {
      const words = refusalWords(r);
      if (opts.allowFail) { gh.refused = words; return null; }
      fail(`GitHub refused: ${words}`);
    }
    const s = r.stdout.trim();
    if (!s) return null;
    try { return JSON.parse(s); } catch { return s; }
  };
}
export const gh = makeGh();

export const repoRoot = (cwd = process.cwd()) => git(['rev-parse', '--show-toplevel'], { cwd });

// owner/name of the repository: GITHUB_REPOSITORY on GitHub's machines, else from origin.
export function repoSlug(root) {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  const url = git(['remote', 'get-url', 'origin'], { cwd: root });
  const m = url.replace(/\.git$/, '').match(/([^/:]+)\/([^/]+)$/);
  if (!m) fail(`cannot read owner/name from origin ${url}`);
  return `${m[1]}/${m[2]}`;
}

// --key value, --key=value and --flag; repeated keys become arrays; the rest are positional.
/** Where parseArgs keeps the order the words were given in: [flag name, or '_' for a word with no flag]. */
export const ORDER = Symbol('p4.args.order');

export function parseArgs(argv) {
  const out = { _: [] };
  const order = [];
  Object.defineProperty(out, ORDER, { value: order });
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); order.push('_'); continue; }
    const eq = a.indexOf('=');
    const k = eq > 0 ? a.slice(2, eq) : a.slice(2);
    const v = eq > 0 ? a.slice(eq + 1) : i + 1 < argv.length && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    if (k in out) out[k] = [].concat(out[k], v); else out[k] = v;
    order.push(k);
  }
  return out;
}

export const now = () => new Date().toISOString().replace(/:\d\d(\.\d+)?Z$/, 'Z');

// A path entry ending in / is a folder with everything under it; any other names a file.
export const underPath = (file, p) => (p.endsWith('/') ? file.startsWith(p) : file === p || file.startsWith(`${p}/`));

/**
 * The file a written-out import names. A relative or absolute specifier is a URL to Node's loader, whose query and
 * fragment make a distinct load of the same file (Node 22, esm.html, "URLs": "Modules are loaded multiple times if the
 * import specifier used to resolve them has a different query or fragment"); the file is found without them. Any other
 * specifier (a package, the product's own name, a `#` name) is not a URL and is kept whole.
 */
export const fileSpecifier = (spec) => (/^(\.{1,2}\/|\/|file:)/.test(spec) ? spec.replace(/[?#][\s\S]*$/, '') : spec);

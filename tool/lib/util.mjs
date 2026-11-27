// Shared helpers: running programs, git, GitHub through gh, arguments.
// The tool holds, reads and prints no token (build text 1, section 3).
import { spawnSync } from 'node:child_process';
import { note as paceNote, take } from './pace.mjs';

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
// Every call but a paginated read asks gh for the answer's headers (`-i`), so that those are seen, and every call takes
// its place under GitHub's published limits as this machine holds them (pace.mjs): a write at least a second after the
// last write of any p4 command on this machine (writePace), within its role's shares.
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
 * A content-creating write's place under every limit pace.mjs holds for this machine (G1's second between writes among
 * them), shared across this machine's p4 commands through one small file in the temporary folder.
 */
export function writePace({ file, nowMs = Date.now, wait = sleep, role, say } = {}) {
  take({ kind: 'write', file, nowMs, wait, role, say });
}

const utc = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
const PRIMARY = /API rate limit exceeded/i;

/**
 * gh, paced and obeying GitHub's rate-limit answers. Before each request, its place (pace.mjs): a GET as a read, any
 * other method as a write; a paginated read's further pages are counted after it. Every request but a paginated read asks
 * for the answer's headers (`-i`), taken off the answer: where x-ratelimit-remaining is 0, every request of this machine
 * waits until x-ratelimit-reset. A refused request waits as rateWait says; a write's refusal by a secondary limit is
 * noted, so that every write of this machine waits as long (K4). A paginated read refused by the primary limit reads
 * GitHub's /rate_limit, which counts against no limit, for the reset. `pace(kind)` and `note(what)` replace the file in
 * tests.
 */
export function makeGh({ exec = (args, input) => run('gh', args, { input }), wait = sleep, nowMs = Date.now, pace, note: noted, paceFile, role, say } = {}) {
  const paced = pace || ((kind) => take({ kind, file: paceFile, nowMs, wait, role, say }));
  const remember = noted || (pace ? () => {} : (what) => paceNote({ file: paceFile, nowMs, ...what }));
  const primaryOf = (h) => (h['x-ratelimit-remaining'] === '0' && /^\d+$/.test(h['x-ratelimit-reset'] ?? '') ? Number(h['x-ratelimit-reset']) * 1000 + 1000 : 0);
  return function gh(args, opts = {}) {
    gh.refused = null;
    const write = isWrite(args);
    const paged = args.includes('--paginate');
    // the headers are asked for where the caller did not ask for them itself, and then taken off the answer
    const own = !paged && !args.includes('-i') && !args.includes('--include');
    const call = own ? [args[0], '-i', ...args.slice(1)] : args;
    let r;
    let rateTries = 0;
    let transient = 0;
    for (;;) {
      paced(write ? 'write' : 'read');
      r = exec(call, opts.input);
      const split = own ? splitHeaders(r.stdout) : { headers: {}, body: r.stdout };
      let headers = split.headers;
      if (own) r = { ...r, stdout: split.body };
      if (primaryOf(headers)) remember({ primaryUntil: primaryOf(headers) });
      if (r.code === 0) break;
      const text = `${r.stderr}\n${r.stdout}`;
      const rate = RATE.test(text) || (/HTTP 403/.test(text) && (headers['retry-after'] !== undefined || headers['x-ratelimit-remaining'] === '0'));
      if (rate) {
        if (!own && PRIMARY.test(text)) {
          let core = null;
          try { core = JSON.parse(exec(['api', 'rate_limit']).stdout || '')?.resources?.core; } catch { /* not read */ }
          if (core && Number(core.remaining) === 0 && /^\d+$/.test(String(core.reset))) {
            headers = { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(core.reset) };
            remember({ primaryUntil: primaryOf(headers) });
          }
        }
        const ms = rateWait(headers, text, rateTries, nowMs());
        if (rateTries >= 4) {
          fail(`GitHub refused: ${refusalWords(r)}; GitHub's rate limit held after four waits: run the command again after ${utc(nowMs() + ms)}`);
        }
        if (write && !primaryOf(headers)) remember({ notBefore: nowMs() + ms });
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
    let out;
    try { out = JSON.parse(s); } catch { return s; }
    // each further page of a paginated read was a request of its own (gh --slurp hands back one array for each page)
    if (paged && args.includes('--slurp') && Array.isArray(out) && out.length > 1) remember({ points: out.length - 1 });
    return out;
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

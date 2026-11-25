// Shared helpers: running programs, git, GitHub through gh, arguments.
// The tool holds, reads and prints no token (build text 1, section 3).
import { spawnSync } from 'node:child_process';

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

// GitHub through the gh program, REST only. Every call obeys the rate-limit answer: it waits
// and tries again up to four times, then fails (build text 1, section 3). GitHub does not
// always say how long; a minute is GitHub's own advice for its secondary limit.
// A call allowed to fail answers null; GitHub's own words for that failure are kept, as gh.refused, until the next call.
export function makeGh({ exec = (args, input) => run('gh', args, { input }), wait = sleep } = {}) {
  return function gh(args, opts = {}) {
    gh.refused = null;
    let r;
    for (let tries = 0; ; tries++) {
      r = exec(args, opts.input);
      if (r.code === 0) break;
      const text = `${r.stderr}\n${r.stdout}`;
      if (tries >= 4 || !(RATE.test(text) || TRANSIENT.test(text))) break;
      const after = text.match(/retry[- ]after:?\s*(\d+)/i);
      wait(RATE.test(text) ? (after ? Number(after[1]) : 60) * 1000 : 5000 * (tries + 1));
    }
    if (r.code !== 0) {
      const words = (r.stderr || r.stdout).trim().split('\n').slice(0, 3).join(' ');
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
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const eq = a.indexOf('=');
    const k = eq > 0 ? a.slice(2, eq) : a.slice(2);
    const v = eq > 0 ? a.slice(eq + 1) : i + 1 < argv.length && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    if (k in out) out[k] = [].concat(out[k], v); else out[k] = v;
  }
  return out;
}

export const now = () => new Date().toISOString().replace(/:\d\d(\.\d+)?Z$/, 'Z');

// A path entry ending in / is a folder with everything under it; any other names a file.
export const underPath = (file, p) => (p.endsWith('/') ? file.startsWith(p) : file === p || file.startsWith(`${p}/`));

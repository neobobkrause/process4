// Pacing to GitHub's published limits (the owner's decisions G1, G2 of 27 Nov 2026 and K1-K5 of 27 Nov 2026), held on
// each machine in one small file in the temporary folder, under a lock, so that parallel p4 commands on one machine
// share it. Each limit is one GitHub publishes, or its one-second advice; nothing else is added:
// - REST points, 900 a minute (a GET 1 point, any other method 5): each machine's sliding 60 s, held to its role's
//   share of points (POINTS);
// - content creation, 80 a minute and 500 an hour: each machine's sliding 60 s and 60 minutes of content writes (every
//   gh call but a GET), held to its role's shares (MINUTE, HOUR); ARCH's hour also carries a charge of JOB_CHARGE for
//   each job it opens, kept here only (nothing is written to GitHub for it);
// - at least one second between content writes (GitHub's best practice; G1);
// - 6 pushes a minute per repository: each role's share of a push a minute to one repository (PUSHES);
// - the primary limit, 5,000 an hour: where an answer says x-ratelimit-remaining 0, every request of the machine waits
//   until x-ratelimit-reset (`primaryUntil`);
// - a secondary limit's refusal: every write of the machine waits until the time the refusal gives (K4, `notBefore`).
// A request beyond a share waits for room; nothing is refused, unless the wait is longer than LONGEST, when the command
// fails as G2 does, naming the time (UTC) after which to run it again.
import { closeSync, existsSync, openSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Fail } from './util.mjs';

/**
 * Each role's shares, the one place they are set: content writes a minute and an hour, REST points a minute, and pushes
 * a minute to one repository (below 1: one push every 1/share minutes). With eight jobs, one ARCH, coordinator, ROOT,
 * watcher and PROCESS, four walkers and four lanes, they come to about 95% of each of GitHub's limits (the owner's
 * decision A, 27 Nov 2026): content 76 of 80 a minute and 475 of 500 an hour, points 854 of 900 a minute, pushes 5.69
 * of 6 a minute. The hour: ARCH's 350 holds its own writes and a charge of one job's hour (10) for each job it opens,
 * so the jobs' writes are counted there, not again; with the others' 125 that is 475. A job's own 10 an hour leaves room
 * for a job with a failed run and notices (about 13 in its life). Content and points are whole numbers (a share holds
 * whole requests); their rounding is taken up by ARCH's minute and hour, and by the coordinator's minute.
 */
export const SHARES = {
  arch: { minute: 32, hour: 350, points: 325, pushes: 0.65 },
  job: { minute: 3, hour: 10, points: 32, pushes: 0.325 },
  coordinator: { minute: 4, hour: 19, points: 43, pushes: 0.1625 },
  root: { minute: 2, hour: 4, points: 22, pushes: 0.1625 },
  watcher: { minute: 1, hour: 2, points: 11, pushes: 0.1625 },
  walker: { minute: 1, hour: 9, points: 22, pushes: 0.1625 },
  process: { minute: 5, hour: 28, points: 65, pushes: 0.65 },
  lane: { minute: 1, hour: 9, points: 11, pushes: 0.1625 },
};
/** ARCH's hour carries, for each job it opens with `open --module`, one job's hourly share (K3). */
export const JOB_CHARGE = SHARES.job.hour;
/** The longest wait one command bears; beyond it the command fails, naming when to run it again (as G2). */
export const LONGEST = 30 * 60000;
/** A wait longer than this prints one line naming the share. */
export const SAY_AFTER = 10000;
export const PACE_FILE = join(tmpdir(), 'p4-writes.json');
const MINUTE = 60000;
const HOUR = 3600000;
const GAP = 1000;

const realSleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const utc = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');

/**
 * The role of this machine's p4 commands: P4_ROLE, as each starting text's `p4` line sets it. Where it is unset (or
 * names no role), `process` in a repository with no process.json at its root (the process repository), else `job`, the
 * smallest share a product's session has besides the standby ones.
 */
export function roleFor(root, env = process.env) {
  const r = String(env.P4_ROLE ?? '').trim().toLowerCase();
  if (Object.hasOwn(SHARES, r)) return r;
  if (!root) return 'job';
  return existsSync(join(root, 'process.json')) ? 'job' : 'process';
}

let machineRole = null;
/** The role p4.mjs found for this command; the gh calls of the command are paced by it. */
export const useRole = (role) => { machineRole = role; };
export const currentRole = () => machineRole ?? roleFor(null);

function withLock(file, fn) {
  const lock = `${file}.lock`;
  let held = false;
  for (let i = 0; i < 4000 && !held; i++) {
    try { closeSync(openSync(lock, 'wx')); held = true; } catch {
      try { if (Date.now() - statSync(lock).mtimeMs > 10000) rmSync(lock, { force: true }); } catch { /* gone already */ }
      if (!held) realSleep(5);
    }
  }
  try { return fn(); } finally { if (held) rmSync(lock, { force: true }); }
}

const list = (v) => (Array.isArray(v) ? v.filter((e) => Array.isArray(e) && Number.isFinite(e[0])) : []);
function load(file) {
  let s = {};
  try { s = JSON.parse(readFileSync(file, 'utf8')) || {}; } catch { /* none yet, or an older form */ }
  const pushes = {};
  for (const [k, v] of Object.entries(s.pushes && typeof s.pushes === 'object' && !Array.isArray(s.pushes) ? s.pushes : {})) pushes[k] = (Array.isArray(v) ? v : []).filter(Number.isFinite);
  return {
    last: Number(s.last) || 0, notBefore: Number(s.notBefore) || 0, primaryUntil: Number(s.primaryUntil) || 0,
    writes: (Array.isArray(s.writes) ? s.writes : []).filter(Number.isFinite), charges: list(s.charges), points: list(s.points), pushes,
  };
}
function save(file, s, now) {
  s.writes = s.writes.filter((t) => t > now - HOUR);
  s.charges = s.charges.filter(([t]) => t > now - HOUR);
  s.points = s.points.filter(([t]) => t > now - MINUTE);
  for (const k of Object.keys(s.pushes)) { s.pushes[k] = s.pushes[k].filter((t) => t > now - HOUR); if (!s.pushes[k].length) delete s.pushes[k]; }
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(s));
  renameSync(tmp, file);
}

/**
 * The earliest time at which a sliding window of `windowMs` holds room for `need` more, its events ([time, weight], none
 * later than now) counted against `share`: 0 where there is room now.
 */
export function roomAt(events, windowMs, share, need) {
  const ev = events.slice().sort((a, b) => a[0] - b[0]);
  let total = ev.reduce((t, e) => t + e[1], 0);
  if (total + need <= share) return 0;
  if (need > share) return ev.length ? ev[ev.length - 1][0] + windowMs : 0;
  for (const [t, w] of ev) {
    total -= w;
    if (total + need <= share) return t + windowMs;
  }
  return 0;
}

const pushWindow = (share) => (share >= 1 ? { ms: MINUTE, count: Math.floor(share) } : { ms: Math.round(MINUTE / share), count: 1 });

/**
 * What a request must wait for, given the file's state: [time, the share's name] for each limit that applies to it.
 * kind: 'read' (a GET), 'write' (any other gh call), 'push' (a git push to the repository `slug`), 'charge' (ARCH's
 * charge for a job it opens: room in its hour for JOB_CHARGE) or 'room' (the same room, waited for, nothing taken).
 */
function limits(s, { kind, role, slug, now }) {
  const sh = SHARES[role] || SHARES.job;
  const out = [];
  const hourEvents = () => [...s.writes.filter((t) => t > now - HOUR).map((t) => [t, 1]), ...s.charges.filter(([t]) => t > now - HOUR)];
  if (kind === 'read' || kind === 'write') {
    out.push([s.primaryUntil, "GitHub's primary limit (x-ratelimit-remaining 0) until its reset"]);
    const pts = kind === 'write' ? 5 : 1;
    out.push([roomAt(s.points.filter(([t]) => t > now - MINUTE), MINUTE, sh.points, pts), `the ${role} share of REST points, ${sh.points} a minute on this machine`]);
  }
  if (kind === 'write') {
    out.push([s.notBefore, "GitHub's refusal (a secondary rate limit) on this machine"]);
    out.push([s.last ? s.last + GAP : 0, 'one second between writes']);
    out.push([roomAt(s.writes.filter((t) => t > now - MINUTE).map((t) => [t, 1]), MINUTE, sh.minute, 1), `the ${role} share of content writes, ${sh.minute} a minute on this machine`]);
    out.push([roomAt(hourEvents(), HOUR, sh.hour, 1), `the ${role} share of content writes, ${sh.hour} an hour on this machine`]);
  }
  if (kind === 'charge' || kind === 'room') {
    out.push([roomAt(hourEvents(), HOUR, sh.hour, JOB_CHARGE), `the ${role} share of content writes, ${sh.hour} an hour (each job opened counts ${JOB_CHARGE})`]);
  }
  if (kind === 'push') {
    const w = pushWindow(sh.pushes);
    const times = (s.pushes[slug || '?'] || []).filter((t) => t > now - w.ms).map((t) => [t, 1]);
    out.push([roomAt(times, w.ms, w.count, 1), `the ${role} share of pushes to ${slug || 'the repository'}, ${sh.pushes < 1 ? `one every ${w.ms / MINUTE} minutes` : `${w.count} a minute`}`]);
  }
  return out;
}

function record(s, { kind, slug, now }) {
  if (kind === 'read') s.points.push([now, 1]);
  if (kind === 'write') { s.points.push([now, 5]); s.writes.push(now); s.last = now; }
  if (kind === 'charge') s.charges.push([now, JOB_CHARGE]);
  if (kind === 'push') (s.pushes[slug || '?'] ||= []).push(now);
}

/**
 * Waits until the request has room under every limit that applies to it, then takes its place, under the file's lock
 * (so parallel p4 commands never take the same place); the wait itself is outside the lock. Prints one line (`say`) when
 * the wait is longer than ten seconds, naming the share; fails, naming the time after which to run the command again,
 * when it is longer than LONGEST.
 */
export function take({ kind, role = currentRole(), slug = null, file = PACE_FILE, nowMs = Date.now, wait = realSleep, say = (l) => console.error(l) } = {}) {
  const first = nowMs();
  let said = false;
  for (let i = 0; ; i++) {
    let until = 0;
    let why = '';
    withLock(file, () => {
      const s = load(file);
      const now = nowMs();
      const all = limits(s, { kind, role, slug, now });
      for (const [t, name] of all) if (t > until) { until = t; why = name; }
      // the second between writes, after a write that itself waited, is named by what that write waited for
      const behind = all.find(([t, name]) => name !== 'one second between writes' && t > now && t >= until - GAP);
      if (behind) why = behind[1];
      if (until <= now) {
        if (kind !== 'room') { record(s, { kind, slug, now }); save(file, s, now); }
        until = 0;
      }
    });
    if (!until) return;
    if (until - first > LONGEST || i > 10000) throw new Fail(`waiting for ${why} would take ${Math.ceil((until - first) / 60000)} minutes: run the command again after ${utc(until)}`);
    if (!said && until - nowMs() > SAY_AFTER) { say(`p4: waiting ${Math.ceil((until - nowMs()) / 1000)} s for ${why}`); said = true; }
    wait(until - nowMs());
  }
}

/** Notes, for every p4 command of this machine, what an answer said: `primaryUntil` or `notBefore` (ms), or extra `points`. */
export function note({ file = PACE_FILE, nowMs = Date.now, primaryUntil, notBefore, points } = {}) {
  withLock(file, () => {
    const s = load(file);
    const now = nowMs();
    if (primaryUntil) s.primaryUntil = Math.max(s.primaryUntil, primaryUntil);
    if (notBefore) s.notBefore = Math.max(s.notBefore, notBefore);
    if (points > 0) s.points.push([now, points]);
    save(file, s, now);
  });
}

/** What the file holds (for tests and for reading). */
export const paceState = (file = PACE_FILE) => load(file);

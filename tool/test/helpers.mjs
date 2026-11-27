// Throwaway repositories and a GitHub held in memory, for the tool's own tests.
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { git } from '../lib/util.mjs';

export function write(root, files) {
  for (const [p, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, p)), { recursive: true });
    writeFileSync(join(root, p), typeof text === 'string' ? text : JSON.stringify(text, null, 2) + '\n');
  }
}

export function commit(root, files, msg = 'change') {
  write(root, files);
  git(['add', '-A'], { cwd: root });
  git(['commit', '-q', '-m', msg], { cwd: root });
  return git(['rev-parse', 'HEAD'], { cwd: root });
}

// A repository on branch main with a bare origin, every branch pushed.
export function makeRepo(files = { 'README.md': 'x\n' }) {
  const root = mkdtempSync(join(tmpdir(), 'p4-test-'));
  git(['init', '-q', '-b', 'main'], { cwd: root });
  for (const [k, v] of [['user.email', 't@example.com'], ['user.name', 'Test'], ['commit.gpgsign', 'false']]) git(['config', k, v], { cwd: root });
  commit(root, files, 'initial');
  const bare = join(mkdtempSync(join(tmpdir(), 'p4-origin-')), 'o.git');
  git(['init', '-q', '--bare', bare], { cwd: root });
  git(['remote', 'add', 'origin', bare], { cwd: root });
  git(['push', '-q', 'origin', 'main'], { cwd: root });
  return root;
}

export const config = (over = {}) => ({
  process: { repository: 'https://github.com/o/process4', version: '4.0.0', commit: 'a'.repeat(40) },
  tranche_branch: 'tranche', node: '22', lock_files: [], test_command: 'node --test', process_folder: 'process/', ...over,
});

export const productFiles = () => ({
  'process.json': config(),
  'process/modules/order.txt': 'dates\norders\n',
  'process/modules/dates.json': { name: 'dates', files: ['src/dates/'], tests: ['test/dates/'], uses: [] },
  'process/modules/orders.json': { name: 'orders', files: ['src/orders/'], tests: ['test/orders/'], uses: ['dates'] },
  'process/modules/orders.md': 'Length: 8 lines.\n\n# orders\n\nNext number: 3\n\n- **R1** [met] one\n- **R2** [not yet met] two\n',
  'src/dates/index.mjs': 'export const d = 1;\n',
  'src/orders/index.mjs': "import { d } from '../dates/index.mjs';\nexport const o = d;\n",
});

// GitHub in memory: pull requests, issues, comments, labels, check runs, all by number.
export function fakeGitHub(over = {}) {
  // `earlier`: pull requests merged before the test began (each module's conversion: `converted`), read with the rest
  // but kept out of `prs`, so that a test's own pull requests are `prs` alone.
  const s = { prs: [], earlier: [], issues: [], comments: [], labels: [], runs: [], wfruns: [], logs: {}, releases: [], next: 1, nextComment: 100, calls: [], time: '2026-11-20T10:00:00Z' };
  const gh = {
    s,
    repo: () => ({ default_branch: 'main' }),
    getPR: (slug, n) => s.prs.find((p) => p.number === n) ?? s.earlier.find((p) => p.number === n),
    prForBranch: (slug, b) => s.prs.find((p) => p.state === 'open' && p.head.ref === b) || null,
    lastPRForBranch: (slug, b) => s.prs.filter((p) => p.head.ref === b).slice(-1)[0] || null,
    closedPRs: (slug, base) => s.prs.filter((p) => p.state === 'closed' && (!base || p.base.ref === base)),
    createPR: (slug, { head, base, title, draft }) => {
      const pr = { number: s.next++, state: 'open', draft, title, html_url: `https://gh/pr/${s.next - 1}`, head: { ref: head, sha: 'h'.repeat(40) }, base: { ref: base } };
      s.prs.push(pr);
      return pr;
    },
    markReady: (slug, n) => { gh.getPR(slug, n).draft = false; },
    mergePR: (slug, n, sha) => { s.calls.push(['merge', n, sha]); return { merged: true, sha: 'm'.repeat(40) }; },
    comments: (slug, n) => [...(s.earlier.find((p) => p.number === n)?.comments ?? []), ...s.comments.filter((c) => c.on === n)],
    addComment: (slug, n, body) => { const c = { id: s.nextComment++, on: n, body, created_at: s.time, updated_at: s.time }; s.comments.push(c); return c; },
    editComment: (slug, id, body) => { const c = s.comments.find((x) => x.id === id); if (!c) return null; c.body = body; c.updated_at = s.time; return c; },
    allPRs: (slug, base) => [...s.earlier, ...s.prs].filter((p) => p.base.ref === base).slice().reverse(),
    closePR: (slug, n) => { s.calls.push(['close', n]); gh.getPR(slug, n).state = 'closed'; },
    runsForHead: (slug, sha) => s.wfruns.filter((r) => r.head_sha === sha),
    rerunRun: (slug, id) => { const r = s.wfruns.find((x) => x.id === id); s.calls.push(['rerun', id]); return !!r && r.status === 'completed'; },
    issuesByLabel: (slug, label) => s.issues.filter((i) => i.labels.includes(label) && i.state !== 'closed'),
    createLabel: (slug, name) => { s.labels.push(name); },
    createIssue: (slug, { title, labels }) => { const i = { number: s.next++, title, labels, state: 'open' }; s.issues.push(i); return i; },
    lockIssue: (slug, n) => { s.calls.push(['lock', n]); },
    closeIssue: (slug, n) => { s.calls.push(['close-issue', n]); const i = s.issues.find((x) => x.number === n); if (i) i.state = 'closed'; },
    createRelease: (slug, body) => {
      const n = s.next++;
      const rel = { id: n, tag_name: body.tag_name, name: body.name, body: body.body, draft: !!body.draft, prerelease: !!body.prerelease, target_commitish: body.target_commitish, html_url: `https://gh/releases/${encodeURIComponent(body.tag_name)}`, upload_url: `https://uploads/repos/releases/${n}/assets{?name,label}`, assets: [] };
      s.releases.push(rel); s.calls.push(['create-release', rel.tag_name]); return rel;
    },
    releaseByTag: (slug, tag) => s.releases.find((r) => r.tag_name === tag) || null,
    updateRelease: (slug, id, body) => { const r = s.releases.find((x) => x.id === id); Object.assign(r, body); s.calls.push(['update-release', id]); return r; },
    uploadReleaseAsset: (slug, release, file) => { const r = s.releases.find((x) => x.id === release.id); const name = file.split('/').pop(); r.assets.push({ name }); s.calls.push(['upload-asset', release.id, name]); return { name }; },
    checkRuns: (slug, sha, name) => s.runs.filter((r) => r.sha === sha && r.name === name),
    jobLog: (slug, id) => s.logs[id] || null,
    ...over,
  };
  return gh;
}

// A pace file and a merged-kinds file of the test's own, so that no test reads or writes the machine's (pace.mjs, K5).
export const isolated = () => ({
  paceFile: join(mkdtempSync(join(tmpdir(), 'p4-pace-')), 'pace.json'),
  kindsFile: join(mkdtempSync(join(tmpdir(), 'p4-kinds-')), 'kinds.json'),
});

export function ctxFor(root, gh, over = {}) {
  const out = [];
  let t = Date.parse('2026-11-20T10:00:00Z');
  return {
    out,
    ctx: {
      root, slug: 'o/product', gh, log: (x) => out.push(String(x)),
      wait: (ms) => { t += ms; out.push(`(waited ${Math.round(ms / 1000)} s)`); },
      nowMs: () => t,
      paceFile: join(mkdtempSync(join(tmpdir(), 'p4-pace-')), 'pace.json'),
      kindsFile: join(mkdtempSync(join(tmpdir(), 'p4-kinds-')), 'kinds.json'),
      ...over,
    },
  };
}

// Each module's conversion merged before the test began (design part 2, section 7, "The conversion"): a merged job pull
// request of kind `conversion` into the tranche branch, job/<module>.1, numbered from 900. The modules' next jobs are
// job/<module>.2.
export function converted(gh, modules, base = 'tranche') {
  for (const m of modules) {
    const pr = { number: 900 + gh.s.earlier.length, state: 'closed', merged_at: '2026-11-01T00:00:00Z', closed_at: '2026-11-01T00:00:00Z', title: `${m}: job 1`, head: { ref: `job/${m}.1`, sha: 'c'.repeat(40) }, base: { ref: base } };
    pr.comments = [{ id: 9000 + pr.number, on: pr.number, body: `<!-- process4-job -->\n\`\`\`json\n${JSON.stringify({ module: m, work: ['conversion: bring the module into the coding standard'], kind: 'conversion' })}\n\`\`\`\n` }];
    gh.s.earlier.push(pr);
  }
}

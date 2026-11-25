// GitHub acts and reads, all through gh, REST only. Each takes `gh` so that tests replace it.
import { basename } from 'node:path';
import { fail, gh as realGh } from './util.mjs';

// A machine-readable comment: the hidden mark, one fenced JSON block, then any plain words.
export const block = (mark, data, words = '') =>
  `<!-- ${mark} -->\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n${words ? `\n${words.trim()}\n` : ''}`;

export function parseBlock(body, mark) {
  if (typeof body !== 'string' || body.split('\n')[0].trim() !== `<!-- ${mark} -->`) return null;
  const m = body.match(/```json\n([\s\S]*?)\n```\n?([\s\S]*)$/);
  if (!m) return null;
  try { return { data: JSON.parse(m[1]), words: m[2].trim() }; } catch { return null; }
}

export function makeGitHub(gh = realGh) {
  const api = (path, opts) => gh(['api', path], opts);
  const send = (method, path, body, opts) => gh(['api', '-X', method, path, '--input', '-'], { input: JSON.stringify(body ?? {}), ...opts });
  const pages = (path) => { const p = gh(['api', '--paginate', '--slurp', path]); return Array.isArray(p) ? p.flat() : []; };
  return {
    repo: (slug) => api(`repos/${slug}`),
    getPR: (slug, n) => api(`repos/${slug}/pulls/${n}`),
    // The open pull request whose head is this branch, or null.
    prForBranch: (slug, branch) => {
      const owner = slug.split('/')[0];
      return (api(`repos/${slug}/pulls?state=open&head=${owner}:${encodeURIComponent(branch)}&per_page=10`) || [])[0] || null;
    },
    // Every pull request into a branch, open and closed, newest first.
    allPRs: (slug, base) => pages(`repos/${slug}/pulls?state=all&base=${encodeURIComponent(base)}&sort=created&direction=desc&per_page=100`),
    closePR: (slug, n) => send('PATCH', `repos/${slug}/pulls/${n}`, { state: 'closed' }),
    // The workflow runs of pull request events on one head commit, from GitHub's record of runs.
    runsForHead: (slug, sha) => pages(`repos/${slug}/actions/runs?head_sha=${sha}&event=pull_request&per_page=100`)
      .flatMap((p) => p.workflow_runs || []),
    // Asks GitHub to run a workflow run again. True when GitHub took it, false when it refused (a run still going).
    // `-i` prints the answer's status line, so that an empty answer to a taken request is told from a refusal.
    rerunRun: (slug, id) => gh(['api', '-i', '-X', 'POST', `repos/${slug}/actions/runs/${id}/rerun`], { allowFail: true }) !== null,
    closedPRs: (slug, base) => api(`repos/${slug}/pulls?state=closed&base=${encodeURIComponent(base)}&sort=updated&direction=desc&per_page=50`) || [],
    createPR: (slug, body) => {
      const pr = send('POST', `repos/${slug}/pulls`, body);
      if (!pr?.number) fail('GitHub did not return a pull request');
      return pr;
    },
    // GitHub's REST interface has no ready-for-review call, and `gh pr ready` uses GraphQL, which sessions cannot
    // reach (HTTP 403), so it is not tried: sessions reach it by their proxy's own route only, and a refusal there ends
    // with GitHub's words (build text 1b, preamble: a refusal by GitHub is printed and never retried by another route).
    markReady: (slug, n) => {
      const r = gh(['api', '-X', 'POST', `repos/${slug}/pulls/${n}/ccr/ready_for_review`], { allowFail: true });
      if (r === null) fail(`GitHub would not mark pull request ${n} ready${gh.refused ? `: ${gh.refused}` : ''}`);
    },
    // The newest pull request of a branch in any state, or null: for a branch whose pull request has merged or closed.
    lastPRForBranch: (slug, branch) => {
      const owner = slug.split('/')[0];
      return (api(`repos/${slug}/pulls?state=all&head=${owner}:${encodeURIComponent(branch)}&sort=created&direction=desc&per_page=10`) || [])[0] || null;
    },
    mergePR: (slug, n, sha, title) => send('PUT', `repos/${slug}/pulls/${n}/merge`, { sha, merge_method: 'merge', commit_title: title }),
    comments: (slug, n) => pages(`repos/${slug}/issues/${n}/comments?per_page=100`),
    addComment: (slug, n, body) => send('POST', `repos/${slug}/issues/${n}/comments`, { body }),
    editComment: (slug, id, body, opts) => send('PATCH', `repos/${slug}/issues/comments/${id}`, { body }, opts),
    // GitHub's own words for the last call allowed to fail that failed, or ''.
    refusal: () => gh.refused || '',
    issuesByLabel: (slug, label) => (api(`repos/${slug}/issues?state=open&labels=${encodeURIComponent(label)}&per_page=100`) || [])
      .filter((i) => !i.pull_request),
    createLabel: (slug, name, color, description) => send('POST', `repos/${slug}/labels`, { name, color, description }, { allowFail: true }),
    createIssue: (slug, body) => send('POST', `repos/${slug}/issues`, body),
    lockIssue: (slug, n) => send('PUT', `repos/${slug}/issues/${n}/lock`, {}, { allowFail: true }),
    closeIssue: (slug, n) => send('PATCH', `repos/${slug}/issues/${n}`, { state: 'closed' }),
    // Releases (build text 1b, commands 7 and 8). REST only, as everything else.
    createRelease: (slug, body) => {
      const rel = send('POST', `repos/${slug}/releases`, body);
      if (!rel?.id || !rel?.html_url) fail('GitHub did not return a release');
      return rel;
    },
    releaseByTag: (slug, tag) => api(`repos/${slug}/releases/tags/${encodeURIComponent(tag)}`, { allowFail: true }),
    updateRelease: (slug, id, body) => send('PATCH', `repos/${slug}/releases/${id}`, body),
    // The upload goes to the release's own upload_url (its host is uploads.github.com); the file
    // is sent as-is. Strip the RFC 6570 template (`{?name,label}`) and name the asset after the file.
    uploadReleaseAsset: (slug, release, file) => {
      const url = String(release.upload_url || '').replace(/\{[^}]*\}$/, '');
      if (!url) fail('the release has no upload_url for assets');
      return gh(['api', '--method', 'POST', `${url}?name=${encodeURIComponent(basename(file))}`,
        '-H', 'Content-Type: application/octet-stream', '--input', file]);
    },
    checkRuns: (slug, sha, name) => (api(`repos/${slug}/commits/${sha}/check-runs?check_name=${encodeURIComponent(name)}&per_page=50`)?.check_runs || []),
    // A check run of a workflow is that workflow's job: its log is the job's log.
    jobLog: (slug, id) => {
      const log = api(`repos/${slug}/actions/jobs/${id}/logs`, { allowFail: true });
      return typeof log === 'string' ? log : null;
    },
  };
}

export const github = makeGitHub();

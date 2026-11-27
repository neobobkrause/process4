// The tool's side of the state service. Two forms: `connect` (async, fetch) and `connectSync` (the tool's commands are
// synchronous, as tool/lib/state.mjs and github.mjs are: each call runs a short child process). Both offer the views,
// `append` for events, and readRecords/writeRecord shaped like tool/lib/state.mjs's, so a command could keep its logic.
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const qs = (p) => { const e = Object.entries(p || {}).filter(([, v]) => v != null && v !== false); return e.length ? `?${new URLSearchParams(e.map(([k, v]) => [k, v === true ? 'on' : String(v)]))}` : ''; };
const need = (o) => { for (const k of ['url', 'key', 'product']) if (!o[k]) throw new Error(`the state service needs ${k}`); return o; };

function api(call, product) {
  const views = {
    brief: (role, o = {}) => call('GET', `/p/${product}/brief${qs({ role, ...o })}`),
    next: (o = {}) => call('GET', `/p/${product}/next${qs(o)}`),
    owed: (session, o = {}) => call('GET', `/p/${product}/owed${qs({ session, ...o })}`),
    anomalies: (o = {}) => call('GET', `/p/${product}/anomalies${qs(o)}`),
    mergeQueue: (o = {}) => call('GET', `/p/${product}/merge-queue${qs(o)}`),
    stats: () => call('GET', `/p/${product}/stats`),
    events: (o = {}) => call('GET', `/p/${product}/events${qs(o)}`),
  };
  return views;
}

const unwrap = (r) => { if (r.status >= 400) { const e = new Error(r.body?.error || `status ${r.status}`); e.status = r.status; throw e; } return r.body; };

export function connect(opts) {
  const { url, key, product, timeoutMs = 3000, fetchImpl = fetch, retries = 2 } = need(opts);
  const call = async (method, path, body) => {
    let last;
    for (let i = 0; i <= retries; i++) {
      try {
        const r = await fetchImpl(url + path, { method, headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(timeoutMs) });
        return unwrap({ status: r.status, body: await r.json() });
      } catch (e) { if (e.status) throw e; last = e; } // a refusal is final; a lost connection is tried again with the same key
    }
    throw last;
  };
  const views = api(call, product);
  const append = (kind, body, o = {}) => call('POST', `/p/${product}/events`, { key: o.key || `${product}:${randomUUID()}`, kind, body, actor: o.actor ?? null, ...(o.at ? { at: o.at } : {}) });
  return {
    ...views, append,
    readRecords: async () => ({ records: Object.fromEntries(Object.entries(await call('GET', `/p/${product}/records`)).map(([k, data]) => [k, { data }])) }),
    writeRecord: (k, data, words = '', o = {}) => append('record.put', { key: k, data, words }, o),
  };
}

const CHILD = fileURLToPath(new URL('./sync-call.mjs', import.meta.url));
export function connectSync(opts) {
  const { url, key, product, timeoutMs = 3000 } = need(opts);
  const call = (method, path, body) => {
    const p = spawnSync(process.execPath, [CHILD], { input: JSON.stringify({ url: url + path, key, method, body, timeoutMs }), encoding: 'utf8', timeout: timeoutMs + 2000 });
    if (p.status !== 0) throw new Error(`the state service did not answer: ${(p.stderr || p.error?.message || '').trim().slice(0, 300)}`);
    return unwrap(JSON.parse(p.stdout));
  };
  const views = api(call, product);
  const append = (kind, body, o = {}) => call('POST', `/p/${product}/events`, { key: o.key || `${product}:${randomUUID()}`, kind, body, actor: o.actor ?? null, ...(o.at ? { at: o.at } : {}) });
  return {
    ...views, append,
    readRecords: () => ({ records: Object.fromEntries(Object.entries(call('GET', `/p/${product}/records`)).map(([k, data]) => [k, { data }])) }),
    writeRecord: (k, data, words = '', o = {}) => append('record.put', { key: k, data, words }, o),
  };
}

export const fromEnv = (env = process.env) => connect({ url: env.P4_STATE_URL, key: env.P4_STATE_KEY, product: env.P4_PRODUCT });

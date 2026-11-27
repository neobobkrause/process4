// Starts the state service locally on workerd through Miniflare: no Cloudflare account, no network beyond localhost.
import { Miniflare } from 'miniflare';
import { createHash, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const hash = (k) => createHash('sha256').update(k).digest('hex');

export async function startService({ persist = false, port = 0, scriptDir = null } = {}) {
  const keys = { writer: `w-${randomBytes(16).toString('hex')}`, reader: `r-${randomBytes(16).toString('hex')}`, import: `i-${randomBytes(16).toString('hex')}` };
  const dir = scriptDir || here('../src');
  const mf = new Miniflare({
    modules: true,
    scriptPath: `${dir}/worker.js`,
    modulesRoot: dir,
    modulesRules: [{ type: 'ESModule', include: ['**/*.mjs', '**/*.js'] }],
    compatibilityDate: '2025-09-01',
    durableObjects: { PRODUCT: { className: 'Product', useSQLite: true } },
    durableObjectsPersist: persist || false,
    bindings: { KEYS: JSON.stringify(Object.fromEntries(Object.entries(keys).map(([role, k]) => [hash(k), role]))) },
    port,
  });
  const url = (await mf.ready).toString().replace(/\/$/, '');
  return { mf, url, keys, stop: () => mf.dispose() };
}

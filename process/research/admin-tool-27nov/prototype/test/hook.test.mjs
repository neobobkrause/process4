// The PostToolUse hook: records the harness's own answer; one tool call reported twice records once; exits 0 when
// the service is unreachable or never answers (it ends at its own deadline; the test's timeout fails a hook that hangs).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { startService } from '../lib/local.mjs';
import { connect } from '../lib/client.mjs';

const HOOK = fileURLToPath(new URL('../hook/post-tool-use.mjs', import.meta.url));
const run = (input, env) => new Promise((res) => {
  const p = spawn(process.execPath, [HOOK], { env: { ...process.env, ...env } });
  let out = '';
  p.stdout.on('data', (d) => { out += d; });
  p.stderr.on('data', (d) => { out += d; });
  p.on('exit', (code) => res({ code, out }));
  p.stdin.end(typeof input === 'string' ? input : JSON.stringify(input));
});

let svc;
before(async () => { svc = await startService(); });
after(() => svc.stop());

const created = {
  session_id: 'session_ARCHaaaaaaaaaaaaaaaaaaaa', hook_event_name: 'PostToolUse', tool_use_id: 'toolu_01',
  tool_name: 'mcp__claude-code-remote__create_session', tool_input: { title: 'case-checker #6', prompt: 'fetch, then p4 job brief' },
  tool_response: [{ type: 'text', text: '{"session_id":"session_JOBbbbbbbbbbbbbbbbbbbbbb","status":"running"}' }],
};
const archived = { ...created, tool_use_id: 'toolu_02', tool_name: 'mcp__claude-code-remote__archive_session', tool_input: { session_id: 'session_JOBbbbbbbbbbbbbbbbbbbbbb' }, tool_response: [{ type: 'text', text: '{"archived":true}' }] };

test('records create and archive from the harness answers; a repeat records once', async () => {
  const env = { P4_STATE_URL: svc.url, P4_STATE_KEY: svc.keys.writer, P4_PRODUCT: 'hooked' };
  const a = await run(created, env);
  const b = await run(created, env);
  const c = await run(archived, env);
  assert.deepEqual([a.code, b.code, c.code], [0, 0, 0]);
  const cl = connect({ url: svc.url, key: svc.keys.reader, product: 'hooked' });
  assert.equal((await cl.stats()).events, 2);
  const evs = await cl.events();
  assert.deepEqual(evs.map((e) => e.body.tool_name), [created.tool_name, archived.tool_name]);
});

test('unreachable service: exits 0', { timeout: 10000 }, async () => {
  const r = await run(created, { P4_STATE_URL: 'http://127.0.0.1:9', P4_STATE_KEY: 'x'.repeat(20), P4_PRODUCT: 'x' });
  assert.equal(r.code, 0);
});

test('a service that accepts and never answers: exits 0 at its deadline', { timeout: 10000 }, async () => {
  const srv = createServer(() => {}).listen(0);
  const port = srv.address().port;
  const r = await run(created, { P4_STATE_URL: `http://127.0.0.1:${port}`, P4_STATE_KEY: 'x'.repeat(20), P4_PRODUCT: 'x', P4_HOOK_TIMEOUT_MS: '800' });
  srv.close();
  assert.equal(r.code, 0);
});

test('bad input or no configuration: exits 0', async () => {
  assert.equal((await run('not json', { P4_STATE_URL: svc.url, P4_STATE_KEY: svc.keys.writer, P4_PRODUCT: 'x' })).code, 0);
  assert.equal((await run(created, { P4_STATE_URL: '', P4_STATE_KEY: '', P4_PRODUCT: '' })).code, 0);
});

test('the folded state names the created session and its archive', async () => {
  const s = await (await fetch(`${svc.url}/p/hooked/state`, { headers: { authorization: `Bearer ${svc.keys.reader}` } })).json();
  const j = s.sessions.session_JOBbbbbbbbbbbbbbbbbbbbbb;
  assert.equal(j.by, 'session_ARCHaaaaaaaaaaaaaaaaaaaa');
  assert.equal(j.title, 'case-checker #6');
  assert.ok(j.created && j.archived && j.archived >= j.created);
});

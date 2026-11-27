#!/usr/bin/env node
// A PostToolUse hook: reads the hook's JSON on stdin (tool_name, tool_input, tool_response, session_id; Claude Code
// hooks docs) and posts it as one event to the state service. It never stalls or fails the session: it gives the
// call a short deadline, and exits 0 whatever happens (a hook's non-zero exit is shown to the session; 2 blocks).
// Configuration from the environment: P4_STATE_URL, P4_STATE_KEY, P4_PRODUCT, P4_HOOK_TIMEOUT_MS (default 1500).
import { createHash } from 'node:crypto';

const LIMIT = 4096; // a tool's answer can be long; the event keeps its head
const trim = (v) => { const t = typeof v === 'string' ? v : JSON.stringify(v ?? null); return t.length > LIMIT ? `${t.slice(0, LIMIT)}...[${t.length} bytes]` : t; };

async function main() {
  const deadline = Number(process.env.P4_HOOK_TIMEOUT_MS || 1500);
  const killer = setTimeout(() => process.exit(0), deadline + 500); // the last guard: never outlive the deadline
  killer.unref();
  let raw = '';
  for await (const c of process.stdin) raw += c;
  const { P4_STATE_URL: url, P4_STATE_KEY: key, P4_PRODUCT: product } = process.env;
  if (!url || !key || !product) return;
  let h;
  try { h = JSON.parse(raw); } catch { return; }
  // The same tool call reported twice records once: the key is the tool call's id where the input has one, else the
  // whole input's hash.
  const key2 = `hook:${h.session_id || 'nosession'}:${h.tool_use_id || createHash('sha256').update(raw).digest('hex').slice(0, 32)}`;
  const small = h.tool_input && JSON.stringify(h.tool_input).length <= LIMIT;
  const body = { tool_name: h.tool_name, session_id: h.session_id, tool_input: small ? h.tool_input : { trimmed: trim(h.tool_input) }, tool_response: trim(h.tool_response) };
  await fetch(`${url}/p/${product}/events`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ key: key2, kind: 'hook.post_tool_use', body, actor: h.session_id || null }),
    signal: AbortSignal.timeout(deadline),
  });
}

main().catch(() => {}).finally(() => process.exit(0));

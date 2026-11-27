// One HTTP call for connectSync: reads {url, key, method, body, timeoutMs} on stdin, prints {status, body}.
let input = '';
for await (const c of process.stdin) input += c;
const { url, key, method, body, timeoutMs } = JSON.parse(input);
const r = await fetch(url, { method, headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(timeoutMs || 3000) });
process.stdout.write(JSON.stringify({ status: r.status, body: await r.json() }));

// The state service: a Worker that checks a bearer key and hands each request to the product's own Durable Object
// (SQLite-backed). The object keeps an append-only event log, stamps each event with its own clock, and answers the
// derived views from the folded state. Local prototype only: run with Miniflare or `wrangler dev --local`.
import { DurableObject } from 'cloudflare:workers';
import { REDUCER_VERSION, initial, apply, validate } from './reducer.mjs';
import { mergeQueue, anomalies, next, owed, brief } from './views.mjs';

const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { 'content-type': 'application/json' } });
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (text) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
const MAX_BODY = 256 * 1024; // one event; a Durable Object's SQLite takes at most 8 MB in a row (D1: 2 MB), and the snapshot row holds all state

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const m = url.pathname.match(/^\/p\/([a-z0-9][a-z0-9-]{0,63})(\/[a-z/-]*)$/);
    if (!m) return json({ error: 'no such path; use /p/<product>/<view>' }, 404);
    const presented = (req.headers.get('authorization') || '').match(/^Bearer (.{16,200})$/)?.[1];
    const keys = JSON.parse(env.KEYS || '{}'); // sha-256 of each key -> role; the keys themselves are never stored
    const role = presented ? keys[await sha256(presented)] : undefined;
    if (!role) return json({ error: 'unauthorized' }, 401);
    if (req.method !== 'GET' && role === 'reader') return json({ error: 'this key reads only' }, 403);
    const h = new Headers(req.headers);
    h.delete('authorization');
    h.set('x-p4-role', role);
    const stub = env.PRODUCT.get(env.PRODUCT.idFromName(m[1]));
    return stub.fetch(new Request(`https://object${m[2]}${url.search}`, { method: req.method, headers: h, body: req.method === 'GET' ? undefined : await req.text() }));
  },
};

export class Product extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => this.load());
  }

  load() {
    this.sql.exec(`CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE,
      at TEXT NOT NULL, received TEXT NOT NULL, kind TEXT NOT NULL, actor TEXT, body TEXT NOT NULL, hash TEXT NOT NULL)`);
    this.sql.exec('CREATE TABLE IF NOT EXISTS snapshot (id INTEGER PRIMARY KEY CHECK (id = 1), v INTEGER, seq INTEGER, state TEXT)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS records (key TEXT PRIMARY KEY, data TEXT, seq INTEGER, at TEXT)');
    const snap = this.sql.exec('SELECT v, seq, state FROM snapshot WHERE id = 1').toArray()[0];
    const top = this.sql.exec('SELECT COALESCE(MAX(seq), 0) AS m FROM events').one().m;
    if (snap && snap.v === REDUCER_VERSION) {
      this.state = JSON.parse(snap.state);
      if (snap.seq < top) this.foldFrom(snap.seq);
      this.loaded = { how: snap.seq < top ? 'snapshot+tail' : 'snapshot'};
    } else {
      this.state = initial();
      this.foldFrom(0);
      this.loaded = { how: snap ? `refold (reducer ${snap.v} -> ${REDUCER_VERSION})` : 'refold'};
    }
    this.saveSnapshot();
  }

  foldFrom(seq) {
    for (const r of this.sql.exec('SELECT seq, at, kind, actor, body FROM events WHERE seq > ? ORDER BY seq', seq)) {
      apply(this.state, { seq: r.seq, at: r.at, kind: r.kind, actor: r.actor, body: JSON.parse(r.body) });
    }
  }

  foldUntil(t) {
    const st = initial();
    for (const r of this.sql.exec('SELECT seq, at, kind, actor, body FROM events WHERE at <= ? ORDER BY seq', t)) apply(st, { seq: r.seq, at: r.at, kind: r.kind, actor: r.actor, body: JSON.parse(r.body) });
    return st;
  }

  saveSnapshot() {
    this.sql.exec('INSERT INTO snapshot (id, v, seq, state) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET v = excluded.v, seq = excluded.seq, state = excluded.state',
      REDUCER_VERSION, this.state.seq, JSON.stringify(this.state));
  }

  // The object's own time. Inside a Worker the clock does not move while code runs (it moves only across I/O), so two
  // events in one turn can carry the same time: the order is the sequence number, the time only a stamp.
  stamp() { return new Date().toISOString(); }

  async append(role, input) {
    const { key, kind, body = {}, actor = null } = input || {};
    if (typeof key !== 'string' || key.length < 8 || key.length > 200) return json({ error: 'an idempotency key of 8 to 200 characters is needed' }, 400);
    try { validate(kind, body); } catch (e) { return json({ error: e.message }, 400); }
    if (input.at && role !== 'import') return json({ error: 'only an import key may give an event its time; the object stamps it' }, 403);
    const text = JSON.stringify(body);
    if (text.length > MAX_BODY) return json({ error: `the body is ${text.length} bytes; at most ${MAX_BODY}` }, 413);
    const hash = await sha256(JSON.stringify([kind, text, actor]));
    // From here to the end nothing awaits: the check, the insert, the fold and the snapshot are one synchronous step,
    // which the object runs alone, so concurrent writers cannot interleave inside it.
    const had = this.sql.exec('SELECT seq, at, hash FROM events WHERE key = ?', key).toArray()[0];
    if (had) return had.hash === hash ? json({ seq: had.seq, at: had.at, duplicate: true }) : json({ error: `key ${key} was used for a different event (seq ${had.seq})` }, 409);
    const received = this.stamp();
    const at = input.at || received;
    // The views fold in sequence order; an imported event older than the newest would put the log out of time order.
    if (input.at && this.state.last_at && at < this.state.last_at) return json({ error: `an event at ${at} is older than the newest (${this.state.last_at}); import in time order` }, 409);
    try {
      return this.ctx.storage.transactionSync(() => {
        const seq = this.sql.exec('INSERT INTO events (key, at, received, kind, actor, body, hash) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING seq', key, at, received, kind, actor, text, hash).one().seq;
        apply(this.state, { seq, at, kind, actor, body });
        if (kind === 'record.put') this.sql.exec('INSERT INTO records (key, data, seq, at) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET data = excluded.data, seq = excluded.seq, at = excluded.at', body.key, JSON.stringify(body.data ?? null), seq, at);
        this.saveSnapshot();
        return json({ seq, at, duplicate: false }, 201);
      });
    } catch (e) {
      this.load(); // the transaction rolled back; the in-memory state may be half-applied, so read it again
      return json({ error: `not recorded: ${e.message}` }, 500);
    }
  }

  async fetch(req) {
    const url = new URL(req.url);
    const role = req.headers.get('x-p4-role');
    const q = Object.fromEntries(url.searchParams);
    const now = q.now || this.stamp();
    const y = ['on', '1', 'true'].includes(q.y);
    // ?asof=<time>: the views as they stood then, from the log's events up to that time (folded afresh, not stored)
    const s = q.asof ? this.foldUntil(q.asof) : this.state;
    try {
      switch (`${req.method} ${url.pathname}`) {
        case 'POST /events': return this.append(role, await req.json());
        case 'GET /events': return json(this.sql.exec('SELECT seq, key, at, received, kind, actor, body FROM events WHERE seq > ? ORDER BY seq LIMIT ?', Number(q.after || 0), Math.min(Number(q.limit || 500), 5000)).toArray().map((r) => ({ ...r, body: JSON.parse(r.body) })));
        case 'GET /brief': return json(brief(s, { role: q.role || 'arch', session: q.session || null, now, y, max: Number(q.max || 8000) }));
        case 'GET /next': return json(next(s, { now }));
        case 'GET /owed': return json(owed(s, { session: q.session, now, y }));
        case 'GET /anomalies': return json(anomalies(s, { now, y, grace: Number(q.grace ?? 10) }));
        case 'GET /merge-queue': return json(mergeQueue(s, { now, y }));
        case 'GET /records': {
          if (q.key) { const r = this.sql.exec('SELECT key, data, seq, at FROM records WHERE key = ?', q.key).toArray()[0]; return r ? json({ ...r, data: JSON.parse(r.data) }) : json({ error: `no record ${q.key}` }, 404); }
          return json(Object.fromEntries(this.sql.exec('SELECT key, data FROM records').toArray().map((r) => [r.key, JSON.parse(r.data)])));
        }
        case 'GET /state': return json(s);
        case 'GET /stats': {
          const st = this.sql.exec('SELECT COUNT(*) AS n, COALESCE(SUM(LENGTH(body)), 0) AS bytes FROM events').one();
          return json({ events: st.n, event_bytes: st.bytes, snapshot_bytes: JSON.stringify(s).length, reducer: REDUCER_VERSION, loaded: this.loaded, db_bytes: this.ctx.storage.sql.databaseSize });
        }
        case 'POST /admin/rebuild': {
          if (role !== 'import') return json({ error: 'an import key rebuilds' }, 403);
          this.sql.exec('DELETE FROM snapshot');
          this.load();
          return json({ rebuilt: true, seq: this.state.seq, loaded: this.loaded });
        }
        default: return json({ error: `no ${req.method} ${url.pathname}` }, 404);
      }
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  }
}

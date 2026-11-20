// Runs one turn of a fresh (or resumed) Claude Code reading session, headless, on the fixed
// model + effort, and returns a parsed transcript: tool uses, tool results (with the line
// numbers each Read returned), compaction events, context usage per API call, and the reply.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

export const MODEL = 'claude-opus-5-5';
export const EFFORT = 'medium';

export function runTurn({ cwd, prompt, resume = null, tools = 'Read', logFile, timeoutMs = 1800000 }) {
  return new Promise((resolve) => {
    const args = ['-p', prompt, '--model', MODEL, '--effort', EFFORT,
      '--output-format', 'stream-json', '--verbose', '--tools', tools];
    if (tools) args.push('--allowedTools', tools);
    if (resume) args.push('--resume', resume);
    const env = { ...process.env };
    const ch = spawn('claude', args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    ch.stdout.on('data', d => out += d);
    ch.stderr.on('data', d => err += d);
    const t = setTimeout(() => ch.kill('SIGKILL'), timeoutMs);
    ch.on('close', (code) => {
      clearTimeout(t);
      if (logFile) fs.appendFileSync(logFile, out);
      resolve(parse(out, code, err));
    });
  });
}

export function parse(out, code, err) {
  const r = { code, err: (err || '').slice(-2000), uses: [], results: [], compactions: 0, systemNotes: [],
    iterations: [], reply: null, sessionId: null, isError: false, cost: 0, contextWindow: null };
  const useById = {};
  for (const line of out.split('\n')) {
    if (!line.trim()) continue;
    let j; try { j = JSON.parse(line); } catch { continue; }
    if (j.session_id && !r.sessionId) r.sessionId = j.session_id;
    if (j.type === 'system') {
      if (/compact/i.test(j.subtype || '')) r.compactions++;
      if (!['status', 'thinking_tokens', 'task_summary', 'init', 'post_turn_summary'].includes(j.subtype)) r.systemNotes.push(j.subtype);
    }
    if (j.type === 'assistant') {
      const u = j.message.usage;
      if (u) r.iterations.push((u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0));
      for (const c of j.message.content || []) if (c.type === 'tool_use') { const x = { id: c.id, name: c.name, input: c.input }; r.uses.push(x); useById[c.id] = x; }
    }
    if (j.type === 'user') {
      const content = j.message && j.message.content;
      if (typeof content === 'string') { if (/compact/i.test(content)) r.systemNotes.push('user-string:' + content.slice(0, 200)); continue; }
      for (const c of content || []) {
        if (c.type === 'tool_result') {
          const t = typeof c.content === 'string' ? c.content : (c.content || []).map(x => x.text || '').join('');
          const nums = [...t.matchAll(/^\s*(\d+)\t/gm)].map(m => +m[1]);
          r.results.push({ id: c.tool_use_id, use: useById[c.tool_use_id], len: t.length, isError: !!c.is_error,
            first: nums.length ? nums[0] : null, last: nums.length ? nums[nums.length - 1] : null, head: t.slice(0, 300), tail: t.slice(-300) });
        } else if (c.type === 'text' && /compact|truncat|exceed/i.test(c.text || '')) r.systemNotes.push('user-text:' + c.text.slice(0, 300));
      }
    }
    if (j.type === 'result') {
      r.reply = j.result; r.isError = !!j.is_error; r.cost = j.total_cost_usd || 0;
      const mu = j.modelUsage && Object.values(j.modelUsage)[0];
      if (mu) r.contextWindow = mu.contextWindow;
      r.terminal = j.terminal_reason; r.subtype = j.subtype;
    }
  }
  return r;
}

// For one file: did the FIRST Read of it return every line (a whole read)? Which lines were covered in all?
export function readCoverage(r, filePath, totalLines) {
  const reads = r.results.filter(x => x.use && x.use.name === 'Read' && x.use.input.file_path && x.use.input.file_path.endsWith(filePath));
  const covered = new Set();
  for (const x of reads) if (x.first != null) for (let i = x.first; i <= x.last; i++) covered.add(i);
  const first = reads[0];
  const firstWhole = !!first && !first.isError && first.first === 1 && first.last >= totalLines && !first.use.input.offset && !first.use.input.limit;
  return { nReads: reads.length, firstWhole, coveredAll: covered.size >= totalLines, covered: covered.size,
    firstLast: first ? first.last : null, firstErr: first ? (first.isError ? first.head : null) : 'NOT READ' };
}

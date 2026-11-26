// The rest of the tool's description of the host, read with node.d.ts by the reading under the coding standard only
// (ts.mjs, makeStandardProgram; build text 2, section 10). Two things:
// 1. Every untyped channel has the kind unknown (R1, R2; every-reference §3.1): JSON.parse hands back unknown (an
//    overload merged ahead of the library's), and what Node hands a listener is any, as Node's own descriptions give it,
//    so that R1 lists each use.
// 2. The Node modules a product names, so that each use is a facility the inventory lists by its qualified name
//    (R14), and each path, program or worker argument is one the tool evaluates (S5, S6). A member left out is a
//    complaint of the checker: a place, never invisible (study-references §1.3).

interface JSON {
  parse(text: string, reviver?: (this: unknown, key: string, value: unknown) => unknown): unknown;
}

type NodePathLike = string | URL;
interface NodeDirent { name: string; isFile(): boolean; isDirectory(): boolean; }
interface NodeStats { size: number; mtimeMs: number; isFile(): boolean; isDirectory(): boolean; }
interface NodeReadOptions { encoding?: string; flag?: string; }
interface NodeRmOptions { recursive?: boolean; force?: boolean; }

// Buffer (Node 22, buffer.html): a Uint8Array with Node's encodings, global and in node:buffer. What a file read with no
// encoding hands back.
interface Buffer extends Uint8Array {
  toString(encoding?: string, start?: number, end?: number): string;
  toJSON(): { type: 'Buffer'; data: number[] };
  equals(other: Uint8Array): boolean;
  compare(target: Uint8Array, targetStart?: number, targetEnd?: number, sourceStart?: number, sourceEnd?: number): number;
  copy(target: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
  write(text: string, offset?: number, length?: number, encoding?: string): number;
  subarray(start?: number, end?: number): Buffer;
  slice(start?: number, end?: number): Buffer;
  indexOf(value: string | number | Uint8Array, byteOffset?: number, encoding?: string): number;
  includes(value: string | number | Uint8Array, byteOffset?: number, encoding?: string): boolean;
}
interface BufferConstructor {
  from(data: string, encoding?: string): Buffer;
  from(data: Uint8Array | readonly number[] | ArrayBuffer): Buffer;
  alloc(size: number, fill?: string | number | Uint8Array, encoding?: string): Buffer;
  allocUnsafe(size: number): Buffer;
  byteLength(data: string | Uint8Array | ArrayBuffer, encoding?: string): number;
  concat(list: readonly Uint8Array[], totalLength?: number): Buffer;
  isBuffer(value: unknown): value is Buffer;
  isEncoding(encoding: string): boolean;
  compare(a: Uint8Array, b: Uint8Array): number;
}
declare var Buffer: BufferConstructor;
declare module 'node:buffer' {
  const Buffer: BufferConstructor;
  export { Buffer };
}
declare module 'buffer' { export * from 'node:buffer'; }

declare module 'node:fs' {
  export function readFileSync(path: NodePathLike, options: string | { encoding: string; flag?: string }): string;
  export function readFileSync(path: NodePathLike): Buffer;
  export function writeFileSync(path: NodePathLike, data: string | Uint8Array, options?: string | { encoding?: string; flag?: string }): void;
  export function appendFileSync(path: NodePathLike, data: string | Uint8Array): void;
  export function existsSync(path: NodePathLike): boolean;
  export function readdirSync(path: NodePathLike, options: { withFileTypes: true; recursive?: boolean }): NodeDirent[];
  export function readdirSync(path: NodePathLike, options?: { recursive?: boolean }): string[];
  export function mkdirSync(path: NodePathLike, options?: { recursive?: boolean }): string | undefined;
  export function mkdtempSync(prefix: string): string;
  export function rmSync(path: NodePathLike, options?: NodeRmOptions): void;
  export function unlinkSync(path: NodePathLike): void;
  export function renameSync(from: NodePathLike, to: NodePathLike): void;
  export function copyFileSync(from: NodePathLike, to: NodePathLike): void;
  export function statSync(path: NodePathLike): NodeStats;
  export function createReadStream(path: NodePathLike): NodeReadable;
  export function createWriteStream(path: NodePathLike): NodeWritable;
  const fs: {
    readFileSync: typeof readFileSync; writeFileSync: typeof writeFileSync; appendFileSync: typeof appendFileSync;
    existsSync: typeof existsSync; readdirSync: typeof readdirSync; mkdirSync: typeof mkdirSync; mkdtempSync: typeof mkdtempSync;
    rmSync: typeof rmSync; unlinkSync: typeof unlinkSync; renameSync: typeof renameSync; copyFileSync: typeof copyFileSync;
    statSync: typeof statSync; createReadStream: typeof createReadStream; createWriteStream: typeof createWriteStream;
  };
  export default fs;
}
declare module 'node:fs/promises' {
  export function readFile(path: NodePathLike, options: string | { encoding: string }): Promise<string>;
  export function readFile(path: NodePathLike): Promise<Buffer>;
  export function writeFile(path: NodePathLike, data: string | Uint8Array, options?: string | { encoding?: string }): Promise<void>;
  export function readdir(path: NodePathLike): Promise<string[]>;
  export function mkdir(path: NodePathLike, options?: { recursive?: boolean }): Promise<string | undefined>;
  export function mkdtemp(prefix: string): Promise<string>;
  export function rm(path: NodePathLike, options?: NodeRmOptions): Promise<void>;
  export function stat(path: NodePathLike): Promise<NodeStats>;
}
declare module 'node:path' {
  export function join(...parts: string[]): string;
  export function resolve(...parts: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, suffix?: string): string;
  export function extname(path: string): string;
  export function relative(from: string, to: string): string;
  export function normalize(path: string): string;
  export function isAbsolute(path: string): boolean;
  export const sep: string;
  const path: {
    join: typeof join; resolve: typeof resolve; dirname: typeof dirname; basename: typeof basename; extname: typeof extname;
    relative: typeof relative; normalize: typeof normalize; isAbsolute: typeof isAbsolute; sep: string;
  };
  export default path;
}
declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
  export function pathToFileURL(path: string): URL;
}
declare module 'node:os' {
  export function tmpdir(): string;
  export function homedir(): string;
  export function totalmem(): number;
  export const EOL: string;
}
interface NodeChild {
  stdout: NodeReadable;
  stderr: NodeReadable;
  stdin: NodeWritable;
  pid: number | undefined;
  on(event: string, listener: (...args: any[]) => void): NodeChild;
  kill(signal?: string | number): boolean;
}
interface NodeSpawnOptions { cwd?: string; env?: Record<string, string | undefined>; input?: string | Uint8Array; encoding?: string; stdio?: unknown; timeout?: number; maxBuffer?: number; killSignal?: string | number; shell?: boolean | string; windowsHide?: boolean; }
interface NodeSpawnResult { status: number | null; signal: string | null; stdout: string; stderr: string; error?: Error; }
declare module 'node:child_process' {
  export function spawn(command: string, args?: readonly string[], options?: NodeSpawnOptions): NodeChild;
  export function spawnSync(command: string, args?: readonly string[], options?: NodeSpawnOptions): NodeSpawnResult;
  export function exec(command: string, options?: NodeSpawnOptions, callback?: (error: Error | null, stdout: string, stderr: string) => void): NodeChild;
  export function execSync(command: string, options?: NodeSpawnOptions): string;
  export function execFile(file: string, args?: readonly string[], options?: NodeSpawnOptions, callback?: (error: Error | null, stdout: string, stderr: string) => void): NodeChild;
  export function execFileSync(file: string, args?: readonly string[], options?: NodeSpawnOptions): string;
  export function fork(modulePath: string | URL, args?: readonly string[], options?: NodeSpawnOptions): NodeChild;
}
interface NodeMessagePort {
  on(event: string, listener: (value: any) => void): NodeMessagePort;
  postMessage(value: unknown): void;
  close(): void;
}
declare module 'node:worker_threads' {
  export class Worker {
    constructor(filename: string | URL, options?: { workerData?: unknown; argv?: string[] });
    on(event: string, listener: (value: any) => void): Worker;
    postMessage(value: unknown): void;
    terminate(): Promise<number>;
  }
  export class BroadcastChannel {
    constructor(name: string);
    onmessage: ((message: any) => void) | null;
    postMessage(value: unknown): void;
    close(): void;
  }
  export class MessageChannel { port1: NodeMessagePort; port2: NodeMessagePort; }
  export const parentPort: NodeMessagePort | null;
  export const workerData: any;
  export const isMainThread: boolean;
  export function setEnvironmentData(key: string, value: unknown): void;
  export function getEnvironmentData(key: string): unknown;
}
declare module 'node:module' {
  export function createRequire(path: string | URL): ((id: string) => any) & { resolve(id: string): string };
  export const builtinModules: string[];
}
declare module 'node:diagnostics_channel' {
  export function channel(name: string): { publish(message: unknown): void; subscribe(listener: (message: any) => void): void };
}
declare module 'node:readline' {
  export function createInterface(options: { input: NodeReadable; crlfDelay?: number }): AsyncIterable<string> & { close(): void; on(event: string, listener: (...args: any[]) => void): unknown };
}
declare module 'node:crypto' {
  export function randomUUID(): string;
  export function createHash(algorithm: string): { update(data: string | Uint8Array): { digest(encoding: string): string } };
}
declare module 'node:events' {
  export class EventEmitter {
    on(event: string, listener: (...args: any[]) => void): EventEmitter;
    emit(event: string, ...args: unknown[]): boolean;
  }
}
declare module 'node:process' {
  const p: NodeProcess;
  export default p;
}
declare module 'node:vm' {
  export function runInNewContext(code: string, context?: object): unknown;
  export class Script { constructor(code: string); runInThisContext(): unknown; }
}
interface NodeTestContext {
  name: string;
  test(name: string, fn: (t: NodeTestContext) => unknown): Promise<void>;
  diagnostic(message: string): void;
  skip(message?: string): void;
  todo(message?: string): void;
  plan(count: number): void;
  mock: NodeMock;
}
interface NodeMockFunction { mock: { calls: { arguments: unknown[]; result: unknown }[]; callCount(): number }; }
interface NodeMock {
  fn<F extends (...args: never[]) => unknown>(original?: F): F & NodeMockFunction;
  method<O extends object, K extends keyof O>(object: O, methodName: K, implementation?: O[K]): NodeMockFunction;
  module(specifier: string, options?: { namedExports?: object; defaultExport?: unknown }): { restore(): void };
  timers: { enable(options?: { apis?: string[]; now?: number }): void; tick(ms: number): void; reset(): void; runAll(): void };
  restoreAll(): void;
}
type NodeTestFn = (t: NodeTestContext) => unknown;
declare module 'node:test' {
  export function test(name: string, fn: NodeTestFn): Promise<void>;
  export function test(name: string, options: { skip?: boolean | string; todo?: boolean | string; timeout?: number }, fn: NodeTestFn): Promise<void>;
  export function it(name: string, fn: NodeTestFn): Promise<void>;
  export function describe(name: string, fn: () => unknown): Promise<void>;
  export function suite(name: string, fn: () => unknown): Promise<void>;
  export function before(fn: () => unknown): void;
  export function after(fn: () => unknown): void;
  export function beforeEach(fn: () => unknown): void;
  export function afterEach(fn: () => unknown): void;
  export const mock: NodeMock;
  export default test;
}

// The same modules under their names without the node: prefix.
declare module 'fs' { export * from 'node:fs'; import fs from 'node:fs'; export default fs; }
declare module 'fs/promises' { export * from 'node:fs/promises'; }
declare module 'path' { export * from 'node:path'; import path from 'node:path'; export default path; }
declare module 'url' { export * from 'node:url'; }
declare module 'os' { export * from 'node:os'; }
declare module 'child_process' { export * from 'node:child_process'; }
declare module 'worker_threads' { export * from 'node:worker_threads'; }
declare module 'module' { export * from 'node:module'; }
declare module 'crypto' { export * from 'node:crypto'; }
declare module 'events' { export * from 'node:events'; }
declare module 'readline' { export * from 'node:readline'; }

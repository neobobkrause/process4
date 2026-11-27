// What the reader is told about Node, written for the tool (TypeScript is the only development dependency, so
// Node's own descriptions are not installed). It covers what the made-up product uses; anything else of Node's is
// left undescribed, which the check treats as "cannot tell".

declare module 'node:assert/strict' {
  const assert: NodeAssert;
  export default assert;
}
declare module 'node:assert' {
  const assert: NodeAssert;
  export default assert;
}
interface NodeAssert {
  (value: unknown, message?: string | Error): asserts value;
  ok(value: unknown, message?: string | Error): asserts value;
  equal<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
  strictEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
  notEqual(actual: unknown, expected: unknown, message?: string | Error): void;
  deepEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
  deepStrictEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
  notDeepEqual(actual: unknown, expected: unknown, message?: string | Error): void;
  notStrictEqual(actual: unknown, expected: unknown, message?: string | Error): void;
  notDeepStrictEqual(actual: unknown, expected: unknown, message?: string | Error): void;
  match(value: string, pattern: RegExp, message?: string | Error): void;
  doesNotMatch(value: string, pattern: RegExp, message?: string | Error): void;
  throws(fn: () => unknown, expected?: unknown, message?: string | Error): void;
  doesNotThrow(fn: () => unknown, message?: string | Error): void;
  rejects(fn: Promise<unknown> | (() => Promise<unknown>), expected?: unknown, message?: string | Error): Promise<void>;
  doesNotReject(fn: Promise<unknown> | (() => Promise<unknown>), message?: string | Error): Promise<void>;
  fail(message?: string | Error): never;
}

interface NodeTimer {
  ref(): NodeTimer;
  unref(): NodeTimer;
  hasRef(): boolean;
  refresh(): NodeTimer;
  [Symbol.toPrimitive](): number;
}
declare function setTimeout(callback: (...args: any[]) => void, ms?: number, ...args: any[]): NodeTimer;
declare function clearTimeout(timer?: NodeTimer | number): void;
declare function setInterval(callback: (...args: any[]) => void, ms?: number, ...args: any[]): NodeTimer;
declare function clearInterval(timer?: NodeTimer | number): void;
declare function setImmediate(callback: (...args: any[]) => void, ...args: any[]): unknown;
declare function queueMicrotask(callback: () => void): void;
declare function structuredClone<T>(value: T): T;

// No member is described as "anything" by an index signature: a member left out is a complaint the check reads as
// "cannot tell" (a part of Node the description leaves out), and the reading under the standard lists it.
// stream.html (Node 22), Writable: write(chunk[, encoding][, callback]) takes a string, Buffer or Uint8Array; end([chunk[,
// encoding]][, callback]); once, as every EventEmitter has.
interface NodeWritable {
  write(chunk: string | Uint8Array, callback?: (error?: Error | null) => void): boolean;
  write(chunk: string | Uint8Array, encoding: string, callback?: (error?: Error | null) => void): boolean;
  end(callback?: () => void): void;
  end(chunk: string | Uint8Array, callback?: () => void): void;
  end(chunk: string | Uint8Array, encoding: string, callback?: () => void): void;
  on(event: string, listener: (...args: any[]) => void): NodeWritable;
  once(event: string, listener: (...args: any[]) => void): NodeWritable;
}
interface NodeReadable {
  on(event: string, listener: (...args: any[]) => void): NodeReadable;
  once(event: string, listener: (...args: any[]) => void): NodeReadable;
  pipe<T extends NodeWritable>(destination: T, options?: { end?: boolean }): T;
  setEncoding(encoding: string): NodeReadable;
  resume(): NodeReadable;
  pause(): NodeReadable;
}
interface NodeProcess {
  stdout: NodeWritable;
  stderr: NodeWritable;
  stdin: NodeReadable;
  execPath: string;
  argv: string[];
  env: Record<string, string | undefined>;
  exitCode: number | undefined;
  platform: string;
  pid: number;
  version: string;
  cwd(): string;
  exit(code?: number): never;
  on(event: string, listener: (...args: any[]) => void): NodeProcess;
  once(event: string, listener: (...args: any[]) => void): NodeProcess;
  off(event: string, listener: (...args: any[]) => void): NodeProcess;
  emit(event: string, ...args: unknown[]): boolean;
  nextTick(callback: (...args: any[]) => void, ...args: unknown[]): void;
  kill(pid: number, signal?: string | number): boolean;
  uptime(): number;
  hrtime: { (time?: [number, number]): [number, number]; bigint(): bigint };
  // process.html (Node 22): getuid and getgid only on POSIX platforms (not on Windows), so they may be missing
  getuid?: () => number;
  getgid?: () => number;
  memoryUsage: { (): NodeMemoryUsage; rss(): number };
  cpuUsage(previousValue?: NodeCpuUsage): NodeCpuUsage;
}
interface NodeMemoryUsage { rss: number; heapTotal: number; heapUsed: number; external: number; arrayBuffers: number; }
interface NodeCpuUsage { user: number; system: number; }
declare var process: NodeProcess;
declare var console: { log(...a: unknown[]): void; error(...a: unknown[]): void; warn(...a: unknown[]): void; info(...a: unknown[]): void };

declare class URLSearchParams {
  constructor(init?: string | Record<string, string> | [string, string][]);
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  set(name: string, value: string): void;
  append(name: string, value: string): void;
  delete(name: string): void;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  entries(): IterableIterator<[string, string]>;
  [Symbol.iterator](): IterableIterator<[string, string]>;
  toString(): string;
}
declare class URL {
  constructor(url: string, base?: string | URL);
  href: string;
  origin: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  readonly searchParams: URLSearchParams;
  toString(): string;
}
interface ImportMeta { url: string; dirname: string; filename: string; resolve(specifier: string): string; }
declare class TextEncoder { encode(s?: string): Uint8Array; }
// The Encoding Standard (WHATWG, encoding.spec.whatwg.org), as Node 22 gives it (globals.html, util.html#class-utiltextdecoder),
// a property of globalThis: new TextDecoder([label[, { fatal, ignoreBOM }]]), decode([input[, { stream }]]).
interface TextDecoder {
  readonly encoding: string;
  readonly fatal: boolean;
  readonly ignoreBOM: boolean;
  decode(input?: ArrayBuffer | ArrayBufferView, options?: { stream?: boolean }): string;
}
declare var TextDecoder: { prototype: TextDecoder; new (label?: string, options?: { fatal?: boolean; ignoreBOM?: boolean }): TextDecoder };
// The HTML standard's forgiving-base64 (globals.html: atob, btoa; Node 22 keeps them, as legacy).
declare function atob(data: string): string;
declare function btoa(data: string): string;

// The File API (w3c.github.io/FileAPI), Node 22's global Blob (buffer.html#class-blob).
interface Blob {
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  bytes(): Promise<Uint8Array>;
  text(): Promise<string>;
  slice(start?: number, end?: number, contentType?: string): Blob;
  stream(): ReadableStream<Uint8Array>;
}
declare var Blob: { prototype: Blob; new (blobParts?: readonly (ArrayBuffer | ArrayBufferView | Blob | string)[], options?: { type?: string; endings?: 'transparent' | 'native' }): Blob };

// The Streams Standard (WHATWG, streams.spec.whatwg.org), Node 22's globals (webstreams.html). A chunk's kind is the
// stream's; with none stated, unknown.
interface ReadableStreamReadValueResult<R> { done: false; value: R; }
interface ReadableStreamReadDoneResult<R> { done: true; value?: R; }
type ReadableStreamReadResult<R> = ReadableStreamReadValueResult<R> | ReadableStreamReadDoneResult<R>;
interface ReadableStreamDefaultReader<R = unknown> {
  readonly closed: Promise<void>;
  read(): Promise<ReadableStreamReadResult<R>>;
  releaseLock(): void;
  cancel(reason?: unknown): Promise<void>;
}
interface ReadableStreamDefaultController<R = unknown> {
  readonly desiredSize: number | null;
  close(): void;
  enqueue(chunk?: R): void;
  error(e?: unknown): void;
}
interface StreamPipeOptions { preventAbort?: boolean; preventCancel?: boolean; preventClose?: boolean; signal?: AbortSignal; }
interface ReadableStream<R = unknown> {
  readonly locked: boolean;
  cancel(reason?: unknown): Promise<void>;
  getReader(): ReadableStreamDefaultReader<R>;
  pipeThrough<T>(transform: { writable: WritableStream<R>; readable: ReadableStream<T> }, options?: StreamPipeOptions): ReadableStream<T>;
  pipeTo(destination: WritableStream<R>, options?: StreamPipeOptions): Promise<void>;
  tee(): [ReadableStream<R>, ReadableStream<R>];
  values(options?: { preventCancel?: boolean }): AsyncIterableIterator<R, undefined, undefined>;
  [Symbol.asyncIterator](options?: { preventCancel?: boolean }): AsyncIterableIterator<R, undefined, undefined>;
}
declare var ReadableStream: {
  prototype: ReadableStream;
  new <R = unknown>(underlyingSource?: { start?(controller: ReadableStreamDefaultController<R>): unknown; pull?(controller: ReadableStreamDefaultController<R>): unknown; cancel?(reason?: unknown): unknown },
    strategy?: { highWaterMark?: number; size?(chunk: R): number }): ReadableStream<R>;
  from<R>(iterable: Iterable<R> | AsyncIterable<R>): ReadableStream<R>;
};
interface WritableStreamDefaultWriter<W = unknown> {
  readonly closed: Promise<void>;
  readonly desiredSize: number | null;
  readonly ready: Promise<void>;
  abort(reason?: unknown): Promise<void>;
  close(): Promise<void>;
  releaseLock(): void;
  write(chunk?: W): Promise<void>;
}
interface WritableStream<W = unknown> {
  readonly locked: boolean;
  abort(reason?: unknown): Promise<void>;
  close(): Promise<void>;
  getWriter(): WritableStreamDefaultWriter<W>;
}
declare var WritableStream: {
  prototype: WritableStream;
  new <W = unknown>(underlyingSink?: { start?(controller: unknown): unknown; write?(chunk: W, controller: unknown): unknown; close?(): unknown; abort?(reason?: unknown): unknown },
    strategy?: { highWaterMark?: number; size?(chunk: W): number }): WritableStream<W>;
};
// The Compression Standard (WHATWG, compression.spec.whatwg.org), Node 22's globals: a pair of streams that compress or
// decompress what is written into the one and read from the other.
interface CompressionStream { readonly readable: ReadableStream<Uint8Array>; readonly writable: WritableStream<ArrayBuffer | ArrayBufferView>; }
declare var CompressionStream: { prototype: CompressionStream; new (format: 'gzip' | 'deflate' | 'deflate-raw'): CompressionStream };
interface DecompressionStream { readonly readable: ReadableStream<Uint8Array>; readonly writable: WritableStream<ArrayBuffer | ArrayBufferView>; }
declare var DecompressionStream: { prototype: DecompressionStream; new (format: 'gzip' | 'deflate' | 'deflate-raw'): DecompressionStream };
// The DOM standard's AbortSignal (globals.html), as a pipe's options take it.
interface AbortSignal { readonly aborted: boolean; readonly reason: unknown; throwIfAborted(): void; }

// Web Crypto (w3c.github.io/webcrypto), Node 22's crypto.subtle (webcrypto.html) and workerd's: the parts in common use.
type NodeBufferSource = ArrayBuffer | ArrayBufferView;
type NodeAlgorithmIdentifier = string | {
  name: string; hash?: string | { name: string }; length?: number; iv?: NodeBufferSource; additionalData?: NodeBufferSource; tagLength?: number;
  counter?: NodeBufferSource; label?: NodeBufferSource; namedCurve?: string; saltLength?: number; salt?: NodeBufferSource; info?: NodeBufferSource;
  iterations?: number; public?: CryptoKey; modulusLength?: number; publicExponent?: Uint8Array;
};
interface NodeJsonWebKey {
  kty?: string; use?: string; key_ops?: string[]; alg?: string; ext?: boolean; crv?: string; x?: string; y?: string; d?: string;
  n?: string; e?: string; p?: string; q?: string; dp?: string; dq?: string; qi?: string; k?: string;
}
interface CryptoKey {
  readonly algorithm: { name: string };
  readonly extractable: boolean;
  readonly type: 'secret' | 'private' | 'public';
  readonly usages: string[];
}
interface SubtleCrypto {
  digest(algorithm: NodeAlgorithmIdentifier, data: NodeBufferSource): Promise<ArrayBuffer>;
  importKey(format: 'jwk', keyData: NodeJsonWebKey, algorithm: NodeAlgorithmIdentifier, extractable: boolean, keyUsages: readonly string[]): Promise<CryptoKey>;
  importKey(format: 'raw' | 'pkcs8' | 'spki', keyData: NodeBufferSource, algorithm: NodeAlgorithmIdentifier, extractable: boolean, keyUsages: readonly string[]): Promise<CryptoKey>;
  exportKey(format: 'jwk', key: CryptoKey): Promise<NodeJsonWebKey>;
  exportKey(format: 'raw' | 'pkcs8' | 'spki', key: CryptoKey): Promise<ArrayBuffer>;
  sign(algorithm: NodeAlgorithmIdentifier, key: CryptoKey, data: NodeBufferSource): Promise<ArrayBuffer>;
  verify(algorithm: NodeAlgorithmIdentifier, key: CryptoKey, signature: NodeBufferSource, data: NodeBufferSource): Promise<boolean>;
  encrypt(algorithm: NodeAlgorithmIdentifier, key: CryptoKey, data: NodeBufferSource): Promise<ArrayBuffer>;
  decrypt(algorithm: NodeAlgorithmIdentifier, key: CryptoKey, data: NodeBufferSource): Promise<ArrayBuffer>;
}
// workerd's crypto.DigestStream (developers.cloudflare.com/workers/runtime-apis/web-crypto/#digeststream): a writable
// stream whose digest is ready once it is closed. workerd's only; Node has none.
interface DigestStream extends WritableStream<ArrayBuffer | ArrayBufferView> { readonly digest: Promise<ArrayBuffer>; readonly bytesWritten: number; }

declare var crypto: {
  randomUUID(): string;
  getRandomValues<T extends ArrayBufferView>(a: T): T;
  readonly subtle: SubtleCrypto;
  DigestStream: { prototype: DigestStream; new (algorithm: string | { name: string }): DigestStream };
};
declare function fetch(input: string | URL, init?: { method?: string; headers?: Record<string, string>; body?: string }): Promise<{ ok: boolean; status: number; json(): Promise<unknown>; text(): Promise<string> }>;
declare var performance: { now(): number };

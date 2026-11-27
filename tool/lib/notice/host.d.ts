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
// fs.html (Node 22), fs.Stats: mode is the file's type and permission bits; uid and gid its owner.
interface NodeStats { size: number; mtimeMs: number; mode: number; uid: number; gid: number; isFile(): boolean; isDirectory(): boolean; isSymbolicLink(): boolean; }
interface NodeReadOptions { encoding?: string; flag?: string; }
// fs.rmSync's options: maxRetries and retryDelay, for EBUSY and the like (fs.html#fsrmsyncpath-options)
interface NodeRmOptions { recursive?: boolean; force?: boolean; maxRetries?: number; retryDelay?: number; }

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
  // reading and writing numbers at an offset (buffer.html, buf.readUInt32BE and its kin; the names with Uint are aliases)
  readUInt8(offset?: number): number; readUint8(offset?: number): number; readInt8(offset?: number): number;
  readUInt16BE(offset?: number): number; readUInt16LE(offset?: number): number; readUint16BE(offset?: number): number; readUint16LE(offset?: number): number;
  readUInt32BE(offset?: number): number; readUInt32LE(offset?: number): number; readUint32BE(offset?: number): number; readUint32LE(offset?: number): number;
  readInt16BE(offset?: number): number; readInt16LE(offset?: number): number; readInt32BE(offset?: number): number; readInt32LE(offset?: number): number;
  readUIntBE(offset: number, byteLength: number): number; readUIntLE(offset: number, byteLength: number): number;
  readUintBE(offset: number, byteLength: number): number; readUintLE(offset: number, byteLength: number): number;
  readIntBE(offset: number, byteLength: number): number; readIntLE(offset: number, byteLength: number): number;
  readBigUInt64BE(offset?: number): bigint; readBigUInt64LE(offset?: number): bigint; readBigInt64BE(offset?: number): bigint; readBigInt64LE(offset?: number): bigint;
  writeUInt8(value: number, offset?: number): number; writeUint8(value: number, offset?: number): number; writeInt8(value: number, offset?: number): number;
  writeUInt16BE(value: number, offset?: number): number; writeUInt16LE(value: number, offset?: number): number; writeUint16BE(value: number, offset?: number): number; writeUint16LE(value: number, offset?: number): number;
  writeUInt32BE(value: number, offset?: number): number; writeUInt32LE(value: number, offset?: number): number; writeUint32BE(value: number, offset?: number): number; writeUint32LE(value: number, offset?: number): number;
  writeInt16BE(value: number, offset?: number): number; writeInt16LE(value: number, offset?: number): number; writeInt32BE(value: number, offset?: number): number; writeInt32LE(value: number, offset?: number): number;
  writeUIntBE(value: number, offset: number, byteLength: number): number; writeUIntLE(value: number, offset: number, byteLength: number): number;
  writeUintBE(value: number, offset: number, byteLength: number): number; writeUintLE(value: number, offset: number, byteLength: number): number;
  writeIntBE(value: number, offset: number, byteLength: number): number; writeIntLE(value: number, offset: number, byteLength: number): number;
  writeBigUInt64BE(value: bigint, offset?: number): number; writeBigUInt64LE(value: bigint, offset?: number): number;
  writeBigInt64BE(value: bigint, offset?: number): number; writeBigInt64LE(value: bigint, offset?: number): number;
}
interface BufferConstructor {
  of(...items: number[]): Buffer;
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
  // fs.html (Node 22): lstatSync (a link's own stats), chmodSync, chownSync, openSync (a file descriptor) and closeSync
  export function lstatSync(path: NodePathLike): NodeStats;
  export function chmodSync(path: NodePathLike, mode: string | number): void;
  export function chownSync(path: NodePathLike, uid: number, gid: number): void;
  export function openSync(path: NodePathLike, flags?: string | number, mode?: string | number): number;
  export function closeSync(fd: number): void;
  export function createReadStream(path: NodePathLike): NodeReadable;
  export function createWriteStream(path: NodePathLike): NodeWritable;
  const fs: {
    readFileSync: typeof readFileSync; writeFileSync: typeof writeFileSync; appendFileSync: typeof appendFileSync;
    existsSync: typeof existsSync; readdirSync: typeof readdirSync; mkdirSync: typeof mkdirSync; mkdtempSync: typeof mkdtempSync;
    rmSync: typeof rmSync; unlinkSync: typeof unlinkSync; renameSync: typeof renameSync; copyFileSync: typeof copyFileSync;
    statSync: typeof statSync; createReadStream: typeof createReadStream; createWriteStream: typeof createWriteStream;
    lstatSync: typeof lstatSync; chmodSync: typeof chmodSync; chownSync: typeof chownSync; openSync: typeof openSync; closeSync: typeof closeSync;
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
// child_process.html#child_processspawnsynccommand-args-options: output is the results from stdio, [stdin's, stdout, stderr]
interface NodeSpawnResult { pid: number; output: (string | null)[]; status: number | null; signal: string | null; stdout: string; stderr: string; error?: Error; }
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
// crypto.html (Node 22). A Hash's digest() with no encoding hands back a Buffer. Keys (KeyObject, createPrivateKey,
// createPublicKey), one-shot signatures (sign, verify), ciphers with a key and IV handed in (createCipheriv,
// createDecipheriv), and webcrypto, the same Web Crypto API as the global crypto.
type NodeKeyInput = string | Uint8Array | { key: string | Uint8Array | NodeJsonWebKey; format?: 'pem' | 'der' | 'jwk'; type?: string; passphrase?: string | Uint8Array; encoding?: string };
interface NodeCipher {
  update(data: string | Uint8Array, inputEncoding?: string): Buffer;
  update(data: string | Uint8Array, inputEncoding: string | undefined, outputEncoding: string): string;
  final(): Buffer;
  final(outputEncoding: string): string;
  setAAD(buffer: Uint8Array, options?: { plaintextLength?: number }): NodeCipher;
  getAuthTag(): Buffer;
  setAutoPadding(autoPadding?: boolean): NodeCipher;
}
interface NodeDecipher {
  update(data: string | Uint8Array, inputEncoding?: string): Buffer;
  update(data: string | Uint8Array, inputEncoding: string | undefined, outputEncoding: string): string;
  final(): Buffer;
  final(outputEncoding: string): string;
  setAAD(buffer: Uint8Array, options?: { plaintextLength?: number }): NodeDecipher;
  setAuthTag(buffer: Uint8Array): NodeDecipher;
  setAutoPadding(autoPadding?: boolean): NodeDecipher;
}
interface NodeWebCrypto { readonly subtle: SubtleCrypto; getRandomValues<T extends ArrayBufferView>(a: T): T; randomUUID(): string; }
declare module 'node:crypto' {
  export function randomUUID(): string;
  export function createHash(algorithm: string): { update(data: string | Uint8Array): { digest(encoding: string): string; digest(): Buffer } };
  export class KeyObject {
    private constructor();
    readonly type: 'secret' | 'public' | 'private';
    readonly asymmetricKeyType?: string;
    readonly symmetricKeySize?: number;
    export(options?: { type?: string; format?: 'pem' | 'der' | 'jwk'; cipher?: string; passphrase?: string | Uint8Array }): string | Buffer | NodeJsonWebKey;
    equals(otherKeyObject: KeyObject): boolean;
  }
  export function createPrivateKey(key: NodeKeyInput): KeyObject;
  export function createPublicKey(key: NodeKeyInput | KeyObject): KeyObject;
  export function sign(algorithm: string | null | undefined, data: Uint8Array, key: NodeKeyInput | KeyObject): Buffer;
  export function verify(algorithm: string | null | undefined, data: Uint8Array, key: NodeKeyInput | KeyObject, signature: Uint8Array): boolean;
  export function createCipheriv(algorithm: string, key: Uint8Array | KeyObject, iv: Uint8Array | null, options?: { authTagLength?: number }): NodeCipher;
  export function createDecipheriv(algorithm: string, key: Uint8Array | KeyObject, iv: Uint8Array | null, options?: { authTagLength?: number }): NodeDecipher;
  export const webcrypto: NodeWebCrypto;
}

// zlib.html (Node 22): the one-call forms (gzipSync and kin) and the streams (createGzip and kin) in common use.
type NodeZlibInput = string | ArrayBuffer | ArrayBufferView;
interface NodeZlibOptions {
  flush?: number; finishFlush?: number; chunkSize?: number; windowBits?: number; level?: number; memLevel?: number; strategy?: number;
  dictionary?: ArrayBuffer | ArrayBufferView; info?: boolean; maxOutputLength?: number;
}
interface NodeBrotliOptions { flush?: number; finishFlush?: number; chunkSize?: number; params?: Record<number, number | boolean>; maxOutputLength?: number; }
// a zlib stream: written into and read from, as a Transform stream is
interface NodeZlibStream {
  write(chunk: string | Uint8Array, callback?: (error?: Error | null) => void): boolean;
  end(callback?: () => void): void;
  end(chunk: string | Uint8Array, callback?: () => void): void;
  on(event: string, listener: (...args: any[]) => void): NodeZlibStream;
  once(event: string, listener: (...args: any[]) => void): NodeZlibStream;
  pipe<T extends NodeWritable>(destination: T, options?: { end?: boolean }): T;
  close(callback?: () => void): void;
}
declare module 'node:zlib' {
  export function gzipSync(buffer: NodeZlibInput, options?: NodeZlibOptions): Buffer;
  export function gunzipSync(buffer: NodeZlibInput, options?: NodeZlibOptions): Buffer;
  export function deflateSync(buffer: NodeZlibInput, options?: NodeZlibOptions): Buffer;
  export function inflateSync(buffer: NodeZlibInput, options?: NodeZlibOptions): Buffer;
  export function deflateRawSync(buffer: NodeZlibInput, options?: NodeZlibOptions): Buffer;
  export function inflateRawSync(buffer: NodeZlibInput, options?: NodeZlibOptions): Buffer;
  export function unzipSync(buffer: NodeZlibInput, options?: NodeZlibOptions): Buffer;
  export function brotliCompressSync(buffer: NodeZlibInput, options?: NodeBrotliOptions): Buffer;
  export function brotliDecompressSync(buffer: NodeZlibInput, options?: NodeBrotliOptions): Buffer;
  export function createGzip(options?: NodeZlibOptions): NodeZlibStream;
  export function createGunzip(options?: NodeZlibOptions): NodeZlibStream;
  export function createDeflate(options?: NodeZlibOptions): NodeZlibStream;
  export function createInflate(options?: NodeZlibOptions): NodeZlibStream;
  export function createDeflateRaw(options?: NodeZlibOptions): NodeZlibStream;
  export function createInflateRaw(options?: NodeZlibOptions): NodeZlibStream;
  export function createUnzip(options?: NodeZlibOptions): NodeZlibStream;
  export function createBrotliCompress(options?: NodeBrotliOptions): NodeZlibStream;
  export function createBrotliDecompress(options?: NodeBrotliOptions): NodeZlibStream;
  export const constants: NodeZlibConstants;
}
interface NodeZlibConstants {
  readonly Z_NO_FLUSH: number; readonly Z_SYNC_FLUSH: number; readonly Z_FULL_FLUSH: number; readonly Z_FINISH: number;
  readonly Z_BEST_SPEED: number; readonly Z_BEST_COMPRESSION: number; readonly Z_DEFAULT_COMPRESSION: number;
  readonly BROTLI_PARAM_QUALITY: number; readonly BROTLI_PARAM_MODE: number; readonly BROTLI_PARAM_SIZE_HINT: number;
  readonly BROTLI_MODE_GENERIC: number; readonly BROTLI_MODE_TEXT: number; readonly BROTLI_MIN_QUALITY: number; readonly BROTLI_MAX_QUALITY: number;
}

// http.html (Node 22): a server (createServer, its request and response) and a client request (request, get), the basics.
type NodeHeaderValue = number | string | readonly string[];
interface NodeIncomingMessage extends NodeReadable {
  readonly headers: Record<string, string | string[] | undefined>;
  readonly rawHeaders: string[];
  readonly httpVersion: string;
  readonly method?: string;
  readonly url?: string;
  readonly statusCode?: number;
  readonly statusMessage?: string;
  [Symbol.asyncIterator](): AsyncIterableIterator<Buffer, undefined, undefined>;
}
interface NodeServerResponse extends NodeWritable {
  statusCode: number;
  statusMessage: string;
  readonly headersSent: boolean;
  setHeader(name: string, value: NodeHeaderValue): NodeServerResponse;
  getHeader(name: string): number | string | string[] | undefined;
  removeHeader(name: string): void;
  writeHead(statusCode: number, headers?: Record<string, NodeHeaderValue>): NodeServerResponse;
  writeHead(statusCode: number, statusMessage: string, headers?: Record<string, NodeHeaderValue>): NodeServerResponse;
}
interface NodeServer {
  listen(port?: number, hostname?: string, callback?: () => void): NodeServer;
  listen(port?: number, callback?: () => void): NodeServer;
  close(callback?: (error?: Error) => void): NodeServer;
  address(): { port: number; family: string; address: string } | string | null;
  on(event: string, listener: (...args: any[]) => void): NodeServer;
  once(event: string, listener: (...args: any[]) => void): NodeServer;
}
interface NodeClientRequest extends NodeWritable {
  setHeader(name: string, value: NodeHeaderValue): NodeClientRequest;
  destroy(error?: Error): NodeClientRequest;
  setTimeout(timeout: number, callback?: () => void): NodeClientRequest;
}
interface NodeRequestOptions {
  protocol?: string; host?: string; hostname?: string; port?: number | string; path?: string; method?: string;
  headers?: Record<string, NodeHeaderValue>; timeout?: number; signal?: AbortSignal;
}
declare module 'node:http' {
  export function createServer(requestListener?: (request: NodeIncomingMessage, response: NodeServerResponse) => void): NodeServer;
  export function request(url: string | URL | NodeRequestOptions, callback?: (response: NodeIncomingMessage) => void): NodeClientRequest;
  export function request(url: string | URL, options: NodeRequestOptions, callback?: (response: NodeIncomingMessage) => void): NodeClientRequest;
  export function get(url: string | URL | NodeRequestOptions, callback?: (response: NodeIncomingMessage) => void): NodeClientRequest;
  export function get(url: string | URL, options: NodeRequestOptions, callback?: (response: NodeIncomingMessage) => void): NodeClientRequest;
  export const STATUS_CODES: Record<number, string | undefined>;
  export const METHODS: string[];
  export type IncomingMessage = NodeIncomingMessage;
  export type ServerResponse = NodeServerResponse;
  export type Server = NodeServer;
  export type ClientRequest = NodeClientRequest;
}

// sqlite.html (Node 22.5 and later): a database opened in the process (DatabaseSync) and its prepared statements.
type NodeSQLInputValue = null | number | bigint | string | ArrayBufferView;
type NodeSQLOutputValue = null | number | bigint | string | Uint8Array;
interface NodeStatementSync {
  run(...anonymousParameters: NodeSQLInputValue[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  run(namedParameters: Record<string, NodeSQLInputValue>, ...anonymousParameters: NodeSQLInputValue[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  get(...anonymousParameters: NodeSQLInputValue[]): Record<string, NodeSQLOutputValue> | undefined;
  get(namedParameters: Record<string, NodeSQLInputValue>, ...anonymousParameters: NodeSQLInputValue[]): Record<string, NodeSQLOutputValue> | undefined;
  all(...anonymousParameters: NodeSQLInputValue[]): Record<string, NodeSQLOutputValue>[];
  all(namedParameters: Record<string, NodeSQLInputValue>, ...anonymousParameters: NodeSQLInputValue[]): Record<string, NodeSQLOutputValue>[];
  readonly sourceSQL: string;
  readonly expandedSQL: string;
  setReadBigInts(enabled: boolean): void;
}
declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(location: string, options?: { open?: boolean; readOnly?: boolean; enableForeignKeyConstraints?: boolean; enableDoubleQuotedStringLiterals?: boolean });
    open(): void;
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): NodeStatementSync;
  }
  export type StatementSync = NodeStatementSync;
}
declare module 'node:events' {
  export class EventEmitter {
    on(event: string, listener: (...args: any[]) => void): EventEmitter;
    emit(event: string, ...args: unknown[]): boolean;
  }
}
// process.versions (Node 22, process.html#processversions): the version strings of Node and its parts, "an object
// similar to" the example there, so only node, v8 and modules (which the text names) are certain; the others in the
// example depend on how Node was built and may be missing (no index signature: a part not named is a checker complaint).
// Fixed at start, read from the host: out, as process.version is (facilities-build).
interface NodeProcessVersions {
  readonly node: string;
  readonly v8: string;
  readonly modules: string;
  readonly acorn?: string; readonly ada?: string; readonly ares?: string; readonly base64?: string; readonly brotli?: string;
  readonly cjs_module_lexer?: string; readonly cldr?: string; readonly icu?: string; readonly llhttp?: string; readonly napi?: string;
  readonly nghttp2?: string; readonly nghttp3?: string; readonly ngtcp2?: string; readonly openssl?: string; readonly simdjson?: string;
  readonly simdutf?: string; readonly sqlite?: string; readonly tz?: string; readonly undici?: string; readonly unicode?: string;
  readonly uv?: string; readonly uvwasi?: string; readonly zlib?: string;
}
interface NodeProcess { readonly versions: NodeProcessVersions; }
declare module 'node:process' {
  const p: NodeProcess;
  export const versions: NodeProcessVersions;
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
// mock.property (test.html#mockpropertyobject-propertyname-value, added in Node v22.20.0): the object, its property
// mocked, with the property's MockPropertyContext as `mock`
interface NodeMockPropertyContext<V> {
  readonly accesses: { type: 'get' | 'set'; value: V; stack: Error }[];
  accessCount(): number;
  mockImplementation(value: V): void;
  mockImplementationOnce(value: V, onAccess?: number): void;
  resetAccesses(): void;
  restore(): void;
}
interface NodeMock {
  fn<F extends (...args: never[]) => unknown>(original?: F): F & NodeMockFunction;
  method<O extends object, K extends keyof O>(object: O, methodName: K, implementation?: O[K]): NodeMockFunction;
  property<O extends object, K extends keyof O>(object: O, propertyName: K, value?: O[K]): O & { mock: NodeMockPropertyContext<O[K]> };
  module(specifier: string, options?: { namedExports?: object; defaultExport?: unknown }): { restore(): void };
  timers: { enable(options?: { apis?: string[]; now?: number | Date }): void; tick(ms?: number): void; reset(): void; runAll(): void; setTime(ms: number): void };
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
declare module 'zlib' { export * from 'node:zlib'; }
declare module 'http' { export * from 'node:http'; }

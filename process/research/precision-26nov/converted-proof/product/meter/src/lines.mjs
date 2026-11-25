/**
 * The meter's program reads its input a line at a time, as node:readline would hand it over: a line ends at \n, \r\n
 * or \r, and is handed over without its end; the last line is handed over even without one.
 */

/**
 * A stream read a line at a time.
 * @typedef {Object} Lines
 * @property {(event: 'line' | 'close', listener: (line: string) => void) => void} on 'line' for each line; 'close'
 *   once, when the input ends or close is called
 * @property {() => void} close stops reading and says close
 */

/**
 * Reads a stream a line at a time.
 * @param {typeof process.stdin} input
 * @returns {Lines}
 */
export function readLines(input) {
  /** @type {Array<(line: string) => void>} */
  const onLine = [];
  /** @type {Array<(line: string) => void>} */
  const onClose = [];
  let buffer = '';
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    input.pause();
    for (const f of onClose) f('');
  };
  input.on('data', (/** @type {unknown} */ chunk) => {
    buffer += String(chunk);
    while (!closed) {
      const end = /\r\n|\n|\r(?=[\s\S])/.exec(buffer);
      if (!end) break;
      const line = buffer.slice(0, end.index);
      buffer = buffer.slice(end.index + end[0].length);
      for (const f of onLine) f(line);
    }
  });
  input.on('end', () => {
    if (closed) return;
    const last = buffer.replace(/\r$/, '');
    if (last !== '') for (const f of onLine) f(last);
    close();
  });
  return {
    on(event, listener) {
      (event === 'line' ? onLine : onClose).push(listener);
    },
    close,
  };
}

/**
 * The meter: a separately running program that prices the minutes rooms were used.
 * It is started with the currency to price in as its one argument (node WORKER_FILE EUR), and will not start
 * without one. It is sent MeterInput lines on its standard input and answers with MeterMsg lines on its standard
 * output, each one JSON on a line of its own. Both sides use the kinds written here.
 */
import { spawn } from 'node:child_process';
/** @import { Amount } from '../../money/src/index.mjs' */

/** The price of one minute of use, in euro cents. */
export const RATE_CENTS_PER_MINUTE = 20;

/** Where the meter's program is, for whoever starts it: start it with node, this file and the currency to price in. */
export const WORKER_FILE = new URL('./worker.mjs', import.meta.url).pathname;

/**
 * What the meter is sent: one use of a room.
 * @typedef {{kind: 'use', room: string, minutes: number}} MeterInput
 * @bound minutes: whole number, 1 to 1440
 * @message stdin
 */

/**
 * What the meter sends back: a reading for each use it was sent, in the same order, then done once its input ends.
 * A use outside its bound gets a refusal in place of a reading.
 * @typedef {{kind: 'reading', room: string, minutes: number, cost: Amount}
 *   | {kind: 'refused', room: string, reason: string}
 *   | {kind: 'done', count: number}} MeterMsg
 * @message stdout
 */

/**
 * Reads one line the meter's program sends back: the meter's own channel.
 * @param {string} line
 * @returns {MeterMsg}
 */
export function readMeterMsg(line) {
  return /** @type {MeterMsg} */ (JSON.parse(line));
}

/**
 * Reads one line sent to the meter's program: the meter's own channel.
 * @param {string} line
 * @returns {MeterInput}
 */
export function readMeterInput(line) {
  return /** @type {MeterInput} */ (JSON.parse(line));
}

/**
 * Starts the meter's program, sends it the uses and ends its input; hands each message it sends back to onMessage, in
 * order, each line read as it arrives.
 * @param {MeterInput[]} uses
 * @param {(msg: MeterMsg) => void} onMessage
 * @param {(err: Error) => void} onError called when the program cannot be started
 * @returns {void}
 */
export function startMeter(uses, onMessage, onError) {
  const child = spawn(process.execPath, [WORKER_FILE]);
  let buffer = '';
  child.on('error', onError);
  child.stdout.on('data', (/** @type {unknown} */ chunk) => {
    buffer += String(chunk);
    /** @type {number} */
    let nl;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      onMessage(readMeterMsg(line));
    }
  });
  child.stdin.end(uses.map((u) => JSON.stringify(u)).join('\n') + '\n');
}

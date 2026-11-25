/**
 * Helpers that the store publishes for other modules' tests.
 */
import { createStoreHolding } from './index.mjs';

/**
 * The rows of the two tables the store's own tests write, t and u: a number, or an object holding one.
 * @typedef {number | {a: number}} ScratchRow
 * @storedrows t
 * @storedrows u
 */

/**
 * @carriestable keys
 * Makes a store already holding the given records, each written once.
 * @param {Object<string, Array<{id: string, value: unknown}>>} tables the records to put, by table name
 * @returns {import('./index.mjs').Store}
 */
export function seededStore(tables) {
  return createStoreHolding(tables);
}

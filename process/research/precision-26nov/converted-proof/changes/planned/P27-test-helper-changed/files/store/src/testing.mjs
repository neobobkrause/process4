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
 * Makes a store already holding the given records, each written once, in the order given.
 * @param {Array<{table: string, id: string, value: unknown}>} rows the records to put
 * @returns {import('./index.mjs').Store}
 */
export function seededStore(rows) {
  /** @type {Record<string, Array<{id: string, value: unknown}>>} */
  const tables = {};
  for (const row of rows) (tables[row.table] ??= []).push({ id: row.id, value: row.value });
  return createStoreHolding(tables);
}

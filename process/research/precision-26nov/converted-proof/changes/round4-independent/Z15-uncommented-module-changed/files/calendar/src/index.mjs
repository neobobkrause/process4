const DAY_MS = 86400000;
const NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Reads a day written YYYY-MM-DD.
 * @param {string} text
 * @returns {Date}
 * @throws {RangeError} when text is not a real calendar day written YYYY-MM-DD
 */
export function parseDay(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m) throw new RangeError('parseDay: expected YYYY-MM-DD');
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (d.getUTCMonth() !== Number(m[2]) - 1 || d.getUTCDate() !== Number(m[3])) {
    throw new RangeError('parseDay: no such day');
  }
  return d;
}

/**
 * Writes a day as YYYY-MM-DD.
 * @param {Date} day
 * @returns {string}
 */
export function formatDay(day) {
  return day.toISOString().slice(0, 10);
}

/**
 * The day n days after day.
 * @param {Date} day
 * @param {number} n
 * @returns {Date}
 */
export function addDays(day, n) {
  return new Date(day.getTime() + n * DAY_MS);
}

/**
 * How many days from a to b.
 * @param {Date} a
 * @param {Date} b
 * @returns {number}
 */
export function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

// The day as written, YYYY-MM-DD: every caller had to parse it first.
/**
 * The day of the week, as a three-letter name.
 * @param {string} day
 * @returns {string}
 */
export function weekday(day) {
  return NAMES[parseDay(day).getUTCDay()] ?? '';
}

/**
 * Counts of bookings for the people who run the halls.
 */
import { ROOM_KINDS, createRooms } from '../../rooms/src/index.mjs';
import { createBookings } from '../../bookings/src/index.mjs';
import { parseDay, weekday } from '../../calendar/src/index.mjs';
/** @import { Store } from '../../store/src/index.mjs' */

/**
 * Counts bookings by state, by kind of room and by weekday of the first night.
 * @param {Store} source the store that holds the rooms and the bookings
 * @returns {{byState: Record<string, number>, byKind: Record<string, number>, byWeekday: Record<string, number>}}
 */
export function summarize(source) {
  const rooms = createRooms({ store: source });
  /** @type {Map<string, string>} */
  const roomKind = new Map([]);
  for (const r of rooms.list()) roomKind.set(r.id, r.kind);
  /** @type {Record<string, number>} */
  const byState = {};
  /** @type {Record<string, number>} */
  const byKind = Object.fromEntries(ROOM_KINDS.map((k) => [k, 0]));
  /** @type {Record<string, number>} */
  const byWeekday = {};
  for (const b of createBookings({ store: source, rooms }).list()) {
    byState[b.state] = (byState[b.state] ?? 0) + 1;
    const kind = roomKind.get(b.room) ?? 'unknown';
    byKind[kind] = (byKind[kind] ?? 0) + 1;
    const day = weekday(parseDay(b.day));
    byWeekday[day] = (byWeekday[day] ?? 0) + 1;
  }
  return { byState, byKind, byWeekday };
}

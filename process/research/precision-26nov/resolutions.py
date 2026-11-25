"""The hand resolutions of the rebase (see resolve.py): (change, file, [text for each conflict block] or None, [(old, new)])."""

BILLING_IMPORTS = lambda names: f"""import {{ {names} }} from '../../money/src/index.mjs';
import {{ startMeter }} from '../../meter/src/index.mjs';
"""


def meter_usage(before, on_reading, on_done, indent='        '):
    """billing's meterUsage body over startMeter: what the change keeps before the run, and what it does with a reading and with done."""
    return f"""{before}{indent}startMeter(uses, (msg) => {{
{on_reading}
            else if (msg.kind === 'refused') reject(new RangeError(`billing: meter refused ${{msg.room}}: ${{msg.reason}}`));
            else if (msg.kind === 'done') resolve({on_done});
        }}, (err) => reject(err));
"""


R = [
    # setups -------------------------------------------------------------------------------------------------------
    ('A04-billing-own-copy-of-message-kind', 'billing/src/index.mjs', [
        """        startMeter(uses, (/** @type {{kind: 'reading', room: string, minutes: number, cost: Amount} | {kind: 'refused', room: string, reason: string} | {kind: 'done', count: number}} checks a message by its kind (billing's own copy) */ msg) => {
"""], None),
    ('A14-bookings-own-price-kind', 'bookings/src/index.mjs', [
        """ * @property {BookingState} state
 * @property {Price} total what the booking costs
""",
        """ *   bookstatus: {req: {id: string}, res: {state: BookingState, total: Price, room: string}},
 *   bookquote: {req: {room: string, party: number, nights: number}, res: {total: Price}}
"""], [
        (""" *   bookstatus: (req: {id: string}) => {state: BookingState, total: Amount, room: string},
 *   bookquote: (req: {room: string, party: number, nights: number}) => {total: Amount}""",
         """ *   bookstatus: (req: {id: string}) => {state: BookingState, total: Price, room: string},
 *   bookquote: (req: {room: string, party: number, nights: number}) => {total: Price}"""),
    ]),
    ('Y13b-billing-uses-tally', 'billing/src/index.mjs', [
        BILLING_IMPORTS('amount, formatAmount, splitEvenly, Tally'),
        meter_usage("""        // One running total for all the readings.
        const tally = new Tally('EUR');
""", """            if (msg.kind === 'reading') tally.add(msg.cost);""", 'tally.total')], None),
    ('T04a-billing-passes-on-a-full-total', 'billing/src/index.mjs', [
        BILLING_IMPORTS('amount, formatAmount, splitEvenly, Tally'),
        meter_usage("""        // One running total for all the readings.
        const tally = new Tally('EUR');
""", """            if (msg.kind === 'reading') {
              // a total larger than an amount can hold is refused with the tally's own error
              try {
                tally.add(msg.cost);
              } catch (err) {
                reject(err);
              }
            }""", 'tally.total')], None),
    ('Z09b-billing-sums-readings', 'billing/src/index.mjs', [
        BILLING_IMPORTS('amount, formatAmount, splitEvenly, sum'),
        meter_usage("""        /** @type {Amount[]} the readings' costs, in the order they come */
        const costs = [];
""", """            if (msg.kind === 'reading') costs.push(msg.cost);""", 'sum(costs)')], None),
    ('Z13b-billing-tally-sum', 'billing/src/index.mjs', [
        BILLING_IMPORTS('amount, formatAmount, splitEvenly, Tally'),
        meter_usage("""        /** @type {Amount[]} the readings' costs, in the order they come */
        const costs = [];
""", """            if (msg.kind === 'reading') costs.push(msg.cost);""", "Tally.sum('EUR', costs)")], None),
    ('T06a-calendar-first-step-partial', 'calendar/src/index.mjs', [
        """ * Reads a day written YYYY-MM-DD as midnight, UTC, of that day.
 * @param {string} text
 * @returns {Date}
 * @throws {RangeError} when text is not a real day written YYYY-MM-DD
"""], None),
    ('X07-bookings-price-by-kind', 'bookings/src/index.mjs', [
        """/** What one seat for one night costs in each kind of room, in euro cents. */
const PRICE_BY_KIND = { hall: PRICE_PER_SEAT_NIGHT, studio: 1800, kitchen: 1200 };

/** @typedef {'open' | 'cancelled'} BookingState */
"""], None),
    ('Z06a-bookings-states-quote-errors', 'bookings/src/index.mjs', [
        """ * @property {() => Booking[]} list every booking, in the order they were first opened
 * @throws {RangeError} quote when the room is unknown, or the party or the nights are outside their bounds
"""], None),
]

OLD_LIST = """    list() {
      return store.list('bookings').map((r) => /** @type {Booking} */ (r.value));
    },"""
NEW_LIST = """    list() {
      return store.list('bookings').flatMap((r) => {
        const b = find(r.id);
        return b ? [b] : [];
      });
    },"""
R += [(c, 'bookings/src/index.mjs', None, [(OLD_LIST, NEW_LIST)]) for c in
      ['A14-bookings-own-price-kind', 'X07-bookings-price-by-kind', 'Z06a-bookings-states-quote-errors']]

# the changes ----------------------------------------------------------------------------------------------------------
LIST_PROP = " * @property {() => Booking[]} list every booking, in the order they were first opened\n"
LIST_IMPL = """    list() {
      return store.list('bookings').flatMap((r) => {
        const b = find(r.id);
        return b ? [b] : [];
      });
    },
"""
NOTE = """      const note = req.note;
      if (note !== undefined) b.note = note;
"""
STATUS = " *   bookstatus: {req: {id: string}, res: {state: BookingState, total: Amount, room: string}},\n"
H_STATUS = " *   bookstatus: (req: {id: string}) => {state: BookingState, total: Amount, room: string},"
H_QUOTE = " *   bookquote: (req: {room: string, party: number, nights: number}) => {total: Amount}"
CAL = [""" * @returns {Date} midnight UTC of that day
 * @bound text: a real calendar day written YYYY-MM-DD
 * @throws {RangeError} when text is outside its bound
""", """ * The day n days after a day (before it, when n is negative).
""", """ * How many days from a to b, rounded to a whole number; negative when b is before a.
""", """ * The day of the week, in three letters.
 * @param {Date} day
 * @returns {'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'}
"""]


def weekday_text(comment):
    return f"""{comment}
/**
 * The day of the week, as a three-letter name.
 * @param {{string}} day
 * @returns {{string}}
 */
export function weekday(day) {{
  return NAMES[parseDay(day).getUTCDay()] ?? '';
"""


TWO_STREAMS = """    let err = '';
    child.stdout.on('data', (/** @type {unknown} */ d) => (out += String(d)));
    child.stderr.on('data', (/** @type {unknown} */ d) => (err += String(d)));
    child.on('error', reject);
    child.on('close', () => resolve({ out: parse(out), err: parse(err) }));
"""
PARSE_EDITS = [("map((l) => JSON.parse(l));", "map((l) => readMeterMsg(l));"),
               ("map((l) => /** @type {MeterMsg} */ (JSON.parse(l)));", "map((l) => readMeterMsg(l));")]

R += [
    ('X05-stale-write', 'store/src/index.mjs', ["""  const store = /** @satisfies {Store} */ ({
    put(table, id, value, expected) {
"""], None),
    ('P21-unfollowable-users-provider', 'store/src/index.mjs', ["""    count(table) {
      checkNames(table);
      return tableOf(table).size;
    },
  });
  for (const [table, rows] of Object.entries(seed)) {
    for (const row of rows) store.put(table, row.id, row.value);
  }
  return store;
"""], None),
    ('W16-store-gains-id', 'store/src/index.mjs', ["""    id(table) {
      checkNames(table);
      const t = tableOf(table);
      let n = 1;
      while (t.has(String(n))) n++;
      return String(n);
    },
  });
  for (const [table, rows] of Object.entries(seed)) {
    for (const row of rows) store.put(table, row.id, row.value);
  }
  return store;
"""], None),
    ('P27-test-helper-changed', 'store/src/testing.mjs', ["""export function seededStore(rows) {
  /** @type {Record<string, Array<{id: string, value: unknown}>>} */
  const tables = {};
  for (const row of rows) (tables[row.table] ??= []).push({ id: row.id, value: row.value });
  return createStoreHolding(tables);
"""], None),
    ('U14-inline-import-to-at-import', 'store/src/testing.mjs', ["""import { createStoreHolding } from './index.mjs';
/** @import { Store } from './index.mjs' */

/**
 * The rows of the two tables the store's own tests write, t and u: a number, or an object holding one.
 * @typedef {number | {a: number}} ScratchRow
 * @storedrows t
 * @storedrows u
 */
"""], None),
    # the store's own bound tests read the names through checkNames, which the change does not touch
    ('P28-handle-method-renamed', 'store/test/index.test.mjs', ["""  checkNames('t', 'x');
  checkNames('t', 'x'.repeat(120));
  assert.throws(() => checkNames('t', ''), RangeError);
  assert.throws(() => checkNames('t', 'x'.repeat(121)), RangeError);
"""], None),
    ('A13-computed-member-renamed', 'store/test/index.test.mjs', ["""  checkNames('t', 'x');
  checkNames('t', 'x'.repeat(120));
  assert.throws(() => checkNames('t', ''), RangeError);
  assert.throws(() => checkNames('t', 'x'.repeat(121)), RangeError);
"""], None),
    ('P09-newly-refused', 'store/test/index.test.mjs', ["""  checkNames('a', '1');
  checkNames('a'.repeat(40), '1');
  checkNames('a-0', '1');
  assert.throws(() => checkNames('', '1'), RangeError);
  assert.throws(() => checkNames('a'.repeat(41), '1'), RangeError);
  assert.throws(() => checkNames('Big', '1'), RangeError);
  assert.throws(() => checkNames('a b'), RangeError);
});

test('bound id: 1 to 120 characters', () => {
  checkNames('t', 'x');
  checkNames('t', 'x'.repeat(120));
  assert.throws(() => checkNames('t', ''), RangeError);
  assert.throws(() => checkNames('t', 'x'.repeat(121)), RangeError);
"""], None),
    # meter
    ('X09-message-channel', 'meter/test/index.test.mjs', [TWO_STREAMS], PARSE_EDITS[:1]),
    ('Y06-channel-line-built-first', 'meter/test/index.test.mjs', [TWO_STREAMS], PARSE_EDITS[1:]),
    ('Z04-stream-chosen-into-variable', 'meter/test/index.test.mjs', [TWO_STREAMS], PARSE_EDITS[1:]),
    ('V03-refusals-through-console-error', 'meter/test/index.test.mjs', ["""    let err = '';
    child.stdout.on('data', (/** @type {unknown} */ d) => (out += String(d)));
    child.stderr.on('data', (/** @type {unknown} */ d) => (err += String(d)));
    child.on('error', reject);
    child.on('close', () => resolve((out + err).trim().split('\\n').filter(Boolean).map((l) => readMeterMsg(l))));
"""], None),
    ('T09-messages-pretty-printed', 'meter/test/index.test.mjs', ["""    // each message starts at a line that begins with {
    child.on('close', () => resolve(out.trim().split(/\\n(?=\\{)/).filter(Boolean).map((l) => readMeterMsg(l))));
"""], None),
    ('T17-test-shows-meter-output', 'meter/test/index.test.mjs', ["""    child.on('close', () => {
      // what the meter wrote, shown with the test's output, so that a failure can be read without running it by hand
      console.log(`meter wrote:\\n${out}`);
      resolve(out.trim().split('\\n').filter(Boolean).map((l) => readMeterMsg(l)));
    });
"""], None),
    # kept as the change wrote it: its point is narrowing by assert.equal, which the checker does not follow
    ('A09-assert-narrowing', 'meter/test/index.test.mjs', ["""  assert.equal(a.kind, 'reading');
  assert.equal(b.kind, 'reading');
  assert.equal(done.kind, 'done');
"""], None),
    ('U05-start-environment-through-node-process', 'meter/test/index.test.mjs', ["""import { env } from 'node:process';
import { WORKER_FILE, readMeterMsg } from '../src/index.mjs';
"""], None),
    ('U05-start-environment-through-node-process', 'meter/src/worker.mjs', ["""import { readLines } from './lines.mjs';
import { env } from 'node:process';
import { amount, CURRENCIES } from '../../money/src/index.mjs';
import { RATE_CENTS_PER_MINUTE, readMeterInput } from './index.mjs';
"""], None),
    ('W01-meter-start-argument', 'meter/src/worker.mjs', ["""import { readLines } from './lines.mjs';
import { amount, CURRENCIES } from '../../money/src/index.mjs';
import { RATE_CENTS_PER_MINUTE, readMeterInput } from './index.mjs';
"""], None),
    ('W02-meter-ready-line', 'meter/src/worker.mjs', ["""const lines = readLines(process.stdin);
// An empty line as soon as the meter is ready, so that whoever started it can tell it has started.
process.stdout.write('\\n');
"""], None),
    ('T05-meter-ready-line-console-log', 'meter/src/worker.mjs', ["""// An empty line first, as soon as the meter runs, so that whoever started it can tell it is ready; readers skip
// empty lines.
console.log();

const lines = readLines(process.stdin);
"""], None),
    ('X10-node-timer', 'meter/src/worker.mjs', ["""const lines = readLines(process.stdin);

/** How long the meter waits for its next line before it stops on its own, in milliseconds. */
const IDLE_MS = 30_000;
// A meter whose input goes quiet stops on its own, so that a forgotten one does not linger. The wait alone does
// not keep the program running.
const idle = setTimeout(() => lines.close(), IDLE_MS);
idle.unref();

"""], None),
    ('V02-bound-values-in-mapped-list', 'meter/src/worker.mjs', ["""  const input = readMeterInput(line);
  if (input.kind !== 'use' || !Number.isInteger(input.minutes) || input.minutes < 1 || input.minutes > 600) {
"""], None),
    ('U12-worker-path-through-import-meta-resolve', 'meter/src/index.mjs', ["""import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
"""], None),
    # door
    ('V11-door-copy-in-two-steps', 'door/src/index.mjs', ["""    const answer = JSON.stringify(h(JSON.parse(JSON.stringify(body))));
    if (answer.length > MAX_ANSWER) throw new RangeError(`door: the answer to ${op} is larger than ${MAX_ANSWER} characters`);
    return /** @type {T} the operation's answer, copied */ (JSON.parse(answer));
"""], None),
    # bookings
    ('A01-stored-row-shape', 'bookings/src/index.mjs', [NOTE + "      store.put('bookings', b.id, toRow(b));\n"], None),
    ('Y05-row-cast-at-write', 'bookings/src/index.mjs', [NOTE + "      store.put('bookings', b.id, toRow(b));\n"], None),
    ('U02-table-name-in-constant-rows-compact', 'bookings/src/index.mjs', [NOTE + "      store.put(TABLE, b.id, toRow(b));\n"],
     [("      return store.list('bookings').flatMap((r) => {", "      return store.list(TABLE).flatMap((r) => {")]),
    # the table is renamed in all of bookings' own code: its reader list too
    ('U01-table-renamed-mark-forgotten', 'bookings/src/index.mjs', [NOTE + "      store.put('bookings-2', b.id, b);\n"],
     [("      return store.list('bookings').flatMap((r) => {", "      return store.list('bookings-2').flatMap((r) => {")]),
    ('A10-kind-split-same-shape', 'bookings/src/index.mjs', [" * @property {BookingState} state\n"], None),
    ('W13-fields-reordered', 'bookings/src/index.mjs', [""], [(" * @property {'open' | 'cancelled'} state\n", " * @property {BookingState} state\n")]),
    ('P05-answer-field-removed', 'bookings/src/index.mjs', [" *   bookstatus: {req: {id: string}, res: {state: BookingState, total: Amount}},\n"],
     [(H_STATUS, " *   bookstatus: (req: {id: string}) => {state: BookingState, total: Amount},")]),
    ('P18-operation-retired', 'bookings/src/index.mjs', [STATUS], [(" *   bookcancel: (req: {id: string}) => Booking,\n", "")]),
    ('P19-operation-body-field-renamed', 'bookings/src/index.mjs',
     [STATUS + " *   bookquote: {req: {room: string, people: number, nights: number}, res: {total: Amount}}\n"],
     [(H_QUOTE, " *   bookquote: (req: {room: string, people: number, nights: number}) => {total: Amount}")]),
    ('T10-new-operation', 'bookings/src/index.mjs', [
        LIST_PROP + " * @property {(room: string) => Booking[]} forRoom the bookings of one room, open and cancelled, in the order they were opened\n",
        STATUS + " *   bookquote: {req: {room: string, party: number, nights: number}, res: {total: Amount}},\n *   booklist: {req: {room: string}, res: {bookings: Booking[]}}\n"],
     [(H_QUOTE, H_QUOTE + ",\n *   booklist: (req: {room: string}) => {bookings: Booking[]}")]),
    ('Y10-map-has-get-provider-kind', 'bookings/src/index.mjs', [
        LIST_PROP + " * @property {() => Record<string, Amount>} takings what the open bookings of each room come to, by the room's id\n",
        LIST_IMPL + """    takings() {
      /** @type {Map<string, Amount>} what the open bookings of each room come to */
      const byRoom = new Map();
      for (const rec of store.list('bookings')) {
        const b = /** @type {Booking} */ (rec.value);
        if (b.state !== 'open') continue;
        if (!byRoom.has(b.room)) byRoom.set(b.room, amount(0, 'EUR'));
        byRoom.set(b.room, add(byRoom.get(b.room), b.total));
      }
      return Object.fromEntries(byRoom);
"""], None),
    ('V09-pop-after-length-check', 'bookings/src/index.mjs', [
        LIST_PROP + " * @property {(party: number) => string} suggest the id of the smallest room that seats the party; refuses a party no room seats\n",
        LIST_IMPL + """    /** @throws {RangeError} when no room seats the party */
    suggest(party) {
      const fitting = rooms.list().filter((r) => r.seats >= party).sort((a, b) => b.seats - a.seats);
      if (fitting.length === 0) throw new RangeError(`bookings: no room seats ${party}`);
      return fitting.pop().id;
"""], None),
    ('Z06-wrapping-handler-error-kind', 'bookings/src/index.mjs', [LIST_PROP + """ * @throws {RangeError} quote when the party or the nights are outside their bounds
 * @throws {Error} quote when the room is unknown (an unknown room is not a value out of bounds)
"""], None),
    ('U08-same-kind-parameters-swap-places', 'bookings/src/index.mjs', [""" * @property {(room: string, nights: number, party: number) => Amount} quote what a booking would cost, for so many nights and so many people (the order of the venue's price sheet)
""" + LIST_PROP], None),
    ('T02-quote-bound-not-reaching-operation', 'bookings/src/index.mjs', [""" * @property {(room: string, party: number, nights: number) => Amount} quote what a booking would cost; a quote is
 *   given for a stay of up to three nights (a weekend), and a longer stay is priced by the venue's staff
""" + LIST_PROP + " * @bound quote.nights: whole number, 1 to 3\n"], None),
    # calendar: the module is commented after its conversion, so its first job's comments step only rewords them
    ('P22a-first-job-comments-step', 'calendar/src/index.mjs', CAL, None),
    ('P22b-first-job-real-change', 'calendar/src/index.mjs', CAL, None),
    ('T06-weekday-takes-text-after-partial-first-step', 'calendar/src/index.mjs',
     [weekday_text('// takes the day as written, YYYY-MM-DD, since every caller had to parse it first')], None),
    ('Z15-uncommented-module-changed', 'calendar/src/index.mjs',
     [weekday_text('// The day as written, YYYY-MM-DD: every caller had to parse it first.')], None),
]

# merged without a conflict, but the conversion wrote out what the original derived: the change's edit is carried to it
ROOM_KIND = "/** @typedef {'hall' | 'studio' | 'kitchen'} RoomKind */"
GARDEN = "/** @typedef {'hall' | 'studio' | 'kitchen' | 'garden'} RoomKind */"
H_ROOMLIST = " *   roomlist: (req: {kind?: RoomKind}) => {rooms: Room[]}"
R += [
    ('X07-list-gains-name-lookup-table', 'rooms/src/index.mjs', None, [(ROOM_KIND, GARDEN)]),
    ('P11-list-gains-name', 'rooms/src/index.mjs', None, [(ROOM_KIND, GARDEN)]),
    ('X08-new-op-name-clash', 'rooms/src/index.mjs', None,
     [(H_ROOMLIST, H_ROOMLIST + ",\n *   bookstatus: (req: {id: string}) => {bookable: boolean, seats: number}")]),
    ('P25-two-changes-one-commit', 'rooms/src/index.mjs', None,
     [(H_ROOMLIST, " *   roomlist: (req: {kind?: RoomKind}) => {items: Room[]}")]),
    # the conversion already named the states: the change only adds the kind's description
    ('V13-states-named', 'bookings/src/index.mjs', None, [("/** @typedef {'open' | 'cancelled'} BookingState */\n\n", "")]),
]

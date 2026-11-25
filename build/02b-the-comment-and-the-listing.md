Length: 125 lines. Last section: "6. An interface listing, and an item's means".

# Process4 build text 2b: the structured comment and the interface listing

Sections 5 and 6 of build text 2, kept in their own file so that each stays under 24,000 bytes; their numbers are kept. Sections 1 to 4 and 7 to 9 are in `02-the-forms.md`, section 10, the coding standard, in `02c-the-coding-standard.md`; whose section 1 says what was proven and names the proof; "proof:" paths below are in its folder. **Status: proposed. The tool reads these forms, but nothing here has run in a process in force.** It adds no check, gate, review or stop; where it and the design (`design/`) differ, the design rules.

Marks: **Decided here:** a choice made in this text, with what it gives and what it costs. **Unproven:** never shown to work in this form. Every example is made up: a product in plain JavaScript with modules `dates`, `pricing` and `orders`.

## 5. A structured comment

These are the proof's forms (proof: `product/money/src/index.mjs`, and `bookings` and `door` beside it), for plain JavaScript under TypeScript's reader, the only reader tried. Comments are JSDoc blocks, which running code never sees.

**What a module accepts and hands back.** Each export of the module's interface files (section 6) has a block with `@param` and `@returns`, or `@type`. A kind with a name is a `@typedef`. The kinds of error raised are `@throws {Kind}`. A kind of another module is brought in by `/** @import { Price } from '../pricing/index.mjs' */`.

```js
/**
 * @typedef {Object} PriceArgs
 * @property {string} sku the product code
 * @property {number} [quantity] absent is 1
 * @bound quantity: whole number, 1 to 999
 */
/**
 * @typedef {Object} Price
 * @property {number} pence
 * @bound pence: whole number, zero or more
 */
/**
 * @param {PriceArgs} args
 * @returns {Price}
 * @throws {RangeError} when the quantity is outside its bound
 */
export function priceOf(args) { /* … */ }
```

**The mark for a bound** is the tag `@bound <words>`, in the block of the kind or function it limits. No kind name is written: the block says whose it is. It runs to the next tag or the block's end and may wrap; its spaces are read as single. In a kind of plain data every bound line goes wherever the kind goes, not with one field. Only in an operations table or a handle kind (an object handed out, whose members are entries) is a line one member's, and only when it begins `member.`; any other line there is every member's. Any change to the words is a change to the interface (part 2, section 7, point 3). A class member's own `@bound` lines, in its own block or on a field set by `this.x = ...`, are part of that member's entry, before the bound lines of the kinds it uses.

**Which kind a piece of code checks or builds.** One form: a plain `@type {Kind}` on the value, the words after it being for people. This is what makes the two approved refusals possible: where no comment states a kind, the check cannot tell and does not refuse (build text 1b, command 18). Where a value is handed across ("cannot be assigned"), only the comment on the side that receives it counts: the parameter, field, variable or answer it goes into, or a handed function's own parameter that receives; a comment on the value handed over does not.

```js
/** @type {PriceArgs} checks a PriceArgs below */
const a = args;
/** @type {Price} builds a Price */
const price = { pence };
```

**The provider's one table of operations** is one kind, of any name, marked `@optable`. Its members are the names callers send, each a pair `req` and `res`. There is no table value.

```js
/**
 * @typedef {{
 *   priceof: {req: PriceArgs, res: Price}
 * }} PricingOps
 * @optable
 * @bound priceof.pence: for the whole quantity
 */
```

**The one list, and a call by name through it** (rule 5 of the design, part 2, section 7; S7). The list is a kind in the source of the shared piece that carries the calls, which stands after the providers in the module order and declares them. Here it is one more made-up module, `door`, after `pricing`:

```js
/** @import { PriceArgs, Price } from '../pricing/index.mjs' */
/** @typedef {((op: 'priceof', body: PriceArgs) => Promise<Price>) & ((op: 'dayof', body: DayArgs) => Promise<Day>)} AllOps */
/**
 * @typedef {Object} Door
 * @property {AllOps} call
 * @carriesop call
 */
```

Each operation's line is written from its table's named kinds, since the standard allows no indexed-access type (R20).

The mark `@carriesop <members>`, on the handle's kind or on a function, names what carries a call by name. The tool reads the name from each call's first argument: a text written out, a choice of such texts, or a request line beginning `op=<name>&`. `door.call('priceof', { sku })` in `orders` is a use of `pricing`'s entry `op:priceof`. A name not written out is a place outside the standard (S7). When a second module starts to answer a name, the tool tells that operation's users.

**Three more marks the proof ran.** A member that may be missing is optional in the listing. A kind sent between two separately running parts is marked `@message stdin` or `@message stdout`. Rows of a shared table are `@storedrows <table>` on the rows' kind, with `@carriestable get list put remove` on the store's handle, and are read as calls by name are.

**Unproven:** the proven tool held modules to these forms by refusals the design does not take (a module imports only another's interface files; messages and stored rows carry their marks). The forms without those refusals are unproven.

## 6. An interface listing, and an item's means

These are the proof's forms (proof: `tool/p3tool.mjs`, `tool/lib/listing.mjs`, `canon.mjs`), for the stated part of an item's means (the design, part 2, section 7). The tool makes a listing from the reader's own checker over the module's **interface files**, the files its entry names in `public` (build text 2, section 3). It is also what the two approved refusals read (build text 1b, command 18).

A listing is an object for each **entry**, an item of the module; the text below is a printing of it.

```
Listing of pricing
  kind PriceArgs   [src/pricing/index.mjs:6]
      accepts: { quantity?: number; sku: string }
      bound: quantity: whole number, 1 to 999
  function priceOf   [src/pricing/index.mjs:16]
      accepts: (arg0: { quantity?: number; sku: string })
      hands back: { pence: number }
      bound: pence: whole number, zero or more
      bound: quantity: whole number, 1 to 999
      throws: RangeError
```

- An entry is named by its name within its module; the file and line beside it are not compared. Where two of the module's interface files export one name for two different things, each is an entry of its own named `<file>:<name>`, the file as the module list writes it; the same thing exported again from a second file stays one entry. Beside exports, entries are each member of a handle kind (`Door.call`), each class member (`Name.x` static, `Name#x` otherwise), each operation (`op:priceof`) and each shared table (`table:<name>`).
- An entry has a sort (function, value, kind, handle kind, method, class, class member, operation table, operation, stored rows) and, as they apply: what it accepts, what it hands back, its bound lines, a message's channel, whether a member may be missing, and the reader's printed declaration of it with comments removed.
- A kind of plain data is written out in full, fields in name order, with its name kept, in every entry that accepts it or hands it back, and its bound lines go with it. A handle kind is written by name. Arguments are `arg0`, `arg1`: compared by place, not by name. Explanations in comments are in no entry. A plain constant's value is content: it is widened to its kind unless its comment states one.

**Comparing.** Each item's means is compared before and after (build text 5, section 6), entry by entry. With no difference the notice says `No item's means changed. Nobody is told.` Otherwise each item that differs gets one or more of these words:

| Word | When | Told |
|---|---|---|
| `removed` | An item gone, or a name lost from a handle or table. A renamed item is this and a `new item` | Its users |
| `new item` | An item only after | Nobody |
| `accepts more` | The type checker, reading the old and new in one program, confirms the new stands in for the old: for a function, the new assignable to the old; for what a user hands in, the old to the new | Nobody |
| `cannot stand in` | Removed, renamed, newly required or newly refused, or not confirmed as accepting more | Its users |
| `hands back differently` | What it hands back, a message's channel, a member that may now be missing | Its users |
| `bound changed` | A bound line added, removed or reworded | Its users |
| `errors`, `data or instance`, `this`, `writes arguments`, `channels` | That part worked out from the code differs | Its users |
| `type error` | Its code no longer matches its stated types | Its users |
| `declaration changed` | No other word applies, and the printed declaration differs | Its users |
| `<module> now answers the same name` | A second module answers an operation's name | That operation's users |

```
Notice for a change to pricing (TypeScript 5.6.3)
  pricing PriceArgs: bound changed -> tells users
  TOLD orders
      uses pricing PriceArgs (bound changed) at src/orders/lines.mjs:41 addLine
```

- **Describing is not changing.** An item's first means, at its conversion, tells no one; nor does a type read as "anything" before and stated after, in the item or in any later item that passes it on (the design, part 2, section 7).
- A named or declared change of meaning (build text 5, section 5) tells the item's users whatever the means say.
- **Unproven:** the comparison of means and the checker confirming "accepts more"; not built. The proven tool compared listings alone, with 23 refusals the design does not take (build text 2, section 1).

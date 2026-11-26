Length: 127 lines. Last section: "6. An interface listing, and an item's means".

# Process4 build text 2b: the structured comment and the interface listing

Sections 5 and 6 of build text 2, in their own file; their numbers are kept. Sections 1 to 4 and 7 to 9 are in `02-the-forms.md`, whose section 1 names the proof ("proof:" paths below are in its folder), and section 10, the coding standard, in `02c-the-coding-standard.md`. **Status: proposed. The tool reads these forms, but nothing here has run in a process in force.**

Marks and examples: as build text 2.

## 5. A structured comment

These are the proof's forms (proof: `product/money/src/index.mjs`, and `bookings` and `door` beside it), for plain JavaScript under TypeScript's reader. Comments are JSDoc blocks, which running code never sees.

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

**The mark for a bound** is the tag `@bound <words>`, in the block of the kind or function it limits. No kind name is written: the block says whose it is. It runs to the next tag or the block's end and may wrap; its spaces are read as single. In a kind of plain data every bound line goes wherever the kind goes, not with one field. Only in an operations table or a handle kind (an object handed out, whose members are entries) is a line one member's, and only when it begins `member.`; any other line there is every member's. Any change to the words is a change to the interface (part 2, section 7, rule 3). A class member's own `@bound` lines, in its own block or on a field set by `this.x = ...`, are part of that member's entry, before the bound lines of the kinds it uses.

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

**Unproven:** these forms with no refusal to hold a module to them: that a module imports only another's interface files, and that messages and stored rows carry their marks.

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

- An entry is named by its name within its module; the file and line beside it are not compared. Where two of the module's interface files export one name for two different things, each is an entry of its own named `<file>:<name>`, the file as the module list writes it; the same thing exported again from a second file stays one entry. Beside exports, entries are each member of a handle kind (`Door.call`), each class member (`Name.x` static, `Name#x` otherwise), each operation (`op:priceof`) and each shared table (`table:<name>`). A message's kind (`@message`, section 5) is a kind whose entry carries its channel.
- An entry has a sort (function, value, kind, handle kind, method, class, class member, operation table, operation, stored rows) and, as they apply: what it accepts, what it hands back, its bound lines, a message's channel, whether a member may be missing, and the reader's printed declaration of it with comments removed.
- A kind of plain data is written out in full, fields in name order, with its name kept, in every entry that accepts it or hands it back, and its bound lines go with it. A handle kind is written by name. Arguments are `arg0`, `arg1`: compared by place, not by name. Explanations in comments are in no entry. A constant's value is kept.

**Comparing.** Each item's means is compared before and after (build text 5, section 6), entry by entry. Where what it accepts or hands back is written differently, the reader's checker is asked about the two declarations themselves, read in one program: a part it finds identical, and each side assignable to the other, is unchanged (a kind's name given, dropped or changed, a type parameter renamed, a handle kind renamed with the same members); anything the checker can tell apart is a change. With no difference the notice says `No item's means changed.` and tells only the modules that hear of any change to the provider's files (build text 5, section 6). Otherwise each item that differs gets one or more of these words:

| Word | When | Told |
|---|---|---|
| `removed` | An item gone, or a name lost from a handle or table. A renamed item is this, and new under its new name | Its users |
| No word: a new item | An item only after | Nobody, unless it changes what a name already used resolves to (the design, part 2, section 7) |
| `kind changed` | Its sort (above) | Its users |
| `accepts more` | What it accepts is wider, as the type checker reads the old and new in one program, and what it hands back the same | Its users |
| `cannot stand in` | What it accepts differs otherwise: removed, renamed, newly required or newly refused | Its users |
| `hands back differently` | What it hands back, a message's channel | Its users |
| `may now be missing` | A member that could not be missing before | Its users |
| `bound changed` | A bound line added, removed or reworded | Its users |
| `errors that can leave it changed`, `plain data or instance changed`, `now needs its object as this` (or `no longer needs its object as this`), `arguments written into changed`, `channels, settings or files changed` | That part worked out from the code differs | Its users |
| `value changed` | A constant's value, or what makes it, where its type shows no difference | Its users |
| `type error in its code` | Its code no longer matches its stated types: a new error, or any change to its code while it has one | Its users |
| `meaning changed` | ARCH named, or the pull request declared, a change of meaning | Its users |
| `<module> now answers the same name` | A second module answers an operation's name | That operation's users |

```
Notice for a change to pricing (TypeScript 5.6.3)
  pricing PriceArgs: bound changed -> tells users
  TOLD orders
      uses pricing PriceArgs (bound changed) at src/orders/lines.mjs:41 addLine
```

- What is not a change (describing among it), a change ARCH named or a pull request declared, and an item a job records as the same (`push --same`, build text 5, section 5) are the design's (part 2, section 7); `notify` applies them to these words.
- **Unproven:** the comparison of means, which is built and passes the tool's own tests but has not run on a product. The proof compared listings alone (build text 2, section 1).

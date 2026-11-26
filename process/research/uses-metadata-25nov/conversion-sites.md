# Every conversion site of the pinned checker, and how the reader covers it (25 Nov 2026)

Status: research for PROCESS #16, by a worker building stage 1 of decision C. Read in TypeScript 5.6.3, the version the tool
pins: `tool/node_modules/typescript/lib/typescript.js`, the bundle of `src/compiler/checker.ts`, function
`createTypeChecker`. The reader is `tool/lib/notice/refs.mjs` (`conversions`, `relate`, `cast`, `overrides`); each site
below that applies to JavaScript is in its tests (`tool/test/refs.test.mjs`, "conversion sites" and the cases named).

**Method.** Every call, inside `createTypeChecker`, of the relations that check one type against another and report
when it fails: `checkTypeAssignableTo`, `checkTypeAssignableToAndOptionallyElaborate`, `checkTypeRelatedTo`,
`checkTypeRelatedToAndOptionallyElaborate`, `checkTypeComparableTo`, and `getSignatureApplicabilityError` (arguments),
listed by the function that holds the call (a script over the bundle: 43 functions besides the relations themselves). These are the places
where a value passes from one type to another, so they are the conversions R5 to R7 and R11 concern. The remaining
calls of `isTypeAssignableTo` / `isTypeRelatedTo` (47 functions, the relations' own wrappers among them) are questions the checker asks while inferring,
narrowing or simplifying types (for example `getInferredType`, `getFlowTypeOfReference`, `removeSubtypes`,
`getConditionalType`, `isArrayLikeType`): no value passes there, and each answer shows in the types the reader then
reads.

**What "covered" means.** At the site the reader relates the value's type to the type it is given (`relate`): both
sides are uses (R11), every member is compared by the tool's own relation (R5 to R7, R17), a host value given a product
type is a place (R15), and a cast down is a place (R16).

## Conversion sites

| Checker function | What it relates | In JavaScript | The reader |
|---|---|---|---|
| `getSignatureApplicabilityError` (from `resolveCall`) | each argument to its parameter, a spread argument to the rest parameter, the receiver to a stated `this` | yes | `conversions`: arguments, spread arguments (`paramTypeAt`), the receiver of a method call when the signature states `@this`; tests "argument", "spread argument", "receiver", B5, B1 |
| `resolveCall` for tagged templates | each `${}` value to the tag's parameter | yes | `conversions`: tagged templates; test "tagged template" |
| `checkDecorator` | the decorated value to the decorator's parameter | yes (stage 3 decorators) | `conversions`: decorators, the class's own constructor type; test "a decorator receives the value it decorates" |
| `checkReturnStatement` | the returned value to the function's return type | yes | `conversions`: returns; tests "return", A6, w14 |
| `checkFunctionExpressionOrObjectLiteralMethodDeferred` | an arrow's expression body to its return type | yes | `conversions`: arrow bodies; test "arrow body" |
| `checkAsyncFunctionReturnType` | an async function's stated return type to a promise | type only | no value passes; the returned values are `checkReturnStatement`'s |
| `checkYieldExpression`, `checkGeneratorInstantiationAssignabilityToReturnType` | a yielded value to the yield type; the generator's stated types | yes; the second is type only | `conversions`: `yield`; test "yield" |
| `checkVariableLikeDeclaration` | a variable's, parameter's, property's or binding element's initializer to its type; a parameter's default; a destructuring default | yes | `conversions`: initializers with a stated type, parameter defaults, defaults taken apart, class fields; tests B2, B2b, "parameter default", "default taken apart", "class field" |
| `checkReferenceAssignment`, `checkBinaryLikeExpressionWorker` (`=`, `??=`, `\|\|=`, `&&=`, destructuring assignment) | the right side to the target's type; each member taken apart to its target | yes | `conversions`: assignments (identifiers, members, elements), the logical assignments, `takenApart`; tests "assignment", "logical assignment", "element assignment", "assignment taken apart" |
| `checkBinaryLikeExpressionWorker` (arithmetic, comparison, `+`) and `checkArithmeticOperandType`, `checkTemplateExpression` | operands to `number`, `bigint`, `string` | operators on the language's values | not a conversion between modules' types; the members the language calls (`toString`, `valueOf`, `Symbol.toPrimitive`) are uses (R11, `implicit`); test B10 |
| `checkObjectLiteral` (with the literal's contextual type, elaborated by `elaborateElementwise`) | each member of an object written in place, and what is spread into it, to the expected member | yes | `conversions`: fields, shorthand fields, methods, spread into an object; an object with another module's value spread into it is not "written in place" (R17); tests "field", "shorthand field", "object spread", B1 |
| `checkArrayLiteral` via contextual element types (`elaborateIterableOrArrayLikeTargetElementwise`) | each element and each spread list of a list written in place to the expected element | yes | `conversions`: elements and spreads; tests "list element", "list spread" |
| `checkForOfStatement`, `getIteratedTypeOrElementType` | the iterated element to the loop variable's stated type | not in JavaScript: the checker gives a for-of variable the iterated type whatever its comment says (run, 5.6.3) | `conversions` relates the variable's type to the element's, which are then the same; iteration itself is a use (`iterate`); test "conversion sites" (the for-of line raises nothing) |
| `checkForInStatement` | the key variable to `string` | keys only | not a conversion between modules' types |
| `checkSatisfiesExpressionWorker` | the value to the `@satisfies` type | yes | `conversions`: both types used, the value keeps its type, so no member check; test "conversion sites" (satisfies) |
| `checkAssertionDeferred` | a cast's value and type, comparable | yes (`/** @type {T} */ (e)`) | `cast`: R16 down, R2 from `unknown`; tests x1, A1, D1, B11 |
| `checkClassLikeDeclaration`, `issueMemberSpecificError` | the class's instance and static sides to the class it extends, member by member; the class to each `@implements` | yes | `overrides`: each member against the base's, static members against the base's static side, and the class against each `@implements`; tests B1b, "static override", "implements" |
| `checkInstanceOfExpression`, `checkInExpression` | operands to `object` / a callable | operators | not a conversion; `instanceof` of another module's class is a use (`catch` in a catch clause), `Symbol.hasInstance` an implicit member |
| `checkSwitchStatement` | each case to the switch value, comparable | yes | a comparison, no value passes; the values' types are uses where they are read |
| `checkIndexedAccessIndexType`, `checkComputedPropertyName` | an index or key to a key type | keys only | S3 for a computed member of another module's object |
| `checkExportAssignment` | `export =` / `export default` to a stated type | rarely (no stated type in JavaScript but by a cast) | `conversions`: the default export, by its expected type where one exists |
| `checkImportAttributes`, `checkImportCallExpression` | `with { type }` to the attributes type; the specifier to `string` | the language's own types | S1, S2 read the specifier itself |
| `checkTypeArguments`, `checkTypeArgumentConstraints`, `checkTypeParameter`, `checkTypeParameterDeferred`, `checkMappedType`, `checkTemplateLiteralType`, `checkTypePredicate` | type arguments to constraints; a predicate's type to its parameter's | types only | R20 keeps generic types to those the checker relates; R3 reads every guard |
| `computeConstantEnumMemberValue`, `checkInterfaceDeclaration` | enum members; interfaces' bases | not in JavaScript | none |
| `checkJsxOpeningLikeElementOrOpeningFragment`, `checkApplicableSignatureForJsxOpeningLikeElement`, `checkJsxReturnAssignableToAppropriateBound`, `resolveJsxOpeningLikeElement`, `elaborateJsxComponents` | JSX attributes and components | not in `.mjs` | none |
| `elaborateError`, `elaborateArrowFunction`, `elaborateDidYouMeanToCallOrConstruct`, `elaborateElementwise`, `elaborateIterableOrArrayLikeTargetElementwise` | the parts of a conversion above, to word its error | the same conversions | covered by the site that calls them |

## Values whose types meet without a stated type

- **Callback parameters** (`assignContextualParameterTypes`): an unstated parameter takes the expected type; reading it
  is a use by type. A stated one makes the function handed over a value of a function type, related at the argument:
  its parameters contravariantly (R5); test B5, B1.
- **Conditional and logical expressions flowing to a stated type**: the value's type is the union of its branches;
  `relate` compares each member of the union to the type it stands in for; tests "conditional", "logical".
- **`throw` and `catch`**: a thrown value of another module's type is a use (`throw`); `instanceof` of another
  module's class in a catch clause is a use (`catch`); a caught value is `unknown` (R2 otherwise); test "conversion sites".

## What this rests on

The list is the checker's own, read from the pinned bundle; a new version changes it, and the reader's tests show
where. That each listed call is reached as its name says is the checker's documented behaviour, the premise the coding
standard already names.

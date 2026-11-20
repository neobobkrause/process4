// Value 3, upward sweep: rule pool extended to 40 lines, battery extended, and a richer
// non-obligation background (prose + a requirements summary table) to reach 8-16 KB.
import { RULES as R20, SINGLE as S20, SCENARIOS as SC20, PREAMBLE, BACKGROUND as BG8 } from './battery.mjs';
import { rng, shuffle, makeProbes } from './gen.mjs';

export const RULES = [...R20,
  'Name your branch and your pull request in every message to ARCH.',
  'Before `push`, run `check`; fix any problem it reports in your own module before pushing.',
  'A requirement you cannot meet as written goes to ARCH with its number; never reinterpret it yourself.',
  'Never change another module\'s tests, even to make them pass with your change.',
  'When `results` shows a failure outside your module\'s tests, run `results` once more; if it still fails, tell ARCH, naming the failing test.',
  'Keep every secret value out of code, tests, commit messages and messages; refer to a secret only by its name in the process config.',
  'Prove a requirement with a walk step only if a person can see it on screen; prove every other requirement with tests alone.',
  'Add no dependency on an outside package without ARCH\'s written agreement.',
  'On a told job, read only the entries the notice\'s uses name before deciding what to check.',
  'Files your tests generate go under `invoices/test/tmp/` and are never committed.',
  'If two requirements conflict, follow the lower-numbered one and tell ARCH.',
  'A message to ARCH is at most 120 words; put longer detail in a file in your module\'s folder and name the file.',
  'Do not reformat code you are not otherwise changing.',
  'On a told job, run `related` before `ready`, and name the tests it lists in your message to ARCH.',
  'If `push` is refused because the branch has moved, fetch and merge the branch; never rebase.',
  'Every error your module returns carries a code from `invoices/errors.js`; never return a bare string.',
  'Store every date and time in UTC; convert to a local time only when displaying it.',
  'A question from the owner on your pull request goes to ARCH unanswered; do not answer the owner directly.',
  'Whenever you stop, for any reason, your last act is `push`.',
  'Never open a second pull request: all your work goes on #212.',
];
export const SINGLE = [...S20, 1, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2];

const O = (a, b, c, d) => ({ A: a, B: b, C: c, D: d });
export const SCENARIOS = [...SC20,
  { id: '21a', rules: [21], kind: 'apply', text: 'You are writing ARCH your message that the tests pass.', opts: O('Write only "tests pass".', 'Include the full test log.', 'Name your branch and your pull request in it.', 'Copy it to the coordinator.'), ans: 'C' },
  { id: '21n', rules: [21], kind: 'near', text: 'You are writing a commit message for a bug fix (not a message to ARCH).', opts: O('Write an ordinary commit message describing the fix.', 'Name your branch and pull request in it, as in every message.', 'Leave the commit message empty.', 'Ask ARCH what to write.'), ans: 'A' },
  { id: '22a', rules: [22], kind: 'apply', text: 'Your change is finished and you are about to `push`.', opts: O('Push now: the required run will check it.', 'Run `listing` first.', 'Run `check` first, and fix any problem it reports in your module before pushing.', 'Ask ARCH to check it.'), ans: 'C' },
  { id: '22n', rules: [22], kind: 'near', text: 'Before pushing you ran `check`. It reports a problem only in module `mailer`, unrelated to your change; your module is clean.', opts: O('Fix the problem in `mailer` before you push.', 'Do not push until `mailer` is fixed.', 'Push, and tell ARCH of the problem in `mailer`.', 'Disable the part of `check` that reports it.'), ans: 'C' },
  { id: '23a', rules: [23], kind: 'apply', text: 'R-14 says amounts are "rounded to whole cents", but invoices in yen have no cents, so you cannot meet R-14 as written for them.', opts: O('Read it as "whole yen" and carry on.', 'Tell ARCH, naming R-14, and do not reinterpret it.', 'Skip R-14 for yen invoices.', 'Mark R-14 `[met]` for the other currencies.'), ans: 'B' },
  { id: '23n', rules: [23], kind: 'near', text: 'R-15 is clear and you can meet it, though it takes more work than you expected.', opts: O('Tell ARCH, naming R-15.', 'Simplify R-15 to what is quick to build.', 'Meet R-15.', 'Leave R-15 for a later job.'), ans: 'C' },
  { id: '24a', rules: [24], kind: 'apply', text: 'After an interface change ARCH agreed, a test in module `ledger` fails because it expects your function\'s old behaviour.', opts: O('Update `ledger`\'s test to the new behaviour.', 'Leave `ledger`\'s tests alone and tell ARCH.', 'Revert your change.', 'Mark that `ledger` test to be skipped.'), ans: 'B' },
  { id: '24n', rules: [24], kind: 'near', text: 'You want to read `ledger`\'s tests to see how `ledger` calls your module.', opts: O('Read them.', 'Do not: you never touch another module\'s tests.', 'Ask ARCH for permission first.', 'Copy them into your module first.'), ans: 'A' },
  { id: '25a', rules: [25], kind: 'apply', text: '`results` shows one failing test, and it is in `mailer`\'s tests, not yours.', opts: O('Fix `mailer`\'s test.', 'Run `results` once more; if it still fails, tell ARCH, naming the failing test.', 'Send ARCH your tests-pass message, since your tests pass.', 'Keep re-running `results` until it passes.'), ans: 'B' },
  { id: '25n', rules: [25], kind: 'near', text: '`results` shows one failing test, in your own module, caused by a bug in your code.', opts: O('Run `results` once more before doing anything.', 'Tell ARCH, naming the failing test.', 'Fix your code.', 'Ignore it.'), ans: 'C' },
  { id: '26a', rules: [26], kind: 'apply', text: 'A test needs the payment service\'s API key, which you have in your environment.', opts: O('Paste the key into the test file.', 'Refer to the key by its name in the process config, never its value.', 'Put the key in the commit message so others can find it.', 'Send the key to ARCH in a message.'), ans: 'B' },
  { id: '26n', rules: [26], kind: 'near', text: 'A test needs the payment service\'s public base address, which is published and is not a secret.', opts: O('Do not write it: treat it as a secret.', 'Write it in the test.', 'Ask ARCH to store it as a secret.', 'Encrypt it in the test.'), ans: 'B' },
  { id: '27a', rules: [27], kind: 'apply', text: 'R-21 says totals are rounded to cents internally; nothing about it shows on screen. You are deciding how to prove it.', opts: O('Write a walk step for it.', 'Prove it with tests alone.', 'Prove it with both a walk step and tests.', 'Leave it unproven.'), ans: 'B' },
  { id: '27n', rules: [27], kind: 'near', text: 'R-20 says the invoice shows the customer\'s name in its header, on screen. You want a walk step for it.', opts: O('Do not: requirements are proved by tests alone.', 'Write the walk step, naming R-20.', 'Ask a lane to write it.', 'Write a test instead and drop the walk step.'), ans: 'B' },
  { id: '28a', rules: [28], kind: 'apply', text: 'You would like to add the outside package `dayjs` to handle dates.', opts: O('Add it: it is widely used.', 'Copy its source into your module instead.', 'Do not add it without ARCH\'s written agreement.', 'Ask a lane whether to add it.'), ans: 'C' },
  { id: '28n', rules: [28], kind: 'near', text: 'You want to use Node\'s built-in `fs` module, which needs no package.', opts: O('Use it.', 'First get ARCH\'s written agreement.', 'Avoid it and write your own file reading.', 'Ask the coordinator.'), ans: 'A' },
  { id: '29a', rules: [29], kind: 'apply', text: 'You are a told job. The notice\'s uses name the entry `ledger.listEvents`. Before deciding what to check, what do you read?', opts: O('Every entry of `ledger`.', 'Only the entry `ledger.listEvents`.', 'Nothing: go straight to the tests.', 'All entries of every module you use.'), ans: 'B' },
  { id: '29n', rules: [29], kind: 'near', text: 'You are an ordinary job, not a told one; no notice started you.', opts: O('Look for the notice first, and read only the entries it names.', 'Stop: without a notice you cannot decide what to check.', 'Work from your requirements as usual.', 'Ask ARCH for a notice.'), ans: 'C' },
  { id: '30a', rules: [30], kind: 'apply', text: 'Your tests generate sample invoice PDFs each time they run.', opts: O('Write them under `invoices/test/tmp/` and never commit them.', 'Commit them as fixtures.', 'Write them to the repository root.', 'Write them into `ledger/test/`.'), ans: 'A' },
  { id: '30n', rules: [30], kind: 'near', text: 'You hand-write a small fixture file that your tests read; nothing generates it.', opts: O('Put it under `invoices/test/tmp/` and never commit it.', 'Commit it in your module\'s test folder.', 'Do not create it.', 'Generate it at run time instead.'), ans: 'B' },
  { id: '31a', rules: [31], kind: 'apply', text: 'R-8 says an invoice is due in 30 days; R-17 says 14 days. They conflict.', opts: O('Follow R-17, the newer one.', 'Follow R-8, and tell ARCH.', 'Follow neither until ARCH answers.', 'Use 22 days, between the two.'), ans: 'B' },
  { id: '31n', rules: [31], kind: 'near', text: 'R-8 says an invoice is due in 30 days; R-17 adds a late fee after the due date. They do not conflict.', opts: O('Tell ARCH of the conflict.', 'Follow R-8 only.', 'Meet both.', 'Follow R-17 only.'), ans: 'C' },
  { id: '32a', rules: [32], kind: 'apply', text: 'You need to give ARCH a 400-word analysis of a design problem.', opts: O('Send all 400 words in one message.', 'Split it into four messages.', 'Write it to a file in your module\'s folder, and send ARCH a short message naming the file.', 'Leave it out.'), ans: 'C' },
  { id: '32n', rules: [32], kind: 'near', text: 'Your message to ARCH is 60 words long.', opts: O('Send it.', 'Move it into a file and send only the file\'s name.', 'Pad it with detail.', 'Ask ARCH whether it is too long.'), ans: 'A' },
  { id: '33a', rules: [33], kind: 'apply', text: 'You are fixing a bug in `parseInvoice`. `formatInvoice`, which you are not otherwise changing, is badly indented.', opts: O('Reformat `formatInvoice` in the same commit.', 'Reformat it in a separate commit.', 'Leave `formatInvoice` as it is.', 'Tell ARCH about the indentation.'), ans: 'C' },
  { id: '33n', rules: [33], kind: 'near', text: 'The lines of `parseInvoice` you are changing are badly indented.', opts: O('Leave them badly indented.', 'Format the lines you change properly.', 'Reformat the whole module.', 'Ask ARCH.'), ans: 'B' },
  { id: '34a', rules: [34], kind: 'apply', text: 'You are a told job, your change is made and pushed, and you are about to run `ready`.', opts: O('Run `ready` now.', 'Run the whole test suite first.', 'Run `related` first, and name the tests it lists in your message to ARCH.', 'Ask ARCH which tests to run.'), ans: 'C' },
  { id: '34n', rules: [34], kind: 'near', text: 'You are an ordinary job, your change is made and pushed, and you are about to run `ready`.', opts: O('Run `ready`.', 'Run `related` first, and name the tests it lists to ARCH.', 'Ask ARCH whether to run `related`.', 'Wait for a notice.'), ans: 'A' },
  { id: '35a', rules: [35], kind: 'apply', text: '`push` is refused because the branch has moved on since you fetched it.', opts: O('Rebase onto the moved branch, then push.', 'Force the push.', 'Fetch and merge the branch, then push.', 'Start a new branch.'), ans: 'C' },
  { id: '35n', rules: [35], kind: 'near', text: '`push` is refused by the permission checker; the branch has not moved.', opts: O('Fetch and merge the branch, then push again.', 'Do not reword or hand it on; carry on with what you can do.', 'Force the push.', 'Rebase, then push.'), ans: 'B' },
  { id: '36a', rules: [36], kind: 'apply', text: 'Your function must report "invoice not found" to its caller.', opts: O('Throw the string "invoice not found".', 'Return null.', 'Return an error carrying a code from `invoices/errors.js`.', 'Log it and return nothing.'), ans: 'C' },
  { id: '36n', rules: [36], kind: 'near', text: 'You add a debug log line inside a function; it is not returned to any caller.', opts: O('Give the log line a code from `invoices/errors.js`.', 'Write the log line normally.', 'Turn it into a returned error.', 'Ask ARCH.'), ans: 'B' },
  { id: '37a', rules: [37], kind: 'apply', text: 'An event happened at 9:00 in the morning, Pacific time. You are storing its time.', opts: O('Store it as 9:00 Pacific.', 'Store it in UTC.', 'Store it as the text "9am PT".', 'Store both times.'), ans: 'B' },
  { id: '37n', rules: [37], kind: 'near', text: 'You are showing a stored time to a customer in the Pacific time zone.', opts: O('Show it in UTC.', 'Convert it to Pacific time for display.', 'Show both.', 'Store it again in Pacific time.'), ans: 'B' },
  { id: '38a', rules: [38], kind: 'apply', text: 'The owner comments on your pull request: "Why did rounding change?"', opts: O('Answer the owner on the pull request.', 'Pass the question to ARCH without answering it.', 'Ignore it.', 'Ask the coordinator to answer.'), ans: 'B' },
  { id: '38n', rules: [38], kind: 'near', text: 'ARCH asks you on your pull request: "Why did rounding change?"', opts: O('Pass the question to ARCH unanswered.', 'Answer ARCH.', 'Ignore it.', 'Ask the owner to answer.'), ans: 'B' },
  { id: '39a', rules: [39], kind: 'apply', text: 'Your third refusal in a row has just come, so you stop.', opts: O('Your last act is to message ARCH.', 'Your last act is `push`.', 'Just stop; there is nothing more to do.', 'Delete your branch.'), ans: 'B' },
  { id: '39n', rules: [39], kind: 'near', text: 'You pause for a moment to think about the next function; you are not stopping.', opts: O('`push` now, since you are pausing.', 'Carry on working.', 'Tell ARCH you are pausing.', 'End your turn.'), ans: 'B' },
  { id: '40a', rules: [40], kind: 'apply', text: 'You have met R-1 to R-5 and would like R-6 reviewed on its own.', opts: O('Open a second pull request for R-6.', 'Put R-6 on #212 with the rest.', 'Ask a lane to open one.', 'Leave R-6 for later.'), ans: 'B' },
  { id: '40n', rules: [40], kind: 'near', text: 'You have more commits for your work.', opts: O('Open a new pull request for them.', 'Push them to your branch, `job/invoices/7`, on #212.', 'Hold them until ARCH asks.', 'Squash them into one new pull request.'), ans: 'B' },
  { id: 'J6', rules: [22, 26], kind: 'joint', text: '`check` reports that a test in your module holds the payment API key\'s value written out.', opts: O('Push anyway: it is only a test.', 'Replace the value with the key\'s name from the process config, then push.', 'Move the value into the commit message.', 'Disable `check` for that file.'), ans: 'B' },
  { id: 'J7', rules: [21, 32], kind: 'joint', text: 'You must tell ARCH about a 300-word finding.', opts: O('Send the 300 words, naming your branch and pull request.', 'Write the finding to a file in your folder; send ARCH a short message naming the file, your branch and your pull request.', 'Send a short message naming the file only.', 'Send it to the coordinator.'), ans: 'B' },
  { id: 'N4', rules: [], kind: 'neg', text: 'You must choose a name for a local variable inside a function you are writing.', opts: O('Ask ARCH to approve the name.', 'No rule applies: name it clearly and carry on.', 'Record the name in the shared state.', 'Run `listing` first.'), ans: 'B' },
  { id: 'N5', rules: [], kind: 'neg', text: 'You want to add a code comment explaining a tricky calculation in a function you are changing.', opts: O('Tell ARCH first.', 'Put the comment in a separate pull request.', 'No rule applies: add it.', 'Run `check` before writing it.'), ans: 'C' },
];

// More neutral background: no obligations on the session.
const MORE = [
  'Invoices are numbered in one series per firm. A number is never reused, even when an invoice is cancelled; a cancelled invoice keeps its number and is shown with a line through it.',
  'Each firm chooses one currency when it signs up. A few firms bill in two currencies; for them the module keeps two series of numbers, one for each currency.',
  'The `ledger` module stores billable events as they arrive. Each event has a start, an end, a person, a rate and a short note written by the person who did the work.',
  'The `mailer` module sends each finished invoice as a PDF attached to an email. It retries a failed send three times over an hour, then marks the invoice as unsent.',
  'Firms can add their own logo and a line of text to the foot of every invoice. The logo is stored once and drawn at the same size on every page.',
  'Taxes differ by region. The module reads the rate for each region from a table kept by the `tax` module, and shows the tax as one line under the subtotal.',
  'Discounts are given as a percentage of the subtotal or as a fixed amount. A discount is shown as its own line, and the tax is worked out after it.',
  'Some firms bill in advance for a fixed monthly fee and in arrears for extra hours. Their invoices carry two groups of lines, one for each kind of charge.',
  'The module was first written for a single firm and was opened to others a year later. Several of its older functions still carry names from that time.',
  'The busiest day of the month is the first, when most invoices are made at once. On that day the module makes about four thousand invoices in two hours.',
  'Customers can ask for a copy of any past invoice. A copy is made again from the stored lines, not from a saved PDF, and is marked as a copy.',
  'A credit note undoes part or all of an invoice. It has its own number in a separate series and names the invoice it credits.',
  'Rounding is done once per line and again on the total. The difference between the sum of rounded lines and the rounded total is never more than one unit.',
  'Dates on an invoice are shown in the firm\'s own time zone. The month a line falls in is decided by the time zone of the person who did the work.',
  'The PDF layout has a header, a table of lines, a block of totals and a foot. Long invoices run onto further pages, each with the header repeated.',
  'Firms can preview an invoice before it is sent. A preview is made the same way as the real invoice but carries no number and is not stored.',
  'Support staff see a list of each firm\'s invoices with their state: draft, sent, paid, overdue or cancelled. Paid and overdue come from the `payments` module.',
  'The module\'s largest file holds the code that groups events into lines. It is about nine hundred lines long and has the most tests of any file.',
  'Most of the module\'s tests run in under a second each. The slowest build whole PDFs, and take about four seconds each.',
  'An earlier version stored amounts as decimal numbers. They were changed to whole numbers of the smallest unit two releases ago, and old records were converted then.',
];
export const BACKGROUND = [...BG8, ...MORE];
const SUBJ = ['totals', 'dates', 'rounding', 'taxes', 'discounts', 'credit notes', 'numbering', 'currencies', 'layout', 'copies', 'previews', 'cancelled events'];
function reqTable(n, R) {
  let t = '| Requirement | Concerns | Summary |\n|---|---|---|\n';
  for (let i = 1; i <= n; i++) { const s = SUBJ[Math.floor(R() * SUBJ.length)]; t += `| R-${i} | ${s} | ${MORE[Math.floor(R() * MORE.length)].split('. ')[0]}. |\n`; }
  return t;
}

// Role text with K rules at about `target` bytes. Background (prose, then a requirements summary
// table if needed) pads to the target. Probes: 3 fixed (identity, acts, after the rules) plus 3 in
// the background when there is one (its start, middle, end).
export function roleText2(K, target, seed) {
  const R = rng(seed * 9173 + K * 37 + target);
  const pr = makeProbes(R, 6, 2);
  const ps = pr.slice(0, 6).map(p => `The ${p.attr} for the ${p.subject} is ${p.code}.`);
  const rules = '## Rules\n' + RULES.slice(0, K).map((r, i) => `${i + 1}. ${r}`).join('\n') + '\n';
  const pre = PREAMBLE(ps[0], ps[1]); const tail = `\n${ps[2]}\n`;
  const fixed = Buffer.byteLength(pre + '\n' + rules + tail);
  let room = target - fixed - 30; const paras = []; const pool = shuffle(BACKGROUND, R); let i = 0;
  while (i < pool.length && room - Buffer.byteLength(pool[i]) - 2 > 0) { paras.push(pool[i]); room -= Buffer.byteLength(pool[i]) + 2; i++; }
  let table = '';
  if (room > 400) { let n = 1; while (Buffer.byteLength(reqTable(n + 1, rng(seed + 5))) < room - 60) n++; table = '\n### Requirements in brief\n' + reqTable(n, rng(seed + 5)); }
  let used = [];
  if (paras.length >= 3) { // plant 3 more probes in the background
    const at = [0, Math.floor(paras.length / 2), paras.length - 1];
    at.forEach((k, j) => { paras[k] = paras[k] + ' ' + ps[3 + j]; }); used = [0, 1, 2, 3, 4, 5];
  } else used = [0, 1, 2];
  const bg = paras.length || table ? '\n## About the module\n' + paras.join('\n\n') + '\n' + table : '';
  let t = pre + bg + '\n' + rules + tail;
  t = t.replace('<LINES>', String(t.split('\n').length - 1));
  const probes = [...used.map(k => pr[k]), pr[6], pr[7]];
  return { text: t, bytes: Buffer.byteLength(t), K, singleRules: SINGLE.slice(0, K).reduce((a, b) => a + b, 0), probes };
}

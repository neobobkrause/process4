import fs from 'node:fs';
const FILL = new URL('../fillsrc', import.meta.url).pathname;
// Value 3, discriminating battery. Each rule carries an arbitrary specific (whom, threshold, flag,
// folder ...) drawn per trial, so the right act depends on what this text said, not on priors.
// Each rule: text(p), apply(p) and near(p) scenarios -> { text, opts: [4], ans: index }.
import { rng, shuffle, makeProbes } from './gen.mjs';
import { PREAMBLE } from './battery.mjs';
import { BACKGROUND } from './battery2.mjs';

const pick = (R, a) => a[Math.floor(R() * a.length)];
const WHO = ['ARCH', 'the coordinator', 'ROOT', 'the watcher'];
const sc = (text, opts, ans) => ({ text, opts, ans });

export const RULEDEFS = [
  { // 1
    choices: WHO, text: p => `A flaw you find in another module goes to ${p}, in one message; you never fix it yourself.`,
    apply: p => sc('You find that module `ledger` (not yours) rounds currency wrongly. Whom do you tell?', WHO.map(w => `Tell ${w}, in one message.`), WHO.indexOf(p)),
    near: p => sc('You find a rounding flaw in your own module\'s code.', ['Fix it yourself.', 'Tell another session, in one message.', 'Leave it.', 'Report it as a process fault.'], 0) },
  { // 2
    choices: ['before', 'after'], text: p => `If the module has no structured comments yet, add them as a step of their own, ${p} your first code change, describing the module as it stands then.`,
    apply: p => sc('Your module has no structured comments. Your work is to fix a date-parsing bug. In what order do you work?', ['Add the comments as their own step, then fix the bug.', 'Fix the bug, then add the comments as their own step.', 'Fix the bug and add the comments in the same step.', 'Fix the bug and leave the comments for a later job.'], p === 'before' ? 0 : 1),
    near: p => sc('Your module already has complete structured comments. Your work is to fix a date-parsing bug.', ['Go straight to the bug.', 'Rewrite the comments first, as their own step.', 'Rewrite the comments after the fix, as their own step.', 'Delete the comments and regenerate them.'], 0) },
  { // 3
    choices: [2, 3, 4, 5], text: p => `A refused act is never reworded or handed on; ${['', '', 'two', 'three', 'four', 'five'][p]} refusals in a row stop you.`,
    apply: p => sc(`The permission checker has just refused your ${['', '', 'second', 'third', 'fourth', 'fifth'][p]} act in a row.`, ['Stop.', 'Reword the act and try again.', 'Carry on with other work.', 'Ask another session to run it.'], 0),
    near: p => sc(`The permission checker has just refused your ${['', 'first', 'second', 'third', 'fourth', 'fifth'][p - 1]} act in a row.`, ['Stop.', 'Reword the act and try again.', 'Do not reword it or hand it on; carry on with other work.', 'Ask another session to run it.'], 2) },
  { // 4
    choices: [30, 40, 50, 60], text: p => `At ${p} percent of your context: \`push\`, tell ARCH in one message, and stop.`,
    apply: p => sc(`Your context is at ${p + 3} percent; work remains that you could do.`, ['Keep working.', '`push`, tell ARCH in one message, and stop.', 'Start your own replacement.', 'Compact your context and carry on.'], 1),
    near: p => sc(`Your context is at ${p - 6} percent; work remains that you could do.`, ['Keep working.', '`push`, tell ARCH in one message, and stop.', 'Start your own replacement.', 'Compact your context and carry on.'], 0) },
  { // 5
    choices: ['--blocked', '--waiting', '--held', '--stuck'], text: p => `If another module's flaw stops you: report it, \`push ${p} <module> "<why>"\`, and stop.`,
    apply: p => sc('A flaw in `ledger` stops your work, and you have reported it. Which command do you run before stopping?', ['--blocked', '--waiting', '--held', '--stuck'].map(f => `\`push ${f} ledger "<why>"\``), ['--blocked', '--waiting', '--held', '--stuck'].indexOf(p)),
    near: p => sc('`ledger` is slow, but your module can still be finished correctly.', ['Report the slowness, and finish your work.', '`push` with your blocked flag, and stop.', 'Speed up `ledger` yourself.', 'Stop and wait for `ledger`.'], 0) },
  { // 6
    choices: ['--nothing-to-change', '--no-change', '--unchanged', '--noop'], text: p => `A told job checks only the changed parts. If nothing needs changing, run no test and \`close ${p}\`.`,
    apply: p => sc('You are a told job and nothing in your module needs changing. Which command do you run?', ['--nothing-to-change', '--no-change', '--unchanged', '--noop'].map(f => `\`close ${f}\``), ['--nothing-to-change', '--no-change', '--unchanged', '--noop'].indexOf(p)),
    near: p => sc('You are a told job, and the changed part of your module does need a change.', ['Make the change, checking only the changed parts.', '`close` with your nothing-to-change flag.', 'Re-check every function in the module.', 'Hand it back to ARCH.'], 0) },
  { // 7
    choices: ['ARCH', 'the coordinator', 'PROCESS', 'ROOT'], text: p => `A process fault you meet goes to ${p}, written once. Do not fix it or work round it.`,
    apply: p => sc('`p4 results` prints the wrong field: a fault in the process\'s tool. Whom do you tell?', ['ARCH', 'the coordinator', 'PROCESS', 'ROOT'].map(w => `Tell ${w}, once, in writing.`), ['ARCH', 'the coordinator', 'PROCESS', 'ROOT'].indexOf(p)),
    near: p => sc('A bug in your own module\'s code makes one of your own tests fail.', ['Fix the bug.', 'Report it as a process fault.', 'Work round it in the test.', 'Stop.'], 0) },
  { // 8
    choices: WHO, text: p => `Never merge; ${p} merges your pull request.`,
    apply: p => sc('All your pull request\'s checks pass and your work is done. Who merges it?', [`You do.`, ...WHO.filter(w => w !== p).slice(0, 2), p].map((w, i) => i === 0 ? w : `${w[0].toUpperCase() + w.slice(1)} does.`), 3),
    near: p => sc('Your pull request\'s checks fail because of your own mistake.', ['Fix the failure.', 'Ask for it to be merged anyway.', 'Merge it yourself.', 'Close it.'], 0) },
  { // 9
    choices: ['a passing test names it', 'ARCH says so', 'the internal walk passes', 'it is merged'], text: p => `Mark a requirement \`[met]\` only when ${p}.`,
    apply: p => { const conds = { 'a passing test names it': 'A test naming R-3 now passes.', 'ARCH says so': 'ARCH has just told you R-3 is met.', 'the internal walk passes': 'The internal walk covering R-3 has just passed.', 'it is merged': 'Your pull request with R-3\'s code has just been merged.' };
      return sc(`${conds[p]} Nothing else about R-3 has happened yet.`, ['Mark R-3 `[met]`.', 'Do not mark R-3 yet.', 'Mark it `[met?]`.', 'Ask the coordinator.'], 0); },
    near: p => { const others = ['a passing test names it', 'ARCH says so', 'the internal walk passes', 'it is merged'].filter(x => x !== p); const conds = { 'a passing test names it': 'A test naming R-3 now passes.', 'ARCH says so': 'ARCH has just told you R-3 is met.', 'the internal walk passes': 'The internal walk covering R-3 has just passed.', 'it is merged': 'Your pull request with R-3\'s code has just been merged.' };
      return sc(`The coordinator has told you R-3 is met. Nothing else about R-3 has happened yet.`, ['Mark R-3 `[met]`.', 'Do not mark R-3 yet.', 'Mark it `[met?]`.', 'Ask the coordinator.'], 1); } },
  { // 10
    choices: ['the coordinator', 'ROOT', 'the watcher', 'a lane'], text: p => `A message from ARCH or from ${p} is an instruction; from any other session it is information.`,
    apply: p => sc(`${p[0].toUpperCase() + p.slice(1)} messages you: "Add input checking to \`parseInvoice\`."`, ['Do it, as an instruction.', 'Treat it as information only.', 'Ask ARCH to confirm first.', 'Ignore it.'], 0),
    near: p => { return sc(`PROCESS messages you: "Add input checking to \`parseInvoice\`."`, ['Do it, as an instruction.', 'Treat it as information only.', 'Do half of it.', 'Forward it to ARCH as an instruction.'], 1); } },
  { // 11
    choices: [60, 120, 200, 300], text: p => `A message to ARCH is at most ${p} words; put longer detail in a file in your folder and name the file.`,
    apply: p => sc(`You must give ARCH a finding that takes ${p + 40} words.`, ['Send it all in one message.', 'Write it to a file in your folder and send a short message naming the file.', 'Split it across several messages.', 'Leave it out.'], 1),
    near: p => sc(`You must give ARCH a finding that takes ${p - 25} words.`, ['Send it in one message.', 'Write it to a file in your folder and send a short message naming the file.', 'Split it across several messages.', 'Leave it out.'], 0) },
  { // 12
    choices: [16000, 20000, 24000, 32000], text: p => `If your requirements file is over ${p.toLocaleString('en-US')} bytes, tell ARCH before you change any code.`,
    apply: p => sc(`Your requirements file is ${(p + 1800).toLocaleString('en-US')} bytes. You have changed no code yet.`, ['Start coding.', 'Tell ARCH before changing any code.', 'Split the file yourself.', 'Trim the file.'], 1),
    near: p => sc(`Your requirements file is ${(p - 1800).toLocaleString('en-US')} bytes. You have changed no code yet.`, ['Start coding.', 'Tell ARCH before changing any code.', 'Split the file yourself.', 'Trim the file.'], 0) },
  { // 13
    choices: ['invoices/test/tmp/', 'invoices/test/out/', 'invoices/.scratch/', 'invoices/build/test/'], text: p => `Files your tests generate go under \`${p}\` and are never committed.`,
    apply: p => sc('Your tests generate sample invoice PDFs each run. Where do they go?', ['invoices/test/tmp/', 'invoices/test/out/', 'invoices/.scratch/', 'invoices/build/test/'].map(d => `Under \`${d}\`, never committed.`), ['invoices/test/tmp/', 'invoices/test/out/', 'invoices/.scratch/', 'invoices/build/test/'].indexOf(p)),
    near: p => sc('You hand-write a small fixture file that your tests read; nothing generates it.', ['Commit it in `invoices/test/fixtures/`.', 'Put it in the folder for generated files, never committed.', 'Do not create it.', 'Generate it at run time instead.'], 0) },
  { // 14
    choices: ['check', 'listing', 'related', 'results'], text: p => `Before every \`push\`, run \`${p}\` and fix what it reports in your module.`,
    apply: p => sc('Your change is finished. What do you run just before `push`?', ['check', 'listing', 'related', 'results'].map(c => `\`p4 ${c}\``), ['check', 'listing', 'related', 'results'].indexOf(p)),
    near: p => sc('You have pushed, and are about to run `ready`.', ['Run `ready`.', 'Run your pre-push command first.', 'Ask ARCH first.', 'Push again first.'], 0) },
  { // 15
    choices: ['merge the branch', 'rebase onto the branch', 'reset to the branch and reapply your commits', 'start a new branch from it'], text: p => `If \`push\` is refused because the branch has moved, fetch and ${p}, then push.`,
    apply: p => sc('`push` is refused because the branch has moved since you fetched it.', ['merge the branch', 'rebase onto the branch', 'reset to the branch and reapply your commits', 'start a new branch from it'].map(x => `Fetch and ${x}, then push.`), ['merge the branch', 'rebase onto the branch', 'reset to the branch and reapply your commits', 'start a new branch from it'].indexOf(p)),
    near: p => sc('`push` is refused by the permission checker; the branch has not moved.', ['Fetch the branch and integrate it, then push.', 'Do not reword it or hand it on; carry on with other work.', 'Force the push.', 'Push from a new branch.'], 1) },
  { // 16
    choices: WHO, text: p => `Add no dependency on an outside package without ${p.replace(/^the /, 'the ')}'s written agreement.`.replace("ARCH's", "ARCH's"),
    apply: p => sc('You would like to add the outside package `dayjs`. Whose written agreement do you need?', WHO.map(w => `${w[0].toUpperCase() + w.slice(1)}'s.`), WHO.indexOf(p)),
    near: p => sc('You want to use Node\'s built-in `fs` module, which needs no package.', ['Use it.', 'First get written agreement.', 'Write your own file reading.', 'Ask the owner.'], 0) },
  { // 17
    choices: ['lower', 'higher'], text: p => `If two requirements conflict, follow the ${p}-numbered one and tell ARCH.`,
    apply: p => sc('R-8 says an invoice is due in 30 days; R-17 says 14 days. They conflict.', ['Follow R-8, and tell ARCH.', 'Follow R-17, and tell ARCH.', 'Follow neither until ARCH answers.', 'Use 22 days.'], p === 'lower' ? 0 : 1),
    near: p => sc('R-8 says an invoice is due in 30 days; R-17 adds a late fee after the due date. They do not conflict.', ['Meet both.', 'Follow R-8 only, and tell ARCH.', 'Follow R-17 only, and tell ARCH.', 'Tell ARCH of a conflict and wait.'], 0) },
  { // 18
    choices: ['invoices/errors.js', 'invoices/codes.js', 'common/errors.js', 'invoices/errors.json'], text: p => `Every error your module returns carries a code from \`${p}\`; never a bare string.`,
    apply: p => sc('Your function must report "invoice not found" to its caller. Where does the error\'s code come from?', ['invoices/errors.js', 'invoices/codes.js', 'common/errors.js', 'invoices/errors.json'].map(f => `\`${f}\`.`), ['invoices/errors.js', 'invoices/codes.js', 'common/errors.js', 'invoices/errors.json'].indexOf(p)),
    near: p => sc('You add a debug log line inside a function; it is not returned to any caller.', ['Write the log line normally.', 'Give it an error code.', 'Turn it into a returned error.', 'Ask ARCH.'], 0) },
  { // 19
    choices: WHO, text: p => `A question from the owner on your pull request goes to ${p}, unanswered; do not answer the owner yourself.`,
    apply: p => sc('The owner comments on your pull request: "Why did rounding change?"', ['Answer the owner yourself.', ...WHO.map(w => `Pass it to ${w}, unanswered.`)].filter((x, i) => i === 0 || WHO[i - 1] !== WHO.filter(w => w !== p)[2]).slice(0, 4), -1),
    near: p => sc('ARCH asks you on your pull request: "Why did rounding change?"', ['Answer ARCH.', 'Pass it on, unanswered.', 'Ignore it.', 'Ask the owner.'], 0) },
  { // 20
    choices: ['push', 'ready', 'results', 'check'], text: p => `Whenever you stop, for any reason, your last act is \`${p}\`.`,
    apply: p => sc('You are stopping. What is your last act?', ['push', 'ready', 'results', 'check'].map(c => `\`p4 ${c}\``), ['push', 'ready', 'results', 'check'].indexOf(p)),
    near: p => sc('You pause a moment to think about the next function; you are not stopping.', ['Carry on working.', 'Run your last-act command now.', 'Tell ARCH you are pausing.', 'End your turn.'], 0) },
  { // 21
    choices: WHO, text: p => `Never delete or skip a failing test: fix the code, or tell ${p} the test is wrong.`,
    apply: p => sc('A test in your module fails; you are sure your code is right and the test wrong.', ['Delete the test.', ...WHO.filter(w => w !== p).slice(0, 2).map(w => `Tell ${w} the test is wrong.`), `Tell ${p} the test is wrong.`], 3),
    near: p => sc('A test in your module fails because of a bug in your code.', ['Fix the code.', 'Report that the test is wrong.', 'Skip the test.', 'Delete the test.'], 0) },
  { // 22
    choices: ['your branch and pull request', 'your module and pull request', 'your branch and module', 'the requirement numbers concerned'], text: p => `Name ${p} in every message to ARCH.`,
    apply: p => sc('You are writing ARCH your message that the tests pass. Besides that, what must it name?', ['your branch and pull request', 'your module and pull request', 'your branch and module', 'the requirement numbers concerned'].map(x => x[0].toUpperCase() + x.slice(1) + '.'), ['your branch and pull request', 'your module and pull request', 'your branch and module', 'the requirement numbers concerned'].indexOf(p)),
    near: p => sc('You are writing a commit message for a bug fix (not a message to ARCH).', ['An ordinary commit message describing the fix.', 'One naming what your rules require in messages to ARCH.', 'An empty message.', 'Ask ARCH what to write.'], 0) },
  { // 23
    choices: ['can be seen on screen', 'involves money', 'involves a date', 'is marked [walk]'], text: p => `Prove a requirement with a walk step only if it ${p}; prove every other one with tests alone.`,
    apply: p => sc('Which one of these requirements do you prove with a walk step?', ['R-20: the customer\'s name is shown in the invoice header.', 'R-21: an internal cache entry expires (it does not show on screen and is not marked).', 'R-22: the due date of an invoice is stored (it does not show on screen and is not marked).', 'R-23 [walk]: an internal counter is reset (it does not show on screen).'].map((x, i) => i === 1 ? 'R-21: amounts held internally are summed to whole cents (not shown on screen, not marked).' : x),
      ['can be seen on screen', 'involves money', 'involves a date', 'is marked [walk]'].indexOf(p)),
    near: p => sc('R-24: an internal log file is rotated daily (it shows nothing on screen, involves no money or date, and is not marked). How do you prove it?', ['With tests alone.', 'With a walk step.', 'With both.', 'Leave it unproven.'], 0) },
  { // 24
    choices: ['included', 'excluded'], text: p => `The module's declared uses match its imports, its test files ${p}. Remove a declared use that no counted code makes.`,
    apply: p => sc('Only your module\'s test files import the module `fixtures`; its other code does not. The entry declares only `ledger`.', ['Add `fixtures` to the declared uses.', 'Leave the declared uses as they are.', 'Remove `ledger`.', 'Remove the import from the tests.'], p === 'included' ? 0 : 1),
    near: p => sc('No code in your module imports `mailer` any more, tests included, but the entry declares it.', ['Remove `mailer` from the declared uses.', 'Leave it.', 'Add an import of `mailer`.', 'Ask `mailer`\'s job.'], 0) },
  { // 25
    choices: [80, 100, 120, 140], text: p => `In code you change, wrap any line longer than ${p} characters.`,
    apply: p => sc(`You are changing a line of code that is ${p + 9} characters long.`, ['Wrap it.', 'Leave its length as it is.', 'Wrap every line in the file.', 'Ask ARCH.'], 0),
    near: p => sc(`You are changing a line of code that is ${p - 12} characters long.`, ['Wrap it.', 'Leave its length as it is.', 'Wrap every line in the file.', 'Ask ARCH.'], 1) },
  { // 26
    choices: ["the notice's uses", 'your job block', "ARCH's message", '`listing`'], text: p => `On a told job, read only the entries named by ${p} before deciding what to check.`,
    apply: p => sc('You are a told job. Which entries do you read before deciding what to check?', ["Those the notice's uses name.", 'Those your job block names.', "Those ARCH's message names.", 'Those `listing` names.'], ["the notice's uses", 'your job block', "ARCH's message", '`listing`'].indexOf(p)),
    near: p => sc('You are an ordinary job; no notice started you.', ['Work from your requirements as usual.', 'Read only the entries your told-job rule names.', 'Stop until a notice comes.', 'Ask ARCH for a notice.'], 0) },
  { // 27
    choices: ['related', 'listing', 'check', 'results'], text: p => `On a told job, run \`${p}\` before \`ready\`, and name the tests it lists in your message to ARCH.`,
    apply: p => sc('You are a told job about to run `ready`. What do you run first?', ['related', 'listing', 'check', 'results'].map(c => `\`p4 ${c}\``), ['related', 'listing', 'check', 'results'].indexOf(p)),
    near: p => sc('You are an ordinary job about to run `ready`.', ['Run `ready`.', 'Run your told-job command first and name its tests to ARCH.', 'Ask ARCH.', 'Wait for a notice.'], 0) },
  { // 28
    choices: ['UTC', "the firm's time zone", "the customer's time zone", "the server's local time"], text: p => `Store every date and time in ${p}; convert only when displaying.`,
    apply: p => sc('An event happened at 9:00 in the morning. In what time do you store it?', ['In UTC.', "In the firm's time zone.", "In the customer's time zone.", "In the server's local time."], ['UTC', "the firm's time zone", "the customer's time zone", "the server's local time"].indexOf(p)),
    near: p => sc('You store how long an event lasted: 90 minutes.', ['Store it as a duration of 90 minutes.', 'Convert it to your storage time first.', 'Store start and end only.', 'Store it as text.'], 0) },
  { // 29
    choices: ['whole numbers of the smallest unit', 'decimal strings', 'whole numbers of thousandths of the main unit', 'pairs of main and smallest units'], text: p => `Hold every amount of money as ${p}.`,
    apply: p => sc('You store a line amount of 12.50 dollars. In what form?', ['As 1250 (whole cents).', 'As the string "12.50".', 'As 12500 (thousandths).', 'As the pair (12, 50).'], ['whole numbers of the smallest unit', 'decimal strings', 'whole numbers of thousandths of the main unit', 'pairs of main and smallest units'].indexOf(p)),
    near: p => sc('You store how many hours a person worked: 7.5 hours (not money).', ['Store it as you would any quantity.', 'Store it in your money form.', 'Store it in cents.', 'Do not store it.'], 0) },
  { // 30
    choices: [1, 2, 3, 4], text: p => `Start workers inside yourself, at most ${['', 'one', 'two', 'three', 'four'][p]} at a time; never start a session.`,
    apply: p => sc(`${['', 'One worker', 'Two workers', 'Three workers', 'Four workers'][p]} you started ${p === 1 ? 'is' : 'are'} running. You want another.`, ['Wait until one finishes.', 'Start another worker now.', 'Start a session instead.', 'Ask ARCH to start one.'], 0),
    near: p => sc(`${['No worker', 'No worker', 'One worker', 'Two workers', 'Three workers'][p]} you started ${p <= 2 ? 'is' : 'are'} running. You want another.`, ['Wait until one finishes.', 'Start another worker now.', 'Start a session instead.', 'Ask ARCH to start one.'], 1) },
];
// rule 19 apply: build properly (the generic filter above is awkward)
RULEDEFS[18].apply = p => { const others = WHO.filter(w => w !== p).slice(0, 2); return sc('The owner comments on your pull request: "Why did rounding change?"', ['Answer the owner yourself.', ...others.map(w => `Pass it to ${w}, unanswered.`), `Pass it to ${p}, unanswered.`], 3); };
RULEDEFS[15].text = p => `Add no dependency on an outside package without the written agreement of ${p}.`;

export const NEG = [
  sc('Writing your module\'s code, you must choose between two equally correct ways to sort invoice lines.', ['Tell ARCH before choosing.', 'Stop and wait for instructions.', 'No rule applies: choose one and carry on.', 'Report it as a process fault.'], 2),
  sc('A sentence in your requirements file has a typo, "teh" for "the"; its meaning is plain.', ['No rule applies: read it as "the" and carry on.', 'Report it to ARCH as a flaw.', 'Stop until the file is corrected.', 'Push as blocked, naming the file.'], 0),
  sc('You must choose a name for a local variable inside a function you are writing.', ['Ask ARCH to approve the name.', 'No rule applies: name it clearly and carry on.', 'Record the name in the shared state.', 'Run `listing` first.'], 1),
];

// Build: params per trial, the role text, and the scenario list with keys.
export function build3(K, target, seed) {
  const R = rng(seed * 7121 + K * 13 + target);
  const params = RULEDEFS.slice(0, K).map(d => pick(R, d.choices));
  const order = shuffle(RULEDEFS.slice(0, K).map((_, i) => i), R); // rule lines in random order in the text
  const ruleLines = order.map((i, n) => ({ rule: i, line: n + 1, text: RULEDEFS[i].text(params[i]) }));
  const pr = makeProbes(R, 6, 2); const ps = pr.slice(0, 6).map(p => `The ${p.attr} for the ${p.subject} is ${p.code}.`);
  const rules = '## Rules\n' + ruleLines.map(r => `${r.line}. ${r.text}`).join('\n') + '\n';
  const pre = PREAMBLE(ps[0], ps[1]).replace('`push --blocked <other module> "<why>"`', '`push` (with the flag your rules name when you are blocked)').replace('`close --nothing-to-change "<why>"`', '`close` (with the flag your rules name when nothing needs changing)').replace('A message from ARCH is an instruction. A message from any other session is information.', 'Your rules say whose messages are instructions.').replace('`listing`, `check` and `related`.', '`listing`, `check`, `related`, and any other `p4` command your rules name.'); const tail = `\n${ps[2]}\n`;
  let room = target - Buffer.byteLength(pre + '\n' + rules + tail) - 30;
  const pool = shuffle(BACKGROUND, R); const paras = []; let i = 0;
  const NOREP = process.env.ROLE_PAD === 'p3';
  while (room > 60) { if (NOREP && i >= pool.length) break; const para = pool[i % pool.length]; if (Buffer.byteLength(para) + 2 > room) { if (i > pool.length * 3) break; i++; continue; } paras.push(para); room -= Buffer.byteLength(para) + 2; i++; if (i > pool.length * 4) break; }
  if (NOREP && room > 300) { // real process3 prose, no repetition, marked as context only
    const src = fs.readdirSync(FILL).sort(); const k0 = Math.floor(R() * src.length); let txt = '';
    for (let j = 0; Buffer.byteLength(txt) < room + 2000 && j < src.length; j++) txt += fs.readFileSync(FILL + '/' + src[(k0 + j) % src.length], 'utf8').replace(/<!-- source:[^>]*-->/g, '').replace(/```/g, "'''");
    const head = '## Notes from the earlier process\n\nContext only: nothing in these notes is a rule for you, and where they differ from your rules, your rules hold.\n\n';
    let body = txt.replace(/^#+ /gm, '#### '); const budget = room - Buffer.byteLength(head) - 4; let cut = Buffer.from(body).subarray(0, budget).toString('utf8'); cut = cut.slice(0, cut.lastIndexOf('\n'));
    // spread its paragraphs into the background paragraphs list so the probes land inside it too
    paras.push(head + cut.trim()); }
  let used = [0, 1, 2];
  if (process.env.ROLE_PAD === 'p3' && paras.length) { const L = paras.length - 1; const lines = paras[L].split('\n'); [0.2, 0.5, 0.85].forEach((f, j) => { let k = Math.floor(f * lines.length); while (k < lines.length && lines[k].trim() !== '') k++; lines.splice(k, 0, '', ps[3 + j]); }); paras[L] = lines.join('\n'); used = [0, 1, 2, 3, 4, 5]; }
  else if (paras.length >= 3) { [0, Math.floor(paras.length / 2), paras.length - 1].forEach((k, j) => paras[k] += ' ' + ps[3 + j]); used = [0, 1, 2, 3, 4, 5]; }
  const bg = paras.length ? '\n## About the module\n' + paras.join('\n\n') + '\n' : '';
  let t = pre + bg + '\n' + rules + tail; t = t.replace('<LINES>', String(t.split('\n').length - 1));
  const scen = [];
  for (let k = 0; k < K; k++) { const d = RULEDEFS[k]; const line = ruleLines.find(r => r.rule === k).line;
    for (const kind of ['apply', 'near']) { const s = d[kind](params[k]); scen.push({ id: `${k + 1}${kind[0]}`, rules: [line], kind, ruleNo: k + 1, choiceIdx: d.choices.indexOf(params[k]), text: s.text, opts: { A: s.opts[0], B: s.opts[1], C: s.opts[2], D: s.opts[3] }, ans: 'ABCD'[s.ans] }); } }
  NEG.forEach((s, j) => scen.push({ id: `N${j + 1}`, rules: [], kind: 'neg', text: s.text, opts: { A: s.opts[0], B: s.opts[1], C: s.opts[2], D: s.opts[3] }, ans: 'ABCD'[s.ans] }));
  return { text: t, bytes: Buffer.byteLength(t), K, params, scen, probes: [...used.map(k => pr[k]), pr[6], pr[7]] };
}

// ---- rules 31-45 (helpers) ----
const cap = s => s[0].toUpperCase() + s.slice(1);
const whoRule = (textf, applyQ, verb, nearQ, nearAns, nearOthers) => ({ choices: WHO, text: textf,
  apply: p => sc(applyQ, WHO.map(w => `${verb} ${w}.`), WHO.indexOf(p)),
  near: p => sc(nearQ, [nearAns, `${verb} another session first.`, ...nearOthers], 0) });
const choiceRule = (choices, textf, applyQ, optf, nearQ, nearAns, nearOthers) => ({ choices, text: textf,
  apply: p => sc(applyQ, choices.map(optf), choices.indexOf(p)),
  near: p => sc(nearQ, [nearAns, 'Apply that rule here as well.', ...nearOthers], 0) });
const thrRule = (choices, textf, sit, actYes, actNo, others, up, down) => ({ choices, text: textf,
  apply: p => sc(sit(up(p)), [actNo, actYes, ...others], 1),
  near: p => sc(sit(down(p)), [actNo, actYes, ...others], 0) });
RULEDEFS.push(
  whoRule(p => `A requirement you cannot meet as written goes to ${p}, with its number; never reinterpret it.`, 'R-14 says amounts are rounded to whole cents, but yen has no cents: you cannot meet R-14 as written. Whom do you tell?', 'Tell', 'R-15 is clear and you can meet it, though it takes more work than you expected.', 'Meet R-15.', ['Simplify R-15.', 'Leave R-15 for later.']),
  whoRule(p => `A security weakness you find in your module goes to ${p} before you fix it.`, 'You find that your module logs customers\' full card numbers: a security weakness. Whom do you tell before fixing it?', 'Tell', 'You find a typo in a code comment in your module.', 'Fix it.', ['Leave it.', 'Report it as a process fault.']),
  choiceRule(['listing', 'related', 'uses', 'check'], p => `To see which modules use yours, run \`p4 ${p}\`.`, 'You want to see which modules use yours. What do you run?', c => `\`p4 ${c}\``, 'You want to see the results of the required run on your pull request.', '`p4 results`', ['Ask ARCH.', 'Run every test locally.']),
  thrRule([40, 60, 80, 100], p => `Split any function longer than ${p} lines before you add to it.`, n => `You need to add code to a function that is ${n} lines long.`, 'Split it first, then add your code.', 'Add your code to it.', ['Rewrite the whole module.', 'Ask ARCH.'], p => p + 12, p => p - 15),
  thrRule([3, 5, 8, 12], p => `If your change touches more than ${p} files, run the module's whole test suite on your machine before pushing.`, n => `Your change touches ${n} files and is ready to push.`, 'Run the whole test suite on your machine first, then push.', 'Push; the run will test it.', ['Ask ARCH to test it.', 'Split the change in two.'], p => p + 2, p => p - 1),
  choiceRule(['*.test.js', '*.spec.js', 'test_*.js', '*_test.js'], p => `Name every test file \`${p}\`.`, 'You are creating the test file for `parseInvoice`. What do you name it?', c => `\`${c.replace('*', 'parseInvoice').replace('_*', '_parseInvoice')}\``, 'You are creating a helper file, not a test, used by your tests.', 'Name it plainly, e.g. `helpers.js`.', ['Ask ARCH.', 'Put it in another module.']),
  choiceRule(['YYYY-MM-DD', 'DD Mon YYYY', 'MM/DD/YYYY', 'Mon DD, YYYY'], p => `In messages and records, write dates as ${p}.`, 'You write the date 5 March 2026 in a message to ARCH. How?', c => ({ 'YYYY-MM-DD': '2026-03-05', 'DD Mon YYYY': '05 Mar 2026', 'MM/DD/YYYY': '03/05/2026', 'Mon DD, YYYY': 'Mar 05, 2026' })[c], 'The invoice PDF shows a customer the date 5 March 2026 in the firm\'s chosen display style.', 'In the firm\'s chosen display style.', ['As a Unix timestamp.', 'Leave the date off.']),
  thrRule([2, 3, 4, 5], p => `When the required run has failed ${p} times in a row on the same test, tell ARCH and stop retrying.`, n => `The required run has just failed for the ${['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth'][n]} time in a row, on the same test in your module.`, 'Tell ARCH and stop retrying.', 'Fix what you can and push again.', ['Skip the test.', 'Delete the test.'], p => p, p => p - 1),
  choiceRule(['invoices:', '[invoices]', 'INV-', 'job:'], p => `Begin every commit message with \`${p}\`.`, 'You are writing a commit message for a date-parsing fix. How does it begin?', c => `\`${c} fix date parsing\``, 'You are writing a message to ARCH (not a commit message).', 'Write it plainly, with no commit prefix.', ['Leave it empty.', 'Send a commit instead.']),
  choiceRule(['tabs', 'two spaces', 'four spaces', 'eight spaces'], p => `Indent every new file you create with ${p}.`, 'You create a new source file. How do you indent it?', c => `With ${c}.`, 'You edit an existing file that another session wrote, indented throughout in its own consistent style.', 'Keep the file\'s existing indentation.', ['Re-indent the whole file.', 'Ask ARCH.']),
  thrRule([50, 100, 200, 500], p => `Log a warning when an invoice has more than ${p} lines.`, n => `An invoice your module makes has ${n} lines.`, 'Log a warning.', 'Make it as usual, with no warning.', ['Refuse to make it.', 'Split it into two invoices.'], p => p + 20, p => p - 20),
  whoRule(p => `Ask ${p} before you rename any function your module exports.`, 'You want to rename `createInvoice`, which your module exports. Whom do you ask first?', 'Ask', 'You want to rename `roundLine`, a private helper your module does not export.', 'Rename it.', ['Leave it.', 'Report it as a process fault.']),
  thrRule([200, 400, 800, 1500], p => `Keep your pull request's diff under ${p.toLocaleString('en-US')} lines; beyond that, tell ARCH before pushing more.`, n => `Your pull request's diff is now ${n.toLocaleString('en-US')} lines, and you have more to push.`, 'Tell ARCH before pushing more.', 'Push the rest.', ['Open a second pull request.', 'Delete some of the work.'], p => p + 60, p => p - 60),
  choiceRule(['@net', '@online', '@remote', '@slow'], p => `Tag every test that needs the network \`${p}\`.`, 'You write a test that calls the payment service over the network. What tag does it get?', c => `\`${c}\``, 'You write a test that runs entirely in memory.', 'No tag.', ['Ask ARCH.', 'Skip it.']),
  whoRule(p => `A walk flaw placed with you that needs no change here goes back to ${p}, with the reason.`, 'A walk flaw has been placed with you, and your module behaves exactly as its requirements say. To whom does it go back?', 'Send it back to', 'A walk flaw has been placed with you, and it is caused by your module.', 'Fix it in your module.', ['Ignore it.', 'Close with no change.']),
);

// ---- free-response tokens: for these rules the apply scenario is asked without options; the answer
// must contain the token of the drawn choice and none of the other choices' tokens.
const WT = ['arch', 'coordinator', 'root', 'watcher'];
const lc = a => a.map(x => String(x).toLowerCase());
export const FREE = {
  1: WT, 5: lc(['--blocked', '--waiting', '--held', '--stuck']), 6: lc(['--nothing-to-change', '--no-change', '--unchanged', '--noop']), 7: ['arch', 'coordinator', 'process', 'root'],
  13: lc(['test/tmp', 'test/out', '.scratch', 'build/test']), 14: ['check', 'listing', 'related', 'results'], 16: WT, 18: lc(['errors.js', 'codes.js', 'common/errors', 'errors.json']),
  20: ['push', 'ready', 'results', 'check'], 27: ['related', 'listing', 'check', 'results'], 28: ['utc', 'firm', 'customer', 'server'],
  31: WT, 32: WT, 33: ['listing', 'related', 'uses', 'check'], 36: ['.test.js', '.spec.js', 'test_', '_test.js'], 37: ['2026-03-05', '05 mar 2026', '03/05/2026', 'mar 05, 2026'],
  39: ['invoices:', '[invoices]', 'inv-', 'job:'], 40: ['tab', 'two', 'four', 'eight'], 42: WT, 44: ['@net', '@online', '@remote', '@slow'], 45: WT,
};
export function freeScore(ruleNo, choiceIdx, answer) {
  const toks = FREE[ruleNo]; let a = ' ' + answer.toLowerCase().replace(/[`*]/g, '') + ' ';
  if (ruleNo === 7) a = a.replace(/process fault|process's|the process\b/g, '');
  if ([1, 16, 31, 32, 42, 45, 7].includes(ruleNo)) a = a.replace(/\barch\b/g, ' arch ');
  const has = (t) => (t === 'arch' || t === 'root' || t === 'process') ? new RegExp(`\\b${t}\\b`).test(a) : t === 'two' || t === 'four' || t === 'eight' ? new RegExp(`\\b(${t}|${{ two: 2, four: 4, eight: 8 }[t]})\\b`).test(a) : a.includes(t);
  if (ruleNo === 18) { const ok = { 0: /invoices\/errors\.js(?!on)/, 1: /codes\.js/, 2: /common\/errors/, 3: /errors\.json/ }; return ok[choiceIdx].test(a) && Object.entries(ok).every(([k, r]) => +k === choiceIdx || !r.test(a)); }
  if (ruleNo === 36) { const ok = { 0: /\.test\.js/, 1: /\.spec\.js/, 2: /test_[a-z]/i, 3: /_test\.js/ }; return ok[choiceIdx].test(a) && Object.entries(ok).every(([k, r]) => +k === choiceIdx || !r.test(a)); }
  return has(toks[choiceIdx]) && toks.every((t, i) => i === choiceIdx || !has(t));
}

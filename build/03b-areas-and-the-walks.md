# Build text 3 (continued): areas, the two walks, and "without flaws"

Length: 74 lines. Last section: "7. "Without flaws", and what the tool needs".

Sections 2, 4, 5 and 7 of build text 3. Its other sections: 3 and 6 in `03-`; 8 in `03c-`. **Status: proposed. Nothing here has run.** It stands beside the design (`design/`, "the design" below). Words in quotation marks are the owner's unless a line says otherwise. The tool's commands named here are in build text 1b, section 4.

Marks: **Decided here:** a choice made in this text. **Unproven:** never shown to work.

## 2. Areas

The design fixes what an area is: for the internal walk a screen or a named group of screens, for the external walk a journey.

**Decided here:** the walks' documents are kept as one page for each group of screens and one page for each journey, each under the single-text maximum, with an index page. A group's name is its page's name. Gives: a walking session reads the pages of its areas in full and nothing else, and a group needs no second definition. Costs: the UX lane must shape the documents this way.

**Decided here:** how ARCH names a round's areas.

1. The tool (`walk areas`) lists the round's changed modules: those whose pull request merged in the round, and those a notice was sent to, whether or not they then changed.
2. For each, the tool lists the screen pages and journeys named in the headers of that module's steps (section 3) and in the endings of its requirement text (build text 2, section 4).
3. A changed module that names none takes the areas of its users (the later modules whose uses files name it, build text 2c), and theirs in turn, until modules that name some are reached.
4. That is the candidate list. ARCH adds an area where it doubts how a change will show (the design, part 3, section 3), and may take one away. Each added or removed area carries one line of reason.
5. ARCH's session writes the list into the round record (`state write`) before any walking session starts: internal areas and external areas, each with its source and the number of the walking session given it.

A deep module can pull in most of the product; only ARCH's judgment trims that. **Unproven:** that requirement text and step headers name enough for the list to be right.

## 4. The internal walk

1. ARCH starts each walking session from the newest commit of the tranche branch. Its starting instructions, which the tool fills in (`walk text`), name the walk, the walk issue and the process config, where its two commands are; its areas stay in the round record, which it reads (`state read`).
2. The session builds the product on its own machine.
3. It serves the product there with the product's own local command, with the product's stand-in wherever a screen needs an AI answer, and with no secret.
4. For each area it reads the Screens page in full, runs that page's steps, and walks by hand what no step covers.
5. It compares what is on each screen, each state the page names, and where each action leads, with the page's words. A difference is a flaw of the first kind. Anything else it notes is an observation.
6. It writes its record (section 6) and sends ARCH one message.

Workers and the fill level: the design, part 4, section 11. It has no commit and no branch.

**Decided here:** the process config holds two commands (build text 2, section 7, `walk`): the one that builds and serves the product on one machine, and the one that runs named steps against an address.

**Decided here:** one area is one command, started in the background. Where an area's steps run longer than twenty minutes, ARCH makes it two areas. **Unproven:** all of this section.

## 5. The external walk

**Reaching the deployment. Decided here:**

- ARCH's session deploys one copy for each external walking session, under fixed names in the development account, used again every round: removed, deployed afresh and seeded, with the commands of the process config's `deploy` group (build text 2, section 7). The names and addresses are written in the round record.
- The walking session takes its own copy through the product's own first-use door and so makes its own sign-in. No sign-in passes between sessions or is written anywhere.
- The owner enters the copies' hosts once among the cloud environment's allowed hosts (build text 4, section 4). The browser is on the session's machine and uses its proxy.

Each round may need several deployments, of unknown length, and more of the account's room. **Unproven:** every part; and whether a product's first-use door allows it is a fact of the product.

**Following a journey.** The session reads the journey's page in full, runs its steps in order from start to end, and walks by hand what no step covers. A journey that cannot be taken to its end is a flaw of the second kind, recorded at the step where it stopped. A journey that ends with a result that is not what the page says is a flaw of the third kind.

**Journeys that use AI.**

- Such a journey is named as an area only once the owner has connected an AI account to the deployment (the design, part 1, section 3). Until then ARCH leaves it out, and the account after the round names it as not walked (the design, part 3, section 3).
- **Decided here:** the result of a step that uses AI is judged as the design judges a module test: it does not fail for a different but still valid answer. The step's `expects` line gives the journey page's own words for what any proper result has, and the walking session judges by reading the result. The UX lane sets those words for each journey (the design, part 3, section 3). That judgment is a session's, and can differ between sessions.

**How many sessions, and the account's limits. Decided here:**

- The number of external walking sessions is the least of: the free slots, the number of external areas, and a figure in the process config for the most external walkers (`walk.most_external_walkers`). That figure begins at one. ARCH raises it by its own judgment (the owner's caution: the design, part 9, section 1).
- Each walking session drives one browser and follows one journey at a time.
- A refusal by the hosting provider for a limit is not a flaw. The session stops, records the area as not walked with the provider's words, and tells ARCH, which lowers the figure.

**Unproven:** all of it. What bears the cost of the AI account's use in a walk is not known.

## 7. "Without flaws", and what the tool needs

**Decided here:** a walk as recorded is without flaws when both are so:

- every area in the round record has a line, written by the session given it, saying "walked to the end";
- no flaw stands: every flaw written was set aside by ARCH with its reason, or none was written.

An area with no line, or marked not walked, means the walk is not finished. ARCH gives the area to a session again. A flaw given to the UX lane still counts in that walk: the document was wrong, and the corrected page is walked in the next round.

**The tool judges nothing.** ARCH writes the outcome, through the tool, into the round record: each area as clean, flawed or not walked, and one line for the walk, without flaws or not. From the walk the tool needs only fixed-form lines it can copy: the hidden mark, the area lines, and each flaw's number with the module ARCH named. It opens and closes the walk issue (`walk open`, `walk close`), writes a walking session's comment (`walk write`), prints the issue (`walk read`), and writes ARCH's placements into waiting work and ARCH's lines into the round record (`state write`). These are acts of the design's list (part 6, section 5). It never judges a flaw's words and never refuses a deployment or an end of tranche. ARCH's session deploys after ARCH has written that the internal walk is without flaws.

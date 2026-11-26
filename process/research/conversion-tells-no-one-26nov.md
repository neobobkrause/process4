# A conversion's merge tells no one (26 Nov 2026, PROCESS #19)

**What was found.** Five of civicsmith's seven first conversions could not be notified (`notify-size-26nov.md`). A worker
measured on synthetic products of civicsmith's shape (200 modules, the provider third, 150 later importers, 130 with no
uses file): on 1216397 a conversion that only states types was read as changing two items (a type error that went away
counted as a change, against build text 2b section 6), so all 150 importers were told, every one needlessly; the reasons
carried each changed item's whole written-out types per told module, past the language's string limit.

**What PROCESS #19 put to the owner.** In module order, when a module converts every later module is unconverted, so a
conversion can only ever tell modules not yet converted. A conversion changes no behaviour, so by the owner's rule (no
change of domain or range, no retest) no one needs telling; any change the tool finds there is describing or a tool false
positive. Risk: an accidental behaviour change in a conversion is caught by the provider's own tests at its interface and
by the walks, not by a notice. The five owed notices for 1688, 1689, 1691, 1692 and 1693 need not be sent.

**The owner's decision.** "Decision: a conversion's merge tells no one." — 26 November 2026, in PROCESS #19's session.

**Built.** `notify` reads the merged job block first; where its kind is `conversion` it says so, reads nothing and writes
nothing. Texts: design part 2 section 7 (who is told; the conversion), build text 5 section 6, build text 1b command 11, the
record's subject "Who a change tells" item 6. The tool's corrections that remove false positives and expand capacity for
merges that are not conversions are on `work/notify-size`, waiting for the owner's word.

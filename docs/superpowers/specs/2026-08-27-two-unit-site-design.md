# Unified two-unit revision site

Date: 2026-08-27 (revised 2026-08-28 after adversarial audit)

## Goal

Serve both BTEC units from one codebase and one URL: Unit 1 (Information
Technology Systems, learning aims A-F) and Unit 2 (Cyber Security and Incident
Management, A-D). A student picks a unit and the whole site reframes to it.

The immediate driver is handing the Unit 1 site to younger years. Unit 1 has the
richer content (136 flashcards to Unit 2's 78, 44 questions to 25) but the older
engine; Unit 2 has the better engine on thinner content.

## Background

The repository began as the Unit 1 site, was converted in place to Unit 2, and
still ships `data/e.json` and `data/f.json` -- Unit 1's sections E and F,
byte-identical to the originals, unused because `build_inline.py` hardcodes them
to `null`. The last complete Unit 1 site is commit `5a4a5ae` (2026-05-10),
reachable via the `Full_release` tag, which is pushed to GitHub.

## Base

Work starts from `origin/main`. Local `main` had an unrelated history that
produced byte-identical CSS and HTML but introduced one regression (`c.term` for
`c.front`) and dropped `README.md`, `data/e.json`, `data/f.json` and all 16 past
papers. It is preserved as the local branch `rewritten-history-backup`.

## Blocking prerequisite: data_inline.js has drifted

`data_inline.js` is committed and is what the live site actually serves. It is NO
LONGER reproducible from `data/*.json`. Running `build_inline.py` today rewrites
nine flashcard `back` texts, replacing hand-edited wording with older JSON
wording.

Verify: `python build_inline.py && git diff --stat data_inline.js`
Observed: 9 insertions, 9 deletions.

Unit 1 has drifted too: its committed `data_inline.js` differs from its
`data/flashcards.json` on card `e3` (`back`). Ten hand-edits total across the two
units.

**Nothing in this design may run `build_inline.py` until all ten hand-edits are
back-ported into `data/*.json` and a rebuild produces a zero diff for both
units.** This is task one. Skipping it silently degrades live content.

## Blocking prerequisite: two games are already broken

Independent of this merge, two of the four games are broken on the live site
today. Flashcards carry `front`/`back`, but:

- `buildFITBQuestions` (app.js:1311) calls `card.definition.replace(...)` --
  Fill in the Blank throws `TypeError: Cannot read properties of undefined
  (reading 'replace')`
- `buildTFQuestions` (app.js:1416) interpolates `card.term` and
  `card.definition` -- True or False Blitz renders `"undefined" - undefined`

Reproduced against https://zainsplace.github.io, not inferred. Unit 1's cards use
the same `front`/`back` shape, so merging propagates the fault to Unit 1 rather
than fixing it. Fix before or during the merge; do not let the merge be blamed
for it afterwards.

## Verified constraints

Every row was re-derived against the real files. Rows marked CORRECTED were wrong
in the first draft of this spec.

| Finding | Consequence |
| --- | --- |
| Topic codes collide across units: `A1.1` differs in each | `rag`/`reviewed` namespaced per unit |
| 74 of 78 Unit 2 flashcard IDs exist in Unit 1 | flashcard boxes namespaced |
| All 25 Unit 2 question IDs (`q1`-`q25`) exist in Unit 1 | question history namespaced |
| `getSectionCodes` (app.js:266) gates on `/^[A-D]/`; Unit 1's engine uses `/^[A-F]/`. 0 of 51 E/F codes match `[A-D]` | the letter set must come from the unit, or the anchor must go |
| Unit 1's live order is C, D, B, E, A, F; its tier 1 is {C,D,B,E} in that order | CORRECTED: order is NOT derivable from tier. The manifest must carry an explicit ordered list |
| Unit 1's `sectionColour()` matches its JSON exactly, including the deliberate C/D `#e53e3e` | CORRECTED: Unit 1's JSON colours are authoritative, not stale. Only Unit 2's are stale |
| Rendered tile names are shortened and differ from JSON `title` in 7 of 10 sections | the manifest needs a `shortName`; JSON `title` is not a drop-in |
| 12 codes are duplicated across nesting levels within single Unit 1 files (b:7, c:1, d:2, e:2) | CORRECTED: "codes unique within a unit" is false on real data |
| Unit 1 `a.json` has a subtopic (`A5`) with no `code` key | a presence check would fail on day one |
| `index.html` carries 9 Unit-2 strings incl. `<title>` at :6 and wordmark at :25-26, :71-72 | static HTML nothing in app.js rewrites |
| `index.html:14` loads Lucide from `unpkg.com`; Unit 1's original site had zero external URLs | CORRECTED: the site is NOT offline-capable today |
| `state.profile.img` holds a base64 JPEG avatar (app.js:301, 333) | third profile field, must be in the state shape |
| Unit 1's own site used `u1rev_state` and `u1_plan_checks` on the SAME origin | real Unit 1 history exists and must be migrated |
| JSON `tier` agrees with `sectionTierClass()` in both units | tier may be read from JSON |
| `app.js` makes no `fetch()` calls; data is inlined | data loading works from `file://` |

## Data layout

```
data/
  unit1/  a b c d e f .json   flashcards.json questions.json extended.json
  unit2/  a b c d     .json   flashcards.json questions.json extended.json
```

Unit 1's files come from commit `5a4a5ae`.

## Unit manifest

The manifest owns everything that is presentation or ordering. JSON owns `title`
and `tier` only.

```js
const UNITS = {
  u1: {
    id: 'u1', label: 'Unit 1',
    name: 'Information Technology Systems',
    wordmark: 'U1',
    headerSub: 'BTEC National - Information Technology Systems',
    examDate: null,
    order: ['c','d','b','e','a','f'],
    sections: {
      c: { colour:'#e53e3e', shortName:'Operating Online',     blurb:'Cloud, VPN, Online Communities' },
      d: { colour:'#e53e3e', shortName:'Protecting Data',      blurb:'Threats, Encryption, Firewalls' },
      b: { colour:'#d69e2e', shortName:'Transmitting Data',    blurb:'Networks, Protocols, Compression' },
      e: { colour:'#dd6b20', shortName:'Impact of IT',         blurb:'Online Services, Data, E-commerce' },
      a: { colour:'#3182ce', shortName:'IT Systems & Devices', blurb:'Devices, OS, Software, Interfaces' },
      f: { colour:'#9f7aea', shortName:'Legal & Ethical',      blurb:'GDPR, Computer Misuse, Copyright' }
    }
  },
  u2: { /* order ['a','b','d','c']; colours #4338CA #A8326E #0E9F6E #6D5BD6 */ }
};
```

Every Unit 1 value above is copied from the live Unit 1 site
(`unit1-revision/app.js:133` for colour, `:208-213` for order, shortName and
blurb; F's tier is 2 per `:126`). None is invented. Unit 2's colours come from
`sectionColour()` at `app.js:249`, NOT from its JSON, which is stale.

`f.json` gains `tier: 2` only. Colour lives in the manifest for both units, so
`f.json` needs no `colour`.

The manifest also supplies each unit's **letter set**, which `getSectionCodes`
must use in place of its hardcoded `/^[A-D]/`.

## Sites that must change

The first draft said "twelve". The real count is 18 letter-hardcoding sites plus
three name/colour arrays. Enumerated so the implementer has a checklist:

`app.js` :65 (loadData map), :69-74 (**loadJSON** -- returns the three
unit-specific globals `INLINE_FLASHCARDS`, `INLINE_QUESTIONS`, `INLINE_EXTENDED`;
it is a stateless passthrough, NOT a cache, so clearing `DATA` does nothing for
it), :241-242 (sectionTierClass), :249 (sectionColour), :266 (the `[A-D]` regex),
:274 (overallProgress), :363, :404, :539 (renderReviseNext), :590-594 (array 1),
:643-647 (array 2), :773 (renderFlashcards), :827 (flashcard filter),
:922 (renderQuestions), :937 (question tabs), :1087 (renderExtended),
:1102/:1113/:1124/:1135 (getFallbackExtended), :1305 (buildFITBQuestions),
:1410 (buildTFQuestions), :1874 (**startMCQ reads `INLINE_FLASHCARDS` directly**,
bypassing `loadJSON` entirely -- the only such read in the file, and the only one
without a `|| {}` guard, so it throws rather than degrading), :1940, :2101,
:2430, :2577-2580 (exam-kit keyword banks), :2622, :2636, :2712,
:2770-2781 (daily-plan prose), :2834, :2932.

The `loadJSON` group matters most: flashcards, questions, extended writing, Fill
in the Blank, True/False Blitz and MCQ all read through it or around it. Clearing
`DATA` flips the sections page to the new unit while every one of those keeps
serving the old one.

`index.html` :6 title, :7 meta description, :9-10 og tags, :25-26 wordmark,
:71-72 header, :119-122 hero button target, name and blurb.

Two of these hold Unit-2 editorial prose the manifest's per-section fields cannot
supply -- the Exam Kit keyword banks (:2577-2580) and the daily-plan text
(:2770-2781). Unit 1's site had no Exam Kit at all. Both need either per-unit
content in the manifest or to be hidden for units that lack them; hiding is
acceptable for v1 and must be explicit.

## State

Everything except identity and UI preference is per unit.

```js
{
  activeUnit: 'u1',
  theme: 'light',
  profile: { emoji, col, img },      // img: base64 JPEG, may be absent
  units: {
    u1: { rag, reviewed, flashcards, questions, extended,
          streak, xp, activity, battles, examDate, planChecks,
          bests: { tf, match } },
    u2: { /* same shape */ }
  }
}
```

Global: `activeUnit`, `theme`, `profile`, sidebar open/closed (kept in its own
`sidebar` key, as today).

### Cache invalidation

`DATA` (app.js:62) and the search index (`allSearchContent`/`searchBuilt`,
:2617-2618) are module-level caches keyed by bare section letter, written once
(`if (!DATA[s])`) and never cleared. `DOMContentLoaded` primes a-d before any
switch can happen. Switching unit without clearing them serves the previous
unit's content.

Switching units must therefore:

1. clear `DATA`
2. set `searchBuilt = false` and empty `allSearchContent`
3. reset `flashFilter` (:767) and `qFilter` (:917), whose bare letters mean
   different sections in each unit and may not exist in the target unit
4. reset the in-flight page modes `qMode` (:916) and `gamesMode` (:1293), and
   discard their materialised queues -- `quizQueue`, `mcq` (:1294),
   `matchGame` (:1295), `tfState` (:1299), `fitbState` (:1302), `battle` (:2089)
5. clear the live timers `matchInterval` (:1296) and `battleTick` (:2090)
6. re-point whatever `loadJSON` (:69-74) resolves to, and `startMCQ`'s direct
   `INLINE_FLASHCARDS` read (:1874) -- neither is affected by clearing `DATA`
7. then re-render

Steps 4 and 5 are not cosmetic. A quiz or match already in progress keeps its
queue, and its scoring handlers are baked with the outgoing unit's question ids
and marks. `recordQuizScore` (:1070) and `awardXP` then write that result into
whichever unit is now active -- so a Unit 2 question silently credits XP and
history to Unit 1. A match timer still running at switch time reaches
`finishMatch` (:2013) and does the same.

"Re-renders in place" without all of this is the single most likely way to ship
this broken.

### Migration

Both units ran on the same origin, so a user may have history from either.

| Key | Destination |
| --- | --- |
| `u2rev_state` | `units.u2`; `theme` and `profile` hoisted to global |
| `u1rev_state` | `units.u1` |
| `u2_plan_checks` / `u1_plan_checks` | `units.uN.planChecks` |
| `u2_tf_best` / `u2_match_best` | `units.u2.bests.*` |
| `u2_sidebar` | global `sidebar` |

Stored under a new key, `rev_state`. Runs once when `rev_state` is absent.
Legacy keys are left in place, not deleted.

`activeUnit` after migration: whichever legacy state has the more recent
activity; Unit 2 on a tie; Unit 1 for a genuinely new visitor.

Presence of a legacy key does not prove real history -- `u2rev_state` is written
on first render. Migrate a unit's namespace only if its blob has non-empty `rag`,
`reviewed`, flashcard boxes or history.

### Export / import / reset

`app.js` exposes export, import and reset over the whole `state` object. All
three must be updated for the new shape, and import must detect a legacy-shaped
export and route it through the same migration. Left unhandled, importing an old
backup overwrites `rev_state` with legacy shape and permanently blocks migration.

## Offline capability

`index.html:14` loads Lucide from `unpkg.com`. `app.js:2934` guards with
`typeof lucide !== 'undefined'`, so the page does not crash offline -- but every
`<i data-lucide>` renders empty, including all sidebar navigation.

Unit 1's original site had no external requests. Since this site is being handed
to students who may open it from a USB stick or a school laptop with no network,
**Lucide must be vendored locally** and the CDN `<script>` replaced. Without
this, the merged site is a regression against the very thing being handed over.

## Unit switcher

A switcher in the sidebar above section navigation. Changing unit runs the cache
invalidation above, persists `activeUnit`, and re-renders. Header, wordmark,
`document.title`, meta tags and countdown follow the active unit; the document
title lives in static HTML (`index.html:6`) and must be set from script.

First-time visitor with no stored state defaults to Unit 1.

## Exam date

`examDate` is per unit. `DEFAULT_EXAM_DATE` (`2026-05-15`) is Unit 2's. Unit 1's
is unknown and must be supplied before release.

There are five consumers of the countdown, not one. When a unit has no date, all
five must degrade together to a neutral "no date set" state -- not to "Final Week
- Exam Mode", which is what a null date produces today. Existing Unit 2 users
keep their stored date through migration.

## Verification

No test framework exists here; this design does not pretend otherwise.

`validate_data.py` -- note what it can and cannot do. Cross-unit ID collisions
are inherent to the content and are **not** defects to be fixed; they are the
reason for namespacing. The validator therefore checks that namespacing holds,
not that IDs are globally unique.

- every section file declares `section`, `title`, `tier`
- every manifest section has `colour`, `shortName`, `blurb`
- every manifest `order` lists exactly the unit's section letters, once each
- flashcard IDs unique within a unit; question IDs unique within a unit
- item-level codes (objects with both `code` and `term`) unique within a unit --
  NOT all codes at every nesting level, which legitimately repeat 12 times in
  Unit 1
- every item with a `term` has a `code` (Unit 1 `a.json` `A5` currently fails
  this; decide whether to fix the data or exempt subtopic-level nodes)
- `build_inline.py` produces a zero diff against the committed `data_inline.js`

Manual QA:

1. Switch units; confirm sections, flashcards, questions, extended writing,
   search results, daily plan, tile progress AND all four games ALL change, not
   just the section list
1b. Start a quiz, switch unit mid-quiz, finish it; confirm no XP or history
   lands in the wrong unit. Repeat with a Match game timer running.
2. Rate a topic in Unit 1; confirm the same code in Unit 2 is untouched
3. Confirm Unit 1 sections E and F report non-zero progress after rating
4. Confirm streak, XP, heatmap and game bests are independent per unit
5. Load a pre-existing `u2rev_state`; confirm it lands under Unit 2 and opens there
6. Load a pre-existing `u1rev_state`; confirm it lands under Unit 1
7. Export from the old build, import into the new; confirm no data loss
8. Disconnect from the network, open `index.html` from disk; confirm icons render
9. Confirm tile colours and section order match the current live site for BOTH
   units exactly
10. Play Fill in the Blank and True or False Blitz in both units; confirm no
   `undefined` text and no thrown error

## Out of scope

No new revision features, no rewriting of Unit 1 content, no build tooling beyond
the existing script. The site must remain openable by double-clicking
`index.html` -- with icons.

A visual redesign is **in** scope but is tracked separately: warm paper palette,
vendored typefaces, and replacing the four-stat row with a single RAG confidence
strip. It shares the vendoring work with the Lucide fix (both are about removing
network dependencies) but is otherwise independent of the merge, and should land
after it so that merge regressions and restyle regressions stay distinguishable.

## Audit note

Two adversarial multi-agent audit rounds have run against this spec.

Round 1 (5 dimensions: state/storage, manifest/rendering, data/collisions,
build/runtime, spec coherence) produced 37 findings; 8 were adversarially
verified and none refuted.

Round 2 (5 previously unexamined dimensions: routing/navigation, storage
robustness, games/subsystems, accessibility/responsive, content parity) produced
34 findings; 6 were adversarially verified, 3 confirmed and 2 refuted. The
refutations were substantive: the corrupt-localStorage finding was a restatement
of a gap this document already acknowledged, and the keyboard-accessibility
finding was real in mechanism but overstated in scope.

Every correction folded into this spec was re-verified by hand against the
source, and the two broken games were reproduced against the live site.

**Known remaining gaps.** 28 round-2 findings were not adversarially checked,
and the completeness critic never ran (session limit, twice). The unchecked set
concentrates in three areas this spec does not fully address:

- **Accessibility.** 16 `<div onclick>` handlers, zero `tabindex`, zero ARIA
  anywhere in `app.js`. RAG buttons sit inside collapsed panels and are
  unreachable by keyboard. The focus indicator fails WCAG contrast in both
  themes. Below 900px the closed sidebar keeps ~12 controls in the tab order
  off-screen.
- **Storage robustness.** No `try`/`catch` on any write, no version or
  migration-completion marker, and two full-state serialisations per action --
  on a payload the merge roughly doubles.
- **Content parity.** 34 of 44 Unit 1 model answers use `\n\n` paragraph breaks
  the shared renderer may not honour; Unit 1's `extendedAnswer` field is read by
  neither engine.

None of these block the merge, but none should be assumed handled.

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

**Nothing in this design may run `build_inline.py` until the nine hand-edits are
back-ported into `data/*.json` and a rebuild produces a zero diff.** This is task
one. Skipping it silently degrades live content in both units.

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

`app.js` :65 (loadData map), :241-242 (sectionTierClass), :249 (sectionColour),
:266 (the `[A-D]` regex), :274 (overallProgress), :363, :404, :590-594 (array 1),
:643-647 (array 2), :827 (flashcard filter), :937 (question tabs),
:1102/:1113/:1124/:1135 (getFallbackExtended), :1940, :2101, :2430,
:2577-2580 (exam-kit keyword banks), :2622, :2636, :2712,
:2770-2781 (daily-plan prose), :2834, :2932.

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
4. then re-render

"Re-renders in place" without these steps is the single most likely way to ship
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

1. Switch units; confirm sections, flashcards, questions, search results, daily
   plan and tile progress ALL change, not just the section list
2. Rate a topic in Unit 1; confirm the same code in Unit 2 is untouched
3. Confirm Unit 1 sections E and F report non-zero progress after rating
4. Confirm streak, XP, heatmap and game bests are independent per unit
5. Load a pre-existing `u2rev_state`; confirm it lands under Unit 2 and opens there
6. Load a pre-existing `u1rev_state`; confirm it lands under Unit 1
7. Export from the old build, import into the new; confirm no data loss
8. Disconnect from the network, open `index.html` from disk; confirm icons render
9. Confirm tile colours and section order match the current live site for BOTH
   units exactly

## Out of scope

No new revision features, no visual redesign, no rewriting of Unit 1 content, no
build tooling beyond the existing script. The site must remain openable by
double-clicking `index.html` -- with icons.

## Audit note

This spec was rewritten after an adversarial multi-agent audit produced 37
findings; 8 were adversarially verified and none were refuted. The corrections
above were each re-verified by hand against the source. One dimension -- a
completeness critic asking what nobody examined -- did not run. Areas it would
have covered that remain unexamined: accessibility, responsive and mobile
behaviour, browser back/forward and routing, printing, and behaviour under
corrupt or quota-exceeded localStorage.

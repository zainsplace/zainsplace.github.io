# Unified two-unit revision site

Date: 2026-08-27

## Goal

Serve both BTEC units from one codebase and one URL: Unit 1 (Information
Technology Systems, learning aims A-F) and Unit 2 (Cyber Security and Incident
Management, A-D). A student picks a unit and the whole site reframes to it.

The immediate driver is handing the Unit 1 site to younger years. Unit 1 has the
richer content (136 flashcards to Unit 2's 78, 44 questions to 25) but the older
engine; Unit 2 has the better engine on thinner content. One codebase gives both
units everything.

## Background

The repository has carried both units for months without acknowledging it. It
began as the Unit 1 site, was converted in place to Unit 2, and still ships
`data/e.json` and `data/f.json` -- Unit 1's sections E and F, byte-identical to
the originals, silently unused because `build_inline.py` hardcodes them to
`null`.

The last complete Unit 1 site is commit `5a4a5ae` (2026-05-10), reachable via the
`Full_release` tag, which is pushed to GitHub.

## Base

Work starts from `origin/main`, not the local rewritten history.

Local `main` had an unrelated history that produced byte-identical CSS and HTML
but introduced one regression (`c.term` for `c.front`, rendering `undefined` in
the "Flashcards due today" panel) and dropped `README.md`, `data/e.json`,
`data/f.json` and all 16 past papers. It is preserved as the local branch
`rewritten-history-backup` and is not pushed.

## Verified constraints

These were measured, not assumed. Each one dictates part of the design.

| Finding | Consequence |
| --- | --- |
| Topic codes collide across units: `A1.1` is "Features of Digital Devices" in Unit 1 and "Internal Threats" in Unit 2 | `rag` and `reviewed` must be namespaced per unit |
| 74 of 78 Unit 2 flashcard IDs exist in Unit 1 | flashcard boxes and due dates must be namespaced |
| All 25 Unit 2 question IDs (`q1`-`q25`) exist in Unit 1 | question history must be namespaced |
| JSON `colour` fields are the stale pre-redesign palette; the site renders from `sectionColour()`'s newer map | the manifest owns colour, NOT the JSON |
| Unit 1's `c.json` and `d.json` both declare `#e53e3e` | same -- JSON colour is unreliable in both units |
| JSON `tier` agrees with `sectionTierClass()` in Unit 2 | tier may be read from JSON |
| Display order is A, B, D, C -- tier 1 before tier 2 | ordering is derivable from tier, not hardcoded |
| `data/f.json` has no `tier` and no `colour` in every copy | must be filled in or tiles render uncoloured |
| `app.js` makes no `fetch()` calls; all data is inlined | the site must keep working from `file://` |

## Data layout

Split `data/` by unit. Unit 1's files come from commit `5a4a5ae`.

```
data/
  unit1/  a b c d e f .json   flashcards.json questions.json extended.json
  unit2/  a b c d     .json   flashcards.json questions.json extended.json
```

This ends the ambiguity that let Unit 1's E and F sit unused inside a Unit 2 site.

## Unit manifest

A single `UNITS` structure replaces the twelve hardcoded section-list sites in
`app.js` and the two arrays that duplicate section names, tiers and colours.

```js
const UNITS = {
  u1: {
    id: 'u1',
    label: 'Unit 1',
    name: 'Information Technology Systems',
    examDate: null,          // must be set: Unit 1 sits a different paper
    sections: {
      a: { colour: '#4338CA', blurb: '...' },
      ...through f
    }
  },
  u2: { ...sections a through d }
};
```

`title` and `tier` are read from each section's JSON, which already carries them
correctly. `colour` and the short tile `blurb` live in the manifest: the JSON
colours are stale and, in Unit 1, duplicated. Section order is computed by tier,
matching current behaviour.

`build_inline.py` becomes unit-aware and emits `INLINE_UNITS = { u1: {...},
u2: {...} }` in place of `INLINE_A` through `INLINE_F` and its hardcoded
`INLINE_E = null`.

## State

Every field except user identity and UI preference is per unit. Revising Unit 1
must never alter anything shown for Unit 2.

```js
{
  activeUnit: 'u1',
  theme: 'light',
  profile: { emoji, col },
  units: {
    u1: { rag, reviewed, flashcards, questions, extended,
          streak, xp, activity, battles, examDate, planChecks,
          bests: { tf, match } },
    u2: { ...same shape }
  }
}
```

Global: `activeUnit`, `theme`, `profile`, and the sidebar open/closed preference.
Everything else, including streak, XP, the activity heatmap and battle records,
is per unit.

`examDate` moves into the unit namespace because the two units sit different
papers. The current `DEFAULT_EXAM_DATE` of `2026-05-15` belongs to Unit 2; Unit
1's date is not known yet and must be supplied before release. Until it is set,
the countdown is hidden for that unit rather than showing a wrong date. It is currently written to `state.examDate` dynamically and is absent
from `defaultState()`; the new shape declares it explicitly.

State is stored under a new key, `rev_state`, leaving the legacy `u2rev_state`
untouched.

### Migration

Existing users have real revision history under these keys:

| Key | Destination |
| --- | --- |
| `u2rev_state` | lifted wholesale into `units.u2`; `theme` and `profile` hoisted to global |
| `u2_plan_checks` | `units.u2.planChecks` |
| `u2_tf_best` | `units.u2.bests.tf` |
| `u2_match_best` | `units.u2.bests.match` |
| `u2_sidebar` | stays global, unchanged |

Migration runs once on load when the new key is absent and a legacy key is
present. It is one-way. Legacy keys are left in place rather than deleted, so a
failed migration is recoverable by clearing the new key.

## Unit switcher

A switcher sits in the sidebar above section navigation. Changing unit
re-renders in place and persists `activeUnit`. The header, document title and
countdown text follow the active unit, replacing the hardcoded Unit 2 strings at
`app.js:379` and `app.js:2721`.

A first-time visitor with no stored state defaults to Unit 1, since the younger
years receiving this site are studying Unit 1. A migrated user lands on Unit 2,
where their history is.

## Content gaps to close

- `f.json` needs `tier` and `colour`
- Unit 1 sections need the short tile blurbs Unit 2's hardcoded array carried
- `index.html:119` hardcodes `navigate('sections', {section:'A'})`

## Verification

There is no test framework here -- vanilla JS, no `package.json` -- and this
design does not pretend otherwise.

`validate_data.py`, run before each commit, asserts:

- every section file declares `section`, `title` and `tier`
- every section in a unit's manifest has a `colour` and a `blurb`
- topic codes are unique within a unit
- flashcard IDs are unique within a unit
- question IDs are unique within a unit

This would have caught the `f.json` gap and both ID collisions.

Manual QA checklist:

1. Switch units; confirm sections, flashcards and questions all change
2. Rate a topic in Unit 1; confirm the same code in Unit 2 is untouched
3. Confirm streak, XP and heatmap are independent per unit
4. Load a pre-existing `u2rev_state`; confirm progress appears under Unit 2 and
   the app opens on Unit 2
5. Open `index.html` directly from disk with no server; confirm it works
6. Confirm section tile colours match the current live site exactly

## Out of scope

No new revision features, no visual redesign, no rewriting of Unit 1 content, and
no build tooling beyond the existing script. The site must remain openable by
double-clicking `index.html`; that property is what makes it handable to another
student.

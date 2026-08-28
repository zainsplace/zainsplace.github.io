# BTEC IT Revision

A revision site for the BTEC National in Information Technology (Extended
Certificate), covering both externally examined units:

- **Unit 1** — Information Technology Systems (learning aims A–F)
- **Unit 2** — Cyber Security and Incident Management (A–D)

Built as a single-page app in vanilla JavaScript. Made for my own revision and
for anyone in the years below who wants it.

**Live site:** [zainsplace.github.io](https://zainsplace.github.io)

## Features

- Switch units from the sidebar; the whole site reframes to that unit
- Flashcards with spaced repetition and RAG (red/amber/green) self-rating
- Multiple-choice practice questions per topic
- Match, True/False Blitz, Fill in the Blank and Battle revision games
- Extended-writing practice with timers and model answers
- Leaderboard with daily-progressing rivals
- Progress, XP and streaks tracked **separately per unit**

## Works offline

The site makes no network requests at all — no fonts, no icon CDN, no
analytics. Every icon is inline SVG and all revision content is bundled into
`data_inline.js`. Download the folder, open `index.html`, and it works on a
school laptop with no internet or from a USB stick.

## How it works

Everything runs client-side. Progress is saved in `localStorage` under
`rev_state`, so there is no account and no backend.

Progress is namespaced per unit, which matters more than it sounds: topic codes,
flashcard ids and question ids all repeat between the two units. `A1.1` is
"Features of Digital Devices" in Unit 1 and "Internal Threats" in Unit 2, and 74
of Unit 2's 78 flashcard ids also exist in Unit 1. Sharing one namespace would
silently corrupt both.

Anyone who used the older single-unit sites is migrated automatically on first
load: `u1rev_state` and `u2rev_state` are lifted into their own namespaces and
left in place as a fallback.

## Editing content

Revision content lives in `data/unit1/` and `data/unit2/`. After editing any
JSON:

```bash
python build_inline.py
python validate_data.py
```

`build_inline.py` bundles the JSON into `data_inline.js`, which is what the page
actually loads. `validate_data.py` checks the data and the unit manifest, and
will fail if:

- a section is missing `section`, `title` or `tier`
- a unit in the manifest is missing a colour, short name, blurb or display order
- item codes, flashcard ids or question ids repeat **within** a unit
- a flashcard is missing `front` or `back`
- `data_inline.js` is not reproducible from `data/` (someone hand-edited the
  bundle instead of the source)
- any file references an external URL, which would break offline use

Section colours, display order, short names and blurbs live in the `UNITS`
manifest at the top of `app.js`, not in the JSON. Unit 1's display order is
C, D, B, E, A, F, which is deliberate and is not derivable from tier.

## Running locally

Open `index.html` directly, or serve the folder:

```bash
python -m http.server
```

then visit `http://localhost:8000`.

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
- Flashcards with spaced repetition and RAG (red/amber/green) self-rating; Space flips, ← / → grade
- Exam-style questions for both units, set out like the real AAQ paper: numbered scenarios,
  part-by-part context and the same command words and mark tariffs. Students mark themselves
  against a structured mark scheme (tick points, identify + expand chains, reason → justify →
  expand chains, or levels for 6/9/12-markers) instead of guessing a number
- Practice works like flashcards: one question at a time, Previous / Next or ← / →, filtered by
  section and by Not tried / Needs work. Answers are saved as you type until they are marked
- A progress summary (tried, average mark, weakest section and command word) and a quiz that
  targets weak spots, untried questions or a mix
- Timed mock papers: two for Unit 1 (paced like the real 90 marks in 2 hours) and one 90-mark
  paper for Unit 2. Sit every scenario against the clock, then mark each answer and get a
  breakdown by question and question type
- Match, True/False Blitz, Fill in the Blank and Battle revision games
- Extended-writing practice with timers and model answers
- Leaderboard with daily-progressing rivals
- A reasoning test shared by both units: number and letter series, verbal analogies, syllogisms,
  spatial and quantitative problems, with an optional timer and a per-category breakdown. It is an
  informal practice quiz, not an IQ test
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
- any file references an external URL, which would break offline use (the one
  exception is a plain link to Pearson's past-papers page, which is opened by the
  student, not loaded by the site)

### Reasoning test questions

The reasoning test reads `data/aptitude.json`, which belongs to neither unit. Each question needs an
`id`, `category` (one of the ids in `categories`), `difficulty` (`easy`, `medium` or `hard`),
`question`, `options` (3 to 5), `answer` (copied exactly from one option) and a short
`explanation`. An optional `figure` is a list of equal-length rows drawn as a grid: `.` is a blank
square, `#` a shaded one and any other character a labelled square, which is how the cube nets are
drawn. Options are shuffled for every attempt, so explanations must never say "option B".

The validator checks the structure (the answer matches exactly one option, no duplicate options,
every category has easy, medium and hard questions). It cannot check that the answer is actually
right, so work each new question through by hand.

Marking happens in the browser, because the site has no backend. Anyone can read the answer key in
dev tools. That is fine for a practice quiz.

Section colours, display order, short names and blurbs live in the `UNITS`
manifest at the top of `app.js`, not in the JSON. Unit 1's display order is
C, D, B, E, A, F, which is deliberate and is not derivable from tier.

## Running locally

Open `index.html` directly, or serve the folder:

```bash
python -m http.server
```

then visit `http://localhost:8000`.

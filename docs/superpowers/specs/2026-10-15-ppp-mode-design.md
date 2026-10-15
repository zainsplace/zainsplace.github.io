# PPP mode (Pure Past Papers) for Unit 1

Date: 2026-10-15

## Goal

Add the Pure Past Papers revision method to the Questions tab of the revision
app (`revision/`, served at zainsplace.github.io/revision/). In PPP, past papers
and their mark schemes drive all revision: attempt cold, mark strictly, diagnose
every lost mark, fix only those gaps, redo from memory, and re-test mistakes on a
spaced schedule.

Unit 1 (Information Technology Systems) is built first. Unit 2 gets its own short
design afterwards, reusing this engine.

## Decisions made with the user

- PPP is a **new mode in the Questions tab** (`qMode = 'ppp'`), next to Mock
  paper and Quiz. Not a separate page; not bolted onto the mocks.
- Papers are **typed on the site**, as the mocks are.
- Papers must be **AAQ** (first examined May/June 2026), never the 2016-spec
  course. The 2022-2025 papers in the repo history are old-course and are not
  used.
- The **real June 2026 Unit 1 paper (60297T)** goes on the site with its
  **official mark scheme**, retyped word for word (the user's scan carries their
  own annotations, so no image snippets). The user accepted the copyright risk
  of publishing Pearson material on the public site. This reverses the earlier
  rule of linking to Pearson rather than hosting papers, for this paper only.
  Nothing from the user's scan (answers, candidate/centre numbers) is used.
- **3 new original papers** are written in the real paper's format, giving
  **6 full papers**: June 2026, Mock 1, Mock 2, Paper 3, Paper 4, Paper 5.
- **No exam dates anywhere.** The countdown was removed (commit 675ba2c). PPP's
  "final week" phase needs a date, so it is dropped.

## The loop (one sitting)

1. **Attempt cold.** A full paper or a topic set. Scenario stem, then parts,
   typed answers. No notes, no "Watch the wording" traps, no mark scheme.
   Full papers are timed at the paper's tariff (90 marks, 120 minutes) in
   Phase 3 and untimed (time used shown) in Phase 2. Topic sets are untimed.
   The front of the paper says blanks are fine.
2. **Mark strictly.** The existing marker (`renderMarker`: points, chain,
   levels), answer above the scheme. Traps show here, never while answering.
3. **Diagnose every lost mark.** For each part with lost marks, one chip row per
   lost mark, each set to one reason:
   - `knowledge`: Didn't know it
   - `technique`: Knew it, but didn't expand / gave a definition not a benefit /
     didn't apply to the scenario / no conclusion
   - `misread`: Misread the question ("other than...", using vs setting up)
   - `time`: Ran out of time
   - `careless`: Careless
   The student cannot continue until every lost mark has a reason.
4. **Fix the gaps.** Only the parts that lost marks, each with links to its
   topic code's notes (Sections page) and flashcards, and a short box for "what
   the answer should have said". The box is required when any reason is
   `knowledge`; otherwise a one-line tip is shown (the part's traps for
   `misread`, the command-word pattern for `technique`).
5. **Redo from memory.** The missed parts again, blank: no old answer, no
   correction. Marked with the same marker. Full marks clears the part;
   anything less adds it to the mistake log.
6. **Mistake log.** Spaced re-tests after 2, 3, 5, then 7 days. A part leaves
   after two full-mark redos in a row. The PPP screen opens with "Mistakes due
   today".

## Phases (date-free)

| Phase | Sits | Timing | Suggest moving on when |
|---|---|---|---|
| 1. Topic sets | 5-8 parts from one section (A-F) | Untimed | every section has a completed set |
| 2. Full papers | a whole paper | Untimed, time used shown | 2 full papers completed |
| 3. Timed papers | a whole paper | 120 min, fixed end time | (stays) |

The PPP screen shows the current phase and a **Do next** button. The student
can pick any phase; the app only suggests. Moving phase is the student's click.

**Topic set builder.** For section L, take unsealed parts with `section === L`,
preferring parts never tried, then lowest latest score, spreading across
scenarios. Up to 8, at least 5. Each part shows its scenario stem.

**Do next.**
- Phase 1: a topic set for the section with the fewest completed sets
  (ties broken by the unit's `order` in the `UNITS` manifest).
- Phases 2-3: a paper never sat in PPP, else the one sat longest ago that is not
  resting. If every paper is resting, suggest the mistake log or a topic set.
- If mistakes are due, they come first.

## Paper rotation and sealed papers

- After a completed sitting a paper **rests for 21 days** ("rests until
  5 Nov"). Sitting a resting paper is allowed after a confirm.
  Abandoned sittings do not start a rest.
- June 2026 and Papers 3-5 are **sealed**: they appear only in PPP (and as
  single parts in the mistake log). Never in Practice, Quiz, the Mock paper
  menu or battles.
- Mocks 1 and 2 stay unsealed (already in the practice bank). Phase 1 topic
  sets draw only from unsealed parts, so they do not spend the sealed papers.
- Section F has only 3 unsealed parts. **2 extra Section F parts** (standalone,
  exam-style, with context) are written so every section has at least 5.

## Content

### June 2026 paper (id `jun26`)

All 4 scenarios and 15 parts, word for word, including bold "**two**" /
"**one**", the underlined "loss of data" in 3(c), and Q3's room list.

| Part | Marks | Command | Scheme type |
|---|---|---|---|
| 1(a)(i), 1(a)(ii) | 2, 2 | Give | points |
| 1(b)(i), 1(b)(ii) | 4, 4 | Explain | chain (identify, expand) |
| 1(c) | 4 | Describe | points |
| 1(d) | 6 | Discuss | levels |
| 2(a) | 2 | Give | points |
| 2(b)(i), 2(b)(ii), 2(c) | 4, 4, 4 | Explain | chain |
| 2(d) | 9 | Evaluate | levels |
| 3(a) | 6 | Draw | points (Pearson's 7 diagram points, capped at 6) |
| 3(b) | 2 | Explain one | chain |
| 3(c) | 4 | Explain two other | chain |
| 3(d) | 9 | Evaluate | levels |
| 4(a) | 3 | Describe one | chain (reason, justification, expansion) |
| 4(b) | 9 | Evaluate | levels |
| 4(c) | 12 | Evaluate | levels |

Q totals 22, 23, 21, 24 = 90. Pearson's "Accept" and "Do not accept" lists
carry over word for word into `accept` / `reject`, and the do-not-accept
wording also feeds `traps`. Each part gets a section and topic code from the
site's notes. The paper carries `source: 'pearson'`, `ref: '60297T'` and a
copyright line shown on its front page.

### Papers 3, 4, 5 (ids `p3`, `p4`, `p5`)

Each mirrors the real paper:
- 4 scenarios of roughly 22 / 23 / 21 / 24 marks, total exactly 90.
- Each scenario climbs: 2-mark Give, 4-mark Explain, then an extended part.
- Per paper: one Discuss (6), three Evaluate (9), one Evaluate (12), one
  Draw (6).
- Every paper uses "other than..." exclusions and "one" / "other" wording.
- Scenarios are new: no overlap with the hotel, travel agency, financial
  adviser, Just U Games, or the 8 mock scenarios.
- Across the three papers all of sections A-F are covered, weighted towards
  topic codes not yet examined by June 2026 or the mocks. No question repeated
  across papers.
- Mark schemes follow Pearson's patterns: realistic reject lists, level
  descriptors matching the command word (Discuss: no conclusion required;
  Evaluate: conclusion required).
- Model answers in the user's concise style.

Every mark point is checked against the Unit 1 notes before it ships, the same
standard as the Reasoning test's answer key.

## Data

`data/unit1/questions.json` keeps its shape. Additions:

```
papers[]: { id, title, scenarios, sealed?: true, source?: 'pearson',
            ref?: '60297T', copyright?: '...' }
```

New scenarios and questions use the existing fields (`scenario`, `part`,
`section`, `code`, `marks`, `commandWord`, `context`, `question`, `slots`,
`traps`, `markScheme`, `modelAnswer`). A question is sealed when its scenario
belongs to a sealed paper. The 2 extra Section F parts have no scenario.

Per-unit saved state gains `questions.ppp`:

```
ppp: {
  phase: 1 | 2 | 3,
  sittings: [ { id, kind: 'paper' | 'topic', ref, date, status: 'done' | 'abandoned',
                score, max, minutesUsed,
                parts: { qId: { score, reasons: [..], fix, redo } } } ],
  active: {} | { id, kind, ref, step: 'sit' | 'mark' | 'diagnose' | 'fix' | 'redo',
                 startedAt, endAt | null, qIds, answers, scores, reasons,
                 fixes, redoAnswers, redoScores },
  log: { qId: { stage: 0-3, due: 'YYYY-MM-DD', clean: 0 | 1, reasons: [..] } }
}
```

Completed sittings keep scores, reasons, fixes and redo marks, not answer text,
to keep localStorage small. `sittings` is capped at the latest 100.

**Log schedule.** Intervals `[2, 3, 5, 7]` days. Entering the log: stage 0,
due today + 2. Log redo at full marks: `clean + 1`; at 2, the part leaves;
otherwise stage = min(stage + 1, 3), due today + interval. Below full marks:
`clean = 0`, stage 0, due today + 2.

## Code layout

- **`revision/ppp.js` (new):** the pure logic: log scheduling, rest/due dates,
  Do next, phase suggestion, topic set builder, and coercion of saved `ppp`
  state. Plain functions, no DOM. It ends with
  `if (typeof module !== 'undefined') module.exports = {...}` so Node tests can
  load it. Loaded before `app.js` with its own `?v=N`.
- **`revision/app.js`:** PPP screens (home, sit, mark, diagnose, fix, redo,
  log), dispatch from `renderQuestions`, and sealed filtering in
  `practiceList`, `quizPool`, `battleQuestionPool` and the mock menu.
  `defaultUnitState` and `coerceUnit` gain `ppp`. Timers join `stopAllTimers`.
  PPP marks are added to `state.questions.history` and earn 2 XP per mark,
  as mocks do. Redos and log re-tests add history but earn no XP, so
  re-marking the same part can't farm XP.
- **`revision/styles.css`:** PPP screen styles using existing tokens. Red,
  amber and green stay reserved for RAG.
- **`revision/tests/ppp.test.js` (new):** `node:test` + `node:assert`, no
  dependencies. Run with `node revision/tests/ppp.test.js`. `revision/tests`
  is added to `_config.yml`'s `exclude`.
- **`revision/validate_data.py`:** the PPP checks below.

The app stays offline-only: no external requests, inline SVG icons, no fonts.

## Problems and edge cases

- **Refresh, closed tab or unit switch** resumes the active sitting at its
  step. Timed papers use a fixed end time, as the mocks do.
- **Time runs out:** the paper goes straight to marking, and blank parts score 0.
- **Leaving mid-sitting:** the PPP screen offers Resume or Abandon.
- **Saved data referring to a part that no longer exists** is dropped on load.
  Coercion checks every field (as `savedMock` does), so a damaged or edited
  save cannot break the page. Export and Import include `ppp` automatically.
- **Draw parts** keep the existing "draw on paper, then tick" handling in
  sitting, marking and redo.

## Testing

- **Unit tests first (TDD)** for `ppp.js`: log schedule (each stage, clearing
  after two clean redos, reset on a miss), 21-day rest and override, Do next
  in each phase, phase suggestion, topic set builder (min/max, spread,
  sealed excluded), and coercion of bad data.
- **`validate_data.py`** fails when:
  - a paper is not exactly 90 marks, or a scenario's parts don't match its stated total;
  - a part has no section, or its code isn't in the notes;
  - a levels mark doesn't divide by 3;
  - a part id is duplicated;
  - a section has fewer than 5 unsealed parts.
  It also builds the list of practice/quiz/battle questions and confirms no
  sealed part is in it.
- **Browser walkthrough** in the local preview:
  - a topic set, an untimed paper and a timed paper through every step;
  - a mistake-log redo;
  - refreshing mid-sit and mid-diagnose, a unit switch, and the rest warning;
  - phone width and dark mode;
  - no console errors.

## Order of work

1. Engine: `ppp.js` with tests, state, the PPP screens, sealed filtering, using
   the June 2026 paper as the first sealed paper.
2. The 2 extra Section F parts.
3. Paper 3, then Paper 4, then Paper 5: each written, validated and checked
   on its own.
4. Bump asset versions and push once the user has seen it working locally.

## Out of scope

- Unit 2 PPP (separate design afterwards).
- Exam dates, countdowns, and the "final week" phase.
- A print view or handwritten sittings.
- Old-course (2016 spec) papers.

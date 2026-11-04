# Sections tab: Gizmo-style Path, Lessons and Materials

## Why

The Sections tab shows everything about a section on one long page: the definition, key facts and exam tip for each term, plus a confidence rating. Zain feels the information is "just being thrown at me" and nothing makes him apply it. The exam tests knowledge through scenarios, so revision should test it the same way. Gizmo teaches a small chunk, then keeps asking questions on that chunk until he gets them right, and that is what makes it stick. This change rebuilds the Sections tab around that loop.

## How Gizmo does it (checked in Zain's account, 2026-11-04)

- **Deck page tabs:** Path · Materials · Leaderboard. A unit dropdown sits at the top of the Path tab.
- **Path:** a vertical, winding column of hexagonal nodes. Each node shows a name and a card count, for example "Part 1 · 11 cards". The current node is green with a pulsing ring, and the nodes ahead are grey. Section headers (such as "Topic A - IT Systems and Devices") divide the path.
- **Clicking a node** opens a small "Study" dialog (Memorize / Live) with a "Let's go" button.
- **Lesson screen:** an X to close, the topic name, a progress bar, and an XP counter. A card is labelled New or Forgotten and shows the question. Underneath, "Think of the answer first to do active recall" sits above a **Show options** button. After that come 3–4 options, plus Hint (greys out one wrong option), Reveal, and Explain (shows the answer highlighted in the sentence, an explanation, and a Continue button).
- **Answering:** a correct answer gives +XP, a short pause, then the next question. The same fact comes back reworded. For example, PaaS was asked as "Which service provides a development platform…", and hybrid cloud came up as a fill-the-gap question.
- **Materials:** a list of the deck's cards, each showing a question and its answer, with "View all".

## Goals

1. Clicking **Sections** opens a **Path** for the active unit. The path is a winding column of nodes grouped under section headers, in the unit's existing section order (`UNITS[u].order`).
2. Clicking a node starts a **lesson**: one question at a time, Gizmo-style, made mostly of scenario questions, with fill-the-gap and definition questions mixed in.
3. You **teach first, then test**. The first time a term appears in a lesson, a "New" card shows its definition, example and exam tip. A "Got it" button leads into that term's questions.
4. **Repeat until mastered.** A wrong answer shows the correct one with a one-line explanation. That question then goes back into the queue a few cards later. The lesson ends only when every question has been answered correctly.
5. A **Materials** tab next to Path holds the full notes. It shows a list of sections, and opening one shows today's existing one-page view with its ratings. Nothing that exists now is lost.
6. It works at phone width and in both themes.

## Non-goals

- Spaced repetition across days. The Flashcards tab already does this.
- Hearts, keys, coins, the Live/multiplayer mode, AI "Ask a friend", and the Study dialog. Clicking a node goes straight into the lesson.
- Changing the Questions, Flashcards or Games tabs.

## Anti-goals

- Questions that are just "What is X?" over and over. Most questions per term must make you apply the idea to a situation.
- Questions whose answer you can spot from the wording. Distractors must be real terms from the same section.
- Losing existing ratings, reviewed marks or saved progress.

## Structure of the path

- **One node per subtopic** (for example C1.1 Cloud Computing Models). A subtopic with more than 10 terms is split into "Part 1 / Part 2…" of at most 8 terms each. *(My call, sized to match Gizmo's 8–13 cards per step.)* That gives roughly 80–90 nodes across both units.
- Node label: the subtopic title, with "N terms · M questions" below.
- Node states: **done** (green), **current** (the first node that isn't done; green with a pulsing ring), and **not started** (grey). Every node stays clickable; nothing is locked. *(My call. Gizmo doesn't lock nodes either.)*
- A "Jump to next" button at the top scrolls to the current node.
- Unit switching uses the app's existing unit switch.

## Lesson behaviour

- The top bar has an X (back to the path), the section name, a progress bar of answered-correct out of total, and the XP earned this lesson.
- **Question card:** a New/Review label, the question, then "Think of the answer first" with a Show options button. Clicking that reveals 3–4 shuffled options. *(Copied from Gizmo because it forces active recall.)*
- **Hint** greys out one wrong option. **Reveal** shows the answer and counts as wrong.
- **Correct:** the option turns green, the "Why" line shows briefly, and the lesson moves on after about 1 s or a click.
- **Wrong:** the chosen option turns red and the correct one green. The explanation appears with a Continue button. The question goes back into the queue 3 cards later, or at the end if fewer than 3 remain.
- **Order:** for each term, its New card comes first, then its questions. *(My call: questions from different terms are mixed after the first pass, so you can't answer by pattern.)*
- **End screen:** score on the first attempt, terms to watch (any you missed), and buttons for "Back to path" and "Retry missed".
- **Saving progress:**
  - When a lesson finishes, the node is marked done.
  - Each term's confidence rating (`state.rag`) is set to green if all its questions were right first time, or amber otherwise. Those ratings already feed the progress bars, plan and home page.
  - XP: +5 per question answered right first time, using the app's existing XP function.
  - A lesson closed halfway is not saved. *(My call.)*

## Questions content

- Each spec term (332 in total) gets **at least 2 questions**: at least one scenario question, plus one fill-the-gap or definition question. Every question has 3–4 options and a one-line `why`.
- Source material: the term's `definition`, `examples`, `keyFacts` and `examTip` in the existing section JSON.
- UK spelling, matching BTEC vocabulary.
- **Storage:** `revision/data/unit1/lessons/<letter>.json` and `revision/data/unit2/lessons/<letter>.json`, keyed by term code:
  ```json
  { "C1.1.1": [ { "type": "scenario", "q": "...", "options": ["...","...","..."], "answer": 0, "why": "..." } ] }
  ```
- `build_inline.py` adds a `lessons` object to each unit in `data_inline.js`.
- `validate_data.py` checks that every term has ≥ 2 questions and that each question's `answer` points to one of its `options`.

## State

`defaultUnitState()` gains `lessons: {}`, mapping a node id such as `"C1.1"` or `"A1.2#2"` to `{ done: true, date, firstTry, total }`. It goes through the same coercion and migration path as the other keys, so old saves and backups still load.

## Left to the builder

- The visual details of the node shape, colours, animation and spacing. They should fit the site's existing theme tokens and section colours rather than copy Gizmo's palette.
- The exact algorithm for splitting large subtopics.
- How the Path and Materials tabs show up in the URL hash, if the app uses one.

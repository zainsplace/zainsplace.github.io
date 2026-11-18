# Put both BTEC IT units into Gizmo, word for word

## Why

Zain is making Gizmo (app.gizmo.ai) his main revision tool. His notes for Unit 1 (sections A–F, 232 terms) and Unit 2 (A–D, 100 terms) already exist in `revision/data/`, written and checked by him. He wants them in Gizmo, ready to revise, without Gizmo's AI rewording them.

## What we found in Gizmo (2026-11-16, his account)

- Decks can be nested (a deck can sit inside another deck).
- Card templates: Q&A, Multi-select, Fill the blanks, Order items, Match pairs, True/False, Image.
- **Every import route (Sheets, Anki, Paste notes, PDF, Quizlet...) goes through Magic Import, which is AI.** A 2-row test paste came back as 4 rewritten cards ("Which device types are examples of PCs?").
- **The manual editor (Add → Cards → Write your own) saves cards exactly as typed.** Tested: "What are Personal Computers (PCs)?" saved word for word.
- Add → Notes creates freeform notes, separate from cards.

## Goals

1. Every one of the 332 spec terms is a card in Gizmo, in his wording.
2. The decks follow the spec, so a weak section or topic shows up on its own.
3. His full notes (key facts, example, exam tip) sit next to the cards to read.

## Non-goals / anti-goals

- No AI-generated or reworded cards. Gizmo's own quiz formats (MCQ, typing) are built from his cards, which is fine.
- No changes to anything in `revision/data/`.
- Sealed past papers (June 2026, P3–P5) are not imported. They stay unseen for mocks.
- Nothing is shared publicly or added to a class.

## Approaches

- **(a) Exact entry through the manual editor (chosen by Zain).** Accurate. Slower to load, but the loading is automated.
- (b) Upload notes and let Magic Import generate cards. More variety, but it drifts from the spec, as the test showed.

## Design

**Deck layout.** One top-level deck per section and one sub-deck per spec topic:

```
U1 A · IT Systems and Devices
  ├ A1 · Functions and Use of Digital Devices, and Notation
  ├ A2 · ...
U1 B · Transmitting Data
...
U2 D · Forensic Procedures
```

That makes 10 top-level decks and 21 topic sub-decks. Unit 1 decks are blue and Unit 2 decks are red, matching the site.

**Cards (about 360).** For each term:
- If `flashcards.json` has cards for that term's code, use those cards (front → back) as written.
- If not, use one Q&A card: "What is {term}?" → {definition}.

**Notes.** One Gizmo Note per topic, generated from the JSON: each term with its definition, key facts, example and exam tip.

**Loading.** A script, `tools/gizmo_export.py`, writes one JSON per topic deck to the scratchpad. Cards are then entered through the manual editor in Chrome, a batch at a time, and each deck's card count is checked against the export.

**Clean-up.** The test sub-deck "TEST import (to delete)" (4 AI cards) is deleted. The one test card in U1 A moves into A1.

## Calls left to the builder

- Whether a Note can be attached inside a topic deck or only at the top level. If only at the top level, use one Note per section.
- The batch size per Chrome run.

## Optional, later

- An "Exam practice" sub-deck per section, built from the unsealed 2–3 mark questions in `questions.json`: question → model answer (about 60 cards).

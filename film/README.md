# Film Studies Revision

Eduqas A-Level Film Studies revision site, built on the same engine as the BTEC IT revision site
(`Documents/unit2-revision/revision`), without the Reasoning tab.

## Open it
Live at **https://zainsplace.github.io/film/** (folder `film/` of the zainsplace.github.io repo).
Or double-click `index.html`: it runs offline with no server and no internet.
Progress is saved in that browser only. Use **Plan → Export progress** to move it to another device.

Storage keys all start with `film_`, so this site never reads or overwrites the BTEC IT site's progress.

## What's in it
- **Component switch (C1 / C2)**, which works like the ICT site's unit switch.
  - C1: Section A Hollywood (Casablanca vs Bonnie and Clyde), B American (Joker, Get Out), C British (Trainspotting, Shaun of the Dead)
  - C2: Section A Global (Pan's Labyrinth, City of God), B Documentary (Amy)
  - K: Film Toolkit (film form, meaning and response, contexts, exam skills), shown in both components
- **Plan**: a day-by-day timetable from 6 Nov to 25 Nov 2026. Each session is labelled FILM or BTEC IT:
  - about 60% ICT until 15 Nov, then 75% ICT on 16–17 Nov
  - 18 Nov is ICT only, and 19 Nov is the ICT exam
  - 20–24 Nov is Film only, and 25 Nov is the Film mock
  - Film sessions start with Casablanca/Bonnie and Clyde and Amy, then move to your weakest-rated sections
  - Missed sessions roll forward as catch-up
  - Session counts and session length can be changed in Plan settings
- Sections (path + notes with red/amber/green ratings), Flashcards (spaced repetition), Exam Kit, Questions
  (practice, quiz, timed mock papers, Pure Past Papers, all marked with the five Eduqas bands), Extended writing
  (timed intro + paragraph), Games, Leaderboard, Profile and Search.
- Web-researched notes (Casablanca, Bonnie and Clyde, Amy and some production facts) were checked against online sources in Nov 2026. Add `"verify": true` to any note to show a CHECK THIS badge on it.

## Edit content
1. Notes: `data/unit1/{a,b,c}.json`, `data/unit2/{a,b}.json`, `data/shared/k.json`. Keep each `definition` under 120 characters and never use the `<` character.
2. Flashcards: `tools/make_flashcards.py`. Questions: `tools/make_questions.py`. Extended prompts: `tools/make_extended.py`. Run the one you edited.
3. Rebuild and check:
   ```
   python build_inline.py
   python validate_data.py
   node --test tests/league.test.js tests/ppp.test.js tests/timetable.test.js
   ```

Silent cinema and Experimental film (C2 Sections C and D) are not covered yet.

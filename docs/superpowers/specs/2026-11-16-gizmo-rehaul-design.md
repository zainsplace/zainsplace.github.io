# Revision site rehaul: learn the way Gizmo teaches, with no hearts

## Why

*Updated 18 November:* Zain wants the site to **look** like Gizmo as well as teach like it: "I like everything about how it teaches you, it has much more different features and the ui itself is more appealing than ours." He chose to build the rehaul in the new look from the start, so nothing is styled twice. See "Look and feel" below.

Zain prefers studying on Gizmo to studying on his own site. The one thing he dislikes about Gizmo is hearts, because they cap how much he is allowed to learn in a sitting. He wants the whole revision site to work like Gizmo, built as our own version, for his two BTEC IT units, with his revision notes kept exactly as they are.

The Sections tab got a first Gizmo-style path on 4 November. The rest of the site (Home, Flashcards, Games, Plan) still works its own way, and lessons are forgotten the day they are finished. This change makes Gizmo's loop the centre of the site.

## How Gizmo teaches (walked through in Zain's account, 2026-11-16)

**Path.** A deck opens on Path · Materials · Leaderboard. The path is a winding column of nodes ("steps") of 8 to 13 cards under topic headers. Each node shows a **mastery ring with a percentage** (13%, then 63% after one round). A step is not done or not done; it fills up over several rounds.

**Study dialog.** Clicking a node offers Memorize (active recall quizzes), Gizmo Live (play friends), AI Tutor Lesson, and Practice Test, which stays locked until enough questions have been answered.

**A round.** About 11 questions. The top bar has X, the topic, a progress bar, previous and next arrows, keys, hearts, a combo multiplier and the XP earned this round.

**Card status decides the question format.**
- *New* and *Forgotten*: multiple choice, with the options hidden behind "Think of the answer first to do active recall" and a Show options button.
- *Mastered*: typed answer, including typed fill-the-gap. Small spelling mistakes are accepted ("privat cloud" passed).
- Also seen: multi-select ("Which of the following are examples of SaaS?", each right pick turns green, the card completes when all are found) and True/False (shown straight away, no Show options).
- *Retry*: a card answered wrong, or opened with Explain, comes back at the end of the same round.

**Answering.**
- Right: the option turns green, a flash shows when the card is next due ("+365 days"), XP is added and the next card loads by itself. Consecutive right answers build a multiplier (1.5x, then 2x).
- Wrong: the option turns red and is then greyed out, a heart is lost, and **you try again on the same card**. The answer is not given away. The card earns no XP and returns as Retry.
- Hint spends a key and greys out one wrong option. Reveal shows the answer. Explain opens a short lesson under the card (a heading, key points, a comparison table) with "Explain like I'm 5", "More detail" and "Ask a question", then Continue.

**Quiz settings.** Question style (Mixed, Multiple choice only, Typing preferred, Flashcards only), Hide options initially, Lightning rounds, Spelling mistakes allowed.

**End of round.** A reward screen, then "You've just overtaken …" on the leaderboard, then Round Complete: XP earned, the step's ring with the gain ("63%, +50%"), buttons for Hard round, Speed-run and Next round, and a list of every card answered with its answer and an Explain button.

**Home.** "Jump back in" cards showing each step's ring, friend challenges and leaderboards. The deck leaderboard ranks by XP.

## Goals

1. The site's main loop is Gizmo's: pick a step, play a round, watch the ring fill, play the next round.
2. Every term is remembered across days. A term that is due comes back labelled Forgotten; a well-known term is asked in a harder format.
3. No hearts and no keys. Nothing ever stops him studying, and hints are unlimited.
4. Explain is built from his own notes, unchanged: the definition, key facts, example, exam tip and any comparison table for that term.
5. The site is organised around that loop instead of around a dozen separate tabs.
6. Still works offline with no network requests, at phone width, in both themes.

## Non-goals

- Gizmo's social features: friends, following, study groups, public decks, school leaderboards, sharing.
- Importing material (files, YouTube, photos) and AI generation. The decks are his two units.
- AI Tutor chat and "Ask a question". The site has no backend and must stay offline.
- The monster egg and Gizmo's mystery chests. (Coins are in: see "Coins, pets and the shop".)
- Changing how exam questions, past papers (PPP), mocks, extended writing or the reasoning test work.

## Anti-goals

- Any limit on how much he can study: lives, keys, daily caps, locked steps.
- Any change to the wording of the notes in `data/<unit>/<letter>.json`. *(Exception, Zain 18 November: after the spec audits in `.superpowers/sdd/2026-11-18-gizmo-rehaul/audit-unit1.md` and `audit-unit2.md`, he asked for every finding to be fixed: wrong facts, off-spec items, broken questions, awkward wording and coverage gaps. Notes are changed only where an audit finding says so, checked against the official spec.)*
- Losing saved progress: ratings, finished lessons, flashcard history, XP, streaks, league standing, exam marks.
- Copying Gizmo's name, logo, mascot, 3D artwork or its "Booster" font. We take the layout, the behaviour and the visual style, colours included (Zain asked on 18 November for the look to copy Gizmo too).
- Questions that can be answered by spotting the wording (the rule from the 4 November design still holds).

## Approaches

**A. Rebuild the site around Gizmo's layout (chosen).** One study engine, a new Home, a Learn area with Path · Materials · Leaderboard, and an Exam area for written practice. The Flashcards, Games and Plan tabs are removed because the round does their job.

**B. Keep today's tabs and put the round inside each.** Nothing is removed, but it stays a collection of separate tools, which is the thing he doesn't prefer.

**C. Pure Gizmo: only Home, Path, Materials and Leaderboard.** The closest copy, but it deletes past papers, mocks and extended writing, the only part that practises the written exam.

A is chosen because he asked for the site to be Gizmo, and the exam is written, so the exam practice he built has to stay. *(My call; Zain has not yet picked between A, B and C in so many words.)*

**Order of work (Zain chose, 18 November):** build the new look first as a set of shared styles and components, then build each new screen straight in it. The alternatives were reskinning today's site first (wasted on the tabs being removed) or rebuilding behaviour in today's look and reskinning later (every screen styled twice).

## Design

### Look and feel (seen in Zain's Gizmo account, 18 November)

Today's site is muted cream and teal with 8px corners and dense pages. Gizmo is the opposite, and the site moves to Gizmo's style.

**Tokens.** All existing pages pick these up through `styles.css`, so Exam pages change look without changing behaviour.

| Token | Light | Dark (ours; Gizmo has no dark mode) |
|---|---|---|
| Page background | `#F8FAFC` (cool off-white) | `#0B1120` |
| Card surface | `#FFFFFF` | `#151E30` |
| Hairline / card border | `#E2E8F0`, 2px on answer cards | `#26324A` |
| Text / muted text | `#0F172A` / `#64748B` | `#E2E8F0` / `#94A3B8` |
| Primary button (filled) | `#0F172A`, white text | `#E2E8F0`, dark text |
| Focus / progress / current card | sky `#38BDF8` (3px ring on the card) | same |
| Right | text `#16A34A` on mint `#DCFCE7` | `#4ADE80` on `#14301F` |
| Wrong / Retry | `#DC2626` on `#FEE2E2` | `#F87171` on `#3A1717` |
| Unit colours | Unit 1 sky blue, Unit 2 red (already the site's) | same |

- **Shape.** Cards 24px corners, nav items and small cards 16px, every button and chip a full pill. Soft shadow `0 4px 16px rgba(2,6,23,.06)` plus a 1px hairline ring instead of borders on floating cards.
- **Type.** Inter for everything (body 16px, card question 20px bold, answer options 16px bold, centred). A chunky rounded display font for big moment titles only ("Study", "Round Complete", "3 day streak!"), set slightly wavy. Both self-hosted woff2 under `fonts/` with their OFL licences, like Newsreader today. *(My call: Inter plus Fredoka; Gizmo's own display font is not free to copy.)*
- **Icons.** Colourful emoji in place of Gizmo's 3D art (🎮 Study, 📚 Materials, 🏆 Leaderboard, 🔥 streak, 💡 hint, 🔍 reveal, 🧠 explain, 😈 hard round, ⚡ speed-run). Offline and no artwork copied.
- **Space.** One centred column, about 620px wide, with lots of white space; one idea per card.
- **Motion.** Option press, green fill on right, red shake on wrong, the "+N days" flash, ring filling on Round Complete, confetti on step mastered. All off under `prefers-reduced-motion`.

**App shell.**
- Desktop: a 240px left sidebar (site name, then Home, Learn, Exam, Search, Profile as icon + label rows; the active row is a pale 16px-rounded pill), a large dark **Study** pill that starts the next step's round, and the unit's sections listed below it with their colour square. A right rail (about 360px) holds a stats card: streak, XP, league position, Forgotten count.
- Phone: sidebar becomes a bottom tab bar, right rail moves to the top of Home.
- On scroll, a page's title and its pill tabs (Path · Materials · Leaderboard) shrink into a sticky top bar.

**Screens as Gizmo draws them.**
- *Learn header:* unit colour square, unit name in large bold, a dark "Study unit" pill on the right, then underline-style tabs that become dark pills when sticky.
- *Path:* nodes in a gentle S-curve down the column, each a rounded badge with a sprout icon, title and "N cards" beside it. Not started: grey badge, muted title. Current: green badge with a soft pulsing halo. Started: the ring fills green around the badge with the percentage inside. A floating "↑ Current step" pill appears when the current node is off screen.
- *Study dialog:* centred modal, display-font "Study", the node badge, step name, option cards with emoji (selected = green border on mint), a "More ways to study ⌄" expander for the rest, and a full-width dark "Let's go" pill.
- *Round:* top bar with X, unit name centred, settings gear, a full-width sky progress bar. Under it: back arrow, a pill holding combo and an XP chip (green once XP > 0), forward arrow. The question card has the sky ring, a status label top-left (🌱 New in green, ↻ Retry in red, Forgotten amber, Mastered purple) and the question in bold. Options are full-width 2px-bordered pills. The "Think of the answer first" panel is a card with a 💡 and a "Show options" footer. Below: a 2×2 grid of pill buttons, Hint · Reveal · Explain · (fourth slot: Simpler).
- *Right answer:* the option turns mint with green text, a small centred flash shows "+N days" and "+10 XP", and the next card slides in after about a second.
- *Explain:* opens under the options as a chat-style block: an emoji heading, the definition with key words bold, bulleted key facts with an emoji each, example, a "Key takeaway" line (the exam tip), the comparison table if any, then chips (Simpler · More detail), and a sticky full-width dark "Continue" bar at the bottom.
- *After a round:* a streak screen when the streak grows (display-font "N day streak!", the week as a row of day circles with the studied days filled), then Round Complete: display title, XP chip, a card with the step name, the big ring with a "+N%" badge, Hard round and Speed-run pill buttons, "Cards answered" as cards each with the answer and an Explain pill, and a sticky dark "Next round" bar.
- *Materials:* each term as a card, term in bold on top, definition below a dashed divider. Key terms that are glossary entries are shown as mint chips inside the text (display only; wording unchanged).
- *Leaderboard:* a "Battle" card at the top with a Start pill, then rows; your own row mint with a medal and an XP chip.
- *Home:* greeting in display font, "Jump back in" as a horizontal row of step cards each with its ring, "Forgotten today" card with a dark Review pill, then the league card.

**Left out of the look:** mystery chests, the mascot, hearts and keys counters, invite/share banners.

### Site layout

```
Home          Jump back in · Forgotten today · streak, XP, league
Learn         Path · Materials · Leaderboard        (active unit)
Exam          Questions · Past papers · Mocks · Extended · Exam kit · Reasoning
Search
Profile
```

- The unit switch stays where it is; it plays the part of Gizmo's deck list.
- **Removed tabs:** Flashcards, Games, Plan (Zain agreed, 18 November, on condition there is a backup).
- **Backup:** before any rehaul code lands, the current site is tagged `pre-gizmo-rehaul` in git and a copy is pushed as branch `backup/pre-gizmo-rehaul`, so the old site can be restored whole if he doesn't like the result. Saved progress stays compatible both ways: the rehaul only adds keys and never deletes `flashcards`, `rag` or `lessons`, so the old site still reads a browser that used the new one.
- Battles against the league rivals move to Learn → Leaderboard, as our version of Gizmo Live.
- Old links (`#flashcards`, `#games`, `#plan`, `#sections`) redirect to the nearest new page.

### Memory: one record per term

Each spec term (332 across both units) gets a record: `{ strength 0–5, due date, last seen, lapses }`.

- Status comes from the record: **New** (never seen), **Learning** (strength 1–2), **Mastered** (strength 3+), **Forgotten** (due today or earlier).
- Right first time moves strength up one and sets the next due date from an interval ladder (1, 3, 7, 16, 35, 90 days). The flash after a right answer shows that interval ("+7 days").
- Wrong, Reveal or Explain-before-answering drops strength by two (never below 1) and makes the term due tomorrow.
- A step's ring is the average strength of its terms, as a percentage.
- This replaces the Flashcards tab's Leitner boxes. *(The ladder is my call; Gizmo's exact intervals aren't visible.)*

### Path

- Same nodes as today: one per spec subtopic, in the unit's section order, split into parts when a subtopic has more than 10 terms.
- Each node shows its ring and percentage in place of the done tick. The current node is the first one under 100%, with the pulsing ring. Nothing is locked.
- A badge on a node shows how many of its terms are Forgotten.
- Clicking a node opens the study dialog.

### Study dialog

- **Memorize**: the normal round.
- **Hard round**: every question typed, no hints.
- **Speed-run**: the same round against a clock per question.
- **Battle**: goes to a battle against a league rival on this step's terms.
- **Practice test**: opens exam questions for this step's section. Unlocked from the start, since nothing is locked.

### A round

- Up to 11 cards. Forgotten terms from this step come first, then Learning, then New, topped up with Forgotten terms from earlier steps.
- **New terms are taught first**, in batches of three, on a card showing the notes for that term. This is kept from the 4 November design because Zain asked for teach-then-test; Gizmo itself asks cold.
- Format by status: New, Learning and Forgotten get multiple choice with hidden options (scenario questions first). Mastered gets typed answers and typed fill-the-gap. True/False and multi-select are mixed in where the data supports them.
- Top bar: X, step name, progress bar, previous and next arrows to look back over this round's cards, combo multiplier, XP this round. No hearts, no keys.
- **Right**: green, the "+N days" flash, XP times the multiplier, auto-advance. The multiplier rises to 1.5x at three in a row and 2x at five, and resets on a wrong answer.
- **Wrong**: the option turns red, then greys out, and he tries again on the same card. No XP. The card returns at the end of the round labelled Retry.
- **Hint** greys out one wrong option, unlimited. A hinted card earns no XP.
- **Reveal** shows the answer and treats the card as wrong.
- **Explain** opens the term's notes under the card: the definition, then key facts, the example, the exam tip and the comparison table if its subtopic has one. "Simpler" shows the short flashcard wording; "More detail" opens that term in Materials. The card then returns as Retry.
- Closing a round halfway keeps what was answered. *(Changed from today, where a half-finished lesson is thrown away.)*

### "I was right" on typed answers (Zain, 18 November)

Typed answers are sometimes marked wrong when he was right (seen: "Passwords, Multi-factor Authentication" rejected for "Passwords and Multi-Factor Authentication (MFA)"). So:
- After a typed or fill-the-gap answer is marked wrong, an **"I was right"** button appears beside the correct answer. Pressing it counts the card as right first time: the wrong result is undone in memory (strength and due date go back to what they were, then the right result is applied), the usual XP is banked, the Retry copy is removed, and the combo is not reset. It is offered once per card and not after Reveal, Explain or a hint.
- Typed checking is made fairer: "and", "&", commas and slashes are ignored when comparing, and for a term like "X and Y (Z)" each of "X", "Y" and "Z" is accepted on its own as well as together.

### Round settings

Question style (Mixed, Multiple choice only, Typing preferred, Flashcards only), Hide options initially, Spelling mistakes allowed. Saved per browser. "Flashcards only" shows the term's flashcard to flip and self-mark, which is what remains of the old Flashcards tab.

### End of round

1. If the XP earned moved him past a league rival: "You've just overtaken …".
2. Round Complete: XP earned, the step's ring with its gain, Next round, Hard round, Speed-run, Back to path, and every card answered with its answer and an Explain button.

### Home

- **Jump back in**: the three most recent steps with their rings, and the next step on the path.
- **Forgotten today**: the count of due terms across the unit, with one button that starts a review round of them.
- Streak, XP and league position. A resume card for a mock or past paper in progress, as today.
- The confidence strip, priority topics and section tiles go; the path and rings replace them.

### Materials

Unchanged: the section list, and each section's full notes with ratings, filters and search links. The ratings (red, amber, green) are still his to set by hand, and now also start a term's strength if it has never been quizzed.

### Leaderboard

The weekly league and the battle rating, as today, plus the battle modes that used to sit under Games.

### Exam

One page linking to Questions, Past papers (PPP), Mocks, Extended, Exam kit and the Reasoning test. Each of those pages is unchanged.

### Coins, pets and the shop (Zain, 18 November)

Zain wants coins, spent in a shop on custom accessories, worn by **both his avatar and a pet**, and the pet can be **any kind**: animals, robots, computers, mythical creatures and more. All art is original SVG drawn in code (no Canva or image files), so it works offline, stays sharp, recolours for variants and suits both themes.

**Earning coins.** *(Amounts are my call.)*
- 1 per card right first time (not hinted, revealed or explained).
- +10 for a round with no mistakes; +25 when a step reaches 100%.
- +5 per streak day, paid on the first round of the day.
- Battles: +15 for a win, +5 for a loss. League: +50 for moving up at the week's end, +100 for a top-3 finish.
- Exam pages earn coins too (+20 for finishing a past paper or mock part) so written practice isn't the poor relation.
- Coins never go down except when spent. Round Complete shows coins earned beside XP, as Gizmo does.

**Pets.**
- First visit to the shop: pick one free starter from four (cat, dog, robot, little computer).
- More pets are bought in the shop. Roster at launch, about 20: everyday (cat, dog, fox, rabbit, owl, penguin, frog, panda, hamster), tech (robot, little computer, drone, floppy-disk buddy), mythical (dragon, unicorn, phoenix, griffin, kraken, yeti, slime). Everyday 150–300 coins, tech 300–500, mythical 600–1,500. No axolotl, since that is Gizmo's mascot.
- Owned pets live in a collection; one is active at a time and can be swapped freely.
- The active pet sits on Home and appears on the round screen's flash and on Round Complete, cheering on a right answer and on finishing. Its mood follows the streak: happy if he studied today, sleepy if not. It never gets sad, hungry or ill, and nothing is ever lost by not studying (the no-limits anti-goal).
- Pets can be renamed.

**Accessories.**
- Slots: hat, face (glasses, masks), neck (scarves, chains, bow ties), back (capes, wings, jetpacks), held item, and for the avatar only, background and frame. Plus effects (sparkles, flames, glitch) that work on either.
- **Fit every pet:** each pet's SVG declares anchor points (head top, eyes, neck, back, hand) with a scale and angle. Every accessory is drawn once on a shared grid and placed on those anchors, so one hat fits a cat, a robot and a dragon. Adding a new pet means only setting its anchors.
- Bought items are owned once and wearable by the avatar and any pet at the same time.
- Colour variants of an item are separate cheap purchases.
- About 40 items at launch, 50–800 coins. A few are not for sale and unlock at milestones: each league tier, 7/30/100-day streaks, all of a unit's steps mastered. Shown locked with how to get them.
- Your avatar (emoji or photo plus colour, as today) wears its accessories wherever it appears: Home, the leaderboard and battles.

**Shop page.** Under Profile, plus a coin counter in the right rail and phone header that opens it. Tabs: Pets · Accessories · Avatar. A large preview at the top shows the active pet and avatar wearing whatever is being browsed before buying. Item cards in the Gizmo style: white, rounded, price chip with a coin, "Owned" / "Wear" states. Buying asks once ("Buy Wizard hat for 200 coins?").

## Saved progress

- A new `memory` map is added to each unit's state and goes through the same coercion and migration as every other key.
- On first load it is seeded from what exists: terms in finished lessons start at strength 2, or 3 if rated green; flashcard boxes map to strength for their term; red-rated terms start at 1 and are due now.
- `rag`, `lessons`, `flashcards` and everything else stay in the saved state untouched, so old backups still import and nothing is lost.
- XP, streak, activity heatmap and league keep working through the existing functions.
- Coins, owned pets, active pet and names, owned accessories and what each wearer has on are **global** (beside `profile`, not per unit), added to `GLOBAL_KEYS` and coerced on load like the rest. On first load coins are seeded at 1 per 10 XP already earned, so past work counts. *(My call.)*

## Constraints

- Vanilla JavaScript, no build step beyond `build_inline.py`, no network requests, strict CSP.
- `validate_data.py` must still pass, and `data/` content files are not edited.
- Node tests exist for `league.js` and `ppp.js`; the memory model gets the same treatment in its own file.

## Decided by Zain (18 November)

1. **Flashcards, Games and Plan tabs are removed**, with a git backup of the old site (see "Backup"). Quick-fire MCQ, Match, True/False Blitz and Fill in the Blank go; battles stay.
2. **Hints are unlimited** but a hinted card earns no XP.
3. **Teach-first is kept** for New terms, though Gizmo asks cold.
4. **Coins are in**, spent in a shop on pets and accessories worn by both the avatar and the pet; pets of every kind including mythical. Details in "Coins, pets and the shop".
5. **The review ladder** is 1, 3, 7, 16, 35, 90 days.
6. **Practice test is never locked.**

## Left to the builder

- Visual details of the ring, the combo badge, the "+N days" flash and the study dialog, in the site's own theme tokens.
- Which terms have clean enough `examples` data for multi-select questions; leave the format out for any that don't.
- The per-question time for Speed-run.
- Exactly how a round is topped up when a step has fewer than 11 questions.

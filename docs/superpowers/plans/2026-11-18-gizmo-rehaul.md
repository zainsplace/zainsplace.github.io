# Gizmo Rehaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the revision site (`revision/`) to teach and look like Gizmo: a Gizmo-style visual system, per-term memory with mastery rings, Gizmo rounds with no hearts, a Home / Learn / Exam layout, and coins spent in a shop on pets and accessories.

**Architecture:** New logic goes in small pure modules (`memory.js`, `coins.js`, `shop-data.js`) built like `league.js`: an IIFE that sets a global and also `module.exports`, so Node tests load them. UI goes in `learn.js` (path, study dialog), `round.js` (round and end screens) and `shop.js` (shop page), which use `app.js` globals (`state`, `store`, `saveState`, `el`, `escapeHTML`, `toast`, `today`, `gainXP`, `bumpActivity`). The visual system is a token rewrite at the top of `styles.css` plus shared component classes, so untouched pages (Exam) restyle for free. Each phase leaves the site working.

**Tech Stack:** Vanilla JS, CSS, HTML; Node's built-in test runner (`node --test`); Python for `build_inline.py` and `validate_data.py`; no build step, no network.

**Spec:** `docs/superpowers/specs/2026-11-16-gizmo-rehaul-design.md`

## Global Constraints

- No network requests; CSP in `revision/index.html` stays as is (`connect-src 'none'`, `img-src 'self' data:`). Fonts are self-hosted woff2 under `/fonts/` with their OFL licence files.
- Vanilla JS, no build step beyond `build_inline.py`. Files under `revision/data/` are never edited.
- `python revision/validate_data.py` passes and `node --test revision/tests/` passes at the end of every task.
- Saved progress is never lost: `rag`, `lessons`, `flashcards`, XP, streak, `xpByDay`, league, battles, exam history stay in saved state untouched. New keys only.
- No hearts, keys, daily caps or locked steps anywhere. Hints unlimited; a hinted card earns no XP and no coin.
- Works at 360px wide, in light and dark themes, and honours `prefers-reduced-motion`.
- No Gizmo name, logo, mascot (axolotl), 3D art or "Booster" font. Art is original inline SVG and emoji.
- Bump the `?v=` query on every changed `<script>`/`<link>` in `index.html`.
- Commit messages follow the repo style ("Area: what changed") and end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Old save, first load:** a browser with today's saved state (lessons done, flashcard boxes, red ratings, 3,000 XP) opens the new site → memory seeded, coins seeded once (not again on reload), nothing in old keys changed. Tested in Task 4 and Task 11.
2. **Going back to the backup:** after using the new site, the old site (tag `pre-gizmo-rehaul`) still loads the same browser's state without error, because only keys were added. Checked in Task 15.
3. **Tiny steps:** a step with 1 term (many U1 B nodes have 1 card) still makes a round, topped up from earlier steps, and never repeats the same question twice in a row. Tested in Task 3.
4. **Closing mid-round:** X after 3 of 11 cards keeps those 3 results in memory and XP; reopening starts a fresh round. Checked in Task 7.
5. **Buying with too few coins / double click:** the Buy button is disabled below the price and a purchase can't be applied twice. Tested in Task 12.

---

## Phase 0: Backup

### Task 1: Tag and branch the current site

**Files:** none changed.

- [ ] **Step 1:** Commit the two spec files and this plan first (they are untracked): `git add docs/superpowers && git commit -m "Docs: Gizmo rehaul spec and plan"`.
- [ ] **Step 2:** `git tag pre-gizmo-rehaul` on the commit before any rehaul code, and `git branch backup/pre-gizmo-rehaul`.
- [ ] **Step 3:** Ask Zain before pushing; on yes, `git push origin pre-gizmo-rehaul backup/pre-gizmo-rehaul`.
- [ ] **Step 4:** Create the working branch `gizmo-rehaul` from `main`. All later commits go there.

Verify: `git tag -l pre-gizmo-rehaul` and `git branch -l backup/*` list them.

---

## Phase 1: Look

### Task 2: Visual system (tokens, fonts, shell, components)

**Files:**
- Create: `fonts/inter-latin-wght-normal.woff2`, `fonts/OFL-Inter.txt`, `fonts/fredoka-latin-wght-normal.woff2`, `fonts/OFL-Fredoka.txt`
- Modify: `revision/styles.css:1-70` (tokens and dark tokens), sidebar/top-bar rules, buttons, cards; `revision/index.html` (theme-color `#0F172A`, add right rail and bottom tab bar containers)

**Interfaces:**
- Produces CSS tokens: `--bg #F8FAFC`, `--surface #FFFFFF`, `--line #E2E8F0`, `--text #0F172A`, `--text2 #64748B`, `--primary #0F172A`, `--on-primary #FFFFFF`, `--sky #38BDF8`, `--right #16A34A`, `--right-bg #DCFCE7`, `--wrong #DC2626`, `--wrong-bg #FEE2E2`, `--forgot #D97706`, `--mastered #7C3AED`, `--r-card 24px`, `--r-sm 16px`, `--r-pill 9999px`, `--shadow-float 0 4px 16px rgba(2,6,23,.06), 0 0 0 1px rgba(2,6,23,.06)`, `--font-ui 'Inter', system-ui, sans-serif`, `--font-display 'Fredoka', 'Inter', sans-serif`. Dark values from the spec table (`--bg #0B1120`, `--surface #151E30`, `--line #26324A`, `--text #E2E8F0`, `--text2 #94A3B8`, `--primary #E2E8F0`, `--on-primary #0F172A`, `--right #4ADE80`/`#14301F`, `--wrong #F87171`/`#3A1717`). Keep the old token names as aliases (`--bg2: var(--surface)`, `--accent: var(--primary)`, etc.) so existing rules still resolve.
- Produces classes: `.g-card`, `.g-pill` (outline pill button), `.g-btn` (filled dark pill), `.g-btn-block`, `.g-chip`, `.g-chip--xp` (green), `.g-chip--coin`, `.g-display` (Fredoka, `transform: rotate(-2deg)` on alternate letters via `.g-wavy span:nth-child(odd)`), `.g-ring` (conic-gradient ring with `--pct` custom property and centred label), `.g-tabs`/`.g-tab`, `.g-sticky-bar` (bottom full-width bar), `.right-rail`, `.tabbar` (phone bottom bar).

- [ ] **Step 1:** Ask Zain before downloading; on yes fetch Inter and Fredoka variable latin woff2 from `cdn.jsdelivr.net/npm/@fontsource-variable/inter` and `.../fredoka` (exact pinned versions) plus their OFL texts into `fonts/`. Add `@font-face` rules with `font-display: swap`.
- [ ] **Step 2:** Rewrite the token blocks and add the component classes above. Sidebar: 240px, rows of emoji + label, active row `background: var(--line)` in light / `#1E293B` dark with `--r-sm`; a full-width `.g-btn` "🎮 Study" under the nav; the unit's sections listed below with their colour square. Right rail 360px, hidden under 1100px. Under 768px the sidebar hides and `.tabbar` shows (Home, Learn, Exam, Search, Profile).
- [ ] **Step 3:** Verify with `preview_start {name: "site"}` at `/revision/`: every existing page renders with the new colours in light and dark, no horizontal scroll at 360px, console has no errors. Screenshot Home light and dark.
- [ ] **Step 4:** Commit "Revision look: Gizmo-style tokens, fonts and shell".

---

## Phase 2: Memory and rounds

### Task 3: Memory engine

**Files:**
- Create: `revision/memory.js`, `revision/tests/memory.test.js`

**Interfaces (produces, global `MEMORY`):**
- Record shape `{ s: 0..5, due: 'YYYY-MM-DD', seen: 'YYYY-MM-DD', lapses: int }`
- `LADDER = [1, 3, 7, 16, 35, 90]`
- `status(rec, todayStr) -> 'new'|'learning'|'mastered'|'forgotten'`: no record or `s === 0` → new; `due <= todayStr` → forgotten; `s >= 3` → mastered; else learning.
- `applyResult(rec, ok: boolean, todayStr) -> { rec, days }`: ok → interval index is the strength *before* the answer, capped at 5 (`LADDER[min(prev.s,5)]`), then `s = min(5, s+1)`; not ok → `s = max(1, s-2)`, due tomorrow, `lapses+1`, `days = 1`. Always sets `seen`.
- `ringPercent(codes, memory) -> int 0..100` = round(mean(s)/5·100), missing = 0.
- `buildRound({ nodeCodes, earlierCodes, memory, todayStr, max = 11 }) -> string[]`: this node's forgotten, then learning, then new, then mastered; top up with earlier forgotten, then earlier learning, until `max` or exhausted; no duplicates.
- `combo(runRight) -> 1|1.5|2`: ≥5 → 2, ≥3 → 1.5.
- `touch(rec, todayStr) -> rec`: for a hinted right answer: strength unchanged (new → s 1), due tomorrow, `seen` set. *(My call: a hint neither raises nor drops strength.)*
- `seed({ items, lessonsDone, rag, flashBoxes, flashDue, todayStr }) -> memory` where `items` is `[{code, nodeId}]`, `flashBoxes`/`flashDue` keyed by term code (caller maps flashcard id → code).
- `coerce(raw) -> memory` (drops bad keys/values like `keepMap`).

- [ ] **Step 1: Write failing tests** in `memory.test.js` (pattern of `league.test.js`):
  - `status`: undefined → 'new'; `{s:2,due:'2026-11-20'}` on '2026-11-18' → 'learning'; `{s:4,due:'2026-11-30'}` → 'mastered'; `{s:4,due:'2026-11-18'}` → 'forgotten'.
  - `applyResult` right on new: `days === 1`, `rec.s === 1`, `due === '2026-11-19'`; right at s=2: days 7, s 3; right at s=5: days 90, s stays 5; wrong at s=4: s 2, due tomorrow, lapses 1; wrong at s=1: s stays 1.
  - `ringPercent(['a','b'], {a:{s:5},b:{s:0}}) === 50`.
  - `buildRound` with node `['n1']` (new) and 15 earlier codes (5 forgotten, 10 learning) returns 11 codes, `n1` first, then the 5 forgotten, no duplicates.
  - `buildRound` with 1 node code and no earlier codes returns `['n1']`.
  - `combo(2) === 1`, `combo(3) === 1.5`, `combo(5) === 2`.
  - `touch({s:3,due:'2026-12-01'}, '2026-11-18')` → s 3, due '2026-11-19'; `touch(undefined, ...)` → s 1.
  - `seed`: a code in a done lesson → s 2, due today+3; same but rag green → s 3, due today+7; flash box 4 → s 4; rag red → s 1, due today (wins over the others); untouched code → absent.
  - `coerce({ 'B1.1.1': {s:9}, '__proto__': {}, x: 'bad' })` → `{ 'B1.1.1': {s:5, due:'', seen:'', lapses:0} }`.
- [ ] **Step 2:** `node --test revision/tests/memory.test.js` → FAIL (module not found).
- [ ] **Step 3:** Implement `revision/memory.js`.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit "Memory: per-term strength, review ladder and round builder".

### Task 4: Wire memory into saved state

**Files:**
- Modify: `revision/app.js` (`defaultUnitState`, `coerceUnit`, load path after `coerceStore`), `revision/index.html` (add `<script src="memory.js?v=1">` before `app.js`)

**Interfaces:**
- Consumes: `MEMORY.seed`, `MEMORY.coerce`.
- Produces: `state.memory` (per unit), `state.memorySeeded: boolean`; `recordHinted(code)` (applies `MEMORY.touch`, saves); `termItems() -> [{code, term, definition, nodeId, ...item}]` for the active unit (reuse `pathNodes()` + `isLessonItem`); `recordResult(code, ok) -> days` (applies, saves, returns days for the flash).

- [ ] **Step 1:** Add `memory: {}` and `memorySeeded: false` to `defaultUnitState`; in `coerceUnit` set `unit.memory = MEMORY.coerce(raw && raw.memory)`.
- [ ] **Step 2:** After load, for each unit where `memorySeeded` is false, build the seed input (map flashcard ids to term codes via the flashcard's `code` field) and set `memory`, then `memorySeeded = true`, save.
- [ ] **Step 3:** Verify in the preview: with an exported old save imported (Profile → Import), `JSON.parse(localStorage.rev_state).units.u1.memory` has entries; reload does not reseed; `units.u1.flashcards` and `lessons` are byte-identical to before (compare in the console).
- [ ] **Step 4:** Commit "State: per-term memory, seeded from lessons, flashcards and ratings".

### Task 5: Round engine and question formats

**Files:**
- Create: `revision/round.js` (move question building from `lessons.js:70-213`: `termParts`, `acceptedAnswers`, `normAnswer`, `editDistance`, `checkTyped`, `isTypeable`, `maskTerm`, `distractorTerms`, `questionsForItem`)
- Modify: `revision/index.html` (load `round.js` after `app.js`)

**Interfaces:**
- Consumes: `MEMORY.buildRound`, `MEMORY.status`, `MEMORY.combo`, `recordResult`, `termItems`.
- Produces:
  - `startRound(nodeId, mode = 'memorize'|'hard'|'speed'|'review')` — `review` uses all of the unit's forgotten codes (Home button).
  - `round` object: `{ nodeId, mode, cards: [{code, q, status, outcome: null|'right'|'wrong'|'retry'}], pos, xp, coins, run, startRing }`.
  - `questionFor(item, status, mode, settings) -> q` with `q.kind` in `'mcq'|'type'|'gap'|'tf'|'multi'|'flip'`. Rules: new/learning/forgotten → mcq with options hidden (scenario questions first, from `lessonBank()`); mastered → `type` or `gap` when `isTypeable`, else mcq; `hard` → type/gap where typeable, else mcq with no hint; settings `mcqOnly`, `typing`, `flashOnly` override. Mix one `tf` per round where a definition swap is available; `multi` only for items whose `examples` split into ≥3 parts on `;`.
  - Settings in `localStorage['rev_round_settings']` (try/catch): `{ style: 'mixed'|'mcq'|'typing'|'flash', hideOptions: true, spelling: true }`.
- New terms: before the first question about a New term, insert a teach card (batches of `TEACH_BATCH = 3`), as `lessons.js` does today.

- [ ] **Step 1:** Move the pure helpers to `round.js` unchanged; `lessons.js` keeps working by calling them (both loaded).
- [ ] **Step 2:** Implement `startRound` and `questionFor` per the rules. Right first time → `recordResult(code, true)`, XP `5 × combo`, `run++`. Wrong → `recordResult(code, false)`, `run = 0`, card stays, picked option disabled, card re-queued as Retry at the end. Reveal or Explain-before-answer counts as wrong. Hint greys one wrong option and marks the card `hinted`; a hinted right answer earns no XP or coin and calls `MEMORY.touch` instead of `recordResult(code, true)` (expose `recordHinted(code)` from Task 4's helpers). Gizmo's typo tolerance: `checkTyped` with `spelling` setting.
- [ ] **Step 3:** Verify in the console on the preview: `startRound(pathNodes()[0].id)` builds ≤11 cards; a node with 1 term gets topped up.
- [ ] **Step 4:** Commit "Rounds: engine, formats by card status, settings".

### Task 6: Round screen

**Files:**
- Modify: `revision/round.js` (render), `revision/styles.css` (round section), `revision/index.html` (a full-screen `#round-view` container outside `.app-shell`)

**Interfaces:**
- Consumes: `round`, `questionFor`, `renderSpecItem`-style notes from `app.js` for Explain.
- Produces: `renderRound()`, `roundPick(i)`, `roundType()`, `roundShowOptions()`, `roundHint()`, `roundReveal()`, `roundExplain()`, `roundSimpler()`, `roundPrev()`, `roundNext()`, `closeRound()`.

Layout exactly as spec "Round" and "Right answer" and "Explain": top bar (X, unit name, ⚙ settings), sky progress bar; row with ◀, pill (combo `×1.5` when active, `.g-chip--xp` "+N XP"), ▶ (look back only over answered cards); question card with sky 3px ring and status label (🌱 New green, ↻ Retry red, Forgotten amber, Mastered purple); option pills; hidden-options panel "💡 Think of the answer first to do active recall / Show options"; 2×2 buttons Hint · Reveal · Explain · Simpler. Right: option mint, flash overlay "+N days" (from `recordResult`) and "+N XP", auto-advance after 1000 ms (0 under reduced motion → still advance, no animation). Wrong: red shake 300 ms then greyed. Explain block: emoji heading + term, definition with the term bold, key facts as bullets, example, "Key takeaway: " + examTip, comparison table if the subtopic has one (`renderComparisonTable`), chips Simpler (shows flashcard back text) · More detail (opens the term in Materials), sticky "Continue". Speed-run: 8 s per card bar; timeout = wrong. Settings sheet: the three settings.

- [ ] **Step 1:** Build the view and handlers.
- [ ] **Step 2:** Verify in the preview at 1280px and 360px, light and dark: play a round — a right answer shows the flash and advances; a wrong answer greys the option and the card returns as Retry; Explain shows his notes word for word; keyboard 1–4 picks options, Enter submits typed. Screenshot each state.
- [ ] **Step 3:** Commit "Rounds: Gizmo-style round screen with Explain from the notes".

### Task 7: End of round

**Files:** Modify `revision/round.js`, `revision/styles.css`.

**Interfaces:**
- Consumes: `currentStreak()`, `LEAGUE.standings` (via the app's existing leaderboard helpers), `MEMORY.ringPercent`, `COINS` (added in Task 11; until then coins shown as 0 and hidden).
- Produces: `finishRound()`, `closeRound()` (keeps answered results — they were saved as they happened — and returns to where the round was opened).

Sequence: streak screen only if this round moved the streak (display "N day streak!", Su–Sa circles with studied days filled from `state.activity`); "You've just overtaken {name}" if league rank improved; Round Complete (display title, XP chip, coin chip, card with node title and big `.g-ring` animating from `startRing` to now with "+N%" badge, Hard round · Speed-run pills, "Cards answered" with answer and Explain pill each, sticky "Next round"). Step reaching 100% → confetti (CSS only, off under reduced motion).

- [ ] **Step 1:** Implement. **Step 2:** Verify by playing a round to the end and by closing a round after 3 cards (memory has those 3, XP banked, no end screens). **Step 3:** Commit "Rounds: streak, overtaken and Round Complete screens".

---

## Phase 3: Layout

### Task 8: Learn page — path, study dialog, materials, leaderboard tabs

**Files:**
- Create: `revision/learn.js` (path + dialog, replacing `lessons.js`)
- Delete: `revision/lessons.js` (helpers already moved to `round.js`)
- Modify: `revision/app.js` (`PAGES`, `PAGE_TITLES`, `renderPage`, `routeHash`, `parseRoute`), `revision/index.html`

**Interfaces:**
- Produces: page `learn` with tabs `path|materials|leaderboard`; routes `#learn`, `#learn/materials`, `#learn/materials/C`, `#learn/leaderboard`. Redirects in `parseRoute`: `#sections`→`#learn`, `#sections/materials`→`#learn/materials`, `#sections/X`→`#learn/materials/X`, `#flashcards`→`#learn`, `#games`→`#learn/leaderboard`, `#leaderboard`→`#learn/leaderboard`, `#plan`→home. `renderPath(container)`, `openStudyDialog(nodeId)`, `currentNodeId() -> id` (first node under 100%).

Path per spec: S-curve (keep `PATH_WAVE`), badge + ring (`.g-ring` with `--pct`), title + "N cards", grey/green/pulsing current, red badge with forgotten count, floating "↑ Current step" pill via IntersectionObserver. Dialog: display "Study", badge, title, options Memorize (🧠) · Battle (⚔️) then "More ways to study ⌄" revealing Hard round (😈), Speed-run (⚡), Practice test (📝 → `navigate('questions', {section})`); dark "Let's go". Materials tab = today's `renderSectionList`/`renderSectionContent`, restyled (Task 10). Leaderboard tab = `renderLeaderboardPage()` plus the battle start card (Task 9 moves battles).

- [ ] **Step 1:** Implement and wire routes. **Step 2:** Verify: every old hash redirects; path rings match `MEMORY.ringPercent`; the "Study" sidebar button opens the dialog on `currentNodeId()`. **Step 3:** Commit "Learn: path with mastery rings, study dialog, tabs and redirects".

### Task 9: Exam hub, removed tabs, battles on Leaderboard

**Files:** Modify `revision/app.js`, `revision/index.html`, `revision/styles.css`.

- [ ] **Step 1:** Add page `exam`: cards linking to Questions, Past papers, Mocks, Extended, Exam kit, Reasoning (each existing page unchanged). Resume card for an active mock/PPP sitting (reuse Home's current resume logic).
- [ ] **Step 2:** Remove the Flashcards, Games and Plan pages: their `<section class="page">` markup, nav buttons, `renderFlashcards/renderFlashUI/renderCurrentFlashcard`, MCQ/Match/T-F Blitz/Fill-in-the-blank game code and `renderPlan`. **Keep** `startBattle`, `startBattleQuestion`, `forfeitBattle`, `finishBattle` and the battle UI; render the battle mode picker inside the Learn → Leaderboard tab. Keep `state.flashcards`, `state.planChecks`, `state.bests` in `defaultUnitState` so saves round-trip.
- [ ] **Step 3:** Sidebar and `.tabbar`: Home, Learn, Exam, Search, Profile.
- [ ] **Step 4:** Verify: all six exam pages work as before (start a question, open a PPP sitting); a battle can be started and finished from Leaderboard; no console errors; `grep -n "renderFlashcards\|renderPlan\|renderGames" revision/app.js` returns nothing. **Step 5:** Commit "Layout: Home / Learn / Exam; Flashcards, Games and Plan removed, battles kept".

### Task 10: Home, Materials and Leaderboard in the new look

**Files:** Modify `revision/app.js` (`renderHome`, `renderSpecItem`, `renderLeaderboardPage`), `revision/styles.css`, `revision/index.html` (home markup, right rail).

- [ ] **Step 1: Home:** display greeting; "Jump back in" horizontal row (3 most recent nodes from `state.lessons`/memory `seen` + the current node) as cards with ring; "Forgotten today" card with count and dark "Review" pill → `startRound(null, 'review')`; league card. Remove confidence strip, priority topics, section tiles (delete `renderConfidenceStrip`, `renderPriorityTopics`, `renderSectionTiles`, `renderTodayCard`).
- [ ] **Step 2: Right rail** (desktop) / top of Home (phone): streak 🔥, XP, league tier + rank, Forgotten count, coins (Task 11).
- [ ] **Step 3: Materials:** term cards — term bold, dashed divider, definition; glossary chips: wrap occurrences of other terms' names (same unit, whole-word, case-insensitive, longest first, not the card's own term) in `<span class="g-chip g-chip--term">` at render time only. Text content unchanged.
- [ ] **Step 4: Leaderboard:** battle card at top with Start pill; rows; own row mint with medal and XP chip.
- [ ] **Step 5:** Verify at 360px and desktop, both themes; `document.querySelector('.spec-card').textContent` for a term equals the JSON wording. **Step 6:** Commit "Home, Materials and Leaderboard: Gizmo layout".

---

## Phase 4: Coins, pets, shop

### Task 11: Coins

**Files:**
- Create: `revision/coins.js`, `revision/tests/coins.test.js`
- Modify: `revision/app.js` (`defaultStore`, `coerceStore`, `GLOBAL_KEYS` add `wallet`, `pets`, `wardrobe`; battle finish; league rollover; PPP/mock part finish), `revision/round.js` (award at finish), `revision/index.html`

**Interfaces (global `COINS`):**
- `RULES = { perFirstTry: 1, perfectRound: 10, stepMastered: 25, streakDay: 5, battleWin: 15, battleLoss: 5, leagueUp: 50, leagueTop3: 100, examPart: 20 }`
- `forRound({ firstTry, mistakes, stepHit100, firstRoundToday }) -> int`
- `seedFromXP(totalXP) -> int` = floor(totalXP / 10)
- `defaultWallet() -> { coins: 0, seeded: false, spent: 0 }`, `coerceWallet(raw)`
- `earn(wallet, n) -> wallet`, `spend(wallet, n) -> wallet|null` (null if not enough; never negative)

- [ ] **Step 1: Failing tests:** `forRound({firstTry:8,mistakes:0,stepHit100:true,firstRoundToday:true}) === 8+10+25+5`; with `mistakes:1` → no +10; `seedFromXP(3009) === 300`; `spend({coins:40},50) === null`; `spend({coins:60},50).coins === 10`; `coerceWallet({coins:-5})` → coins 0; `coerceWallet({coins:'x'})` → 0.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement and wire: seed once from `units.u1.xp + units.u2.xp` when `wallet.seeded` is false; award in `finishRound`, `finishBattle`, league rollover, PPP part finish and mock finish; show coin chip on Round Complete and in the rail. **Step 4:** Run tests → PASS; in the preview, finish a round and see the coin count rise; reload does not reseed. **Step 5:** Commit "Coins: earned from rounds, battles, leagues and exam practice".

### Task 12: Pet and accessory art

**Files:**
- Create: `revision/shop-data.js`, `revision/tests/shop-data.test.js`

**Interfaces (global `SHOP`):**
- `PETS: [{ id, name, kind: 'everyday'|'tech'|'mythical', price, starter: bool, svg(col) -> string (viewBox 0 0 200 200), anchors: { head, eyes, neck, back, hand } }]`, each anchor `{ x, y, s, r }` in pet coordinates. Starters: cat, dog, robot, computer. Full roster from the spec (about 20, no axolotl); prices everyday 150–300, tech 300–500, mythical 600–1,500; starters price 0.
- `ITEMS: [{ id, name, slot: 'hat'|'face'|'neck'|'back'|'held'|'bg'|'frame'|'effect', price | unlock: { type: 'league'|'streak'|'mastery', value }, variants?: [{ id, col, price }], svg(col) -> string }]` drawn on a 100×100 grid with the anchor at (50,50). About 40 items, 50–800 coins. Unlocks: one per league tier, streak 7/30/100, one per unit fully mastered.
- `AVATAR_ANCHORS` for the 200×200 avatar circle.
- `compose(baseSvg, anchors, outfit: {slot: itemId}) -> string` returns one `<svg>` with each item in a `<g transform="translate(x y) rotate(r) scale(s) translate(-50 -50)">`, `bg`/`back` drawn behind the base, the rest in front, `effect` last.
- `canBuy(item, wallet, owned, progress) -> { ok, reason }`.

- [ ] **Step 1: Failing tests:** every pet has all five anchors with finite numbers; ids unique across pets, items and variants; no pet id or name matches `/axolotl/i`; exactly 4 starters, all price 0; every item has a valid slot and either `price` in 50–800 or an `unlock`; `compose` output contains one `<svg` and one `<g` per worn item; `canBuy` refuses when coins < price and when already owned.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Draw the art and implement. Use flat shapes with a 3px darker outline, two-tone fills from `col`, so variants recolour. **Step 4:** Run → PASS; render a contact sheet in the preview console (`document.body.innerHTML = SHOP.PETS.map(...)`) and screenshot every pet wearing the same hat, glasses and cape to check the anchors. **Step 5:** Commit "Shop: original pet and accessory art with shared anchors".

### Task 13: Shop page, wearing, pet on screen

**Files:**
- Create: `revision/shop.js`
- Modify: `revision/app.js` (page `shop` under Profile, route `#shop`; avatar render sites: sidebar, top bar, leaderboard row, battle header), `revision/round.js` (pet on flash and Round Complete), `revision/styles.css`, `revision/index.html`

**Interfaces:**
- Store keys (global): `pets: { owned: { [petId]: { name } }, active: petId|null }`, `wardrobe: { owned: { [itemId]: true }, avatar: { [slot]: itemId }, pet: { [petId]: { [slot]: itemId } } }`, coerced so unknown ids are dropped.
- Produces: `renderShop()`, `buyItem(id)`, `wear(target: 'avatar'|petId, slot, id|null)`, `setActivePet(id)`, `renamePet(id, name)` (trimmed, max 20 chars, escaped on render), `petHTML(size)`, `avatarHTML(size)`, `petMood() -> 'happy'|'sleepy'` (studied today or not).

- [ ] **Step 1:** First visit with no pet: starter picker (4 cards). Shop tabs Pets · Accessories · Avatar; big preview of active pet and avatar wearing what is hovered/selected; item cards with price chip, Owned/Wear states, locked items showing how to unlock. Buy confirms once ("Buy Wizard hat for 200 coins?") via an in-page sheet, not `confirm()`; the button disables during the purchase.
- [ ] **Step 2:** Pet on Home (with mood), on the round's right-answer flash (small bounce) and on Round Complete. Avatar with accessories everywhere the avatar shows today.
- [ ] **Step 3:** Coin counter in the rail and phone header opens `#shop`.
- [ ] **Step 4:** Verify: buy with exactly enough coins → balance 0; double-click Buy charges once; rename to `<img src=x onerror=alert(1)>` renders as text; outfit survives reload; works at 360px and in dark. **Step 5:** Commit "Shop: pets, accessories and outfits for pet and avatar".

---

## Phase 5: Finish

### Task 14: Clean-up and checks

**Files:** Modify `revision/index.html` (versions, meta description now "Learn paths, rounds, exam practice, pets and a shop for BTEC National IT"), `README.md` if it lists the tabs.

- [ ] **Step 1:** Bump every `?v=`. Remove now-unused CSS for deleted pages (`grep` each class before deleting).
- [ ] **Step 2:** Run `python revision/validate_data.py` → passes; `node --test revision/tests/` → all pass.
- [ ] **Step 3:** Full walkthrough in the preview, both themes, 360px and 1280px: Home → Learn path → round → Round Complete → Next round; Materials search link; Exam → PPP part; Leaderboard battle; Shop buy and wear. No console errors. Screenshots sent to Zain.
- [ ] **Step 4:** Commit "Revision: Gizmo rehaul finished, versions bumped".

### Task 15: Backup round-trip check

- [ ] **Step 1:** In the new site, Profile → Export to a JSON file.
- [ ] **Step 2:** `git worktree add ../rev-backup pre-gizmo-rehaul`; serve it in the background with `python -m http.server 8086 --bind 127.0.0.1 --directory ../rev-backup` and open `http://127.0.0.1:8086/revision/`.
- [ ] **Step 3:** Profile → Import the exported file. Expect: import succeeds with no console error, and Home shows the same XP, streak and RAG ratings as the new site.
- [ ] **Step 4:** Stop the server and `git worktree remove ../rev-backup`. Report the result to Zain.

# Revision Website

A revision platform for A-Level Cyber Security, built as a single-page app
with vanilla JavaScript. Made for personal use and for friends to use.

**Live site:** [zainsplace.github.io](https://zainsplace.github.io)

## Features

- Flashcards with spaced RAG (red/amber/green) self-rating
- Multiple-choice practice questions per topic
- Match, True/False Blitz, and Battle revision games
- Extended-writing practice with timers
- Leaderboard with daily-progressing rivals
- Progress tracking and XP, saved locally in the browser

## How It Works

Everything runs client-side. Progress, scores, and settings persist through
`localStorage`, so no account or backend is needed. Revision content lives in
the `data` folder and is bundled into `data_inline.js` by `build_inline.py`.

## Running Locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server
```

then visit `http://localhost:8000`.

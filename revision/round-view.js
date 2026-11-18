/* ===== ROUND SCREEN =====
   The full-screen round, drawn over the page in #round-view. round.js is the
   engine (cards, answers, memory, XP); this file only draws the global `round`
   it builds and turns clicks and keys into engine calls.

   Per card:   teach notes (new terms, card.teach) -> question -> answer.
     right     option turns mint, a "+N days / +N XP" flash, next card after 1 s
     wrong     red shake (300 ms), then the option greys out; try again on the
               same card, which also comes back at the end as Retry. A typed
               answer marked wrong shows the answer and "✓ I was right"
               (overrideRight: counted right first time, then moves on)
     Hint      greys one wrong option (typed cards: first letters)
     Reveal    shows the answer; counts as wrong
     Explain   the term's notes word for word under the card; before answering
               it counts as wrong, but the card can still be answered
     Simpler   the flashcard wording (or the definition's first sentence)
   ◀ ▶ look back over cards already passed. XP is banked by the engine as each
   card is answered (ctx.gainXP), so round.xp is shown, never awarded here.
   After the last card: streak screen (if the round moved the streak),
   "You've just overtaken …" (if the league place improved), Round Complete.

   Every string from the engine except q.prompt is raw text and is escaped
   here. Exported (browser globals) for Task 7: openRound, closeRound,
   finishRound, renderRound and the round* handlers below. */

const RV_ADVANCE_MS = 1000;   // right answer -> next card
const RV_CLOSE_MS = 1800;     // right but misspelt: a little longer to read the spelling
const RV_SHAKE_MS = 300;
const RV_SPEED_MS = 8000;     // speed-run time per card; running out counts as wrong
const RV_STATUS = {
  new: ['🌱 New', 'new'],
  learning: ['📖 Learning', 'learning'],
  forgotten: ['⏰ Forgotten', 'forgotten'],
  mastered: ['⭐ Mastered', 'mastered']
};
const RV_STYLES = [
  ['mixed', '🎲 Mixed'],
  ['mcq', '🔘 Multiple choice only'],
  ['typing', '⌨️ Typing preferred'],
  ['flash', '🃏 Flashcards only']
];
const RV_CHEVRON_L = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
const RV_CHEVRON_R = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

/* View state for the open round, or null when closed.
   { node, view (index being looked back at, or null for the live card),
     settingsOpen, cs (per-card view state), timer, speedTick, returnFocus,
     before (streak and league table at the start), end (set once the end
     screens are showing; `round` is null by then) } */
let rv = null;

function rvReduced() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
}

/* Per-card view state, kept beside the engine's card (Retry copies are new objects). */
function rvCard(card) {
  let s = rv.cs.get(card);
  if (!s) {
    s = { taught: false, teachIdx: 0, showOpts: false, multi: [], flash: null, shaking: null,
          typedWrong: false, typedVal: '', hint: null, explain: false, simpler: false,
          flipped: false, tfPick: null, flipPick: null, wrongNote: false, explainNote: false,
          timedOut: false, elapsed: 0 };
    rv.cs.set(card, s);
  }
  return s;
}

function rvLive() { return rv && round ? currentRoundCard(round) : null; }
function rvShown() { return rv && round ? round.cards[rv.view != null ? rv.view : round.pos] || null : null; }
function rvCtx() { return roundContext(); }
function rvAnnounce(msg) { const n = el('rv-live'); if (n) n.textContent = msg; }

function rvClearTimer() {
  if (rv && rv.timer) { clearTimeout(rv.timer); rv.timer = null; }
}
function rvStopSpeed() {
  if (rv && rv.speedTick) { clearInterval(rv.speedTick); rv.speedTick = null; }
}

/* ---------- opening and closing ---------- */

/* What the end screens compare against: the streak and the league table as
   they were before the round's first answer banked any XP. */
function rvSnapshot() {
  const snap = { streak: { last: state.streak.last, count: state.streak.count }, week: null, rows: null };
  try {
    const rows = leagueRows();
    snap.week = state.league.week;
    snap.rows = rows.map(r => ({ name: r.name, place: r.place, me: r.me }));
  } catch (e) { /* no league yet: no "overtaken" screen */ }
  return snap;
}

function openRound(nodeId, mode) {
  if (rv) closeRound();
  const before = rvSnapshot();
  const r = startRound(nodeId, mode);
  if (!r || !r.cards.length) {
    toast(mode === 'review' ? 'Nothing forgotten to review right now' : 'No cards to study here yet');
    return null;
  }
  const box = el('round-view');
  if (!box) return null;
  rv = {
    node: pathNodes().find(n => n.id === nodeId) || null,
    view: null, settingsOpen: false, cs: new WeakMap(), timer: null, speedTick: null,
    returnFocus: document.activeElement, before, end: null
  };
  box.innerHTML = '<div class="rv-stage" id="rv-stage"></div><div class="sr-only" id="rv-live" aria-live="polite"></div>';
  box.hidden = false;
  document.body.classList.add('round-open');
  document.querySelectorAll('.app-shell, #sidebar, #right-rail, #sidebar-backdrop').forEach(n => { n.inert = true; });
  renderRound();
  return round;
}

/* Close the screen. Every answer is already saved (memory and XP are written
   as each card is answered), so closing halfway keeps what was done. */
function closeRound() {
  if (!rv) return;
  rvClearTimer();
  rvStopSpeed();
  const back = rv.returnFocus;
  rv = null;
  round = null;
  const box = el('round-view');
  if (box) { box.hidden = true; box.innerHTML = ''; }
  document.body.classList.remove('round-open');
  document.querySelectorAll('.app-shell, #sidebar, #right-rail, #sidebar-backdrop').forEach(n => { n.inert = false; });
  // The path's rings and counts read memory, which the round has just changed.
  // Redrawing replaces the node that opened the round, so find it again by id.
  const backId = back && back.id;
  if (typeof learnAfterRound === 'function') learnAfterRound();
  // Home's rings and Forgotten count, and the stats rail, read memory too.
  if (typeof currentPage !== 'undefined' && currentPage === 'home') renderHome();
  if (typeof renderRightRail === 'function') renderRightRail();
  const target = back && document.contains(back) ? back : (backId ? el(backId) : null);
  if (target && typeof target.focus === 'function') target.focus({ preventScroll: true });
}

/* ---------- end of round ----------
   The queue is empty: read everything needed from `round` (XP, cards, start
   ring), then drop it and show, in order, the streak screen (only if this
   round moved the streak), "You've just overtaken …" (only if the league
   place improved) and Round Complete. XP was banked card by card, so
   round.xp is only shown here. */
function finishRound() {
  if (!rv || !round) { closeRound(); return; }
  rvClearTimer();
  rvStopSpeed();
  const r = round;
  const node = rv.node;
  const end = {
    nodeId: r.nodeId, mode: r.mode, xp: r.xp, coins: r.coins || 0,
    title: node ? node.title : 'Review',
    startRing: r.startRing,
    ring: node ? MEMORY.ringPercent(node.items.map(it => it.code), state.memory) : null,
    cards: rvAnsweredCards(r.cards),
    phases: [], idx: 0, ringShown: false, rival: null
  };
  const b = rv.before || {};
  if (streakMoved(b.streak, state.streak) && currentStreak() > 0) end.phases.push('streak');
  try {
    const rows = leagueRows();
    if (b.rows && b.week === state.league.week) {
      const passed = overtakenRival(b.rows, rows);
      if (passed) {
        const full = rows.find(x => x.name === passed.name);
        end.rival = { rival: full, me: rows.find(x => x.me) };
        end.phases.push('overtaken');
      }
    }
  } catch (e) { /* league unavailable: skip the screen */ }
  end.phases.push('complete');
  end.coins = rvPayCoins(r, end);

  round = null;
  rv.view = null;
  rv.settingsOpen = false;
  rv.end = end;
  rvAnnounce(`Round complete. ${end.xp} XP${end.coins ? ` and ${end.coins} coin${end.coins === 1 ? '' : 's'}` : ''} earned.`);
  rvRenderEnd();
}

/* Coins for a finished round, paid once here (a round closed halfway pays
   none). Right first time: the first copy of a card answered right without a
   hint ("I was right" counts; Reveal and Explain before answering make it
   wrong). A mistake: a first copy that stayed wrong. */
function rvPayCoins(r, end) {
  if (typeof COINS === 'undefined' || typeof earnCoins !== 'function') return 0;
  const firsts = r.cards.filter(c => !c.retry);
  const day = today();
  const n = COINS.forRound({
    firstTry: firsts.filter(c => c.outcome === 'right' && !c.hinted && !c.revealed).length,
    mistakes: firsts.filter(c => c.outcome === 'wrong').length,
    stepHit100: end.ring === 100 && end.startRing < 100,
    firstRoundToday: store.wallet.lastRoundDay !== day
  });
  store.wallet.lastRoundDay = day;
  const paid = earnCoins(n, '', true);
  if (!paid) saveState();
  return paid;
}

/* One row per term, in the order met. Retry copies fold into their card:
   right first time, right on a retry, or missed. */
function rvAnsweredCards(cards) {
  const out = [];
  const seen = new Map();
  cards.forEach(c => {
    if (!c.retry && !seen.has(c.code)) {
      const row = { card: c, result: c.outcome === 'right' ? 'right' : 'missed' };
      seen.set(c.code, row);
      out.push(row);
    } else if (c.retry && c.outcome === 'retry' && seen.has(c.code) && seen.get(c.code).result === 'missed') {
      seen.get(c.code).result = 'retry';
    }
  });
  return out;
}

function rvRenderEnd() {
  const stage = el('rv-stage');
  if (!stage || !rv || !rv.end) return;
  const e = rv.end;
  const phase = e.phases[e.idx];
  const body = phase === 'streak' ? rvStreakHTML() : phase === 'overtaken' ? rvOvertakenHTML(e) : rvCompleteHTML(e);
  const label = phase === 'complete' ? 'Next round' : 'Continue';
  const fn = phase === 'complete' ? "rvEndMode('memorize')" : 'rvEndNext()';
  stage.innerHTML = `
    <header class="rv-top re-top">
      <button class="rv-icon" onclick="closeRound()" aria-label="Close" title="Close (Esc)">✕</button>
    </header>
    <div class="rv-scroll" id="rv-scroll">
      <div class="rv-col re-col re-col--${phase}">${body}</div>
      <div class="g-sticky-bar rv-sticky"><button class="g-btn g-btn-block" id="rv-continue" onclick="${fn}">${label}</button></div>
    </div>`;
  const go = el('rv-continue');
  if (go) go.focus({ preventScroll: true });
  if (phase === 'complete' && e.ring != null) {
    if (e.ringShown) rvSetRing(e.ring);
    else { e.ringShown = true; rvAnimateRing(e.startRing, e.ring); }
  }
}

/* Display text, each character in its own span so .g-wavy can tilt it. */
function rvWavy(text) {
  return Array.from(text).map(ch => `<span aria-hidden="true">${ch === ' ' ? '&nbsp;' : escapeHTML(ch)}</span>`).join('');
}

const RV_DAY_NAMES = { Su: 'Sunday', Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday' };

function rvStreakHTML() {
  const n = currentStreak();
  const title = `${n} day streak!`;
  const days = streakWeek(today(), state.activity || {}).map(d => `
      <li class="re-day${d.done ? ' done' : ''}${d.today ? ' today' : ''}">
        <span class="re-dot" aria-hidden="true">${d.done ? '✓' : ''}</span>
        <span class="re-day-label" aria-hidden="true">${d.label}</span>
        <span class="sr-only">${RV_DAY_NAMES[d.label]}${d.today ? ' (today)' : ''}: ${d.done ? 'studied' : 'not studied'}</span>
      </li>`).join('');
  return `
    <div class="re-hero" aria-hidden="true">🔥</div>
    <h1 class="g-display g-wavy re-big" aria-label="${escapeHTML(title)}">${rvWavy(title)}</h1>
    <p class="re-sub">${n === 1 ? 'Day one. Study again tomorrow to build it up.' : 'You kept it going. See you tomorrow.'}</p>
    <ol class="re-week" aria-label="This week">${days}</ol>`;
}

function rvOvertakenHTML(e) {
  const { rival, me } = e.rival;
  const row = (r, isMe) => `
      <div class="re-lb-row${isMe ? ' me' : ''}">
        <span class="re-lb-place">#${r.place}</span>
        <span class="re-lb-av" style="background:${escapeHTML(r.col || 'var(--text3)')}" aria-hidden="true">${isMe ? meAvInner() : escapeHTML(Array.from(r.name)[0] || '?')}</span>
        <span class="re-lb-name">${isMe ? 'You' : escapeHTML(r.name)}</span>
        <span class="re-lb-xp">${Number(r.xp || 0).toLocaleString()} XP</span>
      </div>`;
  return `
    <div class="re-hero" aria-hidden="true">🏆</div>
    <h1 class="g-display re-big">You've just overtaken ${escapeHTML(rival.name)}</h1>
    <p class="re-sub">Weekly league, this week's XP</p>
    <div class="g-card re-lb">${row(me, true)}${row(rival, false)}</div>`;
}

function rvCompleteHTML(e) {
  const unit = typeof unitDef === 'function' ? unitDef().label : '';
  const coins = typeof COINS !== 'undefined' && e.coins > 0
    ? `<span class="g-chip g-chip--coin"><span aria-hidden="true">🪙</span> +${e.coins}</span>` : '';
  const gain = e.ring != null ? e.ring - e.startRing : 0;
  const confetti = e.ring === 100 && e.startRing < 100 ? rvConfettiHTML() : '';
  const ring = e.ring == null ? '' : `
      <div class="re-ring-wrap">
        <div class="g-ring re-ring" id="re-ring" style="--pct:${e.startRing}" role="img" aria-label="Step ${e.ring}% learnt${gain > 0 ? `, up ${gain}%` : ''}">
          <span id="re-ring-num" aria-hidden="true">${e.startRing}%</span>
        </div>
        ${gain > 0 ? `<span class="re-gain" aria-hidden="true">+${gain}%</span>` : ''}
      </div>`;
  const modes = e.nodeId ? `
      <div class="re-modes">
        <button class="g-pill" onclick="rvEndMode('hard')"><span aria-hidden="true">😈</span> Hard round</button>
        <button class="g-pill" onclick="rvEndMode('speed')"><span aria-hidden="true">⚡</span> Speed-run</button>
      </div>` : '';
  const marks = { right: ['✓', 'Right'], retry: ['↻', 'Right on a retry'], missed: ['✗', 'Missed'] };
  const items = e.cards.map((row, i) => {
    const c = row.card;
    const ans = rvAnswerText(c.q);
    // A true/false "Answer: False" or an answer that is just the term says nothing: show the meaning.
    const norm = v => String(v).trim().toLowerCase();
    const same = c.q.kind === 'tf' || [c.item.term].concat(termParts(c.item.term)).some(p => norm(p) === norm(ans));
    const sub = same ? rvSimplerText(c.item) : ans;
    const [mark, markLabel] = marks[row.result];
    return `
      <li class="g-card re-item">
        <div class="re-item-row">
          <span class="re-mark re-mark--${row.result}" role="img" aria-label="${markLabel}">${mark}</span>
          <div class="re-item-text">
            <strong>${escapeHTML(c.item.term)}</strong>
            <span>${same ? '' : '<span class="re-ans-label">Answer:</span> '}${escapeHTML(sub)}</span>
          </div>
          <button class="g-pill re-ex-btn" id="re-ex-btn-${i}" aria-expanded="false" aria-controls="re-ex-${i}" onclick="rvEndExplain(${i})"><span aria-hidden="true">🧠</span> Explain</button>
        </div>
        <div class="re-ex" id="re-ex-${i}" hidden></div>
      </li>`;
  }).join('');
  return `
    ${confetti}
    <h1 class="g-display g-wavy re-title" aria-label="Round Complete">${rvWavy('Round Complete')}</h1>
    <div class="re-chips"><span class="g-chip g-chip--xp">+${e.xp} XP</span>${coins}</div>
    <section class="g-card re-step" aria-label="${escapeHTML(e.title)}">
      <div class="re-step-text">
        ${e.nodeId ? `<span class="re-unit">${escapeHTML(unit)}</span>` : ''}
        <h2 class="re-step-title">${escapeHTML(e.title)}</h2>
        ${e.nodeId ? '' : '<p class="re-sub">Forgotten terms, back in memory.</p>'}
      </div>
      ${ring}
      ${modes}
    </section>
    <h2 class="re-h">Cards answered</h2>
    <ul class="re-list">${items}</ul>`;
}

/* Confetti for a step reaching 100%: CSS animation only, hidden under reduced motion. */
function rvConfettiHTML() {
  const cols = ['var(--sky)', 'var(--right)', 'var(--forgot)', 'var(--mastered)', 'var(--wrong)'];
  let bits = '';
  for (let i = 0; i < 36; i++) {
    bits += `<i style="--x:${(i * 37) % 100}%;--d:${(i % 9) * 0.12}s;--r:${(i * 53) % 360}deg;--c:${cols[i % cols.length]}"></i>`;
  }
  return `<div class="re-confetti" aria-hidden="true">${bits}</div>`;
}

function rvSetRing(v) {
  const ring = el('re-ring');
  const num = el('re-ring-num');
  if (ring) ring.style.setProperty('--pct', v);
  if (num) num.textContent = Math.round(v) + '%';
}

/* The step ring fills from where it was at the start of the round to now. */
function rvAnimateRing(from, to) {
  if (rvReduced() || from === to) { rvSetRing(to); return; }
  rvSetRing(from);
  const ring = el('re-ring');
  const dur = 1100, delay = 250;
  let t0 = null;
  const step = now => {
    if (!rv || !rv.end || !ring || !document.contains(ring)) return;
    if (t0 == null) t0 = now + delay;
    const k = Math.max(0, Math.min(1, (now - t0) / dur));
    rvSetRing(from + (to - from) * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function rvEndNext() {
  if (!rv || !rv.end) return;
  rv.end.idx = Math.min(rv.end.idx + 1, rv.end.phases.length - 1);
  rvRenderEnd();
  const sc = el('rv-scroll');
  if (sc) sc.scrollTop = 0;
}

/* Next round (memorize), Hard round or Speed-run on the same step; a review
   round's Next round is another review. */
function rvEndMode(mode) {
  if (!rv || !rv.end) return;
  const id = rv.end.nodeId;
  openRound(id, id ? mode : 'review');
}

/* Round Complete's Explain pill: the term's notes inline, under its row. */
function rvEndExplain(i) {
  if (!rv || !rv.end) return;
  const row = rv.end.cards[i];
  const box = el('re-ex-' + i);
  const btn = el('re-ex-btn-' + i);
  if (!row || !box) return;
  const open = box.hidden;
  if (open && !box.innerHTML) box.innerHTML = rvExplainBodyHTML(row.card);
  box.hidden = !open;
  if (btn) btn.setAttribute('aria-expanded', String(open));
}

/* ---------- drawing ---------- */

function renderRound() {
  const stage = el('rv-stage');
  if (!stage || !rv || !round) return;
  rvStopSpeed();
  if (rv.view == null && !rvLive()) { finishRound(); return; }
  const idx = rv.view != null ? rv.view : round.pos;
  const card = round.cards[idx];
  const past = rv.view != null;
  const s = rvCard(card);
  const teaching = !past && card.teach && !s.taught;

  const body = teaching ? rvTeachHTML(card, s) : rvQuestionHTML(card, s, past);
  stage.innerHTML = rvTopHTML(idx, past)
    + `<div class="rv-scroll" id="rv-scroll"><div class="rv-col">${body}</div>${rvStickyHTML(card, s, past, teaching)}</div>`
    + (rv.settingsOpen ? rvSettingsHTML() : '');

  rvFocus(card, s, past, teaching);
  if (!teaching && !past) rvStartSpeed(card, s);
}

function rvTopHTML(idx, past) {
  const unit = typeof unitDef === 'function' ? unitDef().label : '';
  const title = rv.node ? rv.node.title : round.mode === 'review' ? 'Review forgotten terms' : 'Round';
  const pct = round.cards.length ? Math.round(100 * round.pos / round.cards.length) : 0;
  const combo = MEMORY.combo(round.run);
  const mode = round.mode === 'hard' ? '<span class="rv-mode">😈 Hard</span>' : round.mode === 'speed' ? '<span class="rv-mode">⚡ Speed-run</span>' : '';
  return `
    <header class="rv-top">
      <button class="rv-icon" onclick="closeRound()" aria-label="Close round" title="Close (Esc). Answers so far are saved.">✕</button>
      <div class="rv-title">
        <span class="rv-unit">${escapeHTML(unit)}${mode}</span>
        <span class="rv-step">${escapeHTML(title)}</span>
      </div>
      <button class="rv-icon" onclick="roundSettings(true)" aria-label="Round settings" title="Round settings">⚙️</button>
    </header>
    <div class="rv-progress" role="progressbar" aria-label="Round progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div style="width:${pct}%"></div></div>
    <div class="rv-row">
      <button class="rv-arrow" onclick="roundPrev()" ${idx > 0 ? '' : 'disabled'} aria-label="Previous card">${RV_CHEVRON_L}</button>
      <div class="rv-stats">
        ${combo > 1 ? `<span class="rv-combo" title="Combo: ${round.run} right in a row">×${combo}</span>` : ''}
        <span class="g-chip ${round.xp > 0 ? 'g-chip--xp' : ''}">+${round.xp} XP</span>
      </div>
      <button class="rv-arrow" onclick="roundNext()" ${past ? '' : 'disabled'} aria-label="${past ? 'Next card' : 'Next card (only for looking back)'}">${RV_CHEVRON_R}</button>
    </div>`;
}

function rvStatusTag(card) {
  if (card.retry) return '<div class="rv-tag rv-tag--retry">↻ Retry</div>';
  const st = RV_STATUS[card.status] || RV_STATUS.new;
  return `<div class="rv-tag rv-tag--${st[1]}">${st[0]}</div>`;
}

function rvFactsHTML(facts) {
  return facts && facts.length
    ? `<ul class="rv-facts">${facts.map(f => `<li><span aria-hidden="true">📌</span><span>${escapeHTML(f)}</span></li>`).join('')}</ul>`
    : '';
}

function rvTeachHTML(card, s) {
  const items = card.teach;
  const it = items[Math.min(s.teachIdx, items.length - 1)];
  return `
    <article class="rv-card rv-teach" aria-labelledby="rv-teach-term">
      <div class="rv-tag rv-tag--new">🌱 New term${items.length > 1 ? ` · ${s.teachIdx + 1} of ${items.length}` : ''}</div>
      <div class="rv-teach-code">${escapeHTML(it.code)}</div>
      <h2 class="rv-teach-term" id="rv-teach-term">${escapeHTML(it.term)}</h2>
      <p class="rv-teach-def">${escapeHTML(it.definition)}</p>
      ${rvFactsHTML(it.keyFacts)}
      ${it.examples ? `<p class="rv-line"><span aria-hidden="true">💼</span><span><strong>Example:</strong> ${escapeHTML(it.examples)}</span></p>` : ''}
      ${it.examTip ? `<p class="rv-line rv-tip"><span aria-hidden="true">🎯</span><span><strong>Exam tip:</strong> ${escapeHTML(it.examTip)}</span></p>` : ''}
    </article>`;
}

function rvQuestionHTML(card, s, past) {
  const q = card.q;
  const done = card.done || past;
  let html = `
    <article class="rv-card${s.flash ? ' is-right' : ''}${past ? ' is-past' : ''}">
      ${rvStatusTag(card)}
      <div class="rv-label">${escapeHTML(q.label || '')}</div>
      <div class="rv-q">${q.prompt}</div>
      ${round.mode === 'speed' && !past && !card.done ? '<div class="rv-speed" aria-hidden="true"><div id="rv-speed-fill"></div></div>' : ''}
      ${s.flash ? rvFlashHTML(s.flash, q) : ''}
    </article>`;

  html += rvAnswerArea(card, s, past);

  if (s.wrongNote && !card.done && !past) {
    html += (q.kind === 'type' || q.kind === 'gap')
      ? rvTypedMissHTML(card)
      : '<p class="rv-note rv-note--bad" role="status">Not quite. Try again. This card comes back at the end as ↻ Retry.</p>';
  }
  if (s.explainNote && !card.done && !past) {
    html += '<p class="rv-note">Opening the notes first counts as a miss, so this card comes back as ↻ Retry. You can still answer it now.</p>';
  }
  if (done && !s.flash && (card.revealed || s.timedOut || (card.outcome === 'wrong' && card.done) || past)) {
    html += rvWhyHTML(card, s, past);
  }
  if (s.simpler && !s.explain) html += rvSimplerHTML(card.item);
  if (!s.explain) html += rvToolsHTML(card, s, past);
  if (s.explain) html += rvExplainHTML(card, s);
  return html;
}

/* A typed answer marked wrong: the answer, and "I was right" when the
   checker may have been unfair (once per card, not after a hint, Reveal or
   Explain). Typing the answer out still moves on, without XP. */
function rvTypedMissHTML(card) {
  const pill = canOverride(card)
    ? '<button class="g-pill rv-was-right" id="rv-was-right" onclick="roundWasRight()"><span aria-hidden="true">✓</span> I was right</button>'
    : '';
  return `
    <div class="rv-why bad rv-miss" role="status">
      <div class="rv-miss-row"><strong>Marked wrong. Answer: ${escapeHTML(card.q.answer)}</strong>${pill}</div>
      <span>Type it to carry on. This card comes back at the end as ↻ Retry.</span>
    </div>`;
}

function rvFlashHTML(f, q) {
  const bits = [];
  if (f.days != null) bits.push(`<span class="rv-flash-days">+${f.days} day${f.days === 1 ? '' : 's'}</span>`);
  if (f.xp) bits.push(`<span class="g-chip g-chip--xp">+${f.xp} XP</span>`);
  if (!bits.length) bits.push('<span class="rv-flash-days">✓ Correct</span>');
  const spell = f.close ? `<span class="rv-flash-spell">Watch the spelling: <strong>${escapeHTML(q.answer)}</strong></span>` : '';
  return `<div class="rv-flash" aria-hidden="true">${bits.join('')}${spell}</div>`;
}

/* The answer controls for each question kind. */
function rvAnswerArea(card, s, past) {
  const q = card.q;
  const done = card.done || past;
  const locked = done || !!s.flash;

  if (q.kind === 'mcq' || q.kind === 'multi') {
    // Speed-runs show the options at once: the clock is already the pressure.
    if (q.kind === 'mcq' && q.hidden && round.mode !== 'speed' && !s.showOpts && !card.attempted && !done) {
      return `
        <div class="rv-recall">
          <div class="rv-recall-body"><span class="rv-recall-emoji" aria-hidden="true">💡</span><span>Think of the answer first to do active recall</span></div>
          <button class="rv-recall-foot" id="rv-go" onclick="roundShowOptions()">Show options</button>
        </div>`;
    }
    const isRight = o => (q.kind === 'multi' ? q.answers.includes(o) : o === q.answer);
    const opts = q.options.map((o, i) => {
      let c = '';
      const picked = q.kind === 'multi' && s.multi.includes(o);
      if (done && isRight(o)) c = 'right';
      else if (s.shaking === o) c = 'wrong shake';
      else if (card.tried.includes(o)) c = 'tried';
      else if (card.greyed.includes(o)) c = 'greyed';
      else if (picked) c = 'selected';
      const off = locked || c === 'tried' || c === 'greyed' || c.startsWith('wrong');
      const pressed = q.kind === 'multi' ? ` aria-pressed="${picked}"` : '';
      return `<button class="rv-opt ${c}" ${off ? 'disabled' : ''}${pressed} onclick="roundPick(${i})"><span class="rv-key" aria-hidden="true">${i + 1}</span>${escapeHTML(o)}</button>`;
    }).join('');
    const check = q.kind === 'multi' && !locked
      ? `<button class="g-btn g-btn-block" id="rv-check" onclick="roundCheckMulti()" ${s.multi.length ? '' : 'disabled'}>Check</button>`
      : '';
    return `<div class="rv-opts">${opts}</div>${check}`;
  }

  if (q.kind === 'tf') {
    const btn = (val, i, label) => {
      let c = '';
      if (done && q.answer === val) c = 'right';
      else if (s.tfPick === val) c = 'wrong';
      return `<button class="rv-opt ${c}" ${locked ? 'disabled' : ''} onclick="roundPick(${i})"><span class="rv-key" aria-hidden="true">${i + 1}</span>${label}</button>`;
    };
    return `<div class="rv-opts rv-opts--two">${btn(true, 0, '✅ True')}${btn(false, 1, '❌ False')}</div>`;
  }

  if (q.kind === 'flip') {
    if (!s.flipped && !done) {
      return `<button class="g-btn g-btn-block" id="rv-go" onclick="roundFlip()">Show answer</button>`;
    }
    const back = `<div class="rv-back">${escapeHTML(q.back)}</div>`;
    if (done) return back;
    return `${back}
      <div class="rv-opts rv-opts--two">
        <button class="rv-opt" ${locked ? 'disabled' : ''} onclick="roundPick(0)"><span class="rv-key" aria-hidden="true">1</span>👍 I knew it</button>
        <button class="rv-opt" ${locked ? 'disabled' : ''} onclick="roundPick(1)"><span class="rv-key" aria-hidden="true">2</span>🤔 Didn't know</button>
      </div>`;
  }

  // type / gap
  const val = escapeHTML(s.typedVal || '');
  const hint = s.hint ? `<div class="rv-hint">Starts with: <strong>${escapeHTML(s.hint)}</strong></div>` : '';
  if (done || s.flash) {
    return `${hint}<div class="rv-typed ${s.flash ? 'right' : 'wrong'}">${val ? `You typed: <strong>${val}</strong>` : 'No answer typed'}</div>`;
  }
  const spelling = round.settings.spelling ? 'Small spelling mistakes are fine.' : 'Spelling must be exact.';
  return `
    <div class="rv-type">
      ${hint}
      <input id="rv-type" class="rv-input${s.typedWrong ? ' wrong' : ''}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
        placeholder="Type the term…" aria-label="Your answer" value="${val}" oninput="rvTyped(this.value)">
      <div class="rv-type-foot"><span class="rv-type-note">${spelling}</span>
        <button class="g-btn" onclick="roundType()">Check</button></div>
    </div>`;
}

function rvAnswerText(q) {
  if (q.kind === 'tf') return q.answer ? 'True' : 'False';
  if (q.kind === 'multi') return q.answers.join('; ');
  return q.answer;
}

function rvWhyHTML(card, s, past) {
  const q = card.q;
  const right = card.outcome === 'right' || card.outcome === 'retry';
  const head = past
    ? (right ? 'You got this one.' : card.done ? 'Missed.' : 'Skipped after the notes.')
    : s.timedOut ? 'Out of time.' : card.revealed ? 'Revealed.' : 'Not this time.';
  return `
    <div class="rv-why ${right ? 'ok' : 'bad'}">
      <strong>${escapeHTML(head)} Answer: ${escapeHTML(rvAnswerText(q))}</strong>
      <span>${escapeHTML(q.why || '')}</span>
    </div>`;
}

function rvToolsHTML(card, s, past) {
  if (past) {
    return `<div class="rv-tools rv-tools--past">
      <button class="g-pill" onclick="roundExplain()"><span aria-hidden="true">🧠</span> Explain</button>
      <button class="g-pill" onclick="roundSimpler()"><span aria-hidden="true">🪶</span> Simpler</button>
    </div>`;
  }
  const q = card.q;
  const open = !card.done && !s.flash;
  let canHint = open && !q.noHint;
  if (canHint && (q.kind === 'mcq' || q.kind === 'multi')) {
    const isRight = o => (q.kind === 'multi' ? q.answers.includes(o) : o === q.answer);
    canHint = q.options.filter(o => !isRight(o) && !card.greyed.includes(o) && !card.tried.includes(o)).length >= 2
      && !(q.kind === 'mcq' && q.hidden && round.mode !== 'speed' && !s.showOpts && !card.attempted);
  } else if (canHint && (q.kind === 'type' || q.kind === 'gap')) {
    canHint = !s.hint;
  } else canHint = false;
  return `<div class="rv-tools">
    <button class="g-pill" onclick="roundHint()" ${canHint ? '' : 'disabled'} title="${q.noHint ? 'No hints in a hard round' : 'Grey out one wrong option. A hinted card earns no XP.'}"><span aria-hidden="true">💡</span> Hint</button>
    <button class="g-pill" onclick="roundReveal()" ${open ? '' : 'disabled'} title="Show the answer (counts as a miss)"><span aria-hidden="true">🔍</span> Reveal</button>
    <button class="g-pill" onclick="roundExplain()" title="Open the notes for this term"><span aria-hidden="true">🧠</span> Explain</button>
    <button class="g-pill" onclick="roundSimpler()" ${s.simpler ? 'disabled' : ''} title="The short flashcard wording"><span aria-hidden="true">🪶</span> Simpler</button>
  </div>`;
}

/* The short flashcard wording for a term, else the definition's first sentence. */
function rvSimplerText(item) {
  const u = unitData();
  const cards = (u && u.flashcards && u.flashcards.cards) || [];
  const fc = cards.find(c => c.code === item.code);
  return fc && fc.back ? fc.back : firstSentence(item.definition);
}

function rvSimplerHTML(item) {
  return `<div class="rv-simpler"><span aria-hidden="true">🪶</span><span><strong>In short:</strong> ${escapeHTML(rvSimplerText(item))}</span></div>`;
}

/* The definition, with the term in bold where it appears (else in front). */
function rvDefinitionHTML(item) {
  const def = escapeHTML(item.definition);
  const parts = termParts(item.term).map(p => escapeHTML(p)).sort((a, b) => b.length - a.length);
  for (const p of parts) {
    const re = new RegExp(`\\b(${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'i');
    if (re.test(def)) return def.replace(re, '<strong>$1</strong>');
  }
  return `<strong>${escapeHTML(item.term)}</strong>: ${def}`;
}

/* "C1.1.2" sits in the recap range "C1.1.1-C1.1.3". */
function rvInRange(code, range) {
  const [lo, hi] = String(range).split('-');
  if (!lo || !hi) return false;
  const head = c => c.split('.').slice(0, -1).join('.');
  const tail = c => Number(c.split('.').pop());
  return head(lo) === head(code) && head(hi) === head(code) && tail(code) >= tail(lo) && tail(code) <= tail(hi);
}

/* The term's own comparison table, or else the subtopic's recap table that
   covers it (an entry such as "C1.1.1-C1.1.3 ... Compared"). Escaped before
   drawing. Another term's table is not shown: it would compare other things. */
function rvComparisonTable(card) {
  let t = card.item.comparisonTable;
  if (!t && card.node && card.node.sub) {
    const recap = (card.node.sub.items || []).find(it => it.comparisonTable && rvInRange(card.item.code, it.code));
    t = recap ? recap.comparisonTable : null;
  }
  if (!t || !Array.isArray(t.headers) || !Array.isArray(t.rows)) return '';
  return renderComparisonTable({
    title: t.title ? escapeHTML(t.title) : '',
    headers: t.headers.map(escapeHTML),
    rows: t.rows.map(r => r.map(escapeHTML))
  });
}

/* The term's notes word for word. Also used by Round Complete's Explain pills. */
function rvExplainBodyHTML(card) {
  const it = card.item;
  return `
      <h3 class="rv-ex-head"><span aria-hidden="true">🧠</span> ${escapeHTML(it.term)}</h3>
      <p class="rv-ex-def">${rvDefinitionHTML(it)}</p>
      ${rvFactsHTML(it.keyFacts)}
      ${it.examples ? `<p class="rv-line"><span aria-hidden="true">💼</span><span><strong>Example:</strong> ${escapeHTML(it.examples)}</span></p>` : ''}
      ${it.examTip ? `<p class="rv-line rv-tip"><span aria-hidden="true">🎯</span><span><strong>Key takeaway:</strong> ${escapeHTML(it.examTip)}</span></p>` : ''}
      ${rvComparisonTable(card)}`;
}

function rvExplainHTML(card, s) {
  const it = card.item;
  return `
    <section class="rv-explain" id="rv-explain" aria-label="Notes for ${escapeHTML(it.term)}">
      ${rvExplainBodyHTML(card)}
      ${s.simpler ? rvSimplerHTML(it) : ''}
      <div class="rv-ex-chips">
        <button class="g-chip rv-chip" onclick="roundSimpler()" ${s.simpler ? 'disabled' : ''}><span aria-hidden="true">🪶</span> Simpler</button>
        <button class="g-chip rv-chip" onclick="roundMoreDetail()"><span aria-hidden="true">📚</span> More detail</button>
      </div>
    </section>`;
}

/* The sticky bottom bar: Continue on teach cards, after Explain, and on a
   finished card that does not move on by itself. */
function rvStickyHTML(card, s, past, teaching) {
  let label = null;
  let fn = 'roundContinue()';
  if (teaching) {
    label = s.teachIdx < card.teach.length - 1 ? 'Next new term' : 'Test me';
    fn = 'roundTeachNext()';
  } else if (past) {
    label = 'Back to current card';
    fn = 'roundBackToCurrent()';
  } else if (s.explain || (card.done && !s.flash)) {
    label = 'Continue';
  }
  if (!label) return '';
  return `<div class="g-sticky-bar rv-sticky"><button class="g-btn g-btn-block" id="rv-continue" onclick="${fn}">${label}</button></div>`;
}

function rvSettingsHTML() {
  const st = loadRoundSettings();
  const sw = (key, label, note) => `
    <div class="rv-switch-row">
      <span><span class="rv-switch-label" id="rv-sw-${key}">${label}</span><span class="rv-switch-note">${note}</span></span>
      <button class="rv-switch" role="switch" aria-checked="${st[key]}" aria-labelledby="rv-sw-${key}" onclick="roundSetSetting('${key}', ${!st[key]})"><span></span></button>
    </div>`;
  return `
    <div class="rv-sheet-backdrop" onclick="roundSettings(false)"></div>
    <div class="rv-sheet" role="dialog" aria-modal="true" aria-labelledby="rv-sheet-title">
      <h3 id="rv-sheet-title">Round settings</h3>
      <div class="rv-sheet-group" role="group" aria-labelledby="rv-style-label">
        <p class="rv-sheet-label" id="rv-style-label">Question style</p>
        <div class="rv-seg">
          ${RV_STYLES.map(([v, l]) => `<button class="g-pill${st.style === v ? ' on' : ''}" aria-pressed="${st.style === v}" onclick="roundSetSetting('style', '${v}')">${l}</button>`).join('')}
        </div>
        <p class="rv-switch-note">Applies from your next round.</p>
      </div>
      ${sw('hideOptions', 'Hide options initially', 'Think of the answer before the choices appear.')}
      ${sw('spelling', 'Spelling mistakes allowed', 'Accept typed answers with a small typo.')}
      <button class="g-btn g-btn-block" id="rv-sheet-done" onclick="roundSettings(false)">Done</button>
    </div>`;
}

function rvFocus(card, s, past, teaching) {
  let id = null;
  if (rv.settingsOpen) id = 'rv-sheet-done';
  else if (teaching || past || s.explain || (card.done && !s.flash)) id = 'rv-continue';
  else if (!card.done && (card.q.kind === 'type' || card.q.kind === 'gap')) id = 'rv-type';
  else if (el('rv-go')) id = 'rv-go';
  const target = (id && el(id)) || el('round-view');
  if (target) target.focus({ preventScroll: true });
  if (id === 'rv-type' && target && target.setSelectionRange) {
    const n = target.value.length;
    target.setSelectionRange(n, n);
  }
}

/* ---------- speed-run timer ---------- */

function rvStartSpeed(card, s) {
  if (round.mode !== 'speed' || card.done || s.flash) return;
  const fill = () => {
    const bar = el('rv-speed-fill');
    if (bar) bar.style.width = Math.max(0, 100 - 100 * s.elapsed / RV_SPEED_MS) + '%';
  };
  fill();
  rv.speedTick = setInterval(() => {
    if (!rv || rv.settingsOpen || s.explain || document.hidden) return;
    s.elapsed += 100;
    fill();
    if (s.elapsed >= RV_SPEED_MS) { rvStopSpeed(); rvTimeout(); }
  }, 100);
}

function rvTimeout() {
  const card = rvLive();
  if (!card || card.done) return;
  const s = rvCard(card);
  revealCard(round, rvCtx());
  s.timedOut = true;
  rvAnnounce('Out of time. The answer was ' + rvAnswerText(card.q));
  renderRound();
  rv.timer = setTimeout(rvAdvance, 1500);
}

/* ---------- moving between cards ---------- */

function rvAdvance() {
  if (!rv || !round) return;
  rvClearTimer();
  const card = rvLive();
  if (card) rvCard(card).flash = null;
  rv.view = null;
  nextCard(round);
  renderRound();
}

/* If a right answer is waiting to move on, move on now (without drawing). */
function rvSettle() {
  if (!rv || !rv.timer) return;
  rvClearTimer();
  const card = rvLive();
  if (card && card.done) { rvCard(card).flash = null; nextCard(round); }
}

function roundPrev() {
  if (!rv) return;
  rvSettle();
  const idx = rv.view != null ? rv.view : round.pos;
  if (idx <= 0) return;
  rv.view = idx - 1;
  renderRound();
}

function roundNext() {
  if (!rv || rv.view == null) return;
  rv.view++;
  if (rv.view >= round.pos) rv.view = null;
  renderRound();
}

function roundBackToCurrent() {
  if (!rv) return;
  rv.view = null;
  renderRound();
}

function roundContinue() {
  if (!rv) return;
  if (rv.view != null) { roundBackToCurrent(); return; }
  rvAdvance();
}

function roundTeachNext() {
  const card = rvLive();
  if (!card || !card.teach) return;
  const s = rvCard(card);
  if (s.teachIdx < card.teach.length - 1) s.teachIdx++;
  else s.taught = true;
  renderRound();
}

/* ---------- answering ---------- */

/* The live card, if it can take an answer right now. */
function rvAnswerable() {
  if (!rv || rv.view != null || rv.settingsOpen) return null;
  const card = rvLive();
  if (!card || card.done) return null;
  const s = rvCard(card);
  if (s.flash || (card.teach && !s.taught)) return null;
  return { card, s };
}

function rvApply(ev, card, s) {
  if (!ev) return;
  if (ev.right) {
    s.flash = { days: ev.days, xp: ev.xp, close: ev.close };
    s.wrongNote = false;
    rvAnnounce(`Correct${ev.days != null ? `, back in ${ev.days} day${ev.days === 1 ? '' : 's'}` : ''}${ev.xp ? `, plus ${ev.xp} XP` : ''}.`);
    renderRound();
    rv.timer = setTimeout(rvAdvance, ev.close ? RV_CLOSE_MS : RV_ADVANCE_MS);
    return;
  }
  if (card.done) {
    // True/false and flashcards can't be tried twice: show the answer.
    rvAnnounce('Not this time. The answer was ' + rvAnswerText(card.q));
    renderRound();
    return;
  }
  s.wrongNote = true;
  if (card.q.kind === 'type' || card.q.kind === 'gap') {
    rvAnnounce(`Marked wrong. The answer is ${card.q.answer}.${canOverride(card) ? ' Press I was right if your answer meant the same.' : ''}`);
  } else rvAnnounce('Not quite. Try again.');
}

function roundPick(i) {
  const a = rvAnswerable();
  if (!a) return;
  const { card, s } = a;
  const q = card.q;
  if (q.kind === 'mcq') {
    if (q.hidden && round.mode !== 'speed' && !s.showOpts && !card.attempted) return;
    const o = q.options[i];
    if (o == null || card.tried.includes(o) || card.greyed.includes(o) || s.shaking) return;
    const ev = answerCard(round, o, rvCtx());
    if (ev && !ev.right) {
      rvApply(ev, card, s);
      if (rvReduced()) { renderRound(); return; }
      s.shaking = o;
      renderRound();
      setTimeout(() => {
        if (!rv || s.shaking !== o) return;
        s.shaking = null;
        renderRound();
      }, RV_SHAKE_MS);
      return;
    }
    rvApply(ev, card, s);
  } else if (q.kind === 'multi') {
    const o = q.options[i];
    if (o == null || card.tried.includes(o) || card.greyed.includes(o)) return;
    s.multi = s.multi.includes(o) ? s.multi.filter(x => x !== o) : s.multi.concat(o);
    renderRound();
  } else if (q.kind === 'tf') {
    if (i > 1) return;
    s.tfPick = i === 0;
    rvApply(answerCard(round, s.tfPick, rvCtx()), card, s);
  } else if (q.kind === 'flip') {
    if (!s.flipped || i > 1) return;
    s.flipPick = i === 0;
    rvApply(answerCard(round, s.flipPick, rvCtx()), card, s);
  }
}

function roundCheckMulti() {
  const a = rvAnswerable();
  if (!a || a.card.q.kind !== 'multi' || !a.s.multi.length) return;
  const { card, s } = a;
  const ev = answerCard(round, s.multi.slice(), rvCtx());
  if (ev && !ev.right) {
    // Grey out the wrong picks; keep the right ones selected.
    s.multi.filter(o => !card.q.answers.includes(o)).forEach(o => { if (!card.tried.includes(o)) card.tried.push(o); });
    s.multi = s.multi.filter(o => card.q.answers.includes(o));
    rvApply(ev, card, s);
    renderRound();
    return;
  }
  rvApply(ev, card, s);
}

function roundShowOptions() {
  const a = rvAnswerable();
  if (!a) return;
  a.s.showOpts = true;
  renderRound();
}

function roundFlip() {
  const a = rvAnswerable();
  if (!a || a.card.q.kind !== 'flip') return;
  a.s.flipped = true;
  renderRound();
}

function rvTyped(v) {
  const card = rvLive();
  if (card) rvCard(card).typedVal = v;
}

function roundType() {
  const a = rvAnswerable();
  if (!a || (a.card.q.kind !== 'type' && a.card.q.kind !== 'gap')) return;
  const { card, s } = a;
  const input = el('rv-type');
  const val = (input ? input.value : s.typedVal || '').trim();
  s.typedVal = val;
  if (!val) { if (input) input.focus(); return; }
  const ev = answerCard(round, val, rvCtx());
  if (ev && !ev.right) {
    s.typedWrong = true;
    rvApply(ev, card, s);
    renderRound();
    const again = el('rv-type');
    if (again && !rvReduced()) {
      again.classList.add('shake');
      setTimeout(() => again.classList.remove('shake'), RV_SHAKE_MS);
    }
    return;
  }
  rvApply(ev, card, s);
}

/* "I was right": count the typed card right first time and move on like a
   right answer (flash with +N days and XP, then the next card). */
function roundWasRight() {
  const a = rvAnswerable();
  if (!a) return;
  const ev = overrideRight(round, a.card, rvCtx());
  if (!ev) return;
  a.s.typedWrong = false;
  rvApply(ev, a.card, a.s);
}

function roundHint() {
  const a = rvAnswerable();
  if (!a) return;
  const res = hintCard(round);
  if (!res) return;
  if (res.hint) a.s.hint = res.hint;
  rvAnnounce(res.greyed ? 'One wrong option greyed out.' : 'Hint: starts with ' + res.hint);
  renderRound();
}

function roundReveal() {
  const a = rvAnswerable();
  if (!a) return;
  a.s.showOpts = true;
  revealCard(round, rvCtx());
  rvAnnounce('The answer is ' + rvAnswerText(a.card.q));
  renderRound();
}

function roundExplain() {
  if (!rv) return;
  const card = rvShown();
  if (!card) return;
  const s = rvCard(card);
  if (s.explain) { s.explain = false; renderRound(); return; }
  if (rv.view == null) {
    if (s.flash) return;
    const ev = explainCard(round, rvCtx());
    if (ev && ev.counted) s.explainNote = true;
  }
  s.explain = true;
  renderRound();
  const box = el('rv-explain');
  if (box) box.scrollIntoView({ block: 'start', behavior: rvReduced() ? 'auto' : 'smooth' });
}

/* Simpler shows the flashcard wording. Asked for before answering, the card
   counts as hinted (no XP), the same as a Hint. */
function roundSimpler() {
  if (!rv) return;
  const card = rvShown();
  if (!card) return;
  const s = rvCard(card);
  if (rv.view == null && !card.done && !card.attempted && !s.flash) card.hinted = true;
  s.simpler = true;
  renderRound();
}

/* More detail: the term in the section's notes (Learn -> Materials). */
function roundMoreDetail() {
  const card = rvShown();
  if (!card) return;
  const code = card.item.code;
  const letter = (card.node && card.node.letter) || String(code).charAt(0).toUpperCase();
  closeRound();
  navigate('learn', { section: letter });
  requestAnimationFrame(() => {
    const item = el('item-' + code);
    if (!item) return;
    const body = el('body-' + code);
    if (body && body.classList.contains('hidden')) toggleCard(code);
    item.scrollIntoView({ block: 'start' });
  });
}

/* ---------- settings sheet ---------- */

function roundSettings(open) {
  if (!rv) return;
  const card = rvLive();
  if (card && el('rv-type')) rvCard(card).typedVal = el('rv-type').value;
  rv.settingsOpen = !!open;
  renderRound();
}

function roundSetSetting(key, value) {
  if (!rv) return;
  const next = Object.assign(loadRoundSettings(), { [key]: value });
  const clean = saveRoundSettings(next);
  round.settings = clean;   // spelling counts from the next answer
  if (key === 'hideOptions') {
    round.cards.slice(round.pos).forEach(c => { if (c.q && c.q.kind === 'mcq' && !c.attempted) c.q.hidden = clean.hideOptions; });
  }
  renderRound();
}

/* ---------- keys ----------
   Registered in the capture phase on window so, while a round is open, the
   site's own shortcuts (/, ?, page keys) never see the key. */
function rvKey(e) {
  if (!rv) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  e.stopPropagation();
  if (e.key === 'Escape') {
    e.preventDefault();
    if (rv.settingsOpen) roundSettings(false); else closeRound();
    return;
  }
  if (rv.end) {
    // End screens: no card keys. Enter or Space with no button focused is Continue / Next round.
    if (e.key === 'Tab') { rvTrapTab(e, el('round-view')); return; }
    const onBtn = e.target && (e.target.tagName === 'BUTTON' || e.target.tagName === 'A');
    if ((e.key === 'Enter' || e.key === ' ') && !onBtn && !e.repeat) {
      e.preventDefault();
      const go = el('rv-continue');
      if (go) go.click();
    }
    return;
  }
  if (rv.settingsOpen) {
    if (e.key === 'Tab') rvTrapTab(e, document.querySelector('.rv-sheet'));
    return;
  }
  if (e.key === 'Tab') { rvTrapTab(e, el('round-view')); return; }
  const t = e.target;
  if (typingIn(t)) {
    if (e.key === 'Enter') { e.preventDefault(); roundType(); }
    return;
  }
  if (e.repeat) return;
  if (e.key === 'ArrowLeft') { e.preventDefault(); roundPrev(); return; }
  if (e.key === 'ArrowRight') { e.preventDefault(); roundNext(); return; }
  const onButton = t && (t.tagName === 'BUTTON' || t.tagName === 'A');
  if (e.key === 'Enter' || e.key === ' ') {
    if (onButton) return;            // the button's own click
    e.preventDefault();
    rvPrimary();
    return;
  }
  if (/^[1-9]$/.test(e.key)) {
    e.preventDefault();
    roundPick(Number(e.key) - 1);
  }
}

/* Enter with nothing focused: the obvious next step. */
function rvPrimary() {
  if (el('rv-continue')) { el('rv-continue').click(); return; }
  if (rv.timer) { rvAdvance(); return; }
  if (el('rv-go')) { el('rv-go').click(); return; }
  if (el('rv-check') && !el('rv-check').disabled) el('rv-check').click();
}

function rvTrapTab(e, box) {
  if (!box) return;
  const items = [...box.querySelectorAll('button, input, [tabindex="0"]')].filter(n => !n.disabled && n.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (!box.contains(document.activeElement) || document.activeElement === box) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
  else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

window.addEventListener('keydown', rvKey, true);

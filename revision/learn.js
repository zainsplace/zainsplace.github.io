/* ===== LEARN: PATH, STUDY DIALOG, TABS =====
   The Learn page for the active unit: a header (unit square, name, "Study
   unit" pill) and three tabs.
     Path         one node per spec subtopic in a gentle S-curve. Each node is
                  a badge inside a mastery ring (MEMORY.ringPercent of its
                  terms), with its title and "N cards". Grey = not started,
                  green ring = started, pulsing = the current step (the first
                  node under 100%). A red badge counts Forgotten terms. Nothing
                  is locked. Clicking a node opens the study dialog.
     Materials    the full notes (renderSectionList / renderSectionContent in
                  app.js).
     Leaderboard  battles (the mode picker, or the battle being played) over
                  the league (renderBattleView / renderLeaderboardPage, app.js).
   The study dialog picks how to study a node: Memorize, Battle, and under
   "More ways to study" Hard round, Speed-run and Practice test. Rounds run in
   round-view.js (openRound); after one closes, learnAfterRound() redraws the
   path so the rings move.

   Exported (browser globals): pathNodes, termItems, lessonBank, nodeRing,
   nodeForgotten, currentNodeId, renderLearn, renderPath, learnHeaderHTML,
   learnRefresh, learnAfterRound, openStudyDialog, closeStudyDialog,
   studyGo, studyNow, PATH_WAVE. isLessonItem lives in round.js and node ids
   in app.js unitPathNodes(). */

/* ---------- nodes ---------- */

function lessonBank() {
  const u = unitData();
  return (u && u.lessons) || {};
}

/* Every node of the active unit's path, in the unit's section order. */
function pathNodes() {
  return unitPathNodes(store.activeUnit);
}

/* Every lesson term of the active unit with the path node it sits in. */
function termItems() {
  const out = [];
  pathNodes().forEach(node => node.items.forEach(it => out.push(Object.assign({}, it, { nodeId: node.id }))));
  return out;
}

function nodeCodes(node) { return node.items.map(it => it.code); }

/* The node's mastery ring, 0-100: its terms' average memory strength. */
function nodeRing(node) {
  return MEMORY.ringPercent(nodeCodes(node), state.memory);
}

function nodeForgotten(node) {
  const t = today();
  return node.items.filter(it => MEMORY.status(state.memory[it.code], t) === 'forgotten').length;
}

/* The current step: the first node under 100%, or null when all are mastered. */
function currentNodeId() {
  const n = pathNodes().find(x => nodeRing(x) < 100);
  return n ? n.id : null;
}

function nodeDomId(id) { return 'node-' + String(id).replace(/[^A-Za-z0-9_-]/g, '_'); }

/* ---------- page ---------- */

const ICON_SPROUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 20h10"/><path d="M12 20v-9"/><path d="M12 11c0-3-2-5-6-5 0 3 2 5 6 5z"/><path d="M12 13c0-3.5 2.5-6 6.5-6 0 3.5-2.5 6-6.5 6z"/></svg>';

// Horizontal offsets (px) that make the column wind like a path.
const PATH_WAVE = [0, 34, 62, 78, 62, 34, 0, -16];

// Unit colours (spec: Unit 1 sky blue, Unit 2 red).
const LEARN_UNIT_COL = { u1: 'var(--sky)', u2: 'var(--wrong)' };

const LEARN_TAB_LABELS = { path: '🎮 Path', materials: '📚 Materials', leaderboard: '🏆 Leaderboard' };

let learnObserver = null;     // watches the current node for the "Current step" pill
let learnStickObserver = null;

function learnHeaderHTML(active) {
  const u = unitDef();
  return `
    <div class="learn-head">
      <div class="learn-name">
        <span class="learn-sq" style="--unit:${LEARN_UNIT_COL[u.id] || 'var(--sky)'}" aria-hidden="true"></span>
        <h2><span class="learn-unit-label">${escapeHTML(u.label)}</span>${escapeHTML(u.name)}</h2>
      </div>
      <button class="g-btn learn-study" onclick="studyNow()"><span aria-hidden="true">🎮</span> Study unit</button>
    </div>
    <div class="learn-stick-sentinel" aria-hidden="true"></div>
    <div class="g-tabs learn-tabs" role="tablist" aria-label="Learn">
      ${LEARN_TABS.map(t => `<button class="g-tab${t === active ? ' active' : ''}" role="tab" id="learn-tab-${t}" aria-selected="${t === active}" tabindex="${t === active ? 0 : -1}" onclick="navigate('learn',{tab:'${t}'})">${LEARN_TAB_LABELS[t]}</button>`).join('')}
    </div>`;
}

/* Draw the Learn page. A letter means that section's notes (Materials). */
function renderLearn(letter, tab) {
  const container = el('learn-content');
  if (!container) return;
  if (learnObserver) { learnObserver.disconnect(); learnObserver = null; }

  if (letter) {
    learnTab = 'materials';
    currentSection = letter;
    loadData([letter.toLowerCase()]);
    const data = DATA[letter.toLowerCase()];
    if (!data) {
      container.innerHTML = learnHeaderHTML('materials') + `<div class="empty-state"><div class="icon">🚧</div><p>Section ${escapeHTML(letter)} content coming soon!</p></div>`;
    } else {
      renderSectionContent(container, data, letter);
    }
  } else {
    currentSection = null;
    if (tab && LEARN_TABS.includes(tab)) learnTab = tab;
    if (learnTab === 'materials') renderSectionList(container);
    else if (learnTab === 'leaderboard') renderLearnLeaderboard(container);
    else renderPath(container);
  }
  learnWatchSticky(container);
}

/* Redraw what is showing without moving the scroll (after a round, or when
   another tab changed saved progress). */
function learnRefresh() {
  const main = el('main-content');
  const y = main ? main.scrollTop : 0;
  if (learnTab === 'path') { renderPath(el('learn-content'), true); learnWatchSticky(el('learn-content')); }
  else renderLearn(null, learnTab);
  if (main) main.scrollTop = y;
}

/* round-view.js closeRound() calls this before giving focus back. */
function learnAfterRound() {
  if (typeof currentPage !== 'undefined' && currentPage === 'learn' && !currentSection && learnTab !== 'materials') learnRefresh();
}

function renderLearnLeaderboard(container) {
  container.innerHTML = learnHeaderHTML('leaderboard') + `
    <div id="learn-battle" class="learn-battle-area" tabindex="-1" aria-label="Battle"></div>
    <div id="learn-lb"></div>`;
  renderBattleView();
}

/* Tabs follow the ARIA tabs pattern: arrows move between them. */
document.addEventListener('keydown', e => {
  const t = e.target;
  if (!t || !t.closest || !t.closest('.learn-tabs')) return;
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
  e.preventDefault();
  const i = LEARN_TABS.indexOf(learnTab);
  const n = LEARN_TABS.length;
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
  navigate('learn', { tab: LEARN_TABS[next] });
  const b = el('learn-tab-' + LEARN_TABS[next]);
  if (b) b.focus();
});

/* The tabs stick to the top while scrolling and turn into dark pills. */
function learnWatchSticky(container) {
  if (learnStickObserver) { learnStickObserver.disconnect(); learnStickObserver = null; }
  const sentinel = container.querySelector('.learn-stick-sentinel');
  const tabs = container.querySelector('.learn-tabs');
  if (!sentinel || !tabs || typeof IntersectionObserver === 'undefined') return;
  learnStickObserver = new IntersectionObserver(([en]) => {
    tabs.classList.toggle('stuck', !en.isIntersecting && en.boundingClientRect.top < (en.rootBounds ? en.rootBounds.top + 1 : 1));
  }, { root: el('main-content'), threshold: 0 });
  learnStickObserver.observe(sentinel);
}

/* ---------- path ---------- */

function renderPath(container, keepScroll) {
  if (!container) return;
  if (learnObserver) { learnObserver.disconnect(); learnObserver = null; }
  const nodes = pathNodes();
  const curId = currentNodeId();
  const mastered = nodes.filter(n => nodeRing(n) >= 100).length;

  let html = learnHeaderHTML('path') + `
    <p class="lp-summary">${mastered} of ${nodes.length} step${nodes.length === 1 ? '' : 's'} mastered${curId ? '' : ' · every step is mastered. Study any one to keep it fresh.'}</p>`;

  let lastLetter = null;
  let i = 0;
  nodes.forEach(n => {
    if (n.letter !== lastLetter) {
      if (lastLetter) html += '</ol>';
      lastLetter = n.letter;
      i = 0;
      const secNodes = nodes.filter(x => x.letter === n.letter);
      const secPct = Math.round(secNodes.reduce((s, x) => s + nodeRing(x), 0) / secNodes.length);
      html += `
        <div class="lp-section" style="--sec:${sectionColour(n.letter)}">
          <span class="lp-section-chip" aria-hidden="true">${n.letter}</span>
          <h3 class="lp-section-title">${escapeHTML(n.section.title)}</h3>
          <span class="lp-section-pct">${secPct}%</span>
        </div>
        <ol class="lp-col">`;
    }
    const pct = nodeRing(n);
    const forgot = nodeForgotten(n);
    const isCurrent = n.id === curId;
    const cls = isCurrent ? 'current' : pct >= 100 ? 'mastered' : pct > 0 ? 'started' : 'new';
    const cards = n.items.length;
    const label = `${n.title}, ${cards} card${cards === 1 ? '' : 's'}, ${pct}% learned${forgot ? `, ${forgot} forgotten` : ''}${isCurrent ? ', current step' : ''}`;
    html += `
      <li class="lp-row" style="--x:${PATH_WAVE[i % PATH_WAVE.length]}">
        <button class="lp-node ${cls}" id="${nodeDomId(n.id)}" onclick="openStudyDialog('${escapeHTML(n.id)}')" aria-label="${escapeHTML(label)}">
          <span class="g-ring lp-ring" style="--pct:${pct}">
            <span class="lp-badge">${pct > 0 ? `<span class="lp-pct">${pct}%</span>` : ICON_SPROUT}</span>
          </span>
          ${forgot ? `<span class="lp-forgot" aria-hidden="true">${forgot}</span>` : ''}
          <span class="lp-label">
            <span class="lp-title">${escapeHTML(n.title)}</span>
            <span class="lp-meta">${cards} card${cards === 1 ? '' : 's'}</span>
          </span>
        </button>
      </li>`;
    i++;
  });
  if (lastLetter) html += '</ol>';
  html += `<button class="g-btn lp-jump" id="lp-jump" hidden onclick="learnJumpToCurrent()"><span id="lp-jump-arrow" aria-hidden="true">↑</span> Current step</button>`;
  container.innerHTML = html;

  const cur = curId && el(nodeDomId(curId));
  if (!cur) return;
  if (!keepScroll && nodes[0] && curId !== nodes[0].id) {
    requestAnimationFrame(() => cur.scrollIntoView({ block: 'center' }));
  }
  if (typeof IntersectionObserver !== 'undefined') {
    const pill = el('lp-jump');
    learnObserver = new IntersectionObserver(([en]) => {
      if (!pill) return;
      pill.hidden = en.isIntersecting;
      const rootTop = en.rootBounds ? en.rootBounds.top : 0;
      el('lp-jump-arrow').textContent = en.boundingClientRect.top < rootTop ? '↑' : '↓';
    }, { root: el('main-content'), threshold: 0 });
    learnObserver.observe(cur);
  }
}

function learnJumpToCurrent() {
  const id = currentNodeId();
  const node = id && el(nodeDomId(id));
  if (!node) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  node.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  node.focus({ preventScroll: true });
}

/* ---------- study dialog ---------- */

const STUDY_OPTIONS = [
  { id: 'memorize', emoji: '🧠', name: 'Memorize', sub: 'Learn and recall this step\'s cards' },
  { id: 'flash', emoji: '🃏', name: 'Flashcards', sub: 'Flip each card, then mark yourself' },
  { id: 'battle', emoji: '⚔️', name: 'Battle', sub: 'Race a league rival' },
  { id: 'hard', emoji: '😈', name: 'Hard round', sub: 'Every answer typed, no hints', more: true },
  { id: 'speed', emoji: '⚡', name: 'Speed-run', sub: 'Beat the clock on every card', more: true },
  { id: 'practice', emoji: '📝', name: 'Practice test', sub: 'Exam questions for this section', more: true }
];

let study = null;   // { nodeId, choice, more, returnFocus } while the dialog is open

/* The sidebar's Study pill and the header's "Study unit": the current step. */
function studyNow() {
  if (typeof SIDEBAR_BREAKPOINT !== 'undefined' && window.innerWidth < SIDEBAR_BREAKPOINT && sidebarOpen) closeSidebar();
  openStudyDialog(currentNodeId());
}

function openStudyDialog(nodeId) {
  const nodes = pathNodes();
  const node = nodes.find(n => n.id === nodeId) || nodes[0];
  const box = el('study-dialog');
  if (!node || !box) return;
  study = { nodeId: node.id, choice: 'memorize', more: false, returnFocus: study ? study.returnFocus : document.activeElement };
  renderStudyDialog();
  box.hidden = false;
  document.body.classList.add('study-open');
  document.querySelectorAll('.app-shell, #sidebar, #right-rail, #sidebar-backdrop').forEach(n => { n.inert = true; });
  const checked = box.querySelector('input[name="study-mode"]:checked');
  if (checked) checked.focus();
}

function renderStudyDialog() {
  const box = el('study-dialog');
  const node = pathNodes().find(n => n.id === study.nodeId);
  if (!box || !node) return;
  const pct = nodeRing(node);
  const forgot = nodeForgotten(node);
  const opt = o => `
    <label class="study-opt${study.choice === o.id ? ' selected' : ''}">
      <input type="radio" name="study-mode" value="${o.id}" ${study.choice === o.id ? 'checked' : ''} onchange="studyChoose('${o.id}')">
      <span class="study-emoji" aria-hidden="true">${o.emoji}</span>
      <span class="study-opt-text"><b>${o.name}</b><small>${escapeHTML(o.sub)}</small></span>
    </label>`;
  box.innerHTML = `
    <div class="study-modal" role="dialog" aria-modal="true" aria-labelledby="study-title" aria-describedby="study-step">
      <button class="study-x" onclick="closeStudyDialog()" aria-label="Close">✕</button>
      <h2 class="g-display g-wavy study-title" id="study-title" aria-label="Study">${'Study'.split('').map(c => `<span aria-hidden="true">${c}</span>`).join('')}</h2>
      <div class="study-node">
        <span class="g-ring lp-ring" style="--pct:${pct}"><span class="lp-badge">${pct > 0 ? `<span class="lp-pct">${pct}%</span>` : ICON_SPROUT}</span></span>
        ${forgot ? `<span class="lp-forgot" title="${forgot} forgotten">${forgot}</span>` : ''}
      </div>
      <p class="study-step" id="study-step">${escapeHTML(node.title)} <span>· ${node.items.length} card${node.items.length === 1 ? '' : 's'}</span></p>
      <div class="study-opts" role="radiogroup" aria-label="How to study">
        ${STUDY_OPTIONS.filter(o => !o.more).map(opt).join('')}
        <button class="study-more" aria-expanded="${study.more}" aria-controls="study-more-opts" onclick="studyToggleMore()">More ways to study <span aria-hidden="true">${study.more ? '⌃' : '⌄'}</span></button>
        <div id="study-more-opts" class="study-more-opts"${study.more ? '' : ' hidden'}>
          ${STUDY_OPTIONS.filter(o => o.more).map(opt).join('')}
        </div>
      </div>
      <button class="g-btn g-btn-block study-go" id="study-go" onclick="studyGo()">Let's go</button>
    </div>`;
}

function studyChoose(id) {
  if (!study) return;
  study.choice = id;
  document.querySelectorAll('#study-dialog .study-opt').forEach(l => {
    const input = l.querySelector('input');
    l.classList.toggle('selected', !!(input && input.checked));
  });
}

function studyToggleMore() {
  if (!study) return;
  study.more = !study.more;
  renderStudyDialog();
  const b = document.querySelector('#study-dialog .study-more');
  if (b) b.focus();
}

/* restoreFocus false: the caller moves focus itself (or the page is changing). */
function closeStudyDialog(restoreFocus = true) {
  if (!study) return;
  const back = study.returnFocus;
  study = null;
  const box = el('study-dialog');
  if (box) { box.hidden = true; box.innerHTML = ''; }
  document.body.classList.remove('study-open');
  document.querySelectorAll('.app-shell, #sidebar, #right-rail, #sidebar-backdrop').forEach(n => { n.inert = false; });
  if (restoreFocus && back && document.contains(back) && typeof back.focus === 'function') back.focus({ preventScroll: true });
}

function studyGo() {
  if (!study) return;
  const { nodeId, choice } = study;
  const node = pathNodes().find(n => n.id === nodeId);
  closeStudyDialog(true);
  if (!node) return;
  if (choice === 'memorize' || choice === 'hard' || choice === 'speed') {
    // A round over a live battle ends the battle (its clock would answer for you).
    if (typeof battle !== 'undefined' && battle) { leaveBattle(); if (battleOnScreen()) renderBattleView(); }
    // Focus goes back to the opener first, so the round returns to it.
    openRound(nodeId, choice);
  } else if (choice === 'flash') {
    if (typeof battle !== 'undefined' && battle) { leaveBattle(); if (battleOnScreen()) renderBattleView(); }
    // Flip cards for this round only: the saved round settings stay as they are.
    openRound(nodeId, 'memorize', { styleOverride: 'flash' });
  } else if (choice === 'battle') {
    // A Duel against the rival rated just above you, on this node's section.
    navigate('learn', { tab: 'leaderboard' });
    startBattle('duel', null, node.letter);
  } else if (choice === 'practice') {
    qMode = 'practice';
    qShow = 'all';
    qFilter = node.letter;
    qIdx = 0;
    navigate('questions');
  }
}

/* Escape closes, Tab stays inside, and the site's / and ? keys wait. Runs in
   the capture phase so nothing behind the dialog sees these keys. */
window.addEventListener('keydown', e => {
  if (!study) return;
  const box = el('study-dialog');
  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopImmediatePropagation();
    closeStudyDialog();
  } else if (e.key === 'Tab') {
    const modal = box && box.querySelector('.study-modal');
    if (!modal) return;
    // One stop per radio group: only the checked radio is tabbable.
    const items = [...modal.querySelectorAll('button, input')].filter(n => !n.disabled && n.offsetParent !== null && (n.type !== 'radio' || n.checked));
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    const a = document.activeElement;
    if (!modal.contains(a)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
    else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
  } else if (e.key === '/' || e.key === '?') {
    e.stopImmediatePropagation();
  } else if (e.key === 'Enter' && e.target && e.target.name === 'study-mode') {
    e.preventDefault();
    studyGo();
  }
}, true);

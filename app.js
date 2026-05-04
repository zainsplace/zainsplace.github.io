/* ===== UNIT 1 REVISION APP ===== */

/* ---- STATE ---- */
const STATE_KEY = 'u1rev_state';
let state = loadState();

function defaultState() {
  return {
    rag: {},           // code -> 'red'|'amber'|'green'
    reviewed: {},      // code -> true
    flashcards: {
      boxes: {},       // cardId -> 1..5
      nextDue: {},     // cardId -> ISO date string
      history: []      // {date, correct, wrong}
    },
    questions: {
      history: []      // {qId, marks, date, selfScore}
    },
    streak: {
      last: null,
      count: 0
    },
    extended: {
      history: []      // {type, wordCount, date, timeTaken}
    }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    const d = defaultState();
    return deepMerge(d, s);
  } catch { return defaultState(); }
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function deepMerge(target, source) {
  const out = Object.assign({}, target);
  for (const k in source) {
    if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
      out[k] = deepMerge(target[k] || {}, source[k]);
    } else {
      out[k] = source[k];
    }
  }
  return out;
}

/* ---- DATA STORE (inlined — no fetch required) ---- */
const DATA = {};

function loadData(sections) {
  const map = { a: INLINE_A, b: INLINE_B, c: INLINE_C, d: INLINE_D, e: INLINE_E, f: INLINE_F };
  sections.forEach(s => { if (!DATA[s]) DATA[s] = map[s] || null; });
}

function loadJSON(path) {
  if (path === 'data/flashcards.json') return INLINE_FLASHCARDS;
  if (path === 'data/questions.json')  return INLINE_QUESTIONS;
  if (path === 'data/extended.json')   return INLINE_EXTENDED || null;
  return null;
}

/* ---- NAVIGATION ---- */
const PAGES = ['home', 'sections', 'flashcards', 'questions', 'extended', 'search', 'plan'];
let currentPage = 'home';
let currentSection = null;

function navigate(page, opts = {}) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  const navEl = document.querySelector(`.nav-btn[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');
  renderPage(page, opts);
}

function renderPage(page, opts) {
  switch (page) {
    case 'home': renderHome(); break;
    case 'sections': renderSections(opts.section); break;
    case 'flashcards': renderFlashcards(); break;
    case 'questions': renderQuestions(); break;
    case 'extended': renderExtended(); break;
    case 'search': renderSearch(); break;
    case 'plan': renderPlan(); break;
  }
}

/* ---- HELPERS ---- */
function el(id) { return document.getElementById(id); }

function toast(msg, ms = 2000) {
  const t = el('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
}

function daysUntilExam() {
  const exam = new Date('2026-05-15');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((exam - now) / 86400000));
}

function ragClass(code) {
  const r = state.rag[code];
  if (r === 'green') return 'active-green';
  if (r === 'amber') return 'active-amber';
  if (r === 'red') return 'active-red';
  return '';
}

function sectionTierClass(letter) {
  const t1 = ['C', 'D', 'B', 'E'];
  const t2 = ['A', 'F'];
  if (t1.includes(letter)) return 'tier1';
  if (t2.includes(letter)) return 'tier2';
  return 'tier3';
}

function sectionColour(letter) {
  const map = { A: '#3182ce', B: '#d69e2e', C: '#e53e3e', D: '#e53e3e', E: '#dd6b20', F: '#9f7aea' };
  return map[letter] || '#6c63ff';
}

function sectionProgress(letter) {
  const codes = getSectionCodes(letter);
  if (!codes.length) return 0;
  const done = codes.filter(c => state.rag[c] === 'green').length;
  return Math.round((done / codes.length) * 100);
}

function getSectionCodes(letter) {
  const d = DATA[letter.toLowerCase()];
  if (!d) return [];
  const codes = [];
  function walk(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.code && /^[A-F][0-9]+\.[0-9]+/.test(obj.code)) codes.push(obj.code);
    Object.values(obj).forEach(v => { if (typeof v === 'object') walk(v); });
  }
  walk(d);
  return [...new Set(codes)];
}

function overallProgress() {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const built = letters.filter(l => DATA[l.toLowerCase()]);
  if (!built.length) return 0;
  let total = 0, done = 0;
  built.forEach(l => {
    const codes = getSectionCodes(l);
    total += codes.length;
    done += codes.filter(c => state.rag[c] === 'green').length;
  });
  return total ? Math.round((done / total) * 100) : 0;
}

function ragCounts() {
  const vals = Object.values(state.rag);
  return {
    green: vals.filter(v => v === 'green').length,
    amber: vals.filter(v => v === 'amber').length,
    red: vals.filter(v => v === 'red').length
  };
}

function today() {
  return new Date().toISOString().split('T')[0];
}

/* ---- HOME ---- */
function renderHome() {
  loadData(['c', 'd', 'b', 'e', 'a', 'f']);
  updateStreak();

  const days = daysUntilExam();
  const prog = overallProgress();
  const rc = ragCounts();
  const flashDue = getFlashcardsDueCount();

  el('home-countdown-days').textContent = days;
  el('home-overall-progress').style.width = prog + '%';
  el('home-overall-pct').textContent = prog + '%';
  el('home-stat-green').textContent = rc.green;
  el('home-stat-amber').textContent = rc.amber;
  el('home-stat-red').textContent = rc.red;
  el('home-stat-streak').textContent = state.streak.count;
  el('home-flash-due').textContent = flashDue;

  renderSectionTiles();
}

function renderSectionTiles() {
  const container = el('section-tiles');
  const sections = [
    { letter: 'C', name: 'Operating Online', topics: 'Cloud, VPN, Online Communities' },
    { letter: 'D', name: 'Protecting Data', topics: 'Threats, Encryption, Firewalls' },
    { letter: 'B', name: 'Transmitting Data', topics: 'Networks, Protocols, Compression' },
    { letter: 'E', name: 'Impact of IT', topics: 'Online Services, Data, E-commerce' },
    { letter: 'A', name: 'IT Systems & Devices', topics: 'Devices, OS, Software, Interfaces' },
    { letter: 'F', name: 'Legal & Ethical', topics: 'GDPR, Computer Misuse, Copyright' }
  ];

  container.innerHTML = sections.map(s => {
    const prog = sectionProgress(s.letter);
    const tier = sectionTierClass(s.letter);
    const col = sectionColour(s.letter);
    return `
      <div class="section-tile" onclick="navigate('sections', {section:'${s.letter}'})">
        <div class="tile-accent" style="background:${col}"></div>
        <div class="tile-code" style="color:${col}">${s.letter}</div>
        <div class="badge ${tier}" style="margin-bottom:6px">${tier === 'tier1' ? '🔥 Tier 1' : tier === 'tier2' ? '⚡ Tier 2' : '📌 Tier 3'}</div>
        <h3>${s.name}</h3>
        <p>${s.topics}</p>
        <div class="tile-progress"><div class="tile-progress-bar" style="width:${prog}%;background:${col}"></div></div>
        <div style="font-size:12px;color:var(--text2);margin-top:4px">${prog}% confident</div>
      </div>`;
  }).join('');
}

/* ---- SECTIONS PAGE ---- */
let sectionFilter = 'all';

function renderSections(letter) {
  const container = el('sections-content');

  if (!letter) {
    renderSectionList(container);
    return;
  }

  currentSection = letter;
  loadData([letter.toLowerCase()]);
  const data = DATA[letter.toLowerCase()];

  if (!data) {
    container.innerHTML = `<div class="empty-state"><div class="icon">🚧</div><p>Section ${letter} content coming soon!</p></div>`;
    return;
  }

  renderSectionContent(container, data, letter);
}

function renderSectionList(container) {
  const sections = [
    { letter: 'C', name: 'Operating Online', tier: 'tier1', col: '#e53e3e' },
    { letter: 'D', name: 'Protecting Data', tier: 'tier1', col: '#e53e3e' },
    { letter: 'B', name: 'Transmitting Data', tier: 'tier1', col: '#d69e2e' },
    { letter: 'E', name: 'Impact of IT Systems', tier: 'tier1', col: '#dd6b20' },
    { letter: 'A', name: 'IT Systems & Devices', tier: 'tier2', col: '#3182ce' },
    { letter: 'F', name: 'Legal & Ethical Issues', tier: 'tier2', col: '#9f7aea' }
  ];
  container.innerHTML = `
    <h2 style="margin-bottom:16px">Sections</h2>
    <div class="grid2">
      ${sections.map(s => `
        <div class="section-tile" onclick="navigate('sections',{section:'${s.letter}'})">
          <div class="tile-accent" style="background:${s.col}"></div>
          <div class="tile-code" style="color:${s.col}">${s.letter}</div>
          <h3>${s.name}</h3>
          <div class="tile-progress"><div class="tile-progress-bar" style="width:${sectionProgress(s.letter)}%;background:${s.col}"></div></div>
        </div>`).join('')}
    </div>`;
}

function renderSectionContent(container, data, letter) {
  const col = sectionColour(letter);

  let html = `
    <div class="section-header">
      <button class="section-header-back" onclick="navigate('sections')" title="Back">←</button>
      <h2><span style="color:${col}">${data.section}</span> — ${data.title}</h2>
      <span class="badge ${sectionTierClass(letter)}">${sectionTierClass(letter) === 'tier1' ? '🔥 Tier 1' : '⚡ Tier 2'}</span>
    </div>`;

  data.topics.forEach(topic => {
    html += `<div class="subtopic-header">${topic.code} ${topic.title}</div>`;
    topic.subtopics.forEach(sub => {
      html += `<div class="subtopic-header" style="font-size:12px;margin-bottom:4px">${sub.code ? sub.code + (sub.title ? ' — ' + sub.title : '') : sub.title || ''}</div>`;
      if (sub.comparisonTable) {
        html += `<div class="subtopic-table-wrap"><div class="subtopic-table-title">Overview</div>${renderComparisonTable(sub.comparisonTable)}</div>`;
      }
      sub.items.forEach(item => {
        html += renderSpecItem(item, letter);
      });
    });
  });

  container.innerHTML = html;
}

function renderComparisonTable(t) {
  if (!t) return '';
  const headers = t.headers.map(h => `<th>${h}</th>`).join('');
  const rows = t.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
  return `<div class="comparison-table-wrap"><table class="comparison-table">
    ${t.title ? `<caption>${t.title}</caption>` : ''}
    <thead><tr>${headers}</tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

function renderSpecItem(item, letter) {
  const ragVal = state.rag[item.code] || '';
  const reviewedKey = letter + '_' + item.code;
  const isReviewed = state.reviewed[reviewedKey];

  return `
    <div class="card" id="item-${item.code}">
      <div class="card-header" onclick="toggleCard('${item.code}')">
        <span class="badge" style="min-width:65px;text-align:center">${item.code}</span>
        <h3>${item.term}</h3>
        ${isReviewed ? '<span style="color:var(--green);font-size:12px">✓</span>' : ''}
        <span class="chevron" id="chev-${item.code}">▼</span>
      </div>
      <div class="card-body hidden" id="body-${item.code}">
        <p class="definition-text">${item.definition}</p>
        ${item.examples ? `<p class="examples-text">Examples: ${item.examples}</p>` : ''}
        ${item.comparisonTable ? renderComparisonTable(item.comparisonTable) : ''}
        ${item.keyFacts && item.keyFacts.length ? `
          <ul class="key-facts">
            ${item.keyFacts.map(f => `<li>${f}</li>`).join('')}
          </ul>` : ''}
        ${item.examTip ? `<div class="exam-tip">${item.examTip}</div>` : ''}
        <div class="rag-btns">
          <button class="rag-btn ${ragVal === 'red' ? 'active-red' : ''}" onclick="setRAG('${item.code}', 'red', '${letter}')">🔴 Not sure</button>
          <button class="rag-btn ${ragVal === 'amber' ? 'active-amber' : ''}" onclick="setRAG('${item.code}', 'amber', '${letter}')">🟡 Getting there</button>
          <button class="rag-btn ${ragVal === 'green' ? 'active-green' : ''}" onclick="setRAG('${item.code}', 'green', '${letter}')">🟢 Confident</button>
        </div>
        ${isReviewed ? `<div class="reviewed-banner">✓ Marked as reviewed</div>` : `<button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="markReviewed('${item.code}', '${letter}')">Mark as reviewed</button>`}
      </div>
    </div>`;
}

function toggleCard(code) {
  const body = el('body-' + code);
  const chev = el('chev-' + code);
  if (!body) return;
  body.classList.toggle('hidden');
  chev.classList.toggle('open');
}

function setRAG(code, val, letter) {
  state.rag[code] = val;
  saveState();
  const card = el('item-' + code);
  if (card) {
    card.querySelectorAll('.rag-btn').forEach(b => {
      b.className = 'rag-btn';
      if (b.textContent.includes('Not sure') && val === 'red') b.classList.add('active-red');
      if (b.textContent.includes('Getting') && val === 'amber') b.classList.add('active-amber');
      if (b.textContent.includes('Confident') && val === 'green') b.classList.add('active-green');
    });
  }
  toast(val === 'green' ? '✓ Marked confident' : val === 'amber' ? 'Noted — keep practising' : 'Added to revision priority');
}

function markReviewed(code, letter) {
  const key = letter + '_' + code;
  state.reviewed[key] = true;
  saveState();
  navigate('sections', { section: letter });
}

/* ---- FLASHCARDS ---- */
let flashQueue = [];
let flashIdx = 0;
let flashData = null;
let flashFlipped = false;
let flashFilter = 'all';
let flashPracticeMode = false;

const LEITNER_INTERVALS = [0, 1, 2, 4, 8, 16];

function renderFlashcards() {
  flashData = loadJSON('data/flashcards.json');
  if (!flashData) {
    el('flashcards-content').innerHTML = `<div class="empty-state"><div class="icon">📚</div><p>Flashcard data loading...</p></div>`;
    return;
  }
  buildFlashQueue();
  renderFlashUI();
}

function buildFlashQueue() {
  if (!flashData) return;
  const todayStr = today();
  flashQueue = flashData.cards.filter(card => {
    if (flashFilter !== 'all' && card.section !== flashFilter) return false;
    if (flashPracticeMode) return true;
    const due = state.flashcards.nextDue[card.id];
    if (!due || due <= todayStr) return true;
    return false;
  });
  flashIdx = 0;
  flashFlipped = false;
}

function renderFlashUI() {
  const container = el('flashcards-content');
  const total = flashData ? flashData.cards.length : 0;
  const due = flashQueue.length;

  const boxCounts = [0, 0, 0, 0, 0];
  if (flashData) {
    flashData.cards.forEach(c => {
      const box = (state.flashcards.boxes[c.id] || 1) - 1;
      if (box >= 0 && box < 5) boxCounts[box]++;
    });
  }

  const boxNames     = ['New / Learning', 'Familiar', 'Confident', 'Strong', 'Mastered'];
  const boxIntervals = ['every 1 day', 'every 2 days', 'every 4 days', 'every 8 days', 'every 16 days'];
  const boxColors    = ['#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#6c63ff'];

  container.innerHTML = `
    <h2 style="margin-bottom:12px">Flashcards</h2>
    <div class="leitner-boxes">
      ${boxCounts.map((c, i) => `
        <div class="leitner-box">
          <div class="box-num" style="color:${boxColors[i]}">Box ${i + 1}</div>
          <div class="box-name">${boxNames[i]}</div>
          <div class="box-lbl">${boxIntervals[i]}</div>
          <div class="box-count">${c} card${c !== 1 ? 's' : ''}</div>
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
      <select id="flash-filter" onchange="setFlashFilter(this.value)" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px;border-radius:6px;font-size:14px">
        <option value="all" ${flashFilter === 'all' ? 'selected' : ''}>All sections</option>
        ${['A','B','C','D','E','F'].map(l => `<option value="${l}" ${flashFilter === l ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      <span style="font-size:14px;color:var(--text2)">${due} due today / ${total} total</span>
      <button class="btn btn-secondary btn-sm" onclick="flashPracticeMode=false;buildFlashQueue();renderFlashUI()">Refresh queue</button>
    </div>
    ${flashPracticeMode ? `<div style="background:rgba(108,99,255,0.1);border:1px solid rgba(108,99,255,0.3);border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:13px;color:var(--accent2)"><strong>Practice mode</strong> — reviewing all ${flashQueue.length} cards. Leitner progress is not being saved. <button class="btn btn-secondary btn-sm" style="margin-left:8px" onclick="flashPracticeMode=false;buildFlashQueue();renderFlashUI()">Exit practice mode</button></div>` : ''}
    ${due === 0 && !flashPracticeMode ? `
      <div class="empty-state">
        <div class="icon">🎉</div>
        <p>No flashcards due! Check back tomorrow.</p>
        <button class="btn btn-primary" style="margin-top:12px" onclick="flashPracticeMode=true;flashFilter='all';buildFlashQueue();renderFlashUI()">Study all cards anyway</button>
      </div>` : renderCurrentFlashcard()}`;
}

function renderCurrentFlashcard() {
  if (flashIdx >= flashQueue.length) {
    return `<div class="empty-state"><div class="icon">🎉</div><p>Session complete! ${flashQueue.length} cards reviewed.</p>
      <button class="btn btn-primary" style="margin-top:12px" onclick="flashPracticeMode=false;buildFlashQueue();renderFlashUI()">Start again</button></div>`;
  }
  const card = flashQueue[flashIdx];
  const box = state.flashcards.boxes[card.id] || 1;
  const pct = Math.round((flashIdx / flashQueue.length) * 100);
  return `
    <div style="font-size:13px;color:var(--text2);margin-bottom:8px">Card ${flashIdx + 1} of ${flashQueue.length} — Box ${box}</div>
    <div class="flashcard-scene" onclick="flipFlashcard()" id="flash-scene">
      <div class="flashcard-inner${flashFlipped ? ' flipped' : ''}" id="flash-inner">
        <div class="flashcard-face front">
          <span class="badge" style="margin-bottom:12px">${card.code}</span>
          <div class="term">${card.front}</div>
          <div class="hint">Tap to reveal</div>
        </div>
        <div class="flashcard-face back">
          <span class="badge" style="margin-bottom:12px">${card.section}</span>
          <div class="def">${card.back}</div>
        </div>
      </div>
    </div>
    <div class="rag-btns${flashFlipped ? '' : ' hidden'}" id="flash-answer-btns" style="margin-top:12px">
      <button class="rag-btn active-red" onclick="answerFlash(false)">✗ Didn't know</button>
      <button class="rag-btn active-green" onclick="answerFlash(true)">✓ Got it!</button>
    </div>
    <div class="progress-bar-wrap" style="margin-top:12px"><div class="progress-bar" id="flash-progress-bar" style="width:${pct}%"></div></div>`;
}

function flipFlashcard() {
  flashFlipped = !flashFlipped;
  const inner = el('flash-inner');
  if (inner) inner.classList.toggle('flipped', flashFlipped);
  const btns = el('flash-answer-btns');
  if (btns) btns.classList.toggle('hidden', !flashFlipped);
}

function answerFlash(correct) {
  const card = flashQueue[flashIdx];
  if (!flashPracticeMode) {
    const curBox = state.flashcards.boxes[card.id] || 1;
    const newBox = correct ? Math.min(5, curBox + 1) : 1;
    state.flashcards.boxes[card.id] = newBox;
    const interval = LEITNER_INTERVALS[newBox];
    const due = new Date();
    due.setDate(due.getDate() + interval);
    state.flashcards.nextDue[card.id] = due.toISOString().split('T')[0];
    saveState();
  }
  flashIdx++;
  flashFlipped = false;
  renderFlashUI();
}

function setFlashFilter(val) {
  flashFilter = val;
  flashPracticeMode = false;
  buildFlashQueue();
  renderFlashUI();
}

function getFlashcardsDueCount() {
  const todayStr = today();
  let count = 0;
  Object.entries(state.flashcards.nextDue).forEach(([id, due]) => {
    if (!due || due <= todayStr) count++;
  });
  return count;
}

/* ---- QUESTIONS ---- */
let qData = null;
let qMode = 'browse';
let qFilter = 'all';
let quizQueue = [];
let quizIdx = 0;

function renderQuestions() {
  qData = loadJSON('data/questions.json');
  const container = el('questions-content');
  if (!qData) {
    container.innerHTML = `<div class="empty-state"><div class="icon">📝</div><p>Question bank loading...</p></div>`;
    return;
  }

  if (qMode === 'quiz') {
    renderQuizMode(container);
  } else {
    renderBrowseMode(container);
  }
}

function renderBrowseMode(container) {
  const sections = ['all', 'A', 'B', 'C', 'D', 'E', 'F'];
  const filtered = qFilter === 'all' ? qData.questions : qData.questions.filter(q => q.section === qFilter);

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px">
      <h2>Practice Questions</h2>
      <button class="btn btn-primary btn-sm" onclick="startQuiz()">Start Quiz Mode</button>
    </div>
    <div class="tabs">
      ${sections.map(s => `<button class="tab-btn ${qFilter === s ? 'active' : ''}" onclick="setQFilter('${s}')">${s === 'all' ? 'All' : s}</button>`).join('')}
    </div>
    <div style="color:var(--text2);font-size:13px;margin-bottom:12px">${filtered.length} questions</div>
    ${filtered.map(q => renderQuestionCard(q)).join('')}`;
}

function renderQuestionCard(q) {
  const hist = state.questions.history.filter(h => h.qId === q.id);
  const lastScore = hist.length ? hist[hist.length - 1].selfScore : null;
  const scoreClass = lastScore === null ? '' : lastScore >= 70 ? 'active-green' : lastScore >= 40 ? 'active-amber' : 'active-red';

  return `
    <div class="question-card" id="qcard-${q.id}">
      <div class="question-meta">
        <span class="badge">${q.section}</span>
        <span class="badge">${q.marks} marks</span>
        <span class="badge">${q.commandWord}</span>
        <span class="q-marks">${q.code || ''}</span>
        ${lastScore !== null ? `<span class="badge ${scoreClass}">${lastScore}%</span>` : ''}
      </div>
      <p style="font-size:15px;line-height:1.5;margin-bottom:12px">${q.question}</p>
      <textarea class="quiz-answer-area" id="ans-${q.id}" placeholder="Write your answer here..." rows="4"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" onclick="showModelAnswer('${q.id}')">Show model answer</button>
        <button class="btn btn-sm" style="background:var(--green);color:#fff" onclick="selfMark('${q.id}', ${q.marks})">Self-mark</button>
      </div>
      <div class="model-answer" id="model-${q.id}">
        <strong>Model answer (${q.marks} marks):</strong><br>${q.modelAnswer}
        ${q.markPoints ? `<ul class="key-facts" style="margin-top:8px">${q.markPoints.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
      </div>
      <div id="selfmark-${q.id}" style="display:none;margin-top:10px">
        <p style="font-size:13px;color:var(--text2);margin-bottom:6px">How many marks do you think you earned?</p>
        <div class="self-mark">
          ${Array.from({length: q.marks + 1}, (_, i) => `<button class="btn btn-secondary btn-sm" onclick="recordScore('${q.id}', ${i}, ${q.marks})">${i}/${q.marks}</button>`).join('')}
        </div>
      </div>
    </div>`;
}

function showModelAnswer(qId) {
  const model = el('model-' + qId);
  if (model) model.classList.toggle('show');
}

function selfMark(qId, marks) {
  showModelAnswer(qId);
  const sm = el('selfmark-' + qId);
  if (sm) sm.style.display = 'block';
}

function recordScore(qId, score, maxMarks) {
  const pct = Math.round((score / maxMarks) * 100);
  state.questions.history.push({ qId, marks: maxMarks, date: today(), selfScore: pct });
  saveState();
  toast(`Recorded: ${score}/${maxMarks} (${pct}%)`);
  const sm = el('selfmark-' + qId);
  if (sm) sm.style.display = 'none';
}

function setQFilter(f) {
  qFilter = f;
  renderQuestions();
}

function startQuiz() {
  qMode = 'quiz';
  quizQueue = [...(qData ? qData.questions : [])].sort(() => Math.random() - 0.5).slice(0, 10);
  quizIdx = 0;
  renderQuestions();
}

function renderQuizMode(container) {
  if (quizIdx >= quizQueue.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🏆</div>
        <h2 style="margin-bottom:8px">Quiz Complete!</h2>
        <p>${quizQueue.length} questions answered.</p>
        <button class="btn btn-primary" style="margin-top:16px" onclick="qMode='browse';renderQuestions()">Back to browse</button>
      </div>`;
    return;
  }
  const q = quizQueue[quizIdx];
  container.innerHTML = `
    <div class="quiz-wrap">
      <div class="quiz-progress">
        <span>${quizIdx + 1}/${quizQueue.length}</span>
        <div class="bar"><div class="bar-fill" style="width:${Math.round((quizIdx/quizQueue.length)*100)}%"></div></div>
        <button class="btn btn-secondary btn-sm" onclick="qMode='browse';renderQuestions()">Exit</button>
      </div>
      <div class="card" style="margin-bottom:12px">
        <div class="question-meta">
          <span class="badge">${q.section}</span>
          <span class="badge">${q.marks} marks</span>
          <span class="badge">${q.commandWord}</span>
        </div>
        <p class="quiz-q">${q.question}</p>
        <textarea class="quiz-answer-area" id="quiz-ans" placeholder="Write your answer here..."></textarea>
        <button class="btn btn-primary btn-full" onclick="showQuizAnswer()">Show model answer</button>
      </div>
      <div class="model-answer" id="quiz-model" style="display:none">
        <strong>Model answer (${q.marks} marks):</strong><br>${q.modelAnswer}
        ${q.markPoints ? `<ul class="key-facts" style="margin-top:8px">${q.markPoints.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
        <div style="margin-top:12px">
          <p style="font-size:13px;margin-bottom:6px">Self-mark:</p>
          <div class="self-mark">
            ${Array.from({length: q.marks + 1}, (_, i) => `<button class="btn btn-secondary btn-sm" onclick="recordQuizScore('${q.id}', ${i}, ${q.marks})">${i}/${q.marks}</button>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

function showQuizAnswer() {
  const m = el('quiz-model');
  if (m) m.style.display = 'block';
}

function recordQuizScore(qId, score, maxMarks) {
  const pct = Math.round((score / maxMarks) * 100);
  state.questions.history.push({ qId, marks: maxMarks, date: today(), selfScore: pct });
  saveState();
  quizIdx++;
  renderQuestions();
}

/* ---- EXTENDED RESPONSE ---- */
let extTimer = null;
let extTimeLeft = 0;
let extTimerRunning = false;

function renderExtended() {
  const container = el('extended-content');
  const prompts = loadJSON('data/extended.json') || getFallbackExtended();

  container.innerHTML = `
    <h2 style="margin-bottom:16px">Extended Response Builder</h2>
    <p style="color:var(--text2);font-size:14px;margin-bottom:16px">Practise long-answer questions under timed conditions. Q4 carries 22 marks — this is where Distinctions are won or lost.</p>
    ${prompts.map((p, i) => renderExtPrompt(p, i)).join('')}`;
}

function getFallbackExtended() {
  return [
    {
      id: 'cloud-9',
      title: 'Cloud Computing Suitability (9 marks)',
      marks: 9,
      time: 540,
      section: 'C',
      command: 'Discuss',
      question: 'A small business currently stores all its customer data on local servers. The business owner is considering moving to cloud computing. Discuss the suitability of moving to cloud computing for this business. [9 marks]',
      tips: ['Identify the cloud model (SaaS/IaaS/PaaS or public/private/hybrid)', 'Give benefits: cost, scalability, accessibility, remote working', 'Give drawbacks: internet dependency, security, vendor lock-in, GDPR', 'Link points to the scenario (small business)', 'For Level 3: evaluate — is it suitable overall? Why?'],
      modelAnswer: 'Cloud computing could be highly suitable for the small business. Moving to the cloud would eliminate the need to purchase and maintain expensive local servers, reducing capital expenditure — important for a small business with limited resources. The business could use a public cloud model such as SaaS for applications, paying on a subscription basis, which converts a large one-off cost into a manageable ongoing expense.\n\nScalability is another key benefit: if the business grows and needs more storage, cloud resources can be increased almost instantly without purchasing additional hardware. Additionally, cloud-based systems allow employees to access customer data remotely, supporting flexible working arrangements.\n\nHowever, there are significant risks to consider. Cloud providers store data on remote servers, potentially in other countries, which raises compliance concerns under GDPR — the business must ensure its provider processes data lawfully. Security is also a risk: if the provider suffers a data breach, the business\'s customer data could be compromised, leading to financial penalties and reputational damage. Furthermore, the business becomes entirely dependent on a reliable internet connection; any outage would prevent access to customer data, causing disruption.\n\nOverall, cloud computing is suitable for this small business given the cost savings and scalability benefits, provided the business carefully selects a GDPR-compliant provider and ensures reliable internet connectivity.'
    },
    {
      id: 'security-threats-8',
      title: 'Cyber Security Threats and Impacts (8 marks)',
      marks: 8,
      time: 480,
      section: 'D',
      command: 'Discuss',
      question: 'A retail organisation has experienced a cyber attack in which customer payment data was stolen. Discuss the impacts of this cyber attack on the organisation. [8 marks]',
      tips: ['Cover multiple types of impact: financial, reputational, legal, operational', 'Use D1.3 codes: loss of data, financial loss, loss of customers', 'Mention GDPR penalties for data breaches', 'Link to the scenario (retail, customer payment data)', 'For Level 3: analyse — which impact is most severe and why?'],
      modelAnswer: 'The cyber attack would have severe impacts on the retail organisation across multiple areas. The most immediate impact is financial loss: the organisation may face significant fines under GDPR for failing to protect customer payment data — the ICO can impose fines of up to £17.5 million or 4% of global annual turnover. Legal action from affected customers seeking compensation adds further financial exposure.\n\nThe organisation would also suffer reputational damage. News of the breach, particularly involving payment data, would undermine customer trust significantly. Customers who feel their financial details are at risk will stop shopping with the retailer and may publicly share their concerns on social media, amplifying the damage. This loss of customers directly reduces revenue.\n\nOperationally, the organisation would need to invest in incident response — forensic investigation, notifying affected customers (required by GDPR within 72 hours), and potentially taking systems offline to contain the breach. This downtime prevents the business from trading normally, causing further financial loss.\n\nLong-term, the business would need to spend significantly on improving its cybersecurity infrastructure — stronger encryption, multi-factor authentication, penetration testing — which adds ongoing costs.\n\nOverall, the most damaging long-term impact is likely reputational, as lost customer trust is difficult to rebuild even after technical issues are resolved.'
    },
    {
      id: 'legal-ethical-10',
      title: 'Legal and Ethical Issues (10 marks)',
      marks: 10,
      time: 600,
      section: 'F',
      command: 'Evaluate',
      question: 'Evaluate the extent to which current legislation effectively protects individuals using IT systems. [10 marks]',
      tips: ['Name specific legislation: Data Protection Act 2018 / GDPR, Computer Misuse Act 1990, Copyright Designs and Patents Act 1988', 'For each law: what does it protect? What are its limitations?', 'Consider enforcement challenges (cross-border, anonymous attackers)', 'Balance strengths vs weaknesses', 'Conclusion: make a judgement — are individuals well-protected overall?'],
      modelAnswer: 'Current legislation provides a significant degree of protection for individuals using IT systems, though there are notable limitations in its effectiveness.\n\nThe Data Protection Act 2018 (incorporating GDPR) gives individuals rights over their personal data, including the right to access, correct, and request deletion of their data. Organisations must obtain consent before collecting data and report breaches within 72 hours. This is effective in that it creates accountability: the ICO can impose substantial fines on organisations that mishandle data. However, enforcement is challenging — many data breaches involve organisations based outside the UK, where the ICO has limited jurisdiction.\n\nThe Computer Misuse Act 1990 criminalises unauthorised access to computer systems and the creation of malicious software. This deters cybercrime by establishing clear legal consequences. However, the Act was written before modern cyber threats existed: it struggles to address sophisticated state-sponsored attacks, ransomware groups operating from overseas, and AI-generated attacks. Prosecuting anonymous online criminals is technically and legally complex.\n\nThe Copyright, Designs and Patents Act 1988 protects creators\' intellectual property, preventing software piracy and illegal file sharing. However, the rise of peer-to-peer file sharing and overseas piracy sites makes enforcement difficult.\n\nIn conclusion, legislation provides a strong framework and meaningful deterrents, but its effectiveness is significantly limited by the global, anonymous nature of the internet, which makes enforcement difficult. Individuals remain vulnerable to threats from overseas actors who face few real-world consequences. Legislation alone is therefore insufficient — technical measures such as encryption and security software remain essential.'
    },
    {
      id: 'networks-6',
      title: 'Network Selection for an Organisation (6 marks)',
      marks: 6,
      time: 360,
      section: 'B',
      command: 'Describe',
      question: 'A company has offices in three different cities across the UK. Describe the factors the company should consider when choosing a network to connect its offices. [6 marks]',
      tips: ['This is a 6-mark levels question — aim for at least 3 clear factors with explanation', 'Use B2.3 codes: security, cost, efficiency, implementation, user needs', 'Link each factor to the scenario (multiple offices, UK-wide)', 'Level 3 = factors are explained with relevance to the scenario'],
      modelAnswer: 'The company should consider security when choosing a network to connect its three offices. Because data will travel over public infrastructure between cities, the company should consider using a WAN with VPN technology to encrypt data in transit, protecting sensitive business information from interception.\n\nCost is another key factor. A WAN connecting offices across the UK involves significant infrastructure costs, including leased lines or broadband connections at each site. The company must balance the need for a reliable, high-speed connection against the budget available. Cheaper connections may offer insufficient bandwidth for the company\'s needs.\n\nReliability and efficiency must also be considered. The company needs a network that provides consistently low latency and high bandwidth to support real-time communication such as video conferencing between offices. A slow or unreliable connection would reduce productivity.\n\nFinally, implementation timescale should be considered — setting up a multi-site WAN takes time, and the company must plan for testing and potential downtime during migration to avoid disrupting operations.'
    }
  ];
}

function renderExtPrompt(p, i) {
  const timerId = 'timer-' + p.id;
  const textId = 'ext-text-' + p.id;
  const wcId = 'wc-' + p.id;
  const mins = Math.floor(p.time / 60);
  const secs = p.time % 60;

  const structureHtml = p.structure && p.structure.length ? `
    <div class="ext-structure" id="struct-${p.id}">
      <div class="ext-structure-title">Response structure</div>
      <ol class="ext-structure-list">${p.structure.map(s => `<li>${s}</li>`).join('')}</ol>
    </div>` : '';

  const markSchemeHtml = p.markScheme && p.markScheme.length ? `
    <div class="ext-markscheme" id="ms-${p.id}">
      <div class="ext-markscheme-title">Mark scheme</div>
      <ul class="ext-ms-list">${p.markScheme.map(m => `<li>${m.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>
    </div>` : '';

  return `
    <div class="card" style="margin-bottom:16px">
      <div class="card-header" onclick="toggleCard('ext-${i}')">
        <span class="badge">${p.section}</span>
        <span class="badge">${p.marks} marks</span>
        <h3>${p.title}</h3>
        <span class="chevron" id="chev-ext-${i}">▼</span>
      </div>
      <div class="card-body hidden" id="body-ext-${i}">
        <div class="ext-question">${p.question}</div>
        ${structureHtml}
        <div style="margin-bottom:12px">
          <strong style="font-size:13px">Examiner tips:</strong>
          <ul class="key-facts">${p.tips.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px">
          <div class="timer-display" id="${timerId}">${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}</div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-primary btn-sm" onclick="startTimer('${p.id}', ${p.time})">Start</button>
            <button class="btn btn-secondary btn-sm" onclick="resetTimer('${p.id}', ${p.time})">Reset</button>
          </div>
        </div>
        <textarea class="response-area" id="${textId}" placeholder="Write your extended response here..." oninput="updateWordCount('${p.id}')"></textarea>
        <div class="word-count" id="${wcId}">0 words</div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" onclick="toggleMarkScheme('${p.id}')">Show mark scheme</button>
          <button class="btn btn-secondary btn-sm" onclick="toggleModelExt('${p.id}')">Show full-mark sample</button>
        </div>
        ${markSchemeHtml}
        <div class="model-answer" id="model-ext-${p.id}">
          <strong>Full-mark sample answer:</strong><br><br>
          ${p.modelAnswer.replace(/\n/g, '<br>')}
        </div>
      </div>
    </div>`;
}

const extTimers = {};

function startTimer(id, totalSecs) {
  if (extTimers[id] && extTimers[id].running) return;
  const startTime = extTimers[id] ? extTimers[id].remaining : totalSecs;
  extTimers[id] = { remaining: startTime, running: true };

  const interval = setInterval(() => {
    if (!extTimers[id] || !extTimers[id].running) { clearInterval(interval); return; }
    extTimers[id].remaining--;
    updateTimerDisplay(id, extTimers[id].remaining, totalSecs);
    if (extTimers[id].remaining <= 0) {
      clearInterval(interval);
      extTimers[id].running = false;
      toast('⏰ Time is up!', 3000);
    }
  }, 1000);
  extTimers[id].interval = interval;
}

function resetTimer(id, totalSecs) {
  if (extTimers[id] && extTimers[id].interval) clearInterval(extTimers[id].interval);
  extTimers[id] = { remaining: totalSecs, running: false };
  updateTimerDisplay(id, totalSecs, totalSecs);
}

function updateTimerDisplay(id, secs, totalSecs) {
  const el_timer = el('timer-' + id);
  if (!el_timer) return;
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  el_timer.textContent = `${String(mins).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  el_timer.className = 'timer-display';
  if (secs <= 60) el_timer.classList.add('critical');
  else if (secs <= totalSecs * 0.33) el_timer.classList.add('warning');
}

function updateWordCount(id) {
  const textarea = el('ext-text-' + id);
  const wc = el('wc-' + id);
  if (!textarea || !wc) return;
  const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
  wc.textContent = words + ' words';
}

function toggleModelExt(id) {
  const m = el('model-ext-' + id);
  if (m) m.classList.toggle('show');
}

function toggleMarkScheme(id) {
  const m = el('ms-' + id);
  if (m) m.classList.toggle('show');
}

/* ---- SEARCH ---- */
let allSearchContent = [];
let searchBuilt = false;

function renderSearch() {
  if (!searchBuilt) {
    loadData(['a', 'b', 'c', 'd', 'e', 'f']);
    buildSearchIndex();
  }
  const container = el('search-content');
  container.innerHTML = `
    <h2 style="margin-bottom:12px">Search</h2>
    <input type="search" class="search-bar" id="search-input" placeholder="Search spec codes, terms, definitions..." oninput="doSearch(this.value)" autofocus>
    <div id="search-results" class="search-results">
      <div class="empty-state"><div class="icon">🔍</div><p>Type to search across all content</p></div>
    </div>`;
}

function buildSearchIndex() {
  allSearchContent = [];
  ['a', 'b', 'c', 'd', 'e', 'f'].forEach(s => {
    const d = DATA[s];
    if (!d) return;
    function walkData(obj) {
      if (!obj || typeof obj !== 'object') return;
      if (obj.code && obj.term) {
        allSearchContent.push({
          code: obj.code,
          term: obj.term,
          definition: obj.definition || '',
          section: d.section,
          sectionTitle: d.title,
          examTip: obj.examTip || ''
        });
      }
      Object.values(obj).forEach(v => { if (typeof v === 'object') walkData(v); });
    }
    walkData(d);
  });
  searchBuilt = true;
}

function doSearch(query) {
  const container = el('search-results');
  if (!query || query.length < 2) {
    container.innerHTML = `<div class="empty-state"><div class="icon">🔍</div><p>Type to search across all content</p></div>`;
    return;
  }
  const q = query.toLowerCase();
  const results = allSearchContent.filter(item =>
    item.code.toLowerCase().includes(q) ||
    item.term.toLowerCase().includes(q) ||
    item.definition.toLowerCase().includes(q) ||
    item.examTip.toLowerCase().includes(q)
  ).slice(0, 30);

  if (!results.length) {
    container.innerHTML = `<div class="empty-state"><div class="icon">😕</div><p>No results for "${query}"</p></div>`;
    return;
  }

  container.innerHTML = results.map(r => `
    <div class="search-result" onclick="goToResult('${r.section}', '${r.code}')">
      <div style="display:flex;gap:8px;margin-bottom:4px">
        <span class="badge">${r.code}</span>
        <span class="badge" style="background:rgba(108,99,255,0.1);color:var(--accent2)">${r.section} — ${r.sectionTitle}</span>
      </div>
      <h4>${highlight(r.term, query)}</h4>
      <p>${highlight(r.definition.substring(0, 120), query)}${r.definition.length > 120 ? '...' : ''}</p>
    </div>`).join('');
}

function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

function goToResult(section, code) {
  navigate('sections', { section });
  setTimeout(() => {
    const el_item = el('item-' + code);
    if (el_item) {
      el_item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const body = el('body-' + code);
      const chev = el('chev-' + code);
      if (body && body.classList.contains('hidden')) {
        body.classList.remove('hidden');
        if (chev) chev.classList.add('open');
      }
    }
  }, 300);
}

/* ---- DAILY PLAN ---- */
function renderPlan() {
  loadData(['a', 'b', 'c', 'd', 'e', 'f']);
  const container = el('plan-content');
  const plan = buildDailyPlan();

  container.innerHTML = `
    <div class="plan-header">
      <h2>Today's Study Plan</h2>
      <div class="streak-badge">🔥 ${state.streak.count} day streak</div>
    </div>
    <p style="color:var(--text2);font-size:14px;margin-bottom:16px">${daysUntilExam()} days until your exam on 15 May 2026. ${getMotivation()}</p>
    ${plan.map(block => `
      <div class="plan-day">
        <h3>${block.title}</h3>
        ${block.items.map((item, i) => `
          <div class="plan-item">
            <input type="checkbox" id="plan-${block.id}-${i}" onchange="savePlanCheck('${block.id}-${i}', this.checked)" ${getPlanCheck(block.id + '-' + i) ? 'checked' : ''}>
            <label for="plan-${block.id}-${i}" style="cursor:pointer;flex:1">${item}</label>
          </div>`).join('')}
      </div>`).join('')}
    <hr class="divider">
    <div class="card">
      <h3 style="margin-bottom:12px">Progress Overview</h3>
      ${renderRAGSummary()}
    </div>
    <hr class="divider">
    <h3 style="margin-bottom:12px">Settings & Data</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-secondary btn-sm" onclick="exportData()">Export progress</button>
      <button class="btn btn-secondary btn-sm" onclick="importData()">Import progress</button>
      <button class="btn btn-sm" style="background:var(--red);color:#fff" onclick="confirmReset()">Reset all progress</button>
    </div>`;
}

function buildDailyPlan() {
  const days = daysUntilExam();
  const rc = ragCounts();
  const flashDue = getFlashcardsDueCount();

  const weakCodes = Object.entries(state.rag)
    .filter(([, v]) => v === 'red')
    .map(([k]) => k)
    .slice(0, 4);

  const blocks = [];

  if (flashDue > 0) {
    blocks.push({
      id: 'flash',
      title: `📚 Flashcards (${flashDue} due)`,
      items: [`Review ${Math.min(flashDue, 20)} flashcards due today`, 'Focus extra on Box 1 cards (weakest)']
    });
  }

  if (days > 14) {
    blocks.push({
      id: 'content',
      title: '📖 Content Review',
      items: [
        'Work through Section C (Cloud Computing) — highest exam probability',
        'Work through Section D (Cyber Security threats and protection)',
        weakCodes.length ? `Revisit these red codes: ${weakCodes.join(', ')}` : 'Mark any uncertain codes as Amber or Red for tracking'
      ]
    });
  } else if (days > 7) {
    blocks.push({
      id: 'content',
      title: '📖 Focused Review',
      items: [
        'Complete any remaining Amber/Red codes',
        'Focus on Tier 1 topics: C1 (Cloud), D1-D2 (Security), B2-B3 (Networks)',
        weakCodes.length ? `Priority: ${weakCodes.join(', ')}` : 'Try to clear all Red codes this week'
      ]
    });
  } else {
    blocks.push({
      id: 'final',
      title: '🚨 Final Week — Exam Mode',
      items: [
        'Practise 1 extended response question under timed conditions',
        'Review command words: Discuss vs Describe vs Explain vs Evaluate',
        'Check all mark scheme patterns: 2-mark recall, 4-mark explain (ID + expand), 6-8 mark levels',
        'Flashcard rapid fire: all sections'
      ]
    });
  }

  blocks.push({
    id: 'practice',
    title: '✍️ Practice Questions',
    items: [
      'Answer 2–3 practice questions on your weakest topic',
      'Self-mark using the model answers',
      days <= 14 ? 'Try at least 1 extended response (9–12 marks) per session' : 'Attempt a 4-mark "explain" question for any red-coded topic'
    ]
  });

  if (days <= 7) {
    blocks.push({
      id: 'technique',
      title: '🎯 Exam Technique',
      items: [
        'Read every question twice before writing',
        'For "discuss" questions: always give both benefits AND drawbacks',
        'Use the scenario — always link your answer back to the business/organisation in the question',
        'Leave 10 minutes at the end to check Q4 extended responses'
      ]
    });
  }

  return blocks;
}

function getMotivation() {
  const days = daysUntilExam();
  if (days > 30) return 'Keep building your knowledge — consistency now makes the difference.';
  if (days > 14) return 'Final stretch! Focus on your weak areas and practise past paper questions.';
  if (days > 7) return 'One week to go — prioritise Tier 1 topics and exam technique.';
  if (days > 1) return '🚨 Exam is almost here! Flashcards, key facts, extended response practice.';
  return '📅 Exam is tomorrow! Rest, eat well, and trust your preparation.';
}

function renderRAGSummary() {
  const sections = ['A', 'B', 'C', 'D', 'E', 'F'];
  return `<div class="stats-row" style="flex-wrap:wrap">
    ${sections.map(l => {
      const codes = getSectionCodes(l);
      const g = codes.filter(c => state.rag[c] === 'green').length;
      const a = codes.filter(c => state.rag[c] === 'amber').length;
      const r = codes.filter(c => state.rag[c] === 'red').length;
      const pct = codes.length ? Math.round((g / codes.length) * 100) : 0;
      return `<div class="stat-box" style="min-width:100px">
        <div class="num" style="color:${sectionColour(l)}">${l}</div>
        <div style="font-size:12px;margin:4px 0"><span style="color:var(--green)">✓${g}</span> <span style="color:var(--amber)">~${a}</span> <span style="color:var(--red)">✗${r}</span></div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:${pct}%;background:${sectionColour(l)}"></div></div>
        <div class="lbl">${pct}%</div>
      </div>`;
    }).join('')}
  </div>`;
}

const planChecks = JSON.parse(localStorage.getItem('u1_plan_checks') || '{}');

function getPlanCheck(key) {
  const todayStr = today();
  return planChecks[todayStr] && planChecks[todayStr][key];
}

function savePlanCheck(key, val) {
  const todayStr = today();
  if (!planChecks[todayStr]) planChecks[todayStr] = {};
  planChecks[todayStr][key] = val;
  localStorage.setItem('u1_plan_checks', JSON.stringify(planChecks));
}

/* ---- STREAK ---- */
function updateStreak() {
  const todayStr = today();
  const last = state.streak.last;
  if (last === todayStr) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  if (last === yStr) {
    state.streak.count++;
  } else if (last !== todayStr) {
    state.streak.count = 1;
  }
  state.streak.last = todayStr;
  saveState();
}

/* ---- EXPORT/IMPORT/RESET ---- */
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `unit1-revision-${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Progress exported!');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        state = deepMerge(defaultState(), imported);
        saveState();
        toast('Progress imported!');
        navigate('home');
      } catch { toast('Invalid file — import failed'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

function confirmReset() {
  if (confirm('Reset ALL progress? This cannot be undone.')) {
    state = defaultState();
    saveState();
    toast('Progress reset.');
    navigate('home');
  }
}

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });
  loadData(['c', 'd', 'b', 'e', 'a', 'f']);
  navigate('home');
});

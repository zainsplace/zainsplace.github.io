/* ===== UNIT 2 REVISION APP ===== */

/* ---- STATE ---- */
const STATE_KEY = 'u2rev_state';
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
    xp: 0,
    activity: {},     // 'YYYY-MM-DD' -> action count (feeds the heatmap)
    battles: { played: 0, won: 0 },
    profile: { emoji: '⭐', col: '#A8326E' },
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
const PAGES = ['home', 'sections', 'flashcards', 'questions', 'games', 'leaderboard', 'extended', 'examkit', 'search', 'plan', 'profile'];
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
    case 'games': renderGames(); break;
    case 'leaderboard': renderLeaderboardPage(); break;
    case 'extended': renderExtended(); break;
    case 'examkit': renderExamKit(); break;
    case 'search': renderSearch(); break;
    case 'plan': renderPlan(); break;
    case 'profile': renderProfile(); break;
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

/* ---- EXAM DATE (editable — click the countdown box to change) ---- */
const DEFAULT_EXAM_DATE = '2026-05-15';

function getExamDate() {
  return state.examDate || DEFAULT_EXAM_DATE;
}

function daysUntilExam() {
  const exam = new Date(getExamDate());
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((exam - now) / 86400000));
}

function setExamDate() {
  const current = getExamDate();
  const input = prompt('Enter your exam date (YYYY-MM-DD):', current);
  if (!input) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.trim()) || isNaN(new Date(input.trim()).getTime())) {
    toast('Invalid date — use YYYY-MM-DD format');
    return;
  }
  state.examDate = input.trim();
  saveState();
  toast('Exam date updated!');
  renderHome();
}

function ragClass(code) {
  const r = state.rag[code];
  if (r === 'green') return 'active-green';
  if (r === 'amber') return 'active-amber';
  if (r === 'red') return 'active-red';
  return '';
}

function sectionTierClass(letter) {
  const t1 = ['A', 'B', 'D'];
  const t2 = ['C'];
  if (t1.includes(letter)) return 'tier1';
  if (t2.includes(letter)) return 'tier2';
  return 'tier3';
}

function sectionColour(letter) {
  const map = { A: '#4338CA', B: '#A8326E', C: '#0E9F6E', D: '#6D5BD6' };
  return map[letter] || '#4338CA';
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
    if (obj.code && /^[A-D][0-9]+\.[0-9]+/.test(obj.code)) codes.push(obj.code);
    Object.values(obj).forEach(v => { if (typeof v === 'object') walk(v); });
  }
  walk(d);
  return [...new Set(codes)];
}

function overallProgress() {
  const letters = ['A', 'B', 'C', 'D'];
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

function pAv() { return (state.profile && state.profile.emoji) || '⭐'; }
function pCol() { return (state.profile && state.profile.col) || '#A8326E'; }
function pImg() { return (state.profile && state.profile.img) || null; }

/* inner content for any "me" avatar: photo if set, else emoji */
function meAvInner() {
  return pImg() ? `<img src="${pImg()}" class="av-img" alt="">` : pAv();
}

function updateNavAvatar() {
  const btn = el('nav-avatar');
  if (btn) { btn.innerHTML = meAvInner(); btn.style.background = pCol(); }
}

function uploadAvatar() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        // centre-crop to a square and downscale so it fits comfortably in localStorage
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        state.profile.img = canvas.toDataURL('image/jpeg', 0.85);
        saveState();
        updateNavAvatar();
        renderProfile();
        toast('Profile picture updated!');
      };
      img.onerror = () => toast('Couldn\'t read that image');
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function removeAvatarImg() {
  if (state.profile) delete state.profile.img;
  saveState();
  updateNavAvatar();
  renderProfile();
}

function bumpActivity(n = 1) {
  if (!state.activity) state.activity = {};
  const d = today();
  state.activity[d] = (state.activity[d] || 0) + n;
  saveState();
}

/* ---- HOME ---- */
function renderHome() {
  loadData(['a', 'b', 'd', 'c']);
  updateStreak();

  const days = daysUntilExam();
  const prog = overallProgress();
  const rc = ragCounts();
  const flashDue = getFlashcardsDueCount();

  el('home-countdown-days').textContent = days;
  const examPassed = new Date(getExamDate()) < new Date(new Date().toDateString());
  el('home-countdown-label').textContent = examPassed ? 'exam date has passed — click to set a new one' : 'days remaining';
  el('home-countdown-date').textContent = `Exam: ${getExamDate()} • Unit 2: Cyber Security & Incident Management`;
  el('home-overall-progress').style.width = prog + '%';
  el('home-overall-pct').textContent = prog + '%';
  el('home-stat-green').textContent = rc.green;
  el('home-stat-amber').textContent = rc.amber;
  el('home-stat-red').textContent = rc.red;
  el('home-stat-streak').textContent = state.streak.count;
  el('home-flash-due').textContent = flashDue;
  const myRank = rankFor(state.xp || 0);
  el('home-stat-level').textContent = myRank.icon;
  el('home-stat-level').style.color = myRank.col;
  el('home-stat-xp').textContent = `${myRank.name} · ${state.xp || 0} XP`;

  renderSectionTiles();
  renderPriorityTopics();
}

/* ---- PRIORITY TOPICS (weakest first: red, then amber) ---- */
function findItemByCode(code) {
  for (const key of ['a', 'b', 'c', 'd']) {
    const d = DATA[key];
    if (!d) continue;
    let found = null;
    (function walk(obj) {
      if (found || !obj || typeof obj !== 'object') return;
      if (obj.code === code && obj.term) { found = { term: obj.term, section: d.section }; return; }
      Object.values(obj).forEach(v => { if (typeof v === 'object') walk(v); });
    })(d);
    if (found) return found;
  }
  return null;
}

function renderPriorityTopics() {
  const container = el('priority-topics');
  if (!container) return;
  const reds = Object.entries(state.rag).filter(([, v]) => v === 'red').map(([k]) => k);
  const ambers = Object.entries(state.rag).filter(([, v]) => v === 'amber').map(([k]) => k);
  const picks = [...reds, ...ambers].slice(0, 6);

  if (!picks.length) {
    container.innerHTML = '';
    return;
  }

  const rows = picks.map(code => {
    const item = findItemByCode(code);
    if (!item) return '';
    const isRed = state.rag[code] === 'red';
    return `
      <div class="search-result" onclick="goToResult('${item.section}', '${code}')">
        <div style="display:flex;align-items:center;gap:8px">
          <span class="badge" style="${isRed ? 'background:#FDECEC;color:#C53030;border-color:#F7C5C5' : 'background:#FEF4E0;color:#B7791F;border-color:#F8D5B3'}">${isRed ? '🔴' : '🟡'} ${code}</span>
          <h4 style="flex:1">${item.term}</h4>
          <span class="chevron">→</span>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <h3 style="margin-bottom:12px;font-size:14px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px">🎯 Priority topics — revise these first</h3>
    <div class="search-results" style="margin-bottom:20px">${rows}</div>`;
}

function renderSectionTiles() {
  const container = el('section-tiles');
  const sections = [
    { letter: 'A', name: 'Cyber Security Threats & Protection', topics: 'Threats, Vulnerabilities, Encryption, GDPR' },
    { letter: 'B', name: 'Networking Architectures & Security', topics: 'Networks, VPN, DHCP, Firewalls' },
    { letter: 'D', name: 'Forensic Procedures', topics: 'Evidence, Imaging, Chain of Custody' },
    { letter: 'C', name: 'Cyber Security Documentation', topics: 'Policies, Audits, Incident Response' }
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
    { letter: 'A', name: 'Cyber Security Threats & Protection', tier: 'tier1', col: '#4338CA' },
    { letter: 'B', name: 'Networking Architectures & Security', tier: 'tier1', col: '#A8326E' },
    { letter: 'D', name: 'Forensic Procedures', tier: 'tier1', col: '#6D5BD6' },
    { letter: 'C', name: 'Cyber Security Documentation', tier: 'tier2', col: '#0E9F6E' }
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
  bumpActivity();
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
  const boxColors    = ['#C81E1E', '#A8326E', '#D97706', '#0E9F6E', '#4338CA'];

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
      <select id="flash-filter" onchange="setFlashFilter(this.value)" style="background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:9px 12px;border-radius:var(--radius-sm);font-size:14px;font-family:'Inter',sans-serif;font-weight:600;box-shadow:var(--shadow-sm);cursor:pointer">
        <option value="all" ${flashFilter === 'all' ? 'selected' : ''}>All sections</option>
        ${['A','B','C','D'].map(l => `<option value="${l}" ${flashFilter === l ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      <span style="font-size:14px;color:var(--text2)">${due} due today / ${total} total</span>
      <button class="btn btn-secondary btn-sm" onclick="flashPracticeMode=false;buildFlashQueue();renderFlashUI()">Refresh queue</button>
    </div>
    ${flashPracticeMode ? `<div style="background:rgba(67,56,202,0.08);border:2px solid rgba(67,56,202,0.25);border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:12px;font-size:13px;color:var(--accent2)"><strong>Practice mode</strong> — reviewing all ${flashQueue.length} cards. Leitner progress is not being saved. <button class="btn btn-secondary btn-sm" style="margin-left:8px" onclick="flashPracticeMode=false;buildFlashQueue();renderFlashUI()">Exit practice mode</button></div>` : ''}
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
    state.xp = (state.xp || 0) + (correct ? 5 : 2);
    bumpActivity();
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
  const sections = ['all', 'A', 'B', 'C', 'D'];
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
  bumpActivity();
  saveState();
  toast(`Recorded: ${score}/${maxMarks} (${pct}%)`);
  const sm = el('selfmark-' + qId);
  if (sm) sm.style.display = 'none';
}

function setQFilter(f) {
  qFilter = f;
  renderQuestions();
}

let quizScore = 0, quizMax = 0;

function startQuiz() {
  qMode = 'quiz';
  quizQueue = [...(qData ? qData.questions : [])].sort(() => Math.random() - 0.5).slice(0, 10);
  quizIdx = 0;
  quizScore = 0;
  quizMax = 0;
  renderQuestions();
}

function renderQuizMode(container) {
  if (quizIdx >= quizQueue.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🏆</div>
        <h2 style="margin-bottom:8px">Quiz Complete — ${quizScore}/${quizMax} marks${quizMax ? ` (${Math.round((quizScore / quizMax) * 100)}%)` : ''}</h2>
        <p>${quizQueue.length} questions answered · +${quizScore * 2} XP earned.</p>
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
  quizScore += score;
  quizMax += maxMarks;
  state.xp = (state.xp || 0) + score * 2;
  bumpActivity();
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

/* ---- XP & LEVELS ---- */
const XP_PER_LEVEL = 250;

function awardXP(n, quiet) {
  state.xp = (state.xp || 0) + n;
  bumpActivity();
  saveState();
  if (!quiet) toast(`+${n} XP`);
}

function xpLevel() { return Math.floor((state.xp || 0) / XP_PER_LEVEL) + 1; }
function xpIntoLevel() { return (state.xp || 0) % XP_PER_LEVEL; }

/* ---- RANKS ---- */
const RANKS = [
  { name: 'Bronze',       icon: '🥉', col: '#B45309', min: 0 },
  { name: 'Silver',       icon: '🥈', col: '#64748B', min: 300 },
  { name: 'Gold',         icon: '🥇', col: '#D97706', min: 750 },
  { name: 'Platinum',     icon: '💠', col: '#0E7490', min: 1500 },
  { name: 'Diamond',      icon: '💎', col: '#4338CA', min: 2500 },
  { name: 'Master',       icon: '🔮', col: '#A8326E', min: 4000 },
  { name: 'Cyber Legend', icon: '👑', col: '#44403C', min: 6000 }
];

function rankFor(xp) {
  let r = RANKS[0];
  for (const t of RANKS) { if (xp >= t.min) r = t; else break; }
  const idx = RANKS.indexOf(r);
  const next = RANKS[idx + 1] || null;
  return { ...r, idx, next };
}

function rankChip(xp) {
  const r = rankFor(xp);
  return `<span class="rank-chip" style="color:${r.col};border-color:${r.col}40;background:${r.col}14">${r.icon} ${r.name}</span>`;
}

/* ---- GAMES (MCQ quick-fire + match) ---- */
let gamesMode = 'menu';
let mcq = null;
let matchGame = null;
let matchInterval = null;

function renderGames() {
  const container = el('games-content');
  if (gamesMode === 'mcq') { renderMCQ(container); return; }
  if (gamesMode === 'match') { renderMatch(container); return; }
  if (gamesMode === 'battle' && battle) { renderBattleUI(container); return; }

  const best = localStorage.getItem('u2_match_best');
  container.innerHTML = `
    <h2 style="margin-bottom:6px">Games</h2>
    <p style="color:var(--text2);font-size:14px;margin-bottom:18px">Active recall, but fun. Earn XP for every game — you're Level ${xpLevel()} with ${state.xp || 0} XP.</p>
    <div class="grid2">
      <div class="section-tile" onclick="startMCQ()">
        <div class="tile-accent" style="background:var(--accent)"></div>
        <div class="tile-code">⚡</div>
        <h3>Quick-fire MCQ</h3>
        <p>10 multiple-choice questions generated from your flashcards. +10 XP per correct answer.</p>
      </div>
      <div class="section-tile" onclick="startMatch()">
        <div class="tile-accent" style="background:var(--pink)"></div>
        <div class="tile-code">🧩</div>
        <h3>Match</h3>
        <p>Pair terms with definitions against the clock. +30 XP per clear.${best ? ` Best time: <strong>${best}s</strong>` : ''}</p>
      </div>
    </div>
    <h3 style="margin:24px 0 12px;font-size:14px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px">⚔️ Battle arena — vs the leaderboard</h3>
    <div class="grid2">
      ${Object.entries(BATTLE_MODES).map(([key, m]) => `
        <div class="section-tile" onclick="startBattle('${key}')">
          <div class="tile-accent" style="background:${key === 'duel' ? 'var(--pink)' : 'var(--accent)'}"></div>
          <div class="tile-code">${m.icon}</div>
          <h3>${m.name}</h3>
          <p>${m.desc}</p>
        </div>`).join('')}
    </div>
    ${renderLeaderboardHTML()}`;
}

/* -- Leaderboard (fake rivals — their XP grows daily so the race feels live) -- */
const LB_EPOCH = new Date('2026-06-01').getTime();

const LB_BOTS = [
  /* — your bracket (Bronze/Silver) — */
  { name: 'itzKayden08',        tag: 'Revision machine',  base: 120, rate: 38, col: '#4338CA' },
  { name: 'maddie.exe',         tag: 'Forensics nerd',    base: 90,  rate: 31, col: '#A8326E' },
  { name: 'TTV_R3eceplays',     tag: 'Flashcard grinder (live)', base: 60, rate: 26, col: '#0E9F6E' },
  { name: 'xX_Sn1per_Lukas_Xx', tag: 'Revises at 11pm the night before', base: 10, rate: 9, col: '#D97706' },
  { name: 'notlivvy',           tag: '9-mark specialist', base: 80,  rate: 22, col: '#6D5BD6' },
  { name: 'ZayanFN_09',         tag: 'Match game demon',  base: 40,  rate: 17, col: '#C81E1E' },
  { name: 'sleepyell1e',        tag: 'Quietly cooking',   base: 30,  rate: 13, col: '#0E7490' },
  /* — Silver/Gold — */
  { name: 'big_curtis_W',       tag: 'Streak protector',  base: 320, rate: 12, col: '#64748B' },
  { name: 'aliyah.studies',     tag: 'Notion aesthetic queen', base: 380, rate: 15, col: '#A8326E' },
  { name: 'lowkeyjordan',       tag: 'Says he doesn\'t revise. Lies.', base: 700, rate: 14, col: '#0E9F6E' },
  { name: 'p1xelpatel',         tag: 'MCQ speedrunner',   base: 820, rate: 16, col: '#4338CA' },
  { name: 'erinhasnoexams',     tag: 'Ironic username',   base: 900, rate: 11, col: '#D97706' },
  /* — Silver/Gold (more) — */
  { name: 'jxck_billings',      tag: 'Group chat admin',  base: 420, rate: 14, col: '#0E9F6E' },
  { name: 'freyah2009',         tag: 'Colour-coded notes', base: 540, rate: 13, col: '#6D5BD6' },
  { name: 'OllieW_main',        tag: '"It\'s my second account"', base: 610, rate: 12, col: '#0E7490' },
  { name: 'ria.revises',        tag: 'Username says it all', base: 1050, rate: 14, col: '#A8326E' },
  { name: 'capybara_ben',       tag: 'Here for the games', base: 1150, rate: 10, col: '#D97706' },
  { name: 'WhoIsTyler_',        tag: 'Mysterious grinder', base: 1300, rate: 13, col: '#44403C' },
  /* — Platinum — */
  { name: 'DefNotArchie',       tag: 'Plat and proud',    base: 1550, rate: 13, col: '#0E7490' },
  { name: 'emsy_x',             tag: 'Past paper warlord', base: 1700, rate: 15, col: '#6D5BD6' },
  { name: 'voidwxlker',         tag: 'Revises in dark mode only', base: 1950, rate: 12, col: '#44403C' },
  { name: 'sadiq.studies',      tag: 'Library resident',  base: 1820, rate: 14, col: '#0E9F6E' },
  { name: 'gracie_mxy',         tag: 'Flashcards at the bus stop', base: 2100, rate: 11, col: '#A8326E' },
  { name: 'L0gan_idk',          tag: 'Accidentally good at this', base: 2250, rate: 12, col: '#D97706' },
  /* — Diamond — */
  { name: 'hazza.dnf',          tag: 'Diamond gatekeeper', base: 2600, rate: 11, col: '#4338CA' },
  { name: 'k1ngmarcus',         tag: 'Self-proclaimed GOAT', base: 3100, rate: 13, col: '#C81E1E' },
  { name: 'evieplays_x',        tag: 'Duels anyone who asks', base: 2800, rate: 12, col: '#A8326E' },
  { name: 'thearchitect_jay',   tag: 'Mind palace user (allegedly)', base: 3300, rate: 11, col: '#0E7490' },
  { name: 'n0tmichelle',        tag: 'Diamond and climbing', base: 3600, rate: 13, col: '#6D5BD6' },
  /* — Master — */
  { name: 'taraxo_07',          tag: 'Carried the group project', base: 4200, rate: 10, col: '#A8326E' },
  { name: 'GlazedDonut_Finn',   tag: 'Nobody knows his real name', base: 4800, rate: 12, col: '#D97706' },
  { name: 'silentcarter_',      tag: 'Never speaks. Always wins.', base: 4500, rate: 11, col: '#44403C' },
  { name: 'amara.aces',         tag: 'Mock exam merchant', base: 5200, rate: 10, col: '#4338CA' },
  /* — Cyber Legend — */
  { name: 'cleanest_ahmxd',     tag: 'Finished the spec in March', base: 6300, rate: 8, col: '#44403C' },
  { name: 'prodigy_wren',       tag: 'Teachers ask HER for help', base: 6800, rate: 9, col: '#A8326E' },
  { name: 'xue_2008',           tag: 'The final boss',    base: 7400, rate: 7, col: '#4338CA' }
];

function botXP(bot) {
  const days = Math.max(0, Math.floor((Date.now() - LB_EPOCH) / 86400000));
  // deterministic daily jitter so bots don't grow in a perfectly straight line
  let h = 0;
  for (const ch of bot.name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const jitter = ((days * h) % 17) - 8;
  return Math.max(0, bot.base + bot.rate * days + jitter);
}

function getLBRows() {
  const rows = LB_BOTS.map(b => ({ name: b.name, tag: b.tag, col: b.col, xp: botXP(b), me: false }));
  rows.push({ name: 'You', tag: `Level ${xpLevel()}`, col: pCol(), xp: state.xp || 0, me: true });
  rows.sort((a, b) => b.xp - a.xp);
  rows.forEach((r, i) => { r.pos = i + 1; });
  return rows;
}

const LB_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

function lbRowHTML(r) {
  return `
    <div class="lb-row${r.me ? ' me' : ''}">
      <span class="lb-rank">${LB_MEDALS[r.pos] || '#' + r.pos}</span>
      <span class="lb-av" style="background:${r.col}">${r.me ? meAvInner() : r.name.charAt(0)}</span>
      <span class="lb-name">${r.name}${r.me ? ' <span class="lb-you">(you)</span>' : ''}<span class="lb-tag">${r.tag}</span></span>
      ${rankChip(r.xp)}
      <span class="lb-xp">${r.xp.toLocaleString()} XP</span>
    </div>`;
}

function lbMotivator(rows) {
  const me = rows.find(r => r.me);
  const ahead = me.pos > 1 ? rows[me.pos - 2] : null;
  const gap = ahead ? ahead.xp - me.xp : 0;
  return me.pos === 1
    ? 'You\'re top of the table — defend it! 👑'
    : `You're <strong>#${me.pos} of ${rows.length}</strong>. ${ahead.name} is ${gap.toLocaleString()} XP ahead — about ${Math.max(1, Math.ceil(gap / 10))} correct MCQs to catch them.`;
}

/* compact view: the 7 players around you (used on the Games page) */
function renderLeaderboardHTML() {
  const rows = getLBRows();
  const i = rows.findIndex(r => r.me);
  const start = Math.max(0, Math.min(i - 3, rows.length - 7));
  const view = rows.slice(start, start + 7);

  return `
    <h3 style="margin:24px 0 4px;font-size:14px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px">🏁 Players near you</h3>
    <p style="color:var(--text2);font-size:13px;margin-bottom:12px">${lbMotivator(rows)}</p>
    <div class="lb-board">${view.map(lbRowHTML).join('')}</div>
    <button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="navigate('leaderboard')">View full leaderboard →</button>`;
}

/* full view: every player, grouped by rank tier (used on the Leaderboard page) */
function renderLeaderboardByTier() {
  const rows = getLBRows();
  const tiers = [...RANKS].reverse();

  return `
    <p style="color:var(--text2);font-size:13px;margin-bottom:12px">${lbMotivator(rows)}</p>
    ${tiers.map(t => {
      const members = rows.filter(r => rankFor(r.xp).name === t.name);
      if (!members.length) return '';
      const mine = members.some(r => r.me);
      return `
        <div class="lb-tier${mine ? ' mine' : ''}">
          <div class="lb-tier-head" style="color:${t.col}">
            <span>${t.icon} ${t.name}</span>
            <span class="lb-tier-count">${t.min.toLocaleString()}+ XP · ${members.length} player${members.length !== 1 ? 's' : ''}${mine ? ' · your division' : ''}</span>
          </div>
          <div class="lb-board">${members.map(lbRowHTML).join('')}</div>
        </div>`;
    }).join('')}`;
}

function renderRankLadder() {
  const xp = state.xp || 0;
  const me = rankFor(xp);
  const toNext = me.next ? me.next.min - xp : 0;
  const span = me.next ? me.next.min - me.min : 1;
  const pct = me.next ? Math.min(100, Math.round(((xp - me.min) / span) * 100)) : 100;

  return `
    <div class="card" style="margin-bottom:18px">
      <h3 style="margin-bottom:4px">${me.icon} Your rank: <span style="color:${me.col}">${me.name}</span></h3>
      <p style="font-size:13px;color:var(--text2);margin-bottom:10px">${
        me.next
          ? `${toNext.toLocaleString()} XP to ${me.next.icon} ${me.next.name} — roughly ${Math.max(1, Math.ceil(toNext / 10))} correct MCQs or ${Math.max(1, Math.ceil(toNext / 30))} match clears.`
          : 'Maximum rank achieved. You ARE the syllabus. 👑'
      }</p>
      <div class="progress-bar-wrap"><div class="progress-bar" style="width:${pct}%"></div></div>
      <div class="rank-ladder">
        ${RANKS.map(r => `
          <div class="rank-step${r.name === me.name ? ' current' : ''}${xp >= r.min ? ' unlocked' : ''}">
            <span class="rank-step-icon">${r.icon}</span>
            <span class="rank-step-name">${r.name}</span>
            <span class="rank-step-xp">${r.min.toLocaleString()}+</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderLeaderboardPage() {
  el('leaderboard-content').innerHTML = `
    <h2 style="margin-bottom:6px">Leaderboard</h2>
    <p style="color:var(--text2);font-size:14px;margin-bottom:14px">Earn XP from flashcards, games and quizzes to climb the table. Rivals revise daily — fall behind and they'll pass you.</p>
    ${renderRankLadder()}
    ${renderLeaderboardByTier()}
    <div style="margin-top:18px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="navigate('games')">⚡ Earn XP in Games</button>
      <button class="btn btn-secondary" onclick="navigate('flashcards')">📚 Review flashcards</button>
    </div>`;
}

/* -- Quick-fire MCQ -- */
function startMCQ() {
  const cards = INLINE_FLASHCARDS.cards;
  const qs = [...cards].sort(() => Math.random() - 0.5).slice(0, 10).map(c => {
    let pool = cards.filter(x => x.id !== c.id && x.section === c.section);
    if (pool.length < 3) pool = cards.filter(x => x.id !== c.id);
    const opts = [...pool].sort(() => Math.random() - 0.5).slice(0, 3).map(d => ({ text: d.back, correct: false }));
    opts.push({ text: c.back, correct: true });
    opts.sort(() => Math.random() - 0.5);
    return { front: c.front, code: c.code, opts };
  });
  mcq = { qs, idx: 0, score: 0, answered: false };
  gamesMode = 'mcq';
  renderGames();
}

function renderMCQ(container) {
  if (mcq.idx >= mcq.qs.length) {
    const pct = Math.round((mcq.score / mcq.qs.length) * 100);
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">${pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'}</div>
        <h2 style="margin-bottom:8px">${mcq.score}/${mcq.qs.length} correct (${pct}%)</h2>
        <p>${pct >= 80 ? 'Outstanding — that knowledge is locked in.' : pct >= 50 ? 'Solid — review the ones you missed and go again.' : 'Good effort — hit the flashcards on these topics and retry.'}</p>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="startMCQ()">Play again</button>
          <button class="btn btn-secondary" onclick="gamesMode='menu';renderGames()">Back to games</button>
        </div>
      </div>`;
    return;
  }
  const q = mcq.qs[mcq.idx];
  container.innerHTML = `
    <div class="quiz-wrap">
      <div class="quiz-progress">
        <span>${mcq.idx + 1}/${mcq.qs.length} · Score ${mcq.score}</span>
        <div class="bar"><div class="bar-fill" style="width:${Math.round((mcq.idx / mcq.qs.length) * 100)}%"></div></div>
        <button class="btn btn-secondary btn-sm" onclick="gamesMode='menu';renderGames()">Exit</button>
      </div>
      <div class="card">
        <span class="badge" style="margin-bottom:10px;display:inline-block">${q.code}</span>
        <p class="quiz-q">${q.front}</p>
        <div class="mcq-opts">
          ${q.opts.map((o, i) => `<button class="mcq-opt" id="mcq-opt-${i}" onclick="answerMCQ(${i})">${o.text}</button>`).join('')}
        </div>
        <button class="btn btn-primary btn-full hidden" id="mcq-next" onclick="mcq.idx++;mcq.answered=false;renderGames()">Next →</button>
      </div>
    </div>`;
}

function answerMCQ(i) {
  if (mcq.answered) return;
  mcq.answered = true;
  const q = mcq.qs[mcq.idx];
  q.opts.forEach((o, j) => {
    const btn = el('mcq-opt-' + j);
    if (o.correct) btn.classList.add('right');
    else if (j === i) btn.classList.add('wrong');
    btn.disabled = true;
  });
  if (q.opts[i].correct) {
    mcq.score++;
    awardXP(10, true);
  }
  el('mcq-next').classList.remove('hidden');
}

/* -- Match game -- */
function startMatch() {
  if (!searchBuilt) { loadData(['a', 'b', 'c', 'd']); buildSearchIndex(); }
  const pool = allSearchContent.filter(x => x.definition && x.definition.length > 20);
  const pairs = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
  const tiles = [];
  pairs.forEach((p, i) => {
    tiles.push({ pair: i, kind: 'term', text: p.term });
    tiles.push({ pair: i, kind: 'def', text: p.definition.length > 90 ? p.definition.substring(0, 90) + '…' : p.definition });
  });
  tiles.sort(() => Math.random() - 0.5);
  matchGame = { tiles, sel: null, done: new Set(), start: Date.now() };
  gamesMode = 'match';
  renderGames();
  if (matchInterval) clearInterval(matchInterval);
  matchInterval = setInterval(() => {
    const t = el('match-clock');
    if (t && matchGame) t.textContent = Math.floor((Date.now() - matchGame.start) / 1000) + 's';
  }, 500);
}

function renderMatch(container) {
  container.innerHTML = `
    <div class="quiz-wrap" style="max-width:760px">
      <div class="quiz-progress">
        <span>🧩 Match — <span id="match-clock">0s</span></span>
        <div class="bar"><div class="bar-fill" style="width:${Math.round((matchGame.done.size / 6) * 100)}%"></div></div>
        <button class="btn btn-secondary btn-sm" onclick="clearInterval(matchInterval);gamesMode='menu';renderGames()">Exit</button>
      </div>
      <div class="match-grid">
        ${matchGame.tiles.map((t, i) => `
          <button class="match-tile ${t.kind} ${matchGame.done.has(t.pair) ? 'matched' : ''}" id="mt-${i}" onclick="pickTile(${i})">${t.text}</button>`).join('')}
      </div>
    </div>`;
}

function pickTile(i) {
  const t = matchGame.tiles[i];
  if (matchGame.done.has(t.pair)) return;
  const btn = el('mt-' + i);

  if (matchGame.sel === null) {
    matchGame.sel = i;
    btn.classList.add('sel');
    return;
  }
  if (matchGame.sel === i) {
    btn.classList.remove('sel');
    matchGame.sel = null;
    return;
  }

  const prev = matchGame.tiles[matchGame.sel];
  const prevBtn = el('mt-' + matchGame.sel);

  if (prev.pair === t.pair && prev.kind !== t.kind) {
    matchGame.done.add(t.pair);
    btn.classList.add('matched');
    prevBtn.classList.remove('sel');
    prevBtn.classList.add('matched');
    matchGame.sel = null;
    if (matchGame.done.size === 6) finishMatch();
  } else {
    btn.classList.add('wrong');
    prevBtn.classList.add('wrong');
    const a = i, b = matchGame.sel;
    matchGame.sel = null;
    setTimeout(() => {
      const ba = el('mt-' + a), bb = el('mt-' + b);
      if (ba) ba.classList.remove('wrong');
      if (bb) { bb.classList.remove('wrong'); bb.classList.remove('sel'); }
    }, 450);
  }
}

function finishMatch() {
  clearInterval(matchInterval);
  const secs = Math.floor((Date.now() - matchGame.start) / 1000);
  const best = parseInt(localStorage.getItem('u2_match_best') || '0', 10);
  const isBest = !best || secs < best;
  if (isBest) localStorage.setItem('u2_match_best', String(secs));
  awardXP(30, true);
  setTimeout(() => {
    el('games-content').innerHTML = `
      <div class="empty-state">
        <div class="icon">${isBest ? '🥇' : '🎉'}</div>
        <h2 style="margin-bottom:8px">Cleared in ${secs}s${isBest ? ' — new best time!' : ''}</h2>
        <p>+30 XP earned. ${best && !isBest ? `Your best is ${best}s — can you beat it?` : ''}</p>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="startMatch()">Play again</button>
          <button class="btn btn-secondary" onclick="gamesMode='menu';renderGames()">Back to games</button>
        </div>
      </div>`;
  }, 500);
}

/* -- QUIZ BATTLE — live competition vs leaderboard rivals -- */
let battle = null;
let battleTick = null;
const BATTLE_Q_SECS = 12;

const BATTLE_MODES = {
  elim:  { name: 'Elimination', icon: '💀', desc: '8 players. Answer wrong — or be the slowest correct — and you\'re out. Last one standing wins.' },
  race:  { name: 'Race to 10',  icon: '🏁', desc: 'You vs 3 rivals. First to 10 correct answers takes it. Pure consistency.' },
  duel:  { name: 'Duel',        icon: '🤺', desc: 'Best-of-7 vs the rival directly above you on the leaderboard. Faster correct answer wins the point.' },
  blitz: { name: 'Blitz 60',    icon: '⚡', desc: '60 seconds, unlimited questions. Outscore your rivals before the clock dies.' }
};

function battleQuestionPool(n) {
  if (!searchBuilt) { loadData(['a', 'b', 'c', 'd']); buildSearchIndex(); }
  const pool = allSearchContent.filter(x => x.definition && x.definition.length > 20);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, n).map(p => {
    const wrong = pool.filter(x => x.term !== p.term).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.term);
    const opts = [...wrong, p.term].sort(() => Math.random() - 0.5);
    return { prompt: p.definition.length > 130 ? p.definition.substring(0, 130) + '…' : p.definition, answer: p.term, opts, code: p.code };
  });
}

function pickOpponents(k, directlyAbove) {
  const rows = getLBRows();
  const me = rows.find(r => r.me);
  const others = rows.filter(r => !r.me);
  others.forEach(o => { o.skill = 1 - (o.pos - 1) / rows.length; });
  if (directlyAbove) {
    const above = others.filter(o => o.xp >= me.xp).sort((a, b) => a.xp - b.xp);
    return [above[0] || others.sort((a, b) => b.xp - a.xp)[0]];
  }
  return others.sort((a, b) => Math.abs(a.xp - me.xp) - Math.abs(b.xp - me.xp)).slice(0, k);
}

function botAnswer(skill) {
  return {
    ok: Math.random() < 0.48 + 0.42 * skill,
    time: +(1.4 + (1 - skill) * 5 + Math.random() * 2.8).toFixed(1)
  };
}

function stopBattleTick() { if (battleTick) { clearInterval(battleTick); battleTick = null; } }

function startBattle(mode) {
  stopBattleTick();
  const oppCount = mode === 'elim' ? 7 : mode === 'duel' ? 1 : 3;
  const opps = pickOpponents(oppCount, mode === 'duel');
  battle = {
    mode,
    idx: 0,
    over: false,
    answered: false,
    qs: battleQuestionPool(mode === 'blitz' ? 40 : 30),
    players: [
      { name: 'You', col: pCol(), me: true, alive: true, score: 0, totalTime: 0, out: 0 },
      ...opps.map(o => ({ name: o.name, col: o.col, me: false, skill: o.skill, alive: true, score: 0, totalTime: 0, out: 0 }))
    ],
    log: [],
    blitzEnd: 0
  };
  if (mode === 'blitz') {
    battle.blitzEnd = Date.now() + 60000;
    battle.players.forEach(p => {
      if (!p.me) p.blitzFinal = Math.max(2, Math.round(6 + p.skill * 14 + (Math.random() * 6 - 3)));
    });
    battleTick = setInterval(() => {
      if (currentPage !== 'games' || !battle || battle.mode !== 'blitz') { stopBattleTick(); return; }
      const left = Math.max(0, battle.blitzEnd - Date.now());
      const elapsed = (60000 - left) / 60000;
      battle.players.forEach(p => { if (!p.me) p.score = Math.min(p.blitzFinal, Math.floor(p.blitzFinal * elapsed)); });
      const bar = el('battle-bar');
      if (bar) bar.style.width = (left / 600) + '%';
      const clock = el('blitz-clock');
      if (clock) clock.textContent = Math.ceil(left / 1000) + 's';
      const strip = el('battle-strip');
      if (strip) strip.innerHTML = battleStripHTML();
      if (left <= 0) { finishBattle(); renderGames(); }
    }, 250);
  }
  gamesMode = 'battle';
  renderGames();
  if (mode !== 'blitz') startBattleQuestion();
}

function startBattleQuestion() {
  battle.answered = false;
  battle.qStart = Date.now();
  stopBattleTick();
  battleTick = setInterval(() => {
    if (currentPage !== 'games' || !battle || battle.answered) { stopBattleTick(); return; }
    const left = Math.max(0, BATTLE_Q_SECS * 1000 - (Date.now() - battle.qStart));
    const bar = el('battle-bar');
    if (bar) bar.style.width = (left / (BATTLE_Q_SECS * 10)) + '%';
    if (left <= 0) answerBattle(-1);
  }, 100);
}

function battleStripHTML() {
  return battle.players.map(p => `
    <span class="battle-chip${p.alive ? '' : ' dead'}${p.me ? ' me' : ''}">
      <span class="lb-av" style="background:${p.col};width:24px;height:24px;font-size:11px">${p.me ? meAvInner() : p.name.charAt(0)}</span>
      ${p.me ? 'You' : p.name}${battle.mode === 'elim' ? (p.alive ? '' : ' 💀') : ` · ${p.score}`}
    </span>`).join('');
}

function renderBattleUI(container) {
  if (battle.over) { renderBattleEnd(container); return; }
  const q = battle.qs[battle.idx];
  if (!q) { finishBattle(); renderBattleEnd(container); return; }
  const target = battle.mode === 'race' ? ' · first to 10' : battle.mode === 'duel' ? ' · first to 4 points' : '';

  container.innerHTML = `
    <div class="quiz-wrap" style="max-width:680px">
      <div class="quiz-progress">
        <span>${BATTLE_MODES[battle.mode].icon} ${BATTLE_MODES[battle.mode].name}${target}${battle.mode === 'blitz' ? ' · <strong id="blitz-clock">60s</strong>' : ''}</span>
        <div class="bar"><div class="bar-fill" id="battle-bar" style="width:100%"></div></div>
        <button class="btn btn-secondary btn-sm" onclick="quitBattle()">Quit</button>
      </div>
      <div class="battle-strip" id="battle-strip">${battleStripHTML()}</div>
      <div class="card">
        <span class="badge" style="margin-bottom:10px;display:inline-block">${q.code}</span>
        <p class="quiz-q" style="font-size:15px">${q.prompt}</p>
        <div class="mcq-opts">
          ${q.opts.map((o, i) => `<button class="mcq-opt" id="bopt-${i}" onclick="answerBattle(${i})">${o}</button>`).join('')}
        </div>
        <div id="battle-result"></div>
      </div>
    </div>`;
}

function quitBattle() {
  stopBattleTick();
  battle = null;
  gamesMode = 'menu';
  renderGames();
}

function answerBattle(i) {
  if (!battle || battle.answered) return;
  battle.answered = true;
  stopBattleTick();
  const q = battle.qs[battle.idx];
  const me = battle.players[0];
  const myTime = i < 0 ? BATTLE_Q_SECS : +(((Date.now() - battle.qStart) / 1000)).toFixed(1);
  const myOk = i >= 0 && q.opts[i] === q.answer;

  q.opts.forEach((o, j) => {
    const btn = el('bopt-' + j);
    if (!btn) return;
    btn.disabled = true;
    if (o === q.answer) btn.classList.add('right');
    else if (j === i) btn.classList.add('wrong');
  });

  if (battle.mode === 'blitz') {
    if (myOk) me.score++;
    setTimeout(() => {
      if (!battle || battle.over) return;
      battle.idx++;
      if (battle.idx >= battle.qs.length) battle.qs.push(...battleQuestionPool(20));
      renderGames();
      battle.answered = false;
      battle.qStart = Date.now();
    }, 400);
    return;
  }

  // simulate this round for every living bot
  const results = battle.players.filter(p => p.alive).map(p => {
    if (p.me) return { p, ok: myOk, time: myTime };
    const a = botAnswer(p.skill);
    return { p, ok: a.ok, time: a.time };
  });
  results.forEach(r => { r.p.totalTime += r.time; if (r.ok) r.p.score++; });

  let note = '';
  if (battle.mode === 'elim') {
    const wrong = results.filter(r => !r.ok);
    if (wrong.length && wrong.length < results.length) {
      wrong.forEach(r => { r.p.alive = false; r.p.out = battle.players.filter(x => x.alive).length + wrong.length; });
      note = `${wrong.map(r => r.p.me ? 'You' : r.p.name).join(', ')} eliminated!`;
    } else if (!wrong.length) {
      const slowest = results.reduce((a, b) => (b.time > a.time ? b : a));
      slowest.p.alive = false;
      slowest.p.out = battle.players.filter(x => x.alive).length + 1;
      note = `Everyone was right — ${slowest.p.me ? 'you were' : slowest.p.name + ' was'} slowest. Eliminated!`;
    } else {
      note = 'Everyone got it wrong — nobody eliminated. 😬';
    }
    const alive = battle.players.filter(p => p.alive);
    if (!me.alive || alive.length <= 1) battle.over = true;
  } else if (battle.mode === 'race') {
    const leaders = battle.players.filter(p => p.score >= 10);
    if (leaders.length) battle.over = true;
  } else if (battle.mode === 'duel') {
    const r0 = results.find(r => r.p.me), r1 = results.find(r => !r.p.me);
    let pointTo = null;
    if (r0.ok && !r1.ok) pointTo = r0.p;
    else if (r1.ok && !r0.ok) pointTo = r1.p;
    else if (r0.ok && r1.ok) pointTo = r0.time <= r1.time ? r0.p : r1.p;
    // duel scoring = points won, not raw corrects
    results.forEach(r => { if (r.ok) r.p.score--; });
    if (pointTo) { pointTo.score++; note = `${pointTo.me ? 'You take' : pointTo.name + ' takes'} the point${r0.ok && r1.ok ? ' on speed!' : '!'}`; }
    else note = 'Both wrong — no point.';
    if (battle.players.some(p => p.score >= 4)) battle.over = true;
  }

  el('battle-strip').innerHTML = battleStripHTML();
  el('battle-result').innerHTML = `
    <div class="battle-log">
      ${results.map(r => `
        <div class="battle-log-row">
          <span>${r.p.me ? '⭐ You' : r.p.name}</span>
          <span style="color:${r.ok ? 'var(--green-text)' : 'var(--red)'};font-weight:800">${r.ok ? '✓' : '✗'} ${r.time}s${!r.p.alive && battle.mode === 'elim' ? ' 💀' : ''}</span>
        </div>`).join('')}
      ${note ? `<div style="font-size:13px;font-weight:700;color:var(--accent2);padding:6px 2px 0">${note}</div>` : ''}
    </div>
    <button class="btn btn-primary btn-full" style="margin-top:10px" onclick="${battle.over ? 'finishBattle();renderGames()' : 'battle.idx++;renderGames();startBattleQuestion()'}">${battle.over ? 'See results →' : 'Next question →'}</button>`;
}

function finishBattle() {
  stopBattleTick();
  if (!battle) return;
  battle.over = true;
  const me = battle.players[0];
  let standings, xp, headline;

  if (battle.mode === 'elim') {
    standings = [...battle.players].sort((a, b) => (b.alive - a.alive) || (b.out - a.out));
    const place = standings.indexOf(me) + 1;
    xp = (me.alive && standings[0] === me ? 40 : 0) + me.score * 4;
    headline = me.alive && standings[0] === me ? '👑 VICTORY ROYALE — last one standing!' : `💀 Eliminated — you placed #${place} of ${battle.players.length}`;
  } else {
    standings = [...battle.players].sort((a, b) => (b.score - a.score) || (a.totalTime - b.totalTime));
    const place = standings.indexOf(me) + 1;
    const won = place === 1;
    if (battle.mode === 'race') xp = me.score * 2 + (won ? 30 : 0);
    else if (battle.mode === 'duel') xp = me.score * 5 + (won ? 35 : 0);
    else xp = me.score * 3 + (won ? 25 : 0);
    headline = won ? `🏆 You won the ${BATTLE_MODES[battle.mode].name}!` : `You placed #${place} of ${battle.players.length} — ${standings[0].name} took it.`;
  }
  battle.standings = standings;
  battle.xpEarned = xp;
  battle.headline = headline;
  if (!state.battles) state.battles = { played: 0, won: 0 };
  state.battles.played++;
  if (standings[0] === me) state.battles.won++;
  if (xp > 0) awardXP(xp, true);
  else saveState();
}

function renderBattleEnd(container) {
  const medals = ['🥇', '🥈', '🥉'];
  container.innerHTML = `
    <div class="quiz-wrap" style="max-width:680px">
      <div style="text-align:center;padding:18px 0 6px">
        <div style="font-size:44px;margin-bottom:8px">${battle.standings[0].me ? '🏆' : BATTLE_MODES[battle.mode].icon}</div>
        <h2 style="margin-bottom:4px">${battle.headline}</h2>
        <p style="color:var(--text2);font-size:14px;margin-bottom:14px">+${battle.xpEarned} XP earned</p>
      </div>
      <div class="lb-board" style="max-width:100%">
        ${battle.standings.map((p, i) => `
          <div class="lb-row${p.me ? ' me' : ''}">
            <span class="lb-rank">${medals[i] || '#' + (i + 1)}</span>
            <span class="lb-av" style="background:${p.col}">${p.me ? meAvInner() : p.name.charAt(0)}</span>
            <span class="lb-name">${p.me ? 'You' : p.name}</span>
            <span class="lb-xp">${battle.mode === 'elim' ? (p.alive ? 'Survived' : 'Eliminated') : p.score + ' pts'}</span>
          </div>`).join('')}
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="startBattle('${battle.mode}')">Rematch</button>
        <button class="btn btn-secondary" onclick="quitBattle()">Back to games</button>
      </div>
    </div>`;
}

/* ---- PROFILE ---- */
function heatmapHTML(weeks = 18) {
  const act = state.activity || {};
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - weeks * 7 + 1);
  while (start.getDay() !== 1) start.setDate(start.getDate() - 1); // align to Monday

  const cells = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().split('T')[0];
    const n = act[key] || 0;
    const lvl = n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 12 ? 3 : 4;
    cells.push(`<span class="hm-cell hm-${lvl}" title="${n} action${n !== 1 ? 's' : ''} on ${key}"></span>`);
    cursor.setDate(cursor.getDate() + 1);
  }

  return `
    <div class="heatmap-wrap">
      <div class="hm-days"><span>Mon</span><span>Wed</span><span>Fri</span></div>
      <div class="heatmap">${cells.join('')}</div>
    </div>
    <div class="hm-legend">Less <span class="hm-cell hm-0"></span><span class="hm-cell hm-1"></span><span class="hm-cell hm-2"></span><span class="hm-cell hm-3"></span><span class="hm-cell hm-4"></span> More</div>`;
}

function getAchievements() {
  const act = state.activity || {};
  const totalActs = Object.values(act).reduce((a, b) => a + b, 0);
  const rc = ragCounts();
  const mastered = Object.values(state.flashcards.boxes || {}).filter(b => b === 5).length;
  const best = parseInt(localStorage.getItem('u2_match_best') || '0', 10);
  const battles = state.battles || { played: 0, won: 0 };

  return [
    { icon: '👣', name: 'First Steps',     desc: 'Do 10 revision actions',        done: totalActs >= 10 },
    { icon: '🔥', name: 'On Fire',         desc: 'Hit a 7-day streak',            done: state.streak.count >= 7 },
    { icon: '🟢', name: 'Greenkeeper',     desc: 'Rate 25 topics Confident',      done: rc.green >= 25 },
    { icon: '🧠', name: 'Memory Master',   desc: 'Get 10 flashcards to Box 5',    done: mastered >= 10 },
    { icon: '⚔️', name: 'First Blood',     desc: 'Win any battle',                done: battles.won >= 1 },
    { icon: '🏹', name: 'Warlord',         desc: 'Win 10 battles',                done: battles.won >= 10 },
    { icon: '⏱️', name: 'Speed Demon',     desc: 'Clear Match in under 30s',      done: best > 0 && best < 30 },
    { icon: '🥈', name: 'Silver Surfer',   desc: 'Reach Silver rank',             done: (state.xp || 0) >= 300 },
    { icon: '💎', name: 'Shine Bright',    desc: 'Reach Diamond rank',            done: (state.xp || 0) >= 2500 },
    { icon: '✍️', name: 'Examiner\'s Pet', desc: 'Self-mark 20 questions',        done: state.questions.history.length >= 20 }
  ];
}

function renderProfile() {
  loadData(['a', 'b', 'c', 'd']);
  const xp = state.xp || 0;
  const r = rankFor(xp);
  const rows = getLBRows();
  const me = rows.find(x => x.me);
  const rc = ragCounts();
  const act = state.activity || {};
  const totalActs = Object.values(act).reduce((a, b) => a + b, 0);

  let last7 = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    last7 += act[d.toISOString().split('T')[0]] || 0;
  }

  const qHist = state.questions.history;
  const recent = qHist.slice(-10);
  const avgScore = recent.length ? Math.round(recent.reduce((a, h) => a + h.selfScore, 0) / recent.length) : null;
  const mastered = Object.values(state.flashcards.boxes || {}).filter(b => b === 5).length;
  const best = localStorage.getItem('u2_match_best');
  const battles = state.battles || { played: 0, won: 0 };
  const ach = getAchievements();
  const unlocked = ach.filter(a => a.done).length;

  const AV_EMOJIS = ['⭐', '🔥', '🧠', '👾', '💀', '🦊', '🐸', '🐱', '🐼', '🦈', '🚀', '🎯', '👑', '💎', '🌙', '⚡'];
  const AV_COLS = ['#A8326E', '#4338CA', '#0E9F6E', '#D97706', '#0E7490', '#C81E1E', '#44403C', '#6D5BD6'];

  el('profile-content').innerHTML = `
    <div class="card profile-head">
      <button class="lb-av profile-av" style="background:${pCol()}" onclick="toggleAvatarPicker()" title="Customise your avatar">${meAvInner()}</button>
      <div style="flex:1">
        <h2 style="margin-bottom:2px">You</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          ${rankChip(xp)}
          <span class="badge">Level ${xpLevel()}</span>
          <span class="badge">#${me.pos} of ${rows.length}</span>
          <span class="badge">🔥 ${state.streak.count}-day streak</span>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-family:'Fraunces',Georgia,serif;font-size:28px;font-weight:600;color:var(--accent2)">${xp.toLocaleString()}</div>
        <div style="font-size:11px;color:var(--text2);font-weight:700">TOTAL XP</div>
      </div>
    </div>

    <div class="card${avatarPickerOpen ? '' : ' hidden'}" id="avatar-picker">
      <h3 style="margin-bottom:10px">🎨 Customise your avatar</h3>
      <p style="font-size:12px;color:var(--text2);margin-bottom:8px;font-weight:700">YOUR PHOTO</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px">
        <button class="btn btn-primary btn-sm" onclick="uploadAvatar()">📷 Upload a picture</button>
        ${pImg() ? '<button class="btn btn-secondary btn-sm" onclick="removeAvatarImg()">Remove photo</button>' : ''}
      </div>
      <p style="font-size:12px;color:var(--text2);margin:12px 0 8px;font-weight:700">OR PICK AN ICON</p>
      <div class="av-options">
        ${AV_EMOJIS.map(e => `<button class="av-opt${e === pAv() ? ' picked' : ''}" onclick="setProfileAv('${e}', null)">${e}</button>`).join('')}
      </div>
      <p style="font-size:12px;color:var(--text2);margin:12px 0 8px;font-weight:700">COLOUR</p>
      <div class="av-options">
        ${AV_COLS.map(c => `<button class="av-opt swatch${c === pCol() ? ' picked' : ''}" style="background:${c}" onclick="setProfileAv(null, '${c}')" title="${c}"></button>`).join('')}
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:4px">📅 Activity</h3>
      <p style="font-size:13px;color:var(--text2);margin-bottom:12px">${totalActs.toLocaleString()} revision actions all-time · ${last7} in the last 7 days</p>
      ${heatmapHTML()}
    </div>

    <div class="stats-row">
      <div class="stat-box"><div class="num" style="color:var(--green-text)">${rc.green}</div><div class="lbl">Confident topics</div></div>
      <div class="stat-box"><div class="num" style="color:var(--accent2)">${mastered}</div><div class="lbl">Cards mastered</div></div>
      <div class="stat-box"><div class="num" style="color:var(--pink)">${qHist.length}</div><div class="lbl">Qs self-marked</div></div>
      <div class="stat-box"><div class="num" style="color:var(--reward-text)">${avgScore !== null ? avgScore + '%' : '—'}</div><div class="lbl">Avg score (last 10)</div></div>
      <div class="stat-box"><div class="num" style="color:var(--accent)">${battles.won}/${battles.played}</div><div class="lbl">Battles won</div></div>
      <div class="stat-box"><div class="num" style="color:var(--text)">${best ? best + 's' : '—'}</div><div class="lbl">Best match time</div></div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:10px">🏅 Achievements <span style="font-size:13px;color:var(--text2);font-weight:600">${unlocked}/${ach.length} unlocked</span></h3>
      <div class="ach-grid">
        ${ach.map(a => `
          <div class="ach${a.done ? ' done' : ''}" title="${a.desc}">
            <span class="ach-icon">${a.done ? a.icon : '🔒'}</span>
            <span class="ach-name">${a.name}</span>
            <span class="ach-desc">${a.desc}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

let avatarPickerOpen = false;

function toggleAvatarPicker() {
  avatarPickerOpen = !avatarPickerOpen;
  const p = el('avatar-picker');
  if (p) p.classList.toggle('hidden', !avatarPickerOpen);
}

function setProfileAv(emoji, col) {
  if (!state.profile) state.profile = { emoji: '⭐', col: '#A8326E' };
  if (emoji) { state.profile.emoji = emoji; delete state.profile.img; } // picking an emoji switches off the photo
  if (col) state.profile.col = col;
  saveState();
  updateNavAvatar();
  renderProfile();
  const p = el('avatar-picker');
  if (p) p.classList.remove('hidden');
}

/* ---- EXAM KIT ---- */
function renderExamKit() {
  const container = el('examkit-content');

  const commandWords = [
    ['State / Give / Name', '1', 'One-word or one-phrase answer. No explanation needed — don\'t waste time.'],
    ['Identify', '1', 'Pick out the relevant fact from the scenario. Short and direct.'],
    ['Describe', '2–4', 'Give linked statements that paint a picture. No reasons required.'],
    ['Explain', '2–4', 'Point + linked expansion. One mark for each. Always include the "because…".'],
    ['Analyse', '4–6', 'Break it down — how the parts relate, causes and effects, step-by-step logic.'],
    ['Discuss', '6–9', 'Explore BOTH sides (benefits AND drawbacks), applied to the scenario.'],
    ['Assess', '6–9', 'Weigh up importance/impact of factors, with a supported judgement.'],
    ['Evaluate', '9–12', 'Both sides + a justified conclusion. The conclusion is what unlocks Level 3.']
  ];

  const keywordBanks = [
    { title: '🔍 Section D — Forensics (fast marks)', col: '#6D5BD6', words: ['Faraday bag', 'Write-blocker', 'Forensic image (bit-for-bit copy)', 'Hash value (MD5/SHA) before & after', 'Chain of custody', 'Contemporaneous notes', 'Evidence bag + tamper-proof seal', 'Photograph the scene first'] },
    { title: '🛡️ Section A — Protection', col: '#4338CA', words: ['Encryption (at rest / in transit)', 'Multi-factor authentication', 'Anti-malware + updates', 'Firewall rules', 'Penetration testing', 'Staff training', 'Acceptable Use Policy', 'GDPR — 72-hour breach reporting'] },
    { title: '🌐 Section B — Networks', col: '#A8326E', words: ['VPN — encrypted tunnel', 'DMZ for public-facing servers', 'Network segmentation / VLAN', 'DHCP — automatic IP assignment', 'DNS — name resolution', 'WPA3 over WEP', 'MAC filtering (spoofable!)', 'RAID is NOT a backup'] },
    { title: '📋 Section C — Documentation', col: '#0E9F6E', words: ['Security policy + review date', 'Risk assessment matrix', 'Incident response plan', 'Disaster recovery plan', 'Backup policy (3-2-1 rule)', 'Audit trail / logs', 'Business continuity', 'Roles & responsibilities'] }
  ];

  container.innerHTML = `
    <h2 style="margin-bottom:6px">Exam Kit</h2>
    <p style="color:var(--text2);font-size:14px;margin-bottom:18px">Command words, mark-scheme patterns and rapid-recall keywords — the exam technique layer that turns knowledge into marks.</p>

    <div class="card">
      <h3 style="margin-bottom:10px">⚡ Command words decoder</h3>
      <div class="comparison-table-wrap"><table class="comparison-table">
        <thead><tr><th>Command word</th><th>Typical marks</th><th>What the examiner wants</th></tr></thead>
        <tbody>${commandWords.map(r => `<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:10px">🏆 The 9-mark formula (levels-based)</h3>
      <ul class="key-facts">
        <li><strong>Open</strong> — one sentence directly answering the question in scenario terms</li>
        <li><strong>Side 1</strong> — two developed benefits, each linked to the scenario business</li>
        <li><strong>Side 2</strong> — two developed drawbacks/risks, each linked to the scenario</li>
        <li><strong>Conclusion</strong> — a justified judgement ("Overall… because…"). No conclusion = capped at Level 2</li>
      </ul>
      <div class="exam-tip">Generic answers cap your marks. Name the business, its size, its data, its budget — every paragraph.</div>
    </div>

    <h3 style="margin:22px 0 12px;font-size:14px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px">Rapid-recall keyword banks</h3>
    <div class="grid2">
      ${keywordBanks.map(b => `
        <div class="card" style="margin-bottom:0">
          <h3 style="color:${b.col};margin-bottom:10px">${b.title}</h3>
          <ul class="key-facts">${b.words.map(w => `<li>${w}</li>`).join('')}</ul>
        </div>`).join('')}
    </div>`;
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
        <span class="badge" style="background:rgba(67,56,202,0.08);color:var(--accent2);border-color:rgba(67,56,202,0.25)">${r.section} — ${r.sectionTitle}</span>
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
    <p style="color:var(--text2);font-size:14px;margin-bottom:16px">${daysUntilExam()} days until your Unit 2 exam. ${getMotivation()}</p>
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
        'Work through Section A (Threats, Vulnerabilities & Protection) — the largest, most-examined aim',
        'Work through Section B (Networking & Security) — expect a network diagram and VPN/DHCP/firewall questions',
        weakCodes.length ? `Revisit these red codes: ${weakCodes.join(', ')}` : 'Mark any uncertain codes as Amber or Red for tracking'
      ]
    });
  } else if (days > 7) {
    blocks.push({
      id: 'content',
      title: '📖 Focused Review',
      items: [
        'Complete any remaining Amber/Red codes',
        'Focus on Tier 1 topics: A1-A4 (Threats & Protection), B (Networks), D (Forensics)',
        weakCodes.length ? `Priority: ${weakCodes.join(', ')}` : 'Try to clear all Red codes this week'
      ]
    });
  } else {
    blocks.push({
      id: 'final',
      title: '🚨 Final Week — Exam Mode',
      items: [
        'Practise 1 nine-mark Evaluate question under timed conditions',
        'Review command words: State vs Explain vs Describe vs Evaluate',
        'Check mark scheme patterns: 1-mark state, 2-mark explain (point + linked expansion), 9-mark levels-based evaluate',
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
  const sections = ['A', 'B', 'C', 'D'];
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

const planChecks = JSON.parse(localStorage.getItem('u2_plan_checks') || '{}');

function getPlanCheck(key) {
  const todayStr = today();
  return planChecks[todayStr] && planChecks[todayStr][key];
}

function savePlanCheck(key, val) {
  const todayStr = today();
  if (!planChecks[todayStr]) planChecks[todayStr] = {};
  planChecks[todayStr][key] = val;
  localStorage.setItem('u2_plan_checks', JSON.stringify(planChecks));
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
  a.download = `unit2-revision-${today()}.json`;
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
  document.querySelectorAll('.nav-btn, .nav-avatar').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });
  loadData(['a', 'b', 'c', 'd']);
  updateNavAvatar();
  navigate('home');
});

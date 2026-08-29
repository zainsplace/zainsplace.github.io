/* ===== BTEC REVISION APP ===== */

/* ---- UNIT MANIFEST ----
   Colour, order, shortName and blurb live here, NOT in the section JSON.
   Unit 2's JSON colours are stale; Unit 1's order is not derivable from tier.
   Values are copied from each unit's live site. Do not "tidy" them. */
const UNITS = {
  u1: {
    id: 'u1', label: 'Unit 1', short: 'U1',
    name: 'Information Technology Systems',
    headerSub: 'BTEC National · Information Technology Systems',
    examDate: null,
    order: ['c', 'd', 'b', 'e', 'a', 'f'],
    sections: {
      a: { colour: '#3182ce', shortName: 'IT Systems & Devices', blurb: 'Devices, OS, Software, Interfaces' },
      b: { colour: '#d69e2e', shortName: 'Transmitting Data',    blurb: 'Networks, Protocols, Compression' },
      c: { colour: '#e53e3e', shortName: 'Operating Online',     blurb: 'Cloud, VPN, Online Communities' },
      d: { colour: '#e53e3e', shortName: 'Protecting Data',      blurb: 'Threats, Encryption, Firewalls' },
      e: { colour: '#dd6b20', shortName: 'Impact of IT',         blurb: 'Online Services, Data, E-commerce' },
      f: { colour: '#9f7aea', shortName: 'Legal & Ethical',      blurb: 'GDPR, Computer Misuse, Copyright' }
    }
  },
  u2: {
    id: 'u2', label: 'Unit 2', short: 'U2',
    name: 'Cyber Security & Incident Management',
    headerSub: 'BTEC National · Cyber Security & Incident Management',
    examDate: '2026-05-15',
    order: ['a', 'b', 'd', 'c'],
    keywordBanks: [
      { title: 'Section D — Forensics (fast marks)', col: '#6D5BD6', words: ['Faraday bag', 'Write-blocker', 'Forensic image (bit-for-bit copy)', 'Hash value (MD5/SHA) before & after', 'Chain of custody', 'Contemporaneous notes', 'Evidence bag + tamper-proof seal', 'Photograph the scene first'] },
      { title: 'Section A — Protection', col: '#4338CA', words: ['Encryption (at rest / in transit)', 'Multi-factor authentication', 'Anti-malware + updates', 'Firewall rules', 'Penetration testing', 'Staff training', 'Acceptable Use Policy', 'GDPR — 72-hour breach reporting'] },
      { title: 'Section B — Networks', col: '#A8326E', words: ['VPN — encrypted tunnel', 'DMZ for public-facing servers', 'Network segmentation / VLAN', 'DHCP — automatic IP assignment', 'DNS — name resolution', 'WPA3 over WEP', 'MAC filtering (spoofable!)', 'RAID is NOT a backup'] },
      { title: 'Section C — Documentation', col: '#0E9F6E', words: ['Security policy + review date', 'Risk assessment matrix', 'Incident response plan', 'Disaster recovery plan', 'Backup policy (3-2-1 rule)', 'Audit trail / logs', 'Business continuity', 'Roles & responsibilities'] }
    ],
    sections: {
      a: { colour: '#4338CA', shortName: 'Cyber Security Threats & Protection', blurb: 'Threats, Vulnerabilities, Encryption, GDPR' },
      b: { colour: '#A8326E', shortName: 'Networking Architectures & Security', blurb: 'Networks, VPN, DHCP, Firewalls' },
      c: { colour: '#0E9F6E', shortName: 'Cyber Security Documentation',        blurb: 'Policies, Audits, Incident Response' },
      d: { colour: '#6D5BD6', shortName: 'Forensic Procedures',                 blurb: 'Evidence, Imaging, Chain of Custody' }
    }
  }
};

function isUnitId(id) {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(UNITS, id);
}

/* UNITS is a plain object literal, so a bare UNITS[x] lookup is truthy for
   'constructor', 'toString', '__proto__' and friends. A backup carrying one of
   those as activeUnit used to pass validation, persist, and then throw on every
   subsequent load with no way back except clearing site data. */
function unitDef(id) {
  const key = id || store.activeUnit;
  return isUnitId(key) ? UNITS[key] : UNITS.u1;
}
function unitLetters() { return unitDef().order.slice(); }
function unitLettersUpper() { return unitDef().order.map(l => l.toUpperCase()); }
function unitData() {
  const key = isUnitId(store.activeUnit) ? store.activeUnit : 'u1';
  return INLINE_UNITS[key] || INLINE_UNITS.u1;
}

/* ---- STATE ----
   Persisted shape: { activeUnit, theme, profile, units: { u1: {...}, u2: {...} } }
   Everything except theme and profile is per unit: topic codes, flashcard ids
   and question ids all collide between the two units.
   `state` below is a live view onto the active unit so the rest of the app can
   keep using state.rag / state.xp / state.theme unchanged. */
const STATE_KEY = 'rev_state';
const GLOBAL_KEYS = new Set(['theme', 'profile', 'activeUnit']);

function defaultUnitState() {
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
    streak: { last: null, count: 0 },
    xp: 0,
    activity: {},      // 'YYYY-MM-DD' -> action count (feeds the heatmap)
    battles: { played: 0, won: 0, modes: {} },
    extended: {
      history: []      // {type, wordCount, date, timeTaken}
    },
    examDate: null,
    planChecks: {},
    bests: { tf: 0, match: 0 }
  };
}

function defaultStore() {
  return {
    activeUnit: 'u1',
    theme: 'light',
    profile: { emoji: '📘', col: '#1B5A5F' },
    units: { u1: defaultUnitState(), u2: defaultUnitState() }
  };
}

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function deepMerge(target, source) {
  const out = Object.assign({}, target);
  for (const k in source) {
    if (!Object.prototype.hasOwnProperty.call(source, k)) continue;
    if (UNSAFE_KEYS.has(k)) continue;   // a JSON "__proto__" key would otherwise
    if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
      out[k] = deepMerge(target[k] || {}, source[k]);
    } else {
      out[k] = source[k];
    }
  }
  return out;
}

/* Coerce a parsed value against the shape of a known-good default. Anything of
   the wrong type is replaced by the default rather than trusted, at every depth.
   Valid JSON is not a valid store: `{"units":{"u1":{"streak":null}}}` parses
   fine and then throws on the home page. */
function coerceLike(def, raw) {
  if (Array.isArray(def)) {
    if (!Array.isArray(raw)) return def.slice();
    // History arrays are read as objects (h.qId, h.selfScore). One null entry
    // blanks a whole page, so drop anything that is not a plain object.
    return raw.filter(isPlainObject);
  }
  if (isPlainObject(def)) {
    if (!isPlainObject(raw)) return def;
    const out = {};
    Object.keys(def).forEach(k => { out[k] = coerceLike(def[k], raw[k]); });
    // Free-form maps (rag, activity, planChecks…) start empty in the default,
    // so their real keys are carried over — minus anything unsafe.
    Object.keys(raw).forEach(k => {
      if (UNSAFE_KEYS.has(k) || k in out) return;
      if (raw[k] !== null && typeof raw[k] !== 'function') out[k] = raw[k];
    });
    return out;
  }
  if (typeof def === 'number') return typeof raw === 'number' && isFinite(raw) ? raw : def;
  if (typeof def === 'string') return typeof raw === 'string' ? raw : def;
  if (typeof def === 'boolean') return typeof raw === 'boolean' ? raw : def;
  // def is null: accept a string (examDate, streak.last) or keep null
  return typeof raw === 'string' || typeof raw === 'number' ? raw : def;
}

function coerceUnit(raw) {
  const unit = coerceLike(defaultUnitState(), raw);
  GLOBAL_KEYS.forEach(k => { delete unit[k]; });   // theme/profile never live in a unit
  return unit;
}

/* Does this look like a pre-merge backup rather than an arbitrary JSON file?
   The old site always wrote these keys, and a stray data file will not have them. */
function looksLikeLegacyBackup(o) {
  if (!isPlainObject(o)) return false;
  const shaped = ['rag', 'reviewed', 'flashcards', 'questions', 'streak', 'activity'];
  const present = shaped.filter(k => isPlainObject(o[k]));
  return present.length >= 3 || (typeof o.xp === 'number' && present.length >= 2);
}

function hasRealHistory(blob) {
  if (!blob || typeof blob !== 'object') return false;
  const n = o => o && typeof o === 'object' ? Object.keys(o).length : 0;
  return n(blob.rag) > 0 || n(blob.reviewed) > 0 ||
         n(blob.flashcards && blob.flashcards.boxes) > 0 ||
         (blob.questions && (blob.questions.history || []).length > 0) ||
         (blob.xp || 0) > 0;
}

function readLegacy(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function readLegacyNum(key) {
  try {
    const v = parseInt(localStorage.getItem(key) || '0', 10);
    return Number.isFinite(v) ? v : 0;
  } catch { return 0; }
}

/* One-way migration off the old per-site keys. Both units were served from the
   same origin, so a visitor may hold history from either. Legacy keys are left
   in place so a bad migration is recoverable by clearing rev_state. */
function migrateLegacy() {
  const s = defaultStore();
  const legacy = { u1: readLegacy('u1rev_state'), u2: readLegacy('u2rev_state') };
  let migrated = null;

  ['u1', 'u2'].forEach(id => {
    const blob = legacy[id];
    if (!hasRealHistory(blob)) return;
    // theme/profile/activeUnit are global. Left inside a unit blob they collide
    // with the Proxy's global keys and make Object.keys(state) throw.
    const unitOnly = Object.assign({}, blob);
    GLOBAL_KEYS.forEach(k => delete unitOnly[k]);
    s.units[id] = deepMerge(defaultUnitState(), unitOnly);
    if (blob.examDate) s.units[id].examDate = blob.examDate;
    const checks = readLegacy(id === 'u1' ? 'u1_plan_checks' : 'u2_plan_checks');
    if (checks) s.units[id].planChecks = checks;
    migrated = migrated || id;
    if (blob.theme) s.theme = blob.theme;
    if (blob.profile) s.profile = Object.assign(s.profile, blob.profile);
  });

  s.units.u2.bests = {
    tf: readLegacyNum('u2_tf_best'),
    match: readLegacyNum('u2_match_best')
  };

  const last = id => (legacy[id] && legacy[id].streak && legacy[id].streak.last) || '';
  if (hasRealHistory(legacy.u1) && hasRealHistory(legacy.u2)) {
    s.activeUnit = last('u1') > last('u2') ? 'u1' : 'u2';
  } else if (migrated) {
    s.activeUnit = migrated;
  }
  return s;
}

/* Valid JSON is not the same as a valid store. Without this, {"units":[]} or
   {"activeUnit":"u3"} parses fine and then every state read throws. */
function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function coerceStore(raw) {
  const base = defaultStore();
  if (!isPlainObject(raw)) return base;
  const out = defaultStore();
  if (typeof raw.theme === 'string') out.theme = raw.theme;
  if (isPlainObject(raw.profile)) out.profile = coerceLike(base.profile, raw.profile);
  if (isPlainObject(raw.units)) {
    Object.keys(out.units).forEach(id => {
      if (isPlainObject(raw.units[id])) {
        out.units[id] = coerceUnit(raw.units[id]);
      }
    });
  }
  out.activeUnit = isUnitId(raw.activeUnit) ? raw.activeUnit : base.activeUnit;
  return out;
}

function loadStore() {
  let raw = null;
  try { raw = localStorage.getItem(STATE_KEY); } catch { raw = null; }
  if (!raw) return migrateLegacy();
  try {
    return coerceStore(JSON.parse(raw));
  } catch {
    return defaultStore();
  }
}

let store = loadStore();

/* A view onto store.units[activeUnit], with theme/profile passed through to the
   top level. Lets every existing state.* call site keep working after the split. */
const state = new Proxy({}, {
  get(_, k) {
    if (k === 'activeUnit') return store.activeUnit;
    if (GLOBAL_KEYS.has(k)) return store[k];
    return store.units[store.activeUnit][k];
  },
  set(_, k, v) {
    if (GLOBAL_KEYS.has(k)) store[k] = v;
    else store.units[store.activeUnit][k] = v;
    return true;
  },
  has(_, k) {
    return GLOBAL_KEYS.has(k) || k in store.units[store.activeUnit];
  },
  deleteProperty(_, k) {
    if (GLOBAL_KEYS.has(k)) delete store[k];
    else delete store.units[store.activeUnit][k];
    return true;
  },
  ownKeys() {
    // Must be duplicate-free: a proxy ownKeys trap that repeats a key throws.
    return [...new Set([...GLOBAL_KEYS, ...Object.keys(store.units[store.activeUnit])])];
  },
  getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  }
});

function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(store));
    return true;
  } catch (e) {
    toastStorageFull();
    return false;
  }
}

let storageWarned = false;
function toastStorageFull() {
  if (storageWarned) return;
  storageWarned = true;
  if (typeof toast === 'function') {
    toast('Storage is full — progress is not being saved. Remove your profile photo to free space.');
  }
}

document.body.setAttribute('data-theme', store.theme || 'light');

/* ---- DATA STORE (inlined — no fetch required) ----
   DATA is keyed by section letter only, so it MUST be cleared when the unit
   changes or the previous unit's content keeps rendering. */
let DATA = {};

function loadData(sections) {
  const src = unitData().sections;
  sections.forEach(s => { if (!DATA[s]) DATA[s] = src[s] || null; });
}

function loadJSON(path) {
  const u = unitData();
  if (path === 'data/flashcards.json') return u.flashcards;
  if (path === 'data/questions.json')  return u.questions;
  if (path === 'data/extended.json')   return u.extended || null;
  return null;
}

function flashcardsForUnit() {
  return (loadJSON('data/flashcards.json') || {}).cards || [];
}

function escapeRe(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* Game high scores are per unit: the question pools differ, so a Unit 1 score
   is not comparable with a Unit 2 one. */
function getBest(k) {
  return (state.bests && state.bests[k]) || 0;
}

function setBest(k, v) {
  if (!state.bests) state.bests = { tf: 0, match: 0 };
  state.bests[k] = v;
  saveState();
}

/* Every spec item in the active unit: the objects carrying both a code and a
   term. These are the term/definition pairs the games are built on. */
function specItems() {
  loadData(unitLetters());
  const out = [];
  unitLetters().forEach(letter => {
    const d = DATA[letter];
    if (!d) return;
    (function walk(obj) {
      if (!obj || typeof obj !== 'object') return;
      if (obj.code && obj.term) out.push(obj);
      Object.values(obj).forEach(v => { if (v && typeof v === 'object') walk(v); });
    })(d);
  });
  return out;
}

/* ---- UNIT SWITCHING ----
   DATA, the search index and every in-flight game hold content keyed by bare
   section letter. None of it is unit-aware, so all of it must be discarded or
   the previous unit keeps rendering and its scores land in the wrong namespace. */
function resetTransientState() {
  stopAllTimers();          // must run before the state holding the timers is cleared
  DATA = {};
  searchBuilt = false;
  allSearchContent = [];
  currentSection = null;
  flashFilter = 'all';
  qFilter = 'all';
  if (typeof flashPracticeMode !== 'undefined') flashPracticeMode = false;
  qMode = 'browse';
  gamesMode = 'menu';
  quizQueue = [];
  quizIdx = 0;
  mcq = null;
  matchGame = null;
  tfState = null;
  fitbState = null;
  battle = null;
  flashIdx = 0;
}

/* Every running interval must be cleared, not just the ones held in a named
   variable. A live True/False timer fires endTrueFalse() up to 30s later and
   would reset the page — or bank its score into the wrong unit. */
function stopGameTimers() {
  if (matchInterval) { clearInterval(matchInterval); matchInterval = null; }
  if (battleTick) { clearInterval(battleTick); battleTick = null; }
  if (tfState && tfState.timer) { clearInterval(tfState.timer); tfState.timer = null; }
}

/* Extended-writing timers are the student's own exam practice, not game state.
   They are only torn down on a unit switch, never on ordinary navigation. */
/* A unit switch abandons the essay as well as the clock, so the timer is
   discarded outright. Merely pausing it left a stale `remaining` behind while
   the page re-rendered from the prompt's full time, and Start jumped backwards. */
function clearExtDrafts() {
  Object.keys(extDrafts).forEach(k => { delete extDrafts[k]; });
}

function stopExtendedTimers() {
  if (typeof extTimers === 'object' && extTimers) {
    Object.keys(extTimers).forEach(k => {
      const t = extTimers[k];
      if (t && t.interval) clearInterval(t.interval);
      delete extTimers[k];
    });
  }
  clearExtDrafts();
}

function stopAllTimers() {
  stopGameTimers();
  stopExtendedTimers();
}

function switchUnit(id) {
  if (!isUnitId(id) || id === store.activeUnit) return;
  store.activeUnit = id;
  saveState();
  resetTransientState();
  applyUnitChrome();
  navigate('home');
  toast(UNITS[id].label + ' · ' + UNITS[id].name);
}

/* Header, wordmark, document title and meta live in static HTML, so they have
   to be rewritten from script when the unit changes. */
function applyUnitChrome() {
  const u = unitDef();
  document.title = u.label + ' ' + u.name + ' Revision';
  const set = (id, text) => { const n = el(id); if (n) n.textContent = text; };
  set('brand-mark', u.short);
  set('brand-text', u.label + ' ' + u.name.split(' ')[0]);
  set('dash-title', u.label + ' · ' + u.name);
  set('dash-sub', u.headerSub);
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', u.label + ': ' + u.name + ' — revision hub with flashcards, exam questions, games and progress tracking.');
  document.querySelectorAll('.unit-switch-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.unit === u.id);
    b.setAttribute('aria-pressed', String(b.dataset.unit === u.id));
  });
}

/* ---- NAVIGATION ---- */
const PAGES = ['home', 'sections', 'flashcards', 'questions', 'games', 'leaderboard', 'extended', 'examkit', 'search', 'plan', 'profile'];
let currentPage = 'home';
let currentSection = null;

const PAGE_TITLES = {
  home: 'Home', sections: 'Sections', flashcards: 'Flashcards',
  questions: 'Questions', games: 'Games', leaderboard: 'Leaderboard',
  extended: 'Extended Writing', examkit: 'Exam Kit', search: 'Search',
  plan: "Today's Plan", profile: 'Profile'
};

function navigate(page, opts = {}) {
  // Leaving the games page abandons whatever was running. Without this a live
  // Blitz or Match timer keeps ticking and banks its score minutes later.
  if (page !== 'games' && typeof stopGameTimers === 'function') {
    stopGameTimers();
    gamesMode = 'menu';
    tfState = null;
    matchGame = null;
    fitbState = null;
    mcq = null;
  }
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  const navEl = document.querySelector(`.nav-btn[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');
  document.querySelectorAll('.sidebar-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });
  const titleEl = el('top-bar-title');
  if (titleEl) titleEl.textContent = PAGE_TITLES[page] || page;
  // scroll content to top on navigation
  const mainEl = document.querySelector('main');
  if (mainEl) mainEl.scrollTop = 0;
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

/* ---- SIDEBAR ---- */
let sidebarOpen = null; // null = not yet initialised

function initSidebar() {
  const saved = localStorage.getItem('rev_sidebar') ?? localStorage.getItem('u2_sidebar');
  sidebarOpen = saved !== null ? saved === 'true' : false;
  applySidebarState();
}

function applySidebarState() {
  const sidebar = el('sidebar');
  const backdrop = el('sidebar-backdrop');
  const isDesktop = window.innerWidth >= 900;
  if (sidebarOpen) {
    sidebar.classList.add('open');
    if (!isDesktop) backdrop.classList.add('visible');
  } else {
    sidebar.classList.remove('open');
    backdrop.classList.remove('visible');
  }
}

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  localStorage.setItem('rev_sidebar', String(sidebarOpen));
  applySidebarState();
}

function closeSidebar() {
  sidebarOpen = false;
  localStorage.setItem('rev_sidebar', 'false');
  applySidebarState();
}

function sidebarNav(page) {
  navigate(page);
  // On mobile, close sidebar after navigation
  if (window.innerWidth < 900) closeSidebar();
}

/* ---- HELPERS ---- */
function el(id) { return document.getElementById(id); }

function toast(msg, ms = 2500, type = 'info') {
  const t = el('toast');
  const iconEl = el('toast-icon');
  const msgEl = el('toast-msg');
  const bar = el('toast-bar');

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  if (iconEl) iconEl.textContent = icon;
  if (msgEl) msgEl.textContent = msg;

  t.className = type === 'success' ? 'toast-success' : '';
  t.classList.add('show');

  if (bar) {
    bar.style.transition = 'none';
    bar.style.transform = 'scaleX(1)';
    requestAnimationFrame(() => {
      bar.style.transition = `transform ${ms}ms linear`;
      bar.style.transform = 'scaleX(0)';
    });
  }

  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), ms);
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', state.theme);
  saveState();
  // update any theme toggle buttons
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
    btn.title = state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  });
}

/* ---- EXAM DATE (per unit, editable — click the countdown box to change) ----
   Each unit sits a different paper. A unit with no date set shows no countdown
   rather than a wrong one. */
function getExamDate() {
  return state.examDate || unitDef().examDate || null;
}

function hasExamDate() {
  return !!getExamDate();
}

/* daysUntilExam() clamps at 0, so a date in the past looks identical to "today".
   Without this the plan tells a student the exam is tomorrow months after it sat. */
/* new Date('2026-08-29') is UTC midnight, which floors to the PREVIOUS local day
   anywhere west of Greenwich and fired 'Exam is today' a day early. Build the
   date from its parts so it is local midnight everywhere. */
function parseExamDate(v) {
  if (typeof v !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (isNaN(d.getTime())) return null;
  if (d.getFullYear() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1
      || d.getDate() !== Number(m[3])) return null;   // rejects 2026-02-31
  d.setHours(0, 0, 0, 0);
  return d;
}

function examPassed() {
  const exam = parseExamDate(getExamDate());
  if (!exam) return false;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return exam < now;
}

function daysUntilExam() {
  const exam = parseExamDate(getExamDate());
  if (!exam) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((exam - now) / 86400000));
}

function setExamDate() {
  const current = getExamDate() || '';
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

function sectionMeta(letter) {
  return unitDef().sections[String(letter).toLowerCase()] || null;
}

function sectionTitle(letter) {
  const d = unitData().sections[String(letter).toLowerCase()];
  return (d && d.title) || '';
}

function sectionShortName(letter) {
  const m = sectionMeta(letter);
  return (m && m.shortName) || sectionTitle(letter);
}

function sectionBlurb(letter) {
  const m = sectionMeta(letter);
  return (m && m.blurb) || '';
}

function sectionTier(letter) {
  const d = unitData().sections[String(letter).toLowerCase()];
  return (d && d.tier) || 3;
}

function sectionTierClass(letter) {
  return 'tier' + sectionTier(letter);
}

function sectionColour(letter) {
  const m = sectionMeta(letter);
  return (m && m.colour) || '#1B5A5F';
}

/* Sections in the unit's own display order, upper-case. Unit 1's order is
   C,D,B,E,A,F — not derivable from tier or the alphabet. */
function tier1Letters() {
  const t1 = unitLettersUpper().filter(L => sectionTier(L) === 1);
  return t1.length ? t1 : unitLettersUpper();
}

function sectionList() {
  return unitLettersUpper().map(L => ({
    letter: L,
    name: sectionShortName(L),
    topics: sectionBlurb(L),
    tier: sectionTierClass(L),
    col: sectionColour(L)
  }));
}

function sectionProgress(letter) {
  const codes = getSectionCodes(letter);
  if (!codes.length) return 0;
  const done = codes.filter(c => state.rag[c] === 'green').length;
  return Math.round((done / codes.length) * 100);
}

/* The letter class must come from the active unit. A hardcoded [A-D] silently
   drops every Unit 1 E and F code. */
function codePattern() {
  return new RegExp('^[' + unitLettersUpper().join('') + '][0-9]+\\.[0-9]+');
}

function getSectionCodes(letter) {
  const d = DATA[letter.toLowerCase()];
  if (!d) return [];
  const re = codePattern();
  const codes = [];
  function walk(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.code && re.test(obj.code)) codes.push(obj.code);
    Object.values(obj).forEach(v => { if (typeof v === 'object') walk(v); });
  }
  walk(d);
  return [...new Set(codes)];
}

function overallProgress() {
  const letters = unitLettersUpper();
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

/* Whole-unit RAG spread, including topics never rated. Feeds the confidence
   strip on the home page. */
function ragSpread() {
  loadData(unitLetters());
  let total = 0, green = 0, amber = 0, red = 0;
  unitLettersUpper().forEach(l => {
    getSectionCodes(l).forEach(c => {
      total++;
      const v = state.rag[c];
      if (v === 'green') green++;
      else if (v === 'amber') amber++;
      else if (v === 'red') red++;
    });
  });
  return { total, green, amber, red, unrated: total - green - amber - red };
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

/* Profile values normally come from a fixed picker, but an imported backup can
   set them to anything and backups are meant to be shared between students, so
   they are sanitised at the point they reach innerHTML. */
function escapeHTML(v) {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function pAv() {
  const e = String((state.profile && state.profile.emoji) || '📘');
  return escapeHTML(firstGrapheme(e));
}

/* Slicing by UTF-16 unit cuts a flag, skin tone or ZWJ family mid-character and
   renders a replacement glyph. The picker only offers single-codepoint emoji,
   but an imported backup can carry anything. */
function firstGrapheme(str) {
  try {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      for (const g of seg.segment(str)) return g.segment;
      return '';
    }
  } catch { /* fall through */ }
  return Array.from(str).slice(0, 8).join('');
}

function pCol() {
  const c = (state.profile && state.profile.col) || '';
  return /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : '#1B5A5F';
}
function pImg() {
  const src = state.profile && state.profile.img;
  // Only an inline image is ever legitimate here — the camera writes a data URL.
  return (typeof src === 'string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src))
    ? src : null;
}

/* inner content for any "me" avatar: photo if set, else emoji */
function meAvInner() {
  return pImg() ? `<img src="${pImg()}" class="av-img" alt="">` : pAv();
}

function updateNavAvatar() {
  const topAv = el('nav-avatar');
  if (topAv) { topAv.innerHTML = meAvInner(); topAv.style.background = pCol(); }
  const sidebarAvCircle = el('sidebar-av-circle');
  if (sidebarAvCircle) { sidebarAvCircle.innerHTML = meAvInner(); sidebarAvCircle.style.background = pCol(); }
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
/* The confidence strip: one honest picture of the whole syllabus, including
   the topics never rated — which the old four-number stat row could not show. */
function renderConfidenceStrip() {
  const sp = ragSpread();
  const strip = el('home-strip');
  const count = el('home-topic-count');
  if (count) count.textContent = sp.total + (sp.total === 1 ? ' topic' : ' topics');
  if (!strip) return;
  if (!sp.total) { strip.innerHTML = ''; return; }
  const seg = (cls, n) => n ? `<span class="seg ${cls}" style="width:${(n / sp.total) * 100}%">${
    (n / sp.total) > 0.06 ? n : ''}</span>` : '';
  strip.innerHTML = seg('s-green', sp.green) + seg('s-amber', sp.amber) +
                    seg('s-red', sp.red) + seg('s-none', sp.unrated);
  strip.setAttribute('aria-label',
    `${sp.green} confident, ${sp.amber} getting there, ${sp.red} need work, ${sp.unrated} not yet rated, of ${sp.total} topics`);
  const set = (id, v) => { const n = el(id); if (n) n.textContent = v; };
  set('home-stat-green', sp.green);
  set('home-stat-amber', sp.amber);
  set('home-stat-red', sp.red);
  set('home-stat-unrated', sp.unrated);
}

/* The hero points at the weakest-rated section, falling back to the unit's
   first section in its own display order. */
function heroLetter() {
  const ranked = unitLettersUpper()
    .map(L => ({ L, p: sectionProgress(L) }))
    .sort((a, b) => a.p - b.p);
  return ranked.length ? ranked[0].L : unitLettersUpper()[0];
}

function renderHeroCard() {
  const L = heroLetter();
  const t = el('home-hero-title');
  const sub = el('home-hero-sub');
  if (t) t.textContent = `Section ${L} · ${sectionShortName(L)}`;
  if (sub) sub.textContent = sectionBlurb(L);
}

function openHeroSection() {
  navigate('sections', { section: heroLetter() });
}

function renderHome() {
  loadData(unitLetters());
  updateStreak();

  const days = daysUntilExam();
  const prog = overallProgress();
  const rc = ragCounts();
  const flashDue = getFlashcardsDueCount();

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEl = el('home-greeting');
  if (greetEl) greetEl.textContent = greet;

  if (hasExamDate()) {
    el('home-countdown-days').textContent = days;
    const examPassed = new Date(getExamDate()) < new Date(new Date().toDateString());
    el('home-countdown-label').textContent = examPassed ? 'exam passed' : 'days to exam';
    el('home-countdown-date').textContent = `Exam: ${getExamDate()} • ${unitDef().label}: ${unitDef().name}`;
  } else {
    el('home-countdown-days').textContent = '—';
    el('home-countdown-label').textContent = 'no exam date set';
    el('home-countdown-date').textContent = `${unitDef().label}: ${unitDef().name} · tap to set your exam date`;
  }
  const progBar = el('home-overall-progress');
  progBar.style.width = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    progBar.style.width = prog + '%';
  }));
  el('home-overall-pct').textContent = prog + '%';
  renderConfidenceStrip();
  el('home-stat-streak').textContent = state.streak.count;
  el('home-flash-due').textContent = flashDue;
  const myRank = rankFor(state.xp || 0);
  el('home-stat-level').textContent = myRank.icon;
  el('home-stat-level').style.color = myRank.col;
  el('home-stat-xp').textContent = `${myRank.name} · ${state.xp || 0} XP`;
  renderHeroCard();

  renderSectionTiles();
  renderPriorityTopics();
  renderHeatmap();
  renderReviseNext();
}

/* ---- PRIORITY TOPICS (weakest first: red, then amber) ---- */
function findItemByCode(code) {
  for (const key of unitLetters()) {
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
      <div role="button" tabindex="0" class="search-result" onclick="goToResult('${item.section}', '${code}')">
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

let homeHeatmapYear = new Date().getFullYear();
let profileHeatmapYear = new Date().getFullYear();

function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function buildYearHeatmapHTML(year, callbackFn) {
  const act = state.activity || {};
  const now = new Date();
  const currentYear = now.getFullYear();
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const jan1 = new Date(year, 0, 1);
  const startPad = (jan1.getDay() + 6) % 7; // cells before Jan 1 to align to Monday

  const daysInYear = isLeapYear(year) ? 366 : 365;
  const dec31 = new Date(year, 11, 31);
  const lastDow = (dec31.getDay() + 6) % 7;
  const endPad = lastDow < 6 ? 6 - lastDow : 0;

  const cells = [];
  const monthPositions = [];
  let lastMonth = -1;

  for (let i = 0; i < startPad; i++) {
    cells.push(`<span class="hm-cell" style="visibility:hidden"></span>`);
  }

  for (let i = 0; i < daysInYear; i++) {
    const d = new Date(year, 0, i + 1);
    const key = `${year}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const n = act[key] || 0;
    const isFuture = d > now;
    const lvl = isFuture ? 0 : (n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 12 ? 3 : 4);

    const weekCol = Math.floor((startPad + i) / 7);
    const m = d.getMonth();
    if (m !== lastMonth) { monthPositions.push({ col: weekCol, label: MONTHS[m] }); lastMonth = m; }

    cells.push(`<span class="hm-cell hm-${lvl}"${isFuture ? ' style="opacity:0.25"' : ''} title="${n} action${n !== 1 ? 's' : ''} on ${key}"></span>`);
  }

  for (let i = 0; i < endPad; i++) {
    cells.push(`<span class="hm-cell" style="visibility:hidden"></span>`);
  }

  const monthLabelHTML = monthPositions.map(m =>
    `<span style="position:absolute;left:${m.col * 16}px;font-size:10px;color:var(--text2);font-weight:700;white-space:nowrap;line-height:1">${m.label}</span>`
  ).join('');

  const btnStyle = `background:var(--bg3);border:1px solid var(--border);border-radius:8px;width:28px;height:28px;cursor:pointer;font-size:15px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;color:var(--text)`;
  const nextDisabled = year >= currentYear;

  return `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <button onclick="${callbackFn}(${year - 1})" style="${btnStyle}">‹</button>
      <span style="font-size:15px;font-weight:800;min-width:44px;text-align:center">${year}</span>
      <button onclick="${callbackFn}(${year + 1})"${nextDisabled ? ' disabled' : ''} style="${btnStyle};${nextDisabled ? 'opacity:0.3;cursor:default' : ''}">›</button>
    </div>
    <div style="overflow-x:auto;padding-bottom:6px">
      <div style="display:inline-flex;gap:6px;align-items:flex-start">
        <div class="hm-days" style="margin-top:20px"><span>Mon</span><span>Wed</span><span>Fri</span></div>
        <div>
          <div style="position:relative;height:18px;margin-bottom:2px">${monthLabelHTML}</div>
          <div class="heatmap">${cells.join('')}</div>
        </div>
      </div>
    </div>
    <div class="hm-legend">Less <span class="hm-cell hm-0"></span><span class="hm-cell hm-1"></span><span class="hm-cell hm-2"></span><span class="hm-cell hm-3"></span><span class="hm-cell hm-4"></span> More</div>`;
}

function renderHeatmap(year) {
  if (year !== undefined) homeHeatmapYear = year;
  const container = el('activity-heatmap');
  if (!container) return;
  container.innerHTML = buildYearHeatmapHTML(homeHeatmapYear, 'renderHeatmap');
}

function renderProfileHeatmap(year) {
  if (year !== undefined) profileHeatmapYear = year;
  const container = el('profile-heatmap');
  if (!container) return;
  container.innerHTML = buildYearHeatmapHTML(profileHeatmapYear, 'renderProfileHeatmap');
}

function renderReviseNext() {
  const container = el('revise-next');
  if (!container) return;

  const flashData = loadJSON('data/flashcards.json');
  const cards = (flashData || {}).cards || [];
  const todayStr = today();

  // Cards due today (spaced repetition nextDue <= today)
  const dueCards = cards.filter(c => {
    const due = state.flashcards.nextDue[c.id];
    return due && due <= todayStr;
  }).slice(0, 3);

  // Weakest RAG topic
  const reds = Object.entries(state.rag).filter(([, v]) => v === 'red').map(([k]) => k);
  const weakCode = reds[0] || null;
  const weakItem = weakCode ? findItemByCode(weakCode) : null;

  if (!dueCards.length && !weakItem) { container.innerHTML = ''; return; }

  const dueHTML = dueCards.length ? `
    <div style="margin-bottom:12px">
      <div style="font-size:12px;color:var(--text2);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Flashcards due today</div>
      ${dueCards.map(c => `
        <div role="button" tabindex="0" class="search-result" onclick="navigate('flashcards')" style="cursor:pointer">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge">${c.code}</span>
            <span style="flex:1;font-size:14px">${c.front}</span>
            <span class="chevron">→</span>
          </div>
        </div>`).join('')}
    </div>` : '';

  const weakHTML = weakItem ? `
    <div>
      <div style="font-size:12px;color:var(--text2);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">🔴 Weakest topic</div>
      <div role="button" tabindex="0" class="search-result" onclick="goToResult('${weakItem.section}', '${weakCode}')" style="cursor:pointer">
        <div style="display:flex;align-items:center;gap:8px">
          <span class="badge" style="background:#FDECEC;color:#C53030;border-color:#F7C5C5">${weakCode}</span>
          <span style="flex:1;font-size:14px">${weakItem.term}</span>
          <span class="chevron">→</span>
        </div>
      </div>
    </div>` : '';

  container.innerHTML = `
    <div class="card" style="margin-bottom:20px;padding:16px 20px">
      <h3 style="font-size:14px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">🎯 What to revise next</h3>
      ${dueHTML}${weakHTML}
    </div>`;
}

function renderSectionTiles() {
  const container = el('section-tiles');
  const sections = sectionList();

  container.innerHTML = sections.map(s => {
    const prog = sectionProgress(s.letter);
    const tier = sectionTierClass(s.letter);
    const col = sectionColour(s.letter);
    return `
      <div role="button" tabindex="0" class="section-tile" onclick="navigate('sections', {section:'${s.letter}'})">
        <div class="tile-accent" style="background:${col}"></div>
        <div class="tile-code" style="color:${col}">${s.letter}</div>
        <div class="badge ${tier}" style="margin-bottom:6px">${tier === 'tier1' ? 'Tier 1' : tier === 'tier2' ? 'Tier 2' : 'Tier 3'}</div>
        <h3>${s.name}</h3>
        <p>${s.topics}</p>
        <div class="tile-progress"><div class="tile-progress-bar" data-target="${prog}" style="width:0%;background:${col};transition:width 0.6s ease-out"></div></div>
        <div style="font-size:12px;color:var(--text2);margin-top:4px">${prog}% confident</div>
      </div>`;
  }).join('');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    container.querySelectorAll('.tile-progress-bar[data-target]').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  }));
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
  const sections = sectionList();
  container.innerHTML = `
    <h2 style="margin-bottom:16px">Sections</h2>
    <div class="grid2">
      ${sections.map(s => `
        <div role="button" tabindex="0" class="section-tile" onclick="navigate('sections',{section:'${s.letter}'})">
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
      <span class="badge ${sectionTierClass(letter)}">${sectionTierClass(letter) === 'tier1' ? 'Tier 1' : 'Tier 2'}</span>
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
      <div role="button" tabindex="0" class="card-header" onclick="toggleCard('${item.code}')">
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
    el('flashcards-content').innerHTML = `<div class="empty-state"><p>Flashcard data loading...</p></div>`;
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
  const boxColors    = ['#B5443A', '#A85A3C', '#BE7A1C', '#3D7A4E', '#1B5A5F'];

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
        ${unitLettersUpper().map(l => `<option value="${l}" ${flashFilter === l ? 'selected' : ''}>${l}</option>`).join('')}
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
    <div role="button" tabindex="0" class="flashcard-scene" onclick="flipFlashcard()" id="flash-scene">
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
  const sections = ['all'].concat(unitLettersUpper());
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
  restoreExtDrafts();
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
      <div role="button" tabindex="0" class="card-header" onclick="toggleCard('ext-${i}')">
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

/* renderExtended rebuilds the page from innerHTML on every visit, so the draft
   has to live outside the DOM. Kept in memory only — an exam answer is not
   something to silently persist to the student's browser storage. */
const extDrafts = {};

function updateWordCount(id) {
  const textarea = el('ext-text-' + id);
  const wc = el('wc-' + id);
  if (!textarea || !wc) return;
  extDrafts[id] = textarea.value;
  const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
  wc.textContent = words + ' words';
}

function restoreExtDrafts() {
  Object.keys(extDrafts).forEach(id => {
    const ta = el('ext-text-' + id);
    if (ta && !ta.value) { ta.value = extDrafts[id]; updateWordCount(id); }
  });
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
  { name: 'Gold',         icon: '🥇', col: '#BE7A1C', min: 750 },
  { name: 'Platinum',     icon: '💠', col: '#0E7490', min: 1500 },
  { name: 'Diamond',      icon: '💎', col: '#1B5A5F', min: 2500 },
  { name: 'Master',       icon: '🔮', col: '#A85A3C', min: 4000 },
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

/* ---- TRUE OR FALSE BLITZ ---- */
let tfState = null;

/* ---- FILL IN THE BLANK ---- */
let fitbState = null;

function buildFITBQuestions(count = 10) {
  // Built from spec items, which carry term + definition. Flashcards hold
  // question/answer pairs, so blanking a term out of those never matches.
  // Only ~9% of items repeat their term inside the definition, so where that
  // fails the blank stands in for the term itself rather than dropping the item.
  const pool = specItems().filter(i => i.term && i.definition);
  if (pool.length < 4) return [];

  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map(item => {
    const re = new RegExp(escapeRe(item.term), 'gi');
    const inline = re.test(item.definition);
    const blanked = inline
      ? item.definition.replace(new RegExp(escapeRe(item.term), 'gi'), '_____')
      : '_____ — ' + item.definition;
    // Distractors must be distinct from the answer AND from each other, or the
    // board shows two identical buttons and one correct answer scores wrong.
    const seen = new Set([item.term.toLowerCase()]);
    const distractors = [];
    for (const cand of pool.slice().sort(() => Math.random() - 0.5)) {
      const key = String(cand.term).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      distractors.push(cand.term);
      if (distractors.length === 3) break;
    }
    const options = [item.term, ...distractors].sort(() => Math.random() - 0.5);
    return { definition: blanked, answer: item.term, options, code: item.code };
  });
}

function startFITB() {
  stopGameTimers();
  const qs = buildFITBQuestions(10);
  if (!qs.length) { toast('No flashcard data loaded'); return; }
  fitbState = { qs, idx: 0, correct: 0, selected: null, answered: false };
  gamesMode = 'fitb';
  renderGames();
}

function renderFITB(container) {
  if (!fitbState) return;
  const q = fitbState.qs[fitbState.idx];
  const total = fitbState.qs.length;

  container.innerHTML = `
    <div class="quiz-wrap" style="max-width:620px">
      <div class="quiz-progress" style="margin-bottom:16px">
        <span>✏️ Fill in the Blank · ${fitbState.idx + 1}/${total}</span>
        <div class="bar"><div class="bar-fill" style="width:${(fitbState.idx / total) * 100}%"></div></div>
        <button class="btn btn-secondary btn-sm" onclick="gamesMode=null;fitbState=null;renderGames()">Quit</button>
      </div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:8px">${q.code}</p>
      <div class="card" style="padding:24px;font-size:16px;line-height:1.7;margin-bottom:20px">
        ${q.definition}
      </div>
      <div class="grid2" style="gap:10px">
        ${q.options.map(opt => {
          let style = '';
          if (fitbState.answered) {
            if (opt === q.answer) style = 'background:var(--green);color:#fff;border-color:var(--green)';
            else if (opt === fitbState.selected) style = 'background:var(--red);color:#fff;border-color:var(--red)';
          }
          return `<button class="btn btn-secondary" style="padding:14px;font-size:15px;${style}" onclick="answerFITB('${opt.replace(/'/g,"\\'")}') " ${fitbState.answered ? 'disabled' : ''}>${opt}</button>`;
        }).join('')}
      </div>
      ${fitbState.answered ? `
        <div style="text-align:center;margin-top:16px">
          <p style="color:var(--text2);margin-bottom:10px">${fitbState.selected === q.answer ? '✅ Correct!' : `❌ The answer was: <strong>${q.answer}</strong>`}</p>
          <button class="btn btn-primary" onclick="fitbNext()">Next →</button>
        </div>` : ''}
    </div>`;
}

function answerFITB(selected) {
  if (!fitbState || fitbState.answered) return;
  fitbState.selected = selected;
  fitbState.answered = true;
  if (selected === fitbState.qs[fitbState.idx].answer) fitbState.correct++;
  renderGames();
}

function fitbNext() {
  if (!fitbState) return;
  fitbState.idx++;
  fitbState.answered = false;
  fitbState.selected = null;
  if (fitbState.idx >= fitbState.qs.length) {
    endFITB();
  } else {
    renderGames();
  }
}

function endFITB() {
  if (!fitbState) return;
  const { correct, qs } = fitbState;
  const xpEarned = correct * 8;
  state.xp = (state.xp || 0) + xpEarned;
  state.questions.fitb_history = state.questions.fitb_history || [];
  state.questions.fitb_history.push({ correct, total: qs.length, date: today() });
  bumpActivity(correct);
  saveState();

  gamesMode = 'menu';
  fitbState = null;
  const container = el('games-content');
  container.innerHTML = `
    <div class="quiz-wrap" style="max-width:480px;text-align:center">
      <h2 style="margin-bottom:8px">Round complete!</h2>
      <p style="font-size:24px;font-weight:700;margin-bottom:4px">${correct} / ${qs.length} correct</p>
      <p style="color:var(--text2);margin-bottom:16px">+${xpEarned} XP earned</p>
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="btn btn-primary" onclick="startFITB()">Play again</button>
        <button class="btn btn-secondary" onclick="renderGames()">Back to games</button>
      </div>
    </div>`;
}

function buildTFQuestions() {
  // Spec items carry term + definition; flashcards hold question/answer pairs.
  const items = specItems().filter(i => i.term && i.definition);
  if (items.length < 4) return [];
  const qs = [];

  items.forEach((item, i) => {
    // True statement: real definition
    qs.push({ statement: `"${item.term}" — ${item.definition}`, answer: true, term: item.term });

    // False statement: correct term, wrong definition. Two traps here.
    // 1. The decoy must not share this item's term — Unit 1 repeats 17 terms,
    //    and a term paired with another definition of itself reads as TRUE.
    // 2. It must not simply be the next item. Breaking on the first candidate
    //    made every decoy items[i+1], which is a sibling in the same subtopic
    //    75% of the time — the most semantically overlapping content there is
    //    ("Survey" paired with Questionnaire's "Similar to a survey…" reads as
    //    true) — and made the whole round identical on every play.
    const sub = c => String(c).split('.').slice(0, 2).join('.');
    // Exact inequality is not enough: Unit 1 restates the same factor under a
    // longer name in another section, so "Compatibility" would draw the
    // definition of "Hardware and Software Compatibility" — a true statement
    // keyed false. Reject any term that contains, or is contained by, this one.
    const norm = t => String(t).toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    const mine = norm(item.term);
    const overlaps = t => {
      const o = norm(t);
      return o === mine || o.includes(mine) || mine.includes(o);
    };
    const valid = items.filter(c =>
      !overlaps(c.term) && c.definition !== item.definition);
    const distant = valid.filter(c => sub(c.code) !== sub(item.code));
    const pool = distant.length ? distant : valid;
    const other = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    if (other) {
      qs.push({ statement: `"${item.term}" — ${other.definition}`, answer: false, term: item.term });
    }
  });

  // Shuffle
  for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [qs[i], qs[j]] = [qs[j], qs[i]];
  }
  return qs;
}

function startTrueFalse() {
  // Starting a second round without this leaks the first interval: tfState is
  // reassigned, the old timer keeps firing, and it throws once tfState is null.
  stopGameTimers();
  const qs = buildTFQuestions();
  if (!qs.length) { toast('No revision content loaded for this unit'); return; }
  tfState = { qs, idx: 0, correct: 0, total: 0, timeLeft: 30, timer: null };
  gamesMode = 'tf';
  renderGames();
  const timer = setInterval(() => {
    if (!tfState || tfState.timer !== timer) { clearInterval(timer); return; }
    tfState.timeLeft--;
    const bar = el('tf-timer-bar');
    if (bar) bar.style.width = (tfState.timeLeft / 30 * 100) + '%';
    const label = el('tf-timer-label');
    if (label) label.textContent = tfState.timeLeft + 's';
    if (tfState.timeLeft <= 0) endTrueFalse();
  }, 1000);
  tfState.timer = timer;
}

function renderTrueFalse(container) {
  if (!tfState) return;
  const q = tfState.qs[tfState.idx];
  container.innerHTML = `
    <div class="quiz-wrap" style="max-width:600px">
      <div class="quiz-progress" style="margin-bottom:16px">
        <span>✅ True or False Blitz · <strong id="tf-timer-label">${tfState.timeLeft}s</strong></span>
        <div class="bar"><div class="bar-fill" id="tf-timer-bar" style="width:${tfState.timeLeft / 30 * 100}%;background:var(--green)"></div></div>
        <button class="btn btn-secondary btn-sm" onclick="endTrueFalse()">Quit</button>
      </div>
      <div class="card" style="text-align:center;padding:28px 24px;margin-bottom:20px;font-size:17px;line-height:1.6">
        ${q ? q.statement : ''}
      </div>
      <div style="display:flex;gap:12px">
        <button class="btn btn-primary" style="flex:1;padding:18px;font-size:18px;background:var(--green)" onclick="answerTF(true)" id="tf-true-btn">✅ True</button>
        <button class="btn btn-primary" style="flex:1;padding:18px;font-size:18px;background:var(--red)" onclick="answerTF(false)" id="tf-false-btn">❌ False</button>
      </div>
      <p style="text-align:center;color:var(--text2);font-size:13px;margin-top:12px">Keyboard: ← False · True →</p>
      <p style="text-align:center;color:var(--text2);font-size:13px;margin-top:4px">Score: ${tfState.correct}/${tfState.total}</p>
    </div>`;
}

function answerTF(answer) {
  if (!tfState || tfState.timeLeft <= 0) return;
  const q = tfState.qs[tfState.idx];
  const correct = q.answer === answer;
  if (correct) tfState.correct++;
  tfState.total++;
  tfState.idx = (tfState.idx + 1) % tfState.qs.length;

  // Brief visual feedback
  const btn = el(answer ? 'tf-true-btn' : 'tf-false-btn');
  if (btn) {
    btn.style.opacity = '0.5';
    setTimeout(() => { if (btn) btn.style.opacity = ''; }, 150);
  }

  renderGames();
}

function endTrueFalse() {
  if (!tfState) return;
  clearInterval(tfState.timer);
  const { correct, total } = tfState;
  const xpEarned = correct * 5;
  state.xp = (state.xp || 0) + xpEarned;
  bumpActivity(correct);

  if (correct > getBest('tf')) setBest('tf', correct);

  saveState();
  gamesMode = 'menu';
  tfState = null;

  const container = el('games-content');
  container.innerHTML = `
    <div class="quiz-wrap" style="max-width:480px;text-align:center">
      <h2 style="margin-bottom:8px">Blitz over!</h2>
      <p style="font-size:24px;font-weight:700;margin-bottom:4px">${correct} / ${total} correct</p>
      <p style="color:var(--text2);margin-bottom:16px">+${xpEarned} XP earned</p>
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="btn btn-primary" onclick="startTrueFalse()">Play again</button>
        <button class="btn btn-secondary" onclick="gamesMode=null;renderGames()">Back to games</button>
      </div>
    </div>`;
}

function renderGames() {
  const container = el('games-content');
  if (gamesMode === 'mcq') { renderMCQ(container); return; }
  if (gamesMode === 'match') { renderMatch(container); return; }
  if (gamesMode === 'tf') { renderTrueFalse(container); return; }
  if (gamesMode === 'fitb') { renderFITB(container); return; }
  if (gamesMode === 'battle' && battle) { renderBattleUI(container); return; }

  const best = getBest('match') || null;
  const tfBest = getBest('tf') || null;
  container.innerHTML = `
    <h2 style="margin-bottom:6px">Games</h2>
    <p style="color:var(--text2);font-size:14px;margin-bottom:18px">Active recall, but fun. Earn XP for every game — you're Level ${xpLevel()} with ${state.xp || 0} XP.</p>
    <div class="grid2">
      <div role="button" tabindex="0" class="section-tile" onclick="startMCQ()">
        <div class="tile-accent" style="background:var(--accent)"></div>
        <div class="tile-code">⚡</div>
        <h3>Quick-fire MCQ</h3>
        <p>10 multiple-choice questions generated from your flashcards. +10 XP per correct answer.</p>
      </div>
      <div role="button" tabindex="0" class="section-tile" onclick="startMatch()">
        <div class="tile-accent" style="background:var(--pink)"></div>
        <div class="tile-code">🧩</div>
        <h3>Match</h3>
        <p>Pair terms with definitions against the clock. +30 XP per clear.${best ? ` Best time: <strong>${best}s</strong>` : ''}</p>
      </div>
      <div role="button" tabindex="0" class="section-tile" onclick="startTrueFalse()">
        <div class="tile-accent" style="background:var(--green)"></div>
        <div class="tile-code">✅</div>
        <h3>True or False Blitz</h3>
        <p>30 seconds. Rapid-fire true/false statements from your flashcards. +5 XP per correct.${tfBest ? ` Best: <strong>${tfBest}</strong>` : ''}</p>
      </div>
      <div role="button" tabindex="0" class="section-tile" onclick="startFITB()">
        <div class="tile-accent" style="background:var(--accent2)"></div>
        <div class="tile-code">✏️</div>
        <h3>Fill in the Blank</h3>
        <p>A definition with the key term removed — pick the right answer from 4 options. +8 XP per correct.</p>
      </div>
    </div>
    <h3 style="margin:24px 0 12px;font-size:14px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px">⚔️ Battle arena — vs the leaderboard</h3>
    <div class="grid2">
      ${Object.entries(BATTLE_MODES).map(([key, m]) => `
        <div role="button" tabindex="0" class="section-tile" onclick="startBattle('${key}')">
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
  { name: 'itzKayden08',        tag: 'Revision machine',  base: 120, rate: 38, col: '#1B5A5F' },
  { name: 'maddie.exe',         tag: 'Forensics nerd',    base: 90,  rate: 31, col: '#A85A3C' },
  { name: 'TTV_R3eceplays',     tag: 'Flashcard grinder (live)', base: 60, rate: 26, col: '#3D7A4E' },
  { name: 'xX_Sn1per_Lukas_Xx', tag: 'Revises at 11pm the night before', base: 10, rate: 9, col: '#BE7A1C' },
  { name: 'notlivvy',           tag: '9-mark specialist', base: 80,  rate: 22, col: '#4A5E8C' },
  { name: 'ZayanFN_09',         tag: 'Match game demon',  base: 40,  rate: 17, col: '#B5443A' },
  { name: 'sleepyell1e',        tag: 'Quietly cooking',   base: 30,  rate: 13, col: '#0E7490' },
  /* — Silver/Gold — */
  { name: 'big_curtis_W',       tag: 'Streak protector',  base: 320, rate: 12, col: '#64748B' },
  { name: 'aliyah.studies',     tag: 'Notion aesthetic queen', base: 380, rate: 15, col: '#A85A3C' },
  { name: 'lowkeyjordan',       tag: 'Says he doesn\'t revise. Lies.', base: 700, rate: 14, col: '#3D7A4E' },
  { name: 'p1xelpatel',         tag: 'MCQ speedrunner',   base: 820, rate: 16, col: '#1B5A5F' },
  { name: 'erinhasnoexams',     tag: 'Ironic username',   base: 900, rate: 11, col: '#BE7A1C' },
  /* — Silver/Gold (more) — */
  { name: 'jxck_billings',      tag: 'Group chat admin',  base: 420, rate: 14, col: '#3D7A4E' },
  { name: 'freyah2009',         tag: 'Colour-coded notes', base: 540, rate: 13, col: '#4A5E8C' },
  { name: 'OllieW_main',        tag: '"It\'s my second account"', base: 610, rate: 12, col: '#0E7490' },
  { name: 'ria.revises',        tag: 'Username says it all', base: 1050, rate: 14, col: '#A85A3C' },
  { name: 'capybara_ben',       tag: 'Here for the games', base: 1150, rate: 10, col: '#BE7A1C' },
  { name: 'WhoIsTyler_',        tag: 'Mysterious grinder', base: 1300, rate: 13, col: '#44403C' },
  /* — Platinum — */
  { name: 'DefNotArchie',       tag: 'Plat and proud',    base: 1550, rate: 13, col: '#0E7490' },
  { name: 'emsy_x',             tag: 'Past paper warlord', base: 1700, rate: 15, col: '#4A5E8C' },
  { name: 'voidwxlker',         tag: 'Revises in dark mode only', base: 1950, rate: 12, col: '#44403C' },
  { name: 'sadiq.studies',      tag: 'Library resident',  base: 1820, rate: 14, col: '#3D7A4E' },
  { name: 'gracie_mxy',         tag: 'Flashcards at the bus stop', base: 2100, rate: 11, col: '#A85A3C' },
  { name: 'L0gan_idk',          tag: 'Accidentally good at this', base: 2250, rate: 12, col: '#BE7A1C' },
  /* — Diamond — */
  { name: 'hazza.dnf',          tag: 'Diamond gatekeeper', base: 2600, rate: 11, col: '#1B5A5F' },
  { name: 'k1ngmarcus',         tag: 'Self-proclaimed GOAT', base: 3100, rate: 13, col: '#B5443A' },
  { name: 'evieplays_x',        tag: 'Duels anyone who asks', base: 2800, rate: 12, col: '#A85A3C' },
  { name: 'thearchitect_jay',   tag: 'Mind palace user (allegedly)', base: 3300, rate: 11, col: '#0E7490' },
  { name: 'n0tmichelle',        tag: 'Diamond and climbing', base: 3600, rate: 13, col: '#4A5E8C' },
  /* — Master — */
  { name: 'taraxo_07',          tag: 'Carried the group project', base: 4200, rate: 10, col: '#A85A3C' },
  { name: 'GlazedDonut_Finn',   tag: 'Nobody knows his real name', base: 4800, rate: 12, col: '#BE7A1C' },
  { name: 'silentcarter_',      tag: 'Never speaks. Always wins.', base: 4500, rate: 11, col: '#44403C' },
  { name: 'amara.aces',         tag: 'Mock exam merchant', base: 5200, rate: 10, col: '#1B5A5F' },
  /* — Cyber Legend — */
  { name: 'cleanest_ahmxd',     tag: 'Finished the spec in March', base: 6300, rate: 8, col: '#44403C' },
  { name: 'prodigy_wren',       tag: 'Teachers ask HER for help', base: 6800, rate: 9, col: '#A85A3C' },
  { name: 'xue_2008',           tag: 'The final boss',    base: 7400, rate: 7, col: '#1B5A5F' }
];

function botXP(bot, daysAgo = 0) {
  const days = Math.max(0, Math.floor((Date.now() - LB_EPOCH) / 86400000) - daysAgo);
  // deterministic daily jitter so bots don't grow in a perfectly straight line —
  // and so they genuinely overtake each other from one day to the next
  let h = 0;
  for (const ch of bot.name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const jitter = ((days * h) % 17) - 8;
  return Math.max(0, bot.base + bot.rate * days + jitter);
}

function nameHash(name, mod = 9973) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % mod;
  return h;
}

function getLBRows(daysAgo = 0) {
  const rows = LB_BOTS.map(b => ({ name: b.name, tag: b.tag, col: b.col, xp: botXP(b, daysAgo), me: false }));
  rows.push({ name: 'You', tag: `Level ${xpLevel()}`, col: pCol(), xp: state.xp || 0, me: true });
  rows.sort((a, b) => b.xp - a.xp);
  rows.forEach((r, i) => { r.pos = i + 1; });
  return rows;
}

/* position change vs yesterday: positive = climbed */
function lbMovementMap() {
  const yesterday = {};
  getLBRows(1).forEach(r => { yesterday[r.name] = r.pos; });
  const m = {};
  getLBRows().forEach(r => { m[r.name] = (yesterday[r.name] || r.pos) - r.pos; });
  return m;
}

function lbMoveHTML(delta) {
  if (delta > 0) return `<span class="lb-move up">▲${delta}</span>`;
  if (delta < 0) return `<span class="lb-move down">▼${-delta}</span>`;
  return `<span class="lb-move flat">·</span>`;
}

const LB_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

function lbRowHTML(r, moveMap) {
  const delta = moveMap ? (moveMap[r.name] || 0) : 0;
  return `
    <div role="button" tabindex="0" class="lb-row${r.me ? ' me' : ''} clickable" onclick="${r.me ? "navigate('profile')" : `showPlayerCard('${r.name}')`}" title="${r.me ? 'View your profile' : 'View player'}">
      <span class="lb-rank">${LB_MEDALS[r.pos] || '#' + r.pos}</span>
      ${lbMoveHTML(delta)}
      <span class="lb-av" style="background:${r.col}">${r.me ? meAvInner() : r.name.charAt(0)}</span>
      <span class="lb-name">${r.name}${r.me ? ' <span class="lb-you">(you)</span>' : ''}<span class="lb-tag">${r.tag}</span></span>
      ${rankChip(r.xp)}
      <span class="lb-xp">${r.xp.toLocaleString()} XP</span>
    </div>`;
}

/* "Today on the ladder" — real overtakes + rank-ups, padded with flavour */
function ladderFeedHTML() {
  const move = lbMovementMap();
  const events = [];

  LB_BOTS.forEach(b => {
    const rNow = rankFor(botXP(b)), rPrev = rankFor(botXP(b, 1));
    if (rNow.name !== rPrev.name && rNow.min > rPrev.min) {
      events.push(`${rNow.icon} <strong>${b.name}</strong> reached ${rNow.name}`);
    }
  });

  const movers = Object.entries(move)
    .filter(([n, d]) => n !== 'You' && d !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3);
  movers.forEach(([n, d]) => {
    events.push(d > 0
      ? `▲ <strong>${n}</strong> climbed ${d} place${d !== 1 ? 's' : ''} overnight`
      : `▼ <strong>${n}</strong> dropped ${-d} place${d !== -1 ? 's' : ''}`);
  });

  const myMove = move['You'] || 0;
  if (myMove > 0) events.unshift(`<strong>You</strong> climbed ${myMove} place${myMove !== 1 ? 's' : ''} — keep going`);
  if (myMove < 0) events.unshift(`⚠️ <strong>You</strong> slipped ${-myMove} place${myMove !== -1 ? 's' : ''} — the ladder doesn't wait`);

  // deterministic daily flavour
  const day = Math.floor(Date.now() / 86400000);
  const f1 = LB_BOTS[(day * 7) % LB_BOTS.length];
  const f2 = LB_BOTS[(day * 13 + 5) % LB_BOTS.length];
  events.push(`🧩 <strong>${f1.name}</strong> cleared Match in ${17 + ((day + nameHash(f1.name)) % 21)}s`);
  events.push(`⚡ <strong>${f2.name}</strong> scored ${10 + ((day + nameHash(f2.name)) % 12)} in a Blitz 60`);

  return `
    <div class="ladder-feed">
      <div class="ladder-feed-title">TODAY ON THE LADDER</div>
      ${events.slice(0, 5).map(e => `<div class="ladder-feed-row">${e}</div>`).join('')}
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
  const move = lbMovementMap();
  const i = rows.findIndex(r => r.me);
  const start = Math.max(0, Math.min(i - 3, rows.length - 7));
  const view = rows.slice(start, start + 7);

  return `
    <h3 style="margin:24px 0 4px;font-size:14px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px">🏁 Players near you</h3>
    <p style="color:var(--text2);font-size:13px;margin-bottom:12px">${lbMotivator(rows)}</p>
    <div class="lb-board">${view.map(r => lbRowHTML(r, move)).join('')}</div>
    <button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="navigate('leaderboard')">View full leaderboard →</button>`;
}

/* full view: every player, grouped by rank tier (used on the Leaderboard page) */
function renderLeaderboardByTier() {
  const rows = getLBRows();
  const move = lbMovementMap();
  const tiers = [...RANKS].reverse();

  return `
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
          <div class="lb-board">${members.map(r => lbRowHTML(r, move)).join('')}</div>
        </div>`;
    }).join('')}`;
}

/* -- MODE LEADERBOARDS — who's the best at each gamemode -- */
let lbView = 'overall';

const MODE_BOARD_META = {
  elim:  { label: 'Victories',  salt: 'E' },
  race:  { label: 'Wins',       salt: 'R' },
  duel:  { label: 'Wins',       salt: 'D' },
  blitz: { label: 'Best score', salt: 'B' }
};

function modeBoardRows(mode) {
  const rows = getLBRows();
  const days = Math.max(1, Math.floor((Date.now() - LB_EPOCH) / 86400000));
  const meta = MODE_BOARD_META[mode];

  const board = rows.filter(r => !r.me).map(r => {
    const skill = 1 - (r.pos - 1) / rows.length;
    const h = nameHash(r.name + meta.salt, 997);
    // per-mode flair: the salt reshuffles who excels where, so each board has its own champion
    const flair = (h % 100) / 100;
    let score;
    if (mode === 'blitz') score = Math.round(5 + skill * 9 + flair * 8);
    else score = Math.floor((1 + skill * 2 + flair * 1.6) * days / 3) + (h % 5);
    return { name: r.name, col: r.col, me: false, xp: r.xp, score };
  });

  const bm = (state.battles && state.battles.modes && state.battles.modes[mode]) || {};
  board.push({
    name: 'You', col: pCol(), me: true, xp: state.xp || 0,
    score: mode === 'blitz' ? (bm.best || 0) : (bm.won || 0)
  });
  board.sort((a, b) => b.score - a.score || b.xp - a.xp);
  board.forEach((r, i) => { r.pos = i + 1; });
  return board;
}

function setLbView(v) {
  lbView = v;
  renderLeaderboardPage();
}

function modeBoardHTML(mode) {
  const board = modeBoardRows(mode);
  const meta = MODE_BOARD_META[mode];
  const meRow = board.find(r => r.me);
  const top = board.slice(0, 10);
  const showMeBelow = meRow.pos > 10;

  const row = r => `
    <div role="button" tabindex="0" class="lb-row${r.me ? ' me' : ''}${r.me ? '' : ' clickable'}" ${r.me ? '' : `onclick="showPlayerCard('${r.name}')"`}>
      <span class="lb-rank">${r.pos === 1 ? '👑' : LB_MEDALS[r.pos] || '#' + r.pos}</span>
      <span class="lb-av" style="background:${r.col}">${r.me ? meAvInner() : r.name.charAt(0)}</span>
      <span class="lb-name">${r.name}${r.me ? ' <span class="lb-you">(you)</span>' : ''}</span>
      <span class="lb-xp">${r.score} ${meta.label.toLowerCase()}</span>
    </div>`;

  return `
    <p style="color:var(--text2);font-size:13px;margin-bottom:12px">${BATTLE_MODES[mode].icon} <strong>${BATTLE_MODES[mode].name}</strong> — ranked by ${meta.label.toLowerCase()}. ${meRow.pos === 1 ? 'You hold the crown. 👑' : `You're #${meRow.pos} of ${board.length}.`}</p>
    <div class="lb-board">
      ${top.map(row).join('')}
      ${showMeBelow ? `<div class="lb-gap">···</div>${row(meRow)}` : ''}
    </div>`;
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
  const isOverall = lbView === 'overall';

  el('leaderboard-content').innerHTML = `
    <h2 style="margin-bottom:6px">Leaderboard</h2>
    <p style="color:var(--text2);font-size:14px;margin-bottom:14px">Earn XP from flashcards, games and quizzes to climb. Rivals revise daily — fall behind and they'll pass you.</p>
    <div class="tabs" style="max-width:680px">
      <button class="tab-btn ${isOverall ? 'active' : ''}" onclick="setLbView('overall')">🏁 Overall</button>
      ${Object.keys(MODE_BOARD_META).map(m => `
        <button class="tab-btn ${lbView === m ? 'active' : ''}" onclick="setLbView('${m}')">${BATTLE_MODES[m].icon} ${BATTLE_MODES[m].name}</button>`).join('')}
    </div>
    ${isOverall ? `
      <p style="color:var(--text2);font-size:13px;margin-bottom:12px">${lbMotivator(getLBRows())}</p>
      ${ladderFeedHTML()}
      ${renderRankLadder()}
      ${renderLeaderboardByTier()}
    ` : modeBoardHTML(lbView)}
    <div style="margin-top:18px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="navigate('games')">⚡ Earn XP in Games</button>
      <button class="btn btn-secondary" onclick="navigate('flashcards')">Review flashcards</button>
    </div>`;
}

/* -- Quick-fire MCQ -- */
function startMCQ() {
  stopGameTimers();
  const cards = flashcardsForUnit();
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
  stopGameTimers();
  if (!searchBuilt) { loadData(unitLetters()); buildSearchIndex(); }
  const pool = allSearchContent.filter(x => x.definition && x.definition.length > 20);
  // Unit 1 repeats terms across items; two identical term tiles make the visible
  // pairing ambiguous and score a correct match as wrong.
  const usedTerms = new Set();
  const pairs = [];
  for (const cand of [...pool].sort(() => Math.random() - 0.5)) {
    const key = String(cand.term).toLowerCase();
    if (usedTerms.has(key)) continue;
    usedTerms.add(key);
    pairs.push(cand);
    if (pairs.length === 6) break;
  }
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
  const best = getBest('match');
  const isBest = !best || secs < best;
  if (isBest) setBest('match', secs);
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

/* -- PLAYER CARD — click any rival on the ladder -- */
function showPlayerCard(name) {
  const rows = getLBRows();
  const r = rows.find(x => x.name === name);
  const bot = LB_BOTS.find(b => b.name === name);
  if (!r || !bot) return;

  const move = lbMovementMap()[name] || 0;
  const h = nameHash(name);
  const winRate = 38 + (h % 48);
  const played = 14 + (h % 88);
  const favMode = ['Elimination', 'Race to 10', 'Duel', 'Blitz 60'][h % 4];
  const daysIn = Math.max(1, Math.floor((Date.now() - LB_EPOCH) / 86400000));
  const meXp = state.xp || 0;
  const gap = r.xp - meXp;

  el('player-modal').innerHTML = `
    <button class="modal-close" onclick="closePlayerCard()">✕</button>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
      <span class="lb-av" style="background:${r.col};width:56px;height:56px;font-size:24px">${name.charAt(0)}</span>
      <div>
        <h2 style="margin-bottom:2px;font-size:20px">${name}</h2>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          ${rankChip(r.xp)}
          <span class="badge">#${r.pos} of ${rows.length}</span>
          ${lbMoveHTML(move)}
        </div>
      </div>
    </div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:14px;font-style:italic">"${r.tag}"</p>
    <div class="stats-row" style="margin-bottom:16px">
      <div class="stat-box"><div class="num" style="font-size:22px">${r.xp.toLocaleString()}</div><div class="lbl">XP</div></div>
      <div class="stat-box"><div class="num" style="font-size:22px">${winRate}%</div><div class="lbl">Win rate</div></div>
      <div class="stat-box"><div class="num" style="font-size:22px">${played}</div><div class="lbl">Battles</div></div>
    </div>
    <p style="font-size:12.5px;color:var(--text2);margin-bottom:16px">Favourite mode: <strong>${favMode}</strong> · On the ladder ${daysIn} days · ${
      gap > 0 ? `<strong>${gap.toLocaleString()} XP ahead of you</strong>` : gap < 0 ? `<strong>${(-gap).toLocaleString()} XP behind you</strong>` : 'dead level with you'
    }</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="closePlayerCard();challengePlayer('${name}')">🤺 Challenge to Duel</button>
      <button class="btn btn-secondary" onclick="closePlayerCard()">Close</button>
    </div>`;
  el('player-modal-overlay').classList.add('show');
}

function closePlayerCard() {
  el('player-modal-overlay').classList.remove('show');
}

function challengePlayer(name) {
  navigate('games');
  startBattle('duel', name);
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
  if (!searchBuilt) { loadData(unitLetters()); buildSearchIndex(); }
  const pool = allSearchContent.filter(x => x.definition && x.definition.length > 20);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, n).map(p => {
    const wrong = pool.filter(x => x.term !== p.term).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.term);
    const opts = [...wrong, p.term].sort(() => Math.random() - 0.5);
    return { prompt: p.definition.length > 130 ? p.definition.substring(0, 130) + '…' : p.definition, answer: p.term, opts, code: p.code };
  });
}

function pickOpponents(k, directlyAbove, targetName) {
  const rows = getLBRows();
  const me = rows.find(r => r.me);
  const others = rows.filter(r => !r.me);
  others.forEach(o => { o.skill = 1 - (o.pos - 1) / rows.length; });

  // targeted challenge (from a player card)
  if (targetName) {
    const target = others.find(o => o.name === targetName);
    if (target) return [target];
  }
  if (directlyAbove) {
    const above = others.filter(o => o.xp >= me.xp).sort((a, b) => a.xp - b.xp);
    return [above[0] || others.sort((a, b) => b.xp - a.xp)[0]];
  }

  // matchmaking: weighted draw — your own tier pulls hardest, adjacent tiers are
  // common, and a small floor keeps every rank possible (rare cross-rank lobbies)
  const myTier = rankFor(me.xp).idx;
  const pool = others.map(o => ({
    o,
    w: 1 / (1 + Math.pow(Math.abs(rankFor(o.xp).idx - myTier), 2) * 3) + 0.04
  }));

  const picks = [];
  while (picks.length < k && pool.length) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = Math.random() * total;
    let i = 0;
    while (i < pool.length - 1 && (r -= pool[i].w) > 0) i++;
    picks.push(pool[i].o);
    pool.splice(i, 1);
  }
  return picks;
}

function botAnswer(skill) {
  return {
    ok: Math.random() < 0.48 + 0.42 * skill,
    time: +(1.4 + (1 - skill) * 5 + Math.random() * 2.8).toFixed(1)
  };
}

function stopBattleTick() { if (battleTick) { clearInterval(battleTick); battleTick = null; } }

function startBattle(mode, targetName) {
  stopGameTimers();
  stopBattleTick();
  const oppCount = mode === 'elim' ? 7 : mode === 'duel' ? 1 : 3;
  const opps = pickOpponents(oppCount, mode === 'duel' && !targetName, targetName);
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
          <span>${r.p.me ? 'You' : r.p.name}</span>
          <span style="color:${r.ok ? 'var(--green-text)' : 'var(--red)'};font-weight:800">${r.ok ? '✓' : '✗'} ${r.time}s${!r.p.alive && battle.mode === 'elim' ? ' [out]' : ''}</span>
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
    headline = won ? `You won the ${BATTLE_MODES[battle.mode].name}!` : `You placed #${place} of ${battle.players.length} — ${standings[0].name} took it.`;
  }
  battle.standings = standings;
  battle.xpEarned = xp;
  battle.headline = headline;
  if (!state.battles) state.battles = { played: 0, won: 0, modes: {} };
  if (!state.battles.modes) state.battles.modes = {};
  const bm = state.battles.modes[battle.mode] || (state.battles.modes[battle.mode] = { played: 0, won: 0, best: 0 });
  state.battles.played++;
  bm.played++;
  if (standings[0] === me) { state.battles.won++; bm.won++; }
  if (battle.mode === 'blitz') bm.best = Math.max(bm.best || 0, me.score);
  if (xp > 0) awardXP(xp, true);
  else saveState();
}

function renderBattleEnd(container) {
  const medals = ['🥇', '🥈', '🥉'];
  container.innerHTML = `
    <div class="quiz-wrap" style="max-width:680px">
      <div style="text-align:center;padding:18px 0 6px">
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

function getAchievements() {
  const act = state.activity || {};
  const totalActs = Object.values(act).reduce((a, b) => a + b, 0);
  const rc = ragCounts();
  const mastered = Object.values(state.flashcards.boxes || {}).filter(b => b === 5).length;
  const best = getBest('match');
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

function buildSparklineSVG(data, width = 200, height = 40) {
  if (!data.length) return '<span style="color:var(--text2);font-size:12px">No data yet</span>';
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(' ');
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display:block">
    <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${data.length > 1 ? width : width/2}" cy="${height - (data[data.length-1]/max)*height}" r="3" fill="var(--accent)"/>
  </svg>`;
}

function renderProfile() {
  loadData(unitLetters());
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

  const xpByDay = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    xpByDay.push(act[d.toISOString().split('T')[0]] || 0);
  }

  const qHist = state.questions.history;
  const recent = qHist.slice(-10);
  const avgScore = recent.length ? Math.round(recent.reduce((a, h) => a + h.selfScore, 0) / recent.length) : null;
  const mastered = Object.values(state.flashcards.boxes || {}).filter(b => b === 5).length;
  const best = getBest('match') || null;
  const battles = state.battles || { played: 0, won: 0 };
  const ach = getAchievements();
  const unlocked = ach.filter(a => a.done).length;

  const AV_EMOJIS = ['⭐', '🔥', '🧠', '👾', '💀', '🦊', '🐸', '🐱', '🐼', '🦈', '🚀', '🎯', '👑', '💎', '🌙', '⚡'];
  const AV_COLS = ['#A85A3C', '#1B5A5F', '#3D7A4E', '#BE7A1C', '#0E7490', '#B5443A', '#44403C', '#4A5E8C'];

  el('profile-content').innerHTML = `
    <div class="card profile-head">
      <button class="lb-av profile-av" style="background:${pCol()}" onclick="toggleAvatarPicker()" title="Customise your avatar">${meAvInner()}</button>
      <div style="flex:1">
        <h2 style="margin-bottom:2px">You</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          ${rankChip(xp)}
          <span class="badge">Level ${xpLevel()}</span>
          <span class="badge">#${me.pos} of ${rows.length}</span>
          <span class="badge">${state.streak.count}-day streak</span>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-family:'Fraunces',Georgia,serif;font-size:28px;font-weight:600;color:var(--accent2)">${xp.toLocaleString()}</div>
        <div style="font-size:11px;color:var(--text2);font-weight:700">TOTAL XP</div>
      </div>
    </div>

    <div class="card${avatarPickerOpen ? '' : ' hidden'}" id="avatar-picker">
      <h3 style="margin-bottom:10px">Customise your avatar</h3>
      <p style="font-size:12px;color:var(--text2);margin-bottom:8px;font-weight:700">YOUR PHOTO</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px">
        <button class="btn btn-primary btn-sm" onclick="uploadAvatar()">Upload a picture</button>
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
      <h3 style="margin-bottom:4px">Activity</h3>
      <p style="font-size:13px;color:var(--text2);margin-bottom:12px">${totalActs.toLocaleString()} revision actions all-time · ${last7} in the last 7 days</p>
      <div id="profile-heatmap"></div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <h3 style="font-size:13px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Activity — last 14 days</h3>
      ${buildSparklineSVG(xpByDay, 280, 48)}
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
      <h3 style="margin-bottom:10px">Achievements <span style="font-size:13px;color:var(--text2);font-weight:600">${unlocked}/${ach.length} unlocked</span></h3>
      <div class="ach-grid">
        ${ach.map(a => `
          <div class="ach${a.done ? ' done' : ''}" title="${a.desc}">
            <span class="ach-icon">${a.done ? a.icon : '🔒'}</span>
            <span class="ach-name">${a.name}</span>
            <span class="ach-desc">${a.desc}</span>
          </div>`).join('')}
      </div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <h3 style="font-size:13px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">⚙️ Settings</h3>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:14px;font-weight:500">Dark mode</span>
        <button class="theme-toggle btn btn-secondary btn-sm" onclick="toggleTheme()">
          ${state.theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
        </button>
      </div>
    </div>`;
  renderProfileHeatmap();
}

let avatarPickerOpen = false;

function toggleAvatarPicker() {
  avatarPickerOpen = !avatarPickerOpen;
  const p = el('avatar-picker');
  if (p) p.classList.toggle('hidden', !avatarPickerOpen);
}

function setProfileAv(emoji, col) {
  if (!state.profile) state.profile = { emoji: '⭐', col: '#A85A3C' };
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

  const keywordBanks = unitDef().keywordBanks || [];

  container.innerHTML = `
    <h2 style="margin-bottom:6px">Exam Kit</h2>
    <p style="color:var(--text2);font-size:14px;margin-bottom:18px">Command words, mark-scheme patterns and rapid-recall keywords — the exam technique layer that turns knowledge into marks.</p>

    <div class="card">
      <h3 style="margin-bottom:10px">Command words decoder</h3>
      <div class="comparison-table-wrap"><table class="comparison-table">
        <thead><tr><th>Command word</th><th>Typical marks</th><th>What the examiner wants</th></tr></thead>
        <tbody>${commandWords.map(r => `<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:10px">The 9-mark formula (levels-based)</h3>
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
    loadData(unitLetters());
    buildSearchIndex();
  }
  const container = el('search-content');
  container.innerHTML = `
    <h2 style="margin-bottom:12px">Search</h2>
    <input type="search" class="search-bar" id="search-input" placeholder="Search spec codes, terms, definitions..." oninput="doSearch(this.value)" autofocus>
    <div id="search-results" class="search-results">
      <div class="empty-state"><p>Type to search across all content</p></div>
    </div>`;
}

function buildSearchIndex() {
  allSearchContent = [];
  unitLetters().forEach(s => {
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
    container.innerHTML = `<div class="empty-state"><p>Type to search across all content</p></div>`;
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
    <div role="button" tabindex="0" class="search-result" onclick="goToResult('${r.section}', '${r.code}')">
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
  loadData(unitLetters());
  const container = el('plan-content');
  const plan = buildDailyPlan();

  container.innerHTML = `
    <div class="plan-header">
      <h2>Today's Study Plan</h2>
      <div class="streak-badge">${state.streak.count}-day streak</div>
    </div>
    <p style="color:var(--text2);font-size:14px;margin-bottom:16px">${hasExamDate() && !examPassed() ? `${daysUntilExam()} days until your ${unitDef().label} exam. ` : ''}${getMotivation()}</p>
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
      title: `Flashcards (${flashDue} due)`,
      items: [`Review ${Math.min(flashDue, 20)} flashcards due today`, 'Focus extra on Box 1 cards (weakest)']
    });
  }

  // No date set, or the exam already sat: give the general plan, never "Final Week".
  const undated = !hasExamDate() || examPassed();

  if (undated || days > 14) {
    blocks.push({
      id: 'content',
      title: '📖 Content Review',
      items: [
        ...tier1Letters().slice(0, 2).map(L => `Work through Section ${L} (${sectionShortName(L)}) — ${sectionBlurb(L)}`),
        weakCodes.length ? `Revisit these red codes: ${weakCodes.join(', ')}` : 'Mark any uncertain codes as Amber or Red for tracking'
      ]
    });
  } else if (days > 7) {
    blocks.push({
      id: 'content',
      title: '📖 Focused Review',
      items: [
        'Complete any remaining Amber/Red codes',
        `Focus on Tier 1 topics: ${tier1Letters().map(L => `${L} (${sectionShortName(L)})`).join(', ')}`,
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
    title: 'Practice Questions',
    items: [
      'Answer 2–3 practice questions on your weakest topic',
      'Self-mark using the model answers',
      (days !== null && !examPassed() && days <= 14) ? 'Try at least 1 extended response (9–12 marks) per session' : 'Attempt a 4-mark "explain" question for any red-coded topic'
    ]
  });

  if (days !== null && !examPassed() && days <= 7) {
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
  if (days === null) return 'Set your exam date to get a countdown and a sharper daily plan.';
  if (examPassed()) return 'That exam has been and gone — set a new date, or switch unit from the sidebar.';
  if (days > 30) return 'Keep building your knowledge — consistency now makes the difference.';
  if (days > 14) return 'Final stretch! Focus on your weak areas and practise past paper questions.';
  if (days > 7) return 'One week to go — prioritise Tier 1 topics and exam technique.';
  if (days > 1) return 'Exam is almost here! Flashcards, key facts, extended response practice.';
  if (days === 1) return 'Exam is tomorrow! Rest, eat well, and trust your preparation.';
  return 'Exam is today. Skim your red topics, then go in calm — you have done the work.';
}

function renderRAGSummary() {
  const sections = unitLettersUpper();
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

/* Plan ticks live in the unit namespace — a Unit 1 plan must not tick Unit 2's. */
function getPlanCheck(key) {
  const todayStr = today();
  const checks = state.planChecks || {};
  return checks[todayStr] && checks[todayStr][key];
}

function savePlanCheck(key, val) {
  const todayStr = today();
  if (!state.planChecks) state.planChecks = {};
  if (!state.planChecks[todayStr]) state.planChecks[todayStr] = {};
  state.planChecks[todayStr][key] = val;
  saveState();
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
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `btec-revision-${today()}.json`;
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
        let message;
        if (isPlainObject(imported) && isPlainObject(imported.units)) {
          // A backup from this version: full store, both units.
          store = coerceStore(imported);
          message = 'Progress imported.';
        } else if (looksLikeLegacyBackup(imported)) {
          // A pre-merge backup: progress at the top level, no `units` key, and
          // nothing in it reliably says which unit it came from — the old site
          // only wrote examDate if the student edited it. So it goes into the
          // unit that is currently open, and the OTHER unit is left untouched.
          const target = store.activeUnit;
          if (!confirm(`This looks like a backup from the older site.\n\nImport it into ${unitDef(target).label} — ${unitDef(target).name}?\n\nYour other unit will not be affected. Switch unit first if this is the wrong one.`)) {
            toast('Import cancelled.');
            return;
          }
          store.units[target] = coerceUnit(imported);
          if (typeof imported.theme === 'string') store.theme = imported.theme;
          if (isPlainObject(imported.profile)) {
            store.profile = coerceLike(defaultStore().profile, imported.profile);
          }
          message = 'Imported into ' + unitDef(target).label + '.';
        } else {
          toast('Invalid file — import failed');
          return;
        }
        const saved = saveState();
        resetTransientState();
        document.body.setAttribute('data-theme', store.theme || 'light');
        applyUnitChrome();
        updateNavAvatar();
        navigate('home');
        // Do not claim success if the write failed — the restored progress
        // would silently revert on the next reload.
        if (saved) toast(message);
      } catch { toast('Invalid file — import failed'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

function confirmReset() {
  // Resets the unit you are looking at. With two units, wiping both from one
  // button is a trap: the other unit's work is not visible from here.
  const u = unitDef();
  if (confirm(`Reset all ${u.label} progress? This cannot be undone. Your other unit is not affected.`)) {
    store.units[store.activeUnit] = defaultUnitState();
    saveState();
    resetTransientState();
    toast(u.label + ' progress reset.');
    navigate('home');
  }
}

/* ---- INIT ---- */
/* Backdrops are dismiss targets, so they stay out of the tab order. Escape is
   the keyboard equivalent of clicking outside. */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const modal = el('player-modal-overlay');
  if (modal && modal.classList.contains('visible')) { closePlayerCard(); return; }
  if (sidebarOpen && window.innerWidth < 900) closeSidebar();
});

/* Anything given role="button" must also answer to Enter and Space, or it is
   only usable with a mouse. */
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
  const t = e.target;
  if (!t || t.getAttribute('role') !== 'button') return;
  if (t.tagName === 'BUTTON' || t.tagName === 'A') return;
  e.preventDefault();
  t.click();
});

/* The sidebar and its backdrop are driven by a 900px breakpoint; without this
   they desync when the window is resized across it. */
let resizeTick = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTick);
  resizeTick = setTimeout(() => { if (sidebarOpen !== null) applySidebarState(); }, 120);
});

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  document.querySelectorAll('.nav-btn, .nav-avatar').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });
  document.querySelectorAll('.unit-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => switchUnit(btn.dataset.unit));
  });
  applyUnitChrome();
  loadData(unitLetters());
  updateNavAvatar();
  navigate('home');
});

document.addEventListener('keydown', e => {
  if (gamesMode === 'tf') {
    if (e.key === 'ArrowRight' || e.key === 't' || e.key === 'T') { e.preventDefault(); answerTF(true); }
    if (e.key === 'ArrowLeft'  || e.key === 'f' || e.key === 'F') { e.preventDefault(); answerTF(false); }
  }
});

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
    examDate: null,
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
      history: [],     // {date, correct, wrong}
      newDay: { date: '', count: 0, extra: 0 }   // new cards introduced today
    },
    questions: {
      history: [],     // {qId, marks, date, selfScore}
      mocks: [],       // {paper, date, score, max, minutes}
      drafts: {},      // textarea id -> unmarked answer text
      activeMock: {}   // a paper being sat or marked, so a refresh can resume it
    },
    streak: { last: null, count: 0 },
    xp: 0,
    activity: {},      // 'YYYY-MM-DD' -> action count (feeds the heatmap)
    battles: { played: 0, won: 0, modes: {} },
    extended: {
      history: [],     // {type, wordCount, date, timeTaken}
      drafts: {}       // prompt id -> essay text, kept until the box is emptied
    },
    examDate: null,
    planChecks: {},
    bests: { tf: 0, match: 0 },
    season: { id: 0, startXP: 0 },   // XP banked before the current season began
    rankBest: 0                      // highest rank index ever held (achievements)
  };
}

function defaultStore() {
  return {
    activeUnit: 'u1',
    // First visit follows the device's light/dark setting; after that, the student's choice.
    theme: (typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light',
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
  // Drafts are a free-form map, so coerceLike keeps any value. Only text is a draft.
  [unit.questions.drafts, unit.extended.drafts].forEach(drafts => {
    Object.keys(drafts).forEach(k => { if (typeof drafts[k] !== 'string') delete drafts[k]; });
  });
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
  qMode = 'practice';
  qShow = 'all';
  qIdx = 0;
  qCurrentId = null;
  quizOpts.section = 'all';
  mock = null;
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
   They are only torn down on a unit switch, never on ordinary navigation.
   A unit switch discards the clock outright. Merely pausing it left a stale
   `remaining` behind while the page re-rendered from the prompt's full time, and
   Start jumped backwards. Drafts are per unit in saved state, so they survive. */
function stopExtendedTimers() {
  if (typeof extTimers === 'object' && extTimers) {
    Object.keys(extTimers).forEach(k => {
      const t = extTimers[k];
      if (t && t.interval) clearInterval(t.interval);
      delete extTimers[k];
    });
  }
}

function stopAllTimers() {
  stopGameTimers();
  stopExtendedTimers();
  stopMockTimer();
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
    battle = null;
  }
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  document.querySelectorAll('.sidebar-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });
  const titleEl = el('top-bar-title');
  if (titleEl) titleEl.textContent = PAGE_TITLES[page] || page;
  // scroll content to top on navigation
  scrollContentTop();
  renderPage(page, opts);
}

/* Page content scrolls inside <main>, not the window, so window.scrollTo() on
   its own does nothing. Reset both in case a layout ever scrolls the window. */
function scrollContentTop() {
  const mainEl = document.querySelector('main');
  if (mainEl) mainEl.scrollTop = 0;
  window.scrollTo(0, 0);
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

/* localStorage throws when storage is blocked. Everything else guards it, and an
   unguarded read here ran inside DOMContentLoaded and stopped the app starting. */
function lsGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function lsSet(key, val) { try { localStorage.setItem(key, val); } catch { /* not persisted */ } }

function initSidebar() {
  const saved = lsGet('rev_sidebar') ?? lsGet('u2_sidebar');
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
  lsSet('rev_sidebar', String(sidebarOpen));
  applySidebarState();
}

function closeSidebar() {
  sidebarOpen = false;
  lsSet('rev_sidebar', 'false');
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
  syncThemeButtons();
}

/* Run on load too: the top-bar button is static HTML and used to show 🌙
   "Switch to dark mode" after reloading in dark mode. The Profile button keeps
   its words; it used to be reduced to a bare emoji on toggle. */
function syncThemeButtons() {
  const dark = state.theme === 'dark';
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
    btn.title = label;
    btn.setAttribute('aria-label', label);
    btn.textContent = btn.classList.contains('top-bar-theme-btn')
      ? (dark ? '☀️' : '🌙')
      : (dark ? '☀️ Light mode' : '🌙 Dark mode');
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

/* A date input instead of prompt(): phones get their native date picker rather
   than a text box asking for YYYY-MM-DD. */
function setExamDate() {
  const u = unitDef();
  openModal(`
    <button class="modal-close" onclick="closeModal()" aria-label="Close">✕</button>
    <h2 id="modal-title">${u.label} exam date</h2>
    <label for="exam-date-input" style="display:block;font-size:13px;color:var(--text2);margin-bottom:6px">
      When do you sit ${u.label}: ${u.name}?</label>
    <input type="date" id="exam-date-input" class="search-bar" style="margin-bottom:14px" value="${escapeHTML(getExamDate() || '')}">
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="saveExamDate()">Save</button>
      ${state.examDate ? '<button class="btn btn-secondary" onclick="saveExamDate(true)">Clear date</button>' : ''}
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    </div>`);
  const input = el('exam-date-input');
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') saveExamDate(); });
}

function saveExamDate(clear) {
  if (clear) {
    state.examDate = null;
  } else {
    const v = (el('exam-date-input') || {}).value || '';
    // Must use the same validator the countdown uses. A looser check let
    // "2026-02-31" through: JS rolls it to 3 March, so it is not NaN.
    if (!parseExamDate(v)) { toast('Pick a valid date'); return; }
    state.examDate = v.trim();
  }
  saveState();
  closeModal();
  toast(clear ? 'Exam date cleared' : 'Exam date updated!');
  if (currentPage === 'home') renderHome();
  else if (currentPage === 'plan') renderPlan();
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

/* Calendar dates are LOCAL. toISOString() is UTC, so from 00:00 to 00:59 during
   British Summer Time it returned yesterday: late-night revision landed on the
   wrong day for streaks and due cards, and disagreed with the heatmap's keys. */
function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function today() {
  return localDateStr();
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
  updateStreak();   // a streak day is a day you revised, not a day you opened the site
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
    el('home-countdown-label').textContent = examPassed() ? 'exam passed' : 'days to exam';
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
  el('home-stat-streak').textContent = currentStreak();
  el('home-flash-due').textContent = flashDue;
  const myRank = rankInfo(myStanding().tier);
  el('home-stat-level').textContent = myRank.icon;
  el('home-stat-level').style.color = myRank.col;
  el('home-stat-xp').textContent = `${myRank.name} · ${seasonXP()} season XP`;
  renderHeroCard();

  renderSectionTiles();
  renderPriorityTopics();
  renderHeatmap();
  renderReviseNext();
  // A refresh always lands on Home, so an interrupted paper is offered here too.
  const resume = el('home-mock-resume');
  if (resume) resume.innerHTML = mockResumeHTML();
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
    `<span style="position:absolute;left:${m.col * 16}px;font-size:12px;color:var(--text2);font-weight:700;white-space:nowrap;line-height:1">${m.label}</span>`
  ).join('');

  const btnStyle = `background:var(--bg3);border:1px solid var(--border);border-radius:8px;width:28px;height:28px;cursor:pointer;font-size:15px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;color:var(--text)`;
  const nextDisabled = year >= currentYear;

  return `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <button onclick="${callbackFn}(${year - 1})" aria-label="Previous year" style="${btnStyle}">‹</button>
      <span style="font-size:15px;font-weight:800;min-width:44px;text-align:center">${year}</span>
      <button onclick="${callbackFn}(${year + 1})" aria-label="Next year"${nextDisabled ? ' disabled' : ''} style="${btnStyle};${nextDisabled ? 'opacity:0.3;cursor:default' : ''}">›</button>
    </div>
    <div class="hm-scroll" style="overflow-x:auto;padding-bottom:6px">
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
  scrollHeatmapToToday(container, homeHeatmapYear);
}

function renderProfileHeatmap(year) {
  if (year !== undefined) profileHeatmapYear = year;
  const container = el('profile-heatmap');
  if (!container) return;
  container.innerHTML = buildYearHeatmapHTML(profileHeatmapYear, 'renderProfileHeatmap');
  scrollHeatmapToToday(container, profileHeatmapYear);
}

/* On a phone the year is wider than the screen and opened on January, so this
   month was off to the right. Bring the current week into view instead. */
function scrollHeatmapToToday(container, year) {
  const sc = container.querySelector('.hm-scroll');
  const now = new Date();
  if (!sc || year !== now.getFullYear() || sc.scrollWidth <= sc.clientWidth) return;
  const jan1 = new Date(year, 0, 1);
  const startPad = (jan1.getDay() + 6) % 7;
  const dayOfYear = Math.floor((now - jan1) / 86400000);
  const col = Math.floor((startPad + dayOfYear) / 7);
  // 16px per week column, plus the day-label gutter; keep today near the right edge.
  sc.scrollLeft = Math.max(0, col * 16 + 60 - sc.clientWidth + 40);
}

function renderReviseNext() {
  const container = el('revise-next');
  if (!container) return;

  // Today's flashcards: due reviews first, then new cards (same rule as the Flashcards page)
  const todayCards = dueFlashcards();
  const dueCards = todayCards.all.slice(0, 3);

  // Weakest RAG topic
  const reds = Object.entries(state.rag).filter(([, v]) => v === 'red').map(([k]) => k);
  const weakCode = reds[0] || null;
  const weakItem = weakCode ? findItemByCode(weakCode) : null;

  if (!dueCards.length && !weakItem) { container.innerHTML = ''; return; }

  const dueHTML = dueCards.length ? `
    <div style="margin-bottom:12px">
      <div style="font-size:12px;color:var(--text2);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">${todayCards.reviews.length ? 'Flashcards due today' : 'New flashcards to learn today'}</div>
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
          <p>${s.topics}</p>
          <div class="tile-progress"><div class="tile-progress-bar" style="width:${sectionProgress(s.letter)}%;background:${s.col}"></div></div>
          <div style="font-size:12px;color:var(--text2);margin-top:4px">${sectionProgress(s.letter)}% confident</div>
        </div>`).join('')}
    </div>`;
}

function renderSectionContent(container, data, letter) {
  const col = sectionColour(letter);

  let html = `
    <div class="section-header">
      <button class="section-header-back" onclick="navigate('sections')" title="Back">←</button>
      <h2><span style="color:${col}">${data.section}</span> — ${data.title}</h2>
      <span class="badge ${sectionTierClass(letter)}">Tier ${sectionTier(letter)}</span>
    </div>`;

  data.topics.forEach(topic => {
    html += `<div class="subtopic-header">${topic.code} ${topic.title}</div>`;
    topic.subtopics.forEach(sub => {
      html += `<div class="subtopic-header" style="font-size:12px;margin-bottom:4px">${sub.code ? sub.code + (sub.title ? ' — ' + sub.title : '') : sub.title || ''}</div>`;
      if (sub.comparisonTable) {
        html += `<div class="subtopic-table-wrap">${sub.comparisonTable.title ? '' : '<div class="subtopic-table-title">Overview</div>'}${renderComparisonTable(sub.comparisonTable)}</div>`;
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
      <div role="button" tabindex="0" class="card-header" aria-expanded="false" aria-controls="body-${item.code}" onclick="toggleCard('${item.code}')">
        <span class="badge" style="min-width:65px;text-align:center">${item.code}</span>
        <h3>${item.term}</h3>
        ${isReviewed ? '<span class="reviewed-tick" style="color:var(--green);font-size:12px">✓</span>' : ''}
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
  const open = body.classList.toggle('hidden') === false;
  if (chev) chev.classList.toggle('open', open);
  const header = body.previousElementSibling;
  if (header && header.classList.contains('card-header')) header.setAttribute('aria-expanded', String(open));
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

/* Updates this one card in place. Re-rendering the section (as it used to) reset
   the scroll and closed the card, losing the student's place in a long section. */
function markReviewed(code, letter) {
  const key = letter + '_' + code;
  state.reviewed[key] = true;
  saveState();
  const card = el('item-' + code);
  if (!card) return;
  const btn = card.querySelector('button[onclick^="markReviewed"]');
  if (btn) btn.outerHTML = '<div class="reviewed-banner">✓ Marked as reviewed</div>';
  const h3 = card.querySelector('.card-header h3');
  if (h3 && !card.querySelector('.reviewed-tick')) {
    h3.insertAdjacentHTML('afterend', '<span class="reviewed-tick" style="color:var(--green);font-size:12px">✓</span>');
  }
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

/* A card is NEW until it is first graded. New cards are introduced at most
   NEW_CARDS_PER_DAY a day: before this a new student was handed all 136 at once,
   while Home and the Plan, which only counted studied cards, said "0 due".
   dueFlashcards() is the one definition of "due" that every page uses. */
const NEW_CARDS_PER_DAY = 20;

function newDayToday() {
  const nd = state.flashcards.newDay;
  if (!nd || nd.date !== today()) state.flashcards.newDay = { date: today(), count: 0, extra: 0 };
  return state.flashcards.newDay;
}

function newCardsLeftToday() {
  const nd = state.flashcards.newDay;
  const isToday = nd && nd.date === today();
  const used = isToday ? (nd.count || 0) : 0;
  const extra = isToday ? (nd.extra || 0) : 0;
  return Math.max(0, NEW_CARDS_PER_DAY + extra - used);
}

// Today's cards for a section filter: due reviews first, then new cards up to today's allowance.
function dueFlashcards(filter = 'all') {
  const cards = flashcardsForUnit().filter(c => filter === 'all' || c.section === filter);
  const t = today();
  const reviews = cards.filter(c => { const d = state.flashcards.nextDue[c.id]; return d && d <= t; });
  const unseen = cards.filter(c => !state.flashcards.nextDue[c.id]);
  const fresh = unseen.slice(0, newCardsLeftToday());
  return { reviews, fresh, unseen: unseen.length, all: reviews.concat(fresh) };
}

function learnMoreNew() {
  newDayToday().extra += NEW_CARDS_PER_DAY;
  saveState();
  flashPracticeMode = false;
  buildFlashQueue();
  renderFlashUI();
}

function buildFlashQueue() {
  if (!flashData) return;
  flashQueue = flashPracticeMode
    ? flashData.cards.filter(card => flashFilter === 'all' || card.section === flashFilter)
    : dueFlashcards(flashFilter).all;
  flashIdx = 0;
  flashFlipped = false;
}

function renderFlashUI() {
  const container = el('flashcards-content');
  const total = flashData ? flashData.cards.length : 0;
  const due = flashQueue.length;
  const today_ = dueFlashcards(flashFilter);
  const dueLabel = flashPracticeMode
    ? `${due} in practice / ${total} total`
    : `${today_.reviews.length} to review · ${today_.fresh.length} new today / ${total} total`;
  const moreNew = !flashPracticeMode && today_.unseen > today_.fresh.length
    ? `<button class="btn btn-secondary btn-sm" onclick="learnMoreNew()">Learn ${Math.min(NEW_CARDS_PER_DAY, today_.unseen - today_.fresh.length)} more new</button>` : '';

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
      <span style="font-size:14px;color:var(--text2)">${dueLabel}</span>
      <button class="btn btn-secondary btn-sm" onclick="flashPracticeMode=false;buildFlashQueue();renderFlashUI()">Refresh queue</button>
    </div>
    ${flashPracticeMode ? `<div style="background:var(--accent-light);border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:12px;font-size:13px;color:var(--text)"><strong>Practice mode</strong> — reviewing all ${flashQueue.length} cards. Leitner progress is not being saved. <button class="btn btn-secondary btn-sm" style="margin-left:8px" onclick="flashPracticeMode=false;buildFlashQueue();renderFlashUI()">Exit practice mode</button></div>` : ''}
    ${due === 0 && !flashPracticeMode ? `
      <div class="empty-state">
        <div class="icon">🎉</div>
        <p>${today_.unseen ? `Today's ${NEW_CARDS_PER_DAY} new cards are done and nothing is due for review. New cards stick better spread over days.` : 'No flashcards due! Check back tomorrow.'}</p>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px">
          ${moreNew}
          <button class="btn btn-primary" onclick="flashPracticeMode=true;flashFilter='all';buildFlashQueue();renderFlashUI()">Study all cards anyway</button>
        </div>
      </div>` : renderCurrentFlashcard()}`;
}

function renderCurrentFlashcard() {
  if (flashIdx >= flashQueue.length) {
    const left = flashPracticeMode ? null : dueFlashcards(flashFilter);
    const more = left && left.unseen > left.fresh.length && !left.all.length
      ? `<button class="btn btn-secondary" onclick="learnMoreNew()">Learn ${Math.min(NEW_CARDS_PER_DAY, left.unseen)} more new</button>` : '';
    return `<div class="empty-state"><div class="icon">🎉</div><p>Session complete! ${flashQueue.length} cards reviewed.</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px">
        ${more}
        <button class="btn btn-primary" onclick="flashPracticeMode=false;buildFlashQueue();renderFlashUI()">${left && left.all.length ? 'Keep going' : 'Start again'}</button>
      </div></div>`;
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
    <div class="progress-bar-wrap" style="margin-top:12px"><div class="progress-bar" id="flash-progress-bar" style="width:${pct}%"></div></div>
    <div class="flash-keys"><kbd>Space</kbd> flip · <kbd>←</kbd> didn't know · <kbd>→</kbd> got it</div>`;
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
    if (!state.flashcards.nextDue[card.id]) newDayToday().count++;   // first grading: a new card used up
    const curBox = state.flashcards.boxes[card.id] || 1;
    const newBox = correct ? Math.min(5, curBox + 1) : 1;
    state.flashcards.boxes[card.id] = newBox;
    const interval = LEITNER_INTERVALS[newBox];
    const due = new Date();
    due.setDate(due.getDate() + interval);
    state.flashcards.nextDue[card.id] = localDateStr(due);
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
  return dueFlashcards().all.length;
}

/* ---- QUESTIONS ----
   Practice works like flashcards: one question on screen, Previous / Next (or
   ← / →) to move, filtered by section and by what you still need to do. Quiz
   mode runs a short set picked by focus; mock papers sit a whole paper. */
let qData = null;
let qMode = 'practice';   // 'practice' | 'quizsetup' | 'quiz' | 'mock'
let qFilter = 'all';      // section letter, or 'all'
let qShow = 'all';        // 'all' | 'new' (not tried) | 'weak' (last mark under WEAK_PCT)
let qIdx = 0;             // position in the filtered practice list
let qCurrentId = null;    // question on screen, so Next still works after it drops out of the filter
let quizQueue = [];
let quizIdx = 0;
let quizOpts = { focus: 'weak', section: 'all', length: 10 };

// Same cut-off as the green score badge: below this a question still needs work.
const WEAK_PCT = 70;

function renderQuestions() {
  qData = loadJSON('data/questions.json');
  const container = el('questions-content');
  if (!qData) {
    container.innerHTML = `<div class="empty-state"><div class="icon">📝</div><p>Question bank loading...</p></div>`;
    return;
  }

  if (qMode === 'mock') {
    renderMock(container);
  } else if (qMode === 'quiz') {
    renderQuizMode(container);
  } else if (qMode === 'quizsetup') {
    renderQuizSetup(container);
  } else {
    renderPractice(container);
  }
}

// Most recent mark per question, as a percentage. Mock marks count too.
function latestScores() {
  const out = {};
  state.questions.history.forEach(h => {
    if (typeof h.qId === 'string' && typeof h.selfScore === 'number') out[h.qId] = h.selfScore;
  });
  return out;
}

function scoreBand(pct) {
  return pct === undefined ? '' : pct >= WEAK_PCT ? 'good' : pct >= 40 ? 'mid' : 'low';
}

function scoreBadgeClass(pct) {
  return { good: 'active-green', mid: 'active-amber', low: 'active-red' }[scoreBand(pct)] || '';
}

// "1(a)(i)" for a paper-style question, "Short question 7" for a standalone one,
// counted among the standalone questions only (they follow the paper in Unit 2).
function qLabel(q) {
  const sc = qScenario(q);
  if (sc) return `Question ${sc.number}${q.part || ''}`;
  return `Short question ${qData.questions.filter(x => !x.scenario).indexOf(q) + 1}`;
}

function matchesShow(q, show, latest) {
  if (show === 'new') return !(q.id in latest);
  if (show === 'weak') return q.id in latest && latest[q.id] < WEAK_PCT;
  return true;
}

function practiceList(latest = latestScores()) {
  return qData.questions.filter(q =>
    (qFilter === 'all' || q.section === qFilter) && matchesShow(q, qShow, latest));
}

function avgOf(nums) {
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null;
}

/* Where you stand across the whole bank: what you have tried, how it went, and
   which section and command word are dragging the average down. */
function renderQSummary() {
  const latest = latestScores();
  const qs = qData.questions;
  const done = qs.filter(q => q.id in latest);
  const avg = avgOf(done.map(q => latest[q.id]));
  const weakCount = done.filter(q => latest[q.id] < WEAK_PCT).length;

  const weakestBy = key => {
    const groups = {};
    done.forEach(q => { (groups[q[key]] = groups[q[key]] || []).push(latest[q.id]); });
    let worst = null;
    Object.keys(groups).forEach(k => {
      const a = avgOf(groups[k]);
      if (a < WEAK_PCT && (!worst || a < worst.avg)) worst = { key: k, avg: a };
    });
    return worst;
  };
  const ws = weakestBy('section');
  const wc = weakestBy('commandWord');
  const focus = done.length >= 3 && (ws || wc) ? `
    <div class="q-focus">
      <span><strong>Focus next:</strong>
        ${[ws && `Section ${ws.key} (${ws.avg}%)`, wc && `${wc.key} questions (${wc.avg}%)`].filter(Boolean).join(' · ')}</span>
      ${weakCount ? `<button class="btn btn-secondary btn-sm" onclick="quickWeakQuiz()">Quiz my weak spots</button>` : ''}
    </div>` : '';

  const tiles = unitLettersUpper().map(l => {
    const inSec = qs.filter(q => q.section === l);
    if (!inSec.length) return '';
    const tried = inSec.filter(q => q.id in latest);
    const a = avgOf(tried.map(q => latest[q.id]));
    return `
      <button class="q-sec${qFilter === l ? ' active' : ''}" onclick="setQFilter('${qFilter === l ? 'all' : l}')"
        aria-pressed="${qFilter === l}" title="${qFilter === l ? 'Show all sections' : 'Only show Section ' + l}">
        <span class="q-sec-letter">${l}</span>
        <span class="q-sec-count">${tried.length}/${inSec.length}</span>
        <span class="q-sec-avg ${scoreBand(a === null ? undefined : a)}">${a === null ? '–' : a + '%'}</span>
      </button>`;
  }).join('');

  return `
    <div class="q-summary">
      <div class="q-stats">
        <div><strong>${done.length}<span>/${qs.length}</span></strong>tried</div>
        <div><strong>${avg === null ? '–' : avg + '%'}</strong>average mark</div>
        <div><strong>${weakCount}</strong>need another go</div>
      </div>
      <div class="q-secs">${tiles}</div>
      ${focus}
    </div>`;
}

function renderPractice(container) {
  const latest = latestScores();
  const list = practiceList(latest);
  if (qIdx >= list.length) qIdx = Math.max(0, list.length - 1);
  const q = list[qIdx];
  qCurrentId = q ? q.id : null;

  const showBtn = (val, label) =>
    `<button class="tab-btn ${qShow === val ? 'active' : ''}" aria-pressed="${qShow === val}" onclick="setQShow('${val}')">${label}</button>`;
  const emptyMsg = qShow === 'new'
    ? `You have tried every question${qFilter === 'all' ? '' : ' in Section ' + qFilter}. Switch to <strong>Needs work</strong> to go back over the ones you dropped marks on.`
    : qShow === 'weak'
      ? `Nothing needs another go${qFilter === 'all' ? '' : ' in Section ' + qFilter}. Every question you have marked scored ${WEAK_PCT}% or more.`
      : 'No questions in this section.';

  container.innerHTML = `
    <div class="q-head">
      <h2>Practice Questions</h2>
      <div class="q-head-btns">
        ${qData.papers ? `<button class="btn btn-secondary btn-sm" onclick="openMockMenu()">Mock paper</button>` : ''}
        <button class="btn btn-primary btn-sm" onclick="openQuizSetup()">Quiz</button>
      </div>
    </div>
    <p class="q-intro">${qData.scenarios
      ? 'Set out like the real paper. Read the scenario, answer the part, then mark yourself against the mark scheme, not a guess. The number in brackets is the marks, so it tells you how much to write.'
      : 'Answer the question, then mark yourself against the mark scheme. The number in brackets is the marks, so it tells you how much to write.'}
      Your answers are saved as you type.</p>
    ${mockResumeHTML()}
    <div id="q-summary">${renderQSummary()}</div>
    <div class="q-toolbar">
      <select class="q-select" aria-label="Section" onchange="setQFilter(this.value)">
        <option value="all" ${qFilter === 'all' ? 'selected' : ''}>All sections</option>
        ${unitLettersUpper().map(l => `<option value="${l}" ${qFilter === l ? 'selected' : ''}>Section ${l}</option>`).join('')}
      </select>
      <div class="tabs q-show" role="group" aria-label="Which questions">
        ${showBtn('all', 'All')}${showBtn('new', 'Not tried')}${showBtn('weak', 'Needs work')}
      </div>
    </div>
    ${q ? `
      <nav class="q-nav" id="q-nav" aria-label="Jump to a question">
        ${list.map((x, i) => {
          const desc = `${qLabel(x)}, ${x.marks} mark${x.marks === 1 ? '' : 's'}, ${x.id in latest ? 'last ' + latest[x.id] + '%' : 'not tried'}`;
          return `<button class="q-chip ${scoreBand(latest[x.id])}${i === qIdx ? ' current' : ''}" data-qid="${x.id}"
            aria-current="${i === qIdx ? 'true' : 'false'}" aria-label="${desc}" title="${desc}" onclick="practiceGo(${i})">${i + 1}</button>`;
        }).join('')}
      </nav>
      <div class="q-practice" id="q-stage">${renderQuestionStage(q, 'practice', latest)}</div>
      <div class="q-pager">
        <button class="btn btn-secondary btn-sm" onclick="practiceStep(-1)" ${qIdx === 0 ? 'disabled' : ''}>← Previous</button>
        <span>Question ${qIdx + 1} of ${list.length}</span>
        <button class="btn btn-secondary btn-sm" onclick="practiceStep(1)" ${qIdx >= list.length - 1 ? 'disabled' : ''}>Next →</button>
      </div>
      <div class="flash-keys"><kbd>←</kbd> previous · <kbd>→</kbd> next, when you are not typing</div>`
    : `<div class="empty-state"><div class="icon">${qShow === 'all' ? '📝' : '🎉'}</div><p>${emptyMsg}</p></div>`}`;
  bindAnswerDrafts(container);
}

function practiceGo(i) {
  qIdx = i;
  renderQuestions();
  // Bring the new question's top into view if it is above the visible area.
  const stage = el('q-stage');
  const mainEl = document.querySelector('main');
  const visibleTop = mainEl ? mainEl.getBoundingClientRect().top : 0;
  if (stage && stage.getBoundingClientRect().top < visibleTop) stage.scrollIntoView({ block: 'start' });
}

// Steps from the question on screen. If marking it just dropped it out of the
// filter (Not tried / Needs work), the next one has slid into its place.
function practiceStep(d) {
  const list = practiceList();
  if (!list.length) return;
  const i = list.findIndex(x => x.id === qCurrentId);
  const next = i === -1 ? (d > 0 ? qIdx : qIdx - 1) : i + d;
  if (next < 0 || next >= list.length) return;
  practiceGo(next);
}

function setQShow(v) {
  qShow = v;
  qIdx = 0;
  renderQuestions();
}

/* Drafts are kept per unit in the saved state, keyed by textarea id, until the
   answer is marked. Moving between questions or pages does not lose them. */

function answerIds(q) {
  return q.slots > 1 ? Array.from({ length: q.slots }, (_, i) => `ans-${q.id}-${i}`) : [`ans-${q.id}`];
}

function bindAnswerDrafts(root) {
  if (!state.questions.drafts) state.questions.drafts = {};
  const drafts = state.questions.drafts;
  root.querySelectorAll('textarea.quiz-answer-area').forEach(t => {
    if (typeof drafts[t.id] === 'string' && !t.value) t.value = drafts[t.id];
    t.addEventListener('input', () => {
      if (t.value.trim()) drafts[t.id] = t.value; else delete drafts[t.id];
      scheduleSave();
    });
  });
}

function clearDraft(q) {
  const drafts = state.questions.drafts;
  if (!drafts) return;
  answerIds(q).forEach(k => { delete drafts[k]; });
  saveState();
}

/* Unit 1 questions are written like the real paper: grouped under a numbered
   scenario, with a structured mark scheme the student marks themselves against.
   Unit 2's questions have neither, and keep the plain model answer + 0..N buttons. */
function qScenario(q) {
  return q.scenario && qData.scenarios ? qData.scenarios.find(s => s.id === q.scenario) : null;
}

// Question text uses **bold** (as the paper bolds "two") and blank-line paragraphs.
function examText(s) {
  return String(s || '')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

function renderAnswerArea(q, id) {
  if (q.commandWord === 'Draw') {
    return `<p class="q-draw-note">Draw this on paper, then use <strong>Mark my answer</strong> to tick what your diagram shows.</p>`;
  }
  if (q.slots > 1) {
    return Array.from({ length: q.slots }, (_, i) => `
      <div class="answer-slot"><span aria-hidden="true">${i + 1}</span>
        <textarea class="quiz-answer-area" id="${id}-${i}" rows="2" aria-label="Answer ${i + 1}"></textarea></div>`).join('');
  }
  const rows = q.marks >= 9 ? 12 : q.marks >= 6 ? 8 : 4;
  return `<textarea class="quiz-answer-area" id="${id}" rows="${rows}" placeholder="Write your answer here..."></textarea>`;
}

function renderExamQuestion(q, showStem) {
  const sc = qScenario(q);
  const peek = sc && showStem ? `
    <details class="scenario-peek"><summary>Question ${sc.number}: ${sc.title}</summary>
      <div class="scenario-stem">${examText(sc.stem)}</div></details>` : '';
  return `
    ${peek}
    ${q.context ? `<div class="q-context">${examText(q.context)}</div>` : ''}
    <div class="q-text">
      ${q.part ? `<span class="q-part">${q.part}</span>` : ''}
      <div class="q-body">${examText(q.question)}</div>
      <span class="q-tariff">(${q.marks})</span>
    </div>`;
}

/* One question, ready to answer and mark. Shared by practice and quiz so both
   behave the same. A question with a structured mark scheme opens the marker;
   one without falls back to the example answer and a 0..N self-mark. */
function renderQuestionStage(q, ctx, latest = latestScores()) {
  const last = latest[q.id];
  const sc = qScenario(q);
  const scheme = q.markScheme
    ? `<button class="btn btn-primary btn-sm" id="markbtn-${q.id}" onclick="openMarker('${q.id}', '${ctx}')">Mark my answer</button>
       <div class="marker" id="marker-${q.id}" hidden></div>`
    : `<button class="btn btn-primary btn-sm" id="markbtn-${q.id}" onclick="openSelfMark('${q.id}')">Mark my answer</button>
       <div class="marker" id="marker-${q.id}" hidden>
         <div class="ms-example"><div>${examText(q.modelAnswer)}</div></div>
         ${q.markPoints ? `<div class="ms-accept"><div class="ms-title">Mark points</div><ul>${q.markPoints.map(p => `<li>${p}</li>`).join('')}</ul></div>` : ''}
         <p class="ms-note" style="margin-top:12px">How many marks did your answer earn?</p>
         <div class="self-mark">${Array.from({ length: q.marks + 1 }, (_, i) =>
           `<button class="btn btn-secondary btn-sm" onclick="recordResult('${q.id}', ${i}, '${ctx}')">${i}/${q.marks}</button>`).join('')}</div>
       </div>`;

  return `
    <div class="question-card" id="qcard-${q.id}">
      <div class="question-meta">
        <span class="badge">${q.section}</span>
        <span class="badge">${q.marks} mark${q.marks === 1 ? '' : 's'}</span>
        <span class="badge">${q.commandWord}</span>
        <span class="q-marks">${q.code || ''}</span>
        ${last !== undefined ? `<span class="badge ${scoreBadgeClass(last)}" title="Your last mark">Last: ${last}%</span>` : ''}
      </div>
      ${sc ? `<details class="scenario-peek" open><summary>Question ${sc.number}: ${sc.title}</summary>
        <div class="scenario-stem">${examText(sc.stem)}</div></details>` : ''}
      ${renderExamQuestion(q, false)}
      ${renderAnswerArea(q, 'ans-' + q.id)}
      ${scheme}
      <div class="q-result" id="q-result-${q.id}" hidden></div>
    </div>`;
}

function openSelfMark(qId) {
  const box = el('marker-' + qId);
  if (box) box.hidden = !box.hidden;
}

function recordScore(qId, score, maxMarks) {
  const pct = Math.round((score / maxMarks) * 100);
  state.questions.history.push({ qId, marks: maxMarks, date: today(), selfScore: pct });
  bumpActivity();
  return pct;
}

/* Every mark, from the marker or the 0..N buttons, lands here. Practice and
   quiz both log it to history and clear the saved draft; the quiz also banks
   XP and moves on, as it always has. */
function recordResult(qId, score, ctx) {
  const q = findQuestion(qId);
  if (!q) return;
  if (ctx === 'mock') { recordMockMark(qId, score); return; }
  const pct = recordScore(qId, score, q.marks);
  clearDraft(q);
  if (ctx === 'quiz') {
    quizScore += score;
    quizMax += q.marks;
    awardXP(score * 2, true);
    quizIdx++;
    renderQuestions();
    scrollContentTop();
    return;
  }
  toast(`Recorded: ${score}/${q.marks} (${pct}%)`);
  showPracticeResult(q, score, pct);
}

// The answer stays on screen to compare with the mark scheme; the draft is gone.
function showPracticeResult(q, score, pct) {
  const box = el('marker-' + q.id);
  if (box) box.hidden = true;
  const btn = el('markbtn-' + q.id);
  if (btn) btn.hidden = true;
  const res = el('q-result-' + q.id);
  if (res) {
    res.hidden = false;
    res.className = 'q-result ' + scoreBand(pct);
    res.innerHTML = `
      <span>Recorded <strong>${score}/${q.marks}</strong> (${pct}%)</span>
      <span class="q-result-btns">
        <button class="btn btn-secondary btn-sm" onclick="retryQuestion('${q.id}')">Try again</button>
        <button class="btn btn-primary btn-sm" onclick="practiceStep(1)">Next question →</button>
      </span>`;
  }
  const chip = document.querySelector(`.q-chip[data-qid="${q.id}"]`);
  if (chip) {
    chip.className = `q-chip ${scoreBand(pct)} current`;
    const desc = `${qLabel(q)}, ${q.marks} mark${q.marks === 1 ? '' : 's'}, last ${pct}%`;
    chip.setAttribute('aria-label', desc);
    chip.title = desc;
  }
  const sum = el('q-summary');
  if (sum) sum.innerHTML = renderQSummary();
}

function retryQuestion(qId) {
  const q = findQuestion(qId);
  if (!q) return;
  answerIds(q).forEach(id => { const t = el(id); if (t) t.value = ''; });
  delete markerLevel[qId];
  const res = el('q-result-' + qId);
  if (res) res.hidden = true;
  const btn = el('markbtn-' + qId);
  if (btn) btn.hidden = false;
  const box = el('marker-' + qId);
  if (box && q.markScheme) { box.hidden = true; box.innerHTML = ''; }
  const first = el(answerIds(q)[0]);
  if (first) first.focus();
}

/* ---- Mark-scheme marker ----
   points: 1 mark per ticked point.
   chain:  "identify then expand": a later step only counts once the step before
           it is ticked, and only as many points as the question asks for count.
   levels: pick the level that fits, then a mark inside that band. */
const markerLevel = {};

function findQuestion(qId) {
  return qData && qData.questions.find(x => x.id === qId);
}

function levelBands(q) {
  const size = Math.round(q.marks / 3);
  const evaluate = q.commandWord === 'Evaluate';
  const bands = [
    ['Basic', 'Mostly general knowledge, only loosely tied to the scenario. May only look at one side. Little breaking down of the issue.',
      'Any conclusion is missing or not backed up.'],
    ['Good', 'Points are applied to the scenario and both sides are considered. The issue is broken down with some explanation.',
      'The conclusion is partly supported by your points.'],
    ['Thorough', 'Every point is applied to the scenario, both sides are balanced, and the issue is broken down in depth.',
      'The conclusion clearly follows from what you argued.'],
  ];
  return bands.map(([name, text, concl], i) => ({
    level: i + 1, name,
    min: i * size + 1, max: i === 2 ? q.marks : (i + 1) * size,
    text: evaluate ? `${text} ${concl}` : text,
  }));
}

function maxChains(q) {
  return Math.max(1, Math.round(q.marks / q.markScheme.steps.length));
}

function renderMarker(q, ctx) {
  const ms = q.markScheme;
  const id = q.id;
  const list = (title, items, cls) => items && items.length
    ? `<div class="${cls}"><div class="ms-title">${title}</div><ul>${items.map(t => `<li>${t}</li>`).join('')}</ul></div>` : '';

  let body = '';
  if (ms.type === 'points') {
    body = ms.points.concat(['Another valid point that is not listed']).map((p, i) => `
      <label class="ms-row"><input type="checkbox" data-pt="${i}" onchange="updateMarker('${id}')"><span>${p}</span></label>`).join('');
  } else if (ms.type === 'chain') {
    const other = [ms.steps.map((s, i) => i === 0 ? 'Another valid point that is not listed' : 'Expanded it properly')];
    body = ms.points.concat(other).map(p => `
      <div class="ms-chain">${p.map((part, s) => `
        <label class="ms-row${s ? ' ms-sub' : ''}"><input type="checkbox" onchange="updateMarker('${id}')">
          <span><b>${ms.steps[s]}</b> ${part}</span></label>`).join('')}</div>`).join('');
  } else {
    body = `
      <div class="ms-title">What a strong answer could cover</div>
      <p class="ms-note">${ms.focus} Tick what you covered to help you judge. There are no marks per point here.</p>
      ${ms.indicative.map(p => `<label class="ms-row"><input type="checkbox"><span>${p}</span></label>`).join('')}
      <div class="ms-title" style="margin-top:14px">Which level fits your answer best?</div>
      <label class="ms-level"><input type="radio" name="lvl-${id}" onchange="pickLevel('${id}', 0)"><span><b>Level 0</b> (0 marks) Nothing creditworthy.</span></label>
      ${levelBands(q).map(b => `
        <label class="ms-level"><input type="radio" name="lvl-${id}" onchange="pickLevel('${id}', ${b.level})">
          <span><b>Level ${b.level}: ${b.name}</b> (${b.min}–${b.max} marks) ${b.text}</span></label>`).join('')}
      <div class="ms-band" id="band-${id}"></div>`;
  }

  return `
    ${list('Watch the wording', q.traps, 'ms-trap')}
    <div class="ms-rule">${ms.rule || 'Levelled mark scheme: the whole answer is judged, not individual points.'}</div>
    ${body}
    ${list('Also credit', ms.accept, 'ms-accept')}
    ${list('Do not credit', ms.reject, 'ms-reject')}
    <p class="ms-cap" id="cap-${id}" hidden></p>
    <details class="ms-example"><summary>Show example answer</summary><div>${examText(q.modelAnswer)}</div></details>
    <div class="ms-score">
      <span>Your mark: <strong id="score-${id}">–</strong>/${q.marks}</span>
      <button class="btn btn-primary btn-sm" onclick="recordMarked('${id}', '${ctx}')">Record mark</button>
    </div>`;
}

function openMarker(qId, ctx) {
  const q = findQuestion(qId);
  const box = el('marker-' + qId);
  if (!q || !box) return;
  if (!box.hidden) { box.hidden = true; return; }
  delete markerLevel[qId];
  box.innerHTML = renderMarker(q, ctx);
  box.hidden = false;
  updateMarker(qId);
}

function markerScore(q) {
  const box = el('marker-' + q.id);
  const ms = q.markScheme;
  if (!box) return null;
  if (ms.type === 'levels') {
    const lv = markerLevel[q.id];
    return lv && lv.mark !== undefined ? lv.mark : null;
  }
  if (ms.type === 'points') {
    return Math.min(q.marks, box.querySelectorAll('input[data-pt]:checked').length);
  }
  const per = [];
  box.querySelectorAll('.ms-chain').forEach(row => {
    let earned = 0, open = true;
    row.querySelectorAll('input').forEach(b => {
      b.disabled = !open;
      if (!open) b.checked = false;
      if (open && b.checked) earned++;
      open = open && b.checked;
    });
    if (earned) per.push(earned);
  });
  const cap = el('cap-' + q.id);
  const limit = maxChains(q);
  if (cap) {
    cap.hidden = per.length <= limit;
    cap.textContent = `The question asks for ${limit === 1 ? 'one point' : limit + ' points'}. The examiner only marks the first ${limit === 1 ? 'one' : limit} you wrote.`;
  }
  per.sort((a, b) => b - a);
  return Math.min(q.marks, per.slice(0, limit).reduce((a, b) => a + b, 0));
}

function updateMarker(qId) {
  const q = findQuestion(qId);
  const out = el('score-' + qId);
  if (!q || !out) return;
  const s = markerScore(q);
  out.textContent = s === null ? '–' : s;
}

function pickLevel(qId, level) {
  const q = findQuestion(qId);
  const band = el('band-' + qId);
  if (!q || !band) return;
  if (level === 0) {
    markerLevel[qId] = { level: 0, mark: 0 };
    band.innerHTML = '';
  } else {
    const b = levelBands(q)[level - 1];
    markerLevel[qId] = { level };
    const marks = Array.from({ length: b.max - b.min + 1 }, (_, i) => b.min + i);
    band.innerHTML = `
      <p class="ms-note">Top of the band if you fully meet the description, bottom if you only just reach it.</p>
      <div class="self-mark">${marks.map(m => `
        <button class="btn btn-secondary btn-sm" data-mark="${m}" onclick="pickLevelMark('${qId}', ${m})">${m}</button>`).join('')}</div>`;
  }
  updateMarker(qId);
}

function pickLevelMark(qId, mark) {
  if (!markerLevel[qId]) return;
  markerLevel[qId].mark = mark;
  const band = el('band-' + qId);
  if (band) band.querySelectorAll('[data-mark]').forEach(b => {
    const on = +b.dataset.mark === mark;
    b.classList.toggle('btn-primary', on);
    b.classList.toggle('btn-secondary', !on);
    b.setAttribute('aria-pressed', on);
  });
  updateMarker(qId);
}

function recordMarked(qId, ctx) {
  const q = findQuestion(qId);
  if (!q) return;
  const score = markerScore(q);
  if (score === null) { toast('Choose a level and a mark first'); return; }
  recordResult(qId, score, ctx);
}

function setQFilter(f) {
  qFilter = f;
  qIdx = 0;
  renderQuestions();
}

/* ---- QUIZ ----
   A short run of questions chosen by focus. Weak spots come lowest-mark first,
   then get shuffled so the order is not the same every time. */
let quizScore = 0, quizMax = 0, quizSkipped = 0;

const QUIZ_FOCUS = [
  { id: 'weak',  label: 'Weak spots',    hint: `Questions you last marked under ${WEAK_PCT}%, lowest first.` },
  { id: 'new',   label: 'Not tried yet', hint: 'Questions you have never marked.' },
  { id: 'mixed', label: 'Mixed',         hint: 'Anything from the bank, in a random order.' }
];
const QUIZ_LENGTHS = [5, 10, 20];

// Fisher-Yates. sort(() => Math.random() - 0.5) is biased towards some orders.
function shuffleInPlace(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffle(arr) { return shuffleInPlace(arr.slice()); }

function quizPool(o, latest = latestScores()) {
  const inSec = qData.questions.filter(q => o.section === 'all' || q.section === o.section);
  if (o.focus === 'weak') return inSec.filter(q => matchesShow(q, 'weak', latest)).sort((a, b) => latest[a.id] - latest[b.id]);
  if (o.focus === 'new') return inSec.filter(q => matchesShow(q, 'new', latest));
  return shuffle(inSec);
}

// Default to the most useful focus that actually has questions in it.
function openQuizSetup() {
  if (!quizPool(quizOpts).length) {
    quizOpts.focus = ['weak', 'new', 'mixed'].find(f => quizPool({ ...quizOpts, focus: f }).length) || 'mixed';
  }
  qMode = 'quizsetup';
  renderQuestions();
}

function quickWeakQuiz() {
  quizOpts = { focus: 'weak', section: 'all', length: 10 };
  startQuiz();
}

function setQuizOpt(key, val) {
  quizOpts[key] = val;
  renderQuestions();
}

function backToPractice() {
  qMode = 'practice';
  renderQuestions();
}

function renderQuizSetup(container) {
  const latest = latestScores();
  const counts = {};
  QUIZ_FOCUS.forEach(f => { counts[f.id] = quizPool({ ...quizOpts, focus: f.id }, latest).length; });
  const pool = counts[quizOpts.focus];
  const n = Math.min(pool, quizOpts.length);
  const focus = QUIZ_FOCUS.find(f => f.id === quizOpts.focus) || QUIZ_FOCUS[2];
  const opt = (key, val, label, extra = '') =>
    `<button class="tab-btn ${quizOpts[key] === val ? 'active' : ''}" aria-pressed="${quizOpts[key] === val}"
       onclick="setQuizOpt('${key}', ${typeof val === 'number' ? val : `'${val}'`})" ${extra}>${label}</button>`;
  const why = pool ? '' : quizOpts.focus === 'weak'
    ? (Object.keys(latest).length ? `Nothing here scored under ${WEAK_PCT}% last time. Pick another focus.` : 'Mark a few questions first, then this finds the ones you struggled with.')
    : quizOpts.focus === 'new' ? 'You have marked every question here. Try Weak spots or Mixed.' : 'No questions in this section.';

  container.innerHTML = `
    <div class="q-head">
      <h2>Quiz</h2>
      <button class="btn btn-secondary btn-sm" onclick="backToPractice()">Back to practice</button>
    </div>
    <p class="q-intro">Pick what to work on. Each answer is marked against the mark scheme and earns 2 XP per mark.</p>
    <div class="card quiz-setup">
      <div class="ms-title">Focus</div>
      <div class="tabs">${QUIZ_FOCUS.map(f => opt('focus', f.id, `${f.label} <span class="tab-count">${counts[f.id]}</span>`)).join('')}</div>
      <p class="ms-note">${focus.hint}</p>
      <div class="ms-title">Section</div>
      <select class="q-select" aria-label="Section" onchange="setQuizOpt('section', this.value)">
        <option value="all" ${quizOpts.section === 'all' ? 'selected' : ''}>All sections</option>
        ${unitLettersUpper().map(l => `<option value="${l}" ${quizOpts.section === l ? 'selected' : ''}>Section ${l}</option>`).join('')}
      </select>
      <div class="ms-title">Length</div>
      <div class="tabs">${QUIZ_LENGTHS.map(l => opt('length', l, `${l} questions`)).join('')}</div>
      ${pool
        ? `<p class="ms-note">${n < quizOpts.length ? `Only ${n === 1 ? '1 question matches' : n + ' questions match'}, so the quiz will be ${n} long.` : `${n} questions.`}</p>
           <button class="btn btn-primary btn-full" onclick="startQuiz()">Start quiz</button>`
        : `<p class="ms-note">${why}</p>
           <button class="btn btn-primary btn-full" disabled>Start quiz</button>`}
    </div>`;
}

function startQuiz() {
  const pool = quizPool(quizOpts);
  const picked = pool.slice(0, quizOpts.length);
  quizQueue = quizOpts.focus === 'weak' ? shuffle(picked) : picked;
  if (!quizQueue.length) { openQuizSetup(); return; }
  qMode = 'quiz';
  quizIdx = 0;
  quizScore = 0;
  quizMax = 0;
  quizSkipped = 0;
  renderQuestions();
}

function skipQuizQuestion() {
  quizSkipped++;
  quizIdx++;
  renderQuestions();
  scrollContentTop();
}

function renderQuizMode(container) {
  if (quizIdx >= quizQueue.length) {
    const pct = quizMax ? Math.round((quizScore / quizMax) * 100) : null;
    container.innerHTML = `
      <div class="card mock-result">
        <div class="mock-paper-meta">Quiz complete</div>
        <div class="mock-score">${quizScore}<span>/${quizMax}</span></div>
        <div class="mock-paper-meta">${pct === null ? 'Nothing marked' : pct + '%'} · ${quizQueue.length - quizSkipped} marked${quizSkipped ? ` · ${quizSkipped} skipped` : ''} · +${quizScore * 2} XP</div>
      </div>
      <div class="q-head-btns" style="justify-content:center;margin-top:14px">
        <button class="btn btn-primary btn-sm" onclick="openQuizSetup()">New quiz</button>
        <button class="btn btn-secondary btn-sm" onclick="backToPractice()">Back to practice</button>
      </div>`;
    return;
  }
  const q = quizQueue[quizIdx];
  container.innerHTML = `
    <div class="q-practice">
      <div class="quiz-progress">
        <span>${quizIdx + 1}/${quizQueue.length}</span>
        <div class="bar"><div class="bar-fill" style="width:${Math.round((quizIdx / quizQueue.length) * 100)}%"></div></div>
        <button class="btn btn-secondary btn-sm" onclick="skipQuizQuestion()">Skip</button>
        <button class="btn btn-secondary btn-sm" onclick="backToPractice()">Exit</button>
      </div>
      ${renderQuestionStage(q, 'quiz')}
    </div>`;
  bindAnswerDrafts(container);
}

/* ---- MOCK PAPER ----
   A whole paper under exam conditions: answer everything against the clock with
   no mark schemes in sight, then mark each part afterwards. The clock counts to a
   fixed end time, so leaving the page does not pause it, as in the exam hall.
   The paper in progress is saved (state.questions.activeMock) on every answer and
   every mark, so a refresh, a closed tab or a phone killing the page can resume
   it. The saved copy is validated before use: it comes from storage or a backup. */
let mock = null;   // { paperId, phase: 'sit'|'mark'|'done', endAt, startedAt, answers, scores, minutesUsed }
let mockTick = null;

// The real Unit 1 paper is 90 marks in 2 hours; mocks keep that pace unless a
// paper sets its own `minutes` (Unit 2 does, as its exam runs to a different clock).
function paperMinutes(p) { return p.minutes || Math.round(paperMarks(p) * 4 / 3); }

function mockPaper(id) { return (qData.papers || []).find(p => p.id === id); }

function paperQuestions(p) {
  return p.scenarios.flatMap(sid => qData.questions.filter(q => q.scenario === sid));
}

function paperMarks(p) { return paperQuestions(p).reduce((n, q) => n + q.marks, 0); }

function stopMockTimer() {
  if (mockTick) { clearInterval(mockTick); mockTick = null; }
}


// Points saved state at the live paper (or clears it) and writes it out.
function persistMock(now) {
  state.questions.activeMock = mock && mock.phase !== 'done' ? mock : {};
  if (now) { cancelPendingSave(); saveState(); } else scheduleSave();
}

// The saved paper, checked field by field, or null.
function savedMock() {
  const m = state.questions.activeMock;
  if (!isPlainObject(m) || typeof m.paperId !== 'string') return null;
  // Always the ACTIVE unit's questions: qData can still hold the other unit's
  // after a switch, and both units have a paper with id "p1".
  qData = loadJSON('data/questions.json');
  const p = qData && qData.papers ? mockPaper(m.paperId) : null;
  if (!p || (m.phase !== 'sit' && m.phase !== 'mark')) return null;
  if (![m.startedAt, m.endAt].every(n => typeof n === 'number' && isFinite(n))) return null;
  const answers = {}, scores = {};
  if (isPlainObject(m.answers)) {
    Object.keys(m.answers).forEach(k => { if (typeof m.answers[k] === 'string') answers[k] = m.answers[k]; });
  }
  if (isPlainObject(m.scores)) {
    paperQuestions(p).forEach(q => {
      const v = m.scores[q.id];
      if (Number.isInteger(v) && v >= 0 && v <= q.marks) scores[q.id] = v;
    });
  }
  const minutesUsed = typeof m.minutesUsed === 'number' && isFinite(m.minutesUsed) ? m.minutesUsed : 0;
  return { paperId: m.paperId, phase: m.phase, startedAt: m.startedAt, endAt: m.endAt, answers, scores, minutesUsed };
}

function fmtClock(ms) {
  const left = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(left / 3600), m = Math.floor(left % 3600 / 60), s = left % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// "Resume / Discard" card, shown wherever the student might land after a refresh.
function mockResumeHTML() {
  if (mock) return '';
  const m = savedMock();
  if (!m) return '';
  const p = mockPaper(m.paperId);
  const left = m.endAt - Date.now();
  const status = m.phase === 'mark'
    ? `Marking in progress: ${Object.keys(m.scores).length} of ${paperQuestions(p).length} parts marked.`
    : left > 0 ? `${fmtClock(left)} left on the clock. It kept running while you were away.`
               : 'Time ran out while you were away. You can still mark what you wrote.';
  return `
    <div class="card mock-resume" role="status">
      <div><strong>${p.title} is in progress</strong><div class="mock-paper-meta">${status}</div></div>
      <div class="q-head-btns">
        <button class="btn btn-primary btn-sm" onclick="resumeMock()">Resume</button>
        <button class="btn btn-secondary btn-sm" onclick="discardMock()">Discard</button>
      </div>
    </div>`;
}

function resumeMock() {
  if (currentPage !== 'questions') navigate('questions');
  const m = savedMock();
  if (!m) {
    state.questions.activeMock = {};
    saveState();
    toast('That paper can no longer be resumed');
    renderQuestions();
    return;
  }
  mock = m;
  qMode = 'mock';
  stopMockTimer();
  if (mock.phase === 'sit') {
    if (mock.endAt <= Date.now()) {
      // As in the exam hall: the clock ran out, so it is pens down.
      mock.minutesUsed = paperMinutes(mockPaper(mock.paperId));
      mock.phase = 'mark';
      toast('Time ran out while you were away. Mark what you wrote.', 3500);
    } else {
      mockTick = setInterval(updateMockClock, 1000);
    }
  }
  persistMock(true);
  renderQuestions();
  scrollContentTop();
}

function discardMock() {
  if (!confirm('Discard this paper? Your answers and any marking will be deleted.')) return;
  stopMockTimer();
  mock = null;
  persistMock(true);
  toast('Paper discarded');
  if (currentPage === 'home') renderHome(); else renderQuestions();
}

function openMockMenu() {
  qMode = 'mock';
  mock = null;   // the saved paper, if any, is offered as "Resume" on the menu
  renderQuestions();
}

function exitMock() {
  if (mock && mock.phase === 'sit' && !confirm('Leave and discard this paper? Your answers will be deleted.')) return;
  if (mock && mock.phase === 'mark' && !confirm('Leave without seeing your results? Your answers and marking will be deleted.')) return;
  stopMockTimer();
  const wasLive = !!mock;
  mock = null;
  if (wasLive) persistMock(true);
  qMode = 'practice';
  renderQuestions();
}

function startMock(paperId) {
  const p = mockPaper(paperId);
  if (!p) return;
  const now = Date.now();
  if (savedMock() && !confirm('Starting a new paper discards the one in progress. Continue?')) return;
  mock = { paperId, phase: 'sit', startedAt: now, endAt: now + paperMinutes(p) * 60000,
           answers: {}, scores: {}, minutesUsed: 0 };
  persistMock(true);
  stopMockTimer();
  mockTick = setInterval(updateMockClock, 1000);
  renderQuestions();
  scrollContentTop();
}

function updateMockClock() {
  if (!mock || mock.phase !== 'sit') { stopMockTimer(); return; }
  const left = Math.max(0, Math.round((mock.endAt - Date.now()) / 1000));
  const t = el('mock-timer');
  if (t) {
    t.textContent = fmtClock(left * 1000);
    t.classList.toggle('warning', left <= 600 && left > 60);
    t.classList.toggle('critical', left <= 60);
  }
  if (left === 0) {
    toast('Time is up. Pens down.', 3000);
    finishMock(true);
  }
}

function mockSave(input) {
  if (!mock) return;
  mock.answers[input.id] = input.value;
  persistMock();
}

function finishMock(timeUp) {
  if (!mock || mock.phase !== 'sit') return;
  if (!timeUp && !confirm('Finish the paper and start marking?')) return;
  stopMockTimer();
  mock.minutesUsed = Math.min(Math.round((Date.now() - mock.startedAt) / 60000), paperMinutes(mockPaper(mock.paperId)));
  mock.phase = 'mark';
  persistMock(true);
  if (currentPage === 'questions' && qMode === 'mock') { renderQuestions(); scrollContentTop(); }
}

function renderMock(container) {
  if (!mock) return renderMockMenu(container);
  const p = mockPaper(mock.paperId);
  if (mock.phase === 'sit') return renderMockSit(container, p);
  if (mock.phase === 'mark') return renderMockMarking(container, p);
  return renderMockResults(container, p);
}

function renderMockMenu(container) {
  const past = (state.questions.mocks || []).filter(m => typeof m.score === 'number' && typeof m.max === 'number');
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">
      <h2>Mock Paper</h2>
      <button class="btn btn-secondary btn-sm" onclick="exitMock()">Back to questions</button>
    </div>
    ${mockResumeHTML()}
    <p class="q-intro">Sit a whole paper against the clock, as in the real exam: answer every part, no mark schemes until you finish. Then mark each answer against the mark scheme to get your total.${qData.questions.some(q => q.commandWord === 'Draw') ? ' Have paper and a pen ready for the diagram question.' : ''}</p>
    <div class="mock-papers">
      ${qData.papers.map(p => {
        const marks = paperMarks(p);
        const mine = past.filter(m => m.paper === p.id);
        const best = mine.length ? Math.max(...mine.map(m => Math.round(m.score / m.max * 100))) : null;
        return `
        <div class="card mock-paper-card">
          <h3>${p.title}</h3>
          <div class="mock-paper-meta">${marks} marks · ${paperMinutes(p)} minutes</div>
          <ol class="mock-paper-list">${p.scenarios.map(sid => {
            const sc = qData.scenarios.find(s => s.id === sid);
            return `<li>${sc ? sc.title : sid}</li>`;
          }).join('')}</ol>
          ${best !== null ? `<div class="mock-paper-meta">Attempts: ${mine.length} · Best: ${best}%</div>` : ''}
          <button class="btn btn-primary btn-full" onclick="startMock('${p.id}')">Start ${p.title}</button>
        </div>`;
      }).join('')}
    </div>
    ${past.length ? `
      <h3 style="margin:18px 0 8px">Past attempts</h3>
      <div class="mock-history">${past.slice(-8).reverse().map(m => {
        const p = mockPaper(m.paper);
        return `<div><span>${p ? p.title : 'Mock paper'}</span><span>${String(m.date || '')}</span><strong>${m.score}/${m.max} (${Math.round(m.score / m.max * 100)}%)</strong></div>`;
      }).join('')}</div>` : ''}`;
}

function renderMockSit(container, p) {
  const marks = paperMarks(p);
  const qs = paperQuestions(p);
  container.innerHTML = `
    <div class="mock-bar">
      <strong>${p.title}</strong>
      <span class="timer-display mock-timer" id="mock-timer" role="timer" aria-label="Time remaining">–</span>
      <button class="btn btn-primary btn-sm" onclick="finishMock(false)">Finish and mark</button>
    </div>
    <div class="mock-front">
      <strong>Answer ALL questions.</strong> Total ${marks} marks · ${paperMinutes(p)} minutes.
      The marks for each part are shown in brackets. Use them to judge how much to write.
      <button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick="exitMock()">Leave paper</button>
    </div>
    ${p.scenarios.map((sid, i) => {
      const sc = qData.scenarios.find(s => s.id === sid);
      const parts = qs.filter(q => q.scenario === sid);
      return `
      <section class="exam-q">
        <div class="exam-q-head"><span class="exam-q-num">${i + 1}</span><h3>${sc.title}</h3></div>
        <div class="scenario-stem">${examText(sc.stem)}</div>
        ${parts.map(q => `
          <div class="question-card">
            ${renderExamQuestion(q, false)}
            ${renderAnswerArea(q, 'mock-' + q.id)}
          </div>`).join('')}
        <div class="exam-q-total">(Total for Question ${i + 1} = ${parts.reduce((n, q) => n + q.marks, 0)} marks)</div>
      </section>`;
    }).join('')}
    <div class="exam-q-total" style="font-size:15px">TOTAL FOR PAPER = ${marks} MARKS</div>
    <button class="btn btn-primary btn-full" style="margin-top:12px" onclick="finishMock(false)">Finish and mark</button>`;
  container.querySelectorAll('textarea').forEach(t => {
    t.value = mock.answers[t.id] || '';
    t.addEventListener('input', () => mockSave(t));
  });
  updateMockClock();
}

// What the student wrote for one part, as read-only text for marking.
function mockAnswerHtml(q) {
  if (q.commandWord === 'Draw') return '<em>Drawn on paper. Look at your diagram while you tick.</em>';
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const base = 'mock-' + q.id;
  const parts = q.slots > 1
    ? Array.from({ length: q.slots }, (_, i) => mock.answers[`${base}-${i}`] || '').map((a, i) => a.trim() ? `${i + 1}. ${a}` : '')
    : [mock.answers[base] || ''];
  const text = parts.filter(a => a.trim()).join('\n');
  return text ? esc(text) : '<em>No answer written.</em>';
}

function mockProgressHtml(p) {
  const qs = paperQuestions(p);
  const done = qs.filter(q => q.id in mock.scores);
  const got = done.reduce((n, q) => n + mock.scores[q.id], 0);
  return `Marked <strong>${done.length}</strong> of ${qs.length} parts · <strong>${got}</strong>/${paperMarks(p)} marks so far`;
}

function renderMockMarking(container, p) {
  const qs = paperQuestions(p);
  container.innerHTML = `
    <div class="mock-bar">
      <strong>Marking: ${p.title}</strong>
      <span class="mock-progress" id="mock-progress">${mockProgressHtml(p)}</span>
      <button class="btn btn-primary btn-sm" onclick="showMockResults()">See results</button>
    </div>
    <p class="q-intro">Time used: ${mock.minutesUsed} minutes. Mark each part honestly against the mark scheme. Read the "Do not credit" list before you tick. Parts you skip count as 0.</p>
    ${p.scenarios.map((sid, i) => {
      const sc = qData.scenarios.find(s => s.id === sid);
      return `
      <section class="exam-q">
        <div class="exam-q-head"><span class="exam-q-num">${i + 1}</span><h3>${sc.title}</h3></div>
        <details class="scenario-peek"><summary>Re-read the scenario</summary><div class="scenario-stem">${examText(sc.stem)}</div></details>
        ${qs.filter(q => q.scenario === sid).map(q => `
          <div class="question-card" id="mockq-${q.id}">
            ${renderExamQuestion(q, false)}
            <div class="mock-answer">${mockAnswerHtml(q)}</div>
            <div class="mock-marked" id="mocked-${q.id}" ${q.id in mock.scores ? '' : 'hidden'}>
              Marked <strong>${mock.scores[q.id] ?? ''}</strong>/${q.marks}
              <button class="btn btn-secondary btn-sm" onclick="remarkMock('${q.id}')">Re-mark</button>
            </div>
            <div class="marker" id="marker-${q.id}" ${q.id in mock.scores ? 'hidden' : ''}>${q.id in mock.scores ? '' : renderMarker(q, 'mock')}</div>
          </div>`).join('')}
      </section>`;
    }).join('')}
    <button class="btn btn-primary btn-full" onclick="showMockResults()">See results</button>`;
  qs.forEach(q => { if (!(q.id in mock.scores)) updateMarker(q.id); });
}

function recordMockMark(qId, score) {
  const q = findQuestion(qId);
  if (!mock || !q) return;
  mock.scores[qId] = score;
  persistMock(true);
  const box = el('marker-' + qId);
  if (box) box.hidden = true;
  const done = el('mocked-' + qId);
  if (done) { done.hidden = false; done.querySelector('strong').textContent = score; }
  const prog = el('mock-progress');
  if (prog) prog.innerHTML = mockProgressHtml(mockPaper(mock.paperId));
  // Carry on to the next unmarked part, as an examiner works down the paper.
  const next = paperQuestions(mockPaper(mock.paperId)).find(x => !(x.id in mock.scores));
  if (next && el('mockq-' + next.id)) el('mockq-' + next.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function remarkMock(qId) {
  const q = findQuestion(qId);
  const box = el('marker-' + qId);
  if (!q || !box) return;
  delete mock.scores[qId];
  persistMock(true);
  delete markerLevel[qId];
  el('mocked-' + qId).hidden = true;
  box.innerHTML = renderMarker(q, 'mock');
  box.hidden = false;
  updateMarker(qId);
  const prog = el('mock-progress');
  if (prog) prog.innerHTML = mockProgressHtml(mockPaper(mock.paperId));
}

function showMockResults() {
  const p = mockPaper(mock.paperId);
  const qs = paperQuestions(p);
  const unmarked = qs.filter(q => !(q.id in mock.scores)).length;
  if (unmarked && !confirm(`${unmarked} part${unmarked === 1 ? ' is' : 's are'} not marked yet and will count as 0. See results anyway?`)) return;
  qs.forEach(q => { if (!(q.id in mock.scores)) mock.scores[q.id] = 0; });
  const score = qs.reduce((n, q) => n + mock.scores[q.id], 0);
  const max = paperMarks(p);
  state.questions.mocks = state.questions.mocks || [];
  state.questions.mocks.push({ paper: p.id, date: today(), score, max, minutes: mock.minutesUsed });
  qs.forEach(q => state.questions.history.push({ qId: q.id, marks: q.marks, date: today(),
                                                  selfScore: Math.round(mock.scores[q.id] / q.marks * 100) }));
  state.xp = (state.xp || 0) + score * 2;
  bumpActivity();
  saveState();
  mock.phase = 'done';
  persistMock(true);   // the result is in state.questions.mocks; nothing left to resume
  renderQuestions();
  scrollContentTop();
}

function renderMockResults(container, p) {
  const qs = paperQuestions(p);
  const sum = list => list.reduce((a, q) => [a[0] + mock.scores[q.id], a[1] + q.marks], [0, 0]);
  const pct = ([g, m]) => m ? Math.round(g / m * 100) : 0;
  const [score, max] = sum(qs);
  const extended = sum(qs.filter(q => q.marks >= 6 && q.commandWord !== 'Draw'));
  const short = sum(qs.filter(q => !(q.marks >= 6 && q.commandWord !== 'Draw')));
  const weaker = pct(extended) < pct(short)
    ? 'Your extended answers (6, 9 and 12 marks) dropped the most marks. Practise applying every point to the scenario and ending with a conclusion that follows from your points.'
    : 'Your short answers dropped the most marks. Re-read the "Watch the wording" notes. Most lost marks come from answering a slightly different question.';
  const row = (label, [g, m]) => `
    <div class="mock-row"><span>${label}</span>
      <div class="bar"><div class="bar-fill" style="width:${pct([g, m])}%"></div></div>
      <strong>${g}/${m}</strong></div>`;

  container.innerHTML = `
    <div class="card mock-result">
      <div class="mock-paper-meta">${p.title} · ${mock.minutesUsed} of ${paperMinutes(p)} minutes used</div>
      <div class="mock-score">${score}<span>/${max}</span></div>
      <div class="mock-paper-meta">${pct([score, max])}% · +${score * 2} XP</div>
    </div>
    <h3 style="margin:18px 0 8px">By question</h3>
    ${p.scenarios.map((sid, i) => row(`Q${i + 1} ${qData.scenarios.find(s => s.id === sid).title}`, sum(qs.filter(q => q.scenario === sid)))).join('')}
    <h3 style="margin:18px 0 8px">By type</h3>
    ${row(`Short answers (up to 5 marks${qs.some(q => q.commandWord === 'Draw') ? ', plus the diagram' : ''})`, short)}
    ${row('Extended answers (6, 9, 12 marks)', extended)}
    <p class="q-intro" style="margin-top:12px">${weaker}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
      <button class="btn btn-primary btn-sm" onclick="openMockMenu()">Back to mock papers</button>
      <button class="btn btn-secondary btn-sm" onclick="exitMock()">Back to questions</button>
    </div>`;
}

/* ---- EXTENDED RESPONSE ---- */
function renderExtended() {
  const container = el('extended-content');
  const prompts = loadJSON('data/extended.json') || [];

  container.innerHTML = `
    <h2 style="margin-bottom:16px">Extended Response Builder</h2>
    <p style="color:var(--text2);font-size:14px;margin-bottom:16px">Practise long answers against the clock, timed at exam pace. Plan with the structure, write, then mark yourself against the mark scheme.</p>
    ${prompts.map((p, i) => renderExtPrompt(p, i)).join('')}`;
  restoreExtDrafts();
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
      <div role="button" tabindex="0" class="card-header" aria-expanded="false" aria-controls="body-ext-${i}" onclick="toggleCard('ext-${i}')">
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
        <textarea class="response-area" id="${textId}" aria-label="Your answer" placeholder="Write your extended response here..." oninput="updateWordCount('${p.id}')"></textarea>
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
  const prev = extTimers[id];
  const startTime = prev && prev.remaining > 0 ? prev.remaining : totalSecs;
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
   lives in saved state (per unit), like practice-question drafts. A refresh or a
   closed tab used to lose a whole 9- or 12-mark essay. Emptying the box deletes it. */

function extDrafts() {
  if (!state.extended.drafts) state.extended.drafts = {};
  return state.extended.drafts;
}

function updateWordCount(id, restoring) {
  const textarea = el('ext-text-' + id);
  const wc = el('wc-' + id);
  if (!textarea || !wc) return;
  if (!restoring) {
    if (textarea.value.trim()) extDrafts()[id] = textarea.value; else delete extDrafts()[id];
    scheduleSave();
  }
  const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
  wc.textContent = words + ' words' + (extDrafts()[id] ? ' · saved on this device' : '');
}

function restoreExtDrafts() {
  const drafts = extDrafts();
  Object.keys(drafts).forEach(id => {
    const ta = el('ext-text-' + id);
    if (ta && !ta.value && typeof drafts[id] === 'string') { ta.value = drafts[id]; updateWordCount(id, true); }
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

/* ---- RANKS ----
   Ranks used to be XP thresholds, and rivals gain XP every day forever, so the
   whole ladder drifted upwards until nobody was left in Bronze or Silver. Ranks
   are now places on the table: each rank holds a fixed share of the players,
   shaped like a bell curve, filled from the top. However much XP everyone
   earns, only the top ~5% can ever be Cyber Legend. `share` is a percentage. */
const RANKS = [
  { name: 'Bronze',       icon: '🥉', col: '#B45309', share: 5 },
  { name: 'Silver',       icon: '🥈', col: '#64748B', share: 12 },
  { name: 'Gold',         icon: '🥇', col: '#BE7A1C', share: 20 },
  { name: 'Platinum',     icon: '💠', col: '#0E7490', share: 26 },
  { name: 'Diamond',      icon: '💎', col: '#1B5A5F', share: 20 },
  { name: 'Master',       icon: '🔮', col: '#A85A3C', share: 12 },
  { name: 'Cyber Legend', icon: '👑', col: '#7B61B8', share: 5 }
];

// Places per rank for n players: largest-remainder rounding, at least one each
// (so n must be at least RANKS.length; the ladder always has 41 players).
function rankSizes(n) {
  const raw = RANKS.map(r => r.share * n / 100);
  const sizes = raw.map(x => Math.max(1, Math.floor(x)));
  let spare = n - sizes.reduce((a, b) => a + b, 0);
  const order = raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; spare > 0; k = (k + 1) % order.length, spare--) sizes[order[k][1]]++;
  return sizes;
}

function rankInfo(idx) {
  return { ...RANKS[idx], idx, next: RANKS[idx + 1] ? { ...RANKS[idx + 1], idx: idx + 1 } : null };
}

// Rows arrive sorted best-first; hand out places from the top rank down.
function assignRanks(rows) {
  const sizes = rankSizes(rows.length);
  let pos = 0;
  for (let t = RANKS.length - 1; t >= 0; t--) {
    for (let k = 0; k < sizes[t] && pos < rows.length; k++) rows[pos++].tier = t;
  }
}

function rankChip(tier) {
  const r = RANKS[tier] || RANKS[0];
  return `<span class="rank-chip" style="color:${r.col};border-color:${r.col}40;background:${r.col}14">${r.icon} ${r.name}</span>`;
}

/* ---- SEASONS ----
   Season 2 started with a full reset: every rival and every student begins on
   0 season XP. Lifetime XP (levels, the profile total) is untouched; ranks come
   from what you earn this season. startXP is banked per unit the first time the
   unit is used in the new season. */
const SEASON = { id: 2, name: 'Season 2', start: '2026-09-23' };
const SEASON_START = new Date(SEASON.start + 'T00:00:00').getTime();

function seasonDays(daysAgo = 0) {
  return Math.max(0, Math.floor((Date.now() - SEASON_START) / 86400000) - daysAgo);
}

// The old XP thresholds, used once to carry over rank achievements already earned.
const LEGACY_RANK_MIN = [0, 300, 750, 1500, 2500, 4000, 6000];

function ensureSeason() {
  const cur = state.season;
  if (cur && cur.id === SEASON.id && typeof cur.startXP === 'number') return;
  const xp = state.xp || 0;
  let legacy = 0;
  LEGACY_RANK_MIN.forEach((min, i) => { if (xp >= min) legacy = i; });
  state.season = { id: SEASON.id, startXP: xp };
  state.rankBest = Math.max(state.rankBest || 0, legacy);
  saveState();
}

function seasonXP() {
  ensureSeason();
  return Math.max(0, (state.xp || 0) - state.season.startXP);
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

  const shuffled = shuffle(pool).slice(0, count);
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
    for (const cand of shuffle(pool)) {
      const key = String(cand.term).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      distractors.push(cand.term);
      if (distractors.length === 3) break;
    }
    const options = shuffle([item.term, ...distractors]);
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
            if (opt === q.answer) style = 'background:var(--green-fill);color:#fff;border-color:var(--green-fill)';
            else if (opt === fitbState.selected) style = 'background:var(--red-fill);color:#fff;border-color:var(--red-fill)';
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
        <button class="btn btn-primary" style="flex:1;padding:18px;font-size:18px;background:var(--green-fill)" onclick="answerTF(true)" id="tf-true-btn">✅ True</button>
        <button class="btn btn-primary" style="flex:1;padding:18px;font-size:18px;background:var(--red-fill)" onclick="answerTF(false)" id="tf-false-btn">❌ False</button>
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
        <div class="tile-code game-icon" aria-hidden="true">⚡</div>
        <h3>Quick-fire MCQ</h3>
        <p>10 multiple-choice questions generated from your flashcards. +10 XP per correct answer.</p>
      </div>
      <div role="button" tabindex="0" class="section-tile" onclick="startMatch()">
        <div class="tile-accent" style="background:var(--pink)"></div>
        <div class="tile-code game-icon" aria-hidden="true">🧩</div>
        <h3>Match</h3>
        <p>Pair terms with definitions against the clock. +30 XP per clear.${best ? ` Best time: <strong>${best}s</strong>` : ''}</p>
      </div>
      <div role="button" tabindex="0" class="section-tile" onclick="startTrueFalse()">
        <div class="tile-accent" style="background:var(--green)"></div>
        <div class="tile-code game-icon" aria-hidden="true">✅</div>
        <h3>True or False Blitz</h3>
        <p>30 seconds. Rapid-fire true/false statements from your flashcards. +5 XP per correct.${tfBest ? ` Best: <strong>${tfBest}</strong>` : ''}</p>
      </div>
      <div role="button" tabindex="0" class="section-tile" onclick="startFITB()">
        <div class="tile-accent" style="background:var(--accent2)"></div>
        <div class="tile-code game-icon" aria-hidden="true">✏️</div>
        <h3>Fill in the Blank</h3>
        <p>A definition with the key term removed — pick the right answer from 4 options. +8 XP per correct.</p>
      </div>
    </div>
    <h3 style="margin:24px 0 12px;font-size:14px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px">⚔️ Battle arena — vs the leaderboard</h3>
    <div class="grid2">
      ${Object.entries(BATTLE_MODES).map(([key, m]) => `
        <div role="button" tabindex="0" class="section-tile" onclick="startBattle('${key}')">
          <div class="tile-accent" style="background:${key === 'duel' ? 'var(--pink)' : 'var(--accent)'}"></div>
          <div class="tile-code game-icon" aria-hidden="true">${m.icon}</div>
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
  const days = seasonDays(daysAgo);
  const h = nameHash(bot.name, 997);
  // Last season's standing (base) sets a small head start and the pace; the old
  // climbers (high rate) keep some momentum. Daily form (±16) lets close rivals
  // genuinely overtake each other.
  const headStart = Math.round(bot.base / 60);
  const pace = 8 + bot.base / 260 + (bot.rate - 12) * 0.4;
  const form = days ? (((days * h) % 17) - 8) * 2 : 0;
  return Math.max(0, Math.round(headStart + pace * days + form));
}

function nameHash(name, mod = 9973) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % mod;
  return h;
}

/* Season standings. xp here is SEASON XP. Ties go to the rival, so a fresh
   season starts you at the bottom. Every row gets .pos and .tier. */
function getLBRows(daysAgo = 0) {
  const rows = LB_BOTS.map(b => ({ name: b.name, tag: b.tag, col: b.col, xp: botXP(b, daysAgo), me: false }));
  rows.push({ name: 'You', tag: `Level ${xpLevel()}`, col: pCol(), xp: seasonXP(), me: true });
  rows.sort((a, b) => b.xp - a.xp || a.me - b.me);
  rows.forEach((r, i) => { r.pos = i + 1; });
  assignRanks(rows);
  if (!daysAgo) {
    const me = rows.find(r => r.me);
    if (me.tier > (state.rankBest || 0)) { state.rankBest = me.tier; saveState(); }
  }
  return rows;
}

function myStanding() {
  return getLBRows().find(r => r.me);
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
      ${rankChip(r.tier)}
      <span class="lb-xp">${r.xp.toLocaleString()} XP</span>
    </div>`;
}

/* "Today on the ladder" — real overtakes + rank-ups, padded with flavour */
function ladderFeedHTML() {
  const move = lbMovementMap();
  const events = [];

  const tierYesterday = {};
  getLBRows(1).forEach(r => { tierYesterday[r.name] = r.tier; });
  getLBRows().forEach(r => {
    if (r.me || tierYesterday[r.name] === undefined) return;
    const now = RANKS[r.tier];
    if (r.tier > tierYesterday[r.name]) events.push(`${now.icon} <strong>${r.name}</strong> took a ${now.name} place`);
    else if (r.tier < tierYesterday[r.name]) events.push(`▼ <strong>${r.name}</strong> was pushed down to ${now.name}`);
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
    <p style="color:var(--text2);font-size:13px;margin-bottom:12px">${lbMotivator(rows)} <span class="sim-inline">(Simulated rivals, not real students.)</span></p>
    <div class="lb-board">${view.map(r => lbRowHTML(r, move)).join('')}</div>
    <button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="navigate('leaderboard')">View full leaderboard →</button>`;
}

/* full view: every player, grouped by rank tier (used on the Leaderboard page) */
function renderLeaderboardByTier() {
  const rows = getLBRows();
  const move = lbMovementMap();
  const sizes = rankSizes(rows.length);

  return `
    ${RANKS.map((t, i) => ({ t, i })).reverse().map(({ t, i }) => {
      const members = rows.filter(r => r.tier === i);
      if (!members.length) return '';
      const mine = members.some(r => r.me);
      return `
        <div class="lb-tier${mine ? ' mine' : ''}">
          <div class="lb-tier-head" style="color:${t.col}">
            <span>${t.icon} ${t.name}</span>
            <span class="lb-tier-count">${sizes[i]} place${sizes[i] !== 1 ? 's' : ''} · ${RANKS[i].share}% of players${mine ? ' · your division' : ''}</span>
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
  const rows = getLBRows();
  const me = rows.find(r => r.me);
  const rank = rankInfo(me.tier);
  const sizes = rankSizes(rows.length);
  const inMine = rows.filter(r => r.tier === me.tier);
  // To move up you must overtake the lowest player in the rank above.
  const gate = rank.next ? rows.filter(r => r.tier === rank.next.idx).pop() : null;
  const toNext = gate ? Math.max(1, gate.xp - me.xp + 1) : 0;
  const floor = inMine[inMine.length - 1].xp;
  const pct = gate ? Math.min(100, Math.round(((me.xp - floor) / Math.max(1, gate.xp + 1 - floor)) * 100)) : 100;
  const status = gate
    ? `${toNext.toLocaleString()} season XP to overtake <strong>${gate.name}</strong> for a ${rank.next.icon} ${rank.next.name} place, roughly ${Math.max(1, Math.ceil(toNext / 10))} correct MCQs or ${Math.max(1, Math.ceil(toNext / 30))} match clears.`
    : me.pos === 1
      ? `Top of the table. Only ${sizes[me.tier]} players can be ${rank.name}, so hold on to it.`
      : `You hold a ${rank.name} place. Stay in the top ${sizes[me.tier]} to keep it.`;

  return `
    <div class="card" style="margin-bottom:18px">
      <h3 style="margin-bottom:4px">${rank.icon} Your rank: <span style="color:${rank.col}">${rank.name}</span></h3>
      <p style="font-size:13px;color:var(--text2);margin-bottom:10px">${status}</p>
      <div class="progress-bar-wrap"><div class="progress-bar" style="width:${pct}%"></div></div>
      <div class="rank-ladder">
        ${RANKS.map((r, i) => `
          <div class="rank-step${i === me.tier ? ' current' : ''}${i <= me.tier ? ' unlocked' : ''}">
            <span class="rank-step-icon">${r.icon}</span>
            <span class="rank-step-name">${r.name}</span>
            <span class="rank-step-xp">${sizes[i]} place${sizes[i] !== 1 ? 's' : ''}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderLeaderboardPage() {
  const isOverall = lbView === 'overall';

  el('leaderboard-content').innerHTML = `
    <h2 style="margin-bottom:6px">Leaderboard</h2>
    <p style="color:var(--text2);font-size:14px;margin-bottom:14px">Earn XP from flashcards, games and quizzes to climb. Rivals revise daily — fall behind and they'll pass you.</p>
    <p class="sim-note">The other players are simulated practice rivals, not real students. Your progress stays on this device.</p>
    <div class="season-banner"><strong>${SEASON.name}</strong> · ranks reset on ${new Date(SEASON_START).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}. Each rank has a fixed number of places, so to move up you have to overtake someone.</div>
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
  const qs = shuffle(cards).slice(0, 10).map(c => {
    let pool = cards.filter(x => x.id !== c.id && x.section === c.section);
    if (pool.length < 3) pool = cards.filter(x => x.id !== c.id);
    const opts = shuffle(pool).slice(0, 3).map(d => ({ text: d.back, correct: false }));
    opts.push({ text: c.back, correct: true });
    shuffleInPlace(opts);
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
  for (const cand of shuffle(pool)) {
    const key = String(cand.term).toLowerCase();
    if (usedTerms.has(key)) continue;
    usedTerms.add(key);
    pairs.push(cand);
    if (pairs.length === 6) break;
  }
  const tiles = [];
  pairs.forEach((p, i) => {
    tiles.push({ pair: i, kind: 'term', text: p.term });
    // Definitions are kept to about one line (validate_data.py caps them), so this only guards stray long ones.
    tiles.push({ pair: i, kind: 'def', text: p.definition.length > 120 ? p.definition.substring(0, 120) + '…' : p.definition });
  });
  shuffleInPlace(tiles);
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
  const meXp = seasonXP();
  const gap = r.xp - meXp;

  openModal(`
    <button class="modal-close" onclick="closeModal()" aria-label="Close">✕</button>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
      <span class="lb-av" style="background:${r.col};width:56px;height:56px;font-size:24px" aria-hidden="true">${name.charAt(0)}</span>
      <div>
        <h2 id="modal-title" style="margin-bottom:2px;font-size:20px">${name}</h2>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          ${rankChip(r.tier)}
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
    <p style="font-size:12px;color:var(--text2);margin-bottom:12px">Simulated practice rival. Not a real student.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="closeModal();challengePlayer('${name}')">🤺 Challenge to Duel</button>
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>`);
}

/* ---- MODAL DIALOG ----
   One dialog, shared by the player card and the exam-date picker. Focus moves
   in on open, Tab stays inside, Escape closes, and focus returns to whatever
   opened it. The content must give its heading id="modal-title". */
let modalReturnFocus = null;

function openModal(html) {
  const overlay = el('player-modal-overlay');
  const box = el('player-modal');
  modalReturnFocus = document.activeElement;
  box.innerHTML = html;
  if (el('modal-title')) box.setAttribute('aria-labelledby', 'modal-title');
  else box.removeAttribute('aria-labelledby');
  overlay.classList.add('show');
  const first = box.querySelector('input, button:not(.modal-close)') || box.querySelector('button');
  if (first) first.focus();
}

function closeModal() {
  el('player-modal-overlay').classList.remove('show');
  const back = modalReturnFocus;
  modalReturnFocus = null;
  if (back && document.contains(back)) back.focus();
}

// Kept for any older call site.
function closePlayerCard() { closeModal(); }

document.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const overlay = el('player-modal-overlay');
  if (!overlay || !overlay.classList.contains('show')) return;
  const items = [...el('player-modal').querySelectorAll('button, input, select, textarea, [tabindex="0"]')]
    .filter(n => !n.disabled && n.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (!el('player-modal').contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

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
  return shuffle(pool).slice(0, n).map(p => {
    // Distinct from the answer AND each other: Unit 1 repeats 17 terms, which put
    // two identical buttons on the board.
    const seen = new Set([p.term.toLowerCase()]);
    const wrong = [];
    for (const x of shuffle(pool)) {
      const k = x.term.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      wrong.push(x.term);
      if (wrong.length === 3) break;
    }
    const opts = shuffle([...wrong, p.term]);
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
  const myTier = me.tier;
  const pool = others.map(o => ({
    o,
    w: 1 / (1 + Math.pow(Math.abs(o.tier - myTier), 2) * 3) + 0.04
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
  }
  gamesMode = 'battle';
  renderGames();
  if (mode !== 'blitz') startBattleQuestion();
}

function blitzLeft() {
  return Math.max(0, battle.blitzEnd - Date.now());
}

/* Blitz runs ONE clock for the whole minute; it also moves the rivals' scores.
   It must survive answering questions (only a per-question timer is stopped
   there) and is restarted by renderBattleUI if you left the page and came back. */
function startBlitzTick() {
  stopBattleTick();
  battleTick = setInterval(() => {
    if (currentPage !== 'games' || !battle || battle.mode !== 'blitz' || battle.over) { stopBattleTick(); return; }
    const left = blitzLeft();
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
  const blitz = battle.mode === 'blitz';
  if (blitz && blitzLeft() <= 0) { finishBattle(); renderBattleEnd(container); return; }

  container.innerHTML = `
    <div class="quiz-wrap" style="max-width:680px">
      <div class="quiz-progress">
        <span>${BATTLE_MODES[battle.mode].icon} ${BATTLE_MODES[battle.mode].name}${target}${blitz ? ` · <strong id="blitz-clock">${Math.ceil(blitzLeft() / 1000)}s</strong>` : ''}</span>
        <div class="bar"><div class="bar-fill" id="battle-bar" style="width:${blitz ? blitzLeft() / 600 : 100}%"></div></div>
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
  if (blitz && !battleTick) startBlitzTick();
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
  // Only the per-question timer stops here. Blitz's clock is for the whole minute.
  if (battle.mode !== 'blitz') stopBattleTick();
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
    { icon: '🥈', name: 'Silver Surfer',   desc: 'Reach Silver rank',             done: (state.rankBest || 0) >= 1 },
    { icon: '💎', name: 'Shine Bright',    desc: 'Reach Diamond rank',            done: (state.rankBest || 0) >= 4 },
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
  // Padded viewBox so the stroke and end dot aren't clipped; stretches to its card.
  const pad = 4;
  return `<svg width="100%" height="${height}" viewBox="${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}" preserveAspectRatio="none" style="display:block;overflow:visible">
    <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
  </svg>`;
}

function renderProfile() {
  loadData(unitLetters());
  const xp = state.xp || 0;
  const rows = getLBRows();
  const me = rows.find(x => x.me);
  const rc = ragCounts();
  const act = state.activity || {};
  const totalActs = Object.values(act).reduce((a, b) => a + b, 0);

  let last7 = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    last7 += act[localDateStr(d)] || 0;
  }

  const xpByDay = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    xpByDay.push(act[localDateStr(d)] || 0);
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
          ${rankChip(me.tier)}
          <span class="badge">Level ${xpLevel()}</span>
          <span class="badge">#${me.pos} of ${rows.length}</span>
          <span class="badge">${currentStreak()}-day streak</span>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-family:'Fraunces',Georgia,serif;font-size:28px;font-weight:600;color:var(--accent2)">${xp.toLocaleString()}</div>
        <div style="font-size:12px;color:var(--text2);font-weight:700">TOTAL XP</div>
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

  // Marks as they appear on the real Unit 1 paper ("Give two" = 2, one per point).
  const commandWords = [
    ['Give / State', '1 per point', 'Just the point. No explanation needed.'],
    ['Identify', '1', 'Pick out the relevant fact, often from the scenario.'],
    ['Describe', '3–4', 'Linked points saying how or what. "Describe one": point, justify, expand.'],
    ['Explain', '2–4', 'Point + expansion ("because…", "so…") linked to the scenario. 2 marks each.'],
    ['Draw', '6', 'A diagram with every device from the scenario and each connection labelled.'],
    ['Discuss', '6', 'Both sides, applied to the scenario. Marked by level.'],
    ['Evaluate', '9–12', 'Both sides + a conclusion that follows from your points. Marked by level.']
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
        <li><strong>Conclusion</strong> — a justified judgement ("Overall… because…"). No supported conclusion = stuck in the lower levels</li>
      </ul>
      <div class="exam-tip">Generic answers cap your marks. Name the business, its size, its data, its budget — every paragraph.</div>
      <div class="exam-tip" style="margin-top:8px">Read every word of the question. "Other than…", "to the customers" and "acceptable" each rule out answers that would otherwise score.</div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:6px">Past papers and mark schemes</h3>
      <p style="font-size:14px;color:var(--text2);margin-bottom:12px">Pearson publishes past papers, mark schemes and examiner reports for both units. They are Pearson's copyright, so they are not copied here. Open them from Pearson's site, then practise against the clock with the mock papers on the Questions page.</p>
      <a class="btn btn-secondary btn-sm" href="https://qualifications.pearson.com/en/qualifications/btec-nationals/information-technology-aaq.coursematerials.html" target="_blank" rel="noopener noreferrer">Pearson course materials ↗</a>
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
    <input type="search" class="search-bar" id="search-input" aria-label="Search revision content" placeholder="Search spec codes, terms, definitions..." oninput="doSearch(this.value)" autofocus>
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
    // The query is the student's own typing and must never be parsed as HTML.
    container.innerHTML = `<div class="empty-state"><div class="icon">😕</div><p>No results for "${escapeHTML(query)}"</p></div>`;
    return;
  }

  container.innerHTML = results.map(r => `
    <div role="button" tabindex="0" class="search-result" onclick="goToResult('${r.section}', '${r.code}')">
      <div style="display:flex;gap:8px;margin-bottom:4px">
        <span class="badge">${r.code}</span>
        <span class="badge" style="background:var(--accent-light);color:var(--accent);border-color:transparent">${r.section} — ${r.sectionTitle}</span>
      </div>
      <h4>${highlight(r.term, query)}</h4>
      <p>${highlight(r.definition.substring(0, 120), query)}${r.definition.length > 120 ? '...' : ''}</p>
    </div>`).join('');
}

/* Matches against the raw text, then escapes every piece, so neither the query
   nor the content can inject markup, and a match never lands inside an entity. */
function highlight(text, query) {
  text = String(text);
  if (!query) return escapeHTML(text);
  const re = new RegExp(escapeRe(query), 'gi');
  let out = '', last = 0, m;
  while ((m = re.exec(text))) {
    if (!m[0].length) { re.lastIndex++; continue; }
    out += escapeHTML(text.slice(last, m.index)) + '<span class="highlight">' + escapeHTML(m[0]) + '</span>';
    last = m.index + m[0].length;
  }
  return out + escapeHTML(text.slice(last));
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
        const header = body.previousElementSibling;
        if (header) header.setAttribute('aria-expanded', 'true');
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
      <div class="streak-badge">${currentStreak()}-day streak</div>
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
      <button class="btn btn-sm" style="background:var(--red-fill);color:#fff" onclick="confirmReset()">Reset all progress</button>
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
      title: `Flashcards (${flashDue} today)`,
      items: (() => {
        const t = dueFlashcards();
        const out = [];
        if (t.reviews.length) out.push(`Review the ${t.reviews.length} card${t.reviews.length === 1 ? '' : 's'} due today, Box 1 (weakest) first`);
        if (t.fresh.length) out.push(`Learn ${t.fresh.length} new card${t.fresh.length === 1 ? '' : 's'}`);
        return out;
      })()
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
      'Mark yourself against the mark scheme',
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
/* Called from bumpActivity, so only real revision moves the streak. The caller saves. */
function updateStreak() {
  const todayStr = today();
  const last = state.streak.last;
  if (last === todayStr) return;
  state.streak.count = last === yesterdayStr() ? state.streak.count + 1 : 1;
  state.streak.last = todayStr;
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
}

// The streak to show: a run that missed yesterday is already broken, even though
// the stored count only resets on the next revision.
function currentStreak() {
  const last = state.streak.last;
  return last === today() || last === yesterdayStr() ? state.streak.count : 0;
}

/* ---- EXPORT/IMPORT/RESET ---- */
function exportData() {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `btec-revision-${today()}.json`;
  a.click();
  // Revoking straight after click() can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
        syncThemeButtons();
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

/* Drafts, essays and the mock save 400ms after typing stops. A phone can kill a
   backgrounded tab, and a closed tab never fires the timer, so a PENDING save is
   flushed on hide. Only a pending one: saving unconditionally meant that closing
   a stale second tab wrote its old copy over newer progress from another tab. */
let pendingSave = null;

function scheduleSave() {
  clearTimeout(pendingSave);
  pendingSave = setTimeout(() => { pendingSave = null; saveState(); }, 400);
}

function cancelPendingSave() {
  clearTimeout(pendingSave);
  pendingSave = null;
}

function flushPendingSaves() {
  if (!pendingSave) return;
  cancelPendingSave();
  saveState();
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushPendingSaves();
});
window.addEventListener('pagehide', flushPendingSaves);

/* ---- INIT ---- */
/* Backdrops are dismiss targets, so they stay out of the tab order. Escape is
   the keyboard equivalent of clicking outside. */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const modal = el('player-modal-overlay');
  if (modal && modal.classList.contains('show')) { closeModal(); return; }
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
  document.querySelectorAll('.unit-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => switchUnit(btn.dataset.unit));
  });
  applyUnitChrome();
  syncThemeButtons();
  loadData(unitLetters());
  updateNavAvatar();
  navigate('home');
});

/* Flashcards: Space flips, → is "Got it", ← is "Didn't know". The arrows only
   grade once the card is flipped, matching the on-screen buttons. */
document.addEventListener('keydown', e => {
  if (currentPage !== 'flashcards' || e.repeat) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (t && (/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable)) return;
  if (!el('flash-inner')) return;
  if (e.key === ' ' || e.key === 'Spacebar') {
    // A focused button or role="button" (the card itself) handles Space already.
    if (e.defaultPrevented || (t && (t.tagName === 'BUTTON' || t.getAttribute('role') === 'button'))) return;
    e.preventDefault();
    flipFlashcard();
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    if (!flashFlipped) return;
    e.preventDefault();
    answerFlash(e.key === 'ArrowRight');
  }
});

/* Practice questions: ← / → step between questions, as on the flashcards. Never
   while typing, and never from a mark-scheme tick box or level radio. */
document.addEventListener('keydown', e => {
  if (currentPage !== 'questions' || qMode !== 'practice' || e.repeat) return;
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const t = e.target;
  if (t && (/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable)) return;
  if (!el('q-stage')) return;
  e.preventDefault();
  practiceStep(e.key === 'ArrowRight' ? 1 : -1);
});

document.addEventListener('keydown', e => {
  if (gamesMode === 'tf') {
    if (e.key === 'ArrowRight' || e.key === 't' || e.key === 'T') { e.preventDefault(); answerTF(true); }
    if (e.key === 'ArrowLeft'  || e.key === 'f' || e.key === 'F') { e.preventDefault(); answerTF(false); }
  }
});

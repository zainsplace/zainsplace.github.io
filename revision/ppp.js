/* ===== PPP ENGINE =====
   Pure logic for the Pure Past Papers mode on the Questions page: part clocks,
   paper rest periods, what to do next, topic sets, diagnosis checks, and
   checking saved PPP state. No DOM and no app globals, so tests/ppp.test.js
   can load it in Node. Dates are local 'YYYY-MM-DD' strings, which compare
   correctly as strings. */
const PPP = (() => {
  const REST_DAYS = 21;            // a sat paper rests this long before a re-sit
  const SECONDS_PER_MARK = 80;     // exam pace: 90 marks in 120 minutes
  const REASONS = ['knowledge', 'technique', 'misread', 'time', 'careless'];
  const TOPIC_MAX = 8;
  const MAX_SITTINGS = 100;
  const PAPERS_FOR_PHASE_3 = 2;
  const STEPS = ['answer', 'mark', 'diagnose', 'fix', 'redo', 'redomark', 'next'];

  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const ID_RE = /^[A-Za-z0-9._-]{1,64}$/;
  const UNSAFE = new Set(['__proto__', 'constructor', 'prototype']);

  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const isStr = v => typeof v === 'string';
  const isNum = v => typeof v === 'number' && isFinite(v);
  const intIn = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  const isDate = v => isStr(v) && DATE_RE.test(v);

  // Built from its parts so the result is local midnight everywhere.
  function addDays(date, n) {
    const [y, m, d] = date.split('-').map(Number);
    const t = new Date(y, m - 1, d + n);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }

  function defaultState() {
    return { phase: 1, sittings: [], active: {} };
  }

  function partSeconds(marks) {
    return marks * SECONDS_PER_MARK;
  }

  /* ---- Sealed papers: their parts appear only in PPP, so they stay cold ---- */
  function sealedScenarios(qfile) {
    const ids = new Set();
    ((qfile && qfile.papers) || []).forEach(p => {
      if (p.sealed) (p.scenarios || []).forEach(s => ids.add(s));
    });
    return ids;
  }

  function isSealed(q, qfile) {
    return !!q.scenario && sealedScenarios(qfile).has(q.scenario);
  }

  function bankQuestions(qfile) {
    const sealed = sealedScenarios(qfile);
    return ((qfile && qfile.questions) || []).filter(q => !(q.scenario && sealed.has(q.scenario)));
  }

  function hasPPP(qfile) {
    return ((qfile && qfile.papers) || []).some(p => p.sealed);
  }

  /* ---- Paper rest ---- */
  function lastSat(sittings, paperId) {
    let last = null;
    sittings.forEach(s => {
      if (s.kind === 'paper' && s.ref === paperId && s.status === 'done' && (!last || s.date > last)) last = s.date;
    });
    return last;
  }

  function restUntil(sittings, paperId) {
    const last = lastSat(sittings, paperId);
    return last ? addDays(last, REST_DAYS) : null;
  }

  function isResting(sittings, paperId, today) {
    const until = restUntil(sittings, paperId);
    return !!until && today < until;
  }

  // A paper never sat comes first, in file order; then the one sat longest ago
  // that has finished resting. null when every paper is resting.
  function nextPaper(papers, sittings, today) {
    const fresh = papers.find(p => !lastSat(sittings, p.id));
    if (fresh) return fresh.id;
    const ready = papers
      .filter(p => !isResting(sittings, p.id, today))
      .sort((a, b) => lastSat(sittings, a.id).localeCompare(lastSat(sittings, b.id)));
    return ready.length ? ready[0].id : null;
  }

  /* ---- Phases ---- */
  function topicCounts(letters, sittings) {
    const n = {};
    letters.forEach(L => { n[L] = 0; });
    sittings.forEach(s => {
      if (s.kind === 'topic' && s.status === 'done' && s.ref in n) n[s.ref] += 1;
    });
    return n;
  }

  function nextTopicSection(letters, sittings) {
    const n = topicCounts(letters, sittings);
    return letters.reduce((best, L) => (n[L] < n[best] ? L : best), letters[0]);
  }

  function suggestPhase(phase, letters, sittings) {
    if (phase === 1) {
      const n = topicCounts(letters, sittings);
      return letters.every(L => n[L] > 0) ? 2 : null;
    }
    if (phase === 2) {
      const papers = sittings.filter(s => s.kind === 'paper' && s.status === 'done').length;
      return papers >= PAPERS_FOR_PHASE_3 ? 3 : null;
    }
    return null;
  }

  function doNext({ phase, letters, papers, sittings, today }) {
    if (phase === 1) return { kind: 'topic', section: nextTopicSection(letters, sittings) };
    const paperId = nextPaper(papers, sittings, today);
    return paperId ? { kind: 'paper', paperId, timed: phase === 3 } : { kind: 'rest' };
  }

  /* ---- Topic sets ----
     Never-tried parts first (file order), then lowest last mark. Picked across
     scenarios in turn so one scenario does not fill the set. */
  function buildTopicSet(bank, section, latest) {
    const ranked = bank.filter(q => q.section === section).sort((a, b) => {
      const ta = a.id in latest, tb = b.id in latest;
      if (ta !== tb) return ta ? 1 : -1;
      return ta ? latest[a.id] - latest[b.id] : 0;
    });
    const want = Math.min(TOPIC_MAX, ranked.length);
    const picked = [];
    const used = new Set();
    while (picked.length < want) {
      const next = ranked.find(q => !picked.includes(q) && !used.has(q.scenario || q.id));
      if (!next) { used.clear(); continue; }
      picked.push(next);
      used.add(next.scenario || next.id);
    }
    return picked.map(q => q.id);
  }

  /* ---- Diagnosis ---- */
  function lostMarks(score, marks) {
    return Math.max(0, marks - score);
  }

  // One valid reason for every lost mark.
  function partDiagnosed(reasons, lost) {
    return Array.isArray(reasons) && reasons.length === lost && reasons.every(x => REASONS.includes(x));
  }

  function needsWrittenFix(reasons) {
    return Array.isArray(reasons) && reasons.includes('knowledge');
  }

  function reasonCounts(parts) {
    const n = {};
    REASONS.forEach(r => { n[r] = 0; });
    Object.values(parts).forEach(p => (p.reasons || []).forEach(r => { if (r in n) n[r] += 1; }));
    return n;
  }

  function recordSitting(st, sitting) {
    st.sittings.push(sitting);
    if (st.sittings.length > MAX_SITTINGS) st.sittings.splice(0, st.sittings.length - MAX_SITTINGS);
  }

  /* ---- Saved state ----
     Everything here came from localStorage or an imported backup, so each
     field is checked against the shape the app writes. Anything else is
     dropped rather than trusted. */
  function cleanMap(raw, keyOk, valueOk) {
    const out = {};
    if (!isObj(raw)) return out;
    Object.keys(raw).forEach(k => {
      if (!UNSAFE.has(k) && keyOk(k) && valueOk(raw[k])) out[k] = raw[k];
    });
    return out;
  }

  const reasonList = v => Array.isArray(v) && v.every(x => REASONS.includes(x));
  const draftReasons = v => Array.isArray(v) && v.length <= 12 && v.every(x => x === null || REASONS.includes(x));
  const seconds = v => intIn(v, 0, 86400);

  function coerceSitting(x) {
    if (!isObj(x) || !isStr(x.id) || !['paper', 'topic'].includes(x.kind) || !isStr(x.ref)
        || !isDate(x.date) || !['done', 'abandoned'].includes(x.status)) return null;
    return {
      id: x.id, kind: x.kind, ref: x.ref, date: x.date, status: x.status,
      score: intIn(x.score, 0, 999) ? x.score : 0,
      max: intIn(x.max, 0, 999) ? x.max : 0,
      minutesUsed: isNum(x.minutesUsed) && x.minutesUsed >= 0 ? x.minutesUsed : 0,
      parts: cleanMap(x.parts, k => ID_RE.test(k), p => isObj(p) && intIn(p.score, 0, 99)
        && reasonList(p.reasons) && isStr(p.fix) && (p.redo === null || intIn(p.redo, 0, 99)) && seconds(p.seconds))
    };
  }

  function coerceActive(a) {
    if (!isObj(a) || !isStr(a.id) || !['paper', 'topic'].includes(a.kind) || !isStr(a.ref)
        || !STEPS.includes(a.step)) return null;
    if (!Array.isArray(a.qIds) || !a.qIds.length || !a.qIds.every(id => isStr(id) && ID_RE.test(id))) return null;
    if (!intIn(a.idx, 0, a.qIds.length - 1)) return null;
    if (!isNum(a.startedAt) || !isNum(a.partStartedAt) || !(a.partEndAt === null || isNum(a.partEndAt))) return null;
    const ids = new Set(a.qIds);
    const inSit = k => ids.has(k);
    return {
      id: a.id, kind: a.kind, ref: a.ref, timed: a.timed === true, step: a.step,
      startedAt: a.startedAt, qIds: a.qIds.slice(), idx: a.idx,
      partStartedAt: a.partStartedAt, partEndAt: a.partEndAt,
      answers: cleanMap(a.answers, k => /^ppp-[A-Za-z0-9._-]{1,80}$/.test(k), isStr),
      redoAnswers: cleanMap(a.redoAnswers, k => /^pppr-[A-Za-z0-9._-]{1,80}$/.test(k), isStr),
      scores: cleanMap(a.scores, inSit, v => intIn(v, 0, 99)),
      redoScores: cleanMap(a.redoScores, inSit, v => intIn(v, 0, 99)),
      reasons: cleanMap(a.reasons, inSit, draftReasons),
      fixes: cleanMap(a.fixes, inSit, isStr),
      seconds: cleanMap(a.seconds, inSit, seconds)
    };
  }

  function coerceState(raw) {
    const s = defaultState();
    if (!isObj(raw)) return s;
    if (intIn(raw.phase, 1, 3)) s.phase = raw.phase;
    if (Array.isArray(raw.sittings)) s.sittings = raw.sittings.map(coerceSitting).filter(Boolean).slice(-MAX_SITTINGS);
    s.active = coerceActive(raw.active) || {};
    return s;
  }

  // Drops anything that points at a part the current data no longer has.
  function pruneUnknown(st, known) {
    st.sittings.forEach(s => Object.keys(s.parts).forEach(id => { if (!known.has(id)) delete s.parts[id]; }));
    if (Array.isArray(st.active.qIds) && !st.active.qIds.every(id => known.has(id))) st.active = {};
    return st;
  }

  const api = {
    REST_DAYS, SECONDS_PER_MARK, REASONS, TOPIC_MAX, MAX_SITTINGS,
    addDays, defaultState, partSeconds, isSealed, bankQuestions, hasPPP,
    lastSat, restUntil, isResting, nextPaper,
    topicCounts, nextTopicSection, suggestPhase, doNext, buildTopicSet,
    lostMarks, partDiagnosed, needsWrittenFix, reasonCounts, recordSitting, coerceState, pruneUnknown
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  return api;
})();

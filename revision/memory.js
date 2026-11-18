/* ===== MEMORY ENGINE =====
   Pure logic for per-term memory: how well the student knows each spec term and
   when to ask about it again. No DOM and no app globals, so tests/memory.test.js
   can load it in Node.

   Each term code (e.g. 'B1.1.1') has a record { s, due, seen, lapses }:
   s is strength 0..5, due the next review date, seen the last time it was
   answered, lapses how often it was forgotten. Dates are local 'YYYY-MM-DD'
   strings, compared as strings.

   A right answer waits LADDER[strength before the answer] days and then lifts
   strength by one. A wrong answer drops strength by two (never below 1) and
   brings the term back tomorrow. A term is 'new' until answered, 'forgotten'
   once it is due, 'mastered' at strength 3+ while not due, else 'learning'.

   buildRound picks the terms for a round: this lesson's first (forgotten,
   learning, new, mastered), then earlier forgotten and learning terms. */
const MEMORY = (() => {
  const LADDER = [1, 3, 7, 16, 35, 90];
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const CODE_RE = /^[A-Z][0-9]+(\.[0-9]+)+$/;

  function addDays(str, n) {
    const [y, m, d] = str.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + n);
    const p = (v) => String(v).padStart(2, '0');
    return dt.getFullYear() + '-' + p(dt.getMonth() + 1) + '-' + p(dt.getDate());
  }

  function status(rec, todayStr) {
    if (!rec || !rec.s) return 'new';
    if (rec.due <= todayStr) return 'forgotten';
    return rec.s >= 3 ? 'mastered' : 'learning';
  }

  function applyResult(rec, ok, todayStr) {
    const prev = rec || { s: 0, due: '', seen: '', lapses: 0 };
    const lapses = prev.lapses || 0;
    if (ok) {
      const days = LADDER[Math.min(prev.s || 0, 5)];
      return {
        rec: { s: Math.min(5, (prev.s || 0) + 1), due: addDays(todayStr, days), seen: todayStr, lapses },
        days
      };
    }
    return {
      rec: { s: Math.max(1, (prev.s || 0) - 2), due: addDays(todayStr, 1), seen: todayStr, lapses: lapses + 1 },
      days: 1
    };
  }

  // A hinted right answer: strength is neither raised nor dropped.
  function touch(rec, todayStr) {
    const prev = rec || {};
    return { s: prev.s || 1, due: addDays(todayStr, 1), seen: todayStr, lapses: prev.lapses || 0 };
  }

  function ringPercent(codes, memory) {
    if (!codes.length) return 0;
    let sum = 0;
    for (const c of codes) sum += (memory[c] && memory[c].s) || 0;
    return Math.round((sum / codes.length / 5) * 100);
  }

  function buildRound({ nodeCodes, earlierCodes, memory, todayStr, max = 11 }) {
    const out = [];
    const seen = new Set();
    const add = (c) => {
      if (out.length < max && !seen.has(c)) { seen.add(c); out.push(c); }
    };
    const group = (codes, st) => codes.filter((c) => status(memory[c], todayStr) === st);
    for (const st of ['forgotten', 'learning', 'new', 'mastered']) group(nodeCodes, st).forEach(add);
    for (const st of ['forgotten', 'learning']) group(earlierCodes, st).forEach(add);
    return out;
  }

  function combo(runRight) {
    return runRight >= 5 ? 2 : runRight >= 3 ? 1.5 : 1;
  }

  // Build a starting memory from older progress (lessons done, RAG, flashcard boxes).
  function seed({ items, lessonsDone, rag, flashBoxes, todayStr }) {
    const done = lessonsDone instanceof Set ? lessonsDone : new Set(lessonsDone || []);
    const out = {};
    for (const { code, nodeId } of items) {
      let s = 0;
      if (done.has(nodeId)) s = (rag && rag[code] === 'green') ? 3 : 2;
      const box = flashBoxes && flashBoxes[code];
      if (box > s) s = Math.min(5, Math.floor(box));
      let due;
      if (rag && rag[code] === 'red') { s = 1; due = todayStr; }
      if (!s) continue;
      out[code] = { s, due: due || addDays(todayStr, LADDER[s - 1]), seen: '', lapses: 0 };
    }
    return out;
  }

  function coerce(raw) {
    const out = {};
    if (!raw || typeof raw !== 'object') return out;
    for (const k of Object.keys(raw)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype' || !CODE_RE.test(k)) continue;
      const v = raw[k];
      if (!v || typeof v !== 'object') continue;
      const s = Math.max(0, Math.min(5, Math.floor(Number(v.s)) || 0));
      const lapses = Number.isInteger(v.lapses) && v.lapses > 0 ? v.lapses : 0;
      out[k] = {
        s,
        due: typeof v.due === 'string' && DATE_RE.test(v.due) ? v.due : '',
        seen: typeof v.seen === 'string' && DATE_RE.test(v.seen) ? v.seen : '',
        lapses
      };
    }
    return out;
  }

  const api = { LADDER, addDays, status, applyResult, touch, ringPercent, buildRound, combo, seed, coerce };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  return api;
})();

/* ===== ROUNDS: ENGINE AND QUESTION FORMATS =====
   A round is up to 11 cards, one per term, picked by MEMORY.buildRound. The
   question format depends on how well the term is known:
     new / learning / forgotten -> multiple choice, options hidden at first
                                   (written scenario questions first)
     mastered                   -> typed answer or typed fill-the-gap where the
                                   term is short enough to type, else MC
     hard mode                  -> typed where typeable, else MC with no hint
   The style setting (MC only, typing preferred, flashcards only) overrides it.
   One true/false and one multi-select are mixed in where the data allows.

   New terms are taught first, in batches of TEACH_BATCH: the first card of a
   batch's questions carries `teach: [items]`, shown before its question.

   This file has no DOM access at the top level. Everything above the
   "browser hooks" line is pure and is tested in Node by tests/round.test.js;
   app globals (state, today, recordTermResult, ...) are only touched by the
   browser hooks at the bottom, at call time.

   The question helpers (termParts ... questionsForItem) moved here from the
   old lessons.js. pathNodes() and lessonBank() come from learn.js. */

const RMEM = (typeof MEMORY !== 'undefined') ? MEMORY : require('./memory.js');

const TEACH_BATCH = 3;        // terms taught together before any of them is asked
const TYPE_MAX_LEN = 28;      // longest answer we'll ask anyone to type
const ROUND_MAX = 11;         // term cards in a round
const ROUND_XP = 5;           // per card right first time, times the combo
const MIN_ROUND = 4;          // a smaller round is topped up with earlier mastered terms
const ROUND_SETTINGS_KEY = 'rev_round_settings';
const ROUND_STYLES = ['mixed', 'mcq', 'typing', 'flash'];

function roundEscape(v) {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------- question helpers ---------- */

/* Recap entries such as "C1.1.1-C1.1.3 Cloud Deployment Models Compared" sum
   up a range of terms. They belong in the notes, not in a quiz as a "term". */
function isLessonItem(it) { return it && it.term && it.definition && !String(it.code).includes('-'); }

function termParts(term) {
  // "Infrastructure as a Service (IaaS)" -> ["Infrastructure as a Service", "IaaS"]
  const parts = [term];
  const m = String(term).match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (m) parts.push(m[1], m[2]);
  return parts.filter(p => p && p.trim().length > 1);
}

/* ---------- typed answers ----------
   Like Gizmo's "Mixed" style: once a term has been met in a multiple-choice
   question, it comes back later as one you have to type. Small spelling
   mistakes are forgiven, and any accepted name for the term counts
   (e.g. "IaaS" or "Infrastructure as a Service"). "and", "&", commas and
   slashes are ignored, so "Passwords, MFA" = "Passwords and MFA"; a term
   shaped "X and Y (Z)" also accepts X, Y or Z on its own. */

function acceptedAnswers(term) {
  const parts = termParts(term);
  const out = new Set(parts);
  parts.forEach(p => String(p).split(/\s+[–—-]\s+|\s*\/\s*/).forEach(x => out.add(x)));
  // "Passwords and Multi-Factor Authentication (MFA)": each half counts too.
  const m = String(term).match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (m) {
    const halves = m[1].split(/\s+and\s+|\s*&\s*/i);
    if (halves.length === 2) halves.forEach(x => out.add(x));
  }
  return [...out].map(x => x.trim()).filter(x => x.length > 1);
}

function normAnswer(s) {
  return String(s).toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')    // "&", commas, slashes, hyphens -> spaces
    .replace(/\b(the|a|an|and)\b/g, ' ')
    .replace(/s\b/g, '')            // "VPNs" = "VPN", "Viruses" ~ "Virus"
    .replace(/\s+/g, ' ')
    .trim();
}

function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

/* 'exact' | 'close' (right, but misspelt) | false */
function checkTyped(typed, accepts) {
  const t = normAnswer(typed);
  if (!t) return false;
  let best = false;
  accepts.forEach(a => {
    const n = normAnswer(a);
    if (!n) return;
    if (n === t) { best = 'exact'; return; }
    const tol = n.length <= 4 ? 0 : n.length <= 9 ? 1 : 2;
    if (!best && editDistance(t, n) <= tol) best = 'close';
  });
  return best;
}

function isTypeable(term) {
  return acceptedAnswers(term).some(a => a.length <= TYPE_MAX_LEN);
}

/* Hide the answer if the prompt text gives it away. */
function maskTerm(text, term) {
  let out = String(text);
  termParts(term)
    .sort((a, b) => b.length - a.length)
    .forEach(p => { out = out.replace(new RegExp(String(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '___'); });
  return out;
}

/* "Private Cloud" -> "P______ C____" */
function typeHint(answer) {
  const a = acceptedAnswers(answer).filter(x => x.length <= TYPE_MAX_LEN).sort((x, y) => x.length - y.length)[0] || answer;
  return a.split(' ').map(w => w.charAt(0) + w.slice(1).replace(/[A-Za-z0-9]/g, '_')).join(' ');
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Items near this one: same subtopic, then topic, then section. */
function nearbyItems(node) {
  if (!node) return [[]];
  const lists = [node.items || []];
  if (node.topic) lists.push((node.topic.subtopics || []).flatMap(s => s.items || []).filter(isLessonItem));
  if (node.section) lists.push((node.section.topics || []).flatMap(t => (t.subtopics || []).flatMap(s => s.items || [])).filter(isLessonItem));
  return lists;
}

/* Other terms to use as wrong answers: same subtopic, then topic, then section. */
function distractorTerms(item, node, n) {
  const seen = new Set([item.term.toLowerCase()]);
  const out = [];
  const take = list => shuffled(list).forEach(it => {
    const t = it.term;
    if (out.length < n && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); out.push(t); }
  });
  nearbyItems(node).forEach(list => { if (out.length < n) take(list); });
  return out;
}

function firstSentence(text) {
  const s = String(text || '').split(/(?<=[.!?])\s/)[0];
  return s.length > 220 ? s.slice(0, 217) + '…' : s;
}

function itemWhy(item) {
  return item.examTip || (item.keyFacts && item.keyFacts[0]) || firstSentence(item.definition);
}

function exampleParts(item) {
  return item && item.examples
    ? String(item.examples).split(/;\s*/).map(s => s.trim().replace(/\.$/, '')).filter(Boolean)
    : [];
}

/* The questions for one term on a path node. */
function questionsForItem(item, node, bank) {
  const qs = [];
  const why = itemWhy(item);
  const lessonQs = bank || (typeof lessonBank === 'function' ? lessonBank() : {});

  // Written scenario questions come first: they are the point of the lesson.
  (lessonQs[item.code] || []).forEach((q, i) => {
    if (!q || !Array.isArray(q.options) || !q.options[q.answer]) return;
    qs.push({
      id: `${item.code}#s${i}`, code: item.code, kind: q.type === 'gap' ? 'Fill the gap' : 'Scenario',
      q: q.q, answer: q.options[q.answer], options: q.options.slice(), why: q.why || why
    });
  });

  const wrong = distractorTerms(item, node, 3);
  const defText = `<span class="lq-quote">${roundEscape(maskTerm(item.definition, item.term))}</span>`;
  if (isTypeable(item.term)) {
    // The hardest check: no options to pick from, you have to recall it.
    qs.push({
      id: `${item.code}#t`, code: item.code, kind: 'Type the term', typed: true,
      q: `Which term matches this description?${defText}`, html: true,
      answer: item.term, accepts: acceptedAnswers(item.term), why
    });
  } else if (wrong.length >= 2) {
    qs.push({
      id: `${item.code}#d`, code: item.code, kind: 'Definition',
      q: `Which term matches this description?${defText}`,
      html: true, answer: item.term, options: [item.term, ...wrong], why
    });
  }
  if (wrong.length >= 2) {
    const ex = exampleParts(item);
    if (ex.length) {
      const pick = ex[Math.floor(Math.random() * ex.length)];
      qs.push({
        id: `${item.code}#e`, code: item.code, kind: 'Example',
        q: `<span class="lq-quote">${roundEscape(maskTerm(pick, item.term))}</span>Which of these is this an example of?`,
        html: true, answer: item.term, options: [item.term, ...shuffled(wrong).slice(0, 2)],
        why: `${item.term}: ${firstSentence(item.definition)}`
      });
    }
  }
  return qs;
}

/* ---------- round settings ---------- */

function defaultRoundSettings() {
  return { style: 'mixed', hideOptions: true, spelling: true };
}

function coerceRoundSettings(raw) {
  const d = defaultRoundSettings();
  if (!raw || typeof raw !== 'object') return d;
  return {
    style: ROUND_STYLES.includes(raw.style) ? raw.style : d.style,
    hideOptions: typeof raw.hideOptions === 'boolean' ? raw.hideOptions : d.hideOptions,
    spelling: typeof raw.spelling === 'boolean' ? raw.spelling : d.spelling
  };
}

function roundStorage(storage) {
  if (storage) return storage;
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; }
}

function loadRoundSettings(storage) {
  try {
    const s = roundStorage(storage);
    const raw = s && s.getItem(ROUND_SETTINGS_KEY);
    return coerceRoundSettings(raw ? JSON.parse(raw) : null);
  } catch (e) {
    return defaultRoundSettings();
  }
}

function saveRoundSettings(settings, storage) {
  const clean = coerceRoundSettings(settings);
  try {
    const s = roundStorage(storage);
    if (s) s.setItem(ROUND_SETTINGS_KEY, JSON.stringify(clean));
  } catch (e) { /* private window or full storage: settings last this visit only */ }
  return clean;
}

/* ---------- question formats ----------
   Every q has: kind, code, label, prompt (HTML, already escaped), answer, why.
     mcq    options[] (shuffled), hidden (options start hidden), noHint
     type   accepts[]           gap   accepts[] (a sentence with the term blanked)
     tf     answer is a boolean  multi answers[] and options[] (shuffled)
     flip   front, back (self-marked)                                       */

function mcqQuestion(item, node, bank, settings) {
  const why = itemWhy(item);
  const written = ((bank || {})[item.code] || []).filter(q => q && Array.isArray(q.options) && q.options[q.answer]);
  if (written.length) {
    const w = written[Math.floor(Math.random() * written.length)];
    return {
      kind: 'mcq', code: item.code, label: w.type === 'gap' ? 'Fill the gap' : 'Scenario',
      prompt: roundEscape(w.q), answer: w.options[w.answer], options: shuffled(w.options),
      hidden: settings.hideOptions, why: w.why || why
    };
  }
  const wrong = distractorTerms(item, node, 3);
  if (wrong.length < 2) return null;
  const ex = exampleParts(item);
  if (ex.length && Math.random() < 0.35) {
    const pick = ex[Math.floor(Math.random() * ex.length)];
    return {
      kind: 'mcq', code: item.code, label: 'Example',
      prompt: `<span class="lq-quote">${roundEscape(maskTerm(pick, item.term))}</span>Which of these is this an example of?`,
      answer: item.term, options: shuffled([item.term, ...wrong]), hidden: settings.hideOptions,
      why: `${item.term}: ${firstSentence(item.definition)}`
    };
  }
  return {
    kind: 'mcq', code: item.code, label: 'Definition',
    prompt: `Which term matches this description?<span class="lq-quote">${roundEscape(maskTerm(item.definition, item.term))}</span>`,
    answer: item.term, options: shuffled([item.term, ...wrong]), hidden: settings.hideOptions, why
  };
}

/* A sentence from the notes that names the term, for a typed fill-the-gap. */
function gapSentence(item) {
  const pool = [...(item.keyFacts || []), item.examTip].filter(Boolean).map(String);
  const hits = pool.filter(s => maskTerm(s, item.term) !== s && s.length <= 240);
  return hits.length ? hits[Math.floor(Math.random() * hits.length)] : null;
}

function typedQuestion(item) {
  const gap = gapSentence(item);
  const base = { code: item.code, answer: item.term, accepts: acceptedAnswers(item.term), why: itemWhy(item) };
  if (gap && Math.random() < 0.5) {
    return Object.assign({
      kind: 'gap', label: 'Fill the gap',
      prompt: `Type the missing term.<span class="lq-quote">${roundEscape(maskTerm(gap, item.term))}</span>`
    }, base);
  }
  return Object.assign({
    kind: 'type', label: 'Type the term',
    prompt: `Which term matches this description?<span class="lq-quote">${roundEscape(maskTerm(item.definition, item.term))}</span>`
  }, base);
}

function flipQuestion(item) {
  return {
    kind: 'flip', code: item.code, label: 'Flashcard', answer: item.term,
    prompt: roundEscape(item.term), front: item.term, back: item.definition, why: itemWhy(item)
  };
}

/* "Router: <definition>": true, or the definition of a neighbouring term. */
function tfQuestion(item, node) {
  let partner = null;
  for (const list of nearbyItems(node)) {
    const others = list.filter(it => it.code !== item.code && it.definition && it.definition !== item.definition);
    if (others.length) { partner = others[Math.floor(Math.random() * others.length)]; break; }
  }
  if (!partner) return null;
  const truth = Math.random() < 0.5;
  const def = truth ? maskTerm(item.definition, item.term) : maskTerm(maskTerm(partner.definition, partner.term), item.term);
  return {
    kind: 'tf', code: item.code, label: 'True or false',
    prompt: `Does this describe <strong>${roundEscape(item.term)}</strong>?<span class="lq-quote">${roundEscape(def)}</span>`,
    answer: truth,
    why: truth ? `${item.term}: ${firstSentence(item.definition)}` : `That describes ${partner.term}. ${item.term}: ${firstSentence(item.definition)}`
  };
}

/* "Which of these are examples of X?" for terms with three or more examples.
   Wrong picks are examples of neighbouring terms. */
function multiQuestion(item, node) {
  const right = exampleParts(item);
  if (right.length < 3) return null;
  const answers = right.slice(0, 4);
  const rightKeys = right.map(normAnswer).filter(Boolean);
  const taken = new Set(rightKeys);
  // "A school using Microsoft 365" is not a wrong pick when "Microsoft 365" is right.
  const overlaps = k => rightKeys.some(r => k.includes(r) || r.includes(k));
  const wrong = [];
  for (const list of nearbyItems(node)) {
    shuffled(list.filter(it => it.code !== item.code)).forEach(it => {
      exampleParts(it).forEach(p => {
        const k = normAnswer(p);
        if (wrong.length < 3 && k && !taken.has(k) && !overlaps(k) && maskTerm(p, item.term) === p) { taken.add(k); wrong.push(p); }
      });
    });
    if (wrong.length >= 3) break;
  }
  if (wrong.length < 2) return null;
  return {
    kind: 'multi', code: item.code, label: 'Select all',
    prompt: `Which of these are examples of <strong>${roundEscape(item.term)}</strong>? Pick every one that fits.`,
    answers, answer: answers.join('; '), options: shuffled([...answers, ...wrong]),
    why: `${item.term}: ${firstSentence(item.definition)}`
  };
}

/* The question for one term, by its memory status, the round mode and the
   settings. ctx: { node, bank } (node supplies the distractors). */
function questionFor(item, status, mode, settings, ctx) {
  const s = coerceRoundSettings(settings);
  const c = ctx || {};
  if (s.style === 'flash') return flipQuestion(item);
  const typeable = isTypeable(item.term);
  const wantTyped = s.style !== 'mcq' && (mode === 'hard' || s.style === 'typing' || status === 'mastered');
  if (wantTyped && typeable) return typedQuestion(item);
  const q = mcqQuestion(item, c.node, c.bank, s);
  if (q) {
    if (mode === 'hard') q.noHint = true;
    return q;
  }
  // Too few neighbours for multiple choice.
  return typeable && s.style !== 'mcq' ? typedQuestion(item) : flipQuestion(item);
}

/* ---------- building a round ---------- */

function makeCard(item, status, mode, settings, ctx) {
  return {
    code: item.code, item, status, q: questionFor(item, status, mode, settings, ctx),
    outcome: null, retry: false, hinted: false, attempted: false, done: false,
    tried: [], greyed: [], teach: null
  };
}

/* Codes for a round, in MEMORY.buildRound order, topped up when small. */
function roundCodes({ node, nodes, memory, todayStr, mode, max }) {
  const all = nodes.flatMap(n => n.items.map(it => it.code));
  if (mode === 'review') {
    return all.filter(c => RMEM.status(memory[c], todayStr) === 'forgotten').slice(0, max);
  }
  const idx = nodes.findIndex(n => n.id === node.id);
  const earlierCodes = nodes.slice(0, Math.max(0, idx)).flatMap(n => n.items.map(it => it.code));
  const codes = RMEM.buildRound({ nodeCodes: node.items.map(it => it.code), earlierCodes, memory, todayStr, max });
  // A one- or two-term step would ask "the thing you just read". Borrow
  // earlier mastered terms, weakest first, as the old lessons did.
  if (codes.length < MIN_ROUND) {
    const have = new Set(codes);
    earlierCodes
      .filter(c => !have.has(c) && RMEM.status(memory[c], todayStr) === 'mastered')
      .sort((a, b) => (memory[a].s - memory[b].s) || String(memory[a].due).localeCompare(String(memory[b].due)))
      .slice(0, Math.min(MIN_ROUND, max) - codes.length)
      .forEach(c => codes.push(c));
  }
  return codes;
}

/* Cards in order: known terms first, then each batch of new terms (taught on
   the batch's first card), then the rest. A known card is moved between the
   first teach batch and its questions, so the first question is not simply
   what was just read. */
function orderCards(cards) {
  const firstNew = cards.findIndex(c => c.status === 'new');
  if (firstNew < 0) return cards;
  const before = cards.slice(0, firstNew);
  const fresh = cards.filter(c => c.status === 'new');
  const after = cards.slice(firstNew).filter(c => c.status !== 'new');
  const batches = [];
  for (let i = 0; i < fresh.length; i += TEACH_BATCH) batches.push(fresh.slice(i, i + TEACH_BATCH));
  // A lone term at the end would be asked straight after it was taught.
  if (batches.length > 1 && batches[batches.length - 1].length === 1) batches[batches.length - 2].push(...batches.pop());

  const out = before.slice();
  batches.forEach((batch, bi) => {
    const items = batch.map(c => c.item);
    let qs = shuffled(batch);
    const lastTaught = items[items.length - 1].code;
    if (qs.length > 1 && qs[0].code === lastTaught) qs.push(qs.shift());
    if (bi === 0 && after.length) qs.unshift(after.shift());
    qs[0].teach = items;
    out.push(...qs);
  });
  return out.concat(after);
}

/* One true/false and one multi-select, in place of a multiple-choice card. */
function mixInFormats(cards, mode, settings) {
  if (settings.style !== 'mixed' || mode === 'hard') return;
  const pool = shuffled(cards.filter(c => c.q && c.q.kind === 'mcq'));
  const known = pool.filter(c => c.status !== 'new');
  let tfCard = null;
  for (const c of [...known, ...pool]) {
    const q = tfQuestion(c.item, c.node);
    if (q) { c.q = q; tfCard = c; break; }
  }
  for (const c of pool) {
    if (c === tfCard || exampleParts(c.item).length < 3) continue;
    const q = multiQuestion(c.item, c.node);
    if (q) { c.q = q; break; }
  }
}

/* opts: { node, nodes, memory, todayStr, mode, settings, bank, max, cards }
   `cards` skips building (tests use it for a hand-made round). */
function makeRound(opts) {
  const o = Object.assign({ mode: 'memorize', bank: {}, max: ROUND_MAX }, opts);
  const settings = coerceRoundSettings(o.settings);
  const nodeOf = {};
  o.nodes.forEach(n => n.items.forEach(it => { nodeOf[it.code] = { item: it, node: n }; }));
  let cards = o.cards;
  if (!cards) {
    const codes = roundCodes(o);
    cards = codes.filter(c => nodeOf[c]).map(code => {
      const { item, node } = nodeOf[code];
      const card = makeCard(item, RMEM.status(o.memory[code], o.todayStr), o.mode, settings, { node, bank: o.bank });
      card.node = node;
      return card;
    });
    mixInFormats(cards, o.mode, settings);
    cards = orderCards(cards);
  }
  const ringCodes = o.node ? o.node.items.map(it => it.code) : cards.map(c => c.code);
  return {
    nodeId: o.node ? o.node.id : null, mode: o.mode, settings,
    cards, pos: 0, xp: 0, coins: 0, run: 0,
    startRing: RMEM.ringPercent(ringCodes, o.memory)
  };
}

/* ---------- answering ----------
   Each function mutates `round` and returns what happened, so the screen
   only has to draw it. ctx: { recordTermResult, recordHinted, gainXP, settings }.
   gainXP(n) banks each card's XP as it is earned; round.xp is the running
   total for display only.  */

function currentRoundCard(r) { return r ? r.cards[r.pos] || null : null; }

/* { right, close } for a response: an option (mcq), typed text (type/gap),
   a boolean (tf, or flip's "I knew it"), or an array of options (multi). */
function checkResponse(q, response, settings) {
  const s = coerceRoundSettings(settings);
  switch (q.kind) {
    case 'type':
    case 'gap': {
      const res = checkTyped(response == null ? '' : response, q.accepts);
      return { right: res === 'exact' || (res === 'close' && s.spelling), close: res === 'close' };
    }
    case 'tf':
    case 'flip':
      return { right: response === (q.kind === 'flip' ? true : q.answer), close: false };
    case 'multi': {
      const picked = new Set(Array.isArray(response) ? response : []);
      const right = picked.size === q.answers.length && q.answers.every(a => picked.has(a));
      return { right, close: false };
    }
    default:
      return { right: response === q.answer, close: false };
  }
}

/* Wrong (or revealed): record it once, reset the run, send a Retry copy to the end.
   The memory record and run from before are kept (prevMem, prevRun) so
   "I was right" can undo it. */
function markWrong(r, card, ctx, ev) {
  card.outcome = 'wrong';
  card.prevRun = r.run;
  r.run = 0;
  if (!card.retry && ctx && ctx.recordTermResult) {
    const rec = ctx.getMemory ? ctx.getMemory(card.code) : null;
    card.prevMem = rec ? JSON.parse(JSON.stringify(rec)) : null;
    ev.days = ctx.recordTermResult(card.code, false);
  }
  const copy = Object.assign({}, card, {
    retry: true, outcome: null, hinted: false, attempted: false, done: false,
    tried: [], greyed: [], teach: null, retryCopy: null
  });
  card.retryCopy = copy;
  r.cards.push(copy);
  ev.requeued = true;
}

function answerCard(r, response, ctx) {
  const card = currentRoundCard(r);
  if (!card || !card.q || card.done) return null;
  const c = ctx || {};
  const { right, close } = checkResponse(card.q, response, c.settings || r.settings);
  const first = !card.attempted;
  card.attempted = true;
  const ev = { right, close, first, xp: 0, days: null, requeued: false, hinted: card.hinted, answer: card.q.answer };

  if (right) {
    card.done = true;
    if (first && card.retry) {
      card.outcome = 'retry';
      r.run++;
    } else if (first && card.hinted) {
      card.outcome = 'right';
      if (c.recordHinted) c.recordHinted(card.code);
    } else if (first) {
      card.outcome = 'right';
      if (c.recordTermResult) ev.days = c.recordTermResult(card.code, true);
      ev.xp = Math.round(ROUND_XP * RMEM.combo(r.run));
      r.xp += ev.xp;
      // Banked now, so closing the round halfway keeps it.
      if (c.gainXP && ev.xp) c.gainXP(ev.xp);
      r.run++;
    }
  } else {
    if (response != null && !Array.isArray(response) && card.q.options) card.tried.push(response);
    if (first) markWrong(r, card, c, ev);
    // Two-way questions can't be tried again on the same card.
    if (card.q.kind === 'tf' || card.q.kind === 'flip') card.done = true;
  }
  ev.combo = RMEM.combo(r.run);
  return ev;
}

/* "I was right" on a typed or gap card marked wrong first time: undo the
   wrong result in memory (restore the record from before, then record a
   right answer), bank the usual XP at the combo from before the miss, drop
   the Retry copy and count the card right first time. Once per card; not
   after a hint, Reveal or Explain, nor on a Retry copy.
   ctx: { restoreMemory(code, rec|null), recordTermResult, gainXP }.
   Returns { right, overridden, xp, days, combo, ... } or null. */
function canOverride(card) {
  return !!card && !!card.q && (card.q.kind === 'type' || card.q.kind === 'gap')
    && card.outcome === 'wrong' && card.attempted && !card.retry && !card.overridden
    && !card.hinted && !card.revealed && !card.explained && 'prevMem' in card;
}

function overrideRight(r, card, ctx) {
  if (!r || !canOverride(card)) return null;
  const c = ctx || {};
  if (c.restoreMemory) c.restoreMemory(card.code, card.prevMem);
  const ev = { right: true, overridden: true, close: false, first: true, xp: 0, days: null, requeued: false, answer: card.q.answer };
  if (c.recordTermResult) ev.days = c.recordTermResult(card.code, true);
  const run = card.prevRun || 0;
  ev.xp = Math.round(ROUND_XP * RMEM.combo(run));
  r.xp += ev.xp;
  if (c.gainXP && ev.xp) c.gainXP(ev.xp);
  r.run = run + 1;
  const i = r.cards.indexOf(card.retryCopy);
  if (i > r.pos) r.cards.splice(i, 1);
  card.retryCopy = null;
  card.outcome = 'right';
  card.overridden = true;
  card.done = true;
  ev.combo = RMEM.combo(r.run);
  return ev;
}

/* Grey out one wrong option (never the last one), or for typed cards give the
   first letters. Marks the card hinted: a hinted right answer earns no XP. */
function hintCard(r) {
  const card = currentRoundCard(r);
  if (!card || !card.q || card.done || card.q.noHint) return null;
  const q = card.q;
  if (q.kind === 'type' || q.kind === 'gap') {
    card.hinted = true;
    return { hint: typeHint(q.answer) };
  }
  if (q.kind !== 'mcq' && q.kind !== 'multi') return null;
  const isRight = o => (q.kind === 'multi' ? q.answers.includes(o) : o === q.answer);
  const wrong = q.options.filter(o => !isRight(o) && !card.greyed.includes(o) && !card.tried.includes(o));
  if (wrong.length < 2) return null;
  const pick = wrong[Math.floor(Math.random() * wrong.length)];
  card.greyed.push(pick);
  card.hinted = true;
  return { greyed: pick };
}

/* Show the answer: counts as wrong. */
function revealCard(r, ctx) {
  const card = currentRoundCard(r);
  if (!card || !card.q || card.done) return null;
  const ev = { right: false, first: !card.attempted, xp: 0, days: null, requeued: false, answer: card.q.answer };
  if (!card.attempted) { card.attempted = true; markWrong(r, card, ctx, ev); }
  card.revealed = true;
  card.done = true;
  ev.combo = RMEM.combo(r.run);
  return ev;
}

/* Open the notes. Before answering this counts as wrong (the card comes back
   as Retry) but the card can still be answered; afterwards it is free. */
function explainCard(r, ctx) {
  const card = currentRoundCard(r);
  if (!card || !card.q) return null;
  const ev = { counted: false, xp: 0, days: null, requeued: false, item: card.item };
  if (!card.attempted && !card.done) {
    card.attempted = true;
    markWrong(r, card, ctx, ev);
    ev.counted = true;
  }
  card.explained = true;
  return ev;
}

/* Move on; returns the next card, or null at the end of the round. */
function nextCard(r) {
  if (!r) return null;
  r.pos = Math.min(r.pos + 1, r.cards.length);
  return currentRoundCard(r);
}

function roundFinished(r) { return !!r && r.pos >= r.cards.length; }

/* ---------- end of round ----------
   Pure helpers for the screens after the last card. */

/* Did the round move the streak? before/after are { last, count } copies of
   state.streak taken at the start and at the end. */
function streakMoved(before, after) {
  return !!before && !!after && (before.last !== after.last || before.count !== after.count);
}

/* The week containing todayStr, Sunday to Saturday:
   [{ date, label, done (studied that day, from state.activity), today }]. */
function streakWeek(todayStr, activity) {
  const [y, m, d] = todayStr.split('-').map(Number);
  const start = new Date(y, m - 1, d - new Date(y, m - 1, d).getDay());
  const pad = n => String(n).padStart(2, '0');
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((label, i) => {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const date = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    return { date, label, done: !!(activity && activity[date] > 0), today: date === todayStr };
  });
}

/* The rival passed this round: placed above you in the league table when the
   round started and below you now. With several, the one highest on the table
   now. Rows are LEAGUE.standings rows ({ name, place, me }). */
function overtakenRival(beforeRows, afterRows) {
  if (!beforeRows || !afterRows) return null;
  const meB = beforeRows.find(r => r.me), meA = afterRows.find(r => r.me);
  if (!meB || !meA || meA.place >= meB.place) return null;
  const above = new Set(beforeRows.filter(r => !r.me && r.place < meB.place).map(r => r.name));
  const passed = afterRows.filter(r => !r.me && r.place > meA.place && above.has(r.name))
    .sort((a, b) => a.place - b.place);
  return passed[0] || null;
}

/* ---------- browser hooks ----------
   startRound builds the global `round`; round-view.js draws it and calls the
   engine functions above with roundContext().                              */

let round = null;

function roundContext() {
  return {
    recordTermResult, recordHinted,
    getMemory: code => state.memory[code] || null,
    restoreMemory: restoreTermMemory,
    gainXP: n => awardXP(n, true),   // league XP, activity and save; no toast per card
    settings: round ? round.settings : loadRoundSettings()
  };
}

function startRound(nodeId, mode) {
  const m = mode || 'memorize';
  const nodes = pathNodes();
  const node = nodes.find(n => n.id === nodeId) || null;
  if (!node && m !== 'review') return null;
  round = makeRound({
    node, nodes, memory: state.memory, todayStr: today(), mode: m,
    settings: loadRoundSettings(), bank: lessonBank()
  });
  return round;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEACH_BATCH, TYPE_MAX_LEN, ROUND_MAX, ROUND_XP, MIN_ROUND, ROUND_SETTINGS_KEY,
    isLessonItem, termParts, acceptedAnswers, normAnswer, editDistance, checkTyped, isTypeable,
    maskTerm, typeHint, shuffled, distractorTerms, firstSentence, questionsForItem,
    defaultRoundSettings, coerceRoundSettings, loadRoundSettings, saveRoundSettings,
    questionFor, tfQuestion, multiQuestion, makeCard, makeRound, checkResponse,
    currentRoundCard, answerCard, canOverride, overrideRight, hintCard, revealCard, explainCard, nextCard, roundFinished,
    streakMoved, streakWeek, overtakenRival
  };
}

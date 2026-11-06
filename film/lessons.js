/* ===== SECTIONS: PATH + LESSONS =====
   The Sections tab is a path of short lessons, one node per spec subtopic.
   A lesson teaches each term on a "New" card, then asks questions about it
   until every one has been answered correctly. A wrong answer comes back a few
   cards later. Finishing a lesson marks the node done, sets each term's
   confidence (green if all right first time, amber otherwise) and banks XP.

   Questions per term:
     - written scenario questions from data/<unit>/lessons/<letter>.json
     - a "which term matches this description" question built from the definition
     - a "which is this an example of" question built from the examples, if any
   Distractors are other terms from the same subtopic first, so the choices are
   the ones a student actually confuses. */

let lesson = null;            // the running lesson, or null on the path
let lessonAdvanceTimer = null;

const LESSON_XP = 5;          // per question right first time
const REQUEUE_GAP = 3;        // a missed question returns this many cards later
const TEACH_BATCH = 3;        // terms taught together before any of them is asked
const TYPE_MAX_LEN = 28;      // longest answer we'll ask anyone to type

/* ---------- building the path ---------- */

function lessonBank() {
  const u = unitData();
  return (u && u.lessons) || {};
}

/* Recap entries such as "C1.1.1-C1.1.3 Cloud Deployment Models Compared" sum
   up a range of terms. They belong in the notes, not in a quiz as a "term". */
function isLessonItem(it) { return it && it.term && it.definition && !String(it.code).includes('-'); }

/* Every node of the active unit's path, in the unit's section order. */
function pathNodes() {
  const nodes = [];
  unitLetters().forEach(l => {
    const data = unitData().sections[l];
    if (!data) return;
    const letter = l.toUpperCase();
    data.topics.forEach((topic, ti) => {
      (topic.subtopics || []).forEach((sub, si) => {
        const items = (sub.items || []).filter(isLessonItem);
        if (!items.length) return;
        const id = sub.code || `${topic.code || letter + (ti + 1)}-${si + 1}`;
        nodes.push({
          id, letter,
          title: sub.title || topic.title,
          topicTitle: topic.title,
          items,
          section: data, topic, sub
        });
      });
    });
  });
  return nodes;
}

function nodeDone(id) {
  const r = state.lessons && state.lessons[id];
  return !!(r && r.done);
}

function nodeQuestionCount(node) {
  return node.items.reduce((n, item) => n + questionsForItem(item, node).length, 0);
}

/* ---------- questions ---------- */

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
   (e.g. "IaaS" or "Infrastructure as a Service"). */

function acceptedAnswers(term) {
  const out = new Set(termParts(term));
  termParts(term).forEach(p => String(p).split(/\s+[–—-]\s+|\s*\/\s*/).forEach(x => out.add(x)));
  return [...out].map(x => x.trim()).filter(x => x.length > 1);
}

function normAnswer(s) {
  return String(s).toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(the|a|an)\b/g, ' ')
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
    .forEach(p => { out = out.replace(new RegExp(escapeRe(p), 'gi'), '___'); });
  return out;
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Other terms to use as wrong answers: same subtopic, then topic, then section. */
function distractorTerms(item, node, n) {
  const seen = new Set([item.term.toLowerCase()]);
  const out = [];
  const take = list => shuffled(list).forEach(it => {
    const t = it.term;
    if (out.length < n && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); out.push(t); }
  });
  take(node.items);
  if (out.length < n) take(node.topic.subtopics.flatMap(s => s.items || []).filter(isLessonItem));
  if (out.length < n) take(node.section.topics.flatMap(t => (t.subtopics || []).flatMap(s => s.items || [])).filter(isLessonItem));
  return out;
}

function firstSentence(text) {
  const s = String(text || '').split(/(?<=[.!?])\s/)[0];
  return s.length > 220 ? s.slice(0, 217) + '…' : s;
}

function questionsForItem(item, node) {
  const qs = [];
  const why = item.examTip || (item.keyFacts && item.keyFacts[0]) || firstSentence(item.definition);

  // Written scenario questions come first: they are the point of the lesson.
  (lessonBank()[item.code] || []).forEach((q, i) => {
    if (!q || !Array.isArray(q.options) || !q.options[q.answer]) return;
    qs.push({
      id: `${item.code}#s${i}`, code: item.code, kind: q.type === 'gap' ? 'Fill the gap' : 'Scenario',
      q: q.q, answer: q.options[q.answer], options: q.options.slice(), why: q.why || why
    });
  });

  const wrong = distractorTerms(item, node, 3);
  const defText = `<span class="lq-quote">${escapeHTML(maskTerm(item.definition, item.term))}</span>`;
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
    if (item.examples) {
      const ex = String(item.examples).split(/;\s*/).map(s => s.trim().replace(/\.$/, '')).filter(Boolean);
      if (ex.length) {
        const pick = ex[Math.floor(Math.random() * ex.length)];
        qs.push({
          id: `${item.code}#e`, code: item.code, kind: 'Example',
          q: `<span class="lq-quote">${escapeHTML(maskTerm(pick, item.term))}</span>Which of these is this an example of?`,
          html: true, answer: item.term, options: [item.term, ...shuffled(wrong).slice(0, 2)],
          why: `${item.term}: ${firstSentence(item.definition)}`
        });
      }
    }
  }
  return qs;
}

/* ---------- path view ---------- */

const ICON_SPROUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 20h10"/><path d="M12 20v-9"/><path d="M12 11c0-3-2-5-6-5 0 3 2 5 6 5z"/><path d="M12 13c0-3.5 2.5-6 6.5-6 0 3.5-2.5 6-6.5 6z"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

// Horizontal offsets (px) that make the column wind like a path.
const PATH_WAVE = [0, 34, 62, 78, 62, 34, 0, -16];

function sectionsTabsHTML(active) {
  return `
    <div class="path-head">
      <h2>Sections <span class="path-unit">${escapeHTML(unitDef().label)} · ${escapeHTML(unitDef().name)}</span></h2>
      <div class="tabs path-tabs" role="tablist">
        <button class="tab-btn ${active === 'path' ? 'active' : ''}" role="tab" aria-selected="${active === 'path'}" onclick="navigate('sections',{tab:'path'})">Path</button>
        <button class="tab-btn ${active === 'materials' ? 'active' : ''}" role="tab" aria-selected="${active === 'materials'}" onclick="navigate('sections',{tab:'materials'})">Materials</button>
      </div>
    </div>`;
}

function renderPath(container) {
  if (lesson) { renderLesson(); return; }
  const nodes = pathNodes();
  const current = nodes.find(n => !nodeDone(n.id));
  const doneCount = nodes.filter(n => nodeDone(n.id)).length;

  let html = sectionsTabsHTML('path');
  html += `
    <div class="path-summary">
      <div>
        <div class="path-summary-num">${doneCount}<span>/${nodes.length}</span></div>
        <div class="path-summary-label">lessons complete</div>
      </div>
      ${current
        ? `<button class="btn btn-primary" onclick="startLesson('${current.id}')">${doneCount ? 'Continue' : 'Start'}: ${escapeHTML(current.title)}</button>`
        : `<div class="path-summary-label">Every lesson done. Replay any node to keep it fresh.</div>`}
    </div>`;

  let lastLetter = null;
  let i = 0;
  nodes.forEach(n => {
    if (n.letter !== lastLetter) {
      if (lastLetter) html += '</div>';
      lastLetter = n.letter;
      i = 0;
      const col = sectionColour(n.letter);
      const secNodes = nodes.filter(x => x.letter === n.letter);
      const secDone = secNodes.filter(x => nodeDone(x.id)).length;
      html += `
        <div class="path-section-head" style="--sec:${col}">
          <span class="path-section-chip">${n.letter}</span>
          <span class="path-section-title">${escapeHTML(n.section.title)}</span>
          <span class="path-section-count">${secDone}/${secNodes.length}</span>
        </div>
        <div class="path-col">`;
    }
    const done = nodeDone(n.id);
    const isCurrent = current && current.id === n.id;
    const qCount = nodeQuestionCount(n);
    const cls = done ? 'done' : isCurrent ? 'current' : '';
    // Like Gizmo's node percentage: how much of this node you're confident in,
    // from lessons or your own ratings in the notes.
    const pct = Math.round(100 * n.items.filter(it => state.rag[it.code] === 'green').length / n.items.length);
    const icon = done ? ICON_CHECK : pct > 0 ? `<span class="path-pct">${pct}%</span>` : ICON_SPROUT;
    html += `
      <button class="path-node ${cls}" id="node-${n.id.replace(/[^A-Za-z0-9_-]/g, '_')}" style="--x:${PATH_WAVE[i % PATH_WAVE.length]};--sec:${sectionColour(n.letter)}" onclick="startLesson('${n.id}')" aria-label="${escapeHTML(n.title)}${done ? ', done' : pct ? ', ' + pct + '% confident' : ''}">
        <span class="path-hex">${icon}</span>
        <span class="path-label">
          <span class="path-title">${escapeHTML(n.title)}</span>
          <span class="path-meta">${n.sub.code ? escapeHTML(n.sub.code) + ' · ' : ''}${n.items.length} term${n.items.length === 1 ? '' : 's'} · ${qCount} questions</span>
        </span>
      </button>`;
    i++;
  });
  if (lastLetter) html += '</div>';
  container.innerHTML = html;

  if (current && doneCount) {
    const node = document.getElementById('node-' + current.id.replace(/[^A-Za-z0-9_-]/g, '_'));
    if (node) requestAnimationFrame(() => node.scrollIntoView({ block: 'center' }));
  }
}

/* ---------- running a lesson ---------- */

function startLesson(id, onlyCodes) {
  const node = pathNodes().find(n => n.id === id);
  if (!node) return;
  const items = onlyCodes ? node.items.filter(it => onlyCodes.includes(it.code)) : node.items;

  const queue = buildLessonQueue(items, node, !onlyCodes);

  const total = queue.filter(c => c.type === 'q').length;
  lesson = {
    node, items, retry: !!onlyCodes,
    queue, pos: 0, total,
    solved: new Set(),        // question ids answered correctly
    missed: new Set(),        // question ids got wrong at least once
    missedCodes: new Set(),
    seen: new Set(),          // question ids already shown once
    xp: 0,
    phase: 'recall',          // recall | options | feedback | done
    options: [], hidden: new Set(), picked: null
  };
  scrollContentTop();
  renderLesson();
}

/* The order is what stops the answer being obvious. Asking about a term
   straight after its "New" card means the answer is whatever you just read.
   So terms are taught in small batches, and only then is the batch asked,
   in shuffled order, with the batch's other terms as wrong options. Every
   remaining question (typed ones included) is saved for a final mixed round
   across the whole lesson, spread out so the same term never comes twice
   in a row. */
function buildLessonQueue(items, node, withReview) {
  const per = items.map(item => ({ item, qs: questionsForItem(item, node) }));
  const review = withReview ? reviewQuestions(node, REVIEW_COUNT) : [];
  const batches = [];
  for (let i = 0; i < per.length; i += TEACH_BATCH) batches.push(per.slice(i, i + TEACH_BATCH));
  // A lone term at the end would be asked straight after it was taught.
  if (batches.length > 1 && batches[batches.length - 1].length === 1) {
    batches[batches.length - 2].push(...batches.pop());
  }

  const queue = [];
  const later = [];
  batches.forEach((batch, bi) => {
    batch.forEach((p, i) => queue.push({ type: 'teach', item: p.item, n: i + 1, of: batch.length }));
    // A review question between the new cards and their questions breaks the
    // "answer = what I just read" pattern.
    if (bi === 0 && review.length) queue.push({ type: 'q', q: review.shift() });
    let first = shuffled(batch.map(p => p.qs.find(q => !q.typed)).filter(Boolean));
    // Never open with the term that was on screen a moment ago.
    const lastTaught = batch[batch.length - 1].item.code;
    if (first.length > 1 && first[0].code === lastTaught) first.push(first.shift());
    first.forEach(q => queue.push({ type: 'q', q }));
    batch.forEach(p => p.qs.filter(q => !first.includes(q)).forEach(q => later.push({ type: 'q', q })));
  });
  review.forEach(q => later.push({ type: 'q', q }));
  spreadOut(shuffled(later), queue.length ? queue[queue.length - 1] : null).forEach(c => queue.push(c));
  return queue;
}

function cardCode(c) { return c && (c.type === 'teach' ? c.item.code : c.q.code); }

/* Reorder so no two neighbouring cards test the same term, where possible. */
function spreadOut(cards, before) {
  // Always take next from the term with the most cards left (other than the
  // one just shown), so one term's questions don't bunch up at the end.
  const groups = new Map();
  cards.forEach(c => {
    const k = cardCode(c);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(c);
  });
  const out = [];
  let prev = cardCode(before);
  while (groups.size) {
    const keys = shuffled([...groups.keys()]);
    let pick = keys.filter(k => k !== prev).sort((a, b) => groups.get(b).length - groups.get(a).length)[0];
    if (pick === undefined) pick = keys[0];
    const g = groups.get(pick);
    out.push(g.shift());
    if (!g.length) groups.delete(pick);
    prev = pick;
  }
  return out;
}

/* Gizmo mixes "Forgotten" cards from earlier into new material. Here, a lesson
   borrows a few questions about terms from lessons you've already finished in
   this unit, weakest first. Besides keeping old terms fresh, this matters for
   small lessons: in a one-term lesson the first question is no longer simply
   "the thing you just read". */
const REVIEW_COUNT = 3;

function reviewQuestions(node, count) {
  const RANK = { red: 0, amber: 1, green: 2 };
  const pool = [];
  pathNodes().forEach(n => {
    if (n.id === node.id || !nodeDone(n.id)) return;
    n.items.forEach(item => pool.push({ item, n, rank: RANK[state.rag[item.code]] ?? 1, r: Math.random() }));
  });
  pool.sort((a, b) => a.rank - b.rank || a.r - b.r);
  const out = [];
  for (const p of pool) {
    if (out.length >= count) break;
    const q = questionsForItem(p.item, p.n).filter(x => !x.typed);
    if (!q.length) continue;
    const pick = q[Math.floor(Math.random() * q.length)];
    out.push({ ...pick, id: pick.id + '#r', kind: 'Review', review: true });
  }
  return out;
}

function exitLesson() {
  clearTimeout(lessonAdvanceTimer);
  lesson = null;
  navigate('sections', { tab: 'path' });
}

function currentCard() { return lesson && lesson.queue[lesson.pos]; }

function renderLesson() {
  const container = el('sections-content');
  if (!container || !lesson) return;
  clearTimeout(lessonAdvanceTimer);
  const L = lesson;
  const pct = L.total ? Math.round((L.solved.size / L.total) * 100) : 100;
  const col = sectionColour(L.node.letter);

  const top = `
    <div class="lesson-top" style="--sec:${col}">
      <button class="lesson-x" onclick="exitLesson()" aria-label="Leave lesson" title="Leave lesson (progress in this lesson is not saved)">✕</button>
      <div class="lesson-name"><span class="path-section-chip">${L.node.letter}</span>${escapeHTML(L.node.title)}</div>
      <span class="lesson-xp">+${L.xp} XP</span>
    </div>
    <div class="lesson-bar" style="--sec:${col}"><div style="width:${pct}%"></div></div>`;

  if (L.phase === 'done') { container.innerHTML = top + lessonEndHTML(); return; }

  const card = currentCard();
  if (card.type === 'teach') {
    const it = card.item;
    container.innerHTML = top + `
      <div class="lesson-card teach">
        <div class="lesson-tag new">${ICON_SPROUT}New term${card.of > 1 ? ` · ${card.n} of ${card.of}` : ''}</div>
        <div class="teach-code">${escapeHTML(it.code)}</div>
        <h3 class="teach-term">${escapeHTML(it.term)}</h3>
        <p class="teach-def">${escapeHTML(it.definition)}</p>
        ${it.examples ? `<p class="teach-ex"><strong>Example:</strong> ${escapeHTML(it.examples)}</p>` : ''}
        ${it.keyFacts && it.keyFacts.length ? `<ul class="teach-facts">${it.keyFacts.slice(0, 4).map(f => `<li>${escapeHTML(f)}</li>`).join('')}</ul>` : ''}
        ${it.examTip ? `<div class="exam-tip">${escapeHTML(it.examTip)}</div>` : ''}
      </div>
      <button class="btn btn-primary btn-full lesson-continue" id="lesson-go" onclick="lessonNext()">${card.n < card.of ? 'Next new term →' : 'Got it — test me'}</button>`;
    focusLesson('lesson-go');
    return;
  }

  const q = card.q;
  if (q.typed && L.phase === 'recall') L.phase = 'typing';
  const tag = card.retry ? '<div class="lesson-tag retry">Try again</div>'
    : `<div class="lesson-tag">${escapeHTML(q.kind)}</div>`;
  const prompt = q.html ? q.q : escapeHTML(q.q);
  let below = '';

  if (L.phase === 'typing') {
    const hinted = L.hidden.has('hint');
    below = `
      <div class="type-box">
        ${hinted ? `<div class="type-hint">Starts with: <strong>${escapeHTML(typeHint(q.answer))}</strong></div>` : ''}
        <input id="lesson-type" class="type-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
          placeholder="Type the term…" aria-label="Your answer"
          onkeydown="if(event.key==='Enter'){event.preventDefault();lessonSubmitTyped();}">
        <div class="type-note">Small spelling mistakes are fine.</div>
      </div>
      <div class="lesson-tools three">
        <button class="btn btn-primary btn-sm" onclick="lessonSubmitTyped()">Check</button>
        <button class="btn btn-secondary btn-sm" onclick="lessonTypeHint()" ${hinted ? 'disabled' : ''}>🗝️ Hint</button>
        <button class="btn btn-secondary btn-sm" onclick="lessonAnswer(null, false)">I don’t know</button>
      </div>`;
  } else if (L.phase === 'feedback' && q.typed) {
    const right = L.right;
    below = `
      ${L.picked ? `<div class="type-given ${right ? 'ok' : 'bad'}">You typed: <strong>${escapeHTML(L.picked)}</strong></div>` : ''}
      <div class="lesson-why ${right ? 'ok' : 'bad'}">
        <strong>${right ? (L.close ? 'Correct! Watch the spelling: ' + escapeHTML(q.answer) : 'Correct!') : 'The answer is ' + escapeHTML(q.answer) + '.'}</strong>
        <span>${escapeHTML(q.why)}</span>
      </div>
      <button class="btn btn-primary btn-full lesson-continue" id="lesson-go" onclick="lessonNext()">Continue</button>`;
  } else if (L.phase === 'recall') {
    below = `
      <div class="recall-box">
        <div class="recall-hint">💡 Think of the answer first</div>
        <button class="btn btn-secondary btn-full" id="lesson-go" onclick="lessonShowOptions()">Show options</button>
      </div>`;
  } else {
    const fb = L.phase === 'feedback';
    below = `<div class="mcq-opts lesson-opts">${L.options.map((o, i) => {
      let c = '';
      if (fb && o === q.answer) c = 'right';
      else if (fb && o === L.picked) c = 'wrong';
      else if (L.hidden.has(o)) c = 'struck';
      return `<button class="mcq-opt ${c}" ${fb || L.hidden.has(o) ? 'disabled' : ''} onclick="lessonPick(${i})"><span class="opt-key">${i + 1}</span>${escapeHTML(o)}</button>`;
    }).join('')}</div>`;
    if (fb) {
      const right = L.right;
      below += `
        <div class="lesson-why ${right ? 'ok' : 'bad'}">
          <strong>${right ? 'Correct!' : L.picked === null ? 'Answer: ' + escapeHTML(q.answer) : 'Not quite. It’s ' + escapeHTML(q.answer) + '.'}</strong>
          <span>${escapeHTML(q.why)}</span>
        </div>
        <button class="btn btn-primary btn-full lesson-continue" id="lesson-go" onclick="lessonNext()">Continue</button>`;
    } else {
      below += `
        <div class="lesson-tools">
          <button class="btn btn-secondary btn-sm" onclick="lessonHint()" ${L.hidden.size || L.options.length < 3 ? 'disabled' : ''}>🗝️ Hint</button>
          <button class="btn btn-secondary btn-sm" onclick="lessonReveal()">🔍 Reveal</button>
        </div>`;
    }
  }

  container.innerHTML = top + `
    <div class="lesson-card q ${L.phase === 'feedback' ? (L.right ? 'is-right' : 'is-wrong') : ''}">
      ${tag}
      <div class="lesson-q">${prompt}</div>
    </div>` + below;
  focusLesson(L.phase === 'options' ? null : L.phase === 'typing' ? 'lesson-type' : 'lesson-go');
}

/* "Private Cloud" -> "P______ C____" */
function typeHint(answer) {
  const a = acceptedAnswers(answer).filter(x => x.length <= TYPE_MAX_LEN).sort((x, y) => x.length - y.length)[0] || answer;
  return a.split(' ').map(w => w.charAt(0) + w.slice(1).replace(/[A-Za-z0-9]/g, '_')).join(' ');
}

function lessonTypeHint() {
  const input = document.getElementById('lesson-type');
  const keep = input ? input.value : '';
  lesson.hidden.add('hint');
  renderLesson();
  const again = document.getElementById('lesson-type');
  if (again) again.value = keep;
}

function lessonSubmitTyped() {
  const input = document.getElementById('lesson-type');
  const val = input ? input.value.trim() : '';
  if (!val) { if (input) input.focus(); return; }
  lessonAnswer(val, checkTyped(val, currentCard().q.accepts));
}

function focusLesson(id) {
  if (!id) return;
  const b = document.getElementById(id);
  if (b) b.focus({ preventScroll: true });
}

function lessonShowOptions() {
  const L = lesson;
  const q = currentCard().q;
  L.options = shuffled(q.options);
  L.hidden = new Set();
  L.picked = null;
  L.phase = 'options';
  renderLesson();
}

function lessonHint() {
  const L = lesson;
  const q = currentCard().q;
  const wrong = L.options.filter(o => o !== q.answer && !L.hidden.has(o));
  if (wrong.length < 2) return;
  L.hidden.add(wrong[Math.floor(Math.random() * wrong.length)]);
  renderLesson();
}

function lessonReveal() {
  lessonAnswer(null);
}

function lessonPick(i) {
  const o = lesson.options[i];
  if (o === undefined || lesson.hidden.has(o)) return;
  lessonAnswer(o);
}

/* typedResult is checkTyped()'s 'exact' | 'close' | false, for typed questions. */
function lessonAnswer(choice, typedResult) {
  const L = lesson;
  if (L.phase !== 'options' && L.phase !== 'typing') return;
  const q = currentCard().q;
  const right = q.typed ? !!typedResult : choice === q.answer;
  const firstTime = !L.seen.has(q.id);
  L.seen.add(q.id);
  L.picked = choice;
  L.right = right;
  L.close = typedResult === 'close';
  L.phase = 'feedback';

  if (right) {
    L.solved.add(q.id);
    if (firstTime && !L.hidden.size) L.xp += LESSON_XP;
    if (L.hidden.size) { L.missed.add(q.id); L.missedCodes.add(q.code); }   // a hinted answer is not "first time"
  } else {
    L.missed.add(q.id);
    L.missedCodes.add(q.code);
    // Bring it back a few cards later so it is answered from memory, not from
    // the feedback still on screen.
    const at = Math.min(L.pos + 1 + REQUEUE_GAP, L.queue.length);
    L.queue.splice(at, 0, { type: 'q', q, retry: true });
  }
  renderLesson();
  // A misspelt-but-accepted answer stays up so the correct spelling is read.
  if (right && !L.close) lessonAdvanceTimer = setTimeout(lessonNext, 1400);
}

function lessonNext() {
  const L = lesson;
  if (!L) return;
  clearTimeout(lessonAdvanceTimer);
  L.pos++;
  L.phase = 'recall';
  L.options = [];
  L.hidden = new Set();
  L.picked = null;
  if (L.pos >= L.queue.length) finishLesson();
  else renderLesson();
}

function finishLesson() {
  const L = lesson;
  L.phase = 'done';
  L.firstTry = Math.max(0, L.total - L.missed.size);

  L.items.forEach(it => {
    state.rag[it.code] = L.missedCodes.has(it.code) ? 'amber' : 'green';
  });
  // A review term you've forgotten drops back to "getting there". One you got
  // right keeps whatever rating it already had.
  const own = new Set(L.items.map(it => it.code));
  L.missedCodes.forEach(code => { if (!own.has(code)) state.rag[code] = 'amber'; });
  if (!L.retry) {
    state.lessons[L.node.id] = { done: true, date: today(), firstTry: L.firstTry, total: L.total };
  }
  if (L.xp) awardXP(L.xp, true);
  else { bumpActivity(); saveState(); }
  renderLesson();
}

function lessonEndHTML() {
  const L = lesson;
  const missedItems = L.items.filter(it => L.missedCodes.has(it.code));
  const perfect = !missedItems.length;
  return `
    <div class="lesson-card end">
      <div class="end-badge ${perfect ? 'perfect' : ''}">${perfect ? ICON_CHECK : ICON_SPROUT}</div>
      <h3>${perfect ? 'Flawless!' : L.retry ? 'Retry complete' : 'Lesson complete'}</h3>
      <p class="end-score"><strong>${L.firstTry}/${L.total}</strong> right first time · <strong>+${L.xp} XP</strong></p>
      ${perfect
        ? `<p class="end-note">Every term in this lesson is now marked confident.</p>`
        : `<p class="end-note">These terms are marked “getting there”. Retry them now while they’re fresh:</p>
           <ul class="end-missed">${missedItems.map(it => `<li><span class="badge">${escapeHTML(it.code)}</span>${escapeHTML(it.term)}</li>`).join('')}</ul>`}
    </div>
    <div class="end-actions">
      ${perfect ? '' : `<button class="btn btn-secondary" onclick="startLesson('${L.node.id}', ${escapeHTML(JSON.stringify(missedItems.map(i => i.code)))})">Retry missed</button>`}
      <button class="btn btn-primary" id="lesson-go" onclick="lessonAfterEnd()">${nextNodeAfter(L.node.id) ? 'Next lesson' : 'Back to path'}</button>
    </div>
    <button class="btn btn-sm lesson-back-link" onclick="exitLesson()">Back to path</button>`;
}

function nextNodeAfter(id) {
  const nodes = pathNodes();
  const i = nodes.findIndex(n => n.id === id);
  return nodes.slice(i + 1).find(n => !nodeDone(n.id)) || null;
}

function lessonAfterEnd() {
  const next = lesson && nextNodeAfter(lesson.node.id);
  if (next) startLesson(next.id);
  else exitLesson();
}

/* Keys: Space/Enter shows options or continues, 1-4 pick, H hint. */
document.addEventListener('keydown', e => {
  if (!lesson || currentPage !== 'sections') return;
  if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const L = lesson;
  if (L.phase === 'options' && /^[1-4]$/.test(e.key)) { e.preventDefault(); lessonPick(Number(e.key) - 1); }
  else if (L.phase === 'options' && (e.key === 'h' || e.key === 'H')) { e.preventDefault(); lessonHint(); }
  else if (e.key === 'Escape') { e.preventDefault(); exitLesson(); }
});

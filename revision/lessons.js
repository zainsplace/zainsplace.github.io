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
  if (wrong.length >= 2) {
    qs.push({
      id: `${item.code}#d`, code: item.code, kind: 'Definition',
      q: `Which term matches this description?<span class="lq-quote">${escapeHTML(maskTerm(item.definition, item.term))}</span>`,
      html: true, answer: item.term, options: [item.term, ...wrong], why
    });
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
    html += `
      <button class="path-node ${cls}" id="node-${n.id.replace(/[^A-Za-z0-9_-]/g, '_')}" style="--x:${PATH_WAVE[i % PATH_WAVE.length]};--sec:${sectionColour(n.letter)}" onclick="startLesson('${n.id}')">
        <span class="path-hex">${done ? ICON_CHECK : ICON_SPROUT}</span>
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

  // First pass: teach a term, then ask its first question. The rest of the
  // questions are shuffled together afterwards so they can't be answered by
  // position.
  const queue = [];
  const later = [];
  items.forEach(item => {
    const qs = questionsForItem(item, node);
    queue.push({ type: 'teach', item });
    if (qs[0]) queue.push({ type: 'q', q: qs[0] });
    qs.slice(1).forEach(q => later.push({ type: 'q', q }));
  });
  shuffled(later).forEach(c => queue.push(c));

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
        <div class="lesson-tag new">${ICON_SPROUT}New term</div>
        <div class="teach-code">${escapeHTML(it.code)}</div>
        <h3 class="teach-term">${escapeHTML(it.term)}</h3>
        <p class="teach-def">${escapeHTML(it.definition)}</p>
        ${it.examples ? `<p class="teach-ex"><strong>Example:</strong> ${escapeHTML(it.examples)}</p>` : ''}
        ${it.keyFacts && it.keyFacts.length ? `<ul class="teach-facts">${it.keyFacts.slice(0, 4).map(f => `<li>${escapeHTML(f)}</li>`).join('')}</ul>` : ''}
        ${it.examTip ? `<div class="exam-tip">${escapeHTML(it.examTip)}</div>` : ''}
      </div>
      <button class="btn btn-primary btn-full lesson-continue" id="lesson-go" onclick="lessonNext()">Got it — test me</button>`;
    focusLesson('lesson-go');
    return;
  }

  const q = card.q;
  const tag = card.retry ? '<div class="lesson-tag retry">Try again</div>'
    : `<div class="lesson-tag">${escapeHTML(q.kind)}</div>`;
  const prompt = q.html ? q.q : escapeHTML(q.q);
  let below = '';

  if (L.phase === 'recall') {
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
      const right = L.picked === q.answer;
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
    <div class="lesson-card q ${L.phase === 'feedback' ? (L.picked === q.answer ? 'is-right' : 'is-wrong') : ''}">
      ${tag}
      <div class="lesson-q">${prompt}</div>
    </div>` + below;
  focusLesson(L.phase === 'options' ? null : 'lesson-go');
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

function lessonAnswer(choice) {
  const L = lesson;
  if (L.phase !== 'options') return;
  const q = currentCard().q;
  const right = choice === q.answer;
  const firstTime = !L.seen.has(q.id);
  L.seen.add(q.id);
  L.picked = choice;
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
  if (right) lessonAdvanceTimer = setTimeout(lessonNext, 1400);
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

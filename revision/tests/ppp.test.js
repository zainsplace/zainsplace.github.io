/* Unit tests for revision/ppp.js. Run: node --test revision/tests/ppp.test.js */
const test = require('node:test');
const assert = require('node:assert/strict');
const PPP = require('../ppp.js');

const T = '2026-10-15';
const sat = (ref, date, status = 'done', kind = 'paper') =>
  ({ id: kind + ref + date, kind, ref, date, status, score: 0, max: 90, minutesUsed: 0, parts: {} });

test('addDays crosses month and year ends', () => {
  assert.equal(PPP.addDays('2026-10-30', 2), '2026-11-01');
  assert.equal(PPP.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(PPP.addDays(T, 21), '2026-11-05');
});

test('each part gets 80 seconds a mark', () => {
  assert.equal(PPP.partSeconds(2), 160);
  assert.equal(PPP.partSeconds(9), 720);
  assert.equal(PPP.partSeconds(12), 960);
});

test('a paper rests for 21 days after a completed sitting', () => {
  const s = [sat('p1', '2026-10-01')];
  assert.equal(PPP.restUntil(s, 'p1'), '2026-10-22');
  assert.equal(PPP.isResting(s, 'p1', '2026-10-21'), true);
  assert.equal(PPP.isResting(s, 'p1', '2026-10-22'), false);
});

test('abandoned sittings and topic sets do not start a rest', () => {
  const s = [sat('p1', T, 'abandoned'), sat('p1', T, 'done', 'topic')];
  assert.equal(PPP.lastSat(s, 'p1'), null);
  assert.equal(PPP.isResting(s, 'p1', T), false);
});

test('the latest completed sitting sets the rest', () => {
  const s = [sat('p1', '2026-10-10'), sat('p1', '2026-09-01')];
  assert.equal(PPP.restUntil(s, 'p1'), '2026-10-31');
});

const papers = [{ id: 'p1' }, { id: 'p2' }, { id: 'jun26' }];

test('nextPaper picks a never-sat paper, in file order', () => {
  assert.equal(PPP.nextPaper(papers, [sat('p1', '2026-10-01')], T), 'p2');
});

test('nextPaper then picks the paper sat longest ago that is not resting', () => {
  const s = [sat('p1', '2026-09-01'), sat('p2', '2026-09-10'), sat('jun26', '2026-10-10')];
  assert.equal(PPP.nextPaper(papers, s, T), 'p1');
});

test('nextPaper returns null when every paper is resting', () => {
  const s = [sat('p1', '2026-10-01'), sat('p2', '2026-10-02'), sat('jun26', '2026-10-03')];
  assert.equal(PPP.nextPaper(papers, s, T), null);
});

const L = ['C', 'D', 'B', 'E', 'A', 'F'];

test('nextTopicSection picks the fewest sets, ties in manifest order', () => {
  assert.equal(PPP.nextTopicSection(L, []), 'C');
  assert.equal(PPP.nextTopicSection(L, [sat('C', T, 'done', 'topic')]), 'D');
  assert.equal(PPP.nextTopicSection(L, [sat('C', T, 'abandoned', 'topic')]), 'C');
});

test('suggestPhase: 1 to 2 once every section has a completed set', () => {
  const five = L.slice(0, 5).map(x => sat(x, T, 'done', 'topic'));
  assert.equal(PPP.suggestPhase(1, L, five), null);
  assert.equal(PPP.suggestPhase(1, L, [...five, sat('F', T, 'done', 'topic')]), 2);
});

test('suggestPhase: 2 to 3 after two full papers, nothing in phase 3', () => {
  assert.equal(PPP.suggestPhase(2, L, [sat('p1', T)]), null);
  assert.equal(PPP.suggestPhase(2, L, [sat('p1', T), sat('p2', T)]), 3);
  assert.equal(PPP.suggestPhase(3, L, [sat('p1', T), sat('p2', T)]), null);
});

test('doNext: phase 1 offers a topic set, phases 2-3 a paper', () => {
  const base = { letters: L, papers, sittings: [], today: T };
  assert.deepEqual(PPP.doNext({ ...base, phase: 1 }), { kind: 'topic', section: 'C' });
  assert.deepEqual(PPP.doNext({ ...base, phase: 2 }), { kind: 'paper', paperId: 'p1', timed: false });
  assert.deepEqual(PPP.doNext({ ...base, phase: 3 }), { kind: 'paper', paperId: 'p1', timed: true });
});

test('doNext: rest when every paper is resting', () => {
  const s = [sat('p1', '2026-10-01'), sat('p2', '2026-10-02'), sat('jun26', '2026-10-03')];
  assert.deepEqual(PPP.doNext({ phase: 2, letters: L, papers, sittings: s, today: T }), { kind: 'rest' });
});

const qfile = {
  papers: [{ id: 'p1', scenarios: ['s1'] }, { id: 'jun26', sealed: true, scenarios: ['s9'] }],
  questions: [{ id: 'a', scenario: 's1', section: 'A' }, { id: 'b', scenario: 's9', section: 'A' }, { id: 'f1', section: 'F' }]
};

test('bankQuestions leaves out sealed papers and keeps standalone parts', () => {
  assert.deepEqual(PPP.bankQuestions(qfile).map(q => q.id), ['a', 'f1']);
  assert.equal(PPP.isSealed(qfile.questions[1], qfile), true);
  assert.equal(PPP.isSealed(qfile.questions[2], qfile), false);
  assert.equal(PPP.hasPPP(qfile), true);
  assert.equal(PPP.hasPPP({ papers: [{ id: 'p1', scenarios: [] }], questions: [] }), false);
  assert.deepEqual(PPP.bankQuestions(null), []);
});

test('buildTopicSet: untried first, then lowest mark, spread across scenarios', () => {
  const bank = [
    { id: 'x1', scenario: 's1', section: 'A' }, { id: 'x2', scenario: 's1', section: 'A' },
    { id: 'x3', scenario: 's2', section: 'A' }, { id: 'x4', scenario: 's3', section: 'A' },
    { id: 'y1', scenario: 's1', section: 'B' }
  ];
  // Ranked: x2, x4 (untried, file order), x3 (20%), x1 (90%).
  // Spread: x2 (s1), x4 (s3), x3 (s2); every scenario used, so start again: x1.
  assert.deepEqual(PPP.buildTopicSet(bank, 'A', { x1: 90, x3: 20 }), ['x2', 'x4', 'x3', 'x1']);
});

test('buildTopicSet caps at 8 and returns [] for an empty section', () => {
  const bank = Array.from({ length: 10 }, (_, i) => ({ id: 'q' + i, scenario: 's' + i, section: 'A' }));
  assert.equal(PPP.buildTopicSet(bank, 'A', {}).length, 8);
  assert.deepEqual(PPP.buildTopicSet(bank, 'F', {}), []);
});

test('lostMarks and partDiagnosed', () => {
  assert.equal(PPP.lostMarks(2, 4), 2);
  assert.equal(PPP.lostMarks(4, 4), 0);
  assert.equal(PPP.partDiagnosed(['knowledge', 'misread'], 2), true);
  assert.equal(PPP.partDiagnosed(['knowledge', null], 2), false);
  assert.equal(PPP.partDiagnosed(['knowledge', 'guess'], 2), false);
  assert.equal(PPP.partDiagnosed(['knowledge'], 2), false);
  assert.equal(PPP.partDiagnosed(undefined, 1), false);
});

test('needsWrittenFix only when a reason is knowledge', () => {
  assert.equal(PPP.needsWrittenFix(['misread', 'knowledge']), true);
  assert.equal(PPP.needsWrittenFix(['misread', 'time']), false);
  assert.equal(PPP.needsWrittenFix(undefined), false);
});

test('reasonCounts adds up lost marks by reason', () => {
  const parts = { a: { reasons: ['knowledge', 'misread'] }, b: { reasons: ['misread'] }, c: { reasons: [] } };
  assert.deepEqual(PPP.reasonCounts(parts), { knowledge: 1, technique: 0, misread: 2, time: 0, careless: 0 });
});

test('recordSitting keeps the latest 100', () => {
  const st = PPP.defaultState();
  for (let i = 0; i < 105; i++) PPP.recordSitting(st, sat('p' + i, T));
  assert.equal(st.sittings.length, 100);
  assert.equal(st.sittings[0].ref, 'p5');
});

test('coerceState turns junk into the default', () => {
  assert.deepEqual(PPP.coerceState(null), PPP.defaultState());
  assert.deepEqual(PPP.coerceState({ phase: 7, sittings: 'x', active: 5 }), PPP.defaultState());
});

test('coerceState keeps good sittings and drops bad ones and bad parts', () => {
  const good = { ...sat('p1', '2026-10-01'), parts: JSON.parse('{"__proto__": {"score": 1}, "a": {"score": 2, "reasons": [], "fix": "", "redo": null, "seconds": 30}, "b": {"score": 2}}') };
  const s = PPP.coerceState({ phase: 2, sittings: [good, { kind: 'paper' }, null] });
  assert.equal(s.phase, 2);
  assert.equal(s.sittings.length, 1);
  assert.deepEqual(Object.keys(s.sittings[0].parts), ['a']);
  assert.equal(Object.getPrototypeOf(s.sittings[0].parts), Object.prototype);
});

const active = () => ({
  id: 's1', kind: 'paper', ref: 'jun26', timed: true, step: 'diagnose',
  startedAt: 1, qIds: ['a', 'b', 'c'], idx: 1, partStartedAt: 5, partEndAt: 9,
  answers: { 'ppp-a': 'text', 'evil': 'x', 'ppp-b': 5 }, scores: { a: 1, b: 2, c: -1, zz: 2 },
  reasons: { a: ['knowledge', null], b: ['time', 'time'], c: ['nope'] }, fixes: { a: 'fix', zz: 'x' },
  redoAnswers: { 'pppr-a-0': 'again' }, redoScores: { a: 3 }, seconds: { a: 40, b: -5 }
});

test('coerceState keeps a valid active sitting and filters its maps', () => {
  const a = PPP.coerceState({ active: active() }).active;
  assert.deepEqual(a.qIds, ['a', 'b', 'c']);
  assert.equal(a.idx, 1);
  assert.equal(a.step, 'diagnose');
  assert.equal(a.timed, true);
  assert.equal(a.partEndAt, 9);
  assert.deepEqual(a.answers, { 'ppp-a': 'text' });
  assert.deepEqual(a.scores, { a: 1, b: 2 });
  assert.deepEqual(a.reasons, { a: ['knowledge', null], b: ['time', 'time'] });
  assert.deepEqual(a.fixes, { a: 'fix' });
  assert.deepEqual(a.redoAnswers, { 'pppr-a-0': 'again' });
  assert.deepEqual(a.redoScores, { a: 3 });
  assert.deepEqual(a.seconds, { a: 40 });
});

test('coerceState drops an active sitting with a bad step, kind, index or no parts', () => {
  assert.equal(PPP.coerceState({ active: active() }).active.id, 's1');
  for (const bad of [{ step: 'party' }, { kind: 'log' }, { qIds: [] }, { idx: 3 }, { idx: -1 },
                     { startedAt: 'x' }, { partEndAt: 'soon' }]) {
    assert.deepEqual(PPP.coerceState({ active: { ...active(), ...bad } }).active, {}, JSON.stringify(bad));
  }
});

test('pruneUnknown drops sitting parts and an active sitting that reference missing parts', () => {
  const st = PPP.defaultState();
  st.sittings = [{ ...sat('p1', T), parts: { a: { score: 1 }, gone: { score: 0 } } }];
  st.active = active();
  st.active.qIds = ['a', 'gone'];
  PPP.pruneUnknown(st, new Set(['a']));
  assert.deepEqual(Object.keys(st.sittings[0].parts), ['a']);
  assert.deepEqual(st.active, {});
});

test('answerSeconds: timed parts are capped at their clock', () => {
  assert.equal(PPP.answerSeconds(0, 500000, 2, true), 160);
  assert.equal(PPP.answerSeconds(0, 60000, 2, true), 60);
});

test('answerSeconds: untimed parts are capped at three times exam pace, so time away does not count', () => {
  assert.equal(PPP.answerSeconds(0, 90000, 4, false), 90);
  assert.equal(PPP.answerSeconds(0, 86400000, 4, false), 960);
  assert.equal(PPP.answerSeconds(5000, 1000, 4, false), 0);
});

test('coerceState drops a live sitting whose step does not match its marks', () => {
  const base = { id: 's1', kind: 'topic', ref: 'A', timed: false, startedAt: 1, partStartedAt: 1, partEndAt: null, qIds: ['a', 'b'] };
  // Past the mark step, the current part must have a score.
  assert.deepEqual(PPP.coerceState({ active: { ...base, idx: 0, step: 'next', scores: {} } }).active, {});
  // Every earlier part must have been marked.
  assert.deepEqual(PPP.coerceState({ active: { ...base, idx: 1, step: 'answer', scores: {} } }).active, {});
  // Diagnose and fix need a reason list for the current part.
  assert.deepEqual(PPP.coerceState({ active: { ...base, idx: 0, step: 'fix', scores: { a: 1 } } }).active, {});
  // Consistent sittings survive.
  assert.equal(PPP.coerceState({ active: { ...base, idx: 1, step: 'answer', scores: { a: 2 } } }).active.id, 's1');
  assert.equal(PPP.coerceState({ active: { ...base, idx: 0, step: 'diagnose', scores: { a: 1 }, reasons: { a: [null] } } }).active.id, 's1');
  assert.equal(PPP.coerceState({ active: { ...base, idx: 0, step: 'redomark', scores: { a: 1 }, reasons: { a: ['time'] } } }).active.id, 's1');
});

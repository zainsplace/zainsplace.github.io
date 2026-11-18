const test = require('node:test');
const assert = require('node:assert/strict');
const MEMORY = require('../memory.js');

const TODAY = '2026-11-18';

test('status', () => {
  assert.equal(MEMORY.status(undefined, TODAY), 'new');
  assert.equal(MEMORY.status({ s: 0, due: '' }, TODAY), 'new');
  assert.equal(MEMORY.status({ s: 2, due: '2026-11-20' }, TODAY), 'learning');
  assert.equal(MEMORY.status({ s: 4, due: '2026-11-30' }, TODAY), 'mastered');
  assert.equal(MEMORY.status({ s: 4, due: '2026-11-18' }, TODAY), 'forgotten');
});

test('applyResult right answers climb the ladder', () => {
  let r = MEMORY.applyResult(undefined, true, TODAY);
  assert.equal(r.days, 1);
  assert.equal(r.rec.s, 1);
  assert.equal(r.rec.due, '2026-11-19');
  assert.equal(r.rec.seen, TODAY);
  r = MEMORY.applyResult({ s: 2, due: TODAY, seen: '', lapses: 0 }, true, TODAY);
  assert.equal(r.days, 7);
  assert.equal(r.rec.s, 3);
  r = MEMORY.applyResult({ s: 5, due: TODAY, seen: '', lapses: 0 }, true, TODAY);
  assert.equal(r.days, 90);
  assert.equal(r.rec.s, 5);
});

test('applyResult wrong answers drop two steps', () => {
  let r = MEMORY.applyResult({ s: 4, due: TODAY, seen: '', lapses: 0 }, false, TODAY);
  assert.equal(r.rec.s, 2);
  assert.equal(r.rec.due, '2026-11-19');
  assert.equal(r.rec.lapses, 1);
  assert.equal(r.days, 1);
  r = MEMORY.applyResult({ s: 1, due: TODAY, seen: '', lapses: 0 }, false, TODAY);
  assert.equal(r.rec.s, 1);
});

test('ringPercent', () => {
  assert.equal(MEMORY.ringPercent(['a', 'b'], { a: { s: 5 }, b: { s: 0 } }), 50);
  assert.equal(MEMORY.ringPercent(['a', 'z'], { a: { s: 5 } }), 50);
  assert.equal(MEMORY.ringPercent([], {}), 0);
});

test('buildRound puts this node first then earlier forgotten', () => {
  const memory = {};
  const earlier = [];
  for (let i = 0; i < 5; i++) { earlier.push('f' + i); memory['f' + i] = { s: 2, due: '2026-11-10' }; }
  for (let i = 0; i < 10; i++) { earlier.push('l' + i); memory['l' + i] = { s: 2, due: '2026-12-10' }; }
  const out = MEMORY.buildRound({ nodeCodes: ['n1'], earlierCodes: earlier, memory, todayStr: TODAY });
  assert.equal(out.length, 11);
  assert.equal(out[0], 'n1');
  assert.deepEqual(out.slice(1, 6), ['f0', 'f1', 'f2', 'f3', 'f4']);
  assert.equal(new Set(out).size, out.length);
});

test('buildRound with no earlier codes', () => {
  assert.deepEqual(MEMORY.buildRound({ nodeCodes: ['n1'], earlierCodes: [], memory: {}, todayStr: TODAY }), ['n1']);
});

test('buildRound orders node codes forgotten, learning, new, mastered', () => {
  const memory = {
    m: { s: 4, due: '2026-12-30' },
    l: { s: 2, due: '2026-12-30' },
    f: { s: 3, due: '2026-11-01' }
  };
  const out = MEMORY.buildRound({ nodeCodes: ['m', 'n', 'l', 'f'], earlierCodes: [], memory, todayStr: TODAY });
  assert.deepEqual(out, ['f', 'l', 'n', 'm']);
});

test('combo', () => {
  assert.equal(MEMORY.combo(0), 1);
  assert.equal(MEMORY.combo(2), 1);
  assert.equal(MEMORY.combo(3), 1.5);
  assert.equal(MEMORY.combo(5), 2);
});

test('touch keeps strength and sets due tomorrow', () => {
  const r = MEMORY.touch({ s: 3, due: '2026-12-01' }, TODAY);
  assert.equal(r.s, 3);
  assert.equal(r.due, '2026-11-19');
  assert.equal(r.seen, TODAY);
  assert.equal(MEMORY.touch(undefined, TODAY).s, 1);
});

test('date maths crosses month and year ends', () => {
  const r = MEMORY.applyResult(undefined, true, '2026-12-31');
  assert.equal(r.rec.due, '2027-01-01');
});

test('seed', () => {
  const items = [
    { code: 'A1.1.1', nodeId: 'n1' },
    { code: 'A1.1.2', nodeId: 'n1' },
    { code: 'A1.1.3', nodeId: 'n1' },
    { code: 'A1.1.4', nodeId: 'n1' },
    { code: 'A1.1.5', nodeId: 'n2' }
  ];
  const m = MEMORY.seed({
    items,
    lessonsDone: new Set(['n1']),
    rag: { 'A1.1.2': 'green', 'A1.1.3': 'red' },
    flashBoxes: { 'A1.1.4': 4 },
    flashDue: {},
    todayStr: TODAY
  });
  assert.equal(m['A1.1.1'].s, 2);
  assert.equal(m['A1.1.1'].due, '2026-11-21');
  assert.equal(m['A1.1.1'].seen, '');
  assert.equal(m['A1.1.1'].lapses, 0);
  assert.equal(m['A1.1.2'].s, 3);
  assert.equal(m['A1.1.2'].due, '2026-11-25');
  assert.equal(m['A1.1.3'].s, 1);
  assert.equal(m['A1.1.3'].due, TODAY);
  assert.equal(m['A1.1.4'].s, 4);
  assert.equal(m['A1.1.4'].due, '2026-12-04');
  assert.equal('A1.1.5' in m, false);
});

test('seed accepts an array of done lessons and flash boxes alone', () => {
  const m = MEMORY.seed({
    items: [{ code: 'A1.1.1', nodeId: 'n1' }, { code: 'A1.1.2', nodeId: 'n2' }],
    lessonsDone: ['n1'],
    rag: {},
    flashBoxes: { 'A1.1.2': 5 },
    todayStr: TODAY
  });
  assert.equal(m['A1.1.1'].s, 2);
  assert.equal(m['A1.1.2'].s, 5);
  assert.equal(m['A1.1.2'].due, '2026-12-23');
});

test('coerce', () => {
  const raw = JSON.parse('{"B1.1.1":{"s":9},"__proto__":{"s":1},"x":"bad","C2.3.10":{"s":2,"due":"2026-11-20","seen":"nope","lapses":-3},"B1.1.2":5}');
  assert.deepEqual(MEMORY.coerce(raw), {
    'B1.1.1': { s: 5, due: '', seen: '', lapses: 0 },
    'C2.3.10': { s: 2, due: '2026-11-20', seen: '', lapses: 0 }
  });
  assert.deepEqual(MEMORY.coerce(null), {});
});

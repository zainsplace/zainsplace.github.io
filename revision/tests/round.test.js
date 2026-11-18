const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../round.js');

const TODAY = '2026-11-18';
const SET = { style: 'mixed', hideOptions: true, spelling: true };

/* A tiny unit: one section, one topic, three subtopics (path nodes).
   n1 has four terms, n2 one term, n3 three. */
function item(code, term, definition, extra = {}) {
  return Object.assign({ code, term, definition }, extra);
}
const subs = [
  { code: 'A1.1', title: 'Devices', items: [
    item('A1.1.1', 'Server', 'A computer that provides services to other computers on a network.', { examples: 'File server; web server; mail server', keyFacts: ['A Server is usually always on.'] }),
    item('A1.1.2', 'Router', 'A device that forwards packets between networks.', { examples: 'Home broadband box; core internet router; office gateway' }),
    item('A1.1.3', 'Switch', 'A device that connects devices within one local network.'),
    item('A1.1.4', 'Infrastructure as a Service Delivered Over the Internet By Providers', 'Renting servers and storage from a provider as a utility.')
  ] },
  { code: 'A1.2', title: 'Lonely', items: [
    item('A1.2.1', 'Firewall', 'Software or hardware that filters network traffic by rules.')
  ] },
  { code: 'A1.3', title: 'Media', items: [
    item('A1.3.1', 'Fibre', 'Cable that carries data as pulses of light.'),
    item('A1.3.2', 'Copper', 'Cable that carries data as electrical signals.'),
    item('A1.3.3', 'Wireless', 'Data carried by radio waves without cables.')
  ] }
];
const topic = { code: 'A1', title: 'Networks', subtopics: subs };
const section = { title: 'Section A', topics: [topic] };
const nodes = subs.map(s => ({ id: s.code, letter: 'A', title: s.title, items: s.items, section, topic, sub: s }));
const byId = id => nodes.find(n => n.id === id);
const findItem = code => nodes.flatMap(n => n.items).find(i => i.code === code);

const BANK = {
  'A1.1.1': [{ q: 'A school needs one machine to host its website. What is it?', options: ['Server', 'Router', 'Switch', 'Firewall'], answer: 0, why: 'Servers host services.' }]
};

function fakeCtx() {
  const calls = { result: [], hinted: [] };
  return {
    calls,
    settings: SET,
    recordTermResult(code, ok) { calls.result.push([code, ok]); return ok ? 3 : 1; },
    recordHinted(code) { calls.hinted.push(code); }
  };
}

/* ---------- formats by status ---------- */

test('new, learning and forgotten terms get multiple choice with hidden options, scenario first', () => {
  for (const st of ['new', 'learning', 'forgotten']) {
    const q = R.questionFor(findItem('A1.1.1'), st, 'memorize', SET, { node: byId('A1.1'), bank: BANK });
    assert.equal(q.kind, 'mcq', st);
    assert.equal(q.hidden, true, st);
    assert.equal(q.label, 'Scenario', st);
    assert.equal(q.answer, 'Server');
    assert.ok(q.options.includes('Server'));
  }
  const q = R.questionFor(findItem('A1.1.2'), 'new', 'memorize', SET, { node: byId('A1.1'), bank: BANK });
  assert.equal(q.kind, 'mcq');
  assert.equal(q.answer, 'Router');
  assert.ok(q.options.length >= 3);
  assert.ok(!q.prompt.includes('Router'), 'the prompt must not give the answer away');
});

test('hideOptions false shows options straight away', () => {
  const q = R.questionFor(findItem('A1.1.2'), 'new', 'memorize', { ...SET, hideOptions: false }, { node: byId('A1.1') });
  assert.equal(q.hidden, false);
});

test('mastered typeable terms are typed or a typed gap; non-typeable stay multiple choice', () => {
  for (let i = 0; i < 20; i++) {
    const q = R.questionFor(findItem('A1.1.1'), 'mastered', 'memorize', SET, { node: byId('A1.1'), bank: BANK });
    assert.ok(q.kind === 'type' || q.kind === 'gap', q.kind);
    assert.ok(q.accepts.includes('Server'));
    assert.ok(!q.prompt.includes('Server'));
  }
  const long = findItem('A1.1.4');
  assert.equal(R.isTypeable(long.term), false);
  const q = R.questionFor(long, 'mastered', 'memorize', SET, { node: byId('A1.1') });
  assert.equal(q.kind, 'mcq');
});

test('a gap is offered when a sentence about the term names it', () => {
  const kinds = new Set();
  for (let i = 0; i < 40; i++) kinds.add(R.questionFor(findItem('A1.1.1'), 'mastered', 'memorize', SET, { node: byId('A1.1') }).kind);
  assert.ok(kinds.has('gap') && kinds.has('type'));
});

test('hard mode types where typeable, else multiple choice with no hint', () => {
  const q = R.questionFor(findItem('A1.1.2'), 'new', 'hard', SET, { node: byId('A1.1') });
  assert.ok(q.kind === 'type' || q.kind === 'gap');
  const m = R.questionFor(findItem('A1.1.4'), 'new', 'hard', SET, { node: byId('A1.1') });
  assert.equal(m.kind, 'mcq');
  assert.equal(m.noHint, true);
});

test('style settings override the status rule', () => {
  const ctx = { node: byId('A1.1') };
  assert.equal(R.questionFor(findItem('A1.1.2'), 'mastered', 'memorize', { ...SET, style: 'mcq' }, ctx).kind, 'mcq');
  assert.ok(['type', 'gap'].includes(R.questionFor(findItem('A1.1.2'), 'new', 'memorize', { ...SET, style: 'typing' }, ctx).kind));
  assert.equal(R.questionFor(findItem('A1.1.2'), 'new', 'memorize', { ...SET, style: 'flash' }, ctx).kind, 'flip');
});

test('true/false and multi-select builders', () => {
  const tf = R.tfQuestion(findItem('A1.1.2'), byId('A1.1'));
  assert.equal(tf.kind, 'tf');
  assert.equal(typeof tf.answer, 'boolean');
  const multi = R.multiQuestion(findItem('A1.1.1'), byId('A1.1'));
  assert.equal(multi.kind, 'multi');
  assert.deepEqual(multi.answers.slice().sort(), ['File server', 'mail server', 'web server'].sort());
  assert.ok(multi.options.length > multi.answers.length);
  multi.answers.forEach(a => assert.ok(multi.options.includes(a)));
  assert.equal(R.multiQuestion(findItem('A1.1.3'), byId('A1.1')), null, 'no examples, no multi');
});

test('multi-select never offers a wrong pick that contains a right one', () => {
  const a = item('C1.1.1', 'SaaS', 'Software rented over the internet.', { examples: 'Microsoft 365; Google Workspace; Salesforce' });
  const b = item('C1.1.2', 'Hybrid', 'A mix of clouds.', { examples: 'A school using Microsoft 365; a bank mixing clouds; a shop with two clouds; a council archive' });
  const t = { subtopics: [{ items: [a, b] }] };
  const n = { id: 'C1.1', items: [a, b], topic: t, section: { topics: [t] } };
  for (let i = 0; i < 10; i++) {
    const q = R.multiQuestion(a, n);
    assert.ok(!q.options.includes('A school using Microsoft 365'));
  }
});

/* ---------- building a round ---------- */

test('a round has at most 11 term cards, with new terms taught in batches first', () => {
  const big = Array.from({ length: 15 }, (_, i) => item(`B1.1.${i + 1}`, `Term${i + 1}`, `Meaning number ${i + 1}.`));
  const sub = { code: 'B1.1', items: big };
  const t = { subtopics: [sub] };
  const n = { id: 'B1.1', items: big, topic: t, section: { topics: [t] } };
  const r = R.makeRound({ node: n, nodes: [n], memory: {}, todayStr: TODAY, settings: SET });
  assert.equal(r.cards.length, 11);
  assert.equal(r.pos, 0); assert.equal(r.xp, 0); assert.equal(r.run, 0); assert.equal(r.coins, 0);
  assert.equal(r.nodeId, 'B1.1'); assert.equal(r.mode, 'memorize');
  const taught = r.cards.flatMap(c => (c.teach || []).map(i => i.code));
  assert.equal(taught.length, 11, 'every new term is taught once');
  assert.ok(r.cards.filter(c => c.teach).every(c => c.teach.length <= R.TEACH_BATCH + 1));
  // every term is taught before (or on) its own card
  const seen = new Set();
  r.cards.forEach(c => { (c.teach || []).forEach(i => seen.add(i.code)); assert.ok(seen.has(c.code), c.code + ' asked before taught'); });
});

test('a 1-term node is topped up from earlier nodes', () => {
  const memory = {
    'A1.1.1': { s: 2, due: '2026-11-17', seen: '', lapses: 0 },   // forgotten
    'A1.1.2': { s: 2, due: '2026-11-25', seen: '', lapses: 0 },   // learning
    'A1.1.3': { s: 4, due: '2026-12-25', seen: '', lapses: 0 }    // mastered
  };
  const r = R.makeRound({ node: byId('A1.2'), nodes, memory, todayStr: TODAY, settings: SET });
  const codes = r.cards.map(c => c.code);
  assert.equal(codes[0] === 'A1.2.1' || codes.includes('A1.2.1'), true);
  assert.ok(codes.includes('A1.1.1') && codes.includes('A1.1.2'));
  assert.ok(codes.length >= 3);
});

test('a 1-term node is topped up with earlier mastered terms when nothing is due', () => {
  const memory = {};
  subs[0].items.forEach(i => { memory[i.code] = { s: 4, due: '2026-12-25', seen: '', lapses: 0 }; });
  const r = R.makeRound({ node: byId('A1.2'), nodes, memory, todayStr: TODAY, settings: SET });
  assert.ok(r.cards.length >= R.MIN_ROUND, 'got ' + r.cards.length);
});

test('review mode uses the unit\'s forgotten terms', () => {
  const memory = {
    'A1.1.2': { s: 2, due: '2026-11-10', seen: '', lapses: 0 },
    'A1.3.3': { s: 3, due: '2026-11-18', seen: '', lapses: 0 },
    'A1.3.1': { s: 3, due: '2026-12-18', seen: '', lapses: 0 }
  };
  const r = R.makeRound({ node: null, nodes, memory, todayStr: TODAY, mode: 'review', settings: SET });
  assert.deepEqual(r.cards.map(c => c.code).sort(), ['A1.1.2', 'A1.3.3']);
  assert.ok(r.cards.every(c => c.status === 'forgotten'));
});

/* ---------- answering ---------- */

function roundOf(code, status = 'learning', settings = SET) {
  const it = findItem(code);
  const node = nodes.find(n => n.items.includes(it));
  return R.makeRound({ node, nodes, memory: {}, todayStr: TODAY, settings, cards: [R.makeCard(it, status, 'memorize', settings, { node, bank: BANK })] });
}

test('right first time records the result and awards 5 x combo XP', () => {
  const ctx = fakeCtx();
  const r = roundOf('A1.1.1');
  const ev = R.answerCard(r, 'Server', ctx);
  assert.equal(ev.right, true);
  assert.equal(ev.xp, 5);
  assert.equal(ev.days, 3);
  assert.equal(r.xp, 5);
  assert.equal(r.run, 1);
  assert.equal(r.cards[0].outcome, 'right');
  assert.deepEqual(ctx.calls.result, [['A1.1.1', true]]);

  const r3 = roundOf('A1.1.1'); r3.run = 3;
  assert.equal(R.answerCard(r3, 'Server', fakeCtx()).xp, Math.round(5 * 1.5));
  const r5 = roundOf('A1.1.1'); r5.run = 5;
  assert.equal(R.answerCard(r5, 'Server', fakeCtx()).xp, 10);
});

test('a wrong answer resets the run and re-queues the card as Retry at the end', () => {
  const ctx = fakeCtx();
  const r = roundOf('A1.1.1');
  r.run = 4;
  const ev = R.answerCard(r, 'Router', ctx);
  assert.equal(ev.right, false);
  assert.equal(ev.requeued, true);
  assert.equal(r.run, 0);
  assert.equal(r.xp, 0);
  assert.equal(r.cards.length, 2);
  assert.equal(r.cards[0].outcome, 'wrong');
  assert.deepEqual(r.cards[0].tried, ['Router']);
  assert.equal(r.cards[0].done, false, 'he tries again on the same card');
  assert.equal(r.cards[1].retry, true);
  assert.equal(r.cards[1].code, 'A1.1.1');
  assert.deepEqual(ctx.calls.result, [['A1.1.1', false]]);

  // second try on the same card: right, but no XP and no second record
  const ev2 = R.answerCard(r, 'Server', ctx);
  assert.equal(ev2.right, true);
  assert.equal(ev2.xp, 0);
  assert.equal(r.cards[0].done, true);
  assert.equal(ctx.calls.result.length, 1);
  assert.equal(r.cards.length, 2, 'not re-queued twice');

  // the Retry card later: right, no XP, no record
  R.nextCard(r);
  const ev3 = R.answerCard(r, 'Server', ctx);
  assert.equal(ev3.right, true);
  assert.equal(ev3.xp, 0);
  assert.equal(r.cards[1].outcome, 'retry');
  assert.equal(ctx.calls.result.length, 1);
});

test('a hinted right answer earns no XP and calls recordHinted, not recordTermResult', () => {
  const ctx = fakeCtx();
  const r = roundOf('A1.1.1');
  const h = R.hintCard(r);
  assert.ok(h && h.greyed && h.greyed !== 'Server');
  assert.equal(r.cards[0].hinted, true);
  const ev = R.answerCard(r, 'Server', ctx);
  assert.equal(ev.right, true);
  assert.equal(ev.xp, 0);
  assert.equal(r.xp, 0);
  assert.deepEqual(ctx.calls.hinted, ['A1.1.1']);
  assert.deepEqual(ctx.calls.result, []);
});

test('hints never grey the answer or the last wrong option', () => {
  const r = roundOf('A1.1.1');
  for (let i = 0; i < 10; i++) R.hintCard(r);
  const q = r.cards[0].q;
  const left = q.options.filter(o => !r.cards[0].greyed.includes(o));
  assert.ok(left.includes('Server'));
  assert.equal(left.length, 2);
});

test('reveal counts as wrong', () => {
  const ctx = fakeCtx();
  const r = roundOf('A1.1.1');
  r.run = 2;
  const ev = R.revealCard(r, ctx);
  assert.equal(ev.right, false);
  assert.equal(ev.answer, 'Server');
  assert.equal(r.run, 0);
  assert.equal(r.cards[0].outcome, 'wrong');
  assert.equal(r.cards[0].done, true);
  assert.equal(r.cards[r.cards.length - 1].retry, true);
  assert.deepEqual(ctx.calls.result, [['A1.1.1', false]]);
});

test('explain before answering counts as wrong; after answering it is free', () => {
  const ctx = fakeCtx();
  const r = roundOf('A1.1.1');
  const ev = R.explainCard(r, ctx);
  assert.equal(ev.counted, true);
  assert.equal(r.cards[0].outcome, 'wrong');
  assert.deepEqual(ctx.calls.result, [['A1.1.1', false]]);

  const ctx2 = fakeCtx();
  const r2 = roundOf('A1.1.1');
  R.answerCard(r2, 'Server', ctx2);
  assert.equal(R.explainCard(r2, ctx2).counted, false);
  assert.equal(ctx2.calls.result.length, 1);
});

test('typed answers forgive small spelling mistakes only when spelling is allowed', () => {
  const r = roundOf('A1.1.2', 'mastered');
  assert.ok(['type', 'gap'].includes(r.cards[0].q.kind));
  assert.equal(R.answerCard(r, 'Ruoter', fakeCtx()).right, false, 'Router (6 letters) allows 1 edit, "Ruoter" is 2');
  const ok = roundOf('A1.1.2', 'mastered');
  const ev = R.answerCard(ok, 'Routr', fakeCtx());
  assert.equal(ev.right, true);
  assert.equal(ev.close, true);
  const strict = roundOf('A1.1.2', 'mastered', { ...SET, spelling: false });
  assert.equal(R.answerCard(strict, 'Routr', { ...fakeCtx(), settings: { ...SET, spelling: false } }).right, false);
});

test('true/false, multi-select and flashcard answers', () => {
  const tf = R.tfQuestion(findItem('A1.1.2'), byId('A1.1'));
  assert.equal(R.checkResponse(tf, tf.answer, SET).right, true);
  assert.equal(R.checkResponse(tf, !tf.answer, SET).right, false);
  const m = R.multiQuestion(findItem('A1.1.1'), byId('A1.1'));
  assert.equal(R.checkResponse(m, m.answers.slice().reverse(), SET).right, true);
  assert.equal(R.checkResponse(m, m.answers.slice(1), SET).right, false);
  assert.equal(R.checkResponse({ kind: 'flip' }, true, SET).right, true);
  assert.equal(R.checkResponse({ kind: 'flip' }, false, SET).right, false);
});

/* ---------- settings ---------- */

test('round settings load with defaults and survive bad storage', () => {
  const mem = {};
  const store = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } };
  assert.deepEqual(R.loadRoundSettings(store), { style: 'mixed', hideOptions: true, spelling: true });
  R.saveRoundSettings({ style: 'typing', hideOptions: false, spelling: false, junk: 1 }, store);
  assert.deepEqual(JSON.parse(mem.rev_round_settings), { style: 'typing', hideOptions: false, spelling: false });
  assert.deepEqual(R.loadRoundSettings(store), { style: 'typing', hideOptions: false, spelling: false });
  mem.rev_round_settings = '{not json';
  assert.deepEqual(R.loadRoundSettings(store), { style: 'mixed', hideOptions: true, spelling: true });
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.deepEqual(R.loadRoundSettings(broken), { style: 'mixed', hideOptions: true, spelling: true });
  assert.doesNotThrow(() => R.saveRoundSettings({ style: 'mcq' }, broken));
  assert.equal(R.coerceRoundSettings({ style: 'nonsense' }).style, 'mixed');
});

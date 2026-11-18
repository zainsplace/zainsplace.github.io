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
    item('A1.1.1', 'Server', 'A computer that provides services to other computers on a network.', { examples: 'Shared file store; website host; school email host', keyFacts: ['A Server is usually always on.'] }),
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
  assert.deepEqual(multi.answers.slice().sort(), ['Shared file store', 'school email host', 'website host'].sort());
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

test('XP is banked through ctx.gainXP as each card is answered', () => {
  const banked = [];
  const ctx = Object.assign(fakeCtx(), { gainXP: n => banked.push(n) });
  const r = roundOf('A1.1.1');
  R.answerCard(r, 'Server', ctx);
  const r3 = roundOf('A1.1.1'); r3.run = 3;
  R.answerCard(r3, 'Server', ctx);
  assert.deepEqual(banked, [5, 8]);
  // wrong, hinted and retry answers bank nothing
  const w = roundOf('A1.1.1'); R.answerCard(w, 'Router', ctx); R.answerCard(w, 'Server', ctx);
  const h = roundOf('A1.1.1'); R.hintCard(h); R.answerCard(h, 'Server', ctx);
  assert.deepEqual(banked, [5, 8]);
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

test('a styleOverride round builds only flip cards and leaves the saved settings alone', () => {
  const mem = {};
  const store = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } };
  R.saveRoundSettings({ style: 'mixed', hideOptions: true, spelling: false }, store);
  const before = mem.rev_round_settings;
  const settings = R.roundSettingsFor({ styleOverride: 'flash' }, store);
  assert.equal(settings.style, 'flash');
  assert.equal(settings.spelling, false);
  const r = R.makeRound({ node: byId('A1.1'), nodes, memory: {}, todayStr: TODAY, mode: 'memorize', settings, bank: BANK });
  assert.ok(r.cards.length > 0);
  assert.ok(r.cards.every(c => c.q.kind === 'flip'));
  assert.equal(mem.rev_round_settings, before);
  assert.equal(R.loadRoundSettings(store).style, 'mixed');
  // No override, or a bad one: the saved style.
  assert.equal(R.roundSettingsFor({}, store).style, 'mixed');
  assert.equal(R.roundSettingsFor({ styleOverride: 'nope' }, store).style, 'mixed');
  assert.equal(R.roundSettingsFor(undefined, store).style, 'mixed');
});

/* ---------- end of round ---------- */

test('a round records the step ring at its start', () => {
  const memory = { 'A1.1.1': { s: 5 }, 'A1.1.2': { s: 5 } };   // 10 of 20 strength points
  const r = R.makeRound({ node: byId('A1.1'), nodes, memory, todayStr: TODAY, settings: SET, bank: BANK });
  assert.equal(r.startRing, 50);
  const review = R.makeRound({ node: null, nodes, memory: {}, todayStr: TODAY, mode: 'review', settings: SET, cards: [] });
  assert.equal(review.nodeId, null);
});

test('the streak moved only when its day or count changed', () => {
  assert.equal(R.streakMoved({ last: '2026-11-17', count: 2 }, { last: '2026-11-18', count: 3 }), true);
  assert.equal(R.streakMoved({ last: '2026-11-10', count: 4 }, { last: '2026-11-18', count: 1 }), true);
  assert.equal(R.streakMoved({ last: '2026-11-18', count: 3 }, { last: '2026-11-18', count: 3 }), false);
  assert.equal(R.streakMoved(null, { last: '2026-11-18', count: 3 }), false);
});

test('the streak week runs Sunday to Saturday with studied days filled', () => {
  // 2026-11-18 is a Wednesday.
  const wk = R.streakWeek('2026-11-18', { '2026-11-16': 3, '2026-11-18': 1, '2026-11-19': 2, '2026-11-14': 9 });
  assert.deepEqual(wk.map(d => d.label), ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
  assert.deepEqual(wk.map(d => d.date), ['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21']);
  assert.deepEqual(wk.map(d => d.done), [false, true, false, true, true, false, false]);
  assert.deepEqual(wk.map(d => d.today), [false, false, false, true, false, false, false]);
  assert.equal(R.streakWeek('2026-11-15', {})[0].date, '2026-11-15');   // a Sunday starts its own week
});

test('overtaken: the highest-placed rival who was above you and is now below', () => {
  const row = (name, place, me = false) => ({ name, place, me });
  const before = [row('Ava', 1), row('Ben', 2), row('Cal', 3), row('Dee', 4), row('You', 5, true), row('Eli', 6)];
  const after = [row('Ava', 1), row('Ben', 2), row('You', 3, true), row('Cal', 4), row('Dee', 5), row('Eli', 6)];
  assert.equal(R.overtakenRival(before, after).name, 'Cal');
  // No climb, no rival.
  assert.equal(R.overtakenRival(before, before), null);
  // Climbing past someone who was already below you doesn't count.
  const b2 = [row('You', 2, true), row('Ava', 1), row('Ben', 3)];
  const a2 = [row('You', 1, true), row('Ava', 2), row('Ben', 3)];
  assert.equal(R.overtakenRival(b2, a2).name, 'Ava');
  assert.equal(R.overtakenRival(null, a2), null);
});

/* ---------- fairer typed checking and "I was right" ---------- */

test('typed checking ignores "and", "&", commas and slashes, and accepts each side of a spaced slash list', () => {
  const term = 'Passwords / Multi-Factor Authentication (MFA)';
  const acc = R.acceptedAnswers(term);
  assert.ok(R.checkTyped('Passwords, Multi-factor Authentication', acc));
  assert.ok(R.checkTyped('Passwords & Multi-Factor Authentication', acc));
  assert.ok(R.checkTyped('Passwords / Multi-Factor Authentication', acc));
  assert.ok(R.checkTyped('MFA', acc));
  assert.ok(R.checkTyped('Passwords', acc));
  assert.ok(R.checkTyped('Multi-Factor Authentication', acc));
  assert.equal(R.checkTyped('Firewall', acc), false);
  // Terms never split on "and": "Command and Control" alone needs both words.
  assert.equal(R.checkTyped('Command', R.acceptedAnswers('Command and Control')), false);
  assert.equal(R.checkTyped('Command & Control', R.acceptedAnswers('Command and Control')), 'exact');
});

function typedRound(memory = {}) {
  const it = findItem('A1.1.2');
  const node = byId('A1.1');
  const card = R.makeCard(it, 'mastered', 'memorize', { ...SET, style: 'typing' }, { node });
  card.q = { kind: 'type', code: it.code, label: 'Type the term', prompt: 'x', answer: it.term, accepts: R.acceptedAnswers(it.term), why: '' };
  return R.makeRound({ node, nodes, memory, todayStr: TODAY, settings: SET, cards: [card] });
}

function overrideCtx(memory) {
  const ctx = fakeCtx();
  ctx.calls.restore = [];
  ctx.banked = [];
  ctx.getMemory = code => memory[code] || null;
  ctx.restoreMemory = (code, rec) => { ctx.calls.restore.push([code, rec]); };
  ctx.recordTermResult = (code, ok) => {
    ctx.calls.result.push([code, ok]);
    memory[code] = { s: ok ? 4 : 1, due: 'x', seen: TODAY, lapses: ok ? 0 : 1 };
    return ok ? 6 : 1;
  };
  ctx.gainXP = n => ctx.banked.push(n);
  return ctx;
}

test('"I was right" undoes a wrong typed answer and counts it right first time', () => {
  const saved = { s: 3, due: '2026-11-18', seen: '2026-11-10', lapses: 0 };
  const memory = { 'A1.1.2': Object.assign({}, saved) };
  const ctx = overrideCtx(memory);
  const r = typedRound(memory);
  const ev = R.answerCard(r, 'Routing box', ctx);
  assert.equal(ev.right, false);
  assert.equal(r.cards.length, 2, 'a Retry copy was queued');
  assert.equal(r.run, 0);

  const o = R.overrideRight(r, r.cards[0], ctx);
  assert.ok(o);
  assert.deepEqual(ctx.calls.restore, [['A1.1.2', saved]], 'memory restored to the record from before the wrong answer');
  assert.deepEqual(ctx.calls.result, [['A1.1.2', false], ['A1.1.2', true]]);
  assert.equal(o.days, 6);
  assert.equal(o.xp, 5);
  assert.deepEqual(ctx.banked, [5], 'XP 5 banked once');
  assert.equal(r.xp, 5);
  assert.equal(r.cards.length, 1, 'the Retry copy is gone');
  assert.equal(r.cards[0].outcome, 'right');
  assert.equal(r.cards[0].overridden, true);
  assert.equal(r.cards[0].done, true);
  assert.equal(r.run, 1, 'the run is not reset: the right-first-time step is applied');

  assert.equal(R.overrideRight(r, r.cards[0], ctx), null, 'only once');
  assert.deepEqual(ctx.banked, [5]);
});

test('"I was right" keeps the combo from before the wrong answer', () => {
  const memory = {};
  const ctx = overrideCtx(memory);
  const r = typedRound(memory);
  r.run = 3;
  R.answerCard(r, 'nope', ctx);
  assert.equal(r.run, 0);
  const o = R.overrideRight(r, r.cards[0], ctx);
  assert.deepEqual(ctx.calls.restore, [['A1.1.2', null]], 'a term with no record goes back to none');
  assert.equal(o.xp, Math.round(5 * 1.5));
  assert.equal(r.run, 4);
});

test('"I was right" is not offered for multiple choice, hinted, revealed, explained or right cards', () => {
  const memory = {};
  const mcq = roundOf('A1.1.1');
  const ctx = overrideCtx(memory);
  R.answerCard(mcq, 'Router', ctx);
  assert.equal(R.overrideRight(mcq, mcq.cards[0], ctx), null, 'multiple choice');

  const hinted = typedRound(memory);
  R.hintCard(hinted);
  R.answerCard(hinted, 'nope', ctx);
  assert.equal(R.overrideRight(hinted, hinted.cards[0], ctx), null, 'hinted');

  const revealed = typedRound(memory);
  R.revealCard(revealed, ctx);
  assert.equal(R.overrideRight(revealed, revealed.cards[0], ctx), null, 'revealed');

  const explained = typedRound(memory);
  R.explainCard(explained, ctx);
  R.answerCard(explained, 'nope', ctx);
  assert.equal(R.overrideRight(explained, explained.cards[0], ctx), null, 'explained');

  const right = typedRound(memory);
  R.answerCard(right, 'Router', ctx);
  assert.equal(R.overrideRight(right, right.cards[0], ctx), null, 'already right');
  assert.equal(ctx.calls.restore.length, 0);
});

/* ---------- fair generated questions (spec audits: U1 section 5, U2 section 6) ---------- */

/* A one-subtopic node from fixture items (topic and section are the same list). */
function nodeOf(items, more = []) {
  const sub = { code: 'X1.1', items };
  const other = { code: 'X1.2', items: more };
  const t = { subtopics: more.length ? [sub, other] : [sub] };
  return { id: 'X1.1', items, topic: t, section: { topics: [t] }, sub };
}
const runs = (n, f) => { for (let i = 0; i < n; i++) f(i); };

// U2 G1 / U1 checked-fine: only real recaps are dropped.
test('recap check: merged range items are lesson items, "Compared" recaps are not', () => {
  assert.equal(!!R.isLessonItem(item('A4.1.8-9', 'Device Security & Finding Lost Devices', 'Locking devices and tracing lost ones.')), true);
  assert.equal(!!R.isLessonItem(item('B3.1.2-3', 'Ports & Packets', 'Numbered endpoints and units of data.')), true);
  assert.equal(!!R.isLessonItem(item('C1.1.1-C1.1.3', 'Cloud Deployment Models Compared', 'Private, public and hybrid side by side.')), false);
  assert.equal(!!R.isLessonItem(item('C1.1.1-C1.1.3', 'Deployment Models', 'Side by side.', { comparisonTable: { headers: [], rows: [] } })), false);
  assert.equal(!!R.isLessonItem(item('A1.1.1', 'Server', 'A computer.')), true);
});

// U1 G2, U2 G2: bracketed qualifiers are not answers.
test('typed: bracketed qualifiers are not accepted alone; acronym brackets are', () => {
  const no = [
    ['Employee Sabotage (deliberate & accidental)', 'deliberate & accidental'],
    ['NCSC (UK)', 'UK'], ['NIST (USA)', 'USA'],
    ['Cloud Computing (security issues)', 'security issues'],
    ['Network Types (LAN, WAN, etc.)', 'LAN, WAN, etc.'],
    ['Digital Cameras (Still and Video)', 'Still and Video'],
    ['Servers (File, Application, Web)', 'File, Application, Web'],
    ['Staff Training Needs (Initial and Ongoing)', 'Initial and Ongoing'],
    ['Implementation (Timescales, Testing, Migration, Downtime)', 'Timescales, Testing, Migration, Downtime'],
    ['Embedded Systems (Sensors and Internet of Things)', 'Sensors and Internet of Things']
  ];
  no.forEach(([term, bad]) => {
    const acc = R.acceptedAnswers(term);
    assert.equal(R.checkTyped(bad, acc), false, `${term}: "${bad}"`);
    assert.equal(R.checkTyped(term.replace(/\s*\(.*\)$/, ''), acc), 'exact', `${term}: main name`);
    assert.ok(!R.termParts(term).includes(bad), `${term}: termParts`);
  });
  const yes = [
    ['Infrastructure as a Service (IaaS)', 'IaaS'], ['Passwords / Multi-Factor Authentication (MFA)', 'MFA'],
    ['Voice and Video Calls over the Internet (VoIP)', 'VoIP'], ['Personal Computers (PCs)', 'PCs'],
    ['Real-Time Operating System (RTOS)', 'RTOS'], ['User Experience (UX)', 'UX'],
    ['BYOD (Bring Your Own Device)', 'Bring Your Own Device'], ['Codecs (Coder-Decoder)', 'Coder-Decoder'],
    ['Copyright, Designs and Patents Legislation (CDPA 1988)', 'CDPA']
  ];
  yes.forEach(([term, ok]) => assert.ok(R.checkTyped(ok, R.acceptedAnswers(term)), `${term}: "${ok}"`));
  // The hint spells the main name, not a qualifier.
  assert.equal(R.typeHint('Staff Training Needs (Initial and Ongoing)'), 'S____ T_______ N____');
});

// U1 G4 (too loose), U2 G3: slash, dash and "and" fragments.
test('typed: generic fragments of slash, dash and "and" terms are rejected', () => {
  const bad = [
    ['Voice and Video Calls over the Internet (VoIP)', 'Voice'],
    ['TCP/IP', 'TCP'], ['TCP/IP', 'IP'],
    ['Network Features/Requirements', 'Requirements'],
    ['Accidental Loss/Disclosure of Data or Credentials', 'Accidental Loss'],
    ['OS / GUI / CLI Vulnerabilities', 'OS'], ['OS / GUI / CLI Vulnerabilities', 'GUI'],
    ['Copyright, Designs and Patents Legislation (CDPA 1988)', 'Copyright, Designs'],
    ['Copyright, Designs and Patents Legislation (CDPA 1988)', 'Patents Legislation'],
    ['Business and/or User Needs', 'Business'],
    ['Data Protection Legislation (Data Protection Act 2018 / UK GDPR)', 'UK GDPR)']
  ];
  bad.forEach(([term, frag]) => assert.equal(R.checkTyped(frag, R.acceptedAnswers(term)), false, `${term}: "${frag}"`));
  const good = [
    ['Passwords / Multi-Factor Authentication (MFA)', 'Passwords'],
    ['Passwords / Multi-Factor Authentication (MFA)', 'Multi-Factor Authentication'],
    ['Blog/Vlog', 'Vlog'], ['Unauthorised Access – Hackers', 'Unauthorised Access'],
    ['Stealing/Leaking Information', 'Leaking Information'],
    ['Network Features/Requirements', 'Network Requirements'],
    ['OS / GUI / CLI Vulnerabilities', 'OS Vulnerabilities'],
    ['TCP/IP', 'TCP/IP']
  ];
  good.forEach(([term, ok]) => assert.ok(R.checkTyped(ok, R.acceptedAnswers(term)), `${term}: "${ok}"`));
});

// U1 G4 (too strict).
test('typed: spec wording, acronyms and item aliases are accepted', () => {
  assert.ok(R.checkTyped('User Needs', R.acceptedAnswers('Business and/or User Needs')), 'User Needs');
  assert.ok(R.checkTyped('Business Needs', R.acceptedAnswers('Business and/or User Needs')));
  const law = R.acceptedAnswers(item('F2.1.1', 'Computer Misuse Legislation (Computer Misuse Act 1990)', 'x', { accepts: ['Computer Misuse Act', 'CMA'] }));
  assert.equal(R.checkTyped('Computer Misuse Act 1990', law), 'exact', 'the year is optional');
  assert.equal(R.checkTyped('Computer Misuse Act', law), 'exact');
  const mal = item('D1.1.1', 'Viruses and Other Malware', 'Harmful software.', { aka: ['Malware'] });
  assert.equal(R.checkTyped('Malware', R.acceptedAnswers(mal)), 'exact');
  const iot = item('A1.1.9', 'Embedded Systems (Sensors and Internet of Things)', 'x', { accepts: ['IoT', 'Internet of Things'] });
  assert.equal(R.checkTyped('IoT', R.acceptedAnswers(iot)), 'exact');
  assert.equal(R.isTypeable(mal), true);
  // typed questions carry the item's aliases
  const n = nodeOf([mal, item('D1.1.2', 'Hackers', 'People who break in.'), item('D1.1.3', 'Phishing', 'Fake messages.')]);
  runs(10, () => {
    const q = R.questionFor(mal, 'mastered', 'memorize', SET, { node: n });
    if (q.kind === 'type') assert.equal(R.checkTyped('Malware', q.accepts), 'exact');
  });
});

// U1 G1, G3; U2 G2, G8: fill the gap.
test('gap: only whole words are blanked (never inside "Wikipedia", "interviewer" or the verb "costs")', () => {
  const wiki = item('C2.1.3', 'Wiki', 'A website anyone can edit.', { keyFacts: ['Wikipedia is the best-known example.', 'A Wiki lets a team share notes.'] });
  const intv = item('E2.3.4', 'Interview', 'Asking questions face to face.', { keyFacts: ['An Interview gives detailed answers, so the interviewer learns more.', 'The interviewer can influence answers.'] });
  const cost = item('A2.3.2', 'Cost', 'What it takes to buy and run.', { keyFacts: ['A cheap drive that fails early costs more overall.', 'Moderation costs money.'] });
  runs(30, () => {
    const g = R.typedQuestion(wiki, true);
    assert.equal(g.kind, 'gap');
    assert.ok(!/___pedia/.test(g.prompt), g.prompt);
    assert.ok(/A ___ lets a team/.test(g.prompt), g.prompt);
    const c = R.typedQuestion(cost, true);
    assert.ok(!/___s/.test(c.prompt), c.prompt);
    assert.notEqual(c.kind, 'gap', 'no sentence names "Cost" as a whole word');
    const iv = R.typedQuestion(intv, true);
    assert.ok(!/___er/.test(iv.prompt), iv.prompt);
  });
});

test('gap: a blank that stands for part of a compound term accepts that part only', () => {
  const mfa = item('D2.1.4', 'Passwords / Multi-Factor Authentication (MFA)', 'Checking who a user is before letting them in.', {
    accepts: ['Passwords', 'MFA', 'Multi-Factor Authentication', '2FA'],
    keyFacts: ['A stolen password alone is not enough with MFA, because the attacker also needs the second factor.']
  });
  runs(20, () => {
    const g = R.typedQuestion(mfa, true);
    assert.equal(g.kind, 'gap');
    assert.ok(g.prompt.includes('with ___, because'), g.prompt);
    assert.equal(R.checkTyped('MFA', g.accepts), 'exact');
    assert.equal(R.checkTyped('Multi-Factor Authentication', g.accepts), 'exact');
    assert.equal(R.checkTyped('Passwords', g.accepts), false, '"Passwords" does not fit the blank');
    assert.equal(g.answer, 'MFA');
  });
});

test('gap: a sentence that gives the answer away elsewhere, or has two blanks, is skipped', () => {
  const ncsc = item('A1.4.1', 'NCSC (UK)', 'The UK authority on cyber security advice.', {
    keyFacts: ['NCSC = National Cyber Security Centre. Use it because threats keep changing.', 'UK government body, so its advice is authoritative for UK organisations.', 'The NCSC publishes free guidance and NCSC alerts.']
  });
  runs(20, () => {
    const g = R.typedQuestion(ncsc, true);
    assert.notEqual(g.kind, 'gap', g.prompt);
    assert.equal(R.checkTyped('UK', g.accepts), false);
  });
});

// U1 G7, U2 G4: prompts that give the answer away.
test('definition, type and example prompts hide the term, its words and its acronym expansion', () => {
  const signs = item('D2.2.2', 'Signs of System Compromise', 'Signs that a system has been compromised.');
  const ncsc = item('A1.4.1', 'NCSC', 'The National Cyber Security Centre: the UK authority that publishes security guidance.');
  const nist = item('A1.4.2', 'NIST', 'The US National Institute of Standards and Technology, which publishes a security framework.');
  const dmg = item('A1.1.2', 'Accidental or Deliberate Damage', 'Physical events, natural, accidental or deliberate, that damage IT systems and data.');
  const fp = item('B3.5.1', 'File & Print Services', 'Shared file storage and shared printing on a network.');
  const n = nodeOf([signs, ncsc, nist, dmg, fp, item('X1.1.9', 'Router', 'Forwards packets between networks.')]);
  const prompts = it => {
    const out = [];
    runs(15, () => {
      const t = R.typedQuestion(it, false); if (t) out.push(t.prompt);
      const m = R.questionFor(it, 'new', 'memorize', { ...SET, style: 'mcq' }, { node: n, bank: {} }); if (m) out.push(m.prompt);
    });
    return out;
  };
  prompts(signs).forEach(p => assert.ok(!/compromis|\bsigns?\b/i.test(p), p));
  prompts(ncsc).forEach(p => assert.ok(!/National Cyber Security Centre/i.test(p), p));
  prompts(nist).forEach(p => assert.ok(!/National Institute of Standards/i.test(p), p));
  prompts(dmg).forEach(p => assert.ok(!/accidental|deliberate|damage/i.test(p), p));
  prompts(fp).forEach(p => assert.ok(!/\bfile\b|print/i.test(p), p));
  // Example MCQ: an example that names the term is never the prompt.
  const vir = item('A1.2.1a', 'Viruses', 'Malware that attaches to files and spreads when they run.', { examples: 'A macro virus in a Word document; ILOVEYOU' });
  const pod = item('C2.1.5', 'Podcasts', 'Audio shows you subscribe to.', { examples: 'BBC podcasts; exam revision podcasts' });
  const n2 = nodeOf([vir, pod, item('A1.2.1b', 'Worms', 'Malware that spreads on its own.', { examples: 'WannaCry' }), item('A1.2.1c', 'Trojans', 'Malware disguised as useful software.', { examples: 'a fake game' })]);
  runs(30, () => {
    const qs = R.questionsForItem(vir, n2, {}).concat(R.questionsForItem(pod, n2, {}));
    qs.forEach(q => assert.ok(!/virus|podcast/i.test(q.q), q.q));
    const e = R.questionsForItem(pod, n2, {}).find(q => q.kind === 'Example');
    assert.equal(e, undefined, 'every Podcasts example names the term');
  });
});

// U1 G5, U2 G5: true/false "false" partners.
test('true/false: never pairs a confusable item, an overlapping definition or an overview', () => {
  const sr = item('A2.2.2', 'Screen Readers', 'Software that reads the screen aloud for blind users.', { confusable: ['A2.2.10'] });
  const tts = item('A2.2.10', 'Text to Speech', 'Software that reads written text aloud as speech.');
  const gui = item('A3.5.3', 'Graphical User Interface (GUI)', 'Windows, icons, menus and a pointer.');
  const touch = item('A3.5.4', 'Touchscreen Interface', 'A GUI controlled by touch gestures on the screen.');
  const dmg = item('A1.1.2', 'Accidental or Deliberate Damage', 'Physical events that harm IT systems.');
  const sab = item('A1.1.1', 'Employee Sabotage', 'Damage caused by insiders, on purpose or by mistake.');
  const pen = item('A2.6', 'Penetration Testing', 'Simulated attacks that use vulnerability assessment tools to find weaknesses.');
  const tools = item('A2.4', 'Vulnerability Assessment Tools', 'Tools that find weaknesses in systems before attackers do.');
  const ov = item('B1.2', 'Matching Connection Types to Needs', 'Choosing a connection for the job.', { overview: true });
  runs(40, () => {
    assert.equal(R.tfQuestion(sr, nodeOf([sr, tts])), null, 'only a confusable partner: no true/false');
    assert.equal(R.tfQuestion(tts, nodeOf([sr, tts])), null, 'confusable is symmetric');
    assert.equal(R.tfQuestion(gui, nodeOf([gui, touch])), null, 'partner names the term');
    assert.equal(R.tfQuestion(touch, nodeOf([gui, touch])), null, 'the term names the partner');
    assert.equal(R.tfQuestion(dmg, nodeOf([dmg, sab])), null, 'partner definition shares the key word "damage"');
    assert.equal(R.tfQuestion(pen, nodeOf([pen, tools])), null, 'the definition names the partner term');
    assert.equal(R.tfQuestion(ov, nodeOf([ov, gui])), null, 'no true/false for an overview');
    // A safe partner further away is used instead.
    const q = R.tfQuestion(sr, nodeOf([sr, tts], [item('X1.2.1', 'Router', 'A device that forwards packets between networks.')]));
    assert.ok(q && !q.prompt.includes('reads written text'), q && q.prompt);
  });
});

// U1 G6, U2 G6: multi-select wrong options that also fit.
test('multi-select: no confusable, self-naming or term-mentioning options; skipped when too few', () => {
  const mob = item('A1.1.3', 'Mobile Devices', 'Portable computers.', { examples: 'iPhone; Apple Watch; Samsung tablet', confusable: ['A1.1.8'] });
  const com = item('A1.1.8', 'Communication Devices', 'Kit that carries messages.', { examples: 'Mobile phones; routers; modems' });
  const kb = item('B1.1.1', 'Bluetooth', 'Short-range radio link.', { examples: 'a Bluetooth keyboard; wireless earbuds; car hands-free; smartwatch sync' });
  const wl = item('A4.3', 'Protecting a WLAN', 'Securing a wireless network with WPA3, a firewall and VPNs.', { examples: 'WPA3; hiding the SSID; MAC filtering' });
  const enc = item('A4.2.2', 'Communications Encryption', 'Scrambling data in transit.', { examples: 'VPNs; TLS; WPA3' });
  const fw = item('A4.1.4', 'Firewalls & Filtering Techniques', 'Blocking traffic by rules.', { examples: 'Blocking inbound traffic on every port except those needed; a web filter; packet filtering' });
  const others = [item('Z1', 'Printers', 'Output.', { examples: 'laser printer; inkjet; 3D printer' }), item('Z2', 'Scanners', 'Input.', { examples: 'flatbed scanner; barcode reader; document camera' })];
  runs(30, () => {
    const q = R.multiQuestion(mob, nodeOf([mob, com, ...others]));
    assert.ok(!q.options.some(o => /Mobile phones|routers|modems/.test(o)), q.options.join(' | '));
    const b = R.multiQuestion(kb, nodeOf([kb, ...others]));
    assert.ok(!b.options.includes('a Bluetooth keyboard'), 'right option names the term');
    // "VPNs" and the firewall example also protect a WLAN (its definition names them).
    const w = R.multiQuestion(wl, nodeOf([wl, enc, fw, ...others]));
    assert.ok(w && !w.options.some(o => /VPN|TLS|Blocking inbound|web filter|packet filtering/.test(o)), w && w.options.join(' | '));
    const e = R.multiQuestion(enc, nodeOf([enc, wl, fw, ...others]));
    assert.ok(e === null || !e.options.some(o => /WPA3|SSID|MAC filtering|firewall/i.test(o) && !e.answers.includes(o)), e && e.options.join(' | '));
    assert.equal(R.multiQuestion(mob, nodeOf([mob, com])), null, 'no safe wrong options');
  });
});

// U1 G8, U2 G7: MCQ distractors that also fit.
test('MCQ distractors: never confusable, another group, or an item whose own text covers the example', () => {
  const pub = item('C1.1.2', 'Public Cloud', 'Shared cloud run by a provider.', { group: 'deployment', confusable: ['C1.1.5'], examples: 'A school using Microsoft 365' });
  const saas = item('C1.1.5', 'Software as a Service (SaaS)', 'Software rented over the internet.', { group: 'service' });
  const paas = item('C1.1.6', 'Platform as a Service (PaaS)', 'A platform rented to build apps.', { group: 'service' });
  const priv = item('C1.1.1', 'Private Cloud', 'A cloud for one organisation.', { group: 'deployment' });
  const hyb = item('C1.1.3', 'Hybrid Cloud', 'A mix of private and public.', { group: 'deployment' });
  const n = nodeOf([pub, saas, paas, priv, hyb]);
  runs(30, () => {
    const d = R.distractorTerms(pub, n, 3);
    assert.ok(!d.some(t => /Service/.test(t)), d.join(' | '));
  });
  const hack = item('A1.2.2', 'Hacking', 'Getting into a system without permission.', { examples: 'A DDoS taking a website offline' });
  const bots = item('A1.2.1e', 'Bots', 'Infected machines controlled together, often used for a DDoS.', { examples: 'a botnet' });
  const worm = item('A1.2.1b', 'Worms', 'Malware that copies itself across a network.');
  const troj = item('A1.2.1c', 'Trojans', 'Malware disguised as a useful program.');
  const spy = item('A1.2.1d', 'Spyware', 'Malware that watches what you do.');
  const n2 = nodeOf([hack, bots, worm, troj, spy]);
  runs(30, () => {
    const e = R.questionsForItem(hack, n2, {}).find(q => q.kind === 'Example');
    assert.ok(e && !e.options.includes('Bots'), e && e.options.join(' | '));
  });
});

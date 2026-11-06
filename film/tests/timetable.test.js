/* Unit tests for timetable.js. Run: node --test tests/ */
const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('../timetable.js');

const days = T.build();
const byDate = Object.fromEntries(days.map(d => [d.date, d]));
const share = (from, to) => {
  let ict = 0, film = 0;
  days.filter(d => d.date >= from && d.date <= to).forEach(d => d.sessions.forEach(s => {
    if (s.subject === 'ICT') ict++; else film++;
  }));
  return { ict, film, ratio: ict / (ict + film) };
};

test('runs from 6 Nov to the Film exam on 25 Nov 2026, every day', () => {
  assert.equal(days[0].date, '2026-11-06');
  assert.equal(days[days.length - 1].date, '2026-11-25');
  assert.equal(days.length, 20);
});

test('weekends get more sessions than weekdays', () => {
  assert.equal(byDate['2026-11-07'].sessions.length, T.DEFAULTS.weekend);   // Saturday
  assert.equal(byDate['2026-11-09'].sessions.length, T.DEFAULTS.weekday);   // Monday
});

test('no ICT on or after the ICT exam day', () => {
  days.filter(d => d.date >= T.ICT_EXAM).forEach(d =>
    d.sessions.forEach(s => assert.notEqual(s.subject, 'ICT', d.date)));
});

test('ICT exam day has at most one light Film session', () => {
  const d = byDate[T.ICT_EXAM];
  assert.equal(d.kind, 'exam-ict');
  assert.ok(d.sessions.length <= 1);
  d.sessions.forEach(s => { assert.equal(s.subject, 'FILM'); assert.ok(s.light); });
});

test('18 Nov is ICT only', () => {
  byDate['2026-11-18'].sessions.forEach(s => assert.equal(s.subject, 'ICT'));
});

test('20–24 Nov are Film only, and 24 Nov is light', () => {
  ['2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23', '2026-11-24'].forEach(date =>
    byDate[date].sessions.forEach(s => assert.equal(s.subject, 'FILM', date)));
  assert.equal(byDate['2026-11-24'].kind, 'light');
  byDate['2026-11-24'].sessions.forEach(s => assert.ok(s.light));
});

test('Film exam day is a single short checklist', () => {
  const d = byDate[T.FILM_EXAM];
  assert.equal(d.kind, 'exam-film');
  assert.equal(d.sessions.length, 1);
  assert.ok(d.sessions[0].light);
});

test('6–15 Nov is about 60% ICT and mixes both subjects', () => {
  const s = share('2026-11-06', '2026-11-15');
  assert.ok(s.ratio >= 0.55 && s.ratio <= 0.65, String(s.ratio));
  assert.ok(s.film > 0);
});

test('16–17 Nov is about 75% ICT', () => {
  const s = share('2026-11-16', '2026-11-17');
  assert.ok(s.ratio >= 0.7 && s.ratio <= 0.8, String(s.ratio));
});

test('mixed days alternate, ICT first', () => {
  const sat = byDate['2026-11-07'].sessions.map(s => s.subject);
  assert.equal(sat[0], 'ICT');
  for (let i = 1; i < sat.length; i++) {
    if (sat.slice(i).includes('FILM') && sat.slice(i).includes('ICT')) assert.notEqual(sat[i], sat[i - 1]);
  }
});

test('every film section comes up at least twice before the Film exam', () => {
  const c = T.counts(days.filter(d => d.date < T.FILM_EXAM));
  Object.keys(T.SECTIONS).forEach(sec => assert.ok((c.bySection[sec] || 0) >= 2, sec + ': ' + c.bySection[sec]));
});

test('newest material comes first: the first Film sessions are Casablanca/Bonnie and Clyde and Amy', () => {
  const firstFilm = [];
  days.forEach(d => d.sessions.forEach(s => { if (s.subject === 'FILM' && !s.light) firstFilm.push(s.sec); }));
  assert.deepEqual(firstFilm.slice(0, 2), ['C1A', 'C2B']);
});

test('weaker sections are scheduled earlier once the first pass is done', () => {
  const weak = T.build(null, { C1C: 9 });
  const later = [];
  weak.forEach(d => d.sessions.forEach(s => { if (s.pass === 2 && !s.light) later.push(s.sec); }));
  assert.equal(later[0], 'C1C');
});

test('session ids are unique and stable between builds', () => {
  const ids = days.flatMap(d => d.sessions.map(s => s.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(T.build().flatMap(d => d.sessions.map(s => s.id)), ids);
});

test('settings are clamped and change session counts', () => {
  assert.deepEqual(T.coerceSettings({ weekday: 99, weekend: 'x', minutes: 5 }), T.DEFAULTS);
  const more = T.build({ weekday: 3, weekend: 5, minutes: 60 });
  assert.equal(more.find(d => d.date === '2026-11-09').sessions.length, 3);
  assert.equal(more.find(d => d.date === '2026-11-09').sessions[0].minutes, 60);
});

test('missed sessions roll forward, but never past their exam', () => {
  // Nothing ticked: on 12 Nov there is catch-up from 11 Nov.
  const c = T.catchUp(days, {}, '2026-11-12');
  assert.ok(c.length > 0 && c.length <= T.MAX_CATCHUP);
  assert.ok(c.every(s => s.from < '2026-11-12'));
  // From the ICT exam day on, no ICT catch-up.
  T.catchUp(days, {}, '2026-11-19').forEach(s => assert.notEqual(s.subject, 'ICT'));
  T.catchUp(days, {}, '2026-11-21').forEach(s => assert.notEqual(s.subject, 'ICT'));
  // On the Film exam day, nothing rolls forward.
  assert.equal(T.catchUp(days, {}, T.FILM_EXAM).length, 0);
  // Ticked sessions are not caught up.
  const all = {};
  days.forEach(d => d.sessions.forEach(s => { all[s.id] = true; }));
  assert.equal(T.catchUp(days, all, '2026-11-15').length, 0);
});

test('saved ticks are validated', () => {
  assert.deepEqual(T.coerceChecks({ '2026-11-07#0': true, '__proto__': true, 'x': true, '2026-11-07#1': 'yes' }), { '2026-11-07#0': true });
});

test('countdowns', () => {
  assert.equal(T.daysUntil('2026-11-06', T.ICT_EXAM), 13);
  assert.equal(T.daysUntil('2026-11-06', T.FILM_EXAM), 19);
});

/* ---- sessions you can follow: times, steps, varied essays ---- */
const BANK = {
  C1A: [{ id: 'a1', marks: 40, question: 'A one' }, { id: 'a2', marks: 40, question: 'A two' }, { id: 'a3', marks: 40, question: 'A three' }],
  C1B: [{ id: 'b1', marks: 40, question: 'B one' }, { id: 'b2', marks: 40, question: 'B two' }, { id: 'b3', marks: 40, question: 'B three' }],
  C1C: [{ id: 'c1', marks: 40, question: 'C one' }, { id: 'c2', marks: 40, question: 'C two' }, { id: 'c3', marks: 40, question: 'C three' }],
  C2A: [{ id: 'g1', marks: 40, question: 'G one' }, { id: 'g2', marks: 40, question: 'G two' }, { id: 'g3', marks: 40, question: 'G three' }],
  C2B: [{ id: 'd1', marks: 20, question: 'D one' }, { id: 'd2', marks: 20, question: 'D two' }, { id: 'd3', marks: 20, question: 'D three' }]
};
const withBank = T.build(null, null, BANK);

test('sessions have clock times: weekdays from 16:30, weekends from 10:00, never overlapping', () => {
  assert.equal(withBank.find(d => d.date === '2026-11-09').sessions[0].start, '16:30');
  assert.equal(withBank.find(d => d.date === '2026-11-07').sessions[0].start, '10:00');
  withBank.forEach(d => {
    for (let i = 1; i < d.sessions.length; i++) {
      assert.ok(T.toMin(d.sessions[i].start) >= T.toMin(d.sessions[i - 1].end) + T.BREAK, d.date);
    }
  });
  const custom = T.build({ weekdayStart: '18:00', weekendStart: '09:00' });
  assert.equal(custom.find(d => d.date === '2026-11-09').sessions[0].start, '18:00');
  assert.equal(custom.find(d => d.date === '2026-11-08').sessions[0].start, '09:00');
});

test('every session says what to do, step by step', () => {
  withBank.forEach(d => d.sessions.forEach(s => {
    assert.ok(Array.isArray(s.steps) && s.steps.length >= 1, s.id);
    if (!s.light) assert.ok(s.steps.length >= 2, s.id);
  }));
});

test('learning sessions end with an exam paragraph on a key scene, rotating through the scenes', () => {
  const learn = [];
  withBank.forEach(d => d.sessions.forEach(s => { if (s.pass === 1) learn.push(s); }));
  learn.forEach(s => assert.match(s.steps[s.steps.length - 1], /exam paragraph on /));
  const c1a = learn.filter(s => s.sec === 'C1A').map(s => s.scene);
  assert.equal(new Set(c1a).size, c1a.length);
});

test('timed essays use a different question each time until the bank runs out', () => {
  const bySec = {};
  withBank.forEach(d => d.sessions.forEach(s => { if (s.pass === 2) (bySec[s.sec] = bySec[s.sec] || []).push(s.qId); }));
  Object.entries(bySec).forEach(([sec, ids]) => {
    const firstRound = ids.slice(0, BANK[sec].length);
    assert.equal(new Set(firstRound).size, firstRound.length, sec + ': ' + ids.join(','));
    assert.ok(ids.every(Boolean), sec);
  });
});

test('essay timings fit the session and scale with session length', () => {
  const sumMin = steps => steps.reduce((n, st) => n + parseInt(st, 10), 0);
  withBank.forEach(d => d.sessions.forEach(s => {
    if (s.pass === 2) assert.equal(sumMin(s.steps), s.minutes, s.id);
  }));
  const long = T.build({ minutes: 60 }, null, BANK);
  const essay = long.flatMap(d => d.sessions).find(s => s.pass === 2 && s.marks === 40);
  assert.match(essay.steps[1], /full essay/);
});

test('the last weekend’s ICT sessions are one mock paper in parts, and 18 Nov is final review', () => {
  const sun = withBank.find(d => d.date === '2026-11-15').sessions.filter(s => s.subject === 'ICT');
  assert.ok(sun.length >= 2);
  sun.forEach((s, i) => assert.match(s.title, new RegExp('mock paper, part ' + (i + 1))));
  withBank.find(d => d.date === '2026-11-18').sessions.forEach(s => assert.match(s.title, /Final review/));
});

test('ICT sessions link to the BTEC IT site; Film sessions open a section, question, flashcards or the Exam Kit', () => {
  withBank.forEach(d => d.sessions.forEach(s => {
    if (s.subject === 'ICT') assert.equal(s.link, T.ICT_SITE);
    else assert.ok(['section', 'question', 'flashcards', 'examkit'].includes(s.action), s.id);
  }));
});

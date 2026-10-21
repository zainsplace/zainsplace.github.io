/* Unit tests for revision/league.js. Run: node --test revision/tests/league.test.js */
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../league.js');

const at = (date, h = 12) => { const [y, m, d] = date.split('-').map(Number); return new Date(y, m - 1, d, h).getTime(); };
const POOL = Array.from({ length: 36 }, (_, i) => ({ name: 'rival' + i, tag: '', col: '#000', base: i * 200 }));
const WEEK = '2026-10-19';   // a Monday

test('weeks start on Monday', () => {
  assert.equal(L.weekId(at('2026-10-19')), WEEK);
  assert.equal(L.weekId(at('2026-10-21')), WEEK);
  assert.equal(L.weekId(at('2026-10-25', 23)), WEEK);   // Sunday night
  assert.equal(L.weekId(at('2026-10-26', 0)), '2026-10-26');
  assert.equal(L.weekId(at('2027-01-01')), '2026-12-28');   // across a year end
  assert.deepEqual(L.weekDays(WEEK), ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']);
});

test('weekly XP counts only that week', () => {
  const xp = { '2026-10-18': 999, '2026-10-19': 100, '2026-10-21': 50, '2026-10-26': 7 };
  assert.equal(L.weekXP(xp, WEEK), 150);
  assert.equal(L.weekXPBefore(xp, WEEK, at('2026-10-21')), 100);
});

test('a league holds 20 rivals, the same ones on every reload', () => {
  const a = L.group(POOL, WEEK, 2), b = L.group(POOL, WEEK, 2);
  assert.equal(a.length, L.RIVALS);
  assert.deepEqual(a.map(r => r.name), b.map(r => r.name));
  assert.notDeepEqual(a.map(r => r.name), L.group(POOL, '2026-10-26', 2).map(r => r.name));
});

test('higher leagues have rivals who revise more', () => {
  const total = tier => L.group(POOL, WEEK, tier).reduce((n, r) => n + r.target, 0);
  for (let t = 1; t <= L.TOP; t++) assert.ok(total(t) > total(t - 1) * 1.3, 'league ' + t);
});

test('rival XP only grows through the week and is 0 before it starts', () => {
  const r = L.group(POOL, WEEK, 3)[0];
  let last = -1;
  for (let d = 0; d < 7; d++) {
    for (const h of [6, 9, 15, 23]) {
      const xp = L.rivalXP(r, WEEK, 0, at(L.weekDays(WEEK)[d], h));
      assert.ok(xp >= last);
      last = xp;
    }
  }
  assert.equal(L.rivalXP(r, WEEK, 0, at('2026-10-18')), 0);
  assert.equal(L.rivalXP(r, WEEK, 0, L.weekEnd(WEEK)), r.target);
});

test('joining mid-week shrinks rivals to the share of the week left, without emptying the table', () => {
  const r = L.group(POOL, WEEK, 3)[0];
  const wed = at('2026-10-21', 15);
  const left = 1 - L.progress(r.habit, WEEK, wed);
  assert.ok(L.rivalXP(r, WEEK, wed, wed) > 0);
  assert.equal(L.rivalXP(r, WEEK, wed, L.weekEnd(WEEK)), Math.round(r.target * left));
  assert.equal(L.rivalXP(r, WEEK, L.weekStart(WEEK), L.weekEnd(WEEK)), r.target);
});

test('an hour of revision wins Bronze but not the top leagues', () => {
  const end = L.weekEnd(WEEK);
  const place = (tier, myXP) => L.standings({ pool: POOL, id: WEEK, tier, joinedAt: 0, t: end, myXP }).find(r => r.me).place;
  assert.ok(place(0, 1200) <= L.promoteCount(0));     // promoted out of Bronze
  assert.ok(place(L.TOP, 1200) > 21 - L.demoteCount(L.TOP));   // relegated from Cyber Legend
  assert.ok(place(5, 1200) > L.promoteCount(5));      // not enough for Master's promotion
});

test('zones: Bronze promotes 7 and never relegates; the top league never promotes', () => {
  assert.equal(L.zoneOf(7, 0, 21), 'up');
  assert.equal(L.zoneOf(21, 0, 21), 'stay');
  assert.equal(L.zoneOf(5, 3, 21), 'up');
  assert.equal(L.zoneOf(6, 3, 21), 'stay');
  assert.equal(L.zoneOf(17, 3, 21), 'down');
  assert.equal(L.zoneOf(16, 3, 21), 'stay');
  assert.equal(L.zoneOf(1, L.TOP, 21), 'stay');
});

test('ties go to the rival', () => {
  const rows = L.standings({ pool: POOL, id: WEEK, tier: 0, joinedAt: 0, t: at('2026-10-19', 0), myXP: 0 });
  assert.equal(rows[rows.length - 1].me, true);
});

test('first visit joins the current week now', () => {
  const now = at('2026-10-21', 15);
  const { league, result } = L.rollover(L.defaultState(), {}, POOL, now);
  assert.equal(league.week, WEEK);
  assert.equal(league.joinedAt, now);
  assert.equal(result, null);
});

test('a finished week promotes the winner and starts the next one', () => {
  const lg = { ...L.defaultState(), week: WEEK, joinedAt: 0 };
  const now = at('2026-10-27', 10);
  const { league, result } = L.rollover(lg, { '2026-10-20': 5000 }, POOL, now);
  assert.equal(result.zone, 'up');
  assert.equal(result.place, 1);
  assert.equal(league.tier, 1);
  assert.equal(league.best, 1);
  assert.equal(league.week, '2026-10-26');
  assert.equal(league.seen, false);
  assert.equal(league.history.length, 1);
});

test('a weak week in a high league relegates; best is kept', () => {
  const lg = { ...L.defaultState(), tier: 4, best: 4, week: WEEK };
  const { league } = L.rollover(lg, { '2026-10-20': 50 }, POOL, at('2026-10-27'));
  assert.equal(league.tier, 3);
  assert.equal(league.best, 4);
});

test('sitting a week out changes nothing', () => {
  const lg = { ...L.defaultState(), tier: 4, best: 4, week: WEEK };
  const { league, result } = L.rollover(lg, {}, POOL, at('2026-11-20'));
  assert.equal(result, null);
  assert.equal(league.tier, 4);
  assert.equal(league.week, '2026-11-16');
});

test('the same week is left alone', () => {
  const lg = { ...L.defaultState(), week: WEEK, joinedAt: 5 };
  assert.equal(L.rollover(lg, {}, POOL, at('2026-10-24')).league, lg);
});

test('saved league state is checked', () => {
  assert.deepEqual(L.coerceState(null), L.defaultState());
  const c = L.coerceState({ tier: 9, best: -1, week: 'x', joinedAt: 'y', seen: 1, history: [null, { week: WEEK, tier: 0, place: 1, of: 21, xp: 10, zone: 'up' }, { week: WEEK }] });
  assert.equal(c.tier, 0);
  assert.equal(c.best, 0);
  assert.equal(c.week, '');
  assert.equal(c.joinedAt, 0);
  assert.equal(c.seen, true);
  assert.equal(c.history.length, 1);
  assert.equal(L.coerceState({ tier: 3, best: 1 }).best, 3);
});

test('Elo: beating an equal rival gains half of K; upsets pay more', () => {
  assert.equal(L.ratingChange(1000, 20, [{ rating: 1000, score: 1 }]), 12);
  assert.equal(L.ratingChange(1000, 20, [{ rating: 1000, score: 0 }]), -12);
  assert.equal(L.ratingChange(1000, 0, [{ rating: 1000, score: 1 }]), 24);   // provisional
  assert.ok(L.ratingChange(1000, 20, [{ rating: 1400, score: 1 }]) > 20);
  assert.ok(L.ratingChange(1400, 20, [{ rating: 1000, score: 1 }]) < 3);
  assert.equal(L.ratingChange(1000, 20, []), 0);
});

test('Elo: a multi-rival battle moves you about as far as a duel', () => {
  const opp = r => ({ rating: 1000, score: r });
  assert.equal(L.ratingChange(1000, 20, [opp(1), opp(1), opp(1)]), 12);   // won the race
  assert.equal(L.ratingChange(1000, 20, [opp(1), opp(0), opp(0)]), -4);   // came 3rd of 4
});

test('rival ratings are stable within a week and rise with skill', () => {
  const r = POOL[30];
  assert.equal(L.rivalRating(r, WEEK), L.rivalRating(r, WEEK));
  assert.ok(Math.abs(L.rivalRating(r, WEEK) - L.rivalRating(r, '2026-10-26')) <= 40);
  assert.ok(L.rivalSkill(1600) > L.rivalSkill(1000));
  assert.ok(L.rivalSkill(0) > 0 && L.rivalSkill(5000) <= 1);
});

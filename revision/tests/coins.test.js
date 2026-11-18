const test = require('node:test');
const assert = require('node:assert/strict');
const COINS = require('../coins.js');

test('RULES', () => {
  assert.deepEqual(COINS.RULES, {
    perFirstTry: 1, perfectRound: 10, stepMastered: 25, streakDay: 5,
    battleWin: 15, battleLoss: 5, leagueUp: 50, leagueTop3: 100, examPart: 20
  });
});

test('forRound', () => {
  assert.equal(COINS.forRound({ firstTry: 8, mistakes: 0, stepHit100: true, firstRoundToday: true }), 8 + 10 + 25 + 5);
  assert.equal(COINS.forRound({ firstTry: 8, mistakes: 1, stepHit100: true, firstRoundToday: true }), 8 + 25 + 5);
  assert.equal(COINS.forRound({ firstTry: 3, mistakes: 2, stepHit100: false, firstRoundToday: false }), 3);
  // Nothing right first time (all hinted, say) is not a perfect round.
  assert.equal(COINS.forRound({ firstTry: 0, mistakes: 0, stepHit100: false, firstRoundToday: false }), 0);
  assert.equal(COINS.forRound({}), 0);
  assert.equal(COINS.forRound({ firstTry: -4, mistakes: 0 }), 0);
  assert.equal(COINS.forRound({ firstTry: 2.7, mistakes: 0 }), 2 + 10);
});

test('forBattle and forLeague', () => {
  assert.equal(COINS.forBattle(true), 15);
  assert.equal(COINS.forBattle(false), 5);
  assert.equal(COINS.forLeague(null, 0), 0);
  assert.equal(COINS.forLeague({ tier: 1, place: 5, zone: 'stay' }, 1), 0);
  assert.equal(COINS.forLeague({ tier: 1, place: 4, zone: 'up' }, 2), 50);
  assert.equal(COINS.forLeague({ tier: 1, place: 2, zone: 'up' }, 2), 150);
  // Top tier: 'up' zone but no higher tier to move to.
  assert.equal(COINS.forLeague({ tier: 4, place: 1, zone: 'up' }, 4), 100);
});

test('seedFromXP', () => {
  assert.equal(COINS.seedFromXP(3009), 300);
  assert.equal(COINS.seedFromXP(9), 0);
  assert.equal(COINS.seedFromXP(-50), 0);
  assert.equal(COINS.seedFromXP('x'), 0);
});

test('defaultWallet and coerceWallet', () => {
  assert.deepEqual(COINS.defaultWallet(), { coins: 0, seeded: false, spent: 0, lastRoundDay: '' });
  assert.equal(COINS.coerceWallet({ coins: -5 }).coins, 0);
  assert.equal(COINS.coerceWallet({ coins: 'x' }).coins, 0);
  assert.equal(COINS.coerceWallet({ coins: 12.9 }).coins, 12);
  assert.deepEqual(COINS.coerceWallet(null), COINS.defaultWallet());
  assert.deepEqual(COINS.coerceWallet([1]), COINS.defaultWallet());
  const w = COINS.coerceWallet({ coins: 40, seeded: true, spent: 10, lastRoundDay: '2026-11-18', junk: 1 });
  assert.deepEqual(w, { coins: 40, seeded: true, spent: 10, lastRoundDay: '2026-11-18' });
  assert.equal(COINS.coerceWallet({ seeded: 'yes' }).seeded, false);
  assert.equal(COINS.coerceWallet({ lastRoundDay: 'today' }).lastRoundDay, '');
});

test('earn and spend', () => {
  assert.equal(COINS.spend({ coins: 40 }, 50), null);
  assert.equal(COINS.spend({ coins: 60 }, 50).coins, 10);
  assert.equal(COINS.spend({ coins: 60, spent: 5 }, 50).spent, 55);
  assert.equal(COINS.spend({ coins: 60 }, -5), null);
  assert.equal(COINS.earn({ coins: 5 }, 3).coins, 8);
  // Coins never go down except when spent.
  assert.equal(COINS.earn({ coins: 5 }, -3).coins, 5);
  assert.equal(COINS.earn({ coins: 5 }, 'x').coins, 5);
  const w = { coins: 1, seeded: true, spent: 0, lastRoundDay: '' };
  const after = COINS.earn(w, 2);
  assert.equal(after.coins, 3);
  assert.equal(after.seeded, true);
  assert.equal(w.coins, 1, 'earn returns a new wallet');
  const s = { coins: 60, seeded: true, spent: 0, lastRoundDay: '' };
  COINS.spend(s, 50);
  assert.equal(s.coins, 60, 'spend returns a new wallet');
});

test('railHTML shows the coin count', () => {
  const html = COINS.railHTML({ coins: 1234 });
  assert.equal(typeof html, 'string');
  assert.match(html, /1,234|1234/);
  assert.match(html, /coins/);
  assert.match(COINS.railHTML({ coins: 1 }), /coin</);
  assert.match(COINS.railHTML(null), />0</);
});

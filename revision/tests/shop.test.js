const test = require('node:test');
const assert = require('node:assert/strict');
const SHOP = require('../shop-data.js');

test('coercePets keeps known pets, cleans names and fixes the active pet', () => {
  const p = SHOP.coercePets({
    owned: { cat: { name: '  Whiskers  ' }, unicornish: { name: 'x' }, dog: 'bad', robot: { name: '' }, __proto__: { name: 'p' } },
    active: 'unicornish'
  });
  assert.deepEqual(Object.keys(p.owned).sort(), ['cat', 'dog', 'robot']);
  assert.equal(p.owned.cat.name, 'Whiskers');
  assert.equal(p.owned.dog.name, 'Dog', 'a broken record falls back to the pet name');
  assert.equal(p.owned.robot.name, 'Robot', 'an empty name falls back to the pet name');
  assert.ok(p.active && p.owned[p.active], 'an unknown active pet becomes an owned one');
  assert.equal(SHOP.coercePets({ owned: { cat: {} }, active: 'cat' }).active, 'cat');
});

test('coercePets on junk gives an empty collection', () => {
  for (const raw of [null, 'x', [], { owned: [], active: 3 }, { owned: { cat: { name: 'C' } }, active: 'dog' }]) {
    const p = SHOP.coercePets(raw);
    assert.ok(p.owned && typeof p.owned === 'object' && !Array.isArray(p.owned));
    assert.ok(p.active === null || p.owned[p.active]);
  }
  assert.deepEqual(SHOP.coercePets(null), { owned: {}, active: null });
});

test('cleanName trims, caps at 20 characters and falls back', () => {
  assert.equal(SHOP.cleanName('  Bob  ', 'Cat'), 'Bob');
  assert.equal(SHOP.cleanName('x'.repeat(30), 'Cat'), 'x'.repeat(20));
  assert.equal(SHOP.cleanName('   ', 'Cat'), 'Cat');
  assert.equal(SHOP.cleanName(42, 'Cat'), 'Cat');
  // Markup is kept as text (escaped where shown), only trimmed and capped.
  assert.equal(SHOP.cleanName('<img src=x onerror=alert(1)>', 'Cat'), '<img src=x onerror=alert('.slice(0, 20));
});

test('coerceWardrobe drops unknown, unowned and wrong-slot ids', () => {
  const pets = { owned: { cat: { name: 'Cat' } }, active: 'cat' };
  const w = SHOP.coerceWardrobe({
    owned: { 'top-hat': true, 'top-hat-plum': true, 'nope': true, 'cape': 'yes', 'bg-sky': true, 'round-glasses': true },
    avatar: { hat: 'top-hat-plum', face: 'sunglasses', bg: 'bg-sky', neck: 'nope', back: 'top-hat', held: 5 },
    pet: {
      cat: { hat: 'top-hat', bg: 'bg-sky', face: 'round-glasses' },
      dog: { hat: 'top-hat' },
      dragonx: { hat: 'top-hat' }
    }
  }, pets);
  assert.deepEqual(Object.keys(w.owned).sort(), ['bg-sky', 'round-glasses', 'top-hat', 'top-hat-plum']);
  assert.deepEqual(w.avatar, { hat: 'top-hat-plum', bg: 'bg-sky' });
  assert.deepEqual(w.pet, { cat: { hat: 'top-hat', face: 'round-glasses' } }, 'avatar-only slots and unowned pets are dropped');
});

test('coerceWardrobe on junk gives the empty shape', () => {
  for (const raw of [null, 7, { owned: [], avatar: 'x', pet: [] }]) {
    assert.deepEqual(SHOP.coerceWardrobe(raw, null), { owned: {}, avatar: {}, pet: {} });
  }
});

test('longestRun counts consecutive days', () => {
  assert.equal(SHOP.longestRun([]), 0);
  assert.equal(SHOP.longestRun(['2026-11-01']), 1);
  assert.equal(SHOP.longestRun(['2026-11-03', '2026-11-01', '2026-11-02', '2026-11-05']), 3);
  // Across a month end and a leap day.
  assert.equal(SHOP.longestRun(['2028-02-28', '2028-02-29', '2028-03-01', 'junk']), 3);
});

test('buildProgress takes the best of both units', () => {
  const units = {
    u1: { league: { tier: 1, best: 2 }, streak: { count: 4 }, activity: { '2026-11-01': 2, '2026-11-02': 1, '2026-11-03': 0 } },
    u2: { league: { tier: 3, best: 0 }, streak: { count: 1 }, activity: {} }
  };
  const p = SHOP.buildProgress(units, id => id === 'u2');
  assert.deepEqual(p, { leagueTier: 3, bestStreak: 4, masteredUnits: ['u2'] });
  const q = SHOP.buildProgress({ u1: { league: { tier: 0, best: 0 }, streak: { count: 0 }, activity: { '2026-10-01': 1, '2026-10-02': 1, '2026-10-03': 3 } } }, () => false);
  assert.equal(q.bestStreak, 3, 'a run in the activity history counts');
  assert.deepEqual(SHOP.buildProgress(null), { leagueTier: 0, bestStreak: 0, masteredUnits: [] });
});

test('buildProgress feeds the unlocks', () => {
  const gold = SHOP.ITEMS.find(i => i.id === 'gold-crown');
  const p = SHOP.buildProgress({ u1: { league: { tier: 2, best: 2 }, streak: { count: 0 }, activity: {} } }, () => false);
  assert.equal(SHOP.isUnlocked(gold, p), true);
  assert.equal(SHOP.isUnlocked(SHOP.ITEMS.find(i => i.id === 'flames'), p), false);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const SHOP = require('../shop-data.js');

// A random source that returns the given numbers in turn.
const seq = (...xs) => { let i = 0; return () => xs[i++ % xs.length]; };

test('pets: 20 image pets in five rarities, each drawn from img/pets/<id>.png', () => {
  const by = r => SHOP.PETS.filter(p => p.rarity === r).map(p => p.id);
  assert.deepEqual(SHOP.RARITIES.map(r => r.id), ['common', 'rare', 'epic', 'legendary', 'mythic']);
  assert.deepEqual(by('common'), ['cat', 'dog', 'rabbit', 'hamster', 'frog']);
  assert.deepEqual(by('rare'), ['fox', 'owl', 'penguin', 'panda']);
  assert.deepEqual(by('epic'), ['wolf', 'tiger', 'bear', 'eagle']);
  assert.deepEqual(by('legendary'), ['lion', 'griffin', 'unicorn', 'dragon']);
  assert.deepEqual(by('mythic'), ['phoenix', 'kraken', 'hydra']);
  for (const p of SHOP.PETS) assert.equal(p.img, `img/pets/${p.id}.png?v=2`);
  for (const e of SHOP.EGGS) assert.match(SHOP.eggHTML(e.id), new RegExp(`img/eggs/egg-${e.id}\.png`));
});

test('eggs: four eggs, prices and odds as in the brief, no mythic egg', () => {
  const e = id => SHOP.egg(id);
  assert.deepEqual(SHOP.EGGS.map(x => [x.id, x.price]), [['common', 100], ['rare', 250], ['epic', 500], ['legendary', 1000]]);
  assert.deepEqual(e('common').odds, [['common', 0.85], ['rare', 0.15]]);
  assert.deepEqual(e('rare').odds, [['rare', 0.85], ['epic', 0.15]]);
  assert.deepEqual(e('epic').odds, [['epic', 0.88], ['legendary', 0.12]]);
  assert.deepEqual(e('legendary').odds, [['legendary', 0.92], ['mythic', 0.08]]);
  assert.equal(e('mythic'), null);
  for (const x of SHOP.EGGS) assert.ok(Math.abs(x.odds.reduce((s, o) => s + o[1], 0) - 1) < 1e-9, x.id);
});

test('rollRarity follows the odds with an injected random number', () => {
  const c = SHOP.egg('common'), l = SHOP.egg('legendary');
  assert.equal(SHOP.rollRarity(c, () => 0), 'common');
  assert.equal(SHOP.rollRarity(c, () => 0.8499), 'common');
  assert.equal(SHOP.rollRarity(c, () => 0.85), 'rare');
  assert.equal(SHOP.rollRarity(c, () => 0.9999), 'rare');
  assert.equal(SHOP.rollRarity(l, () => 0.919), 'legendary');
  assert.equal(SHOP.rollRarity(l, () => 0.93), 'mythic');
  // Out-of-range randoms are clamped, never undefined.
  assert.equal(SHOP.rollRarity(c, () => 1), 'rare');
  assert.equal(SHOP.rollRarity(c, () => NaN), 'common');
});

test('hatch picks the pet uniformly within the rarity', () => {
  // second number picks the pet: floor(r * n)
  assert.equal(SHOP.hatch('common', {}, seq(0.1, 0)).pet, 'cat');
  assert.equal(SHOP.hatch('common', {}, seq(0.1, 0.99)).pet, 'frog');
  assert.equal(SHOP.hatch('common', {}, seq(0.1, 0.4)).pet, 'rabbit');
  assert.equal(SHOP.hatch('common', {}, seq(0.9, 0.5)).pet, 'penguin');
  assert.equal(SHOP.hatch('legendary', {}, seq(0.95, 0.5)).pet, 'kraken');
  const h = SHOP.hatch('epic', {}, seq(0.5, 0));
  assert.deepEqual(h, { egg: 'epic', pet: 'wolf', rarity: 'epic', duplicate: false, refund: 0 });
  assert.equal(SHOP.hatch('nope', {}, seq(0)), null);
  // Over many draws every common pet turns up.
  const seen = new Set();
  for (let i = 0; i < 50; i++) seen.add(SHOP.hatch('common', {}, seq(0, i / 50)).pet);
  assert.equal(seen.size, 5);
});

test('a duplicate hatch refunds 40% of the egg price', () => {
  assert.deepEqual(SHOP.hatch('common', { cat: { name: 'Cat' } }, seq(0, 0)),
    { egg: 'common', pet: 'cat', rarity: 'common', duplicate: true, refund: 40 });
  assert.equal(SHOP.refundFor(SHOP.egg('rare')), 100);
  assert.equal(SHOP.refundFor(SHOP.egg('epic')), 200);
  assert.equal(SHOP.refundFor(SHOP.egg('legendary')), 400);
  assert.equal(SHOP.hatch('legendary', { lion: {} }, seq(0, 0)).refund, 400);
});

test('the first egg is a free common egg; everything else costs its price', () => {
  const c = SHOP.egg('common'), r = SHOP.egg('rare');
  assert.equal(SHOP.eggPrice(c, {}), 0);
  assert.equal(SHOP.eggPrice(r, {}), 250);
  assert.equal(SHOP.eggPrice(c, { cat: { name: 'Cat' } }), 100);
  assert.deepEqual(SHOP.canBuyEgg(c, { coins: 0 }, {}), { ok: true, reason: 'ok', price: 0 });
  assert.deepEqual(SHOP.canBuyEgg(c, { coins: 99 }, { dog: {} }), { ok: false, reason: 'short', price: 100 });
  assert.deepEqual(SHOP.canBuyEgg(r, { coins: 250 }, { dog: {} }), { ok: true, reason: 'ok', price: 250 });
  assert.equal(SHOP.canBuyEgg(null, { coins: 9999 }, {}).reason, 'unknown');
});

test('old SVG pets migrate without losing ownership', () => {
  const p = SHOP.coercePets({
    owned: {
      cat: { name: 'Biscuit' }, robot: { name: 'Robot' }, computer: { name: 'Beep' },
      drone: { name: 'Drone' }, floppy: { name: 'Floppy-disk buddy' }, yeti: { name: 'Yeti' },
      slime: { name: 'Goo' }, kraken: { name: 'Kraken' }, dragon: { name: 'Smaug' }
    },
    active: 'computer'
  });
  assert.deepEqual(p.owned, {
    cat: { name: 'Biscuit' }, rabbit: { name: 'Rabbit' }, hamster: { name: 'Beep' },
    penguin: { name: 'Penguin' }, owl: { name: 'Owl' }, bear: { name: 'Bear' },
    wolf: { name: 'Goo' }, kraken: { name: 'Kraken' }, dragon: { name: 'Smaug' }
  });
  assert.equal(p.active, 'hamster', 'the active pet follows its migration');
  assert.equal(SHOP.MIGRATE.robot, 'rabbit');
});

test('a migrated pet whose new id is already owned takes another pet of that rarity', () => {
  const p = SHOP.coercePets({ owned: { rabbit: { name: 'Bun' }, robot: { name: 'Rob' } }, active: 'robot' });
  assert.equal(p.owned.rabbit.name, 'Bun');
  const others = Object.keys(p.owned).filter(id => id !== 'rabbit');
  assert.equal(others.length, 1);
  assert.equal(SHOP.pet(others[0]).rarity, 'common');
  assert.equal(p.owned[others[0]].name, 'Rob');
  assert.equal(p.active, others[0]);
});

test('mascotLine: short lines from a small list, filled from real state', () => {
  const kinds = ['due', 'ready', 'streak', 'idle', 'sleepy', 'right', 'wrong', 'hint', 'complete', 'streakUp', 'empty'];
  for (const k of kinds) {
    for (let i = 0; i < 10; i++) {
      const s = SHOP.mascotLine(k, { due: 5, unit: 'Cloud Computing', streak: 3 }, () => i / 10);
      assert.ok(typeof s === 'string' && s.length > 0 && s.length <= 60, `${k}: ${s}`);
      assert.ok(!/\{|\}|undefined|NaN/.test(s), s);
      assert.ok(!/\bsad\b|disappoint|cry/i.test(s), s);
    }
  }
  assert.match(SHOP.mascotLine('due', { due: 5 }, () => 0), /5 terms/);
  assert.match(SHOP.mascotLine('due', { due: 1 }, () => 0), /1 term\b/);
  assert.match(SHOP.mascotLine('ready', { unit: 'Cloud Computing' }, () => 0), /Cloud Computing/);
  assert.match(SHOP.mascotLine('streak', { streak: 3 }, () => 0), /3-day streak/);
  assert.match(SHOP.mascotLine('sleepy', {}, () => 0), /Zzz/);
  // Different random numbers give different lines.
  const lines = new Set([0, 0.34, 0.67, 0.99].map(r => SHOP.mascotLine('right', {}, () => r)));
  assert.ok(lines.size >= 3);
  assert.equal(SHOP.mascotLine('nope', {}, () => 0), '');
});

test('homeMood: greeting kind from state, sleepy if not studied today', () => {
  assert.equal(SHOP.homeLineKind({ studied: false, due: 5 }), 'sleepy');
  assert.equal(SHOP.homeLineKind({ studied: true, due: 5 }), 'due');
  assert.equal(SHOP.homeLineKind({ studied: true, due: 0, streak: 3 }), 'streak');
  assert.equal(SHOP.homeLineKind({ studied: true, due: 0, streak: 1, unit: 'X' }), 'ready');
});

const test = require('node:test');
const assert = require('node:assert/strict');
const SHOP = require('../shop-data.js');

const SLOTS = ['hat', 'face', 'neck', 'back', 'held', 'bg', 'frame', 'effect'];
const ANCHORS = ['head', 'eyes', 'neck', 'back', 'hand'];
const count = (s, sub) => s.split(sub).length - 1;

test('avatar anchors are finite', () => {
  for (const a of ANCHORS) for (const k of ['x', 'y', 's', 'r']) assert.ok(Number.isFinite(SHOP.AVATAR_ANCHORS[a][k]), `avatar ${a}.${k}`);
});

test('ids are unique across pets, items and variants', () => {
  const ids = [];
  for (const p of SHOP.PETS) ids.push(p.id);
  for (const it of SHOP.ITEMS) {
    ids.push(it.id);
    for (const v of it.variants || []) ids.push(v.id);
  }
  assert.equal(new Set(ids).size, ids.length);
});

test('no axolotl', () => {
  for (const p of SHOP.PETS) {
    assert.doesNotMatch(p.id, /axolotl/i);
    assert.doesNotMatch(p.name, /axolotl/i);
  }
});

test('every item has a valid slot and a price in 50-800 or an unlock', () => {
  assert.ok(SHOP.ITEMS.length >= 36 && SHOP.ITEMS.length <= 46, 'about 40 items');
  for (const it of SHOP.ITEMS) {
    assert.ok(SLOTS.includes(it.slot), `${it.id} slot ${it.slot}`);
    if (it.unlock) {
      assert.ok(['league', 'streak', 'mastery'].includes(it.unlock.type), it.id);
      assert.equal(it.price, undefined, `${it.id} is not for sale`);
    } else {
      assert.ok(it.price >= 50 && it.price <= 800, `${it.id} ${it.price}`);
    }
    for (const v of it.variants || []) assert.ok(v.price >= 50 && v.price <= 800 && /^#[0-9a-f]{6}$/i.test(v.col), v.id);
    assert.match(it.svg(it.col), /<|^$/);
  }
});

test('unlocks: one per league tier, streak 7/30/100, one per unit', () => {
  const un = SHOP.ITEMS.filter(i => i.unlock).map(i => i.unlock);
  assert.deepEqual(un.filter(u => u.type === 'league').map(u => u.value).sort(), [0, 1, 2, 3, 4, 5, 6]);
  assert.deepEqual(un.filter(u => u.type === 'streak').map(u => u.value).sort((a, b) => a - b), [7, 30, 100]);
  assert.deepEqual(un.filter(u => u.type === 'mastery').map(u => u.value).sort(), ['u1', 'u2']);
});

test('compose: one <svg>, one <g> per worn item, layers in order', () => {
  const out = SHOP.compose('<circle cx="100" cy="100" r="50"/>', SHOP.AVATAR_ANCHORS,
    { hat: 'top-hat', face: 'round-glasses', back: 'cape', bg: 'bg-sky', effect: 'sparkles' });
  assert.equal(count(out, '<svg'), 1);
  assert.equal(count(out, '<g'), 5);
  const at = s => out.indexOf(`data-slot="${s}"`);
  const base = out.indexOf('<circle cx="100" cy="100" r="50"/>');
  assert.ok(at('bg') < at('back') && at('back') < base, 'bg and back behind the base');
  assert.ok(base < at('face') && base < at('hat') && at('hat') < at('effect'), 'effect last');
  const h = SHOP.AVATAR_ANCHORS.head;
  assert.ok(out.includes(`data-slot="hat" transform="translate(${h.x} ${h.y}) rotate(${h.r}) scale(${h.s}) translate(-50 -50)"`));
  // variant ids resolve; wrong-slot or unknown ids are skipped
  const v = SHOP.ITEMS.find(i => i.variants).variants[0];
  const slot = SHOP.ITEMS.find(i => i.variants).slot;
  const out2 = SHOP.compose('', SHOP.AVATAR_ANCHORS, { [slot]: v.id, face: 'top-hat', neck: 'nope' });
  assert.equal(count(out2, '<g'), 1);
  assert.ok(out2.includes(v.col));
});

test('canBuy refuses when short, owned or locked', () => {
  const hat = SHOP.item('top-hat').item;
  assert.deepEqual(SHOP.canBuy(hat, { coins: hat.price - 1 }, {}, {}).ok, false);
  assert.equal(SHOP.canBuy(hat, { coins: hat.price - 1 }, {}, {}).reason, 'short');
  assert.equal(SHOP.canBuy(hat, { coins: 9999 }, { 'top-hat': true }, {}).reason, 'owned');
  assert.deepEqual(SHOP.canBuy(hat, { coins: hat.price }, {}, {}), { ok: true, reason: 'ok', price: hat.price });
  assert.equal(SHOP.canBuy(null, { coins: 1 }, {}, {}).reason, 'unknown');

  const crown = SHOP.ITEMS.find(i => i.unlock && i.unlock.type === 'league' && i.unlock.value === 2);
  assert.equal(SHOP.canBuy(crown, { coins: 9999 }, {}, { leagueTier: 1 }).reason, 'locked');
  assert.deepEqual(SHOP.canBuy(crown, { coins: 0 }, {}, { leagueTier: 2 }), { ok: true, reason: 'unlocked', price: 0 });
  const s30 = SHOP.ITEMS.find(i => i.unlock && i.unlock.value === 30);
  assert.equal(SHOP.canBuy(s30, { coins: 0 }, {}, { bestStreak: 29 }).ok, false);
  assert.equal(SHOP.canBuy(s30, { coins: 0 }, {}, { bestStreak: 30 }).ok, true);
  const u2 = SHOP.ITEMS.find(i => i.unlock && i.unlock.value === 'u2');
  assert.equal(SHOP.canBuy(u2, { coins: 0 }, {}, { masteredUnits: ['u1'] }).ok, false);
  assert.equal(SHOP.canBuy(u2, { coins: 0 }, {}, { masteredUnits: ['u2'] }).ok, true);
  assert.equal(SHOP.canBuy(u2, { coins: 0 }, {}, undefined).reason, 'locked');
});

test('unlockText: the short lock label the shop cards show', () => {
  const crown = SHOP.ITEMS.find(i => i.unlock && i.unlock.type === 'league' && i.unlock.value === 2);
  assert.equal(SHOP.unlockText(crown), 'Reach Gold league');
  const s30 = SHOP.ITEMS.find(i => i.unlock && i.unlock.type === 'streak' && i.unlock.value === 30);
  assert.equal(SHOP.unlockText(s30), '30-day streak');
  const u2 = SHOP.ITEMS.find(i => i.unlock && i.unlock.value === 'u2');
  assert.equal(SHOP.unlockText(u2), 'Master all of Unit 2');
  assert.equal(SHOP.unlockText(SHOP.ITEMS.find(i => !i.unlock)), '');
});

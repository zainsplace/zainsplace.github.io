/* ===== SHOP DATA =====
   Pets, eggs, mascot lines and the avatar's accessories. Pets are images
   (img/pets/<id>.png) hatched from eggs; accessories are flat "sticker" art
   drawn in code and worn by the avatar only. No DOM and no app globals, so the
   tests can load it in Node. shop.js draws from here.

   Accessory art: drawn once on a 100x100 grid with its anchor at (50,50).
   Fills come from one colour `col` (fill, a lighter tone and a darker 3px
   outline), so passing another colour makes a colour variant. compose()
   places each worn item on the matching avatar anchor { x, y, s, r }:
     hat -> head, face -> eyes, neck -> neck, back -> back (behind),
     held -> hand, bg / frame / effect -> the whole 200x200 box. */
const SHOP = (() => {
  /* ---------- colour ---------- */
  const HEX = /^#[0-9a-f]{6}$/i;
  const rgb = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const hex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  function mix(a, b, t) {
    const A = rgb(a), B = rgb(b);
    return hex(A.map((v, i) => v + (B[i] - v) * t));
  }
  const darker = (c, t) => mix(c, '#000000', t == null ? 0.45 : t);
  const lighter = (c, t) => mix(c, '#ffffff', t == null ? 0.55 : t);
  /* The tones every drawing uses: fill, light (bellies, highlights), mid
     (second tone) and line (the outline). */
  function tone(col, fallback) {
    const c = HEX.test(col || '') ? col : (HEX.test(fallback || '') ? fallback : '#94A3B8');
    return { fill: c, light: lighter(c), mid: darker(c, 0.18), line: darker(c) };
  }

  const WHITE = '#FFFFFF';
  const GOLD = '#FACC15', GOLD_LINE = '#A16207';

  const A = (x, y, s, r) => ({ x, y, s, r: r || 0 });

  /* ---------- pets (images) ----------
     Each pet is a 256px transparent PNG at img/pets/<id>.png, picked by id, so
     new art drops in with no code change. Pets are only got
     from eggs. */
  const RARITIES = [
    { id: 'common', name: 'Common', col: '#94A3B8' },
    { id: 'rare', name: 'Rare', col: '#3B82F6' },
    { id: 'epic', name: 'Epic', col: '#8B5CF6' },
    { id: 'legendary', name: 'Legendary', col: '#D4A017' },
    { id: 'mythic', name: 'Mythic', col: '#E11D48' }
  ];
  const PET_LIST = [
    ['cat', 'Cat', 'common'], ['dog', 'Dog', 'common'], ['rabbit', 'Rabbit', 'common'],
    ['hamster', 'Hamster', 'common'], ['frog', 'Frog', 'common'],
    ['fox', 'Fox', 'rare'], ['owl', 'Owl', 'rare'], ['penguin', 'Penguin', 'rare'], ['panda', 'Panda', 'rare'],
    ['wolf', 'Wolf', 'epic'], ['tiger', 'Tiger', 'epic'], ['bear', 'Bear', 'epic'], ['eagle', 'Eagle', 'epic'],
    ['lion', 'Lion', 'legendary'], ['griffin', 'Griffin', 'legendary'], ['unicorn', 'Unicorn', 'legendary'], ['dragon', 'Dragon', 'legendary'],
    ['phoenix', 'Phoenix', 'mythic'], ['kraken', 'Kraken', 'mythic'], ['hydra', 'Hydra', 'mythic']
  ];
  const PETS = PET_LIST.map(([id, name, rarity]) => ({ id, name, rarity, img: `img/pets/${id}.png` }));

  /* Old code-drawn pets with no animal in the new set, mapped to a new pet
     (cheap starters -> common, tech -> rare, yeti/slime -> epic). Every other
     old id (cat, dog, fox, rabbit, owl, penguin, frog, panda, hamster, dragon,
     unicorn, phoenix, griffin, kraken) is in the new set and is kept. */
  const MIGRATE = { robot: 'rabbit', computer: 'hamster', drone: 'penguin', floppy: 'owl', yeti: 'bear', slime: 'wolf' };
  const OLD_NAMES = { robot: 'Robot', computer: 'Little computer', drone: 'Drone', floppy: 'Floppy-disk buddy', yeti: 'Yeti', slime: 'Slime' };

  /* ---------- eggs ---------- */
  const EGGS = [
    { id: 'common', name: 'Common egg', price: 100, odds: [['common', 0.85], ['rare', 0.15]] },
    { id: 'rare', name: 'Rare egg', price: 250, odds: [['rare', 0.85], ['epic', 0.15]] },
    { id: 'epic', name: 'Epic egg', price: 500, odds: [['epic', 0.88], ['legendary', 0.12]] },
    { id: 'legendary', name: 'Legendary egg', price: 1000, odds: [['legendary', 0.92], ['mythic', 0.08]] }
  ];
  const REFUND = 0.4;
  const egg = id => EGGS.find(e => e.id === id) || null;
  const rarity = id => RARITIES.find(r => r.id === id) || null;
  // A random number in [0, 1): anything else is clamped.
  const unit01 = r => (typeof r === 'number' && r >= 0 ? Math.min(r, 1 - 1e-9) : 0);

  function rollRarity(e, rand) {
    const r = unit01(rand());
    let acc = 0;
    for (const [id, p] of e.odds) {
      acc += p;
      if (r < acc) return id;
    }
    return e.odds[e.odds.length - 1][0];
  }
  const refundFor = e => Math.round(e.price * REFUND);

  /* hatch(eggId, owned, rand) -> { egg, pet, rarity, duplicate, refund }.
     rand() is called twice: the rarity, then the pet within it (uniform). */
  function hatch(eggId, owned, rand) {
    const e = egg(eggId);
    if (!e) return null;
    const rar = rollRarity(e, rand);
    const pool = PETS.filter(p => p.rarity === rar);
    const p = pool[Math.floor(unit01(rand()) * pool.length)];
    const dup = !!(owned && Object.prototype.hasOwnProperty.call(owned, p.id));
    return { egg: e.id, pet: p.id, rarity: rar, duplicate: dup, refund: dup ? refundFor(e) : 0 };
  }

  /* The first egg (no pets yet) is a free common egg. */
  function eggPrice(e, owned) {
    if (!e) return 0;
    return e.id === 'common' && !Object.keys(owned || {}).length ? 0 : e.price;
  }
  function canBuyEgg(e, wallet, owned) {
    if (!e || !egg(e.id)) return { ok: false, reason: 'unknown', price: 0 };
    const price = eggPrice(e, owned);
    const coins = wallet && typeof wallet.coins === 'number' ? wallet.coins : 0;
    return coins >= price ? { ok: true, reason: 'ok', price } : { ok: false, reason: 'short', price };
  }

  /* Egg art: img/eggs/egg-<id>.png. */
  function eggHTML(id, opts) {
    const o = opts || {};
    const e = egg(id) || EGGS[0];
    const wh = o.size ? ` width="${o.size}" height="${o.size}"` : '';
    return `<img src="img/eggs/egg-${e.id}.png"${wh} class="egg-img${o.cls ? ' ' + esc(o.cls) : ''}" alt="" aria-hidden="true" draggable="false" decoding="async">`;
  }

  /* ---------- mascot lines ----------
     Short, kind, offline. {due}, {unit}, {streak} are filled from real state. */
  const LINES = {
    due: ['{due} {terms} to review today', '{due} {terms} ready for a quick review', 'Got a minute? {due} {terms} to review'],
    ready: ['Ready for {unit}?', 'Fancy a round of {unit}?', "Let's learn something new!"],
    streak: ['{streak}-day streak, keep it going!', '{streak} days in a row. Nice!', 'Streak at {streak}. One more round?'],
    idle: ['Hi! Fancy a round?', "Let's learn something new!", 'Good to see you!'],
    sleepy: ['Zzz…', 'Zzz… a round wakes me up', 'Zzz… zzz…'],
    right: ['Nice!', 'Got it!', 'Spot on!', 'Yes!', 'Brilliant!'],
    wrong: ['Nearly! Try again', "You've got this", 'Close one, keep going', 'Mistakes help you learn'],
    hint: ['Here is a clue', 'Let me help', 'Take a look at this', 'One step at a time'],
    complete: ['Great round!', 'You did it!', 'Round done, well played!', 'That was brilliant!'],
    streakUp: ['Streak up! Keep it going!', 'Another day, another win!', 'Your streak grew!'],
    empty: ['All caught up!', 'Nothing to review. Nice!', 'All done here for now']
  };
  function mascotLine(kind, ctx, rand) {
    const list = LINES[kind];
    if (!list) return '';
    const c = ctx || {};
    const n = v => (typeof v === 'number' && isFinite(v) ? Math.max(0, Math.round(v)) : 0);
    const line = list[Math.floor(unit01((rand || Math.random)()) * list.length)];
    return line
      .replace('{due}', n(c.due)).replace('{terms}', n(c.due) === 1 ? 'term' : 'terms')
      .replace('{streak}', n(c.streak))
      .replace('{unit}', typeof c.unit === 'string' && c.unit ? c.unit : 'a round');
  }
  /* Which Home greeting: sleepy if not studied today, else due reviews, then
     a streak of 2+, else "ready". */
  function homeLineKind(s) {
    const st = s || {};
    if (!st.studied) return 'sleepy';
    if (st.due > 0) return 'due';
    if (st.streak >= 2) return 'streak';
    return 'ready';
  }

  /* The avatar: emoji or photo filling the middle ~120px of a 200px circle. */
  const AVATAR_ANCHORS = {
    head: A(100, 48, 1.2), eyes: A(100, 84, 1.3), neck: A(100, 160, 1.05),
    back: A(100, 118, 1.7), hand: A(158, 158, 1, 12), full: A(100, 100, 2)
  };

  /* ---------- accessories (100x100 grid, anchor at 50,50) ---------- */
  const star = (cx, cy, r, fill, line) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
      d += (i ? ' L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return `<path d="${d} Z" fill="${fill}" stroke="${line || 'none'}"/>`;
  };
  const sparkle = (x, y, r, fill) =>
    `<path d="M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z" fill="${fill}" stroke="none"/>`;
  const flower = (x, y, c) =>
    [0, 72, 144, 216, 288].map(a => {
      const r = (a * Math.PI) / 180;
      return `<circle cx="${(x + Math.cos(r) * 4.2).toFixed(1)}" cy="${(y + Math.sin(r) * 4.2).toFixed(1)}" r="3.6" fill="${c}" stroke="none"/>`;
    }).join('') + `<circle cx="${x}" cy="${y}" r="2.6" fill="#FDE047" stroke="none"/>`;
  // Mirror left-to-right art (no <g>, so each worn item stays one group).
  // Elements passed in must not carry their own transform.
  /* Grow a path (absolute M/L/Q/Z pairs only) by k about (cx,cy): lets wings
     reach well past the body from the same shoulder anchor as the cape. */
  const grow = (d, k, cx, cy) => {
    let i = 0;
    return d.replace(/-?\d+(\.\d+)?/g, n => {
      const v = +n, out = (i % 2 ? cy + (v - cy) * k : cx + (v - cx) * k);
      i++;
      return +out.toFixed(1);
    });
  };
  const mirror = s => s.replace(/<(path|ellipse|circle|rect)\b/g, '<$1 transform="matrix(-1 0 0 1 100 0)"');

  const ITEM_ART = {
    /* hats: brim centred on (50,50), drawn upward */
    'top-hat': t => `<ellipse cx="50" cy="51" rx="30" ry="6" fill="${t.mid}" stroke="${t.line}"/>` +
      `<path d="M34 51 L36 16 Q50 12 64 16 L66 51 Q50 55 34 51 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M35.2 40 Q50 43 64.8 40 L65.4 47 Q50 50 34.6 47 Z" fill="#F43F5E" stroke="none"/>` +
      `<path d="M41 20 V36" stroke="${t.light}" stroke-width="3" opacity=".6" fill="none"/>`,
    'party-hat': t => `<path d="M30 53 L50 10 L70 53 Q50 58 30 53 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M39 34 L61 34 M35 44 L65 44 M44 23 L56 23" stroke="${t.light}" stroke-width="3.5" fill="none"/>` +
      `<circle cx="50" cy="9" r="6" fill="#FDE047" stroke="#CA8A04"/>`,
    'wizard-hat': t => `<ellipse cx="50" cy="51" rx="31" ry="6.5" fill="${t.mid}" stroke="${t.line}"/>` +
      `<path d="M30 51 Q40 40 44 24 Q48 8 70 4 Q58 14 58 28 Q60 42 70 51 Q50 56 30 51 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      star(48, 36, 6, '#FDE047') + star(58, 20, 3.5, '#FDE047') + `<circle cx="40" cy="45" r="1.8" fill="#FDE047" stroke="none"/>`,
    beanie: t => `<path d="M24 50 Q24 20 50 18 Q76 20 76 50 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<rect x="21" y="43" width="58" height="13" rx="6.5" fill="${t.mid}" stroke="${t.line}"/>` +
      `<path d="M30 46 v7 M38 46 v7 M46 46 v7 M54 46 v7 M62 46 v7 M70 46 v7" stroke="${t.line}" stroke-width="1.8" opacity=".5" fill="none"/>` +
      `<circle cx="50" cy="16" r="7" fill="${t.light}" stroke="${t.line}"/>`,
    cap: t => `<path d="M60 50 Q86 46 94 53 Q84 59 60 56 Z" fill="${t.mid}" stroke="${t.line}"/>` +
      `<path d="M26 52 Q24 22 50 20 Q76 22 74 52 Q50 56 26 52 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M50 21 V52 M37 24 Q34 38 36 52 M63 24 Q66 38 64 52" stroke="${t.line}" stroke-width="1.8" opacity=".45" fill="none"/>` +
      `<circle cx="50" cy="20" r="3.2" fill="${t.mid}" stroke="${t.line}" stroke-width="1.5"/>`,
    headphones: t => `<path d="M20 58 Q18 14 50 14 Q82 14 80 58" fill="none" stroke="${t.line}" stroke-width="10"/>` +
      `<path d="M20 58 Q18 14 50 14 Q82 14 80 58" fill="none" stroke="${t.fill}" stroke-width="5"/>` +
      `<rect x="10" y="46" width="17" height="26" rx="8" fill="${t.fill}" stroke="${t.line}"/><rect x="73" y="46" width="17" height="26" rx="8" fill="${t.fill}" stroke="${t.line}"/>` +
      `<rect x="15" y="51" width="7" height="16" rx="3.5" fill="${t.light}" stroke="none"/><rect x="78" y="51" width="7" height="16" rx="3.5" fill="${t.light}" stroke="none"/>`,
    'flower-crown': t => `<path d="M18 52 Q50 38 82 52" fill="none" stroke="#15803D" stroke-width="4"/>` +
      `<ellipse cx="28" cy="45" rx="5" ry="2.6" transform="rotate(-30 28 45)" fill="#4ADE80" stroke="none"/><ellipse cx="72" cy="45" rx="5" ry="2.6" transform="rotate(30 72 45)" fill="#4ADE80" stroke="none"/>` +
      flower(22, 50, t.fill) + flower(36, 44, '#FDE68A') + flower(50, 42, t.fill) + flower(64, 44, '#A5B4FC') + flower(78, 50, t.fill),
    'gold-crown': () => `<path d="M26 54 L23 24 L37 38 L50 16 L63 38 L77 24 L74 54 Q50 58 26 54 Z" fill="${GOLD}" stroke="${GOLD_LINE}"/>` +
      `<path d="M26 46 Q50 50 74 46" stroke="${GOLD_LINE}" stroke-width="2" fill="none"/>` +
      `<circle cx="50" cy="40" r="4.5" fill="#EF4444" stroke="#991B1B" stroke-width="1.5"/><circle cx="36" cy="44" r="3" fill="#3B82F6" stroke="none"/><circle cx="64" cy="44" r="3" fill="#3B82F6" stroke="none"/>` +
      `<circle cx="23" cy="23" r="3" fill="${GOLD}" stroke="${GOLD_LINE}" stroke-width="1.5"/><circle cx="50" cy="15" r="3" fill="${GOLD}" stroke="${GOLD_LINE}" stroke-width="1.5"/><circle cx="77" cy="23" r="3" fill="${GOLD}" stroke="${GOLD_LINE}" stroke-width="1.5"/>`,
    'streak-headband': () => `<path d="M20 46 Q50 38 80 46 L80 56 Q50 48 20 56 Z" fill="#F97316" stroke="#9A3412"/>` +
      `<path d="M80 48 L92 44 L88 52 L94 58 L80 54 Z" fill="#F97316" stroke="#9A3412"/>` +
      `<path d="M50 50 Q42 44 46 36 Q48 42 51 40 Q50 34 55 30 Q54 38 58 42 Q60 48 50 50 Z" fill="#FDE047" stroke="#C2410C" stroke-width="2"/>`,
    'golden-laurel': () => {
      const leaves = side => [0, 1, 2, 3, 4].map(i => {
        const a = Math.PI * (0.95 - i * 0.11), x = 50 + side * Math.cos(a) * 30, y = 56 - Math.sin(a) * 18;
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="6" ry="3" transform="rotate(${(side * (-40 + i * 16)).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${GOLD}" stroke="${GOLD_LINE}" stroke-width="1.5"/>`;
      }).join('');
      return `<path d="M22 56 Q30 38 46 36 M78 56 Q70 38 54 36" fill="none" stroke="${GOLD_LINE}" stroke-width="2.5"/>` + leaves(1) + leaves(-1);
    },
    'grad-cap': () => `<path d="M32 40 V52 Q50 58 68 52 V40 Z" fill="#0C4A6E" stroke="#082F49"/>` +
      `<path d="M12 34 L50 22 L88 34 L50 46 Z" fill="#0EA5E9" stroke="#075985"/>` +
      `<path d="M50 34 L76 40 V52" fill="none" stroke="#FDE047" stroke-width="2"/><path d="M73 52 h6 l-1 9 h-4 Z" fill="#FDE047" stroke="#CA8A04" stroke-width="1.5"/>` +
      `<circle cx="50" cy="34" r="2.5" fill="#FDE047" stroke="none"/>`,
    'cyber-halo': () => `<ellipse cx="50" cy="20" rx="26" ry="7" fill="none" stroke="#22D3EE" stroke-width="9" opacity=".3"/>` +
      `<ellipse cx="50" cy="20" rx="26" ry="7" fill="none" stroke="#22D3EE" stroke-width="3.5"/>` +
      `<ellipse cx="50" cy="20" rx="26" ry="7" fill="none" stroke="#E0F2FE" stroke-width="1.2"/>` +
      `<path d="M50 4 L55 10 L50 16 L45 10 Z" fill="#A855F7" stroke="#6B21A8" stroke-width="1.5"/>`,

    /* face: lens centres at (33,50) and (67,50) */
    'round-glasses': t => `<path d="M21 48 L10 45 M79 48 L90 45" stroke="${t.fill}" stroke-width="3" fill="none"/>` +
      `<circle cx="33" cy="50" r="12" fill="#E0F2FE" fill-opacity=".35" stroke="${t.light}" stroke-width="6.5"/>` +
      `<circle cx="67" cy="50" r="12" fill="#E0F2FE" fill-opacity=".35" stroke="${t.light}" stroke-width="6.5"/>` +
      `<circle cx="33" cy="50" r="12" fill="none" stroke="${t.fill}" stroke-width="3.5"/>` +
      `<circle cx="67" cy="50" r="12" fill="none" stroke="${t.fill}" stroke-width="3.5"/>` +
      `<path d="M45 48 Q50 44 55 48" stroke="${t.fill}" stroke-width="3" fill="none"/>`,
    sunglasses: t => `<path d="M17 44 L8 41 M83 44 L92 41" stroke="${t.line}" stroke-width="3" fill="none"/>` +
      `<path d="M17 42 H47 Q47 62 32 62 Q17 62 17 42 Z M53 42 H83 Q83 62 68 62 Q53 62 53 42 Z" fill="none" stroke="${lighter(t.fill, 0.45)}" stroke-width="6"/>` +
      `<path d="M17 42 H47 Q47 62 32 62 Q17 62 17 42 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M53 42 H83 Q83 62 68 62 Q53 62 53 42 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M47 45 Q50 42 53 45" stroke="${t.line}" stroke-width="3" fill="none"/>` +
      `<path d="M23 47 l6 0 M59 47 l6 0" stroke="${WHITE}" stroke-width="2.5" opacity=".7" fill="none"/>`,
    'star-glasses': t => `<path d="M19 47 L9 44 M81 47 L91 44" stroke="${t.line}" stroke-width="3" fill="none"/>` +
      star(33, 50, 16, t.fill, t.line) + star(67, 50, 16, t.fill, t.line) +
      `<circle cx="33" cy="51" r="6" fill="${t.light}" stroke="${t.line}" stroke-width="1.5"/><circle cx="67" cy="51" r="6" fill="${t.light}" stroke="${t.line}" stroke-width="1.5"/>` +
      `<path d="M46 49 Q50 46 54 49" stroke="${t.line}" stroke-width="3" fill="none"/>`,
    'pixel-shades': () => `<path d="M12 42 H88 V48 H82 V54 H76 V60 H58 V54 H54 V48 H46 V54 H42 V60 H24 V54 H18 V48 H12 Z" fill="none" stroke="#94A3B8" stroke-width="4"/><path d="M12 42 H88 V48 H82 V54 H76 V60 H58 V54 H54 V48 H46 V54 H42 V60 H24 V54 H18 V48 H12 Z" fill="#0F172A" stroke="#0F172A" stroke-width="1"/>` +
      `<path d="M24 48 h6 v6 h-6 Z M30 54 h6 v-0 M58 48 h6 v6 h-6 Z" fill="${WHITE}" stroke="none"/>`,
    'hero-mask': t => `<path fill-rule="evenodd" d="M12 47 Q18 36 34 40 Q50 44 66 40 Q82 36 88 47 Q86 62 68 62 Q56 62 50 55 Q44 62 32 62 Q14 62 12 47 Z M24 50 Q33 42 42 50 Q33 56 24 50 Z M58 50 Q67 42 76 50 Q67 56 58 50 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M88 47 L96 42 M88 49 L95 54" stroke="${t.line}" stroke-width="3" fill="none"/>`,
    'silver-shades': () => `<path d="M18 44 L9 41 M82 44 L91 41" stroke="#475569" stroke-width="3" fill="none"/>` +
      `<path d="M18 42 Q32 38 46 42 Q46 60 33 61 Q20 60 18 42 Z" fill="#CBD5E1" stroke="#475569"/>` +
      `<path d="M54 42 Q68 38 82 42 Q80 60 67 61 Q54 60 54 42 Z" fill="#CBD5E1" stroke="#475569"/>` +
      `<path d="M46 43 Q50 40 54 43" stroke="#475569" stroke-width="3" fill="none"/>` +
      `<path d="M24 48 l8 -3 M60 48 l8 -3" stroke="${WHITE}" stroke-width="3" fill="none"/>`,

    /* neck: centred on (50,50) */
    'bow-tie': t => `<path d="M50 50 L26 38 Q20 50 26 62 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M50 50 L74 38 Q80 50 74 62 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M30 44 L36 47 M30 56 L36 53 M70 44 L64 47 M70 56 L64 53" stroke="${t.light}" stroke-width="2" fill="none"/>` +
      `<rect x="43" y="43" width="14" height="14" rx="4" fill="${t.mid}" stroke="${t.line}"/>`,
    scarf: t => `<path d="M60 54 L70 88 L57 90 L52 58 Z" fill="${t.mid}" stroke="${t.line}"/>` +
      `<path d="M58 70 l10 -2 M60 80 l10 -2" stroke="${t.light}" stroke-width="3" fill="none"/>` +
      `<path d="M16 42 Q50 58 84 42 L86 53 Q50 70 14 53 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M30 51 l2 8 M44 54 l1 9 M58 54 l-1 9 M72 50 l-2 8" stroke="${t.light}" stroke-width="3" fill="none"/>`,
    'gold-chain': () => {
      let s = '';
      for (let i = 0; i <= 8; i++) {
        const u = i / 8, x = 22 + u * 56, y = 40 + Math.sin(u * Math.PI) * 18;
        s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.6" ry="2.6" fill="none" stroke="${GOLD_LINE}" stroke-width="4.2"/><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.6" ry="2.6" fill="none" stroke="${GOLD}" stroke-width="2"/>`;
      }
      return s + `<circle cx="50" cy="67" r="8.5" fill="${GOLD}" stroke="${GOLD_LINE}"/>` + star(50, 67, 4.5, '#FEF9C3');
    },
    'bronze-medal': () => `<path d="M36 28 L46 58 L54 58 L64 28 L56 28 L50 46 L44 28 Z" fill="#2563EB" stroke="#1E3A8A"/>` +
      `<circle cx="50" cy="64" r="11" fill="#D97706" stroke="#78350F"/>` + star(50, 64, 6, '#FCD34D'),

    /* back: hangs from the shoulders at (50,50); drawn behind the body */
    cape: t => `<path d="M32 40 Q50 47 68 40 Q84 64 102 96 Q76 104 50 101 Q24 104 -2 96 Q16 64 32 40 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M38 48 Q30 72 18 96 M62 48 Q70 72 82 96" stroke="${t.mid}" stroke-width="3" fill="none"/>`,
    'star-robe': () => `<path d="M32 40 Q50 47 68 40 Q84 64 102 96 Q76 104 50 101 Q24 104 -2 96 Q16 64 32 40 Z" fill="#6D28D9" stroke="#3B0764"/>` +
      star(20, 88, 4, '#FDE047') + star(80, 88, 4, '#FDE047') + star(30, 72, 3, '#FDE047') + star(70, 72, 3, '#FDE047') + star(50, 92, 3, '#FDE047'),
    'angel-wings': () => {
      const w = `<path d="${grow('M46 52 Q22 18 4 30 Q6 40 14 44 Q4 50 8 58 Q18 60 24 58 Q16 66 24 72 Q38 70 48 58 Z', 1.5, 50, 56)}" fill="#F8FAFC" stroke="#94A3B8"/>` +
        `<path d="${grow('M14 44 Q28 46 40 52 M24 58 Q34 58 44 56', 1.5, 50, 56)}" stroke="#CBD5E1" stroke-width="2" fill="none"/>`;
      return w + mirror(w);
    },
    'bat-wings': t => {
      const w = `<path d="${grow('M46 52 L6 26 Q10 42 2 54 Q14 52 18 62 Q26 56 32 66 Q36 56 48 58 Z', 1.5, 50, 56)}" fill="${t.fill}" stroke="${t.line}"/>` +
        `<path d="${grow('M44 54 L10 34 M40 56 L18 58 M42 58 L30 64', 1.5, 50, 56)}" stroke="${t.light}" stroke-width="1.8" fill="none"/>`;
      return w + mirror(w);
    },
    'fairy-wings': t => {
      const w = `<path d="${grow('M48 50 Q24 18 8 26 Q4 44 46 54 Z', 1.5, 50, 56)}" fill="${t.light}" fill-opacity=".85" stroke="${t.line}"/>` +
        `<path d="${grow('M48 56 Q22 60 18 76 Q30 84 48 60 Z', 1.5, 50, 56)}" fill="${t.fill}" fill-opacity=".85" stroke="${t.line}"/>`;
      return w + mirror(w);
    },
    jetpack: t => {
      const tank = x => `<path d="M${x + 4} 92 Q${x + 10} 106 ${x + 16} 92 Q${x + 10} 98 ${x + 4} 92 Z" fill="#FDE047" stroke="#EA580C" stroke-width="2"/>` +
        `<path d="M${x + 6} 88 Q${x + 10} 100 ${x + 14} 88 Z" fill="#F97316" stroke="none"/>` +
        `<rect x="${x}" y="34" width="20" height="54" rx="10" fill="${t.fill}" stroke="${t.line}"/>` +
        `<rect x="${x + 4}" y="40" width="5" height="30" rx="2.5" fill="${t.light}" stroke="none"/>` +
        `<rect x="${x + 3}" y="82" width="14" height="8" rx="2" fill="${t.mid}" stroke="${t.line}"/>`;
      return `<rect x="20" y="44" width="60" height="30" rx="6" fill="${t.mid}" stroke="${t.line}"/>` + tank(4) + tank(76);
    },

    /* held: the grip is at (50,50) */
    wand: () => `<path d="M48 64 L62 22" stroke="#1E293B" stroke-width="7"/><path d="M48 64 L62 22" stroke="#7C3AED" stroke-width="3.5"/>` +
      star(64, 16, 11, '#FDE047', '#CA8A04') + sparkle(80, 22, 4, '#FDE047') + sparkle(52, 8, 3, '#FDE047'),
    sword: () => `<path d="M46 46 L46 10 L50 2 L54 10 L54 46 Z" fill="#E2E8F0" stroke="#475569"/>` +
      `<path d="M50 8 V44" stroke="#94A3B8" stroke-width="1.5" fill="none"/>` +
      `<rect x="36" y="45" width="28" height="7" rx="3.5" fill="${GOLD}" stroke="${GOLD_LINE}"/>` +
      `<rect x="46" y="52" width="8" height="14" rx="2" fill="#92400E" stroke="#451A03"/><circle cx="50" cy="69" r="4" fill="${GOLD}" stroke="${GOLD_LINE}"/>`,
    book: t => `<path d="M30 30 H66 Q70 30 70 34 V64 H34 Q30 64 30 60 Z" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M34 60 H70 V66 H34 Q31 66 31 63 Q31 60 34 60 Z" fill="#F8FAFC" stroke="${t.line}" stroke-width="2"/>` +
      `<path d="M38 30 V60" stroke="${t.mid}" stroke-width="3" fill="none"/>` + star(54, 45, 7, '#FDE047'),
    balloon: t => `<path d="M50 54 Q46 42 56 32" fill="none" stroke="#64748B" stroke-width="1.8"/>` +
      `<ellipse cx="58" cy="17" rx="13" ry="15" fill="${t.fill}" stroke="${t.line}"/>` +
      `<path d="M55 32 L61 32 L58 28 Z" fill="${t.fill}" stroke="${t.line}" stroke-width="1.5"/>` +
      `<ellipse cx="53" cy="11" rx="3" ry="5" transform="rotate(-20 53 11)" fill="${WHITE}" opacity=".6" stroke="none"/>`,
    'u2-trophy': () => `<path d="M36 26 Q22 26 26 38 Q30 46 40 44 M64 26 Q78 26 74 38 Q70 46 60 44" fill="none" stroke="${GOLD_LINE}" stroke-width="3.5"/>` +
      `<path d="M34 20 H66 Q66 46 50 48 Q34 46 34 20 Z" fill="#EF4444" stroke="#991B1B"/>` +
      `<rect x="46" y="47" width="8" height="10" fill="${GOLD}" stroke="${GOLD_LINE}"/>` +
      `<rect x="37" y="56" width="26" height="9" rx="2" fill="${GOLD}" stroke="${GOLD_LINE}"/>` + star(50, 31, 6, '#FEF9C3'),

    /* bg (avatar only): fills the circle */
    'bg-sky': () => `<circle cx="50" cy="50" r="50" fill="#BAE6FD" stroke="none"/>` +
      `<circle cx="76" cy="24" r="9" fill="#FDE047" stroke="none"/>` +
      `<path d="M10 70 Q12 62 20 64 Q24 56 32 62 Q40 60 38 70 Z M60 84 Q62 78 68 79 Q72 72 80 78 Q88 78 86 86 Z M18 32 Q20 27 25 28 Q28 23 34 28 Q38 28 37 33 Z" fill="${WHITE}" stroke="none"/>`,
    'bg-space': () => `<circle cx="50" cy="50" r="50" fill="#1E1B4B" stroke="none"/>` +
      [[18, 30], [30, 14], [72, 18], [86, 40], [14, 62], [80, 74], [44, 88], [62, 8], [24, 82]]
        .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1 : 1.6}" fill="${WHITE}" stroke="none"/>`).join('') +
      `<circle cx="78" cy="26" r="7" fill="#F472B6" stroke="none"/><ellipse cx="78" cy="26" rx="12" ry="3" transform="rotate(-20 78 26)" fill="none" stroke="#FBCFE8" stroke-width="1.5"/>`,
    'bg-circuit': () => `<circle cx="50" cy="50" r="50" fill="#064E3B" stroke="none"/>` +
      `<path d="M4 40 H22 L30 32 H44 M96 60 H78 L70 68 H56 M30 96 V80 L38 72 M70 4 V20 L62 28 M10 70 H24 M90 30 H76" fill="none" stroke="#34D399" stroke-width="1.5" opacity=".8"/>` +
      [[44, 32], [56, 68], [38, 72], [62, 28], [24, 70], [76, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#6EE7B7" stroke="none"/>`).join(''),

    /* frame (avatar only): a ring on the circle's edge */
    'frame-rainbow': () => ['#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#A855F7']
      .map((c, i) => `<circle cx="50" cy="50" r="${49 - i * 1.6}" fill="none" stroke="${c}" stroke-width="1.8"/>`).join(''),
    'platinum-frame': () => `<circle cx="50" cy="50" r="47" fill="none" stroke="#64748B" stroke-width="6.5"/>` +
      `<circle cx="50" cy="50" r="47" fill="none" stroke="#E2E8F0" stroke-width="4"/>` +
      [[50, 3], [97, 50], [50, 97], [3, 50]].map(([x, y]) => `<path d="M${x} ${y - 4} L${x + 4} ${y} L${x} ${y + 4} L${x - 4} ${y} Z" fill="#7DD3FC" stroke="#0369A1" stroke-width="1"/>`).join(''),

    /* effects: over the whole box */
    sparkles: () => sparkle(14, 20, 7, '#FDE047') + sparkle(86, 16, 5, '#FDE047') + sparkle(90, 62, 6, '#FDE047') +
      sparkle(10, 70, 4, '#FDE047') + sparkle(24, 8, 3, WHITE) + sparkle(76, 88, 4, '#FEF08A'),
    glitch: () => `<rect x="2" y="30" width="16" height="4" fill="#22D3EE" opacity=".8" stroke="none"/><rect x="84" y="44" width="14" height="3" fill="#F472B6" opacity=".8" stroke="none"/>` +
      `<rect x="6" y="62" width="10" height="3" fill="#F472B6" opacity=".8" stroke="none"/><rect x="80" y="70" width="16" height="4" fill="#22D3EE" opacity=".8" stroke="none"/>` +
      `<rect x="10" y="16" width="4" height="4" fill="#A3E635" stroke="none"/><rect x="88" y="22" width="4" height="4" fill="#22D3EE" stroke="none"/><rect x="18" y="86" width="4" height="4" fill="#F472B6" stroke="none"/>`,
    flames: () => {
      const fl = (x, h) => `<path d="M${x - 7} 98 Q${x - 9} ${98 - h * 0.6} ${x} ${98 - h} Q${x + 2} ${98 - h * 0.6} ${x + 7} ${98 - h * 0.7} Q${x + 9} ${98 - h * 0.3} ${x + 7} 98 Z" fill="#F97316" stroke="#C2410C" stroke-width="1.2" opacity=".92"/>` +
        `<path d="M${x - 3} 98 Q${x - 4} ${98 - h * 0.4} ${x} ${98 - h * 0.6} Q${x + 4} ${98 - h * 0.35} ${x + 3} 98 Z" fill="#FDE047" stroke="none"/>`;
      return fl(10, 30) + fl(22, 18) + fl(90, 30) + fl(78, 18);
    },
    'diamond-sparkle': () => [[14, 22, 5], [86, 18, 4], [90, 60, 5], [10, 66, 4], [50, 4, 3]]
      .map(([x, y, r]) => `<path d="M${x} ${y - r * 1.4} L${x + r} ${y} L${x} ${y + r * 1.4} L${x - r} ${y} Z" fill="#7DD3FC" stroke="#0369A1" stroke-width="1"/>`).join('') +
      sparkle(24, 40, 3, WHITE) + sparkle(78, 36, 3, WHITE)
  };

  const v = (id, name, col) => ({ id, name, col, price: 50 });
  // [id, name, slot, price | { unlock }, default colour, variants]
  const ITEM_LIST = [
    ['top-hat', 'Top hat', 'hat', 150, '#374151', [v('top-hat-plum', 'Plum top hat', '#7E22CE'), v('top-hat-red', 'Red top hat', '#B91C1C')]],
    ['party-hat', 'Party hat', 'hat', 80, '#EC4899', [v('party-hat-blue', 'Blue party hat', '#3B82F6'), v('party-hat-green', 'Green party hat', '#22C55E')]],
    ['wizard-hat', 'Wizard hat', 'hat', 200, '#6366F1', [v('wizard-hat-teal', 'Teal wizard hat', '#0D9488'), v('wizard-hat-red', 'Red wizard hat', '#DC2626')]],
    ['beanie', 'Beanie', 'hat', 60, '#14B8A6', [v('beanie-orange', 'Orange beanie', '#F97316'), v('beanie-purple', 'Purple beanie', '#8B5CF6')]],
    ['cap', 'Cap', 'hat', 100, '#3B82F6', [v('cap-red', 'Red cap', '#EF4444'), v('cap-black', 'Black cap', '#334155')]],
    ['headphones', 'Headphones', 'hat', 300, '#F43F5E', [v('headphones-white', 'White headphones', '#E2E8F0'), v('headphones-lime', 'Lime headphones', '#84CC16')]],
    ['flower-crown', 'Flower crown', 'hat', 180, '#F472B6', null],
    ['round-glasses', 'Round glasses', 'face', 60, '#1E293B', [v('round-glasses-red', 'Red round glasses', '#DC2626'), v('round-glasses-gold', 'Gold round glasses', '#CA8A04')]],
    ['sunglasses', 'Sunglasses', 'face', 120, '#0F172A', null],
    ['star-glasses', 'Star glasses', 'face', 180, '#FACC15', [v('star-glasses-pink', 'Pink star glasses', '#F472B6')]],
    ['pixel-shades', 'Pixel shades', 'face', 250, '#0F172A', null],
    ['hero-mask', 'Hero mask', 'face', 200, '#DC2626', [v('hero-mask-black', 'Black hero mask', '#1E293B'), v('hero-mask-blue', 'Blue hero mask', '#2563EB')]],
    ['bow-tie', 'Bow tie', 'neck', 50, '#E11D48', [v('bow-tie-blue', 'Blue bow tie', '#2563EB'), v('bow-tie-gold', 'Gold bow tie', '#EAB308')]],
    ['scarf', 'Scarf', 'neck', 90, '#EF4444', [v('scarf-green', 'Green scarf', '#16A34A'), v('scarf-blue', 'Blue scarf', '#0284C7')]],
    ['gold-chain', 'Gold chain', 'neck', 300, GOLD, null],
    ['cape', 'Cape', 'back', 200, '#DC2626', [v('cape-blue', 'Blue cape', '#2563EB'), v('cape-black', 'Black cape', '#1E293B')]],
    ['angel-wings', 'Angel wings', 'back', 450, '#F8FAFC', null],
    ['bat-wings', 'Bat wings', 'back', 400, '#6D28D9', null],
    ['fairy-wings', 'Fairy wings', 'back', 250, '#5EEAD4', [v('fairy-wings-pink', 'Pink fairy wings', '#F9A8D4')]],
    ['jetpack', 'Jetpack', 'back', 800, '#64748B', null],
    ['wand', 'Magic wand', 'held', 150, '#7C3AED', null],
    ['sword', 'Sword', 'held', 250, '#E2E8F0', null],
    ['book', 'Book', 'held', 80, '#2563EB', [v('book-red', 'Red book', '#DC2626'), v('book-green', 'Green book', '#16A34A')]],
    ['balloon', 'Balloon', 'held', 60, '#F43F5E', [v('balloon-yellow', 'Yellow balloon', '#FACC15'), v('balloon-blue', 'Blue balloon', '#38BDF8')]],
    ['bg-sky', 'Sunny sky', 'bg', 100, '#BAE6FD', null],
    ['bg-space', 'Deep space', 'bg', 300, '#1E1B4B', null],
    ['bg-circuit', 'Circuit board', 'bg', 250, '#064E3B', null],
    ['frame-rainbow', 'Rainbow ring', 'frame', 400, '#A855F7', null],
    ['sparkles', 'Sparkles', 'effect', 300, '#FDE047', null],
    ['glitch', 'Glitch', 'effect', 500, '#22D3EE', null],
    // Not for sale: unlocked at milestones.
    ['bronze-medal', 'Bronze medal', 'neck', { type: 'league', value: 0 }, '#D97706', null],
    ['silver-shades', 'Silver shades', 'face', { type: 'league', value: 1 }, '#CBD5E1', null],
    ['gold-crown', 'Gold crown', 'hat', { type: 'league', value: 2 }, GOLD, null],
    ['platinum-frame', 'Platinum ring', 'frame', { type: 'league', value: 3 }, '#E2E8F0', null],
    ['diamond-sparkle', 'Diamond sparkle', 'effect', { type: 'league', value: 4 }, '#7DD3FC', null],
    ['star-robe', 'Master’s robe', 'back', { type: 'league', value: 5 }, '#6D28D9', null],
    ['cyber-halo', 'Cyber halo', 'hat', { type: 'league', value: 6 }, '#22D3EE', null],
    ['streak-headband', 'Streak headband', 'hat', { type: 'streak', value: 7 }, '#F97316', null],
    ['flames', 'Flames', 'effect', { type: 'streak', value: 30 }, '#F97316', null],
    ['golden-laurel', 'Golden laurel', 'hat', { type: 'streak', value: 100 }, GOLD, null],
    ['grad-cap', 'Unit 1 graduation cap', 'hat', { type: 'mastery', value: 'u1' }, '#0EA5E9', null],
    ['u2-trophy', 'Unit 2 trophy', 'held', { type: 'mastery', value: 'u2' }, '#EF4444', null]
  ];

  const SLOTS = ['hat', 'face', 'neck', 'back', 'held', 'bg', 'frame', 'effect'];
  const AVATAR_ONLY = ['bg', 'frame'];
  const SLOT_ANCHOR = { hat: 'head', face: 'eyes', neck: 'neck', back: 'back', held: 'hand', bg: 'full', frame: 'full', effect: 'full' };
  const BEHIND = ['bg', 'back'];
  const FRONT = ['neck', 'face', 'hat', 'held', 'frame', 'effect'];
  const FULL = A(100, 100, 2);

  const ITEMS = ITEM_LIST.map(([id, name, slot, cost, col, variants]) => {
    const it = { id, name, slot, col, svg: c => ITEM_ART[id](tone(c, col)) };
    if (typeof cost === 'number') it.price = cost; else it.unlock = cost;
    if (variants) it.variants = variants;
    if (AVATAR_ONLY.includes(slot)) it.avatarOnly = true;
    return it;
  });

  const petById = {}; PETS.forEach(p => { petById[p.id] = p; });
  const itemById = {};
  ITEMS.forEach(it => {
    itemById[it.id] = { item: it, variant: null, col: it.col };
    (it.variants || []).forEach(vr => { itemById[vr.id] = { item: it, variant: vr, col: vr.col }; });
  });
  const pet = id => (Object.prototype.hasOwnProperty.call(petById, id) ? petById[id] : null);
  /* item(id) resolves an item or a colour variant id to { item, variant, col }. */
  const item = id => (Object.prototype.hasOwnProperty.call(itemById, id) ? itemById[id] : null);

  /* ---------- composing ---------- */
  const num = n => +(+n).toFixed(3);
  function placed(slot, art, anchor) {
    const a = anchor || FULL;
    const s = a.s > 0 ? a.s : 1;
    return `<g data-slot="${slot}" transform="translate(${num(a.x)} ${num(a.y)}) rotate(${num(a.r || 0)}) scale(${num(s)}) translate(-50 -50)" stroke-width="${num(3 / s)}" stroke-linejoin="round" stroke-linecap="round">${art}</g>`;
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* compose(baseSvg, anchors, outfit, opts) -> one <svg viewBox="0 0 200 200">.
     outfit is { slot: itemId or variantId }; unknown ids and items worn in the
     wrong slot are skipped. bg and back go behind the base, the rest in front
     (neck, face, hat, held, frame), effect last. opts: { size, title, cls }. */
  function compose(baseSvg, anchors, outfit, opts) {
    const o = opts || {};
    const an = anchors || {};
    const fit = outfit || {};
    const layer = slots => slots.map(slot => {
      const r = fit[slot] != null ? item(fit[slot]) : null;
      if (!r || r.item.slot !== slot) return '';
      return placed(slot, r.item.svg(r.col), an[SLOT_ANCHOR[slot]] || (SLOT_ANCHOR[slot] === 'full' ? FULL : null));
    }).join('');
    const size = o.size ? ` width="${num(o.size)}" height="${num(o.size)}"` : '';
    const cls = o.cls ? ` class="${esc(o.cls)}"` : '';
    const label = o.title ? ` role="img" aria-label="${esc(o.title)}"` : ' aria-hidden="true"';
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"${size}${cls}${label} style="overflow:visible">` +
      layer(BEHIND) + (baseSvg || '') + layer(FRONT) + '</svg>';
  }

  let clipN = 0;
  /* The avatar's own drawing: a colour circle (left out when a bg is worn)
     holding the emoji, or the photo clipped to the circle. */
  function avatarBase(profile, hasBg) {
    const pr = profile || {};
    const col = HEX.test(pr.col || '') ? pr.col : '#38BDF8';
    let s = hasBg ? '' : `<circle cx="100" cy="100" r="100" fill="${col}"/>`;
    if (pr.photo) {
      const id = 'shop-av-clip-' + (++clipN);
      s += `<clipPath id="${id}"><circle cx="100" cy="100" r="100"/></clipPath><image href="${esc(pr.photo)}" x="0" y="0" width="200" height="200" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
    } else {
      s += `<text x="100" y="104" text-anchor="middle" dominant-baseline="central" font-size="112">${esc(pr.emoji || '\u{1F642}')}</text>`;
    }
    return s;
  }
  function avatarSvg(profile, outfit, opts) {
    const fit = outfit || {};
    return compose(avatarBase(profile, !!fit.bg && !!item(fit.bg)), AVATAR_ANCHORS, fit, opts);
  }

  /* ---------- buying ---------- */
  const TIER_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Cyber Legend'];

  /* progress = { leagueTier: 0..6, bestStreak: int, masteredUnits: ['u1'|'u2'] } */
  function isUnlocked(it, progress) {
    if (!it || !it.unlock) return true;
    const p = progress || {};
    const u = it.unlock;
    if (u.type === 'league') return typeof p.leagueTier === 'number' && p.leagueTier >= u.value;
    if (u.type === 'streak') return typeof p.bestStreak === 'number' && p.bestStreak >= u.value;
    if (u.type === 'mastery') return Array.isArray(p.masteredUnits) && p.masteredUnits.includes(u.value);
    return false;
  }
  /* The short lock label on a shop card ("Reach Gold league"). */
  function unlockText(it) {
    if (!it || !it.unlock) return '';
    const u = it.unlock;
    if (u.type === 'league') return `Reach ${TIER_NAMES[u.value] || 'the top'} league`;
    if (u.type === 'streak') return `${u.value}-day streak`;
    if (u.type === 'mastery') return `Master all of Unit ${String(u.value).replace(/\D/g, '')}`;
    return '';
  }
  /* What an item or variant costs. */
  function priceOf(it) {
    if (!it || it.unlock) return 0;
    return typeof it.price === 'number' ? it.price : 0;
  }
  /* canBuy(itemOrVariant, wallet, owned, progress) -> { ok, reason, price }
     reason: 'ok' | 'unlocked' (a milestone item, free to claim) | 'owned' |
     'short' (not enough coins) | 'locked' (milestone not reached) | 'unknown'. */
  function canBuy(it, wallet, owned, progress) {
    if (!it || typeof it !== 'object' || !it.id) return { ok: false, reason: 'unknown', price: 0 };
    const own = owned || {};
    if (own[it.id]) return { ok: false, reason: 'owned', price: 0 };
    if (it.unlock) return isUnlocked(it, progress) ? { ok: true, reason: 'unlocked', price: 0 } : { ok: false, reason: 'locked', price: 0 };
    const price = priceOf(it);
    const coins = wallet && typeof wallet.coins === 'number' ? wallet.coins : 0;
    return coins >= price ? { ok: true, reason: 'ok', price } : { ok: false, reason: 'short', price };
  }

  /* ---------- saved state (Task 13) ----------
     The store's pets and wardrobe come from localStorage or a shared backup,
     so every id is checked against the lists above and anything else dropped. */
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const NAME_MAX = 20;

  /* A pet's name: trimmed, at most 20 characters, else the fallback. Kept as
     text; every place that shows it escapes it. */
  function cleanName(name, fallback) {
    const s = typeof name === 'string' ? Array.from(name.trim()).slice(0, NAME_MAX).join('').trim() : '';
    return s || fallback;
  }

  /* { owned: { petId: { name } }, active: petId | null }. An active pet that
     isn't owned becomes the first owned pet. Old code-drawn pets migrate
     (MIGRATE): a renamed pet keeps its name, a default name becomes the new
     pet's; if the new id is already owned it takes the next unowned pet of
     the same rarity, so no pet is lost while any is left. */
  function coercePets(raw) {
    const out = { owned: {}, active: null };
    if (!isObj(raw) || !isObj(raw.owned)) return out;
    const keys = Object.keys(raw.owned);
    let active = typeof raw.active === 'string' ? raw.active : null;
    // Current ids first, so a migrated pet never takes a slot that is really owned.
    keys.filter(id => own(petById, id)).forEach(id => {
      const rec = raw.owned[id];
      out.owned[id] = { name: cleanName(isObj(rec) ? rec.name : '', petById[id].name) };
    });
    keys.filter(id => own(MIGRATE, id)).forEach(id => {
      let to = MIGRATE[id];
      if (own(out.owned, to)) {
        const alt = PETS.find(p => p.rarity === petById[to].rarity && !own(out.owned, p.id));
        if (!alt) return;
        to = alt.id;
      }
      const rec = raw.owned[id];
      const nm = isObj(rec) ? cleanName(rec.name, '') : '';
      out.owned[to] = { name: nm && nm !== OLD_NAMES[id] ? nm : petById[to].name };
      if (active === id) active = to;
    });
    const ids = Object.keys(out.owned);
    out.active = active && own(out.owned, active) ? active : (ids[0] || null);
    return out;
  }

  /* One wearer's outfit: { slot: id }, only owned items in their own slot. */
  function coerceOutfit(raw, owned, allowAvatarOnly) {
    const out = {};
    if (!isObj(raw)) return out;
    SLOTS.forEach(slot => {
      const id = raw[slot];
      if (typeof id !== 'string' || !own(owned, id) || !own(itemById, id)) return;
      const r = itemById[id];
      if (r.item.slot !== slot) return;
      if (!allowAvatarOnly && AVATAR_ONLY.includes(slot)) return;
      out[slot] = id;
    });
    return out;
  }

  /* { owned: { itemId: true }, avatar: { slot: id }, pet: { petId: { slot: id } } }.
     pets is the coerced pets record: outfits of pets not owned are dropped. */
  function coerceWardrobe(raw, pets) {
    const out = { owned: {}, avatar: {}, pet: {} };
    if (!isObj(raw)) return out;
    if (isObj(raw.owned)) {
      Object.keys(raw.owned).forEach(id => { if (raw.owned[id] === true && own(itemById, id)) out.owned[id] = true; });
    }
    out.avatar = coerceOutfit(raw.avatar, out.owned, true);
    const petsOwned = pets && isObj(pets.owned) ? pets.owned : {};
    if (isObj(raw.pet)) {
      Object.keys(raw.pet).forEach(id => {
        if (!own(petById, id) || !own(petsOwned, id)) return;
        const fit = coerceOutfit(raw.pet[id], out.owned, false);
        if (Object.keys(fit).length) out.pet[id] = fit;
      });
    }
    return out;
  }

  /* The longest run of consecutive calendar days among 'YYYY-MM-DD' keys. */
  function longestRun(days) {
    const DAY = 86400000;
    const t = [...new Set((days || []).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)))]
      .map(d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    let best = 0, run = 0;
    t.forEach((v, i) => {
      run = i && v - t[i - 1] === DAY ? run + 1 : 1;
      if (run > best) best = run;
    });
    return best;
  }

  /* The progress the unlocks read, from the store's units: the best league
     tier reached in either unit, the best streak (saved count or a run in the
     activity history) and the units whose every path step is mastered
     (isMastered(unitId) is supplied by the app, which knows the path). */
  function buildProgress(units, isMastered) {
    const out = { leagueTier: 0, bestStreak: 0, masteredUnits: [] };
    if (!isObj(units)) return out;
    const n = v => (typeof v === 'number' && isFinite(v) ? v : 0);
    Object.keys(units).forEach(id => {
      const u = units[id];
      if (!isObj(u)) return;
      const lg = isObj(u.league) ? u.league : {};
      out.leagueTier = Math.max(out.leagueTier, n(lg.tier), n(lg.best));
      const act = isObj(u.activity) ? u.activity : {};
      const days = Object.keys(act).filter(d => n(act[d]) > 0);
      out.bestStreak = Math.max(out.bestStreak, n(isObj(u.streak) ? u.streak.count : 0), longestRun(days));
      if (typeof isMastered === 'function' && isMastered(id)) out.masteredUnits.push(id);
    });
    out.leagueTier = Math.min(out.leagueTier, TIER_NAMES.length - 1);
    return out;
  }

  const api = {
    PETS, RARITIES, EGGS, MIGRATE, ITEMS, SLOTS, AVATAR_ONLY, SLOT_ANCHOR, AVATAR_ANCHORS, TIER_NAMES, NAME_MAX,
    pet, rarity, egg, rollRarity, hatch, refundFor, eggPrice, canBuyEgg, eggHTML, mascotLine, homeLineKind,
    item, tone, compose, avatarBase, avatarSvg, isUnlocked, unlockText, priceOf, canBuy,
    cleanName, coercePets, coerceWardrobe, longestRun, buildProgress
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  return api;
})();

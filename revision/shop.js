/* ---- SHOP ----
   Eggs that hatch pets, the pet collection and mascot, and accessories for the
   avatar. The data and the pure rules (odds, hatching, prices, mascot lines)
   are in shop-data.js (SHOP); this file is the page (#shop), buying, hatching,
   wearing, renaming, and the mascot the rest of the site shows. Loaded after
   app.js and uses its globals (store, state, saveState, escapeHTML, openModal…).

   Saved state (global, coerced by SHOP.coercePets / coerceWardrobe):
     pets:     { owned: { petId: { name } }, active: petId | null }  (active = the mascot)
     wardrobe: { owned: { itemId: true }, avatar: { slot: id }, pet: {…} }
   wardrobe.pet holds outfits from when pets wore accessories; it is kept but
   no longer drawn (pets are images now). Nothing is ever taken away: the
   mascot is never sad, only sleepy until the next round. */

const SHOP_TABS = [['eggs', 'Eggs'], ['pets', 'Pets'], ['accessories', 'Accessories'], ['avatar', 'Avatar']];
const SHOP_SLOT_NAMES = { hat: 'Hats', face: 'Face', neck: 'Neck', back: 'Back', held: 'Held items', effect: 'Effects', bg: 'Backgrounds', frame: 'Frames' };
const SHOP_ACC_SLOTS = ['hat', 'face', 'neck', 'back', 'held', 'effect'];
const SHOP_AVATAR_SLOTS = ['bg', 'frame'];
const HATCH_MS = 1700;       // wobble then crack, before the pet appears

let shopTab = 'eggs';
let shopHoverId = null;      // a card being hovered or focused: previewed on the stage
let shopPickId = null;       // a card clicked: previewed until another is picked
let shopSwatch = {};         // item id -> the colour variant chosen on its card
let shopRenaming = null;     // pet id whose name is being edited
let shopBusy = false;        // a purchase in progress: further clicks do nothing
let shopBoughtId = null;     // the thing on the "is yours!" sheet, for focus after it closes
let shopHatchTimer = null;

/* ---------- state helpers ---------- */
function activePet() {
  const id = store.pets.active;
  return id && store.pets.owned[id] && SHOP.pet(id) ? id : null;
}
function petName(id) {
  const rec = store.pets.owned[id];
  const p = SHOP.pet(id);
  return rec ? rec.name : (p ? p.name : '');
}

/* Studied today in either unit. */
function studiedToday() {
  const t = today();
  return Object.values(store.units).some(u => (u.activity && u.activity[t] > 0) || (u.streak && u.streak.last === t));
}
function petMood() { return studiedToday() ? 'happy' : 'sleepy'; }
function shopReduced() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }

/* Every path step of a unit at 100%. */
function unitMastered(id) {
  const u = store.units[id];
  if (!u) return false;
  const nodes = unitPathNodes(id);
  return nodes.length > 0 && nodes.every(n => MEMORY.ringPercent(n.items.map(it => it.code), u.memory) === 100);
}
function shopProgress() { return SHOP.buildProgress(store.units, unitMastered); }

/* An item or colour variant by id, as SHOP.canBuy wants it. */
function shopThing(id) {
  const r = SHOP.item(id);
  if (!r) return null;
  return { kind: 'item', thing: r.variant || r.item, item: r.item, name: (r.variant || r.item).name, slot: r.item.slot };
}

/* ---------- pictures ---------- */
/* A pet image (the mascot, or opts.id). opts: { id, mood, title, cls }.
   Sleepy pets are dimmed. The name goes into alt, escaped. */
function petHTML(size, opts) {
  const o = opts || {};
  const id = o.id || activePet();
  const p = id && SHOP.pet(id);
  if (!p) return '';
  const mood = o.mood || petMood();
  const title = o.title === undefined ? petName(id) : o.title;
  const wh = size ? ` width="${size}" height="${size}"` : '';
  return `<img src="${p.img}"${wh} class="pet-img${mood === 'sleepy' ? ' pet-img--sleepy' : ''}${o.cls ? ' ' + o.cls : ''}" alt="${escapeHTML(title || '')}"${title ? '' : ' aria-hidden="true"'} draggable="false" decoding="async">`;
}

function rarityChipHTML(rid) {
  const r = SHOP.rarity(rid);
  return r ? `<span class="g-chip rarity-chip rarity-chip--${r.id}">${r.name}</span>` : '';
}

/* The avatar in its outfit. Under 48px only the background, frame and hat
   are drawn so it stays readable. The photo is only ever a data:image URL
   (pImg checks it). */
function avatarHTML(size, opts) {
  const o = opts || {};
  let fit = o.outfit || store.wardrobe.avatar;
  if (size && size < 48) {
    const small = {};
    ['bg', 'frame', 'hat'].forEach(k => { if (fit[k]) small[k] = fit[k]; });
    fit = small;
  }
  const photo = pImg();
  const profile = {
    emoji: firstGrapheme(String((state.profile && state.profile.emoji) || '📘')),
    col: pCol(),
    photo: photo && /^data:image\//.test(photo) ? photo : null
  };
  return SHOP.avatarSvg(profile, fit, { size, title: o.title, cls: 'av-svg' + (o.cls ? ' ' + o.cls : '') });
}

/* An item drawn on its own for a card. Each slot's anchor puts the middle of
   that slot's art (measured from the items' bounding boxes) in the middle of
   the 200 box, scaled to fill most of it. */
const SHOP_THUMB = {
  head: { x: 100, y: 143, s: 2.4, r: 0 }, eyes: { x: 100, y: 100, s: 2, r: 0 },
  neck: { x: 100, y: 90, s: 2, r: 0 }, back: { x: 100, y: 100, s: 1.3, r: 0 },
  hand: { x: 89, y: 133, s: 2.2, r: 0 }
};
function itemThumbHTML(id, slot) {
  return SHOP.compose('', SHOP_THUMB, { [slot]: id }, { cls: 'shop-thumb' });
}

/* ---------- the mascot ---------- */
/* A small number in [0,1) from a string, so a line chosen for a card stays
   the same when the round redraws. */
function mascotSeed(s) {
  let h = 2166136261;
  for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return () => ((h >>> 0) % 1000) / 1000;
}
/* The mascot with a speech bubble. kind is a SHOP.mascotLine kind; ctx fills
   it; opts: { size, cls, seed, mood, line }. Empty with no mascot. */
function mascotSayHTML(kind, ctx, opts) {
  const o = opts || {};
  const pid = activePet();
  if (!pid) return '';
  const line = o.line || SHOP.mascotLine(kind, ctx, o.seed != null ? mascotSeed(o.seed) : Math.random);
  const mood = o.mood || (kind === 'sleepy' ? 'sleepy' : 'happy');
  return `<div class="mascot mascot--${kind}${mood === 'sleepy' ? ' is-sleepy' : ''}${o.cls ? ' ' + o.cls : ''}">
      <span class="mascot-art">${petHTML(o.size || 64, { mood, title: '' })}</span>
      <span class="mascot-bubble"><span class="sr-only">${escapeHTML(petName(pid))} says: </span>${escapeHTML(line)}</span>
    </div>`;
}

/* ---------- actions ---------- */
function shopChanged() {
  saveState();
  if (typeof updateNavAvatar === 'function') updateNavAvatar();
  renderRightRail();
  if (currentPage === 'shop') renderShop();
}

/* Buys (or claims, for a reached milestone) an item or colour variant.
   Checks again every time, so a second call for the same id charges nothing. */
function buyItem(id) {
  const t = shopThing(id);
  if (!t) return { ok: false, reason: 'unknown', price: 0 };
  const chk = SHOP.canBuy(t.thing, store.wallet, store.wardrobe.owned, shopProgress());
  if (!chk.ok) return chk;
  if (chk.price > 0) {
    const w = COINS.spend(store.wallet, chk.price);
    if (!w) return { ok: false, reason: 'short', price: chk.price };
    store.wallet = w;
  }
  store.wardrobe.owned[id] = true;
  shopChanged();
  return chk;
}

/* Buys an egg and hatches it. rand is injectable for testing. A new pet joins
   the collection (and becomes the mascot if there is none); a duplicate pays
   back 40% of the egg price. Returns { ok, reason, price, hatch }. */
function buyEgg(eggId, rand) {
  const e = SHOP.egg(eggId);
  const chk = SHOP.canBuyEgg(e, store.wallet, store.pets.owned);
  if (!chk.ok) return chk;
  if (chk.price > 0) {
    const w = COINS.spend(store.wallet, chk.price);
    if (!w) return { ok: false, reason: 'short', price: chk.price };
    store.wallet = w;
  }
  const h = SHOP.hatch(eggId, store.pets.owned, rand || Math.random);
  if (h.duplicate) {
    // A free egg can't be a duplicate (it needs no pets), but never refund more than was paid.
    store.wallet = COINS.earn(store.wallet, Math.min(h.refund, chk.price));
  } else {
    store.pets.owned[h.pet] = { name: SHOP.pet(h.pet).name };
    if (!activePet()) store.pets.active = h.pet;
  }
  shopChanged();
  return Object.assign({}, chk, { hatch: h });
}

/* Put an owned item on the avatar, or take a slot off (id null). */
function wear(target, slot, id) {
  if (target !== 'avatar' || !SHOP.SLOTS.includes(slot)) return false;
  if (id != null) {
    const r = SHOP.item(id);
    if (!r || r.item.slot !== slot || !store.wardrobe.owned[id]) return false;
  }
  const fit = store.wardrobe.avatar;
  const was = fit[slot];
  if (id == null) delete fit[slot]; else fit[slot] = id;
  shopChanged();
  if (currentPage === 'shop') shopRefocus(id || was);
  return true;
}

/* Make an owned pet the mascot. */
function setActivePet(id) {
  if (!store.pets.owned[id] || !SHOP.pet(id)) return false;
  store.pets.active = id;
  shopChanged();
  return true;
}

function renamePet(id, name) {
  const p = SHOP.pet(id);
  if (!store.pets.owned[id] || !p) return false;
  store.pets.owned[id].name = SHOP.cleanName(name, p.name);
  shopRenaming = null;
  shopChanged();
  return true;
}

/* ---------- the page ---------- */
function shopSetTab(tab) {
  if (!SHOP_TABS.some(t => t[0] === tab)) return;
  shopTab = tab;
  shopHoverId = shopPickId = null;
  renderShop();
  const b = el('shop-tab-' + tab);
  if (b) b.focus();
}

/* Hover and focus preview on the stage only, so the grid isn't redrawn. */
function shopHover(id) {
  shopHoverId = id;
  shopDrawStage();
}
function shopPick(id) {
  shopPickId = shopPickId === id ? null : id;
  shopHoverId = null;
  renderShop();
  shopRefocus(id);
}
function shopPickSwatch(itemId, vid) {
  shopSwatch[itemId] = vid;
  shopPickId = vid;
  renderShop();
  const b = document.querySelector(`.shop-swatch[onclick*="'${vid}'"]`);
  if (b) b.focus();
}
/* A redraw replaces the grid; put focus back on the card that was used,
   failing that the open tab. */
function shopRefocus(id) {
  const r = SHOP.item(id);
  const b = el('shop-art-' + (r ? r.item.id : id)) || el('shop-own-' + id) || el('shop-tab-' + shopTab);
  if (b) b.focus({ preventScroll: true });
}

/* What the stage shows: the avatar in its outfit, with whatever item is
   hovered or picked tried on, beside the mascot. */
function shopStageHTML() {
  const pid = activePet();
  const look = shopHoverId || shopPickId;
  const t = look ? shopThing(look) : null;
  const avFit = Object.assign({}, store.wardrobe.avatar);
  let caption = '';
  if (t) {
    avFit[t.slot] = look;
    caption = `Trying on ${t.name}`;
  }
  return `
    <div class="shop-figs">
      <figure class="shop-fig${shopTab === 'accessories' || shopTab === 'avatar' ? ' is-target' : ''}">
        <div class="shop-fig-art shop-fig-art--av">${avatarHTML(132, { outfit: avFit, title: 'Your avatar' })}</div>
        <figcaption>You</figcaption>
      </figure>
      ${pid ? `
      <figure class="shop-fig">
        <div class="shop-fig-art shop-fig-art--pet">${petHTML(150, { mood: 'happy' })}</div>
        <figcaption>${escapeHTML(petName(pid))} ${rarityChipHTML(SHOP.pet(pid).rarity)}</figcaption>
      </figure>` : ''}
    </div>
    <p class="shop-caption" aria-live="polite">${caption ? escapeHTML(caption) : '&nbsp;'}</p>`;
}
function shopDrawStage() {
  const s = el('shop-stage');
  if (s) s.innerHTML = shopStageHTML();
}

function shopPriceChip(price) {
  return price > 0
    ? `<span class="g-chip g-chip--coin"><span aria-hidden="true">🪙</span> ${price.toLocaleString('en-GB')}</span>`
    : '<span class="g-chip g-chip--xp">Free</span>';
}

/* Buy button (or the reason it can't be bought) for an item, variant or egg. */
function shopBuyHTML(id, chk, name, fn) {
  const call = fn || 'shopAskBuy';
  if (chk.reason === 'locked') return '';
  if (chk.reason === 'unlocked') return `<button class="g-btn shop-buy" onclick="${call}('${id}')" aria-label="Claim ${escapeHTML(name)}">Claim</button>`;
  if (chk.reason === 'short') {
    const need = chk.price - store.wallet.coins;
    return `<button class="g-btn shop-buy" disabled aria-label="${escapeHTML(name)}: ${need} more coins needed">Need ${need.toLocaleString('en-GB')} more</button>`;
  }
  return `<button class="g-btn shop-buy" onclick="${call}('${id}')" aria-label="${chk.price ? `Buy ${escapeHTML(name)} for ${chk.price} coins` : `Open your free ${escapeHTML(name)}`}">${chk.price ? 'Buy' : 'Open'}</button>`;
}

/* Eggs: price, odds and a Buy button each. */
function shopEggsHTML() {
  const first = !Object.keys(store.pets.owned).length;
  const cards = SHOP.EGGS.map(e => {
    const chk = SHOP.canBuyEgg(e, store.wallet, store.pets.owned);
    const odds = e.odds.map(([r, p]) => `<li>${rarityChipHTML(r)} <span>${Math.round(p * 100)}%</span></li>`).join('');
    return `
      <div class="g-card shop-card egg-card egg-card--${e.id}">
        <div class="shop-card-art egg-art">${SHOP.eggHTML(e.id)}</div>
        <div class="shop-card-name">${escapeHTML(e.name)}</div>
        <ul class="egg-odds" aria-label="Hatch chances">${odds}</ul>
        <div class="shop-card-row">${shopPriceChip(chk.price)}${shopBuyHTML(e.id, chk, e.name, 'shopAskEgg')}</div>
      </div>`;
  }).join('');
  return `
    <p class="shop-sub">${first ? 'Your first Common egg is free. ' : ''}Every pet hatches from an egg. Hatch one you already have and you get 40% of the egg's price back.</p>
    <div class="shop-grid">${cards}</div>`;
}

/* Pets: your collection (make one the mascot, rename), then the ones still to find. */
function shopPetsHTML() {
  const owned = store.pets.owned;
  const pid = activePet();
  const mine = SHOP.PETS.filter(p => owned[p.id]);
  if (!mine.length) {
    return `<p class="shop-sub">No pets yet. <button class="shop-link" onclick="shopSetTab('eggs')">Open your free egg</button> to hatch your first.</p>`;
  }
  const ownedCards = mine.map(p => {
    const id = p.id;
    const name = petName(id);
    const editing = shopRenaming === id;
    return `
      <div class="g-card shop-card${id === pid ? ' is-worn' : ''}">
        <div class="shop-card-art">${petHTML(null, { id, mood: 'happy', title: '' })}</div>
        ${editing ? `
          <form class="shop-rename" onsubmit="event.preventDefault();renamePet('${id}', el('shop-rename-input').value)">
            <label class="sr-only" for="shop-rename-input">New name for ${escapeHTML(name)}</label>
            <input id="shop-rename-input" class="shop-rename-input" maxlength="${SHOP.NAME_MAX}" value="${escapeHTML(name)}" autocomplete="off" onkeydown="if(event.key==='Escape'){event.stopPropagation();shopRenaming=null;renderShop();}">
            <div class="shop-card-row"><button class="g-btn shop-buy" type="submit">Save</button><button class="g-pill shop-buy" type="button" onclick="shopRenaming=null;renderShop()">Cancel</button></div>
          </form>` : `
          <div class="shop-card-name">${escapeHTML(name)}</div>
          <div class="shop-card-kind">${escapeHTML(p.name)} ${rarityChipHTML(p.rarity)}</div>
          <div class="shop-card-row">
            ${id === pid ? '<span class="g-chip g-chip--xp">Mascot</span>' : `<button class="g-btn shop-buy" onclick="setActivePet('${id}')" aria-label="Make ${escapeHTML(name)} your mascot">Make mascot</button>`}
            <button class="g-pill shop-buy" id="shop-own-${id}" onclick="shopRenaming='${id}';renderShop();setTimeout(()=>{const i=el('shop-rename-input');if(i){i.focus();i.select();}})" aria-label="Rename ${escapeHTML(name)}">Rename</button>
          </div>`}
      </div>`;
  }).join('');
  const left = SHOP.PETS.filter(p => !owned[p.id]);
  const unknown = left.map(p => `
      <div class="g-card shop-card is-unknown">
        <div class="shop-card-art"><img src="${p.img}" class="pet-img pet-img--unknown" alt="" aria-hidden="true" draggable="false" decoding="async"></div>
        <div class="shop-card-name">???</div>
        <div class="shop-card-kind">${rarityChipHTML(p.rarity)}</div>
      </div>`).join('');
  return `
    <h3 class="shop-h">Your pets <span class="shop-count">${mine.length} of ${SHOP.PETS.length}</span></h3>
    <div class="shop-grid">${ownedCards}</div>
    ${left.length ? `<h3 class="shop-h">Still to hatch</h3><div class="shop-grid">${unknown}</div>` : ''}`;
}

/* One accessory card: art, colour swatches, then price/Buy, Owned/Wear or how to unlock. */
function shopItemCardHTML(it, prog) {
  const ids = [it.id].concat((it.variants || []).map(v => v.id));
  const id = ids.includes(shopSwatch[it.id]) ? shopSwatch[it.id] : it.id;
  const r = SHOP.item(id);
  const thing = r.variant || it;
  const owned = !!store.wardrobe.owned[id];
  const worn = store.wardrobe.avatar[it.slot] === id;
  const chk = SHOP.canBuy(thing, store.wallet, store.wardrobe.owned, prog);
  let row;
  if (owned) {
    row = worn
      ? `<span class="g-chip g-chip--xp">Wearing</span><button class="g-pill shop-buy" onclick="wear('avatar','${it.slot}',null)" aria-label="Take ${escapeHTML(thing.name)} off your avatar">Take off</button>`
      : `<span class="g-chip">Owned</span><button class="g-btn shop-buy" onclick="wear('avatar','${it.slot}','${id}')">Wear</button>`;
  } else if (chk.reason === 'locked') {
    row = `<span class="shop-lock">${escapeHTML(SHOP.unlockText(it))}</span>`;
  } else {
    row = (chk.reason === 'unlocked' ? '<span class="g-chip g-chip--xp">Unlocked</span>' : shopPriceChip(chk.price)) + shopBuyHTML(id, chk, thing.name);
  }
  const swatches = ids.length > 1 ? `
      <div class="shop-swatches" role="group" aria-label="Colours">
        ${ids.map(vid => {
          const vr = SHOP.item(vid);
          const nm = (vr.variant || it).name;
          return `<button class="shop-swatch${vid === id ? ' on' : ''}" style="--sw:${vr.col}" onclick="shopPickSwatch('${it.id}','${vid}')" aria-label="${escapeHTML(nm)}${store.wardrobe.owned[vid] ? ', owned' : ''}" aria-pressed="${vid === id}"></button>`;
        }).join('')}
      </div>` : '';
  return `
    <div class="g-card shop-card${owned ? ' is-owned' : ''}${worn ? ' is-worn' : ''}${chk.reason === 'locked' ? ' is-locked' : ''}${shopPickId === id ? ' is-picked' : ''}" onmouseenter="shopHover('${id}')" onmouseleave="shopHover(null)">
      <button class="shop-card-art" id="shop-art-${it.id}" onclick="shopPick('${id}')" onfocus="shopHover('${id}')" onblur="shopHover(null)" aria-label="Try on ${escapeHTML(thing.name)}" aria-pressed="${shopPickId === id}">${itemThumbHTML(id, it.slot)}</button>
      <div class="shop-card-name">${escapeHTML(thing.name)}</div>
      ${swatches}
      <div class="shop-card-row">${row}</div>
    </div>`;
}

function shopItemsHTML(slots) {
  const prog = shopProgress();
  return slots.map(slot => {
    const items = SHOP.ITEMS.filter(it => it.slot === slot);
    // For sale first, then milestone unlocks.
    items.sort((a, b) => (a.unlock ? 1 : 0) - (b.unlock ? 1 : 0));
    return `
      <h3 class="shop-h">${SHOP_SLOT_NAMES[slot]}</h3>
      <div class="shop-grid">${items.map(it => shopItemCardHTML(it, prog)).join('')}</div>`;
  }).join('');
}

function renderShop() {
  const box = el('shop-content');
  if (!box) return;
  const coins = store.wallet.coins;
  let panel;
  if (shopTab === 'eggs') panel = shopEggsHTML();
  else if (shopTab === 'pets') panel = shopPetsHTML();
  else if (shopTab === 'accessories') panel = '<p class="shop-sub">Accessories are for your avatar.</p>' + shopItemsHTML(SHOP_ACC_SLOTS);
  else panel = `<p class="shop-sub">Backgrounds and frames are for your avatar. Change your emoji, photo or colour on <button class="shop-link" onclick="navigate('profile')">your profile</button>.</p>` + shopItemsHTML(SHOP_AVATAR_SLOTS);
  box.innerHTML = `
    <div class="shop">
      <header class="shop-head">
        <h2 class="g-display shop-title">Shop</h2>
        <span class="g-chip g-chip--coin shop-balance"><span aria-hidden="true">🪙</span> <b id="shop-coins">${coins.toLocaleString('en-GB')}</b> coin${coins === 1 ? '' : 's'}</span>
      </header>
      <section class="g-card shop-stage" id="shop-stage" aria-label="Preview">${shopStageHTML()}</section>
      <div class="g-tabs shop-tabs" role="tablist" aria-label="Shop">
        ${SHOP_TABS.map(([k, label]) => `<button class="g-tab${shopTab === k ? ' active' : ''}" role="tab" id="shop-tab-${k}" aria-selected="${shopTab === k}" aria-controls="shop-panel" tabindex="${shopTab === k ? 0 : -1}" onclick="shopSetTab('${k}')" onkeydown="shopTabKey(event)">${label}</button>`).join('')}
      </div>
      <div class="shop-panel" id="shop-panel" role="tabpanel" aria-labelledby="shop-tab-${shopTab}">${panel}</div>
    </div>`;
}

function shopTabKey(e) {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  e.preventDefault();
  const i = SHOP_TABS.findIndex(t => t[0] === shopTab);
  const n = SHOP_TABS.length;
  shopSetTab(SHOP_TABS[(i + (e.key === 'ArrowRight' ? 1 : n - 1)) % n][0]);
}

/* ---------- the buy sheet (accessories) ---------- */
function shopAskBuy(id) {
  const t = shopThing(id);
  if (!t || shopBusy) return;
  const chk = SHOP.canBuy(t.thing, store.wallet, store.wardrobe.owned, shopProgress());
  if (!chk.ok) { renderShop(); return; }
  const name = escapeHTML(t.name);
  const title = chk.reason === 'unlocked' ? `Claim ${name}?`
    : chk.price > 0 ? `Buy ${name} for ${chk.price.toLocaleString('en-GB')} coins?` : `Get ${name} for free?`;
  const after = store.wallet.coins - chk.price;
  const sub = chk.price > 0
    ? `You have ${store.wallet.coins.toLocaleString('en-GB')} coins. You'll have ${after.toLocaleString('en-GB')} left.`
    : chk.reason === 'unlocked' ? 'You reached the milestone, so it is free.' : 'This one is free.';
  const label = chk.reason === 'unlocked' ? 'Claim' : chk.price > 0 ? `Buy for 🪙 ${chk.price.toLocaleString('en-GB')}` : 'Get it';
  openModal(`
    <div class="shop-sheet">
      <div class="shop-sheet-art">${itemThumbHTML(id, t.slot)}</div>
      <h2 id="modal-title" class="shop-sheet-title">${title}</h2>
      <p class="shop-sheet-sub">${sub}</p>
      <div class="shop-sheet-actions">
        <button class="g-btn" id="shop-buy-btn" onclick="shopConfirmBuy('${id}')">${label}</button>
        <button class="g-pill" onclick="closeModal()">Cancel</button>
      </div>
    </div>`);
}

/* The sheet's Buy. Disabled on the first click and guarded, so a double click
   charges once; buyItem itself also refuses anything already owned. */
function shopConfirmBuy(id) {
  if (shopBusy) return;
  shopBusy = true;
  const btn = el('shop-buy-btn');
  if (btn) btn.disabled = true;
  const r = buyItem(id);
  if (!r.ok) {
    shopBusy = false;
    closeModal();
    toast(r.reason === 'short' ? 'Not enough coins for that yet.' : r.reason === 'owned' ? 'You already have that.' : 'That can’t be bought right now.', 2500, 'error');
    return;
  }
  shopShowBought(id);
  // Swallow the second click of a double click on whatever button replaced Buy.
  setTimeout(() => { shopBusy = false; }, 400);
}

function shopShowBought(id) {
  shopBoughtId = id;
  const t = shopThing(id);
  const box = el('player-modal');
  if (!box) return;
  box.innerHTML = `
    <div class="shop-sheet">
      <div class="shop-sheet-art">${itemThumbHTML(id, t.slot)}</div>
      <h2 id="modal-title" class="shop-sheet-title">${escapeHTML(t.name)} is yours!</h2>
      <p class="shop-sheet-sub">${store.wallet.coins.toLocaleString('en-GB')} coin${store.wallet.coins === 1 ? '' : 's'} left.</p>
      <div class="shop-sheet-actions">
        <button class="g-btn" onclick="shopAfter(()=>wear('avatar','${t.slot}','${id}'))">Wear it</button>
        <button class="g-pill" id="shop-done-btn" onclick="shopAfter(null)">Done</button>
      </div>
    </div>`;
  const first = box.querySelector('.shop-sheet-actions button');
  if (first) first.focus();
}

/* The sheet's buttons. The grid was redrawn by the purchase, so the Buy button
   focus would go back to is gone: focus the card that was bought instead. */
function shopAfter(fn) {
  if (shopBusy) return;
  closeModal();
  if (fn) fn();
  if (currentPage === 'shop' && shopBoughtId) shopRefocus(shopBoughtId);
  shopBoughtId = null;
}

/* ---------- eggs and hatching ---------- */
function shopAskEgg(eggId) {
  const e = SHOP.egg(eggId);
  if (!e || shopBusy) return;
  const chk = SHOP.canBuyEgg(e, store.wallet, store.pets.owned);
  if (!chk.ok) { renderShop(); return; }
  const name = escapeHTML(e.name);
  const after = store.wallet.coins - chk.price;
  openModal(`
    <div class="shop-sheet">
      <div class="shop-sheet-art egg-art">${SHOP.eggHTML(e.id)}</div>
      <h2 id="modal-title" class="shop-sheet-title">${chk.price ? `Buy ${/^[aeiou]/i.test(e.name) ? 'an' : 'a'} ${name} for ${chk.price.toLocaleString('en-GB')} coins?` : `Open your free ${name}?`}</h2>
      <p class="shop-sheet-sub">${chk.price ? `You have ${store.wallet.coins.toLocaleString('en-GB')} coins. You'll have ${after.toLocaleString('en-GB')} left.` : 'Your first egg is on us.'}</p>
      <div class="shop-sheet-actions">
        <button class="g-btn" id="shop-buy-btn" onclick="shopHatch('${e.id}')">${chk.price ? `Buy and hatch` : 'Hatch it'}</button>
        <button class="g-pill" onclick="closeModal()">Cancel</button>
      </div>
    </div>`);
}

/* Buys and hatches, then plays the hatch: the egg wobbles, cracks, and the pet
   appears with its rarity. Reduced motion skips straight to the pet. */
function shopHatch(eggId) {
  if (shopBusy) return;
  shopBusy = true;
  const btn = el('shop-buy-btn');
  if (btn) btn.disabled = true;
  const r = buyEgg(eggId);
  if (!r.ok) {
    shopBusy = false;
    closeModal();
    toast(r.reason === 'short' ? 'Not enough coins for that egg yet.' : 'That egg can’t be bought right now.', 2500, 'error');
    return;
  }
  const box = el('player-modal');
  if (!box) { shopBusy = false; return; }
  clearTimeout(shopHatchTimer);
  if (shopReduced()) { shopShowHatched(r.hatch); return; }
  box.innerHTML = `
    <div class="shop-sheet hatch">
      <div class="hatch-stage" aria-hidden="true"><span class="hatch-egg">${SHOP.eggHTML(eggId)}</span></div>
      <h2 id="modal-title" class="shop-sheet-title">Hatching…</h2>
      <p class="shop-sheet-sub" role="status">Something is wriggling.</p>
    </div>`;
  shopHatchTimer = setTimeout(() => shopShowHatched(r.hatch), HATCH_MS);
}

function shopShowHatched(h) {
  const box = el('player-modal');
  shopBusy = false;
  if (!box || !el('player-modal-overlay').classList.contains('show')) return;
  const p = SHOP.pet(h.pet);
  const r = SHOP.rarity(h.rarity);
  const isMascot = activePet() === h.pet;
  const title = h.duplicate ? `Another ${escapeHTML(p.name)}!` : `You hatched ${/^[aeiou]/i.test(p.name) ? 'an' : 'a'} ${escapeHTML(p.name)}!`;
  const sub = h.duplicate
    ? `You already have one, so you get <b>🪙 ${h.refund}</b> back. ${store.wallet.coins.toLocaleString('en-GB')} coins now.`
    : isMascot ? `${escapeHTML(p.name)} is now your mascot.` : `${escapeHTML(p.name)} joins your pets.`;
  const egg = SHOP.egg(h.egg);
  const again = SHOP.canBuyEgg(egg, store.wallet, store.pets.owned);
  box.innerHTML = `
    <div class="shop-sheet hatch is-done">
      <div class="hatch-stage hatch-stage--${r.id}">
        <span class="hatch-shell hatch-shell--l" aria-hidden="true">${SHOP.eggHTML(h.egg)}</span>
        <span class="hatch-shell hatch-shell--r" aria-hidden="true">${SHOP.eggHTML(h.egg)}</span>
        <span class="hatch-pet">${petHTML(150, { id: h.pet, mood: 'happy', title: p.name })}</span>
      </div>
      ${rarityChipHTML(r.id)}
      <h2 id="modal-title" class="shop-sheet-title">${title}</h2>
      <p class="shop-sheet-sub" role="status">${sub}</p>
      <div class="shop-sheet-actions">
        ${!h.duplicate && !isMascot ? `<button class="g-btn" onclick="setActivePet('${h.pet}');shopShowHatchedEquipped('${h.pet}')">Equip as mascot</button>` : ''}
        <button class="g-pill" onclick="${again.ok ? `shopAskEgg('${h.egg}')` : 'closeModal()'}" ${again.ok ? '' : 'disabled'}>${again.ok ? 'Hatch another' : `Need ${(again.price - store.wallet.coins).toLocaleString('en-GB')} more`}</button>
        <button class="g-pill" id="shop-done-btn" onclick="closeModal()">Done</button>
      </div>
    </div>`;
  const first = box.querySelector('.shop-sheet-actions button:not(:disabled)');
  if (first) first.focus();
}
function shopShowHatchedEquipped(id) {
  const btn = document.querySelector('.hatch .shop-sheet-actions .g-btn');
  if (btn) btn.outerHTML = '<span class="g-chip g-chip--xp">Mascot</span>';
  const sub = document.querySelector('.hatch .shop-sheet-sub');
  if (sub) sub.textContent = `${petName(id)} is now your mascot.`;
  const d = el('shop-done-btn');
  if (d) d.focus();
}

/* ---------- Home ---------- */
/* The mascot with a greeting from real state, or the free egg. */
function homePetHTML() {
  const pid = activePet();
  if (!pid) {
    return `
      <section class="g-card home-pet" aria-labelledby="home-pet-title">
        <div class="home-pet-art home-pet-art--egg" aria-hidden="true">${SHOP.eggHTML('common')}</div>
        <div class="home-pet-text">
          <h3 id="home-pet-title">Your first egg is free</h3>
          <p>Hatch a pet to be your mascot. It cheers you on in rounds.</p>
        </div>
        <button class="g-pill" onclick="shopTab='eggs';navigate('shop')">Hatch it</button>
      </section>`;
  }
  const studied = studiedToday();
  const due = typeof forgottenToday === 'function' ? forgottenToday() : 0;
  const streak = typeof currentStreak === 'function' ? currentStreak() : 0;
  const unit = typeof unitDef === 'function' ? unitDef().name : '';
  const kind = SHOP.homeLineKind({ studied, due, streak, unit });
  const name = escapeHTML(petName(pid));
  // Same line all day for the same state, so re-rendering Home doesn't flicker.
  const seed = [today(), kind, due, streak].join('|');
  return `
    <section class="g-card home-pet home-mascot${studied ? '' : ' is-sleepy'}" aria-labelledby="home-pet-title">
      ${mascotSayHTML(kind, { due, streak, unit }, { size: 112, seed, cls: 'mascot--home' })}
      <div class="home-pet-text">
        <h3 id="home-pet-title" class="sr-only">${name}</h3>
      </div>
      <button class="g-pill" onclick="navigate('shop')"><span aria-hidden="true">🛍️</span> Shop</button>
    </section>`;
}

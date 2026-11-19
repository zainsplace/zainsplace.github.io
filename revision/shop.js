/* ---- SHOP (Task 13) ----
   Pets and accessories bought with coins, worn by the avatar and by any owned
   pet. The art and the price rules are in shop-data.js (SHOP); this file is
   the page (#shop), buying, wearing, renaming, and the small pet and avatar
   pictures the rest of the site shows. Loaded after app.js and uses its
   globals (store, state, saveState, escapeHTML, openModal, navigate…).

   Saved state (global, coerced by SHOP.coercePets / coerceWardrobe):
     pets:     { owned: { petId: { name } }, active: petId | null }
     wardrobe: { owned: { itemId: true }, avatar: { slot: id }, pet: { petId: { slot: id } } }
   Nothing is ever taken away: pets never get sad or hungry, and not studying
   only makes the active pet sleepy until the next round. */

const SHOP_TABS = [['pets', 'Pets'], ['accessories', 'Accessories'], ['avatar', 'Avatar']];
const SHOP_KINDS = [['everyday', 'Everyday'], ['tech', 'Tech'], ['mythical', 'Mythical']];
const SHOP_SLOT_NAMES = { hat: 'Hats', face: 'Face', neck: 'Neck', back: 'Back', held: 'Held items', effect: 'Effects', bg: 'Backgrounds', frame: 'Frames' };
const SHOP_ACC_SLOTS = ['hat', 'face', 'neck', 'back', 'held', 'effect'];
const SHOP_AVATAR_SLOTS = ['bg', 'frame'];

let shopTab = 'pets';
let shopTarget = 'avatar';   // who the Accessories tab dresses: 'avatar' or the active pet
let shopHoverId = null;      // a card being hovered or focused: previewed on the stage
let shopPickId = null;       // a card clicked: previewed until another is picked
let shopSwatch = {};         // item id -> the colour variant chosen on its card
let shopRenaming = null;     // pet id whose name is being edited
let shopBusy = false;        // a purchase in progress: further clicks do nothing

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
function petOutfit(id) { return store.wardrobe.pet[id] || {}; }

/* Studied today in either unit. */
function studiedToday() {
  const t = today();
  return Object.values(store.units).some(u => (u.activity && u.activity[t] > 0) || (u.streak && u.streak.last === t));
}
function petMood() { return studiedToday() ? 'happy' : 'sleepy'; }

/* Every path step of a unit at 100%. */
function unitMastered(id) {
  const u = store.units[id];
  if (!u) return false;
  const nodes = unitPathNodes(id);
  return nodes.length > 0 && nodes.every(n => MEMORY.ringPercent(n.items.map(it => it.code), u.memory) === 100);
}
function shopProgress() { return SHOP.buildProgress(store.units, unitMastered); }

/* A pet, item or colour variant by id, as SHOP.canBuy wants it. */
function shopThing(id) {
  const p = SHOP.pet(id);
  if (p) return { kind: 'pet', thing: p, name: p.name };
  const r = SHOP.item(id);
  if (!r) return null;
  return { kind: 'item', thing: r.variant || r.item, item: r.item, name: (r.variant || r.item).name, slot: r.item.slot };
}

function unlockLabel(it) {
  const u = it && it.unlock;
  if (!u) return '';
  if (u.type === 'league') return `Reach ${SHOP.TIER_NAMES[u.value] || 'the top'} league`;
  if (u.type === 'streak') return `${u.value}-day streak`;
  if (u.type === 'mastery') return `Master all of Unit ${String(u.value).replace(/\D/g, '')}`;
  return '';
}

/* ---------- pictures ---------- */
/* The active pet (or opts.id) in its outfit. opts: { id, mood, outfit, title, cls }.
   The name goes into aria-label, escaped by SHOP.compose. */
function petHTML(size, opts) {
  const o = opts || {};
  const id = o.id || activePet();
  if (!id || !SHOP.pet(id)) return '';
  return SHOP.petSvg(id, o.outfit || petOutfit(id), {
    size, mood: o.mood || petMood(),
    title: o.title === undefined ? petName(id) : o.title,
    cls: 'pet-svg' + (o.cls ? ' ' + o.cls : '')
  });
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

/* ---------- actions ---------- */
function shopChanged() {
  saveState();
  if (typeof updateNavAvatar === 'function') updateNavAvatar();
  renderRightRail();
  if (currentPage === 'shop') renderShop();
}

/* Buys (or claims, for a reached milestone) a pet, item or colour variant.
   Checks again every time, so a second call for the same id charges nothing. */
function buyItem(id) {
  const t = shopThing(id);
  if (!t) return { ok: false, reason: 'unknown', price: 0 };
  const owned = t.kind === 'pet' ? store.pets.owned : store.wardrobe.owned;
  const chk = SHOP.canBuy(t.thing, store.wallet, owned, shopProgress());
  if (!chk.ok) return chk;
  if (chk.price > 0) {
    const w = COINS.spend(store.wallet, chk.price);
    if (!w) return { ok: false, reason: 'short', price: chk.price };
    store.wallet = w;
  }
  if (t.kind === 'pet') {
    store.pets.owned[id] = { name: t.thing.name };
    if (!activePet()) store.pets.active = id;
  } else {
    store.wardrobe.owned[id] = true;
  }
  shopChanged();
  return chk;
}

/* Put an owned item on a wearer, or take a slot off (id null).
   target: 'avatar' or an owned pet id. Backgrounds and frames are avatar only. */
function wear(target, slot, id) {
  if (!SHOP.SLOTS.includes(slot)) return false;
  const isAvatar = target === 'avatar';
  if (!isAvatar && !(store.pets.owned[target] && SHOP.pet(target))) return false;
  if (!isAvatar && SHOP.AVATAR_ONLY.includes(slot)) return false;
  if (id != null) {
    const r = SHOP.item(id);
    if (!r || r.item.slot !== slot || !store.wardrobe.owned[id]) return false;
  }
  let fit;
  if (isAvatar) fit = store.wardrobe.avatar;
  else fit = store.wardrobe.pet[target] || (store.wardrobe.pet[target] = {});
  const was = fit[slot];
  if (id == null) delete fit[slot]; else fit[slot] = id;
  if (!isAvatar && !Object.keys(fit).length) delete store.wardrobe.pet[target];
  shopChanged();
  if (currentPage === 'shop') shopRefocus(id || was);
  return true;
}

function setActivePet(id) {
  if (!store.pets.owned[id] || !SHOP.pet(id)) return false;
  store.pets.active = id;
  if (shopTarget !== 'avatar') shopTarget = id;
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

function shopSetTarget(t) {
  shopTarget = t === 'avatar' ? 'avatar' : (activePet() || 'avatar');
  renderShop();
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
/* A redraw replaces the grid; put focus back on the card that was used. */
function shopRefocus(id) {
  const r = SHOP.item(id);
  const b = el('shop-art-' + (r ? r.item.id : id));
  if (b) b.focus({ preventScroll: true });
}

/* What the stage shows: the avatar and the active pet in their outfits, with
   whatever is hovered or picked tried on (or, in Pets, the pet being looked at). */
function shopStageHTML() {
  const pid = activePet();
  const look = shopHoverId || shopPickId;
  const t = look ? shopThing(look) : null;
  let avFit = Object.assign({}, store.wardrobe.avatar);
  let petId = pid, petFit = pid ? Object.assign({}, petOutfit(pid)) : {};
  let caption = '';
  if (t && t.kind === 'pet') {
    petId = look; petFit = {};
    caption = `Looking at the ${t.name}`;
  } else if (t && t.kind === 'item') {
    const onAvatar = t.item.avatarOnly || shopTab === 'avatar' || shopTarget === 'avatar' || !pid;
    if (onAvatar) avFit[t.slot] = look; else petFit[t.slot] = look;
    caption = `Trying on ${t.name}${onAvatar ? '' : ` on ${petName(pid)}`}`;
  }
  const avTarget = shopTab !== 'pets' && (shopTab === 'avatar' || shopTarget === 'avatar' || !pid);
  const petTarget = shopTab === 'accessories' && !avTarget;
  const petLabel = petId ? (petId === pid ? petName(pid) : SHOP.pet(petId).name) : '';
  return `
    <div class="shop-figs">
      <figure class="shop-fig${avTarget ? ' is-target' : ''}">
        <div class="shop-fig-art shop-fig-art--av">${avatarHTML(132, { outfit: avFit, title: 'Your avatar' })}</div>
        <figcaption>You</figcaption>
      </figure>
      ${petId ? `
      <figure class="shop-fig${petTarget ? ' is-target' : ''}">
        <div class="shop-fig-art">${petHTML(150, { id: petId, outfit: petFit, mood: 'happy', title: petLabel })}</div>
        <figcaption>${escapeHTML(petLabel)}</figcaption>
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

/* Buy button (or the reason it can't be bought) for a pet, item or variant. */
function shopBuyHTML(id, chk, name) {
  if (chk.reason === 'locked') return '';
  if (chk.reason === 'unlocked') return `<button class="g-btn shop-buy" onclick="shopAskBuy('${id}')" aria-label="Claim ${escapeHTML(name)}">Claim</button>`;
  if (chk.reason === 'short') {
    const need = chk.price - store.wallet.coins;
    return `<button class="g-btn shop-buy" disabled aria-label="${escapeHTML(name)}: ${need} more coins needed">Need ${need.toLocaleString('en-GB')} more</button>`;
  }
  return `<button class="g-btn shop-buy" onclick="shopAskBuy('${id}')" aria-label="Buy ${escapeHTML(name)} for ${chk.price} coins">Buy</button>`;
}

function shopStarterHTML() {
  const starters = SHOP.PETS.filter(p => p.starter);
  return `
    <section class="shop-starter" aria-labelledby="shop-starter-title">
      <h3 class="shop-h" id="shop-starter-title">Pick your first pet</h3>
      <p class="shop-sub">One of these is free. Your pet cheers you on in rounds, and you can dress it up with anything from the shop.</p>
      <div class="shop-grid">
        ${starters.map(p => `
          <div class="g-card shop-card">
            <div class="shop-card-art">${SHOP.petSvg(p.id, {}, { mood: 'happy', cls: 'pet-svg' })}</div>
            <div class="shop-card-name">${escapeHTML(p.name)}</div>
            <div class="shop-card-row">${shopPriceChip(0)}
              <button class="g-btn shop-buy" onclick="shopAskBuy('${p.id}')">Pick</button></div>
          </div>`).join('')}
      </div>
    </section>`;
}

function shopPetsHTML() {
  const owned = store.pets.owned;
  const pid = activePet();
  const prog = shopProgress();
  const mine = Object.keys(owned).filter(id => SHOP.pet(id));
  const ownedCards = mine.map(id => {
    const name = petName(id);
    const editing = shopRenaming === id;
    return `
      <div class="g-card shop-card${id === pid ? ' is-worn' : ''}">
        <div class="shop-card-art">${petHTML(null, { id, mood: id === pid ? petMood() : 'happy', title: '' })}</div>
        ${editing ? `
          <form class="shop-rename" onsubmit="event.preventDefault();renamePet('${id}', el('shop-rename-input').value)">
            <label class="sr-only" for="shop-rename-input">New name for ${escapeHTML(name)}</label>
            <input id="shop-rename-input" class="shop-rename-input" maxlength="${SHOP.NAME_MAX}" value="${escapeHTML(name)}" autocomplete="off" onkeydown="if(event.key==='Escape'){event.stopPropagation();shopRenaming=null;renderShop();}">
            <div class="shop-card-row"><button class="g-btn shop-buy" type="submit">Save</button><button class="g-pill shop-buy" type="button" onclick="shopRenaming=null;renderShop()">Cancel</button></div>
          </form>` : `
          <div class="shop-card-name">${escapeHTML(name)}</div>
          <div class="shop-card-kind">${escapeHTML(SHOP.pet(id).name)}</div>
          <div class="shop-card-row">
            ${id === pid ? '<span class="g-chip g-chip--xp">Active</span>' : `<button class="g-btn shop-buy" onclick="setActivePet('${id}')" aria-label="Make ${escapeHTML(name)} your active pet">Make active</button>`}
            <button class="g-pill shop-buy" onclick="shopRenaming='${id}';renderShop();setTimeout(()=>{const i=el('shop-rename-input');if(i){i.focus();i.select();}})" aria-label="Rename ${escapeHTML(name)}">Rename</button>
          </div>`}
      </div>`;
  }).join('');
  const kinds = SHOP_KINDS.map(([kind, label]) => {
    const pets = SHOP.PETS.filter(p => p.kind === kind && !owned[p.id]);
    if (!pets.length) return '';
    return `
      <h3 class="shop-h">${label}</h3>
      <div class="shop-grid">
        ${pets.map(p => {
          const chk = SHOP.canBuy(p, store.wallet, owned, prog);
          return `
            <div class="g-card shop-card${shopPickId === p.id ? ' is-picked' : ''}" onmouseenter="shopHover('${p.id}')" onmouseleave="shopHover(null)">
              <button class="shop-card-art" id="shop-art-${p.id}" onclick="shopPick('${p.id}')" onfocus="shopHover('${p.id}')" onblur="shopHover(null)" aria-label="Preview the ${escapeHTML(p.name)}" aria-pressed="${shopPickId === p.id}">${SHOP.petSvg(p.id, {}, { mood: 'happy', cls: 'pet-svg' })}</button>
              <div class="shop-card-name">${escapeHTML(p.name)}</div>
              <div class="shop-card-row">${shopPriceChip(chk.price)}${shopBuyHTML(p.id, chk, p.name)}</div>
            </div>`;
        }).join('')}
      </div>`;
  }).join('');
  return `
    <h3 class="shop-h">Your pets</h3>
    <div class="shop-grid">${ownedCards}</div>
    ${kinds}`;
}

/* One accessory card: art, colour swatches, then price/Buy, Owned/Wear or how to unlock. */
function shopItemCardHTML(it, target, prog) {
  const ids = [it.id].concat((it.variants || []).map(v => v.id));
  const id = ids.includes(shopSwatch[it.id]) ? shopSwatch[it.id] : it.id;
  const r = SHOP.item(id);
  const thing = r.variant || it;
  const owned = !!store.wardrobe.owned[id];
  const fit = target === 'avatar' ? store.wardrobe.avatar : petOutfit(target);
  const worn = fit[it.slot] === id;
  const chk = SHOP.canBuy(thing, store.wallet, store.wardrobe.owned, prog);
  const who = target === 'avatar' ? 'me' : petName(target);
  let row;
  if (owned) {
    row = worn
      ? `<span class="g-chip g-chip--xp">Wearing</span><button class="g-pill shop-buy" onclick="wear('${target}','${it.slot}',null)" aria-label="Take ${escapeHTML(thing.name)} off ${target === 'avatar' ? 'your avatar' : escapeHTML(who)}">Take off</button>`
      : `<span class="g-chip">Owned</span><button class="g-btn shop-buy" onclick="wear('${target}','${it.slot}','${id}')">Wear on ${escapeHTML(who)}</button>`;
  } else if (chk.reason === 'locked') {
    row = `<span class="shop-lock"><span aria-hidden="true">🔒</span> ${escapeHTML(unlockLabel(it))}</span>`;
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

function shopItemsHTML(slots, target) {
  const prog = shopProgress();
  return slots.map(slot => {
    const items = SHOP.ITEMS.filter(it => it.slot === slot);
    // For sale first, then milestone unlocks.
    items.sort((a, b) => (a.unlock ? 1 : 0) - (b.unlock ? 1 : 0));
    return `
      <h3 class="shop-h">${SHOP_SLOT_NAMES[slot]}</h3>
      <div class="shop-grid">${items.map(it => shopItemCardHTML(it, target, prog)).join('')}</div>`;
  }).join('');
}

function shopTargetHTML() {
  const pid = activePet();
  if (!pid) return '';
  const btn = (t, label, art) => `<button class="g-pill shop-target${shopTarget === t ? ' on' : ''}" aria-pressed="${shopTarget === t}" onclick="shopSetTarget('${t}')"><span class="shop-target-art" aria-hidden="true">${art}</span>${label}</button>`;
  return `
    <div class="shop-targets" role="group" aria-label="Dress up">
      ${btn('avatar', 'Me', avatarHTML(28, { title: '' }))}
      ${btn(pid, escapeHTML(petName(pid)), petHTML(28, { title: '', mood: 'happy' }))}
    </div>`;
}

function renderShop() {
  const box = el('shop-content');
  if (!box) return;
  if (shopTarget !== 'avatar' && shopTarget !== activePet()) shopTarget = activePet() || 'avatar';
  const coins = store.wallet.coins;
  const head = `
    <header class="shop-head">
      <h2 class="g-display shop-title">Shop</h2>
      <span class="g-chip g-chip--coin shop-balance"><span aria-hidden="true">🪙</span> <b id="shop-coins">${coins.toLocaleString('en-GB')}</b> coin${coins === 1 ? '' : 's'}</span>
    </header>`;
  if (!activePet()) {
    box.innerHTML = `<div class="shop">${head}${shopStarterHTML()}</div>`;
    return;
  }
  let panel;
  if (shopTab === 'pets') panel = shopPetsHTML();
  else if (shopTab === 'accessories') panel = shopTargetHTML() + shopItemsHTML(SHOP_ACC_SLOTS, shopTarget);
  else panel = `<p class="shop-sub">Backgrounds and frames are for your avatar. Change your emoji, photo or colour on <button class="shop-link" onclick="navigate('profile')">your profile</button>.</p>` + shopItemsHTML(SHOP_AVATAR_SLOTS, 'avatar');
  box.innerHTML = `
    <div class="shop">
      ${head}
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

/* ---------- the buy sheet ---------- */
function shopSheetArt(id) {
  const t = shopThing(id);
  if (!t) return '';
  return t.kind === 'pet'
    ? SHOP.petSvg(id, {}, { mood: 'happy', cls: 'pet-svg' })
    : itemThumbHTML(id, t.slot);
}

function shopAskBuy(id) {
  const t = shopThing(id);
  if (!t || shopBusy) return;
  const owned = t.kind === 'pet' ? store.pets.owned : store.wardrobe.owned;
  const chk = SHOP.canBuy(t.thing, store.wallet, owned, shopProgress());
  if (!chk.ok) { renderShop(); return; }
  const first = t.kind === 'pet' && !activePet();
  const name = escapeHTML(t.name);
  const title = first ? `Pick the ${name} as your first pet?`
    : chk.reason === 'unlocked' ? `Claim ${name}?`
    : chk.price > 0 ? `Buy ${name} for ${chk.price.toLocaleString('en-GB')} coins?` : `Get ${name} for free?`;
  const after = store.wallet.coins - chk.price;
  const sub = chk.price > 0
    ? `You have ${store.wallet.coins.toLocaleString('en-GB')} coins. You'll have ${after.toLocaleString('en-GB')} left.`
    : chk.reason === 'unlocked' ? 'You reached the milestone, so it is free.' : 'This one is free.';
  const label = first ? 'Pick' : chk.reason === 'unlocked' ? 'Claim' : chk.price > 0 ? `Buy for 🪙 ${chk.price.toLocaleString('en-GB')}` : 'Get it';
  openModal(`
    <div class="shop-sheet">
      <div class="shop-sheet-art">${shopSheetArt(id)}</div>
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
  const t = shopThing(id);
  const name = escapeHTML(t.name);
  const box = el('player-modal');
  if (!box) return;
  const pid = activePet();
  let actions = '';
  if (t.kind === 'pet') {
    if (pid !== id) actions += `<button class="g-btn" onclick="shopAfter(()=>setActivePet('${id}'))">Make active</button>`;
  } else {
    actions += `<button class="g-btn" onclick="shopAfter(()=>wear('avatar','${t.slot}','${id}'))">Wear on me</button>`;
    if (pid && !t.item.avatarOnly) actions += `<button class="g-btn" onclick="shopAfter(()=>wear('${pid}','${t.slot}','${id}'))">Wear on ${escapeHTML(petName(pid))}</button>`;
  }
  const title = t.kind === 'pet' && pid === id && Object.keys(store.pets.owned).length === 1 ? `Meet your ${name}!` : `${name} is yours!`;
  box.innerHTML = `
    <div class="shop-sheet">
      <div class="shop-sheet-art">${shopSheetArt(id)}</div>
      <h2 id="modal-title" class="shop-sheet-title">${title}</h2>
      <p class="shop-sheet-sub">${store.wallet.coins.toLocaleString('en-GB')} coin${store.wallet.coins === 1 ? '' : 's'} left.</p>
      <div class="shop-sheet-actions">
        ${actions}
        <button class="g-pill" id="shop-done-btn" onclick="shopAfter(null)">Done</button>
      </div>
    </div>`;
  const first = box.querySelector('.shop-sheet-actions button');
  if (first) first.focus();
}

function shopAfter(fn) {
  if (shopBusy) return;
  closeModal();
  if (fn) fn();
}

/* ---------- Home ---------- */
/* The active pet with its mood, its name and a way into the shop. */
function homePetHTML() {
  const pid = activePet();
  if (!pid) {
    return `
      <section class="g-card home-pet" aria-labelledby="home-pet-title">
        <div class="home-pet-art home-pet-art--egg" aria-hidden="true">🐾</div>
        <div class="home-pet-text">
          <h3 id="home-pet-title">Pick a free pet</h3>
          <p>A pet to cheer you on in rounds, and outfits for it and your avatar.</p>
        </div>
        <button class="g-pill" onclick="navigate('shop')">Choose a pet</button>
      </section>`;
  }
  const mood = petMood();
  const name = escapeHTML(petName(pid));
  return `
    <section class="g-card home-pet" aria-labelledby="home-pet-title">
      <div class="home-pet-figs">
        <span class="home-pet-av">${avatarHTML(56, { title: '' })}</span>
        <span class="home-pet-art home-pet-art--${mood}">${petHTML(null, { mood, title: '' })}</span>
      </div>
      <div class="home-pet-text">
        <h3 id="home-pet-title">${name}</h3>
        <p>${mood === 'happy' ? `${name} is happy: you studied today.` : `${name} is having a nap. A round wakes them up.`}</p>
      </div>
      <button class="g-pill" onclick="navigate('shop')"><span aria-hidden="true">🛍️</span> Shop</button>
    </section>`;
}

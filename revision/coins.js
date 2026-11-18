/* ===== COINS =====
   Pure rules for coins: what studying earns, the wallet's shape, and the coin
   tile for the stats card. No DOM and no app globals, so tests/coins.test.js
   can load it in Node. app.js keeps the wallet in store.wallet (global, not per
   unit) and pays through earnCoins().

   Earning (spec, "Coins, pets and the shop"):
   - a round pays 1 per card right first time (not hinted or revealed),
     +10 if it had no mistakes, +25 when the step's ring reached 100% and
     +5 on the first round of the day (the streak day);
   - battles +15 a win, +5 a loss; a forfeit pays nothing;
   - league week end: +50 for moving up a tier, +100 for a top-3 finish;
   - +20 for finishing a past-paper sitting or a mock.
   Coins never go down except when spent. */
const COINS = (() => {
  const RULES = { perFirstTry: 1, perfectRound: 10, stepMastered: 25, streakDay: 5, battleWin: 15, battleLoss: 5, leagueUp: 50, leagueTop3: 100, examPart: 20 };
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  const count = v => (typeof v === 'number' && isFinite(v) && v > 0 ? Math.floor(v) : 0);

  function forRound({ firstTry, mistakes, stepHit100, firstRoundToday } = {}) {
    const right = count(firstTry);
    let n = right * RULES.perFirstTry;
    // A perfect round needs at least one card earned: an all-hinted round is not one.
    if (right > 0 && count(mistakes) === 0) n += RULES.perfectRound;
    if (stepHit100 === true) n += RULES.stepMastered;
    if (firstRoundToday === true) n += RULES.streakDay;
    return n;
  }

  function forBattle(won) {
    return won ? RULES.battleWin : RULES.battleLoss;
  }

  /* result is LEAGUE.rollover's settled week ({ tier, place, zone }) and
     tierAfter the tier joined for the new week. */
  function forLeague(result, tierAfter) {
    if (!result || typeof result !== 'object') return 0;
    let n = 0;
    if (typeof tierAfter === 'number' && tierAfter > result.tier) n += RULES.leagueUp;
    if (Number.isInteger(result.place) && result.place >= 1 && result.place <= 3) n += RULES.leagueTop3;
    return n;
  }

  function seedFromXP(totalXP) {
    return Math.floor(count(totalXP) / 10);
  }

  function defaultWallet() {
    return { coins: 0, seeded: false, spent: 0, lastRoundDay: '' };
  }

  function coerceWallet(raw) {
    const w = defaultWallet();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return w;
    w.coins = count(raw.coins);
    w.seeded = raw.seeded === true;
    w.spent = count(raw.spent);
    w.lastRoundDay = typeof raw.lastRoundDay === 'string' && DATE_RE.test(raw.lastRoundDay) ? raw.lastRoundDay : '';
    return w;
  }

  function earn(wallet, n) {
    const w = coerceWallet(wallet);
    w.coins += count(n);
    return w;
  }

  // null when the wallet cannot cover it; the balance never goes negative.
  function spend(wallet, n) {
    const w = coerceWallet(wallet);
    const cost = count(n);
    if (typeof n !== 'number' || n < 0 || cost > w.coins) return null;
    w.coins -= cost;
    w.spent += cost;
    return w;
  }

  /* The coin tile for the stats card (right rail and the top of Home). Not a
     button yet: the shop it will open arrives with Task 13. */
  function railHTML(wallet) {
    const n = coerceWallet(wallet).coins;
    return `<div class="stats-tile stats-tile--coins">
          <span class="stats-emoji" aria-hidden="true">🪙</span>
          <span class="stats-text"><b>${n.toLocaleString('en-GB')}</b><small>${n === 1 ? 'coin' : 'coins'}</small></span>
        </div>`;
  }

  const api = { RULES, forRound, forBattle, forLeague, seedFromXP, defaultWallet, coerceWallet, earn, spend, railHTML };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  return api;
})();

/* ===== LEAGUE ENGINE =====
   Pure logic for the leaderboard: weekly leagues and the battle rating. No DOM
   and no app globals, so tests/league.test.js can load it in Node.

   Weekly leagues (as Duolingo does it): each week you race 20 simulated rivals
   on XP earned THIS week. When the week ends the top places move up a league
   and the bottom places move down; everyone starts the next week on 0. Higher
   leagues hold rivals who revise more, so one big session can win Bronze but
   reaching Cyber Legend takes weeks of steady work. The old table ranked total
   XP against rivals who earned ~30 XP a day, so an hour of revision put a new
   student in the top 3.

   Battle rating: Elo, used only for battles, which are real head-to-head
   results. It is not used for the league, where a rating would make wrong
   answers cost points and put students off practising weak topics.

   Weeks run Monday 00:00 to Sunday 23:59 local time and are named by their
   Monday's 'YYYY-MM-DD'. Rivals' XP is a pure function of the week, the league
   and the clock, so standings are the same on every reload. */
const LEAGUE = (() => {
  const TIERS = [
    { name: 'Bronze',       icon: '🥉', col: '#B45309' },
    { name: 'Silver',       icon: '🥈', col: '#64748B' },
    { name: 'Gold',         icon: '🥇', col: '#BE7A1C' },
    { name: 'Platinum',     icon: '💠', col: '#0E7490' },
    { name: 'Diamond',      icon: '💎', col: '#1B5A5F' },
    { name: 'Master',       icon: '🔮', col: '#A85A3C' },
    { name: 'Cyber Legend', icon: '👑', col: '#7B61B8' }
  ];
  const TOP = TIERS.length - 1;
  const RIVALS = 20;   // per league, so 21 players with you
  const DAY = 86400000;

  /* A typical week's XP for the middle of each league. Each step is ~1.45x.
     Flashcards pay 5 XP and quick-fire MCQs 10, so an hour of steady revision is
     roughly 1,000-1,500 XP: about 40 minutes clears Bronze's promotion line, and
     Master's takes ~5 hours a week. */
  const MEDIAN = [600, 870, 1260, 1830, 2650, 3850, 5600];
  // Week totals for the 20 rivals as multiples of the median, best first.
  const SPREAD = [3.0, 2.4, 2.0, 1.75, 1.55, 1.4, 1.27, 1.15, 1.05, 0.96,
                  0.87, 0.79, 0.71, 0.63, 0.55, 0.47, 0.39, 0.3, 0.2, 0.1];
  /* When rivals revise, Monday to Sunday. Each rival has one habit, and inside
     a day the XP comes in between 7am and 11pm, so the table moves during the day. */
  const HABITS = [
    [1, 1, 1, 1, 1, 1, 1],                    // steady
    [1.4, 1.4, 1.3, 1.3, 1.1, 0.4, 0.3],      // school-night grinder
    [0.4, 0.4, 0.5, 0.6, 0.8, 1.6, 2.0],      // weekend crammer
    [0.3, 0.4, 0.5, 0.7, 0.9, 1.3, 2.2]       // leaves it to the last minute
  ];

  const ID_RE = /^\d{4}-\d{2}-\d{2}$/;
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const intIn = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function hash(str, mod = 9973) {
    let h = 0;
    for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) % mod;
    return h;
  }

  function dateStr(t) {
    const d = new Date(t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Built from parts so it is local midnight, whatever the clocks did.
  function fromId(id, addDays = 0) {
    const [y, m, d] = id.split('-').map(Number);
    return new Date(y, m - 1, d + addDays).getTime();
  }

  function weekId(t) {
    const d = new Date(t);
    const back = (d.getDay() + 6) % 7;   // days since Monday
    return dateStr(new Date(d.getFullYear(), d.getMonth(), d.getDate() - back).getTime());
  }

  function weekStart(id) { return fromId(id); }
  function weekEnd(id) { return fromId(id, 7); }
  function weekDays(id) { return [0, 1, 2, 3, 4, 5, 6].map(i => dateStr(fromId(id, i))); }

  function weekXP(xpByDay, id) {
    return weekDays(id).reduce((n, d) => n + (Number(xpByDay && xpByDay[d]) || 0), 0);
  }

  // XP from days of this week before `t`'s day: where you stood this time yesterday.
  function weekXPBefore(xpByDay, id, t) {
    const today = dateStr(t);
    return weekDays(id).filter(d => d < today).reduce((n, d) => n + (Number(xpByDay && xpByDay[d]) || 0), 0);
  }

  function promoteCount(tier) { return tier >= TOP ? 0 : tier === 0 ? 7 : 5; }
  function demoteCount(tier) { return tier === 0 ? 0 : 5; }

  function zoneOf(place, tier, size) {
    if (place <= promoteCount(tier)) return 'up';
    if (place > size - demoteCount(tier)) return 'down';
    return 'stay';
  }

  /* This week's 20 rivals for a league, each with a week target and a habit.
     The pool is the app's list of rivals ({name, tag, col, base}). */
  function group(pool, id, tier) {
    const order = pool
      .map(b => ({ b, k: hash(id + '|' + tier + '|' + b.name, 100003) }))
      .sort((x, y) => x.k - y.k || (x.b.name < y.b.name ? -1 : 1))
      .slice(0, RIVALS);
    return order.map(({ b }, i) => {
      const h = hash(b.name + id, 997);
      const jitter = 0.88 + (h % 25) / 100;   // 0.88 to 1.12
      return { ...b, target: Math.round(MEDIAN[tier] * SPREAD[i] * jitter), habit: h % HABITS.length };
    });
  }

  // Share of its week's XP a rival has earned by time t (0 to 1).
  function progress(habit, id, t) {
    const start = fromId(id);
    if (t <= start) return 0;
    if (t >= weekEnd(id)) return 1;
    const w = HABITS[habit];
    const total = w.reduce((a, b) => a + b, 0);
    const day = clamp(Math.round((fromId(dateStr(t)) - start) / DAY), 0, 6);
    const hours = (t - fromId(dateStr(t))) / 3600000;
    const inDay = clamp((hours - 7) / 16, 0, 1);
    let done = 0;
    for (let i = 0; i < day; i++) done += w[i];
    return (done + w[day] * inDay) / total;
  }

  /* Join on a Wednesday and you only have part of the week, so rivals' week
     totals shrink to the share of the week that was left when you joined.
     They still earn it across the whole week, so the table is alive when you
     arrive, but nobody finishes with a head start you couldn't match. */
  function rivalXP(rival, id, joinedAt, t) {
    const from = Math.max(fromId(id), joinedAt || 0);
    const left = 1 - progress(rival.habit, id, from);
    return Math.max(0, Math.round(rival.target * left * progress(rival.habit, id, t)));
  }

  /* The table at time t. Ties go to the rival, so a fresh week starts you at
     the bottom. Every row gets .place and .zone ('up' | 'stay' | 'down'). */
  function standings({ pool, id, tier, joinedAt, t, myXP, me }) {
    const rows = group(pool, id, tier).map(r => ({ ...r, xp: rivalXP(r, id, joinedAt, t), me: false }));
    rows.push({ ...(me || {}), name: 'You', xp: myXP, me: true });
    rows.sort((a, b) => b.xp - a.xp || a.me - b.me);
    rows.forEach((r, i) => { r.place = i + 1; r.zone = zoneOf(r.place, tier, rows.length); });
    return rows;
  }

  function defaultState() {
    return { tier: 0, best: 0, week: '', joinedAt: 0, seen: true, history: [] };
  }

  /* Settles any finished week and moves the league on to the current one.
     Returns { league, result }: result is the week just settled (null if there
     was none, or you earned no XP in it: sitting a week out changes nothing).
     After a gap, you join the current week now. */
  function rollover(league, xpByDay, pool, now) {
    const cur = weekId(now);
    if (league.week === cur) return { league, result: null };
    if (!league.week) return { league: { ...league, week: cur, joinedAt: now }, result: null };
    const myXP = weekXP(xpByDay, league.week);
    let result = null;
    let tier = league.tier;
    if (myXP > 0) {
      const rows = standings({ pool, id: league.week, tier, joinedAt: league.joinedAt, t: weekEnd(league.week), myXP });
      const mine = rows.find(r => r.me);
      result = { week: league.week, tier, place: mine.place, of: rows.length, xp: myXP, zone: mine.zone };
      tier = clamp(tier + (mine.zone === 'up' ? 1 : mine.zone === 'down' ? -1 : 0), 0, TOP);
    }
    return {
      league: {
        tier,
        best: Math.max(league.best, tier),
        week: cur,
        joinedAt: now,
        seen: result ? false : league.seen,
        history: result ? [...league.history, result].slice(-26) : league.history
      },
      result
    };
  }

  function coerceState(raw) {
    const d = defaultState();
    if (!isObj(raw)) return d;
    const tier = intIn(raw.tier, 0, TOP) ? raw.tier : 0;
    return {
      tier,
      best: intIn(raw.best, 0, TOP) ? Math.max(raw.best, tier) : tier,
      week: typeof raw.week === 'string' && ID_RE.test(raw.week) ? raw.week : '',
      joinedAt: typeof raw.joinedAt === 'number' && isFinite(raw.joinedAt) && raw.joinedAt >= 0 ? raw.joinedAt : 0,
      seen: typeof raw.seen === 'boolean' ? raw.seen : true,
      history: Array.isArray(raw.history)
        ? raw.history.filter(h => isObj(h) && typeof h.week === 'string' && ID_RE.test(h.week)
            && intIn(h.tier, 0, TOP) && Number.isInteger(h.place) && Number.isInteger(h.of)
            && typeof h.xp === 'number' && ['up', 'stay', 'down'].includes(h.zone)).slice(-26)
        : []
    };
  }

  /* ---- Battle rating (Elo) ----
     Everyone starts at 1000. The first 10 battles are provisional and move
     twice as far, so a strong student reaches their level quickly. Against
     several rivals at once (Race, Elimination, Blitz) each rival is a separate
     win or loss by finishing order, averaged so a battle moves you about as far
     as a duel does. */
  const START_RATING = 1000;
  const PROVISIONAL = 10;

  function expected(mine, theirs) { return 1 / (1 + Math.pow(10, (theirs - mine) / 400)); }
  function kFactor(games) { return games < PROVISIONAL ? 48 : 24; }

  // results: [{ rating, score }] where score is 1 (you beat them), 0.5 or 0.
  function ratingChange(mine, games, results) {
    if (!results.length) return 0;
    const sum = results.reduce((n, r) => n + (r.score - expected(mine, r.rating)), 0);
    return Math.round(kFactor(games) * sum / results.length);
  }

  // A rival's rating: last season's standing sets the level, with a little weekly form.
  function rivalRating(rival, id) {
    const level = 800 + Math.min(1, (rival.base || 0) / 7400) * 900;
    const own = (hash(rival.name, 997) % 121) - 60;
    const form = (hash(rival.name + '|' + id, 997) % 41) - 20;
    return Math.round(level + own + form);
  }

  // How often a rival answers correctly, and how fast, from its rating.
  function rivalSkill(rating) { return clamp((rating - 700) / 1100, 0.02, 1); }

  const api = {
    TIERS, TOP, RIVALS, MEDIAN, SPREAD, START_RATING, PROVISIONAL,
    hash, dateStr, weekId, weekStart, weekEnd, weekDays, weekXP, weekXPBefore,
    promoteCount, demoteCount, zoneOf, group, progress, rivalXP, standings,
    defaultState, rollover, coerceState,
    expected, kFactor, ratingChange, rivalRating, rivalSkill
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  return api;
})();

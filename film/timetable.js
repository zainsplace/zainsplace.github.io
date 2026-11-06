/* ===== TIMETABLE ENGINE =====
   Pure logic for the Plan tab's revision timetable: which subject (FILM or
   BTEC ICT) each session is for, from the start date to the Film mock, and
   which film section each Film session covers. No DOM and no app globals, so
   tests/timetable.test.js can load it in Node.

   Rules (dates are local 'YYYY-MM-DD' strings, which compare as strings):
     06–15 Nov  about 60% ICT / 40% Film, alternating within each day
     16–17 Nov  about 75% ICT / 25% Film
     18 Nov     ICT only (final review)
     19 Nov     BTEC ICT exam; at most one light Film session in the evening
     20–24 Nov  Film only; 24 Nov is a light review day
     25 Nov     Film exam; a 10-minute morning checklist only
   Film sessions rotate through the five film sections so each comes up at
   least twice, newest material (Casablanca/Bonnie and Clyde, Amy) first, then
   weakest-rated sections first. Missed sessions roll forward as catch-up while
   their subject is still allowed. */
const TIMETABLE = (() => {
  const START = '2026-11-06';
  const ICT_EXAM = '2026-11-19';
  const FILM_EXAM = '2026-11-25';
  const ICT_SITE = '../revision/index.html';   // the BTEC IT site, a sibling folder on zainsplace.github.io
  const MAX_CATCHUP = 2;
  const DEFAULTS = { weekday: 2, weekend: 4, minutes: 45 };

  // Film sections the rotation covers. `unit` matches the site's components.
  const SECTIONS = {
    'C1A': { unit: 'u1', letter: 'a', label: 'C1 Section A · Casablanca vs Bonnie and Clyde' },
    'C1B': { unit: 'u1', letter: 'b', label: 'C1 Section B · Joker & Get Out' },
    'C1C': { unit: 'u1', letter: 'c', label: 'C1 Section C · Trainspotting & Shaun of the Dead' },
    'C2A': { unit: 'u2', letter: 'a', label: 'C2 Section A · Pan’s Labyrinth & City of God' },
    'C2B': { unit: 'u2', letter: 'b', label: 'C2 Section B · Amy (documentary)' }
  };

  // First pass: newest material first, then one block per remaining section.
  const FIRST_PASS = [
    { sec: 'C1A', focus: 'contexts: WWII and the studio system vs the 1960s and New Hollywood' },
    { sec: 'C2B', focus: 'Amy: form, key sequences and the digital debate' },
    { sec: 'C1A', focus: 'auteur: Curtiz vs Penn, collaboration, key scenes' },
    { sec: 'C2B', focus: 'filmmakers’ theories: Longinotto, Watkins, Broomfield, Moore' },
    { sec: 'C1B', focus: 'spectatorship: passive/active, alignment, cues' },
    { sec: 'C1C', focus: 'narrative + ideology: openings and resolutions' },
    { sec: 'C2A', focus: 'film form: colour, editing, sound, mise-en-scène' },
    { sec: 'C1B', focus: 'ideology: class neglect and liberal racism' },
    { sec: 'C1C', focus: 'binary oppositions and masculinity' },
    { sec: 'C2A', focus: 'contexts, representation and aesthetics' }
  ];
  // Later passes: one timed essay or plan per section, reordered by weakness.
  const LATER = {
    'C1A': 'timed essay plan + one full paragraph (compare)',
    'C1B': 'timed essay: “a constant shift between passive and active spectatorship”',
    'C1C': 'timed essay: ideology and narrative resolution',
    'C2A': 'timed essay: editing or sound create meaning (both films)',
    'C2B': '20-mark timed essay: apply one filmmaker’s theory'
  };
  const ICT_TASKS = [
    'Flashcards due today, then one weak section',
    'Exam-style questions on your red topics, marked against the scheme',
    'One timed paper part (Pure Past Papers)',
    'Extended answer practice + review the model answer',
    'Content review: work through one section path'
  ];

  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  function parse(date) { const [y, m, d] = date.split('-').map(Number); return new Date(y, m - 1, d); }
  function fmt(t) {
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }
  function addDays(date, n) { const t = parse(date); t.setDate(t.getDate() + n); return fmt(t); }
  function dayOfWeek(date) { return parse(date).getDay(); }   // 0 Sunday … 6 Saturday
  function isWeekend(date) { const d = dayOfWeek(date); return d === 0 || d === 6; }
  function daysBetween(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }

  function coerceSettings(raw) {
    const out = Object.assign({}, DEFAULTS);
    if (!isObj(raw)) return out;
    const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
    if (int(raw.weekday, 1, 6)) out.weekday = raw.weekday;
    if (int(raw.weekend, 1, 8)) out.weekend = raw.weekend;
    if (int(raw.minutes, 15, 120)) out.minutes = raw.minutes;
    return out;
  }

  /* The ICT share for a date, or null on a fixed (exam / special) day. */
  function ictShare(date) {
    if (date < '2026-11-16') return 0.6;
    if (date < '2026-11-18') return 0.75;
    if (date === '2026-11-18') return 1;
    if (date > ICT_EXAM && date < FILM_EXAM) return 0;
    return null;
  }

  /* Subjects for one day's sessions. The ICT count is the day's share of n,
     rounded, with the rounding remainder carried to the next day so the ratio
     holds across a window; then the two subjects alternate, ICT first (its
     exam is sooner), so neither runs in a long block. */
  function subjectsFor(date, n, carry) {
    const share = ictShare(date) || 0;
    carry.debt += n * share;
    const ict = Math.max(0, Math.min(n, Math.round(carry.debt)));
    carry.debt -= ict;
    let a = ict, b = n - ict;
    const out = [];
    while (a > 0 || b > 0) {
      if (a > 0) { out.push('ICT'); a--; }
      if (b > 0) { out.push('FILM'); b--; }
    }
    return out;
  }

  /* Film topics in order. weakness: { C1A: score, ... }, higher = weaker. */
  function filmQueue(weakness) {
    const w = isObj(weakness) ? weakness : {};
    const order = Object.keys(SECTIONS).slice().sort((a, b) => (w[b] || 0) - (w[a] || 0) || a.localeCompare(b));
    return { first: FIRST_PASS.slice(), later: order };
  }

  function film(sec, focus, light) {
    return { subject: 'FILM', sec, unit: SECTIONS[sec].unit, letter: SECTIONS[sec].letter,
      title: SECTIONS[sec].label, task: focus, light: !!light };
  }

  /* The whole timetable: [{ date, kind, note, sessions: [{id, subject, title, task, ...}] }]. */
  function build(settingsRaw, weakness) {
    const settings = coerceSettings(settingsRaw);
    const q = filmQueue(weakness);
    let fi = 0, li = 0, ictI = 0;
    const nextFilm = () => {
      if (fi < q.first.length) { const t = q.first[fi++]; return Object.assign(film(t.sec, t.focus), { pass: 1 }); }
      const sec = q.later[li++ % q.later.length];
      return Object.assign(film(sec, LATER[sec]), { pass: 2 });
    };
    const nextICT = () => ({ subject: 'ICT', title: 'BTEC IT revision', task: ICT_TASKS[ictI++ % ICT_TASKS.length], link: ICT_SITE });

    const days = [];
    const carry = { debt: 0 };
    for (let date = START; date <= FILM_EXAM; date = addDays(date, 1)) {
      let kind = 'study', note = '', sessions = [];
      if (date === ICT_EXAM) {
        kind = 'exam-ict';
        note = 'BTEC IT exam today. Rest after it; one light Film session in the evening if you have energy.';
        const s = film('C1A', 'light: 15 minutes of Film flashcards only', true);
        sessions = [s];
      } else if (date === FILM_EXAM) {
        kind = 'exam-film';
        note = 'Film Studies mock today. Ten minutes on the Exam Kit checklist, then go.';
        sessions = [{ subject: 'FILM', title: 'Morning checklist', task: '10 minutes: weak-spot checklist, key quotes, one plan per section', light: true }];
      } else {
        const n = isWeekend(date) ? settings.weekend : settings.weekday;
        const subs = subjectsFor(date, n, carry);
        sessions = subs.map(s => s === 'ICT' ? nextICT() : nextFilm());
        if (date === '2026-11-18') note = 'Last full day before the BTEC IT exam: ICT only, finish early and sleep well.';
        if (date === '2026-11-24') {
          kind = 'light';
          note = 'Light review day: flashcards, Exam Kit and one essay plan per section. No new content.';
          sessions = sessions.map(s => Object.assign({}, s, { light: true, task: 'light review: flashcards + essay plans' }));
        }
        if (date === '2026-11-20') note = 'Film only from today. Start with your weakest-rated section.';
      }
      sessions.forEach((s, i) => { s.id = date + '#' + i; s.minutes = s.light ? 15 : settings.minutes; });
      days.push({ date, kind, note, sessions });
    }
    return days;
  }

  /* Sessions from days before `today` that were not ticked, which may still be
     done today: ICT only before its exam day, Film only before the Film exam. */
  function allowed(subject, today) {
    if (subject === 'ICT') return today < ICT_EXAM;
    return today < FILM_EXAM;
  }
  function catchUp(days, checks, today) {
    const c = isObj(checks) ? checks : {};
    const out = [];
    for (let i = days.length - 1; i >= 0 && out.length < MAX_CATCHUP; i--) {
      const d = days[i];
      if (d.date >= today || d.date < START) continue;
      for (let j = d.sessions.length - 1; j >= 0 && out.length < MAX_CATCHUP; j--) {
        const s = d.sessions[j];
        if (!c[s.id] && !s.light && allowed(s.subject, today)) out.push(Object.assign({}, s, { from: d.date }));
      }
    }
    return out;
  }

  function counts(days) {
    const c = { ICT: 0, FILM: 0, bySection: {} };
    days.forEach(d => d.sessions.forEach(s => {
      c[s.subject] = (c[s.subject] || 0) + 1;
      if (s.sec && !s.light) c.bySection[s.sec] = (c.bySection[s.sec] || 0) + 1;
    }));
    return c;
  }

  function daysUntil(today, exam) { return daysBetween(today, exam); }

  function coerceChecks(raw) {
    const out = {};
    if (!isObj(raw)) return out;
    Object.keys(raw).forEach(k => {
      if (/^\d{4}-\d{2}-\d{2}#\d{1,2}$/.test(k) && raw[k] === true) out[k] = true;
    });
    return out;
  }

  const api = {
    START, ICT_EXAM, FILM_EXAM, ICT_SITE, DEFAULTS, SECTIONS, MAX_CATCHUP,
    addDays, isWeekend, daysBetween, ictShare, coerceSettings, coerceChecks,
    build, catchUp, counts, daysUntil, allowed, isDate: v => typeof v === 'string' && DATE_RE.test(v)
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  return api;
})();

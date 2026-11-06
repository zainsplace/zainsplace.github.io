/* ===== TIMETABLE ENGINE =====
   Pure logic for the Plan tab's revision timetable: when each session is, which
   subject (FILM or BTEC ICT) it is for, and exactly what to do in it. No DOM and
   no app globals, so tests/timetable.test.js can load it in Node.

   Rules (dates are local 'YYYY-MM-DD' strings, which compare as strings):
     06–15 Nov  about 60% ICT / 40% Film, alternating, ICT first
     15 Nov     the last weekend: ICT sessions sit a timed mock paper in parts
     16–17 Nov  about 75% ICT
     18 Nov     ICT only (final review)
     19 Nov     BTEC ICT exam; at most one light Film session in the evening
     20–24 Nov  Film only; 24 Nov is a light review day
     25 Nov     Film exam; a 10-minute morning checklist only
   Film: a first pass learns each section (newest material first: Casablanca /
   Bonnie and Clyde, Amy), each session ending with an exam paragraph on one of
   that section's key scenes. Then timed essays, a different question each time,
   weakest-rated sections first. Missed sessions roll forward as catch-up while
   their subject is still allowed. */
const TIMETABLE = (() => {
  const START = '2026-11-06';
  const ICT_EXAM = '2026-11-19';
  const FILM_EXAM = '2026-11-25';
  const ICT_SITE = '../revision/index.html';   // the BTEC IT site, a sibling folder on zainsplace.github.io
  const MAX_CATCHUP = 2;
  const BREAK = 10;              // minutes between sessions
  const LIGHT = 15;              // minutes for a light session
  const DEFAULTS = { weekday: 2, weekend: 4, minutes: 45, weekdayStart: '16:30', weekendStart: '10:00' };
  const START_TIMES = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];

  const SECTIONS = {
    'C1A': { unit: 'u1', letter: 'a', label: 'C1 Section A · Casablanca vs Bonnie and Clyde' },
    'C1B': { unit: 'u1', letter: 'b', label: 'C1 Section B · Joker & Get Out' },
    'C1C': { unit: 'u1', letter: 'c', label: 'C1 Section C · Trainspotting & Shaun of the Dead' },
    'C2A': { unit: 'u2', letter: 'a', label: 'C2 Section A · Pan’s Labyrinth & City of God' },
    'C2B': { unit: 'u2', letter: 'b', label: 'C2 Section B · Amy (documentary)' }
  };

  // The key scenes (three per film), paired for two-film sections, rotated
  // through each section's learning sessions.
  const SCENES = {
    'C1A': ['the two openings (the globe and refugee trail; Bonnie behind the bars)',
            'the duel of the anthems vs the first killing',
            'the two endings (the airport; the ambush)'],
    'C1B': ['the subway murders vs the opening abduction',
            'the stair dance vs the Sunken Place',
            'the Murray Franklin show vs the garden-party auction'],
    'C1C': ['the “Choose Life” opening vs the mirrored walks to the shop',
            'the “Perfect Day” overdose vs the Winchester siege',
            'Renton stealing the money vs the news-montage ending'],
    'C2A': ['the bottle murder and the flying-chicken opening',
            'the Pale Man and the Story of the Apartment',
            'the flower ending and Rocket’s photo'],
    'C2B': ['the birthday-video opening', 'the paparazzi sequences', 'Belgrade and the ending']
  };

  // First pass: newest material first, then one block per remaining section.
  const FIRST_PASS = [
    { sec: 'C1A', focus: 'Contexts: WWII and the studio system vs the 1960s and New Hollywood' },
    { sec: 'C2B', focus: 'Amy: how it is made, and the digital-technology debate' },
    { sec: 'C1A', focus: 'Auteur: Curtiz vs Penn, signatures and collaboration' },
    { sec: 'C2B', focus: 'Filmmakers’ theories: Longinotto, Watkins, Broomfield, Moore' },
    { sec: 'C1B', focus: 'Spectatorship: passive/active, alignment, visual and sound cues' },
    { sec: 'C1C', focus: 'Narrative + ideology: structure, openings and resolutions' },
    { sec: 'C2A', focus: 'Film form: colour, editing, sound, mise-en-scène' },
    { sec: 'C1B', focus: 'Ideology: class neglect and liberal racism' },
    { sec: 'C1C', focus: 'Binary oppositions and masculinity' },
    { sec: 'C2A', focus: 'Contexts, representation and aesthetics' }
  ];

  const ICT_TASKS = [
    { title: 'Flashcards + weakest section', steps: ['Clear today’s due flashcards', 'Work through the Sections path for your reddest section', 'Rate each topic red, amber or green honestly'] },
    { title: 'Exam questions on red topics', steps: ['Answer 3 exam-style questions on red topics', 'Mark each one against the mark scheme, not a guess', 'Rewrite your weakest answer'] },
    { title: 'Timed paper part (Pure Past Papers)', steps: ['Sit one timed part in PPP mode', 'Mark it and diagnose every lost mark', 'Fix and redo the worst part'] },
    { title: 'Extended answer (Distinction marks)', steps: ['Write one 9- or 12-mark Evaluate/Discuss answer against the clock', 'Compare it with the model answer', 'Note one thing the top band does that you did not'] },
    { title: 'Content review', steps: ['Read the notes for a section you rated amber', 'Revise the command words in the Exam Kit', 'Quick quiz on that section'] }
  ];
  const ICT_MOCK_DAY = '2026-11-15';
  const ICT_FINAL_DAY = '2026-11-18';
  const ICT_FINAL = [
    { title: 'Final review: exam technique', steps: ['Exam Kit: command words and the 9/12-mark formula', 'Skim every red topic’s exam tip', 'Flashcards due today'] },
    { title: 'Final review: last weak spots', steps: ['One extended answer on your weakest topic', 'Mark it against the mark scheme', 'Stop early, pack your bag and sleep well'] }
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
  function toMin(hhmm) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }
  function toHHMM(min) { const m = ((min % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; }

  function coerceSettings(raw) {
    const out = Object.assign({}, DEFAULTS);
    if (!isObj(raw)) return out;
    const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
    if (int(raw.weekday, 1, 6)) out.weekday = raw.weekday;
    if (int(raw.weekend, 1, 8)) out.weekend = raw.weekend;
    if (int(raw.minutes, 15, 120)) out.minutes = raw.minutes;
    if (START_TIMES.includes(raw.weekdayStart)) out.weekdayStart = raw.weekdayStart;
    if (START_TIMES.includes(raw.weekendStart)) out.weekendStart = raw.weekendStart;
    return out;
  }

  /* The ICT share for a date, or null on a fixed (exam) day. */
  function ictShare(date) {
    if (date < '2026-11-16') return 0.6;
    if (date < ICT_FINAL_DAY) return 0.75;
    if (date === ICT_FINAL_DAY) return 1;
    if (date > ICT_EXAM && date < FILM_EXAM) return 0;
    return null;
  }

  /* Subjects for one day's sessions. The ICT count is the day's share of n,
     rounded, with the remainder carried to the next day so the ratio holds
     across a window; then the subjects alternate, ICT first (its exam is sooner). */
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

  /* Minutes split proportionally across steps, as whole minutes summing to total. */
  function split(total, parts) {
    const sum = parts.reduce((a, b) => a + b, 0);
    const out = parts.map(p => Math.floor(total * p / sum));
    out[out.length - 1] += total - out.reduce((a, b) => a + b, 0);
    return out;
  }

  function learnSteps(focus, scene, minutes) {
    const [a, b, c] = split(minutes, [4, 2, 4]);
    return [`${a} min · Read the notes: ${focus}`,
            `${b} min · Flashcards for this section`,
            `${c} min · Write one exam paragraph on ${scene}: point → scene → named technique → meaning → judgement`];
  }

  function essaySteps(q, minutes) {
    const plan = 5, mark = q.marks === 20 ? 5 : 10;
    const write = Math.max(10, minutes - plan - mark);
    const full = q.marks === 20 ? write >= 25 : write >= 45;
    return [`${plan} min · Plan: thesis, 3–4 key scenes, your judgement`,
            `${write} min · Write ${full ? 'the full essay' : 'the introduction and as many full paragraphs as you can'} against the clock`,
            `${mark} min · Mark it against the five bands and write down one fix for next time`];
  }

  /* Film sections ordered weakest first. weakness: { C1A: score, ... }, higher = weaker. */
  function laterOrder(weakness) {
    const w = isObj(weakness) ? weakness : {};
    return Object.keys(SECTIONS).slice().sort((a, b) => (w[b] || 0) - (w[a] || 0) || a.localeCompare(b));
  }

  function filmBase(sec) {
    return { subject: 'FILM', sec, unit: SECTIONS[sec].unit, letter: SECTIONS[sec].letter, title: SECTIONS[sec].label };
  }

  /* The whole timetable: [{ date, kind, note, sessions: [{id, subject, start, end, minutes, title, task, steps, ...}] }].
     bank (optional): { C1A: [{ id, marks, question }], ... } essay questions to rotate through. */
  function build(settingsRaw, weakness, bank) {
    const settings = coerceSettings(settingsRaw);
    const later = laterOrder(weakness);
    const qs = isObj(bank) ? bank : {};
    let fi = 0, li = 0, ictI = 0, mockPart = 0;
    const sceneI = {}, qI = {};

    const nextFilm = () => {
      if (fi < FIRST_PASS.length) {
        const t = FIRST_PASS[fi++];
        const k = sceneI[t.sec] = (sceneI[t.sec] || 0);
        sceneI[t.sec]++;
        const scene = SCENES[t.sec][k % SCENES[t.sec].length];
        return Object.assign(filmBase(t.sec), { pass: 1, task: t.focus, scene, action: 'section',
          steps: learnSteps(t.focus, scene, settings.minutes) });
      }
      const sec = later[li++ % later.length];
      const list = qs[sec] || [];
      if (!list.length) {
        const scene = SCENES[sec][(sceneI[sec] = (sceneI[sec] || 0) + 1) % SCENES[sec].length];
        return Object.assign(filmBase(sec), { pass: 2, task: 'Timed exam paragraphs', scene, action: 'section',
          steps: learnSteps('your weakest topic in this section', scene, settings.minutes) });
      }
      const q = list[(qI[sec] = (qI[sec] === undefined ? 0 : qI[sec] + 1)) % list.length];
      return Object.assign(filmBase(sec), { pass: 2, task: 'Timed essay: ' + q.question, qId: q.id, marks: q.marks,
        action: 'question', steps: essaySteps(q, settings.minutes) });
    };
    const nextICT = date => {
      let t;
      if (date === ICT_MOCK_DAY) {
        mockPart++;
        t = { title: `Timed mock paper, part ${mockPart}`, steps: [mockPart === 1
          ? 'Start a full mock paper on the BTEC IT site (Questions → Mock paper) and work against the clock'
          : 'Carry on the same mock paper from where you stopped', 'Stop at the end of the session; it resumes where you left off', 'After the last part: mark every answer and list your three weakest topics'] };
      } else if (date === ICT_FINAL_DAY) {
        t = ICT_FINAL[ictI++ % ICT_FINAL.length];
      } else {
        t = ICT_TASKS[ictI++ % ICT_TASKS.length];
      }
      return { subject: 'ICT', title: 'BTEC IT · ' + t.title, task: t.title, steps: t.steps.slice(), link: ICT_SITE, action: 'ict' };
    };

    const days = [];
    const carry = { debt: 0 };
    for (let date = START; date <= FILM_EXAM; date = addDays(date, 1)) {
      let kind = 'study', note = '', sessions = [];
      let clock = toMin(isWeekend(date) ? settings.weekendStart : settings.weekdayStart);
      if (date === ICT_EXAM) {
        kind = 'exam-ict';
        note = 'BTEC IT exam today. Rest after it; one light Film session in the evening only if you have energy.';
        clock = toMin('19:00');
        sessions = [Object.assign(filmBase('C1A'), { title: 'Film flashcards (optional)', task: 'Light: Film flashcards only', light: true, action: 'flashcards',
          steps: ['15 min · Film flashcards due today, nothing new'] })];
      } else if (date === FILM_EXAM) {
        kind = 'exam-film';
        note = 'Film Studies mock today. Ten minutes on the Exam Kit checklist, then go. You are ready.';
        clock = toMin('07:30');
        sessions = [{ subject: 'FILM', title: 'Morning checklist', task: 'Exam Kit checklist', light: true, action: 'examkit',
          steps: ['Exam Kit: your three weak spots and the paragraph checklist', 'One key quote per film', 'Remember: a judgement in every paragraph'] }];
      } else {
        const n = isWeekend(date) ? settings.weekend : settings.weekday;
        sessions = subjectsFor(date, n, carry).map(s => s === 'ICT' ? nextICT(date) : nextFilm());
        if (date === ICT_MOCK_DAY) note = 'Last weekend before the BTEC IT exam: the ICT sessions today are one timed mock paper, split into parts.';
        if (date === ICT_FINAL_DAY) note = 'Last day before the BTEC IT exam: ICT only, finish early and sleep well.';
        if (date === '2026-11-20') note = 'Film only from today: timed essays, weakest section first. Aim for a judgement in every paragraph.';
        if (date === '2026-11-24') {
          kind = 'light';
          note = 'Light review day before the mock: no new content, no full essays.';
          sessions = sessions.map((s, i) => Object.assign(filmBase(s.sec || 'C1A'), {
            light: true, action: i % 2 ? 'examkit' : 'flashcards',
            title: i % 2 ? 'Essay plans' : 'Film flashcards',
            task: i % 2 ? 'Light: one essay plan per section' : 'Light: flashcards',
            steps: i % 2 ? ['One 5-minute plan per section: thesis, scenes, judgement', 'Read your weak spots in the Exam Kit'] : ['Film flashcards due today', 'Re-read the three key scenes for your weakest film'] }));
        }
      }
      sessions.forEach((s, i) => {
        s.id = date + '#' + i;
        s.minutes = s.light ? LIGHT : settings.minutes;
        s.start = toHHMM(clock);
        s.end = toHHMM(clock + s.minutes);
        clock += s.minutes + BREAK;
      });
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
    START, ICT_EXAM, FILM_EXAM, ICT_SITE, DEFAULTS, SECTIONS, SCENES, MAX_CATCHUP, START_TIMES, BREAK,
    addDays, isWeekend, daysBetween, ictShare, coerceSettings, coerceChecks, toMin,
    build, catchUp, counts, daysUntil, allowed, isDate: v => typeof v === 'string' && DATE_RE.test(v)
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  return api;
})();
